/**
 * O passo a passo de cada verificação do terminal.
 *
 * A moldura oferece isto depois de um tempo sem ninguém concluir nada, e aqui
 * ele pesa tanto quanto no laboratório de instalação. Quem trava num terminal
 * não trava por não saber o que quer: trava porque a linha de comando não
 * responde nada quando dá certo, e responde uma frase em inglês truncada
 * quando dá errado. Não há botão para procurar, não há menu para abrir — só a
 * tela preta.
 *
 * Por isso cada passo diz o comando inteiro, e não "use o comando de copiar".
 * Ninguém adivinha que copiar se escreve `cp`, que a opção que faz `ls` mostrar
 * o oculto é `-a`, ou que a mensagem do commit vai depois de `-m` e entre
 * aspas.
 */
export const PASSOS_DO_TERMINAL: Record<string, string[]> = {
  /* ── Andar pelo disco ── */
  pwd: [
    'Clique na tela preta e digite: pwd',
    'Aperte Enter. Ele responde o caminho da pasta em que você está.',
    'O nome vem de "print working directory" — escrever o diretório de trabalho.',
  ],
  entrou: [
    'Digite: ls — para ver que pastas existem aqui.',
    'Digite: cd projeto-do-clube',
    'Repare no prompt, à esquerda: o caminho depois dos dois-pontos mudou junto.',
  ],
  listou: [
    'Digite: ls',
    'Ele escreve o que existe na pasta atual, em ordem alfabética.',
    'Sem argumento, ele lista onde você está. Com um, lista a pasta que você nomear.',
  ],
  ocultos: [
    'Entre em projeto-do-clube, se ainda não estiver nela: cd projeto-do-clube',
    'Digite: ls -a',
    'Apareceu um .oculto que o ls comum não mostrava. Arquivo que começa com ponto fica escondido por convenção — é assim que programas guardam configuração sem encher a pasta.',
    'Os dois primeiros, . e .., são a pasta atual e a de cima.',
  ],
  leu: [
    'Digite: cat leiame.txt',
    'Ele escreve o conteúdo do arquivo na tela e devolve o prompt. Não abre editor nenhum.',
    'Para arquivos grandes existem outros comandos; para um leiame, cat basta.',
  ],
  'dois-caminhos': [
    'Caminho relativo parte de onde você está: cd documentos',
    'Caminho absoluto começa com / e vale de qualquer lugar: cd /home/desbravador/projeto-do-clube',
    'O ~ é um atalho para a sua casa, e também é absoluto: cd ~',
    'Faça os dois tipos ao menos uma vez.',
  ],

  /* ── Mexer em arquivos ── */
  'pasta-nova': [
    'Entre na pasta do projeto: cd ~/projeto-do-clube',
    'Digite: mkdir provas',
    'Confira com ls. Quando dá certo, o mkdir não responde nada — no terminal, silêncio é sucesso.',
  ],
  'arquivo-novo': [
    'Digite: touch provas/teste.txt',
    'O touch cria o arquivo vazio. Ele não abre editor e não escreve nada dentro.',
    'Confira com: ls provas',
  ],
  copiou: [
    'Digite: cp leiame.txt provas/',
    'Confira que o original continua onde estava: ls',
    'cp copia e deixa os dois. Quem quer levar embora usa mv — e é aí que o arquivo some do lugar de origem.',
  ],
  renomeou: [
    'Digite: mv provas/teste.txt provas/presenca.txt',
    'Não existe comando de renomear: renomear é mover para o mesmo lugar com outro nome.',
  ],
  removeu: [
    'Digite: rm provas/presenca.txt',
    'Não há lixeira aqui. O que o rm tira não volta.',
  ],
  'removeu-pasta': [
    'Tente primeiro: rm provas — ele recusa, porque é um diretório.',
    'Digite: rm -r provas',
    'O -r é de recursivo: ele entra na pasta e remove o que houver dentro, junto com ela.',
  ],

  /* ── O repositório ── */
  iniciou: [
    'Entre na pasta do projeto: cd ~/projeto-do-clube',
    'Digite: git init',
    'Ele cria uma pasta escondida .git ali dentro — é ela que guarda o histórico. Confira com ls -a.',
    'O repositório é a pasta com essa .git dentro. Iniciar na pasta errada põe o histórico no lugar errado.',
  ],
  preparou: [
    'Veja o que o git está enxergando: git status',
    'Digite: git add .',
    'O ponto quer dizer "tudo o que mudou aqui". Para um arquivo só: git add lista.py',
    'Preparar não registra nada — é dizer o que vai entrar no próximo commit.',
  ],
  'cinco-commits': [
    'Depois do add, registre: git commit -m "Cria o programa da lista de presença"',
    'Para o próximo, mude alguma coisa antes: editar lista.py, salve, e faça add e commit de novo.',
    'A mensagem diz o que mudou, e é lida por outra pessoa daqui a seis meses. "teste" e "x" não contam.',
    'São cinco commits com cinco mensagens diferentes.',
  ],
  'viu-historico': [
    'Digite: git log',
    'Ele mostra os commits do mais novo para o mais antigo.',
    'Para a versão curta, uma linha por commit: git log --oneline',
  ],

  /* ── Desfazer e ramificar ── */
  desfez: [
    'Estrague alguma coisa de propósito: editar lista.py, apague uma linha e salve.',
    'Veja o git perceber: git status',
    'Devolva: git restore lista.py',
    'Isso só funciona no que ainda não foi registrado. Depois do commit, desfazer é outra história.',
  ],
  'criou-ramo': [
    'Digite: git checkout -b experimento',
    'O -b cria e já entra. Sem ele, o checkout só troca para um ramo que já existe.',
    'Veja onde você está: git branch — o asterisco marca o atual.',
  ],
  'trabalhou-no-ramo': [
    'Já dentro do ramo, mude alguma coisa: editar lista.py, salve.',
    'Registre: git add . e depois git commit -m "Acrescenta a contagem de presentes"',
    'Volte para o main: git checkout main — e repare que a mudança sumiu.',
    'Ela não se perdeu: está no ramo. É para isso que ramo serve — experimentar sem mexer no principal.',
  ],
  mesclou: [
    'Certifique-se de estar no principal: git checkout main',
    'Digite: git merge experimento',
    'Agora a mudança do ramo está no main. Confira com cat e com git log.',
  ],

  /* ── O remoto ── */
  apontou: [
    'Digite: git remote add origin https://exemplo/clube.git',
    'origin é só o apelido do endereço — é o nome que quase todo mundo usa para o remoto principal.',
    'Confira com: git remote -v',
  ],
  enviou: [
    'Digite: git push',
    'Sobe o que já foi commitado. O que está solto no disco, sem commit, não vai — e é o engano mais comum.',
  ],
  recebeu: [
    'Depois do push, outra pessoa mexeu no mesmo repositório.',
    'Traga o que ela fez: git pull',
    'Confira o que mudou: cat leiame.txt',
  ],

  /* ── O README ── */
  existe: [
    'Na pasta do projeto: touch README.md',
    'Depois abra para escrever: editar README.md',
    'O painel abre ao lado. Escreva ali e clique em Salvar.',
  ],
  titulo: [
    'No editor, escreva na primeira linha: # Lista de presença da unidade',
    'Uma cerquilha e um espaço fazem um título. Duas fazem um subtítulo, e assim por diante até seis.',
  ],
  lista: [
    'Escreva cada item numa linha, começando com um traço e um espaço:',
    '- Guarda os nomes da unidade',
    '- Imprime a lista na tela',
    'Um item sozinho não é lista: escreva pelo menos dois.',
  ],
  codigo: [
    'Para um trecho no meio da frase, ponha entre crases: `python3 lista.py`',
    'Para um bloco inteiro, três crases numa linha, o código, e três crases de novo.',
    'A crase fica na tecla à esquerda do 1, ou ao lado do P, dependendo do teclado.',
  ],
  link: [
    'O texto entre colchetes, o endereço entre parênteses, colados:',
    '[Documentação do Python](https://docs.python.org/pt-br/3/)',
    'Sem espaço entre o ] e o ( — é isso que faz o Markdown reconhecer.',
  ],
  registrado: [
    'Escrever o arquivo não o põe no repositório.',
    'Digite: git add README.md',
    'Depois: git commit -m "Acrescenta o README explicando o programa"',
    'Confira com git log que ele está no histórico.',
  ],
};
