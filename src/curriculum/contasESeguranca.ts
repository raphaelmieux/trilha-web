import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DE_CONTAS } from './questoesDeContas';

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

const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], exemplo: string, atencao: string, marcas: string[],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, exemplo, exemploComo: 'texto' as const, atencao, marcas,
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
    `Duas senhas, e quanto cada uma custa para adivinhar

Tr@lh4!                          7 caracteres, 4 classes
cavalo bateria grampo correto   29 caracteres, 2 classes

A segunda leva mais tempo para cair do que a primeira,
e por uma margem que não cabe nesta tela.`,
    'Frase longa não é frase famosa. "o senhor é meu pastor nada me faltará" é longa e está em toda lista: escolha palavras que não andam juntas.',
    ['senha forte', 'comprimento', 'força bruta'],
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
    `O que o programa tenta, e em que ordem

1. As senhas das listas públicas          segundos
2. As mesmas, com @ no lugar de a         segundos
3. Palavras do dicionário com número no fim  minutos
4. Todas as combinações possíveis         depende do comprimento`,
    'Uma senha pode ser sua, inédita e mesmo assim estar na lista: milhões de pessoas tiveram a mesma ideia que você.',
    ['lista de senhas vazadas', 'ataque de dicionário'],
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
    `Sem cofre                        Com cofre

40 senhas para decorar            1 frase longa para decorar
→ a mesma repetida em todas       → 40 senhas diferentes e longas
→ ou anotadas num papel           → guardadas e preenchidas sozinhas`,
    'O cofre é um ponto único: se a senha mestra cair, cai tudo. É por isso que ela é longa e que o cofre também tem duas etapas.',
    ['gerenciador de senhas', 'senha mestra', 'cofre'],
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
    `A loja de camisetas é invadida.
A lista com os clientes dela é publicada.

clubepioneiros@gmail.com : Pioneiros2026

Quem baixar essa lista tenta o par em todo lugar:

  e-mail do clube        → entra
  nuvem de arquivos      → entra
  rede social do clube   → entra
  formulários            → entra

A loja foi atacada. As outras quatro não.`,
    'Trocar a senha só do serviço que vazou não resolve: as outras contas continuam com a senha que está na lista.',
    ['reutilização de senha', 'vazamento', 'credential stuffing'],
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
    `Sem duas etapas          Com duas etapas

senha → entrou           senha → "digite o código"
                                → código → entrou

Quem tem só a senha para na segunda linha.`,
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
    `Método            Protege de                 Não protege de

SMS               quem só tem a senha         troca de chip
Aplicativo        interceptação de rede       página falsa
Chave física      página falsa também         perder a chave`,
    'O SMS vai para um número, e número de celular é de uma pessoa. Na conta do clube, isso amarra o clube ao telefone de quem um dia vai sair.',
    ['SMS', 'aplicativo autenticador', 'chave de segurança'],
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
    `Ao ligar a verificação em duas etapas:

  Códigos de reserva
  48392017   71048826   30559184   62710493
  19384756   82019473   57263841   40192837

  [ Baixar os códigos ]   [ Fechar ]

Fechar sem baixar não dá erro nenhum.
A tela continua escrita "ativada".`,
    'Guardar os códigos dentro da conta que eles protegem é a versão digital de trancar a chave dentro de casa.',
    ['códigos de reserva', 'recuperação'],
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
    `A conta do clube tem:

  senha forte            ✓
  duas etapas ligadas    ✓
  recuperação → marta.oliveira@gmail.com

Quem entrar na caixa pessoal da Marta clica em
"esqueci minha senha" e recebe o código lá.
As duas linhas de cima não valem nada.`,
    'Conferir a recuperação é parte de ligar a segunda etapa, e não um ajuste separado para depois.',
    ['e-mail de recuperação', 'esqueci minha senha'],
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
    `Você clica em "Entrar com o Google" no FotoMágica.

O FotoMágica NÃO recebe:   sua senha
O FotoMágica RECEBE:       um crachá com permissões

Você troca a senha depois.
O crachá continua valendo.`,
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
    `FotoMágica Filtros quer acesso a:

  Ver seu nome e sua foto          faz sentido
  Ler todas as suas mensagens      não faz
  Ver sua lista de contatos        não faz
  Publicar no seu perfil           não faz`,
    'Permitir é rápido e cancelar é escondido: a tela de permissões aparece sozinha, e a lista dos autorizados você tem de procurar.',
    ['permissões', 'escopo', 'dados pessoais'],
  ),
  t(
    'revisar',
    'Revisar não é revogar tudo',
    'Permissão não vence sozinha: quem autorizou uma vez continua autorizado para sempre.',
    [
      'Um aplicativo autorizado num acampamento de dois anos atrás continua com o crachá dele hoje. Ninguém o abre, ninguém pensa nele, e ele continua podendo entrar.',
      'Revisar é passar a lista e decidir um por um. O dado que ajuda é a data do último uso, que o próprio serviço mostra: aplicativo que ninguém abre há um ano é porta aberta sem ninguém do outro lado.',
      'O caminho rápido é remover todos, e ele quebra o que está funcionando. No clube, o aplicativo dos formulários de inscrição é justamente um desses — e quem o desligou não vai desconfiar dele quando as inscrições pararem de chegar.',
      'Uma revisão por ano basta. Marque no mesmo dia em que a diretoria muda.',
    ],
    `Aplicativos conectados

  Formulários do Clube     usado ontem            fica
  FotoMágica Filtros       há 1 ano e 3 meses     sai
  Sorteador de Brindes     há 1 ano               sai

Remover os três é mais rápido,
e as inscrições do acampamento param de chegar.`,
    'Cancelar um crachá não avisa o aplicativo: ele simplesmente para de funcionar na próxima vez que tentar.',
    ['revisar acesso', 'revogar', 'último uso'],
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
      'Um vazamento acontece do lado da empresa, e não do seu. A loja onde o clube comprou camisetas foi invadida, e a lista de clientes dela — com endereço de e-mail, senha e telefone — foi levada.',
      'Essas listas circulam e acabam publicadas. Existem sites que juntam todas elas e deixam qualquer um consultar se um endereço aparece em alguma.',
      'Consultar é gratuito e leva dez segundos. O que se descobre é em quais vazamentos aquele endereço apareceu, quando, e o que vazou junto — só o e-mail, ou também a senha.',
      'O que vazou muda tudo. Vazou só o endereço: você vai receber mais spam. Vazou a senha: aquela senha precisa deixar de existir, em todo lugar onde ela esteja.',
    ],
    `Consulta do endereço clubepioneiros@gmail.com

  Loja de Camisetas Online — abril de 2026
  Vazou: endereço de e-mail, senha, telefone

A senha do clube não muda desde 2024.
Ela está nessa lista, e continua abrindo a conta hoje.`,
    'A culpa é da empresa e o prejuízo é seu. Não dá para escolher empresas que nunca vazam: dá para não repetir senha entre elas.',
    ['vazamento de dados', 'lista pública', 'consulta'],
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
    `ninguem@exemplo.org não aparece em
nenhuma das listas públicas consultadas.

Isso quer dizer:   nenhuma lista pública tem este endereço
Isso NÃO quer dizer: nenhum serviço seu foi invadido`,
    'Quem lê "nada encontrado" como atestado costuma adiar exatamente os três gestos que funcionariam de qualquer jeito.',
    ['falso negativo', 'limite da consulta'],
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
    `Vazamento de abril, com senha.
Sua senha não muda desde 2024.

1. Trocar a senha do serviço que vazou
2. Trocar nos outros onde ela também estava
3. Ligar a segunda etapa

Só o passo 1 deixa as outras contas abertas.`,
    'Trocar a senha por outra parecida — Pioneiros2027 — não adianta: quem tem a lista tenta as variações primeiro.',
    ['troca de senha', 'propagação do vazamento'],
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
    `Privacidade — como a conta do clube chega

  A página aparece em sites de busca        sim
  Quem vê a lista de membros                qualquer pessoa
  Quem vê os telefones cadastrados          qualquer pessoa
  Publicar o local junto das fotos          sim
  Usar o que você faz para escolher anúncios sim`,
    'Ninguém avisa quando um serviço acrescenta um ajuste novo — e ele nasce no padrão aberto, como todos os outros.',
    ['privacidade', 'configuração padrão'],
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
    `A mesma foto, com o ajuste ligado e desligado

  Ligado:    Acampamento de inverno
             Chácara Recanto Verde — a 12 km de Brasília
             publicado há 4 minutos

  Desligado: Acampamento de inverno
             publicado há 4 minutos`,
    'O local também aparece quando alguém baixa a foto: a informação vai dentro do arquivo, e não só na legenda.',
    ['localização', 'metadados da foto'],
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
    `Depois de "Deixar tudo privado"

  A página aparece em sites de busca         não   ← quebrou
  Quem vê a lista de membros                 só a diretoria
  Quem vê os telefones cadastrados           só a diretoria
  Publicar o local junto das fotos           não
  Usar o que você faz para anúncios          não

Os dados ficaram guardados.
E nenhuma família nova acha o clube.`,
    'O contrário também existe: abrir tudo para "ter mais alcance" põe nome e telefone de criança na busca.',
    ['ajustar', 'decisão caso a caso'],
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
    `A receita, quase sempre igual

  quem você conhece  +  motivo urgente  +  um clique

  "Banco do Brasil"  +  "conta bloqueada em 24h"  +  [confirmar dados]`,
    'A melhor delas não tem erro de português nenhum, chega num dia em que faz sentido, e fala de uma coisa que você estava mesmo esperando.',
    ['mensagem fraudulenta', 'phishing', 'engenharia social'],
  ),
  t(
    'indicios',
    'Os indícios que denunciam uma mensagem',
    'O endereço de quem mandou, o destino do link, e o que está sendo pedido.',
    [
      'O nome de quem manda é escrito livremente: qualquer um põe "Banco do Brasil" ali. O que não se falsifica é o endereço depois do arroba, e é a primeira coisa a olhar.',
      'O texto de um link também é livre. Ele pode dizer bb.com.br e levar a outro lugar — e o destino de verdade aparece na barra de baixo quando você para o ponteiro em cima, sem clicar. No celular, segurando o dedo no link.',
      'Anexo que ninguém pediu é outro indício, ainda mais com dois pontos no nome: boleto.pdf.exe é um programa, e não um documento. O computador lê a última extensão.',
      'E o mais direto de todos: nenhum serviço pede a sua senha por mensagem, nem o código das duas etapas. Quem pede, pede porque não tem.',
    ],
    `O que olhar, na ordem

  1. o endereço depois do @
     "Banco do Brasil" <seguranca@bb-atendimento-cliente.com>

  2. o destino do link, parando o ponteiro em cima
     texto: bb.com.br/seguranca
     vai para: bb-atendimento-cliente.com/verificar

  3. o que está sendo pedido
     senha, código, dados do cartão → nunca`,
    'Erro de português é indício, e a ausência dele não é atestado: as mensagens mais caras são bem escritas.',
    ['domínio', 'link disfarçado', 'anexo', 'extensão dupla'],
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
    `Duas mensagens verdadeiras

  Marta Oliveira <marta.oliveira@gmail.com>
  "Quem não puder ir, me avisa antes de sexta"
  → tem prazo, não tem ameaça

  Correio <avisos@correio.com>
  "correio.com/conta/armazenamento"  →  correio.com/conta/armazenamento
  → tem link, e ele vai para onde diz que vai`,
    'Marcar uma mensagem verdadeira como golpe tem preço: a próxima da mesma pessoa vai para o lixo eletrônico, e ninguém lê.',
    ['falso positivo', 'prazo', 'link honesto'],
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
    `Na ordem errada

  encerrar sessões → ele entra de novo
  trocar a senha   → agora sim

Na ordem certa

  trocar a senha   → as sessões caem junto
  conferir o resto`,
    'Em alguns serviços trocar a senha não derruba as sessões. Confira a lista de aparelhos depois de trocar, sempre.',
    ['conta comprometida', 'ordem das providências', 'sessões'],
  ),
  t(
    'as-tres-portas',
    'As três portas que a senha nova não fecha',
    'Recuperação, crachá de aplicativo e encaminhamento sobrevivem à troca de senha.',
    [
      'A primeira é a recuperação. Quem invade quase sempre troca o e-mail de recuperação para o endereço dele — e a partir daí ele clica em "esqueci minha senha" e recebe o código. A sua senha nova não muda isso.',
      'A segunda é o crachá de um aplicativo. Ele é separado da senha, então continua valendo. Basta autorizar um aplicativo qualquer enquanto está dentro para manter a porta.',
      'A terceira não o traz de volta e é a pior de esquecer: uma regra de encaminhamento, que copia toda mensagem recebida para o endereço dele. Ele não precisa entrar — a conta manda tudo sozinha, todo dia, e nada muda na sua caixa de entrada.',
      'Nenhuma das três aparece na tela principal. Todas moram três cliques fundo nas configurações, e é preciso ir lá olhar.',
    ],
    `Depois de trocar a senha, confira:

  Recuperação            → é um endereço seu?
  Aplicativos conectados → apareceu algum que você não instalou?
  Encaminhamento         → há regra copiando as mensagens?
  Filtros                → há regra apagando o que chega?

E só então ligue a segunda etapa.`,
    'O encaminhamento é o único que não deixa sinal nenhum: a caixa de entrada continua exatamente igual.',
    ['recuperação', 'token de aplicativo', 'encaminhamento'],
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
    `A mensagem que o clube manda depois

  "Entre quarta e sexta, alguém teve acesso à conta de
   e-mail do clube. Já corrigimos.

   Se você recebeu do nosso endereço algum pedido de
   pagamento nesse período, ele não é nosso.

   O clube nunca pede pagamento por mensagem."`,
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
    `Contas do clube, como elas costumam estar

  E-mail do clube       clubepioneiros@gmail.com   Marta
  Nuvem de arquivos     clubepioneiros@gmail.com   Marta
  Rede social           @clubepioneiros            Marta
  Formulários           marta.oliveira@gmail.com   Marta
  Tesouraria            tesouraria.pioneiros       Ronaldo
  Loja de uniformes     clubepioneiros@gmail.com   Marta, Ronaldo

A Marta sai. O clube perde quatro contas.`,
    'A conta no nome de uma pessoa não dá erro nenhum enquanto ela está ali — e é por isso que ninguém arruma antes de precisar.',
    ['conta institucional', 'endereço pessoal'],
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
    `O plano, escrito

  Conta                Entra quem          Recuperação
  E-mail do clube      Ronaldo, Cleide     diretoria@...
  Nuvem de arquivos    Ronaldo, Cleide     diretoria@...
  Rede social          Ronaldo, Cleide     diretoria@...
  Formulários          Ronaldo, Cleide     diretoria@...
  Tesouraria           Ronaldo, Cleide     diretoria@...
  Loja de uniformes    Ronaldo, Cleide     diretoria@...`,
    'Conta esquecida continua existindo, continua com dados dentro, e continua sendo invadível — e ninguém está olhando para ela.',
    ['plano de contas', 'acesso compartilhado'],
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
    `Troca de diretoria — a lista

  1. Tirar o acesso de quem saiu
  2. Trocar a senha de toda conta que essa pessoa abria
  3. Conferir o e-mail de recuperação de cada uma
  4. Pôr duas pessoas da diretoria nova em cada conta
  5. Entregar o cofre e o plano

O passo 2 é o que ninguém faz.`,
    'Fazer só o passo 1 deixa o cofre dizendo uma coisa e a realidade dizendo outra — e nada na tela mostra a diferença.',
    ['troca de diretoria', 'rotação de senha', 'entrega'],
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
