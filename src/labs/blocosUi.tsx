import { useState } from 'react';
import { TextoDeBloco } from '../components/ui/BandeiraVerde';
import { Flag, Square, Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import {
  CATEGORIAS, PALCO, TECLAS, corDoBloco, ehChapeu, ehContainer, textoDoBloco,
  type Bloco, type Categoria, type Condicao, type Ator, type Tecla, type TipoDeBloco,
} from './blocos';
import type { EstadoDoPalco } from './blocosRuntime';
import { MODELOS, blocoNovo } from './blocosPaleta';

/**
 * As peças da tela do editor de blocos.
 *
 * ── O arranjo é o do Scratch ─────────────────────────────────────────────
 * Paleta por categoria colorida à esquerda, área de scripts no meio, palco no
 * canto superior direito e a lista de atores embaixo dele. É o que a
 * pessoa vai reencontrar ao abrir o Scratch de verdade, e é a única razão para
 * imitar uma marca: Scratch é *aquele* programa, como o Word e o Explorador.
 *
 * ── O que muda, e por quê ────────────────────────────────────────────────
 * No Scratch os blocos são arrastados por um canvas livre. Aqui cada script é
 * uma coluna, e o bloco novo entra onde está o cursor — a linha piscando que
 * diz "o próximo cai aqui". O desenho é o mesmo, e some o que no celular não
 * funciona: arrastar peça pequena com o dedo, que é onde o Scratch mais
 * machuca quem só tem telefone.
 *
 * O cursor é o preço: é preciso ensiná-lo. Em compensação ele resolve sozinho
 * o problema que o arrasto tem de resolver com precisão de pixel — pôr o bloco
 * *dentro* de um laço, e não embaixo dele.
 */

export const CSS_BLOCOS = `
.bl { display: flex; flex-direction: column; height: 100%; background: #E8EDF1; color: #1E1E1E; font-family: "Helvetica Neue", Arial, sans-serif; }

.bl-barra { display: flex; align-items: center; gap: 10px; padding: 6px 12px; background: #fff; border-bottom: 1px solid #D9D9D9; flex: none; }
.bl-barra button { display: inline-flex; align-items: center; gap: 5px; border: 0; background: transparent; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 13px; color: #575E75; }
.bl-barra button:hover { background: #F2F2F2; }
.bl-barra .bl-nome { margin-left: auto; font-size: 12px; color: #9AA0AB; }

.bl-corpo { display: flex; flex: 1; min-height: 0; }

.bl-categorias { width: 74px; flex: none; background: #fff; border-right: 1px solid #E6E6E6; overflow-y: auto; }
.bl-categorias button { width: 100%; border: 0; background: transparent; padding: 8px 2px; cursor: pointer; font-size: 10px; color: #575E75; display: flex; flex-direction: column; align-items: center; gap: 3px; }
.bl-categorias button[aria-current="true"] { background: #F2F2F2; font-weight: 700; }
.bl-bolinha { width: 20px; height: 20px; border-radius: 50%; }

.bl-paleta { width: 214px; flex: none; background: #F9F9F9; border-right: 1px solid #E6E6E6; overflow-y: auto; padding: 10px 8px; }
.bl-paleta h4 { font-size: 12px; color: #575E75; margin: 0 0 8px; text-transform: uppercase; letter-spacing: .04em; }
.bl-nova-var { display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px; }
.bl-nova-var input { border: 1px solid #D9D9D9; border-radius: 4px; padding: 5px 7px; font-size: 12px; color: #1E1E1E; background: #fff; }
.bl-nova-var button { display: inline-flex; align-items: center; justify-content: center; gap: 5px; border: 0; border-radius: 4px; background: #FF8C1A; color: #fff; font-size: 12px; font-weight: 700; padding: 6px 8px; cursor: pointer; }
.bl-nova-var button:disabled { opacity: .45; cursor: default; }
.bl-aviso-var { font-size: 11px; color: #C1442E; margin: 0; }

.bl-scripts { flex: 1; min-width: 0; overflow: auto; padding: 14px; background:
  radial-gradient(circle, #D9E3F2 1px, transparent 1px) 0 0 / 18px 18px, #F2F6FB; }

.bl-lado { width: 260px; flex: none; display: flex; flex-direction: column; border-left: 1px solid #E6E6E6; background: #fff; }

.bl-palco { position: relative; width: 100%; aspect-ratio: 4 / 3; background: #fff; border-bottom: 1px solid #E6E6E6; overflow: hidden; flex: none; }
.bl-ator { position: absolute; font-size: 30px; line-height: 1; transform: translate(-50%, -50%); user-select: none; cursor: pointer; }
.bl-fala { position: absolute; transform: translate(-50%, -100%); background: #fff; border: 1px solid #CFCFCF; border-radius: 10px; padding: 3px 8px; font-size: 11px; white-space: nowrap; }
.bl-monitor { position: absolute; top: 6px; left: 6px; display: flex; flex-direction: column; gap: 4px; }
.bl-monitor span { background: #FF8C1A; color: #fff; font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 4px; }

.bl-atores { flex: 1; min-height: 0; overflow-y: auto; padding: 8px; display: flex; gap: 8px; flex-wrap: wrap; align-content: flex-start; }
.bl-ator-cartao { width: 68px; border: 2px solid transparent; border-radius: 8px; background: #F9F9F9; padding: 6px 2px; text-align: center; cursor: pointer; font-size: 11px; color: #575E75; }
.bl-ator-cartao[aria-current="true"] { border-color: #4C97FF; background: #E9F1FF; }
.bl-ator-cartao b { display: block; font-size: 24px; line-height: 1.2; font-weight: 400; }

/* ── O bloco ────────────────────────────────────────────────────────── */
.bl-bloco { position: relative; border-radius: 6px; color: #fff; font-size: 13px; padding: 8px 10px; margin: 0 0 3px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; box-shadow: 0 1px 0 rgba(0,0,0,.15); cursor: pointer; border: 2px solid transparent; }
.bl-bloco.chapeu { border-top-left-radius: 16px; border-top-right-radius: 16px; }
.bl-bloco[aria-current="true"] { border-color: #1E1E1E; }
.bl-bloco input, .bl-bloco select { background: #fff; color: #1E1E1E; border: 0; border-radius: 12px; padding: 2px 7px; font-size: 12px; width: auto; min-width: 44px; }
.bl-bloco input[type=number] { width: 54px; }
.bl-acoes { margin-left: auto; display: flex; gap: 2px; }
.bl-acoes button { background: rgba(0,0,0,.18); border: 0; color: #fff; border-radius: 4px; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
.bl-acoes button:disabled { opacity: .35; cursor: default; }

.bl-corpo-do-c { margin: 0 0 3px 16px; border-left: 10px solid rgba(0,0,0,.001); padding-left: 4px; }
.bl-vazio { font-size: 11px; color: #7B8497; background: rgba(255,255,255,.7); border: 1px dashed #B8C2D1; border-radius: 6px; padding: 6px 8px; cursor: pointer; }
.bl-cursor { height: 4px; background: #1E1E1E; border-radius: 2px; margin: 0 0 3px; }

.bl-pilha { margin-bottom: 22px; max-width: 420px; }
.bl-vazio-scripts { color: #7B8497; font-size: 13px; max-width: 340px; line-height: 1.6; }

@media (max-width: 900px) {
  .bl-corpo { flex-direction: column; overflow-y: auto; }
  .bl-categorias { width: 100%; display: flex; overflow-x: auto; border-right: 0; border-bottom: 1px solid #E6E6E6; }
  .bl-categorias button { min-width: 74px; }
  .bl-paleta { width: 100%; max-height: 190px; border-right: 0; border-bottom: 1px solid #E6E6E6; }
  .bl-lado { width: 100%; border-left: 0; border-top: 1px solid #E6E6E6; order: -1; }
  .bl-scripts { min-height: 260px; }
}
`;

/* ────────────────────────────────────────────────────────────────────────
   A paleta
   ──────────────────────────────────────────────────────────────────────── */

/*
  A variável se cria aqui, e não vem pronta da lição.

  O requisito 4.4 pede "criar uma variável **e** alterar seu valor durante a
  execução". Enquanto a lição entregava a variável montada, metade do requisito
  chegava de graça — a mesma família do laboratório que abre resolvido, em
  miniatura: a verificação olhava se existia variável, e existia porque nós a
  tínhamos posto lá.

  Com a lista vazia os blocos de variável não aparecem. Mostrá-los antes daria
  um "mude placar em 1" apontando para um placar que não existe, e o erro só
  apareceria ao rodar.
*/
function NovaVariavel({ aoCriar, existentes }: {
  aoCriar: (nome: string) => void;
  existentes: string[];
}) {
  const [nome, setNome] = useState('');
  const limpo = nome.trim();
  const repetida = existentes.includes(limpo);
  const criar = () => { if (limpo && !repetida) { aoCriar(limpo); setNome(''); } };

  return (
    <div className="bl-nova-var">
      <input value={nome} aria-label="nome da variável" placeholder="placar"
        onChange={e => setNome(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); criar(); } }} />
      <button onClick={criar} disabled={!limpo || repetida}>
        <Plus className="w-3.5 h-3.5" /> Nova variável
      </button>
      {repetida && <p className="bl-aviso-var">Já existe uma variável com esse nome.</p>}
    </div>
  );
}

export function Paleta({ categoria, aoEscolher, aoTrocarCategoria, variaveis, outro, aoCriarVariavel }: {
  categoria: Categoria;
  aoEscolher: (tipo: TipoDeBloco) => void;
  aoTrocarCategoria: (c: Categoria) => void;
  variaveis: string[];
  outro: string;
  aoCriarVariavel: (nome: string) => void;
}) {
  const nome = CATEGORIAS.find(c => c.id === categoria)!.nome;
  const semVariavel = categoria === 'variaveis' && variaveis.length === 0;
  return (
    <>
      <div className="bl-categorias">
        {CATEGORIAS.map(c => (
          <button key={c.id} aria-current={c.id === categoria}
            onClick={() => aoTrocarCategoria(c.id)}>
            <span className="bl-bolinha" style={{ background: c.cor }} />
            {c.nome}
          </button>
        ))}
      </div>

      <div className="bl-paleta">
        <h4>{nome}</h4>

        {categoria === 'variaveis' && (
          <NovaVariavel aoCriar={aoCriarVariavel} existentes={variaveis} />
        )}

        {semVariavel ? (
          <p style={{ fontSize: 12, color: '#7B8497', lineHeight: 1.5 }}>
            Os blocos de variável aparecem aqui depois que você criar a primeira.
            Dê a ela um nome que diga o que ela guarda — <b>placar</b>, <b>vidas</b>,
            <b> tempo</b>.
          </p>
        ) : MODELOS[categoria].length === 0 ? (
          /* Sensores não tem bloco solto: o "tocando" mora dentro do `se`, e
             separá-lo daria um bloco que não faz nada sozinho. */
          <p style={{ fontSize: 12, color: '#7B8497', lineHeight: 1.5 }}>
            As perguntas dos sensores ficam dentro do bloco <b>se</b>, em Controle.
          </p>
        ) : MODELOS[categoria].map(tipo => {
          const exemplo = blocoNovo(tipo, `paleta-${tipo}`, variaveis[0] ?? 'placar', outro);
          return (
            <div key={tipo} className={`bl-bloco${ehChapeu(exemplo) ? ' chapeu' : ''}`}
              style={{ background: corDoBloco(tipo) }}
              onClick={() => aoEscolher(tipo)}
              role="button" tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); aoEscolher(tipo); } }}>
              <TextoDeBloco texto={textoDoBloco(exemplo)} />
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   O palco
   ──────────────────────────────────────────────────────────────────────── */

export function PalcoDeBlocos({ estado, aoClicarNoAtor }: {
  estado: EstadoDoPalco;
  aoClicarNoAtor: (id: string) => void;
}) {
  /* Do sistema do Scratch — (0,0) no meio — para o do CSS, com a origem no
     canto e o y crescendo para baixo. */
  const emTela = (x: number, y: number) => ({
    left: `${((x + PALCO.largura / 2) / PALCO.largura) * 100}%`,
    top: `${((PALCO.altura / 2 - y) / PALCO.altura) * 100}%`,
  });

  return (
    <div className="bl-palco">
      <div className="bl-monitor">
        {Object.entries(estado.variaveis).map(([nome, valor]) => (
          <span key={nome}>{nome} {valor}</span>
        ))}
      </div>

      {estado.atores.map(p => (
        <div key={p.id}>
          {p.fala && (
            <div className="bl-fala" style={{ ...emTela(p.x, p.y + 26) }}>{p.fala}</div>
          )}
          <div className="bl-ator" style={emTela(p.x, p.y)}
            onClick={() => aoClicarNoAtor(p.id)}
            title={p.nome}>
            {p.fantasias[p.fantasia] ?? '❓'}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListaDePersonagens({ atores, atual, aoEscolher }: {
  atores: Ator[];
  atual: string;
  aoEscolher: (id: string) => void;
}) {
  return (
    <div className="bl-atores">
      {atores.map(p => (
        <button key={p.id} className="bl-ator-cartao" aria-current={p.id === atual}
          onClick={() => aoEscolher(p.id)}>
          <b>{p.fantasias[0]}</b>
          {p.nome}
        </button>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   A pilha de blocos
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Onde o próximo bloco entra.
 *
 * `depois` é o id do bloco em que o cursor está; `dentro` é o id do container
 * cujo corpo está aberto. Nenhum dos dois: o cursor está no fim da pilha.
 */
export interface Cursor { pilha: string; depois?: string; dentro?: string }

export function BlocoNaPilha({ bloco, cursor, pilha, primeiro, ultimo, variaveis, atores, aoSelecionar, aoMudar, aoRemover, aoMover }: {
  bloco: Bloco;
  cursor: Cursor | null;
  pilha: string;
  primeiro: boolean;
  ultimo: boolean;
  variaveis: string[];
  atores: { id: string; nome: string }[];
  aoSelecionar: (c: Cursor) => void;
  aoMudar: (id: string, mudanca: Partial<Bloco>) => void;
  aoRemover: (id: string) => void;
  aoMover: (id: string, direcao: -1 | 1) => void;
}) {
  const num = (valor: number, aplicar: (n: number) => void, rotulo: string) => (
    <input type="number" value={valor} aria-label={rotulo}
      onClick={e => e.stopPropagation()}
      onChange={e => aplicar(Number(e.target.value) || 0)} />
  );

  const selecionado = cursor?.depois === bloco.id;

  const miolo = () => {
    switch (bloco.tipo) {
      case 'quandoTecla':
        return <>quando a tecla{' '}
          <select value={bloco.tecla} aria-label="tecla"
            onClick={e => e.stopPropagation()}
            onChange={e => aoMudar(bloco.id, { tecla: e.target.value as Tecla })}>
            {TECLAS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>{' '}for pressionada</>;
      case 'mover':
        return <>mova {num(bloco.passos, n => aoMudar(bloco.id, { passos: n }), 'passos')} passos</>;
      case 'subir':
        return <>adicione {num(bloco.passos, n => aoMudar(bloco.id, { passos: n }), 'passos')} a y</>;
      case 'irPara':
        return <>vá para x: {num(bloco.x, n => aoMudar(bloco.id, { x: n }), 'x')}{' '}
          y: {num(bloco.y, n => aoMudar(bloco.id, { y: n }), 'y')}</>;
      case 'diga':
        return <>diga <input value={bloco.texto} aria-label="o que dizer"
          onClick={e => e.stopPropagation()}
          onChange={e => aoMudar(bloco.id, { texto: e.target.value })} /></>;
      case 'espere':
        return <>espere {num(bloco.segundos, n => aoMudar(bloco.id, { segundos: n }), 'segundos')} seg</>;
      case 'repita':
        return <>repita {num(bloco.vezes, n => aoMudar(bloco.id, { vezes: n }), 'vezes')} vezes</>;
      case 'definaVariavel':
        return <>mude{' '}
          <select value={bloco.nome} aria-label="variável" onClick={e => e.stopPropagation()}
            onChange={e => aoMudar(bloco.id, { nome: e.target.value })}>
            {variaveis.map(v => <option key={v} value={v}>{v}</option>)}
          </select>{' '}para {num(bloco.valor, n => aoMudar(bloco.id, { valor: n }), 'valor')}</>;
      case 'mudeVariavel':
        /* A ordem é a do bloco: o quanto vem antes da variável. Escrever
           "mude placar em 1" era juntar o nome de um bloco com a forma de
           outro, e nenhum dos dois existe assim. */
        return <>adicione {num(bloco.por, n => aoMudar(bloco.id, { por: n }), 'quanto')} a{' '}
          <select value={bloco.nome} aria-label="variável" onClick={e => e.stopPropagation()}
            onChange={e => aoMudar(bloco.id, { nome: e.target.value })}>
            {variaveis.map(v => <option key={v} value={v}>{v}</option>)}
          </select></>;
      case 'se':
        return <>se <SeletorDeCondicao condicao={bloco.condicao} variaveis={variaveis}
          atores={atores}
          aoMudar={c => aoMudar(bloco.id, { condicao: c })} /> então</>;
      default:
        return textoDoBloco(bloco);
    }
  };

  return (
    <>
      <div className={`bl-bloco${ehChapeu(bloco) ? ' chapeu' : ''}`}
        style={{ background: corDoBloco(bloco.tipo) }}
        aria-current={selecionado}
        onClick={() => aoSelecionar({ pilha, depois: bloco.id })}>
        {miolo()}
        <span className="bl-acoes">
          <button aria-label="subir" disabled={primeiro} title="Subir"
            onClick={e => { e.stopPropagation(); aoMover(bloco.id, -1); }}>
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button aria-label="descer" disabled={ultimo} title="Descer"
            onClick={e => { e.stopPropagation(); aoMover(bloco.id, 1); }}>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button aria-label="apagar" title="Apagar"
            onClick={e => { e.stopPropagation(); aoRemover(bloco.id); }}>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </span>
      </div>

      {selecionado && <div className="bl-cursor" />}

      {ehContainer(bloco) && (
        <div className="bl-corpo-do-c"
          style={{ borderLeftColor: corDoBloco(bloco.tipo) }}>
          {bloco.corpo.length === 0 ? (
            <div className="bl-vazio"
              onClick={e => { e.stopPropagation(); aoSelecionar({ pilha, dentro: bloco.id }); }}>
              {cursor?.dentro === bloco.id
                ? 'O próximo bloco entra aqui dentro.'
                : 'Vazio — toque para pôr blocos aqui dentro.'}
            </div>
          ) : (
            <>
              {cursor?.dentro === bloco.id && <div className="bl-cursor" />}
              {bloco.corpo.map((f, i) => (
                <BlocoNaPilha key={f.id} bloco={f} cursor={cursor} pilha={pilha}
                  primeiro={i === 0} ultimo={i === bloco.corpo.length - 1}
                  variaveis={variaveis} atores={atores}
                  aoSelecionar={aoSelecionar} aoMudar={aoMudar}
                  aoRemover={aoRemover} aoMover={aoMover} />
              ))}
            </>
          )}
        </div>
      )}
    </>
  );
}

function SeletorDeCondicao({ condicao, variaveis, atores, aoMudar }: {
  condicao: Condicao;
  variaveis: string[];
  atores: { id: string; nome: string }[];
  aoMudar: (c: Condicao) => void;
}) {
  const parar = (e: React.MouseEvent) => e.stopPropagation();
  return (
    <>
      <select value={condicao.tipo} aria-label="tipo da pergunta" onClick={parar}
        onChange={e => {
          const t = e.target.value as Condicao['tipo'];
          aoMudar(
            t === 'tocando' ? { tipo: 'tocando', quem: atores[0]?.id ?? 'borda' }
              : t === 'teclaPressionada' ? { tipo: 'teclaPressionada', tecla: 'espaço' }
                : { tipo: 'variavelMaiorQue', nome: variaveis[0] ?? 'placar', valor: 5 },
          );
        }}>
        <option value="tocando">tocando em …?</option>
        <option value="teclaPressionada">tecla … pressionada?</option>
        {/* Sem variável criada não há o que comparar, e oferecer a opção
            produziria uma pergunta sobre um nome que não existe. */}
        {/* No Scratch a comparação é o bloco ">", de Operadores, com a variável
            arrastada para dentro dele. "Variável maior que" não é o nome de
            bloco nenhum. */}
        {variaveis.length > 0 && <option value="variavelMaiorQue">… &gt; …</option>}
      </select>

      {condicao.tipo === 'tocando' && (
        <select value={condicao.quem} aria-label="quem" onClick={parar}
          onChange={e => aoMudar({ tipo: 'tocando', quem: e.target.value })}>
          {atores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          <option value="borda">borda</option>
        </select>
      )}

      {condicao.tipo === 'teclaPressionada' && (
        <select value={condicao.tecla} aria-label="qual tecla" onClick={parar}
          onChange={e => aoMudar({ tipo: 'teclaPressionada', tecla: e.target.value as Tecla })}>
          {TECLAS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      )}

      {condicao.tipo === 'variavelMaiorQue' && (
        <>
          <select value={condicao.nome} aria-label="qual variável" onClick={parar}
            onChange={e => aoMudar({ ...condicao, nome: e.target.value })}>
            {variaveis.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          {'>'}
          <input type="number" value={condicao.valor} aria-label="valor" onClick={parar}
            onChange={e => aoMudar({ ...condicao, valor: Number(e.target.value) || 0 })} />
        </>
      )}
    </>
  );
}

export function BarraDoPalco({ rodando, aoRodar, aoParar, nome }: {
  rodando: boolean; aoRodar: () => void; aoParar: () => void; nome: string;
}) {
  return (
    <div className="bl-barra">
      <button onClick={aoRodar} title="Começar">
        <Flag className="w-4 h-4" style={{ color: rodando ? '#4CBB17' : '#7B8497' }} /> Começar
      </button>
      <button onClick={aoParar} title="Parar">
        <Square className="w-4 h-4" style={{ color: '#E23D3D' }} /> Parar
      </button>
      <span className="bl-nome">{nome}</span>
    </div>
  );
}
