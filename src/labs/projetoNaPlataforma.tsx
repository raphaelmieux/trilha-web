/**
 * As duas telas da CC-ES012 que não imitam programa nenhum.
 *
 * A proposta do módulo 1 e a demonstração do módulo 10 não acontecem em
 * programa nenhum: nenhuma suíte de escritório tem uma tela de "proposta para
 * o examinador", e nenhuma tem um painel que mostra as cinco peças ao mesmo
 * tempo com o número que cada uma está dizendo. As duas são tela da
 * plataforma, como o módulo 8 da CC-ES008 e o módulo 1 da CC-ES009 — e por
 * isso a moldura recebe `imitaPrograma={false}`: laboratório que não imita
 * nada continua sendo tela da plataforma, e tela da plataforma não avisa nada
 * sobre programa nenhum.
 *
 * O painel do conjunto é o lugar certo para o vínculo justamente porque ele é
 * nosso. No Word o gesto é Colar Especial → Colar Vínculo, e a lição diz isso;
 * o que o painel oferece é ver as cinco peças de uma vez, que é o que nenhum
 * dos cinco programas tem como mostrar.
 */

import { Link2, PlusCircle, RefreshCw, Send, Timer } from 'lucide-react';
import { Cartao, CampoLongo, EscolhaMultipla } from './caderno';
import {
  DOSSIE_DAS_DUAS, type ContextoDoProjeto,
  CHAVE_DA_PROPAGACAO, CHAVE_DO_DOSSIE_VELHO,
} from './metasDaCcEs012';
import { CAMPO_QUANTOS, INSCRICOES_DA_FEIRA } from './projetoDaFeira';
import {
  MINUTOS_DA_APRESENTACAO, NOME_DA_PECA,
  type ComoChegou, type NumeroNoConjunto, type TipoDePeca,
  O_QUE_CADA_UM_FAZ, comoChegou, escreverNumero, importarRespostas,
  valorMostrado, valorNaFonte, vincular,
} from './projetoDocumental';

export interface PropsDaSuperficie {
  ctx: ContextoDoProjeto;
  mudar: (f: (c: ContextoDoProjeto) => ContextoDoProjeto) => void;
  avisar: (texto: string) => void;
}

const CINCO_PECAS: { id: TipoDePeca; rotulo: string }[] =
  (['documento', 'planilha', 'formulario', 'apresentacao', 'dossie'] as const)
    .map(id => ({ id, rotulo: NOME_DA_PECA[id] }));

/* ── Módulo 1: a proposta ─────────────────────────────────────────────────── */

export function PropostaDoConjunto({ ctx, mudar, avisar }: PropsDaSuperficie) {
  const { proposta } = ctx.p;
  const prontaParaEnviar = proposta.necessidade.trim() !== ''
    && proposta.paraQuem.trim() !== '' && proposta.pronto.trim() !== ''
    && proposta.pecas.length > 0;

  const escrever = (campo: 'necessidade' | 'paraQuem' | 'pronto') => (texto: string) =>
    mudar(c => ({ ...c, p: { ...c.p, proposta: { ...c.p.proposta, [campo]: texto } } }));

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      <Cartao
        titulo="Proposta do conjunto documental"
        abaixo="O examinador aprova a proposta antes de você montar qualquer peça. É a proposta que diz o que o conjunto vai ser — depois de pronto, a única resposta possível é sim."
      >
        <div className="flex flex-col gap-4">
          <CampoLongo
            rotulo="Qual necessidade do clube o conjunto atende"
            ajuda="O problema como ele aparece hoje, e não a solução."
            valor={proposta.necessidade} minimo={60}
            aoEscrever={escrever('necessidade')}
          />
          <CampoLongo
            rotulo="Para quem o conjunto é"
            ajuda="Quem vai abrir as peças depois que você sair da diretoria."
            valor={proposta.paraQuem} minimo={20}
            aoEscrever={escrever('paraQuem')}
          />
          <CampoLongo
            rotulo="O que vai contar como pronto"
            ajuda="É o campo que ninguém escreve, e o único que dá ao examinador como dizer que o conjunto acabou."
            valor={proposta.pronto} minimo={30}
            aoEscrever={escrever('pronto')}
          />
          <div>
            <p className="text-sm font-semibold mb-1.5">As peças que o conjunto vai ter</p>
            <EscolhaMultipla
              opcoes={CINCO_PECAS.map(p => ({ id: p.id, rotulo: p.rotulo }))}
              marcadas={proposta.pecas}
              aoAlternar={id => mudar(c => ({
                ...c,
                p: {
                  ...c.p,
                  proposta: {
                    ...c.p.proposta,
                    pecas: c.p.proposta.pecas.includes(id)
                      ? c.p.proposta.pecas.filter(x => x !== id)
                      : [...c.p.proposta.pecas, id],
                  },
                },
              }))}
            />
          </div>
        </div>
      </Cartao>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            if (!prontaParaEnviar) { avisar('A proposta ainda não responde às quatro perguntas.'); return; }
            mudar(c => ({
              ...c,
              p: { ...c.p, proposta: { ...c.p.proposta, aprovadaEm: '2026-07-01' } },
            }));
            avisar('A diretoria aprovou a proposta. Agora a execução pode começar.');
          }}
          disabled={proposta.aprovadaEm !== null}
          className="btn-primary text-sm inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <Send className="w-4 h-4" /> Enviar para aprovação
        </button>

        {/*
          O caminho errado, e ele está a um clique. O requisito 2 diz que a
          execução não pode ser iniciada antes da aprovação, e sem este botão
          isso seria uma frase do enunciado sem nada por trás: dava para ler a
          regra e cumpri-la sem nunca ter tido como quebrá-la.
        */}
        <button
          onClick={() => {
            mudar(c => ({ ...c, comecouAntes: c.p.proposta.aprovadaEm === null || c.comecouAntes }));
            avisar(ctx.p.proposta.aprovadaEm === null
              ? 'Você começou a montar o conjunto antes da aprovação.'
              : 'A proposta já estava aprovada: pode montar.');
          }}
          className="btn-secondary text-sm inline-flex items-center gap-1.5"
        >
          Começar a montar o conjunto
        </button>
      </div>

      {proposta.aprovadaEm !== null && (
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Aprovada em {proposta.aprovadaEm}.
        </p>
      )}
      {ctx.comecouAntes && (
        <p className="text-sm" style={{ color: 'var(--color-danger, #C13516)' }}>
          A execução começou antes da aprovação. Isto não se desfaz recomeçando a
          proposta: o examinador recebeu o conjunto pronto.
        </p>
      )}
    </div>
  );
}

/* ── Módulo 10: o conjunto inteiro ────────────────────────────────────────── */

const COMO_SE_LE: Record<ComoChegou, string> = {
  digitado: 'Digitado',
  imagem: 'Figura colada',
  incorporado: 'Cópia incorporada',
  vinculado: 'Vinculado à planilha',
};

function LinhaDoNumero({ ctx, numero, aoVincular }: {
  ctx: ContextoDoProjeto; numero: NumeroNoConjunto; aoVincular: () => void;
}) {
  const como = comoChegou(ctx.p, numero);
  const mostra = valorMostrado(ctx.p, numero);
  const naFonte = valorNaFonte(ctx.p, numero.de);
  const divergindo = naFonte !== undefined && mostra !== naFonte;
  return (
    <div className="flex flex-wrap items-center gap-2 py-2 border-t text-sm"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <span className="font-semibold">{NOME_DA_PECA[numero.peca]}</span>
      <span style={{ color: 'var(--color-text-muted)' }}>{COMO_SE_LE[como]}</span>
      <span className="ml-auto tabular-nums">
        mostra <strong>{escreverNumero(mostra)}</strong>
      </span>
      <span className="tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
        planilha diz {naFonte === undefined ? '—' : escreverNumero(naFonte)}
      </span>
      {divergindo && (
        <span style={{ color: 'var(--color-danger, #C13516)' }}>está de ontem</span>
      )}
      {numero.peca === 'documento' && como !== 'vinculado' && (
        <button
          onClick={aoVincular}
          className="btn-secondary text-xs py-1 inline-flex items-center gap-1"
        >
          <Link2 className="w-3 h-3" /> Colar vínculo
        </button>
      )}
      <span className="basis-full text-xs" style={{ color: 'var(--color-text-dim)' }}>
        {O_QUE_CADA_UM_FAZ[como].naoFaz}
      </span>
    </div>
  );
}

export function ConjuntoInteiro({ ctx, mudar, avisar }: PropsDaSuperficie) {
  const novas = ctx.p.formulario.respostas.length - INSCRICOES_DA_FEIRA.length;

  /** A inscrição que chega pelo formulário durante a demonstração. */
  const acrescentarInscricao = () => {
    mudar(c => ({
      ...c,
      p: importarRespostas({
        ...c.p,
        formulario: {
          ...c.p.formulario,
          respostas: [...c.p.formulario.respostas, {
            id: `r${c.p.formulario.respostas.length + 1}`,
            em: '2026-07-29T20:40',
            valores: {
              unidade: 'Gavião', especialidade: 'Fotografia',
              [CAMPO_QUANTOS]: '5', responsavel: 'Tia Sônia',
            },
          }],
        },
      }),
      /* A descoberta se grava quando a mudança de fato chega às outras peças,
         e não no clique: premiar o clique mediria obediência, e o que o
         requisito 8 pede é ver a propagação acontecer. */
      descobertas: c.descobertas.includes(CHAVE_DA_PROPAGACAO)
        ? c.descobertas : [...c.descobertas, CHAVE_DA_PROPAGACAO],
    }));
    avisar('Uma inscrição nova entrou pelo formulário. Olhe os números sem abrir peça nenhuma.');
  };

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      <Cartao
        titulo="O conjunto"
        abaixo="De onde vem cada número que as peças mostram. A planilha de controle é a fonte; as outras leem dela, ou não."
      >
        <div>
          {ctx.p.numeros.map(n => (
            <LinhaDoNumero
              key={n.id} ctx={ctx} numero={n}
              aoVincular={() => {
                mudar(c => ({ ...c, p: vincular(c.p, n.id) }));
                avisar('O número passou a ler a planilha. Ele vai dizer o que ela disser.');
              }}
            />
          ))}
        </div>
      </Cartao>

      <Cartao
        titulo="A demonstração"
        abaixo={`Quinze minutos para cinco peças. Abra pelo dado que muda, e não pela primeira peça.`}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={acrescentarInscricao}
              className="btn-secondary text-sm inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Chegou uma inscrição nova
            </button>
            <button
              onClick={() => {
                mudar(c => ({
                  ...c,
                  p: { ...c.p, dossie: DOSSIE_DAS_DUAS(c.p) },
                  descobertas: c.descobertas.includes(CHAVE_DO_DOSSIE_VELHO)
                    ? c.descobertas : [...c.descobertas, CHAVE_DO_DOSSIE_VELHO],
                }));
                avisar('O dossiê foi gerado de novo, com o número de agora dentro.');
              }}
              className="btn-secondary text-sm inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" /> Exportar o dossiê de novo
            </button>
          </div>

          {novas > 0 && (
            <p className="text-sm">
              {novas === 1 ? 'Uma inscrição nova entrou' : `${novas} inscrições novas entraram`} na
              aba de respostas. O dossiê continua com o que havia quando ele saiu —
              o PDF guarda um retrato.
            </p>
          )}

          <label className="text-sm flex flex-wrap items-center gap-2">
            <Timer className="w-4 h-4" />
            Quanto durou a demonstração
            <input
              type="number" min={1} max={60}
              value={ctx.p.minutosDaDemonstracao ?? ''}
              onChange={e => mudar(c => ({
                ...c,
                p: {
                  ...c.p,
                  minutosDaDemonstracao: e.target.value === '' ? null : Number(e.target.value),
                },
              }))}
              className="input w-20 tabular-nums"
              aria-label="Minutos da demonstração"
            />
            minutos, de {MINUTOS_DA_APRESENTACAO}
          </label>
        </div>
      </Cartao>
    </div>
  );
}
