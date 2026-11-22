import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC-FE004 DOM.
 *
 * ── O que elas medem ──────────────────────────────────────────────────────
 * A definição vale uma vez; depois vêm consequência, discriminação e
 * diagnóstico. Nesta vereda o diagnóstico é quase tudo, porque a página
 * também quase nunca recusa: o seletor que não acha devolve null e segue, o
 * estilo sem unidade é ignorado calado, o formulário recarrega e apaga a
 * prova do que aconteceu, o 404 chega como resposta normal. A pergunta que
 * vale é "o que estou vendo, e de onde veio?".
 *
 * Toda alternativa errada diz por que está errada, no campo `porque`, e a
 * certa não carrega motivo nenhum. Nada de crase nem de asterisco: a questão
 * vai para o `QuestionRenderer`, que imprime texto puro.
 */

export const QUESTOES_DE_DOM: Record<string, Question[]> = {
  /* ── Módulo 1 — HTML, CSS e JavaScript juntos ── */
  'm1-teoria': [
    {
      id: 'DOM-M1-Q1', type: 'multiple_choice',
      prompt: 'Numa página, qual é o trabalho do JavaScript?',
      data: { options: [
        { id: 'a', text: 'Dizer o que acontece na página.', correct: true },
        { id: 'b', text: 'Dizer o que existe na página: títulos, listas, botões.', porque: 'Esse é o trabalho do HTML. O JavaScript mexe no que o HTML criou.' },
        { id: 'c', text: 'Dizer a cor, o tamanho e o lugar de cada coisa.', porque: 'Isso é o CSS. O JavaScript até muda um estilo, mas o lugar dele é dizer o que acontece.' },
        { id: 'd', text: 'Guardar a página no servidor para outros abrirem.', porque: 'Quem guarda e entrega a página é o servidor. O JavaScript daqui roda no navegador de quem abriu.' },
      ]},
      explanation: 'HTML diz o que há, CSS diz como se parece, JavaScript diz o que acontece quando alguém clica, digita ou espera.',
    },
    {
      id: 'DOM-M1-Q2', type: 'multiple_choice',
      prompt: 'O que é o DOM?',
      data: { options: [
        { id: 'a', text: 'A árvore que o navegador monta da página.', correct: true },
        { id: 'b', text: 'O arquivo index.html guardado na pasta do site.', porque: 'O arquivo é o ponto de partida. O DOM é o que o navegador monta na memória a partir dele, e muda sem o arquivo mudar.' },
        { id: 'c', text: 'Uma biblioteca que se baixa para mexer em páginas.', porque: 'Não se baixa nada: todo navegador monta o DOM sozinho, e document é o nome dele no script.' },
        { id: 'd', text: 'O programa que transforma CSS em cores na tela.', porque: 'Desenhar é a renderização. O DOM é a árvore que ela desenha.' },
      ]},
      explanation: 'O script mexe na árvore, e não no arquivo. Por isso recarregar a página desfaz o que o script fez.',
    },
    {
      id: 'DOM-M1-Q3', type: 'scenario',
      prompt: 'Um script troca o título da página. A pessoa recarrega, e o título antigo volta. Por quê?',
      data: { scenarios: [
        { id: 'a', text: 'O script mudou a árvore, e não o arquivo.', correct: true },
        { id: 'b', text: 'O navegador guardou uma cópia velha e mostrou ela.', porque: 'Não é cópia velha: o arquivo nunca mudou. Recarregar monta a árvore de novo a partir dele, com o título que está escrito lá.' },
        { id: 'c', text: 'O script deu erro na segunda vez e parou antes do título.', porque: 'Se fosse erro, o console mostraria vermelho. Mesmo sem erro, o título começaria o antigo: é o que está no index.html.' },
        { id: 'd', text: 'O textContent só vale até a pessoa mexer na página.', porque: 'O texto trocado fica até a árvore ser montada de novo. Recarregar é que monta outra árvore do zero.' },
      ]},
      explanation: 'O que o script faz vive enquanto a página está aberta. Para durar, o dado precisa ser guardado em algum lugar — que não é a árvore.',
    },
    {
      id: 'DOM-M1-Q4', type: 'scenario',
      prompt: 'O script está no head, sem defer, e a primeira linha dele faz document.querySelector(\'#placar\'). O console diz "Cannot set properties of null". O que aconteceu?',
      data: { scenarios: [
        { id: 'a', text: 'O script rodou antes de o placar existir.', correct: true },
        { id: 'b', text: 'O id placar está escrito errado no HTML.', porque: 'Pode ser, mas não é o que a posição diz: no head sem defer, o script roda antes de o body ser lido, e nenhum elemento do body existe ainda.' },
        { id: 'c', text: 'O querySelector não funciona dentro do head.', porque: 'Ele funciona em qualquer lugar. O problema é quando: naquele instante o placar ainda não foi lido.' },
        { id: 'd', text: 'O arquivo script.js não foi encontrado pelo navegador.', porque: 'Se o arquivo não fosse achado, nenhuma linha rodaria, e o erro não citaria null. Ele rodou — cedo demais.' },
      ]},
      explanation: 'O conserto é pôr o script no fim do body ou acrescentar defer no head. Os dois fazem ele rodar depois de a página inteira ter sido lida.',
    },
    {
      id: 'DOM-M1-Q5', type: 'multiple_choice',
      prompt: 'Uma lista ul tem dois li, escritos cada um numa linha. children.length dá 2 e childNodes.length dá 5. De onde vêm os 3 a mais?',
      data: { options: [
        { id: 'a', text: 'Das quebras de linha entre as tags.', correct: true },
        { id: 'b', text: 'Do texto de dentro de cada li, contado de novo.', porque: 'O texto de dentro do li é filho do li, e não da lista. Os nós a mais são irmãos dos li: os espaços entre eles.' },
        { id: 'c', text: 'Das tags de fechamento, que também viram nós.', porque: 'O fechamento não vira nó: ele só diz onde o elemento acaba.' },
        { id: 'd', text: 'De um defeito do navegador, que conta errado.', porque: 'A conta está certa: childNodes inclui os nós de texto, e a quebra de linha entre duas tags é um nó de texto.' },
      ]},
      explanation: 'children lista os elementos; childNodes lista todos os nós, os de texto inclusive. Quase sempre o que se quer é o primeiro.',
    },
    {
      id: 'DOM-M1-Q6', type: 'true_false',
      prompt: 'Depois que o script muda a árvore, é preciso mandar o navegador desenhar a tela de novo.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O navegador redesenha sozinho a parte que mudou. Ninguém manda renderizar.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Mudou a árvore, o navegador repinta. É por isso que basta uma linha de textContent para a tela mudar.',
    },
    {
      id: 'DOM-M1-Q7', type: 'true_false',
      prompt: 'Com defer, um script no head só roda depois que a página inteira foi lida.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'É exatamente o que defer faz: o navegador baixa o arquivo e espera o HTML terminar antes de rodá-lo.' },
      ]},
      explanation: 'No fim do body, ou no head com defer. Os dois lugares deixam o script achar tudo o que a página tem.',
    },
  ],

  /* ── Módulo 2 — Achar elementos ── */
  'm2-teoria': [
    {
      id: 'DOM-M2-Q1', type: 'multiple_choice',
      prompt: 'Há dez elementos com a classe membro. O que devolve document.querySelector(\'.membro\')?',
      data: { options: [
        { id: 'a', text: 'O primeiro deles.', correct: true },
        { id: 'b', text: 'Uma lista com os dez.', porque: 'Lista com todos é o querySelectorAll. O querySelector para no primeiro que casa.' },
        { id: 'c', text: 'O último deles, que é o mais recente.', porque: 'Ele procura de cima para baixo e devolve o primeiro que acha, não o último.' },
        { id: 'd', text: 'Um erro, porque o seletor casa com mais de um.', porque: 'Casar com vários não é erro. Ele só devolve o primeiro.' },
      ]},
      explanation: 'Para um, querySelector; para todos, querySelectorAll.',
    },
    {
      id: 'DOM-M2-Q2', type: 'scenario',
      prompt: 'O script faz document.querySelector(\'titulo\').textContent = \'Ipê\', e o console acusa null. O h1 da página tem id="titulo". O que falta?',
      data: { scenarios: [
        { id: 'a', text: 'O # antes de titulo.', correct: true },
        { id: 'b', text: 'Aspas duplas no lugar das simples.', porque: 'Aspas simples e duplas valem igual no JavaScript. O seletor é que está procurando uma tag chamada titulo.' },
        { id: 'c', text: 'Trocar textContent por innerHTML.', porque: 'O erro acontece antes disso: o querySelector não achou nada. Qualquer propriedade de null dá o mesmo erro.' },
        { id: 'd', text: 'Escrever Titulo com T maiúsculo.', porque: 'A maiúscula não resolve: sem o #, o seletor continua procurando uma tag, e não um id.' },
      ]},
      explanation: 'Sem o #, o seletor procura uma tag com aquele nome. Id pede #, classe pede ponto — como no CSS.',
    },
    {
      id: 'DOM-M2-Q3', type: 'multiple_choice',
      prompt: 'O que acha o seletor #membros li?',
      data: { options: [
        { id: 'a', text: 'Os li que moram dentro de #membros.', correct: true },
        { id: 'b', text: 'O elemento #membros e todos os li da página.', porque: 'Isso seria com vírgula: #membros, li. O espaço quer dizer "dentro de".' },
        { id: 'c', text: 'Os li que têm o id membros.', porque: 'Isso seria li#membros, colado. Com espaço, o li fica dentro do elemento de id membros.' },
        { id: 'd', text: 'O primeiro li que vem logo depois de #membros.', porque: 'Irmão seguinte se escreve com +. O espaço procura dentro, em qualquer profundidade.' },
      ]},
      explanation: 'Espaço é "dentro de". É o jeito de contar só os membros e deixar a diretoria de fora.',
    },
    {
      id: 'DOM-M2-Q4', type: 'multiple_choice',
      prompt: 'Qual seletor acha quem tem o atributo data-cargo igual a conselheira?',
      data: { options: [
        { id: 'a', text: '[data-cargo="conselheira"]', correct: true },
        { id: 'b', text: '.data-cargo.conselheira', porque: 'Ponto é classe. Isso acharia quem tem duas classes, data-cargo e conselheira.' },
        { id: 'c', text: '#conselheira', porque: '# é id. O valor do atributo data-cargo não vira id.' },
        { id: 'd', text: 'data-cargo:conselheira', porque: 'Dois-pontos introduz pseudo-classe, como :hover. Atributo vai entre colchetes.' },
      ]},
      explanation: 'Atributo vai entre colchetes, com o valor entre aspas.',
    },
    {
      id: 'DOM-M2-Q5', type: 'scenario',
      prompt: 'document.querySelectorAll(\'.pessoa.novato\') devolve uma lista de tamanho 1. O que isso diz?',
      data: { scenarios: [
        { id: 'a', text: 'Um elemento tem as duas classes juntas.', correct: true },
        { id: 'b', text: 'Há uma pessoa e um novato, um de cada classe.', porque: 'Classes coladas, sem espaço, pedem as duas no mesmo elemento. Um de cada não casaria.' },
        { id: 'c', text: 'Há um novato dentro de um elemento pessoa.', porque: 'Isso seria com espaço: .pessoa .novato. Coladas, as classes são do mesmo elemento.' },
        { id: 'd', text: 'O seletor está errado e só achou por acaso.', porque: 'O seletor está certo: duas classes coladas querem dizer "as duas ao mesmo tempo".' },
      ]},
      explanation: 'Colado é "e", espaço é "dentro de", vírgula é "ou". Três sinais, três perguntas diferentes.',
    },
    {
      id: 'DOM-M2-Q6', type: 'true_false',
      prompt: 'Quando nenhum elemento casa, querySelectorAll devolve null.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Quem devolve null é o querySelector. O querySelectorAll devolve uma lista vazia, de tamanho 0.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A lista vazia tem length 0, e um laço sobre ela não roda nenhuma vez — sem erro.',
    },
    {
      id: 'DOM-M2-Q7', type: 'true_false',
      prompt: 'getElementById(\'placar\') e querySelector(\'#placar\') acham o mesmo elemento.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Os dois procuram pelo id placar. A diferença é só que o getElementById recebe o nome sem o #.' },
      ]},
      explanation: 'getElementById é o jeito antigo, e só acha por id. querySelector serve para qualquer seletor.',
    },
  ],

  /* ── Módulo 3 — Mudar o que já existe ── */
  'm3-teoria': [
    {
      id: 'DOM-M3-Q1', type: 'multiple_choice',
      prompt: 'No JavaScript, como se escreve a propriedade background-color do CSS?',
      data: { options: [
        { id: 'a', text: 'style.backgroundColor', correct: true },
        { id: 'b', text: 'style.background-color', porque: 'O hífen, no JavaScript, é sinal de menos: a linha tentaria subtrair color de style.background.' },
        { id: 'c', text: 'style.BackgroundColor', porque: 'A primeira letra fica minúscula. Só a letra depois de onde havia o hífen vira maiúscula.' },
        { id: 'd', text: 'style[background_color]', porque: 'O sublinhado não entra. O nome é o do CSS sem hífen, com a letra seguinte maiúscula.' },
      ]},
      explanation: 'background-color vira backgroundColor, font-size vira fontSize. O nome é o mesmo, em outra escrita.',
    },
    {
      id: 'DOM-M3-Q2', type: 'scenario',
      prompt: 'O script faz faixa.style.fontSize = 20, e a letra não muda. Nenhum erro aparece. Por quê?',
      data: { scenarios: [
        { id: 'a', text: 'Faltou a unidade, como px.', correct: true },
        { id: 'b', text: 'fontSize não pode ser mudado pelo script.', porque: 'Pode, sim. O valor é que precisa ser texto com unidade: \'20px\'.' },
        { id: 'c', text: 'O número precisa estar entre aspas, e só isso.', porque: 'Entre aspas, \'20\' continua sem unidade, e o navegador ignora do mesmo jeito.' },
        { id: 'd', text: 'A faixa precisa de um id para aceitar estilo.', porque: 'Qualquer elemento aceita estilo. O valor sem unidade é que é descartado.' },
      ]},
      explanation: 'O navegador ignora o valor que não entende, calado. Número de tamanho sem unidade é o caso mais comum.',
    },
    {
      id: 'DOM-M3-Q3', type: 'multiple_choice',
      prompt: 'Por que pôr e tirar uma classe costuma ser melhor que mudar o estilo linha a linha pelo script?',
      data: { options: [
        { id: 'a', text: 'O visual fica no CSS, num lugar só.', correct: true },
        { id: 'b', text: 'Porque o style não funciona em todos os navegadores.', porque: 'O style funciona em todos. A vantagem da classe é de organização, e não de compatibilidade.' },
        { id: 'c', text: 'Porque classList deixa a página mais rápida de abrir.', porque: 'A velocidade de abrir não muda. O que muda é onde o visual mora: no CSS, e não espalhado pelo script.' },
        { id: 'd', text: 'Porque o style apaga as classes que o elemento tinha.', porque: 'O style não apaga classe nenhuma. Os dois convivem; a classe só deixa o visual mais fácil de achar.' },
      ]},
      explanation: 'Quem quiser mudar a cor do destaque abre o CSS e acha a classe. O script só diz quando ela entra e quando sai.',
    },
    {
      id: 'DOM-M3-Q4', type: 'multiple_choice',
      prompt: 'Um item tem a classe destaque. O que faz item.classList.toggle(\'destaque\')?',
      data: { options: [
        { id: 'a', text: 'Tira a classe.', correct: true },
        { id: 'b', text: 'Põe a classe de novo, em dobro.', porque: 'Uma classe não fica em dobro. O toggle inverte: se tem, tira.' },
        { id: 'c', text: 'Não faz nada, porque ela já está lá.', porque: 'Isso é o add, que não faz nada quando a classe já existe. O toggle tira.' },
        { id: 'd', text: 'Pergunta se a classe existe e devolve true.', porque: 'Perguntar é o contains. O toggle muda o elemento.' },
      ]},
      explanation: 'add põe, remove tira, toggle inverte, contains pergunta.',
    },
    {
      id: 'DOM-M3-Q5', type: 'scenario',
      prompt: 'Dois li têm data-pontos="72" e data-pontos="38". O script soma os dois dataset.pontos com + e mostra 7238. O que falta?',
      data: { scenarios: [
        { id: 'a', text: 'Converter com Number antes de somar.', correct: true },
        { id: 'b', text: 'Ler com getAttribute, que devolve número.', porque: 'getAttribute também devolve texto. Todo atributo chega como texto.' },
        { id: 'c', text: 'Tirar as aspas do HTML: data-pontos=72.', porque: 'Sem as aspas, o atributo continua texto. Quem converte é o script.' },
        { id: 'd', text: 'Trocar o + por uma vírgula.', porque: 'Com vírgula não há soma nenhuma. É preciso converter cada valor em número.' },
      ]},
      explanation: 'O dataset sempre devolve texto, e + entre dois textos junta. Number() antes da conta, e a soma dá 110.',
    },
    {
      id: 'DOM-M3-Q6', type: 'true_false',
      prompt: 'Um elemento com hidden = true continua na árvore.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Ele só deixa de ser desenhado. Continua na árvore, e um querySelector continua achando.' },
      ]},
      explanation: 'Escondido volta inteiro com hidden = false. Removido precisa ser criado de novo.',
    },
    {
      id: 'DOM-M3-Q7', type: 'true_false',
      prompt: 'textContent = \'<b>Oi</b>\' põe um Oi em negrito na tela.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O textContent trata tudo como texto: aparecem na tela os sinais de menor e maior, e o b escrito.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'É isso que torna o textContent seguro: o que se escreve nele nunca vira tag.',
    },
  ],

  /* ── Módulo 4 — Criar e remover ── */
  'm4-teoria': [
    {
      id: 'DOM-M4-Q1', type: 'scenario',
      prompt: 'O script cria um li com createElement e põe o texto nele, mas nada aparece na tela. O que falta?',
      data: { scenarios: [
        { id: 'a', text: 'Pendurar o li em alguém da página.', correct: true },
        { id: 'b', text: 'Chamar uma função para o navegador redesenhar.', porque: 'O navegador redesenha sozinho. O li não aparece porque ainda não está na árvore.' },
        { id: 'c', text: 'Dar um id ao li, senão ele não é desenhado.', porque: 'Elemento sem id é desenhado normalmente. O que falta é ele estar na árvore.' },
        { id: 'd', text: 'Trocar createElement por innerHTML.', porque: 'createElement está certo. Ele só cria na memória; falta o append.' },
      ]},
      explanation: 'createElement cria fora da página. append, prepend, before ou after é que o põem nela.',
    },
    {
      id: 'DOM-M4-Q2', type: 'multiple_choice',
      prompt: 'O que faz lista.prepend(item)?',
      data: { options: [
        { id: 'a', text: 'Põe o item como primeiro filho da lista.', correct: true },
        { id: 'b', text: 'Põe o item como último filho da lista.', porque: 'Último é o append. prepend põe no começo.' },
        { id: 'c', text: 'Põe o item antes da lista, do lado de fora.', porque: 'Do lado de fora, antes, é o before. prepend põe dentro, no começo.' },
        { id: 'd', text: 'Troca o primeiro filho da lista pelo item.', porque: 'Ninguém sai: o item entra no começo e os outros descem uma posição.' },
      ]},
      explanation: 'append e prepend põem dentro; before e after põem ao lado.',
    },
    {
      id: 'DOM-M4-Q3', type: 'scenario',
      prompt: 'Uma função desenhar monta a lista de tarefas. Chamada duas vezes, a página mostra cada tarefa duas vezes. O que faltou?',
      data: { scenarios: [
        { id: 'a', text: 'Esvaziar a lista no começo da função.', correct: true },
        { id: 'b', text: 'Chamar desenhar uma vez só, e nunca mais.', porque: 'Desenhar de novo é o que se faz quando os dados mudam. O que falta é limpar o que estava lá antes.' },
        { id: 'c', text: 'Usar prepend no lugar de append.', porque: 'prepend só muda onde os novos entram. Os antigos continuariam lá.' },
        { id: 'd', text: 'Remover as tarefas repetidas do arranjo.', porque: 'O arranjo não tem repetição: a lista nova foi pendurada embaixo da velha.' },
      ]},
      explanation: 'lista.textContent = \'\' tira todos os filhos. É a primeira linha de toda função que desenha uma lista.',
    },
    {
      id: 'DOM-M4-Q4', type: 'multiple_choice',
      prompt: 'O que acontece com o que está dentro de um elemento quando se chama remove() nele?',
      data: { options: [
        { id: 'a', text: 'Sai junto.', correct: true },
        { id: 'b', text: 'Sobe e ocupa o lugar do elemento removido.', porque: 'Os filhos não sobem. O remove tira o elemento com tudo o que há dentro.' },
        { id: 'c', text: 'Fica escondido, esperando o elemento voltar.', porque: 'Nada fica esperando: o que estava dentro saiu da árvore com ele.' },
        { id: 'd', text: 'Dá erro, porque só se remove elemento vazio.', porque: 'Elemento com filhos se remove sem erro nenhum.' },
      ]},
      explanation: 'remove() leva o galho inteiro. Para tirar só os filhos e deixar o elemento, esvazie com textContent.',
    },
    {
      id: 'DOM-M4-Q5', type: 'scenario',
      prompt: 'Uma página mostra o nome que cada pessoa digitou no cadastro usando innerHTML. Por que isso é perigoso?',
      data: { scenarios: [
        { id: 'a', text: 'Uma tag no nome entraria na página.', correct: true },
        { id: 'b', text: 'innerHTML apaga o que a pessoa digitou depois de mostrar.', porque: 'Ele não apaga nada. O perigo é que ele lê as tags do texto e as põe na página.' },
        { id: 'c', text: 'innerHTML não aceita acento e estraga os nomes.', porque: 'Acento passa normalmente. O problema é a tag escondida no texto.' },
        { id: 'd', text: 'innerHTML é mais lento e trava com muitos nomes.', porque: 'A velocidade não é o problema. O texto de fora vira HTML, e faz o que quiser na página de quem o vê.' },
      ]},
      explanation: 'Texto que veio de fora vai para o textContent, ou para um elemento criado com createElement. Nunca para o innerHTML.',
    },
    {
      id: 'DOM-M4-Q6', type: 'true_false',
      prompt: 'Um elemento escondido com hidden continua contando num querySelectorAll.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Escondido continua na árvore, e o querySelectorAll acha tudo o que está na árvore, visível ou não.' },
      ]},
      explanation: 'Para sair da contagem, o elemento precisa sair da árvore: remove().',
    },
    {
      id: 'DOM-M4-Q7', type: 'true_false',
      prompt: 'item.after(novo) põe o novo dentro do item, no fim.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Dentro, no fim, é o append. after põe o novo do lado de fora, como irmão, logo depois.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'before e after põem ao lado; append e prepend põem dentro.',
    },
  ],

  /* ── Módulo 5 — Eventos e ouvintes ── */
  'm5-teoria': [
    {
      id: 'DOM-M5-Q1', type: 'multiple_choice',
      prompt: 'O que é um ouvinte de evento?',
      data: { options: [
        { id: 'a', text: 'Uma função que roda quando o evento acontece.', correct: true },
        { id: 'b', text: 'Um elemento HTML que recebe os cliques da página.', porque: 'O elemento é onde o evento acontece. O ouvinte é a função pendurada nele.' },
        { id: 'c', text: 'O microfone que a página usa para ouvir a pessoa.', porque: 'Não tem nada de som: "ouvir" aqui é esperar um evento, como um clique.' },
        { id: 'd', text: 'Um arquivo que registra todos os cliques no servidor.', porque: 'Nada vai para o servidor. O ouvinte é uma função, no navegador, chamada a cada evento.' },
      ]},
      explanation: 'addEventListener pendura a função; o navegador a chama a cada clique, a cada letra, a cada envio.',
    },
    {
      id: 'DOM-M5-Q2', type: 'scenario',
      prompt: 'O script tem botao.addEventListener(\'click\', contar()). O placar já abre em 1 e o botão não faz mais nada. O que está errado?',
      data: { scenarios: [
        { id: 'a', text: 'Os parênteses depois de contar.', correct: true },
        { id: 'b', text: 'O nome do evento, que devia ser onclick.', porque: 'No addEventListener o nome é click, sem on. O erro está no segundo argumento.' },
        { id: 'c', text: 'A função contar precisa estar escrita antes do botão.', porque: 'A ordem não é o problema. Com os parênteses, contar roda uma vez na hora, e o que vai para o ouvinte é o que ela devolveu.' },
        { id: 'd', text: 'O botão precisa de um id para aceitar ouvinte.', porque: 'Qualquer elemento aceita ouvinte. O que se passou foi o resultado da função, e não ela.' },
      ]},
      explanation: 'contar é a função; contar() é chamá-la agora. O ouvinte quer a função, para chamar depois.',
    },
    {
      id: 'DOM-M5-Q3', type: 'multiple_choice',
      prompt: 'Uma busca precisa filtrar a lista a cada letra digitada. Qual evento ouvir na caixa?',
      data: { options: [
        { id: 'a', text: 'input', correct: true },
        { id: 'b', text: 'change', porque: 'O change só acontece quando a pessoa sai da caixa. Para filtrar letra a letra, é tarde demais.' },
        { id: 'c', text: 'submit', porque: 'submit é do formulário, quando ele é enviado, e não da caixa a cada letra.' },
        { id: 'd', text: 'click', porque: 'Clicar na caixa acontece uma vez, antes de digitar. As letras não disparam click.' },
      ]},
      explanation: 'input acontece a cada letra digitada ou apagada. O texto de agora está em caixa.value.',
    },
    {
      id: 'DOM-M5-Q4', type: 'multiple_choice',
      prompt: 'Num ouvinte pendurado na lista, o que é evento.target?',
      data: { options: [
        { id: 'a', text: 'O elemento em que o clique aconteceu.', correct: true },
        { id: 'b', text: 'A própria lista, sempre.', porque: 'A lista é onde o ouvinte está pendurado. target é onde o clique de fato caiu: o item.' },
        { id: 'c', text: 'O próximo elemento que vai ser clicado.', porque: 'target fala do clique que acabou de acontecer, e não do próximo.' },
        { id: 'd', text: 'O texto do elemento clicado, já lido.', porque: 'target é o elemento. O texto está em evento.target.textContent.' },
      ]},
      explanation: 'Com target, um ouvinte só na lista descobre qual item foi clicado.',
    },
    {
      id: 'DOM-M5-Q5', type: 'scenario',
      prompt: 'Uma busca procura "an" e não acha "Ana", só "Mariana". O que falta?',
      data: { scenarios: [
        { id: 'a', text: 'Pôr os dois lados em minúsculas.', correct: true },
        { id: 'b', text: 'Trocar includes por ===.', porque: 'Com === só acharia quem se chama exatamente "an". O problema é a maiúscula do A.' },
        { id: 'c', text: 'Ouvir change em vez de input.', porque: 'O evento não muda a comparação. Ana tem A maiúsculo, e includes diferencia.' },
        { id: 'd', text: 'Tirar os espaços do nome antes de comparar.', porque: 'Ana não tem espaço. É a maiúscula que faz o includes não achar.' },
      ]},
      explanation: 'nome.toLowerCase().includes(busca.toLowerCase()) acha os dois, com A ou com a.',
    },
    {
      id: 'DOM-M5-Q6', type: 'true_false',
      prompt: 'A função passada ao addEventListener roda uma vez, na hora em que a página abre.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Ela fica guardada e roda a cada evento. Três cliques, três vezes; nenhum clique, nenhuma.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O addEventListener combina de antemão o que fazer. A função só roda quando o evento acontece.',
    },
    {
      id: 'DOM-M5-Q7', type: 'true_false',
      prompt: 'Num evento keydown, evento.key diz qual tecla foi apertada.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'É para isso que key existe: num keydown, ele traz a tecla, como "Enter" ou "a".' },
      ]},
      explanation: 'O objeto do evento traz os detalhes do que aconteceu, e cada tipo de evento traz os seus.',
    },
  ],

  /* ── Módulo 6 — Formulários sem recarregar ── */
  'm6-teoria': [
    {
      id: 'DOM-M6-Q1', type: 'scenario',
      prompt: 'Ao enviar o formulário, a mensagem de "inscrito" aparece um instante e some, e os campos voltam vazios. O que aconteceu?',
      data: { scenarios: [
        { id: 'a', text: 'A página recarregou: faltou preventDefault.', correct: true },
        { id: 'b', text: 'O script apagou a mensagem logo depois de escrever.', porque: 'Não há linha apagando nada. O envio de fábrica recarregou a página, e a árvore nova não tem a mensagem.' },
        { id: 'c', text: 'O reset do formulário apagou também a mensagem.', porque: 'O reset só esvazia campos. O que apagou tudo foi a página recarregar.' },
        { id: 'd', text: 'A mensagem foi posta com hidden e se escondeu.', porque: 'hidden não muda sozinho. A página inteira foi montada de novo.' },
      ]},
      explanation: 'O formulário, sozinho, envia e recarrega. evento.preventDefault() no ouvinte do submit impede isso.',
    },
    {
      id: 'DOM-M6-Q2', type: 'multiple_choice',
      prompt: 'Por que ouvir o submit do formulário, e não o click do botão?',
      data: { options: [
        { id: 'a', text: 'O Enter na caixa também envia.', correct: true },
        { id: 'b', text: 'Porque o click não funciona em botões de formulário.', porque: 'O click funciona. O problema é quem envia sem clicar: apertando Enter dentro de uma caixa.' },
        { id: 'c', text: 'Porque o submit é mais rápido que o click.', porque: 'Não é questão de velocidade. O submit pega todos os jeitos de enviar, o Enter inclusive.' },
        { id: 'd', text: 'Porque o click não tem preventDefault.', porque: 'O click também tem. Mas impedir o clique não impede o envio pelo Enter.' },
      ]},
      explanation: 'Quem aperta Enter numa caixa de texto envia o formulário sem clicar em nada. Só o submit pega os dois caminhos.',
    },
    {
      id: 'DOM-M6-Q3', type: 'scenario',
      prompt: 'Um campo input type="number" tem 12. O script faz campo.value + 1 e obtém 121. Por quê?',
      data: { scenarios: [
        { id: 'a', text: 'value é texto, até no campo de número.', correct: true },
        { id: 'b', text: 'O campo de número guarda os dígitos separados.', porque: 'Ele guarda o texto "12". O + juntou "12" com 1.' },
        { id: 'c', text: 'O 1 precisava estar entre aspas para somar.', porque: 'Entre aspas seria pior: dois textos. É o value que precisa virar número.' },
        { id: 'd', text: 'type="number" só aceita números de um algarismo.', porque: 'Aceita qualquer número. O que ele devolve em value é que é texto.' },
      ]},
      explanation: 'value é sempre texto. Number(campo.value) + 1 dá 13.',
    },
    {
      id: 'DOM-M6-Q4', type: 'multiple_choice',
      prompt: 'O campo de nome tem só três espaços. Como saber que ele está vazio de verdade?',
      data: { options: [
        { id: 'a', text: 'Perguntar se value.trim() é vazio.', correct: true },
        { id: 'b', text: 'Perguntar se value === \'\'.', porque: 'Três espaços não são texto vazio: "   " === \'\' é falso, e o nome em branco passaria.' },
        { id: 'c', text: 'Perguntar se value.length é maior que zero.', porque: 'Três espaços têm length 3. A conta diria que há nome.' },
        { id: 'd', text: 'Perguntar se Number(value) é zero.', porque: 'Number("   ") dá 0, mas Number("Ana") dá NaN. Número não serve para perguntar sobre nome.' },
      ]},
      explanation: 'trim() tira os espaços das pontas antes da pergunta. Sem ele, um nome de espaços passa.',
    },
    {
      id: 'DOM-M6-Q5', type: 'multiple_choice',
      prompt: 'Onde deve aparecer a mensagem de que a idade está fora da faixa?',
      data: { options: [
        { id: 'a', text: 'Perto do campo de idade.', correct: true },
        { id: 'b', text: 'No topo da página, como "formulário inválido".', porque: 'Uma mensagem geral obriga a pessoa a adivinhar qual campo está errado.' },
        { id: 'c', text: 'No console, onde ficam os erros.', porque: 'Quem preenche o formulário não abre o console. A mensagem é para a pessoa, na página.' },
        { id: 'd', text: 'Num alert, que trava a página até ser fechado.', porque: 'O alert some quando fechado, e a pessoa volta ao formulário sem saber qual campo era.' },
      ]},
      explanation: 'Um problema por campo, dito ao lado dele. E o aviso some quando o campo é consertado.',
    },
    {
      id: 'DOM-M6-Q6', type: 'true_false',
      prompt: 'formulario.reset() também apaga as mensagens de erro escritas pelo script.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O reset só esvazia os campos do formulário. Mensagem de erro é texto num parágrafo, e fica lá.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Os avisos se limpam à mão. Senão a tela continua acusando um problema que já foi consertado.',
    },
    {
      id: 'DOM-M6-Q7', type: 'true_false',
      prompt: 'Se o navegador já conferiu os campos, quem recebe os dados não precisa conferir de novo.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O que sai do navegador pode ser mexido por quem quiser. Quem recebe os dados confere de novo, sempre.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Conferir no navegador é para ajudar quem preenche. Proteger os dados é trabalho de quem recebe.',
    },
  ],

  /* ── Módulo 7 — Conversar com uma API ── */
  'm7-teoria': [
    {
      id: 'DOM-M7-Q1', type: 'multiple_choice',
      prompt: 'O que uma API na internet costuma devolver?',
      data: { options: [
        { id: 'a', text: 'Dados, quase sempre em JSON.', correct: true },
        { id: 'b', text: 'Uma página pronta, com HTML e CSS para pessoas.', porque: 'Isso é um site. A API devolve dados para outro programa usar.' },
        { id: 'c', text: 'Um programa para instalar no computador.', porque: 'Nada se instala: a API responde a um pedido com dados.' },
        { id: 'd', text: 'A senha de quem fez o pedido.', porque: 'A API responde com os dados pedidos, como os estados ou os feriados — nada de senha.' },
      ]},
      explanation: 'Uma API é um jeito combinado de um programa pedir coisas a outro. A BrasilAPI responde com JSON.',
    },
    {
      id: 'DOM-M7-Q2', type: 'scenario',
      prompt: 'O script faz const feriados = await resposta e tenta ler feriados[0].name, que dá undefined. O que faltou?',
      data: { scenarios: [
        { id: 'a', text: 'Abrir o envelope com resposta.json().', correct: true },
        { id: 'b', text: 'Esperar mais tempo antes de ler o primeiro.', porque: 'O tempo não muda nada: a resposta já chegou. Ela é o envelope, e o dado está dentro.' },
        { id: 'c', text: 'Trocar await por then.', porque: 'Os dois esperam igual. Com qualquer um, falta abrir o envelope com json().' },
        { id: 'd', text: 'Pedir o endereço com https no lugar de http.', porque: 'O pedido funcionou. O problema é ler a resposta como se ela já fosse o arranjo.' },
      ]},
      explanation: 'fetch devolve a resposta; await resposta.json() devolve o dado, como objeto ou arranjo do JavaScript.',
    },
    {
      id: 'DOM-M7-Q3', type: 'scenario',
      prompt: 'A API responde 404 para o ano 1800, e o catch do try não foi chamado. Por quê?',
      data: { scenarios: [
        { id: 'a', text: 'Um 404 é resposta, e não falha de rede.', correct: true },
        { id: 'b', text: 'O catch só funciona com o painel em "Sem conexão".', porque: 'O catch pega qualquer erro lançado. O 404 não é lançado: chega como resposta normal.' },
        { id: 'c', text: 'O try precisava estar fora da função async.', porque: 'O lugar do try está certo. Quem decide se deu certo é resposta.ok, que o código não perguntou.' },
        { id: 'd', text: 'A API demorou demais e o catch desistiu de esperar.', porque: 'Não houve demora: a API respondeu, com o código 404.' },
      ]},
      explanation: 'O fetch só rejeita quando não há resposta nenhuma. Para um 404, pergunta-se if (!resposta.ok).',
    },
    {
      id: 'DOM-M7-Q4', type: 'multiple_choice',
      prompt: 'Onde se esconde o "Carregando…" para ele sumir tanto quando dá certo como quando dá errado?',
      data: { options: [
        { id: 'a', text: 'No finally.', correct: true },
        { id: 'b', text: 'No fim do try, depois de mostrar os dados.', porque: 'Se o pedido falhar, o try para no meio e nunca chega ao fim. O aviso ficaria na tela para sempre.' },
        { id: 'c', text: 'No catch, onde se trata a falha.', porque: 'O catch só roda quando dá errado. Dando certo, o aviso ficaria lá.' },
        { id: 'd', text: 'Antes do fetch, para não atrapalhar.', porque: 'Antes do pedido, o aviso nem chegaria a aparecer enquanto se espera.' },
      ]},
      explanation: 'O finally roda depois do try e do catch, dando certo ou errado. É o lugar de fechar o que se abriu.',
    },
    {
      id: 'DOM-M7-Q5', type: 'scenario',
      prompt: 'Sem internet, a página dos feriados fica em branco e o console mostra "Uncaught (in promise) TypeError: Failed to fetch". O que falta?',
      data: { scenarios: [
        { id: 'a', text: 'Um try e catch que avise a pessoa.', correct: true },
        { id: 'b', text: 'Um endereço da API que funcione sem internet.', porque: 'Nenhum endereço responde sem rede. O que falta é a página dizer que a rede caiu.' },
        { id: 'c', text: 'Trocar fetch por XMLHttpRequest.', porque: 'Qualquer jeito de pedir falha sem rede. O que falta é tratar a falha.' },
        { id: 'd', text: 'Pôr o script no head com defer.', porque: 'O lugar do script não muda a rede. Falta o catch.' },
      ]},
      explanation: 'Uncaught quer dizer que ninguém tratou. Com catch, a falha vira uma frase na página: confira a conexão.',
    },
    {
      id: 'DOM-M7-Q6', type: 'true_false',
      prompt: 'Enquanto o fetch espera a resposta, a página trava e não aceita cliques.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O await espera sem travar. A página continua respondendo; o resto da função é que aguarda.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'É por isso que a página precisa mostrar que está esperando: ela continua viva, e parece pronta.',
    },
    {
      id: 'DOM-M7-Q7', type: 'true_false',
      prompt: 'resposta.status traz o código da resposta, como 200 ou 404.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'status é justamente o código. ok é true quando ele é de sucesso, como 200.' },
      ]},
      explanation: 'status diz qual foi o código; ok diz se ele foi de sucesso.',
    },
  ],

  /* ── Módulo 8 — As ferramentas do navegador ── */
  'm8-teoria': [
    {
      id: 'DOM-M8-Q1', type: 'scenario',
      prompt: 'O script criou um li com createElement. Ele aparece na guia Elementos, mas não no index.html. Por quê?',
      data: { scenarios: [
        { id: 'a', text: 'Elementos mostra a árvore de agora.', correct: true },
        { id: 'b', text: 'O index.html ainda não foi salvo.', porque: 'Salvar não poria o li no arquivo: ele foi criado pelo script, na árvore.' },
        { id: 'c', text: 'A guia Elementos está mostrando uma página antiga.', porque: 'É o contrário: ela mostra a árvore como está agora, com o que o script acrescentou.' },
        { id: 'd', text: 'O li foi criado errado e só existe na guia.', porque: 'Ele existe de verdade, na árvore. Só não está no arquivo, que nunca muda.' },
      ]},
      explanation: 'A guia Elementos é a árvore viva. O arquivo é o ponto de partida.',
    },
    {
      id: 'DOM-M8-Q2', type: 'multiple_choice',
      prompt: 'Um aviso não aparece na tela, e o script não tem erro. Onde olhar primeiro para descobrir por quê?',
      data: { options: [
        { id: 'a', text: 'Nos estilos calculados do aviso.', correct: true },
        { id: 'b', text: 'Na guia Rede, procurando o aviso.', porque: 'A Rede lista os pedidos à internet. O aviso é um elemento, e o motivo de sumir está no estilo dele.' },
        { id: 'c', text: 'No código-fonte da página, com Ctrl+U.', porque: 'O código-fonte é o arquivo, e não o que vale agora. O estilo calculado diz o que de fato está valendo.' },
        { id: 'd', text: 'No histórico do navegador.', porque: 'O histórico guarda as páginas visitadas, e não o estilo de um elemento.' },
      ]},
      explanation: 'Escolhido o elemento na guia Elementos, os calculados mostram o display: none ou a cor igual ao fundo.',
    },
    {
      id: 'DOM-M8-Q3', type: 'multiple_choice',
      prompt: 'O que a guia Rede mostra?',
      data: { options: [
        { id: 'a', text: 'Os pedidos que a página fez.', correct: true },
        { id: 'b', text: 'A velocidade da internet da casa.', porque: 'Ela não mede a internet. Lista cada pedido da página, com o código e o tamanho.' },
        { id: 'c', text: 'As outras pessoas com a página aberta.', porque: 'Ninguém mais aparece ali. São os pedidos que esta página fez.' },
        { id: 'd', text: 'Os erros do script, em vermelho.', porque: 'Os erros ficam no Console. A Rede mostra os pedidos.' },
      ]},
      explanation: 'Clicando numa linha, aparece a resposta inteira — o jeito de ver o JSON antes de escrever o código que o lê.',
    },
    {
      id: 'DOM-M8-Q4', type: 'scenario',
      prompt: 'O placar mostra 0105 em vez de 15, e o console não tem erro. O que a parada na linha da soma ajuda a ver?',
      data: { scenarios: [
        { id: 'a', text: 'Que os pontos chegam como texto.', correct: true },
        { id: 'b', text: 'Em que linha o script deu erro.', porque: 'Não há erro: o programa roda até o fim. A parada mostra os valores, e um deles está entre aspas.' },
        { id: 'c', text: 'Quanto tempo a soma demorou.', porque: 'O tempo não explica 0105. Os valores sim: texto mais texto junta.' },
        { id: 'd', text: 'Qual pedido à API falhou.', porque: 'Pedidos ficam na Rede. A parada mostra as variáveis naquela linha.' },
      ]},
      explanation: 'Parado na linha, o painel mostra total = "0" e pontos = "10": com aspas, eram textos.',
    },
    {
      id: 'DOM-M8-Q5', type: 'multiple_choice',
      prompt: 'Na linha embaixo do Console, o que acontece com o que se digita?',
      data: { options: [
        { id: 'a', text: 'Roda na página, como se estivesse no script.', correct: true },
        { id: 'b', text: 'É gravado no script.js, no fim do arquivo.', porque: 'Nada é gravado. Roda uma vez, na página aberta, e some ao recarregar.' },
        { id: 'c', text: 'É enviado para o servidor do site.', porque: 'Não sai do navegador. Roda ali mesmo, na página.' },
        { id: 'd', text: 'É só anotado, sem rodar nada.', porque: 'Roda, sim: dá para perguntar o valor de uma variável ou testar um seletor.' },
      ]},
      explanation: 'O console é o lugar de experimentar um seletor antes de escrevê-lo no arquivo.',
    },
    {
      id: 'DOM-M8-Q6', type: 'true_false',
      prompt: 'Um erro no Console vem com o arquivo e a linha onde ele aconteceu.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Ao lado de cada erro aparece algo como script.js:12. É por ali que se acha a linha.' },
      ]},
      explanation: 'A primeira pergunta diante de uma página que não faz nada: há vermelho no console, e em que linha?',
    },
    {
      id: 'DOM-M8-Q7', type: 'true_false',
      prompt: 'Uma parada na guia Fontes muda o arquivo script.js.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'A parada é das ferramentas, e não do arquivo. Tirá-la ou fechar as ferramentas deixa o script como estava.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A parada só diz ao navegador onde mostrar os valores. O arquivo não muda.',
    },
  ],

  /* ── Módulo 9 — Uma página que conversa ── */
  'm9-teoria': [
    {
      id: 'DOM-M9-Q1', type: 'scenario',
      prompt: 'A página dos estados pede tudo à API de novo a cada troca de filtro. O que seria melhor?',
      data: { scenarios: [
        { id: 'a', text: 'Pedir uma vez, guardar e só desenhar de novo.', correct: true },
        { id: 'b', text: 'Pedir à API só os estados da região escolhida.', porque: 'Seria um pedido a cada troca do mesmo jeito. Com tudo guardado, o filtro não precisa de rede.' },
        { id: 'c', text: 'Desligar o filtro quando a internet estiver lenta.', porque: 'Com os dados guardados, a internet nem entra na conta do filtro.' },
        { id: 'd', text: 'Esconder a tabela e mostrar só a contagem.', porque: 'O problema não é mostrar a tabela; é pedir de novo o que já chegou.' },
      ]},
      explanation: 'Os dados ficam num arranjo; uma função desenhar monta a tela a partir dele a cada mudança.',
    },
    {
      id: 'DOM-M9-Q2', type: 'scenario',
      prompt: 'O filtro faz estados = estados.filter(...). Depois de escolher Sul, voltar para "Todas" continua mostrando 3. Por quê?',
      data: { scenarios: [
        { id: 'a', text: 'O filtro jogou fora os outros 24.', correct: true },
        { id: 'b', text: 'O filter muda o arranjo sozinho, sem precisar guardar.', porque: 'filter não muda o original: devolve um novo. O que jogou fora foi guardar o novo no lugar do original.' },
        { id: 'c', text: 'A tabela não foi esvaziada antes de desenhar.', porque: 'Se fosse isso, apareceriam estados a mais, e não a menos. Os outros sumiram do arranjo.' },
        { id: 'd', text: 'A API devolveu só os estados do Sul.', porque: 'A API devolveu os 27. Foi a linha do filtro que os perdeu.' },
      ]},
      explanation: 'O arranjo guardado fica inteiro; o resultado do filter vai para uma variável nova.',
    },
    {
      id: 'DOM-M9-Q3', type: 'multiple_choice',
      prompt: 'Comparando com <, por que Paraíba sai antes de Pará?',
      data: { options: [
        { id: 'a', text: 'No código das letras, o á vem depois do z.', correct: true },
        { id: 'b', text: 'Porque Paraíba é um nome mais comprido.', porque: 'O tamanho não decide. Decide a primeira letra diferente, comparada pelo código.' },
        { id: 'c', text: 'Porque o sort ordena do maior para o menor.', porque: 'A ordem é crescente. O código do á é que é maior que o de qualquer letra sem acento.' },
        { id: 'd', text: 'Porque o < ignora os acentos.', porque: 'É o contrário: o < leva o acento a sério demais, pelo código, e o á fica no fim.' },
      ]},
      explanation: 'localeCompare ordena como o dicionário: Pará, Paraíba, Paraná.',
    },
    {
      id: 'DOM-M9-Q4', type: 'multiple_choice',
      prompt: 'Com a caixa de busca vazia, o que devolve nome.includes(\'\')?',
      data: { options: [
        { id: 'a', text: 'true, para qualquer nome.', correct: true },
        { id: 'b', text: 'false, porque não há o que procurar.', porque: 'Todo texto contém o texto vazio. includes(\'\') é sempre verdadeiro.' },
        { id: 'c', text: 'Um erro, porque a busca não pode ser vazia.', porque: 'Não há erro: busca vazia é um caso normal, e responde true.' },
        { id: 'd', text: 'undefined, até alguém digitar algo.', porque: 'includes sempre devolve true ou false. Com texto vazio, true.' },
      ]},
      explanation: 'É por isso que apagar a busca mostra todos de novo, sem nenhuma linha a mais no código.',
    },
    {
      id: 'DOM-M9-Q5', type: 'scenario',
      prompt: 'A busca por "xyz" deixa a tabela vazia, sem nenhuma frase. Por que isso é um problema?',
      data: { scenarios: [
        { id: 'a', text: 'Tabela vazia sem frase parece defeito.', correct: true },
        { id: 'b', text: 'Porque a tabela vazia dá erro no console.', porque: 'Tabela vazia não dá erro. O problema é a pessoa não saber se a página quebrou.' },
        { id: 'c', text: 'Porque o filtro devia mostrar todos quando não acha.', porque: 'Mostrar todos mentiria sobre a busca. O certo é dizer que nenhum foi encontrado.' },
        { id: 'd', text: 'Porque a contagem fica negativa.', porque: 'A contagem dá zero, e não negativa. O que falta é dizer isso com palavras.' },
      ]},
      explanation: '"Nenhum estado encontrado" diz que a busca funcionou e não achou ninguém.',
    },
    {
      id: 'DOM-M9-Q6', type: 'true_false',
      prompt: 'O sort ordena o próprio arranjo, mudando a ordem do que estava guardado.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O sort ordena no lugar. Para não mexer no guardado, ordena-se uma cópia, como [...lista].' },
      ]},
      explanation: 'Ordenar a cópia que o filter devolveu, ou uma feita com [...lista], deixa o guardado como chegou.',
    },
    {
      id: 'DOM-M9-Q7', type: 'true_false',
      prompt: 'A contagem "9 estados" precisa ser atualizada à mão em cada filtro.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Calculada dentro da função desenhar, a partir da lista desenhada, ela acompanha todo filtro sozinha.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Tudo o que depende dos dados sai da mesma função que desenha. Assim ninguém precisa lembrar de atualizar nada.',
    },
  ],
};
