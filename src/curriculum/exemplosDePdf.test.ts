import { describe, expect, it } from 'vitest';
import { MODULOS_DE_DOCUMENTOS_PORTATEIS } from './documentosPortateis';
import type { TopicoDeVereda } from './veredas';
import {
  assinarVerificavel, comprimir, copiarTexto, estadoDaAssinatura, extrair, juntar, pesoEscrito, pesoKb,
  preencher, proteger, procurar, qualidadeDaCaptura, reconhecerTexto, camposPorPreencher,
} from '../labs/documentoPdf';
import {
  ARQUIVOS_DE_ORIGEM, COMO_A_FOTO_CAI, exportarDeOrigem, pastaDoDossie, pastaDosFormularios, pastaParaAssinar,
  pastaDasFichas, reciboFotografado,
} from '../labs/dossieDoClube';
import {
  GINCANA, NOME_DA_FOTO_DA_NOTA, ORIGENS_DA_GINCANA, PESSOAS, QUEM_COMENTOU, comunicadoRecebido,
  inscricaoEmBranco, inscricaoPreenchida, termosDigitalizados,
} from '../exemplos/gincanaDaPrimavera';

/*
  O que as telas da CC-ES004 afirmam, conferido pelo motor do leitor de PDF.

  É a trava de `exemplosDePlanilha.test.ts`, pelo motivo escrito lá: a
  **conta** se faz aqui, sobre a pasta da gincana que as telas fotografam, e a
  **afirmação** se lê da legenda. Mudar a pasta sem refazer as telas reprova,
  porque a imagem continuaria mostrando a pasta antiga.

  E a última parte reprova se a gincana passar a dividir um arquivo ou uma
  linha com a pasta do acampamento, que é a do laboratório.
*/

const topicos = (): TopicoDeVereda[] =>
  MODULOS_DE_DOCUMENTOS_PORTATEIS.flatMap(m => m.licoes.flatMap(l => (l.tipo === 'teoria' ? l.topicos : [])));

function textoDoTopico(id: string): string {
  const t = topicos().find(x => x.id === id);
  if (!t) throw new Error(`O tópico ${id} sumiu da vereda.`);
  return [t.resumo, ...t.explicacao, t.exemplo ?? '', t.atencao ?? '', ...(t.telas ?? []).flatMap(x => [x.legenda, x.descricao])].join('\n');
}

const nivel = (q: number) => (q >= 0.98 ? 'bom' : q >= 0.6 ? 'medio' : 'ruim');

describe('as telas da CC-ES004 contam a pasta que fotografam', () => {
  const regulamento = exportarDeOrigem(ORIGENS_DA_GINCANA[0]);
  const termos = termosDigitalizados();

  it('quinze tópicos ensinam um gesto, e os quinze têm tela', () => {
    expect(topicos().filter(t => t.telas?.length)).toHaveLength(15);
    expect(topicos().some(t => t.exemplo)).toBe(false);
  });

  it('o regulamento tem 38 KB, os termos 9,0 MB, e a redução forte os leva a 2,0 MB', () => {
    expect(pesoEscrito(pesoKb(regulamento))).toBe('38 KB');
    expect(pesoEscrito(pesoKb(termos))).toBe('9,0 MB');
    expect(pesoEscrito(pesoKb(comprimir(termos, 'forte')))).toBe('2,0 MB');
    const texto = textoDoTopico('compressao');
    expect(texto).toContain('38 KB');
    expect(texto).toContain('9,0 MB');
    expect(texto).toContain('2,0 MB');
  });

  it('a procura acha o regulamento, não acha os termos, e acha os cinco depois de reconhecer', () => {
    expect(procurar(regulamento, 'inscrição')).toHaveLength(1);
    expect(procurar(termos, 'imagem')).toHaveLength(0);
    expect(procurar(reconhecerTexto(termos), 'imagem')).toHaveLength(5);
    expect(textoDoTopico('pesquisavel-ou-imagem')).toMatch(/1 página[\s\S]*nenhum resultado/);
    expect(textoDoTopico('comprovar')).toMatch(/cinco páginas[\s\S]*5 páginas/);
  });

  it('combinar dá três páginas, e a segunda é a da pontuação', () => {
    const tres = GINCANA.tresPdfs().pdfs;
    const combinado = juntar(tres, 'gincana-2026-09-19-v01.pdf');
    expect(combinado.paginas).toHaveLength(3);
    const so = extrair(combinado, [combinado.paginas[1].id], 'pontuacao-2026-09-19-v01.pdf');
    expect(so.paginas[0].linhas[0]).toMatch(/^Pontuação/);
    expect(textoDoTopico('juntar')).toMatch(/três páginas/);
    expect(textoDoTopico('extrair-e-dividir')).toMatch(/página 2[\s\S]*pontuação/);
  });

  it('a foto cai ruim, continua ruim reta e enquadrada, e só fica boa com o filtro', () => {
    expect(nivel(qualidadeDaCaptura(COMO_A_FOTO_CAI))).toBe('ruim');
    const reta = { ...COMO_A_FOTO_CAI, inclinacao: 0, margem: 0 };
    expect(nivel(qualidadeDaCaptura(reta))).toBe('ruim');
    expect(nivel(qualidadeDaCaptura({ ...reta, contraste: 96 }))).toBe('bom');
    expect(textoDoTopico('digitalizar-bem')).toMatch(/continua dizendo "escura"[\s\S]*Preto e branco/);
  });

  it('o formulário deixa marcados os dois obrigatórios por preencher', () => {
    let f = inscricaoEmBranco();
    f = preencher(preencher(f, 'nome', 'Rafael Moura'), 'unidade', 'Falcão');
    expect(camposPorPreencher(f).map(c => c.rotulo)).toEqual(['Tamanho da camiseta', 'Responsável']);
    expect(textoDoTopico('formulario')).toMatch(/a camiseta e o responsável/);
  });

  it('a pergunta na margem é de quem as telas dizem', () => {
    expect(comunicadoRecebido().anotacoes[0].por).toBe(QUEM_COMENTOU);
    expect(textoDoTopico('marcar-e-comentar')).toContain(QUEM_COMENTOU);
    expect(textoDoTopico('marcar-e-comentar')).toContain(PESSOAS.comenta);
  });

  it('a verificável é válida ao assinar e não confere depois de trocar a camiseta', () => {
    const assinada = assinarVerificavel(inscricaoPreenchida(), PESSOAS.assina, 0);
    expect(estadoDaAssinatura(assinada)).toBe('valida');
    expect(estadoDaAssinatura(preencher(assinada, 'camiseta', 'G'))).toBe('quebrada');
    expect(textoDoTopico('colada-ou-verificavel')).toMatch(/"não confere"/);
  });

  it('não permitir copiar não impede a cópia', () => {
    const protegida = proteger(inscricaoPreenchida(), { senha: 'falcao2026', pedeAoLeitor: { naoCopiar: true, naoImprimir: false } });
    expect(copiarTexto(protegida)).toMatch(/Ficha de inscrição/);
    expect(textoDoTopico('senha-nao-e-seguranca')).toMatch(/entrega o texto assim mesmo/);
  });

  it('a pasta do dossiê chega com os quatro nomes que a tela mostra', () => {
    const nomes = GINCANA.dossie().pdfs.map(d => d.nome);
    expect(nomes).toEqual(['Regulamento NOVO.pdf', 'pontos (2).pdf', NOME_DA_FOTO_DA_NOTA, 'scan termos.pdf']);
    expect(textoDoTopico('nomear')).toContain(NOME_DA_FOTO_DA_NOTA.replace('.pdf', ''));
  });
});

describe('a pasta da gincana não é a do laboratório', () => {
  const doLab = [
    ...ARQUIVOS_DE_ORIGEM.map(a => a.nome),
    ...ARQUIVOS_DE_ORIGEM.map(a => exportarDeOrigem(a).nome),
    ...pastaDasFichas().pdfs.map(d => d.nome),
    reciboFotografado().nome,
    ...pastaDosFormularios().pdfs.map(d => d.nome),
    ...pastaParaAssinar().pdfs.map(d => d.nome),
    ...pastaDoDossie().pdfs.map(d => d.nome),
    'IMG_20260702_143512.pdf',
  ];

  it('nenhum arquivo e nenhuma linha coincidem', () => {
    const daGincana = (Object.keys(GINCANA) as (keyof typeof GINCANA)[])
      .flatMap(k => [...GINCANA[k]().origens.map(a => a.nome), ...GINCANA[k]().pdfs.map(d => d.nome)]);
    expect(daGincana.length).toBeGreaterThan(10);
    expect(daGincana.filter(n => doLab.includes(n))).toEqual([]);

    const linhasDoLab = new Set([
      ...ARQUIVOS_DE_ORIGEM.flatMap(a => a.linhas),
      ...reciboFotografado().paginas.flatMap(p => p.linhas),
      ...pastaDosFormularios().pdfs.flatMap(d => d.paginas.flatMap(p => p.linhas)),
    ]);
    const linhasDaGincana = (Object.keys(GINCANA) as (keyof typeof GINCANA)[])
      .flatMap(k => GINCANA[k]().pdfs.flatMap(d => d.paginas.flatMap(p => p.linhas)));
    expect(linhasDaGincana.filter(l => linhasDoLab.has(l))).toEqual([]);
  });

  it('a teoria não cita a pasta do acampamento nem quem mora nela', () => {
    const teoria = topicos().map(t => textoDoTopico(t.id)).join('\n');
    const proibidos = [...doLab, 'Chácara Recanto', 'Filcia', 'Tia Rute', 'Marta Rocha', 'Ana Beatriz Rocha'];
    expect(proibidos.filter(p => teoria.includes(p))).toEqual([]);
  });
});
