/**
 * As telas da CC-ES013 que não imitam programa nenhum.
 *
 * A proposta ao examinador, a ficha da base, o diário de limpeza, o caderno da
 * análise, a conclusão e o roteiro da apresentação. Nenhum programa de
 * planilha tem onde guardar "por que esta linha saiu" ou "o que os dados não
 * permitem afirmar", e escrever isso numa célula seria pôr prosa onde se
 * espera dado — o requisito 4 pede o diário **por escrito**, e é aqui que ele
 * mora. É a decisão do caderno da CC-ES009 e da CC-ES010, e as peças são as
 * dele: `labs/caderno.tsx`. Dois cadernos ligeiramente diferentes seriam a
 * plataforma dizendo que são dois lugares.
 *
 * O que estas telas não fazem é julgar: o contador de palavras diz quantas
 * páginas a conclusão ocupa, e não se ela está boa; a ficha mostra o que cada
 * arquivo tem, e não qual escolher. É a regra da régua de status do Word e do
 * painel de Problemas do Python.
 */

import { Plus, Send, Trash2 } from 'lucide-react';
import { CampoLongo, Cartao, Escolha } from './caderno';
import {
  type ColunaDoDiario, type DecisaoDeLimpeza, type IdDaCandidata, type Publico,
  CANDIDATAS, MINIMO_DE_CAMPOS, MINIMO_DE_REGISTROS, MINUTOS_DA_APRESENTACAO,
  NOME_DA_COLUNA_DO_DIARIO, NOME_DO_PUBLICO, PAGINAS_DA_CONCLUSAO, PALAVRAS_POR_PAGINA,
  ehPergunta, minutosDoRoteiro, palavrasDaConclusao, paginasDaConclusao, propostaCompleta,
} from './projetoDeDados';
import { NOME_DO_PROBLEMA, type TipoDeProblema } from './chamadaDoClube';
import {
  type LicaoDaCcEs013,
  CHAVE_COMPARACAO, CHAVE_GRUPO_PEQUENO, CHAVE_MEDIDA_TIPICA, CHAVE_POR_QUE_MEDIDA,
  CHAVE_RELACAO_NAO_PROVA, CHAVE_RELACAO_SUGERE,
} from './metasDaCcEs013';
import type { PropsDaSuperficieDeDados } from './dadosNaPlanilha';

const campo = 'input-field text-sm';

/* ── Módulo 1: a proposta ─────────────────────────────────────────────────── */

export function PropostaDosDados({ ctx, mudar, avisar }: PropsDaSuperficieDeDados) {
  const { proposta } = ctx.p;
  const escrever = (chave: 'pergunta' | 'origem' | 'quemDecide' | 'decisao') => (texto: string) =>
    mudar(c => ({ ...c, p: { ...c.p, proposta: { ...c.p.proposta, [chave]: texto } } }));

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      <Cartao
        titulo="Proposta do projeto de dados"
        abaixo="O examinador aprova a proposta antes de você abrir qualquer base. Quem olha o dado primeiro acaba escrevendo a pergunta que ele já respondeu."
      >
        <div className="flex flex-col gap-4">
          <CampoLongo rotulo="A pergunta" ajuda="O que você quer saber, como pergunta."
            valor={proposta.pergunta} minimo={20} aoEscrever={escrever('pergunta')} />
          <CampoLongo rotulo="De onde vem o dado" ajuda="Onde você vai buscar a base, antes de buscá-la."
            valor={proposta.origem} minimo={20} aoEscrever={escrever('origem')} />
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">Quem vai decidir alguma coisa a partir do resultado</span>
            <input className={campo} value={proposta.quemDecide}
              onChange={e => escrever('quemDecide')(e.target.value)} />
          </label>
          <CampoLongo rotulo="Que decisão" ajuda="O que essa pessoa vai poder fazer com a resposta."
            valor={proposta.decisao} minimo={20} aoEscrever={escrever('decisao')} />
        </div>
      </Cartao>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            const p = ctx.p.proposta;
            /* O que aprova é `propostaCompleta`, a mesma conta das metas; a
               lista só diz ao desbravador o que o examinador viu faltar. */
            const falta = [
              !ehPergunta(p.pergunta) && 'a pergunta não está escrita como pergunta',
              p.origem.trim().length < 20 && 'falta dizer de onde vem o dado',
              p.quemDecide.trim() === '' && 'falta dizer quem decide',
              p.decisao.trim().length < 20 && 'falta dizer que decisão',
            ].filter(Boolean);
            if (!propostaCompleta(p)) { avisar(`O examinador devolveu a proposta: ${falta.join('; ')}.`); return; }
            mudar(c => ({ ...c, p: { ...c.p, proposta: { ...c.p.proposta, aprovadaEm: '2026-07-01' } } }));
            avisar('O examinador aprovou a proposta. Agora a base pode ser aberta.');
          }}
          disabled={proposta.aprovadaEm !== null}
          className="btn-primary text-sm inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <Send className="w-4 h-4" /> Enviar para aprovação
        </button>
        {/*
          O caminho errado, a um clique: é o mesmo botão da CC-ES012, pelo
          motivo escrito lá. Sem ele, "a execução não começa antes da
          aprovação" seria uma regra que não havia como quebrar.
        */}
        <button
          onClick={() => {
            mudar(c => ({ ...c, comecouAntes: c.p.proposta.aprovadaEm === null || c.comecouAntes }));
            avisar(ctx.p.proposta.aprovadaEm === null
              ? 'Você abriu a base antes da aprovação.'
              : 'A proposta já estava aprovada: pode abrir a base.');
          }}
          className="btn-secondary text-sm inline-flex items-center gap-1.5"
        >
          Abrir a base
        </button>
      </div>

      {proposta.aprovadaEm !== null && (
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Aprovada em 01/07/2026.</p>
      )}
    </div>
  );
}

/* ── Módulo 2: a ficha da base ────────────────────────────────────────────── */

const dataBr = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;

export function FichaDaBaseDeDados({ ctx, mudar }: PropsDaSuperficieDeDados) {
  const { ficha } = ctx.p;
  const mudarFicha = (f: Partial<typeof ficha>) =>
    mudar(c => ({ ...c, p: { ...c.p, ficha: { ...c.p.ficha, ...f } } }));

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      <Cartao
        titulo="As bases ao seu alcance"
        abaixo={`A pergunta aprovada: ${ctx.p.proposta.pergunta || '(sem pergunta)'} O requisito pede, no mínimo, ${MINIMO_DE_REGISTROS} registros e ${MINIMO_DE_CAMPOS} campos.`}
      >
        <Escolha<IdDaCandidata>
          opcoes={CANDIDATAS.map(c => ({
            id: c.id,
            rotulo: c.arquivo,
            abaixo: `${c.descricao} ${c.registros} registros · ${c.campos.length} campos: ${c.campos.join(', ')}. Dados de ${c.periodo}; chegou em ${dataBr(c.obtidaEm)}${c.publica ? '; fonte pública' : ''}.`,
          }))}
          escolhida={ficha.base ?? undefined}
          aoEscolher={id => mudarFicha({ base: id })}
        />
      </Cartao>

      <Cartao titulo="A ficha da base" abaixo="O que quem for conferir a análise vai precisar para buscar o mesmo arquivo de novo.">
        <div className="flex flex-col gap-4">
          <CampoLongo rotulo="Origem" ajuda="Quem forneceu, de que sistema saiu, com que outro dado foi cruzado."
            valor={ficha.origem} minimo={40} aoEscrever={t => mudarFicha({ origem: t })} />
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">Obtida em</span>
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>DD/MM/AAAA</span>
            <input className={campo} aria-label="Obtida em" value={ficha.obtidaEm}
              onChange={e => mudarFicha({ obtidaEm: e.target.value })} />
          </label>
        </div>
      </Cartao>
    </div>
  );
}

/* ── Módulos 3 e 4: o diário de limpeza ───────────────────────────────────── */

const PROBLEMAS = Object.keys(NOME_DO_PROBLEMA) as TipoDeProblema[];
const COLUNAS_DO_DIARIO = Object.keys(NOME_DA_COLUNA_DO_DIARIO) as ColunaDoDiario[];

const proximoId = (d: DecisaoDeLimpeza[]) =>
  `n${d.reduce((m, x) => Math.max(m, Number(x.id.replace(/\D/g, '')) || 0), 0) + 1}`;

export function DiarioDeLimpeza({ ctx, mudar }: PropsDaSuperficieDeDados) {
  const diario = ctx.p.diario;
  const mudarDiario = (f: (d: DecisaoDeLimpeza[]) => DecisaoDeLimpeza[]) =>
    mudar(c => ({ ...c, p: { ...c.p, diario: f(c.p.diario) } }));
  const mudarDecisao = (id: string, f: Partial<DecisaoDeLimpeza>) =>
    mudarDiario(d => d.map(x => (x.id === id ? { ...x, ...f } : x)));

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      <Cartao
        titulo="Diário de limpeza"
        abaixo="Uma decisão por problema e por coluna: o que você fez e por quê. Quem abrir a base tratada no ano que vem precisa saber o que mudou da bruta para ela."
      >
        <div className="flex flex-col gap-4">
          {diario.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Nenhuma decisão escrita ainda.</p>
          )}
          {diario.map((d, i) => (
            <div key={d.id} className="flex flex-col gap-2 rounded-lg p-3"
              style={{ border: '1px solid var(--color-border)' }}>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-semibold">Decisão {i + 1}</span>
                <select className={campo} aria-label={`Problema da decisão ${i + 1}`}
                  value={d.problema ?? ''}
                  onChange={e => mudarDecisao(d.id, { problema: (e.target.value || null) as TipoDeProblema | null })}>
                  <option value="">Qual problema?</option>
                  {PROBLEMAS.map(p => <option key={p} value={p}>{NOME_DO_PROBLEMA[p]}</option>)}
                </select>
                <select className={campo} aria-label={`Coluna da decisão ${i + 1}`}
                  value={d.coluna ?? ''}
                  onChange={e => mudarDecisao(d.id, { coluna: (e.target.value || null) as ColunaDoDiario | null })}>
                  <option value="">Em que coluna?</option>
                  {COLUNAS_DO_DIARIO.map(c => <option key={c} value={c}>{NOME_DA_COLUNA_DO_DIARIO[c]}</option>)}
                </select>
                <button type="button" className="btn-secondary text-xs inline-flex items-center gap-1"
                  aria-label={`Apagar a decisão ${i + 1}`}
                  onClick={() => mudarDiario(x => x.filter(y => y.id !== d.id))}>
                  <Trash2 className="w-3 h-3" /> Apagar
                </button>
              </div>
              <CampoLongo rotulo="O que fiz, e por quê" valor={d.texto} minimo={60}
                aoEscrever={t => mudarDecisao(d.id, { texto: t })} />
            </div>
          ))}
          <button type="button" className="btn-secondary text-sm inline-flex items-center gap-1.5 self-start"
            onClick={() => mudarDiario(d => [...d, { id: proximoId(d), problema: null, coluna: null, texto: '' }])}>
            <Plus className="w-4 h-4" /> Acrescentar decisão
          </button>
        </div>
      </Cartao>
    </div>
  );
}

/* ── Módulos 5 a 7: o caderno da análise ──────────────────────────────────── */

export function CadernoDaAnaliseDeDados({ ctx, mudar, licao }: PropsDaSuperficieDeDados & { licao: LicaoDaCcEs013 }) {
  const texto = (chave: string) => ctx.p.textos[chave] ?? '';
  const escrever = (chave: string) => (t: string) =>
    mudar(c => ({ ...c, p: { ...c.p, textos: { ...c.p.textos, [chave]: t } } }));
  const escolher = (chave: string) => (v: string) =>
    mudar(c => ({ ...c, p: { ...c.p, escolhas: { ...c.p.escolhas, [chave]: v } } }));

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      {licao === 'descritivas' && (
        <Cartao titulo="A distância típica" abaixo="Compare a média e a mediana da distância que você calculou na aba Cálculos.">
          <div className="flex flex-col gap-4">
            <Escolha
              opcoes={[
                { id: 'media', rotulo: 'A média descreve melhor quem está no meio' },
                { id: 'mediana', rotulo: 'A mediana descreve melhor quem está no meio' },
              ]}
              escolhida={ctx.p.escolhas[CHAVE_MEDIDA_TIPICA]}
              aoEscolher={escolher(CHAVE_MEDIDA_TIPICA)}
            />
            <CampoLongo rotulo="Por quê, com os dois números" valor={texto(CHAVE_POR_QUE_MEDIDA)} minimo={60}
              aoEscrever={escrever(CHAVE_POR_QUE_MEDIDA)} />
          </div>
        </Cartao>
      )}
      {licao === 'grupos' && (
        <Cartao titulo="A comparação" abaixo="Os números estão na aba Grupos.">
          <div className="flex flex-col gap-4">
            <CampoLongo rotulo="Compare dois grupos, com as médias deles" valor={texto(CHAVE_COMPARACAO)} minimo={60}
              aoEscrever={escrever(CHAVE_COMPARACAO)} />
            <p className="text-sm font-semibold">O grupo de bicicleta tem a segunda maior presença. O que ele permite concluir?</p>
            <Escolha
              opcoes={[
                { id: 'basta', rotulo: 'Que ir de bicicleta faz o desbravador vir mais' },
                { id: 'pouco', rotulo: 'Pouco: são poucas pessoas para sustentar uma conclusão' },
              ]}
              escolhida={ctx.p.escolhas[CHAVE_GRUPO_PEQUENO]}
              aoEscolher={escolher(CHAVE_GRUPO_PEQUENO)}
            />
          </div>
        </Cartao>
      )}
      {licao === 'relacao' && (
        <Cartao titulo="A relação" abaixo="O r está na aba Cálculos; a reta, na dispersão da tratada.">
          <div className="flex flex-col gap-4">
            <CampoLongo rotulo="O que a relação sugere, com o r" valor={texto(CHAVE_RELACAO_SUGERE)} minimo={60}
              aoEscrever={escrever(CHAVE_RELACAO_SUGERE)} />
            <CampoLongo rotulo="O que ela não prova: que outra explicação cabe no mesmo desenho"
              valor={texto(CHAVE_RELACAO_NAO_PROVA)} minimo={60} aoEscrever={escrever(CHAVE_RELACAO_NAO_PROVA)} />
          </div>
        </Cartao>
      )}
    </div>
  );
}

/* ── Módulo 9: a conclusão ────────────────────────────────────────────────── */

export function ConclusaoDoRelatorio({ ctx, mudar }: PropsDaSuperficieDeDados) {
  const c = ctx.p.conclusao;
  const escrever = (chave: keyof typeof c) => (t: string) =>
    mudar(x => ({ ...x, p: { ...x.p, conclusao: { ...x.p.conclusao, [chave]: t } } }));
  const palavras = palavrasDaConclusao(c);
  const paginas = paginasDaConclusao(c);

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      <Cartao titulo="Relatório final — conclusão"
        abaixo={`No máximo ${PAGINAS_DA_CONCLUSAO} páginas. O diário de limpeza e o painel vão junto no relatório.`}>
        <div className="flex flex-col gap-4">
          <CampoLongo rotulo="O que os dados mostram" valor={c.mostram} minimo={60} aoEscrever={escrever('mostram')} />
          <CampoLongo rotulo="O que os dados não permitem afirmar" valor={c.naoPermitem} minimo={60} aoEscrever={escrever('naoPermitem')} />
          <CampoLongo rotulo="Recomendação ao clube" valor={c.recomendacao} minimo={60} aoEscrever={escrever('recomendacao')} />
          {/* A régua diz quanto, e não se está bom: é o que a régua do Word diz. */}
          <p className="text-sm" role="status"
            style={{ color: paginas > PAGINAS_DA_CONCLUSAO ? 'var(--color-warning)' : 'var(--color-text-muted)' }}>
            {palavras} palavras · cerca de {paginas} {paginas === 1 ? 'página' : 'páginas'} ({PALAVRAS_POR_PAGINA} palavras por página)
          </p>
        </div>
      </Cartao>
    </div>
  );
}

/* ── Módulo 10: o roteiro da apresentação ─────────────────────────────────── */

export function RoteiroDaApresentacao({ ctx, mudar }: PropsDaSuperficieDeDados) {
  const r = ctx.p.roteiro;
  const mudarRoteiro = (f: Partial<typeof r>) =>
    mudar(c => ({ ...c, p: { ...c.p, roteiro: { ...c.p.roteiro, ...f } } }));
  const total = minutosDoRoteiro(r);

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      <Cartao titulo="Para quem" abaixo="Quem vai ouvir, e o que essa pessoa pode decidir.">
        <Escolha<Publico>
          opcoes={(Object.keys(NOME_DO_PUBLICO) as Publico[]).map(p => ({ id: p, rotulo: NOME_DO_PUBLICO[p] }))}
          escolhida={r.publico ?? undefined}
          aoEscolher={p => mudarRoteiro({ publico: p })}
        />
      </Cartao>

      <Cartao titulo="Roteiro" abaixo={`Até ${MINUTOS_DA_APRESENTACAO} minutos.`}>
        <div className="flex flex-col gap-2">
          {r.blocos.map(b => (
            <label key={b.id} className="flex items-center gap-3 text-sm">
              <input type="number" min={0} max={20} className={`${campo} w-20`}
                aria-label={`Minutos: ${b.rotulo}`} value={b.minutos}
                onChange={e => mudarRoteiro({
                  blocos: r.blocos.map(x => (x.id === b.id
                    ? { ...x, minutos: Math.max(0, Math.round(Number(e.target.value) || 0)) } : x)),
                })} />
              <span>{b.rotulo}</span>
            </label>
          ))}
          <p className="text-sm" role="status"
            style={{ color: total > MINUTOS_DA_APRESENTACAO ? 'var(--color-warning)' : 'var(--color-text-muted)' }}>
            Total: {total} {total === 1 ? 'minuto' : 'minutos'}
          </p>
        </div>
      </Cartao>

      <Cartao titulo="Registro" abaixo="Depois de apresentar: o que aconteceu, e não o que se esperava.">
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">Quando apresentou (DD/MM/AAAA)</span>
            <input className={campo} aria-label="Quando apresentou" value={r.registro.data}
              onChange={e => mudarRoteiro({ registro: { ...r.registro, data: e.target.value } })} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">Quem estava</span>
            <input className={campo} aria-label="Quem estava" value={r.registro.quem}
              onChange={e => mudarRoteiro({ registro: { ...r.registro, quem: e.target.value } })} />
          </label>
          <CampoLongo rotulo="A decisão tomada, ou a reação" valor={r.registro.texto} minimo={60}
            aoEscrever={t => mudarRoteiro({ registro: { ...r.registro, texto: t } })} />
        </div>
      </Cartao>
    </div>
  );
}
