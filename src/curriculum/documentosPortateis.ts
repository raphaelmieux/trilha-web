import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DE_PDF } from './questoesDeDocumentosPortateis';

/*
 * A vereda CC-ES004 Documentos Portáteis.
 *
 * ── O que ela é ─────────────────────────────────────────────────────────
 * O clube produz documento o ano inteiro — ata, circular, autorização,
 * recibo, ficha médica —, e quase todo ele acaba em PDF para circular. O que
 * esta vereda ensina é o que acontece **depois** de o documento ficar pronto:
 * como ele vira PDF, como vários viram um, como ele encolhe, como se
 * digitaliza papel, e o que uma assinatura e uma senha de fato garantem.
 *
 * ── Por que ela exige a CC-ES002 ────────────────────────────────────────
 * Está escrito no requisito 1. A razão é direta: o requisito 4.1 manda gerar
 * PDF a partir de um documento de texto, e quem não sabe montar o documento
 * não tem o que exportar.
 *
 * ── E o que carrega esta vereda é o que não se vê ───────────────────────
 * A matéria inteira é sobre diferença invisível. Um PDF pesquisável e um em
 * imagem abrem **iguais**. Uma assinatura colada e uma verificável desenham o
 * mesmo rabisco. Um documento protegido por senha e um documento seguro têm o
 * mesmo cadeado na tela. Em todos os três, o que a pessoa vê não responde à
 * pergunta que ela precisa fazer — e é por isso que o requisito 5 pede
 * **prova**, e não olhada.
 */

const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], exemplo: string, atencao: string, marcas: string[],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, exemplo, exemploComo: 'texto' as const, atencao, marcas,
});

/* ────────────────────────────────────────────────────────────────────────
   Módulo 1 — O que é um PDF (requisitos 2.1, 3, 4.1)
   ──────────────────────────────────────────────────────────────────────── */

const O_QUE_E_UM_PDF: TopicoDeVereda[] = [
  t(
    'o-que-e-pdf',
    'O que é um PDF',
    'Um documento que leva dentro tudo de que precisa para ser desenhado igual.',
    [
      'PDF quer dizer Portable Document Format, formato de documento portátil. Portátil aqui não é sobre tamanho: é sobre chegar do outro lado igual ao que saiu.',
      'Um .docx guarda o texto e manda o programa desenhá-lo com as fontes do computador que abrir. Se a fonte não estiver lá, o programa escolhe outra — e a página que tinha três parágrafos passa a ter quatro, com o último sozinho numa folha nova.',
      'O PDF não faz isso porque ele leva as fontes dentro dele, e leva também onde cada letra fica na página. Ele não pede nada ao computador que o abre além de um leitor.',
      'É por isso que quase tudo o que circula é PDF: boleto, ingresso, ficha, contrato. Quem manda precisa que o outro veja exatamente aquilo.',
    ],
    `O mesmo documento, dois formatos

.docx no computador de quem escreveu   .docx no computador do clube
  Ata da reunião                          Ata da reunião
  Aos quatorze dias do mês de março       Aos quatorze dias do mês de
  de 2026, reuniu-se a diretoria.         março de 2026, reuniu-se a
                                          diretoria.

.pdf em qualquer um dos dois
  Ata da reunião
  Aos quatorze dias do mês de março
  de 2026, reuniu-se a diretoria.`,
    'O PDF não "trava" o documento: ele guarda um retrato dele. Quem tiver o programa certo edita um PDF — o que não dá é editar junto, porque não há de onde o texto voltar.',
    ['PDF', 'formato portátil', 'fontes embutidas'],
  ),
  t(
    'distribuir-e-editar',
    'Bom para distribuir, ruim para escrever junto',
    'A mesma coisa que faz o PDF chegar igual faz ele ser o formato errado para trabalhar a quatro mãos.',
    [
      'Um documento que está sendo escrito muda de tamanho o tempo todo: um parágrafo a mais empurra tudo o que vem depois, o sumário se refaz, a numeração anda. Essa elasticidade é o que um editor de texto oferece.',
      'O PDF não tem essa elasticidade, e não tem de propósito: ele guarda onde cada letra fica. Escrever uma palavra no meio de um parágrafo de PDF não empurra o resto da página — ela cabe ou não cabe.',
      'Então o caminho é sempre o mesmo: escreve-se no editor, e exporta-se para PDF na hora de mandar. Quem precisar mudar alguma coisa muda no editor e exporta de novo.',
      'Quem inverte isso acaba com dois documentos: o PDF corrigido que foi entregue e o editável desatualizado que a próxima diretoria vai abrir no ano que vem.',
    ],
    `O caminho certo                     O caminho que dá errado
──────────────────────              ──────────────────────────
ata.docx  ← todo mundo escreve      ata.pdf  ← alguém corrige aqui
    ↓ exporta                          e o ata.docx continua velho
ata.pdf   ← circula                    ↓
                                    ano que vem alguém abre o .docx`,
    'Esta é a razão de o PDF ser ótimo e péssimo pelo mesmo motivo. Não há um formato bom para as duas coisas — há dois formatos, e um momento certo de trocar de um para o outro.',
    ['distribuição', 'edição colaborativa', 'exportar'],
  ),
  t(
    'como-se-gera',
    'Imprimir é como se gera',
    'O caminho é o mesmo em todo programa, e é por isso que ele vale a pena.',
    [
      'Quase todo programa que desenha uma página sabe gerar PDF, e quase sempre pelo mesmo lugar: o menu Imprimir. Na lista de impressoras aparece "Salvar como PDF" ou "Microsoft Print to PDF", que não é impressora nenhuma — é o próprio sistema escrevendo o arquivo.',
      'Funciona no editor de texto, na planilha, na apresentação, no navegador e no leitor de e-mail. Aprende-se uma vez e serve para tudo, que é a razão de este ser o caminho a decorar.',
      'Alguns programas também têm "Exportar como PDF" no menu Arquivo. Dá no mesmo, e onde existir é um caminho a menos.',
      'O que muda de um programa para outro é o que cabe na folha. A planilha pergunta quais colunas entram; a apresentação pergunta se vai um slide por página ou vários. Vale olhar a prévia antes de salvar.',
    ],
    `Arquivo › Imprimir

  Impressora:  [ Salvar como PDF        ▾ ]
               [ HP DeskJet 2700          ]
               [ Microsoft Print to PDF   ]

  Páginas:     ( ) Todas   ( ) 1 a 3
  Prévia:      ┌──────────┐
               │ Ata da   │
               │ reunião  │
               └──────────┘
                              [ Salvar ]`,
    'A prévia de impressão é a única chance de ver o que vai sair. Planilha larga vira PDF cortado ao meio com frequência, e o corte só aparece depois de o arquivo já ter sido enviado.',
    ['Imprimir', 'Salvar como PDF', 'exportar'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 2 — Juntar, extrair e dividir (requisitos 4.2 e 4.3)
   ──────────────────────────────────────────────────────────────────────── */

const JUNTAR_E_PARTIR: TopicoDeVereda[] = [
  t(
    'juntar',
    'Reunir vários num só',
    'Três anexos num e-mail viram dois abertos e um esquecido.',
    [
      'Combinar põe vários PDFs um depois do outro, na ordem que se escolher, e produz um arquivo novo. Os originais continuam na pasta: combinar copia, não consome.',
      'A razão de fazer isso quase nunca é economizar espaço — é que documento que vai junto chega junto. Quem recebe três anexos abre o primeiro, resolve o assunto e não volta aos outros dois.',
      'A ordem importa e se escolhe na hora. A ata antes do orçamento, o orçamento antes da apresentação: quem lê espera a sequência da reunião, e não a ordem em que os arquivos foram salvos.',
      'Depois de combinar, vale abrir o resultado e olhar as miniaturas. É onde se percebe que uma das partes entrou de cabeça para baixo ou que faltou uma página.',
    ],
    `Antes                          Depois
─────                          ──────
ata.pdf          (1 pág.)      acampamento.pdf  (3 págs.)
orcamento.pdf    (1 pág.)        1 · ata
apresentacao.pdf (1 pág.)        2 · orçamento
                                 3 · apresentação

  e os três originais continuam na pasta`,
    'Combinar um documento com ele mesmo três vezes produz um arquivo de três páginas e nada reunido. O número de páginas fecha, e não é o número que conta.',
    ['combinar', 'ordem', 'anexos'],
  ),
  t(
    'extrair-e-dividir',
    'Extrair não é dividir',
    'Uma copia para fora; a outra reparte e não sobra o inteiro.',
    [
      'Extrair tira uma cópia das páginas escolhidas para um arquivo novo, e o documento inteiro continua de pé. Serve quando a secretaria precisa só da página do orçamento e não tem por que receber o resto.',
      'Dividir reparte o documento em dois a partir de uma página: o que vem antes num arquivo, o que vem depois em outro. Serve quando o arquivo era grande demais para anexar, ou quando metade dele é de outra pessoa.',
      'A diferença aparece no dia em que alguém precisa do documento completo. Depois de extrair, ele existe; depois de dividir, ele foi repartido.',
      'Nas duas, a escolha das páginas se faz no painel de miniaturas, à esquerda. Marca-se ali, e o programa age sobre o que está marcado — como em todo programa, o comando age sobre o que foi escolhido, e não sobre o que ele adivinha.',
    ],
    `Extrair a página 2                Dividir a partir da página 3
──────────────────                ────────────────────────────
inteiro.pdf   (3 págs.)  fica     parte-1.pdf  (págs. 1 e 2)
orcamento.pdf (1 pág.)   novo     parte-2.pdf  (pág. 3)

                                   e inteiro.pdf não existe mais
                                   como resultado da operação`,
    'Antes de dividir, vale conferir a conta: a soma das páginas dos dois pedaços tem de dar o total do original. Uma página que some no caminho não avisa, e o dossiê chega sem o orçamento dentro.',
    ['extrair', 'dividir', 'miniaturas'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 3 — O peso, e o que se perde (requisitos 2.2, 2.5, 4.4)
   ──────────────────────────────────────────────────────────────────────── */

const PESO_E_PERDA: TopicoDeVereda[] = [
  t(
    'pesquisavel-ou-imagem',
    'Pesquisável ou em imagem',
    'Dois PDFs que abrem exatamente iguais, e só um deles tem letras dentro.',
    [
      'Um PDF gerado de um documento de texto tem as letras dentro dele: cada palavra está lá, gravada como palavra. É um documento pesquisável — dá para procurar, copiar e selecionar.',
      'Um PDF feito de fotografia de papel não tem letra nenhuma dentro. Tem uma imagem que desenha letras, que é outra coisa: o computador vê manchas escuras sobre fundo claro, e não sabe que aquilo diz "Ficha médica".',
      'Na tela, os dois são idênticos. A mesma folha, a mesma letra, o mesmo tamanho. A diferença só aparece quando alguém procura uma palavra: num ela aparece, no outro o leitor responde nenhum resultado com a palavra à vista na página.',
      'Num dossiê que vai ficar arquivado, o documento em imagem é o que ninguém acha quando precisa. E nada na lista de arquivos diz qual dos cinco é ele.',
    ],
    `Procurando "Chácara" nos dois

documento gerado do editor     documento fotografado
  → 1 página encontrada          → nenhum resultado

  e os dois mostram, na tela:
  ┌────────────────────────────┐
  │ Recibo 118 — Chácara       │
  │ Recanto                    │
  └────────────────────────────┘`,
    'O leitor avisa em amarelo quando o documento não tem texto dentro — mas o aviso some assim que existir qualquer texto, inclusive um texto reconhecido errado. Sumir não quer dizer resolvido.',
    ['pesquisável', 'documento em imagem', 'camada de texto'],
  ),
  t(
    'compressao',
    'Compressão',
    'Encolher o arquivo é jogar alguma coisa fora, e vale saber o quê.',
    [
      'Comprimir um PDF é recomprimir as imagens que estão dentro dele com menos qualidade. O texto não encolhe, porque texto já é leve: cinco páginas de letras pesam menos que uma foto.',
      'Por isso comprimir um documento digitado quase não muda nada, e comprimir um documento digitalizado muda muito. Cinco páginas fotografadas passam de nove megabytes; as mesmas cinco páginas digitadas não chegam a duzentos kilobytes.',
      'O que se perde é nitidez de imagem. Numa foto de paisagem isso aparece como borrão; numa foto de papel escrito, aparece como letra que começa a se desmanchar na borda.',
      'A escolha do nível é uma conta: caixa de e-mail costuma aceitar até uns vinte e cinco megabytes, e é para baixo disso que se comprime. Comprimir mais do que o necessário é jogar fora qualidade sem ganhar nada.',
    ],
    `Cinco páginas, dois documentos

digitadas no editor       9,2 MB → comprimido → 9,0 MB
                          (quase nada: é tudo texto)

fotografadas do papel     9,2 MB → comprimido → 2,0 MB
                          (muito: é tudo imagem)`,
    'A perda de nitidez não volta. Comprimir forte um documento e depois precisar dele legível quer dizer digitalizar o papel de novo — e às vezes o papel já não existe.',
    ['compressão', 'qualidade', 'tamanho do arquivo'],
  ),
  t(
    'a-ordem-custa',
    'A ordem entre reconhecer e reduzir',
    'Os dois caminhos encolhem igual, e só um deixa o arquivo servindo para alguma coisa.',
    [
      'Quem digitaliza papel tem duas coisas a fazer: reconhecer o texto e reduzir o tamanho. Elas podem ser feitas em qualquer ordem, e a ordem muda o resultado.',
      'Reconhecer primeiro dá ao programa a imagem inteira para ler, e ele acerta. O texto que ele grava é leve e não encolhe depois: comprimir em seguida mexe só na foto.',
      'Comprimir primeiro tira nitidez, e o reconhecimento fica com menos do que ler. Ele erra — e erra parecido, trocando letras por letras parecidas, que é pior do que não ler nada.',
      'Nos dois casos o arquivo termina com o mesmo tamanho. Na lista de arquivos, os dois são indistinguíveis. A diferença só aparece procurando uma palavra.',
    ],
    `Reconhecer e depois reduzir     Reduzir e depois reconhecer
───────────────────────────     ───────────────────────────
2,0 MB                           2,0 MB
procurando "Ficha": 5 páginas    procurando "Ficha": nenhuma
                                 (o arquivo guardou "Filcia")`,
    'Não há aviso nenhum do lado errado. O arquivo passa a se dizer pesquisável, porque ele tem texto dentro — só que o texto está errado.',
    ['ordem', 'reconhecimento', 'compressão'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 4 — Digitalizar e reconhecer (requisitos 2.3 e 5)
   ──────────────────────────────────────────────────────────────────────── */

const DIGITALIZAR: TopicoDeVereda[] = [
  t(
    'digitalizar-bem',
    'Digitalizar é mais do que fotografar',
    'O aplicativo endireita, recorta e firma o contraste, e as três coisas mudam o que dá para ler.',
    [
      'Aplicativo de digitalizar não tira foto: ele tira foto e conserta. Detecta a borda da folha, endireita a perspectiva, recorta o que sobrou de mesa em volta e aplica um filtro que firma o contraste.',
      'A detecção de borda erra com frequência — em mesa de madeira, com pouca luz, ela pega a beirada da mesa em vez da folha. Por isso os quatro cantos são ajustáveis: arrasta-se cada um até a quina do papel, ou toca-se nele para encaixar.',
      'O filtro é a parte que quase todo mundo pula. "Original" guarda a cor e deixa a letra acinzentada; "Preto e branco" joga fora tudo o que não é quase-preto e deixa a letra limpa. Para papel escrito, é o segundo que serve.',
      'O aplicativo mostra um aviso do que ele mediu — imagem escura, página torta. Ele diz o que viu, e não se a tarefa está boa: quem julga é quem digitalizou.',
    ],
    `Como a foto cai e como ela fica

recém-tirada        9° torta, 28px de mesa em volta,
                    contraste 38  →  aviso: ruim

cantos encaixados   reta e sem mesa,
e endireitada       contraste 38  →  aviso: ruim ainda

filtro Preto        reta, sem mesa,
e branco            contraste 96  →  aviso: bom`,
    'Arrumar metade não basta, e essa é a parte que engana: a folha fica reta e bem recortada, parece pronta, e o contraste continua o de uma foto de mesa.',
    ['digitalizar', 'enquadramento', 'contraste'],
  ),
  t(
    'ocr',
    'Reconhecimento óptico de caracteres',
    'O programa olha as manchas escuras e adivinha que letra é cada uma.',
    [
      'Reconhecimento óptico de caracteres, ou OCR, é o programa lendo uma imagem e escrevendo, por baixo dela, o texto que ele acha que está ali. A imagem continua sendo o que se vê; o texto fica numa camada invisível.',
      'É adivinhação, e adivinhação erra. Quanto pior a foto, mais ele erra — e o jeito dele errar é o que engana: ele não devolve garranchos, devolve palavras parecidas.',
      'A troca mais famosa é o "m" virando "rn": "acampamento" vira "acarnparnento", que lido rápido é a palavra certa. Também trocam "h" por "li", "d" por "cl", "e" por "c".',
      'Texto que falta se percebe olhando o tamanho do arquivo ou a página vazia. Texto quase certo não se percebe de jeito nenhum — e os dois falham na busca exatamente igual.',
    ],
    `O que o papel diz e o que o OCR gravou

papel:      Recibo 118 — Chácara Recanto
foto boa:   Recibo 118 — Chácara Recanto
foto ruim:  Rccibo 118 — Cliácara Rccanto

procurando "Chácara" na foto ruim: nenhum resultado`,
    'Depois de reconhecer, o aviso amarelo de "documento em imagem" some, e o leitor passa a tratar o arquivo como pesquisável. Isso não diz nada sobre o texto estar certo.',
    ['OCR', 'reconhecimento', 'camada de texto'],
  ),
  t(
    'comprovar',
    'Comprovar procurando',
    'Olhar a página não prova nada; achar uma palavra dentro dela, sim.',
    [
      'Depois de digitalizar e reconhecer, a pergunta é: deu certo? E ela não se responde olhando, porque um documento em imagem e um pesquisável abrem iguais.',
      'Responde-se procurando. Escolhe-se uma palavra que está claramente na página — um nome, um número de recibo — e procura-se no leitor. Se o contador disser quantas páginas acharam, o reconhecimento funcionou.',
      'Se disser nenhum resultado, uma de duas coisas aconteceu: ninguém reconheceu o texto, ou o reconhecimento leu errado. As duas se consertam do mesmo jeito — refazer a captura com enquadramento e filtro melhores, e reconhecer de novo.',
      'Vale escolher uma palavra incomum. Procurar "de" acha alguma coisa em quase qualquer lixo; procurar "Chácara" só acha se a palavra estiver lá.',
    ],
    `A prova, no leitor

  🔍 [ Chácara            ]   1 página

  🔍 [ Chácara            ]   nenhum resultado
      ↑ e a palavra está à vista na tela`,
    'A contradição é o ponto: a palavra está desenhada na página e o programa não a encontra. É essa contradição que mostra o que é camada de texto.',
    ['prova', 'procurar', 'camada de texto'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 5 — Formulário e comentário (requisitos 4.5 e 4.6)
   ──────────────────────────────────────────────────────────────────────── */

const FORMULARIO_E_COMENTARIO: TopicoDeVereda[] = [
  t(
    'formulario',
    'Formulário em PDF',
    'Campos para preencher na tela, e o caminho que quase todo mundo faz errado.',
    [
      'Um PDF pode trazer campos de formulário: caixas onde se clica e se escreve, como a autorização que volta assinada. Eles aparecem com fundo azulado, e os obrigatórios ficam com a borda vermelha enquanto estiverem vazios.',
      'Preencher na tela mantém o documento pesquisável e legível. O que se digita entra como texto de verdade dentro do arquivo.',
      'O caminho errado é o comum: imprimir, escrever à mão, fotografar de volta e mandar a foto. Isso transforma um documento pesquisável de duzentos kilobytes numa imagem de dois megabytes, com a letra de alguém que estava com pressa.',
      'Se o PDF não tiver campos, ainda assim não é preciso imprimir: os leitores têm uma ferramenta de escrever por cima. É pior do que campo de verdade, e muito melhor do que papel fotografado.',
    ],
    `Autorização de participação

  Nome do desbravador  [ Ana Beatriz Rocha     ]
  Unidade              [ Águia                 ]
  Responsável          [                       ] ← vermelho
  Telefone             [                       ] ← vermelho
  Observações          [                       ]`,
    'Campo preenchido com espaços continua vazio para quem vai ler. O leitor não reclama, o campo perde a borda vermelha, e o documento chega sem o nome do responsável.',
    ['formulário', 'campos', 'preencher'],
  ),
  t(
    'marcar-e-comentar',
    'Marcação e comentário',
    'Uma aponta onde; o outro diz o quê.',
    [
      'Destacar pinta um trecho e não diz nada além de "olhe aqui". Comentar abre um balão na margem com um texto escrito. São ferramentas diferentes e servem juntas.',
      'Num documento que volta para outra pessoa, os dois juntos poupam um telefonema: a marcação mostra o lugar e o comentário explica o que fazer com ele.',
      'Os balões ficam **fora** do papel, na margem. É de propósito: comentário não sai na impressão e não empurra o texto — ele é conversa sobre o documento, e não parte dele.',
      'Quando alguém deixa uma pergunta num comentário, responder é outra ação, e não a mesma coisa que marcar como resolvido. Resolver sem responder fecha o assunto sem dizer nada a quem perguntou.',
    ],
    `A circular, com a margem aberta

┌──────────────────────────┐   ┌────────────────────┐
│ Circular 03/2026         │   │ Tia Rute           │
│ O acampamento acontecerá │   │ A data bate com o  │
│ de 17 a 19 de julho.     │   │ calendário? Confira│
│ A autorização deve voltar│   └────────────────────┘
│ até o dia 30 de junho.   │   ┌────────────────────┐
└──────────────────────────┘   │ Ana Beatriz        │
   ↑ trecho destacado          │ Confirmei: bate.   │
                               └────────────────────┘`,
    'Comentário não é edição. Ele fica por cima do documento e pode ser apagado por quem receber — o que está escrito no texto continua escrito no texto.',
    ['destacar', 'comentar', 'margem'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 6 — O que parece garantia (requisitos 2.4, 6 e 7)
   ──────────────────────────────────────────────────────────────────────── */

const O_QUE_PARECE_GARANTIA: TopicoDeVereda[] = [
  t(
    'assinatura-eletronica',
    'Assinatura eletrônica',
    'Não é o desenho do nome: é o que o documento passa a poder provar.',
    [
      'Assinatura eletrônica é qualquer marca que diga quem concordou com um documento. Ela vai de um nome digitado no fim de um e-mail até um certificado emitido por uma autoridade — e o que muda entre os extremos é o quanto ela prova.',
      'A que interessa aqui é a **verificável**: ela guarda quem assinou, quando assinou, e uma impressão digital do documento naquele instante.',
      'Impressão digital do documento é um número calculado a partir de cada byte dele. Mudar uma vírgula muda o número inteiro, e é isso que permite ao leitor conferir depois se o documento ainda é o mesmo.',
      'A assinatura verificável não impede ninguém de mexer no documento. Ela faz com que mexer **apareça** — que é uma garantia diferente, e mais útil.',
    ],
    `O selo, na barra de baixo do leitor

  ✓ Assinatura válida
    Marta Rocha · 12/07/2026 · confere com o documento

  ⚠ Assinatura não confere
    o documento mudou depois de assinado`,
    'Assinatura válida não quer dizer documento verdadeiro: quer dizer que ele não mudou desde que aquela pessoa assinou. Quem assinou e o que estava escrito continuam sendo perguntas separadas.',
    ['assinatura eletrônica', 'verificável', 'impressão digital'],
  ),
  t(
    'colada-ou-verificavel',
    'A imagem colada e a verificável',
    'Desenham o mesmo rabisco na mesma página, e uma delas não prova nada.',
    [
      'Colar a imagem de uma assinatura é inserir uma figura no documento. Ela fica bonita e não guarda informação nenhuma: qualquer pessoa que já tenha visto aquele documento pode recortar a figura e colar noutro.',
      'A verificável desenha o mesmo rabisco e guarda junto a impressão do documento. Se alguém mexer depois, o selo passa a dizer que não confere.',
      'No dia de assinar, as duas são iguais. A diferença aparece depois — e por isso quem escolhe pela aparência escolhe no escuro.',
      'A imagem colada tem seu uso: um convite, um cartão, uma coisa que não precisa provar nada. Autorização, recibo e contrato pedem a outra.',
    ],
    `Mês seguinte: alguém muda o valor do recibo

assinatura colada          assinatura verificável
  o rabisco continua lá      ⚠ não confere
  nada acusa nada            e o leitor diz desde quando`,
    'A imagem colada nunca acusa nada, e é isso que faz dela a pior das duas: um documento adulterado com assinatura colada continua parecendo assinado.',
    ['assinatura colada', 'verificável', 'adulteração'],
  ),
  t(
    'senha-nao-e-seguranca',
    'Senha não é documento seguro',
    'O que ela faz é pedir a senha para abrir, e é só isso que ela faz.',
    [
      'Um PDF pode ter senha de abertura: sem ela, o leitor não mostra o conteúdo. Isso funciona e tem uso — mandar a ficha médica por e-mail e passar a senha por outro caminho é razoável.',
      'Mas quem sabe a senha abre o documento, e a partir daí faz o que quiser com ele: copiar, imprimir, salvar uma cópia sem senha. A senha protege o arquivo até a primeira pessoa certa abri-lo, e não depois.',
      'Existem também as caixas de "não permitir copiar" e "não permitir imprimir". Elas não são travas: são **pedidos** gravados dentro do arquivo. O leitor obedece porque foi escrito para obedecer, e outro leitor simplesmente não obedece.',
      'Então "documento protegido por senha" e "documento seguro" são coisas diferentes. O que a senha dá é controle de quem abre da primeira vez.',
    ],
    `O que cada coisa garante

senha de abertura        quem não tem a senha não abre
                         quem tem, faz o que quiser

não permitir copiar      um pedido; outro leitor ignora
não permitir imprimir    um pedido; outro leitor ignora

assinatura verificável   mexeu, aparece`,
    'O programa que ignora o pedido de "não copiar" não é de invasor: é qualquer outro leitor de PDF. A restrição depende da boa vontade de quem abre.',
    ['senha', 'restrições', 'segurança'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 7 — O dossiê (requisito 8)
   ──────────────────────────────────────────────────────────────────────── */

const O_DOSSIE: TopicoDeVereda[] = [
  t(
    'o-que-e-dossie',
    'O que é um dossiê',
    'O que fica arquivado da atividade, para quem abrir daqui a dois anos.',
    [
      'Dossiê é o conjunto de documentos que registra uma coisa que aconteceu. Do acampamento, o dossiê é a ata que o aprovou, o orçamento, a lista de presença, a circular que foi às famílias e o recibo da chácara.',
      'Ele não é para agora: é para quem abrir depois. A próxima diretoria que for organizar o acampamento do ano que vem vai procurar exatamente isso, e o que ela achar é o que vai ter.',
      'Por isso todos os documentos precisam ser pesquisáveis. Um que seja foto sem texto dentro é o que ninguém acha quando precisa — e, como os cinco abrem iguais, ninguém sabe qual é antes de precisar.',
      'E por isso eles precisam de nome. Cinco arquivos chamados "documento (1)" até "documento (5)" são cinco arquivos que alguém vai abrir um a um.',
    ],
    `O dossiê do acampamento

  ata-2026-03-14-v01.pdf        a reunião que aprovou
  orcamento-2026-07-01-v02.pdf  quanto custou
  presenca-2026-07-19-v01.pdf   quem foi
  circular-2026-06-02-v01.pdf   o que foi dito às famílias
  recibo-2026-07-02-v01.pdf     o comprovante da chácara`,
    'Cinco é o mínimo que o requisito pede, e não uma meta: um acampamento de três dias produz bem mais do que cinco documentos. O que se escolhe é o que responde às perguntas que alguém vai fazer.',
    ['dossiê', 'arquivo', 'registro'],
  ),
  t(
    'nomear',
    'Nomear no mesmo padrão',
    'O padrão é seu; o que não pode é não haver um.',
    [
      'Um padrão de nome é uma forma repetida: assunto, data e versão, sempre na mesma ordem e com o mesmo separador. Qual forma é escolha de quem organiza — a vereda de arquivos já pediu que você escolhesse a sua.',
      'A data se escreve do maior para o menor: ano, mês, dia. É o que faz a ordem alfabética da pasta virar ordem de tempo, e é a única razão de a data não ser escrita como se fala.',
      'A versão diz qual é a mais recente sem ninguém abrir nada. Sem ela, "orçamento final" e "orçamento final 2" convivem na mesma pasta e ninguém sabe qual vale.',
      'As duas coisas são necessárias e não se substituem. Cinco arquivos no mesmo formato e sem data não ordenam a pasta; cinco datados e cada um num formato também não.',
    ],
    `A mesma pasta, dois jeitos

sem padrão                      com padrão
  Ata reunião.pdf                 ata-2026-03-14-v01.pdf
  orcamento final.pdf             circular-2026-06-02-v01.pdf
  IMG_20260702_143512.pdf         orcamento-2026-07-01-v02.pdf
  circular 03.pdf                 presenca-2026-07-19-v01.pdf
  doc scan 2.pdf                  recibo-2026-07-02-v01.pdf
                                  ↑ a pasta se ordenou sozinha`,
    'O nome que a câmera dá — IMG_20260702_143512 — tem data dentro e ainda assim não serve: ele não diz o que é o documento, que é a primeira coisa que alguém procura.',
    ['padrão de nome', 'data', 'versão'],
  ),
  t(
    'conferir-antes',
    'Conferir antes de entregar',
    'O dossiê é o último momento em que os defeitos ainda são seus.',
    [
      'Antes de entregar, abre-se um por um. O que tiver o aviso amarelo no alto é o que não tem texto dentro, e ele precisa ser reconhecido.',
      'Depois de reconhecer, procura-se uma palavra em cada um. É a mesma prova do requisito 5, e é rápida: cinco buscas.',
      'Vale conferir também o que não é conteúdo — se algum documento está assinado e o selo diz que confere, se nenhum está protegido por uma senha que ninguém mais tem.',
      'Um dossiê entregue com um documento ilegível não volta para conserto: ele fica arquivado do jeito que chegou, e quem descobrir o problema vai ser alguém que precisava daquele documento.',
    ],
    `A conferência, documento a documento

  ata          ✓ pesquisável   "reunião" → 1 página
  orçamento    ✓ pesquisável   "Total"   → 1 página
  presença     ⚠ em imagem     → reconhecer, e procurar de novo
  circular     ✓ pesquisável   "julho"   → 1 página
  recibo       ✓ pesquisável   "Chácara" → 1 página`,
    'Reconhecer o texto de um documento que já tem texto é pior do que não fazer nada: o programa relê a página e troca texto exato por texto adivinhado, num arquivo que continua se dizendo pesquisável.',
    ['conferência', 'entrega', 'dossiê'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Os módulos
   ──────────────────────────────────────────────────────────────────────── */

export const MODULOS_DE_DOCUMENTOS_PORTATEIS: ModuloDeVereda[] = [
  {
    id: 'm1',
    titulo: 'O que é um PDF',
    resumo: 'Por que ele chega igual, por que ele não serve para escrever junto, e como se gera um.',
    licoes: [
      {
        id: 'm1-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PDF['m1-teoria'],
        perguntas: 4,
        titulo: 'Portátil quer dizer chegar igual',
        resumo: 'O formato que leva as fontes dentro, e o momento certo de trocar o editor por ele.',
        topicos: O_QUE_E_UM_PDF,
      },
      {
        /*
          Os requisitos 4.1 e 3. O caminho é Imprimir › Salvar como PDF, e não
          três janelas de Office: é o caminho universal, é o que se usa no
          clube, e reconstruir os três programas aqui seria reconstruir o que a
          AP043 e a AP044 já ensinam.
        */
        id: 'm1-lab', tipo: 'pdf', pasta: 'gerar',
        titulo: 'Gerando os PDFs da reunião',
        resumo: 'A ata, o orçamento e a apresentação — e o PDF ficando para trás quando a ata muda.',
        verificacoes: ['pdf-do-texto', 'pdf-da-planilha', 'pdf-da-apresentacao', 'o-pdf-congela'],
      },
    ],
  },
  {
    id: 'm2',
    titulo: 'Juntar e partir',
    resumo: 'Três anexos virando um, uma página saindo para fora, e um documento repartido em dois.',
    licoes: [
      {
        id: 'm2-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PDF['m2-teoria'],
        perguntas: 4,
        titulo: 'Combinar, extrair, dividir',
        resumo: 'O que cada uma faz com o original, e por que a ordem se escolhe na hora.',
        topicos: JUNTAR_E_PARTIR,
      },
      {
        id: 'm2-lab', tipo: 'pdf', pasta: 'juntar',
        titulo: 'Um documento só para a reunião',
        resumo: 'Reunir os três, tirar a página do orçamento para fora, e partir o combinado em dois.',
        verificacoes: ['juntou', 'extraiu', 'dividiu'],
      },
    ],
  },
  {
    id: 'm3',
    titulo: 'O peso e o que se perde',
    resumo: 'Dois PDFs que abrem iguais, e a ordem entre duas operações que custa o arquivo inteiro.',
    licoes: [
      {
        id: 'm3-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PDF['m3-teoria'],
        perguntas: 4,
        titulo: 'Pesquisável, em imagem, e o que a compressão leva',
        resumo: 'A camada de texto que não se vê, o que encolhe e o que não encolhe, e por que a ordem importa.',
        topicos: PESO_E_PERDA,
      },
      {
        /*
          Os requisitos 2.5 e 4.4. A tarefa da procura existe separada da de
          reduzir porque os dois caminhos encolhem o arquivo igual: sem ela,
          reduzir antes de reconhecer fecharia a lição.
        */
        id: 'm3-lab', tipo: 'pdf', pasta: 'reduzir',
        titulo: 'As fichas médicas, leves e legíveis',
        resumo: 'Reconhecer o texto, reduzir o tamanho, e provar que a busca continua achando.',
        verificacoes: ['reconheceu-antes', 'reduziu', 'ainda-acha'],
      },
    ],
  },
  {
    id: 'm4',
    titulo: 'Digitalizar papel',
    resumo: 'Enquadrar, endireitar, firmar o contraste — e comprovar procurando uma palavra.',
    licoes: [
      {
        id: 'm4-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PDF['m4-teoria'],
        perguntas: 4,
        titulo: 'Da foto ao texto',
        resumo: 'O que o aplicativo conserta, como o reconhecimento erra, e por que a prova é procurar.',
        topicos: DIGITALIZAR,
      },
      {
        id: 'm4-lab', tipo: 'pdf', pasta: 'digitalizar',
        titulo: 'Digitalizando o recibo da chácara',
        resumo: 'A foto chega torta e sem contraste — e arrumar metade não basta.',
        verificacoes: ['enquadrou', 'endireitou', 'contraste', 'comprovou'],
      },
    ],
  },
  {
    id: 'm5',
    titulo: 'Preencher e comentar',
    resumo: 'O formulário que se preenche na tela, e a conversa que acontece na margem.',
    licoes: [
      {
        id: 'm5-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PDF['m5-teoria'],
        perguntas: 4,
        titulo: 'Campos e balões',
        resumo: 'Por que não se imprime para preencher, e a diferença entre marcar e comentar.',
        topicos: FORMULARIO_E_COMENTARIO,
      },
      {
        /*
          Os requisitos 4.5 e 4.6. A meta de responder exige um comentário
          **seu**: a circular já chega com um balão da liderança dentro, e
          contá-lo deixaria a tarefa verde antes de alguém dizer coisa nenhuma.
        */
        id: 'm5-lab', tipo: 'pdf', pasta: 'formulario',
        titulo: 'A autorização e a circular',
        resumo: 'Preencher os campos, responder ao comentário da liderança, e marcar a data.',
        verificacoes: ['preencheu', 'respondeu', 'destacou'],
      },
    ],
  },
  {
    id: 'm6',
    titulo: 'O que parece garantia',
    resumo: 'Duas assinaturas que desenham o mesmo rabisco, e uma senha que não é o que parece.',
    licoes: [
      {
        id: 'm6-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PDF['m6-teoria'],
        perguntas: 4,
        titulo: 'Assinatura, senha e o que cada uma prova',
        resumo: 'A impressão do documento, a figura colada, e o pedido que qualquer leitor ignora.',
        topicos: O_QUE_PARECE_GARANTIA,
      },
      {
        /*
          Os requisitos 6 e 7. Duas das quatro metas são **descobertas**: ver o
          selo virar "não confere" e copiar o texto apesar de "não permitir
          copiar" não deixam marca em arquivo nenhum — o que muda é o que a
          pessoa sabe. E "assinou" pede assinatura válida, então quem quebrou a
          assinatura para ver assina de novo, que é o que se faz na vida.
        */
        id: 'm6-lab', tipo: 'pdf', pasta: 'assinar',
        titulo: 'Assinando a autorização',
        resumo: 'Assinar, ver a assinatura deixar de conferir, pôr senha, e copiar o texto mesmo assim.',
        verificacoes: ['assinou', 'viu-quebrar', 'protegeu', 'senha-nao-protege'],
      },
    ],
  },
  {
    id: 'm7',
    titulo: 'O dossiê da atividade',
    resumo: 'Cinco documentos pesquisáveis, nomeados no padrão que você escolheu.',
    licoes: [
      {
        id: 'm7-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PDF['m7-teoria'],
        perguntas: 4,
        titulo: 'O que fica arquivado',
        resumo: 'Para quem o dossiê é feito, como nomear, e o que conferir antes de entregar.',
        topicos: O_DOSSIE,
      },
      {
        /*
          O requisito 8. A pasta abre com **quatro** documentos: o quinto é o
          recibo que a pessoa digitalizou no módulo 4, e reunir é metade do que
          o requisito manda fazer — com os cinco já lá, a primeira tarefa
          nasceria verde.
        */
        id: 'm7-lab', tipo: 'pdf', pasta: 'dossie',
        titulo: 'Montando o dossiê do acampamento',
        resumo: 'Trazer o quinto documento, reconhecer o que é foto, e nomear os cinco no mesmo padrão.',
        verificacoes: ['cinco', 'todos-pesquisaveis', 'nomeados'],
      },
    ],
  },
];
