/*
  As curiosidades: o catálogo, sem as regras.

  Curiosidade é a conquista que diz *como* e *quando* se estuda, e não
  *quanto*: não tem classe, não rende XP e não forma escada. Na Faixa ela é um
  pin recortado na forma do desenho — a arte mora em
  `public/assets/pins/<code>.png` e é achada pelo código, sem lista nenhuma.

  ── Por que o catálogo e as regras moram em arquivos separados ────────────
  O catálogo é lido por `insignias.ts`, que é lido por quase toda tela. As
  regras (`curiosidades.ts`) leem eventos, o currículo e a ofensiva, e a
  ofensiva lê `atividade.ts`: com as duas coisas no mesmo arquivo, a tela que
  só quer o nome de uma insígnia arrastaria o currículo inteiro junto, e o
  laço de imports devolveria `undefined` calado no meio da inicialização —
  a armadilha que já tirou o `LIMIAR_DOMINIO` de `progress.ts`.

  ── As quatro que já existiam ─────────────────────────────────────────────
  `madrugador`, `fim_de_semana` e `semana_inteira` mantêm o código. O
  Madrugador mudou de janela (era das 5h às 7h; é das 0h às 6h), e quem o
  ganhou pela regra antiga continua com ele. A `coruja` saiu: premiava uma
  criança de dez anos por estudar de madrugada, e a migration que a aposenta
  dá o Madrugador a quem a tinha, com a data original — todo horário dela cabe
  no Madrugador novo.

  A lista foi fechada no planejamento (`docs/faixa-planejamento.md`, seção 7):
  mudar daqui é edição consciente de lá também.
*/

export type TemaDaCuriosidade = 'calendario' | 'ritmo' | 'jeito' | 'explorador' | 'segredo';

export interface Curiosidade {
  code: string;
  nome: string;
  descricao: string;
  tema: TemaDaCuriosidade;
  /** O que se lê no lugar vazio de um segredo, antes de achá-lo. */
  dica?: string;
}

/** O glifo provisório de cada tema, até a arte recortada chegar. */
export const ICONE_DO_TEMA: Record<TemaDaCuriosidade, string> = {
  calendario: 'calendar',
  ritmo: 'clock',
  jeito: 'theory',
  explorador: 'route',
  segredo: 'star',
};

export const NOME_DO_TEMA: Record<TemaDaCuriosidade, string> = {
  calendario: 'Calendário da computação',
  ritmo: 'Ritmo',
  jeito: 'Jeito de estudar',
  explorador: 'Explorador',
  segredo: 'Segredos',
};

const c = (tema: TemaDaCuriosidade) => (code: string, nome: string, descricao: string, dica?: string): Curiosidade =>
  ({ code, nome, descricao, tema, ...(dica ? { dica } : {}) });
const cal = c('calendario'), rit = c('ritmo'), jei = c('jeito'), exp = c('explorador'), seg = c('segredo');

export const CURIOSIDADES: readonly Curiosidade[] = [
  /* ── Calendário da computação: estudar na semana da data ── */
  cal('virada_sem_bug', 'Virada sem Bug', 'Estudou na semana de 1º de janeiro, a virada que o bug do milênio ameaçou em 2000.'),
  cal('internet_segura', 'Internet Segura', 'Estudou na segunda semana de fevereiro, a do Dia da Internet Segura.'),
  cal('mulheres_na_ciencia', 'Mulheres na Ciência', 'Estudou na semana de 11 de fevereiro, o dia das mulheres e meninas na ciência.'),
  cal('dia_que_quase_nao_existe', 'O Dia que Quase Não Existe', 'Estudou num 29 de fevereiro, o dia que só existe nos anos bissextos.'),
  cal('nascimento_da_web', 'Nascimento da Web', 'Estudou na semana de 12 de março, quando a Web foi proposta, em 1989.'),
  cal('dia_do_pi', 'Dia do π', 'Estudou na semana de 14 de março, o 3/14 dos primeiros algarismos de π.'),
  cal('copia_de_seguranca', 'Cópia de Segurança', 'Estudou na semana de 31 de março, o Dia Mundial do Backup.'),
  cal('meninas_nas_tic', 'Meninas nas TIC', 'Estudou na semana da quarta quinta-feira de abril, o dia das meninas na tecnologia.'),
  cal('senha_forte', 'Senha Forte', 'Estudou na semana da primeira quinta-feira de maio, o Dia Mundial da Senha.'),
  cal('homem_que_calculava', 'O Homem que Calculava', 'Estudou na semana de 6 de maio, o Dia Nacional da Matemática.'),
  cal('sociedade_da_informacao', 'Sociedade da Informação', 'Estudou na semana de 17 de maio, o dia mundial das telecomunicações.'),
  cal('alan_turing', 'Alan Turing', 'Estudou na semana de 23 de junho, quando nasceu Alan Turing.'),
  cal('dia_do_emoji', 'Dia do Emoji', 'Estudou na semana de 17 de julho, o Dia do Emoji.'),
  cal('primeiro_site', 'Primeiro Site', 'Estudou na semana de 6 de agosto, quando o primeiro site foi ao ar, em 1991.'),
  cal('dia_da_fotografia', 'Dia da Fotografia', 'Estudou na semana de 19 de agosto, o Dia Mundial da Fotografia.'),
  cal('pinguim', 'Pinguim', 'Estudou na semana de 25 de agosto, quando o Linux foi anunciado, em 1991.'),
  cal('byte_do_ano', 'Byte do Ano', 'Estudou na semana do 256º dia do ano, o Dia do Programador.'),
  cal('codigo_aberto', 'Código Aberto', 'Estudou na semana do terceiro sábado de setembro, o Dia do Software Livre.'),
  cal('ada_lovelace', 'Ada Lovelace', 'Estudou na semana da segunda terça-feira de outubro, o dia de Ada Lovelace.'),
  cal('quadro_a_quadro', 'Quadro a Quadro', 'Estudou na semana de 28 de outubro, o Dia Internacional da Animação.'),
  cal('dia_do_designer', 'Dia do Designer', 'Estudou na semana de 5 de novembro, o Dia do Designer.'),
  cal('seguranca_da_informacao', 'Segurança da Informação', 'Estudou na semana de 30 de novembro, o dia da segurança de computadores.'),
  cal('grace_hopper', 'Grace Hopper', 'Estudou na semana de 9 de dezembro, quando nasceu Grace Hopper.'),

  /* ── Ritmo: quando se estuda ── */
  rit('madrugador', 'Madrugador', 'Estudou entre a meia-noite e as seis da manhã.'),
  rit('pessoa_da_manha', 'Pessoa da Manhã', 'Estudou entre as seis da manhã e o meio-dia.'),
  rit('pessoa_da_tarde', 'Pessoa da Tarde', 'Estudou entre o meio-dia e as seis da tarde.'),
  rit('noturno', 'Noturno', 'Estudou entre as seis da tarde e a meia-noite.'),
  rit('fim_de_semana', 'Fim de Semana', 'Estudou num sábado ou domingo.'),
  rit('semana_inteira', 'Semana Inteira', 'Estudou em todos os sete dias da semana, em algum momento.'),
  rit('pausa_boa', 'Pausa Boa', 'Estudou duas vezes no mesmo dia, com duas horas ou mais de pausa entre uma e outra.'),
  rit('doze_meses', 'Doze Meses', 'Estudou em cada um dos doze meses do ano.'),
  rit('um_ano_de_faixa', 'Um Ano de Faixa', 'Estudou na semana em que fez um ano da primeira atividade.'),

  /* ── Jeito de estudar ── */
  jei('revisao', 'Revisão', 'Refez uma lição já vencida e venceu de novo.'),
  jei('de_primeira', 'De Primeira', 'Venceu uma avaliação final na primeira tentativa.'),
  jei('modulo_de_uma_vez', 'Módulo de uma Vez', 'Venceu a teoria e o laboratório do mesmo módulo de vereda no mesmo dia.'),
  jei('consulta', 'Consulta', 'Abriu a referência da vereda durante um laboratório e o venceu depois.'),
  jei('palavra_propria', 'Palavra Própria', 'Acrescentou a primeira palavra ao dicionário pessoal.'),
  jei('mao_no_teclado', 'Mão no Teclado', 'Usou cinco atalhos de teclado diferentes nas simulações.'),
  jei('botao_direito', 'Botão Direito', 'Abriu um menu de contexto, com o botão direito ou segurando o dedo.'),
  jei('na_parede', 'Na Parede', 'Baixou ou imprimiu um Token.Web().'),
  jei('relatorio_entregue', 'Relatório Entregue', 'Gerou o relatório para o clube.'),
  jei('conferido', 'Conferido', 'Verificou um Token.Web() na página pública de verificação.'),

  /* ── Explorador: variedade ── */
  exp('rosa_dos_ventos', 'Rosa dos Ventos', 'Venceu ao menos uma lição em cada família de vereda.'),
  exp('tres_frentes', 'Três Frentes', 'Avançou em três trilhas diferentes na mesma semana.'),
  exp('ponte', 'Ponte', 'Concluiu uma vereda e a trilha ou vereda de onde ela saiu.'),
  exp('todas_as_janelas', 'Todas as Janelas', 'Venceu um laboratório em cada programa que a plataforma imita.'),
  exp('poliglota', 'Poliglota', 'Venceu laboratórios em cinco linguagens diferentes.'),

  /* ── Segredos: só aparecem depois de achados ── */
  seg('arquivo_escondido', 'Arquivo Escondido', 'Mostrou os itens ocultos no Explorador e abriu o arquivo que estava lá.', 'Nem tudo aparece na pasta.'),
  seg('extensoes_a_mostra', 'Extensões à Mostra', 'Ligou as extensões de nome de arquivo no Explorador.', 'Todo nome tem um sobrenome.'),
  seg('lixeira_arqueologica', 'Lixeira Arqueológica', 'Restaurou o item mais antigo da Lixeira.', 'Alguém jogou fora há muito tempo.'),
  seg('leitor_de_manual', 'Leitor de Manual', 'Pediu --help a um comando no terminal.', 'Todo comando tem instruções.'),
  seg('quem_sou_eu', 'Quem Sou Eu', 'Perguntou whoami ao terminal.', 'O computador sabe quem você é?'),
  seg('viajante_no_tempo', 'Viajante no Tempo', 'Voltou um repositório a um commit antigo.', 'O Git lembra de tudo.'),
  seg('zen_do_python', 'Zen do Python', 'Escreveu import this no editor de Python.', 'O Python tem uma filosofia escondida.'),
  seg('mapa_do_banco', 'Mapa do Banco', 'Consultou sqlite_master no editor de SQL.', 'O banco guarda a própria planta.'),
  seg('fim_da_planilha', 'Fim da Planilha', 'Foi com Ctrl+↓ até a última linha de uma planilha.', 'Até onde vai uma planilha?'),
  seg('texto_de_enchimento', 'Texto de Enchimento', 'Escreveu =rand() no Word e viu o texto aparecer.', 'O Word escreve sozinho, se você pedir.'),
  seg('gato_pintado', 'Gato Pintado', 'Trocou a cor do ator no Scratch.', 'O gato não precisa ser laranja.'),
];

export const CODIGOS_DAS_CURIOSIDADES: ReadonlySet<string> = new Set(CURIOSIDADES.map(x => x.code));
