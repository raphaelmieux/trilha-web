import type { Question } from '../types';

/*
 * As questões das lições de teoria da vereda de HTML.
 *
 * ── Por que existem ──────────────────────────────────────────────────────
 * A teoria da vereda era leitura: abrir os tópicos bastava para vencê-la. Ler
 * não é o mesmo que entender, e nenhuma lição de teoria da plataforma se
 * conclui sem responder — não havia razão para a vereda ser a exceção.
 *
 * ── O que elas cobram ────────────────────────────────────────────────────
 * A definição vale uma vez, e as outras medem entendimento: consequência,
 * discriminação entre o que se confunde, e diagnóstico. "O que é uma tag" é
 * uma questão; "por que o texto sumiu" é outra, e é a que separa quem leu de
 * quem entendeu.
 *
 * Toda alternativa errada diz **por que** está errada, no campo `porque`, e a
 * certa não carrega motivo nenhum — é o que `qualidade.test.ts` cobra, aqui
 * como nas provas das trilhas.
 */

export const QUESTOES_DE_HTML: Record<string, Question[]> = {
  'm1-teoria': [
    {
      id: 'VD01-M1-Q1', type: 'multiple_choice',
      prompt: 'Você escreveu <p>O clube se reúne no sábado. e a página seguiu funcionando. O que aconteceu?',
      data: { options: [
        { id: 'a', text: 'A marca de fechar faltou, e o navegador decidiu sozinho onde o parágrafo termina.', correct: true },
        { id: 'b', text: 'Nada: parágrafo é o único elemento em que a marca de fechar é opcional no HTML.', porque: 'Ele até tolera, mas a decisão passa a ser do navegador, e não sua — e no primeiro elemento aninhado o resultado deixa de ser o esperado.' },
        { id: 'c', text: 'O navegador mostrou uma mensagem de erro em vermelho antes de desenhar a página.', porque: 'HTML não acusa erro na tela. É por isso que esquecer de fechar é perigoso: nada avisa, e o estrago aparece três telas depois.' },
        { id: 'd', text: 'O texto virou o nome da página, porque sem fechamento ele foi parar no cabeçalho.', porque: 'O que vira nome da página é o que está dentro de <title>, no <head>. Um <p> mal fechado continua no corpo.' },
      ]},
      explanation: 'HTML não reclama: ele conserta do jeito dele e segue. Feche a marca assim que abrir, e escreva o conteúdo entre as duas.',
    },
    {
      id: 'VD01-M1-Q2', type: 'multiple_choice',
      prompt: 'O desbravador escreveu o texto dentro do <head> e nada apareceu na tela. Por quê?',
      data: { options: [
        { id: 'a', text: 'O <head> guarda informações sobre a página; o que aparece fica no <body>.', correct: true },
        { id: 'b', text: 'O texto apareceu, mas em branco sobre branco — falta escolher a cor dele.', porque: 'Cor se resolve com estilo. Aqui o texto nem chegou a ser desenhado: o lugar é que estava errado.' },
        { id: 'c', text: 'Faltou salvar o arquivo antes de abrir a página no navegador.', porque: 'Nesse caso a página inteira ficaria desatualizada, e não só um pedaço. O sintoma aponta para o lugar do texto.' },
        { id: 'd', text: 'O <head> só aceita texto em inglês, e por isso o conteúdo em português foi ignorado.', porque: 'HTML não escolhe idioma. O <head> não mostra texto nenhum, em língua nenhuma.' },
      ]},
      explanation: 'São dois blocos com papéis diferentes: <head> é sobre a página, <body> é a página.',
    },
    {
      id: 'VD01-M1-Q3', type: 'true_false',
      prompt: 'O que está dentro de <!-- e --> não aparece na tela, mas continua no arquivo que qualquer pessoa pode abrir.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Comentário some da tela, e só dela. Quem abrir o código-fonte da página lê tudo — por isso ele não serve para guardar segredo.' },
      ]},
      explanation: 'O comentário é bilhete para quem escreve, não esconderijo: o navegador ignora, a pessoa lê.',
    },
    {
      id: 'VD01-M1-Q4', type: 'ordering',
      prompt: 'Ordene as marcas na sequência em que elas abrem num documento HTML.',
      data: { items: [
        { id: 'i1', text: '<!DOCTYPE html>', order: 1 },
        { id: 'i2', text: '<html>', order: 2 },
        { id: 'i3', text: '<head>, com o <title> dentro', order: 3 },
        { id: 'i4', text: '<body>, com o que aparece na tela', order: 4 },
      ]},
      explanation: 'É sempre essa ordem, em toda página e em todo site. Copiar esse esqueleto de um arquivo para outro é o que se faz na vida real.',
    },
  ],

  'm2-teoria': [
    {
      id: 'VD01-M2-Q1', type: 'multiple_choice',
      prompt: 'Você quer que o nome da seção saia maior. Qual é a razão certa para escolher <h2> em vez de <h3>?',
      data: { options: [
        { id: 'a', text: 'Porque aquela seção é mais importante dentro da página — o tamanho vem depois disso.', correct: true },
        { id: 'b', text: 'Porque <h2> desenha a letra num tamanho maior que <h3> em qualquer navegador.', porque: 'Desenha, mas escolher pelo tamanho é usar o título como régua. Quando o tamanho não agradar, o lugar de mudar é o estilo, e não o nível.' },
        { id: 'c', text: 'Porque <h3> só pode ser usado dentro de uma lista ou de uma tabela.', porque: 'Os seis níveis valem em qualquer lugar do corpo. O que muda entre eles é a importância, não o lugar permitido.' },
        { id: 'd', text: 'Porque só é permitido um <h3> por página, e ele já foi usado no topo.', porque: 'Quem costuma aparecer uma vez por página é o <h1>, que é o nome dela. Os outros níveis repetem à vontade.' },
      ]},
      explanation: 'O número é o nível, não o tamanho. Quem usa leitor de tela navega pulando de título em título, e é essa hierarquia que ele ouve.',
    },
    {
      id: 'VD01-M2-Q2', type: 'multiple_choice',
      prompt: 'Você apertou Enter duas vezes dentro de um <p> e os dois trechos saíram grudados numa linha só. Por quê?',
      data: { options: [
        { id: 'a', text: 'O navegador ignora o espaço em branco do código: parágrafo separado pede um <p> para cada.', correct: true },
        { id: 'b', text: 'Faltou apertar Enter uma terceira vez — são três quebras para o parágrafo valer.', porque: 'Não é questão de quantidade: dez quebras dariam no mesmo. O navegador não conta espaço em branco.' },
        { id: 'c', text: 'O editor apagou as quebras ao salvar o arquivo em UTF-8.', porque: 'As quebras continuam lá no arquivo. Quem não as usa para separar parágrafo é o navegador.' },
        { id: 'd', text: 'Parágrafo com mais de uma frase precisa de <br> obrigatório entre as frases.', porque: 'O <br> serve para quebra que faz parte do texto, como endereço. Para separar assunto, o certo são dois <p>.' },
      ]},
      explanation: 'Espaço, tabulação e quebra de linha no código viram um espaço só na tela. A separação de blocos é dita pelas marcas.',
    },
    {
      id: 'VD01-M2-Q3', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre <strong> e <br>, além do que cada um faz?',
      data: { options: [
        { id: 'a', text: '<strong> envolve um trecho e por isso fecha; <br> não envolve nada e por isso não fecha.', correct: true },
        { id: 'b', text: 'Os dois fecham, mas o </br> é opcional e o </strong> é obrigatório.', porque: 'Não existe </br>. Escrevê-lo não quebra a página, mas mostra que a regra não ficou clara: quem não envolve, não fecha.' },
        { id: 'c', text: 'Nenhum dos dois fecha: os dois marcam um ponto do texto, e não um trecho.', porque: 'O <strong> marca um trecho — é preciso dizer onde o destaque começa e onde termina.' },
        { id: 'd', text: '<strong> só pode aparecer dentro de um título, e <br> só dentro de um parágrafo.', porque: 'Os dois valem no meio de qualquer texto. O que os separa é envolver ou não envolver conteúdo.' },
      ]},
      explanation: 'É a regra que decide o fechamento em toda tag: quem tem conteúdo dentro precisa dizer onde ele acaba.',
    },
    {
      id: 'VD01-M2-Q4', type: 'true_false',
      prompt: 'Usar <hr> para separar duas partes do documento é o mesmo que deixar uma linha em branco entre elas.',
      data: { options: [
        { id: 'f', text: 'Falso', correct: true },
        { id: 'v', text: 'Verdadeiro', porque: 'Linha em branco no código o navegador ignora. O <hr> desenha uma separação de verdade, e diz que ali um assunto termina e outro começa.' },
      ]},
      explanation: 'O <hr> é conteúdo: ele afirma uma divisão. Espaço em branco no código não afirma nada.',
    },
  ],

  'm3-teoria': [
    {
      id: 'VD01-M3-Q1', type: 'multiple_choice',
      prompt: 'Você está escrevendo os passos para montar a barraca. Qual lista usar, e por quê?',
      data: { options: [
        { id: 'a', text: '<ol>, porque trocar a ordem dos passos mudaria o que se deve fazer.', correct: true },
        { id: 'b', text: '<ul>, porque a bolinha fica mais bonita do que o número numa lista curta.', porque: 'A escolha não é de aparência. Se a ordem importa, a lista precisa dizer isso — e é o <ol> que diz.' },
        { id: 'c', text: '<ol>, porque toda lista com mais de três itens precisa ser numerada.', porque: 'A quantidade não decide nada. Uma lista de dez coisas para levar continua sem ordem, e continua sendo <ul>.' },
        { id: 'd', text: 'Tanto faz: os dois marcam lista, e o navegador numera as duas do mesmo jeito.', porque: 'O <ul> não numera. E, mais do que o desenho, a marca diz ao leitor de tela se a ordem faz parte da informação.' },
      ]},
      explanation: 'A pergunta é sempre a mesma: trocar a ordem muda o sentido? Se muda, <ol>.',
    },
    {
      id: 'VD01-M3-Q2', type: 'multiple_choice',
      prompt: 'Por que numerar os passos escrevendo "1.", "2." e "3." dentro de <li> é pior do que usar <ol>?',
      data: { options: [
        { id: 'a', text: 'Porque acrescentar um passo no meio obriga a renumerar tudo à mão.', correct: true },
        { id: 'b', text: 'Porque o navegador recusa números escritos dentro de um item de lista.', porque: 'Ele aceita e mostra. O problema não é ser recusado — é ser você quem passa a manter os números.' },
        { id: 'c', text: 'Porque números escritos à mão só aparecem depois que a página é publicada.', porque: 'Aparecem na hora, como qualquer texto. O custo é de manutenção, e não de exibição.' },
        { id: 'd', text: 'Porque o <ol> aceita no máximo nove itens, e a numeração à mão não tem limite.', porque: 'O <ol> não tem limite. E o que ele resolve é justamente a renumeração, que à mão fica com você.' },
      ]},
      explanation: 'A marca faz o trabalho: o navegador numera, e continua numerando certo depois de qualquer mudança.',
    },
    {
      id: 'VD01-M3-Q3', type: 'true_false',
      prompt: 'Escrever um texto solto dentro de <ul>, fora de qualquer <li>, é válido e ele aparece como mais um item.',
      data: { options: [
        { id: 'f', text: 'Falso', correct: true },
        { id: 'v', text: 'Verdadeiro', porque: 'Ele até aparece, mas fora do lugar: sem marcador e desalinhado dos outros. Tudo o que está na lista vai dentro de um <li>.' },
      ]},
      explanation: 'Quem é item da lista é o <li>. O que fica solto entre eles sai do arranjo.',
    },
  ],

  'm4-teoria': [
    {
      id: 'VD01-M4-Q1', type: 'multiple_choice',
      prompt: 'O link para a galeria funciona no seu computador e dá erro no site publicado. O href é "Galeria.html" e o arquivo se chama galeria.html. O que houve?',
      data: { options: [
        { id: 'a', text: 'O servidor diferencia maiúscula de minúscula; o seu computador não diferenciava.', correct: true },
        { id: 'b', text: 'O arquivo não foi enviado junto com os outros na hora de publicar.', porque: 'Se ele não existisse, o link falharia também no seu computador. O que mudou entre um lugar e outro foi o rigor com o nome.' },
        { id: 'c', text: 'Link para outra página do mesmo site precisa do endereço completo, com https://.', porque: 'Dentro do próprio site, o nome do arquivo basta — e é o que se usa. O endereço completo é para sair para fora.' },
        { id: 'd', text: 'Faltou o atributo target, sem o qual o navegador não sabe onde abrir a página.', porque: 'Sem target, o navegador abre na mesma aba, que é o normal. O erro aqui é o nome do arquivo, não o destino.' },
      ]},
      explanation: 'Galeria.html e galeria.html são dois arquivos diferentes no servidor. Escreva o nome letra por letra, como ele é.',
    },
    {
      id: 'VD01-M4-Q2', type: 'multiple_choice',
      prompt: 'Por que "clique aqui" é um texto ruim para um link?',
      data: { options: [
        { id: 'a', text: 'Porque quem usa leitor de tela ouve a lista de links sem o texto em volta, e "aqui" não diz para onde vai.', correct: true },
        { id: 'b', text: 'Porque o navegador não consegue destacar links cujo texto tenha menos de três palavras.', porque: 'Ele destaca qualquer texto de link. O problema é o que a frase informa, não o tamanho dela.' },
        { id: 'c', text: 'Porque links precisam ter o endereço escrito no próprio texto para funcionar.', porque: 'O endereço vai no href, e o texto é para a pessoa. O que se pede é que ele diga o destino, não que o repita.' },
        { id: 'd', text: 'Porque "aqui" é uma palavra reservada do HTML e não pode aparecer dentro de <a>.', porque: 'HTML não tem palavra reservada em texto. Qualquer palavra pode ir ali; a questão é a que ajuda quem lê.' },
      ]},
      explanation: 'O texto do link é a promessa do que vem depois dele. Ele precisa fazer sentido lido sozinho.',
    },
    {
      id: 'VD01-M4-Q3', type: 'multiple_choice',
      prompt: 'Você escreveu <img src="fogueira.jpg" alt="">. Para quem depende do alt, o que acontece?',
      data: { options: [
        { id: 'a', text: 'A imagem passa a não existir: o leitor de tela não tem o que dizer no lugar dela.', correct: true },
        { id: 'b', text: 'O leitor de tela lê o nome do arquivo, fogueira.jpg, no lugar da descrição.', porque: 'Ele não inventa descrição a partir do nome do arquivo. Com alt vazio, a imagem é pulada.' },
        { id: 'c', text: 'O navegador preenche o alt sozinho com o que consegue reconhecer na foto.', porque: 'Nada disso é feito pelo navegador. O que descreve a imagem é o que você escreve.' },
        { id: 'd', text: 'A imagem não carrega, porque o alt vazio impede o navegador de buscar o arquivo.', porque: 'Quem busca o arquivo é o src, e ele está preenchido. A imagem aparece — só não é descrita.' },
      ]},
      explanation: 'Descreva o que se vê: "Desbravadores em volta da fogueira", e não "foto". O alt é o que sobra da imagem para quem não a enxerga.',
    },
    {
      id: 'VD01-M4-Q4', type: 'true_false',
      prompt: 'A imagem fica guardada dentro do arquivo HTML depois que você escreve a tag <img>.',
      data: { options: [
        { id: 'f', text: 'Falso', correct: true },
        { id: 'v', text: 'Verdadeiro', porque: 'A página só aponta para o arquivo da imagem, pelo src. Se ele não for junto na hora de publicar, a página chega sem a foto.' },
      ]},
      explanation: 'HTML é texto. A foto é outro arquivo, e precisa viajar junto.',
    },
  ],

  'm5-teoria': [
    {
      id: 'VD01-M5-Q1', type: 'multiple_choice',
      prompt: 'A tabela ficou desalinhada da terceira linha para baixo. Qual é a causa mais provável?',
      data: { options: [
        { id: 'a', text: 'Uma das linhas tem menos células que as outras.', correct: true },
        { id: 'b', text: 'Faltou a tag de coluna que declara quantas colunas a tabela tem.', porque: 'Não existe tag de coluna em HTML. A coluna nasce de todas as linhas terem o mesmo número de células.' },
        { id: 'c', text: 'As linhas foram escritas fora de ordem dentro do <table>.', porque: 'A tabela desenha as linhas na ordem em que estão escritas; ordem trocada muda o conteúdo, não o alinhamento.' },
        { id: 'd', text: 'A legenda foi escrita depois da primeira linha, e isso empurra o resto.', porque: 'A legenda no lugar errado deixa de valer como legenda, mas não desalinha coluna nenhuma.' },
      ]},
      explanation: 'Conte as células de cada <tr>. Uma a menos numa linha, e a tabela inteira dali para baixo sai do lugar.',
    },
    {
      id: 'VD01-M5-Q2', type: 'multiple_choice',
      prompt: 'Qual é a diferença que importa entre <th> e <td>?',
      data: { options: [
        { id: 'a', text: '<th> diz ao leitor de tela que aquela célula nomeia a coluna; <td> é o dado.', correct: true },
        { id: 'b', text: '<th> deixa o texto em negrito e centralizado, e <td> não.', porque: 'Deixa, mas isso é o desenho padrão — dá para mudar com estilo. O que não se muda é o significado que ele carrega.' },
        { id: 'c', text: '<th> só pode aparecer na primeira linha, e <td> em todas as outras.', porque: 'O <th> também nomeia linha, na primeira célula de cada uma. O que ele marca é "isto é cabeçalho", não "isto está em cima".' },
        { id: 'd', text: 'Nenhuma: são dois nomes para a mesma coisa, mantidos por compatibilidade.', porque: 'São coisas diferentes. Trocar um pelo outro deixa a tabela igual na tela e muda o que ela informa a quem não a vê.' },
      ]},
      explanation: 'Com <th>, ao ler a célula "Ana" o leitor de tela consegue dizer "Responsável: Ana". Com <td>, ele lê só "Ana".',
    },
    {
      id: 'VD01-M5-Q3', type: 'multiple_choice',
      prompt: 'Onde entra o <caption>, e o que acontece se ele for escrito depois da primeira linha?',
      data: { options: [
        { id: 'a', text: 'Logo depois de <table>, antes de tudo; fora daí ele deixa de valer como legenda.', correct: true },
        { id: 'b', text: 'Em qualquer lugar dentro da tabela: o navegador o move para cima sozinho.', porque: 'Ele precisa ser o primeiro filho de <table>. Depois da primeira linha, não é mais tratado como legenda da tabela.' },
        { id: 'c', text: 'Depois de </table>, porque a legenda é um texto sobre a tabela, e não parte dela.', porque: 'Aí vira um parágrafo solto: nada liga esse texto à tabela para quem lê por leitor de tela.' },
        { id: 'd', text: 'Dentro da primeira <tr>, ocupando a linha inteira acima do cabeçalho.', porque: 'Isso seria uma célula, e não uma legenda. O <caption> é irmão das linhas, não filho de uma delas.' },
      ]},
      explanation: 'A legenda responde "tabela de quê?" para quem chegou agora — e só cumpre esse papel se estiver amarrada à tabela.',
    },
    {
      id: 'VD01-M5-Q4', type: 'true_false',
      prompt: 'Tabela serve para arrumar o layout da página, colocando o menu de um lado e o texto do outro.',
      data: { options: [
        { id: 'f', text: 'Falso', correct: true },
        { id: 'v', text: 'Verdadeiro', porque: 'Já se fez assim, e o resultado é uma página que o leitor de tela anuncia como tabela de dados e lê célula por célula. Tabela é para dado que tem linha e coluna.' },
      ]},
      explanation: 'A marca informa o que a coisa é. Usar tabela para posicionar mente sobre o conteúdo.',
    },
  ],

  'm6-teoria': [
    {
      id: 'VD01-M6-Q1', type: 'multiple_choice',
      prompt: 'O formulário tem um campo de texto e um botão, mas nenhuma etiqueta. Qual é o prejuízo concreto?',
      data: { options: [
        { id: 'a', text: 'A caixa fica sem nome: quem usa leitor de tela chega nela e não sabe o que escrever.', correct: true },
        { id: 'b', text: 'O formulário não envia nada, porque o campo sem <label> não tem valor.', porque: 'Ele envia. O prejuízo é de quem preenche, e não do envio.' },
        { id: 'c', text: 'O navegador desenha o campo com metade da largura até que uma etiqueta apareça.', porque: 'A largura não depende disso. O que falta é a informação de para que serve o campo.' },
        { id: 'd', text: 'Nenhum, desde que o botão diga "Enviar" — o texto do botão já explica o formulário.', porque: '"Enviar" diz o que o botão faz, e não o que vai em cada caixa. Um formulário de três campos ficaria com três caixas iguais e sem nome.' },
      ]},
      explanation: 'A etiqueta dá nome ao campo. Ligada por for e id, clicar no texto ainda põe o cursor dentro da caixa.',
    },
    {
      id: 'VD01-M6-Q2', type: 'multiple_choice',
      prompt: 'Você escreveu style="color: C13516" e o texto continuou preto. O que faltou?',
      data: { options: [
        { id: 'a', text: 'O # antes do código: sem ele o navegador não reconhece aquilo como cor e ignora.', correct: true },
        { id: 'b', text: 'As aspas em volta do código da cor, dentro do valor do atributo.', porque: 'Cor não leva aspas próprias. O que estava faltando é o sinal que marca o número como hexadecimal.' },
        { id: 'c', text: 'O ponto e vírgula no fim, obrigatório quando há uma só declaração.', porque: 'Com uma declaração só ele é dispensável. O que impediu a cor de valer foi outra coisa.' },
        { id: 'd', text: 'Nada: C13516 não é uma cor válida, porque cor hexadecimal não usa letras.', porque: 'Usa: depois do 9 vêm A, B, C, D, E e F. C13516 é um código válido — faltou o # na frente.' },
      ]},
      explanation: 'Valor que o navegador não entende ele descarta em silêncio. É por isso que o texto sai preto sem nenhum aviso.',
    },
    {
      id: 'VD01-M6-Q3', type: 'multiple_choice',
      prompt: 'Em #FF0000, o que os três pares de caracteres dizem?',
      data: { options: [
        { id: 'a', text: 'Quanto de vermelho, de verde e de azul — o máximo do primeiro e nada dos outros dois.', correct: true },
        { id: 'b', text: 'A posição da cor numa lista de 256 cores que o navegador guarda.', porque: 'Não há lista: os três pares descrevem a mistura de luzes que forma a cor.' },
        { id: 'c', text: 'A largura, a altura e a opacidade do texto que recebe a cor.', porque: 'Tamanho e transparência se dizem em outras propriedades. Os três pares são só vermelho, verde e azul.' },
        { id: 'd', text: 'O tom, a saturação e o brilho, na mesma ordem em que se escolhe numa paleta.', porque: 'Isso descreve outro jeito de dizer cor. Em hexadecimal, os três pares são as três luzes.' },
      ]},
      explanation: 'Cada par vai de 00, que é nada, até FF, que é o máximo. Por isso #000000 é preto: as três luzes apagadas.',
    },
    {
      id: 'VD01-M6-Q4', type: 'true_false',
      prompt: 'Atributos como href e src também podem ser escritos na marca de fechar, como </a href="...">.',
      data: { options: [
        { id: 'f', text: 'Falso', correct: true },
        { id: 'v', text: 'Verdadeiro', porque: 'A marca de fechar leva só a barra e o nome. Todo atributo vai na de abrir, que é onde a tag é configurada.' },
      ]},
      explanation: 'Abrir configura; fechar apenas encerra.',
    },
  ],

  'm7-teoria': [
    {
      id: 'VD01-M7-Q1', type: 'multiple_choice',
      prompt: 'Seu site tem quatro páginas, e a de contato não aparece no menu de nenhuma delas. Qual é a consequência?',
      data: { options: [
        { id: 'a', text: 'Ela existe no servidor, mas só chega nela quem digitar o endereço — na prática, ninguém.', correct: true },
        { id: 'b', text: 'O navegador apaga o arquivo por não encontrar link apontando para ele.', porque: 'O arquivo continua lá, intacto. O que falta é o caminho até ele.' },
        { id: 'c', text: 'As outras três páginas param de funcionar, porque o site fica incompleto.', porque: 'Elas funcionam normalmente. O prejuízo é só da página que ficou sem entrada.' },
        { id: 'd', text: 'Nenhuma: o navegador monta o menu sozinho a partir dos arquivos da pasta.', porque: 'Ele não monta menu nenhum. O menu é escrito por você, e repetido em cada página.' },
      ]},
      explanation: 'O que transforma quatro arquivos num site é o menu. Página sem link que aponte para ela é página que não existe.',
    },
    {
      id: 'VD01-M7-Q2', type: 'multiple_choice',
      prompt: 'Por que cada página do site precisa do esqueleto inteiro, do <!DOCTYPE html> ao </html>?',
      data: { options: [
        { id: 'a', text: 'Porque cada arquivo é um documento completo por conta própria — nada é herdado da página anterior.', correct: true },
        { id: 'b', text: 'Porque o navegador exige que todos os arquivos de uma pasta tenham o mesmo tamanho.', porque: 'Tamanho não importa. O que importa é que cada arquivo se sustente sozinho quando aberto.' },
        { id: 'c', text: 'Porque só assim os links entre as páginas conseguem encontrar os arquivos.', porque: 'O link acha o arquivo pelo nome, tenha ele esqueleto ou não. A razão é outra: cada documento precisa estar completo.' },
        { id: 'd', text: 'Porque a index.html envia o cabeçalho dela para as outras quando o site é publicado.', porque: 'Ela não envia nada. Copiar a estrutura de um arquivo para o outro é justamente o trabalho que se faz.' },
      ]},
      explanation: 'Não existe página que herde o começo da outra. Copiar e trocar o que muda é como se faz.',
    },
    {
      id: 'VD01-M7-Q3', type: 'multiple_choice',
      prompt: 'Alguém digita o endereço do seu site sem pedir página nenhuma. Qual arquivo o servidor abre?',
      data: { options: [
        { id: 'a', text: 'index.html, que é o nome convencionado para a página inicial.', correct: true },
        { id: 'b', text: 'O primeiro arquivo da pasta em ordem alfabética.', porque: 'A ordem alfabética não decide nada. O nome index.html é o combinado que o servidor procura.' },
        { id: 'c', text: 'O arquivo modificado mais recentemente, por ser o mais atual.', porque: 'A data do arquivo não entra na escolha. O que o servidor procura é um nome específico.' },
        { id: 'd', text: 'Nenhum: sem indicar a página, o endereço devolve uma lista dos arquivos.', porque: 'Isso só acontece quando o index.html não existe — e é justamente o que ter esse arquivo evita.' },
      ]},
      explanation: 'É por isso que a página inicial se chama index.html em praticamente todo site.',
    },
    {
      id: 'VD01-M7-Q4', type: 'true_false',
      prompt: 'O menu precisa aparecer também na página em que a pessoa já está.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Deixar o menu de fora justamente da página aberta é o erro mais comum — e aí não há como sair dela sem o botão voltar do navegador.' },
      ]},
      explanation: 'O menu é o mesmo bloco, repetido igual em todas as páginas. É isso que faz o site ser percorrível.',
    },
  ],
};
