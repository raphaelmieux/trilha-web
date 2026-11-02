import { describe, expect, it } from 'vitest';
import { MODULOS_DE_CONTAS_E_SEGURANCA } from './contasESeguranca';
import type { TopicoDeVereda } from './veredas';
import {
  COMO_GERAR_PADRAO, cofreDoClube, ehDasListas, forcaDaSenha, gerarSenha, senhasReutilizadas,
} from '../labs/cofreDeSenhas';
import {
  ENDERECO_DO_INTRUSO as INTRUSO_DO_LAB, VAZAMENTOS_CONHECIDOS, contaDoClube, contaInvadida, portasAbertas,
  trocarSenhaDaConta, vazamentosDe, vazamentosQueAindaValem,
} from '../labs/contaOnline';
import { CAIXA_DO_CLUBE } from '../labs/golpesDoClube';
import {
  CAIXA_DOS_AVENTUREIROS, ENDERECO, ENDERECO_DA_DIRETORA, ENDERECO_DO_INTRUSO, SENHA_REPETIDA, VAZAMENTOS_DO_EXEMPLO,
  cofreDosAventureiros, contaDosAventureiros, contaDosAventureirosInvadida,
} from '../exemplos/aventureirosEstrelaGuia';

/*
  O que as telas da CC-ES005 afirmam, conferido pelos motores do cofre, da
  conta e do correio.

  É a trava de `exemplosDePdf.test.ts`, pelo motivo escrito lá: a **conta** se
  faz aqui, sobre as contas dos Aventureiros que as telas fotografam, e a
  **afirmação** se lê da legenda. Mudar as contas sem refazer as telas
  reprova, porque a imagem continuaria mostrando as antigas.

  E a última parte reprova se os Aventureiros passarem a dividir um endereço,
  uma senha, um aplicativo ou uma mensagem com o Clube Pioneiros, que é o do
  laboratório.
*/

const topicos = (): TopicoDeVereda[] =>
  MODULOS_DE_CONTAS_E_SEGURANCA.flatMap(m => m.licoes.flatMap(l => (l.tipo === 'teoria' ? l.topicos : [])));

function textoDoTopico(id: string): string {
  const t = topicos().find(x => x.id === id);
  if (!t) throw new Error(`O tópico ${id} sumiu da vereda.`);
  return [t.resumo, ...t.explicacao, t.exemplo ?? '', t.atencao ?? '', ...(t.telas ?? []).flatMap(x => [x.legenda, x.descricao])].join('\n');
}

/* Um sorteio que anda, para a senha sair com as classes misturadas como sai
   do gerador de verdade; um número fixo repetiria o mesmo caractere. */
const sorteioQueAnda = () => { let i = 0; return () => ((i++ * 0.618034) % 1); };

describe('as telas da CC-ES005 contam as contas que fotografam', () => {
  it('vinte e dois tópicos ensinam um gesto, e nenhum ficou com quadro de texto', () => {
    expect(topicos().filter(t => t.telas?.length)).toHaveLength(22);
    expect(topicos().some(t => t.exemplo)).toBe(false);
  });

  it('o gerador sai "fraca" com 8 e "forte" com 24', () => {
    expect(forcaDaSenha(gerarSenha({ ...COMO_GERAR_PADRAO, tamanho: 8 }, sorteioQueAnda()))).toBe('fraca');
    expect(forcaDaSenha(gerarSenha({ ...COMO_GERAR_PADRAO, tamanho: 24 }, sorteioQueAnda()))).toBe('forte');
    expect(textoDoTopico('o-que-e-senha-forte')).toMatch(/8[\s\S]*"fraca"[\s\S]*24[\s\S]*"forte"/);
  });

  it('mudar123 é de lista e frágil', () => {
    const cantina = cofreDosAventureiros().entradas.find(e => e.servico === 'Caixa da cantina')!;
    expect(cantina.senha).toBe('mudar123');
    expect(ehDasListas(cantina.senha)).toBe(true);
    expect(forcaDaSenha(cantina.senha)).toBe('frágil');
    expect(textoDoTopico('senha-de-lista')).toMatch(/mudar123[\s\S]*"frágil"/);
  });

  it('a mesma senha está em três contas, e são as três que as legendas nomeiam', () => {
    const grupos = senhasReutilizadas(cofreDosAventureiros());
    expect(grupos).toHaveLength(1);
    expect(grupos[0].map(e => e.servico)).toEqual(['E-mail do clube', 'Agenda das reuniões', 'Página na rede social']);
    expect(grupos[0][0].senha).toBe(SENHA_REPETIDA);
    expect(textoDoTopico('reutilizar')).toContain('3 contas');
    expect(textoDoTopico('gerenciador')).toContain(SENHA_REPETIDA);
  });

  it('o endereço do clube vazou com senha em 2026-03, e a senha de 2023-09 ainda vale', () => {
    const achados = vazamentosDe(ENDERECO, VAZAMENTOS_DO_EXEMPLO);
    expect(achados.map(v => `${v.servico} ${v.quando}`)).toEqual(['Papelaria Online 2026-03']);
    expect(achados[0].oQueVazou).toContain('senha');
    const conta = contaDosAventureiros();
    expect(conta.senhaTrocadaEm).toBe('2023-09');
    expect(vazamentosQueAindaValem(conta, VAZAMENTOS_DO_EXEMPLO)).toHaveLength(1);
    expect(vazamentosQueAindaValem(trocarSenhaDaConta(conta, 'outra-senha-longa', '2026-09'), VAZAMENTOS_DO_EXEMPLO))
      .toHaveLength(0);
    expect(textoDoTopico('o-que-e-vazamento')).toMatch(/Papelaria Online[\s\S]*2026-03/);
    expect(textoDoTopico('o-que-fazer')).toMatch(/2023-09[\s\S]*2026-03[\s\S]*2026-09/);
    expect(vazamentosDe('secretaria@aventureirosestrela.org', VAZAMENTOS_DO_EXEMPLO)).toEqual([]);
  });

  it('a recuperação é o endereço pessoal da diretora', () => {
    expect(contaDosAventureiros().recuperacao.email).toBe(ENDERECO_DA_DIRETORA);
    expect(textoDoTopico('recuperacao')).toContain(ENDERECO_DA_DIRETORA);
  });

  it('o Quiz Relâmpago pede quatro permissões e ninguém o usa há 2 anos', () => {
    const quiz = contaDosAventureiros().aplicativos.find(a => a.nome === 'Quiz Relâmpago')!;
    expect(quiz.escopos).toHaveLength(4);
    expect(quiz.ultimoUso).toBe('há 2 anos');
    expect(textoDoTopico('escopos')).toContain('Quiz Relâmpago');
    expect(textoDoTopico('revisar')).toMatch(/há 2 anos/);
  });

  it('a senha nova derruba o intruso e deixa as três portas', () => {
    const invadida = contaDosAventureirosInvadida();
    expect(invadida.sessoes.find(s => s.intruso)?.lugar).toBe('Manaus');
    const trocada = trocarSenhaDaConta(invadida, 'outra-senha-longa', '2026-09');
    expect(trocada.sessoes.map(s => s.aparelho)).toEqual(['Notebook da secretaria']);
    expect(portasAbertas(trocada, ENDERECO_DO_INTRUSO).map(p => p.id).sort())
      .toEqual(['aplicativo', 'encaminhamento', 'recuperacao']);
    expect(textoDoTopico('a-ordem')).toContain('Manaus');
    expect(textoDoTopico('as-tres-portas')).toContain(ENDERECO_DO_INTRUSO);
  });

  it('as mensagens que as legendas dizem golpe têm indícios, e as verdadeiras não', () => {
    const porId = (id: string) => CAIXA_DOS_AVENTUREIROS.find(m => m.id === id)!;
    expect(porId('entrega').indicios).toEqual(expect.arrayContaining(['dominio', 'link-disfarcado']));
    expect(porId('sorteio').anexos?.[0]).toMatch(/\.pdf\.exe$/);
    expect(porId('lucia').indicios).toEqual([]);
    expect(porId('agenda').indicios).toEqual([]);
    expect(porId('agenda').links?.[0].para).toContain(porId('agenda').links?.[0].texto);
    expect(textoDoTopico('indicios')).toContain(porId('entrega').de.split('@')[1]);
    expect(textoDoTopico('indicios')).toContain(porId('sorteio').anexos![0]);
  });
});

describe('as contas dos Aventureiros não são as do laboratório', () => {
  const cofreDoLab = cofreDoClube().entradas;
  const contasDoLab = [contaDoClube(), contaInvadida()];
  const doLab = [
    ...cofreDoLab.flatMap(e => [e.usuario, e.senha]),
    ...contasDoLab.flatMap(c => [c.endereco, c.senha, c.recuperacao.email ?? '', ...c.aplicativos.map(a => a.nome)]),
    ...VAZAMENTOS_CONHECIDOS.map(v => v.servico),
    ...CAIXA_DO_CLUBE.flatMap(m => [m.de, m.assunto, ...(m.anexos ?? []), ...(m.links ?? []).map(l => l.para)]),
    INTRUSO_DO_LAB,
  ].filter(Boolean);

  it('nenhum endereço, senha, aplicativo, vazamento ou mensagem coincidem', () => {
    const contas = [contaDosAventureiros(), contaDosAventureirosInvadida()];
    const dosAventureiros = [
      ...cofreDosAventureiros().entradas.flatMap(e => [e.usuario, e.senha]),
      ...contas.flatMap(c => [c.endereco, c.senha, c.recuperacao.email ?? '', ...c.aplicativos.map(a => a.nome)]),
      ...VAZAMENTOS_DO_EXEMPLO.map(v => v.servico),
      ...CAIXA_DOS_AVENTUREIROS.flatMap(m => [m.de, m.assunto, ...(m.anexos ?? []), ...(m.links ?? []).map(l => l.para)]),
      ENDERECO_DO_INTRUSO,
    ];
    expect(dosAventureiros.length).toBeGreaterThan(20);
    expect(dosAventureiros.filter(x => doLab.includes(x))).toEqual([]);
  });

  it('a teoria não cita as contas do clube nem quem cuida delas', () => {
    const teoria = topicos().map(t => textoDoTopico(t.id)).join('\n');
    /*
      Senha de lista fica de fora, e é de propósito: `Senha@123` está no
      cofre do laboratório **porque** é a senha que todo mundo escolhe, e a
      teoria a nomeia pelo mesmo motivo. Ensinar que ela está nas listas é a
      matéria; o que seria gabarito é dizer em qual conta do clube ela mora.
    */
    const proibidos = [
      ...doLab.filter(x => !ehDasListas(x)), 'Marta', 'Ronaldo', 'Cleide', 'FotoMágica', 'Banco do Brasil', 'camisetas', 'Chácara Recanto',
    ];
    expect(proibidos.filter(p => teoria.includes(p))).toEqual([]);
  });
});
