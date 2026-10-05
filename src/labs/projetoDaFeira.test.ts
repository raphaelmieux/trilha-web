/**
 * As premissas do conjunto da feira.
 *
 * Cada peça chega com um defeito escolhido, e o defeito **é** a lição. Nenhum
 * deles aparece olhando a peça sozinha: as cinco abrem bonitas, imprimem certo
 * e não dão erro nenhum. Consertar um deles por engano — pôr a identidade no
 * mestre, vincular um número, trocar o tipo de um campo — apagaria a lição
 * daquele módulo **sem reprovar nada**, porque a meta correspondente passaria
 * a abrir verde e a trava de "nenhuma meta abre verde" é a única que veria, e
 * só depois de alguém escrevê-la.
 *
 * É a trava de premissa que a CC-ES004 deu à foto de papel que pesa mais que a
 * página digitada, pelo motivo escrito lá.
 */

import { describe, expect, it } from 'vitest';
import { ehNumero } from './formulas';
import { quemEscreveu } from './arquivoCompartilhado';
import { paragrafos, textoDoBloco } from './documento';
import { valorDa } from './formulario';
import { planilhaPorNome } from './planilha';
import {
  APRESENTACAO_INICIAL, BLOCO_DAS_UNIDADES, BLOCO_DO_CUSTO, CAMPO_QUANTOS,
  CAMPO_UNIDADE_E_ESPECIALIDADE, CAMPOS_ARRUMADOS, CONTROLE_INICIAL,
  EQUIPE_DA_FEIRA, FORMULARIO_INICIAL, GRAFICO_DA_FEIRA, IDENTIDADE_DA_FEIRA,
  INSCRICOES_DA_FEIRA, LINHA_DAS_UNIDADES, LINHA_DO_TOTAL, NECESSIDADE_DO_CLUBE,
  NUMEROS_DA_FEIRA, PASTAS_DA_FEIRA, PROJETO_DA_FEIRA, REGULAMENTO_INICIAL,
  RESPOSTAS_DA_FEIRA, VERDE_DA_FEIRA,
} from './projetoDaFeira';
import {
  NOME_DA_ABA_DE_CONTROLE, NOME_DA_ABA_DE_RESPOSTAS, acompanhaAFonte,
  numerosQueNaoAcompanham, pastasForaDoPadrao, pecasComColaboracao,
  pecasForaDaIdentidade, propostaCompleta,
} from './projetoDocumental';
import { contrastRatio } from '../lib/imageTools';
import { moldeDoNome, nomeTemDataEVersao } from '../lib/exploradorValidator';

/* ── A proposta e a necessidade ───────────────────────────────────────────── */

describe('a proposta chega em branco', () => {
  /* Escrever a proposta é o módulo 1. Entregá-la escrita faria a primeira
     lição da vereda abrir cumprida. */
  it('não está completa', () => {
    expect(propostaCompleta(PROJETO_DA_FEIRA.proposta)).toBe(false);
  });

  it('não está aprovada', () => {
    expect(PROJETO_DA_FEIRA.proposta.aprovadaEm).toBeNull();
  });

  /* A necessidade é o enunciado, e não a resposta: ela conta o problema do
     clube sem dizer quais peças o atendem, que é o que a proposta promete. */
  it('a necessidade conta o problema e não lista as peças', () => {
    expect(NECESSIDADE_DO_CLUBE.length).toBeGreaterThan(120);
    expect(NECESSIDADE_DO_CLUBE.toLowerCase()).not.toContain('formulário');
    expect(NECESSIDADE_DO_CLUBE.toLowerCase()).not.toContain('dossiê');
  });
});

/* ── A identidade ─────────────────────────────────────────────────────────── */

describe('nenhuma peça chega com a identidade', () => {
  it('as quatro que podem carregá-la estão fora dela', () => {
    expect(pecasForaDaIdentidade(PROJETO_DA_FEIRA).sort())
      .toEqual(['apresentacao', 'documento', 'formulario', 'planilha']);
  });

  /* Se a cor do conjunto não se lesse sobre o branco do papel, a lição do
     3.6 mandaria aplicar uma identidade ilegível — e seria a plataforma
     ensinando o defeito que a CC-ES011 existe para consertar. */
  it('a cor do conjunto se lê sobre o papel branco', () => {
    expect(contrastRatio(VERDE_DA_FEIRA, '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
  });

  it('as duas fontes da identidade são de famílias diferentes', () => {
    expect(IDENTIDADE_DA_FEIRA.fonteDosTitulos).not.toBe(IDENTIDADE_DA_FEIRA.fonteDoCorpo);
  });
});

/* ── O regulamento ────────────────────────────────────────────────────────── */

describe('o regulamento chega escrito, com estilos e sumário', () => {
  /* Produzi-lo é o que a CC-ES002 mediu: chegar sem estilo faria esta vereda
     medir de novo o que já foi medido. */
  it('tem cinco títulos em estilo de título', () => {
    const titulos = paragrafos(REGULAMENTO_INICIAL).filter(b => b.estilo === 'Título 1');
    expect(titulos.length).toBeGreaterThanOrEqual(5);
  });

  it('o sumário foi gerado', () => {
    expect(REGULAMENTO_INICIAL.sumario).not.toBeNull();
    expect(REGULAMENTO_INICIAL.sumario).toHaveLength(6);
  });

  /* E chega sem a identidade: sem isto, a meta do 3.6 do documento abriria
     verde. */
  it('não carrega a fonte nem a cor do conjunto', () => {
    expect(REGULAMENTO_INICIAL.fonte).toBeUndefined();
    expect(REGULAMENTO_INICIAL.estilos?.['Título 1']?.cor).toBeUndefined();
  });

  /* Os dois números que o requisito 8 manda propagar chegam escritos no meio
     da frase, como a secretaria os deixou. Vinculados, a lição não existe. */
  it('os dois números do documento chegam digitados', () => {
    const doDoc = NUMEROS_DA_FEIRA.filter(n => n.peca === 'documento');
    expect(doDoc.map(n => n.como)).toEqual(['digitado', 'digitado']);
    expect(doDoc.map(n => n.alvo).sort())
      .toEqual([BLOCO_DAS_UNIDADES, BLOCO_DO_CUSTO].sort());
  });

  it('os parágrafos que eles citam existem e trazem o número no texto', () => {
    for (const id of [BLOCO_DAS_UNIDADES, BLOCO_DO_CUSTO]) {
      const bloco = paragrafos(REGULAMENTO_INICIAL).find(b => b.id === id);
      expect(bloco, id).toBeDefined();
      expect(textoDoBloco(bloco!)).toMatch(/\d/);
    }
  });

  /* O regulamento não diz onde estão as outras quatro peças, que é a seção
     que o módulo 2 acrescenta. */
  it('não aponta para as outras peças', () => {
    const texto = paragrafos(REGULAMENTO_INICIAL).map(textoDoBloco).join('\n').toLowerCase();
    expect(texto).not.toContain('planilha');
    expect(texto).not.toContain('formulário');
  });
});

/* ── O formulário ─────────────────────────────────────────────────────────── */

describe('o formulário chega desenhado sem olhar a planilha', () => {
  /* Unidade e especialidade num campo só: a planilha precisa das duas em
     colunas separadas, e partir o texto à mão é a redigitação que o
     requisito 4 proíbe. */
  it('unidade e especialidade vêm num campo só', () => {
    expect(FORMULARIO_INICIAL.campos.map(c => c.id)).toContain(CAMPO_UNIDADE_E_ESPECIALIDADE);
    expect(FORMULARIO_INICIAL.campos.map(c => c.id)).not.toContain('unidade');
    expect(FORMULARIO_INICIAL.campos.map(c => c.id)).not.toContain('especialidade');
  });

  it('a quantidade vem como texto curto, e não como número', () => {
    const campo = FORMULARIO_INICIAL.campos.find(c => c.id === CAMPO_QUANTOS);
    expect(campo?.tipo).toBe('texto-curto');
  });

  /* Sem resposta que a SOMA não leia, trocar o tipo do campo seria um clique
     que não muda nada na tela — e o defeito do requisito 7 da CC-ES003 não
     teria como nascer de um campo mal escolhido. */
  it('pelo menos duas respostas trazem quantidade que a SOMA não lê', () => {
    const naoNumericas = RESPOSTAS_DA_FEIRA
      .map(r => valorDa(r, CAMPO_QUANTOS))
      .filter(v => !ehNumero(v));
    expect(naoNumericas.length).toBeGreaterThanOrEqual(2);
  });

  it('as outras respostas trazem número, senão a conta não fecha nunca', () => {
    const numericas = RESPOSTAS_DA_FEIRA
      .map(r => valorDa(r, CAMPO_QUANTOS))
      .filter(v => ehNumero(v));
    expect(numericas.length).toBeGreaterThanOrEqual(2);
  });

  /* E o formulário chega sem resposta nenhuma: as seis entram quando a lição
     manda abri-lo, e entregá-las dentro faria o módulo 4 abrir com dados. */
  it('chega sem resposta nenhuma', () => {
    expect(FORMULARIO_INICIAL.respostas).toEqual([]);
  });

  it('os campos arrumados separam unidade de especialidade e pedem número', () => {
    expect(CAMPOS_ARRUMADOS.map(c => c.id)).toContain('unidade');
    expect(CAMPOS_ARRUMADOS.map(c => c.id)).toContain('especialidade');
    expect(CAMPOS_ARRUMADOS.find(c => c.id === CAMPO_QUANTOS)?.tipo).toBe('numero');
  });

  /* A lista de unidades do campo arrumado sai das inscrições, e não de uma
     segunda cópia escrita ao lado: duas listas divergiriam, e a unidade que
     faltasse não apareceria na lista para ninguém escolher. */
  it('a lista de unidades cobre todas as inscrições', () => {
    const opcoes = CAMPOS_ARRUMADOS.find(c => c.id === 'unidade')?.opcoes ?? [];
    for (const i of INSCRICOES_DA_FEIRA) expect(opcoes).toContain(i.unidade);
  });

  it('há mais unidades inscritas do que o retrato do gráfico mostra', () => {
    const retrato = APRESENTACAO_INICIAL.slides
      .find(s => s.grafico?.id === GRAFICO_DA_FEIRA)?.grafico?.retrato ?? [];
    expect(INSCRICOES_DA_FEIRA.length).toBeGreaterThan(retrato.length);
  });
});

/* ── A planilha ───────────────────────────────────────────────────────────── */

describe('a planilha calcula sobre números digitados', () => {
  it('as duas abas existem, e a de respostas está vazia', () => {
    const respostas = planilhaPorNome(CONTROLE_INICIAL, NOME_DA_ABA_DE_RESPOSTAS);
    const controle = planilhaPorNome(CONTROLE_INICIAL, NOME_DA_ABA_DE_CONTROLE);
    expect(respostas).not.toBeNull();
    expect(controle).not.toBeNull();
    expect(respostas!.celulas.every(l => l.every(c => c.texto === ''))).toBe(true);
  });

  /* Nenhum total chega como fórmula: é o que o módulo 3 manda consertar, e
     uma fórmula aqui deixaria a meta dele abrir verde. */
  it('nenhuma célula de total chega como fórmula', () => {
    const controle = planilhaPorNome(CONTROLE_INICIAL, NOME_DA_ABA_DE_CONTROLE)!;
    for (const linha of [LINHA_DAS_UNIDADES, LINHA_DO_TOTAL]) {
      expect(controle.celulas[linha][1].texto.startsWith('=')).toBe(false);
    }
  });

  /* E os números digitados estão **certos hoje**: um total errado de saída
     faria a lição ser "conserte a conta", e a lição é que a conta certa de
     hoje continua escrita no ano que vem. */
  it('o total digitado é o que as contas de hoje dariam', () => {
    const controle = planilhaPorNome(CONTROLE_INICIAL, NOME_DA_ABA_DE_CONTROLE)!;
    const unidades = Number(controle.celulas[LINHA_DAS_UNIDADES][1].texto);
    const custo = Number(controle.celulas[4][1].texto);
    expect(Number(controle.celulas[LINHA_DO_TOTAL][1].texto)).toBe(unidades * custo);
  });

  it('a planilha não carrega a cor do conjunto', () => {
    const controle = planilhaPorNome(CONTROLE_INICIAL, NOME_DA_ABA_DE_CONTROLE)!;
    expect(controle.celulas[0][0].cor).toBeUndefined();
  });
});

/* ── A apresentação ───────────────────────────────────────────────────────── */

describe('a apresentação chega montada, com o gráfico colado', () => {
  it('o gráfico é figura, e nenhum número da apresentação acompanha', () => {
    const grafico = APRESENTACAO_INICIAL.slides
      .find(s => s.grafico?.id === GRAFICO_DA_FEIRA)?.grafico;
    expect(grafico?.como).toBe('imagem');
    expect(acompanhaAFonte(grafico!.como)).toBe(false);
  });

  it('o mestre não tem a identidade do conjunto', () => {
    expect(APRESENTACAO_INICIAL.mestre.fonteDoTitulo)
      .not.toBe(IDENTIDADE_DA_FEIRA.fonteDosTitulos);
    expect(APRESENTACAO_INICIAL.mestre.corDoTitulo).not.toBe(IDENTIDADE_DA_FEIRA.cor);
  });

  it('nenhum slide chega com formatação direta sobrando', () => {
    const direta = APRESENTACAO_INICIAL.slides
      .filter(s => s.diretoNoTitulo !== undefined || s.diretoNoCorpo !== undefined);
    expect(direta).toEqual([]);
  });

  it('nenhum slide chega com caixa à mão', () => {
    expect(APRESENTACAO_INICIAL.slides.flatMap(s => s.caixas)).toEqual([]);
  });

  it('não foi exportada', () => {
    expect(APRESENTACAO_INICIAL.pdf).toBeNull();
  });
});

/* ── O dossiê e os três números ───────────────────────────────────────────── */

describe('o dossiê e a propagação', () => {
  it('o dossiê não existe', () => {
    expect(PROJETO_DA_FEIRA.dossie).toBeNull();
  });

  /* Os três números chegam sem acompanhar nada: é o requisito 8 inteiro, e
     um deles já vinculado deixaria a demonstração meio feita de fábrica. */
  it('os três números chegam sem acompanhar a fonte', () => {
    expect(numerosQueNaoAcompanham(PROJETO_DA_FEIRA)).toHaveLength(3);
    expect(NUMEROS_DA_FEIRA).toHaveLength(3);
  });

  it('nenhum número aponta para a aba de respostas', () => {
    for (const n of NUMEROS_DA_FEIRA) {
      expect(n.de.planilha).toBe(NOME_DA_ABA_DE_CONTROLE);
    }
  });
});

/* ── O repositório ────────────────────────────────────────────────────────── */

describe('o repositório chega fora do padrão', () => {
  /* A conta por nome, e não um piso: um piso de três continua satisfeito
     depois de alguém arrumar uma pasta, e aquela pasta deixaria de ter lição
     sem nada reprovar. O que se cobra é que **nenhuma** chegue pronta. */
  it('nenhuma pasta chega com data e versão no nome', () => {
    for (const p of PASTAS_DA_FEIRA) {
      const nome = PROJETO_DA_FEIRA.nuvem.arquivos.find(a => a.id === p.id)!.nome;
      expect(nomeTemDataEVersao(nome), nome).toBe(false);
    }
  });

  /* E a outra metade da conta precisa de caso: os nomes estão em moldes
     diferentes, senão `moldeDoNome` seria código que nenhum teste exercita. */
  it('os nomes das pastas estão em mais de um molde', () => {
    const moldes = new Set(PASTAS_DA_FEIRA.map(p =>
      moldeDoNome(PROJETO_DA_FEIRA.nuvem.arquivos.find(a => a.id === p.id)!.nome)));
    expect(moldes.size).toBeGreaterThan(1);
  });

  it('as quatro pastas aparecem fora do padrão', () => {
    expect(pastasForaDoPadrao(PROJETO_DA_FEIRA)).toHaveLength(PASTAS_DA_FEIRA.length);
  });

  it('as quatro pastas do projeto existem na nuvem', () => {
    for (const p of PASTAS_DA_FEIRA) {
      expect(PROJETO_DA_FEIRA.nuvem.arquivos.find(a => a.id === p.id), p.id).toBeDefined();
    }
  });

  /* O acesso que sobrou de março: o Ronaldo é do conselho e ficou editor da
     pasta da tesouraria. Sem ele, a meta do requisito 5 fecharia só com a
     conta de quem falta, e metade dela seria código que ninguém exercita. */
  it('alguém de fora da função tem acesso de editor a uma pasta', () => {
    const tesouraria = PROJETO_DA_FEIRA.nuvem.arquivos
      .find(a => a.id === PASTAS_DA_FEIRA[2].id)!;
    const daFuncao = EQUIPE_DA_FEIRA
      .filter(e => e.funcao === PASTAS_DA_FEIRA[2].funcao).map(e => e.quem);
    const intrusos = tesouraria.acessos
      .filter(ac => ac.papel === 'editor' && !daFuncao.includes(ac.quem));
    expect(intrusos.length).toBeGreaterThanOrEqual(1);
  });

  /* Nenhuma peça tem histórico com outra pessoa: é o requisito 6, e um
     histórico de dois autores aqui deixaria a meta dele abrir verde. */
  it('nenhuma peça chega com colaboração no histórico', () => {
    expect(pecasComColaboracao(PROJETO_DA_FEIRA)).toEqual([]);
  });

  it('toda peça chega com histórico de um autor só, e é você', () => {
    const pecas = PROJETO_DA_FEIRA.nuvem.arquivos.filter(a => a.tipo !== 'pasta');
    expect(pecas.length).toBeGreaterThanOrEqual(3);
    for (const a of pecas) expect(quemEscreveu(a), a.id).toEqual(['voce']);
  });

  it('as instruções chegam em branco e a demonstração não aconteceu', () => {
    expect(Object.values(PROJETO_DA_FEIRA.instrucoes).every(v => v === '')).toBe(true);
    expect(PROJETO_DA_FEIRA.minutosDaDemonstracao).toBeNull();
  });

  /* Toda função do clube serve alguma pasta: uma função sem pasta nenhuma
     seria gente na equipe que a conta do requisito 5 nunca olha. */
  it('toda função da equipe serve ao menos uma pasta', () => {
    for (const e of EQUIPE_DA_FEIRA) {
      expect(PASTAS_DA_FEIRA.some(p => p.funcao === e.funcao), e.funcao).toBe(true);
    }
  });
});
