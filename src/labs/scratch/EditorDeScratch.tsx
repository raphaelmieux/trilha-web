import GUI, { AppStateHOC, setAppElement } from 'scratch-gui';
import { useEffect, useMemo, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * O editor do Scratch, de verdade, dentro da plataforma.
 *
 * ── Por que este arquivo existe separado ─────────────────────────────────
 * É ele que importa o `scratch-gui`, e o `scratch-gui` são dezenas de MB. Quem
 * nunca abre a vereda de lógica não deve baixar nada disso — então quem importa
 * *este módulo* faz por `import()` dinâmico, e o Vite o separa num pedaço
 * próprio. Se este import subir para um arquivo carregado sempre, o peso volta
 * para o pacote principal sem que nada acuse.
 *
 * ── O VM não se passa por prop, e essa é a lição cara daqui ──────────────
 * O caminho óbvio — `<GUI vm={nosso} />` — é aceito sem reclamação e não faz
 * nada: o `scratch-gui` guarda o VM no store dele, e `mapStateToProps` vence a
 * prop de quem chama. O laboratório ficava lendo um VM vazio enquanto o
 * desbravador editava outro. Quem precisa do VM o pega em `guiInitialState.vm`,
 * que é o mesmo que o editor usa — está em `LaboratorioDeScratch`.
 *
 * ── E os assets saem do nosso domínio ────────────────────────────────────
 * `basePath` aponta para `public/scratch/`, copiado do pacote no build. Nada de
 * CDN: computador de clube costuma estar atrás de filtro, e o sintoma seria um
 * editor de ícones quebrados e biblioteca vazia.
 */

const Wrapped = AppStateHOC(GUI);

export default function EditorDeScratch({ aoMontar }: { aoMontar?: () => void }) {
  const base = useMemo(() => `${import.meta.env.BASE_URL}scratch/`, []);
  const alvo = useRef<HTMLDivElement>(null);
  const raiz = useRef<Root | null>(null);

  /*
    O editor mora numa raiz React própria, fora do `StrictMode` da plataforma.

    Não é preferência de arquitetura: é a única saída para uma incompatibilidade
    do pacote. O `scratch-gui` traz o react-redux 7 embutido, e no React 18 o
    `StrictMode` monta, desmonta e remonta cada componente de propósito, para
    achar efeito que não aguenta rodar duas vezes. O react-redux 7 não aguenta:
    ele zera a inscrição ao desmontar e estoura no segundo `componentDidMount`
    com `Cannot read properties of null (reading 'trySubscribe')`.

    O estrago não é um aviso no console. Em `npm run dev` o laboratório abria
    **vazio** — sem paleta, sem palco, sem personagem — e só funcionava no
    `npm run build`. Quem fosse mexer aqui teria um minuto de build a cada
    tentativa, ou concluiria que o laboratório está quebrado.

    Tirar o `StrictMode` da plataforma inteira resolveria também, e sairia caro:
    a checagem que o Scratch não aguenta é a mesma que protege as nossas
    cinquenta telas. Então quem sai da árvore é o pacote, e não a garantia.

    O editor não precisa de nada da nossa árvore — ele traz o próprio `Provider`
    —, e o `<div>` continua exatamente no mesmo lugar do layout.
  */
  useEffect(() => {
    const no = alvo.current;
    if (!no || raiz.current) return;
    try { setAppElement(document.getElementById('root') ?? document.body); } catch { /* versão sem isto */ }

    raiz.current = createRoot(no);
    raiz.current.render(
      <Wrapped
        basePath={base}
        canEditTitle={false}
        /* O que a plataforma não oferece: conta do Scratch, compartilhar, e o
           menu de arquivo que salvaria fora daqui. O projeto é da lição. */
        canSave={false}
        canCreateNew={false}
        canRemix={false}
        canShare={false}
        enableCommunity={false}
        showComingSoon={false}
        isScratchDesktop={false}
      />,
    );
    aoMontar?.();

    return () => {
      const indo = raiz.current;
      /*
        Desmontar depois, e só se for para valer.

        O próprio `StrictMode` desmonta e remonta este efeito — desmontar a raiz
        filha ali dentro mataria o editor que acabou de nascer. Se o nó ainda
        está no documento no tique seguinte, foi a dobra do modo estrito, e não
        a saída da lição. (O adiamento também é o que o React pede: desmontar
        uma raiz de dentro do ciclo de outra é erro.)
      */
      setTimeout(() => {
        if (no?.isConnected) return;
        indo?.unmount();
        if (raiz.current === indo) raiz.current = null;
      }, 0);
    };
  }, [base, aoMontar]);

  return <div ref={alvo} style={{ height: '100%' }} />;
}
