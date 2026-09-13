import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
  diaEmBrasilia, horaEmBrasilia, diaDaSemanaEmBrasilia,
  diaSeguinte, diaAnterior, diasDeAtividade,
  ofensivaCorrente, melhorOfensiva, EVENTOS_DA_OFENSIVA,
} from './ofensiva';
import type { EventoDeAtividade } from './atividade';
import { LIMIAR_DOMINIO } from './limiarDeDominio';

/*
  A ofensiva, e as três formas de ela mentir sem estourar.

  Ela ficou parada em "2 dias" por um bom tempo, e o defeito não era uma conta
  errada: era um número guardado que ninguém refazia, uma virada de dia às 21h
  e uma conta por trilha exibida como se fosse da pessoa. Nenhum dos três
  aparece no console — o contador mostra um número plausível, que é exatamente
  o que se espera de um contador funcionando.
*/

const evento = (event_type: string, created_at: string): EventoDeAtividade =>
  ({ event_type, created_at });

describe('o dia em Brasília', () => {
  /*
    A virada é meia-noite de Brasília, e não meia-noite UTC.

    Era UTC, e UTC vira às 21h daqui. O desbravador que estudava às 20h e
    voltava às 22h da mesma noite ganhava dois dias de ofensiva por uma noite
    só de estudo; e como o clube se reúne à noite, quem estuda ali vivia
    sempre um dia à frente do calendário.
  */
  it('as 23h de um dia ainda são aquele dia', () => {
    expect(diaEmBrasilia('2026-09-13T23:30:00-03:00')).toBe('2026-09-13');
  });

  it('as 21h não viram o dia, como viravam em UTC', () => {
    const noite = '2026-09-13T21:30:00-03:00';
    expect(diaEmBrasilia(noite)).toBe('2026-09-13');
    /* O defeito antigo, escrito por extenso para não voltar sem ninguém ver. */
    expect(new Date(noite).toISOString().slice(0, 10)).toBe('2026-09-14');
  });

  it('a meia-noite e um minuto já é o dia seguinte', () => {
    expect(diaEmBrasilia('2026-09-14T00:01:00-03:00')).toBe('2026-09-14');
  });

  it('lê o instante gravado em UTC, que é como o banco devolve', () => {
    /* 2026-09-14T02:00Z é 23h do dia 13 em Brasília. */
    expect(diaEmBrasilia('2026-09-14T02:00:00Z')).toBe('2026-09-13');
  });

  it('não inventa dia a partir de data inválida', () => {
    expect(diaEmBrasilia('nem data')).toBe('');
  });
});

describe('a hora e o dia da semana em Brasília', () => {
  /* As insígnias de horário premiavam o fuso do aparelho: no computador do
     clube com o fuso errado, a madrugada de alguém virava tarde. */
  it('a hora é a do relógio de Brasília, e não a do aparelho', () => {
    expect(horaEmBrasilia('2026-09-14T02:00:00Z')).toBe(23);
    expect(horaEmBrasilia('2026-09-13T12:00:00-03:00')).toBe(12);
  });

  it('a meia-noite é zero, e não vinte e quatro', () => {
    expect(horaEmBrasilia('2026-09-13T00:10:00-03:00')).toBe(0);
  });

  it('o dia da semana acompanha a virada do dia em Brasília', () => {
    /* 13/09/2026 é um domingo. 02:00Z do dia 14 ainda é ele. */
    expect(diaDaSemanaEmBrasilia('2026-09-13T12:00:00-03:00')).toBe(0);
    expect(diaDaSemanaEmBrasilia('2026-09-14T02:00:00Z')).toBe(0);
    expect(diaDaSemanaEmBrasilia('2026-09-14T10:00:00-03:00')).toBe(1);
  });
});

describe('a aritmética de dias', () => {
  /*
    Fevereiro é a razão de isto não ser conta de texto nem de milissegundo.
  */
  it('atravessa o fim do mês', () => {
    expect(diaAnterior('2026-03-01')).toBe('2026-02-28');
    expect(diaSeguinte('2026-01-31')).toBe('2026-02-01');
  });

  it('conhece o ano bissexto', () => {
    expect(diaAnterior('2028-03-01')).toBe('2028-02-29');
    expect(diaSeguinte('2028-02-28')).toBe('2028-02-29');
    /* 2100 não é bissexto, apesar de divisível por 4. */
    expect(diaAnterior('2100-03-01')).toBe('2100-02-28');
  });

  it('atravessa a virada do ano', () => {
    expect(diaSeguinte('2026-12-31')).toBe('2027-01-01');
    expect(diaAnterior('2027-01-01')).toBe('2026-12-31');
  });
});

describe('a ofensiva corrente', () => {
  it('conta os dias seguidos até hoje', () => {
    expect(ofensivaCorrente(['2026-09-11', '2026-09-12', '2026-09-13'], '2026-09-13')).toBe(3);
  });

  /* Quem venceu ontem e ainda não abriu hoje não perdeu nada: tem até a
     meia-noite. Zerar de manhã cobraria estudar todo dia antes de dormir. */
  it('sobrevive ao dia que ainda não acabou', () => {
    expect(ofensivaCorrente(['2026-09-11', '2026-09-12'], '2026-09-13')).toBe(2);
  });

  /*
    E este é o sintoma que se foi.

    Um dia civil inteiro sem nada zera. Antes não zerava nunca: o número
    ficava guardado na matrícula e só mudava quando a pessoa voltasse — então
    quem tinha chegado a 2 via "2 dias" por meses.
  */
  it('zera depois de um dia civil inteiro sem atividade', () => {
    expect(ofensivaCorrente(['2026-09-11'], '2026-09-13')).toBe(0);
    expect(ofensivaCorrente(['2026-06-01', '2026-06-02'], '2026-09-13')).toBe(0);
  });

  it('é zero para quem nunca fez nada', () => {
    expect(ofensivaCorrente([], '2026-09-13')).toBe(0);
  });

  it('não se deixa esticar por buraco no meio', () => {
    const dias = ['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-12', '2026-09-13'];
    expect(ofensivaCorrente(dias, '2026-09-13')).toBe(2);
  });

  /* Relógio adiantado é coisa de computador de clube. Sem isto, ele
     inventaria ofensiva que ninguém percorreu. */
  it('descarta dia no futuro', () => {
    expect(ofensivaCorrente(['2026-09-13', '2026-12-25'], '2026-09-13')).toBe(1);
  });

  it('atravessa a virada do mês', () => {
    expect(ofensivaCorrente(['2026-02-27', '2026-02-28', '2026-03-01'], '2026-03-01')).toBe(3);
  });
});

describe('a melhor ofensiva', () => {
  it('é a maior sequência de sempre, e não a de agora', () => {
    const dias = ['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-09-13'];
    expect(melhorOfensiva(dias)).toBe(4);
    expect(ofensivaCorrente(dias, '2026-09-13')).toBe(1);
  });

  it('é zero sem dia nenhum', () => {
    expect(melhorOfensiva([])).toBe(0);
  });
});

describe('que atividade faz a ofensiva andar', () => {
  /*
    Um dia com três eventos é um dia.

    Uma lição de três requisitos grava três `lesson_completed` de uma vez. Sem
    a distinção, um exercício só valeria três dias de ofensiva.
  */
  it('conta dias, e não exercícios', () => {
    const dias = diasDeAtividade([
      evento('lesson_completed', '2026-09-13T14:00:00-03:00'),
      evento('lesson_completed', '2026-09-13T14:00:01-03:00'),
      evento('lesson_completed', '2026-09-13T14:00:02-03:00'),
    ]);
    expect(dias).toEqual(['2026-09-13']);
  });

  /*
    A vereda conta. Ela não tem linha em `specialties`, então nunca teve
    matrícula onde marcar dia — vencer a teoria de uma vereda não mexia na
    ofensiva, e a regra do clube diz "qualquer módulo, de teoria ou
    laboratório".
  */
  it('conta a lição de vereda, que não tem matrícula onde marcar dia', () => {
    expect(diasDeAtividade([
      evento('vereda_teoria', '2026-09-12T10:00:00-03:00'),
      evento('vereda_laboratorio', '2026-09-13T10:00:00-03:00'),
    ])).toEqual(['2026-09-12', '2026-09-13']);
  });

  /* Passo do meio do caminho não é módulo vencido: ofensiva que andasse com
     ele mediria ter aberto o laboratório. */
  it('não conta o passo do meio do caminho', () => {
    expect(diasDeAtividade([
      evento('text_saved', '2026-09-13T10:00:00-03:00'),
      evento('mail_sent', '2026-09-13T10:00:00-03:00'),
      evento('threat_sim_run', '2026-09-13T10:00:00-03:00'),
      evento('redacao_montada', '2026-09-13T10:00:00-03:00'),
    ])).toEqual([]);
  });

  it('ignora evento sem data', () => {
    expect(diasDeAtividade([{ event_type: 'lesson_completed' }])).toEqual([]);
  });
});

/*
  Tentativa reprovada não é módulo vencido.

  O laboratório grava depois do `setCompleted`, e a teoria da vereda só chama o
  registro acima do limiar — os dois só existem vencidos. A lição de trilha e a
  prova final, não: elas gravam **toda** tentativa, com a nota junto. Sem o
  corte, errar tudo numa lição valia um dia de ofensiva, e "completou um
  módulo" passava a querer dizer "abriu e respondeu qualquer coisa" — que é
  exatamente a autodeclaração que a plataforma inteira evita.

  A nota sai da metadata que já era gravada, então o corte vale para o
  histórico também.
*/
describe('a tentativa precisa passar do limiar', () => {
  const tentativa = (score: number, total: number, dia = '2026-09-13'): EventoDeAtividade =>
    ({ event_type: 'lesson_completed', created_at: `${dia}T14:00:00-03:00`, metadata: { score, total } });

  it('75% passa, que é o limiar da plataforma', () => {
    expect(LIMIAR_DOMINIO).toBe(75);
    expect(diasDeAtividade([tentativa(6, 8)])).toEqual(['2026-09-13']);
  });

  it('abaixo do limiar não conta', () => {
    expect(diasDeAtividade([tentativa(5, 8)])).toEqual([]);
    expect(diasDeAtividade([tentativa(0, 10)])).toEqual([]);
  });

  it('vale para a prova final, que também grava tentativa reprovada', () => {
    expect(diasDeAtividade([
      { event_type: 'final_exam_completed', created_at: '2026-09-13T14:00:00-03:00', metadata: { score: 3, total: 10 } },
    ])).toEqual([]);
  });

  /* Refazer e passar no mesmo dia vale o dia: o que conta é ter vencido, e
     não ter vencido de primeira — quem erra, estuda e volta é justamente
     quem a ofensiva existe para segurar. */
  it('a aprovada do mesmo dia salva o dia', () => {
    expect(diasDeAtividade([tentativa(2, 10), tentativa(9, 10)])).toEqual(['2026-09-13']);
  });

  /* Prova de zero questão não é aprovação por vacuidade — é a família do
     "zero link não é zero link quebrado". */
  it('total zero não passa de graça', () => {
    expect(diasDeAtividade([tentativa(0, 0)])).toEqual([]);
  });

  /* O laboratório não grava nota nenhuma, e só grava ao vencer: exigir nota
     dele apagaria da ofensiva todo laboratório da plataforma. */
  it('evento sem nota continua contando', () => {
    expect(diasDeAtividade([
      { event_type: 'code_lab_completed', created_at: '2026-09-13T14:00:00-03:00', metadata: { specialtyCode: 'AP035' } },
      { event_type: 'vereda_teoria', created_at: '2026-09-12T14:00:00-03:00', metadata: { vereda: 'html' } },
    ])).toEqual(['2026-09-12', '2026-09-13']);
  });
});

/*
  E a lista de eventos não pode parar de conferir sozinha.

  Ela é escrita à mão, e lista escrita à mão envelhece: um laboratório novo
  estrearia gravando um nome que não está nela, a ofensiva não andaria naquela
  lição, e a build seguiria verde. É o mesmo defeito das travas que
  enumeravam quatro trilhas num `describe.each` enquanto a AP043 e a AP044
  abriam fora da lista.

  A trava lê as chamadas de `logActivity` do repositório inteiro e cobra que
  todo nome gravado esteja classificado de um lado ou do outro. Nome novo
  reprova aqui até alguém decidir se ele é módulo vencido ou passo do meio.
*/
const PASSOS_DO_MEIO = [
  'text_saved',      // rascunho salvo no editor de texto
  'mail_sent',       // uma mensagem enviada dentro do laboratório de e-mail
  'threat_sim_run',  // uma simulação rodada no laboratório de ameaças
  'redacao_montada', // o rascunho montado, antes da entrega
];

/* Escritos pelo servidor, e não por `logActivity`: a emissão do certificado é
   da Edge Function, e o percurso da vereda tem os nomes de quando ela se
   chamava mini-trilha. Nenhum deles é módulo vencido por alguém agora. */
const DE_FORA = [
  'certification_issued',
  'vereda_topico', 'mini_trilha_topico',
  'vereda_completed', 'mini_trilha_completed',
];

function arquivosDeFonte(dir: string): string[] {
  return readdirSync(dir).flatMap(nome => {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) return arquivosDeFonte(caminho);
    return /\.tsx?$/.test(nome) && !/\.test\.tsx?$/.test(nome) ? [caminho] : [];
  });
}

describe('a lista de eventos da ofensiva', () => {
  const RAIZ = resolve(__dirname, '..');
  const gravados = new Set<string>();
  for (const arquivo of arquivosDeFonte(RAIZ)) {
    const fonte = readFileSync(arquivo, 'utf8');
    for (const m of fonte.matchAll(/logActivity\(\s*[^,]+,\s*'([a-z_]+)'/g)) {
      gravados.add(m[1]);
    }
  }

  /* Um apagador que não achasse nada aprovaria qualquer coisa, calado. */
  it('acha as chamadas de logActivity no repositório', () => {
    expect(gravados.size).toBeGreaterThan(20);
    expect(gravados).toContain('lesson_completed');
  });

  it('todo evento gravado está classificado', () => {
    const classificados = new Set([...EVENTOS_DA_OFENSIVA, ...PASSOS_DO_MEIO, ...DE_FORA]);
    const soltos = [...gravados].filter(e => !classificados.has(e)).sort();
    expect(soltos,
      'este evento é gravado por algum laboratório e não está classificado. '
      + 'Decida se ele é um módulo vencido — entra em EVENTOS_DA_OFENSIVA, em '
      + 'ofensiva.ts — ou um passo do meio do caminho, e então entra em '
      + 'PASSOS_DO_MEIO aqui. Sem isso a ofensiva não anda na lição dele, e '
      + 'nada mais reprova.',
    ).toEqual([]);
  });

  it('nenhum evento está dos dois lados', () => {
    const nos_dois = EVENTOS_DA_OFENSIVA.filter(
      e => PASSOS_DO_MEIO.includes(e) || DE_FORA.includes(e),
    );
    expect(nos_dois).toEqual([]);
  });

  /* Os dois da vereda não saem de `logActivity` com nome literal — vêm de
     constantes —, então a varredura acima não os alcança. Ficam cobrados
     aqui, porque foi justamente a vereda que a conta antiga deixava de fora. */
  it('as lições de vereda continuam contando', () => {
    expect(EVENTOS_DA_OFENSIVA).toContain('vereda_teoria');
    expect(EVENTOS_DA_OFENSIVA).toContain('vereda_laboratorio');
  });
});

/*
  E a lista existe duas vezes: aqui e no banco.

  O painel calcula a ofensiva no navegador, e o ranking do clube a calcula no
  Postgres — `public.eventos_da_ofensiva()`. Não dava para ser uma cópia só: o
  ranking cruza dados de todo mundo e roda `security definer`, então a conta
  dele tem de acontecer lá.

  Duas cópias divergem no primeiro ajuste. Um laboratório novo entraria na
  lista do frontend e não na do banco, e o clube veria dois números diferentes
  para a mesma pessoa na mesma tarde — nenhum deles com cara de errado. Esta
  trava lê o SQL publicado e compara nome por nome, que é o mesmo remédio do
  seletor de cores do Scratch: a única defesa contra duas fontes da verdade é
  conferir uma contra a outra.
*/
describe('a lista do banco e a do navegador', () => {
  /*
    A lista mora dentro do `leaderboard`, e não numa função à parte.

    Ela chegou a ser `public.eventos_da_ofensiva()`, ao lado de
    `melhor_ofensiva(uuid)` — e essa segunda era `security definer` com
    `grant` para `anon`, lendo `activity_events` de um id qualquer sem
    perguntar nada a `privacy_preferences`. O `leaderboard` pergunta: ele só
    lista quem marcou `show_on_leaderboard`. Quem desmarcasse a caixa sumia da
    lista e continuava respondendo por RPC direta. As duas saíram, e a conta
    voltou para dentro da junção que a protege.
  */
  const SQL = resolve(
    __dirname,
    '../../supabase/migrations/20260913140000_ofensiva_so_dentro_do_ranking.sql',
  );
  const fonte = readFileSync(SQL, 'utf8');

  const doBanco = (() => {
    const corpo = fonte.match(/and a\.event_type in \(([\s\S]*?)\)/);
    if (!corpo) return null;
    return corpo[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(Boolean);
  })();

  /* Se o apagador deixasse de achar a lista, a comparação abaixo passaria a
     comparar nada com nada e aprovaria qualquer divergência, calada. */
  it('acha a lista dentro da migration', () => {
    expect(doBanco, `não achei a lista de eventos em ${SQL}`).not.toBeNull();
    expect(doBanco!.length).toBeGreaterThan(20);
  });

  /*
    E as duas funções soltas não voltam.

    Uma função `security definer` sobre `activity_events`, concedida a `anon` e
    sem a junção de consentimento, é uma segunda porta para o mesmo dado — e
    foi assim que a primeira versão desta trava chegou à produção. Cada função
    nova em `public` também entra em `database.ts`, que é gerado: as duas
    fizeram o `supabase.yml` reprovar por divergência de tipo.
  */
  it('não reabre a porta que não pergunta pelo consentimento', () => {
    expect(fonte).toContain('drop function if exists public.melhor_ofensiva(uuid)');
    expect(fonte).toContain('drop function if exists public.eventos_da_ofensiva()');
  });

  /* A junção do consentimento continua sendo o que decide quem aparece. */
  it('a ofensiva só é contada para quem optou por aparecer', () => {
    expect(fonte).toMatch(/join privacy_preferences pp[\s\S]*?pp\.show_on_leaderboard/);
  });

  it('as duas listas são a mesma lista', () => {
    expect([...doBanco!].sort(),
      'a lista do banco e a de ofensiva.ts divergiram — o painel e o ranking '
      + 'passariam a mostrar ofensivas diferentes para a mesma pessoa.',
    ).toEqual([...EVENTOS_DA_OFENSIVA].sort());
  });
});
