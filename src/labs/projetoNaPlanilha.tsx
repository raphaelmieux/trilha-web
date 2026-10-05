/**
 * O Excel da CC-ES012: a planilha de controle do módulo 3.
 *
 * A janela é a de `excel.tsx` e a grade é a mesma `GradeDoExcel`, com o gancho
 * `useGradeDoExcel` — as duas trilhas e as veredas de planilha passam por elas,
 * e `gradeDoExcel.test.tsx` cobra de cada laboratório os mesmos gestos de
 * teclado. O que este arquivo decide é do **exercício**: que comandos a faixa
 * oferece, e de que pasta de trabalho se parte.
 *
 * ── O histórico é daqui, e o conjunto é do quadro acima ──────────────────
 * O Ctrl+Z desfaz a **planilha**, que é o que ele desfaz no Excel: desfazer um
 * passo da planilha não devia desfazer a seção que se escreveu no regulamento
 * dois módulos atrás. Então o histórico mora nesta tela, e toda mudança sobe
 * para o conjunto pelo `mudar` — as duas ficam em passo porque é a mesma
 * chamada que escreve nas duas. Quem recomeça a lição remonta esta tela por
 * `key`, que é o que mantém o histórico sem segunda fonte.
 */

import { useState } from 'react';
import { Palette, Redo2, Sigma, Undo2 } from 'lucide-react';
import {
  AbasDoExcel, BarraDeFormulas, BarraDeTituloDoExcel, BotaoDoExcel,
  GradeDoExcel, GrupoDoExcel, GuiasDoExcel,
} from './excel';
import { useGradeDoExcel } from './gradeDoExcel';
import {
  type Caderno, type Historico, type Planilha,
  desfazer, historicoDe, nomeDaFaixa, planilhaAtiva, refazer, registrar,
  trocarAtiva,
} from './planilha';
import { NOME_DA_ABA_DE_CONTROLE } from './projetoDocumental';
import type { PropsDaSuperficie } from './projetoNaPlataforma';

const USAVEIS = ['Página Inicial', 'Inserir', 'Dados', 'Revisão', 'Exibir'];

export function ControleNoExcel({ ctx, mudar, avisar }: PropsDaSuperficie) {
  const [hist, setHist] = useState<Historico<Caderno>>(() => historicoDe(ctx.p.controle));
  const cad = hist.presente;
  const p = planilhaAtiva(cad);
  const [guia, setGuia] = useState('Página Inicial');

  /**
   * Toda mudança passa por aqui: entra no histórico e sobe para o conjunto.
   *
   * O novo caderno se calcula **fora** do atualizador, e não dentro dele.
   * Chamar um `setState` de dentro do atualizador de outro é efeito colateral
   * num lugar onde o React não promete passar uma vez só: ele pode rodar o
   * atualizador de novo e jogar o resultado fora, e o `mudar` iria junto.
   *
   * Nenhuma trava daqui separa as duas formas — a que clica passa com as duas,
   * e está escrito para não dizer que ela achou isto. O que decide é a regra
   * do React, e não um teste: a forma de dentro funciona por acaso, e o acaso
   * muda com a versão.
   */
  const aplicar = (f: (c: Caderno) => Caderno) => {
    const novo = registrar(hist, f(hist.presente));
    setHist(novo);
    mudar(c => ({ ...c, p: { ...c.p, controle: novo.presente } }));
  };

  const mudarPlanilha = (f: (pl: Planilha) => Planilha) =>
    aplicar(c => trocarAtiva(c, f(planilhaAtiva(c))));

  const andarNoHistorico = (quem: typeof desfazer) => {
    const novo = quem(hist);
    setHist(novo);
    mudar(c => ({ ...c, p: { ...c.p, controle: novo.presente } }));
  };

  const g = useGradeDoExcel({
    planilha: p,
    mudar: mudarPlanilha,
    desfazer: () => andarNoHistorico(desfazer),
    refazer: () => andarNoHistorico(refazer),
    avisar,
  });

  const corNaSelecao = () => {
    const { l1, c1, l2, c2 } = g.faixa;
    const topo = Math.min(l1, l2); const base = Math.max(l1, l2);
    const esq = Math.min(c1, c2); const dir = Math.max(c1, c2);
    mudarPlanilha(pl => ({
      ...pl,
      celulas: pl.celulas.map((linha, l) => linha.map((cel, c) =>
        (l >= topo && l <= base && c >= esq && c <= dir
          ? { ...cel, cor: ctx.p.identidade.cor } : cel))),
    }));
    avisar(`${nomeDaFaixa(g.faixa)} recebeu a cor do conjunto.`);
  };

  return (
    <div className="pl-janela">
      <BarraDeTituloDoExcel arquivo="controle-da-feira-2026-07-02-v01" aoAvisar={avisar} />
      <GuiasDoExcel atual={guia} usaveis={USAVEIS} aoTrocar={setGuia} aoAvisar={avisar} />

      <div className="pl-faixa">
        <GrupoDoExcel nome="Desfazer">
          <BotaoDoExcel dica="Desfazer (Ctrl+Z)"
            aoClicar={() => g.desfazer()}
          >
            <Undo2 className="w-4 h-4" />
          </BotaoDoExcel>
          <BotaoDoExcel dica="Refazer (Ctrl+Y)"
            aoClicar={() => g.refazer()}
          >
            <Redo2 className="w-4 h-4" />
          </BotaoDoExcel>
        </GrupoDoExcel>

        <GrupoDoExcel nome="Fonte">
          <BotaoDoExcel
            dica="Cor da fonte: a cor do conjunto"
            aoClicar={corNaSelecao}
          >
            <Palette className="w-4 h-4" />
          </BotaoDoExcel>
        </GrupoDoExcel>

        <GrupoDoExcel nome="Edição">
          <BotaoDoExcel
            dica="AutoSoma: soma o que está acima até a primeira célula vazia"
           
            aoClicar={() => {
              avisar('Escreva a fórmula na célula: aqui a conta é uma multiplicação, e não uma soma.');
            }}
          >
            <Sigma className="w-4 h-4" />
          </BotaoDoExcel>
        </GrupoDoExcel>
      </div>

      <BarraDeFormulas nome={nomeDaFaixa(g.faixa)} props={g.propsDaBarra} />

      <GradeDoExcel
        {...g.props}
        aoArrastarBorda={g.aoArrastarBorda}
        aoAjustarAoConteudo={g.aoAjustarAoConteudo}
      />

      <AbasDoExcel
        nomes={cad.planilhas.map(q => q.nome)}
        ativa={cad.ativa}
        aoTrocar={i => {
          setHist(h => ({ ...h, presente: { ...h.presente, ativa: i } }));
          g.setFaixa({ l1: 0, c1: 0, l2: 0, c2: 0 });
          g.setEditando(null);
          g.setBarra('');
        }}
        aoAvisar={avisar}
      />

      {p.nome === NOME_DA_ABA_DE_CONTROLE && (
        <div className="pl-status">
          Pronto · {nomeDaFaixa(g.faixa)}
        </div>
      )}
    </div>
  );
}
