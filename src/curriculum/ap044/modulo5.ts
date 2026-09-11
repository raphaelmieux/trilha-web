import type { Module } from '../../types';

/*
 * AP044 módulo 5 — o requisito 8: filtros, congelar e gráfico.
 *
 * Três itens, e os três são a mesma ideia aplicada a partes diferentes: deixar
 * de olhar a planilha inteira toda vez.
 *
 * ── Filtro esconde, e não apaga ──────────────────────────────────────────
 * É o mal-entendido que custa caro. A pessoa filtra por "unidade Falcão", vê
 * doze linhas, e conclui que as outras sumiram. Aí salva, manda por e-mail, e
 * jura que a planilha tem doze linhas. Tem cento e vinte — as outras estão
 * escondidas, e voltam quando o filtro sai.
 *
 * A consequência séria é a soma: com filtro aplicado, `SOMA` continua somando
 * tudo, inclusive o que está escondido. Quem não sabe disso lê um total que
 * não corresponde ao que está vendo na tela.
 *
 * ── Congelar é de tela, e não de dado ────────────────────────────────────
 * Congelar a primeira linha não muda a planilha: muda o que fica parado
 * enquanto o resto rola. Não vai junto para o PDF nem altera cálculo nenhum.
 * Vale dizer isso porque "congelar" soa como travar contra edição, e não é.
 *
 * ── E o gráfico é uma leitura, e não uma decoração ───────────────────────
 * O requisito só pede criar um gráfico. Criar é fácil; escolher o tipo certo é
 * a lição — pizza para partes de um todo, barra para comparar, linha para
 * evolução no tempo. Pizza com quinze fatias e linha ligando três unidades que
 * não têm ordem entre si são os dois erros que aparecem sempre.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">Parar de olhar a planilha inteira</h2>
<p class="mb-3">A planilha de inscritos do acampamento tem cento e vinte linhas.
Você precisa ver só as da unidade Falcão. Rolar procurando com o olho funciona —
até a segunda vez que alguém pedir.</p>

<h3 class="font-bold mt-4 mb-2">Filtro: esconder o que não interessa agora</h3>
<p class="mb-3">O <strong>filtro</strong> põe uma setinha no cabeçalho de cada
coluna. Clicando nela, você escolhe o que quer ver — e a planilha passa a
mostrar só as linhas que atendem à escolha.</p>
<p class="mb-3">Duas coisas que precisam ficar claras:</p>
<ul class="list-disc pl-5 mb-3 space-y-1">
<li><strong>Filtro esconde, não apaga.</strong> As outras cento e oito linhas
continuam lá. Tirando o filtro, todas voltam.</li>
<li><strong>A soma não se importa com o filtro.</strong> Uma célula com
<code>=SOMA(C2:C121)</code> continua somando as cento e vinte, inclusive as
escondidas. O que você vê na tela e o total mostrado podem não bater — e isso
não é defeito, é o comportamento.</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Congelar: manter o cabeçalho à vista</h3>
<p class="mb-3">Ao rolar para a linha 80, o cabeçalho já saiu da tela e as
colunas viram letras sem nome: você não sabe mais se aquela coluna é "diárias"
ou "inscritos".</p>
<p class="mb-3"><strong>Congelar</strong> a primeira linha prende o cabeçalho no
alto: o resto rola por baixo dele. Dá para congelar a primeira coluna também,
quando a tabela é larga e o nome da pessoa some pela esquerda.</p>
<p class="mb-3">Congelar é <strong>coisa de tela</strong>. Não muda dado nenhum,
não trava célula contra edição e não aparece no PDF. É só o que fica parado
enquanto se rola.</p>

<h3 class="font-bold mt-4 mb-2">Gráfico: escolher o tipo antes de escolher a cor</h3>
<p class="mb-3">Criar o gráfico é selecionar os dados e escolher. O que separa
um gráfico bom de um ruim é o tipo — e o tipo sai da pergunta que se está
respondendo:</p>
<ul class="list-disc pl-5 mb-3 space-y-1">
<li><strong>Partes de um todo</strong> ("quanto cada unidade representa do
total") — pizza, e com poucas fatias.</li>
<li><strong>Comparar quantidades</strong> ("qual unidade levou mais gente") —
barras ou colunas.</li>
<li><strong>Evolução no tempo</strong> ("como a inscrição cresceu mês a mês") —
linha.</li>
</ul>
<p class="mb-3">Os dois erros que mais aparecem: pizza com quinze fatias, onde
não se distingue nada; e linha ligando três unidades diferentes, como se
"Falcão, Águia, Tucano" fossem uma sequência no tempo. Linha só faz sentido
quando o eixo tem ordem.</p>
<p class="mb-3">E todo gráfico entregue precisa de <strong>título</strong> e de
<strong>eixos identificados</strong>. Sem isso ele é um desenho bonito que não
afirma nada.</p>

<div class="p-3 rounded-lg mt-4" style="background: rgba(234,179,8,.12)">
<p class="text-sm"><strong>A pergunta que resolve o tipo:</strong> "eu quero
mostrar composição, comparação ou evolução?" Respondeu, escolheu.</p>
</div>
`;

export const modulo5: Module = {
  code: 'AP044.5',
  title: 'A planilha que filtra e desenha',
  description: 'Filtro que esconde sem apagar, cabeçalho congelado, e o gráfico cujo tipo sai da pergunta.',
  lessons: [
    {
      code: 'AP044.5-L1',
      title: 'Filtro, congelar e o tipo de gráfico',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP044-8.1', 'AP044-8.2', 'AP044-8.3'],
      perguntas: 5,
      questions: [
        {
          id: 'AP044.5-L1-Q1', type: 'multiple_choice',
          prompt: 'Você filtra a planilha por "unidade Falcão" e passam a aparecer doze linhas. O que aconteceu com as outras?',
          data: { options: [
            { id: 'a', text: 'Continuam na planilha, escondidas — e voltam quando o filtro for retirado.', correct: true },
            { id: 'b', text: 'Foram apagadas, e é por isso que convém salvar uma cópia antes de filtrar.',
              porque: 'Filtro nunca apaga linha. A cópia é boa prática, mas não por causa disso.' },
            { id: 'c', text: 'Foram movidas para uma segunda aba, criada automaticamente pelo programa.',
              porque: 'Nenhuma aba é criada: as linhas continuam onde estavam, apenas ocultas.' },
            { id: 'd', text: 'Continuam visíveis, mas em cinza-claro, no fim da planilha.',
              porque: 'Elas somem da vista por inteiro. Não há marcação em cinza.' },
          ]},
          explanation: 'Esconder não é apagar. Tire o filtro e as cento e oito voltam.',
        },
        {
          id: 'AP044.5-L1-Q2', type: 'multiple_choice',
          prompt: 'Com o filtro aplicado, uma célula com =SOMA de toda a coluna mostra um total maior do que a soma do que está na tela. Por quê?',
          data: { options: [
            { id: 'a', text: 'Porque a soma continua contando as linhas escondidas pelo filtro.', correct: true },
            { id: 'b', text: 'Porque a fórmula está errada e precisa ser reescrita depois de filtrar.',
              porque: 'A fórmula está certa: ela soma o intervalo que lhe foi dado, filtro ou não.' },
            { id: 'c', text: 'Porque o programa arredonda o total quando há filtro aplicado.',
              porque: 'Não há arredondamento nenhum: a diferença é o que está escondido.' },
            { id: 'd', text: 'Porque as linhas escondidas passam a valer o dobro no cálculo.',
              porque: 'Elas valem exatamente o que valiam. O que muda é apenas o que se vê.' },
          ]},
          explanation: 'É a armadilha do filtro: o que se vê e o que se soma podem ser conjuntos diferentes.',
        },
        {
          id: 'AP044.5-L1-Q3', type: 'multiple_choice',
          prompt: 'Para que serve congelar a primeira linha?',
          data: { options: [
            { id: 'a', text: 'Para o cabeçalho ficar parado no alto enquanto o resto da planilha rola.', correct: true },
            { id: 'b', text: 'Para impedir que alguém altere o conteúdo das células do cabeçalho.',
              porque: 'Isso é proteger a célula, que é outro recurso. Congelar não trava edição.' },
            { id: 'c', text: 'Para que o cabeçalho se repita no topo de cada página impressa.',
              porque: 'Isso é "linhas a repetir na impressão", e é outro ajuste — congelar é só de tela.' },
            { id: 'd', text: 'Para fixar a ordem das linhas, impedindo que a ordenação as embaralhe.',
              porque: 'Ordenar continua funcionando normalmente com o painel congelado.' },
          ]},
          explanation: 'É coisa de tela: nada muda no dado, no cálculo ou no PDF.',
        },
        {
          id: 'AP044.5-L1-Q4', type: 'multiple_choice',
          prompt: 'Você quer mostrar como a inscrição do acampamento cresceu de janeiro a junho. Que gráfico usar?',
          data: { options: [
            { id: 'a', text: 'Linha, porque o eixo tem ordem no tempo e a pergunta é de evolução.', correct: true },
            { id: 'b', text: 'Pizza, porque cada mês é uma parte do total de inscritos do semestre.',
              porque: 'Pizza responde composição. Ela não mostra que março veio depois de fevereiro.' },
            { id: 'c', text: 'Barras, porque barras servem para qualquer tipo de dado numérico.',
              porque: 'Barras comparam bem, mas a linha mostra a subida e a descida entre os pontos.' },
            { id: 'd', text: 'Dispersão, porque há dois valores relacionados em cada ponto.',
              porque: 'Dispersão serve para relacionar duas variáveis medidas, e não para série no tempo.' },
          ]},
          explanation: 'Composição, comparação ou evolução: a pergunta escolhe o tipo.',
        },
        {
          id: 'AP044.5-L1-Q5', type: 'multiple_choice',
          prompt: 'Por que ligar "Falcão, Águia, Tucano" com um gráfico de linha é um erro?',
          data: { options: [
            { id: 'a', text: 'Porque a linha sugere uma sequência, e três unidades não têm ordem entre si.', correct: true },
            { id: 'b', text: 'Porque gráfico de linha só aceita valores numéricos no eixo horizontal.',
              porque: 'O programa aceita nomes ali sem reclamar — o problema é de leitura, não de aceitação.' },
            { id: 'c', text: 'Porque com apenas três pontos o gráfico de linha fica visualmente pobre.',
              porque: 'Três pontos numa série de tempo ficam bem. O problema é não haver série nenhuma.' },
            { id: 'd', text: 'Porque unidades do clube devem sempre ser comparadas por pizza.',
              porque: 'Comparar quantidades pede barras. Pizza é para partes de um todo.' },
          ]},
          explanation: 'A linha entre dois pontos afirma "daqui foi para ali". Entre unidades, isso não quer dizer nada.',
        },
        {
          id: 'AP044.5-L1-Q6', type: 'true_false',
          prompt: 'Um gráfico entregue precisa de título e de eixos identificados.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso', porque: 'É verdadeiro: sem eles o gráfico é um desenho que não afirma nada, e quem lê precisa adivinhar o que está medido.' },
          ]},
          explanation: 'Sem título e sem eixo, ninguém sabe o que os números são.',
        },
        {
          id: 'AP044.5-L1-Q7', type: 'matching',
          prompt: 'Ligue cada pergunta ao gráfico que a responde.',
          data: { pairs: [
            { left: 'Quanto cada unidade representa do total', right: 'Pizza' },
            { left: 'Qual unidade levou mais gente', right: 'Barras' },
            { left: 'Como a inscrição cresceu mês a mês', right: 'Linha' },
          ]},
          explanation: 'Composição, comparação, evolução. É a escolha inteira.',
        },
        {
          id: 'AP044.5-L1-Q8', type: 'multiple_choice',
          prompt: 'Por que uma pizza com quinze fatias é um gráfico ruim?',
          data: { options: [
            { id: 'a', text: 'Porque com tantas fatias não se distingue o tamanho de uma para a outra.', correct: true },
            { id: 'b', text: 'Porque o programa não consegue desenhar mais de dez fatias por vez.',
              porque: 'Ele desenha quantas houver. O limite é do olho de quem lê, não do programa.' },
            { id: 'c', text: 'Porque pizza só pode ser usada quando os valores somam exatamente cem.',
              porque: 'O programa calcula a proporção sozinho, qualquer que seja o total.' },
            { id: 'd', text: 'Porque quinze cores diferentes deixam o arquivo pesado demais.',
              porque: 'Peso de arquivo não tem nada a ver: o problema é a leitura ficar impossível.' },
          ]},
          explanation: 'Pizza serve para poucas partes. Com quinze, barras mostram melhor.',
        },
      ],
    },
    {
      code: 'AP044.5-L2',
      title: 'Filtrando e desenhando as inscrições',
      type: 'lab',
      content: '',
      requirementCodes: ['AP044-8.1', 'AP044-8.2', 'AP044-8.3'],
      labType: 'planilha_avancada',
    },
  ],
};
