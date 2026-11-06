import { describe, expect, it } from 'vitest';
import { MODULOS_DE_DADOS } from './dadosEFormularios';
import type { TopicoDeVereda } from './veredas';
import {
  RESPOSTAS_COLETADAS, comCampo, enviar, formularioDeInscricao, recusas, respostasReais, valorDa,
} from '../labs/formulario';
import { LISTA_DO_CLUBE } from '../labs/metasDaAp044';
import { abaDe } from '../labs/cadernoDoClube';
import { contaDaSelecao } from '../labs/planilha';
import { ABA_RELATORIO, ABA_RESPOSTAS } from '../labs/metasDaCcEs008';
import {
  CAMISETA_TELEFONE, CAMISETA_VALOR, ENCOMENDAS, INSTRUTORES, csvDaCamiseta, encomendaArrumada,
  pastaComResumo, pastaConsertada, pastaLimpa,
} from '../exemplos/camisetaDoClube';

/*
  O que as telas da CC-ES008 afirmam, conferido pelos motores do formulário,
  da planilha e do CSV.

  É a trava de `exemplosDaComunicacao.test.ts`, pelo motivo escrito lá: a
  **conta** se faz aqui, sobre a encomenda da camiseta que as telas
  fotografam, e a **afirmação** se lê da legenda. Mudar a encomenda sem refazer
  as telas reprova, porque a imagem continuaria mostrando a antiga.

  E a última parte reprova se a encomenda passar a dividir uma pessoa, um
  telefone ou um endereço com a inscrição do acampamento ou com a agenda das
  famílias, que são as do laboratório.
*/

const topicos = (): TopicoDeVereda[] =>
  MODULOS_DE_DADOS.flatMap(m => m.licoes.flatMap(l => (l.tipo === 'teoria' ? l.topicos : [])));

function textoDoTopico(id: string): string {
  const t = topicos().find(x => x.id === id);
  if (!t) throw new Error(`O tópico ${id} sumiu da vereda.`);
  return [t.resumo, ...t.explicacao, t.exemplo ?? '', t.atencao ?? '', ...(t.telas ?? []).flatMap(x => [x.legenda, x.descricao])].join('\n');
}

const valorPorNome = (nome: string, campo: string) =>
  valorDa(ENCOMENDAS.find(r => valorDa(r, 'nome') === nome)!, campo);

describe('as telas da CC-ES008 contam a encomenda que fotografam', () => {
  it('vinte e dois tópicos ensinam um gesto, e os três do dado pessoal ficam em prosa', () => {
    expect(topicos().filter(t => t.telas?.length)).toHaveLength(22);
    for (const id of ['o-que-e-dado-pessoal', 'guarda', 'descarte']) {
      expect(topicos().find(t => t.id === id)?.telas).toBeUndefined();
    }
    expect(topicos().some(t => t.exemplo)).toBe(false);
  });

  it('catorze encomendas, e duas Kátia Nunes que só o instante e a unidade separam', () => {
    expect(respostasReais(encomendaArrumada())).toHaveLength(14);
    const katias = ENCOMENDAS.filter(r => valorDa(r, 'nome') === 'Kátia Nunes');
    expect(katias).toHaveLength(2);
    expect(new Set(katias.map(r => r.em)).size).toBe(2);
    expect(katias.map(r => valorDa(r, 'unidade'))).toEqual(['Águia', 'Falcão']);
    expect(textoDoTopico('chave')).toMatch(/2026-08-06T17:14[\s\S]*2026-08-06T19:52[\s\S]*Águia e Falcão/);
  });

  it('o Lucas chegou sem telefone, e ligar o obrigatório não o preenche', () => {
    const f = comCampo(encomendaArrumada(), CAMISETA_TELEFONE, c => ({ ...c, obrigatorio: true }));
    expect(valorPorNome('Lucas Brandão', CAMISETA_TELEFONE)).toBe('');
    expect(recusas(f, { nome: 'Natan Pires' })).toEqual(['Telefone do responsável: é obrigatório']);
    expect(textoDoTopico('campo-obrigatorio')).toContain('Telefone do responsável: é obrigatório');
  });

  it('a validação de telefone recusa os números soltos, e a faixa de 30 a 120 recusa 375', () => {
    const tel = comCampo(encomendaArrumada(), CAMISETA_TELEFONE, c => ({ ...c, validacao: { tipo: 'telefone' } }));
    expect(recusas(tel, { [CAMISETA_TELEFONE]: '61981234599' })[0]).toContain('use o formato (61) 99999-0000');
    expect(textoDoTopico('telefone-parece-numero')).toContain('use o formato (61) 99999-0000');

    const faixa = comCampo(encomendaArrumada(), CAMISETA_VALOR, c => ({ ...c, validacao: { tipo: 'numero-entre', min: 30, max: 120 } }));
    expect(recusas(faixa, { [CAMISETA_VALOR]: '375' })[0]).toContain('precisa estar entre 30 e 120');
    expect(enviar(faixa, { [CAMISETA_VALOR]: '37,5' })).not.toBeNull();
    expect(textoDoTopico('o-que-e-validacao')).toContain('precisa estar entre 30 e 120');
  });

  it('o resumo relata onze grupos para seis unidades, com o (vazio) e os dois Jaguar', () => {
    const r = abaDe(pastaComResumo(), ABA_RELATORIO).resumo!;
    const rotulos = r.retrato.map(l => l.rotulo);
    expect(rotulos).toEqual(['Tucano', 'tucano', 'Águia', 'Onca', 'Onça', 'TUCANO', 'Arara', '(vazio)', 'Jaguar', 'Falcão', 'Jaguar ']);
    expect(textoDoTopico('agrupa-pelo-escrito')).toContain('onze linhas');
    expect(textoDoTopico('o-que-e-tabela-dinamica')).toContain('Tucano 1, tucano 1, Águia 2, Onca 1, Onça 1, TUCANO 1, Arara 1, (vazio) 1, Jaguar 1, Falcão 3 e Jaguar 1');
  });

  it('consertada a base, o resumo dá uma linha por unidade, com o Heitor na Arara', () => {
    const r = abaDe(pastaConsertada(), ABA_RELATORIO).resumo!;
    expect(r.retrato.map(l => l.rotulo).sort((a, b) => a.localeCompare(b, 'pt-BR'))).toEqual(['Águia', 'Arara', 'Falcão', 'Jaguar', 'Onça', 'Tucano']);
    expect(textoDoTopico('arrumar-nao-e-apagar')).toContain('Arara');
  });

  it('o 37.5 fica fora da soma: 562,50 antes e 600 depois', () => {
    const base = abaDe(pastaLimpa(), ABA_RESPOSTAS);
    const antes = contaDaSelecao(base, { l1: 1, c1: 4, l2: 14, c2: 4 })!;
    expect(antes).toMatchObject({ contagem: 14, soma: 562.5 });
    const depois = contaDaSelecao(abaDe(pastaConsertada(), ABA_RESPOSTAS), { l1: 1, c1: 4, l2: 14, c2: 4 })!;
    expect(depois).toMatchObject({ contagem: 14, soma: 600 });
    expect(textoDoTopico('numero-que-e-texto')).toMatch(/Contagem 14 e Soma 562,50[\s\S]*Soma 600/);
  });

  it('o CSV sai com ponto e vírgula, a vírgula decimal intacta, e aspas na resposta da Íris', () => {
    const csv = csvDaCamiseta();
    expect(csv.split(/\r?\n/)[1]).toBe('2026-08-03T18:05;Alice Fontes;Tucano;(61) 98123-4501;37,5;M');
    expect(csv).toContain('"M; manga longa, se tiver"');
    expect(textoDoTopico('o-separador')).toContain('2026-08-03T18:05;Alice Fontes;Tucano;(61) 98123-4501;37,5;M');
    expect(textoDoTopico('as-aspas')).toContain('"M; manga longa, se tiver"');
  });

  it('a agenda dos instrutores começa no Rogério, e em ordem de nome começa no Augusto', () => {
    const nomes = INSTRUTORES.map(l => l[0]);
    expect(nomes[0]).toBe('Rogério Paiva');
    expect([...nomes].sort((a, b) => a.localeCompare(b, 'pt-BR'))[0]).toBe('Augusto Leme');
    expect(textoDoTopico('linha-inteira')).toContain(INSTRUTORES.find(l => l[0] === 'Augusto Leme')!.join(', '));
  });
});

describe('a encomenda da camiseta não é a inscrição do acampamento', () => {
  it('nenhuma pessoa, telefone ou endereço coincide', () => {
    const doLab = new Set([
      ...RESPOSTAS_COLETADAS.flatMap(r => Object.values(r.valores)),
      ...formularioDeInscricao().campos.map(c => c.rotulo),
      ...LISTA_DO_CLUBE.flat(),
    ].filter(v => v.trim().length > 3));
    const daqui = [
      ...ENCOMENDAS.flatMap(r => [valorDa(r, 'nome'), valorDa(r, CAMISETA_TELEFONE)]),
      ...INSTRUTORES.flat(),
    ].filter(Boolean);
    expect(daqui.length).toBeGreaterThan(40);
    expect(daqui.filter(x => doLab.has(x))).toEqual([]);
  });

  it('a teoria não cita a inscrição do acampamento', () => {
    const teoria = topicos().map(t => textoDoTopico(t.id)).join('\n');
    const proibidos = ['falcao', 'FALCÃO', 'Eduarda', '1.5', '2.5', 'diárias', 'Paula', 'acampamento de inverno',
      'dez unidades', 'dezesseis'];
    expect(proibidos.filter(p => teoria.includes(p))).toEqual([]);
  });
});
