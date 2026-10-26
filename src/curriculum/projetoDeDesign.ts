import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DO_PROJETO_DE_DESIGN as Q } from './questoesDoProjetoDeDesign';

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
 * ── Os números ──────────────────────────────────────────────────────────
 * Os que a teoria cita — proporções, corpos de letra, milímetros — saem do
 * mesmo motor que confere as lições, e `exemplosDoProjetoDeDesign.test.ts`
 * os confere.
 */

const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], exemplo: string, atencao: string, marcas: string[],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, exemplo, exemploComo: 'texto' as const, atencao, marcas,
});

/* ── Módulo 1: a proposta ─────────────────────────────────────────────────── */

const PROPOSTA: TopicoDeVereda[] = [
  t(
    'demanda-e-publico',
    'A demanda e o público',
    'O que precisa ser comunicado, e a quem.',
    [
      'Todo projeto de design começa por uma **demanda de comunicação**: alguém precisa ficar sabendo de alguma coisa, e hoje não fica. "Fazer um cartaz bonito" não é demanda; "metade das famílias novas fica sabendo do acampamento na véspera" é.',
      'O **público** é quem precisa ficar sabendo. Ele decide tudo o que vem depois: a letra, as palavras, o lugar em que a peça vai aparecer. Pais e avós leem no celular, na fila do mercado; desbravadores leem no mural da sede.',
      '"Todo mundo" não é público. Peça feita para todos não fala com ninguém em particular, e não há como saber se ela funcionou.',
    ],
    `A proposta do convite

  Demanda: as famílias dos desbravadores novos ficam sabendo
           do Acampamento das Famílias na véspera, e metade não vai.
  Público: pais, mães e avós dos desbravadores que entraram este ano.
  Meio:    o grupo de mensagens das famílias e o perfil do clube.
  Peças:   impressa, digital, símbolo e imagens tratadas.`,
    'A demanda tem de ser do clube de verdade. A do convite é um exemplo para percorrer o caminho; a sua você escolhe.',
    ['demanda', 'público'],
  ),
  t(
    'aprovar-antes',
    'Aprovar antes de começar',
    'A proposta vai ao examinador, e só depois a produção começa.',
    [
      'O requisito pede que a proposta seja **aprovada antes** de a execução começar. A ordem é a regra inteira: aprovar o que já está pronto não deixa o examinador mudar nada, e a única resposta possível passa a ser sim.',
      'Proposta incompleta volta. Sem público, sem dizer onde a peça digital vai circular, ou sem as quatro peças, o examinador devolve dizendo o que falta — e o certo é completar e mandar de novo.',
      'Começar a produzir antes da aprovação é o atalho mais comum, e o mais caro: se o examinador pedir outra coisa, o trabalho feito vai para o lixo.',
    ],
    `A ordem

  1. Escrever a proposta
  2. Enviar ao examinador
  3. Voltou com o que falta? Completar e enviar de novo
  4. Aprovada: só agora começar a produzir`,
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
      'O símbolo é um **grupo**: as formas que o compõem se movem juntas, e é a cópia do grupo que vai para o post e para o convite. As duas peças com o mesmo símbolo é o que faz quem vê saber que elas são do mesmo projeto.',
      'A primeira ideia raramente é a que fica. Não apague as tentativas: elas vão para a apresentação como versões descartadas.',
    ],
    `O símbolo do convite

  Barraca  triângulo verde
  Porta    triângulo creme por cima
  Chão     retângulo marrom
  → agrupados: um só objeto, que se copia inteiro`,
    'Trocar o clipart por um desenho seu muito parecido com ele continua sendo copiar. A ideia também precisa ser sua.',
    ['símbolo', 'autoria'],
  ),
  t(
    'simbolo-pequeno',
    'O símbolo pequeno',
    'Ele vai aparecer no canto do post e no rodapé do convite.',
    [
      'Um símbolo bonito grande pode sumir pequeno. No canto de um post visto no celular ele tem uns **32 pixels** de lado, e o que for mais fino que um pixel nesse tamanho desaparece.',
      'A primeira ideia da barraca era feita de traço de 3 pixels numa barraca de 280. Com 32 de lado, cada traço fica com **um terço de pixel**: o desenho some inteiro.',
      'O remédio é desenhar com formas cheias e grossas. O editor mostra o símbolo em 64, 32 e 16 pixels lado a lado — confira antes de levar para as peças.',
    ],
    `A barraca em 32 pixels

  Traço de 3 px numa barraca de 280 px
  → 3 × 32 ÷ 280 = um terço de pixel: some
  Chão de 24 px de altura
  → 24 × 32 ÷ 280 = quase 3 pixels: aparece`,
    'É a régua do ícone de 16 pixels da CC-DG002, no tamanho em que este símbolo vai ser visto.',
    ['tamanho mínimo'],
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
      'Exporte a foto tratada com **outro nome**. Exportar com o nome do original escreve por cima dele, e o arquivo do celular se perde — o que foi feito não tem mais volta.',
      'O original é parte da entrega: ele mostra o que foi tratado, e é dele que se parte se precisar refazer.',
    ],
    `A foto do acampamento

  IMG_0412.jpg               original, torta e escura
  acampamento-tratada.jpg    endireitada, com luz, nome novo`,
    'Quem tirou a foto também conta: a do acampamento é da secretária do clube, e usá-la é com a autorização dela.',
    ['tratamento de imagem', 'original'],
  ),
  t(
    'origem-declarada',
    'A origem de cada imagem',
    'De quem é, e com que licença.',
    [
      'O requisito pede as imagens **com a origem de cada uma declarada**. São três situações, e é a lição de direitos da CC-DG003: a imagem **própria** (sua, ou do clube com autorização), a de **licença livre**, e a **protegida**, que não se pode usar.',
      'Licença livre não é sem condição. A **CC BY** deixa usar, mudar e imprimir, e pede uma coisa: o **crédito** — quem fez, e a licença. Sem o crédito, usar é como se a imagem fosse protegida.',
      'Site que não diz a licença não deu licença nenhuma. A imagem é protegida até alguém dizer o contrário.',
    ],
    `As três imagens do convite

  IMG_0412.jpg          própria: Célia Moura, secretária do clube
  fogueira-ana-souza    livre, CC BY: crédito para Ana Souza
  barraca-clipart.png   protegida: o site não diz a licença`,
    'O crédito vai na própria peça, perto da imagem. Numa lista à parte, ninguém que vê a peça fica sabendo.',
    ['licença', 'crédito'],
  ),
];

/* ── Módulo 4: a peça impressa ────────────────────────────────────────────── */

const IMPRESSA: TopicoDeVereda[] = [
  t(
    'convite-para-a-grafica',
    'O convite que a gráfica aceita',
    'Foto tratada sangrando, resolução de impressão e o PDF certo.',
    [
      'A peça impressa sai do programa de diagramação da CC-DG005, com as mesmas regras: a foto que encosta na borda **passa da borda** 3 mm, que é a sangria; toda foto tem resolução de impressão no tamanho em que foi posta; e o PDF vai com sangria, marcas de corte e CMYK.',
      'O símbolo entra como **vetor**, o arquivo .svg que o editor exportou. Vetor não tem ppi: ele se redesenha em qualquer tamanho, e por isso o programa diz "vetor" onde, numa foto, diria o ppi.',
      'Mexeu no convite depois de exportar? Exporte de novo. O PDF é um retrato do convite de quando foi exportado.',
    ],
    `A foto do convite A5

  Parando na borda:  X 0, Y 0, largura 148 mm  → fio branco no corte
  Sangrando:         X -3, Y -3, largura 154 mm → corte limpo`,
    'A foto crua do celular também passa no ppi. O que a reprova não é a resolução: é estar torta e escura.',
    ['sangria', 'PDF'],
  ),
  t(
    'o-que-quando-onde',
    'O quê, quando e onde',
    'As três perguntas que todo convite responde.',
    [
      'Um convite responde a três perguntas: **o quê**, **quando** e **onde**. Faltando uma, quem lê não vai — ou liga para perguntar, o que dá na mesma.',
      '"Onde" é a que mais falta em convite de clube. Quem escreve sabe de cor que o acampamento é na chácara, e por isso esquece de escrever. Quem lê não sabe.',
      'O crédito da foto de outra pessoa também é texto da peça, e entra como legenda, perto da imagem.',
    ],
    `O convite

  O quê:   Acampamento das Famílias
  Quando:  Sábado, 14 de setembro, das 8h às 17h
  Onde:    Na Chácara Recanto Verde. O ônibus sai da igreja às 7h30.`,
    'Releia o convite como quem nunca foi ao clube. Toda informação que só quem é de dentro sabe precisa estar escrita.',
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
      'O requisito pede a peça digital **adaptada** da impressa, com **proporção e legibilidade próprias do meio**. Encolher o convite até caber na tela não é adaptar: é o mesmo papel, pequeno.',
      'Cada lugar tem a sua proporção. O **post quadrado** é 1080 × 1080; o **post em retrato**, 1080 × 1350; o **story**, 1080 × 1920. A folha A5, 1 por 1,41, não é nenhuma delas — no feed ela sai cortada ou com faixas dos lados.',
      'Antes de refazer, **duplique** a prancha. A versão encolhida é a versão descartada que você vai mostrar ao examinador.',
    ],
    `O post do convite

  Convite encolhido:  1080 × 1528, a proporção da folha A5
  Post em retrato:    1080 × 1350, a que o feed mostra inteira`,
    'Mudar o tamanho da prancha não mexe no que está nela. Rearranjar o que ficou fora é o trabalho de adaptar.',
    ['proporção', 'adaptação'],
  ),
  t(
    'letra-do-celular',
    'A letra do celular',
    'Letra grande e pouca palavra.',
    [
      'Um post de 1080 pixels aparece com uns 360 de largura na tela do telefone: **um terço**. A letra de 40 chega a uns 13, que é o menor corpo confortável. A de 22, que no convite impresso estava ótima, chega a 7 — existe, e ninguém lê.',
      'Por isso o post leva **pouco texto**: no máximo umas 30 palavras. O convite em papel é lido parado; o post passa debaixo do dedo em um segundo e meio.',
      'Cortar não é perder o essencial. O quê, quando e onde continuam lá; o parágrafo do convite sai.',
    ],
    `A mesma letra, no papel e no celular

  Corpo 22 no post de 1080  → uns 7 pixels na tela: não se lê
  Corpo 40 no post de 1080  → uns 13 pixels na tela: se lê`,
    'Cortar com pressa leva junto o que não devia. No post do convite, a hora saiu no corte — e o público vai notar.',
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
      'Os **rascunhos** são à mão, no papel, antes do computador — três ideias diferentes, e não a mesma desenhada três vezes. Guarde-os, ou fotografe.',
      'As **versões descartadas** estão no arquivo: a primeira ideia do símbolo, o post encolhido. Por isso elas não se apagam — duplicar antes de refazer é o que as guarda.',
    ],
    `O processo do convite

  Rascunhos:  barraca com a porta aberta
              fogueira com duas pessoas grandes e uma pequena
              mão de adulto segurando mão de criança
  Versões:    símbolo de traço fino
              post com o convite encolhido`,
    'Versão que só existe na sua memória não se mostra. Se não está no arquivo, não está no processo.',
    ['processo', 'versão descartada'],
  ),
  t(
    'razao-do-descarte',
    'A razão de cada descarte',
    'Um motivo próprio para cada versão, com o que você viu.',
    [
      'Cada versão descartada tem **o motivo dela**. "Não ficou bom" não explica nada, e o mesmo motivo para duas versões diferentes não explica nenhuma.',
      'O bom motivo diz **o que se viu**: o símbolo de traço fino sumia com 32 pixels; o post encolhido tinha letra de sete pixels no celular. É o que o examinador pode conferir olhando a versão.',
      'Descarte não é fracasso. É o processo funcionando: cada versão descartada ensinou alguma coisa que a final tem.',
    ],
    `Dois motivos

  Símbolo — primeira ideia:  feita de traço fino, a barraca
                             sumia inteira com 32 pixels.
  Post encolhido:            proporção de folha, letra de sete
                             pixels no celular e texto demais.`,
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
      'Organize em **pastas**: uma de editáveis, uma de finais, e uma para os originais e as versões. Nada solto na pasta do projeto.',
    ],
    `A pasta do projeto

  Editáveis/   simbolo.svg, convite.sla, post.svg,
               acampamento-tratada.xcf
  Finais/      simbolo.png, convite.pdf, post.png,
               acampamento-tratada.jpg
  Originais e versões/   IMG_0412.jpg, a fogueira, o post encolhido`,
    'As extensões são as dos programas livres — Scribus, Inkscape, GIMP. Com outro programa, a extensão muda e a divisão é a mesma.',
    ['editável', 'final'],
  ),
  t(
    'nomes-e-pastas',
    'Nomes que dizem a data e a versão',
    'O padrão da CC-ES001, e o que não vai junto.',
    [
      'Os finais levam no nome **a data e a versão**, todos no mesmo padrão — é o que a CC-ES001 ensinou. "convite-final-FINAL2.pdf" não diz qual é o mais novo; "convite-2026-09-01-v03.pdf" diz.',
      'O que **não é seu** não vai na pasta. O clipart baixado não entrou em peça nenhuma, e entregá-lo junto é distribuir uma imagem cuja licença não deixa.',
      'O resto vai inteiro: originais e versões são parte do projeto, e mandá-los para a lixeira apaga o processo.',
    ],
    `Os finais, com data e versão

  convite-2026-09-01-v03.pdf
  post-2026-09-01-v02.png
  simbolo-2026-09-01-v02.png`,
    'Data com o ano primeiro, depois o mês e o dia: é o que faz a ordem alfabética virar ordem de tempo.',
    ['nome de arquivo'],
  ),
];

/* ── Módulo 8: o retorno ──────────────────────────────────────────────────── */

const RETORNO: TopicoDeVereda[] = [
  t(
    'cinco-do-publico',
    'Cinco pessoas do público',
    'O retorno que conta é de quem a peça precisa alcançar.',
    [
      'O requisito pede para submeter a peça a **cinco pessoas do público-alvo** e coletar o retorno. Do **público**: o conselheiro e o colega da unidade são os primeiros a opinar, e a opinião deles é sobre outra coisa.',
      'Mostre a peça como ela vai ser vista — o post no celular, o convite na mão — e pergunte o que a pessoa entendeu, e não se ela gostou. "Gostei" não ensina nada.',
      'Anote o que cada um disse com as palavras dele. Resumir na hora já é decidir o que importa.',
    ],
    `Sete responderam ao post

  Lúcia, mãe da Bia          público
  Jorge, pai do Davi         público
  Cláudia, mãe do Pedro      público
  Antônio, avô da Lara       público
  Renata, mãe do Caio        público
  Tio Márcio, conselheiro    não é do público
  Lucas, colega de unidade   não é do público`,
    'Retorno de quem não é do público pode até ser bom conselho, mas não conta para o requisito.',
    ['público-alvo', 'retorno'],
  ),
  t(
    'mudar-ou-manter',
    'O que muda, e o que fica',
    'Seguir todo comentário é tão errado quanto não seguir nenhum.',
    [
      'Cada retorno pede uma leitura: ele aponta **o que falta para alguém do público decidir**, ou é **gosto**? "Não diz que horas começa" é falta: quem trabalha no sábado de manhã precisa saber. "Eu poria mais cores" é gosto de uma pessoa.',
      'O requisito pede **ao menos uma alteração** feita a partir do retorno, e registrada: qual comentário, o que mudou na peça, e por quê.',
      'A mudança aparece **na peça**. Escrever que mudou, sem mudar, não é alteração — e mudar quebrando o resto também não: o post continua com letra de celular e pouco texto.',
    ],
    `Uma alteração registrada

  Retorno:  Lúcia — "não diz que horas começa nem que horas acaba"
  Mudança:  a linha da data passou a ser
            "Sábado, 14 de setembro, 8h às 17h"
  Por quê:  ela trabalha até meio-dia, e não sabia se dava tempo.`,
    'A hora estava no convite encolhido e saiu no corte do post. Retorno do público costuma achar justamente o que a gente cortou com pressa.',
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
      'Dê minutos a cada parte: a demanda e o público, as peças, o processo e o retorno. As **peças** levam a maior fatia: é delas que o examinador vai perguntar.',
      'Deixe um tempo para as perguntas. Quinze minutos são o teto, e não a meta.',
    ],
    `Um roteiro de quinze minutos

  A demanda e o público        2
  A proposta aprovada          1
  As peças, com a impressa     5
  Rascunhos e versões          3
  O retorno e o que mudou      2
  Perguntas                    2
                              ──
                              15`,
    'Ensaie com um relógio. A primeira vez sempre passa do tempo.',
    ['apresentação'],
  ),
  t(
    'a-peca-em-maos',
    'A peça impressa em mãos',
    'O papel de verdade, e não a tela.',
    [
      'O requisito pede a apresentação **com a peça impressa em mãos**. É no papel que se vê se a sangria funcionou, se a letra se lê e se a cor saiu como na prova.',
      'A peça impressa sai do **PDF da gráfica**, o mesmo que foi exportado do convite como ele está agora. Imprimir um PDF velho é levar ao examinador a versão de antes da última correção.',
      'Leve também o post no celular. A peça digital se apresenta no meio dela.',
    ],
    `O que levar

  O convite impresso, do PDF da gráfica
  O post, no celular
  A pasta do projeto, para mostrar o editável e o final`,
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
