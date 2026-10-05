/**
 * O Word da CC-ES012: o regulamento do módulo 2.
 *
 * A janela é a de `word.tsx`, a mesma da CC-ES002 e da AP042, pelo motivo
 * escrito lá. O que este arquivo decide é do **exercício**: que comandos a
 * faixa oferece e o que a lição cobra. O regulamento já chega formatado com
 * estilos e com sumário — produzi-lo é o que a CC-ES002 mediu —, então a faixa
 * daqui é curta de propósito: ela tem o que esta lição usa, e Arquivo não abre
 * bastidores porque não há o que exportar aqui.
 */

import { useState } from 'react';
import { Baseline, Link as LinkIcon, ListTree, Palette, Plus, Type } from 'lucide-react';
import {
  BarraDeTituloDoWord, BotaoDaFaixa, FolhaDoWord,
  GrupoDaFaixa, GuiasDoWord, ReguaDoWord,
} from './word';
import { titulosDoDoc } from './documento';
import { BLOCOS_DO_MAPA, comIdentidadeNoDocumento } from './metasDaCcEs012';
import { FAMILIA_DA_FONTE } from './projetoDocumental';
import type { PropsDaSuperficie } from './projetoNaPlataforma';

/*
  Os nomes são os do **Word**, e não os do Excel.

  A primeira guia do Word é "Início"; a do Excel é "Página Inicial". Escrever
  a do Excel aqui não estoura nada: a guia sai desenhada em cinza, avisando que
  não faz parte do exercício, e a faixa fica **vazia** — porque a condição que
  escolhe o grupo compara com um nome que nenhuma guia tem. Foi a trava que
  clica quem achou.
*/
const USAVEIS = ['Início', 'Inserir', 'Referências', 'Revisão', 'Exibir'];

/* ── Módulo 2: o regulamento ──────────────────────────────────────────────── */

export function RegulamentoNoWord({ ctx, mudar, avisar }: PropsDaSuperficie) {
  const [guia, setGuia] = useState('Início');
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const doc = ctx.p.documento;
  const temMapa = doc.blocos.some(b => b.id === 'b-mapa');

  return (
    <div className="wd-janela">
      <BarraDeTituloDoWord documento="regulamento-da-feira-2026-07-02-v03" aoAvisar={avisar} />
      <GuiasDoWord atual={guia} usaveis={USAVEIS} aoTrocar={setGuia} aoAvisar={avisar} />

      <div className="wd-faixa">
        {guia === 'Início' && (
          <>
            <GrupoDaFaixa nome="Fonte">
              <BotaoDaFaixa
                dica="Fonte do corpo do documento"
                rotulo={doc.fonte === undefined ? 'Fonte' : doc.fonte === 'serifada' ? 'Serifada' : 'Sem serifa'}
                empilhado
                aoClicar={() => {
                  mudar(c => ({
                    ...c,
                    p: {
                      ...c.p,
                      documento: {
                        ...c.p.documento,
                        fonte: FAMILIA_DA_FONTE[c.p.identidade.fonteDoCorpo],
                      },
                    },
                  }));
                  avisar(`O corpo passou para ${ctx.p.identidade.fonteDoCorpo}.`);
                }}
              >
                <Type className="w-4 h-4" />
              </BotaoDaFaixa>
            </GrupoDaFaixa>

            <GrupoDaFaixa nome="Estilos">
              <BotaoDaFaixa
                dica="Modificar Título 1: cor da fonte"
                rotulo="Título 1" empilhado
                aoClicar={() => {
                  mudar(c => ({
                    ...c,
                    p: {
                      ...c.p,
                      documento: {
                        ...c.p.documento,
                        estilos: {
                          ...c.p.documento.estilos,
                          'Título 1': {
                            ...c.p.documento.estilos?.['Título 1'],
                            cor: c.p.identidade.cor,
                          },
                        },
                      },
                    },
                  }));
                  avisar('Título 1 recebeu a cor do conjunto, e os cinco títulos mudaram de uma vez.');
                }}
              >
                <Palette className="w-4 h-4" />
              </BotaoDaFaixa>
              <BotaoDaFaixa
                dica="Modificar Título 1: fonte"
                rotulo="Fonte do título" empilhado
                aoClicar={() => {
                  mudar(c => ({ ...c, p: { ...c.p, documento: comIdentidadeNoDocumento(c.p.documento) } }));
                  avisar('Os títulos vestiram a identidade do conjunto.');
                }}
              >
                <Baseline className="w-4 h-4" />
              </BotaoDaFaixa>
            </GrupoDaFaixa>
          </>
        )}

        {guia === 'Inserir' && (
          <GrupoDaFaixa nome="Texto">
            <BotaoDaFaixa
              dica="Escrever a seção Onde está cada peça"
              rotulo="Seção nova" empilhado
              aoClicar={() => {
                if (temMapa) { avisar('A seção já está no documento.'); return; }
                mudar(c => ({
                  ...c,
                  p: {
                    ...c.p,
                    documento: { ...c.p.documento, blocos: [...c.p.documento.blocos, ...BLOCOS_DO_MAPA] },
                  },
                }));
                avisar('A seção entrou no fim do documento. O sumário continua com o que leu antes.');
              }}
            >
              <Plus className="w-4 h-4" />
            </BotaoDaFaixa>
          </GrupoDaFaixa>
        )}

        {guia === 'Referências' && (
          <GrupoDaFaixa nome="Sumário">
            <BotaoDaFaixa
              dica="Atualizar Sumário"
              rotulo="Atualizar" empilhado
              aoClicar={() => {
                mudar(c => ({
                  ...c,
                  p: { ...c.p, documento: { ...c.p.documento, sumario: titulosDoDoc(c.p.documento) } },
                }));
                avisar('O sumário passou a dizer o que o documento diz agora.');
              }}
            >
              <ListTree className="w-4 h-4" />
            </BotaoDaFaixa>
          </GrupoDaFaixa>
        )}

        {(guia === 'Revisão' || guia === 'Exibir') && (
          <GrupoDaFaixa nome={guia}>
            <BotaoDaFaixa
              dica="Esta lição não usa os comandos desta guia"
              rotulo="—" empilhado
              aoClicar={() => avisar('Esta lição não usa os comandos desta guia.')}
            >
              <LinkIcon className="w-4 h-4" />
            </BotaoDaFaixa>
          </GrupoDaFaixa>
        )}
      </div>

      <ReguaDoWord larguraCm={21} margemCm={2.5} />

      <FolhaDoWord
        doc={doc} selecionado={selecionado}
        aoEscolher={setSelecionado} aoClicarNoVazio={() => setSelecionado(null)}
      />
    </div>
  );
}
