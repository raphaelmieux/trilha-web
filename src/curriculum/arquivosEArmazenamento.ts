/*
 * A vereda CC-ES001 Arquivos e Armazenamento.
 *
 * ── Por que ela é a raiz da família de Escritório ────────────────────────
 * Doze das treze veredas de Escritório produzem arquivo: documento, planilha,
 * PDF, apresentação, formulário exportado. Nenhuma delas ensina onde aquilo
 * vai parar, com que nome, e o que fazer quando some — e some.
 *
 * É por isso que o documento oficial de oito delas abre exigindo esta, direta
 * ou indiretamente. Quem sabe escrever um ofício e não sabe achá-lo no sábado
 * seguinte escreve o ofício duas vezes.
 *
 * ── O que muda em relação à AP043 ────────────────────────────────────────
 * A AP043 ensina o Explorador como programa: abrir, copiar, mover, renomear.
 * Aqui a pergunta é outra — **por que** o arquivo está onde está. Ordenar por
 * data só vale quando a data quer dizer alguma coisa; buscar por tipo só vale
 * quando a extensão está à vista; restaurar da cópia de segurança só existe
 * para quem fez a cópia antes.
 *
 * Por isso nenhum laboratório daqui acrescenta tarefa ao da AP043. Aquele
 * exercício foi entregue e fechado por gente, e mudar o que ele avalia faria
 * aparecer tarefa vermelha num trabalho que já estava pronto. Os desta vereda
 * são outros, na mesma janela de Explorador que o desbravador já reconhece.
 *
 * ── E o requisito 9 acontece fora daqui ──────────────────────────────────
 * Apresentar a estrutura de pastas ao examinador é conversa com uma pessoa, e
 * a plataforma não confere nada disso — como já vale para o requisito 7 da
 * CC002 e o 8 da CC003. O que ela faz é preparar: ler a árvore que a pessoa
 * montou e escrever, em português, a lógica que ela usou, para treinar com a
 * própria estrutura na frente.
 */

import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DE_ARQUIVOS } from './questoesDeArquivos';

/*
  Todo exemplo desta vereda é `'texto'`: uma listagem de pasta, uma árvore, um
  par de nomes lado a lado. Não há linguagem para realçar nem resultado para
  desenhar — é a mesma decisão da CC003, e o helper é o mesmo.
*/
const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], exemplo: string, atencao: string, marcas: string[],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, exemplo, exemploComo: 'texto' as const, atencao, marcas,
});

/* ────────────────────────────────────────────────────────────────────────
   Módulo 1 — O arquivo e a pasta (requisitos 1.1 a 1.4)
   ──────────────────────────────────────────────────────────────────────── */

const ARQUIVO_E_PASTA: TopicoDeVereda[] = [
  t(
    'arquivo-e-pasta',
    'Arquivo e pasta',
    'Um guarda conteúdo; o outro guarda arquivos.',
    [
      'Arquivo é uma coisa guardada no computador com um nome: uma foto, um ofício, uma música, a planilha da tesouraria. Tudo o que você produz vira arquivo.',
      'Pasta não guarda conteúdo nenhum — ela guarda arquivos e outras pastas. É a gaveta, e não o que está dentro da gaveta. Uma pasta vazia ocupa praticamente nada, porque não há nada nela.',
      'Pasta dentro de pasta é o que faz a organização existir. Sem isso o computador seria uma mesa com trezentos papéis soltos em cima, que é exatamente o que a Área de Trabalho de muita gente é.',
    ],
    `Clube/
  2026/
    Acampamento de Julho/
      inscritos.xlsx
      autorizacao.docx
      foto-da-turma.jpg`,
    'Pasta com um arquivo só quase nunca se justifica. Se você criou uma pasta e ela tem um item, pergunte o que mais vai entrar ali — se a resposta for "nada", o arquivo devia estar um nível acima.',
    ['arquivo', 'pasta', 'hierarquia'],
  ),
  t(
    'extensao',
    'Extensão',
    'As letras depois do último ponto, que dizem o que o arquivo é.',
    [
      'Extensão é o pedaço final do nome, depois do último ponto: `.jpg`, `.docx`, `.pdf`, `.mp3`. Ela não é enfeite — é por ela que o sistema decide qual programa abre o arquivo quando você dá dois cliques.',
      'Quem decide a extensão é o programa que salvou. O Word salva `.docx`, a câmera salva `.jpg`, o navegador salva `.pdf`. Você pode trocar a extensão no nome, e isso **não** converte nada: só passa a mentir sobre o que o arquivo é.',
      'O nome pode ter vários pontos, e só o último conta. Em `ata-2026.03.14.docx` a extensão é `docx`, e os outros pontos fazem parte do nome.',
    ],
    `relatorio.docx    →  Editor de Texto
foto-da-turma.jpg →  Fotos
autorizacao.pdf   →  Leitor de PDF
hino.mp3          →  Tocador de Mídia
lista.csv         →  Planilha`,
    'Renomear `relatorio.docx` para `relatorio.pdf` não gera um PDF: gera um arquivo do Word com o nome errado, que o leitor de PDF abre e recusa. Converter é trabalho do programa, e não do nome.',
    ['extensão', 'programa associado', 'ponto'],
  ),
  t(
    'caminho',
    'Caminho',
    'O endereço do arquivo, pasta por pasta até chegar nele.',
    [
      'Caminho é a sequência de pastas que leva até o arquivo, escrita numa linha só. É o que aparece na barra de endereço do Explorador, e é o que você manda para alguém que pergunta "onde está?".',
      'No Windows as pastas se separam por barra invertida e começam pela letra do disco: `C:\\Clube\\2026\\inscritos.xlsx`. No celular, no Linux e na internet a barra é a normal, e é a mesma ideia.',
      'Dois arquivos podem ter exatamente o mesmo nome sem conflito nenhum, desde que estejam em pastas diferentes — e é o caminho que os distingue. É por isso que "está no inscritos.xlsx" não responde a pergunta de ninguém.',
    ],
    `C:\\Clube\\2026\\Acampamento de Julho\\inscritos.xlsx
└┬┘ └─┬─┘ └┬─┘ └──────┬──────────┘ └──────┬────┘
disco  pasta  pasta      pasta           arquivo`,
    'Mover a pasta muda o caminho de tudo o que está dentro dela, de uma vez. Documento que tinha um atalho, uma planilha que puxava dados de outra, um programa que gravava ali — todos passam a apontar para um endereço que não existe mais.',
    ['caminho', 'barra de endereço', 'disco'],
  ),
  t(
    'atalho',
    'Atalho',
    'Um bilhete com o endereço, e não uma segunda cópia.',
    [
      'Atalho é um arquivo minúsculo que só guarda o caminho de outro. Dar dois cliques nele abre o original, esteja ele onde estiver. Na tela ele aparece com uma setinha no canto do ícone.',
      'Ele ocupa quase nada — uns poucos quilobytes — justamente porque não tem o conteúdo dentro. Uma cópia de um vídeo de 200 MB ocupa mais 200 MB; um atalho para o mesmo vídeo ocupa menos que uma foto.',
      'Serve para ter a mesma coisa em dois lugares sem ter duas coisas. A pasta do acampamento fica organizada dentro de Documentos, e um atalho na Área de Trabalho dá acesso rápido a ela enquanto o acampamento está acontecendo.',
    ],
    `Área de Trabalho/
  Acampamento — Atalho      2 KB   →  aponta para C:\\Clube\\2026\\Acampamento de Julho

Documentos/
  Clube/2026/Acampamento de Julho/   184 MB   ← o conteúdo mora aqui`,
    'Apagar o atalho não apaga o original, e é para isso que ele serve. Mas apagar o **original** deixa o atalho apontando para o nada: ele continua na tela, com o ícone certo, e ao abrir diz que o item não foi encontrado.',
    ['atalho', 'aponta', 'original'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 2 — O que está dentro do nome (requisitos 1.5 e 1.6)
   ──────────────────────────────────────────────────────────────────────── */

const FORMATOS: TopicoDeVereda[] = [
  t(
    'formato-aberto',
    'Formato aberto e formato proprietário',
    'A diferença é quem pode escrever um programa que leia aquilo.',
    [
      'Formato aberto é aquele cuja receita está publicada: qualquer pessoa pode escrever um programa que leia e grave aquele tipo de arquivo, sem pedir licença a ninguém. `.txt`, `.csv`, `.png`, `.odt` e `.svg` são assim.',
      'Formato proprietário é o que pertence a uma empresa, e só ela decide como ele funciona. `.psd` é do Photoshop, `.cdr` é do CorelDRAW, `.doc` antigo era da Microsoft. Abrir num outro programa vai de "quase certo" a "impossível".',
      'A consequência aparece longe, e é sempre a mesma: no dia em que o programa sai de linha, ou a licença acaba, ou a versão nova não abre a antiga, quem tem formato aberto continua lendo os próprios arquivos e quem tem proprietário depende de alguém.',
    ],
    `ABERTO                        PROPRIETÁRIO
.txt   texto puro              .psd   Photoshop
.csv   tabela em texto         .cdr   CorelDRAW
.png   imagem                  .ai    Illustrator
.odt   documento              .indd   InDesign
.svg   desenho vetorial        .sketch Sketch`,
    'O arquivo da tesouraria do clube dura mais do que a diretoria que o criou. Guardar a ata em formato aberto, ou exportar uma cópia em PDF ao lado do original, é o que faz o documento de 2019 ainda abrir em 2031.',
    ['formato aberto', 'formato proprietário', 'compatibilidade'],
  ),
  t(
    'compactacao',
    'Compactação',
    'Espremer um ou vários arquivos num pacote só.',
    [
      'Compactar é reescrever o arquivo de um jeito que ocupe menos espaço, e juntar vários num pacote só. O resultado é um arquivo novo — `.zip` ou `.rar` — que contém todos os outros dentro.',
      'Serve para duas coisas diferentes. A primeira é ocupar menos: uma pasta de documentos pode encolher pela metade. A segunda, e na prática a mais usada, é **juntar**: enviar trinta fotos por e-mail é anexar trinta arquivos; enviar um `.zip` é anexar um.',
      'Descompactar é o caminho de volta, e ele devolve os arquivos exatamente como eram. Nada se perde no caminho: o documento que sai do zip é byte por byte o mesmo que entrou.',
    ],
    `Antes                          Depois
Acampamento/                   Acampamento.zip   (1 arquivo, 12 MB)
  autorizacao.docx  180 KB       └ autorizacao.docx
  inscritos.xlsx     94 KB       └ inscritos.xlsx
  cronograma.docx   210 KB       └ cronograma.docx
  ... mais 27 fotos               └ ... mais 27 fotos
  total: 31 MB`,
    'O arquivo compactado é uma cópia: os originais continuam onde estavam. Quem compacta para "liberar espaço" e não apaga a pasta original acabou de ocupar mais espaço do que antes.',
    ['compactar', 'zip', 'descompactar'],
  ),
  t(
    'com-perda',
    'O que encolhe e o que não volta',
    'Zip devolve tudo; JPG não devolve.',
    [
      'Há duas maneiras de um arquivo ficar menor, e elas são muito diferentes. A **sem perda** reescreve o conteúdo de um jeito mais curto, e desfazer devolve o original intacto — é o que o `.zip` faz.',
      'A **com perda** joga fora parte do conteúdo, escolhendo o que a pessoa provavelmente não vai notar. É o que o `.jpg` faz com foto e o `.mp3` faz com som. Fica muito menor, e o que saiu não volta.',
      'Salvar de novo um JPG joga fora mais um pouco, toda vez. A foto que foi aberta, salva, mandada, aberta e salva de novo cinco vezes tem manchas quadradas em volta das letras — e ninguém apagou nada: foi a compactação, cinco vezes.',
    ],
    `SEM PERDA — desfaz e volta igual
.zip .rar .png .flac

COM PERDA — desfaz e volta parecido
.jpg .mp3 .mp4

foto.png    4,2 MB   ← cada ponto como foi fotografado
foto.jpg    380 KB   ← 11x menor, e alguns pontos foram inventados`,
    'Para a foto do acampamento no mural, JPG está ótimo. Para o documento digitalizado que alguém vai ler daqui a dez anos, não: texto fotografado com perda embaralha justamente as letras pequenas.',
    ['sem perda', 'com perda', 'jpg'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 3 — Salvar e excluir (requisitos 2 e 3)
   ──────────────────────────────────────────────────────────────────────── */

const SALVAR_E_EXCLUIR: TopicoDeVereda[] = [
  t(
    'salvar-e-salvar-como',
    'Salvar e salvar como',
    'Um escreve por cima; o outro cria um arquivo novo.',
    [
      'Salvar grava as mudanças **no mesmo arquivo**, por cima do que estava lá. O original deixa de existir na versão anterior — o que havia antes foi substituído, e não há botão para desfazer isso depois de fechar.',
      'Salvar como cria um arquivo **novo**, com o nome e o lugar que você escolher, e deixa o original exatamente como estava. A partir dali você está editando o novo, e não mais o antigo.',
      'A hora de usar "salvar como" é antes de mexer, e não depois. Abriu o modelo de autorização do ano passado para fazer o deste ano? Salve como primeiro, com o nome novo. Quem edita e só depois se lembra já escreveu por cima do modelo.',
    ],
    `SALVAR                        SALVAR COMO
autorizacao.docx              autorizacao.docx        ← intacto
  ↑ o mesmo arquivo,          autorizacao-2026.docx   ← arquivo novo
    com o conteúdo novo         ↑ você está editando este agora`,
    'O atalho Ctrl+S é "salvar", e ele não pergunta nada. Num arquivo aberto por engano — o modelo, o do ano passado, o que a secretaria mandou — um Ctrl+S automático já gravou por cima antes de você pensar.',
    ['salvar', 'salvar como', 'original'],
  ),
  t(
    'excluir-nao-e-apagar',
    'Excluir manda para a Lixeira',
    'O arquivo muda de pasta; ele não some.',
    [
      'Apertar Delete num arquivo não o apaga: move ele para a Lixeira, que é uma pasta como qualquer outra. Ele continua ocupando o mesmo espaço no disco, e continua lá até alguém esvaziar.',
      'É uma rede de proteção deliberada, porque excluir por engano é comum. Restaurar devolve o arquivo para a pasta exata de onde ele saiu — a Lixeira guarda o caminho de origem junto.',
      'Duas exceções que pegam todo mundo: Shift+Delete pula a Lixeira e exclui direto, e arquivo apagado de **pen drive** ou de rede também não passa por ela. Nos dois casos não há de onde restaurar com um clique.',
    ],
    `Documentos/Clube/2026/ata.docx
        │  Delete
        ▼
Lixeira/ata.docx        ← volta para: Documentos/Clube/2026/
        │  Restaurar
        ▼
Documentos/Clube/2026/ata.docx`,
    'Esvaziar a Lixeira para "liberar espaço" é o gesto que transforma um engano recuperável num engano definitivo. Olhe o que há dentro antes: é a última tela em que o arquivo ainda está inteiro.',
    ['Lixeira', 'restaurar', 'Shift+Delete'],
  ),
  t(
    'apagar-nao-apaga',
    'Nem esvaziar apaga de verdade',
    'O sistema risca o nome da lista; o conteúdo continua no disco.',
    [
      'Quando a Lixeira é esvaziada, o sistema não sai apagando o conteúdo pedaço por pedaço — seria lento sem necessidade. Ele só risca o nome do índice e marca aquele espaço como livre para ser usado de novo.',
      'Enquanto ninguém gravar nada por cima, os dados continuam inteiros no disco. É por isso que existem programas de recuperação, e é por isso que eles às vezes funcionam: o arquivo estava lá o tempo todo, sem nome.',
      'E é por isso que o contrário também é verdade: parar de usar o computador **aumenta** a chance de recuperar. Cada arquivo novo gravado depois pode cair justamente no espaço que era do que você quer de volta.',
    ],
    `Antes de esvaziar     ata.docx  →  blocos 4821..4890
Depois de esvaziar     (sem nome) →  blocos 4821..4890  [livres]
Depois de baixar       foto.jpg   →  blocos 4830..4870  ← por cima de parte da ata

Recuperar agora: provável.
Recuperar depois de usar o computador o dia todo: sorte.`,
    'O outro lado disso: doar ou vender um computador depois de "apagar tudo" não apaga nada. Quem quiser os arquivos de volta só precisa de um programa gratuito e de dez minutos.',
    ['esvaziar', 'recuperação', 'sobrescrever'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 4 — Achar sem procurar (requisitos 4.2, 4.3 e 4.4)
   ──────────────────────────────────────────────────────────────────────── */

const ACHAR: TopicoDeVereda[] = [
  t(
    'ordenar',
    'Ordenar pela coluna certa',
    'Cada coluna responde a uma pergunta diferente.',
    [
      'Clicar no cabeçalho de uma coluna ordena a pasta por ela, e clicar de novo inverte. São três ordens que resolvem três perguntas que ninguém resolve rolando a lista.',
      'Por **nome** é a ordem de procurar uma coisa cujo nome você sabe. Por **data de modificação** é "em que eu estava mexendo?", e é a mais útil no dia seguinte a uma reunião. Por **tamanho** é "o que está ocupando o disco?", e quase sempre a resposta são dois ou três arquivos, não duzentos.',
      'A ordem é da janela, e não do arquivo: ordenar não move, não renomeia e não muda nada em disco. É só uma maneira de olhar, e ela volta ao normal quando você quiser.',
    ],
    `Por nome                    Por data (mais recente primeiro)
ata.docx                    inscritos.xlsx    hoje 14:32
cronograma.docx             ata.docx          ontem 20:10
fotos/                      cronograma.docx   12/03 09:04
inscritos.xlsx              fotos/            02/01 11:20

Por tamanho (maior primeiro)
fotos/            184 MB   ← é isto que está enchendo o disco
inscritos.xlsx     94 KB
ata.docx           31 KB`,
    'Ordenar por data só ajuda quem não mexe em tudo o tempo todo. Abrir um arquivo não muda a data de modificação — mas salvar muda, mesmo que você não tenha alterado nada além de um espaço.',
    ['ordenar', 'data de modificação', 'tamanho'],
  ),
  t(
    'buscar',
    'Buscar com filtro',
    'O nome inteiro raramente se lembra; o tipo e o mês, sim.',
    [
      'A caixa de busca do Explorador procura dentro da pasta atual e de todas as que estão abaixo dela. Digitar um pedaço do nome já basta — não precisa ser o começo.',
      'Filtrar é o que faz a busca servir quando você não lembra o nome. Por **tipo** (`tipo:imagem`, `tipo:documento`) e por **data** (`data:este mês`, `data:2026`) você chega no arquivo sabendo só o que ele é e mais ou menos quando foi feito.',
      'Os filtros se combinam, e é aí que fica rápido: documento, deste ano, com "autoriza" no nome, são três condições que sobram cinco arquivos de uma pasta com quatrocentos.',
    ],
    `Busca: autoriza
  autorizacao.docx
  autorizacao-2025.docx
  autorizacao-2026-v02.docx
  autorizacoes-assinadas.pdf

Busca: autoriza  tipo:documento  data:2026
  autorizacao-2026-v02.docx`,
    'A busca acha pelo nome, e não pelo que está escrito dentro. Um documento chamado `doc1.docx` com a ata inteira dentro não aparece em busca nenhuma por "ata" — o que salva um arquivo é o nome dele.',
    ['buscar', 'filtro', 'tipo'],
  ),
  t(
    'ver-a-extensao',
    'Deixar a extensão à vista',
    'O Windows esconde por padrão, e esconder custa caro.',
    [
      'Por padrão o Explorador não mostra as extensões dos tipos que ele conhece: você vê `relatorio` e não `relatorio.docx`. A opção de exibir fica em Exibir, e ligá-la é a primeira coisa a fazer num computador novo.',
      'Com a extensão escondida, dois arquivos completamente diferentes aparecem com o mesmo nome na tela. `lista.csv` e `lista.xlsx` na mesma pasta viram dois "lista", e só o ícone distingue.',
      'E é assim que funciona o golpe mais antigo que existe: o arquivo se chama `autorizacao.pdf.exe`. Com as extensões escondidas, a tela mostra `autorizacao.pdf` — e o que vai abrir é um programa.',
    ],
    `Extensões escondidas        Extensões à vista
autorizacao                 autorizacao.pdf
lista                       lista.csv
lista                       lista.xlsx
boleto                      boleto.pdf.exe    ← isto é um programa`,
    'O ícone não é garantia: quem monta um arquivo desses escolhe o ícone de PDF de propósito. O que não se falsifica é a extensão — e por isso ela precisa estar visível.',
    ['extensão', 'exibir', 'executável'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 5 — O nome diz quando e qual (requisito 5)
   ──────────────────────────────────────────────────────────────────────── */

const NOMEAR: TopicoDeVereda[] = [
  t(
    'nome-que-ordena',
    'A data que ordena sozinha',
    'Ano, mês e dia, nessa ordem.',
      [
      'Escrever a data no nome do arquivo resolve duas coisas de uma vez: você sabe de quando é sem abrir, e a ordem por nome vira ordem por data.',
      'Mas só na ordem **ano-mês-dia**. `2026-03-14` e `2026-07-02` se ordenam certo sozinhas, porque o computador compara caractere por caractere, da esquerda para a direita. `14-03-2026` e `02-07-2026` põem julho antes de março, porque o 0 vem antes do 1.',
      'Use sempre dois dígitos: `2026-03` e não `2026-3`. Sem o zero, o mês 10 vem antes do mês 3 — é o mesmo problema, um nível abaixo.',
    ],
    `ERRADO — ordem por nome              CERTO — ordem por nome
02-07-2026-ata.docx                  2026-01-11-ata.docx
11-01-2026-ata.docx                  2026-03-14-ata.docx
14-03-2026-ata.docx                  2026-07-02-ata.docx
  ↑ julho, janeiro, março               ↑ janeiro, março, julho`,
    'Barra não pode aparecer em nome de arquivo — ela separa pastas no caminho. É por isso que a data no nome se escreve com traço, e não como `14/03/2026`.',
    ['data', 'ordem', 'zero à esquerda'],
  ),
  t(
    'versao-no-nome',
    'A versão que não mente',
    'v01, v02, v03 — e nunca "final".',
    [
      'Quando um documento passa por várias mãos, cada volta é uma versão. Numerá-las no nome — `v01`, `v02` — deixa claro qual é a mais nova e permite voltar a uma anterior quando alguém cortou o que não devia.',
      'O que não funciona é a palavra "final", e todo mundo já viveu isso: `ata-final.docx`, `ata-final2.docx`, `ata-FINAL-mesmo.docx`, `ata-final-revisada-ok.docx`. Nenhuma dessas quatro palavras diz qual é a última, e todas juram que dizem.',
      'Dois dígitos aqui também: `v01` e não `v1`, pelo mesmo motivo da data. Com um dígito, `v10` se ordena antes de `v2`.',
    ],
    `ERRADO                           CERTO
ata-final.docx                   2026-03-14-ata-v01.docx
ata-final2.docx                  2026-03-14-ata-v02.docx
ata-FINAL-mesmo.docx             2026-03-14-ata-v03.docx
ata-final-revisada-ok.docx
  ↑ qual é a última?               ↑ a de número maior`,
    'Versão não é a mesma coisa que data de modificação. Abrir a v01 e salvar sem querer põe a data de hoje nela — e aí a mais antiga passa a ser a mais recente pela data, enquanto o nome continua dizendo a verdade.',
    ['versão', 'v01', 'final'],
  ),
  t(
    'o-padrao-e-um-so',
    'Um padrão, aplicado a tudo',
    'Meio aplicado não é padrão: é mais uma bagunça.',
    [
      'Padrão de nomeação é uma regra escrita de como os nomes se formam, e que vale para todos os arquivos daquele trabalho. O formato importa menos do que ser o mesmo — o que não pode é cada arquivo seguir uma ideia diferente.',
      'Um que funciona bem no clube: **data, assunto, versão**, tudo minúsculo, com traço no lugar do espaço e sem acento. `2026-03-14-ata-reuniao-v02.docx`. Sem espaço porque endereço de internet e terminal tropeçam nele; sem acento porque nem todo sistema o carrega igual.',
      'Aplicar a dez arquivos leva cinco minutos e é o que faz o padrão existir. Aplicar a três, e deixar os outros sete como estavam, dá a mesma pasta desorganizada de antes, agora com a impressão de estar organizada.',
    ],
    `PADRÃO: AAAA-MM-DD-assunto-vNN.ext

2026-01-11-ata-reuniao-v01.docx
2026-01-11-ata-reuniao-v02.docx
2026-03-14-ata-reuniao-v01.docx
2026-03-20-inscritos-acampamento-v01.xlsx
2026-03-20-inscritos-acampamento-v02.xlsx
2026-04-02-autorizacao-modelo-v01.docx
2026-04-02-orcamento-acampamento-v01.xlsx
2026-04-18-cronograma-acampamento-v01.docx
2026-05-09-lista-materiais-v01.xlsx
2026-05-09-lista-materiais-v02.xlsx`,
    'O padrão vale para o que você cria. Arquivo que chegou de fora — o boleto do fornecedor, a foto que alguém mandou — se renomeia ao guardar, e não ao receber: renomear no meio do caminho quebra o que a outra pessoa está esperando.',
    ['padrão', 'nomeação', 'consistência'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 6 — Onde o arquivo mora (requisitos 6 e 4.6)
   ──────────────────────────────────────────────────────────────────────── */

const ONDE_MORA: TopicoDeVereda[] = [
  t(
    'local',
    'No disco do computador',
    'Rápido, e some junto com o computador.',
    [
      'Armazenamento local é o disco de dentro da máquina: o HD ou o SSD. É onde tudo fica por padrão, e é de longe o mais rápido — abrir um arquivo daqui é instantâneo.',
      'A vantagem é essa, e é grande: não depende de internet, não depende de ninguém, e funciona no sábado em que o sinal cai.',
      'O risco é de uma frase só: é uma cópia só, num lugar só. Disco queima, computador é roubado, criança derruba água no notebook — e tudo o que existia ali existia ali.',
    ],
    `Computador do clube
  C:\\  SSD 240 GB
    Clube/2026/...    ← rápido, sempre disponível
                      ← e uma cópia só`,
    'O computador do clube costuma ser de todo mundo. Local não quer dizer privado: quem senta nele depois abre a mesma pasta que você.',
    ['local', 'disco', 'cópia única'],
  ),
  t(
    'externo',
    'No dispositivo externo',
    'Vai junto, e é o que mais se perde.',
    [
      'Dispositivo externo é o pen drive, o cartão de memória, o HD externo. A vantagem é ser transportável: você leva a pasta inteira para a casa de outra pessoa sem depender de internet nenhuma.',
      'O risco também é ser transportável. Pen drive cai do bolso, fica esquecido no computador da escola, e quem o achar abre tudo — não há senha nenhuma ali por padrão. Além disso ele estraga: pen drive tem vida curta e morre sem avisar.',
      'Antes de puxar, **remova com segurança**. O sistema guarda parte do que foi copiado na memória e só termina de gravar quando você pede a remoção — puxar antes disso deixa o arquivo pela metade, e às vezes corrompe o pen drive inteiro.',
    ],
    `Copiar para o pen drive
  Documentos/Clube/2026/  →  E:\\Clube-2026\\   [copiando... 100%]

E ainda não acabou:
  Remover com segurança  →  "É seguro remover o hardware"
                             ↑ agora sim pode puxar`,
    'A barra chegar a 100% não quer dizer que terminou. Ela mede o que saiu do seu lado; o que ainda está por gravar do outro só se resolve na remoção segura.',
    ['pen drive', 'remoção segura', 'externo'],
  ),
  t(
    'nuvem',
    'Na nuvem',
    'O computador de outra pessoa, e é isso que ela resolve.',
    [
      'Armazenamento em nuvem é um disco que fica num servidor de alguma empresa, e que você acessa pela internet: Google Drive, OneDrive, Dropbox. A pasta aparece no seu computador como se fosse local, e o programa sincroniza por trás.',
      'A vantagem é que ele sobrevive ao seu computador. Notebook roubado, disco queimado, celular no chão — os arquivos continuam lá, e aparecem de novo no aparelho seguinte. E dá para abrir de qualquer lugar, o que é metade do trabalho do clube.',
      'O risco tem dois lados. Sem internet você não alcança o que é seu. E o arquivo está no computador de uma empresa: se a conta for invadida, se o pagamento atrasar, ou se a empresa decidir encerrar o serviço, o problema é seu e a decisão não é.',
    ],
    `                  VANTAGEM                 RISCO
Local             rápido, sem internet      uma cópia só, num lugar só
Externo           vai junto para qualquer   perde-se, e estraga sem avisar
                  lugar
Nuvem             sobrevive ao aparelho,    depende de internet e de uma
                  e abre em qualquer um     conta que pode ser invadida`,
    'Sincronizar não é fazer cópia de segurança, e confundir os dois já custou o arquivo de muita gente: apagar na nuvem apaga no computador, e apagar no computador apaga na nuvem. A sincronia repete o engano em todos os lugares, na hora.',
    ['nuvem', 'sincronizar', 'disponibilidade'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 7 — A cópia que salva (requisitos 7, 8 e 9)
   ──────────────────────────────────────────────────────────────────────── */

const COPIA: TopicoDeVereda[] = [
  t(
    'copia-de-seguranca',
    'Cópia de segurança',
    'Uma segunda cópia, guardada longe da primeira.',
    [
      'Cópia de segurança é uma segunda cópia dos arquivos, feita de propósito e guardada em outro lugar, para o dia em que a primeira sumir. Em inglês se chama *backup*, e é a palavra que você vai ver nos programas.',
      'O que a define não é copiar: é estar **em outro lugar**. Uma cópia da pasta na mesma máquina protege contra apagar por engano, e não protege contra o disco queimar — que leva as duas.',
      'E cópia que nunca foi testada não conta como cópia. Todo mundo que já perdeu arquivo tinha uma rotina de backup; boa parte descobriu no dia da perda que ela estava gravando a pasta errada há meses.',
    ],
    `NÃO É CÓPIA DE SEGURANÇA
C:\\Clube\\2026\\          e   C:\\Clube\\2026 - cópia\\
  ↑ o mesmo disco: uma pane leva as duas

É CÓPIA DE SEGURANÇA
C:\\Clube\\2026\\          e   HD externo na casa do diretor
  ↑ dois lugares, dois meios`,
    'O arquivo que você mais precisaria ter copiado é sempre o que mudou hoje. Cópia de um mês atrás salva o trabalho do ano e perde o da semana — a pergunta que decide a frequência é "quanto trabalho eu aceito refazer?".',
    ['cópia de segurança', 'backup', 'outro lugar'],
  ),
  t(
    'tres-duas-uma',
    'Três cópias, dois meios, uma fora',
    'A regra que cabe num clube, e que cobre quase tudo.',
    [
      'A regra se escreve **3-2-1**: três cópias do arquivo no total, em pelo menos dois meios diferentes, e pelo menos uma delas fora do lugar onde você trabalha.',
      'Três cópias porque duas viram uma no dia em que a primeira falha, e aí você está sem rede. Dois meios porque falha costuma ser de meio: um lote ruim de pen drive, uma versão de programa que corrompe, uma tomada que queima tudo o que estava ligada nela.',
      'E uma fora do local por causa do que atinge o lugar inteiro: incêndio, enchente, furto da sede. Se as três cópias estão na mesma sala, a regra 3-2-1 não foi cumprida — foi cumprido o 3, que é o mais fácil e o que menos protege.',
    ],
    `O arquivo da tesouraria do clube, cumprindo 3-2-1

1  computador da secretaria     (SSD)          ← o original
2  HD externo, no armário       (disco)        ← segundo meio
3  Google Drive do clube        (nuvem)        ← fora do local

3 cópias · 2 meios (disco e nuvem) · 1 fora da sede ✓`,
    'Sincronia em nuvem sozinha não fecha a regra: ela é uma cópia só, espelhada. Apagou aqui, apagou lá. O que a transforma em cópia de segurança é o histórico de versões que ela guarda por trás — e é ele que o próximo tópico usa.',
    ['3-2-1', 'dois meios', 'fora do local'],
  ),
  t(
    'restaurar',
    'Restaurar da cópia',
    'A cópia só vale no dia em que você consegue trazê-la de volta.',
    [
      'Restaurar é o caminho de volta: pegar o arquivo na cópia de segurança e trazê-lo para o lugar onde ele deveria estar. É a única parte do backup que importa de verdade, e é a que quase ninguém treina.',
      'Restaure para um lugar novo primeiro, e confira antes de substituir. Restaurar direto por cima do que está lá é a forma mais rápida de apagar a versão boa com a versão velha, na hora em que você está nervoso porque perdeu alguma coisa.',
      'Testar a restauração uma vez por ano é o que separa ter uma cópia de achar que tem. Escolha um arquivo qualquer, restaure, abra, veja se abre — leva cinco minutos e responde a única pergunta que interessa.',
    ],
    `Perdeu:   Documentos/Clube/2026/inscritos.xlsx

1  Abrir a cópia          E:\\Backup\\2026-05-09\\
2  Achar o arquivo        inscritos.xlsx
3  Copiar para um lugar   Área de Trabalho/teste/
   novo
4  Abrir e conferir       ← é a versão que você espera?
5  Só então               Documentos/Clube/2026/
   pôr no lugar`,
    'Cópia que não abre não é cópia. Arquivo corrompido no backup tem o tamanho certo, a data certa e o nome certo — e o que denuncia é abrir, que é justamente o passo que se pula com pressa.',
    ['restaurar', 'testar', 'conferir'],
  ),
  t(
    'versao-anterior',
    'Voltar a versão anterior',
    'O histórico que o programa guarda sem você pedir.',
    [
      'Nem toda perda é o arquivo sumir. Muitas vezes ele está lá e está errado: alguém apagou três páginas, colou por cima, salvou. O arquivo existe, e o que se quer de volta é como ele era ontem.',
      'Para isso existe o **histórico de versões**. O Word e o Google Docs guardam as versões anteriores por conta própria, e o Drive e o OneDrive guardam até trinta dias de cada arquivo — dá para abrir uma versão antiga, olhar, e restaurar só ela.',
      'E existe o **salvamento automático**, que é outra coisa: ele guarda uma cópia de recuperação enquanto você trabalha, para o caso de o programa fechar sozinho. Ao reabrir, o programa oferece o documento recuperado — e essa oferta aparece uma vez. Quem clica em descartar, descartou.',
    ],
    `Histórico do arquivo inscritos.xlsx

hoje    14:32   você              ← versão atual (faltam 3 nomes)
hoje    09:11   Diretoria
ontem   20:10   você              ← restaurar esta
12/03   09:04   Secretaria

Salvamento automático: o programa fechou às 14:05.
"Recuperar documento não salvo?"  ← aparece uma vez só`,
    'Histórico existe onde o arquivo mora. Documento guardado só no disco local não tem histórico nenhum além do que o próprio programa gravou — é na nuvem e nos programas que salvam versão que ele existe.',
    ['histórico', 'versão anterior', 'salvamento automático'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Os módulos

   Só teoria por enquanto: os laboratórios vêm na etapa seguinte, e a vereda
   fica `emConstrucao` até eles chegarem. É o que "vereda em construção pode ter
   conteúdo" permite, e é o que mantém cada PR pequeno — o que já está escrito
   passa pelas travas de qualidade desde agora.
   ──────────────────────────────────────────────────────────────────────── */

export const MODULOS_DE_ARQUIVOS: ModuloDeVereda[] = [
  {
    id: 'm1',
    titulo: 'O arquivo e a pasta',
    resumo: 'O que cada um guarda, o que a extensão diz, e como se escreve o endereço de um arquivo.',
    licoes: [
      {
        id: 'm1-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_ARQUIVOS['m1-teoria'],
        perguntas: 4,
        titulo: 'As quatro palavras que sustentam o resto',
        resumo: 'Arquivo, pasta, extensão, caminho e atalho.',
        topicos: ARQUIVO_E_PASTA,
      },
    ],
  },
  {
    id: 'm2',
    titulo: 'O que está dentro do nome',
    resumo: 'De quem é o formato, e o que acontece com o arquivo quando ele encolhe.',
    licoes: [
      {
        id: 'm2-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_ARQUIVOS['m2-teoria'],
        perguntas: 4,
        titulo: 'Formato e compactação',
        resumo: 'Aberto e proprietário, zip e jpg, e o que não volta.',
        topicos: FORMATOS,
      },
    ],
  },
  {
    id: 'm3',
    titulo: 'Salvar e excluir',
    resumo: 'Duas ações que parecem simples e desfazem trabalho sem avisar.',
    licoes: [
      {
        id: 'm3-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_ARQUIVOS['m3-teoria'],
        perguntas: 4,
        titulo: 'O que some, e quanto some',
        resumo: 'Salvar contra salvar como, a Lixeira, e o que sobra depois de esvaziar.',
        topicos: SALVAR_E_EXCLUIR,
      },
    ],
  },
  {
    id: 'm4',
    titulo: 'Achar sem procurar',
    resumo: 'Ordenar pela coluna certa, buscar com filtro, e deixar a extensão à vista.',
    licoes: [
      {
        id: 'm4-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_ARQUIVOS['m4-teoria'],
        perguntas: 4,
        titulo: 'O gerenciador responde perguntas',
        resumo: 'Cada coluna, cada filtro, e por que a extensão escondida é um risco.',
        topicos: ACHAR,
      },
    ],
  },
  {
    id: 'm5',
    titulo: 'O nome diz quando e qual',
    resumo: 'A data que ordena sozinha, a versão que não mente, e o padrão aplicado a tudo.',
    licoes: [
      {
        id: 'm5-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_ARQUIVOS['m5-teoria'],
        perguntas: 4,
        titulo: 'Nomear é organizar antes de precisar',
        resumo: 'AAAA-MM-DD, vNN, e por que "final" nunca é o final.',
        topicos: NOMEAR,
      },
    ],
  },
  {
    id: 'm6',
    titulo: 'Onde o arquivo mora',
    resumo: 'Local, externo e nuvem: o que cada um dá, e o que cada um cobra.',
    licoes: [
      {
        id: 'm6-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_ARQUIVOS['m6-teoria'],
        perguntas: 4,
        titulo: 'Três lugares, três riscos',
        resumo: 'Uma vantagem e um risco de cada, e a remoção segura.',
        topicos: ONDE_MORA,
      },
    ],
  },
  {
    id: 'm7',
    titulo: 'A cópia que salva',
    resumo: 'A regra 3-2-1, restaurar de verdade, e voltar à versão de ontem.',
    licoes: [
      {
        id: 'm7-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_ARQUIVOS['m7-teoria'],
        perguntas: 4,
        titulo: 'O dia em que o arquivo some',
        resumo: 'Cópia de segurança, 3-2-1, restauração testada e histórico de versões.',
        topicos: COPIA,
      },
    ],
  },
];
