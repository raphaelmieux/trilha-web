import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, RotateCcw, TerminalSquare, FileCode2, Save, X } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import {
  maquinaInicial, rodar, achar, resolver, escreverArquivo, palavras,
  type Maquina,
} from '../labs/terminal';
import { validarTerminal } from '../lib/terminalValidator';
import { PASSOS_DO_TERMINAL } from '../labs/passosDeTerminal';
import type { Vereda, LicaoDeVereda } from '../curriculum/veredas';

/*
 * O terminal da CC003.
 *
 * ── Por que ele é a tela inteira, e preto ────────────────────────────────
 * Vale a regra da casa: quando um laboratório imita um programa, ele ocupa a
 * tela e a plataforma sai de cena. E o terminal é o caso mais literal disso —
 * ele **é** uma tela preta com um prompt, e um cartão claro dentro da página
 * ensinaria a procurar num lugar que não existe.
 *
 * Ele não imita marca nenhuma, como o editor de código da vereda: bash no
 * Linux, zsh no Mac e o WSL no Windows mostram o mesmo arranjo — prompt com o
 * caminho, o que se digita, o que sai. É o arranjo que se reconhece depois.
 *
 * ── O editor ao lado, e por que ele não é o nano ─────────────────────────
 * Dois requisitos pedem digitar num arquivo: alterar código num ramo, e
 * escrever o README. O nano é uma tela inteira dentro do terminal, com atalhos
 * próprios — imitá-lo seria construir um segundo editor para ensinar o que o
 * documento não pede.
 *
 * Então `editar <arquivo>` abre um painel ao lado, que é o que qualquer pessoa
 * faz hoje: o terminal para os comandos, o editor para o texto. O comando
 * existe no Linux com outros nomes (`gedit`, `code`, `open`) e faz exatamente
 * isto — chama um editor.
 *
 * ── O que o teclado precisa ter ──────────────────────────────────────────
 * Seta para cima percorre o histórico, e Tab não completa nada. A primeira é
 * metade do que faz o terminal ser rápido, e quem não a conhece redigita tudo.
 * A segunda ficou de fora porque completar pela metade — só os nomes que este
 * disco tem — ensinaria que o Tab é um chute, e ele é uma promessa.
 */

const PROMPT_CASA = '~';

/** O caminho como o prompt o mostra: a casa vira til, o resto vem inteiro. */
const enfeitar = (cwd: string) =>
  cwd === '/home/desbravador' ? PROMPT_CASA
    : cwd.startsWith('/home/desbravador/') ? `~/${cwd.slice('/home/desbravador/'.length)}`
      : cwd;

interface Linha {
  tipo: 'comando' | 'saida' | 'erro';
  texto: string;
  /** Só em 'comando': o prompt que estava valendo quando ela foi digitada. */
  prompt?: string;
}

const BOAS_VINDAS: Linha[] = [
  { tipo: 'saida', texto: 'Terminal do computador do clube.' },
  { tipo: 'saida', texto: 'Digite help para ver os comandos deste laboratório.' },
  { tipo: 'saida', texto: '' },
];

export default function LaboratorioDeTerminal({ vereda, licao, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'terminal' }>;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const [maquina, setMaquina] = useState<Maquina>(maquinaInicial);
  const [linhas, setLinhas] = useState<Linha[]>(BOAS_VINDAS);
  const [entrada, setEntrada] = useState('');
  /** Onde a seta para cima está, contando do fim. -1 é "na linha em branco". */
  const [naHistoria, setNaHistoria] = useState(-1);
  /** Só os comandos que não deram erro — é o que a verificação lê. */
  const [executados, setExecutados] = useState<string[]>([]);
  const [editando, setEditando] = useState<{ caminho: string; texto: string } | null>(null);
  const [gravando, setGravando] = useState(false);
  const [pronto, setPronto] = useState(false);

  const fim = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => { fim.current?.scrollIntoView({ block: 'end' }); }, [linhas]);

  /*
    Uma tarefa cumprida fica cumprida.

    O requisito manda **demonstrar** as operações, e a verificação lê o estado
    do computador — duas coisas que se atropelam no fim do módulo 2: criar a
    pasta e removê-la não podem ser verdade ao mesmo tempo no estado final, e o
    laboratório ficava impossível de vencer. A pessoa fazia tudo certo, na
    ordem certa, e via as três primeiras tarefas voltarem para o vermelho.

    Então o que se guarda é o que já foi demonstrado. É o único modelo honesto
    para uma lista de gestos: apagar a pasta depois não desfaz o fato de você
    ter sabido criá-la.
  */
  const agora = validarTerminal({ maquina, executados }, licao.verificacoes);
  const [jaFeitas, setJaFeitas] = useState<Set<string>>(new Set());
  useEffect(() => {
    const novas = agora.filter(r => r.passed && !jaFeitas.has(r.id)).map(r => r.id);
    if (novas.length > 0) setJaFeitas(s => new Set([...s, ...novas]));
  }, [agora, jaFeitas]);

  const resultados = agora.map(r => (jaFeitas.has(r.id) ? { ...r, passed: true, detail: undefined } : r));
  const tudoFeito = resultados.every(r => r.passed);

  const escrever = (novas: Linha[]) => setLinhas(atual => [...atual, ...novas]);

  const enviar = (texto: string) => {
    const prompt = enfeitar(maquina.cwd);
    setEntrada('');
    setNaHistoria(-1);

    /* `editar` não é do shell: é o comando que abre o painel ao lado. Ele mora
       aqui, e não no motor, porque o motor não tem tela para abrir. */
    const partes = palavras(texto.trim());
    if (partes[0] === 'editar') {
      escrever([{ tipo: 'comando', texto, prompt }]);
      if (!partes[1]) {
        escrever([{ tipo: 'erro', texto: 'editar: falta o nome do arquivo' }]);
        return;
      }
      const caminho = resolver(maquina.cwd, partes[1]);
      const no = achar(maquina.disco, caminho);
      if (no?.tipo === 'pasta') {
        escrever([{ tipo: 'erro', texto: `editar: ${partes[1]}: é um diretório` }]);
        return;
      }
      setEditando({ caminho, texto: no?.conteudo ?? '' });
      setMaquina(m => ({ ...m, historico: [...m.historico, texto.trim()] }));
      escrever([{ tipo: 'saida', texto: `Abrindo ${partes[1]} no editor ao lado…` }]);
      return;
    }

    const { maquina: nova, saida } = rodar(maquina, texto);
    setMaquina(nova);

    if (saida === '\x00limpar') { setLinhas([]); return; }

    escrever([{ tipo: 'comando', texto, prompt }]);

    /*
      O que conta como executado é o que não deu erro.

      Digitar `git commit` sem nada preparado não registra nada, e a verificação
      não pode aceitá-lo — é a mesma razão de o validador olhar o estado, e não
      a linha. O shell não devolve código de saída aqui, então o critério é a
      mensagem: as de erro deste motor começam com o nome do comando, ou com
      `fatal:`, `error:` ou `Falta`.
    */
    const deuErro = /^(fatal:|error:|Falta|nada |Nada |Já está|Everything|[a-z-]+: )/.test(saida)
      || saida.includes('não é um comando')
      || saida.includes('comando não encontrado')
      || saida.includes('não faz parte deste exercício');
    if (saida) escrever([{ tipo: deuErro ? 'erro' : 'saida', texto: saida }]);
    if (!deuErro && texto.trim()) setExecutados(e => [...e, texto.trim()]);
  };

  const aoTeclar = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { enviar(entrada); return; }
    /* A seta para cima é metade do que faz o terminal ser rápido. Sem ela, o
       desbravador redigita `git commit -m "..."` inteiro toda vez. */
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const h = maquina.historico;
      if (h.length === 0) return;
      const i = naHistoria < 0 ? h.length - 1 : Math.max(0, naHistoria - 1);
      setNaHistoria(i);
      setEntrada(h[i]);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const h = maquina.historico;
      if (naHistoria < 0) return;
      const i = naHistoria + 1;
      if (i >= h.length) { setNaHistoria(-1); setEntrada(''); return; }
      setNaHistoria(i);
      setEntrada(h[i]);
    }
  };

  const salvarEdicao = () => {
    if (!editando) return;
    setMaquina(m => escreverArquivo(m, editando.caminho, editando.texto));
    escrever([{ tipo: 'saida', texto: `${editando.caminho.split('/').pop()} salvo.` }]);
    setEditando(null);
    campo.current?.focus();
  };

  const recomecar = () => {
    setMaquina(maquinaInicial());
    setJaFeitas(new Set());
    setLinhas(BOAS_VINDAS);
    setExecutados([]);
    setEntrada('');
    setNaHistoria(-1);
    setEditando(null);
  };

  const concluir = async () => {
    setGravando(true);
    await aoVencer();
    setGravando(false);
    setPronto(true);
  };

  if (pronto) {
    return (
      <div className="card p-6 text-center">
        <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
        <h2 className="text-xl font-bold mb-2">{licao.titulo}</h2>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Lição vencida. O que você fez aqui fica registrado no seu percurso.
        </p>
        <button onClick={aoSair} className="btn-primary">Voltar para a vereda</button>
      </div>
    );
  }

  const tarefas = resultados.map(r => ({
    id: r.id,
    titulo: r.label,
    detalhe: r.detail,
    onde: r.hint,
    passos: PASSOS_DO_TERMINAL[r.id],
    feita: r.passed,
  }));

  const acoes = (
    <div className="flex flex-col gap-2">
      {tudoFeito && (
        <button onClick={concluir} disabled={gravando} className="btn-primary text-sm w-full justify-center">
          {gravando ? 'Guardando…' : 'Concluir a lição'}
        </button>
      )}
      <button onClick={recomecar} className="btn-secondary text-xs py-2 w-full justify-center inline-flex items-center gap-1">
        <RotateCcw className="w-3 h-3" /> Recomeçar o computador
      </button>
    </div>
  );

  return (
    <LaboratorioEmTelaCheia
      trilha={vereda.code}
      voltarPara={`/vereda/${vereda.code}`}
      titulo={licao.titulo}
      programa="terminal"
      tarefas={tarefas}
      acoes={acoes}
      rodape={24}
    >
      <style>{CSS_TERMINAL}</style>

      <div className="tm-janela">
        <div className="tm-titulo">
          <TerminalSquare className="w-4 h-4" />
          <span>desbravador@clube: {enfeitar(maquina.cwd)}</span>
        </div>

        <div className="tm-corpo">
          {/* O terminal */}
          <div className="tm-tela" onClick={() => campo.current?.focus()}>
            {linhas.map((l, i) => (
              l.tipo === 'comando'
                ? (
                  <div key={i} className="tm-linha">
                    <span className="tm-prompt">
                      <span className="tm-usuario">desbravador@clube</span>
                      :<span className="tm-caminho">{l.prompt}</span>$&nbsp;
                    </span>
                    <span>{l.texto}</span>
                  </div>
                )
                : <pre key={i} className={`tm-saida${l.tipo === 'erro' ? ' erro' : ''}`}>{l.texto}</pre>
            ))}

            <div className="tm-linha">
              <span className="tm-prompt">
                <span className="tm-usuario">desbravador@clube</span>
                :<span className="tm-caminho">{enfeitar(maquina.cwd)}</span>$&nbsp;
              </span>
              <input
                ref={campo}
                className="tm-entrada"
                value={entrada}
                autoFocus
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                aria-label="Linha de comando"
                onChange={e => setEntrada(e.target.value)}
                onKeyDown={aoTeclar}
              />
            </div>
            <div ref={fim} />
          </div>

          {/* O editor, quando `editar` o abre */}
          {editando && (
            <div className="tm-editor">
              <div className="tm-editor-topo">
                <FileCode2 className="w-3.5 h-3.5" />
                <span>{editando.caminho.split('/').pop()}</span>
                <button type="button" className="tm-bt" onClick={salvarEdicao}>
                  <Save className="w-3.5 h-3.5" /> Salvar
                </button>
                <button type="button" className="tm-bt" onClick={() => setEditando(null)}
                  aria-label="Fechar sem salvar">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <textarea
                className="tm-editor-campo"
                value={editando.texto}
                spellCheck={false}
                aria-label={`Conteúdo de ${editando.caminho}`}
                onChange={e => setEditando({ ...editando, texto: e.target.value })}
              />
              <p className="tm-editor-pe">
                Salvar grava no disco. O git só vê depois de <code>git add</code>.
              </p>
            </div>
          )}
        </div>
      </div>
    </LaboratorioEmTelaCheia>
  );
}

/*
  A tela preta, e as cores do prompt.

  Verde para o usuário e azul para o caminho é o que praticamente toda
  distribuição usa por padrão — e é por essa faixa colorida que se reconhece
  onde a linha de comando começa, num monte de texto que de resto é todo igual.
*/
const CSS_TERMINAL = `
.tm-janela {
  flex: 1; display: flex; flex-direction: column; min-height: 0;
  background: #1B1B1B; color: #D6D6D6;
  font-family: ui-monospace, 'Cascadia Code', 'DejaVu Sans Mono', Consolas, monospace;
}
.tm-titulo {
  display: flex; align-items: center; gap: 8px; padding: 6px 10px; flex: none;
  background: #2C2C2C; color: #D6D6D6; font-size: 12px;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
  border-bottom: 1px solid #3A3A3A;
}
.tm-corpo { flex: 1; min-height: 0; display: flex; }

.tm-tela {
  flex: 1; min-width: 0; overflow-y: auto; padding: 10px 12px 16px;
  font-size: 13px; line-height: 1.5; cursor: text;
}
.tm-linha { display: flex; flex-wrap: wrap; word-break: break-word; }
.tm-prompt { white-space: nowrap; }
.tm-usuario { color: #8AE234; font-weight: 600; }
.tm-caminho { color: #729FCF; font-weight: 600; }
.tm-saida { margin: 0; white-space: pre-wrap; word-break: break-word; color: #D6D6D6; font: inherit; }
.tm-saida.erro { color: #EF9A9A; }
.tm-entrada {
  flex: 1; min-width: 120px; background: transparent; border: none; outline: none;
  color: #FFFFFF; font: inherit; padding: 0; caret-color: #8AE234;
}

/* ── O editor ao lado ──────────────────────────────────────────────────
   Num computador ele fica ao lado, porque é assim que se trabalha: o terminal
   de um lado, o arquivo do outro. No celular não cabem os dois, e ele passa a
   ocupar a metade de baixo — a mesma escolha por largura que a moldura já faz
   com o painel de tarefas. */
.tm-editor {
  width: 42%; min-width: 260px; flex: none; display: flex; flex-direction: column;
  border-left: 1px solid #3A3A3A; background: #232323;
}
.tm-editor-topo {
  display: flex; align-items: center; gap: 8px; padding: 6px 10px; flex: none;
  background: #2C2C2C; border-bottom: 1px solid #3A3A3A; font-size: 12px;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
}
.tm-bt {
  display: inline-flex; align-items: center; gap: 4px; margin-left: auto;
  padding: 3px 8px; border-radius: 4px; background: #3A3A3A; color: #D6D6D6; font-size: 11.5px;
}
.tm-editor-topo .tm-bt + .tm-bt { margin-left: 0; }
.tm-bt:hover { background: #474747; }
.tm-editor-campo {
  flex: 1; min-height: 0; resize: none; background: #1B1B1B; color: #D6D6D6;
  border: none; outline: none; padding: 10px 12px;
  font-family: inherit; font-size: 13px; line-height: 1.5;
}
.tm-editor-pe {
  flex: none; padding: 5px 10px; font-size: 11px; color: #9A9A9A;
  background: #2C2C2C; border-top: 1px solid #3A3A3A;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
}
.tm-editor-pe code { color: #8AE234; }

@media (max-width: 860px) {
  .tm-corpo { flex-direction: column; }
  .tm-editor { width: 100%; min-width: 0; height: 45%; border-left: 0; border-top: 1px solid #3A3A3A; }
}
`;
