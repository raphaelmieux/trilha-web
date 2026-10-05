/**
 * O PowerPoint da CC-ES012: a apresentação de divulgação do módulo 6.
 *
 * A janela é a de `powerpoint.tsx`, a mesma da CC-ES011 e da AP044. A
 * apresentação já chega montada — montá-la é o que a CC-ES011 mediu —, então a
 * faixa daqui é curta: ela tem o que esta lição usa, que é vestir o mestre e
 * trocar a figura colada por um gráfico que lê a planilha.
 */

import { useState } from 'react';
import { BarChart3, Image as ImageIcon, Palette, Type } from 'lucide-react';
import {
  BarraDeTituloDoPowerPoint, BotaoDoPowerPoint, FolhaDoSlide,
  GrupoDoPowerPoint, GuiasDoPowerPoint,
} from './powerpoint';
import { DesenhoDoGrafico } from './excel';
import { comGraficoVinculado, comIdentidadeNoMestre } from './metasDaCcEs012';
import { GRAFICO_DA_FEIRA } from './projetoDaFeira';
import { O_QUE_CADA_UM_FAZ, comoChegou } from './projetoDocumental';
import type { PropsDaSuperficie } from './projetoNaPlataforma';

const USAVEIS = ['Página Inicial', 'Inserir', 'Design', 'Exibir'];

export function DivulgacaoNoPowerPoint({ ctx, mudar, avisar }: PropsDaSuperficie) {
  const [guia, setGuia] = useState('Página Inicial');
  const [atual, setAtual] = useState(0);
  const [noMestre, setNoMestre] = useState(false);
  const ap = ctx.p.apresentacao;
  const slide = ap.slides[atual];
  const grafico = ap.slides.find(s => s.grafico?.id === GRAFICO_DA_FEIRA)?.grafico;

  const desenharGrafico = (g: { retrato: { rotulo: string; valor: number }[] }) => (
    <DesenhoDoGrafico tipo="colunas" pontos={g.retrato} altura={78} />
  );

  return (
    <div className="pp-janela">
      <BarraDeTituloDoPowerPoint
        arquivo="feira-divulgacao-2026-07-04-v02"
        aoAvisar={avisar}
        aoNaoFazParte={() => avisar('Isto existe no programa de verdade, e não faz parte deste exercício.')}
      />
      <GuiasDoPowerPoint
        atual={guia} usaveis={USAVEIS} aoTrocar={setGuia}
        aoNaoFazParte={nome => avisar(`A guia ${nome} existe no programa de verdade, e não faz parte deste exercício.`)}
      />

      <div className="pp-faixa">
        {guia === 'Exibir' && (
          <GrupoDoPowerPoint nome="Modos de Exibição Mestres">
            <BotaoDoPowerPoint
              dica="Slide Mestre" rotulo="Slide Mestre" empilhado
              ativo={noMestre} aoClicar={() => setNoMestre(m => !m)}
            >
              <Type className="w-4 h-4" />
            </BotaoDoPowerPoint>
          </GrupoDoPowerPoint>
        )}

        {noMestre && (
          <GrupoDoPowerPoint nome="Plano de Fundo">
            <BotaoDoPowerPoint
              dica="Fontes e cor do conjunto" rotulo="Identidade" empilhado
              aoClicar={() => {
                mudar(c => ({ ...c, p: { ...c.p, apresentacao: comIdentidadeNoMestre(c.p.apresentacao) } }));
                avisar('O mestre vestiu a identidade, e os quatro slides mudaram de uma vez.');
              }}
            >
              <Palette className="w-4 h-4" />
            </BotaoDoPowerPoint>
          </GrupoDoPowerPoint>
        )}

        {guia === 'Inserir' && (
          <GrupoDoPowerPoint nome="Ilustrações">
            <BotaoDoPowerPoint
              dica="Gráfico com vínculo para a planilha de controle"
              rotulo="Gráfico" empilhado
              aoClicar={() => {
                mudar(c => ({ ...c, p: { ...c.p, apresentacao: comGraficoVinculado(c.p.apresentacao) } }));
                avisar('O gráfico passou a ler a planilha, e já mostra as unidades de agora.');
              }}
            >
              <BarChart3 className="w-4 h-4" />
            </BotaoDoPowerPoint>
            <BotaoDoPowerPoint
              dica="Colar como figura: o retrato de agora, para sempre"
              rotulo="Colar figura" empilhado
              aoClicar={() => avisar('Colar como figura é o que esta apresentação já tem — e é o defeito que a lição manda consertar.')}
            >
              <ImageIcon className="w-4 h-4" />
            </BotaoDoPowerPoint>
          </GrupoDoPowerPoint>
        )}
      </div>

      <div className="pp-corpo">
        <div className="pp-tira">
          {ap.slides.map((s, i) => (
            <button
              key={s.id} type="button" className="pp-tira-item" aria-current={i === atual}
              aria-label={`Slide ${i + 1}${s.titulo ? `: ${s.titulo}` : ' (vazio)'}`}
              onClick={() => setAtual(i)}
            >
              <span>{i + 1}</span>
              <span className="pp-tira-moldura">
                <FolhaDoSlide
                  slide={s} mestre={ap.mestre} mini numero={i + 1}
                  desenharGrafico={desenharGrafico}
                />
              </span>
            </button>
          ))}
        </div>

        <div className="pp-palco">
          <div style={{ width: '100%', maxWidth: 620 }}>
            <FolhaDoSlide
              slide={slide} mestre={ap.mestre} numero={atual + 1}
              desenharGrafico={desenharGrafico}
            />
          </div>
        </div>
      </div>

      {grafico && (
        <div className="pp-status">
          <span>
            Gráfico dos estandes: {O_QUE_CADA_UM_FAZ[comoChegou(ctx.p, {
              id: 'x', peca: 'apresentacao', alvo: GRAFICO_DA_FEIRA,
              como: grafico.como, de: { planilha: '', linha: 0, coluna: 0 }, retrato: 0,
            })].naoFaz}
          </span>
        </div>
      )}
    </div>
  );
}
