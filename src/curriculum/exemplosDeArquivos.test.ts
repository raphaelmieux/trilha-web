import { describe, expect, it } from 'vitest';
import { MODULOS_DE_ARQUIVOS } from './arquivosEArmazenamento';
import type { TopicoDeVereda } from './veredas';
import { AREA, DOCUMENTOS, LIXEIRA, type No } from '../labs/arquivos';
import {
  BACKUP, DEZ_MAL_NOMEADOS, RELATORIO, SUMIU, VERSAO_PERDIDA, VERSAO_RASCUNHO, discoDoClube,
} from '../labs/discoDoClube';
import { NOMES_NA_AREA, PRESTACAO, SO_NA_COPIA, discoDaUnidade } from '../exemplos/discoDaUnidade';

/*
  O que as telas da CC-ES001 afirmam, conferido contra o disco que elas
  fotografam.

  As legendas dizem coisas que só valem enquanto o notebook da unidade Tucano
  for o que é: quatro fotos acham-se pela busca de imagem, a versão boa da
  prestação tem 96 KB, a planilha de preços só existe na cópia. Mexer no disco
  sem refazer as telas deixaria a legenda contando outra máquina — e é a
  legenda que a pessoa lê. É a trava de `exemplosDaDiagramacao.test.ts`, pelo
  motivo escrito lá: a **conta** se declara aqui, e a **afirmação** se lê da
  lição.

  E a última reprova se o notebook passar a dividir um arquivo com o
  computador do clube, ou se a teoria citar uma resposta do laboratório.
*/

const AGORA = Date.UTC(2026, 10, 1, 12);
const DISCO = discoDaUnidade(AGORA);

const topicos = (): TopicoDeVereda[] =>
  MODULOS_DE_ARQUIVOS.flatMap(m => m.licoes.flatMap(l => (l.tipo === 'teoria' ? l.topicos : [])));

/** O que a lição diz: a prosa e o que as telas dizem em legenda e descrição. */
function textoDoTopico(id: string): string {
  const t = topicos().find(x => x.id === id);
  if (!t) throw new Error(`O tópico ${id} sumiu da vereda.`);
  return [t.resumo, ...t.explicacao, t.exemplo ?? '', t.atencao ?? '', ...(t.telas ?? []).flatMap(x => [x.legenda, x.descricao])].join('\n');
}

const no = (nome: string, pai: string): No => {
  const achado = DISCO.find(n => n.nome === nome && n.paiId === pai);
  if (!achado) throw new Error(`${nome} não está mais onde as telas o fotografam.`);
  return achado;
};

/** Tudo o que mora abaixo de uma pasta, em qualquer nível — o alcance da busca. */
function abaixoDe(pasta: string): No[] {
  const filhos = DISCO.filter(n => n.paiId === pasta);
  return [...filhos, ...filhos.filter(n => n.tipo === 'pasta').flatMap(n => abaixoDe(n.id))];
}

describe('as telas da CC-ES001 contam o disco que fotografam', () => {
  it('onze tópicos ensinam um gesto, e os onze têm tela', () => {
    /* A guarda contra o vazio: uma vereda que perdesse as telas deixaria todas
       as outras travas verdes por não terem o que ler. */
    expect(topicos().filter(t => t.telas?.length).map(t => t.id)).toHaveLength(11);
    expect(topicos().some(t => t.exemplo)).toBe(false);
  });

  it('a Área de Trabalho tem os sete soltos, três deles versões do mesmo cartaz', () => {
    const naArea = DISCO.filter(n => n.paiId === AREA).map(n => n.nome);
    expect(naArea).toEqual([...NOMES_NA_AREA]);
    expect(naArea.filter(n => n.startsWith('cartaz bazar'))).toHaveLength(3);
    expect(textoDoTopico('arquivo-e-pasta')).toMatch(/Sete arquivos soltos.*três deles versões do mesmo cartaz/);
  });

  it('a busca de imagem a partir de Documentos acha as quatro fotos, dois níveis abaixo', () => {
    const imagens = abaixoDe(DOCUMENTOS).filter(n => n.nome.endsWith('.jpg'));
    expect(imagens).toHaveLength(4);
    expect(imagens.every(n => n.paiId === 'fotos-bazar')).toBe(true);
    expect(no('Fotos', 'bazar').paiId).toBe('bazar');
    expect(textoDoTopico('buscar')).toMatch(/Quatro resultados/);
    expect(textoDoTopico('buscar')).toMatch(/dois níveis abaixo/);
  });

  it('o anexo de extensão dupla mostra ".pdf" quando a extensão está escondida', () => {
    const anexo = no('lista de doacoes.pdf.exe', AREA);
    /* O Explorador esconde só o último pedaço: o que sobra termina em .pdf. */
    expect(anexo.nome.replace(/\.[^.]+$/, '')).toBe('lista de doacoes.pdf');
    expect(textoDoTopico('ver-a-extensao')).toContain('lista de doacoes.pdf.exe');
  });

  it('por data, o cartaz bazar vem antes da cópia (1), e o FINAL só depois das fotos', () => {
    const data = (nome: string) => no(nome, AREA).modificadoEm;
    expect(data('cartaz bazar.docx')).toBeLessThan(data('cartaz bazar (1).docx'));
    expect(data('cartaz bazar (1).docx')).toBeLessThan(data(NOMES_NA_AREA[0]));
    expect(data(NOMES_NA_AREA[0])).toBeLessThan(data('cartaz bazar FINAL.docx'));
    expect(textoDoTopico('ordenar')).toMatch(/o FINAL só depois das fotos/);
  });

  it('o nome novo da foto começa pela data que o WhatsApp escreveu', () => {
    const data = NOMES_NA_AREA[0].match(/\d{4}-\d{2}-\d{2}/)![0];
    expect(textoDoTopico('nome-que-ordena')).toContain(`${data}-bazar-`);
  });

  it('o troco do caixa vai para a Lixeira com o tamanho que tinha', () => {
    expect(no('troco do caixa.txt', AREA).tamanhoKb).toBe(2);
    expect(textoDoTopico('excluir-nao-e-apagar')).toMatch(/2 KB/);
  });

  it('a planilha de preços só existe na cópia de segurança', () => {
    expect(DISCO.filter(n => n.nome === SO_NA_COPIA).map(n => n.paiId)).toEqual([BACKUP]);
    expect(textoDoTopico('restaurar')).toMatch(/só sobrou na Cópia de Segurança/);
  });

  it('a prestação tem 14 KB agora, e a versão completa tem 96', () => {
    const prestacao = no(PRESTACAO, 'bazar');
    expect(prestacao.tamanhoKb).toBe(14);
    expect(prestacao.versoes?.[0]?.tamanhoKb).toBe(96);
    expect(prestacao.versoes?.[1]?.tamanhoKb).toBe(40);
    const texto = textoDoTopico('versao-anterior');
    expect(texto).toMatch(/a completa tem 96 KB, e a de agora, 14/);
    expect(texto).toMatch(/de 40 KB/);
  });
});

describe('o notebook da unidade não é o computador do laboratório', () => {
  const RAIZES = new Set([AREA, DOCUMENTOS, LIXEIRA, BACKUP]);
  const nomesDoLab = new Set(discoDoClube(AGORA).filter(n => !RAIZES.has(n.id)).map(n => n.nome));

  it('nenhum arquivo ou pasta do notebook tem o nome de um do clube', () => {
    const daUnidade = DISCO.filter(n => !RAIZES.has(n.id)).map(n => n.nome);
    expect(daUnidade.length).toBeGreaterThan(10);
    expect(nomesDoLab.size).toBeGreaterThan(10);
    expect(daUnidade.filter(n => nomesDoLab.has(n))).toEqual([]);
  });

  it('a teoria não cita um nome que o laboratório cobra', () => {
    const teoria = topicos().map(t => textoDoTopico(t.id)).join('\n');
    const respostas = [...DEZ_MAL_NOMEADOS, RELATORIO, SUMIU, VERSAO_PERDIDA, VERSAO_RASCUNHO, 'Fotos do Acampamento'];
    expect(respostas.filter(r => teoria.includes(r))).toEqual([]);
  });
});
