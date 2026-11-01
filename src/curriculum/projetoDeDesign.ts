import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DO_PROJETO_DE_DESIGN as Q } from './questoesDoProjetoDeDesign';
import { telasDoTopico } from './telas';

/*
 * A vereda CC-DG006 Projeto de Design.
 *
 * ── O que ela é ─────────────────────────────────────────────────────────
 * A última da família de Design, e a que junta as outras cinco num projeto
 * só: uma demanda real de comunicação do clube, um público, quatro peças, o
 * processo contado, a entrega organizada, o retorno de cinco pessoas e a
 * apresentação. Nenhum programa novo: cada peça se faz na janela da vereda
 * que a ensinou, e o que esta ensina é o que liga as quatro.
 *
 * ── O que fica fora do aplicativo ────────────────────────────────────────
 * Escolher a demanda de verdade, desenhar os rascunhos no papel, mostrar a
 * peça a cinco pessoas e apresentar com a peça impressa na mão. A plataforma
 * percorre o caminho inteiro sobre um projeto de exemplo — o convite do
 * Acampamento das Famílias — para que o projeto de cada um não seja a
 * primeira vez de nada.
 *
 * ── A teoria mostra outro projeto ────────────────────────────────────────
 * O convite é o que o laboratório percorre, e os rascunhos, os descartes, a
 * hora que o público pede e os nomes dos finais dele são respostas. A teoria
 * fala do mutirão do córrego, de `src/exemplos/mutiraoDoCorrego.ts`, e os
 * tópicos que ensinam um gesto o mostram tela por tela nas janelas das
 * veredas que o requisito 1 exige.
 *
 * ── Os números ──────────────────────────────────────────────────────────
 * Os que a teoria cita — proporções, corpos de letra, milímetros — saem do
 * mesmo motor que confere as lições, e `exemplosDoProjetoDeDesign.test.ts`
 * os confere.
 */

const V = 'CC-DG006';

const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], atencao: string, marcas: string[],
  telas?: [legenda: string, descricao: string][],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, atencao, marcas, ...(telas ? { telas: telasDoTopico(V, id, telas) } : {}),
});

/* ── Módulo 1: a proposta ─────────────────────────────────────────────────── */

const PROPOSTA: TopicoDeVereda[] = [
  t(
    'demanda-e-publico',
    'A demanda e o público',
    'O que precisa ser comunicado, e a quem.',
    [
      'Todo projeto de design começa por uma **demanda de comunicação**: alguém precisa ficar sabendo de alguma coisa, e hoje não fica. "Fazer um cartaz bonito" não é demanda; "no último mutirão do córrego apareceram seis pessoas, e o clube precisava de trinta" é.',
      'O **público** é quem precisa ficar sabendo. Ele decide tudo o que vem depois: a letra, as palavras, o lugar em que a peça vai aparecer. No mutirão o público são os **vizinhos do bairro** — eles passam pelo portão da sede a pé e veem o perfil do clube no celular, e nunca leram o boletim.',
      'A proposta escreve as duas coisas e mais duas: **onde** as peças vão circular (o portão da sede e o perfil do clube) e **quais** são as quatro peças — a impressa, a digital, o símbolo e as imagens tratadas.',
      '"Todo mundo" não é público. Peça feita para todos não fala com ninguém em particular, e não há como saber se ela funcionou.',
    ],
    'A demanda tem de ser do clube de verdade. O mutirão é um exemplo para ver o caminho; a sua você escolhe.',
    ['demanda', 'público'],
  ),
  t(
    'aprovar-antes',
    'Aprovar antes de começar',
    'A proposta vai ao examinador, e só depois a produção começa.',
    [
      'O requisito pede que a proposta seja **aprovada antes** de a execução começar. A ordem é a regra inteira: aprovar o que já está pronto não deixa o examinador mudar nada, e a única resposta possível passa a ser sim.',
      'Proposta incompleta volta. Sem público, sem dizer onde a peça digital vai circular, ou sem as quatro peças, o examinador devolve dizendo o que falta — e o certo é completar e mandar de novo, e não começar enquanto isso.',
      'Começar a produzir antes da aprovação é o atalho mais comum, e o mais caro: se o examinador pedir outra coisa — um cartaz para o portão em vez de um folheto para a caixa de correio, por exemplo —, o trabalho feito vai para o lixo.',
    ],
    'Guarde a proposta aprovada junto dos arquivos do projeto. Ela é o primeiro item da apresentação.',
    ['aprovação'],
  ),
];

/* ── Módulo 2: o símbolo ──────────────────────────────────────────────────── */

const SIMBOLO: TopicoDeVereda[] = [
  t(
    'simbolo-de-autoria',
    'Um símbolo de autoria própria',
    'Desenhado por você, em vetor, e não baixado.',
    [
      'O requisito pede um **símbolo vetorial de autoria própria**: formas que você desenhou, no editor de vetor da CC-DG002. Um ícone baixado de um site de "ícones grátis" não é seu — e grátis para baixar não é livre para usar.',
      'O símbolo é um **grupo**. As peças saem da caneta soltas — no mutirão, a gota, a folha e a margem do córrego —, e se agrupam com as três escolhidas na lista de camadas e Ctrl+G. Agrupado, ele se move, se copia e cresce por igual, e é a cópia do grupo que vai para o post e para o cartaz.',
      'As duas peças com o **mesmo** símbolo é o que faz quem vê saber que elas são do mesmo projeto. A primeira ideia raramente é a que fica: não apague as tentativas, porque elas vão para a apresentação como versões descartadas.',
    ],
    'Trocar o clipart por um desenho seu muito parecido com ele continua sendo copiar. A ideia também precisa ser sua.',
    ['símbolo', 'autoria'],
    [
      ['As três peças, escolhidas com Shift', 'O editor de design com a gota azul, a folha verde e a margem do córrego na prancha. Na lista de camadas, Gota, Folha e Margem estão selecionadas juntas.'],
      ['Ctrl+G faz delas um grupo só', 'A lista de camadas mostra agora um grupo chamado Símbolo com as três peças dentro, e o campo Nome da camada diz Símbolo.'],
    ],
  ),
  t(
    'simbolo-pequeno',
    'O símbolo pequeno',
    'Ele vai aparecer no canto do post e no rodapé do cartaz.',
    [
      'Um símbolo bonito grande pode sumir pequeno. No canto de um post visto no celular ele tem uns **32 pixels** de lado, e o que for mais fino que um pixel nesse tamanho desaparece.',
      'A primeira ideia da gota do mutirão era só contorno: traço de 2 pixels numa prancha de 400. Com 32 de lado, cada traço fica com 2 × 32 ÷ 400, **um sexto de pixel** — a gota some, e sobra um quadrado branco. A versão cheia, com a margem de 22 pixels de altura, continua lá: 22 × 32 ÷ 400 dá quase dois pixels.',
      'O remédio é desenhar com formas cheias e grossas, e conferir antes de levar para as peças: **Exibir › Ver em 64, 32 e 16 px** mostra a prancha nos três tamanhos, lado a lado.',
    ],
    'É a régua do ícone de 16 pixels da CC-DG002, no tamanho em que este símbolo vai ser visto.',
    ['tamanho mínimo'],
    [
      ['A primeira ideia, em três tamanhos', 'A prancha da primeira ideia, uma gota feita só de contorno. No painel Tamanhos, ela aparece clara em 64 pixels, quase sumida em 32 e invisível em 16.'],
      ['O símbolo cheio continua de pé', 'A prancha do símbolo final, com a gota azul cheia, a folha e a margem. Em 64, 32 e 16 pixels o desenho continua reconhecível.'],
    ],
  ),
];

/* ── Módulo 3: as imagens ─────────────────────────────────────────────────── */

const IMAGENS: TopicoDeVereda[] = [
  t(
    'tratar-a-foto',
    'Tratar a foto, guardando o original',
    'Endireitar, devolver a luz, e exportar com outro nome.',
    [
      'A foto do celular quase sempre chega **torta e escura**. Tratar é o que a CC-DG003 ensinou: endireitar pelo horizonte, recortar o que sobrou, e devolver a luz e o contraste.',
      'Depois vem o passo que mais se erra: **exportar com outro nome**. A caixa Exportar como avisa quando o nome já existe na pasta, e o botão vira **Substituir** — exportar ali escreve por cima do original, e o arquivo do celular se perde sem volta. Com um nome novo, o botão volta a ser Exportar e os dois ficam na pasta.',
      'O original é parte da entrega: ele mostra o que foi tratado, e é dele que se parte se precisar refazer.',
    ],
    'Quem tirou a foto também conta. Foto de outra pessoa do clube se usa com a autorização dela, e o nome dela vai junto.',
    ['tratamento de imagem', 'original'],
    [
      ['Com o nome do original, o botão diz Substituir', 'A caixa Exportar como, com o nome IMG_lago, que é o do arquivo aberto. Embaixo, o aviso diz que já existe um arquivo com este nome e que exportar vai substituí-lo, e o botão diz Substituir.'],
      ['Com um nome novo, ele volta a ser Exportar', 'A mesma caixa com o nome lago-tratada: o aviso sumiu e o botão diz Exportar.'],
      ['Os dois ficam na pasta', 'A caixa Abrir lista os dois arquivos, IMG_lago.jpg e lago-tratada.jpg.'],
    ],
  ),
  t(
    'origem-declarada',
    'A origem de cada imagem',
    'De quem é, e com que licença.',
    [
      'O requisito pede as imagens **com a origem de cada uma declarada**. São três situações, e é a lição de direitos da CC-DG003: a imagem **própria** (sua, ou do clube com autorização), a de **licença livre**, e a **protegida**, que não se pode usar.',
      'Licença livre não é sem condição. A **CC BY** deixa usar, mudar e imprimir, e pede uma coisa: o **crédito** — quem fez, e a licença. Sem o crédito, usar é como se a imagem fosse protegida. No mutirão, a foto do córrego é do clube, tirada por um conselheiro que autorizou; um desenho de garrafa achado num banco de imagens com CC BY entraria com o nome do autor ao lado.',
      'Site que não diz a licença não deu licença nenhuma. A imagem é protegida até alguém dizer o contrário — e por isso ela não entra em peça nenhuma, nem na pasta da entrega.',
    ],
    'O crédito vai na própria peça, perto da imagem. Numa lista à parte, ninguém que vê a peça fica sabendo.',
    ['licença', 'crédito'],
  ),
];

/* ── Módulo 4: a peça impressa ────────────────────────────────────────────── */

const IMPRESSA: TopicoDeVereda[] = [
  t(
    'convite-para-a-grafica',
    'A peça que a gráfica aceita',
    'Foto tratada sangrando, resolução de impressão, o símbolo em vetor e o PDF certo.',
    [
      'A peça impressa sai do programa de diagramação da CC-DG005, com as mesmas regras: a foto que encosta na borda **passa da borda** 3 mm, que é a sangria; toda foto tem resolução de impressão no tamanho em que foi posta; e o PDF vai com sangria, marcas de corte e CMYK.',
      'O símbolo entra como **vetor**, o arquivo .svg que o editor exportou. Vetor não tem ppi: ele se redesenha em qualquer tamanho. Por isso, onde numa foto o programa diria o ppi, para o vetor ele diz só "vetor" — e o painel avisa que ele fica nítido em qualquer tamanho.',
      'Mexeu na peça depois de exportar? Exporte de novo. O PDF é um retrato de quando foi exportado.',
    ],
    'Símbolo exportado em PNG e posto grande no papel volta a ter ppi, e volta a poder serrilhar. Para a gráfica, leve o SVG.',
    ['sangria', 'PDF'],
    [
      ['O vetor não tem ppi', 'O diagramador com um mapa em SVG posto na página. No lugar do ppi, o selo diz vetor, e o painel de propriedades diz que ele é nítido em qualquer tamanho.'],
    ],
  ),
  t(
    'o-que-quando-onde',
    'O quê, quando e onde',
    'As três perguntas que toda peça de chamada responde.',
    [
      'Uma peça de chamada responde a três perguntas: **o quê**, **quando** e **onde**. Faltando uma, quem lê não vai — ou liga para perguntar, o que dá na mesma.',
      'No mutirão as três ficam assim: **Mutirão do Córrego**; **domingo, 19 de outubro, das 7h às 11h**; **encontro no portão da sede, ao lado da quadra**. A hora do fim importa tanto quanto a do começo: quem tem almoço de família precisa saber se dá tempo.',
      '"Onde" é a que mais falta em peça de clube. Quem escreve sabe de cor onde fica a sede, e por isso esquece de escrever. O vizinho que nunca entrou lá não sabe.',
    ],
    'Releia a peça como quem nunca foi ao clube. Toda informação que só quem é de dentro sabe precisa estar escrita.',
    ['informação essencial'],
  ),
];

/* ── Módulo 5: a peça digital ─────────────────────────────────────────────── */

const DIGITAL: TopicoDeVereda[] = [
  t(
    'proporcao-do-meio',
    'A proporção do meio',
    'A peça digital é outra peça, e não a impressa encolhida.',
    [
      'O requisito pede a peça digital **adaptada** da impressa, com **proporção e legibilidade próprias do meio**. Encolher a peça até caber na tela não é adaptar: é o mesmo papel, pequeno.',
      'Cada lugar tem a sua proporção. O **post quadrado** é 1080 × 1080; o **post em retrato**, 1080 × 1350; o **story**, 1080 × 1920. A folha A5 encolhida para 1080 de largura dá 1080 × 1532, que não é nenhuma delas — no feed ela sai cortada ou com faixas dos lados.',
      'Antes de refazer, **duplique** a prancha e dê um nome à cópia. A versão encolhida é a versão descartada que você vai mostrar ao examinador. Depois, troque o **Tamanho da prancha** do original: o que estava embaixo fica de fora, e rearranjar o que sobrou é o trabalho de adaptar.',
    ],
    'Mudar o tamanho da prancha não mexe no que está nela. Ninguém rearranja por você.',
    ['proporção', 'adaptação'],
    [
      ['O cartaz do mutirão encolhido para o feed', 'O editor de design com a prancha Post do mutirão: foto em cima, título, data, lugar e um parágrafo inteiro. O campo Tamanho da prancha diz Personalizado, 1080 × 1532.'],
      ['Guardada a cópia, o post passa a retrato', 'Na lista de pranchas aparece a cópia Post — cartaz encolhido. A prancha Post passou para Post retrato, 1080 × 1350, e a assinatura do rodapé ficou de fora.'],
    ],
  ),
  t(
    'letra-do-celular',
    'A letra do celular',
    'Letra grande e pouca palavra.',
    [
      'Um post de 1080 pixels aparece com uns 360 de largura na tela do telefone: **um terço**. A letra de 40 chega a uns 13, que é o menor corpo confortável. A de 22, que no papel estava ótima, chega a 7 — existe, e ninguém lê.',
      'Por isso o post leva **pouco texto**: no máximo umas 30 palavras. A peça em papel é lida parada; o post passa debaixo do dedo em um segundo e meio.',
      'Cortar não é perder o essencial. No mutirão, o quê, o quando e o onde continuam lá, em letra grande; o parágrafo sobre luvas e sacos sai — ele cabe na legenda do post, que só lê quem já parou.',
    ],
    'Cortar com pressa leva junto o que não devia. Releia o post depois de cortar procurando as três respostas.',
    ['legibilidade'],
  ),
];

/* ── Módulo 6: o processo ─────────────────────────────────────────────────── */

const PROCESSO: TopicoDeVereda[] = [
  t(
    'rascunhos-e-versoes',
    'Rascunhos e versões',
    'O caminho até a peça também se apresenta.',
    [
      'O requisito pede para **documentar o processo**: os **rascunhos**, as **versões descartadas** e a **razão de cada descarte**. O examinador quer ver como a peça chegou a ser o que é.',
      'Os **rascunhos** são à mão, no papel, antes do computador — três ideias **diferentes**, e não a mesma desenhada três vezes. No mutirão, foram uma gota, uma mão segurando um saco de lixo e o córrego visto de cima.',
      'As **versões descartadas** estão no arquivo: a gota de contorno, o post encolhido. Por isso elas não se apagam — duplicar antes de refazer é o que as guarda.',
    ],
    'Versão que só existe na sua memória não se mostra. Se não está no arquivo, não está no processo.',
    ['processo', 'versão descartada'],
  ),
  t(
    'razao-do-descarte',
    'A razão de cada descarte',
    'Um motivo próprio para cada versão, com o que você viu.',
    [
      'Cada versão descartada tem **o motivo dela**. "Não ficou bom" não explica nada, e o mesmo motivo para duas versões diferentes não explica nenhuma.',
      'O bom motivo diz **o que se viu**. A gota de contorno do mutirão sumia em 32 pixels; o cartaz encolhido tinha proporção de folha e o parágrafo em letra de sete pixels no celular. É o que o examinador pode conferir olhando a versão.',
      'Descarte não é fracasso. É o processo funcionando: cada versão descartada ensinou alguma coisa que a final tem.',
    ],
    'Escreva o motivo olhando a versão, e não de memória. O que se vê nela é o que se diz.',
    ['descarte'],
  ),
];

/* ── Módulo 7: a entrega ──────────────────────────────────────────────────── */

const ENTREGA: TopicoDeVereda[] = [
  t(
    'editavel-e-final',
    'O editável e o final',
    'Cada peça tem dois arquivos, e cada um serve a uma pessoa.',
    [
      'O requisito pede os arquivos **em formato editável e final**. O **final** é o que se entrega a quem vai usar: o PDF para a gráfica, o PNG para o feed. O **editável** é o que se entrega a quem vai mudar: no ano que vem, a data muda, e é dele que se parte.',
      'Os dois não se substituem. Só o final, ninguém muda a data; só o editável, a gráfica não abre.',
      'Organize em **pastas**: uma de editáveis, uma de finais, e uma para os originais e as versões. Na nuvem, **Nova pasta** cria cada uma, e **Mover para**, no menu de três pontos de cada arquivo, o leva para a dele. Nada solto na pasta do projeto.',
    ],
    'As extensões são as dos programas livres — .sla do Scribus, .svg do Inkscape, .xcf do GIMP. Com outro programa, a extensão muda e a divisão é a mesma.',
    ['editável', 'final'],
    [
      ['Tudo solto na pasta do projeto', 'A nuvem do clube com a pasta Mutirão do Córrego: o editável e o final de cada peça lado a lado, a foto original e a tratada, e nomes como post (1).png e cartaz-final-FINAL2.pdf.'],
      ['Cada arquivo para a pasta dele', 'Depois de criar a pasta Editáveis, a caixa Mover simbolo.svg está aberta com Editáveis escolhida como destino.'],
    ],
  ),
  t(
    'nomes-e-pastas',
    'Nomes que dizem a data e a versão',
    'O padrão da CC-ES001, e o que não vai junto.',
    [
      'Os finais levam no nome **a data e a versão**, todos no mesmo padrão — é o que a CC-ES001 ensinou. "cartaz-final-FINAL2.pdf" não diz qual é o mais novo; "cartaz-2026-10-05-v02.pdf" diz. Renomeia-se pelo menu de três pontos do arquivo, em **Renomear**.',
      'O que **não é seu** não vai na pasta. Uma imagem baixada que não entrou em peça nenhuma, entregue junto, é distribuir o que a licença não deixa.',
      'O resto vai inteiro: originais e versões são parte do projeto, e mandá-los para a lixeira apaga o processo.',
    ],
    'Data com o ano primeiro, depois o mês e o dia: é o que faz a ordem alfabética virar ordem de tempo.',
    ['nome de arquivo'],
    [
      ['O final que ainda não diz nada', 'A pasta Finais do mutirão, com o post e o símbolo já com data e versão, e o cartaz ainda chamado cartaz-final-FINAL2.pdf.'],
      ['Renomear, com a data e a versão', 'O campo de renomear aberto na linha do cartaz, com o nome novo cartaz-2026-10-05-v02.pdf digitado.'],
      ['Todos no mesmo padrão', 'A pasta Finais com cartaz-2026-10-05-v02.pdf, post-2026-10-05-v03.png e simbolo-2026-10-05-v01.png, todos no mesmo padrão de data e versão.'],
    ],
  ),
];

/* ── Módulo 8: o retorno ──────────────────────────────────────────────────── */

const RETORNO: TopicoDeVereda[] = [
  t(
    'cinco-do-publico',
    'Cinco pessoas do público',
    'O retorno que conta é de quem a peça precisa alcançar.',
    [
      'O requisito pede para submeter a peça a **cinco pessoas do público-alvo** e coletar o retorno. Do **público**: o conselheiro e o colega da unidade são os primeiros a opinar, e a opinião deles é sobre outra coisa. No mutirão, o público são os vizinhos — a dona da padaria da esquina conta, o diretor do clube não.',
      'Mostre a peça como ela vai ser vista — o post no celular, o cartaz no portão — e pergunte o que a pessoa entendeu, e não se ela gostou. "Gostei" não ensina nada; "achei que era só para quem é do clube" ensina muito.',
      'Anote o que cada um disse com as palavras dele. Resumir na hora já é decidir o que importa.',
    ],
    'Retorno de quem não é do público pode até ser bom conselho, mas não conta para o requisito.',
    ['público-alvo', 'retorno'],
  ),
  t(
    'mudar-ou-manter',
    'O que muda, e o que fica',
    'Seguir todo comentário é tão errado quanto não seguir nenhum.',
    [
      'Cada retorno pede uma leitura: ele aponta **o que falta para alguém do público decidir**, ou é **gosto**? "Não sei se posso levar meu filho de oito anos" é falta: o post cortou a linha dos menores. "Eu poria mais verde" é gosto de uma pessoa.',
      'O requisito pede **ao menos uma alteração** feita a partir do retorno, e registrada: qual comentário, o que mudou na peça, e por quê.',
      'A mudança aparece **na peça**. Escrever que mudou, sem mudar, não é alteração — e mudar quebrando o resto também não: o post continua com letra de celular e pouco texto.',
    ],
    'Retorno do público costuma achar justamente o que a gente cortou com pressa.',
    ['alteração'],
  ),
];

/* ── Módulo 9: a apresentação ─────────────────────────────────────────────── */

const APRESENTACAO: TopicoDeVereda[] = [
  t(
    'quinze-minutos',
    'Quinze minutos',
    'Um roteiro com tempo para cada parte, e a maior para as peças.',
    [
      'O requisito pede apresentar **em até quinze minutos**. Sem roteiro, a apresentação gasta dez minutos explicando a demanda e corre no fim — justamente nas peças.',
      'Dê minutos a cada parte: a demanda e o público, a proposta aprovada, as peças, os rascunhos e versões, o retorno e o que mudou, e as perguntas. As **peças** levam a maior fatia — cinco minutos de quinze —, porque é delas que o examinador vai perguntar.',
      'Deixe um tempo para as perguntas. Quinze minutos são o teto, e não a meta.',
    ],
    'Ensaie com um relógio. A primeira vez sempre passa do tempo.',
    ['apresentação'],
  ),
  t(
    'a-peca-em-maos',
    'A peça impressa em mãos',
    'O papel de verdade, e não a tela.',
    [
      'O requisito pede a apresentação **com a peça impressa em mãos**. É no papel que se vê se a sangria funcionou, se a letra se lê e se a cor saiu como na prova.',
      'A peça impressa sai do **PDF da gráfica**, o mesmo que foi exportado da peça como ela está agora. Imprimir um PDF velho é levar ao examinador a versão de antes da última correção.',
      'Leve também o post no celular, que é onde ele se apresenta, e a pasta do projeto, para mostrar o editável e o final de cada peça.',
    ],
    'Imprima com antecedência. Gráfica tem prazo, e impressora de casa acaba a tinta na véspera.',
    ['peça impressa'],
  ),
];

/* ── Os módulos ───────────────────────────────────────────────────────────── */

export const MODULOS_DO_PROJETO_DE_DESIGN: ModuloDeVereda[] = [
  {
    id: 'm1', titulo: 'A proposta',
    resumo: 'A demanda, o público e a aprovação antes de começar.',
    licoes: [
      { id: 'm1-teoria', tipo: 'teoria', questoes: Q['m1-teoria'], perguntas: 4, titulo: 'Demanda, público e aprovação', resumo: 'O que precisa ser comunicado, a quem, e quando começar.', topicos: PROPOSTA },
      { id: 'm1-lab', tipo: 'projeto-de-design', licao: 'proposta', titulo: 'Escrevendo a proposta', resumo: 'A demanda do convite, o público, as quatro peças e a aprovação.', verificacoes: ['demanda-e-publico', 'quatro-pecas', 'aprovada-antes'] },
    ],
  },
  {
    id: 'm2', titulo: 'O símbolo',
    resumo: 'Desenhado por você, e legível pequeno.',
    licoes: [
      { id: 'm2-teoria', tipo: 'teoria', questoes: Q['m2-teoria'], perguntas: 4, titulo: 'Um símbolo seu', resumo: 'Autoria própria, em vetor, e o tamanho do canto do post.', topicos: SIMBOLO },
      { id: 'm2-lab', tipo: 'projeto-de-design', licao: 'simbolo', titulo: 'Desenhando o símbolo do convite', resumo: 'O clipart sai, a barraca entra, e se confere em 32 pixels.', verificacoes: ['simbolo-seu', 'sem-clipart', 'le-pequeno'] },
    ],
  },
  {
    id: 'm3', titulo: 'As imagens',
    resumo: 'Tratadas, e com a origem de cada uma.',
    licoes: [
      { id: 'm3-teoria', tipo: 'teoria', questoes: Q['m3-teoria'], perguntas: 4, titulo: 'Imagens tratadas e declaradas', resumo: 'O original guardado, e de quem é cada imagem.', topicos: IMAGENS },
      { id: 'm3-lab', tipo: 'projeto-de-design', licao: 'imagens', titulo: 'Tratando a foto do acampamento', resumo: 'Endireitar, devolver a luz, e declarar as três origens.', verificacoes: ['tratou-a-foto', 'declarou-as-origens', 'escreveu-o-credito'] },
    ],
  },
  {
    id: 'm4', titulo: 'A peça impressa',
    resumo: 'O convite que a gráfica aceita, e que diz tudo.',
    licoes: [
      { id: 'm4-teoria', tipo: 'teoria', questoes: Q['m4-teoria'], perguntas: 4, titulo: 'O convite impresso', resumo: 'Sangria, vetor, PDF, e o quê, quando e onde.', topicos: IMPRESSA },
      { id: 'm4-lab', tipo: 'projeto-de-design', licao: 'impressa', titulo: 'Montando o convite', resumo: 'A foto tratada sangrando, o símbolo, o lugar, o crédito e o PDF.', verificacoes: ['simbolo-no-convite', 'foto-tratada-sangrando', 'diz-onde', 'credita-a-fogueira', 'pdf-da-grafica'] },
    ],
  },
  {
    id: 'm5', titulo: 'A peça digital',
    resumo: 'Adaptada ao meio, e não encolhida.',
    licoes: [
      { id: 'm5-teoria', tipo: 'teoria', questoes: Q['m5-teoria'], perguntas: 4, titulo: 'Do papel para o celular', resumo: 'A proporção do feed, a letra do celular e o corte.', topicos: DIGITAL },
      { id: 'm5-lab', tipo: 'projeto-de-design', licao: 'digital', titulo: 'Refazendo o post', resumo: 'A versão encolhida guardada, e o post na proporção do feed.', verificacoes: ['guardou-o-encolhido', 'proporcao-do-feed', 'letra-do-celular', 'so-o-essencial', 'mesmo-simbolo'] },
    ],
  },
  {
    id: 'm6', titulo: 'O processo',
    resumo: 'Rascunhos, versões e o porquê de cada descarte.',
    licoes: [
      { id: 'm6-teoria', tipo: 'teoria', questoes: Q['m6-teoria'], perguntas: 4, titulo: 'Documentar o processo', resumo: 'O que se guarda, e o que se diz sobre cada versão.', topicos: PROCESSO },
      { id: 'm6-lab', tipo: 'projeto-de-design', licao: 'processo', titulo: 'Contando o caminho', resumo: 'Os rascunhos registrados e cada versão com o seu motivo.', verificacoes: ['rascunhos', 'versoes-com-motivo'] },
    ],
  },
  {
    id: 'm7', titulo: 'A entrega',
    resumo: 'Editável e final, em pastas.',
    licoes: [
      { id: 'm7-teoria', tipo: 'teoria', questoes: Q['m7-teoria'], perguntas: 4, titulo: 'Arquivos para entregar', resumo: 'O editável, o final, os nomes e o que não vai.', topicos: ENTREGA },
      { id: 'm7-lab', tipo: 'projeto-de-design', licao: 'arquivos', titulo: 'Organizando a pasta do projeto', resumo: 'Editáveis, finais, originais, e os nomes com data e versão.', verificacoes: ['editavel-e-final', 'nada-solto', 'clipart-fora', 'finais-no-padrao'] },
    ],
  },
  {
    id: 'm8', titulo: 'O retorno',
    resumo: 'Cinco pessoas do público, e uma mudança.',
    licoes: [
      { id: 'm8-teoria', tipo: 'teoria', questoes: Q['m8-teoria'], perguntas: 4, titulo: 'Ouvir o público', resumo: 'Quem conta, e o que muda.', topicos: RETORNO },
      { id: 'm8-lab', tipo: 'projeto-de-design', licao: 'retorno', titulo: 'Mudando o post pelo retorno', resumo: 'Os cinco do público, a leitura de cada um e a mudança feita.', verificacoes: ['cinco-do-publico', 'leu-cada-um', 'mudou-a-peca'] },
    ],
  },
  {
    id: 'm9', titulo: 'A apresentação',
    resumo: 'Quinze minutos, com a peça na mão.',
    licoes: [
      { id: 'm9-teoria', tipo: 'teoria', questoes: Q['m9-teoria'], perguntas: 4, titulo: 'Apresentar o projeto', resumo: 'O roteiro e a peça impressa.', topicos: APRESENTACAO },
      { id: 'm9-lab', tipo: 'projeto-de-design', licao: 'apresentacao', titulo: 'Preparando os quinze minutos', resumo: 'Um roteiro com as peças no centro, e a impressa junto.', verificacoes: ['cabe-em-quinze', 'pecas-no-centro', 'leva-a-impressa'] },
    ],
  },
];
