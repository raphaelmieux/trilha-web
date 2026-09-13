import { useEffect, useRef, useState } from 'react';
import BadgeIcon from './ui/BadgeIcon';
import { ouvirConquistas, type InsigniaConquistada } from '../lib/conquista';
import { explicacaoEmUmaLinha } from '../lib/explicacaoDaInsignia';

/*
 * O aviso de conquista, no momento em que ela acontece.
 *
 * ── Por que ele existe ───────────────────────────────────────────────────
 * A insígnia era gravada e o assunto morria ali: quem ganhava só descobria
 * navegando até a estante, dias depois, sem nada ligando o prêmio ao que
 * tinha acabado de fazer para merecê-lo. Recompensa que chega desligada do
 * feito não recompensa o feito — e a que chega no segundo seguinte é o que
 * faz o videogame funcionar há vinte anos.
 *
 * ── Por que no alto e no meio ────────────────────────────────────────────
 * É onde o Xbox põe a dele, e é a escolha certa aqui pelo mesmo motivo que
 * lá: o canto inferior é de quem está trabalhando — no celular é o polegar,
 * e nos laboratórios é onde a moldura põe as tarefas e o botão de concluir.
 * O alto está livre em toda tela da plataforma, e o meio é para onde o olho
 * já volta.
 *
 * ── Três elementos, e nada mais ──────────────────────────────────────────
 * Desenho, título, explicação. Sem botão de fechar, sem link, sem contagem:
 * ele sai sozinho. Aviso que pede uma ação vira tarefa, e uma tarefa em cima
 * de quem acabou de concluir outra é o contrário de uma comemoração.
 *
 * ── Uma de cada vez, em fila ─────────────────────────────────────────────
 * Três insígnias caem juntas com frequência — fechar um módulo pode fechar o
 * degrau de requisitos, o de lições e o de ofensiva no mesmo instante. Três
 * avisos empilhados viram um bloco de texto que ninguém lê; três em sequência
 * são três comemorações. A fila é o que transforma um no outro.
 */

/** Quanto cada aviso fica na tela, e quanto dura a entrada e a saída. */
const NA_TELA_MS = 4600;
const ANIMACAO_MS = 420;

/*
  A animação mora aqui, e não no index.css.

  São duas regras que só este componente usa, e pô-las na folha global faria
  duas telas para procurar quando alguém mexer numa delas. `prefers-reduced-
  motion` não é enfeite: quem pede menos movimento continua recebendo o aviso,
  parado — some a entrada deslizante, fica a conquista.
*/
const CSS = `
.conquista-palco {
  position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
  display: flex; justify-content: center;
  padding: 12px 16px; pointer-events: none;
}
.conquista {
  display: flex; align-items: center; gap: 14px;
  max-width: min(420px, calc(100vw - 32px));
  padding: 12px 18px 12px 14px;
  border-radius: 999px;
  background: #16161A;
  border: 1px solid rgba(255,255,255,0.14);
  box-shadow: 0 10px 34px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.4);
  animation: conquista-entra ${ANIMACAO_MS}ms cubic-bezier(.16,1,.3,1);
}
.conquista-saindo { animation: conquista-sai ${ANIMACAO_MS}ms ease-in forwards; }
.conquista-texto { min-width: 0; }
.conquista-titulo {
  font-weight: 700; font-size: 14px; line-height: 1.2; color: #FFFFFF;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.conquista-explica {
  font-size: 11.5px; line-height: 1.35; color: #B9B9C2; margin-top: 2px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden;
}
@keyframes conquista-entra {
  from { opacity: 0; transform: translateY(-22px) scale(.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes conquista-sai {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to   { opacity: 0; transform: translateY(-16px) scale(.97); }
}
@media (prefers-reduced-motion: reduce) {
  .conquista, .conquista-saindo { animation: none; }
}
`;

/**
 * Escuta as conquistas e mostra uma de cada vez, no alto da tela.
 *
 * Monta uma vez só, em `App`: ele não pertence a nenhuma tela, porque a
 * conquista pode cair em qualquer uma — num laboratório, numa lição, na prova.
 */
export default function AvisoDeConquista() {
  const [fila, setFila] = useState<InsigniaConquistada[]>([]);
  const [saindo, setSaindo] = useState(false);
  const atual = fila[0];
  /* Guarda o código do que está na tela para o efeito abaixo não reiniciar o
     relógio a cada re-render da fila — só quando o aviso de fato troca. */
  const codigoAtual = atual?.code;

  useEffect(() => ouvirConquistas(novas => {
    setFila(f => {
      /* A mesma insígnia não entra duas vezes na fila. `evaluateBadges` é
         chamada de dois lugares por ação, e as duas podem conceder no mesmo
         instante em condições de corrida — o banco tem UNIQUE para isso, mas
         a tela não tem, e o aviso repetido seria a única marca disso. */
      const naFila = new Set(f.map(i => i.code));
      return [...f, ...novas.filter(i => !naFila.has(i.code))];
    });
  }), []);

  /* O relógio de cada aviso: fica, sai, e o próximo entra. */
  const saida = useRef<number>();
  useEffect(() => {
    if (!codigoAtual) return;
    setSaindo(false);
    const some = window.setTimeout(() => setSaindo(true), NA_TELA_MS);
    saida.current = window.setTimeout(() => {
      setFila(f => f.slice(1));
      setSaindo(false);
    }, NA_TELA_MS + ANIMACAO_MS);
    return () => {
      window.clearTimeout(some);
      window.clearTimeout(saida.current);
    };
  }, [codigoAtual]);

  if (!atual) return null;

  return (
    <>
      <style>{CSS}</style>
      {/*
        `role="status"` e não `alert`: a conquista é boa notícia, não urgência,
        e `alert` interrompe o leitor de tela no meio da frase de quem está
        lendo a questão seguinte. `polite` espera a pausa.
      */}
      <div className="conquista-palco no-print" role="status" aria-live="polite">
        <div className={`conquista${saindo ? ' conquista-saindo' : ''}`}>
          <BadgeIcon badge={atual} size="md" rotulo={`Insígnia conquistada: ${atual.name}`} />
          <div className="conquista-texto">
            <p className="conquista-titulo">{atual.name}</p>
            <p className="conquista-explica">{explicacaoEmUmaLinha(atual)}</p>
          </div>
        </div>
      </div>
    </>
  );
}
