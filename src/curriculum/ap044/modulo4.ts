import type { Module } from '../../types';

/*
 * AP044 módulo 4 — os nove itens do requisito 7, num editor de texto.
 *
 * É o requisito mais longo da trilha, e o que melhor explica o que ela é. Os
 * nove itens parecem nove truques soltos — sobrescrito, realce, colunas, nota
 * de rodapé —, e não são: sete deles existem porque alguém decidiu **descrever
 * o papel** de cada pedaço de texto em vez de pintá-lo à mão.
 *
 * ── O estilo é a lição, e o sumário é a prova ────────────────────────────
 * Aplicar "Título 1" e aplicar negrito 16 produzem a mesma coisa na tela. Só
 * que o segundo não diz nada ao programa, e por isso:
 *
 *   - mudar a aparência de todos os títulos vira trabalho de achar um por um;
 *   - o sumário automático sai vazio, porque não há nada marcado como título.
 *
 * É por isso que o sumário fecha a lista: ele é a consequência visível de ter
 * usado estilo, e não um recurso à parte. Quem pintou tudo à mão descobre isso
 * exatamente na hora de gerar o sumário — e aí é tarde.
 *
 * ── Colar é uma escolha, e quase ninguém sabe que é ──────────────────────
 * Os itens b) e c) pedem colar mantendo a formatação e colar com a do destino.
 * O desbravador cola do site para o documento e o texto chega com fundo
 * cinza, fonte errada e tamanho errado — e conclui que "o Word estragou". Não
 * estragou: ele fez o que se pediu, que foi trazer tudo. A outra opção estava
 * ali, no mesmo menu.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">Pintar à mão contra descrever o papel</h2>
<p class="mb-3">Você quer que o título do relatório fique grande e em negrito.
Há dois caminhos, e na tela eles terminam iguais:</p>
<ul class="list-disc pl-5 mb-3 space-y-1">
<li><strong>Pintar à mão:</strong> selecionar, clicar em negrito, aumentar para
16.</li>
<li><strong>Aplicar um estilo:</strong> selecionar e escolher "Título 1".</li>
</ul>
<p class="mb-3">A diferença aparece depois. No primeiro caso o programa sabe que
ali há letras grandes e negrito. No segundo ele sabe que <strong>ali existe um
título</strong> — e é essa informação que faz o resto funcionar.</p>

<h3 class="font-bold mt-4 mb-2">Três coisas que só o estilo dá</h3>
<ul class="list-disc pl-5 mb-3 space-y-1">
<li><strong>Mudar tudo de uma vez.</strong> Alterou o estilo "Título 1"? Os
dezoito títulos do documento mudam juntos. Pintado à mão, são dezoito
seleções.</li>
<li><strong>Sumário automático.</strong> O programa monta a lista dos títulos e
das páginas sozinho — porque ele sabe quais parágrafos são títulos.</li>
<li><strong>Consistência.</strong> Ninguém erra o tamanho no décimo título, já
que ninguém digita tamanho nenhum.</li>
</ul>
<p class="mb-3">Os estilos vêm em família: <strong>Título 1</strong> para os
capítulos, <strong>Título 2</strong> para as seções dentro deles, e assim por
diante. É essa hierarquia que o sumário lê para saber o que fica dentro do quê.</p>
<p class="mb-3">E não são só títulos. <strong>Ênfase</strong> é o estilo para
destacar uma palavra; <strong>Citação</strong> é o estilo do trecho copiado de
outro autor, que costuma vir recuado. Marcar como citação diz o que aquilo é;
pôr itálico à mão diz só que está inclinado.</p>

<h3 class="font-bold mt-4 mb-2">Colar é uma escolha</h3>
<p class="mb-3">Você copia um trecho de um site e cola no relatório. O texto
chega com fundo cinza, fonte diferente e tamanho errado, e parece que o
programa estragou tudo.</p>
<p class="mb-3">Ele não estragou: fez o que se pediu. Colar tem pelo menos duas
formas, e o menu de colar deixa escolher:</p>
<ul class="list-disc pl-5 mb-3 space-y-1">
<li><strong>Manter a formatação original</strong> — traz o texto com a
aparência que ele tinha na origem. Útil quando se quer preservar uma tabela ou
um destaque que veio de lá.</li>
<li><strong>Usar a formatação do destino</strong> — o texto entra vestido como
o documento em que está entrando. É o que se quer em nove de cada dez vezes.</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Os outros recursos, e para que servem</h3>
<ul class="list-disc pl-5 mb-3 space-y-1">
<li><strong>Sobrescrito e subscrito</strong> — o número pequeno em cima
(m², 1º) e embaixo (H₂O). Não é fonte menor: é uma posição diferente na
linha.</li>
<li><strong>Realce com cor</strong> — o marca-texto. Serve para chamar
atenção enquanto se trabalha; num documento entregue, use com parcimônia, e
nunca como única forma de dizer algo — quem não enxerga cor perde a
informação.</li>
<li><strong>Alternar maiúsculas e minúsculas</strong> — transforma o que já
está escrito sem redigitar. Salva quem escreveu um parágrafo inteiro com o
Caps Lock ligado.</li>
<li><strong>Colunas</strong> — divide a página em duas ou três, como jornal. O
texto flui de uma para a outra sozinho.</li>
<li><strong>Nota de rodapé</strong> — o numerozinho no texto e a explicação no
pé da página. Ela se renumera sozinha quando se insere outra antes.</li>
<li><strong>Sumário</strong> — a lista dos títulos com as páginas, gerada do
que os estilos marcaram.</li>
</ul>

<div class="p-3 rounded-lg mt-4" style="background: rgba(234,179,8,.12)">
<p class="text-sm"><strong>O teste que separa os dois caminhos:</strong> peça um
sumário automático. Quem usou estilos recebe o sumário pronto. Quem pintou à
mão recebe uma lista vazia — e é aí que descobre que o trabalho terá de ser
refeito.</p>
</div>
`;

export const modulo4: Module = {
  code: 'AP044.4',
  title: 'O texto que se formata sozinho',
  description: 'Estilo em vez de negrito à mão, colar como escolha, e o sumário que se gera do que já foi marcado.',
  lessons: [
    {
      code: 'AP044.4-L1',
      title: 'Estilo, e por que ele muda tudo',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP044-7.1', 'AP044-7.2', 'AP044-7.3', 'AP044-7.9'],
      perguntas: 6,
      questions: [
        {
          id: 'AP044.4-L1-Q1', type: 'multiple_choice',
          prompt: 'Aplicar o estilo "Título 1" e pôr negrito 16 à mão dão o mesmo resultado na tela. Qual é a diferença real?',
          data: { options: [
            { id: 'a', text: 'Com o estilo, o programa sabe que ali existe um título — e é isso que permite o sumário.', correct: true },
            { id: 'b', text: 'Com o estilo, o texto fica um pouco maior do que com negrito 16 aplicado à mão.',
              porque: 'O tamanho pode ser exatamente o mesmo. A diferença não é aparência.' },
            { id: 'c', text: 'Com negrito à mão, o documento fica mais leve porque não carrega estilos.',
              porque: 'A diferença de tamanho de arquivo é desprezível, e não é ela que importa aqui.' },
            { id: 'd', text: 'Nenhuma: os dois caminhos são equivalentes e a escolha é de gosto.',
              porque: 'São equivalentes só até alguém pedir sumário ou mudar todos os títulos de uma vez.' },
          ]},
          explanation: 'Um pinta a aparência; o outro descreve o papel. Só o segundo o programa consegue usar.',
        },
        {
          id: 'AP044.4-L1-Q2', type: 'multiple_choice',
          prompt: 'Um relatório com dezoito títulos precisa que todos fiquem azuis. Como isso se resolve com estilos?',
          data: { options: [
            { id: 'a', text: 'Alterando o estilo "Título 1" uma vez: os dezoito mudam juntos.', correct: true },
            { id: 'b', text: 'Selecionando os dezoito ao mesmo tempo com a tecla Ctrl e pintando de azul.',
              porque: 'Funciona uma vez, mas o décimo nono título nasce preto. O estilo alcança os que vierem depois.' },
            { id: 'c', text: 'Usando localizar e substituir, trocando a cor de todos os títulos de uma vez.',
              porque: 'Localizar e substituir trabalha com texto, e não com formatação de parágrafo.' },
            { id: 'd', text: 'Não se resolve: cor é sempre aplicada manualmente, título por título.',
              porque: 'Cor faz parte do estilo, e por isso muda com ele.' },
          ]},
          explanation: 'Mudar a descrição num lugar só, e o documento inteiro obedecer. É o ponto inteiro dos estilos.',
        },
        {
          id: 'AP044.4-L1-Q3', type: 'multiple_choice',
          prompt: 'Você gera um sumário automático e ele sai vazio. Qual é a causa mais provável?',
          data: { options: [
            { id: 'a', text: 'Nenhum parágrafo foi marcado como título: tudo foi pintado à mão.', correct: true },
            { id: 'b', text: 'O documento tem poucas páginas, e o sumário só funciona acima de dez.',
              porque: 'Não há mínimo de páginas: com dois títulos marcados, o sumário sai com dois.' },
            { id: 'c', text: 'O sumário precisa ser digitado antes e depois atualizado pelo programa.',
              porque: 'Ele é gerado do zero a partir dos estilos — não há nada para digitar antes.' },
            { id: 'd', text: 'O arquivo foi salvo em PDF, e nesse formato o sumário não aparece.',
              porque: 'O sumário sai vazio dentro do próprio editor, antes de qualquer exportação.' },
          ]},
          explanation: 'O sumário lê os estilos. Sem estilo aplicado, não há o que listar.',
        },
        {
          id: 'AP044.4-L1-Q4', type: 'multiple_choice',
          prompt: 'Você cola um trecho de um site e ele chega com fundo cinza e fonte diferente. O que fazer?',
          data: { options: [
            { id: 'a', text: 'Colar de novo escolhendo "usar a formatação do destino", no menu de colar.', correct: true },
            { id: 'b', text: 'Selecionar o trecho e apagar o fundo cinza manualmente, um parágrafo por vez.',
              porque: 'Resolve o sintoma e leva dez vezes mais tempo — e a fonte errada continua.' },
            { id: 'c', text: 'Copiar de novo do site, porque a primeira cópia veio corrompida.',
              porque: 'A cópia não veio corrompida: ela trouxe a formatação de origem, que é uma das opções.' },
            { id: 'd', text: 'Salvar o documento em PDF, o que descarta a formatação que veio de fora.',
              porque: 'PDF preserva o que está na tela, inclusive o fundo cinza.' },
          ]},
          explanation: 'Colar é uma escolha, e as duas opções estão no mesmo menu.',
        },
        {
          id: 'AP044.4-L1-Q5', type: 'multiple_choice',
          prompt: 'Quando faz sentido colar mantendo a formatação original?',
          data: { options: [
            { id: 'a', text: 'Quando se quer preservar algo que veio da origem, como uma tabela ou um destaque.', correct: true },
            { id: 'b', text: 'Sempre, porque preservar o original é mais respeitoso com o autor do texto.',
              porque: 'Respeito ao autor é citar a fonte, e não copiar a fonte tipográfica dele.' },
            { id: 'c', text: 'Nunca, porque a formatação de origem sempre atrapalha o documento de destino.',
              porque: 'Atrapalha quase sempre, mas não sempre — daí a opção existir.' },
            { id: 'd', text: 'Quando o texto copiado for maior do que uma página inteira.',
              porque: 'O tamanho do trecho não tem relação nenhuma com qual formatação convém.' },
          ]},
          explanation: 'Nove de cada dez vezes se quer a do destino. A décima é quando a de origem carrega algo.',
        },
        {
          id: 'AP044.4-L1-Q6', type: 'multiple_choice',
          prompt: 'O que é o estilo "Citação", e por que usá-lo em vez de itálico à mão?',
          data: { options: [
            { id: 'a', text: 'É o estilo do trecho copiado de outro autor: ele diz o que aquilo é, e não só como se parece.', correct: true },
            { id: 'b', text: 'É o estilo que insere automaticamente a referência bibliográfica no fim do documento.',
              porque: 'A referência é outro recurso. O estilo marca o trecho, e não monta a bibliografia.' },
            { id: 'c', text: 'É um estilo apenas decorativo, que existe para variar a aparência do texto.',
              porque: 'Ele é semântico como os títulos: descreve o papel do parágrafo no documento.' },
            { id: 'd', text: 'É o estilo obrigatório para qualquer texto entre aspas dentro de um parágrafo.',
              porque: 'Citação curta dentro da frase fica entre aspas mesmo. O estilo é para o trecho destacado.' },
          ]},
          explanation: 'Itálico à mão diz "está inclinado". Citação diz "isto é de outro autor".',
        },
        {
          id: 'AP044.4-L1-Q7', type: 'matching',
          prompt: 'Ligue cada recurso ao que ele resolve.',
          data: { pairs: [
            { left: 'Sobrescrito', right: 'O número pequeno em cima, como em m²' },
            { left: 'Alternar maiúsculas', right: 'Consertar o parágrafo escrito com Caps Lock ligado' },
            { left: 'Colunas', right: 'Dividir a página em duas, como jornal' },
            { left: 'Nota de rodapé', right: 'Explicar algo no pé da página, com número no texto' },
            { left: 'Sumário', right: 'Listar os títulos com as páginas, gerado dos estilos' },
          ]},
          explanation: 'Cada um resolve um problema concreto — nenhum deles é enfeite.',
        },
        {
          id: 'AP044.4-L1-Q8', type: 'true_false',
          prompt: 'A nota de rodapé se renumera sozinha quando você insere outra antes dela.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso', porque: 'É verdadeiro: a numeração é do programa, e é por isso que se usa o recurso em vez de digitar o número à mão.' },
          ]},
          explanation: 'É a mesma ideia do sumário: quem numera é o programa, porque ele sabe a ordem.',
        },
        {
          id: 'AP044.4-L1-Q9', type: 'multiple_choice',
          prompt: 'Por que não usar realce colorido como única forma de marcar o que é importante num documento entregue?',
          data: { options: [
            { id: 'a', text: 'Porque quem não enxerga aquela cor perde a informação inteira.', correct: true },
            { id: 'b', text: 'Porque o realce desaparece quando o documento é salvo em PDF.',
              porque: 'O realce vai para o PDF normalmente — ele é parte da aparência da página.' },
            { id: 'c', text: 'Porque o realce aumenta muito o tamanho do arquivo final.',
              porque: 'O efeito no tamanho é desprezível. O problema é de leitura, não de peso.' },
            { id: 'd', text: 'Porque realce só funciona enquanto o documento estiver aberto no mesmo computador.',
              porque: 'Ele é gravado no arquivo e aparece em qualquer máquina que o abra.' },
          ]},
          explanation: 'É a mesma regra do design: cor sozinha não pode carregar informação essencial.',
        },
      ],
    },
    {
      code: 'AP044.4-L2',
      title: 'Formatando o boletim do clube',
      type: 'lab',
      content: '',
      requirementCodes: [
        'AP044-7.1', 'AP044-7.2', 'AP044-7.3', 'AP044-7.4', 'AP044-7.5',
        'AP044-7.6', 'AP044-7.7', 'AP044-7.8', 'AP044-7.9',
      ],
      labType: 'estilos_texto',
    },
  ],
};
