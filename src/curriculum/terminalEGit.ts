import type { ModuloDeVereda } from './veredas';

/*
 * A vereda CC003 Terminal e Git.
 *
 * ── De onde ela vem ──────────────────────────────────────────────────────
 * Da CC002. Quem escreveu programas em Python já tem o que versionar, e já
 * sentiu a falta que faz: `lista_v2_final_agora.py` é a forma caseira do
 * controle de versão, e é exatamente o problema que o Git resolve.
 *
 * ── O que muda em relação às outras veredas ──────────────────────────────
 * Não há arquivo escrito num editor para um validador ler. Há um computador —
 * um disco, um diretório de trabalho, um repositório —, e o laboratório é um
 * terminal. O que se confere é o estado depois dos comandos, e nunca a linha
 * digitada: `git commit -m "..."` dentro de um comentário não registra nada, e
 * um teste de texto aprovaria.
 *
 * ── Cada laboratório parte de um computador limpo ────────────────────────
 * Encadeá-los faria o segundo depender de o primeiro ter sido feito de um
 * jeito específico, e quem voltasse a um deles encontraria um disco que não
 * reconhece. São seis lições, e não seis capítulos de uma sessão só.
 *
 * ── O requisito 8 acontece fora daqui ────────────────────────────────────
 * Apresentar ao examinador o histórico do repositório da CC002 é conversa com
 * uma pessoa, e a plataforma não confere nada disso — como já vale para o
 * requisito 7 da CC002 e o da CC001. O que ela faz é preparar: a última lição
 * ensina a ler um histórico em voz alta, que é a parte que ninguém treina.
 */

const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], exemplo: string, atencao: string, marcas: string[],
) => ({ id, titulo, resumo, explicacao, exemplo, exemploComo: 'texto' as const, atencao, marcas });

/* ── Módulo 1 ──────────────────────────────────────────────────────────────── */

const M1: ModuloDeVereda = {
  id: 'm1',
  titulo: 'A tela preta',
  resumo: 'O que é um terminal, o que é um diretório, e a diferença entre os dois tipos de caminho.',
  licoes: [
    {
      id: 'm1-teoria',
      tipo: 'teoria',
      perguntas: 5,
      titulo: 'Conversar com o computador por escrito',
      resumo: 'Terminal, diretório e caminho — os três termos que sustentam todo o resto.',
      topicos: [
        t('terminal', 'O terminal',
          'A outra forma de mandar no computador: escrevendo.',
          [
            'Você já manda no computador o dia inteiro: clica numa pasta, arrasta um arquivo, aperta um botão. O `terminal` é a outra forma de fazer as mesmas coisas — escrevendo o nome do que você quer.',
            'Ele mostra um `prompt` — um pedaço de texto que diz quem você é e onde está — e espera. Você escreve um comando, aperta Enter, e ele responde. Depois volta a esperar.',
            'Parece um retrocesso, e não é. Escrever é mais rápido do que apontar quando a tarefa se repete, é a única forma de mandar em computador que está longe, pela rede, e é o que dá para escrever num arquivo e mandar o computador repetir depois.',
          ],
          `desbravador@clube:~$ pwd
/home/desbravador

desbravador@clube:~$ ls
documentos   projeto-do-clube`,
          'Quando um comando dá certo, o terminal quase sempre não responde nada — devolve o prompt e pronto. Silêncio é sucesso. Quem espera uma confirmação fica achando que não funcionou.',
          ['terminal', 'prompt', 'linha de comando']),

        t('diretorio', 'Diretório',
          'É a pasta, com o nome que o terminal usa.',
          [
            'O que a janela do computador chama de pasta, o terminal chama de `diretório`. É a mesma coisa: um lugar que guarda arquivos e outros diretórios dentro.',
            'A diferença é que na janela você vê onde está, e no terminal você precisa perguntar. `pwd` responde: ele escreve o caminho completo do diretório em que você está agora — o **diretório de trabalho**.',
            'Todo comando que você der acontece ali, a menos que você diga outra coisa. É por isso que a primeira pergunta de quem abre um terminal é sempre a mesma: onde eu estou?',
          ],
          `desbravador@clube:~$ pwd
/home/desbravador

desbravador@clube:~$ cd projeto-do-clube

desbravador@clube:~/projeto-do-clube$ pwd
/home/desbravador/projeto-do-clube`,
          'O prompt já mostra onde você está — é o pedaço depois dos dois-pontos. O `~` é um atalho para a sua pasta pessoal, e é por isso que ele aparece tanto.',
          ['diretório', 'pwd', 'cd']),

        t('caminhos', 'Caminho absoluto e caminho relativo',
          'Duas formas de dizer onde uma coisa está.',
          [
            'Um `caminho absoluto` começa na raiz do disco, com uma barra: `/home/desbravador/projeto-do-clube`. Ele vale de qualquer lugar, porque diz o percurso inteiro. É como dar o endereço completo, com rua, número e cidade.',
            'Um `caminho relativo` parte de onde você está: `projeto-do-clube`, ou `../documentos`. Ele é mais curto e depende do diretório de trabalho — é como dizer "a segunda porta à direita".',
            'Duas peças aparecem o tempo todo nos relativos: `..` é o diretório de cima, e `.` é o atual. E `~` é a sua pasta pessoal, valendo de qualquer lugar.',
          ],
          `Estando em /home/desbravador:

  cd projeto-do-clube              relativo — parte daqui
  cd /home/desbravador/documentos  absoluto — vale de qualquer lugar
  cd ..                            relativo — sobe um nível
  cd ~                             absoluto — volta para a casa`,
          'O mesmo caminho relativo leva a lugares diferentes conforme onde você está — e é essa a causa da maior parte dos "mas eu digitei igual e não funcionou". Quando algo não achar o arquivo, rode `pwd` antes de mudar o comando.',
          ['caminho absoluto', 'caminho relativo', '..', '~']),
      ],
      questoes: [
        {
          id: 'cc003-m1-q1', type: 'multiple_choice',
          prompt: 'O que o comando pwd faz?',
          data: { options: [
            { id: 'a', text: 'Escreve o caminho do diretório em que você está agora.', correct: true },
            { id: 'b', text: 'Pede a senha do computador antes de continuar.',
              porque: 'A sigla lembra password, e não é: é print working directory.' },
            { id: 'c', text: 'Mostra a lista de arquivos do diretório atual.',
              porque: 'Isso é o ls. O pwd responde onde, e não o quê.' },
            { id: 'd', text: 'Volta para o diretório anterior, como o botão voltar.',
              porque: 'Voltar é cd .. ou cd -. O pwd não muda de lugar nenhum.' },
          ]},
          explanation: 'É a primeira pergunta de quem abre um terminal, e ele responde em uma linha.',
        },
        {
          id: 'cc003-m1-q2', type: 'multiple_choice',
          prompt: 'Qual destes é um caminho absoluto?',
          data: { options: [
            { id: 'a', text: '/home/desbravador/documentos', correct: true },
            { id: 'b', text: 'documentos/atas',
              porque: 'Sem barra na frente, ele parte de onde você está — é relativo.' },
            { id: 'c', text: '../projeto-do-clube',
              porque: 'Começa subindo um nível a partir de onde você está: relativo.' },
            { id: 'd', text: './lista.py',
              porque: 'O ponto é o diretório atual, e "atual" muda conforme o lugar: relativo.' },
          ]},
          explanation: 'Absoluto começa na raiz, com a barra, e diz o percurso inteiro.',
        },
        {
          id: 'cc003-m1-q3', type: 'true_false',
          prompt: 'Quando um comando dá certo, o terminal costuma não responder nada.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso', porque: 'É verdadeiro: silêncio é sucesso, e quem espera confirmação acha que não funcionou.' },
          ]},
          explanation: 'Ele fala quando há problema. Dar certo devolve o prompt, e mais nada.',
        },
        {
          id: 'cc003-m1-q4', type: 'multiple_choice',
          prompt: 'Você digitou um caminho relativo e o terminal disse que o arquivo não existe — mas você sabe que ele existe. Qual é a primeira coisa a conferir?',
          data: { options: [
            { id: 'a', text: 'Em que diretório você está, com pwd.', correct: true },
            { id: 'b', text: 'Se o arquivo não está corrompido, abrindo-o noutro programa.',
              porque: 'Ele nem foi encontrado — não houve leitura para corromper coisa alguma.' },
            { id: 'c', text: 'Se o terminal precisa ser reiniciado para enxergar o arquivo.',
              porque: 'O terminal lê o disco a cada comando. Não há nada para atualizar.' },
            { id: 'd', text: 'Se o computador tem espaço livre suficiente em disco.',
              porque: 'Espaço afeta gravar, e não encontrar.' },
          ]},
          explanation: 'Caminho relativo parte de onde você está — e é quase sempre aí que está a diferença.',
        },
        {
          id: 'cc003-m1-q5', type: 'fill_blank',
          prompt: 'Complete: no terminal, dois pontos seguidos significam o diretório ___, e o til significa a pasta ___ do usuário.',
          data: { blanks: [
            { id: 'b1', answer: 'de cima', hint: 'O que contém o atual.', aceitas: ['acima', 'anterior', 'pai', 'superior'] },
            { id: 'b2', answer: 'pessoal', hint: 'É para onde o cd sozinho leva.', aceitas: ['casa', 'home', 'inicial'] },
          ]},
          explanation: 'Os dois aparecem em quase todo caminho relativo que se escreve.',
        },
        {
          id: 'cc003-m1-q6', type: 'multiple_choice',
          prompt: 'Você abriu o terminal do computador do clube e não sabe em que pasta ele começou. Qual comando responde isso?',
          data: { options: [
            { id: 'a', text: 'pwd, que escreve o caminho do diretório de trabalho.', correct: true },
            { id: 'b', text: 'ls, que mostra o conteúdo e assim revela onde você está.', porque: 'Ele lista o que há ali, e não o caminho. Duas pastas com os mesmos nomes dentro pareceriam iguais.' },
            { id: 'c', text: 'cd, que leva até o diretório atual e o imprime na tela.', porque: 'O cd muda de lugar, e sozinho volta para a pasta pessoal. Ele não responde onde você estava.' },
            { id: 'd', text: 'touch, que cria um arquivo no lugar onde você está.', porque: 'Criar um arquivo não diz o caminho, e ainda deixa lixo na pasta de alguém.' },
          ]},
          explanation: 'É a primeira pergunta de quem abre um terminal, e ela tem um comando só. O prompt também costuma mostrar o lugar, mas abreviado.',
        },
        {
          id: 'cc003-m1-q7', type: 'scenario',
          prompt: 'Estando em /home/desbravador/projeto-do-clube, você quer entrar em /home/desbravador/documentos. Qual comando faz isso em um passo, sem escrever o caminho inteiro?',
          data: { scenarios: [
            { id: 'a', text: 'cd ../documentos', correct: true },
            { id: 'b', text: 'cd documentos', porque: 'Isso procura uma pasta documentos dentro de projeto-do-clube, que é onde você está agora.' },
            { id: 'c', text: 'cd ./documentos', porque: 'O ponto sozinho é o diretório atual, então isso é o mesmo que a opção anterior: procura aqui dentro.' },
            { id: 'd', text: 'cd /documentos', porque: 'A barra no começo parte da raiz do disco, e ali não existe uma pasta documentos.' },
          ]},
          explanation: 'Dois pontos sobem um nível, e a partir dali o caminho continua. É o atalho que evita reescrever a parte do endereço que os dois lugares têm em comum.',
        },
        {
          id: 'cc003-m1-q8', type: 'true_false',
          prompt: 'Um caminho absoluto leva ao mesmo lugar seja qual for o diretório em que você está.',
          data: { options: [
            { id: 'v', text: 'Verdadeiro', correct: true },
            { id: 'f', text: 'Falso', porque: 'Ele começa na raiz do disco e diz o percurso inteiro. Quem depende de onde você está é o relativo.' },
          ]},
          explanation: 'É a diferença entre dar o endereço completo e dizer "a segunda porta à direita". O segundo é mais curto, e só serve para quem está no mesmo corredor.',
        },
      ],
    },
    {
      id: 'm1-lab',
      tipo: 'terminal',
      titulo: 'Andando pelo disco sem o mouse',
      resumo: 'Descobrir onde você está, ver o que existe, entrar e sair de pastas e ler um arquivo.',
      verificacoes: ['pwd', 'entrou', 'listou', 'ocultos', 'leu', 'dois-caminhos'],
    },
  ],
};

/* ── Módulo 2 ──────────────────────────────────────────────────────────────── */

const M2: ModuloDeVereda = {
  id: 'm2',
  titulo: 'Mexer nos arquivos escrevendo',
  resumo: 'Criar, copiar, mover e remover — e a diferença entre copiar e mover, que custa caro.',
  licoes: [
    {
      id: 'm2-teoria',
      tipo: 'teoria',
      perguntas: 5,
      titulo: 'Cinco comandos que fazem o trabalho',
      resumo: 'mkdir, touch, cp, mv e rm — o que cada um faz, e o que nenhum deles pergunta.',
      topicos: [
        t('criar', 'Criar',
          'Uma pasta vazia, e um arquivo vazio.',
          [
            '`mkdir` cria diretório — o nome vem de *make directory*. `mkdir provas` cria uma pasta chamada provas dentro de onde você está.',
            '`touch` cria um arquivo vazio. Ele não abre editor nenhum e não escreve nada dentro: só faz o arquivo existir.',
            'Os dois recusam por cima de coisa existente, e é bom que recusem: `mkdir` numa pasta que já existe responde que ela existe, em vez de apagá-la e criar outra.',
          ],
          `desbravador@clube:~/projeto-do-clube$ mkdir provas

desbravador@clube:~/projeto-do-clube$ touch provas/teste.txt

desbravador@clube:~/projeto-do-clube$ ls provas
teste.txt`,
          'Nome com espaço dá trabalho no terminal: `mkdir minha pasta` cria **duas** pastas, uma "minha" e uma "pasta". Por isso quase todo mundo usa hífen ou sublinhado no lugar do espaço.',
          ['mkdir', 'touch']),

        t('copiar-mover', 'Copiar e mover',
          'Dois comandos parecidos, e um deles deixa o original para trás.',
          [
            '`cp origem destino` copia: no fim existem **dois** arquivos. `mv origem destino` move: existe **um**, no lugar novo.',
            'É a distinção que mais custa caro no começo, porque as duas terminam do mesmo jeito na tela — o arquivo aparece onde você mandou. Só que numa delas ele também sumiu de onde estava.',
            '`mv` também renomeia, e isso surpreende: mover para o mesmo diretório com outro nome **é** renomear. Não existe um comando separado para isso.',
          ],
          `cp leiame.txt provas/           os dois passam a existir
mv leiame.txt provas/           só o de dentro de provas existe
mv teste.txt presenca.txt       renomeia, sem sair do lugar
cp -r documentos copia          -r porque é pasta, com o que houver dentro`,
          'Para pasta, o `cp` exige `-r`. Sem isso ele recusa e diz por quê — e a recusa é proposital: copiar uma pasta grande sem querer enche o disco em silêncio.',
          ['cp', 'mv', '-r']),

        t('remover', 'Remover',
          'O comando que não pergunta e não tem lixeira.',
          [
            '`rm arquivo` remove. Não vai para lixeira nenhuma, não pede confirmação, e não há como desfazer.',
            'Para pasta ele exige `-r`, do mesmo jeito que o `cp` — e aí remove o que houver dentro junto.',
            'Vale conferir com `ls` antes. É uma linha a mais e é a diferença entre apagar o que você queria e apagar o que estava do lado.',
          ],
          `desbravador@clube:~/projeto-do-clube$ rm provas/teste.txt

desbravador@clube:~/projeto-do-clube$ rm provas
rm: não foi possível remover 'provas': é um diretório

desbravador@clube:~/projeto-do-clube$ rm -r provas`,
          'A recusa do `rm` diante de uma pasta não é frescura: é a última chance de perceber que você digitou o nome errado. Quando alguém acrescenta o `-r` no automático, essa chance se perde.',
          ['rm', 'rm -r']),
      ],
      questoes: [
        {
          id: 'cc003-m2-q1', type: 'multiple_choice',
          prompt: 'Depois de rodar cp lista.py provas/, o que existe no disco?',
          data: { options: [
            { id: 'a', text: 'Dois arquivos: o original e a cópia dentro de provas.', correct: true },
            { id: 'b', text: 'Um arquivo, agora dentro de provas.',
              porque: 'Isso seria mv. O cp copia e não tira nada do lugar.' },
            { id: 'c', text: 'Um atalho dentro de provas apontando para o original.',
              porque: 'Atalho é outra coisa, e o cp não cria nenhum: ele duplica o conteúdo.' },
            { id: 'd', text: 'Nada, porque cp precisa de -r para qualquer coisa.',
              porque: 'O -r é só para pasta. Arquivo copia direto.' },
          ]},
          explanation: 'Copiar deixa os dois; mover deixa um. É a distinção mais cara do módulo.',
        },
        {
          id: 'cc003-m2-q2', type: 'multiple_choice',
          prompt: 'Como se renomeia um arquivo no terminal?',
          data: { options: [
            { id: 'a', text: 'Com mv, movendo para o mesmo lugar com outro nome.', correct: true },
            { id: 'b', text: 'Com rename, que existe para essa finalidade.',
              porque: 'Há utilitários com esse nome em alguns sistemas, mas o jeito universal é o mv.' },
            { id: 'c', text: 'Com cp, e depois apagando o antigo com rm.',
              porque: 'Funciona e são dois comandos e um risco a mais. O mv faz numa linha.' },
            { id: 'd', text: 'Não se renomeia: é preciso criar outro e copiar o conteúdo.',
              porque: 'Renomear é operação comum, e o mv a resolve.' },
          ]},
          explanation: 'Não existe comando de renomear — renomear é mover sem sair do lugar.',
        },
        {
          id: 'cc003-m2-q3', type: 'true_false',
          prompt: 'O rm manda o arquivo para a lixeira, de onde ele pode ser recuperado.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', porque: 'É falso. Não há lixeira no terminal: o que o rm tira, sai.' },
            { id: 'b', text: 'Falso', correct: true },
          ]},
          explanation: 'É por isso que vale rodar um ls antes — uma linha a mais, e o dedo para.',
        },
        {
          id: 'cc003-m2-q4', type: 'multiple_choice',
          prompt: 'Por que o cp e o rm recusam pasta enquanto não recebem -r?',
          data: { options: [
            { id: 'a', text: 'Porque pasta leva junto tudo o que está dentro, e a recusa é a chance de perceber o engano.', correct: true },
            { id: 'b', text: 'Porque copiar e remover pastas exige permissão de administrador.',
              porque: 'Permissão é outro assunto. A recusa aparece mesmo na sua própria pasta.' },
            { id: 'c', text: 'Porque os dois comandos foram feitos só para arquivos, e o -r é uma gambiarra.',
              porque: 'O -r é opção prevista dos dois, e não remendo: recursivo quer dizer "entre e faça de novo".' },
            { id: 'd', text: 'Porque sem o -r o terminal não sabe se é arquivo ou pasta.',
              porque: 'Ele sabe — tanto que a mensagem de erro diz "é um diretório".' },
          ]},
          explanation: 'Quem acrescenta o -r no automático perde justamente essa última conferência.',
        },
        {
          id: 'cc003-m2-q5', type: 'ordering',
          prompt: 'Ponha na ordem os passos para criar uma pasta e pôr uma cópia do leiame dentro dela.',
          data: { items: [
            { id: 'i1', text: 'Conferir onde você está, com pwd', order: 1 },
            { id: 'i2', text: 'Criar a pasta, com mkdir', order: 2 },
            { id: 'i3', text: 'Copiar o arquivo para dentro dela, com cp', order: 3 },
            { id: 'i4', text: 'Conferir o resultado, com ls', order: 4 },
          ]},
          explanation: 'Conferir antes e depois é o que separa quem trabalha no terminal de quem o teme.',
        },
        {
          id: 'cc003-m2-q6', type: 'scenario',
          prompt: 'Você rodou mkdir fotos do acampamento e apareceram três pastas na listagem. Por quê?',
          data: { scenarios: [
            { id: 'a', text: 'O espaço separa argumentos: ele leu três nomes de pasta.', correct: true },
            { id: 'b', text: 'O mkdir cria uma pasta para cada palavra por padrão.', porque: 'Ele cria uma pasta por nome recebido. Quem transformou a frase em três nomes foi o espaço.' },
            { id: 'c', text: 'O terminal repetiu o comando três vezes por engano.', porque: 'Ele executa uma vez o que você escreveu. As três pastas vieram de três nomes na mesma linha.' },
            { id: 'd', text: 'Faltou a opção que permite nome comprido em uma pasta só.', porque: 'Não existe essa opção. O que resolve é aspas em volta do nome, ou trocar o espaço por hífen.' },
          ]},
          explanation: 'É por isso que quase todo mundo usa hífen ou sublinhado no lugar do espaço: no terminal o espaço já tem um trabalho, e ele é separar.',
        },
        {
          id: 'cc003-m2-q7', type: 'multiple_choice',
          prompt: 'O rm recusou apagar a pasta provas e explicou que ela é um diretório. Como se deve entender essa recusa?',
          data: { options: [
            { id: 'a', text: 'Como a última chance de notar que o nome digitado está errado.', correct: true },
            { id: 'b', text: 'Como uma falha do comando, que deveria apagar o que se pede.', porque: 'Ele faz exatamente o que foi feito para fazer. Apagar pasta é outra ordem, e ela se escreve por extenso.' },
            { id: 'c', text: 'Como sinal de que a pasta está protegida contra remoção.', porque: 'Não há proteção nenhuma ali. Com a opção certa, a mesma pasta é apagada na hora.' },
            { id: 'd', text: 'Como aviso de que a pasta ainda tem arquivos dentro dela.', porque: 'A recusa vale mesmo para pasta vazia: o que ele recusa é o tipo, e não o conteúdo.' },
          ]},
          explanation: 'Quem acrescenta a opção no automático perde essa chance. E o rm não tem lixeira: depois dele, o que havia ali não volta.',
        },
        {
          id: 'cc003-m2-q8', type: 'true_false',
          prompt: 'Depois de mv leiame.txt provas/, o arquivo continua existindo onde estava antes.',
          data: { options: [
            { id: 'v', text: 'Verdadeiro', porque: 'Quem deixa os dois é o cp. O mv leva o arquivo: no fim existe um só, no lugar novo.' },
            { id: 'f', text: 'Falso', correct: true },
          ]},
          explanation: 'As duas terminam igual na tela — o arquivo aparece onde você mandou. Só que numa delas ele também sumiu de onde estava.',
        },
      ],
    },
    {
      id: 'm2-lab',
      tipo: 'terminal',
      titulo: 'Criando, copiando e removendo pela linha de comando',
      resumo: 'As quatro operações de arquivo, e a diferença entre copiar e mover na prática.',
      verificacoes: ['pasta-nova', 'arquivo-novo', 'copiou', 'renomeou', 'removeu', 'removeu-pasta'],
    },
  ],
};

/* ── Módulo 3 ──────────────────────────────────────────────────────────────── */

const M3: ModuloDeVereda = {
  id: 'm3',
  titulo: 'Guardar o histórico',
  resumo: 'Por que o controle de versão existe, e o que são repositório e commit.',
  licoes: [
    {
      id: 'm3-teoria',
      tipo: 'teoria',
      perguntas: 5,
      titulo: 'O problema que o Git resolve',
      resumo: 'A pasta cheia de "final_2_agora", e o que ela custa quando alguém precisa voltar atrás.',
      topicos: [
        t('por-que', 'Por que guardar versões',
          'A conta de não guardar, num caso concreto.',
          [
            'Você escreveu o programa da lista de presença na CC002. Ele funcionava. Aí você foi mexer para acrescentar a contagem de faltas, mudou quatro linhas, e agora ele não roda mais — e você não lembra quais eram as quatro.',
            'A saída caseira todo mundo conhece: `lista.py`, `lista_v2.py`, `lista_final.py`, `lista_final_agora.py`. Ela falha em três lugares. Ninguém sabe qual é o mais novo. Ninguém sabe o que mudou de um para o outro. E quando duas pessoas mexem, uma salva por cima da outra.',
            '`Controle de versão` é guardar o histórico de propósito, com data e com uma frase dizendo o que mudou. É poder voltar ao estado de ontem sem lembrar de nada, e é poder perguntar quando uma linha apareceu e por quê.',
          ],
          `Sem controle de versão:

  lista.py                  qual é o bom?
  lista_v2.py               o que mudou aqui?
  lista_final.py            quem escreveu?
  lista_final_agora.py      dá para voltar?

Com controle de versão:

  c4  Acrescenta a contagem de faltas
  c3  Corrige o nome que saía repetido
  c2  Lê os nomes de um arquivo
  c1  Cria o programa da lista de presença`,
          'O prejuízo raramente é perder o arquivo: é perder a **explicação**. Seis meses depois ninguém lembra por que aquela linha estranha está ali, e sem a mensagem do commit não há a quem perguntar.',
          ['controle de versão', 'histórico']),

        t('repositorio', 'Repositório',
          'A pasta que ganhou memória.',
          [
            'Um `repositório` é uma pasta comum com uma pasta escondida `.git` dentro. É nessa escondida que o histórico mora — as versões, as mensagens, as datas.',
            '`git init` cria essa pasta escondida. A partir daí, o Git passa a olhar aquele diretório e a saber dizer o que mudou desde a última vez.',
            'Repare que os seus arquivos continuam ali, normais. O Git não os transforma em nada: ele guarda cópias do estado deles, à parte.',
          ],
          `desbravador@clube:~/projeto-do-clube$ git init
Repositório Git vazio inicializado em /home/desbravador/projeto-do-clube/.git/

desbravador@clube:~/projeto-do-clube$ ls -a
.  ..  .git  .oculto  leiame.txt  lista.py`,
          'Iniciar o repositório na pasta errada é o engano mais comum, e ele é silencioso: o `git init` funciona em qualquer lugar. Rode `pwd` antes.',
          ['repositório', 'git init', '.git']),

        t('commit', 'Commit',
          'Uma versão registrada, com uma frase dizendo o que mudou.',
          [
            'Um `commit` é uma foto do projeto num instante, guardada com uma mensagem. Ele não guarda "o arquivo": guarda o estado de tudo o que você mandou guardar.',
            'Registrar tem dois passos, e isso surpreende quem chega. `git add` **prepara** — diz o que vai entrar. `git commit` **registra** o que foi preparado. Os dois passos existem para você poder guardar uma parte do trabalho e deixar o resto de fora.',
            'A mensagem vai depois de `-m`, entre aspas, e é lida por outra pessoa daqui a meses — às vezes por você mesmo. "teste" e "alterações" não dizem nada. "Corrige o nome que saía repetido" diz.',
          ],
          `desbravador@clube:~/projeto-do-clube$ git add lista.py

desbravador@clube:~/projeto-do-clube$ git commit -m "Cria o programa da lista de presença"
[main c1] Cria o programa da lista de presença
 1 arquivo(s) alterado(s)

desbravador@clube:~/projeto-do-clube$ git log --oneline
c1 Cria o programa da lista de presença`,
          'Salvar o arquivo não é commitar. O arquivo salvo está no disco; o commit está no histórico — e só o segundo sobrevive a você apagar a pasta sem querer.',
          ['commit', 'git add', 'git log']),
      ],
      questoes: [
        {
          id: 'cc003-m3-q1', type: 'multiple_choice',
          prompt: 'Qual é o prejuízo que mais dói quando não há controle de versão?',
          data: { options: [
            { id: 'a', text: 'Perder a explicação: não dá para saber o que mudou, quando e por quê.', correct: true },
            { id: 'b', text: 'Ocupar mais espaço em disco com várias cópias do mesmo arquivo.',
              porque: 'Espaço custa pouco. O que se perde e não se recupera é o registro do que mudou.' },
            { id: 'c', text: 'Deixar o computador mais lento por ter muitos arquivos parecidos.',
              porque: 'Alguns arquivos a mais não deixam máquina nenhuma lenta.' },
            { id: 'd', text: 'Não conseguir abrir os arquivos antigos em programas novos.',
              porque: 'Isso é compatibilidade de versões, e é outro assunto.' },
          ]},
          explanation: 'Seis meses depois ninguém lembra por que aquela linha está ali — e sem mensagem não há a quem perguntar.',
        },
        {
          id: 'cc003-m3-q2', type: 'multiple_choice',
          prompt: 'O que o git init faz?',
          data: { options: [
            { id: 'a', text: 'Cria uma pasta escondida .git, onde o histórico passa a ser guardado.', correct: true },
            { id: 'b', text: 'Envia os arquivos da pasta para um servidor na internet.',
              porque: 'Isso é push, e só acontece depois de configurar um remoto.' },
            { id: 'c', text: 'Registra a primeira versão de todos os arquivos da pasta.',
              porque: 'Ele não registra nada: o repositório nasce vazio, e o primeiro commit é seu.' },
            { id: 'd', text: 'Converte os arquivos para um formato que só o Git consegue ler.',
              porque: 'Seus arquivos continuam normais. O Git guarda cópias à parte.' },
          ]},
          explanation: 'A pasta continua a mesma; o que ela ganha é memória.',
        },
        {
          id: 'cc003-m3-q3', type: 'multiple_choice',
          prompt: 'Por que registrar tem dois passos — add e commit — em vez de um?',
          data: { options: [
            { id: 'a', text: 'Para você escolher o que entra no commit e deixar o resto de fora.', correct: true },
            { id: 'b', text: 'Porque o add copia o arquivo e o commit escreve a mensagem.',
              porque: 'A mensagem é do commit, mas o add não copia nada: ele marca o que vai entrar.' },
            { id: 'c', text: 'Porque o commit é lento e o add adianta metade do trabalho.',
              porque: 'Os dois são instantâneos. A razão é de controle, e não de velocidade.' },
            { id: 'd', text: 'Por herança de sistemas antigos, sem utilidade hoje.',
              porque: 'É um dos recursos mais usados do Git: registrar uma parte do trabalho de cada vez.' },
          ]},
          explanation: 'add prepara, commit registra. Entre os dois cabe a decisão do que guardar junto.',
        },
        {
          id: 'cc003-m3-q4', type: 'true_false',
          prompt: 'Salvar o arquivo no editor já o registra no histórico do repositório.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', porque: 'É falso. Salvar põe no disco; registrar no histórico pede git add e git commit.' },
            { id: 'b', text: 'Falso', correct: true },
          ]},
          explanation: 'É a confusão mais comum de quem começa — e a que faz o trabalho sumir.',
        },
        {
          id: 'cc003-m3-q5', type: 'multiple_choice',
          prompt: 'Qual destas é uma boa mensagem de commit?',
          data: { options: [
            { id: 'a', text: '"Corrige o nome que saía repetido na lista"', correct: true },
            { id: 'b', text: '"alterações"',
              porque: 'Todo commit é uma alteração. A mensagem existe para dizer qual.' },
            { id: 'c', text: '"teste 3"',
              porque: 'Daqui a seis meses ela não ajuda ninguém, nem você.' },
            { id: 'd', text: '"lista.py"',
              porque: 'O nome do arquivo o Git já sabe. O que falta é o que mudou nele.' },
          ]},
          explanation: 'A mensagem é lida por quem não estava lá — e às vezes esse alguém é você.',
        },
        {
          id: 'cc003-m3-q6', type: 'scenario',
          prompt: 'Você rodou git init, mas o Git não vê nenhum dos arquivos do projeto — a pasta parece vazia para ele. O comando não deu erro nenhum. O que houve?',
          data: { scenarios: [
            { id: 'a', text: 'O repositório foi criado numa pasta acima ou ao lado do projeto.', correct: true },
            { id: 'b', text: 'Os arquivos precisam ser criados depois do git init para serem vistos.', porque: 'Ele passa a olhar tudo o que está ali, inclusive o que já existia antes.' },
            { id: 'c', text: 'Faltou uma opção no comando para incluir os arquivos existentes.', porque: 'O git init não recebe lista de arquivos: ele prepara a pasta inteira.' },
            { id: 'd', text: 'O Git ignora arquivos até que alguém os abra pelo menos uma vez.', porque: 'Ele não depende de ninguém abrir nada. O que ele olha é o diretório onde foi iniciado.' },
          ]},
          explanation: 'O git init funciona em qualquer lugar, e é isso que torna o engano silencioso. Rodar pwd antes é a linha que evita a tarde perdida.',
        },
        {
          id: 'cc003-m3-q7', type: 'multiple_choice',
          prompt: 'Você mudou dois arquivos e quer registrar só um deles agora. O que os dois passos do Git permitem?',
          data: { options: [
            { id: 'a', text: 'Preparar apenas esse arquivo e registrar só o que foi preparado.', correct: true },
            { id: 'b', text: 'Registrar tudo e depois apagar do histórico o que não devia entrar.', porque: 'Mexer no histórico depois é trabalhoso e arriscado. Escolher antes é o que os dois passos oferecem.' },
            { id: 'c', text: 'Registrar os dois, já que o commit sempre guarda a pasta inteira.', porque: 'Ele guarda o que foi preparado, e não tudo o que mudou. É essa a diferença entre os dois passos.' },
            { id: 'd', text: 'Guardar o segundo arquivo numa pasta à parte até a hora certa.', porque: 'Tirar o arquivo do lugar é a saída caseira que o controle de versão veio substituir.' },
          ]},
          explanation: 'Os dois passos existem para separar o que se guarda do que se deixa para depois. Sem eles, todo registro seria a pasta inteira do jeito que ela estivesse.',
        },
        {
          id: 'cc003-m3-q8', type: 'true_false',
          prompt: 'O maior prejuízo de não guardar versões é perder o arquivo.',
          data: { options: [
            { id: 'v', text: 'Verdadeiro', porque: 'Arquivo raramente se perde. O que se perde é a explicação: seis meses depois ninguém lembra por que aquela linha está ali.' },
            { id: 'f', text: 'Falso', correct: true },
          ]},
          explanation: 'Sem a mensagem do commit não há a quem perguntar. É por isso que a frase escrita na hora vale tanto quanto a cópia guardada.',
        },
      ],
    },
    {
      id: 'm3-lab',
      tipo: 'terminal',
      titulo: 'Registrando as primeiras versões',
      resumo: 'Iniciar o repositório, preparar, registrar cinco commits e ler o histórico.',
      verificacoes: ['iniciou', 'preparou', 'cinco-commits', 'viu-historico'],
    },
  ],
};

/* ── Módulo 4 ──────────────────────────────────────────────────────────────── */

const M4: ModuloDeVereda = {
  id: 'm4',
  titulo: 'Desfazer e experimentar',
  resumo: 'Voltar atrás no que ainda não foi registrado, e trabalhar num ramo sem mexer no principal.',
  licoes: [
    {
      id: 'm4-teoria',
      tipo: 'teoria',
      perguntas: 5,
      titulo: 'Errar sem medo',
      resumo: 'O que o histórico devolve, e por que existe mais de uma linha do tempo.',
      topicos: [
        t('desfazer', 'Desfazer o que ainda não foi registrado',
          'O commit vira uma rede de segurança.',
          [
            'Você mexeu num arquivo, estragou, e quer voltar. Se houve um commit antes, o Git tem o estado bom guardado — e devolvê-lo é um comando.',
            '`git status` mostra o que está diferente do último commit. `git restore arquivo` devolve aquele arquivo ao que o commit registrou.',
            'Isso vale só para o que **ainda não foi registrado**. Depois do commit, voltar atrás é outra história e outros comandos — e é justamente por isso que commitar cedo e com frequência compensa.',
          ],
          `desbravador@clube:~/projeto-do-clube$ git status
No ramo main

Mudanças não preparadas / arquivos não rastreados:
	lista.py

desbravador@clube:~/projeto-do-clube$ git restore lista.py

desbravador@clube:~/projeto-do-clube$ git status
No ramo main
nada a submeter, árvore de trabalho limpa`,
          'O `restore` apaga o que você escreveu desde o último commit, sem pedir confirmação. Ele é a rede de segurança e a serra elétrica ao mesmo tempo — confira com `git status` antes.',
          ['git status', 'git restore']),

        t('ramo', 'Ramo',
          'Uma linha do tempo paralela, para experimentar.',
          [
            'Um `ramo` (em inglês, *branch*) é uma linha do tempo separada dentro do mesmo repositório. Você sai do principal, mexe à vontade, e o principal continua exatamente como estava.',
            'Serve para experimentar sem risco: se a ideia der certo, você junta; se não der, você abandona o ramo e nada aconteceu com o principal.',
            'O ramo principal costuma se chamar `main`. `git checkout -b experimento` cria um novo e já entra nele; `git checkout main` volta. Ao voltar, os arquivos voltam ao estado do main — o trabalho não sumiu, está no outro ramo.',
          ],
          `desbravador@clube:~/projeto-do-clube$ git checkout -b experimento
Mudou para o novo ramo 'experimento'

  ... mexe, git add, git commit ...

desbravador@clube:~/projeto-do-clube$ git checkout main
Mudou para o ramo 'main'

desbravador@clube:~/projeto-do-clube$ git branch
  experimento
* main`,
          'Ao trocar de ramo, os arquivos na tela mudam junto. Quem não sabe disso acha que perdeu o trabalho — ele está no outro ramo, e volta assim que você voltar para lá.',
          ['ramo', 'branch', 'checkout -b']),

        t('mesclar', 'Mesclar',
          'Trazer o trabalho do ramo de volta para o principal.',
          [
            '`Mesclar` (*merge*) é juntar o que foi feito num ramo com o outro. Você volta para o principal e manda trazer.',
            'A ordem importa e confunde: quem recebe é o ramo em que você **está**. `git merge experimento`, estando no main, traz o experimento para o main.',
            'O Git junta sozinho quando as mudanças não se atropelam. Quando duas pessoas mexeram na mesma linha, ele para e pede que alguém escolha — é o que se chama conflito, e resolvê-lo é trabalho humano.',
          ],
          `desbravador@clube:~/projeto-do-clube$ git checkout main
Mudou para o ramo 'main'

desbravador@clube:~/projeto-do-clube$ git merge experimento
Merge feito por 'recursive'.
 1 arquivo(s) do ramo experimento`,
          'Mesclar estando no ramo errado leva o principal para dentro do experimento, e não o contrário. Rode `git branch` antes: o asterisco diz quem vai receber.',
          ['merge', 'conflito']),
      ],
      questoes: [
        {
          id: 'cc003-m4-q1', type: 'multiple_choice',
          prompt: 'O git restore devolve um arquivo a qual estado?',
          data: { options: [
            { id: 'a', text: 'Ao que o último commit registrou.', correct: true },
            { id: 'b', text: 'Ao estado em que ele estava quando o editor foi aberto.',
              porque: 'O Git não sabe nada sobre o seu editor. A referência dele é o commit.' },
            { id: 'c', text: 'Ao arquivo vazio, apagando tudo o que havia nele.',
              porque: 'Ele restaura o conteúdo registrado, e não apaga.' },
            { id: 'd', text: 'Ao estado de dez minutos atrás, guardado automaticamente.',
              porque: 'Não há salvamento automático: o que existe é o que foi commitado.' },
          ]},
          explanation: 'Sem commit anterior não há para onde voltar — e é por isso que commitar cedo compensa.',
        },
        {
          id: 'cc003-m4-q2', type: 'multiple_choice',
          prompt: 'Para que serve um ramo?',
          data: { options: [
            { id: 'a', text: 'Para experimentar numa linha do tempo separada, sem mexer no principal.', correct: true },
            { id: 'b', text: 'Para guardar uma cópia de segurança dos arquivos do projeto.',
              porque: 'Cópia de segurança é backup, e mora fora do repositório. Ramo é linha do tempo.' },
            { id: 'c', text: 'Para dividir o projeto em pastas por assunto.',
              porque: 'Dividir em pastas é organização de disco, e independe do Git.' },
            { id: 'd', text: 'Para dar permissão a outra pessoa mexer só numa parte do projeto.',
              porque: 'Permissão é do serviço remoto, e não do ramo.' },
          ]},
          explanation: 'Se a ideia der certo, você mescla; se não der, abandona o ramo e nada aconteceu.',
        },
        {
          id: 'cc003-m4-q3', type: 'multiple_choice',
          prompt: 'Você está no main e roda git merge experimento. O que acontece?',
          data: { options: [
            { id: 'a', text: 'O trabalho do experimento é trazido para o main.', correct: true },
            { id: 'b', text: 'O main é levado para dentro do experimento.',
              porque: 'É o contrário: quem recebe é o ramo em que você está.' },
            { id: 'c', text: 'Os dois ramos viram um só, e o experimento deixa de existir.',
              porque: 'O ramo continua existindo depois da mesclagem, até alguém apagá-lo.' },
            { id: 'd', text: 'Nada, porque merge só funciona entre repositórios diferentes.',
              porque: 'Merge junta ramos do mesmo repositório. Entre repositórios é o pull.' },
          ]},
          explanation: 'Quem recebe é onde você está — e o asterisco do git branch diz quem é.',
        },
        {
          id: 'cc003-m4-q4', type: 'true_false',
          prompt: 'Ao trocar de ramo, os arquivos na sua pasta mudam para o estado daquele ramo.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso', porque: 'É verdadeiro — e quem não sabe disso acha que perdeu o trabalho ao voltar para o main.' },
          ]},
          explanation: 'Nada se perdeu: o trabalho está no outro ramo, e volta quando você voltar para lá.',
        },
        {
          id: 'cc003-m4-q5', type: 'multiple_choice',
          prompt: 'O que é um conflito de mesclagem?',
          data: { options: [
            { id: 'a', text: 'Duas mudanças na mesma linha, e o Git não tem como escolher sozinho.', correct: true },
            { id: 'b', text: 'Dois ramos com o mesmo nome dentro do repositório.',
              porque: 'O Git recusa criar dois ramos com o mesmo nome — isso nem chega a acontecer.' },
            { id: 'c', text: 'Um commit sem mensagem, que o Git não consegue registrar.',
              porque: 'Commit sem mensagem é recusado na hora, e não vira conflito.' },
            { id: 'd', text: 'Um arquivo grande demais para caber no repositório.',
              porque: 'Tamanho é limite de serviço, e nada tem a ver com mesclagem.' },
          ]},
          explanation: 'Quando as mudanças não se atropelam, ele junta sozinho. Quando se atropelam, alguém precisa decidir.',
        },
        {
          id: 'cc003-m4-q6', type: 'scenario',
          prompt: 'Você trocou para o ramo main e os arquivos na tela voltaram ao estado antigo. O trabalho da tarde sumiu?',
          data: { scenarios: [
            { id: 'a', text: 'Não: ele está no outro ramo, e volta quando você voltar para lá.', correct: true },
            { id: 'b', text: 'Sim, porque trocar de ramo descarta o que não foi mesclado.', porque: 'Trocar de ramo não descarta nada que tenha sido registrado. Cada ramo guarda a sua linha do tempo.' },
            { id: 'c', text: 'Sim, e a saída é refazer o trabalho direto no main.', porque: 'Refazer seria jogar fora o que já existe. O trabalho está guardado, e basta voltar ao ramo dele.' },
            { id: 'd', text: 'Não, mas ele só volta depois de mesclar os dois ramos.', porque: 'Mesclar traz o trabalho para o main. Para vê-lo de novo como estava, basta voltar ao ramo em que ele foi feito.' },
          ]},
          explanation: 'Ao trocar de ramo os arquivos na tela mudam junto, e é isso que assusta. O que estava registrado continua onde foi registrado.',
        },
        {
          id: 'cc003-m4-q7', type: 'multiple_choice',
          prompt: 'Antes de mesclar, você roda git branch e vê o asterisco ao lado de experimento. O que isso significa para o merge que você ia fazer?',
          data: { options: [
            { id: 'a', text: 'Que quem receberia o trabalho é o experimento, e não o main.', correct: true },
            { id: 'b', text: 'Que o experimento já foi mesclado e não há mais o que trazer.', porque: 'O asterisco diz onde você está agora. Ele não conta nada sobre mesclagens anteriores.' },
            { id: 'c', text: 'Que o experimento é o ramo principal deste repositório.', porque: 'O principal costuma se chamar main, e o asterisco não o aponta: ele aponta o ramo atual.' },
            { id: 'd', text: 'Que faltam commits no experimento antes de poder mesclar.', porque: 'O asterisco nada diz sobre commits pendentes. Quem mostra isso é o git status.' },
          ]},
          explanation: 'Quem recebe é o ramo em que você está. Mesclar do lado errado leva o principal para dentro do experimento — o contrário do que se queria.',
        },
        {
          id: 'cc003-m4-q8', type: 'true_false',
          prompt: 'O git restore pede confirmação antes de descartar o que você escreveu desde o último commit.',
          data: { options: [
            { id: 'v', text: 'Verdadeiro', porque: 'Ele devolve o arquivo ao estado registrado sem perguntar nada. O que estava escrito e não foi commitado se perde.' },
            { id: 'f', text: 'Falso', correct: true },
          ]},
          explanation: 'Ele é a rede de segurança e a serra elétrica ao mesmo tempo. Conferir com git status antes é a linha que separa uma coisa da outra.',
        },
      ],
    },
    {
      id: 'm4-lab',
      tipo: 'terminal',
      titulo: 'Desfazendo e trabalhando num ramo',
      resumo: 'Restaurar um arquivo estragado, criar um ramo, registrar nele e mesclar de volta.',
      verificacoes: ['desfez', 'criou-ramo', 'trabalhou-no-ramo', 'mesclou'],
    },
  ],
};

/* ── Módulo 5 ──────────────────────────────────────────────────────────────── */

const M5: ModuloDeVereda = {
  id: 'm5',
  titulo: 'O repositório que fica longe',
  resumo: 'Publicar o histórico num serviço e trazer o que outra pessoa registrou.',
  licoes: [
    {
      id: 'm5-teoria',
      tipo: 'teoria',
      perguntas: 4,
      titulo: 'Trabalhar com outras pessoas',
      resumo: 'O que é um remoto, e por que enviar e receber são dois comandos.',
      topicos: [
        t('remoto', 'Repositório remoto',
          'O mesmo histórico, guardado noutro computador.',
          [
            'Até aqui o repositório está só na sua máquina. Um `repositório remoto` é uma cópia dele guardada noutro lugar — num serviço como o GitHub, ou no servidor de uma empresa.',
            'Ele serve para duas coisas ao mesmo tempo, e as duas importam: é a cópia que sobrevive se o seu computador se perder, e é o ponto de encontro por onde várias pessoas trabalham no mesmo projeto.',
            '`git remote add origin <endereço>` diz ao repositório onde fica esse outro lugar. `origin` é só o apelido do endereço — é o nome que quase todo mundo usa para o remoto principal.',
          ],
          `desbravador@clube:~/projeto-do-clube$ git remote add origin https://exemplo/clube.git

desbravador@clube:~/projeto-do-clube$ git remote -v
origin	https://exemplo/clube.git`,
          'Repositório remoto **não é backup do seu trabalho de hoje**: ele só tem o que você já enviou. O que está no disco sem commit, ou commitado sem envio, existe num lugar só.',
          ['repositório remoto', 'origin', 'git remote']),

        t('enviar-receber', 'Enviar e receber',
          'push leva, pull traz.',
          [
            '`git push` envia os commits que o remoto ainda não tem. `git pull` traz os que você ainda não tem.',
            'São dois comandos porque são duas decisões: você escolhe quando publicar o seu trabalho, e escolhe quando trazer o dos outros. Nada acontece sozinho.',
            'O push só leva o que foi **commitado**. Arquivo salvo e não registrado não sai da sua máquina — e esse é o engano que faz alguém jurar que enviou.',
          ],
          `desbravador@clube:~/projeto-do-clube$ git push
Para https://exemplo/clube.git
 * [novo ramo]      main -> main

desbravador@clube:~/projeto-do-clube$ git pull
De https://exemplo/clube.git
   r5  main -> origin/main
Atualizando arquivos: 1 alterado`,
          'Quando outra pessoa enviou algo antes de você, o seu push é recusado. Não é erro: é o Git avisando que você precisa trazer o que ela fez, com `git pull`, antes de mandar o seu.',
          ['git push', 'git pull']),
      ],
      questoes: [
        {
          id: 'cc003-m5-q1', type: 'multiple_choice',
          prompt: 'O que é o "origin" num repositório?',
          data: { options: [
            { id: 'a', text: 'O apelido do endereço do repositório remoto principal.', correct: true },
            { id: 'b', text: 'O nome do ramo em que o projeto começou.',
              porque: 'O ramo inicial costuma se chamar main. origin é apelido de endereço, e não de ramo.' },
            { id: 'c', text: 'O primeiro commit do repositório, de onde tudo saiu.',
              porque: 'O primeiro commit não tem nome especial: é um commit como os outros.' },
            { id: 'd', text: 'A pessoa que criou o repositório.',
              porque: 'Autoria fica em cada commit. origin é o lugar, e não quem.' },
          ]},
          explanation: 'Podia se chamar qualquer coisa — origin é só o costume.',
        },
        {
          id: 'cc003-m5-q2', type: 'multiple_choice',
          prompt: 'Você salvou o arquivo, deu git push, e o colega diz que não recebeu nada. O que faltou?',
          data: { options: [
            { id: 'a', text: 'Registrar com git add e git commit: o push só leva o que está commitado.', correct: true },
            { id: 'b', text: 'Esperar mais tempo, porque o envio demora a aparecer do outro lado.',
              porque: 'O push é imediato. Se ele terminou, o que havia para enviar já foi.' },
            { id: 'c', text: 'Dar git pull antes, para sincronizar o arquivo salvo.',
              porque: 'Pull traz o dos outros. Ele não transforma arquivo salvo em commit.' },
            { id: 'd', text: 'Configurar de novo o remoto, porque ele expira.',
              porque: 'O remoto não expira. O que faltou foi o commit.' },
          ]},
          explanation: 'Salvo, commitado e enviado são três estados diferentes — e o push só conhece o terceiro.',
        },
        {
          id: 'cc003-m5-q3', type: 'true_false',
          prompt: 'Ter um repositório remoto garante que todo o seu trabalho de hoje está a salvo.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', porque: 'É falso. Ele só tem o que você enviou — o resto existe num lugar só.' },
            { id: 'b', text: 'Falso', correct: true },
          ]},
          explanation: 'É a mesma pergunta do backup: se este computador sumisse agora, o que sumiria junto?',
        },
        {
          id: 'cc003-m5-q4', type: 'multiple_choice',
          prompt: 'Seu push foi recusado porque o remoto tem commits que você não tem. O que fazer?',
          data: { options: [
            { id: 'a', text: 'Trazer o que falta com git pull e depois enviar de novo.', correct: true },
            { id: 'b', text: 'Forçar o envio, para que a sua versão substitua a do remoto.',
              porque: 'Existe como forçar, e ele apaga o trabalho da outra pessoa. É a última coisa a fazer, e não a primeira.' },
            { id: 'c', text: 'Apagar o repositório local e clonar de novo.',
              porque: 'Isso joga fora o seu trabalho para resolver algo que um pull resolve.' },
            { id: 'd', text: 'Criar um repositório remoto novo, só seu.',
              porque: 'Aí passam a existir dois históricos separados, e o problema fica maior.' },
          ]},
          explanation: 'A recusa não é erro: é o Git protegendo o trabalho de quem chegou antes.',
        },
        {
          id: 'cc003-m5-q5', type: 'multiple_choice',
          prompt: 'Por que enviar e receber são dois comandos, em vez de um só que sincroniza tudo?',
          data: { options: [
            { id: 'a', text: 'Porque são duas decisões: quando publicar, e quando trazer.', correct: true },
            { id: 'b', text: 'Porque o Git precisa de um comando para cada direção da rede.', porque: 'Não é limitação técnica: outros programas sincronizam nos dois sentidos de uma vez. Aqui a escolha é sua de propósito.' },
            { id: 'c', text: 'Porque enviar exige senha e receber não, e por isso se separam.', porque: 'Os dois podem exigir credencial. O que os separa é quem decide a hora de cada um.' },
            { id: 'd', text: 'Porque o comando único existe e é o recomendado hoje.', porque: 'O trabalho continua sendo enviado e recebido por dois comandos, e é assim que se acompanha o que entra.' },
          ]},
          explanation: 'Nada acontece sozinho: você publica quando o seu trabalho está pronto para ser visto, e traz o dos outros quando está pronto para recebê-lo.',
        },
        {
          id: 'cc003-m5-q6', type: 'scenario',
          prompt: 'O computador do clube foi formatado. Você tinha commitado tudo, mas não deu push desde ontem. O que sobrou no remoto?',
          data: { scenarios: [
            { id: 'a', text: 'Só o que foi enviado até o último push — o de hoje se perdeu.', correct: true },
            { id: 'b', text: 'Tudo, porque o commit já grava a cópia no repositório remoto.', porque: 'O commit grava na sua máquina. O remoto só recebe quando alguém envia.' },
            { id: 'c', text: 'Nada, porque o remoto é apagado quando a máquina de origem some.', porque: 'Ele é independente e continua lá, com tudo o que recebeu antes.' },
            { id: 'd', text: 'Tudo, desde que o remoto tenha sido configurado com origin.', porque: 'Configurar diz para onde enviar. Enviar continua sendo um passo à parte.' },
          ]},
          explanation: 'Repositório remoto não é backup do trabalho de hoje: ele tem o que você já mandou. Entre o commit e o push, o trabalho existe num lugar só.',
        },
        {
          id: 'cc003-m5-q7', type: 'true_false',
          prompt: 'O push recusado por causa de commits que você não tem é sinal de que algo quebrou no repositório.',
          data: { options: [
            { id: 'v', text: 'Verdadeiro', porque: 'Nada quebrou: é o Git avisando que outra pessoa enviou antes. Traga o que ela fez e mande o seu depois.' },
            { id: 'f', text: 'Falso', correct: true },
          ]},
          explanation: 'A recusa protege o trabalho do outro. Sem ela, o envio de um apagaria o do outro sem ninguém perceber.',
        },
      ],
    },
    {
      id: 'm5-lab',
      tipo: 'terminal',
      titulo: 'Publicando e recebendo alterações',
      resumo: 'Apontar o remoto, enviar o que foi registrado, e trazer o que outra pessoa fez.',
      verificacoes: ['apontou', 'enviou', 'recebeu'],
    },
  ],
};

/* ── Módulo 6 ──────────────────────────────────────────────────────────────── */

const M6: ModuloDeVereda = {
  id: 'm6',
  titulo: 'O README',
  resumo: 'Markdown, e o arquivo que explica o projeto para quem chega nele.',
  licoes: [
    {
      id: 'm6-teoria',
      tipo: 'teoria',
      perguntas: 4,
      titulo: 'Escrever para quem vai chegar depois',
      resumo: 'O que é Markdown, as quatro marcações que importam, e o que um README precisa dizer.',
      topicos: [
        t('markdown', 'Markdown',
          'Formatar escrevendo, sem botão nenhum.',
          [
            '`Markdown` é um jeito de formatar texto escrevendo símbolos no meio dele. Uma cerquilha faz um título, um traço faz um item de lista, e o arquivo continua sendo texto puro — legível mesmo sem nenhum programa que o entenda.',
            'É por isso que ele venceu: um arquivo `.md` abre em qualquer editor, cabe num repositório, e o Git consegue mostrar o que mudou linha por linha — coisa que um `.docx` não permite.',
            'O nome do arquivo é `README.md`, em maiúsculas, por convenção antiga: assim ele aparece no alto da lista, e todo serviço de repositório sabe mostrá-lo na página do projeto.',
          ],
          `# Lista de presença

Programa que guarda os nomes da unidade e imprime a chamada.

## Como usar

- Rode com \`python3 lista.py\`
- Digite um nome por linha

Feito para a [especialidade de Computação](https://exemplo/ap041).`,
          'Markdown não é Word. Ele não centraliza, não muda cor e não escolhe fonte — e é justamente por isso que ele funciona em qualquer lugar.',
          ['Markdown', 'README.md']),

        t('marcacoes', 'As quatro marcações que o requisito pede',
          'Título, lista, código e link.',
          [
            '`Título`: uma cerquilha e um espaço no começo da linha. Duas cerquilhas fazem um subtítulo, e assim por diante.',
            '`Lista`: cada item numa linha, começando com traço e espaço. Um item sozinho não é lista.',
            '`Código`: entre crases. Uma crase de cada lado para um trecho no meio da frase; três crases numa linha própria para um bloco inteiro. Serve para o leitor ver o que é para digitar e o que é para ler.',
            '`Link`: o texto entre colchetes e o endereço entre parênteses, colados, sem espaço entre eles.',
          ],
          `# Título

## Subtítulo

- primeiro item
- segundo item

Rode com \`python3 lista.py\` no terminal.

[Documentação do Python](https://docs.python.org/pt-br/3/)`,
          'O erro mais comum no link é pôr um espaço entre o colchete e o parêntese. Com o espaço, o Markdown não reconhece e imprime tudo cru — e passa despercebido porque o texto continua lá.',
          ['título', 'lista', 'código', 'link']),
      ],
      questoes: [
        {
          id: 'cc003-m6-q1', type: 'multiple_choice',
          prompt: 'Por que o README de um projeto é escrito em Markdown, e não num documento de editor de texto?',
          data: { options: [
            { id: 'a', text: 'Porque é texto puro: cabe no repositório e o Git mostra o que mudou linha por linha.', correct: true },
            { id: 'b', text: 'Porque o Markdown permite mais formatação do que um editor de texto.',
              porque: 'É o contrário: ele permite bem menos, de propósito.' },
            { id: 'c', text: 'Porque documentos de editor não podem ser guardados em repositório.',
              porque: 'Podem — só que o Git não consegue mostrar o que mudou dentro deles.' },
            { id: 'd', text: 'Porque o Markdown é o único formato que os navegadores abrem.',
              porque: 'Navegador abre HTML. Markdown é convertido antes de chegar lá.' },
          ]},
          explanation: 'Ser texto puro é o que faz o histórico do arquivo ser legível.',
        },
        {
          id: 'cc003-m6-q2', type: 'multiple_choice',
          prompt: 'Como se escreve um link em Markdown?',
          data: { options: [
            { id: 'a', text: '[texto](endereço), colados, sem espaço entre eles.', correct: true },
            { id: 'b', text: '(texto)[endereço], com os parênteses primeiro.',
              porque: 'É na ordem inversa: colchetes para o texto, parênteses para o endereço.' },
            { id: 'c', text: '<a href="endereço">texto</a>, como no HTML.',
              porque: 'Isso é HTML. Markdown existe justamente para não precisar dele.' },
            { id: 'd', text: 'Escrevendo só o endereço: o Markdown transforma sozinho.',
              porque: 'Alguns serviços fazem isso, e não é Markdown — e assim não há texto para clicar.' },
          ]},
          explanation: 'Um espaço entre o ] e o ( já basta para o Markdown não reconhecer.',
        },
        {
          id: 'cc003-m6-q3', type: 'matching',
          prompt: 'Ligue cada marcação ao que ela produz.',
          data: { pairs: [
            { left: '# Alguma coisa', right: 'Um título' },
            { left: '- Alguma coisa', right: 'Um item de lista' },
            { left: 'Entre crases', right: 'Um trecho de código' },
            { left: '[texto](endereço)', right: 'Um link' },
          ]},
          explanation: 'Quatro símbolos resolvem quase todo README que existe.',
        },
        {
          id: 'cc003-m6-q4', type: 'true_false',
          prompt: 'Um arquivo Markdown continua legível mesmo aberto num editor que não entende Markdown.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso', porque: 'É verdadeiro: ele é texto puro, e as marcações são símbolos comuns no meio do texto.' },
          ]},
          explanation: 'É essa a diferença em relação a um formato binário — e a razão de ele ter vencido.',
        },
        {
          id: 'cc003-m6-q5', type: 'scenario',
          prompt: 'No README publicado, o link do seu projeto apareceu escrito cru, com os colchetes e os parênteses à mostra. No arquivo ele parece certo. O que procurar?',
          data: { scenarios: [
            { id: 'a', text: 'Um espaço entre o colchete que fecha e o parêntese que abre.', correct: true },
            { id: 'b', text: 'O endereço, que precisa começar com https para ser reconhecido.', porque: 'Markdown aceita endereço de qualquer forma, inclusive caminho de arquivo do próprio projeto.' },
            { id: 'c', text: 'A ordem das partes: o endereço vem antes do texto.', porque: 'A ordem é texto e depois endereço, e foi assim que você escreveu. O que quebra é o espaço no meio.' },
            { id: 'd', text: 'O nome do arquivo, que precisa terminar em .md para valer.', porque: 'Se a extensão estivesse errada, nenhuma marcação da página funcionaria — e os títulos apareceram.' },
          ]},
          explanation: 'Esse erro passa despercebido porque o texto continua lá, legível. Só o clique é que não existe mais.',
        },
        {
          id: 'cc003-m6-q6', type: 'multiple_choice',
          prompt: 'Por que o nome do arquivo é README.md, em maiúsculas?',
          data: { options: [
            { id: 'a', text: 'Por convenção: assim ele sobe no topo da lista e os serviços o exibem.', correct: true },
            { id: 'b', text: 'Porque o Markdown só é interpretado em arquivos com nome em maiúsculas.', porque: 'A marcação funciona em qualquer arquivo .md, com qualquer nome.' },
            { id: 'c', text: 'Porque o Git recusa versionar arquivos de documentação em minúsculas.', porque: 'O Git guarda qualquer arquivo, com qualquer nome. Ele não trata documentação de forma especial.' },
            { id: 'd', text: 'Porque o terminal precisa disso para diferenciá-lo dos arquivos de código.', porque: 'O terminal não separa nada por maiúscula. Quem separa é a extensão, e mesmo assim só para quem lê.' },
          ]},
          explanation: 'Convenção antiga, e ainda útil: é o primeiro arquivo que aparece, e é o que a página do projeto mostra sozinha para quem chega.',
        },
        {
          id: 'cc003-m6-q7', type: 'true_false',
          prompt: 'Um documento de editor de texto serviria igualmente bem como README de um projeto.',
          data: { options: [
            { id: 'v', text: 'Verdadeiro', porque: 'O Git não consegue mostrar o que mudou linha por linha nele, e ele não abre em qualquer lugar. O texto puro faz as duas coisas.' },
            { id: 'f', text: 'Falso', correct: true },
          ]},
          explanation: 'Markdown não centraliza, não muda cor e não escolhe fonte — e é por isso que ele funciona em qualquer editor e cabe bem no histórico.',
        },
      ],
    },
    {
      id: 'm6-lab',
      tipo: 'terminal',
      titulo: 'Escrevendo o README do projeto',
      resumo: 'Criar o arquivo, escrever título, lista, código e link, e registrar no repositório.',
      verificacoes: ['existe', 'titulo', 'lista', 'codigo', 'link', 'registrado'],
    },
  ],
};

/* ── Módulo 7 ──────────────────────────────────────────────────────────────── */

const M7: ModuloDeVereda = {
  id: 'm7',
  titulo: 'Contar a história do projeto',
  resumo: 'Ler um histórico em voz alta — a apresentação que fecha a vereda.',
  licoes: [
    {
      id: 'm7-teoria',
      tipo: 'teoria',
      perguntas: 3,
      titulo: 'Apresentando o histórico ao examinador',
      resumo: 'O que dizer sobre cada commit, e por que essa é a parte que ninguém treina.',
      topicos: [
        t('o-que-e', 'O último requisito acontece fora daqui',
          'A conversa é com uma pessoa, e a plataforma não confere nada dela.',
          [
            'O requisito 8 pede que você apresente ao examinador o histórico do repositório da vereda CC002, explicando o que cada commit modificou. Isso é conversa com gente, e nenhuma tela confere conversa.',
            'O que esta lição faz é preparar. Escrever o programa é uma coisa; explicar por que ele ficou daquele jeito é outra, e é a segunda que separa quem entendeu de quem copiou.',
            'Vale o mesmo que já valeu na CC001 e na CC002: copiar código é possível, e explicar código copiado, não.',
          ],
          `O que o examinador vai ver:

  git log --oneline

  c5  Escreve o README explicando o programa
  c4  Acrescenta a contagem de faltas
  c3  Corrige o nome que saía repetido
  c2  Lê os nomes de um arquivo
  c1  Cria o programa da lista de presença`,
          'Não decore o que dizer. Rode `git log` na frente do examinador e leia dali — é isso que a apresentação é, e é assim que se faz numa reunião de equipe de verdade.',
          ['apresentação', 'git log']),

        t('como-contar', 'Como se conta um histórico',
          'Três frases por commit, e elas se leem do próprio log.',
          [
            'Para cada commit, diga três coisas: **o que mudou**, **por que mudou** e **como você percebeu que precisava mudar**. A primeira está na mensagem; as outras duas estão na sua memória, e é para elas que a preparação serve.',
            'Exemplo: "Este corrige o nome que saía repetido. Eu tinha esquecido de limpar a lista antes de encher de novo — descobri porque a chamada mostrava a Ana duas vezes."',
            'Vá do mais antigo para o mais novo, e não ao contrário. O `git log` mostra do mais novo primeiro, mas a história se conta na ordem em que aconteceu.',
          ],
          `Um commit, três frases:

  c3  Corrige o nome que saía repetido

  O que mudou:   limpei a lista antes de preencher de novo
  Por que:       a chamada mostrava a mesma pessoa duas vezes
  Como percebi:  rodei com a unidade inteira e a Ana apareceu duas vezes`,
          'Commit com mensagem ruim aparece agora. Se você chegar num "teste 3" e não souber o que ele fez, essa é a lição do requisito — e ela vale mais do que a apresentação.',
          ['o que mudou', 'por que', 'como percebi']),
      ],
      questoes: [
        {
          id: 'cc003-m7-q1', type: 'multiple_choice',
          prompt: 'Qual é a melhor forma de apresentar o histórico ao examinador?',
          data: { options: [
            { id: 'a', text: 'Rodar git log na frente dele e ir explicando commit por commit.', correct: true },
            { id: 'b', text: 'Decorar a lista de commits e recitá-la de memória.',
              porque: 'Decorar mede memória. O log está ali para ser lido — é o que se faz numa reunião de verdade.' },
            { id: 'c', text: 'Entregar um documento impresso com a lista, sem falar nada.',
              porque: 'O requisito pede apresentar e explicar, e explicação é falada.' },
            { id: 'd', text: 'Mostrar só o commit mais recente, que representa o estado final.',
              porque: 'O requisito é sobre o histórico: o que interessa é o caminho, e não só onde ele chegou.' },
          ]},
          explanation: 'Ler o log na hora é o que se faz de verdade, e é o que a apresentação treina.',
        },
        {
          id: 'cc003-m7-q2', type: 'multiple_choice',
          prompt: 'Além do que mudou, o que mais vale dizer sobre cada commit?',
          data: { options: [
            { id: 'a', text: 'Por que mudou, e como você percebeu que precisava mudar.', correct: true },
            { id: 'b', text: 'Quantas linhas foram alteradas em cada arquivo.',
              porque: 'O número não explica nada: dez linhas podem ser um detalhe e uma linha pode ser a correção inteira.' },
            { id: 'c', text: 'Em que dia e a que horas o commit foi feito.',
              porque: 'A data está no log e não ajuda quem ouve a entender a decisão.' },
            { id: 'd', text: 'Quanto tempo você levou escrevendo aquela parte.',
              porque: 'Tempo gasto não é o que o requisito pede — ele pede o que mudou e por quê.' },
          ]},
          explanation: 'A mensagem dá a primeira; as outras duas estão com você, e é para elas que se prepara.',
        },
        {
          id: 'cc003-m7-q3', type: 'true_false',
          prompt: 'A história se conta do commit mais antigo para o mais novo, e não na ordem em que o git log mostra.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso', porque: 'É verdadeiro: o log mostra do mais novo primeiro, e a história aconteceu ao contrário disso.' },
          ]},
          explanation: 'O log é uma pilha; a história é uma linha. Conte-a na ordem em que ela aconteceu.',
        },
        {
          id: 'cc003-m7-q4', type: 'scenario',
          prompt: 'Ensaiando a apresentação, você chega a um commit chamado "teste 3" e não lembra o que ele mudou. O que isso ensina?',
          data: { scenarios: [
            { id: 'a', text: 'Que a mensagem é escrita para depois, e essa não foi.', correct: true },
            { id: 'b', text: 'Que o commit deveria ser apagado do histórico antes de apresentar.', porque: 'Apagar esconde o que aconteceu. O histórico serve justamente para mostrar o percurso, inclusive os tropeços.' },
            { id: 'c', text: 'Que faltou registrar commits menores naquele trecho do trabalho.', porque: 'O tamanho não é o problema aqui. Um commit pequeno com mensagem vazia continua não dizendo nada.' },
            { id: 'd', text: 'Que a apresentação deve começar pelos commits mais recentes.', porque: 'A ordem da fala não recupera o que a mensagem não guardou.' },
          ]},
          explanation: 'A mensagem é lida por quem não estava lá — e às vezes esse alguém é você, três semanas depois. Perceber isso na hora de contar vale mais do que a apresentação.',
        },
        {
          id: 'cc003-m7-q5', type: 'multiple_choice',
          prompt: 'Das três coisas a dizer sobre cada commit, qual já está escrita no próprio histórico?',
          data: { options: [
            { id: 'a', text: 'O que mudou, que é o que a mensagem registra.', correct: true },
            { id: 'b', text: 'Por que mudou, já que a mensagem explica o motivo.', porque: 'Uma boa mensagem diz o que mudou. O motivo costuma ficar na sua memória, e é por isso que se prepara.' },
            { id: 'c', text: 'Como você percebeu, porque o histórico guarda o erro anterior.', porque: 'O histórico guarda estados, e não como você chegou a suspeitar de um deles.' },
            { id: 'd', text: 'Nenhuma: as três dependem inteiramente da sua memória.', porque: 'Uma delas está registrada e se lê na hora — é justamente por isso que se apresenta com o log aberto.' },
          ]},
          explanation: 'Por isso não se decora a apresentação: roda-se o log na frente do examinador e lê-se dali, acrescentando as duas frases que a tela não tem.',
        },
        {
          id: 'cc003-m7-q6', type: 'true_false',
          prompt: 'Convém decorar a apresentação antes de encontrar o examinador.',
          data: { options: [
            { id: 'v', text: 'Verdadeiro', porque: 'O histórico está na tela e se lê dali. Decorar é o que faz alguém travar quando o examinador pergunta fora da ordem.' },
            { id: 'f', text: 'Falso', correct: true },
          ]},
          explanation: 'É assim que se faz numa reunião de equipe de verdade: o log aberto, e a explicação por cima do que está ali.',
        },
      ],
    },
  ],
};

export const MODULOS_DE_TERMINAL: ModuloDeVereda[] = [M1, M2, M3, M4, M5, M6, M7];
