import { describe, expect, it } from 'vitest';
import { MODULOS_DO_COMPARTILHADO } from './trabalhoCompartilhado';
import type { TopicoDeVereda } from './veredas';
import {
  abertosPelaPasta, conflitoDeSincronizacao, copiasEmConflito, mandarPorAnexo, nuvemDoClube, papelDe,
  restaurarVersao, transferirPropriedade,
} from '../labs/arquivoCompartilhado';
import { textoDoDoc } from '../labs/documento';
import { nuvemDaFanfarra, REPERTORIO_SEM_REDE } from '../exemplos/nuvemDaFanfarra';

/*
  O que as telas da CC-ES006 afirmam, conferido pelo motor da nuvem.

  É a trava de `exemplosDaComunicacao.test.ts`, pelo motivo escrito lá: a
  **conta** se faz aqui, sobre a pasta da fanfarra que as telas fotografam, e
  a **afirmação** se lê da legenda.

  E a última parte reprova se a pasta da fanfarra passar a dividir um arquivo
  ou uma linha com a nuvem do acampamento, que é a do laboratório.
*/

const topicos = (): TopicoDeVereda[] =>
  MODULOS_DO_COMPARTILHADO.flatMap(m => m.licoes.flatMap(l => (l.tipo === 'teoria' ? l.topicos : [])));

function textoDoTopico(id: string): string {
  const t = topicos().find(x => x.id === id);
  if (!t) throw new Error(`O tópico ${id} sumiu da vereda.`);
  return [t.resumo, ...t.explicacao, t.exemplo ?? '', t.atencao ?? '', ...(t.telas ?? []).flatMap(x => [x.legenda, x.descricao])].join('\n');
}

describe('as telas da CC-ES006 contam a pasta que fotografam', () => {
  const n = nuvemDaFanfarra();
  const arq = (id: string) => n.arquivos.find(a => a.id === id)!;

  it('dezesseis tópicos ensinam um gesto, e o combinado fica em prosa', () => {
    expect(topicos().filter(t => t.telas?.length)).toHaveLength(16);
    expect(topicos().find(t => t.id === 'o-combinado')?.telas).toBeUndefined();
    expect(topicos().some(t => t.exemplo)).toBe(false);
  });

  it('o anexo vira a cópia da Cleide', () => {
    const depois = mandarPorAnexo(n, 'uniformes', 'cleide', 'agora mesmo');
    const copia = depois.arquivos.find(a => a.copiaDe === 'uniformes')!;
    expect(copia.dono).toBe('cleide');
    expect(textoDoTopico('os-dois-problemas')).toContain('Uniformes da fanfarra (cópia de Cleide)');
  });

  it('a planilha dos telefones não tem acesso próprio e três pessoas a abrem pela pasta', () => {
    expect(arq('telefones').acessos).toEqual([]);
    const pela = abertosPelaPasta(n).find(x => x.arquivo.id === 'telefones')!;
    expect(pela.quem.sort()).toEqual(['cleide', 'ronaldo', 'voce']);
    expect(papelDe(n, 'telefones', 'cleide')).toBe('leitor');
    expect(papelDe(n, 'telefones', 'ronaldo')).toBe('editor');
    expect(textoDoTopico('a-heranca')).toContain('3 pessoas têm acesso pela pasta Fanfarra');
  });

  it('a versão de 4 de agosto tem as decisões, a de agora não, e restaurar soma uma', () => {
    const ata = arq('ata-fanfarra');
    const v2 = ata.versoes.find(v => v.quando.startsWith('4 de agosto'))!;
    expect(textoDoDoc(v2.doc!)).toContain('Decidido:');
    expect(textoDoDoc(ata.versoes[ata.versoes.length - 1].doc!)).not.toContain('Decidido:');
    const depois = restaurarVersao(n, 'ata-fanfarra', v2.id, 'voce', 'agora mesmo');
    expect(depois.arquivos.find(a => a.id === 'ata-fanfarra')!.versoes).toHaveLength(4);
    expect(textoDoTopico('restaurar-nao-apaga')).toMatch(/4 de agosto[\s\S]*Decidido/);
  });

  it('o conflito da Marta vira uma cópia com o nome dela', () => {
    const depois = conflitoDeSincronizacao(n, 'repertorio', 'marta', REPERTORIO_SEM_REDE(), 'agora mesmo');
    expect(copiasEmConflito(depois).map(a => a.nome)).toEqual(['Repertório do Encontro (cópia em conflito de Marta)']);
    expect(textoDoTopico('onde-ele-nasce')).toContain('Repertório do Encontro (cópia em conflito de Marta)');
  });

  it('transferir deixa quem entregou como editor', () => {
    const depois = transferirPropriedade(n, 'uniformes', 'ronaldo');
    expect(depois.arquivos.find(a => a.id === 'uniformes')!.dono).toBe('ronaldo');
    expect(papelDe(depois, 'uniformes', 'voce')).toBe('editor');
  });
});

describe('a pasta da fanfarra não é a nuvem do acampamento', () => {
  it('nenhum arquivo e nenhuma linha coincidem', () => {
    const lab = nuvemDoClube();
    const nomesDoLab = new Set(lab.arquivos.flatMap(a => [a.id, a.nome]));
    const linhasDoLab = new Set(lab.arquivos.flatMap(a => a.versoes.flatMap(v => (v.doc ? textoDoDoc(v.doc).split('\n') : []))));
    const fanfarra = nuvemDaFanfarra();
    const nomes = fanfarra.arquivos.flatMap(a => [a.id, a.nome]);
    const linhas = fanfarra.arquivos.flatMap(a => a.versoes.flatMap(v => (v.doc ? textoDoDoc(v.doc).split('\n') : [])));
    expect(linhas.length).toBeGreaterThan(10);
    expect(nomes.filter(x => nomesDoLab.has(x))).toEqual([]);
    expect(linhas.filter(x => x.trim() && linhasDoLab.has(x))).toEqual([]);
  });

  it('a teoria não cita a nuvem do acampamento', () => {
    const teoria = topicos().map(t => textoDoTopico(t.id)).join('\n');
    const proibidos = ['Fichas médicas', 'Escala das unidades', 'Lista de materiais', 'Ata da reunião de junho',
      'Combinado do acampamento', 'dia 17', '45 reais', 'Onça', 'dado de saúde'];
    expect(proibidos.filter(p => teoria.includes(p))).toEqual([]);
  });
});
