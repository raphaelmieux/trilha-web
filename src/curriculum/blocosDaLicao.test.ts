import { describe, it, expect } from 'vitest';
import blocosMsgs from 'scratch-l10n/locales/blocks-msgs';
import { VEREDAS } from './veredas';
import { lerExemploDeBlocos } from '../labs/blocosDoScratch';
import { textoDoBloco, textoDaCondicao, type Bloco, type Condicao } from '../labs/blocos';

/*
  Todo bloco escrito na lição existe, com essas palavras, na paleta do Scratch.

  ── O que estava errado ──────────────────────────────────────────────────
  A CC001 abre o Scratch de verdade, em português, e as lições escreviam nomes
  que a paleta não tem: "quando a bandeira verde for clicada" (a paleta diz
  "quando ⚑ for clicado"), "defina placar para 0" (é "mude placar para 0"),
  "mude placar em 1" (é "adicione 1 a placar"), "pare tudo" (é "pare todos").
  O desbravador lia a lição, ia procurar na gaveta e não achava — e não havia
  erro nenhum na tela para explicar por quê.

  É o mesmo defeito de pintar o bloco da cor errada, só que nas palavras: a
  lição manda procurar uma coisa que não está lá.

  ── Quem tem a resposta ──────────────────────────────────────────────────
  O arquivo de tradução do próprio MIT, `scratch-l10n`, que é o que o editor
  embutido carrega. Não há segunda fonte: se o texto não está ali, ele não
  aparece na tela de ninguém.

  O molde tem buracos — `mova %1 passos` — e é por isso que a comparação é por
  expressão regular, e não por igualdade: o número, o nome da variável e o nome
  do ator são de quem escreve a lição.
*/

/* O pacote é CommonJS: conforme quem importa, o objeto chega já desembrulhado
   ou ainda dentro de um `default`. Aceitar as duas formas evita um teste que
   passa aqui e estoura no CI por causa do interop. */
type Traducoes = Record<string, Record<string, string>>;
const bruto = blocosMsgs as unknown as Traducoes & { default?: Traducoes };
const PT = (bruto.default ?? bruto)['pt-br'];

const semAcento = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const chave = (t: string) => semAcento(t.toLowerCase()).replace(/\s+/g, ' ').trim();

/** Cada molde do Scratch vira um padrão, com os %1 valendo qualquer coisa. */
const MOLDES = Object.entries(PT).map(([id, texto]) => ({
  id,
  texto,
  padrao: new RegExp(`^${chave(texto).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%[1-9]/g, '.+?')}$`),
}));

/** Toda tradução, para reconhecer o item de menu que vem colado no bloco. */
const VALORES = new Set(Object.values(PT).map(chave));

/*
  O bloco de parar é "pare" mais um item de menu: "pare todos". O menu é uma
  tradução à parte — `CONTROL_STOP` é só "pare", e `CONTROL_STOP_ALL` é "todos" —
  então o texto que a pessoa lê é a junção dos dois. Por isso, quando o texto
  inteiro não bate com nenhum molde, tenta-se cortá-lo: o começo tem de ser um
  molde, e o fim, uma tradução de verdade. Sem esse segundo passo a trava
  reprovaria um bloco que existe e está escrito certo.
*/
function daPaleta(texto: string) {
  const direto = MOLDES.find(m => m.padrao.test(chave(texto)));
  if (direto) return direto;

  const palavras = chave(texto).split(' ');
  for (let i = palavras.length - 1; i > 0; i--) {
    const inicio = palavras.slice(0, i).join(' ');
    const fim = palavras.slice(i).join(' ');
    if (!VALORES.has(fim)) continue;
    const m = MOLDES.find(x => x.padrao.test(inicio));
    if (m) return m;
  }
  return undefined;
}

const blocosDasLicoes = () => VEREDAS
  .flatMap(v => v.modulos.flatMap(m => m.licoes).map(l => [v.code, l] as const))
  .flatMap(([code, l]) => (l.tipo === 'teoria' ? l.topicos.map(t => [code, t] as const) : []))
  .filter(([, t]) => t.exemploComo === 'blocos')
  .flatMap(([code, t]) => lerExemploDeBlocos(t.exemplo)
    .filter(linha => linha.tipo === 'bloco')
    .map(linha => ({ code, topico: t.id, texto: (linha as { texto: string }).texto })));

describe('os blocos escritos nas lições', () => {
  it('há blocos para conferir', () => {
    expect(blocosDasLicoes().length).toBeGreaterThan(10);
  });

  it('todos existem, com essas palavras, na paleta do Scratch em português', () => {
    const fantasmas = blocosDasLicoes()
      .filter(b => !daPaleta(b.texto))
      .map(b => `${b.code}/${b.topico}: ${b.texto}`);
    expect([...new Set(fantasmas)]).toEqual([]);
  });
});

/*
  E o editor de reserva chama os blocos pelos mesmos nomes.

  `LaboratorioDeBlocos` é o que volta se o Scratch embutido se mostrar pesado
  demais para o computador do clube. A lição não muda ao trocar de um para o
  outro — então os nomes também não podem mudar, senão a reserva passa a
  ensinar uma paleta que não existe.
*/
describe('os rótulos do editor de reserva', () => {
  const CONDICOES: Condicao[] = [
    { tipo: 'tocando', quem: 'Maçã' },
    { tipo: 'teclaPressionada', tecla: 'espaço' },
    { tipo: 'variavelMaiorQue', nome: 'placar', valor: 5 },
  ];

  const BLOCOS: Bloco[] = [
    { id: '1', tipo: 'quandoBandeira' },
    { id: '2', tipo: 'quandoTecla', tecla: 'espaço' },
    { id: '3', tipo: 'quandoClicado' },
    { id: '4', tipo: 'mover', passos: 10 },
    { id: '5', tipo: 'subir', passos: 10 },
    { id: '6', tipo: 'irPara', x: 0, y: 0 },
    { id: '7', tipo: 'proximaFantasia' },
    { id: '8', tipo: 'diga', texto: 'oi' },
    { id: '9', tipo: 'toqueSom' },
    { id: '10', tipo: 'espere', segundos: 1 },
    { id: '11', tipo: 'repita', vezes: 4, corpo: [] },
    { id: '12', tipo: 'sempre', corpo: [] },
    { id: '13', tipo: 'se', condicao: CONDICOES[0], corpo: [] },
    { id: '14', tipo: 'definaVariavel', nome: 'placar', valor: 0 },
    { id: '15', tipo: 'mudeVariavel', nome: 'placar', por: 1 },
    { id: '16', tipo: 'pareTudo' },
  ];

  it('todo rótulo bate com um molde da paleta', () => {
    const fora = BLOCOS.map(textoDoBloco).filter(t => !daPaleta(t));
    expect(fora).toEqual([]);
  });

  /* A condição entra dentro do `se`, e é ela que carrega a interrogação — os
     sensores do Scratch são perguntas, e escrevê-los sem o ponto faz o
     desbravador procurar um bloco de afirmação que não existe. */
  it('toda condição bate com um molde da paleta', () => {
    const fora = CONDICOES.map(textoDaCondicao).filter(t => !daPaleta(t));
    expect(fora).toEqual([]);
  });

  it('a comparação existe, e não é invenção nossa', () => {
    expect(daPaleta(textoDaCondicao(CONDICOES[2]))?.id).toBe('OPERATORS_GT');
  });

  /*
    Os dois blocos de variável são quase trocados em relação ao que a intuição
    sugere — quem troca o valor é "mude ... para", quem soma é "adicione ... a".
    Inventar outros nomes para eles é a forma que este defeito tomou aqui.
  */
  it('os blocos de variável são os do Scratch, e não os que pareciam certos', () => {
    expect(textoDoBloco({ id: 'a', tipo: 'definaVariavel', nome: 'placar', valor: 0 }))
      .toBe('mude placar para 0');
    expect(textoDoBloco({ id: 'b', tipo: 'mudeVariavel', nome: 'placar', por: 1 }))
      .toBe('adicione 1 a placar');
  });
});

/*
  As palavras da tela do Scratch, nas explicações.

  Sprite é "ator" no Scratch em português, costume é "fantasia", e o controle
  vermelho é um octógono de parar, e não uma bandeira. A lição que usa outra
  palavra obriga a traduzir de cabeça no meio do exercício — e quem tem dez anos
  conclui que está no lugar errado.
*/
describe('o vocabulário da tela', () => {
  const prosaDaVereda = (code: string) => VEREDAS
    .filter(v => v.code === code)
    .flatMap(v => v.modulos.flatMap(m => m.licoes))
    .flatMap(l => (l.tipo === 'teoria' ? l.topicos : []))
    .flatMap(t => [t.titulo, t.resumo, ...t.explicacao, t.atencao, t.exemplo])
    .join('\n');

  const PROIBIDAS: [RegExp, string][] = [
    [/\bpersonagens?\b/i, 'o Scratch em português diz "ator"'],
    [/\btrajes?\b/i, 'o Scratch em português diz "fantasia"'],
    [/bandeira vermelha/i, 'o controle de parar é um octógono, e não uma bandeira'],
    [/\bem Começar\b/i, 'não existe botão "Começar": quem começa é a bandeira verde'],
  ];

  it('a CC001 usa as palavras que estão na tela do Scratch', () => {
    const texto = prosaDaVereda('CC001');
    const erradas = PROIBIDAS
      .filter(([r]) => r.test(texto))
      .map(([r, porque]) => `${r} — ${porque}`);
    expect(erradas).toEqual([]);
  });
});
