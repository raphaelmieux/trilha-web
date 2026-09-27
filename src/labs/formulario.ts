/**
 * O formulário da CC-ES008: o modelo, e as respostas de onde as lições partem.
 *
 * ── Por que ele não é uma planilha com mais colunas ──────────────────────
 * O requisito 3 pede explicar a diferença entre uma planilha usada como base
 * de dados e uma usada como relatório, e por que misturar as duas causa
 * problema. Isso só significa alguma coisa se as duas existirem de verdade: a
 * base é o que o formulário grava — uma linha por resposta, uma coluna por
 * campo, e nada mais dentro dela — e o relatório é o resumo que se tira dela.
 *
 * ── O que cada peça carrega ──────────────────────────────────────────────
 * O requisito 4 é o mais fácil de escrever como fileira de campos
 * preenchidos: cinco perguntas, marcar "obrigatório", marcar "validação",
 * pronto. Cada uma dessas marcas tem um lado em que ela **não faz nada**, e é
 * esse lado que as lições medem:
 *
 *   - marcar obrigatório **depois** não preenche o que já chegou em branco;
 *   - validação sem parâmetro aceita tudo, porque `Number('')` é zero;
 *   - cinco campos de texto curto são cinco campos e **um** tipo;
 *   - quinze respostas iguais são quinze linhas e uma resposta.
 *
 * ── E a inconsistência de preenchimento não grita ────────────────────────
 * O requisito 5.2 manda corrigir inconsistências, e as três que a caixa
 * carrega são de três naturezas diferentes, como os três defeitos do
 * requisito 7 da CC-ES003:
 *
 *   - **a unidade escrita de quatro jeitos** não aparece na coluna: os quatro
 *     nomes são plausíveis um por um. Ela aparece no resumo, que relata
 *     quatro unidades onde há uma — com o total certo;
 *   - **o campo em branco** aparece na coluna, se alguém olhar, e no resumo
 *     como um grupo vazio, que é o que o Excel escreve;
 *   - **o número com ponto decimal** não aparece em lugar nenhum. Em máquina
 *     pt-BR o separador é a vírgula, então `1.5` é texto: a soma o pula, e o
 *     total sai plausível e menor. É o "número armazenado como texto" da
 *     CC-ES003 chegando por outra porta.
 *
 * ── O clube é o mesmo clube ──────────────────────────────────────────────
 * As unidades vêm de `cadernoDoClube`, que é a vereda exigida no requisito 1.
 * Duas listas de unidades divergiriam no primeiro ajuste, e aí o Falcão teria
 * um conselheiro na planilha e outro no formulário, sem nada estourar porque
 * as duas veredas nunca se olham. É a decisão de `correspondencia` importar
 * `CONSELHEIROS` e de `metasDaCcEs004` importar `moldeDoNome` da CC-ES001.
 */

import { CONSELHEIROS } from './cadernoDoClube';

/* ── Campos ───────────────────────────────────────────────────────────────── */

/**
 * Os tipos de resposta que um formulário oferece.
 *
 * **Não há tipo "e-mail", e é decisão.** A CC-AP044 já pagou por essa
 * confusão do outro lado: a teoria dela dizia que o Access tinha um "tipo
 * e-mail", que nem o Access nem o LibreOffice Base têm. Aqui vale o mesmo com
 * o sinal trocado — o tipo diz **o que cabe** na resposta, e a regra de
 * validação diz **o que vale**. E-mail é uma validação sobre texto curto, que
 * é como todo formulário de verdade a oferece; um tipo próprio apagaria
 * justamente a distinção que o requisito 4 pede ao cobrar as duas coisas
 * separadamente ("três tipos diferentes de resposta" **e** "um campo com
 * validação").
 */
export type TipoDeResposta =
  | 'texto-curto'
  | 'paragrafo'
  | 'escolha-unica'
  | 'varias-escolhas'
  | 'lista'
  | 'numero'
  | 'data';

export const NOME_DO_TIPO: Record<TipoDeResposta, string> = {
  'texto-curto': 'Resposta curta',
  paragrafo: 'Parágrafo',
  'escolha-unica': 'Múltipla escolha',
  'varias-escolhas': 'Caixas de seleção',
  lista: 'Lista suspensa',
  numero: 'Número',
  data: 'Data',
};

/** Os tipos que guardam uma lista de opções, e não texto livre. */
export const TIPOS_COM_OPCOES: TipoDeResposta[] = ['escolha-unica', 'varias-escolhas', 'lista'];

export const temOpcoes = (tipo: TipoDeResposta) => TIPOS_COM_OPCOES.includes(tipo);

export type TipoDeValidacao = 'email' | 'telefone' | 'numero-entre' | 'tamanho-maximo';

/**
 * A regra que diz o que vale dentro do que o tipo deixa caber.
 *
 * `min` e `max` são opcionais porque a caixa da tela nasce vazia, e é aí que
 * mora a armadilha: ver `validacaoVale`.
 */
export interface Validacao {
  tipo: TipoDeValidacao;
  min?: number;
  max?: number;
}

/**
 * Validação sem o parâmetro que ela precisa **não vale**, e a guarda é nossa.
 *
 * `Number('')` é **zero**, e não NaN. Uma regra "número entre" com os dois
 * campos em branco viraria "entre 0 e 0", que recusa todo mundo; uma com só o
 * mínimo em branco viraria "de 0 para cima", que aceita todo mundo. Nos dois
 * casos a tela mostra a regra escrita ao lado do campo e o desbravador marca a
 * tarefa como feita. É a mesma guarda da regra condicional com o campo de
 * comparação em branco, na CC-ES003, e a mesma família do "zero link não é
 * zero link quebrado".
 *
 * E-mail e telefone não têm parâmetro: a regra é o formato, e ela vale sozinha.
 */
export function validacaoVale(v: Validacao | undefined): boolean {
  if (!v) return false;
  if (v.tipo === 'email' || v.tipo === 'telefone') return true;
  if (v.tipo === 'tamanho-maximo') return typeof v.max === 'number' && v.max > 0;
  // numero-entre: os dois lados, e na ordem certa. Invertidos, a regra recusa
  // toda resposta e a tarefa de coletar quinze fica impossível de fechar.
  return typeof v.min === 'number' && typeof v.max === 'number' && v.min < v.max;
}

export interface Campo {
  id: string;
  rotulo: string;
  tipo: TipoDeResposta;
  obrigatorio: boolean;
  validacao?: Validacao;
  /** Só para os tipos de `TIPOS_COM_OPCOES`. */
  opcoes?: string[];
  /**
   * Se o que este campo coleta é dado pessoal, para o requisito 7.
   *
   * **Declarado, e nunca adivinhado pelo rótulo.** Adivinhar exigiria uma
   * lista de palavras — "nome", "telefone" — e erraria nos dois sentidos: "que
   * unidade você acompanha" não é dado pessoal e tem o nome de uma pessoa
   * dentro na resposta, e "como chegamos até você" é. É a mesma decisão da
   * `tabela` declarada na planilha e do dono da conta declarado na CC-ES005.
   *
   * **E a tela nunca o desenha.** O requisito 7 pede que o desbravador
   * identifique quais dados são pessoais; escrever a resposta ao lado de cada
   * pergunta resolveria o requisito numa olhada, e resolveria só para quem
   * olha. É a decisão da linha da nuvem que não escreve o papel de ninguém, na
   * CC-ES006, e `formulario.test.tsx` cobra que ela continue valendo.
   */
  pessoal: boolean;
}

/* ── Respostas ────────────────────────────────────────────────────────────── */

/**
 * O que uma pessoa enviou.
 *
 * `valores` é `Record<string, string>` e não um tipo por campo, porque é isso
 * que um formulário coleta: texto. É daí que vem metade das lições — o `12,5`
 * digitado com vírgula chega como texto e continua texto na planilha, e a soma
 * o pula sem reclamar.
 *
 * Resposta de "caixas de seleção" guarda as escolhas juntas, separadas por
 * `; `, que é como todo formulário as exporta. E é exatamente o separador que
 * o CSV usa em máquina pt-BR — a colisão não é acidente de escrita, é o
 * requisito 5.4 tendo o que mostrar: sem as aspas, a linha inteira desanda.
 */
export interface Resposta {
  id: string;
  /** O instante do envio, `AAAA-MM-DDTHH:MM`. */
  em: string;
  valores: Record<string, string>;
}

export const SEPARADOR_DE_ESCOLHAS = '; ';

export interface Formulario {
  titulo: string;
  descricao: string;
  campos: Campo[];
  aceitandoRespostas: boolean;
  respostas: Resposta[];
}

export const campoPorId = (f: Formulario, id: string): Campo | undefined =>
  f.campos.find(c => c.id === id);

/**
 * O que foi digitado, **sem aparar**.
 *
 * Aparar aqui apagaria em silêncio uma das inconsistências que o requisito 5.2
 * manda consertar: `'Falcao '` com espaço atrás é uma quarta grafia da mesma
 * unidade, e é a que ninguém vê — na planilha ela faz o `PROCV` não achar a
 * linha e a tabela dinâmica abrir um grupo a mais, com o nome escrito igual ao
 * do grupo ao lado. Quem apara é quem responde por "preenchido".
 */
export const valorDa = (r: Resposta, campoId: string): string => r.valores[campoId] ?? '';

/**
 * Se o campo tem resposta.
 *
 * Espaço não é resposta: é a mesma decisão do campo preenchido com espaço que
 * a CC-ES004 já cobra no comentário da liderança. Sem isto, apertar barra de
 * espaço fecharia um campo obrigatório.
 */
export const preenchido = (r: Resposta, campoId: string): boolean =>
  valorDa(r, campoId).trim() !== '';

/* ── O que o requisito 4 cobra, e o lado vazio de cada conta ─────────────── */

/**
 * Os tipos **distintos** que o formulário usa.
 *
 * Cinco campos de resposta curta são cinco campos e um tipo só. Contar campos
 * onde o requisito conta tipos é a conta que deixa a tarefa verde num
 * formulário que não exercitou nada.
 */
export const tiposUsados = (f: Formulario): TipoDeResposta[] =>
  [...new Set(f.campos.map(c => c.tipo))];

export const camposObrigatorios = (f: Formulario): Campo[] =>
  f.campos.filter(c => c.obrigatorio);

/** Só os campos cuja validação de fato recusa alguma coisa. */
export const camposComValidacao = (f: Formulario): Campo[] =>
  f.campos.filter(c => validacaoVale(c.validacao));

/**
 * As respostas que contam como respostas.
 *
 * O requisito 4 pede quinze **reais**, e quinze linhas não são quinze
 * respostas: quinze envios em branco e quinze envios idênticos passam por
 * qualquer contagem. Vazia não conta, e duplicata exata conta uma vez —
 * num formulário com nome, unidade e telefone, duas linhas idênticas são o
 * mesmo envio contado duas vezes, e não duas pessoas.
 */
export function respostasReais(f: Formulario): Resposta[] {
  const vistas = new Set<string>();
  const fora: Resposta[] = [];
  for (const r of f.respostas) {
    if (f.campos.every(c => !preenchido(r, c.id))) continue;
    // A marca compara o que foi digitado, e não a forma aparada: duas linhas
    // que só diferem por um espaço são dois envios, e a que tem o espaço é
    // justamente a que a lição manda achar.
    const marca = f.campos.map(c => valorDa(r, c.id)).join('\u0000');
    if (vistas.has(marca)) continue;
    vistas.add(marca);
    fora.push(r);
  }
  return fora;
}

/**
 * As respostas em que todo campo obrigatório está preenchido.
 *
 * Conta separada de `respostasReais`, e as duas não se substituem: é
 * justamente a distância entre elas que o requisito 5.2 manda fechar. Marcar
 * "obrigatório" hoje não preenche o que chegou em branco ontem — o formulário
 * passa a recusar envio novo e as respostas guardadas continuam exatamente
 * como estavam. É a família do "número guardado não responde por hoje": a
 * marca na tela diz "sem branco", e há branco.
 */
export const respostasCompletas = (f: Formulario): Resposta[] =>
  respostasReais(f).filter(r => camposObrigatorios(f).every(c => preenchido(r, c.id)));

/** O que o formulário recusaria de um envio novo, campo a campo. */
export function recusas(f: Formulario, valores: Record<string, string>): string[] {
  const fora: string[] = [];
  for (const c of f.campos) {
    const v = (valores[c.id] ?? '').trim();
    if (c.obrigatorio && !v) {
      fora.push(`${c.rotulo}: é obrigatório`);
      continue;
    }
    if (!v || !validacaoVale(c.validacao)) continue;
    const erro = porQueRecusa(c.validacao!, v);
    if (erro) fora.push(`${c.rotulo}: ${erro}`);
  }
  return fora;
}

function porQueRecusa(v: Validacao, valor: string): string | null {
  switch (v.tipo) {
    case 'email':
      // Um arroba, com alguma coisa dos dois lados e um ponto depois dele. Não
      // é a gramática inteira do endereço e não tenta ser: o que a lição
      // mostra é que a regra recusa "joana.silva" e aceita o resto.
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor) ? null : 'não parece um endereço de e-mail';
    case 'telefone':
      return /^\(\d{2}\)\s?\d{4,5}-\d{4}$/.test(valor) ? null : 'use o formato (61) 99999-0000';
    case 'tamanho-maximo':
      return valor.length <= v.max! ? null : `passa de ${v.max} caracteres`;
    case 'numero-entre': {
      const n = Number(valor.replace(',', '.'));
      if (Number.isNaN(n)) return 'não é um número';
      return n >= v.min! && n <= v.max! ? null : `precisa estar entre ${v.min} e ${v.max}`;
    }
  }
}

/* ── Inconsistência de preenchimento ─────────────────────────────────────── */

/**
 * A forma comparável de um valor: sem espaço nas pontas, sem caixa e sem
 * acento.
 *
 * É o que faz "Falcão", "falcao", "FALCÃO" e "Falcao " caírem no mesmo grupo.
 * Reduzir para comparar é a mesma ideia do `moldeDoNome` da CC-ES001, com
 * outro alvo: lá o molde apaga o conteúdo e guarda a forma, aqui a forma é
 * apagada e o conteúdo fica.
 */
export const paraComparar = (valor: string): string =>
  valor.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Os grupos de grafia de um campo: forma comparável -> as grafias que
 * apareceram, na ordem em que apareceram.
 */
export function grafiasDe(f: Formulario, campoId: string): Map<string, string[]> {
  const fora = new Map<string, string[]>();
  for (const r of respostasReais(f)) {
    const v = valorDa(r, campoId);
    if (!v.trim()) continue;
    const chave = paraComparar(v);
    const ja = fora.get(chave) ?? [];
    if (!ja.includes(v)) ja.push(v);
    fora.set(chave, ja);
  }
  return fora;
}

/**
 * Os campos em que a mesma coisa foi escrita de mais de um jeito.
 *
 * Esta é a inconsistência que não aparece na coluna: os quatro nomes do Falcão
 * são plausíveis um por um, e quem confere linha a linha não vê nada de
 * errado. Ela aparece no **resumo**, que relata quatro unidades onde há uma —
 * e com o total de respostas certo, que é o que faz ninguém desconfiar.
 */
export function camposComGrafiaDividida(f: Formulario): { campo: Campo; grafias: string[][] }[] {
  const fora: { campo: Campo; grafias: string[][] }[] = [];
  for (const campo of f.campos) {
    // Campo de texto livre não tem grafia dividida: cada resposta é a resposta
    // de alguém. O que se compara é o que devia vir de uma lista fechada.
    if (campo.tipo === 'paragrafo' || campo.tipo === 'data' || campo.tipo === 'numero') continue;
    const divididas = [...grafiasDe(f, campo.id).values()].filter(g => g.length > 1);
    if (divididas.length) fora.push({ campo, grafias: divididas });
  }
  return fora;
}

/** Os campos obrigatórios que têm resposta em branco no que já foi coletado. */
export const camposComBranco = (f: Formulario): Campo[] =>
  camposObrigatorios(f).filter(c => respostasReais(f).some(r => !preenchido(r, c.id)));

/**
 * As respostas em que um campo de número chegou com **ponto** decimal.
 *
 * Esta é a que não tem pista nenhuma na tela do formulário: a resposta está
 * escrita, é plausível, e o formulário aceita as duas formas porque o que ele
 * coleta é texto. Quem não aceita as duas é a planilha: em máquina pt-BR o
 * separador decimal é a **vírgula**, então `1,5` é número e `1.5` é texto —
 * encosta à esquerda, a `SOMA` o pula, e o total sai menor e continua com cara
 * de total.
 *
 * Escrevi este defeito ao contrário na primeira versão, com a vírgula sendo a
 * errada, e quem desmentiu foi o próprio motor: `numeroDoTexto` é pt-BR e lê
 * `1,5` como um e meio. Um cenário que ensinasse o contrário do que o programa
 * faz é pior do que cenário nenhum — é a regra do `exemploSaida` conferido
 * rodando, aplicada a um dado de partida.
 *
 * É o mesmo defeito que a CC-ES003 ensina a achar pelo alinhamento e pela
 * `CONT.NÚM`, agora entrando pelo formulário de quem digita como aprendeu em
 * vez de ser digitado na célula com apóstrofo.
 */
export function numerosComPonto(f: Formulario): { campo: Campo; resposta: Resposta }[] {
  const fora: { campo: Campo; resposta: Resposta }[] = [];
  for (const campo of f.campos.filter(c => c.tipo === 'numero')) {
    for (const r of respostasReais(f)) {
      const v = valorDa(r, campo.id);
      if (v.trim() && v.includes('.')) fora.push({ campo, resposta: r });
    }
  }
  return fora;
}

/** Quantas inconsistências de preenchimento o formulário ainda tem. */
export const inconsistencias = (f: Formulario): number =>
  camposComGrafiaDividida(f).reduce((s, x) => s + x.grafias.length, 0)
  + camposComBranco(f).length
  + numerosComPonto(f).length;

/* ── Da base para a planilha ─────────────────────────────────────────────── */

/**
 * O cabeçalho que o formulário exporta.
 *
 * A primeira coluna é o instante do envio, como em todo formulário — e é ela
 * que faz a base de dados ter uma chave: duas pessoas podem ter o mesmo nome,
 * dois envios não têm o mesmo instante. O requisito 2.3 pede definir chave, e
 * uma base cuja chave é o nome é a base que perde uma das duas Joanas.
 */
/**
 * O rótulo da coluna da chave.
 *
 * Constante porque o motor a escreve e a meta do módulo 3 a procura: duas
 * cópias do mesmo literal divergem no primeiro ajuste de redação, e aí a meta
 * fica impossível de fechar sem nada explicando por quê.
 */
export const ROTULO_DO_INSTANTE = 'Enviado em';

export const cabecalhoDe = (f: Formulario): string[] =>
  [ROTULO_DO_INSTANTE, ...f.campos.map(c => c.rotulo)];

export const linhasDe = (f: Formulario): string[][] =>
  respostasReais(f).map(r => [r.em, ...f.campos.map(c => valorDa(r, c.id))]);

/* ── A caixa de onde as lições partem ────────────────────────────────────── */

export const UNIDADES = CONSELHEIROS.map(([unidade]) => unidade);

export const CAMPO_NOME = 'nome';
export const CAMPO_UNIDADE = 'unidade';
export const CAMPO_EMAIL = 'email';
export const CAMPO_DIARIAS = 'diarias';
export const CAMPO_ALIMENTACAO = 'alimentacao';
export const CAMPO_OBSERVACAO = 'observacao';

/**
 * O formulário de inscrição do acampamento, como ele chega.
 *
 * Ele chega **incompleto de propósito**, e o que falta é o que o requisito 4
 * nomeia: são cinco campos e apenas dois tipos, nenhum obrigatório e nenhum
 * com validação. Chegar pronto faria a lição do módulo 1 medir ter clicado em
 * Salvar.
 */
export function formularioDeInscricao(): Formulario {
  return {
    titulo: 'Inscrição — Acampamento de inverno',
    descricao: 'Preencha uma ficha por desbravador. As inscrições fecham no dia 3 de julho.',
    aceitandoRespostas: true,
    campos: [
      { id: CAMPO_NOME, rotulo: 'Nome do desbravador', tipo: 'texto-curto', obrigatorio: false, pessoal: true },
      { id: CAMPO_UNIDADE, rotulo: 'Unidade', tipo: 'texto-curto', obrigatorio: false, pessoal: false },
      { id: CAMPO_EMAIL, rotulo: 'E-mail do responsável', tipo: 'texto-curto', obrigatorio: false, pessoal: true },
      { id: CAMPO_DIARIAS, rotulo: 'Quantas diárias', tipo: 'texto-curto', obrigatorio: false, pessoal: false },
      { id: CAMPO_OBSERVACAO, rotulo: 'Alguma observação', tipo: 'paragrafo', obrigatorio: false, pessoal: true },
    ],
    respostas: RESPOSTAS_COLETADAS,
  };
}

/**
 * As dezoito respostas que chegaram antes de alguém arrumar o formulário.
 *
 * São dezoito e não quinze porque o requisito 4 pede **no mínimo** quinze e a
 * conta tem de sobreviver ao conserto: uma linha é o mesmo envio repetido e
 * outra chegou vazia, então `respostasReais` devolve dezesseis. Chegar com
 * quinze exatos faria a tarefa de coletar oscilar entre verde e vermelha
 * conforme o conserto, e quem arruma o formulário não devia perder a tarefa
 * anterior. A folga é de uma resposta de propósito: ela não tira a lição de
 * que apagar não é consertar — quem apaga as quatro linhas esquisitas cai para
 * doze — e tira do caminho a oscilação de quem conserta direito.
 *
 * As inconsistências plantadas:
 *
 *   - o Falcão escrito de quatro jeitos, e a Águia de dois;
 *   - uma família que não escolheu unidade, que é o grupo sem nome que o resumo
 *     relata;
 *   - dois responsáveis sem e-mail, num campo que vai virar obrigatório;
 *   - duas diárias escritas com ponto decimal, que numa planilha pt-BR é o
 *     número que vira texto.
 */
export const RESPOSTAS_COLETADAS: Resposta[] = [
  resposta('r01', '2026-06-08T19:12', 'Ana Beatriz Lima', 'Falcão', 'marcia.lima@exemplo.com', '3', 'Vegetariana'),
  resposta('r02', '2026-06-08T19:40', 'Bruno Costa', 'falcao', 'p.costa@exemplo.com', '3', ''),
  resposta('r03', '2026-06-08T20:05', 'Carla Menezes', 'Águia', 'menezes.familia@exemplo.com', '2', 'Chega no sábado'),
  resposta('r04', '2026-06-09T08:22', 'Daniel Rocha', 'FALCÃO', 'rocha.daniel@exemplo.com', '3', ''),
  resposta('r05', '2026-06-09T09:01', 'Eduarda Pires', '', '', '3', ''),
  resposta('r06', '2026-06-09T12:47', 'Felipe Andrade', 'Arara', 'andrade@exemplo.com', '1.5', 'Sai no domingo de manhã'),
  resposta('r07', '2026-06-09T18:33', 'Gabriela Souza', 'aguia', 'souza.g@exemplo.com', '3', ''),
  resposta('r08', '2026-06-10T07:15', 'Henrique Dias', 'Jaguar', 'dias.henrique@exemplo.com', '3', 'Toma remédio às 8h, com suco'),
  resposta('r09', '2026-06-10T10:58', 'Isabela Moreira', 'Onça', 'moreira.i@exemplo.com', '2', ''),
  resposta('r10', '2026-06-10T14:20', 'João Pedro Alves', 'Falcao ', 'alves.jp@exemplo.com', '3', ''),
  resposta('r11', '2026-06-10T21:06', 'Larissa Campos', 'Tucano', '', '3', 'Alergia a amendoim'),
  resposta('r12', '2026-06-11T06:44', 'Matheus Ferraz', 'Arara', 'ferraz.m@exemplo.com', '2.5', ''),
  resposta('r13', '2026-06-11T11:30', 'Natália Brito', 'Jaguar', 'brito.natalia@exemplo.com', '3', ''),
  resposta('r14', '2026-06-11T16:52', 'Otávio Lins', 'Onça', 'lins.otavio@exemplo.com', '3', 'Leva violão'),
  resposta('r15', '2026-06-11T19:18', 'Paula Nogueira', 'Águia', 'nogueira.p@exemplo.com', '1', ''),
  /* O mesmo envio duas vezes: a família apertou Enviar de novo achando que não
     tinha ido. Quinze respostas reais, dezesseis linhas. */
  resposta('r16', '2026-06-11T19:19', 'Paula Nogueira', 'Águia', 'nogueira.p@exemplo.com', '1', ''),
  /* E uma que chegou vazia, do dedo em Enviar antes de escrever nada. Sem a
     guarda do vazio ela contaria como resposta. */
  resposta('r17', '2026-06-12T08:03', '', '', '', '', ''),
  resposta('r18', '2026-06-12T09:35', 'Rafael Tavares', 'Tucano', 'tavares.rafael@exemplo.com', '3', ''),
];

function resposta(
  id: string, em: string,
  nome: string, unidade: string, email: string, diarias: string, observacao: string,
): Resposta {
  return {
    id, em,
    valores: {
      [CAMPO_NOME]: nome,
      [CAMPO_UNIDADE]: unidade,
      [CAMPO_EMAIL]: email,
      [CAMPO_DIARIAS]: diarias,
      [CAMPO_OBSERVACAO]: observacao,
    },
  };
}

/* ── Edição ───────────────────────────────────────────────────────────────── */

export const comCampos = (f: Formulario, campos: Campo[]): Formulario => ({ ...f, campos });

export function comCampo(f: Formulario, id: string, mudar: (c: Campo) => Campo): Formulario {
  return comCampos(f, f.campos.map(c => (c.id === id ? mudar(c) : c)));
}

export function comResposta(f: Formulario, id: string, campoId: string, valor: string): Formulario {
  return {
    ...f,
    respostas: f.respostas.map(r =>
      (r.id === id ? { ...r, valores: { ...r.valores, [campoId]: valor } } : r)),
  };
}

/**
 * Acrescenta um envio, **passando pela recusa**.
 *
 * Devolve `null` quando o formulário recusaria — é o que faz "obrigatório" e
 * "validação" significarem alguma coisa daqui para a frente, e é justamente o
 * que elas não fazem com o que já está guardado.
 */
export function enviar(f: Formulario, valores: Record<string, string>): Formulario | null {
  if (!f.aceitandoRespostas) return null;
  if (recusas(f, valores).length) return null;
  const n = String(f.respostas.length + 1).padStart(2, '0');
  return {
    ...f,
    respostas: [...f.respostas, { id: `r${n}`, em: '2026-06-12T10:00', valores }],
  };
}
