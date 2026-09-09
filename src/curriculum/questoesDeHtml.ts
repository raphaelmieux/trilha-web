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
    {
      id: 'VD01-M1-Q5', type: 'multiple_choice',
      prompt: 'A página abre em branco. No arquivo há <html>, <head>, <title> e todo o texto escrito logo depois de </head>, antes de <body>. O que explica a tela vazia?',
      data: { options: [
        { id: 'a', text: 'O texto ficou fora do <body>, e só o que está lá dentro é desenhado.', correct: true },
        { id: 'b', text: 'O <title> consumiu o texto seguinte, por não ter sido fechado direito.', porque: 'Um <title> mal fechado engoliria o texto para o nome da página. Aqui ele está fechado, e o texto está fora do corpo.' },
        { id: 'c', text: 'Falta a marca de acentuação, e o navegador parou ao encontrar as letras com acento.', porque: 'Sem essa marca os acentos saem trocados, e não somem. O navegador nunca para de desenhar por causa deles.' },
        { id: 'd', text: 'O arquivo precisa terminar em .htm para o texto aparecer.', porque: 'As duas extensões abrem igual. O que decide o que aparece é estar dentro do corpo.' },
      ]},
      explanation: 'O corpo é a parte visível do documento. Texto entre </head> e <body> está em terra de ninguém: o navegador não erra, ele só não desenha.',
    },
    {
      id: 'VD01-M1-Q6', type: 'multiple_choice',
      prompt: 'Onde aparece o que se escreve dentro de <title>?',
      data: { options: [
        { id: 'a', text: 'Na aba do navegador, e no resultado da busca — nunca no meio da página.', correct: true },
        { id: 'b', text: 'No alto da página, como primeiro título do conteúdo.', porque: 'Esse é o <h1>, dentro do corpo. Os dois costumam dizer coisas parecidas, mas moram em lugares diferentes.' },
        { id: 'c', text: 'Em lugar nenhum: ele serve só para organizar o arquivo.', porque: 'Aparece sim, e em dois lugares que importam: a aba e a lista de resultados de quem procura o site.' },
        { id: 'd', text: 'No rodapé da página, junto do nome de quem a escreveu.', porque: 'Rodapé é conteúdo, e conteúdo fica no corpo. O <title> está no cabeçalho do documento.' },
      ]},
      explanation: 'O <title> é sobre a página, e não dela: é o nome que aparece na aba, no favorito e no buscador — por isso ele mora no <head>.',
    },
    {
      id: 'VD01-M1-Q7', type: 'true_false',
      prompt: 'Recuar as marcas com espaços muda o modo como o navegador desenha a página.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O navegador ignora o espaço em branco entre as marcas. O recuo é para quem lê o código — e é o que deixa ver qual marca fecha qual.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O recuo não é enfeite nem obrigação: ele não muda a página e muda tudo na hora de achar a marca que ficou aberta.',
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
    {
      id: 'VD01-M2-Q5', type: 'multiple_choice',
      prompt: 'Os laboratórios aceitam <b> e <strong> igualmente. Por que preferir <strong> fora daqui?',
      data: { options: [
        { id: 'a', text: 'Porque ele diz que o trecho é importante, e não só que ficará escuro.', correct: true },
        { id: 'b', text: 'Porque o <b> deixou de existir e some das páginas mais novas.', porque: 'O <b> continua valendo e funcionando. O que ele não faz é explicar por que aquele trecho está marcado.' },
        { id: 'c', text: 'Porque o <strong> deixa a letra mais escura que o <b> deixa.', porque: 'Na tela os dois saem iguais. A diferença está no que cada um significa, e não na tinta.' },
        { id: 'd', text: 'Porque o <b> só funciona dentro de títulos, e o <strong> em qualquer lugar.', porque: 'Os dois valem em qualquer texto. O critério é o sentido, não o lugar.' },
      ]},
      explanation: 'Quem ouve a página percebe a diferença: o leitor de tela pode mudar a voz num <strong>, porque ali há importância declarada. Num <b> há só aparência.',
    },
    {
      id: 'VD01-M2-Q6', type: 'scenario',
      prompt: 'O endereço do clube tem rua numa linha e cidade na outra, mas é um endereço só. Como escrever?',
      data: { scenarios: [
        { id: 'a', text: 'Um <p> só, com <br> entre a rua e a cidade.', correct: true },
        { id: 'b', text: 'Dois <p>, um para a rua e outro para a cidade.', porque: 'Dois parágrafos dizem dois assuntos. O endereço é um, e a quebra ali é só uma quebra.' },
        { id: 'c', text: 'Um <p> só, com <hr> entre a rua e a cidade.', porque: 'O <hr> desenha uma linha separando partes do documento. Ficaria um traço no meio do endereço.' },
        { id: 'd', text: 'Um <p> só, apertando Enter entre a rua e a cidade.', porque: 'O navegador ignora a quebra escrita no código: as duas linhas sairiam grudadas.' },
      ]},
      explanation: 'O <br> é para quando a quebra faz parte do texto — endereço, verso de poesia. Assunto novo continua pedindo <p> novo.',
    },
    {
      id: 'VD01-M2-Q7', type: 'true_false',
      prompt: 'Depois de um <br> é preciso escrever </br>, como se faz com as outras marcas.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O </br> não existe. Fechamento serve para dizer onde o conteúdo acaba, e o <br> não tem conteúdo dentro.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Quem envolve alguma coisa fecha; quem só marca um ponto, não. Vale para <br>, para <hr> e para <img>.',
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
    {
      id: 'VD01-M3-Q4', type: 'multiple_choice',
      prompt: 'A lista do material do acampamento estava em <ul> e você trocou por <ol>. O que muda?',
      data: { options: [
        { id: 'a', text: 'Os itens passam a ser numerados, afirmando uma ordem que ali não existe.', correct: true },
        { id: 'b', text: 'Nada muda: os dois desenham a lista do mesmo jeito.', porque: 'A <ul> traz bolinhas e a <ol> traz números. E o número não é enfeite: ele diz que a sequência importa.' },
        { id: 'c', text: 'A lista deixa de aparecer, porque <ol> exige um atributo a mais.', porque: 'A <ol> funciona igual, com os mesmos <li>. Ela só troca o marcador.' },
        { id: 'd', text: 'Os itens passam a aparecer em ordem alfabética.', porque: 'Nenhuma das duas ordena nada. A ordem é a que você escreveu.' },
      ]},
      explanation: 'Cantil, lanterna e lenço não têm primeiro nem último. Numerar o que não tem ordem faz o leitor procurar uma sequência que ninguém quis dizer.',
    },
    {
      id: 'VD01-M3-Q5', type: 'true_false',
      prompt: 'A bolinha que aparece antes de cada item da <ul> é escrita por você, dentro do <li>.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Quem desenha o marcador é o navegador. Escrevê-lo à mão faria aparecer duas marcas na frente do mesmo item.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Dentro do <li> vai só o conteúdo do item. O marcador é decisão do navegador — e por isso ele muda de forma quando você muda o tipo de lista.',
    },
    {
      id: 'VD01-M3-Q6', type: 'multiple_choice',
      prompt: 'Numa <ol>, o que decide qual passo vem primeiro?',
      data: { options: [
        { id: 'a', text: 'A ordem em que os <li> estão escritos no arquivo.', correct: true },
        { id: 'b', text: 'O número que você escreve no começo do texto de cada item.', porque: 'Esse número seria mais um texto dentro do item, e sairia ao lado do que o navegador já numera.' },
        { id: 'c', text: 'A ordem alfabética do texto de cada item da lista.', porque: 'A <ol> não ordena o conteúdo: ela numera na ordem em que os itens aparecem.' },
        { id: 'd', text: 'O tamanho do texto: itens mais curtos aparecem antes.', porque: 'O tamanho do texto não influi em nada. O que vale é a posição do <li> no arquivo.' },
      ]},
      explanation: 'O número é desenhado a partir da posição. Mover um <li> três linhas acima renumera a lista inteira sem que você toque em número nenhum.',
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
    {
      id: 'VD01-M4-Q5', type: 'multiple_choice',
      prompt: 'Você escreveu <a>site do clube</a>, sem href. O que aparece na página?',
      data: { options: [
        { id: 'a', text: 'O texto aparece, mas não leva a lugar nenhum: não é link.', correct: true },
        { id: 'b', text: 'Nada aparece, porque o navegador descarta a marca incompleta.', porque: 'O navegador não descarta nada. O texto entre as duas marcas é desenhado normalmente.' },
        { id: 'c', text: 'Aparece uma mensagem de erro no lugar do texto do link.', porque: 'HTML não põe recado de erro na página. Ele desenha o que dá e segue em silêncio.' },
        { id: 'd', text: 'O texto vira link para a própria página em que ele está.', porque: 'Sem destino não há para onde ir, nem para a página atual. O <a> vira só um texto.' },
      ]},
      explanation: 'O link precisa das duas metades: o destino, no href, e o texto que se lê e se clica. Sem o href, sobra a metade que ninguém consegue seguir.',
    },
    {
      id: 'VD01-M4-Q6', type: 'scenario',
      prompt: 'A foto está na mesma pasta da página e o navegador mostra o ícone de imagem quebrada. O src diz "fotos/fogueira.jpg". O que houve?',
      data: { scenarios: [
        { id: 'a', text: 'O caminho aponta para uma pasta fotos que não existe ali.', correct: true },
        { id: 'b', text: 'A imagem é grande demais e o navegador desistiu de carregá-la.', porque: 'Imagem grande demora, mas aparece. O ícone quebrado diz que o arquivo não foi encontrado.' },
        { id: 'c', text: 'Falta fechar a <img> com </img> para o navegador entender.', porque: 'A <img> não fecha, e um fechamento a mais não impediria a foto de carregar.' },
        { id: 'd', text: 'O alt está ocupando o lugar da imagem e a escondeu.', porque: 'O alt só aparece quando a imagem falha. Ele é a consequência aqui, não a causa.' },
      ]},
      explanation: 'O caminho relativo vale a partir da pasta da página: com a foto ao lado, o src é só "fogueira.jpg". Uma pasta a mais no caminho leva o navegador a procurar onde não há nada.',
    },
    {
      id: 'VD01-M4-Q7', type: 'true_false',
      prompt: 'Escrever href="https://adventistas.org" e href="sobre.html" é a mesma coisa: os dois são endereços completos.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O primeiro é completo e sai do seu site; o segundo é relativo e vale a partir da pasta onde a página está.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Para fora do site, o endereço vai inteiro. Dentro dele, basta o nome do arquivo — e é o que permite mudar o site de endereço sem reescrever link nenhum.',
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
    {
      id: 'VD01-M5-Q5', type: 'multiple_choice',
      prompt: 'Você procurou uma marca de coluna para pintar a segunda coluna inteira e não achou nenhuma. Por quê?',
      data: { options: [
        { id: 'a', text: 'Não existe marca de coluna: a coluna nasce da posição da célula em cada linha.', correct: true },
        { id: 'b', text: 'Existe, mas só funciona em tabelas com cabeçalho declarado em <th>.', porque: 'Nenhuma condição destrava uma marca que não existe. A tabela se escreve linha a linha.' },
        { id: 'c', text: 'A marca de coluna foi substituída pelo <caption> nas versões novas do HTML.', porque: 'O <caption> é a legenda da tabela inteira. Ele nunca teve relação com colunas.' },
        { id: 'd', text: 'Só quem escreve a tabela em ordem invertida consegue declarar colunas.', porque: 'A ordem não muda a estrutura: a tabela é sempre um conjunto de linhas com células dentro.' },
      ]},
      explanation: 'A tabela se escreve por linhas, e a coluna é o alinhamento que aparece quando todas têm o mesmo número de células. É por isso que uma célula a menos desalinha da linha para baixo.',
    },
    {
      id: 'VD01-M5-Q6', type: 'scenario',
      prompt: 'Na escala do mês, a primeira linha diz "Sábado" e "Responsável", e você a escreveu com <td>. Depois deixou em negrito pelo estilo. O que ainda falta?',
      data: { scenarios: [
        { id: 'a', text: 'Trocar por <th>, para que a célula seja anunciada como nome da coluna.', correct: true },
        { id: 'b', text: 'Nada: em negrito, a primeira linha já cumpre o papel de cabeçalho.', porque: 'O negrito resolve para quem enxerga. Quem ouve a tabela continua recebendo aquilo como mais um dado.' },
        { id: 'c', text: 'Pôr a primeira linha dentro de um <caption>, junto com a legenda.', porque: 'O <caption> diz do que trata a tabela inteira. Os nomes das colunas são células.' },
        { id: 'd', text: 'Repetir os nomes das colunas na última linha da tabela.', porque: 'Repetir o texto não diz ao programa o que aquelas células são. Quem diz isso é a marca escolhida.' },
      ]},
      explanation: 'O <th> não é o negrito: é a informação de que aquela célula nomeia a coluna. É com ela que o leitor de tela consegue dizer "Responsável: Ana" ao chegar na célula.',
    },
    {
      id: 'VD01-M5-Q7', type: 'true_false',
      prompt: 'A legenda escrita em <caption> aparece dentro da primeira célula da tabela.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Ela aparece acima da tabela, fora das linhas. O <caption> não é célula: é a frase que apresenta o conjunto.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A legenda fica por cima e vale para a tabela toda — é a resposta a "tabela de quê?" para quem chegou agora.',
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
    {
      id: 'VD01-M6-Q5', type: 'scenario',
      prompt: 'A etiqueta diz for="nome" e o campo tem id="Nome". Clicar no texto não põe o cursor na caixa. O que houve?',
      data: { scenarios: [
        { id: 'a', text: 'A ligação é letra por letra, e o N maiúsculo separou os dois.', correct: true },
        { id: 'b', text: 'O <label> precisa vir depois do <input> para a ligação funcionar.', porque: 'A ordem não decide nada. Quem liga um ao outro são o for e o id, e eles precisam ser idênticos.' },
        { id: 'c', text: 'Falta o atributo type no campo para que ele aceite o clique.', porque: 'Sem type o campo ainda é de texto, e continuaria recebendo o cursor se a ligação existisse.' },
        { id: 'd', text: 'O <label> só liga a campos que estejam dentro do mesmo <form>.', porque: 'Os dois já estão no mesmo formulário. O que não bate é o nome usado na ligação.' },
      ]},
      explanation: 'For e id diferentes é o mesmo que não ter etiqueta: o clique não leva ao campo, e o leitor de tela chega numa caixa sem nome.',
    },
    {
      id: 'VD01-M6-Q6', type: 'multiple_choice',
      prompt: 'Você quer um azul-escuro. Qual código pedir?',
      data: { options: [
        { id: 'a', text: '#003366 — pouco vermelho, um pouco de verde e mais azul.', correct: true },
        { id: 'b', text: '#FF0000 — o vermelho no máximo escurece o azul.', porque: 'Vermelho no máximo dá vermelho. Nenhum canal escurece outro: cada par acende a sua luz.' },
        { id: 'c', text: '#FFFFFF — os três no máximo, que é o tom mais forte.', porque: 'Os três no máximo dão branco. Forte não quer dizer escuro.' },
        { id: 'd', text: '#000000 — a ausência das três luzes já é o azul mais escuro.', porque: 'A ausência das três é preto. Para haver azul, o terceiro par precisa estar aceso.' },
      ]},
      explanation: 'Cada par vai de 00 a FF, e a cor é a mistura das três luzes. Azul-escuro é o terceiro par razoavelmente aceso com os outros dois baixos.',
    },
    {
      id: 'VD01-M6-Q7', type: 'true_false',
      prompt: 'Uma mesma tag pode levar vários atributos, separados por espaço.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Pode, e é o comum: a <img> costuma levar src, alt e mais o que for preciso, todos na marca de abrir.' },
      ]},
      explanation: 'Vários atributos convivem na mesma marca de abrir, cada um no formato nome="valor", separados por espaço.',
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
    {
      id: 'VD01-M7-Q5', type: 'multiple_choice',
      prompt: 'Você acrescentou a página de eventos ao site. Além de criar o arquivo, o que mais precisa ser feito nas outras três páginas?',
      data: { options: [
        { id: 'a', text: 'Acrescentar o link para ela no menu de cada uma das outras páginas.', correct: true },
        { id: 'b', text: 'Nada: o menu é um só, e basta mudá-lo numa página.', porque: 'Não há menu compartilhado em HTML puro: cada arquivo tem a sua cópia, e mudar uma não muda as outras.' },
        { id: 'c', text: 'Avisar o servidor de que existe um arquivo novo na pasta.', porque: 'O servidor entrega o que estiver na pasta. Ele não precisa de cadastro nenhum.' },
        { id: 'd', text: 'Renomear index.html, para que a página nova entre na ordem.', porque: 'O index.html é a página inicial e continua sendo. Nada nele muda ao surgir uma página nova.' },
      ]},
      explanation: 'O menu é o que faz de vários arquivos um site — e ele é repetido, e não compartilhado. Página nova exige tocar em todas as outras, e é justamente aí que uma fica de fora.',
    },
    {
      id: 'VD01-M7-Q6', type: 'scenario',
      prompt: 'No servidor a página inicial está salva como Index.html, com I maiúsculo, e o endereço do site abre uma lista de arquivos em vez da página. Por quê?',
      data: { scenarios: [
        { id: 'a', text: 'O servidor procura index.html exatamente assim, e não encontrou.', correct: true },
        { id: 'b', text: 'A página tem algum erro de HTML que impediu o servidor de abri-la.', porque: 'Erro de HTML não impede a página de ser entregue: o navegador desenha o que dá. Aqui o arquivo nem foi procurado com esse nome.' },
        { id: 'c', text: 'Falta pedir a página pelo nome no fim do endereço.', porque: 'É justamente o que não deveria ser preciso: a página inicial existe para abrir sem nome nenhum.' },
        { id: 'd', text: 'O servidor mostra a lista sempre que há mais de quatro arquivos na pasta.', porque: 'A quantidade não importa. A lista aparece quando não há uma página inicial com o nome esperado.' },
      ]},
      explanation: 'É o mesmo cuidado do href: no servidor, maiúscula e minúscula são letras diferentes. Index.html e index.html são dois nomes, e só um deles abre sozinho.',
    },
    {
      id: 'VD01-M7-Q7', type: 'true_false',
      prompt: 'Um site de quatro páginas é um arquivo .html com quatro partes dentro.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'São quatro arquivos .html na mesma pasta, cada um completo, ligados pelo menu.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Cada página é um arquivo, e é por isso que o endereço muda ao clicar no menu: você saiu de um documento e entrou em outro.',
    },
  ],
};
