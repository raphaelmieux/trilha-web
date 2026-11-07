import { describe, expect, it } from 'vitest';
import { MODULOS_DO_PROJETO } from './projetoDocumental';
import type { TopicoDeVereda } from './veredas';
import { textoDoBloco } from '../labs/documento';
import { planilhaPorNome, valorCalculado } from '../labs/planilha';
import { mostrar } from '../labs/formulas';
import { contrastRatio } from '../lib/imageTools';
import { importarRespostas, NOME_DA_ABA_DE_CONTROLE, pastasForaDoPadrao } from '../labs/projetoDocumental';
import {
  comContasSobreAsRespostas, comFormularioArrumado, comPastasNoPadrao, comTotalEmFormula, DOSSIE_DAS_DUAS,
  origensDoDossie,
} from '../labs/metasDaCcEs012';
import { procurar } from '../labs/documentoPdf';
import {
  APRESENTACAO_INICIAL, FORMULARIO_INICIAL, INSCRICOES_DA_FEIRA, NUVEM_DA_FEIRA, PROJETO_DA_FEIRA,
  REGULAMENTO_INICIAL, RESPOSTAS_DA_FEIRA,
} from '../labs/projetoDaFeira';
import {
  BARRACAS, CONTEUDO_DAS_PORTAS, IDENTIDADE_DAS_PORTAS, MAPA_DAS_PORTAS, PASTAS_COMO_CHEGAM, PORTAS_COMO_CHEGAM,
  RESPOSTAS_DAS_PORTAS, TOTAL_DIGITADO,
} from '../exemplos/conjuntoDasPortas';
import { LARANJA_DO_CARTAZ } from '../exemplos/diaDePortasAbertas';

/*
  O que as telas da CC-ES012 afirmam, conferido pelos motores do conjunto.

  É a trava de `exemplosDasApresentacoes.test.ts`, pelo motivo escrito lá: a
  **conta** se faz aqui, sobre o conjunto do Dia de Portas Abertas que as telas
  fotografam, e a **afirmação** se lê da legenda. Mudar o conjunto sem refazer
  as telas reprova, porque a imagem continuaria mostrando o antigo.

  E a última parte reprova se o conjunto passar a dividir uma linha do
  regulamento, uma resposta, um slide ou um nome de pasta com a feira, que é o
  conjunto do laboratório.
*/

const topicos = (): TopicoDeVereda[] =>
  MODULOS_DO_PROJETO.flatMap(m => m.licoes.flatMap(l => (l.tipo === 'teoria' ? l.topicos : [])));

function textoDoTopico(id: string): string {
  const t = topicos().find(x => x.id === id);
  if (!t) throw new Error(`O tópico ${id} sumiu da vereda.`);
  return [t.resumo, ...t.explicacao, t.exemplo ?? '', t.atencao ?? '', ...(t.telas ?? []).flatMap(x => [x.legenda, x.descricao])].join('\n');
}

/* Os estados que as cenas fotografam, refeitos pelas mesmas derivações. */
const comFormulario = {
  ...PORTAS_COMO_CHEGAM,
  controle: comTotalEmFormula(PORTAS_COMO_CHEGAM.controle),
  formulario: comFormularioArrumado(PORTAS_COMO_CHEGAM.formulario, CONTEUDO_DAS_PORTAS, IDENTIDADE_DAS_PORTAS),
};
const importado = importarRespostas(comFormulario);
const comContas = { ...importado, controle: comContasSobreAsRespostas(importado.controle) };
const naControle = (p: typeof PORTAS_COMO_CHEGAM, celula: [number, number]) =>
  mostrar(valorCalculado(planilhaPorNome(p.controle, NOME_DA_ABA_DE_CONTROLE)!, celula[0], celula[1], p.controle));

describe('as telas da CC-ES012 contam o Dia de Portas Abertas que fotografam', () => {
  it('dezesseis tópicos ensinam um gesto, e os da proposta e da demonstração ficam em prosa', () => {
    expect(topicos().filter(t => t.telas?.length)).toHaveLength(16);
    for (const id of ['a-proposta-vem-antes', 'o-que-conta-como-pronto', 'demonstrar-e-mostrar-o-conjunto-reagindo']) {
      expect(topicos().find(t => t.id === id)?.telas).toBeUndefined();
    }
    expect(topicos().some(t => t.exemplo)).toBe(false);
  });

  it('o total chega digitado em 135, e com as respostas lidas passa a 5, 23 e 225', () => {
    expect(TOTAL_DIGITADO).toBe(135);
    expect(naControle(PORTAS_COMO_CHEGAM, [5, 1])).toBe('135');
    expect(textoDoTopico('numero-guardado-nao-responde-por-hoje')).toMatch(/135[\s\S]*=B3\*B5/);
    expect([naControle(comContas, [2, 1]), naControle(comContas, [3, 1]), naControle(comContas, [5, 1])])
      .toEqual(['5', '23', '225']);
    expect(textoDoTopico('a-formula-faz-a-importacao-valer')).toMatch(/5 e 23[\s\S]*225/);
  });

  it('são cinco barracas, e o gráfico colado mostra três', () => {
    expect(BARRACAS).toHaveLength(5);
    expect(BARRACAS.reduce((t, b) => t + b.quantos, 0)).toBe(23);
    const colado = PORTAS_COMO_CHEGAM.apresentacao.slides.find(s => s.grafico)?.grafico;
    expect(colado?.retrato).toHaveLength(3);
    expect(CONTEUDO_DAS_PORTAS.retratoVinculado).toHaveLength(5);
    expect(textoDoTopico('as-quatro-maneiras-de-um-numero-chegar')).toMatch(/três barracas[\s\S]*cinco barracas/);
    expect(textoDoTopico('uma-fonte-da-verdade')).toContain('três barracas; quem lê a planilha diz cinco');
  });

  it('o laranja do cartaz mede 2,45:1, e a identidade é o laranja escurecido', () => {
    expect(contrastRatio(LARANJA_DO_CARTAZ, '#FFFFFF').toFixed(2).replace('.', ',')).toBe('2,45');
    expect(IDENTIDADE_DAS_PORTAS.cor).not.toBe(LARANJA_DO_CARTAZ);
    expect(textoDoTopico('o-conjunto-tem-uma-cara')).toContain('2,45:1');
  });

  it('as respostas de antes trazem a quantidade como se fala', () => {
    const quantos = RESPOSTAS_DAS_PORTAS.map(r => r.valores.quantos);
    expect(quantos.slice(0, 2)).toEqual(['quatro', 'uns 6']);
    expect(textoDoTopico('o-tipo-do-campo-impede-a-resposta-errada')).toMatch(/"quatro"[\s\S]*"uns 6"/);
  });

  it('a seção nova nomeia as outras peças, e o sumário gerado antes não a tem', () => {
    expect(textoDoBloco(MAPA_DAS_PORTAS[0])).toBe('Onde estão as outras peças');
    const sumario = PORTAS_COMO_CHEGAM.documento.sumario ?? [];
    expect(sumario.map(i => i.texto)).not.toContain('Onde estão as outras peças');
    expect(sumario).toHaveLength(6);
    expect(textoDoTopico('a-peca-que-se-encontra-primeiro')).toMatch(/seis títulos[\s\S]*sétima linha/);
  });

  it('o dossiê de duas peças tem cinco páginas, e acha a escola em duas', () => {
    const d = DOSSIE_DAS_DUAS(comContas, CONTEUDO_DAS_PORTAS);
    expect(d.paginas).toHaveLength(5);
    expect(origensDoDossie(d)).toEqual(['regulamento', 'apresentacao']);
    expect(procurar(d, 'Monteiro Lobato')).toHaveLength(2);
    expect(textoDoTopico('pesquisavel-se-nasce-do-programa')).toContain('2 páginas');
  });

  it('as quatro pastas chegam fora do padrão, e a renomeação as põe num molde', () => {
    expect(pastasForaDoPadrao(PORTAS_COMO_CHEGAM)).toHaveLength(4);
    const n = comPastasNoPadrao(PORTAS_COMO_CHEGAM.nuvem, CONTEUDO_DAS_PORTAS.nomesDasPastas);
    expect(pastasForaDoPadrao({ ...PORTAS_COMO_CHEGAM, nuvem: n })).toHaveLength(0);
    for (const nome of Object.values(PASTAS_COMO_CHEGAM)) {
      expect(textoDoTopico('pasta-com-nome-que-ordena')).toContain(nome);
    }
  });
});

describe('o Dia de Portas Abertas não é a feira', () => {
  const linhas = (blocos: Parameters<typeof textoDoBloco>[0][]) => blocos.map(b => textoDoBloco(b));

  it('nenhuma linha, resposta, slide ou pasta coincide', () => {
    const daFeira = new Set([
      ...linhas(REGULAMENTO_INICIAL.blocos),
      ...FORMULARIO_INICIAL.campos.map(c => c.rotulo),
      ...RESPOSTAS_DA_FEIRA.flatMap(r => Object.values(r.valores)),
      ...APRESENTACAO_INICIAL.slides.flatMap(s => [s.titulo, ...s.topicos]),
      ...NUVEM_DA_FEIRA.arquivos.map(a => a.nome),
      ...INSCRICOES_DA_FEIRA.flatMap(i => [i.especialidade, i.responsavel]),
    ]);
    const daqui = [
      ...linhas(PORTAS_COMO_CHEGAM.documento.blocos),
      ...linhas(MAPA_DAS_PORTAS),
      ...PORTAS_COMO_CHEGAM.formulario.campos.map(c => c.rotulo),
      ...RESPOSTAS_DAS_PORTAS.flatMap(r => Object.values(r.valores)),
      ...PORTAS_COMO_CHEGAM.apresentacao.slides.flatMap(s => [s.titulo, ...s.topicos]),
      ...PORTAS_COMO_CHEGAM.nuvem.arquivos.map(a => a.nome),
      ...BARRACAS.flatMap(b => [b.barraca, b.responsavel]),
    /* Número curto coincide por acaso — 5 voluntários aqui e lá —, e não é resposta de nada. */
    ].filter(x => x.length > 3);
    expect(daqui.length).toBeGreaterThan(50);
    expect(daqui.filter(x => daFeira.has(x))).toEqual([]);
    expect(PROJETO_DA_FEIRA.identidade.cor).not.toBe(IDENTIDADE_DAS_PORTAS.cor);
  });

  it('a teoria não cita a feira, nem os números de outra vereda', () => {
    const teoria = topicos().map(t => textoDoTopico(t.id)).join('\n');
    const proibidos = ['feira', 'Feira', 'estande', 'Onde está cada peça', 'documentos_feira', 'divulgacao-v2-final',
      'CONTAS DA FEIRA', '240', '"seis"', '5 ou 6', 'B4 * 45', 'B4 vezes 45', 'diária', '2,42', 'ouro do emblema',
      'Nós e amarras', 'Tio Márcio'];
    expect(proibidos.filter(p => teoria.includes(p))).toEqual([]);
  });
});
