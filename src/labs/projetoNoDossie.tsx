/**
 * O leitor de PDF da CC-ES012: o dossiê do módulo 7.
 *
 * A janela é a de `leitorDePdf.tsx`, a mesma da CC-ES004. O que este arquivo
 * decide é do **exercício**: quais peças se pode exportar e combinar, e o que
 * a lição cobra.
 *
 * ── A faixa oferece Combinar com as três peças, e não com duas ───────────
 * A planilha de controle aparece na lista de quem se pode juntar, porque ela
 * está na pasta do clube e porque o requisito pede uma decisão: o dossiê é o
 * que **sai** do clube, e o que sai é escolha. Esconder a planilha resolveria
 * a lição na nossa tela — é a decisão da lista da nuvem da CC-ES006, que não
 * escreve o papel de ninguém.
 */

import { useState } from 'react';
import {
  BarraDeTitulo, CaixaDeProcurar, FaixaDoLeitor, Folha, PainelDeMiniaturas,
  ReguaDoLeitor,
} from './leitorDePdf';
import { juntar, procurar, type DocumentoPdf } from './documentoPdf';
import {
  origensDoDossie, pdfDaApresentacao, pdfDoControle, pdfDoRegulamento,
} from './metasDaCcEs012';
import { NOME_DA_PECA, PECAS_DE_DISTRIBUICAO, type TipoDePeca } from './projetoDocumental';
import type { PropsDaSuperficie } from './projetoNaPlataforma';

/** As três peças que dão PDF, e qual delas é de distribuição. */
const EXPORTAVEIS: { peca: Exclude<TipoDePeca, 'formulario' | 'dossie'>; origem: string }[] = [
  { peca: 'documento', origem: 'regulamento' },
  { peca: 'apresentacao', origem: 'apresentacao' },
  { peca: 'planilha', origem: 'controle' },
];

export function DossieNoLeitor({ ctx, mudar, avisar }: PropsDaSuperficie) {
  const [escolhidas, setEscolhidas] = useState<string[]>([]);
  const [pagina, setPagina] = useState(0);
  const [termo, setTermo] = useState('');
  const [aJuntar, setAJuntar] = useState<string[]>([]);
  const dossie = ctx.p.dossie;

  const pdfDa = (peca: typeof EXPORTAVEIS[number]['peca']): DocumentoPdf => {
    if (peca === 'documento') return pdfDoRegulamento(ctx.p);
    if (peca === 'apresentacao') return pdfDaApresentacao(ctx.p.apresentacao);
    return pdfDoControle(ctx.p.controle);
  };

  const combinar = () => {
    if (aJuntar.length < 2) { avisar('Escolha ao menos duas peças para combinar.'); return; }
    const docs = EXPORTAVEIS.filter(e => aJuntar.includes(e.peca)).map(e => pdfDa(e.peca));
    mudar(c => ({
      ...c,
      p: { ...c.p, dossie: juntar(docs, 'dossie-da-feira-2026-07-20-v01') },
    }));
    avisar('O dossiê foi combinado. Olhe o que entrou nele.');
  };

  const achados = dossie && termo.trim() !== '' ? procurar(dossie, termo) : [];

  return (
    <div className="pdf-janela">
      {dossie
        ? <BarraDeTitulo doc={dossie} />
        : <div className="pdf-titulo">Nenhum dossiê aberto</div>}

      <FaixaDoLeitor
        acoes={{
          /*
            Combinar é o gesto, e não um atalho nosso.

            A primeira versão oferecia um "exportar as duas e combinar" num
            clique, pendurado no comando Salvar da faixa — conveniência da
            plataforma dentro do programa imitado, que é o contrário do que a
            moldura existe para fazer. E ela apagava a decisão do requisito:
            escolher o que vai para fora.
          */
          aoCombinar: combinar,
          aoReconhecer: () => avisar('As páginas saíram do próprio programa: elas já têm camada de texto.'),
          aoComprimir: () => avisar('Comprimir existe no programa de verdade, e não faz parte deste exercício.'),
        }}
        procura={<CaixaDeProcurar termo={termo} achados={achados.length} aoMudar={setTermo} />}
      />

      <div className="pdf-corpo">
        <div className="pdf-lista">
          <p className="pdf-rotulo">Peças a combinar</p>
          {EXPORTAVEIS.map(e => (
            <label key={e.peca} className="pdf-linha">
              <input
                type="checkbox" checked={aJuntar.includes(e.peca)}
                onChange={() => setAJuntar(a =>
                  (a.includes(e.peca) ? a.filter(x => x !== e.peca) : [...a, e.peca]))}
              />
              <span className="pdf-linha-nome">{NOME_DA_PECA[e.peca]}</span>
              {!PECAS_DE_DISTRIBUICAO.includes(e.peca) && (
                <span className="pdf-sub">na pasta da tesouraria</span>
              )}
            </label>
          ))}
        </div>

        {dossie && (
          <>
            <PainelDeMiniaturas
              doc={dossie} escolhidas={escolhidas}
              aoEscolher={id => {
                setEscolhidas(a => (a.includes(id) ? a.filter(x => x !== id) : [id]));
                const i = dossie.paginas.findIndex(pg => pg.id === id);
                if (i >= 0) setPagina(i);
              }}
            />
            <div className="pdf-palco">
              {dossie.paginas[pagina] && <Folha pagina={dossie.paginas[pagina]} />}
            </div>
          </>
        )}

        {!dossie && (
          <div className="pdf-vazio">
            O dossiê ainda não existe. Exporte as peças e combine as que vão para fora.
          </div>
        )}
      </div>

      {dossie && (
        <ReguaDoLeitor
          doc={dossie} paginaAtual={pagina}
          extra={`Reúne: ${origensDoDossie(dossie).join(', ')}`}
        />
      )}
    </div>
  );
}
