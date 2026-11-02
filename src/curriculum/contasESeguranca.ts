import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DE_CONTAS } from './questoesDeContas';
import { telasDoTopico } from './telas';

/*
 * A vereda CC-ES005 Contas e Segurança Digital.
 *
 * ── O que ela é ─────────────────────────────────────────────────────────
 * O clube tem conta em tudo: e-mail, nuvem de arquivos, rede social,
 * formulário de inscrição, sistema da tesouraria, loja de uniformes. Elas
 * guardam nome completo de criança, telefone de pai e dinheiro de
 * mensalidade, e quem cuida delas é um desbravador ou um diretor que nunca
 * recebeu uma linha de instrução sobre isso.
 *
 * ── Por que ela exige a CC-ES001 ────────────────────────────────────────
 * Está escrito no requisito 1.
 *
 * ── E o que carrega esta vereda é o que não avisa ───────────────────────
 * A matéria inteira é feita de coisas que parecem certas. As duas etapas
 * dizem "ativada" enquanto os códigos de reserva foram embora. O aplicativo
 * autorizado há dois anos continua lendo tudo, e ninguém o vê. A consulta de
 * vazamento responde "nada encontrado" e isso não é atestado. Trocar a senha
 * da conta invadida resolve um terço do problema e a tela fica com cara de
 * resolvida.
 *
 * Nenhuma dessas coisas estoura. Em todas elas, o que a pessoa vê não responde
 * à pergunta que ela precisa fazer — que é a mesma razão da CC-ES004, com
 * outro assunto.
 *
 * ── E o tom ─────────────────────────────────────────────────────────────
 * Isto não é lição de assustar. A vereda inteira evita a frase "você tem de
 * desconfiar de tudo", porque ninguém vive assim e quem tenta volta a clicar
 * em tudo na semana seguinte. O que ela ensina são gestos que cabem num dia:
 * um cofre, uma segunda etapa, uma revisão por ano, e um plano de contas que
 * a próxima diretoria recebe inteiro.
 */

/*
  O exemplo desta vereda é a tela do cofre, da página da conta e do correio, e
  não um quadro de texto.

  Ela nasceu com um esboço em cada tópico — a tabela dos três métodos
  desenhada com espaços, a lista de aplicativos com "fica" e "sai" na margem,
  a mensagem do banco escrita entre aspas —, e o esboço era das próprias
  contas do Clube Pioneiros que o laboratório arruma: a senha repetida, o
  formulário no endereço da Marta, a FotoMágica que lê as mensagens, a loja
  de camisetas que vazou. Os tópicos que ensinam um gesto o mostram no
  laboratório, e os que só explicam uma ideia (o que é a segunda etapa, o
  crachá do "Entrar com", o que é uma mensagem fraudulenta, avisar quem foi
  afetado) ficam em prosa.

  As contas fotografadas são as dos Aventureiros Estrela Guia, e não as do
  clube: o motivo está em `src/exemplos/aventureirosEstrelaGuia.ts`, e
  `exemplosDeContas.test.ts` confere as legendas contra elas.
*/
const V = 'CC-ES005';
const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], atencao: string, marcas: string[],
  telas?: [legenda: string, descricao: string][],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, atencao, marcas,
  ...(telas ? { telas: telasDoTopico(V, id, telas) } : {}),
});

/* ────────────────────────────────────────────────────────────────────────
   Módulo 1 — Senha forte, e o cofre (requisitos 2.1, 2.3, 3 e 4.1)
   ──────────────────────────────────────────────────────────────────────── */

const SENHA_E_COFRE: TopicoDeVereda[] = [
  t(
    'o-que-e-senha-forte',
    'O que faz uma senha resistir',
    'O comprimento, e não a quantidade de símbolos.',
    [
      'Quase todo cadastro pede maiúscula, minúscula, número e símbolo — e essa exigência ensinou o Brasil inteiro a escrever Senha@123. O que ela mede é obediência ao formulário, e não resistência.',
      'Quem tenta adivinhar uma senha não digita uma por vez: um programa testa milhões por segundo. O que decide quanto tempo isso leva é o tamanho do alfabeto elevado ao comprimento — e quem manda aí é o expoente.',
      'Acrescentar um símbolo aumenta o alfabeto em alguns caracteres. Acrescentar quatro letras multiplica o trabalho por vinte e seis vezes vinte e seis vezes vinte e seis vezes vinte e seis. Não é a mesma ordem de grandeza.',
      'Por isso uma frase vence uma sigla. "cavalo bateria grampo correto" não tem maiúscula, número nem símbolo, e aguenta muito mais do que Tr@lh4!, que tem os quatro.',
    ],
    'Frase longa não é frase famosa. "o senhor é meu pastor nada me faltará" é longa e está em toda lista: escolha palavras que não andam juntas.',
    ['senha forte', 'comprimento', 'força bruta'],
    [
      [
        'No gerador do cofre, com o Tamanho em 8, a senha sai com maiúsculas, números e símbolos, e o medidor diz "fraca".',
        'O cofre de senhas dos Aventureiros Estrela Guia, no cartão Gerar uma senha: o controle de tamanho no 8, uma senha de oito caracteres misturados no campo e a barra do medidor curta, escrita fraca.',
      ],
      [
        'Arrastando o Tamanho até 24, com as mesmas três caixas marcadas, o medidor passa a "forte".',
        'O mesmo cartão com o controle de tamanho no 24: a senha gerada ocupa o campo inteiro e a barra do medidor vai até o fim, em verde, escrita forte.',
      ],
    ],
  ),
  t(
    'senha-de-lista',
    'A senha que ninguém adivinha porque todo mundo já tem',
    'Senha@123 tem as quatro classes e cai no primeiro segundo.',
    [
      'Toda vez que um site é invadido, a lista de senhas dos usuários dele acaba publicada. Essas listas existem há mais de vinte anos e hoje têm bilhões de senhas.',
      'Quem ataca uma conta não começa adivinhando caractere a caractere: começa tentando as senhas dessas listas, da mais usada para a menos usada. Isso leva segundos.',
      'Senha@123, P@ssw0rd e Mudar123 estão todas ali, e estão justamente por serem o que a pessoa escreve quando o formulário exige maiúscula, número e símbolo.',
      'Trocar a por arroba e o por zero também não ajuda: é a primeira coisa que o programa desfaz, antes de tentar qualquer outra.',
    ],
    'Uma senha pode ser sua, inédita e mesmo assim estar na lista: milhões de pessoas tiveram a mesma ideia que você.',
    ['lista de senhas vazadas', 'ataque de dicionário'],
    [
      [
        'A Caixa da cantina guarda mudar123: o escudo vermelho aparece na lista, e o medidor diz "frágil".',
        'O cofre com o item Caixa da cantina aberto e a senha à mostra, mudar123; na lista à esquerda, o escudo vermelho ao lado do item, e embaixo do campo a barra curta escrita frágil.',
      ],
      [
        'No Relatório do cofre, embaixo, o item ganha o nome do problema: senha de lista pública.',
        'O fim da página do cofre, no Relatório do cofre, com a linha Caixa da cantina: senha de lista pública circulada e a explicação de que ninguém a adivinha, alguém a tenta.',
      ],
    ],
  ),
  t(
    'gerenciador',
    'O gerenciador de senhas',
    'Um programa que decora as senhas por você, para que elas possam ser impossíveis de decorar.',
    [
      'A conta é simples: ninguém consegue decorar quarenta senhas longas e diferentes. Quem tenta acaba repetindo, ou anotando num papel que fica embaixo do teclado.',
      'O gerenciador resolve isso guardando todas num cofre, fechado por uma senha só — a única que você decora, e por isso a única que precisa ser uma frase longa.',
      'Ele também gera as senhas. Uma senha que você nunca vai digitar pode ter vinte caracteres sem sentido nenhum, porque quem a digita é o programa.',
      'Os gerenciadores moram no navegador, no celular e em programas próprios, e quase todos são gratuitos para uma pessoa. O do clube pode ser compartilhado com a diretoria.',
    ],
    'O cofre é um ponto único: se a senha mestra cair, cai tudo. É por isso que ela é longa e que o cofre também tem duas etapas.',
    ['gerenciador de senhas', 'senha mestra', 'cofre'],
    [
      [
        'A Página na rede social usa Estrela2025 e o cofre avisa que a mesma senha abre outras duas contas. Embaixo, o gerador já tem uma pronta: Usar esta senha.',
        'O cofre com o item Página na rede social aberto: a senha Estrela2025 à mostra, a faixa rosa dizendo que ela também abre o E-mail do clube e a Agenda das reuniões, e o botão Usar esta senha circulado no cartão do gerador.',
      ],
      [
        'Um clique, e a senha do item vira a gerada: vinte caracteres que ninguém vai digitar, e o medidor em "forte".',
        'O mesmo item depois do clique: o campo da senha mostra uma sequência longa de letras, números e símbolos, a barra do medidor vai até o fim em verde e o aviso de senha repetida sumiu.',
      ],
    ],
  ),
  t(
    'reutilizar',
    'Por que repetir a senha é pior do que ter uma senha curta',
    'A curta derruba uma conta. A repetida derruba todas de uma vez, e sem você ter errado em nada.',
    [
      'Uma senha curta e única é fraca de um jeito que se entende: um programa testa todas as combinações e chega nela. O estrago é uma conta.',
      'Uma senha repetida pode até ser longa. O problema dela é outro: basta que **um** dos serviços em que ela está seja invadido para que ela apareça numa lista pública, com o seu e-mail ao lado.',
      'A partir daí, quem baixou a lista tenta esse par de e-mail e senha em todo lugar — e entra em todas as contas em que você repetiu. Nenhuma dessas outras foi atacada. Nenhuma delas tinha defeito.',
      'É por isso que a comparação não é justa: a senha curta depende de alguém escolher você, e a repetida depende de alguém escolher qualquer um dos serviços em que ela está.',
    ],
    'Trocar a senha só do serviço que vazou não resolve: as outras contas continuam com a senha que está na lista.',
    ['reutilização de senha', 'vazamento', 'credential stuffing'],
    [
      [
        'Três itens com o escudo vermelho, e o E-mail do clube avisa: esta mesma senha abre a Agenda das reuniões e a Página na rede social.',
        'O cofre aberto no E-mail do clube, com os escudos vermelhos dos três primeiros itens da lista circulados e a faixa rosa explicando que, se uma das contas vazar, as outras caem junto.',
      ],
      [
        'O Relatório do cofre junta as três numa linha só: a mesma senha em 3 contas.',
        'O Relatório do cofre no fim da página, com a linha A mesma senha em 3 contas circulada, citando o E-mail do clube, a Agenda das reuniões e a Página na rede social.',
      ],
    ],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 2 — Autenticação em duas etapas (requisitos 2.2 e 4.2)
   ──────────────────────────────────────────────────────────────────────── */

const DUAS_ETAPAS: TopicoDeVereda[] = [
  t(
    'o-que-e-duas-etapas',
    'O que é autenticação em duas etapas',
    'Saber a senha deixa de bastar: é preciso também ter alguma coisa.',
    [
      'A senha é uma prova de que você é você, e é uma prova frágil: quem a descobre passa a ser você, sem mais nada.',
      'A verificação em duas etapas acrescenta uma segunda prova, de outra natureza. A senha é uma coisa que você **sabe**; a segunda etapa é uma coisa que você **tem** — o telefone, um aplicativo, uma chave.',
      'O efeito é direto: quem descobre a sua senha, do outro lado do país, ainda precisa estar com o seu telefone na mão. Quase sempre ele desiste e vai tentar outra conta.',
      'Ela é o gesto de segurança com a melhor relação entre trabalho e proteção que existe. Leva dois minutos para ligar e evita quase todo ataque comum.',
    ],
    'Ela protege a entrada, e não o que já está dentro: um aplicativo que você autorizou ontem continua entrando sem passar por etapa nenhuma.',
    ['autenticação em duas etapas', 'segundo fator'],
  ),
  t(
    'os-tres-metodos',
    'Os três métodos, e o que cada um não cobre',
    'Todos são melhores do que nada, e não são equivalentes.',
    [
      'O código por mensagem de texto é o mais oferecido e o mais fraco. Ele protege contra quem só tem a senha, e não protege contra quem convence a operadora a passar o seu número para outro chip — que é um golpe comum e barato.',
      'O código de um aplicativo autenticador nasce dentro do aparelho e não viaja por rede nenhuma, então não há o que interceptar. Ele não protege quando a própria pessoa digita o código numa página falsa.',
      'A chave de segurança física é um objeto que se encaixa no computador. Ela confere o endereço do site antes de responder, então a página falsa não recebe nada — é o único método que resolve o caso acima.',
      'Para o clube, o aplicativo é quase sempre a escolha certa: é gratuito, funciona sem sinal de celular, e não depende de um número que pertence a uma pessoa só.',
    ],
    'O SMS vai para um número, e número de celular é de uma pessoa. Na conta do clube, isso amarra o clube ao telefone de quem um dia vai sair.',
    ['SMS', 'aplicativo autenticador', 'chave de segurança'],
    [
      [
        'Em Segurança, a verificação em duas etapas oferece os três métodos, e cada um diz em vermelho o que ele não cobre. Escolhido o aplicativo, o Ativar acende.',
        'A página Minha Conta na seção Segurança: o cartão Verificação em duas etapas com o selo desativada, os três métodos circulados — mensagem de texto, aplicativo autenticador e chave de segurança física —, cada um com uma linha vermelha do que não protege, e o botão Ativar circulado.',
      ],
    ],
  ),
  t(
    'codigos-de-reserva',
    'Os códigos de reserva, que quase ninguém guarda',
    'Eles aparecem uma vez. Fechar a caixa sem baixá-los é um clique.',
    [
      'Ligar a segunda etapa cria uma dependência nova: sem o telefone, você não entra. Telefone cai no rio, é roubado, quebra, ou simplesmente é trocado.',
      'É para isso que o serviço mostra, na hora de ligar, uma lista de códigos de reserva. Cada um serve uma vez no lugar do código do aplicativo.',
      'Eles aparecem **uma vez só**. Depois de fechada, a caixa não volta, e a tela continua dizendo que a verificação está ativada — que é exatamente o que ela é. O que não está é você conseguindo voltar sem o telefone.',
      'Guarde-os onde você acha depois: impressos numa pasta do clube, ou dentro do cofre de senhas. Num arquivo na mesma nuvem que a conta protege, não: a nuvem também pede a segunda etapa.',
    ],
    'Guardar os códigos dentro da conta que eles protegem é a versão digital de trancar a chave dentro de casa.',
    ['códigos de reserva', 'recuperação'],
    [
      [
        'Ao ativar, aparece o cartão dos Códigos de reserva, com oito números. Ele avisa que não serão mostrados de novo, e tem dois botões: Baixar e Fechar.',
        'O cartão Códigos de reserva circulado, com uma fileira de oito códigos de oito dígitos, a frase de que eles são a única forma de entrar sem o aparelho e os botões Baixar os códigos e Fechar.',
      ],
      [
        'Depois de Baixar os códigos, a linha embaixo diz onde o arquivo foi parar. Quem clica em Fechar não vê linha nenhuma.',
        'O mesmo cartão depois do clique em Baixar, com a frase Arquivo codigos-de-reserva.txt salvo na pasta de downloads circulada embaixo dos botões.',
      ],
    ],
  ),
  t(
    'recuperacao',
    'A porta dos fundos: como se recupera uma conta',
    'De nada adianta trancar a porta e deixar a chave com quem está de saída.',
    [
      'Todo serviço tem um caminho para quem esqueceu a senha, e esse caminho manda um código para um endereço ou telefone cadastrado antes.',
      'Isso quer dizer que o endereço de recuperação **é** a conta. Quem entra nele consegue trocar a senha e tomar o que ele recupera, por mais forte que a senha fosse e por mais etapas que houvesse.',
      'Num clube, esse endereço costuma ser a caixa pessoal de quem criou a conta. Enquanto essa pessoa está ali, tudo funciona; quando ela sai, o clube fica com uma conta cuja recuperação é de outra pessoa.',
      'A recuperação de uma conta do clube deve apontar para outro endereço do clube, ou para dois — nunca para a caixa pessoal de um membro.',
    ],
    'Conferir a recuperação é parte de ligar a segunda etapa, e não um ajuste separado para depois.',
    ['e-mail de recuperação', 'esqueci minha senha'],
    [
      [
        'Em Formas de recuperar a conta, o e-mail de recuperação ainda é o endereço pessoal da diretora, lucia.prado@gmail.com.',
        'A seção Segurança rolada até o cartão Formas de recuperar a conta, com a linha E-mail de recuperação circulada mostrando lucia.prado@gmail.com e o botão Alterar.',
      ],
      [
        'Alterar abre a caixa do novo endereço: o da secretaria do clube, que não sai com ninguém.',
        'A caixa E-mail de recuperação aberta por cima da página, com secretaria@aventureirosestrela.org escrito no campo e os botões Salvar e Cancelar.',
      ],
    ],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 3 — Permissão de aplicativo (requisitos 2.6 e 4.3)
   ──────────────────────────────────────────────────────────────────────── */

const PERMISSAO_DE_APLICATIVO: TopicoDeVereda[] = [
  t(
    'entrar-com',
    'O que acontece quando você clica em "Entrar com"',
    'Você não dá a senha. Dá um crachá — e o crachá continua valendo depois.',
    [
      'Quase todo aplicativo oferece "Entrar com o Google" ou "Entrar com o Facebook". É cômodo e é mais seguro do que criar uma senha nova em cada site.',
      'O que acontece por trás é isto: o aplicativo não recebe a sua senha. Ele recebe uma autorização — um crachá — que diz o que ele pode fazer na sua conta.',
      'Esse crachá é separado da senha, e é isso que quase ninguém sabe. Trocar a senha depois **não** cancela crachá nenhum: eles continuam valendo, e quem os tem continua entrando.',
      'Cancelar um crachá é outro gesto, em outra tela: a lista de aplicativos conectados à conta.',
    ],
    'Trocar a senha é o primeiro conselho que todo mundo dá, e ele não alcança os aplicativos autorizados.',
    ['permissão de aplicativo', 'entrar com', 'autorização'],
  ),
  t(
    'escopos',
    'O que o aplicativo pediu, e o que ele precisava',
    'A tela de permissões aparece uma vez, por dois segundos, e ninguém lê.',
    [
      'Na hora de autorizar, o serviço mostra a lista do que o aplicativo está pedindo: ver seu nome, ler suas mensagens, criar e apagar seus arquivos, ver seus contatos, publicar no seu perfil.',
      'Essa lista é a decisão inteira, e ela aparece no meio de um clique que a pessoa já decidiu dar. Quase todo mundo clica em Permitir sem ler.',
      'A pergunta a fazer é uma só: isto que ele pede é o que ele faz? Um aplicativo que põe filtro em foto precisa ver a foto. Ele não precisa ler as suas mensagens nem ver a sua lista de contatos.',
      'Quando um aplicativo pede muito mais do que o serviço dele explica, a razão costuma ser que o produto não é o filtro: o produto são os seus dados.',
    ],
    'Permitir é rápido e cancelar é escondido: a tela de permissões aparece sozinha, e a lista dos autorizados você tem de procurar.',
    ['permissões', 'escopo', 'dados pessoais'],
    [
      [
        'Em Aplicativos conectados, o Quiz Relâmpago pediu nome e foto, ler todas as mensagens, a lista de contatos e publicar no perfil — para fazer perguntas de quiz.',
        'A seção Aplicativos conectados da conta com o item Quiz Relâmpago circulado: autorizado em 2024-02, usado pela última vez há 2 anos, e as quatro permissões listadas embaixo do nome.',
      ],
    ],
  ),
  t(
    'revisar',
    'Revisar não é revogar tudo',
    'Permissão não vence sozinha: quem autorizou uma vez continua autorizado para sempre.',
    [
      'Um aplicativo autorizado num acampamento de dois anos atrás continua com o crachá dele hoje. Ninguém o abre, ninguém pensa nele, e ele continua podendo entrar.',
      'Revisar é passar a lista e decidir um por um. O dado que ajuda é a data do último uso, que o próprio serviço mostra: aplicativo que ninguém abre há um ano é porta aberta sem ninguém do outro lado.',
      'O caminho rápido é remover todos, e ele quebra o que está funcionando. O aplicativo que monta a agenda das reuniões é justamente um desses — e quem o desligou não vai desconfiar dele quando os avisos da semana pararem de chegar.',
      'Uma revisão por ano basta. Marque no mesmo dia em que a diretoria muda.',
    ],
    'Cancelar um crachá não avisa o aplicativo: ele simplesmente para de funcionar na próxima vez que tentar.',
    ['revisar acesso', 'revogar', 'último uso'],
    [
      [
        'Cada aplicativo diz quando foi usado pela última vez: a Agenda das Reuniões anteontem, o Quiz Relâmpago há 2 anos, os Cartões de Aniversário há 10 meses.',
        'A lista dos três aplicativos conectados, com a linha de data de cada um circulada: anteontem, há 2 anos e há 10 meses.',
      ],
      [
        'Removidos o Quiz e os Cartões, fica a Agenda das Reuniões — a que o clube usa toda semana.',
        'A mesma seção depois de duas remoções, com o título 1 com acesso à conta e só o item Agenda das Reuniões circulado.',
      ],
    ],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 4 — Vazamento de dados (requisitos 2.4 e 4.4)
   ──────────────────────────────────────────────────────────────────────── */

const VAZAMENTO: TopicoDeVereda[] = [
  t(
    'o-que-e-vazamento',
    'O que é um vazamento de dados',
    'Alguém invade um serviço e leva a lista de usuários dele. Você não fez nada.',
    [
      'Um vazamento acontece do lado da empresa, e não do seu. A papelaria onde o clube compra material foi invadida, e a lista de clientes dela — com endereço de e-mail e senha — foi levada.',
      'Essas listas circulam e acabam publicadas. Existem sites que juntam todas elas e deixam qualquer um consultar se um endereço aparece em alguma.',
      'Consultar é gratuito e leva dez segundos. O que se descobre é em quais vazamentos aquele endereço apareceu, quando, e o que vazou junto — só o e-mail, ou também a senha.',
      'O que vazou muda tudo. Vazou só o endereço: você vai receber mais spam. Vazou a senha: aquela senha precisa deixar de existir, em todo lugar onde ela esteja.',
    ],
    'A culpa é da empresa e o prejuízo é seu. Não dá para escolher empresas que nunca vazam: dá para não repetir senha entre elas.',
    ['vazamento de dados', 'lista pública', 'consulta'],
    [
      [
        'Na consulta de vazamento, o endereço do clube aparece na Papelaria Online, em 2026-03: vazou o endereço de e-mail e a senha.',
        'O cartão Verificar se um endereço consta em vazamento, com aventureiros.estrela@gmail.com no campo e o achado Papelaria Online · 2026-03 circulado, com a linha Vazou: endereço de e-mail, senha.',
      ],
    ],
  ),
  t(
    'nada-encontrado',
    '"Nada encontrado" não é atestado',
    'A consulta responde sobre as listas que ela conhece, e não sobre o mundo.',
    [
      'Quando a consulta não acha nada, é fácil ler ali uma garantia. Não é.',
      'O que ela diz é que aquele endereço não aparece nas listas públicas que ela consultou. Há vazamento que ninguém descobriu, vazamento descoberto e não publicado, e vazamento publicado sem os endereços dentro.',
      'A consulta é um sinal quando acha, e não é sinal nenhum quando não acha. Ela serve para agir, e nunca para relaxar.',
      'Por isso os gestos que valem não dependem dela: senha diferente em cada serviço, segunda etapa ligada, e revisão dos aplicativos. Esses três protegem inclusive do vazamento que ninguém ainda sabe que houve.',
    ],
    'Quem lê "nada encontrado" como atestado costuma adiar exatamente os três gestos que funcionariam de qualquer jeito.',
    ['falso negativo', 'limite da consulta'],
    [
      [
        'Consultando o endereço da secretaria, a resposta é que ele não aparece em nenhuma das listas públicas consultadas — e é só isso que ela diz.',
        'O mesmo cartão com secretaria@aventureirosestrela.org no campo e, embaixo, a frase circulada de que o endereço não aparece em nenhuma das listas públicas consultadas.',
      ],
    ],
  ),
  t(
    'o-que-fazer',
    'O que fazer quando a consulta acha alguma coisa',
    'Trocar a senha do serviço que vazou, e de todos os outros onde ela estava.',
    [
      'O primeiro gesto é trocar a senha daquele serviço. O segundo é o que quase ninguém faz: trocar em todos os outros lugares onde aquela mesma senha foi usada.',
      'Quem baixou a lista não vai tentar só na loja que vazou. Vai tentar o par de e-mail e senha em tudo — e é ali que a reutilização cobra.',
      'Se o vazamento é antigo e a senha já mudou desde então, não há o que fazer: aquela senha não abre mais nada. É por isso que a data importa.',
      'E ligue a segunda etapa na conta principal, se ainda não estiver ligada. Com ela, a senha vazada deixa de bastar mesmo que alguém a tenha.',
    ],
    'Trocar a senha por outra parecida — Estrela2026 no lugar de Estrela2025 — não adianta: quem tem a lista tenta as variações primeiro.',
    ['troca de senha', 'propagação do vazamento'],
    [
      [
        'O cartão Senha diz quando ela foi trocada: em 2023-09, antes do vazamento de 2026-03. A senha que vazou continua abrindo a conta.',
        'A seção Segurança com o cartão Senha circulado, mostrando Trocada pela última vez em 2023-09 e o botão Trocar a senha.',
      ],
      [
        'Trocar a senha abre a caixa com uma senha nova já sorteada, e avisa que as outras sessões vão cair.',
        'A caixa Trocar a senha aberta por cima da página, com uma senha longa sorteada no campo, a frase de que trocar encerra as outras sessões e os botões Salvar e Cancelar.',
      ],
      [
        'Depois de Salvar, a data muda para 2026-09. Agora a senha da lista não abre mais esta conta — e falta trocá-la nas outras onde ela estava.',
        'O cartão Senha depois de salvar, com a linha Trocada pela última vez em 2026-09 circulada.',
      ],
    ],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 5 — Configurações de privacidade (requisito 4.5)
   ──────────────────────────────────────────────────────────────────────── */

const PRIVACIDADE: TopicoDeVereda[] = [
  t(
    'o-que-decidem',
    'O que as configurações de privacidade decidem',
    'Quem enxerga o quê — e os padrões vêm abertos.',
    [
      'Toda conta de serviço tem uma tela que decide o que outras pessoas veem: o perfil, a lista de quem participa, telefones, fotos, e o que você fez ali dentro.',
      'Essas escolhas quase nunca começam fechadas. O serviço ganha com a conta visível, então o padrão é o mais aberto que a lei deixa — e o padrão é o que fica, porque quase ninguém procura essa tela.',
      'Num clube isso pesa mais do que numa conta pessoal: a lista de membros são nomes completos de crianças, e os telefones cadastrados são dos pais, dados na inscrição para o clube usar.',
      'Procurar essa tela uma vez por ano é o gesto inteiro. Ela costuma estar em Configurações, numa seção chamada Privacidade ou Dados e privacidade.',
    ],
    'Ninguém avisa quando um serviço acrescenta um ajuste novo — e ele nasce no padrão aberto, como todos os outros.',
    ['privacidade', 'configuração padrão'],
    [
      [
        'Em Privacidade, a conta chega com a lista de membros aberta a qualquer pessoa e os telefones dos pais a quem segue o clube.',
        'A seção Privacidade da conta, com o cartão Quem vê o quê e as duas linhas circuladas: Quem pode ver a lista de membros em qualquer pessoa e Quem pode ver os telefones cadastrados em quem segue o clube.',
      ],
    ],
  ),
  t(
    'local-nas-fotos',
    'O ajuste que mais custa num clube',
    'A foto do acampamento sai com o lugar onde ele está acontecendo, agora.',
    [
      'Celular grava, dentro de cada foto, onde ela foi tirada. Muitos serviços publicam essa informação junto quando a foto é postada.',
      'Numa conta pessoal isso já é demais. Numa conta de clube, a foto que sai é de crianças, e o lugar que sai junto é onde elas estão neste fim de semana.',
      'Quase ninguém sabe que esse ajuste existe, e ele fica ligado em muitos serviços por padrão. Desligá-lo é um clique.',
      'E vale para o depois também: fotos já publicadas continuam com o local. Vale conferir as antigas na mesma visita.',
    ],
    'O local também aparece quando alguém baixa a foto: a informação vai dentro do arquivo, e não só na legenda.',
    ['localização', 'metadados da foto'],
    [
      [
        'Publicar o local junto das fotos vem em "sim": quem vê a foto do passeio vê também onde as crianças estão.',
        'A seção Privacidade com a linha Publicar o local junto das fotos circulada, a explicação embaixo do nome e a caixa de escolha em sim.',
      ],
      [
        'Um clique na caixa, e o ajuste passa a "não". As fotos novas saem sem o lugar.',
        'A mesma linha circulada depois da troca, com a caixa de escolha em não.',
      ],
    ],
  ),
  t(
    'ajustar-nao-e-fechar',
    'Ajustar não é fechar tudo',
    'Existe um botão que fecha tudo de uma vez, e ele também esconde o clube de quem procura o clube.',
    [
      'Muitos serviços oferecem um atalho: deixar tudo privado. Ele é tentador porque resolve a tela inteira num clique.',
      'O que ele faz junto é tirar a página do clube dos sites de busca — e é por ali que uma família que ouviu falar do clube o encontra. Um clube invisível para de crescer.',
      'A palavra do requisito é **ajustar**, e ajustar é decidir um por um. O que precisa fechar é o que mostra dados de gente. O que precisa continuar aberto é o que faz o clube ser encontrado.',
      'É a mesma ideia de revisar aplicativos: o caminho rápido resolve a tela e quebra o que estava funcionando.',
    ],
    'O contrário também existe: abrir tudo para "ter mais alcance" põe nome e telefone de criança na busca.',
    ['ajustar', 'decisão caso a caso'],
    [
      [
        'Deixar tudo privado fecha os dados de gente — e põe em "não" também a busca, que é por onde uma família nova acha o clube.',
        'A seção Privacidade depois do botão Deixar tudo privado: as cinco caixas no valor mais fechado, e a linha A página do clube aparece em sites de busca circulada, em não.',
      ],
      [
        'Ajustar é voltar a busca para "sim" e deixar a lista de membros só com a diretoria: uma decisão por linha.',
        'A mesma seção com duas linhas circuladas: a da busca de volta em sim e a da lista de membros em só a diretoria.',
      ],
    ],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 6 — Mensagem fraudulenta (requisitos 2.5 e 5)
   ──────────────────────────────────────────────────────────────────────── */

const MENSAGEM_FRAUDULENTA: TopicoDeVereda[] = [
  t(
    'o-que-e',
    'O que é uma mensagem fraudulenta',
    'Ela não ataca o computador. Ataca a pressa de quem lê.',
    [
      'Mensagem fraudulenta é a que se faz passar por alguém em quem você confia para conseguir uma coisa: a sua senha, um clique num arquivo, ou um pagamento.',
      'Ela não precisa de falha nenhuma no computador. O caminho dela é você — e por isso antivírus nenhum a impede.',
      'Quase todas seguem a mesma receita: um remetente conhecido, um assunto que assusta ou que interessa, e um único caminho a seguir depressa.',
      'Reconhecer não é decorar uma lista de mensagens ruins. É parar antes de clicar e olhar três coisas: quem mandou, para onde leva, e o que está sendo pedido.',
    ],
    'A melhor delas não tem erro de português nenhum, chega num dia em que faz sentido, e fala de uma coisa que você estava mesmo esperando.',
    ['mensagem fraudulenta', 'phishing', 'engenharia social'],
  ),
  t(
    'indicios',
    'Os indícios que denunciam uma mensagem',
    'O endereço de quem mandou, o destino do link, e o que está sendo pedido.',
    [
      'O nome de quem manda é escrito livremente: qualquer um põe "Correios" ali. O que não se falsifica é o endereço depois do arroba, e é a primeira coisa a olhar.',
      'O texto de um link também é livre. Ele pode dizer correios.com.br e levar a outro lugar — e o destino de verdade aparece na barra de baixo quando você para o ponteiro em cima, sem clicar. No celular, segurando o dedo no link.',
      'Anexo que ninguém pediu é outro indício, ainda mais com dois pontos no nome: boleto.pdf.exe é um programa, e não um documento. O computador lê a última extensão.',
      'E o mais direto de todos: nenhum serviço pede a sua senha por mensagem, nem o código das duas etapas. Quem pede, pede porque não tem.',
    ],
    'Erro de português é indício, e a ausência dele não é atestado: as mensagens mais caras são bem escritas.',
    ['domínio', 'link disfarçado', 'anexo', 'extensão dupla'],
    [
      [
        'A mensagem diz que vem dos Correios, e o endereço depois do arroba é correios-entregas-br.net.',
        'O correio com a mensagem Sua encomenda está retida: pague a taxa até hoje aberta, e a linha do remetente circulada: Correios, rastreio@correios-entregas-br.net.',
      ],
      [
        'O link diz correios.com.br/rastreio. Parado o ponteiro em cima, a barra de baixo mostra o destino de verdade: correios-entregas-br.net/taxa.',
        'A mesma mensagem com dois círculos: o link azul no corpo, escrito correios.com.br/rastreio, e no canto de baixo da janela o endereço para onde ele leva, http://correios-entregas-br.net/taxa.',
      ],
      [
        'O anexo da mensagem do sorteio se chama comprovante-premio.pdf.exe: termina em .exe, e é um programa.',
        'A mensagem Seu clube ganhou um kit de brinquedos aberta, com o anexo comprovante-premio.pdf.exe circulado embaixo do texto.',
      ],
    ],
  ),
  t(
    'o-que-nao-e-indicio',
    'O que parece indício e não é',
    'Prazo não é indício. Link não é indício. Desconfiar de tudo não protege ninguém.',
    [
      'Quem aprende "mensagem com prazo é golpe" passa a desconfiar da secretária que pediu a escala antes de sexta. O indício não é o prazo: é a **ameaça** junto do prazo, para você agir antes de pensar.',
      'Quem aprende "mensagem com link é golpe" passa a desconfiar de quase toda mensagem verdadeira do mundo. O indício não é o link: é o link cujo texto discorda do destino.',
      'Esse excesso tem custo. Quem desconfia de tudo acaba cansando, para de olhar, e volta a clicar em tudo — e aí a regra não protegeu nada e ainda atrapalhou.',
      'O objetivo não é nunca clicar. É olhar três coisas antes de clicar, e saber que uma mensagem verdadeira também tem prazo, link e anexo.',
    ],
    'Marcar uma mensagem verdadeira como golpe tem preço: a próxima da mesma pessoa vai para o lixo eletrônico, e ninguém lê.',
    ['falso positivo', 'prazo', 'link honesto'],
    [
      [
        'A Lúcia pede resposta até quinta — tem prazo, e não tem ameaça nenhuma. E o endereço é o de sempre.',
        'O correio com a mensagem Lanche do passeio aberta: o remetente Lúcia Prado, lucia.prado@gmail.com, e o pedido de avisar até quinta para fechar a lista da cantina, os dois circulados.',
      ],
      [
        'A agenda manda um link, e o destino na barra de baixo é o mesmo endereço que o texto diz.',
        'A mensagem Sua agenda tem três reuniões nesta semana aberta, com o link agendadasreunioes.com/semana circulado no corpo e, no canto de baixo, o destino https://agendadasreunioes.com/semana.',
      ],
    ],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 7 — Quando a conta cai (requisito 6)
   ──────────────────────────────────────────────────────────────────────── */

const CONTA_COMPROMETIDA: TopicoDeVereda[] = [
  t(
    'a-ordem',
    'A ordem das providências, e por que ela importa',
    'Trocar a senha vem antes de encerrar as sessões — na ordem contrária, ele volta.',
    [
      'Quando uma conta cai, a vontade é mexer em tudo ao mesmo tempo. A ordem, porém, muda o resultado.',
      'Encerrar as outras sessões parece o gesto mais urgente, e é o que costuma ser feito primeiro. Só que quem invadiu continua sabendo a senha: ele entra de novo no minuto seguinte, e você acabou de derrubar o celular de quem trabalha no clube.',
      'Trocar a senha primeiro faz as duas coisas de uma vez: a senha antiga deixa de valer e as outras sessões caem junto, que é o que os serviços fazem.',
      'Depois disso é que vale conferir o resto — e o resto é mais do que parece.',
    ],
    'Em alguns serviços trocar a senha não derruba as sessões. Confira a lista de aparelhos depois de trocar, sempre.',
    ['conta comprometida', 'ordem das providências', 'sessões'],
    [
      [
        'A conta invadida, em Atividade da conta: além do notebook e do iPhone, um Linux com navegador desconhecido, em Manaus, há 5 minutos.',
        'A página da conta com a faixa vermelha Atividade incomum na sua conta e o cartão Aparelhos com sessão aberta circulado, listando o Notebook da secretaria, um iPhone e um Linux com navegador desconhecido em Manaus, com botões Encerrar.',
      ],
      [
        'Trocada a senha em Segurança, a lista de aparelhos fica só com o notebook em que se fez a troca.',
        'O mesmo cartão depois da troca de senha, circulado, com um único aparelho: Notebook da secretaria, marcado este aparelho.',
      ],
    ],
  ),
  t(
    'as-tres-portas',
    'As três portas que a senha nova não fecha',
    'Recuperação, crachá de aplicativo e encaminhamento sobrevivem à troca de senha.',
    [
      'A primeira é a recuperação. Quem invade quase sempre troca o e-mail de recuperação para o endereço dele — e a partir daí ele clica em "esqueci minha senha" e recebe o código. A sua senha nova não muda isso.',
      'A segunda é o crachá de um aplicativo. Ele é separado da senha, então continua valendo. Basta autorizar um aplicativo qualquer enquanto está dentro para manter a porta.',
      'A terceira não o traz de volta e é a pior de esquecer: uma regra de encaminhamento, que copia toda mensagem recebida para o endereço dele. Ele não precisa entrar — a conta manda tudo sozinha, todo dia, e nada muda na sua caixa de entrada.',
      'Nenhuma das três aparece na tela principal. Todas moram três cliques fundo nas configurações, e é preciso ir lá olhar. Na mesma visita, confira os filtros: uma regra que apaga o que chega de certo remetente esconde o aviso de troca de senha que o serviço manda.',
    ],
    'O encaminhamento é o único que não deixa sinal nenhum: a caixa de entrada continua exatamente igual.',
    ['recuperação', 'token de aplicativo', 'encaminhamento'],
    [
      [
        'Com a senha nova, a faixa vermelha continua. O e-mail de recuperação virou verificacao.conta@outlook.com, que não é de ninguém do clube.',
        'A seção Segurança rolada até Formas de recuperar a conta, com a linha E-mail de recuperação circulada mostrando verificacao.conta@outlook.com.',
      ],
      [
        'Em Aplicativos conectados apareceu um quarto: Backup Automático de E-mails, autorizado ontem, lendo e enviando mensagens.',
        'A lista de aplicativos conectados com quatro itens e o último, Backup Automático de E-mails, circulado: autorizado ontem, usado há 5 minutos, com permissão para ler e enviar mensagens e ver contatos.',
      ],
      [
        'E em Atividade, uma regra copia toda mensagem recebida para o mesmo endereço — a caixa de entrada continua igual.',
        'A seção Atividade da conta com o cartão Encaminhamento de mensagens circulado, mostrando a regra Copiar toda mensagem recebida para verificacao.conta@outlook.com, criada ontem, com o botão Apagar.',
      ],
    ],
  ),
  t(
    'avisar',
    'Avisar quem foi afetado',
    'A conta do clube fala com famílias. Elas precisam saber antes de receber a próxima mensagem.',
    [
      'Enquanto a conta esteve invadida, quem entrou podia mandar mensagem em nome do clube — e esse é o uso mais comum de uma conta tomada: pedir dinheiro a quem confia nela.',
      'Então o último passo não é técnico. É avisar a diretoria e as famílias, dizendo o que aconteceu, em que período, e o que o clube nunca vai pedir por mensagem.',
      'Avisar cedo evita o prejuízo de verdade. Avisar depois é explicar por que alguém pagou um boleto falso.',
      'E vale conferir a pasta de enviados: o que saiu de lá durante o período diz a quem avisar primeiro.',
    ],
    'Quem se cala por vergonha transfere o prejuízo para a família que confiou no endereço do clube.',
    ['comunicação', 'enviados', 'prejuízo'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 8 — O plano de contas do clube (requisitos 7 e 8)
   ──────────────────────────────────────────────────────────────────────── */

const PLANO_DE_CONTAS: TopicoDeVereda[] = [
  t(
    'conta-de-pessoa',
    'Por que a conta do clube não pode ser de uma pessoa',
    'Ninguém precisa sair de má-fé. Basta perder o telefone.',
    [
      'As contas do clube nascem quase sempre do mesmo jeito: alguém precisou de uma, criou com o e-mail pessoal dela, e ficou assim.',
      'Enquanto essa pessoa está no clube, funciona. Ela sai — muda de cidade, entra na faculdade, assume outra função — e a conta vai junto, porque está no nome dela e a recuperação chega na caixa dela.',
      'Não é preciso nem que alguém saia. Basta perder o telefone com o aplicativo das duas etapas dentro, ou ficar doente na semana do acampamento.',
      'E há o outro lado: misturar o que é do clube com o que é da pessoa também expõe a pessoa. A caixa pessoal dela passa a ser a porta de entrada de tudo o que é do clube.',
    ],
    'A conta no nome de uma pessoa não dá erro nenhum enquanto ela está ali — e é por isso que ninguém arruma antes de precisar.',
    ['conta institucional', 'endereço pessoal'],
    [
      [
        'O Formulário de matrícula está no endereço pessoal da Lúcia, e o cofre diz: a conta está no nome de uma pessoa.',
        'O cofre com o item Formulário de matrícula aberto e o cartão Quem entra nesta conta, com o selo de uma pessoa circulado.',
      ],
      [
        'Passar para a conta do clube troca o usuário para o endereço da secretaria, e o selo passa a dizer do clube.',
        'O mesmo cartão depois do botão, com o selo do clube circulado, e na lista à esquerda o item Formulário de matrícula com o usuário secretaria@aventureirosestrela.org.',
      ],
    ],
  ),
  t(
    'quem-tem-acesso',
    'Quem tem acesso a cada conta',
    'Duas pessoas em cada uma: uma só se perde, e três ninguém controla.',
    [
      'O plano de contas do clube responde três perguntas: quais contas existem, quem entra em cada uma, e como esse acesso passa para a próxima diretoria.',
      'A primeira pergunta é a mais fácil de errar por omissão: quase todo clube descobre uma conta esquecida no meio do ano, quando ela para de funcionar.',
      'Para a segunda, a regra prática é duas pessoas. Uma só é o que se perde quando ela não está; muitas é o que ninguém acompanha, e aí não se sabe quem ainda entra.',
      'O cofre de senhas do clube é onde esse plano mora: ele lista as contas, guarda as senhas e diz quem tem acesso a cada uma — que é exatamente o que o plano precisa dizer.',
    ],
    'Conta esquecida continua existindo, continua com dados dentro, e continua sendo invadível — e ninguém está olhando para ela.',
    ['plano de contas', 'acesso compartilhado'],
    [
      [
        'O E-mail do clube só tem a Lúcia em Tem acesso hoje — se ela não estiver, ninguém entra.',
        'O cartão Quem entra nesta conta do E-mail do clube, com a linha Tem acesso hoje circulada, mostrando só a etiqueta Lúcia.',
      ],
      [
        'Dar acesso a Paulo põe a segunda pessoa na conta.',
        'A mesma linha circulada depois do botão Dar acesso a Paulo, com as etiquetas Lúcia e Paulo.',
      ],
    ],
  ),
  t(
    'troca-de-diretoria',
    'A troca de diretoria, e o que ela precisa fazer',
    'Tirar o nome da lista não faz ninguém esquecer a senha que digitou por três anos.',
    [
      'Quando alguém deixa a diretoria, o primeiro gesto é tirar o acesso dela — e ele é o que quase todo clube faz, quando faz.',
      'O segundo gesto é o que quase ninguém faz, e é o que importa: trocar as senhas que essa pessoa sabia. Ela continua se lembrando delas, e o cofre agora diz que ela não tem acesso. As duas coisas ao mesmo tempo.',
      'Não é sobre confiar ou não confiar em quem saiu. É que a senha na cabeça de alguém que não está mais ali é uma senha a mais circulando, e ninguém vai saber se ela for parar em outro lugar.',
      'Feito isso, o plano é entregue à diretoria nova inteiro: as contas, quem entra, as senhas novas no cofre e os endereços de recuperação conferidos.',
    ],
    'Fazer só o passo 1 deixa o cofre dizendo uma coisa e a realidade dizendo outra — e nada na tela mostra a diferença.',
    ['troca de diretoria', 'rotação de senha', 'entrega'],
    [
      [
        'A Lúcia deixa a diretoria: o acesso passa ao Paulo e à Débora, e o dela sai pelo x da etiqueta.',
        'O cartão Quem entra nesta conta com a linha Tem acesso hoje circulada, mostrando as etiquetas Paulo e Débora e o botão Dar acesso a Lúcia embaixo.',
      ],
      [
        'E a senha que ela sabia é trocada pela do gerador. Sem este passo, o cofre diz que ela não entra e ela continua entrando.',
        'O topo do item E-mail do clube depois de Usar esta senha, com o campo da senha mostrando uma sequência longa e a barra do medidor em forte, os dois circulados.',
      ],
    ],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Os oito módulos
   ──────────────────────────────────────────────────────────────────────── */

export const MODULOS_DE_CONTAS_E_SEGURANCA: ModuloDeVereda[] = [
  {
    id: 'm1',
    titulo: 'Senha forte, e o cofre',
    resumo: 'O que faz uma senha resistir, por que repetir é pior do que ser curta, e o programa que decora por você.',
    licoes: [
      {
        id: 'm1-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_CONTAS['m1-teoria'],
        perguntas: 4,
        titulo: 'O comprimento é que manda',
        resumo: 'As listas de senhas vazadas, o gerenciador, e a conta que o requisito 3 pede.',
        topicos: SENHA_E_COFRE,
      },
      {
        id: 'm1-lab', tipo: 'contas', licao: 'senhas',
        titulo: 'Arrumando o cofre do clube',
        resumo: 'Seis contas, uma senha repetida em quatro delas, e o gerador que resolve em seis cliques.',
        verificacoes: ['gerou-forte', 'sem-lista', 'sem-reuso', 'curta-trocada'],
      },
    ],
  },
  {
    id: 'm2',
    titulo: 'Verificação em duas etapas',
    resumo: 'A segunda prova, os três métodos, os códigos que aparecem uma vez, e a porta dos fundos.',
    licoes: [
      {
        id: 'm2-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_CONTAS['m2-teoria'],
        perguntas: 4,
        titulo: 'Saber a senha deixa de bastar',
        resumo: 'O que cada método cobre, e por que a recuperação decide mais do que a senha.',
        topicos: DUAS_ETAPAS,
      },
      {
        id: 'm2-lab', tipo: 'contas', licao: 'duas-etapas',
        titulo: 'Ligando a segunda etapa da conta do clube',
        resumo: 'Escolher o método, guardar os códigos antes de fechar a caixa, e tirar a recuperação da caixa pessoal da secretária.',
        verificacoes: ['ativou', 'guardou', 'recuperacao-do-clube'],
      },
    ],
  },
  {
    id: 'm3',
    titulo: 'Permissão de aplicativo',
    resumo: 'O crachá que o "Entrar com" entrega, o que ele permite, e por que ele não vence sozinho.',
    licoes: [
      {
        id: 'm3-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_CONTAS['m3-teoria'],
        perguntas: 4,
        titulo: 'O crachá que continua valendo',
        resumo: 'Por que trocar a senha não alcança os aplicativos, e o que a tela de permissões está perguntando.',
        topicos: PERMISSAO_DE_APLICATIVO,
      },
      {
        id: 'm3-lab', tipo: 'contas', licao: 'aplicativos',
        titulo: 'Revisando quem tem acesso à conta',
        resumo: 'Três aplicativos autorizados, dois abandonados há mais de ano — e o terceiro é por onde as inscrições chegam.',
        verificacoes: ['foto-fora', 'sorteador-fora'],
      },
    ],
  },
  {
    id: 'm4',
    titulo: 'Vazamento de dados',
    resumo: 'O que vaza do lado da empresa, como se consulta, e o que "nada encontrado" não quer dizer.',
    licoes: [
      {
        id: 'm4-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_CONTAS['m4-teoria'],
        perguntas: 4,
        titulo: 'A culpa é da empresa e o prejuízo é seu',
        resumo: 'Consultar é um sinal quando acha, e não é sinal nenhum quando não acha.',
        topicos: VAZAMENTO,
      },
      {
        id: 'm4-lab', tipo: 'contas', licao: 'vazamento',
        titulo: 'Consultando os endereços do clube',
        resumo: 'Um vazamento de abril, uma senha parada desde 2024, e um endereço pessoal que é a recuperação de tudo.',
        verificacoes: ['consultou-clube', 'consultou-pessoal', 'senha-vazada-trocada'],
      },
    ],
  },
  {
    id: 'm5',
    titulo: 'Configurações de privacidade',
    resumo: 'Quem enxerga o quê, por que os padrões vêm abertos, e por que fechar tudo não é ajustar.',
    licoes: [
      {
        id: 'm5-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_CONTAS['m5-teoria'],
        perguntas: 4,
        titulo: 'O padrão é o que fica',
        resumo: 'O local dentro da foto, a lista de membros, e o botão que esconde o clube de quem procura o clube.',
        topicos: PRIVACIDADE,
      },
      {
        id: 'm5-lab', tipo: 'contas', licao: 'privacidade',
        titulo: 'Ajustando a privacidade da conta do clube',
        resumo: 'Fechar o que mostra gente, desligar o local das fotos, e manter o clube achável.',
        verificacoes: ['dados-fechados', 'local-fora'],
      },
    ],
  },
  {
    id: 'm6',
    titulo: 'Mensagem fraudulenta',
    resumo: 'Quem mandou, para onde leva, o que está sendo pedido — e o que parece indício e não é.',
    licoes: [
      {
        id: 'm6-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_CONTAS['m6-teoria'],
        perguntas: 4,
        titulo: 'Ela ataca a pressa de quem lê',
        resumo: 'Os indícios que denunciam, e por que prazo e link sozinhos não denunciam nada.',
        topicos: MENSAGEM_FRAUDULENTA,
      },
      {
        id: 'm6-lab', tipo: 'contas', licao: 'golpes',
        titulo: 'Analisando a caixa de entrada do clube',
        resumo: 'Cinco mensagens, três fraudulentas — e duas verdadeiras que também têm prazo e link.',
        verificacoes: ['tres-analisadas', 'poupou-as-verdadeiras'],
      },
    ],
  },
  {
    id: 'm7',
    titulo: 'Quando a conta cai',
    resumo: 'A ordem das providências, as três portas que a senha nova não fecha, e quem precisa ser avisado.',
    licoes: [
      {
        id: 'm7-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_CONTAS['m7-teoria'],
        perguntas: 4,
        titulo: 'A ordem muda o resultado',
        resumo: 'Por que encerrar as sessões antes de trocar a senha o traz de volta, e o que sobrevive à troca.',
        topicos: CONTA_COMPROMETIDA,
      },
      {
        id: 'm7-lab', tipo: 'contas', licao: 'invasao',
        titulo: 'Retomando a conta invadida',
        resumo: 'A senha primeiro, e então a recuperação, a sessão, o aplicativo e a regra que copia tudo para fora.',
        verificacoes: [
          'senha-trocada', 'recuperacao-retomada', 'sessoes-encerradas',
          'aplicativo-fora', 'encaminhamento-apagado', 'duas-etapas-depois',
        ],
      },
    ],
  },
  {
    id: 'm8',
    titulo: 'O plano de contas do clube',
    resumo: 'Quais contas existem, quem entra em cada uma, e o que a troca de diretoria precisa fazer.',
    licoes: [
      {
        id: 'm8-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_CONTAS['m8-teoria'],
        perguntas: 4,
        titulo: 'A conta do clube é do clube',
        resumo: 'Por que ela não pode estar no nome de uma pessoa, e por que tirar o acesso não basta.',
        topicos: PLANO_DE_CONTAS,
      },
      {
        id: 'm8-lab', tipo: 'contas', licao: 'plano',
        titulo: 'Montando o plano e passando a diretoria',
        resumo: 'Passar a conta pessoal para o clube, pôr duas pessoas em cada uma, e trocar as senhas de quem saiu.',
        verificacoes: [
          'nada-no-nome-de-alguem', 'duas-pessoas-em-cada', 'marta-saiu', 'senhas-que-ela-sabia',
        ],
      },
    ],
  },
];
