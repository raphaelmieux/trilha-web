import type { Module } from '../../types';

/*
 * AP044 módulo 1 — as cinco unidades que o requisito 2 manda definir.
 *
 * Bit, kilobyte, megabyte, gigabyte, terabyte. É uma escala, e escala se
 * ensina inteira: definir cada uma em separado produz cinco frases decoradas
 * que ninguém consegue usar para responder "cabe?".
 *
 * ── As duas armadilhas, e por que elas importam mais que as definições ───
 * A primeira é o **bit contra o byte**. "Internet de 100 megas" é megabit por
 * segundo, e um megabyte tem oito megabits — então aquela conexão baixa uns
 * 12 MB por segundo, e não 100. Todo desbravador já ouviu alguém reclamar que
 * "contrataram 100 e não chega nem perto". Chega: o número é de outra unidade.
 *
 * A segunda é o **1000 contra 1024**. O pendrive diz 64 GB, o computador
 * mostra 59,6 GB, e a conclusão que se tira sozinho é que veio faltando ou que
 * alguém roubou espaço. Não veio: o fabricante conta de mil em mil e o sistema
 * conta de 1024 em 1024. Sem essa explicação, a pessoa passa a vida achando
 * que foi enganada.
 *
 * As duas viram lição porque as duas são perguntas que o desbravador já tem, e
 * a definição de terabyte não é. Definição sem uso é o que se esquece na
 * semana seguinte.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">A menor coisa que existe num computador</h2>
<p class="mb-3">Um computador só sabe fazer uma coisa: distinguir entre ligado
e desligado. Cada um desses "ligado ou desligado" é um <strong>bit</strong> —
a menor informação que existe lá dentro. Um bit vale <strong>0 ou 1</strong>,
e nada além disso.</p>
<p class="mb-3">Um bit sozinho não diz muito. Junte oito e você tem um
<strong>byte</strong>, e um byte já dá para guardar uma letra. O "A" desta
frase é um byte. A palavra "clube" são cinco.</p>

<div class="p-3 rounded-lg mt-4 mb-4" style="background: rgba(59,130,246,.12)">
<p class="text-sm"><strong>Guarde isto:</strong> bit é o 0 ou 1. Byte são oito
bits, e dá mais ou menos uma letra. Tudo o que vem depois é multiplicar byte.</p>
</div>

<h3 class="font-bold mt-4 mb-2">A escala, de baixo para cima</h3>
<p class="mb-3">Cada degrau multiplica o anterior por aproximadamente mil:</p>
<ul class="list-disc pl-5 mb-3 space-y-1">
<li><strong>Kilobyte (KB)</strong> — cerca de mil bytes. Uma mensagem de texto,
um bilhete, uma página escrita sem imagem.</li>
<li><strong>Megabyte (MB)</strong> — cerca de mil kilobytes. Uma foto do
celular tem 3 a 5 MB. Uma música tem uns 5 MB.</li>
<li><strong>Gigabyte (GB)</strong> — cerca de mil megabytes. Um filme tem 1 a
3 GB. O pacote de internet do celular se conta em GB.</li>
<li><strong>Terabyte (TB)</strong> — cerca de mil gigabytes. O HD externo onde
o clube guarda as fotos de dez acampamentos.</li>
</ul>
<p class="mb-3">Uma forma de sentir o tamanho: se um byte fosse um grão de
arroz, um kilobyte seria uma colherada, um megabyte um saco de cinco quilos,
um gigabyte um caminhão e um terabyte mil caminhões.</p>

<h3 class="font-bold mt-4 mb-2">Por que isso serve para alguma coisa</h3>
<p class="mb-3">Serve para responder <em>cabe?</em> — que é a pergunta que
aparece na hora de mandar as fotos do acampamento, de gravar o vídeo da
formatura ou de escolher um pendrive.</p>
<p class="mb-3">Se o e-mail aceita anexo de até 25 MB e cada foto tem 4 MB,
cabem seis. A sétima não vai. Quem sabe a escala descobre isso antes de
tentar; quem não sabe descobre depois de a mensagem voltar.</p>
`;

const conteudo_L2 = `
<h2 class="text-xl font-bold mb-3">Dois números que quase todo mundo lê errado</h2>
<p class="mb-3">A escala é simples. O que confunde são duas armadilhas — e as
duas aparecem na vida do clube toda semana.</p>

<h3 class="font-bold mt-4 mb-2">Primeira: "internet de 100 megas" não é 100 MB</h3>
<p class="mb-3">Velocidade de internet se mede em <strong>megabits</strong> por
segundo, escrito <strong>Mb/s</strong>, com <em>b</em> minúsculo. Tamanho de
arquivo se mede em <strong>megabytes</strong>, escrito <strong>MB</strong>, com
<em>B</em> maiúsculo.</p>
<p class="mb-3">Como um byte tem oito bits, é só dividir por oito:</p>
<ul class="list-disc pl-5 mb-3 space-y-1">
<li>100 Mb/s ÷ 8 = <strong>12,5 MB por segundo</strong>.</li>
<li>Um filme de 2 GB, nessa conexão: uns dois minutos e meio.</li>
</ul>
<p class="mb-3">Não é propaganda enganosa, e não é o roteador estragado: é
outra unidade. A letra maiúscula ou minúscula é a diferença inteira, e é por
isso que ela não é detalhe.</p>

<h3 class="font-bold mt-4 mb-2">Segunda: o pendrive de 64 GB que mostra 59,6</h3>
<p class="mb-3">Você compra um pendrive de 64 GB, espeta no computador, e ele
diz <strong>59,6 GB</strong>. Faltaram quatro gigabytes.</p>
<p class="mb-3">Não faltaram. O fabricante conta de <strong>mil em mil</strong>:
para ele, 1 GB são 1.000.000.000 bytes. O sistema conta de
<strong>1024 em 1024</strong>, porque 1024 é a conta redonda no mundo dos bits.
O pendrive tem exatamente o que promete — os dois estão medindo a mesma coisa
com réguas diferentes.</p>
<p class="mb-3">A diferença cresce com o tamanho: num pendrive de 64 GB some
uns 7%; num HD de 1 TB, o sistema mostra 931 GB.</p>

<div class="p-3 rounded-lg mt-4" style="background: rgba(234,179,8,.12)">
<p class="text-sm"><strong>Na hora de comprar:</strong> nenhum dos dois está
mentindo. Só espere ver menos do que a caixa diz, e não devolva o pendrive por
causa disso.</p>
</div>
`;

export const modulo1: Module = {
  code: 'AP044.1',
  title: 'Do bit ao terabyte',
  description: 'A escala inteira, de 0 ou 1 até o HD do clube — e as duas armadilhas que fazem todo mundo ler o número errado.',
  lessons: [
    {
      code: 'AP044.1-L1',
      title: 'Bit, byte e a escala',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP044-2.1', 'AP044-2.2', 'AP044-2.3', 'AP044-2.4', 'AP044-2.5'],
      perguntas: 6,
      questions: [
        {
          id: 'AP044.1-L1-Q1', type: 'multiple_choice',
          prompt: 'O que é um bit?',
          data: { options: [
            { id: 'a', text: 'A menor informação do computador: vale 0 ou 1, e nada além disso.', correct: true },
            { id: 'b', text: 'Um pedaço de arquivo do tamanho de uma letra, usado para medir texto.',
              porque: 'Isso é o byte, que tem oito bits. O bit sozinho não chega a uma letra.' },
            { id: 'c', text: 'A velocidade com que o processador executa uma instrução por segundo.',
              porque: 'Velocidade de processador se mede em hertz. Bit é unidade de informação, não de tempo.' },
            { id: 'd', text: 'Um pedaço de memória reservado pelo sistema para um programa aberto.',
              porque: 'Isso é alocação de memória, e ela se mede em bytes. O bit é a unidade, não a reserva.' },
          ]},
          explanation: 'Ligado ou desligado. É a única coisa que a máquina distingue, e todo o resto é feito disso.',
        },
        {
          id: 'AP044.1-L1-Q2', type: 'multiple_choice',
          prompt: 'Quantos bits tem um byte, e o que cabe num byte?',
          data: { options: [
            { id: 'a', text: 'Oito bits, e dá mais ou menos uma letra.', correct: true },
            { id: 'b', text: 'Dez bits, e dá mais ou menos uma palavra curta de texto.',
              porque: 'São oito, e não dez — e uma palavra curta leva vários bytes, um por letra.' },
            { id: 'c', text: 'Mil bits, e dá mais ou menos uma linha inteira escrita.',
              porque: 'Mil é o salto para o kilobyte, e ele parte do byte, não do bit.' },
            { id: 'd', text: 'Um bit só, porque byte é apenas outro nome para a mesma coisa.',
              porque: 'São unidades diferentes: é justamente essa confusão que faz ler errado a velocidade da internet.' },
          ]},
          explanation: 'Oito bits, uma letra. Daí para cima é só multiplicar.',
        },
        {
          id: 'AP044.1-L1-Q3', type: 'ordering',
          prompt: 'Ponha as unidades em ordem, da menor para a maior.',
          data: { items: [
            { id: 'i1', text: 'Bit', order: 1 },
            { id: 'i2', text: 'Byte', order: 2 },
            { id: 'i3', text: 'Kilobyte', order: 3 },
            { id: 'i4', text: 'Megabyte', order: 4 },
            { id: 'i5', text: 'Gigabyte', order: 5 },
            { id: 'i6', text: 'Terabyte', order: 6 },
          ]},
          explanation: 'Cada degrau multiplica o anterior por cerca de mil, a partir do byte.',
        },
        {
          id: 'AP044.1-L1-Q4', type: 'multiple_choice',
          prompt: 'Uma foto do celular tem uns 4 MB. Em que unidade se mede um filme inteiro?',
          data: { options: [
            { id: 'a', text: 'Em gigabytes: um filme tem de 1 a 3 GB.', correct: true },
            { id: 'b', text: 'Em kilobytes, porque vídeo é compactado e ocupa menos que foto.',
              porque: 'Vídeo é compactado, sim, mas são milhares de imagens seguidas: dá gigabytes, não kilobytes.' },
            { id: 'c', text: 'Em terabytes, porque filme é o arquivo mais pesado que existe.',
              porque: 'Terabyte é a medida do HD que guarda centenas de filmes, e não a de um filme.' },
            { id: 'd', text: 'Em bits, porque vídeo se mede pela velocidade com que passa.',
              porque: 'Bit por segundo mede transmissão. O tamanho do arquivo guardado se mede em bytes.' },
          ]},
          explanation: 'Foto em megabytes, filme em gigabytes, disco em terabytes. É a escala do dia a dia.',
        },
        {
          id: 'AP044.1-L1-Q5', type: 'multiple_choice',
          prompt: 'O e-mail aceita anexo de até 25 MB e cada foto do acampamento tem 4 MB. Quantas cabem numa mensagem?',
          data: { options: [
            { id: 'a', text: 'Seis, porque a sétima passaria de 25 MB.', correct: true },
            { id: 'b', text: 'Vinte e cinco, porque o limite conta arquivos e não o tamanho deles.',
              porque: 'O limite é de tamanho somado, não de quantidade: 25 MB é o teto do total.' },
            { id: 'c', text: 'Todas, porque o serviço compacta as fotos automaticamente ao anexar.',
              porque: 'Anexo vai como está. Quem quiser reduzir precisa comprimir antes de anexar.' },
            { id: 'd', text: 'Quatro, porque o limite vale para cada arquivo separadamente.',
              porque: 'Se valesse por arquivo, cada foto de 4 MB caberia e não haveria limite prático de quantidade.' },
          ]},
          explanation: 'Seis vezes 4 são 24, e sobra 1 MB. A sétima estoura — e é essa conta que evita a mensagem que volta.',
        },
        {
          id: 'AP044.1-L1-Q6', type: 'true_false',
          prompt: 'Um gigabyte é aproximadamente mil megabytes.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso', porque: 'É verdadeiro: cada degrau da escala multiplica o anterior por cerca de mil.' },
          ]},
          explanation: 'KB, MB, GB, TB: mil em mil, degrau por degrau.',
        },
        {
          id: 'AP044.1-L1-Q7', type: 'multiple_choice',
          prompt: 'Por que a escala é útil na prática, e não só para responder prova?',
          data: { options: [
            { id: 'a', text: 'Porque ela responde "cabe?" antes de tentar mandar, gravar ou comprar.', correct: true },
            { id: 'b', text: 'Porque ela permite calcular quanto tempo o computador vai levar para ligar.',
              porque: 'O tempo de ligar depende do disco e do sistema, e não da unidade em que se mede o arquivo.' },
            { id: 'c', text: 'Porque ela diz a qualidade do arquivo: quanto maior, melhor ele é.',
              porque: 'Tamanho não é qualidade — uma foto mal tirada pode ser enorme, e uma boa pode ser leve.' },
            { id: 'd', text: 'Porque ela é exigida para instalar qualquer programa novo no computador.',
              porque: 'Instalar não pede conta nenhuma de quem instala: o programa informa o espaço que precisa.' },
          ]},
          explanation: '"Cabe no pendrive?", "cabe no anexo?", "cabe no pacote de dados?" — é sempre a mesma pergunta.',
        },
        {
          id: 'AP044.1-L1-Q8', type: 'multiple_choice',
          prompt: 'Alguém diz que uma mensagem de texto sem imagem ocupa uns 2 MB. O que está errado nisso?',
          data: { options: [
            { id: 'a', text: 'Texto puro se mede em kilobytes: 2 MB dariam mais de um livro de texto.', correct: true },
            { id: 'b', text: 'Nada está errado, porque toda mensagem carrega o aplicativo junto.',
              porque: 'A mensagem carrega o texto dela, e não o programa que a exibe.' },
            { id: 'c', text: 'Está errado porque texto não ocupa espaço nenhum, já que não tem imagem.',
              porque: 'Ocupa sim: cada letra é um byte. É pouco, mas não é zero.' },
            { id: 'd', text: 'Está errado porque mensagem de texto se mede em bits, e não em bytes.',
              porque: 'Bit por segundo mede transmissão; o que está guardado se mede em bytes.' },
          ]},
          explanation: 'Uma letra é um byte. Dois megabytes de letras seriam uns dois milhões de caracteres.',
        },
        {
          id: 'AP044.1-L1-Q9', type: 'matching',
          prompt: 'Ligue cada coisa à unidade em que ela costuma ser medida.',
          data: { pairs: [
            { left: 'Uma letra digitada', right: 'Byte' },
            { left: 'Um bilhete de texto sem imagem', right: 'Kilobyte' },
            { left: 'Uma foto do celular', right: 'Megabyte' },
            { left: 'Um filme', right: 'Gigabyte' },
            { left: 'O HD externo do clube', right: 'Terabyte' },
          ]},
          explanation: 'É a escala em objetos do dia a dia — que é como ela realmente se usa.',
        },
      ],
    },
    {
      code: 'AP044.1-L2',
      title: 'Os dois números que enganam',
      type: 'theory',
      content: conteudo_L2,
      requirementCodes: ['AP044-2.1', 'AP044-2.2', 'AP044-2.3', 'AP044-2.4', 'AP044-2.5'],
      perguntas: 5,
      questions: [
        {
          id: 'AP044.1-L2-Q1', type: 'multiple_choice',
          prompt: 'A internet do clube é de 100 megas. Quantos megabytes por segundo ela baixa, no máximo?',
          data: { options: [
            { id: 'a', text: 'Uns 12,5 MB/s, porque 100 megabits divididos por oito dão 12,5 megabytes.', correct: true },
            { id: 'b', text: '100 MB/s, porque o número contratado é o número que chega.',
              porque: 'O número contratado é em megabits. Um megabyte tem oito megabits, então divide-se por oito.' },
            { id: 'c', text: '800 MB/s, porque cada mega contratado vale oito megabytes na prática.',
              porque: 'A conta é ao contrário: multiplica-se por oito para ir de byte a bit, e divide-se para voltar.' },
            { id: 'd', text: '10 MB/s, porque a operadora sempre entrega dez por cento do contratado.',
              porque: 'A diferença não é desconto da operadora: é conversão entre duas unidades diferentes.' },
          ]},
          explanation: 'Mb/s com b minúsculo é bit. MB com B maiúsculo é byte. Oito de um fazem um do outro.',
        },
        {
          id: 'AP044.1-L2-Q2', type: 'multiple_choice',
          prompt: 'O pendrive diz 64 GB e o computador mostra 59,6 GB. O que aconteceu?',
          data: { options: [
            { id: 'a', text: 'O fabricante conta de mil em mil e o sistema conta de 1024 em 1024.', correct: true },
            { id: 'b', text: 'O pendrive veio com defeito e perdeu parte do espaço de fábrica.',
              porque: 'Todos os pendrives da mesma capacidade mostram o mesmo número — não é defeito de um.' },
            { id: 'c', text: 'O sistema reservou quatro gigabytes para os arquivos dele próprio.',
              porque: 'O sistema não instala nada num pendrive vazio. A diferença aparece antes de gravar qualquer coisa.' },
            { id: 'd', text: 'A loja vendeu um pendrive menor com a etiqueta trocada.',
              porque: 'A conta bate exatamente com a diferença entre as duas réguas — não é etiqueta trocada.' },
          ]},
          explanation: 'Duas réguas para a mesma coisa. O pendrive tem o que promete; muda quem está medindo.',
        },
        {
          id: 'AP044.1-L2-Q3', type: 'multiple_choice',
          prompt: 'Por que a diferença entre MB e Mb importa mais do que parece?',
          data: { options: [
            { id: 'a', text: 'Porque só a letra maiúscula ou minúscula separa tamanho de velocidade.', correct: true },
            { id: 'b', text: 'Porque a unidade errada faz o arquivo ser gravado com defeito no disco.',
              porque: 'A unidade é forma de medir: escrevê-la errado não estraga arquivo nenhum.' },
            { id: 'c', text: 'Porque a operadora cobra a mais de quem confunde as duas na hora de contratar.',
              porque: 'A cobrança segue o plano contratado. O que a confusão causa é expectativa errada, não cobrança.' },
            { id: 'd', text: 'Porque o computador recusa arquivos cuja unidade não esteja escrita corretamente.',
              porque: 'O computador não lê a etiqueta que a pessoa escreveu: ele mede sozinho.' },
          ]},
          explanation: 'Uma letra de diferença, e um fator de oito entre as duas leituras.',
        },
        {
          id: 'AP044.1-L2-Q4', type: 'true_false',
          prompt: 'Um HD anunciado como 1 TB aparecerá no computador com menos de 1 TB, e isso é normal.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso', porque: 'É verdadeiro: ele aparece com uns 931 GB, pela diferença entre contar de mil em mil e de 1024 em 1024.' },
          ]},
          explanation: 'Quanto maior o disco, maior a diferença — e ela nunca é defeito.',
        },
        {
          id: 'AP044.1-L2-Q5', type: 'multiple_choice',
          prompt: 'Um filme de 2 GB, numa conexão de 100 Mb/s, leva quanto tempo para baixar?',
          data: { options: [
            { id: 'a', text: 'Uns dois minutos e meio, porque a conexão entrega uns 12,5 MB por segundo.', correct: true },
            { id: 'b', text: 'Uns vinte segundos, porque 2 GB divididos por 100 megas dão vinte.',
              porque: 'Essa conta mistura gigabytes com megabits. É preciso pôr os dois na mesma unidade primeiro.' },
            { id: 'c', text: 'Umas duas horas, porque filme sempre demora muito mais do que o cálculo indica.',
              porque: 'Pode haver perda, mas não dessa ordem: a conta dá minutos, e não horas.' },
            { id: 'd', text: 'Não dá para calcular, porque velocidade de internet não tem relação com tamanho de arquivo.',
              porque: 'Tem relação direta: tempo é tamanho dividido por velocidade, com as duas na mesma unidade.' },
          ]},
          explanation: '2 GB são uns 2000 MB; divididos por 12,5 MB/s dão uns 160 segundos.',
        },
        {
          id: 'AP044.1-L2-Q6', type: 'multiple_choice',
          prompt: 'Numa loja, o vendedor diz que o HD de 1 TB "na verdade só tem 931 GB porque o resto é do sistema". O que responder?',
          data: { options: [
            { id: 'a', text: 'Que os 931 GB aparecem num disco vazio, antes de qualquer sistema ser instalado.', correct: true },
            { id: 'b', text: 'Que ele está certo, e por isso convém comprar sempre o tamanho acima do necessário.',
              porque: 'Ele não está certo: a diferença aparece antes de instalar nada, e é de medida.' },
            { id: 'c', text: 'Que o sistema realmente ocupa 69 GB, e por isso o número bate.',
              porque: 'Um sistema ocupa bem menos, e a diferença aparece igual num disco onde nada foi instalado.' },
            { id: 'd', text: 'Que o disco deveria ser devolvido, porque o anúncio não corresponde ao conteúdo.',
              porque: 'O disco tem o que anuncia. O que muda é a régua com que cada lado conta.' },
          ]},
          explanation: 'Espete um HD novo e vazio: os 931 GB já estão lá. Sistema nenhum foi instalado ainda.',
        },
        {
          id: 'AP044.1-L2-Q7', type: 'multiple_choice',
          prompt: 'Por que o computador conta de 1024 em 1024 em vez de mil em mil?',
          data: { options: [
            { id: 'a', text: 'Porque 1024 é a conta redonda quando se conta com bits, que só têm dois valores.', correct: true },
            { id: 'b', text: 'Porque 1024 sobrou de um erro antigo que ninguém se deu ao trabalho de corrigir.',
              porque: 'Não é erro: é o número redondo natural de um sistema que só distingue 0 e 1.' },
            { id: 'c', text: 'Porque os fabricantes de disco pediram esse número para vender mais.',
              porque: 'Os fabricantes usam justamente o outro, mil, que lhes dá um número maior na caixa.' },
            { id: 'd', text: 'Porque 1024 é o maior número que o computador consegue guardar de uma vez.',
              porque: 'Ele guarda números muitíssimo maiores. 1024 é redondo em base dois, e nada além disso.' },
          ]},
          explanation: 'No mundo de 0 e 1, os números redondos são 2, 4, 8, 16… e 1024. Mil não é redondo lá.',
        },
        {
          id: 'AP044.1-L2-Q8', type: 'true_false',
          prompt: 'Uma conexão de 200 Mb/s baixa o dobro de megabytes por segundo que uma de 100 Mb/s.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso', porque: 'É verdadeiro: a conversão divide os dois por oito, e a proporção entre eles se mantém.' },
          ]},
          explanation: 'Dividir os dois por oito não muda qual é o dobro de qual.',
        },
      ],
    },
  ],
};
