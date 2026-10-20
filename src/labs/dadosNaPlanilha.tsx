/**
 * O Excel da CC-ES013: a base bruta, a tratada e as abas de conta.
 *
 * A janela é a de `excel.tsx` e a grade é a mesma `GradeDoExcel`, com o gancho
 * `useGradeDoExcel` — `gradeDoExcel.test.tsx` cobra de cada laboratório os
 * mesmos gestos de teclado. O que este arquivo decide é do **exercício**: que
 * comandos a faixa oferece. E ela oferece os mesmos nas seis lições de
 * planilha, porque é assim que um programa é: uma faixa que só mostrasse
 * "Remover Duplicatas" na lição que o pede ensinaria a procurar o botão que a
 * tarefa quer, e não a procurar no programa. É a regra do Explorador da
 * CC-ES001.
 *
 * ── Os quatro comandos novos têm cada um o seu caminho errado ────────────
 * "Mover ou Copiar" com a caixa "Criar uma cópia" desmarcada, como ela nasce;
 * "Substituir tudo" com a planilha inteira no alcance; "Remover Duplicatas"
 * antes de padronizar, ou com só o nome marcado; e o "km" do cabeçalho, que
 * vai junto quando se seleciona a coluna pelo título. Nenhum deles avisa,
 * porque o Excel não avisa — o que avisa é a lista de tarefas, que diz qual
 * conta deixou de fechar.
 *
 * ── O histórico é daqui ──────────────────────────────────────────────────
 * O Ctrl+Z desfaz a planilha, e não o diário de limpeza: é a decisão da
 * planilha da CC-ES012, pelo motivo escrito lá. E o novo caderno se calcula
 * **fora** do atualizador do React, também pelo motivo escrito lá.
 */

import { useState } from 'react';
import {
  ArrowDownAZ, ArrowUpZA, BarChart3, Copy, Eraser, Files, PencilLine, Redo2,
  Replace, Trash2, Undo2,
} from 'lucide-react';
import {
  AbasDoExcel, BarraDeFormulas, BarraDeTituloDoExcel, BotaoDoExcel, DesenhoDoGrafico,
  GradeDoExcel, GrupoDoExcel, GuiasDoExcel,
} from './excel';
import { useGradeDoExcel } from './gradeDoExcel';
import {
  type Caderno, type Historico, type Planilha, type TipoDeGrafico,
  desfazer, historicoDe, moverOuCopiar, nomeDaFaixa, normalizar, ordenar,
  planilhaAtiva, pontosDaDispersao, pontosDoGrafico, refazer, registrar,
  removerDuplicatas, renomearAba, substituir, trocarAtiva, valorCalculado, umaCelulaSo,
} from './planilha';
import { mostrarNumero } from './formulas';
import type { ContextoDoProjetoDeDados } from './metasDaCcEs013';

export interface PropsDaSuperficieDeDados {
  ctx: ContextoDoProjetoDeDados;
  mudar: (f: (c: ContextoDoProjetoDeDados) => ContextoDoProjetoDeDados) => void;
  avisar: (texto: string) => void;
}

const USAVEIS = ['Página Inicial', 'Inserir', 'Dados'] as const;

const NOME_DO_GRAFICO: Record<TipoDeGrafico, string> = {
  pizza: 'Pizza',
  colunas: 'Colunas',
  linha: 'Linhas',
  dispersao: 'Dispersão',
};

/*
  O que cada tipo responde, escrito por extenso — as mesmas frases da CC-ES010,
  que é de onde a pessoa vem. O programa explica a escolha em vez de só deixar
  a tarefa vermelha; o que ele não diz é qual é a certa para cada aba.
*/
const O_QUE_O_GRAFICO_RESPONDE: Record<TipoDeGrafico, string> = {
  pizza: 'Repartição: de que o todo é feito. Só serve quando as partes somam o todo.',
  colunas: 'Comparação: qual é maior que qual.',
  linha: 'Evolução: como uma coisa mudou ao longo do tempo.',
  dispersao: 'Relação: se duas medidas andam juntas. Os dois eixos são medidas.',
};

/*
  As caixas de marcar dos diálogos, e o painel do gráfico.

  Superfície clara, então cada regra diz a própria cor: a plataforma pinta
  `label` e `legend` com o cinza dela, medido contra o aplicativo escuro, e
  sobre o branco do Excel ele some. É a conta de `painelDoLaboratorio.test.ts`.
*/
const CSS_DA_LIMPEZA = `
.pl-marcar { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: #201F1E; cursor: pointer; }
.pl-marcar input { width: 14px; height: 14px; accent-color: #217346; }
.pl-colunas-dup {
  display: flex; flex-direction: column; gap: 4px; max-height: 180px; overflow: auto;
  border: 1px solid #E1DFDD; border-radius: 2px; padding: 6px 8px; background: #FFFFFF;
}
.pl-linha-bts { display: flex; gap: 6px; }
.pl-elementos {
  display: flex; gap: 14px; flex-wrap: wrap; align-items: center;
  margin: 6px 10px 10px; padding: 6px 10px;
  border: 1px solid #D8D8D8; border-radius: 4px;
  background: #FFFFFF; color: #1A1A1A;
}
.pl-elementos legend { font-size: 11px; font-weight: 700; color: #1A1A1A; padding: 0 4px; }
.pl-elementos label { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #1A1A1A; cursor: pointer; }
.pl-formatar { margin: 6px 0 0; font-size: 12px; color: #1A1A1A; }
.pl-formatar summary { cursor: pointer; font-weight: 700; color: #1A1A1A; padding: 4px 0; }
.pl-formatar-campos { display: flex; flex-direction: column; gap: 6px; padding: 4px 0 2px; }
.pl-formatar-campos label { display: flex; flex-direction: column; gap: 2px; color: #1A1A1A; }
.pl-formatar-campos input, .pl-formatar-campos select {
  width: 100%; box-sizing: border-box;
  border: 1px solid #C8C6C4; border-radius: 2px; padding: 3px 6px;
  font: inherit; background: #FFFFFF; color: #201F1E;
}
`;

type Dialogo =
  | { tipo: 'substituir'; de: string; para: string; maiusculas: boolean; inteira: boolean }
  | { tipo: 'mover'; antesDe: number; copia: boolean }
  | { tipo: 'renomear'; nome: string }
  | { tipo: 'duplicatas'; colunas: number[] }
  | { tipo: 'grafico'; grafico: TipoDeGrafico; titulo: string; eixoX: string; eixoY: string };

/**
 * O que a régua do Excel conta na seleção: Média, Contagem e Soma.
 *
 * É o primeiro lugar em que o número guardado como texto se denuncia sem
 * fórmula nenhuma — a Contagem conta toda célula preenchida, e a Média e a
 * Soma só as que são número. Selecionar a coluna da distância e ver a Contagem
 * maior do que os números que entraram na Média é a mesma pista da
 * `CONT.NÚM` da CC-ES003, sem escrever nada.
 */
function contaDaSelecao(p: Planilha, cad: Caderno, faixa: { l1: number; c1: number; l2: number; c2: number }) {
  if (umaCelulaSo(faixa)) return null;
  const n = normalizar(faixa);
  let contagem = 0; let numeros = 0; let soma = 0;
  for (let l = n.topo; l <= Math.min(n.base, p.celulas.length - 1); l++) {
    for (let c = n.esq; c <= Math.min(n.dir, (p.celulas[0]?.length ?? 1) - 1); c++) {
      if ((p.celulas[l]?.[c]?.texto ?? '') === '') continue;
      contagem += 1;
      const v = valorCalculado(p, l, c, cad);
      if (v.tipo === 'numero') { numeros += 1; soma += v.n; }
    }
  }
  return contagem === 0 ? null : { contagem, numeros, soma };
}

export function AnaliseNoExcel({ ctx, mudar, avisar }: PropsDaSuperficieDeDados) {
  const [hist, setHist] = useState<Historico<Caderno>>(() => historicoDe(ctx.p.caderno));
  const cad = hist.presente;
  const p = planilhaAtiva(cad);
  const [guia, setGuia] = useState<string>('Página Inicial');
  const [dialogo, setDialogo] = useState<Dialogo | null>(null);

  const subir = (novo: Caderno) => mudar(c => ({ ...c, p: { ...c.p, caderno: novo } }));

  const aplicar = (f: (k: Caderno) => Caderno) => {
    const novo = registrar(hist, f(hist.presente));
    setHist(novo);
    subir(novo.presente);
  };

  const mudarPlanilha = (f: (pl: Planilha) => Planilha) =>
    aplicar(k => trocarAtiva(k, f(planilhaAtiva(k))));

  const andarNoHistorico = (quem: typeof desfazer) => {
    const novo = quem(hist);
    setHist(novo);
    subir(novo.presente);
  };

  const g = useGradeDoExcel({
    planilha: p,
    mudar: mudarPlanilha,
    desfazer: () => andarNoHistorico(desfazer),
    refazer: () => andarNoHistorico(refazer),
    avisar,
  });

  /* Trocar de aba não é um passo da planilha: não entra no Ctrl+Z. */
  const irParaAba = (i: number) => {
    const novo = { ...hist, presente: { ...hist.presente, ativa: i } };
    setHist(novo);
    subir(novo.presente);
    g.setFaixa({ l1: 0, c1: 0, l2: 0, c2: 0 });
    g.setEditando(null);
    g.setBarra('');
  };

  /* ── Os comandos ───────────────────────────────────────────────────────── */

  const substituirTudo = (d: Extract<Dialogo, { tipo: 'substituir' }>) => {
    if (d.de === '') { avisar('Escreva o que localizar.'); return; }
    const { planilha, trocas } = substituir(p, d.de, d.para,
      { maiusculas: d.maiusculas, inteira: d.inteira }, g.faixa);
    if (trocas === 0) { avisar(`Não encontramos "${d.de}" para substituir.`); return; }
    mudarPlanilha(() => planilha);
    avisar(`Tudo pronto. Fizemos ${trocas} ${trocas === 1 ? 'substituição' : 'substituições'}.`);
  };

  const moverOuCopiarAba = (d: Extract<Dialogo, { tipo: 'mover' }>) => {
    aplicar(k => moverOuCopiar(k, k.ativa, d.antesDe, d.copia));
    setDialogo(null);
    g.setFaixa({ l1: 0, c1: 0, l2: 0, c2: 0 });
  };

  const renomear = (nome: string) => {
    const r = renomearAba(cad, cad.ativa, nome);
    if (typeof r === 'string') { avisar(r); return; }
    aplicar(() => r);
    setDialogo(null);
  };

  const removerRepetidas = (colunas: number[]) => {
    if (colunas.length === 0) { avisar('Marque pelo menos uma coluna.'); return; }
    const total = p.tabela ? normalizar(p.tabela).base - normalizar(p.tabela).topo : 0;
    const { planilha, removidas } = removerDuplicatas(p, colunas);
    setDialogo(null);
    if (removidas === 0) { avisar('Nenhum valor duplicado encontrado.'); return; }
    mudarPlanilha(() => planilha);
    avisar(`${removidas} ${removidas === 1 ? 'valor duplicado encontrado e removido' : 'valores duplicados encontrados e removidos'}; ${total - removidas} valores exclusivos permanecem.`);
  };

  const classificar = (crescente: boolean) => {
    if (!p.tabela) { avisar('Esta aba não tem uma tabela reconhecida para classificar.'); return; }
    mudarPlanilha(q => ordenar(q, g.sel.c, crescente));
  };

  const criarGrafico = (d: Extract<Dialogo, { tipo: 'grafico' }>) => {
    mudarPlanilha(q => ({
      ...q,
      grafico: { tipo: d.grafico, titulo: d.titulo, eixoX: d.eixoX, eixoY: d.eixoY, faixa: g.faixa },
    }));
    setDialogo(null);
    avisar(`${NOME_DO_GRAFICO[d.grafico]} — ${O_QUE_O_GRAFICO_RESPONDE[d.grafico]}`);
  };

  const mudarGrafico = (f: (gr: NonNullable<Planilha['grafico']>) => NonNullable<Planilha['grafico']>) =>
    mudarPlanilha(q => (q.grafico ? { ...q, grafico: f(q.grafico) } : q));

  const botao = (dica: string, aoClicar: () => void, filho: React.ReactNode, rotulo?: string) => (
    <BotaoDoExcel dica={dica} aoClicar={aoClicar}>
      {rotulo ? (
        <span className="flex flex-col items-center">
          {filho}
          <span style={{ fontSize: 9 }}>{rotulo}</span>
        </span>
      ) : filho}
    </BotaoDoExcel>
  );

  const conta = contaDaSelecao(p, cad, g.faixa);
  const cabecalhos = p.tabela
    ? Array.from({ length: normalizar(p.tabela).dir - normalizar(p.tabela).esq + 1 },
      (_, i) => normalizar(p.tabela!).esq + i)
    : [];

  return (
    <div className="pl-janela">
      <style>{CSS_DA_LIMPEZA}</style>
      <BarraDeTituloDoExcel arquivo="Análise da presença — bruta, tratada e contas" aoAvisar={avisar} />
      <GuiasDoExcel atual={guia} usaveis={USAVEIS} aoTrocar={setGuia} aoAvisar={avisar} />

      <div className="pl-faixa">
        {guia === 'Página Inicial' && (
          <>
            <GrupoDoExcel nome="Desfazer">
              {botao('Desfazer', () => g.desfazer(), <Undo2 className="w-4 h-4" />)}
              {botao('Refazer', () => g.refazer(), <Redo2 className="w-4 h-4" />)}
            </GrupoDoExcel>
            <GrupoDoExcel nome="Células">
              {botao('Formatar: Mover ou Copiar Planilha', () => setDialogo({
                tipo: 'mover', antesDe: cad.ativa + 1, copia: false,
              }), <Files className="w-4 h-4" />, 'Mover ou Copiar')}
              {botao('Formatar: Renomear Planilha', () => setDialogo({ tipo: 'renomear', nome: p.nome }),
                <PencilLine className="w-4 h-4" />, 'Renomear')}
            </GrupoDoExcel>
            <GrupoDoExcel nome="Edição">
              {botao('Localizar e Selecionar: Substituir', () => setDialogo({
                tipo: 'substituir', de: '', para: '', maiusculas: false, inteira: false,
              }), <Replace className="w-4 h-4" />, 'Substituir')}
              {botao('Limpar o conteúdo da seleção', () => g.limparConteudo(),
                <Eraser className="w-4 h-4" />, 'Limpar')}
            </GrupoDoExcel>
          </>
        )}
        {guia === 'Inserir' && (
          <GrupoDoExcel nome="Gráficos">
            {botao('Inserir Gráfico com os dados selecionados', () => setDialogo({
              tipo: 'grafico', grafico: 'colunas', titulo: '', eixoX: '', eixoY: '',
            }), <BarChart3 className="w-4 h-4" />, 'Gráfico')}
          </GrupoDoExcel>
        )}
        {guia === 'Dados' && (
          <>
            <GrupoDoExcel nome="Classificar">
              {botao('Classificar de A a Z', () => classificar(true), <ArrowDownAZ className="w-4 h-4" />)}
              {botao('Classificar de Z a A', () => classificar(false), <ArrowUpZA className="w-4 h-4" />)}
            </GrupoDoExcel>
            <GrupoDoExcel nome="Ferramentas de Dados">
              {botao('Remover Duplicatas', () => {
                if (!p.tabela) { avisar('Esta aba não tem uma tabela reconhecida.'); return; }
                setDialogo({ tipo: 'duplicatas', colunas: cabecalhos });
              }, <Copy className="w-4 h-4" />, 'Remover Duplicatas')}
            </GrupoDoExcel>
          </>
        )}
      </div>

      <BarraDeFormulas nome={nomeDaFaixa(g.faixa)} props={g.propsDaBarra} />

      <GradeDoExcel
        {...g.props}
        caderno={cad}
        aoArrastarBorda={g.aoArrastarBorda}
        aoAjustarAoConteudo={g.aoAjustarAoConteudo}
        aoComecarPreenchimento={g.aoComecarPreenchimento}
      />

      {p.grafico && (
        <div className="pl-grafico" role="figure" aria-label={`Gráfico: ${p.grafico.titulo || 'sem título'}`}>
          <div className="pl-grafico-titulo">{p.grafico.titulo || '(sem título)'}</div>
          <DesenhoDoGrafico tipo={p.grafico.tipo} pontos={pontosDoGrafico(p, cad)}
            pares={pontosDaDispersao(p, cad)} tendencia={p.grafico.tendencia}
            equacao={p.grafico.equacao} />
          <div className="pl-grafico-eixo">
            {p.grafico.tipo === 'pizza'
              ? 'Pizza não tem eixo'
              : `${p.grafico.eixoX || '(eixo sem nome)'} × ${p.grafico.eixoY || '(eixo sem nome)'}`}
          </div>
          {/*
            Formatar o gráfico, no lugar: o título, os eixos e o tipo se
            mudam no gráfico que existe, como no Excel — clicar no título e
            escrever. Refazer o gráfico para trocar uma palavra do título
            perderia a faixa que a pessoa selecionou.
          */}
          {/*
            Recolhida, como o painel de formatação do Excel, que só abre
            quando se pede: aberta o tempo todo, ela cobriria metade da grade
            na tela pequena.
          */}
          <details className="pl-formatar">
            <summary>Formatar gráfico</summary>
            <div className="pl-formatar-campos">
              <label>
                Título
                <input type="text" aria-label="Título do gráfico" value={p.grafico.titulo}
                  onChange={e => mudarGrafico(gr => ({ ...gr, titulo: e.target.value }))} />
              </label>
              <label>
                Tipo
                <select aria-label="Alterar Tipo de Gráfico" value={p.grafico.tipo}
                  onChange={e => {
                    const tipo = e.target.value as TipoDeGrafico;
                    mudarGrafico(gr => ({ ...gr, tipo }));
                    avisar(`${NOME_DO_GRAFICO[tipo]} — ${O_QUE_O_GRAFICO_RESPONDE[tipo]}`);
                  }}>
                  {Object.entries(NOME_DO_GRAFICO).map(([k, r]) => <option key={k} value={k}>{r}</option>)}
                </select>
              </label>
              {p.grafico.tipo !== 'pizza' && (
                <>
                  <label>
                    Eixo horizontal
                    <input type="text" aria-label="Eixo horizontal" value={p.grafico.eixoX}
                      onChange={e => mudarGrafico(gr => ({ ...gr, eixoX: e.target.value }))} />
                  </label>
                  <label>
                    Eixo vertical
                    <input type="text" aria-label="Eixo vertical" value={p.grafico.eixoY}
                      onChange={e => mudarGrafico(gr => ({ ...gr, eixoY: e.target.value }))} />
                  </label>
                </>
              )}
              <button type="button" className="pl-dialogo-bt" onClick={() => {
                mudarPlanilha(q => ({ ...q, grafico: null }));
              }}>
                <Trash2 className="w-3 h-3" style={{ display: 'inline' }} /> Excluir gráfico
              </button>
            </div>
          </details>
          {/* A linha de tendência é elemento de dispersão: é onde ela significa
              alguma coisa aqui, e o Excel não a oferece na pizza. */}
          {p.grafico.tipo === 'dispersao' && (
            <fieldset className="pl-elementos">
              <legend>Elementos do Gráfico</legend>
              <label>
                <input type="checkbox" aria-label="Linha de Tendência"
                  checked={Boolean(p.grafico.tendencia)}
                  onChange={e => mudarGrafico(gr => ({ ...gr, tendencia: e.target.checked || undefined }))} />
                Linha de Tendência
              </label>
              <label>
                <input type="checkbox" aria-label="Exibir Equação no gráfico"
                  checked={Boolean(p.grafico.equacao)}
                  onChange={e => mudarGrafico(gr => ({ ...gr, equacao: e.target.checked || undefined }))} />
                Exibir Equação no gráfico
              </label>
            </fieldset>
          )}
        </div>
      )}

      <AbasDoExcel nomes={cad.planilhas.map(q => q.nome)} ativa={cad.ativa}
        aoTrocar={irParaAba} aoAvisar={avisar} />

      <div className="pl-status">
        <span>Pronto</span>
        {conta && (
          <span style={{ marginLeft: 12 }}>
            {conta.numeros > 0 && `Média: ${mostrarNumero(conta.soma / conta.numeros)}   `}
            Contagem: {conta.contagem}
            {conta.numeros > 0 && `   Soma: ${mostrarNumero(conta.soma)}`}
          </span>
        )}
        <span style={{ marginLeft: 'auto' }}>{nomeDaFaixa(g.faixa)}</span>
      </div>

      {dialogo && (
        <>
          <div className="pl-veu-dialogo" onPointerDown={() => setDialogo(null)} />
          <div className="pl-dialogo" role="dialog" aria-modal="true"
            aria-label={TITULO_DO_DIALOGO[dialogo.tipo]}>
            <div className="pl-dialogo-titulo">{TITULO_DO_DIALOGO[dialogo.tipo]}</div>

            {dialogo.tipo === 'substituir' && (
              <>
                <div className="pl-dialogo-corpo">
                  <label className="pl-campo">
                    <span>Localizar</span>
                    <input value={dialogo.de} aria-label="Localizar"
                      onChange={e => setDialogo({ ...dialogo, de: e.target.value })} />
                  </label>
                  <label className="pl-campo">
                    <span>Substituir por</span>
                    <input value={dialogo.para} aria-label="Substituir por"
                      onChange={e => setDialogo({ ...dialogo, para: e.target.value })} />
                  </label>
                  <label className="pl-marcar">
                    <input type="checkbox" checked={dialogo.maiusculas}
                      onChange={e => setDialogo({ ...dialogo, maiusculas: e.target.checked })} />
                    Diferenciar maiúsculas e minúsculas
                  </label>
                  <label className="pl-marcar">
                    <input type="checkbox" checked={dialogo.inteira}
                      onChange={e => setDialogo({ ...dialogo, inteira: e.target.checked })} />
                    Coincidir conteúdo da célula inteira
                  </label>
                  {/* O Excel não diz isto na caixa, e o comando o faz: com uma
                      célula só selecionada, procura na planilha inteira. A
                      frase é a régua de baixo da caixa, e não um aviso. */}
                  <span style={{ fontSize: 11.5, color: '#605E5C' }}>
                    Dentro: {umaCelulaSo(g.faixa) ? 'a planilha inteira' : `a seleção ${nomeDaFaixa(g.faixa)}`}
                  </span>
                </div>
                <div className="pl-dialogo-pe">
                  <button type="button" className="pl-dialogo-bt" onClick={() => setDialogo(null)}>Fechar</button>
                  <button type="button" className="pl-dialogo-bt pl-dialogo-bt-ok"
                    onClick={() => substituirTudo(dialogo)}>Substituir tudo</button>
                </div>
              </>
            )}

            {dialogo.tipo === 'mover' && (
              <>
                <div className="pl-dialogo-corpo">
                  <label className="pl-campo">
                    <span>Antes da planilha</span>
                    <select aria-label="Antes da planilha" value={dialogo.antesDe}
                      onChange={e => setDialogo({ ...dialogo, antesDe: Number(e.target.value) })}>
                      {cad.planilhas.map((q, i) => <option key={q.nome} value={i}>{q.nome}</option>)}
                      <option value={cad.planilhas.length}>(mover para o final)</option>
                    </select>
                  </label>
                  <label className="pl-marcar">
                    <input type="checkbox" checked={dialogo.copia}
                      onChange={e => setDialogo({ ...dialogo, copia: e.target.checked })} />
                    Criar uma cópia
                  </label>
                </div>
                <div className="pl-dialogo-pe">
                  <button type="button" className="pl-dialogo-bt" onClick={() => setDialogo(null)}>Cancelar</button>
                  <button type="button" className="pl-dialogo-bt pl-dialogo-bt-ok"
                    onClick={() => moverOuCopiarAba(dialogo)}>OK</button>
                </div>
              </>
            )}

            {dialogo.tipo === 'renomear' && (
              <>
                <div className="pl-dialogo-corpo">
                  <label className="pl-campo">
                    <span>Nome da planilha</span>
                    <input value={dialogo.nome} aria-label="Nome da planilha"
                      onChange={e => setDialogo({ ...dialogo, nome: e.target.value })}
                      onKeyDown={e => { if (e.key === 'Enter') renomear(dialogo.nome); }} />
                  </label>
                </div>
                <div className="pl-dialogo-pe">
                  <button type="button" className="pl-dialogo-bt" onClick={() => setDialogo(null)}>Cancelar</button>
                  <button type="button" className="pl-dialogo-bt pl-dialogo-bt-ok"
                    onClick={() => renomear(dialogo.nome)}>OK</button>
                </div>
              </>
            )}

            {dialogo.tipo === 'duplicatas' && (
              <>
                <div className="pl-dialogo-corpo">
                  <span style={{ fontSize: 12, color: '#201F1E' }}>
                    Para remover valores duplicados, selecione as colunas que contêm duplicatas.
                  </span>
                  <div className="pl-linha-bts">
                    <button type="button" className="pl-dialogo-bt"
                      onClick={() => setDialogo({ ...dialogo, colunas: cabecalhos })}>Selecionar Tudo</button>
                    <button type="button" className="pl-dialogo-bt"
                      onClick={() => setDialogo({ ...dialogo, colunas: [] })}>Desmarcar Tudo</button>
                  </div>
                  <div className="pl-colunas-dup">
                    {cabecalhos.map(c => (
                      <label key={c} className="pl-marcar">
                        <input type="checkbox" checked={dialogo.colunas.includes(c)}
                          onChange={e => setDialogo({
                            ...dialogo,
                            colunas: e.target.checked
                              ? [...dialogo.colunas, c].sort((a, b) => a - b)
                              : dialogo.colunas.filter(x => x !== c),
                          })} />
                        {p.celulas[p.tabela ? normalizar(p.tabela).topo : 0]?.[c]?.texto || `Coluna ${c + 1}`}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="pl-dialogo-pe">
                  <button type="button" className="pl-dialogo-bt" onClick={() => setDialogo(null)}>Cancelar</button>
                  <button type="button" className="pl-dialogo-bt pl-dialogo-bt-ok"
                    onClick={() => removerRepetidas(dialogo.colunas)}>OK</button>
                </div>
              </>
            )}

            {dialogo.tipo === 'grafico' && (
              <>
                <div className="pl-dialogo-corpo">
                  <span style={{ fontSize: 11.5, color: '#605E5C' }}>Dados de {nomeDaFaixa(g.faixa)}</span>
                  <label className="pl-campo">
                    <span>Tipo</span>
                    <select aria-label="Tipo" value={dialogo.grafico}
                      onChange={e => setDialogo({ ...dialogo, grafico: e.target.value as TipoDeGrafico })}>
                      {Object.entries(NOME_DO_GRAFICO).map(([k, r]) => <option key={k} value={k}>{r}</option>)}
                    </select>
                  </label>
                  <p className="pl-nota">{O_QUE_O_GRAFICO_RESPONDE[dialogo.grafico]}</p>
                  <label className="pl-campo">
                    <span>Título</span>
                    <input aria-label="Título" value={dialogo.titulo}
                      onChange={e => setDialogo({ ...dialogo, titulo: e.target.value })} />
                  </label>
                  <label className="pl-campo">
                    <span>Eixo horizontal</span>
                    <input aria-label="Eixo horizontal" value={dialogo.eixoX}
                      onChange={e => setDialogo({ ...dialogo, eixoX: e.target.value })} />
                  </label>
                  <label className="pl-campo">
                    <span>Eixo vertical</span>
                    <input aria-label="Eixo vertical" value={dialogo.eixoY}
                      onChange={e => setDialogo({ ...dialogo, eixoY: e.target.value })} />
                  </label>
                </div>
                <div className="pl-dialogo-pe">
                  <button type="button" className="pl-dialogo-bt" onClick={() => setDialogo(null)}>Cancelar</button>
                  <button type="button" className="pl-dialogo-bt pl-dialogo-bt-ok"
                    onClick={() => criarGrafico(dialogo)}>OK</button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const TITULO_DO_DIALOGO: Record<Dialogo['tipo'], string> = {
  substituir: 'Localizar e Substituir',
  mover: 'Mover ou Copiar',
  renomear: 'Renomear Planilha',
  duplicatas: 'Remover Duplicatas',
  grafico: 'Inserir Gráfico',
};
