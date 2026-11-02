import { describe, expect, it } from 'vitest';
import { MODULOS_DA_COMUNICACAO } from './comunicacaoEAgenda';
import type { TopicoDeVereda } from './veredas';
import {
  LIMITE_DE_ANEXO, MENSAGENS_DO_CLUBE, FALCAO, AGUIA, arquivar, buscar, cabeNoAnexo, caixaDoClube,
  enderecosQueCadaUmVe, expandir,
} from '../labs/correspondencia';
import {
  CONVIDADOS_DA_REUNIAO, FUSO_DE_BRASILIA, agendaDoClube, estadoEm, horaPara, naoChegaram, ocorrencias,
} from '../labs/agenda';
import { reuniaoDoConselho } from '../labs/reuniaoRemota';
import { ENDERECO_ERRADO as ERRADO_DO_LAB, reuniaoComConviteErrado } from '../labs/metasDaCcEs007';
import {
  ARQUIVO_GRANDE, CLUBES_DA_REGIAO, CONVERSA_COM_O_ACRE, DIA_DA_GRADE, ENDERECO_ERRADO, ENSAIO_GERAL,
  ENSAIO_SEMANAL, MUSICOS, NA_FANFARRA, NA_LISTA, OTAVIO_SO_DEPOIS_DE, PALAVRA_DA_BUSCA, PESSOAS_DA_GRADE,
  agendaDaFanfarra, caixaDaFanfarra, salaDaFanfarra,
} from '../exemplos/fanfarraDoClube';

/*
  O que as telas da CC-ES007 afirmam, conferido pelos motores do correio e da
  agenda.

  É a trava de `exemplosDeContas.test.ts`, pelo motivo escrito lá: a **conta**
  se faz aqui, sobre a fanfarra que as telas fotografam, e a **afirmação** se
  lê da legenda. Mudar a fanfarra sem refazer as telas reprova, porque a
  imagem continuaria mostrando a antiga.

  E a última parte reprova se a fanfarra passar a dividir uma mensagem, uma
  pessoa, um evento ou um endereço com o acampamento, que é o do laboratório.
*/

const topicos = (): TopicoDeVereda[] =>
  MODULOS_DA_COMUNICACAO.flatMap(m => m.licoes.flatMap(l => (l.tipo === 'teoria' ? l.topicos : [])));

function textoDoTopico(id: string): string {
  const t = topicos().find(x => x.id === id);
  if (!t) throw new Error(`O tópico ${id} sumiu da vereda.`);
  return [t.resumo, ...t.explicacao, t.exemplo ?? '', t.atencao ?? '', ...(t.telas ?? []).flatMap(x => [x.legenda, x.descricao])].join('\n');
}

describe('as telas da CC-ES007 contam a fanfarra que fotografam', () => {
  const caixa = caixaDaFanfarra();
  const agenda = agendaDaFanfarra();
  const evento = (id: string) => agenda.eventos.find(e => e.id === id)!;

  it('os vinte e quatro tópicos ensinam um gesto, e todos têm tela', () => {
    expect(topicos()).toHaveLength(24);
    expect(topicos().filter(t => t.telas?.length)).toHaveLength(24);
    expect(topicos().some(t => t.exemplo)).toBe(false);
  });

  it('o convite do Encontro mostra 23 clubes no Cc', () => {
    const convite = caixa.mensagens.find(m => m.id === 'encontro')!;
    expect(convite.cc).toHaveLength(23);
    expect(enderecosQueCadaUmVe(caixa, convite)).toBeGreaterThanOrEqual(23);
    expect(textoDoTopico('os-tres-campos')).toMatch(/23 endereços[\s\S]*24 endereços/);
    expect(CLUBES_DA_REGIAO).toHaveLength(24);
  });

  it('a gravação passa do limite do anexo', () => {
    expect(cabeNoAnexo({ anexos: [ARQUIVO_GRANDE] })).toBe(false);
    expect(textoDoTopico('o-peso-multiplica')).toContain(`${ARQUIVO_GRANDE.mb} MB`);
    expect(textoDoTopico('o-peso-multiplica')).toContain(`${LIMITE_DE_ANEXO} MB`);
  });

  it('a busca acha a arquivada de maio, e não acha o que foi para a lixeira', () => {
    expect(buscar(caixa, PALAVRA_DA_BUSCA).map(m => m.id)).toEqual(['violao']);
    const arquivada = arquivar(caixa, 'baquetas');
    expect(buscar(arquivada, 'baquetas').map(m => m.pasta)).toEqual(['arquivadas']);
    expect(textoDoTopico('arquivar-nao-e-excluir')).toContain(`"${PALAVRA_DA_BUSCA}"`);
  });

  it('a lista entrega quem saiu e deixa de fora quem entrou', () => {
    const lista = caixa.listas[0];
    expect(lista.membros).toEqual(NA_LISTA);
    expect(NA_LISTA.includes('caio') && !NA_FANFARRA.includes('caio')).toBe(true);
    expect(!NA_LISTA.includes('livia') && NA_FANFARRA.includes('livia')).toBe(true);
    expect(expandir(caixa, [lista.endereco])).toContain(MUSICOS.find(m => m.id === 'caio')!.endereco);
    expect(textoDoTopico('a-lista-envelhece')).toMatch(/Caio[\s\S]*Lívia/);
  });

  it('o evento do Acre às 10h é lido 12h em Brasília', () => {
    expect(horaPara(evento(CONVERSA_COM_O_ACRE), FUSO_DE_BRASILIA)).toBe('12:00');
    expect(textoDoTopico('o-fuso')).toMatch(/10:00[\s\S]*12:00/);
  });

  it('os dois "aguardando" do ensaio geral: um decidindo, um que nunca chegou', () => {
    const e = evento(ENSAIO_GERAL);
    expect(e.convidados.filter(c => c.resposta === 'aguardando')).toHaveLength(2);
    expect(naoChegaram(e).map(c => c.endereco)).toEqual([ENDERECO_ERRADO]);
    expect(textoDoTopico('aguardando-nao-e-sim')).toContain(ENDERECO_ERRADO);
  });

  it('o ensaio de quarta cai nos cinco dias de julho e tem fim', () => {
    const e = evento(ENSAIO_SEMANAL);
    expect(ocorrencias(e, '2026-07-01', '2026-07-31')).toEqual(
      ['2026-07-01', '2026-07-08', '2026-07-15', '2026-07-22', '2026-07-29']);
    expect(e.repete?.ate).toBe('2026-11-25');
    expect(textoDoTopico('a-serie')).toMatch(/1, 8, 15, 22 e 29[\s\S]*25\/11\/2026/);
  });

  it('o Otávio aparece sem acesso na grade, e só pode depois das 18:00', () => {
    const otavio = PESSOAS_DA_GRADE.find(p => p.nome === 'Otávio Reis')!;
    expect(estadoEm(otavio, DIA_DA_GRADE, '09:00', '10:30')).toBe('sem-acesso');
    expect(textoDoTopico('a-grade-responde-o-que-consultou')).toContain(OTAVIO_SO_DEPOIS_DE);
  });

  it('a sala tem quem espera e a notificação que vaza', () => {
    const sala = salaDaFanfarra();
    expect(sala.participantes.filter(p => p.estado === 'na-espera').map(p => p.nome)).toEqual(['Bianca Lopes']);
    expect(textoDoTopico('conduzir')).toContain('Bianca');
    expect(sala.notificacoes[0].texto).toMatch(/tuba/);
  });
});

describe('a fanfarra não é o acampamento do laboratório', () => {
  it('nenhuma mensagem, pessoa, evento ou endereço coincide', () => {
    const doLab = new Set([
      ...MENSAGENS_DO_CLUBE.flatMap(m => [m.id, m.assunto, m.de]),
      ...[...FALCAO, ...AGUIA].flatMap(p => [p.id, p.nome, p.endereco]),
      ...agendaDoClube().eventos.flatMap(e => [e.id, e.titulo]),
      reuniaoComConviteErrado().id, reuniaoComConviteErrado().titulo, ERRADO_DO_LAB,
      ...CONVIDADOS_DA_REUNIAO.flatMap(p => [p.nome, p.endereco]),
      ...reuniaoDoConselho().participantes.map(p => p.nome),
      ...caixaDoClube().listas.flatMap(l => [l.id, l.nome, l.endereco]),
    ]);
    const daFanfarra = [
      ...caixaDaFanfarra().mensagens.flatMap(m => [m.id, m.assunto, m.de]),
      ...MUSICOS.flatMap(p => [p.id, p.nome, p.endereco]),
      ...agendaDaFanfarra().eventos.flatMap(e => [e.id, e.titulo]),
      ...PESSOAS_DA_GRADE.flatMap(p => [p.nome, p.endereco]),
      ...salaDaFanfarra().participantes.map(p => p.nome),
      ...caixaDaFanfarra().listas.flatMap(l => [l.id, l.nome, l.endereco]),
      ENDERECO_ERRADO,
    ];
    expect(daFanfarra.length).toBeGreaterThan(40);
    expect(daFanfarra.filter(x => doLab.has(x))).toEqual([]);
  });

  it('a teoria não cita o acampamento nem quem mora nele', () => {
    const teoria = topicos().map(t => textoDoTopico(t.id)).join('\n');
    const proibidos = [
      'Daniel', 'Helena', 'Tio Samuel', 'Tio Márcio', 'Tia Rute', 'Tia Joana', 'Gabriela', 'Marina',
      'Falcão', 'Águia', ERRO_DO_ACRE, ERRADO_DO_LAB, 'fotos-do-acampamento', 'Igreja Central',
    ];
    expect(proibidos.filter(p => teoria.includes(p))).toEqual([]);
  });
});

/* A hora que o laboratório combina com o Acre. */
const ERRO_DO_ACRE = '15h';
