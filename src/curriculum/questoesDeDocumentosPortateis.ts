import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC-ES004 Documentos Portáteis.
 *
 * ── O que elas medem ──────────────────────────────────────────────────────
 * A definição vale uma vez. Depois dela vêm consequência, discriminação e
 * diagnóstico — e nesta vereda a discriminação carrega quase tudo, porque a
 * matéria inteira é feita de pares que se parecem na tela e não se parecem em
 * nada no que garantem: pesquisável e em imagem, colada e verificável,
 * protegido por senha e seguro, extrair e dividir.
 *
 * ── O diagnóstico aqui tem um formato só ──────────────────────────────────
 * O documento abre, a página aparece, o selo está lá, o arquivo encolheu. Nada
 * estoura. Toda pergunta de diagnóstico daqui descreve um documento que
 * **parece pronto**, porque é assim que o defeito de PDF chega — e é por isso
 * que o requisito 5 pede prova em vez de olhada.
 *
 * Toda alternativa errada diz por que está errada, no campo porque, e a certa
 * não carrega motivo nenhum. E nada de crase nem de asterisco: a questão vai
 * para o QuestionRenderer, que imprime texto puro, e a marcação sairia na tela
 * como marcação.
 */

export const QUESTOES_DE_PDF: Record<string, Question[]> = {
  /* ──────────────────────────────────────────────────────────────────────
     Módulo 1 — O que é um PDF
     ────────────────────────────────────────────────────────────────────── */
  'm1-teoria': [
    {
      id: 'ES4-M1-Q1', type: 'multiple_choice',
      prompt: 'O que o PDF leva dentro dele que um .docx não leva?',
      data: { options: [
        { id: 'a', text: 'As fontes e a posição de cada letra na página.', correct: true },
        { id: 'b', text: 'O programa capaz de abri-lo.', porque: 'Nenhum arquivo carrega o programa que o abre. O PDF precisa de um leitor, e é por isso que os leitores são gratuitos e existem em todo aparelho.' },
        { id: 'c', text: 'Uma cópia do documento original editável.', porque: 'Não há cópia do original dentro dele. Por isso é que editar um PDF é trabalhoso: não existe texto de onde voltar.' },
        { id: 'd', text: 'A data em que o documento foi impresso pela última vez.', porque: 'Essa informação não existe no arquivo, e nem teria como: o arquivo não sabe o que aconteceu com ele depois de salvo.' },
      ]},
      explanation: 'É por levar as fontes que ele chega igual. O .docx pede as fontes ao computador que o abrir, e quando falta uma o texto se reorganiza.',
    },
    {
      id: 'ES4-M1-Q2', type: 'scenario',
      prompt: 'A ata foi escrita num computador com a fonte Garamond e mandada em .docx para o computador do clube, que não tem essa fonte. O que se vê lá?',
      data: { scenarios: [
        { id: 'a', text: 'O texto aparece com outra fonte, e as quebras de linha e de página mudam de lugar.', correct: true },
        { id: 'b', text: 'O documento não abre, e o programa pede a fonte que falta.', porque: 'Ele abre. Faltar fonte nunca impede a abertura — o programa troca por outra e segue, sem avisar.' },
        { id: 'c', text: 'O texto aparece em branco onde a fonte falta.', porque: 'Nada fica em branco: o texto continua legível, escrito com outra fonte. É justamente por continuar legível que ninguém percebe.' },
        { id: 'd', text: 'A fonte vem junto no arquivo .docx, então nada muda.', porque: 'O .docx pode embutir fontes, mas não faz isso por padrão — e o que se manda por e-mail quase nunca está com essa opção ligada.' },
      ]},
      explanation: 'Uma fonte mais larga empurra o texto, e um parágrafo que cabia acaba numa folha nova. O PDF existe para isso não acontecer.',
    },
    {
      id: 'ES4-M1-Q3', type: 'multiple_choice',
      prompt: 'Por que o PDF é ruim para um grupo escrever um documento junto?',
      data: { options: [
        { id: 'a', text: 'Porque ele guarda onde cada letra fica, então acrescentar texto não empurra o que vem depois.', correct: true },
        { id: 'b', text: 'Porque PDF é somente leitura e não existe como editar um.', porque: 'Existem editores de PDF, e eles funcionam. O que não funciona bem é o texto se reorganizar quando alguém escreve no meio.' },
        { id: 'c', text: 'Porque PDF não aceita mais de um autor no mesmo arquivo.', porque: 'Um arquivo não tem lista de autores que impeça nada. Qualquer pessoa com o arquivo pode mexer nele.' },
        { id: 'd', text: 'Porque o PDF perde a formatação a cada vez que é salvo.', porque: 'Ele não perde: guardar a formatação intacta é exatamente o que ele faz melhor.' },
      ]},
      explanation: 'A elasticidade que falta ao PDF é a mesma coisa que faz ele chegar igual. Não há um formato bom para as duas coisas.',
    },
    {
      id: 'ES4-M1-Q4', type: 'multiple_choice',
      prompt: 'Qual é o caminho que gera PDF praticamente em qualquer programa?',
      data: { options: [
        { id: 'a', text: 'Imprimir, e escolher "Salvar como PDF" na lista de impressoras.', correct: true },
        { id: 'b', text: 'Salvar o arquivo e trocar a extensão dele para .pdf.', porque: 'Trocar a extensão não converte nada: o conteúdo continua sendo o de antes, e o leitor de PDF responde que o arquivo está danificado.' },
        { id: 'c', text: 'Copiar o texto e colar num leitor de PDF.', porque: 'Leitor de PDF lê; ele não recebe texto colado para montar documento novo.' },
        { id: 'd', text: 'Compactar o documento em .zip e renomear o pacote.', porque: 'Compactar produz um pacote, que é outra coisa — e renomear um pacote continua não convertendo nada.' },
      ]},
      explanation: '"Salvar como PDF" não é impressora: é o sistema escrevendo o arquivo. Funciona no editor, na planilha, na apresentação e no navegador.',
    },
    {
      id: 'ES4-M1-Q5', type: 'true_false',
      prompt: 'Depois de gerar o PDF da ata, corrigir uma frase no .docx muda também o PDF que já foi gerado.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Não há vínculo entre os dois: o PDF guarda um retrato do documento no instante em que foi gerado, e retrato não acompanha o original.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O PDF continua mostrando o texto de antes, e nada avisa. Quem corrige o documento precisa exportar de novo.',
    },
    {
      id: 'ES4-M1-Q6', type: 'scenario',
      prompt: 'A tesouraria mandou o orçamento em PDF. Alguém achou um erro num valor e corrigiu direto no PDF, com um editor. O que fica errado nessa história?',
      data: { scenarios: [
        { id: 'a', text: 'A planilha original continua com o valor errado, e é ela que alguém vai abrir no ano que vem.', correct: true },
        { id: 'b', text: 'O PDF não aceita a correção e o valor volta ao que era.', porque: 'Ele aceita. O editor de PDF muda o que está desenhado na página sem reclamar.' },
        { id: 'c', text: 'A correção feita no PDF apaga a assinatura, mesmo que não houvesse nenhuma.', porque: 'Só se houvesse assinatura verificável, e o documento não tinha. Sem ela, mexer não deixa marca.' },
        { id: 'd', text: 'Nada fica errado: corrigir no PDF é mais rápido e o resultado é o mesmo.', porque: 'O resultado não é o mesmo. Passam a existir dois documentos discordando, e o editável — que é o que sobrevive — é o errado.' },
      ]},
      explanation: 'Corrige-se no editável e exporta-se de novo. O contrário deixa a versão certa no arquivo que ninguém vai abrir.',
    },
    {
      id: 'ES4-M1-Q7', type: 'multiple_choice',
      prompt: 'Uma planilha larga foi salva como PDF e chegou cortada ao meio. Onde isso poderia ter sido visto antes de enviar?',
      data: { options: [
        { id: 'a', text: 'Na prévia da caixa de impressão, antes de confirmar.', correct: true },
        { id: 'b', text: 'No tamanho do arquivo, que fica menor quando há corte.', porque: 'O tamanho não denuncia corte nenhum: um PDF cortado e um inteiro pesam praticamente o mesmo.' },
        { id: 'c', text: 'Num aviso do programa dizendo que as colunas não couberam.', porque: 'Ele não avisa. A planilha simplesmente quebra no ponto em que a folha acaba.' },
        { id: 'd', text: 'Na lista de arquivos, pelo ícone diferente que o PDF cortado recebe.', porque: 'O ícone é o mesmo para todo PDF. A lista de arquivos não sabe nada sobre o conteúdo deles.' },
      ]},
      explanation: 'A prévia é a única chance de ver o que vai sair. Depois do envio, o corte é descoberto por quem recebeu.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 2 — Juntar, extrair e dividir
     ────────────────────────────────────────────────────────────────────── */
  'm2-teoria': [
    {
      id: 'ES4-M2-Q1', type: 'multiple_choice',
      prompt: 'O que acontece com os arquivos originais depois de combinar três PDFs num só?',
      data: { options: [
        { id: 'a', text: 'Continuam na pasta, do jeito que estavam.', correct: true },
        { id: 'b', text: 'São apagados, porque o conteúdo deles passou para o arquivo novo.', porque: 'Combinar copia o conteúdo; nada é retirado da pasta. Quem quiser apagar apaga depois, à mão.' },
        { id: 'c', text: 'Viram atalhos apontando para o arquivo combinado.', porque: 'Não existe esse vínculo. O arquivo combinado é independente dos três desde o instante em que foi salvo.' },
        { id: 'd', text: 'Ficam bloqueados enquanto o combinado existir.', porque: 'Nenhum deles fica bloqueado: os quatro arquivos são arquivos comuns e podem ser abertos, movidos ou apagados.' },
      ]},
      explanation: 'Combinar copia, não consome. É por isso que dá para combinar de novo em outra ordem sem perder nada.',
    },
    {
      id: 'ES4-M2-Q2', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre extrair e dividir?',
      data: { options: [
        { id: 'a', text: 'Extrair copia páginas para um arquivo novo e deixa o inteiro de pé; dividir reparte o documento em dois.', correct: true },
        { id: 'b', text: 'Extrair funciona em uma página e dividir funciona em várias.', porque: 'As duas funcionam com qualquer número de páginas. O que muda é o que sobra do documento original.' },
        { id: 'c', text: 'Extrair tira o texto do PDF e dividir tira as imagens.', porque: 'Nenhuma das duas separa texto de imagem: as duas trabalham com páginas inteiras.' },
        { id: 'd', text: 'Dividir precisa que o documento esteja pesquisável e extrair não.', porque: 'Nenhuma das duas olha para a camada de texto. Elas movem páginas, e página sem texto se move igual.' },
      ]},
      explanation: 'A diferença aparece no dia em que alguém precisa do documento completo: depois de extrair, ele existe.',
    },
    {
      id: 'ES4-M2-Q3', type: 'scenario',
      prompt: 'A reunião gerou três documentos, e eles foram mandados como três anexos num e-mail. O que costuma acontecer?',
      data: { scenarios: [
        { id: 'a', text: 'Quem recebe abre o primeiro, resolve o assunto e não volta aos outros dois.', correct: true },
        { id: 'b', text: 'O servidor de e-mail junta os três num só ao entregar.', porque: 'Nenhum servidor faz isso. Os anexos chegam como foram mandados.' },
        { id: 'c', text: 'Só o primeiro anexo é entregue, e os outros ficam retidos.', porque: 'Os três são entregues. O problema não é técnico, é de quem lê.' },
        { id: 'd', text: 'Os três abrem juntos numa mesma janela do leitor.', porque: 'Cada anexo abre por conta, quando alguém clica nele — e é aí que os dois últimos ficam para trás.' },
      ]},
      explanation: 'Documento que vai junto chega junto. É a razão de combinar, e ela não é sobre espaço.',
    },
    {
      id: 'ES4-M2-Q4', type: 'true_false',
      prompt: 'Combinar o mesmo documento com ele mesmo três vezes produz um arquivo com três documentos reunidos.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Produz um arquivo de três páginas com a mesma página repetida. O número fecha e não há nada reunido.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Contar páginas não responde se alguma coisa foi reunida. O que responde é de quantos documentos diferentes elas vieram.',
    },
    {
      id: 'ES4-M2-Q5', type: 'multiple_choice',
      prompt: 'A secretaria pediu só a página do orçamento, que é a segunda de um documento de três. Qual operação serve?',
      data: { options: [
        { id: 'a', text: 'Extrair a página 2 para um arquivo novo.', correct: true },
        { id: 'b', text: 'Dividir o documento a partir da página 2.', porque: 'Dividir deixaria a página 3 junto da 2 no segundo arquivo, e ainda repartiria o documento que você quer manter inteiro.' },
        { id: 'c', text: 'Apagar as páginas 1 e 3 e salvar.', porque: 'Isso destrói o documento inteiro para produzir uma página. Extrair faz o mesmo resultado sem perder o original.' },
        { id: 'd', text: 'Combinar o documento com ele mesmo e mandar o resultado.', porque: 'Combinar acrescenta páginas; não tira nenhuma. A secretaria receberia seis em vez de uma.' },
      ]},
      explanation: 'Extrair é a operação que copia para fora. Quem não precisa do resto não tem por que receber o resto.',
    },
    {
      id: 'ES4-M2-Q6', type: 'scenario',
      prompt: 'Depois de dividir um documento de seis páginas, os dois arquivos têm cinco páginas somadas. Como isso é percebido?',
      data: { scenarios: [
        { id: 'a', text: 'Só conferindo a conta, porque os dois arquivos abrem normalmente e nada avisa.', correct: true },
        { id: 'b', text: 'O leitor mostra um aviso de página faltando ao abrir.', porque: 'Ele não tem como saber que faltou: para o leitor, cada arquivo é um documento completo do tamanho que tem.' },
        { id: 'c', text: 'Um dos dois arquivos fica corrompido e não abre.', porque: 'Nenhum corrompe. Os dois são PDFs válidos, só que um deles perdeu uma página no caminho.' },
        { id: 'd', text: 'A numeração das páginas fica com um salto visível.', porque: 'A numeração que o leitor mostra é sempre contínua, de 1 até o total. Se o documento tinha número impresso na folha, aí sim aparece — mas quase nenhum tem.' },
      ]},
      explanation: 'A soma das páginas dos dois pedaços tem de dar o total do original. É uma conferência de cinco segundos e ninguém faz.',
    },
    {
      id: 'ES4-M2-Q7', type: 'multiple_choice',
      prompt: 'Onde se escolhem as páginas de que uma operação vai tratar?',
      data: { options: [
        { id: 'a', text: 'No painel de miniaturas, marcando as páginas antes de acionar o comando.', correct: true },
        { id: 'b', text: 'O programa escolhe sozinho a página que está sendo mostrada.', porque: 'Ele não escolhe por conta. Comando acionado sem nada marcado avisa em vez de agir, que é o certo: agir na página à vista trataria da página errada com frequência.' },
        { id: 'c', text: 'Escrevendo os números das páginas no nome do arquivo.', porque: 'O nome do arquivo não diz nada ao programa. Ele é para as pessoas lerem.' },
        { id: 'd', text: 'Não se escolhe: a operação trata sempre do documento inteiro.', porque: 'Extrair e dividir existem justamente para tratar de parte dele.' },
      ]},
      explanation: 'O comando age sobre o que foi escolhido, e não sobre o que ele adivinha. É a mesma regra de qualquer programa.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 3 — O peso, e o que se perde
     ────────────────────────────────────────────────────────────────────── */
  'm3-teoria': [
    {
      id: 'ES4-M3-Q1', type: 'multiple_choice',
      prompt: 'O que é um documento em imagem?',
      data: { options: [
        { id: 'a', text: 'Um PDF cujas páginas são fotografias, sem letras gravadas dentro.', correct: true },
        { id: 'b', text: 'Um PDF que tem alguma figura no meio do texto.', porque: 'Figura no meio do texto é normal e não muda nada: o texto em volta dela continua sendo texto.' },
        { id: 'c', text: 'Um PDF salvo com qualidade reduzida.', porque: 'Reduzir a qualidade não apaga a camada de texto. Um documento digitado e comprimido continua pesquisável.' },
        { id: 'd', text: 'Um PDF que só abre em programas de edição de imagem.', porque: 'Ele abre em qualquer leitor de PDF, exatamente como os outros. É por isso que a diferença não aparece.' },
      ]},
      explanation: 'O computador vê manchas escuras sobre fundo claro, e não sabe que aquilo diz alguma coisa.',
    },
    {
      id: 'ES4-M3-Q2', type: 'scenario',
      prompt: 'Dois PDFs estão abertos lado a lado e mostram exatamente a mesma folha escrita. Como descobrir qual deles é pesquisável?',
      data: { scenarios: [
        { id: 'a', text: 'Procurando uma palavra que está à vista na página: num o contador acha, no outro diz nenhum resultado.', correct: true },
        { id: 'b', text: 'Comparando a nitidez da letra na tela.', porque: 'Uma digitalização boa fica tão nítida quanto um documento gerado. A nitidez não separa os dois.' },
        { id: 'c', text: 'Olhando qual dos dois tem mais páginas.', porque: 'O número de páginas não tem relação nenhuma com haver texto dentro.' },
        { id: 'd', text: 'Vendo qual abre mais rápido.', porque: 'O documento em imagem costuma abrir até mais devagar, por ser mais pesado — mas isso varia com o computador e não responde a pergunta.' },
      ]},
      explanation: 'Na tela, os dois são idênticos. A diferença mora na camada de texto, e quem a enxerga é a busca.',
    },
    {
      id: 'ES4-M3-Q3', type: 'multiple_choice',
      prompt: 'O que a compressão de um PDF joga fora?',
      data: { options: [
        { id: 'a', text: 'Nitidez das imagens que estão dentro dele.', correct: true },
        { id: 'b', text: 'Páginas que o programa julga repetidas.', porque: 'Nenhuma página é removida. Comprimir não mexe na quantidade de páginas.' },
        { id: 'c', text: 'A camada de texto, que é a parte mais pesada.', porque: 'A camada de texto é a parte mais leve, e ela não é tocada: cinco páginas de letras pesam menos que uma foto.' },
        { id: 'd', text: 'As fontes embutidas, que passam a ser pedidas ao computador.', porque: 'As fontes continuam dentro. Tirá-las desfaria justamente o que faz o PDF ser PDF.' },
      ]},
      explanation: 'Por isso comprimir documento digitado quase não muda nada, e comprimir documento digitalizado muda muito.',
    },
    {
      id: 'ES4-M3-Q4', type: 'scenario',
      prompt: 'Cinco páginas fotografadas foram comprimidas antes de passar pelo reconhecimento de texto. O arquivo ficou com 2 MB e diz-se pesquisável. O que a pessoa tem em mãos?',
      data: { scenarios: [
        { id: 'a', text: 'Um arquivo com texto dentro, só que o texto está errado — e a busca não acha as palavras.', correct: true },
        { id: 'b', text: 'Um arquivo idêntico ao que sairia da ordem contrária.', porque: 'O tamanho é o mesmo, e é por isso que engana. O que está gravado como texto não é o mesmo.' },
        { id: 'c', text: 'Um arquivo que o leitor recusa, por ter sido comprimido cedo demais.', porque: 'Nenhum leitor recusa. As duas ordens produzem PDFs perfeitamente válidos.' },
        { id: 'd', text: 'Um arquivo ainda em imagem, porque comprimir apaga o reconhecimento.', porque: 'O reconhecimento aconteceu, e o texto foi gravado. O problema é que ele foi lido de uma imagem já estragada.' },
      ]},
      explanation: 'Os dois caminhos encolhem igual e só um serve. Do lado errado, o arquivo passa a se dizer pesquisável com texto errado dentro.',
    },
    {
      id: 'ES4-M3-Q5', type: 'true_false',
      prompt: 'Comprimir um documento de cinco páginas digitadas no editor reduz bastante o tamanho dele.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Não há o que reduzir: o arquivo é quase todo texto, e texto já é leve. Ele sai praticamente do mesmo tamanho.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Quem encolhe muito é o documento digitalizado, porque ele é feito de fotografias. Essa diferença é a razão de comprimir existir.',
    },
    {
      id: 'ES4-M3-Q6', type: 'multiple_choice',
      prompt: 'Qual é a ordem certa ao preparar um documento digitalizado para arquivo?',
      data: { options: [
        { id: 'a', text: 'Reconhecer o texto primeiro, e reduzir o tamanho depois.', correct: true },
        { id: 'b', text: 'Reduzir primeiro, para o reconhecimento ter menos a processar.', porque: 'Reduzir tira nitidez, e o reconhecimento fica com menos do que ler. O resultado é texto errado num arquivo do mesmo tamanho.' },
        { id: 'c', text: 'Tanto faz, porque o resultado final é igual nos dois caminhos.', porque: 'O tamanho final é igual, e só ele. O texto gravado é diferente, e é o texto que faz o arquivo servir.' },
        { id: 'd', text: 'Reconhecer, reduzir, e reconhecer de novo para corrigir.', porque: 'Reconhecer de novo relê a imagem já estragada e troca o texto bom pelo ruim. A segunda passada piora.' },
      ]},
      explanation: 'O texto é leve e não encolhe: gravado antes, ele atravessa a compressão intacto.',
    },
    {
      id: 'ES4-M3-Q7', type: 'multiple_choice',
      prompt: 'Até quanto costuma valer a pena comprimir um documento que vai por e-mail?',
      data: { options: [
        { id: 'a', text: 'Até caber no limite da caixa de e-mail, e não mais do que isso.', correct: true },
        { id: 'b', text: 'Sempre no nível mais forte, porque arquivo menor é sempre melhor.', porque: 'Abaixo do necessário só se perde qualidade sem ganhar nada — e a nitidez perdida não volta.' },
        { id: 'c', text: 'Até o arquivo ficar do mesmo tamanho de um documento digitado.', porque: 'Isso é inalcançável para um documento fotografado, e persegui-lo destrói a legibilidade da página.' },
        { id: 'd', text: 'Não se comprime documento que vai por e-mail: o servidor faz isso sozinho.', porque: 'Nenhum servidor comprime anexo. Ele aceita ou recusa pelo tamanho que chegou.' },
      ]},
      explanation: 'A perda de nitidez não volta, e o papel original às vezes já não existe. Comprimir é uma conta, e não um botão a apertar até o fim.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 4 — Digitalizar e reconhecer
     ────────────────────────────────────────────────────────────────────── */
  'm4-teoria': [
    {
      id: 'ES4-M4-Q1', type: 'multiple_choice',
      prompt: 'O que significa reconhecimento óptico de caracteres?',
      data: { options: [
        { id: 'a', text: 'O programa lê a imagem e escreve, por baixo dela, o texto que ele acha que está ali.', correct: true },
        { id: 'b', text: 'O programa transforma a foto num documento de texto editável, sem imagem.', porque: 'A imagem continua sendo o que se vê. O texto entra numa camada invisível por baixo dela.' },
        { id: 'c', text: 'O programa confere se a letra da pessoa é legível antes de salvar.', porque: 'Ele não julga a letra: ele tenta ler, e quando não consegue ler direito, grava errado sem avisar.' },
        { id: 'd', text: 'O programa aumenta a resolução da imagem até as letras ficarem nítidas.', porque: 'Nada aumenta a resolução do que foi fotografado. Detalhe que não foi capturado não existe no arquivo.' },
      ]},
      explanation: 'É adivinhação, e adivinhação erra. O que engana é o jeito de errar: palavras parecidas, e não garranchos.',
    },
    {
      id: 'ES4-M4-Q2', type: 'scenario',
      prompt: 'Uma página foi digitalizada torta e escura. O reconhecimento gravou "Acarnpamento" no lugar de "Acampamento". Por que isso é pior do que não ter gravado nada?',
      data: { scenarios: [
        { id: 'a', text: 'Porque o arquivo passa a se dizer pesquisável, e ninguém tem como perceber que o texto está errado.', correct: true },
        { id: 'b', text: 'Porque o texto errado aparece desenhado por cima da página.', porque: 'Ele não aparece: a camada de texto é invisível. O que se vê continua sendo a foto do papel.' },
        { id: 'c', text: 'Porque o arquivo fica maior do que ficaria sem texto nenhum.', porque: 'O texto é leve e o aumento é desprezível. O problema não é de tamanho.' },
        { id: 'd', text: 'Porque o leitor recusa abrir documentos com texto reconhecido de baixa qualidade.', porque: 'Ele abre normalmente. Nenhum leitor avalia a qualidade do que o reconhecimento gravou.' },
      ]},
      explanation: 'Texto que falta se percebe; texto quase certo não. E os dois falham na busca exatamente igual.',
    },
    {
      id: 'ES4-M4-Q3', type: 'multiple_choice',
      prompt: 'Por que os cantos do recorte precisam ser ajustáveis num aplicativo de digitalizar?',
      data: { options: [
        { id: 'a', text: 'Porque a detecção da borda erra com frequência, e pega a beirada da mesa em vez da folha.', correct: true },
        { id: 'b', text: 'Porque o papel muda de tamanho conforme a distância da câmera.', porque: 'A distância muda o tamanho na foto, e a detecção lida com isso. O que ela erra é onde a folha acaba.' },
        { id: 'c', text: 'Porque cada tamanho de papel exige uma proporção diferente de recorte.', porque: 'O aplicativo não precisa saber o tamanho do papel: ele recorta pelo que vê, seja A4 ou meia folha.' },
        { id: 'd', text: 'Porque sem ajuste manual o aplicativo não salva o arquivo.', porque: 'Ele salva com o recorte que detectou, errado e tudo. É justamente por salvar assim que o ajuste importa.' },
      ]},
      explanation: 'Mesa de madeira com pouca luz é onde ela mais erra, e é onde quase todo mundo digitaliza.',
    },
    {
      id: 'ES4-M4-Q4', type: 'multiple_choice',
      prompt: 'Para fotografar papel escrito, qual filtro serve melhor?',
      data: { options: [
        { id: 'a', text: 'Preto e branco, porque joga fora tudo o que não é quase-preto e deixa a letra limpa.', correct: true },
        { id: 'b', text: 'Original, porque guarda a foto como ela é e não perde informação.', porque: 'Ele guarda a cor e deixa a letra acinzentada — e é onde a foto cai sozinha, sem ninguém escolher.' },
        { id: 'c', text: 'Tons de cinza, porque é o único que o reconhecimento entende.', porque: 'O reconhecimento entende qualquer um deles. Tons de cinza ajuda, e ainda deixa menos contraste que preto e branco.' },
        { id: 'd', text: 'Nenhum: filtro é enfeite e não muda o que dá para ler.', porque: 'Muda, e muito. O contraste é metade do que o requisito de digitalizar pede corrigir.' },
      ]},
      explanation: 'O filtro é como um celular corrige contraste. Deixar em Original é a diferença entre o texto sair inteiro e sair trocado.',
    },
    {
      id: 'ES4-M4-Q5', type: 'true_false',
      prompt: 'Endireitar a página e encaixar os quatro cantos já deixa a digitalização pronta para reconhecer.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Falta o contraste. A folha fica reta e bem recortada, parece pronta, e continua com o filtro de uma foto de mesa.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Arrumar metade é a parte que engana: o aviso do aplicativo continua dizendo que a imagem está ruim, e a página parece boa.',
    },
    {
      id: 'ES4-M4-Q6', type: 'multiple_choice',
      prompt: 'Como se comprova que o reconhecimento de texto funcionou?',
      data: { options: [
        { id: 'a', text: 'Procurando no leitor uma palavra que está claramente na página.', correct: true },
        { id: 'b', text: 'Vendo se a página ficou legível na tela.', porque: 'Ela estava legível antes do reconhecimento também: o que se lê é a imagem, e não a camada de texto.' },
        { id: 'c', text: 'Conferindo se o aviso amarelo de documento em imagem sumiu.', porque: 'Ele some assim que existir qualquer texto, inclusive um texto reconhecido errado. Sumir não quer dizer resolvido.' },
        { id: 'd', text: 'Olhando se o arquivo ficou maior depois da operação.', porque: 'O texto é leve e o aumento é imperceptível. O tamanho não responde nada sobre o texto estar certo.' },
      ]},
      explanation: 'A contradição é o ponto: a palavra está desenhada na página e o programa não a encontra.',
    },
    {
      id: 'ES4-M4-Q7', type: 'scenario',
      prompt: 'Você procurou "Chácara" no recibo digitalizado e o leitor respondeu nenhum resultado. Qual é o próximo passo?',
      data: { scenarios: [
        { id: 'a', text: 'Refazer a captura com enquadramento e filtro melhores, e reconhecer de novo.', correct: true },
        { id: 'b', text: 'Procurar uma palavra mais curta, que tenha mais chance de ser encontrada.', porque: 'Palavra curta acha coisa em quase qualquer lixo, e isso não é prova de nada — é o contrário do que a busca serve para mostrar.' },
        { id: 'c', text: 'Rodar o reconhecimento outra vez sobre a mesma captura.', porque: 'Ele releria a mesma imagem e chegaria ao mesmo resultado. O que precisa mudar é a imagem.' },
        { id: 'd', text: 'Digitar a palavra por cima da página, com a ferramenta de escrever.', porque: 'Isso acrescentaria uma palavra desenhada no documento sem consertar o texto reconhecido — e ainda alteraria o recibo.' },
      ]},
      explanation: 'Uma de duas coisas aconteceu: ninguém reconheceu, ou o reconhecimento leu errado. As duas se consertam refazendo a captura.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 5 — Formulário e comentário
     ────────────────────────────────────────────────────────────────────── */
  'm5-teoria': [
    {
      id: 'ES4-M5-Q1', type: 'multiple_choice',
      prompt: 'Qual é o problema de imprimir a autorização, preencher à mão e mandar a foto de volta?',
      data: { options: [
        { id: 'a', text: 'O documento deixa de ser pesquisável e vira uma imagem pesada, com a letra de quem estava com pressa.', correct: true },
        { id: 'b', text: 'O documento perde a validade por não ter sido preenchido no computador.', porque: 'A validade não depende disso. Autorização preenchida à mão vale — o que se perde é legibilidade e a possibilidade de procurar.' },
        { id: 'c', text: 'Os campos do formulário ficam bloqueados depois de impressos.', porque: 'O PDF original continua com os campos intactos. O que voltou foi outro arquivo.' },
        { id: 'd', text: 'A foto não pode ser anexada junto de outros PDFs num dossiê.', porque: 'Pode, e é justamente aí que ela atrapalha: entra no dossiê como o documento que ninguém acha.' },
      ]},
      explanation: 'Um documento de duzentos kilobytes vira uma imagem de dois megabytes, e a busca deixa de achar qualquer coisa nele.',
    },
    {
      id: 'ES4-M5-Q2', type: 'multiple_choice',
      prompt: 'O que a borda vermelha de um campo de formulário costuma indicar?',
      data: { options: [
        { id: 'a', text: 'Que ele é obrigatório e ainda está vazio.', correct: true },
        { id: 'b', text: 'Que o que foi escrito nele está em formato errado.', porque: 'Conferência de formato existe em alguns formulários, mas a borda vermelha padrão fala de campo obrigatório vazio.' },
        { id: 'c', text: 'Que o campo está travado e não aceita edição.', porque: 'Campo travado costuma aparecer acinzentado, e não em vermelho. Vermelho chama atenção para o que falta fazer.' },
        { id: 'd', text: 'Que o documento foi assinado e não pode mais ser preenchido.', porque: 'Depois de assinado, o leitor avisa que preencher vai invalidar a assinatura — o que é outro aviso, em outro lugar.' },
      ]},
      explanation: 'É o programa apontando o que falta. E ela some com espaços digitados, o que deixa o campo vazio para quem vai ler.',
    },
    {
      id: 'ES4-M5-Q3', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre destacar um trecho e comentar nele?',
      data: { options: [
        { id: 'a', text: 'Destacar aponta onde; comentar diz o quê.', correct: true },
        { id: 'b', text: 'Destacar altera o texto do documento e comentar não.', porque: 'Nenhuma das duas altera o texto. As duas ficam por cima dele.' },
        { id: 'c', text: 'Destacar é visível para quem recebe e comentar é só para quem escreveu.', porque: 'As duas são visíveis para quem abrir o arquivo. O comentário aparece na margem, e não escondido.' },
        { id: 'd', text: 'Comentar só funciona em documentos pesquisáveis e destacar funciona em qualquer um.', porque: 'As duas funcionam nos dois. Destacar num documento em imagem pinta uma área da foto, e comentar abre um balão do mesmo jeito.' },
      ]},
      explanation: 'Num documento que volta para outra pessoa, as duas juntas poupam um telefonema.',
    },
    {
      id: 'ES4-M5-Q4', type: 'true_false',
      prompt: 'Os balões de comentário são impressos junto com o documento.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Eles ficam fora do papel, na margem, e não saem na impressão comum — é preciso pedir explicitamente para imprimi-los.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Comentário é conversa sobre o documento, e não parte dele. Por isso ele não empurra o texto nem sai no papel.',
    },
    {
      id: 'ES4-M5-Q5', type: 'scenario',
      prompt: 'A liderança deixou um comentário perguntando se a data bate com o calendário. Você conferiu, bate, e marcou o comentário como resolvido. O que ficou faltando?',
      data: { scenarios: [
        { id: 'a', text: 'Responder: quem perguntou não fica sabendo o que você descobriu.', correct: true },
        { id: 'b', text: 'Nada: marcar como resolvido já comunica que a pergunta foi respondida.', porque: 'Resolvido diz que o assunto está fechado, e não o que se descobriu. Quem perguntou fica sem a resposta.' },
        { id: 'c', text: 'Apagar o comentário, para o documento chegar limpo.', porque: 'Apagar tiraria o registro da pergunta. Comentário resolvido some da margem e continua no arquivo.' },
        { id: 'd', text: 'Destacar o trecho da data, porque resolver exige uma marcação junto.', porque: 'Não exige. Marcar é outra ferramenta, útil em outros casos.' },
      ]},
      explanation: 'Resolver sem responder fecha o assunto sem dizer nada a quem perguntou.',
    },
    {
      id: 'ES4-M5-Q6', type: 'multiple_choice',
      prompt: 'O PDF que chegou não tem campos de formulário. O que fazer para preenchê-lo sem imprimir?',
      data: { options: [
        { id: 'a', text: 'Usar a ferramenta de escrever por cima, que os leitores têm.', correct: true },
        { id: 'b', text: 'Converter para documento de texto, preencher e exportar de novo.', porque: 'A conversão desmancha a formatação com frequência, e o documento que volta deixa de ser o que foi mandado.' },
        { id: 'c', text: 'Pedir que a pessoa mande um formulário de verdade.', porque: 'Às vezes cabe, e quase sempre é mais lento do que resolver. Escrever por cima leva um minuto.' },
        { id: 'd', text: 'Não há como: sem campos, preencher na tela é impossível.', porque: 'Há: escrever por cima existe em todo leitor, justamente por causa dos documentos que chegam sem campos.' },
      ]},
      explanation: 'É pior do que campo de verdade e muito melhor do que papel fotografado.',
    },
    {
      id: 'ES4-M5-Q7', type: 'scenario',
      prompt: 'Todos os campos obrigatórios da autorização perderam a borda vermelha, mas o responsável diz que não recebeu o nome dele no documento. O que pode ter acontecido?',
      data: { scenarios: [
        { id: 'a', text: 'O campo foi preenchido com espaços, que tiram a borda vermelha e não escrevem nada.', correct: true },
        { id: 'b', text: 'O campo foi preenchido e o documento foi salvo sem os campos.', porque: 'Salvar guarda o que está nos campos. Existem opções de achatar o formulário, e elas preservam o que foi escrito.' },
        { id: 'c', text: 'O leitor do responsável não mostra campos de formulário.', porque: 'Qualquer leitor mostra o que está escrito nos campos. Alguns não deixam editar, o que é diferente de não mostrar.' },
        { id: 'd', text: 'A borda vermelha some sozinha depois de um tempo aberto.', porque: 'Ela não tem tempo: some quando o campo deixa de estar vazio, e volta se ele for esvaziado.' },
      ]},
      explanation: 'Espaço é conteúdo para o programa e nada para quem lê. O leitor não reclama, e o documento chega sem o nome.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 6 — O que parece garantia
     ────────────────────────────────────────────────────────────────────── */
  'm6-teoria': [
    {
      id: 'ES4-M6-Q1', type: 'multiple_choice',
      prompt: 'O que uma assinatura verificável guarda junto do documento?',
      data: { options: [
        { id: 'a', text: 'Quem assinou, quando, e uma impressão digital do documento naquele instante.', correct: true },
        { id: 'b', text: 'Uma cópia do documento de identidade de quem assinou.', porque: 'Nada disso vai para dentro do arquivo. A identificação vem do certificado usado, e não de um documento anexado.' },
        { id: 'c', text: 'Uma senha que só quem assinou conhece.', porque: 'Senha é outra coisa, e serve para abrir o arquivo. A assinatura não protege a abertura.' },
        { id: 'd', text: 'Uma cópia intacta do documento, para comparar depois.', porque: 'Guardar o documento inteiro dobraria o tamanho do arquivo. O que se guarda é um número calculado a partir dele.' },
      ]},
      explanation: 'A impressão digital é um número calculado de cada byte. Mudar uma vírgula muda o número inteiro.',
    },
    {
      id: 'ES4-M6-Q2', type: 'multiple_choice',
      prompt: 'O que a assinatura verificável garante?',
      data: { options: [
        { id: 'a', text: 'Que mexer no documento depois de assinado vai aparecer.', correct: true },
        { id: 'b', text: 'Que ninguém consegue alterar o documento.', porque: 'Qualquer pessoa altera o arquivo. O que a assinatura faz é denunciar a alteração, que é uma garantia diferente.' },
        { id: 'c', text: 'Que o conteúdo do documento é verdadeiro.', porque: 'Ela não sabe nada sobre o conteúdo. Um documento com informação falsa pode ser assinado e o selo dirá que confere.' },
        { id: 'd', text: 'Que o documento não pode ser copiado nem impresso.', porque: 'Isso são as restrições de leitura, que são outra coisa — e são pedidos, não travas.' },
      ]},
      explanation: 'Impedir e denunciar são garantias diferentes, e a segunda é a que serve num documento que vai circular.',
    },
    {
      id: 'ES4-M6-Q3', type: 'scenario',
      prompt: 'Um recibo foi assinado com a imagem de uma assinatura colada. Um mês depois, alguém mudou o valor. O que o leitor mostra?',
      data: { scenarios: [
        { id: 'a', text: 'O rabisco continua lá e nada acusa nada: o documento adulterado continua parecendo assinado.', correct: true },
        { id: 'b', text: 'A imagem da assinatura some, porque o documento mudou.', porque: 'Ela é uma figura como outra qualquer, e continua onde foi colada.' },
        { id: 'c', text: 'Um aviso de que o documento foi alterado depois de assinado.', porque: 'Para avisar, o leitor precisaria de uma impressão do documento guardada junto — e a imagem colada não guarda nenhuma.' },
        { id: 'd', text: 'O leitor pede a senha de quem assinou antes de abrir.', porque: 'Não há senha envolvida. A imagem colada não estabelece relação nenhuma entre o documento e quem assinou.' },
      ]},
      explanation: 'É isso que faz da imagem colada a pior das duas: ela sobrevive intacta a qualquer mudança.',
    },
    {
      id: 'ES4-M6-Q4', type: 'true_false',
      prompt: 'Um PDF protegido por senha é um documento seguro.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'A senha controla quem abre da primeira vez. Quem tem a senha abre e faz o que quiser, inclusive salvar uma cópia sem senha.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Ela protege o arquivo até a primeira pessoa certa abri-lo, e não depois. São coisas diferentes com nomes parecidos.',
    },
    {
      id: 'ES4-M6-Q5', type: 'multiple_choice',
      prompt: 'O que a caixa "não permitir copiar" de fato faz?',
      data: { options: [
        { id: 'a', text: 'Grava um pedido dentro do arquivo, que o leitor obedece porque foi escrito para obedecer.', correct: true },
        { id: 'b', text: 'Criptografa o texto, de modo que copiá-lo devolve caracteres embaralhados.', porque: 'O texto continua gravado normalmente. Se fosse embaralhado, o próprio leitor não teria como mostrá-lo.' },
        { id: 'c', text: 'Remove a camada de texto e deixa só a imagem das páginas.', porque: 'Isso destruiria a busca no documento, e não é o que acontece: o arquivo continua pesquisável.' },
        { id: 'd', text: 'Registra quem tentou copiar, para o autor do documento saber depois.', porque: 'O arquivo não relata nada a ninguém. Ele fica no computador de quem recebeu, sem falar com o mundo.' },
      ]},
      explanation: 'Outro leitor simplesmente não obedece — e não é leitor de invasor, é qualquer outro.',
    },
    {
      id: 'ES4-M6-Q6', type: 'scenario',
      prompt: 'Você assinou a autorização com assinatura verificável e depois percebeu que faltava preencher o telefone. Preencheu, e o selo passou a dizer que não confere. O que fazer?',
      data: { scenarios: [
        { id: 'a', text: 'Assinar de novo, agora com o documento completo.', correct: true },
        { id: 'b', text: 'Deixar como está: o selo avisar é justamente o que se espera dele.', porque: 'O aviso é para quem recebe, e ele vai ler que o documento mudou depois de assinado. Entregar assim é entregar um documento que se diz adulterado.' },
        { id: 'c', text: 'Desfazer o preenchimento do telefone, para o selo voltar a conferir.', porque: 'Voltaria a conferir, e o documento ficaria incompleto — que era o problema que você tinha acabado de achar.' },
        { id: 'd', text: 'Apagar a assinatura e mandar sem nenhuma.', porque: 'Isso resolve o aviso jogando fora a garantia. Assinar de novo custa o mesmo clique.' },
      ]},
      explanation: 'Assinar é o último passo, depois de o documento estar pronto. Quando não foi, assina-se outra vez.',
    },
    {
      id: 'ES4-M6-Q7', type: 'multiple_choice',
      prompt: 'Para qual destes uma imagem de assinatura colada é suficiente?',
      data: { options: [
        { id: 'a', text: 'Um convite do clube, que não precisa provar nada depois.', correct: true },
        { id: 'b', text: 'A autorização de participação assinada pelo responsável.', porque: 'É justamente o documento em que alguém pode precisar provar, depois, que aquilo foi autorizado daquele jeito.' },
        { id: 'c', text: 'O recibo do pagamento da chácara.', porque: 'Recibo é comprovante, e comprovante existe para ser usado em caso de dúvida. Uma figura colada não sustenta dúvida nenhuma.' },
        { id: 'd', text: 'O contrato de locação do ônibus.', porque: 'Contrato é o caso mais claro de documento que precisa poder ser verificado depois.' },
      ]},
      explanation: 'A imagem colada tem uso em documento que não precisa provar nada. Onde há o que provar, ela não serve.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 7 — O dossiê
     ────────────────────────────────────────────────────────────────────── */
  'm7-teoria': [
    {
      id: 'ES4-M7-Q1', type: 'multiple_choice',
      prompt: 'Para quem um dossiê de atividade é feito?',
      data: { options: [
        { id: 'a', text: 'Para quem abrir depois, e não para quem está organizando agora.', correct: true },
        { id: 'b', text: 'Para a liderança conferir antes de a atividade acontecer.', porque: 'Boa parte dele só existe depois: a lista de presença, o recibo, o orçamento fechado.' },
        { id: 'c', text: 'Para a associação, que exige o envio de cinco documentos.', porque: 'O mínimo de cinco é do requisito da especialidade, e não de uma exigência externa. O dossiê fica arquivado no clube.' },
        { id: 'd', text: 'Para quem organizou, como registro pessoal do que foi feito.', porque: 'Quem organizou já sabe o que aconteceu. O dossiê existe para quem não estava lá.' },
      ]},
      explanation: 'A próxima diretoria vai procurar exatamente isso, e o que ela achar é o que vai ter.',
    },
    {
      id: 'ES4-M7-Q2', type: 'multiple_choice',
      prompt: 'Por que todos os documentos do dossiê precisam ser pesquisáveis?',
      data: { options: [
        { id: 'a', text: 'Porque um que seja foto sem texto dentro é o que ninguém acha quando precisa.', correct: true },
        { id: 'b', text: 'Porque um documento em imagem não pode ser arquivado junto de PDFs comuns.', porque: 'Pode, e é o problema: ele entra na pasta parecendo igual aos outros quatro.' },
        { id: 'c', text: 'Porque documentos em imagem se degradam com o tempo.', porque: 'Nenhum arquivo se degrada guardado. O que muda é a capacidade de achar alguma coisa dentro dele.' },
        { id: 'd', text: 'Porque só documentos pesquisáveis aceitam assinatura.', porque: 'Assinatura verificável funciona em qualquer PDF, com texto dentro ou sem.' },
      ]},
      explanation: 'E, como os cinco abrem iguais, ninguém sabe qual é o problemático antes de precisar dele.',
    },
    {
      id: 'ES4-M7-Q3', type: 'multiple_choice',
      prompt: 'Por que a data num padrão de nome se escreve do ano para o dia?',
      data: { options: [
        { id: 'a', text: 'Porque assim a ordem alfabética da pasta vira ordem de tempo.', correct: true },
        { id: 'b', text: 'Porque é o formato que o sistema operacional exige nos nomes.', porque: 'O sistema aceita qualquer formato no nome do arquivo. A razão é de organização.' },
        { id: 'c', text: 'Porque assim o nome fica mais curto.', porque: 'Ele tem exatamente o mesmo comprimento nos dois sentidos.' },
        { id: 'd', text: 'Porque o programa de busca só reconhece datas nesse formato.', porque: 'A busca por nome não interpreta data nenhuma: ela compara texto.' },
      ]},
      explanation: 'É a única razão de escrever a data ao contrário de como se fala, e é uma razão boa.',
    },
    {
      id: 'ES4-M7-Q4', type: 'scenario',
      prompt: 'Cinco arquivos foram nomeados assim: ata-um-v01, orcamento-um-v02, recibo-um-v01, presenca-um-v01, circular-um-v01. Eles estão no mesmo padrão. O que ainda falta?',
      data: { scenarios: [
        { id: 'a', text: 'A data: sem ela, os nomes não dizem quando cada coisa aconteceu nem se ordenam por tempo.', correct: true },
        { id: 'b', text: 'Nada: cinco nomes no mesmo formato já são um padrão completo.', porque: 'São um padrão, e não um que sirva. A pasta continua sem ordenar por tempo e nada diz quando cada documento é de quando.' },
        { id: 'c', text: 'A versão, que está escrita de um jeito que o sistema não reconhece.', porque: 'A versão está lá e está legível: v01, v02. É a data que não existe em nenhum deles.' },
        { id: 'd', text: 'O nome do clube em cada arquivo.', porque: 'Dentro da pasta do clube, isso repetiria a mesma palavra cinco vezes sem distinguir nada.' },
      ]},
      explanation: 'Molde e data são duas contas separadas, e nenhuma substitui a outra: cinco datados em cinco moldes também não ordenam.',
    },
    {
      id: 'ES4-M7-Q5', type: 'true_false',
      prompt: 'Um arquivo chamado IMG_20260702_143512.pdf já tem data no nome, então serve num dossiê.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Tem data e não diz o que é o documento, que é a primeira coisa que alguém procura ao abrir a pasta.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O nome da câmera é bom para a câmera. Num dossiê, ele obriga a abrir o arquivo para descobrir o que ele é.',
    },
    {
      id: 'ES4-M7-Q6', type: 'multiple_choice',
      prompt: 'Como se descobre, na hora de conferir o dossiê, qual documento não tem texto dentro?',
      data: { options: [
        { id: 'a', text: 'Abrindo um por um: o que tiver o aviso amarelo no alto é ele.', correct: true },
        { id: 'b', text: 'Pelo tamanho do arquivo, que é sempre maior nos documentos em imagem.', porque: 'Costuma ser maior, e não sempre: uma digitalização comprimida pode ficar menor que um PDF com muitas figuras. O tamanho é pista, não resposta.' },
        { id: 'c', text: 'Pelo ícone do arquivo, que muda conforme o tipo de conteúdo.', porque: 'O ícone é o mesmo para todo PDF. A lista de arquivos não olha o que está dentro.' },
        { id: 'd', text: 'Pela extensão, que é .pdf nos gerados e outra nos digitalizados.', porque: 'Os dois são .pdf. É por isso que eles convivem na mesma pasta sem se distinguir.' },
      ]},
      explanation: 'Depois de reconhecer, procura-se uma palavra em cada um. São cinco buscas e elas fecham a conferência.',
    },
    {
      id: 'ES4-M7-Q7', type: 'scenario',
      prompt: 'Na conferência final, alguém mandou reconhecer o texto do dossiê inteiro de uma vez, inclusive dos quatro documentos que já eram pesquisáveis. Qual é o risco?',
      data: { scenarios: [
        { id: 'a', text: 'Os quatro que estavam bons são relidos, e o texto exato deles é trocado por texto adivinhado.', correct: true },
        { id: 'b', text: 'Nenhum: o programa pula os documentos que já têm texto.', porque: 'Alguns leitores perguntam antes, e outros simplesmente releem tudo o que foi mandado reconhecer.' },
        { id: 'c', text: 'Os arquivos ficam com duas camadas de texto sobrepostas e a busca acha tudo em dobro.', porque: 'A camada nova substitui a antiga. O problema não é sobrar texto, é o texto que fica ser pior.' },
        { id: 'd', text: 'Os documentos perdem a assinatura verificável.', porque: 'Isso aconteceria se algum estivesse assinado — e seria visível, porque o selo passaria a dizer que não confere.' },
      ]},
      explanation: 'E o arquivo continua se dizendo pesquisável. É a operação que piora tudo sem deixar sinal nenhum.',
    },
  ],
};
