import type { Module } from '../../types';

/*
 * AP044 módulo 8 — os requisitos 10 e 13.
 *
 * O pareamento parece estranho no papel: uma lista de programas por função e
 * cinco ajustes do sistema. Lidos em voz alta, são a mesma pergunta pelos dois
 * lados — "que programas existem para cada tarefa" e "qual deles o computador
 * abre quando eu clico no arquivo". Uma é o catálogo; a outra é a escolha.
 *
 * ── A lista de marcas envelhece; a de categorias, não ────────────────────
 * O requisito pede citar "uma ou duas opções de softwares atuais". Escrever a
 * lição como lista de marcas seria escrever uma lição com prazo de validade:
 * em três anos metade dos nomes mudou. O que não muda é a categoria — existe
 * um programa para escrever, um para calcular, um para guardar registro, um
 * para desenhar. Aprender a categoria é aprender a procurar o nome do ano.
 *
 * E há uma segunda razão, mais prática: o computador do clube não tem o
 * programa caro. Quem só conhece a marca conclui que não dá para fazer; quem
 * conhece a categoria procura o gratuito equivalente — e não a cópia pirata,
 * que é o outro caminho e que a AP042 já mostrou de onde vem.
 *
 * ── Desfragmentar deixou de valer para quase todo mundo ──────────────────
 * O item a) pede limpeza e desfragmentação. Escrito quando todo disco era de
 * prato girando. Em SSD não se desfragmenta — o próprio Windows troca o botão
 * por "Otimizar" e escreve "Unidade de estado sólido" ao lado. Ensinar a
 * desfragmentar SSD é ensinar a gastar a vida útil do disco à toa.
 *
 * A lição cumpre o requisito e diz a diferença: a ferramenta é a mesma, o
 * disco é que responde por si. É o programa de verdade quem mostra isso, e o
 * laboratório mostra igual.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">Existe um programa para cada tarefa</h2>
<p class="mb-3">"Não dá para fazer aqui, o computador do clube não tem o
programa." É quase sempre falso. O que ele não tem é <em>aquela marca</em> — e
marca não é a mesma coisa que categoria.</p>

<h3 class="font-bold mt-4 mb-2">As seis categorias, e o que procurar</h3>
<ul class="list-disc pl-5 mb-3 space-y-1">
<li><strong>Editor de texto</strong> — para escrever documento: Microsoft Word,
LibreOffice Writer.</li>
<li><strong>Planilha eletrônica</strong> — para calcular e organizar em tabela:
Microsoft Excel, LibreOffice Calc.</li>
<li><strong>Banco de dados</strong> — para guardar registros com estrutura:
Microsoft Access, LibreOffice Base.</li>
<li><strong>Linguagem de programação</strong> — para dar instruções ao
computador: Python, JavaScript.</li>
<li><strong>Editor de imagens</strong> — para tratar foto e desenhar: GIMP,
Adobe Photoshop.</li>
<li><strong>Editor de vídeo</strong> — para cortar e montar: DaVinci Resolve,
Shotcut.</li>
</ul>
<p class="mb-3">Repare que em toda linha há uma opção gratuita ao lado da paga.
Elas abrem os mesmos tipos de arquivo e fazem o que a especialidade pede. O
caminho de quem não tem a marca é esse — e não a cópia pirata, que vem com
brinde que ninguém pediu.</p>

<h3 class="font-bold mt-4 mb-2">Linguagem não é programa</h3>
<p class="mb-3">Python é uma <strong>linguagem</strong>: um jeito de escrever
instruções. O VS Code é um <strong>editor</strong>, onde você digita essas
instruções. São coisas de categorias diferentes, e trocá-las confunde a
procura: dá para escrever Python no Bloco de Notas, e o VS Code sozinho não
executa nada.</p>

<h3 class="font-bold mt-4 mb-2">O outro lado: qual programa abre o quê</h3>
<p class="mb-3">Todo arquivo tem um <strong>tipo</strong>, e o sistema guarda
qual programa abre cada tipo. É o <strong>programa padrão</strong> — é por isso
que dois cliques num .docx abrem o editor de texto sem você escolher nada.</p>
<ul class="list-disc pl-5 mb-3 space-y-1">
<li><strong>Abrir com</strong> abre <em>aquele arquivo, desta vez</em>, em
outro programa. O padrão continua o mesmo.</li>
<li><strong>Definir como padrão</strong> muda a regra para <em>todos os
arquivos daquele tipo</em>, de agora em diante.</li>
</ul>
<p class="mb-3">Confundir os dois é o motivo de alguém abrir uma foto no
editor de imagens uma vez e, sem querer, passar a abrir todas ali.</p>

<h3 class="font-bold mt-4 mb-2">Impressora padrão e usuário</h3>
<p class="mb-3">A <strong>impressora padrão</strong> é a que já vem escolhida
na hora de imprimir. Num clube com duas, escolher errado é imprimir na sala do
lado.</p>
<p class="mb-3">Criar um <strong>usuário</strong> dá a cada pessoa a própria
área de trabalho, os próprios arquivos e as próprias configurações no mesmo
computador. É o que evita que a lição de alguém apareça na tela de outro — e
o que faz sentido no computador do clube, que é de todo mundo.</p>

<h3 class="font-bold mt-4 mb-2">Limpar e otimizar o disco</h3>
<p class="mb-3">A <strong>limpeza de disco</strong> apaga o que o computador
guardou e não precisa mais: arquivo temporário, lixeira, restos de
atualização. Ela devolve espaço.</p>
<p class="mb-3">A <strong>desfragmentação</strong> é outra coisa: ela junta os
pedaços espalhados de cada arquivo no disco de prato girando, para a agulha
não ter de ir e voltar. Em <strong>SSD</strong> não há agulha nem prato, e
desfragmentar não acelera nada — só gasta a vida útil do disco. Por isso o
Windows troca o nome do botão para <strong>Otimizar</strong> e escreve
"Unidade de estado sólido" ao lado.</p>

<div class="p-3 rounded-lg mt-4" style="background: rgba(59,130,246,.12)">
<p class="text-sm"><strong>A ferramenta é a mesma; o disco responde por si.</strong>
Antes de clicar, leia o que está escrito na coluna do tipo de mídia.</p>
</div>
`;

export const modulo8: Module = {
  code: 'AP044.8',
  title: 'A máquina e os programas',
  description: 'Que programa existe para cada tarefa, qual deles o sistema abre — e o que limpar e otimizar fazem.',
  lessons: [
    {
      code: 'AP044.8-L1',
      title: 'O catálogo de programas e a escolha do sistema',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: [
        'AP044-10.1', 'AP044-10.2', 'AP044-10.3',
        'AP044-10.4', 'AP044-10.5', 'AP044-10.6',
      ],
      perguntas: 5,
      questions: [
        {
          id: 'AP044.8-L1-Q1', type: 'matching',
          prompt: 'Ligue cada programa à categoria a que ele pertence.',
          data: { pairs: [
            { left: 'LibreOffice Writer', right: 'Editor de texto' },
            { left: 'Microsoft Excel', right: 'Planilha eletrônica' },
            { left: 'LibreOffice Base', right: 'Banco de dados' },
            { left: 'GIMP', right: 'Editor de imagens' },
            { left: 'Shotcut', right: 'Editor de vídeo' },
          ]},
          explanation: 'A categoria é o que se aprende; os nomes de cada época se procuram por ela.',
        },
        {
          id: 'AP044.8-L1-Q2', type: 'multiple_choice',
          prompt: 'O computador do clube não tem o Microsoft Excel e é preciso montar uma planilha. Qual é o caminho certo?',
          data: { options: [
            { id: 'a', text: 'Usar o LibreOffice Calc, que é gratuito e abre os mesmos arquivos.', correct: true },
            { id: 'b', text: 'Baixar uma cópia ativada do Excel num site que ofereça o download.',
              porque: 'É de onde vem boa parte dos vírus — e o instalador pirata é o disfarce mais antigo que existe.' },
            { id: 'c', text: 'Montar a planilha no editor de texto, alinhando os números com Tab.',
              porque: 'Isso desenha uma tabela sem cálculo nenhum: nada soma, nada se ordena.' },
            { id: 'd', text: 'Esperar até ter acesso a um computador com o programa instalado.',
              porque: 'Há programa equivalente disponível agora, e de graça.' },
          ]},
          explanation: 'Quem conhece a categoria acha o equivalente; quem só conhece a marca acha que não dá.',
        },
        {
          id: 'AP044.8-L1-Q3', type: 'multiple_choice',
          prompt: 'Por que Python e VS Code não são a mesma categoria de coisa?',
          data: { options: [
            { id: 'a', text: 'Python é a linguagem em que se escreve; o VS Code é o editor onde se digita.', correct: true },
            { id: 'b', text: 'Python é gratuito e o VS Code é pago, o que os põe em categorias diferentes.',
              porque: 'Os dois são gratuitos. Preço não define categoria.' },
            { id: 'c', text: 'Python serve para a internet e o VS Code serve para programas de computador.',
              porque: 'Os dois servem aos dois: a linguagem não fica presa a um destino.' },
            { id: 'd', text: 'São a mesma categoria: um é a versão nova do outro.',
              porque: 'Não há relação de versão entre eles — um escreve, o outro é onde se escreve.' },
          ]},
          explanation: 'Dá para escrever Python no Bloco de Notas, e o editor sozinho não executa nada.',
        },
        {
          id: 'AP044.8-L1-Q4', type: 'multiple_choice',
          prompt: 'Qual é a diferença entre "Abrir com" e "Definir como padrão"?',
          data: { options: [
            { id: 'a', text: '"Abrir com" vale para aquela vez; o padrão vale para todos os arquivos do tipo.', correct: true },
            { id: 'b', text: '"Abrir com" abre uma cópia do arquivo, e o padrão abre o original.',
              porque: 'Nenhum dos dois cria cópia: os dois abrem o mesmo arquivo.' },
            { id: 'c', text: '"Abrir com" só funciona para imagem, e o padrão vale para qualquer tipo.',
              porque: 'Serve para qualquer tipo de arquivo, e não só para imagem.' },
            { id: 'd', text: 'São a mesma coisa, e o segundo nome é só o atalho do primeiro.',
              porque: 'Um é escolha da vez, o outro muda a regra do sistema daí em diante.' },
          ]},
          explanation: 'Confundir os dois é como se passa a abrir todas as fotos no programa errado.',
        },
        {
          id: 'AP044.8-L1-Q5', type: 'multiple_choice',
          prompt: 'O que a desfragmentação faz, e por que ela não serve para um SSD?',
          data: { options: [
            { id: 'a', text: 'Junta os pedaços de cada arquivo, e no SSD não há agulha que precise disso.', correct: true },
            { id: 'b', text: 'Apaga arquivos temporários, e o SSD já os apaga sozinho a cada desligamento.',
              porque: 'Apagar temporário é a limpeza de disco, e ela vale nos dois tipos de disco.' },
            { id: 'c', text: 'Comprime os arquivos para caberem melhor, e no SSD isso já vem de fábrica.',
              porque: 'Desfragmentar não comprime nada: só reorganiza onde cada pedaço está.' },
            { id: 'd', text: 'Confere o disco em busca de defeitos, e o SSD não pode ser conferido.',
              porque: 'Isso é a verificação de erros, e SSD também pode ser verificado.' },
          ]},
          explanation: 'Sem prato girando não há ida e volta a economizar — e a operação só gasta o disco.',
        },
        {
          id: 'AP044.8-L1-Q6', type: 'true_false',
          prompt: 'Criar um usuário separado no computador do clube dá a cada pessoa a própria área de trabalho e os próprios arquivos.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso', porque: 'É verdadeiro: cada usuário tem pasta, área de trabalho e configurações próprias na mesma máquina.' },
          ]},
          explanation: 'É o que evita a lição de um aparecendo na tela do outro.',
        },
        {
          id: 'AP044.8-L1-Q7', type: 'multiple_choice',
          prompt: 'Para que serve definir uma impressora padrão?',
          data: { options: [
            { id: 'a', text: 'Para que ela já venha escolhida na hora de imprimir.', correct: true },
            { id: 'b', text: 'Para impedir que as outras impressoras sejam usadas por engano.',
              porque: 'As outras continuam disponíveis: basta escolhê-las na janela de impressão.' },
            { id: 'c', text: 'Para que ela imprima primeiro quando houver fila de vários documentos.',
              porque: 'Cada impressora tem a própria fila. Ser padrão não dá prioridade nenhuma.' },
            { id: 'd', text: 'Para que ela funcione sem que seja preciso instalar o driver dela.',
              porque: 'O driver continua sendo necessário — é ele que faz a impressora funcionar.' },
          ]},
          explanation: 'Num clube com duas impressoras, o padrão errado imprime na sala do lado.',
        },
        {
          id: 'AP044.8-L1-Q8', type: 'multiple_choice',
          prompt: 'A limpeza de disco liberou 12 GB. O que foi apagado?',
          data: { options: [
            { id: 'a', text: 'Arquivos temporários, lixeira e restos de atualização do sistema.', correct: true },
            { id: 'b', text: 'Os programas instalados que não eram abertos havia mais de um ano.',
              porque: 'Ela não desinstala nada: programa sai pela desinstalação, e só se você mandar.' },
            { id: 'c', text: 'Os arquivos pessoais mais antigos guardados nas pastas do usuário.',
              porque: 'Documento e foto seus não são tocados — seria justamente o que ninguém quer.' },
            { id: 'd', text: 'As partes duplicadas de arquivos espalhados pelo disco.',
              porque: 'Isso descreve a desfragmentação, que reorganiza e não apaga.' },
          ]},
          explanation: 'Limpeza devolve espaço tirando o que o computador guardou e não precisa mais.',
        },
      ],
    },
    {
      code: 'AP044.8-L2',
      title: 'Ajustando o computador do clube',
      type: 'lab',
      content: '',
      requirementCodes: [
        'AP044-13.1', 'AP044-13.2', 'AP044-13.3', 'AP044-13.4', 'AP044-13.5',
      ],
      labType: 'configuracoes_sistema',
    },
  ],
};
