import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC-FE006 React.
 *
 * ── O que elas medem ──────────────────────────────────────────────────────
 * A definição vale uma vez; depois vêm consequência, discriminação e
 * diagnóstico. Nesta vereda o diagnóstico é olhar uma tela que se comporta
 * errado — o número que não muda, a marca que pula para a vizinha, o efeito
 * que salva a cada letra — e dizer de onde vem. Os atalhos que parecem
 * resolver e não resolvem (a posição como chave, o value sem onChange, o
 * efeito sem lista) aparecem nas alternativas erradas de propósito.
 *
 * Toda alternativa errada diz por que está errada, no campo `porque`, e a
 * certa não carrega motivo nenhum. Nada de crase nem de asterisco: a questão
 * vai para o `QuestionRenderer`, que imprime texto puro.
 */

const vf = (id: string, prompt: string, verdade: boolean, porque: string, explanation: string): Question => ({
  id, type: 'true_false', prompt,
  data: { options: [
    verdade ? { id: 'v', text: 'Verdadeiro', correct: true } : { id: 'v', text: 'Verdadeiro', porque },
    verdade ? { id: 'f', text: 'Falso', porque } : { id: 'f', text: 'Falso', correct: true },
  ]},
  explanation,
});

export const QUESTOES_DE_REACT: Record<string, Question[]> = {
  /* ── Módulo 1 — Descrever a tela ── */
  'm1-teoria': [
    {
      id: 'RE-M1-Q1', type: 'multiple_choice',
      prompt: 'O que é um componente no React?',
      data: { options: [
        { id: 'a', text: 'Uma função que devolve um pedaço de tela.', correct: true },
        { id: 'b', text: 'Um arquivo de estilo com as cores da página.', porque: 'Isso é a folha de estilo, da CC-FE002. O componente devolve tela, e pode ou não ter estilo.' },
        { id: 'c', text: 'Uma tag do HTML que o navegador já conhece.', porque: 'As tags do HTML, como p e ul, são elementos. O componente é seu, e o nome começa com maiúscula.' },
        { id: 'd', text: 'O servidor que entrega a página pela internet.', porque: 'O componente roda no navegador, dentro da página. O servidor só entrega os arquivos.' },
      ]},
      explanation: 'function Saudacao() { return <p>Olá</p>; } é um componente, e se usa como <Saudacao />.',
    },
    {
      id: 'RE-M1-Q2', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre o jeito da CC-FE004 e o do React?',
      data: { options: [
        { id: 'a', text: 'Lá se dizia o que mudar; aqui se diz como a tela é.', correct: true },
        { id: 'b', text: 'Lá o código rodava no navegador; aqui, no servidor.', porque: 'Os dois rodam no navegador. A diferença é dar ordens à página ou descrever como ela fica.' },
        { id: 'c', text: 'Lá não havia como mudar a página depois de aberta.', porque: 'Mudar a página depois de aberta era exatamente o assunto da CC-FE004, com o document.' },
        { id: 'd', text: 'O React não usa HTML, só desenhos feitos à mão.', porque: 'O React produz elementos do HTML, os mesmos da página. Só o jeito de chegar a eles muda.' },
      ]},
      explanation: 'O imperativo dá ordens passo a passo; o declarativo descreve a tela para os dados de agora, e o React faz as mudanças.',
    },
    {
      id: 'RE-M1-Q3', type: 'multiple_choice',
      prompt: 'Uma página mostra o total de avisos num parágrafo. Alguém acrescenta um aviso pelo código e esquece de atualizar o parágrafo. Isso acontece mais em qual jeito de programar?',
      data: { options: [
        { id: 'a', text: 'No imperativo, que manda mudar pedaço por pedaço.', correct: true },
        { id: 'b', text: 'No declarativo, que descreve a tela pelos dados.', porque: 'No declarativo o total sai do tamanho da lista a cada desenho. Não há o que esquecer de atualizar.' },
        { id: 'c', text: 'Nos dois do mesmo jeito, porque o erro é de quem digita.', porque: 'No declarativo a tela inteira sai dos dados. O passo esquecido só existe quando cada pedaço é atualizado à mão.' },
        { id: 'd', text: 'Em nenhum, porque o navegador atualiza o total sozinho.', porque: 'O navegador não sabe que aquele número conta os avisos. Alguém precisa dizer.' },
      ]},
      explanation: 'No imperativo, toda mudança precisa lembrar de cada pedaço que depende dela. No declarativo, a tela sempre sai dos dados.',
    },
    {
      id: 'RE-M1-Q4', type: 'multiple_choice',
      prompt: 'Por que no JSX a classe se escreve className?',
      data: { options: [
        { id: 'a', text: 'Porque class é palavra reservada do JavaScript.', correct: true },
        { id: 'b', text: 'Porque o React não aceita classes de CSS.', porque: 'Aceita, e é por className que elas chegam ao elemento da página.' },
        { id: 'c', text: 'Porque className é mais curto de digitar.', porque: 'É mais comprido. O motivo é class já ter outro significado no JavaScript.' },
        { id: 'd', text: 'Porque só o TypeScript exige esse nome.', porque: 'No React em JavaScript também é className. O TypeScript só aponta quando se escreve class.' },
      ]},
      explanation: 'O JSX vira código, e no código class declara uma classe do JavaScript. Para o atributo, o nome é className.',
    },
    {
      id: 'RE-M1-Q5', type: 'multiple_choice',
      prompt: 'O que aparece na tela com <p>Somos {8 + 4}</p>?',
      data: { options: [
        { id: 'a', text: 'Somos 12', correct: true },
        { id: 'b', text: 'Somos {8 + 4}', porque: 'As chaves não aparecem: o que vai dentro delas é calculado, e o resultado vai para a tela.' },
        { id: 'c', text: 'Somos 8 + 4', porque: 'Dentro das chaves é código, e não texto. A conta é feita.' },
        { id: 'd', text: 'Somos 84', porque: 'Dois números somados dão número. Juntar como texto seria somar com um texto.' },
      ]},
      explanation: 'Entre chaves vai qualquer valor do programa, e a tela mostra o resultado.',
    },
    vf('RE-M1-Q6', 'O nome de um componente precisa começar com letra maiúscula.', true,
      'Com minúscula, <saudacao /> é lido como uma tag do HTML que não existe, e o componente nunca é chamado.',
      'A maiúscula é como o React separa os seus componentes dos elementos do HTML.'),
    vf('RE-M1-Q7', 'Um componente pode devolver dois elementos lado a lado, sem nada em volta.', false,
      'O componente devolve um elemento só. Dois lado a lado vão dentro de um main, ou de um <>...</>.',
      'O fragmento <>...</> agrupa sem pôr nada a mais na página.'),
  ],

  /* ── Módulo 2 — Propriedades ── */
  'm2-teoria': [
    {
      id: 'RE-M2-Q1', type: 'multiple_choice',
      prompt: 'O que é uma propriedade (prop) de um componente?',
      data: { options: [
        { id: 'a', text: 'Um valor que ele recebe de quem o usa.', correct: true },
        { id: 'b', text: 'Um valor que ele guarda e muda sozinho.', porque: 'Isso é o estado. A propriedade chega de fora, e o componente só a lê.' },
        { id: 'c', text: 'Uma regra de estilo aplicada ao componente.', porque: 'Estilo vem da folha de estilo. A propriedade é qualquer valor passado na tag.' },
        { id: 'd', text: 'O nome do arquivo onde o componente mora.', porque: 'O arquivo é onde ele está escrito. A propriedade é o que ele recebe a cada uso.' },
      ]},
      explanation: 'Em <Cartao nome="Ipê" />, nome é uma propriedade, e chega como parâmetro da função.',
    },
    {
      id: 'RE-M2-Q2', type: 'multiple_choice',
      prompt: 'Como se passa o número 8 para a propriedade membros?',
      data: { options: [
        { id: 'a', text: 'membros={8}', correct: true },
        { id: 'b', text: 'membros="8"', porque: 'Entre aspas o valor chega como texto, "8". O compilador aponta, porque membros é número.' },
        { id: 'c', text: 'membros=8', porque: 'Sem aspas nem chaves o JSX não se lê. Valor que não é texto vai entre chaves.' },
        { id: 'd', text: 'membros:(8)', porque: 'Dois-pontos é como se escreve tipo, e não atributo de tag.' },
      ]},
      explanation: 'Texto vai entre aspas; número, verdadeiro ou falso e qualquer outro valor vão entre chaves.',
    },
    {
      id: 'RE-M2-Q3', type: 'multiple_choice',
      prompt: 'O componente Cartao foi tipado com interface Props { nome: string }. O que acontece em <Cartao nomi="Ipê" />?',
      data: { options: [
        { id: 'a', text: 'O painel de Problemas aponta a propriedade errada.', correct: true },
        { id: 'b', text: 'O cartão mostra Ipê do mesmo jeito.', porque: 'O cartão procura nome, e nomi não é nome. Sem o tipo, ele mostraria vazio sem aviso.' },
        { id: 'c', text: 'O React corrige para nome sozinho.', porque: 'Ninguém corrige nome errado sozinho. É para isso que o tipo aponta.' },
        { id: 'd', text: 'A página inteira para de carregar.', porque: 'O Vite roda a página mesmo com erro de tipo. Quem avisa é o painel de Problemas.' },
      ]},
      explanation: 'É a interface da CC-FE005 aplicada a um componente: cada uso é conferido contra ela.',
    },
    {
      id: 'RE-M2-Q4', type: 'multiple_choice',
      prompt: 'Um cartão importa a unidade Ipê do arquivo de dados e mostra o nome dela, sem receber propriedade nenhuma. O que há de errado?',
      data: { options: [
        { id: 'a', text: 'Ele só serve para a Ipê, e não para outra unidade.', correct: true },
        { id: 'b', text: 'Ele mostra o nome errado da Ipê.', porque: 'O nome sai certo. O problema aparece quando se precisa de outra unidade.' },
        { id: 'c', text: 'Componentes não podem importar arquivos.', porque: 'Podem, e importam o tempo todo. O problema é quem decide o que o cartão mostra.' },
        { id: 'd', text: 'Nada, é o jeito recomendado de fazer.', porque: 'Recebendo pela propriedade, o mesmo cartão mostra qualquer unidade. Indo buscar sozinho, ele fica preso a uma.' },
      ]},
      explanation: 'Quem usa o componente decide o que ele mostra. É isso que deixa o mesmo componente servir em vários lugares.',
    },
    {
      id: 'RE-M2-Q5', type: 'multiple_choice',
      prompt: 'Como se escreve na interface uma propriedade que pode faltar?',
      data: { options: [
        { id: 'a', text: 'destaque?: boolean', correct: true },
        { id: 'b', text: 'destaque: boolean | nada', porque: 'nada não é um tipo do TypeScript. O que pode faltar leva ponto de interrogação.' },
        { id: 'c', text: 'talvez destaque: boolean', porque: 'Não existe a palavra talvez no TypeScript. É o ponto de interrogação, como na CC-FE005.' },
        { id: 'd', text: 'destaque: boolean!', porque: 'O ponto de exclamação promete que o valor não é nulo, e não que ele pode faltar.' },
      ]},
      explanation: 'O ponto de interrogação depois do nome diz que a propriedade é opcional.',
    },
    vf('RE-M2-Q6', 'Um componente pode mudar o valor de uma propriedade que recebeu.', false,
      'A propriedade é só de leitura. Quem decide o valor é quem escreveu a tag.',
      'Para guardar um valor que muda, o componente usa estado, que é o assunto do módulo 4.'),
    vf('RE-M2-Q7', 'As propriedades chegam ao componente juntas, num objeto que é o primeiro parâmetro da função.', true,
      'É um objeto só, com todas as propriedades dentro, e por isso se desmonta com chaves: ({ nome, lema }).',
      'function Cartao({ nome, lema }: Props) desmonta o objeto das propriedades logo no parâmetro.'),
  ],

  /* ── Módulo 3 — Reaproveitar ── */
  'm3-teoria': [
    {
      id: 'RE-M3-Q1', type: 'multiple_choice',
      prompt: 'Três botões quase iguais estão escritos três vezes. Qual é a vantagem de trocá-los por um componente Botao?',
      data: { options: [
        { id: 'a', text: 'Um defeito se conserta num lugar só.', correct: true },
        { id: 'b', text: 'A página fica com menos botões.', porque: 'Continuam sendo três botões na página. Só passam a ser escritos uma vez.' },
        { id: 'c', text: 'Os botões passam a funcionar sem clique.', porque: 'O clique continua sendo o que dispara o botão. O componente só evita a repetição.' },
        { id: 'd', text: 'O navegador carrega a página mais rápido.', porque: 'A diferença de velocidade é desprezível. O ganho é de quem escreve e conserta o código.' },
      ]},
      explanation: 'O que é igual fica escrito uma vez dentro do componente; o que muda vira propriedade.',
    },
    {
      id: 'RE-M3-Q2', type: 'multiple_choice',
      prompt: 'O que chega na propriedade children em <Botao>Zerar</Botao>?',
      data: { options: [
        { id: 'a', text: 'O texto Zerar.', correct: true },
        { id: 'b', text: 'O nome Botao.', porque: 'Botao é o componente. children é o que vai entre a abertura e o fechamento da tag.' },
        { id: 'c', text: 'Nada, porque não há atributo.', porque: 'O conteúdo entre as tags chega em children, mesmo sem atributo nenhum escrito.' },
        { id: 'd', text: 'Os outros botões da página.', porque: 'children é só o que está dentro desta tag, e não os vizinhos dela.' },
      ]},
      explanation: 'children é o conteúdo de dentro da tag, e o tipo dele é ReactNode.',
    },
    {
      id: 'RE-M3-Q3', type: 'multiple_choice',
      prompt: 'O Botao recebe aoClicar e o passa ao onClick do button. Quem decide o que acontece no clique?',
      data: { options: [
        { id: 'a', text: 'Quem usa o Botao, ao passar a função.', correct: true },
        { id: 'b', text: 'O próprio Botao, que sabe de pontos.', porque: 'O Botao não sabe de pontos: ele só chama a função que recebeu.' },
        { id: 'c', text: 'O navegador, pelo tipo do botão.', porque: 'O navegador só avisa do clique. O que fazer está na função passada.' },
        { id: 'd', text: 'O arquivo de estilo, pela cor.', porque: 'A cor muda a aparência, e não o que o clique faz.' },
      ]},
      explanation: '<Botao aoClicar={() => setPontos(0)}> entrega ao Botao uma função pronta, e ele a chama no clique.',
    },
    {
      id: 'RE-M3-Q4', type: 'multiple_choice',
      prompt: 'Qual é o tipo de uma propriedade que só aceita verde, azul ou vermelho?',
      data: { options: [
        { id: 'a', text: "'verde' | 'azul' | 'vermelho'", correct: true },
        { id: 'b', text: 'string', porque: 'string aceita qualquer texto, inclusive roxo. A união aceita só as três.' },
        { id: 'c', text: "['verde', 'azul', 'vermelho']", porque: 'Isso é um arranjo com três textos, e não um tipo que escolhe um deles.' },
        { id: 'd', text: 'any', porque: 'any aceita qualquer coisa e cala o compilador. É o contrário do que se quer.' },
      ]},
      explanation: 'É o tipo de união da CC-FE005: escrever cor="roxo" aparece no painel de Problemas.',
    },
    {
      id: 'RE-M3-Q5', type: 'multiple_choice',
      prompt: 'Qual é o tipo de uma propriedade aoClicar, que não recebe nada e não devolve nada?',
      data: { options: [
        { id: 'a', text: '() => void', correct: true },
        { id: 'b', text: 'function', porque: 'function é a palavra que declara uma função, e não o tipo dela.' },
        { id: 'c', text: 'void', porque: 'void sozinho é o tipo de nada. A propriedade é uma função que devolve nada.' },
        { id: 'd', text: 'string', porque: 'string é texto. O onClick precisa de uma função para chamar.' },
      ]},
      explanation: 'Os parênteses vazios dizem que não recebe nada; o void depois da seta, que não devolve nada.',
    },
    vf('RE-M3-Q6', 'O mesmo componente, usado duas vezes com propriedades diferentes, desenha duas coisas diferentes.', true,
      'É justamente o reaproveitamento: o componente é escrito uma vez, e cada uso traz as suas propriedades.',
      '<Selo cor="verde" /> e <Selo cor="azul" /> são o mesmo componente desenhando dois selos.'),
    vf('RE-M3-Q7', 'Para o Botao ter um texto diferente em cada uso, é preciso escrever um componente para cada texto.', false,
      'O texto chega em children, ou numa propriedade. Um componente só serve para todos os textos.',
      'Escrever um componente por texto seria a repetição que o componente existe para evitar.'),
  ],

  /* ── Módulo 4 — Estado ── */
  'm4-teoria': [
    {
      id: 'RE-M4-Q1', type: 'multiple_choice',
      prompt: 'O que é o estado de um componente?',
      data: { options: [
        { id: 'a', text: 'O que ele lembra entre um desenho e outro.', correct: true },
        { id: 'b', text: 'O que ele recebe de quem o usa.', porque: 'Isso é a propriedade. O estado é do próprio componente, e ele pode mudar.' },
        { id: 'c', text: 'A cidade onde o clube fica.', porque: 'Aqui estado é termo do React: o valor que o componente guarda e que muda a tela.' },
        { id: 'd', text: 'Se o componente está ligado ou desligado.', porque: 'O estado pode guardar qualquer valor, e não só ligado ou desligado.' },
      ]},
      explanation: 'const [presentes, setPresentes] = useState(0) cria um estado que começa em zero.',
    },
    {
      id: 'RE-M4-Q2', type: 'multiple_choice',
      prompt: 'O contador usa let presentes = 0 e o botão soma 1. O console mostra o número subindo, mas a tela fica em 0. Por quê?',
      data: { options: [
        { id: 'a', text: 'Mudar a variável não pede para desenhar de novo.', correct: true },
        { id: 'b', text: 'O console está mostrando um número errado.', porque: 'O console está certo: a variável sobe. Quem não sabe disso é o React.' },
        { id: 'c', text: 'O botão não está ligado ao onClick.', porque: 'Se não estivesse, o console também não mostraria o número subindo.' },
        { id: 'd', text: 'Falta recarregar a página no navegador.', porque: 'Recarregar começa tudo do zero. O que falta é guardar o valor em estado.' },
      ]},
      explanation: 'Só a função do estado, setPresentes, guarda o valor e pede um desenho novo.',
    },
    {
      id: 'RE-M4-Q3', type: 'multiple_choice',
      prompt: 'O que faz setPresentes(presentes + 1)?',
      data: { options: [
        { id: 'a', text: 'Guarda o valor novo e desenha de novo.', correct: true },
        { id: 'b', text: 'Só escreve o valor novo no console.', porque: 'Ela não escreve no console. Ela troca o estado e pede outro desenho.' },
        { id: 'c', text: 'Soma 1 e não mexe na tela.', porque: 'Mexer na tela é justamente o que a distingue de uma variável comum.' },
        { id: 'd', text: 'Recarrega a página inteira.', porque: 'A página não recarrega. Só o componente é desenhado de novo, com o valor novo.' },
      ]},
      explanation: 'É por isso que toda mudança de estado passa pela função: é ela que avisa o React.',
    },
    {
      id: 'RE-M4-Q4', type: 'multiple_choice',
      prompt: 'O que aparece na página com {presentes >= 5 && <p>Temos quórum!</p>} quando presentes vale 3?',
      data: { options: [
        { id: 'a', text: 'Nada: o parágrafo não existe na página.', correct: true },
        { id: 'b', text: 'O parágrafo, escondido por uma classe.', porque: 'Não há classe nenhuma. Com a condição falsa, o parágrafo nem é criado.' },
        { id: 'c', text: 'O texto false escrito na tela.', porque: 'O React não escreve false. Com a condição falsa, não aparece nada.' },
        { id: 'd', text: 'O parágrafo, com o número 3.', porque: 'O parágrafo só existe quando a conta dá verdadeiro, e 3 não é maior ou igual a 5.' },
      ]},
      explanation: 'É a renderização condicional: o pedaço só existe quando a condição vale.',
    },
    {
      id: 'RE-M4-Q5', type: 'multiple_choice',
      prompt: 'Qual destas é uma renderização condicional?',
      data: { options: [
        { id: 'a', text: "{membros === 1 ? 'membro' : 'membros'}", correct: true },
        { id: 'b', text: 'const [n, setN] = useState(0)', porque: 'Isso cria um estado. A condição escolhe o que aparece conforme um valor.' },
        { id: 'c', text: '<Botao cor="verde">+1</Botao>', porque: 'Isso usa um componente com uma propriedade. Não há escolha nenhuma ali.' },
        { id: 'd', text: '{avisos.length} avisos', porque: 'Isso mostra um número. Não escolhe entre duas coisas.' },
      ]},
      explanation: 'O ternário escolhe entre dois pedaços conforme a condição; o && mostra ou não mostra um.',
    },
    vf('RE-M4-Q6', 'Escrever presentes = presentes + 1 numa variável criada pelo useState também atualiza a tela.', false,
      'O estado não se muda direto. Só a função, setPresentes, guarda o valor e pede um desenho novo.',
      'Com const, o TypeScript nem deixa escrever a atribuição — e é bom que não deixe.'),
    vf('RE-M4-Q7', 'Ganchos como o useState só podem ser chamados no topo do componente.', true,
      'O React conta os ganchos pela ordem em que são chamados. Dentro de um if, a ordem mudaria de um desenho para outro.',
      'Funções que começam com use são ganchos, e vão sempre no topo, sem condição em volta.'),
  ],

  /* ── Módulo 5 — Listas e chaves ── */
  'm5-teoria': [
    {
      id: 'RE-M5-Q1', type: 'multiple_choice',
      prompt: 'Para que serve a key num item de lista?',
      data: { options: [
        { id: 'a', text: 'Para o React reconhecer cada item quando a lista muda.', correct: true },
        { id: 'b', text: 'Para ordenar a lista em ordem alfabética.', porque: 'A key não ordena nada. A ordem é a do arranjo.' },
        { id: 'c', text: 'Para proteger a lista com uma senha.', porque: 'Apesar do nome, key aqui não tem nada de segurança. Ela identifica o item.' },
        { id: 'd', text: 'Para mostrar um número ao lado de cada item.', porque: 'A key não aparece na tela. Ela é só para o React.' },
      ]},
      explanation: 'Com a chave, o React sabe o que saiu, o que entrou e o que ficou.',
    },
    {
      id: 'RE-M5-Q2', type: 'multiple_choice',
      prompt: 'Qual é a melhor chave para uma lista de tarefas que cada uma tem um id?',
      data: { options: [
        { id: 'a', text: 'O id da tarefa.', correct: true },
        { id: 'b', text: 'A posição da tarefa na lista.', porque: 'A posição muda quando alguém sai da lista, e o estado de cada item passa para o vizinho.' },
        { id: 'c', text: 'Um número sorteado a cada desenho.', porque: 'Uma chave nova a cada desenho faz o React jogar fora e recriar todos os itens.' },
        { id: 'd', text: 'O texto escrito em todas: tarefa.', porque: 'A chave precisa ser única entre os irmãos. A mesma para todos não identifica nenhum.' },
      ]},
      explanation: 'A chave precisa ser única e ficar a mesma enquanto o item existir. O id é as duas coisas.',
    },
    {
      id: 'RE-M5-Q3', type: 'multiple_choice',
      prompt: 'Numa lista com key={i}, você marca a terceira tarefa e remove a primeira. A marca aparece na tarefa que era a quarta. Por quê?',
      data: { options: [
        { id: 'a', text: 'A marca ficou presa à posição, que mudou.', correct: true },
        { id: 'b', text: 'O clique no x acertou a tarefa errada.', porque: 'A primeira saiu, como devia. O que pulou foi a marca, que seguiu a chave.' },
        { id: 'c', text: 'O navegador mudou a ordem da lista.', porque: 'A ordem é a do arranjo, e ela continua certa. A marca é que foi para outro item.' },
        { id: 'd', text: 'Falta um console.log na função de remover.', porque: 'O console só mostra. O defeito vem da chave ser a posição.' },
      ]},
      explanation: 'O estado de cada item fica com a chave. Se a chave é a posição, ele passa para quem ocupar aquela posição.',
    },
    {
      id: 'RE-M5-Q4', type: 'multiple_choice',
      prompt: 'Como se tira a tarefa de id 2 do estado tarefas?',
      data: { options: [
        { id: 'a', text: 'setTarefas(tarefas.filter(t => t.id !== 2))', correct: true },
        { id: 'b', text: 'tarefas.splice(1, 1)', porque: 'splice muda o arranjo de agora sem passar pela função, e a tela não é desenhada de novo.' },
        { id: 'c', text: "document.querySelector('li').remove()", porque: 'Tirar da página e não dos dados faz a tarefa voltar no próximo desenho.' },
        { id: 'd', text: 'setTarefas(tarefas.map(t => t.id !== 2))', porque: 'map transforma cada item em verdadeiro ou falso. Quem escolhe quais ficam é filter.' },
      ]},
      explanation: 'A tela sai dos dados: tirar da tela é tirar do arranjo, com um arranjo novo passado à função.',
    },
    {
      id: 'RE-M5-Q5', type: 'multiple_choice',
      prompt: 'O console diz: Each child in a list should have a unique key prop. O que falta?',
      data: { options: [
        { id: 'a', text: 'Uma key em cada elemento criado no map.', correct: true },
        { id: 'b', text: 'Um id na tag ul da lista.', porque: 'O aviso é sobre os filhos da lista, cada um criado pelo map, e não sobre a lista.' },
        { id: 'c', text: 'Uma propriedade chamada child no componente.', porque: 'child no aviso é cada filho da lista. O que falta é a key em cada um.' },
        { id: 'd', text: 'Nada, é um aviso que sempre aparece.', porque: 'Ele só aparece quando falta a chave, e avisa de um defeito que vem depois.' },
      ]},
      explanation: 'O aviso vem do React de desenvolvimento, e some com key={t.id} no elemento do map.',
    },
    vf('RE-M5-Q6', 'Uma lista sem key aparece na tela igual a uma com key.', true,
      'Na primeira vez, aparece. A diferença está em quando a lista muda, e no aviso do console.',
      'Por isso o aviso existe: o defeito não se vê na primeira olhada.'),
    vf('RE-M5-Q7', 'Usar a posição como key é seguro em qualquer lista.', false,
      'Numa lista que muda, com estado em cada item, a posição faz o estado pular para o vizinho.',
      'A chave certa é a que fica a mesma enquanto o item existir, como o id.'),
  ],

  /* ── Módulo 6 — Formulário controlado ── */
  'm6-teoria': [
    {
      id: 'RE-M6-Q1', type: 'multiple_choice',
      prompt: 'O que é um formulário controlado?',
      data: { options: [
        { id: 'a', text: 'Um formulário em que os campos mostram o estado.', correct: true },
        { id: 'b', text: 'Um formulário com senha para entrar.', porque: 'Controlado aqui é sobre quem guarda o que se digita, e não sobre acesso.' },
        { id: 'c', text: 'Um formulário que só aceita números.', porque: 'Ele aceita o que o campo aceitar. O que muda é o estado guardar o valor.' },
        { id: 'd', text: 'Um formulário enviado para o servidor.', porque: 'Enviar é outra coisa. Controlado diz que o valor do campo vem do estado.' },
      ]},
      explanation: 'value={nome} e onChange={e => setNome(e.target.value)}: o campo mostra o estado, e cada tecla vai para ele.',
    },
    {
      id: 'RE-M6-Q2', type: 'multiple_choice',
      prompt: 'Um campo tem value={nome}, mas não tem onChange. O que acontece quando se digita nele?',
      data: { options: [
        { id: 'a', text: 'Nada muda: o campo fica travado no valor.', correct: true },
        { id: 'b', text: 'O que se digita aparece normalmente.', porque: 'O campo mostra o estado, e ninguém muda o estado. O console avisa disso.' },
        { id: 'c', text: 'A página recarrega a cada tecla.', porque: 'Digitar não recarrega nada. O campo só não sai do valor que o estado tem.' },
        { id: 'd', text: 'O estado muda sozinho.', porque: 'Sem onChange, ninguém chama setNome. O estado fica como estava.' },
      ]},
      explanation: 'Os dois lados vão juntos: value diz o que mostrar, onChange guarda o que se digita.',
    },
    {
      id: 'RE-M6-Q3', type: 'multiple_choice',
      prompt: 'Para que serve e.preventDefault() no onSubmit?',
      data: { options: [
        { id: 'a', text: 'Para enviar não recarregar a página.', correct: true },
        { id: 'b', text: 'Para impedir que o formulário seja enviado.', porque: 'O envio acontece: a função roda. O que se impede é o recarregamento padrão.' },
        { id: 'c', text: 'Para apagar os campos depois de enviar.', porque: 'Quem apaga é o estado voltando ao valor inicial, como setNome.' },
        { id: 'd', text: 'Para conferir se o nome está escrito.', porque: 'A conferência é um if escrito por você. preventDefault só impede o padrão do navegador.' },
      ]},
      explanation: 'Recarregar apagaria o estado inteiro, com tudo o que foi digitado.',
    },
    {
      id: 'RE-M6-Q4', type: 'multiple_choice',
      prompt: 'Como se acrescenta uma inscrição nova ao estado inscritos?',
      data: { options: [
        { id: 'a', text: 'setInscritos([...inscritos, nova])', correct: true },
        { id: 'b', text: 'inscritos.push(nova)', porque: 'push muda o arranjo sem passar pela função, e a tela não é desenhada de novo.' },
        { id: 'c', text: 'setInscritos(nova)', porque: 'Isso troca a lista inteira por uma inscrição só, e as outras somem.' },
        { id: 'd', text: 'inscritos = [nova]', porque: 'O estado não se muda direto, e ainda perderia as inscrições anteriores.' },
      ]},
      explanation: 'Um arranjo novo, com as anteriores e a nova no fim, passado à função do estado.',
    },
    {
      id: 'RE-M6-Q5', type: 'multiple_choice',
      prompt: 'Depois de enviar, o campo do nome continua com o que foi digitado. O que falta?',
      data: { options: [
        { id: 'a', text: "Devolver o estado ao começo: setNome('').", correct: true },
        { id: 'b', text: "Apagar o campo com o document.", porque: 'O campo mostra o estado. Limpar o estado limpa o campo, sem tocar nele.' },
        { id: 'c', text: 'Recarregar a página depois de enviar.', porque: 'Recarregar apagaria também a lista de inscritos.' },
        { id: 'd', text: 'Tirar o value do campo.', porque: 'Sem value o campo deixa de ser controlado, e o estado não manda mais nele.' },
      ]},
      explanation: 'No formulário controlado, mudar o estado muda o campo.',
    },
    vf('RE-M6-Q6', 'Com o campo controlado, dá para passar tudo o que se digita para maiúsculas.', true,
      'O onChange recebe o que foi digitado e pode guardar outra coisa, como e.target.value.toUpperCase().',
      'O campo mostra o estado, e o estado guarda o que o onChange decidiu.'),
    vf('RE-M6-Q7', 'Recusar um envio sem nome, sem dizer nada na tela, é suficiente.', false,
      'A pessoa clica e nada acontece, sem saber por quê. O motivo precisa aparecer na tela.',
      'Guarde o erro num estado e mostre com renderização condicional.'),
  ],

  /* ── Módulo 7 — Efeitos ── */
  'm7-teoria': [
    {
      id: 'RE-M7-Q1', type: 'multiple_choice',
      prompt: 'O que é um efeito colateral num componente?',
      data: { options: [
        { id: 'a', text: 'Algo que mexe fora do componente.', correct: true },
        { id: 'b', text: 'Um erro que aparece no console.', porque: 'Efeito colateral não é defeito. É qualquer coisa além de devolver a tela.' },
        { id: 'c', text: 'Uma animação na página.', porque: 'Animar pode ou não ser efeito. O que define é mexer em algo de fora, como o título da aba.' },
        { id: 'd', text: 'O valor que o componente devolve.', porque: 'Devolver a tela é desenhar. O efeito é o que vai além disso.' },
      ]},
      explanation: 'Mudar o título da aba, salvar, pedir dados à rede: tudo isso é efeito, e vai num useEffect.',
    },
    {
      id: 'RE-M7-Q2', type: 'multiple_choice',
      prompt: 'Quando roda o código de um useEffect?',
      data: { options: [
        { id: 'a', text: 'Depois de a tela ser desenhada.', correct: true },
        { id: 'b', text: 'Antes de o componente existir.', porque: 'O efeito precisa do componente desenhado. Ele roda depois.' },
        { id: 'c', text: 'Só quando alguém clica num botão.', porque: 'O clique é do onClick. O efeito roda depois do desenho, sem clique nenhum.' },
        { id: 'd', text: 'No servidor, antes de enviar a página.', porque: 'O efeito roda no navegador, depois de desenhar.' },
      ]},
      explanation: 'O componente desenha; depois, o React roda os efeitos.',
    },
    {
      id: 'RE-M7-Q3', type: 'multiple_choice',
      prompt: 'O efeito que salva a chamada roda a cada letra digitada na busca. O que falta?',
      data: { options: [
        { id: 'a', text: 'A lista de dependências: [presentes].', correct: true },
        { id: 'b', text: 'Tirar o campo de busca da tela.', porque: 'A busca é útil. O efeito é que precisa dizer do que depende.' },
        { id: 'c', text: 'Trocar o useEffect por um onClick.', porque: 'Salvar quando a chamada muda é um efeito. Ligado a um clique, deixaria de salvar sozinho.' },
        { id: 'd', text: 'Um console.log a menos.', porque: 'O log só mostra o salvamento. O que muda quando ele roda é a lista de dependências.' },
      ]},
      explanation: 'Sem a lista, o efeito roda depois de todo desenho; com [presentes], só quando presentes muda.',
    },
    {
      id: 'RE-M7-Q4', type: 'multiple_choice',
      prompt: 'Quando roda um efeito com a lista de dependências vazia, []?',
      data: { options: [
        { id: 'a', text: 'Uma vez, quando o componente aparece.', correct: true },
        { id: 'b', text: 'Nunca, porque a lista está vazia.', porque: 'Ele roda na primeira vez. A lista vazia diz que depois disso não há motivo para rodar de novo.' },
        { id: 'c', text: 'Depois de todo desenho.', porque: 'Isso é o efeito sem lista nenhuma. A lista vazia é o contrário.' },
        { id: 'd', text: 'A cada segundo, como um relógio.', porque: 'O efeito não tem relógio. Ele roda conforme a lista de dependências.' },
      ]},
      explanation: 'É o caso de buscar dados que não dependem de nada: pede-se uma vez, ao aparecer.',
    },
    {
      id: 'RE-M7-Q5', type: 'multiple_choice',
      prompt: 'No modo de desenvolvimento, o primeiro salvamento aparece duas vezes no console. Por quê?',
      data: { options: [
        { id: 'a', text: 'O StrictMode monta duas vezes, de propósito.', correct: true },
        { id: 'b', text: 'O efeito está escrito duas vezes.', porque: 'Com um efeito só, ele aparece em dobro mesmo assim. É o StrictMode testando.' },
        { id: 'c', text: 'O navegador tem um defeito.', porque: 'Não é defeito: é um teste do React para achar efeito que deixa sujeira.' },
        { id: 'd', text: 'A lista de dependências está errada.', porque: 'A dobra é só na montagem, e acontece com qualquer lista.' },
      ]},
      explanation: 'No site publicado isso não acontece. O StrictMode só age em desenvolvimento.',
    },
    vf('RE-M7-Q6', 'Escrever document.title no meio do componente, fora de um efeito, faz o título mudar.', true,
      'Ele muda, a cada desenho. O problema é o lugar: efeito no meio do desenho roda quando o React quiser.',
      'Funciona e está errado. O lugar do efeito colateral é o useEffect.'),
    vf('RE-M7-Q7', 'Um efeito sem a lista de dependências roda uma vez só.', false,
      'Sem a lista ele roda depois de todo desenho. Uma vez só é o efeito com a lista vazia.',
      'A lista diz quando rodar de novo; sem ela, é sempre.'),
  ],

  /* ── Módulo 8 — Navegação ── */
  'm8-teoria': [
    {
      id: 'RE-M8-Q1', type: 'multiple_choice',
      prompt: 'Numa aplicação de React, o que decide qual tela aparece?',
      data: { options: [
        { id: 'a', text: 'O endereço, lido pelo roteador.', correct: true },
        { id: 'b', text: 'Um arquivo HTML diferente para cada tela.', porque: 'A aplicação é uma página só. Quem troca a tela é o roteador, pelo endereço.' },
        { id: 'c', text: 'O tamanho da janela do navegador.', porque: 'O tamanho muda a aparência, pelo CSS. A tela mostrada vem do endereço.' },
        { id: 'd', text: 'O servidor, a cada clique.', porque: 'O clique num Link troca a tela sem pedir nada ao servidor.' },
      ]},
      explanation: 'Cada Route liga um caminho a um componente, e o roteador mostra o que combina com o endereço.',
    },
    {
      id: 'RE-M8-Q2', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre um Link e um a comum para trocar de tela?',
      data: { options: [
        { id: 'a', text: 'O Link troca a tela sem recarregar a página.', correct: true },
        { id: 'b', text: 'O Link abre a tela numa janela nova.', porque: 'Ele troca na mesma janela. Janela nova é o target do a.' },
        { id: 'c', text: 'O Link só funciona com internet.', porque: 'Trocar de tela com o Link não pede nada à rede.' },
        { id: 'd', text: 'Não há diferença nenhuma.', porque: 'O a comum pode recarregar tudo e apagar o estado. O Link avisa o roteador.' },
      ]},
      explanation: 'Na página o Link vira um a, mas o clique passa pelo roteador e a página não recarrega.',
    },
    {
      id: 'RE-M8-Q3', type: 'multiple_choice',
      prompt: 'Com path="/unidade/:id", o que useParams() devolve no endereço #/unidade/ipe?',
      data: { options: [
        { id: 'a', text: "{ id: 'ipe' }", correct: true },
        { id: 'b', text: "'/unidade/ipe'", porque: 'useParams devolve só os pedaços com dois-pontos, num objeto, e não o caminho inteiro.' },
        { id: 'c', text: "{ unidade: 'ipe' }", porque: 'O nome vem do que está depois dos dois-pontos: :id vira id.' },
        { id: 'd', text: 'undefined', porque: 'O endereço combina com a rota, e o pedaço :id vale ipe.' },
      ]},
      explanation: 'Os dois-pontos marcam o pedaço que muda, e useParams o devolve pelo nome.',
    },
    {
      id: 'RE-M8-Q4', type: 'multiple_choice',
      prompt: 'Para que serve uma Route com path="*", posta por último?',
      data: { options: [
        { id: 'a', text: 'Mostrar uma tela para o endereço que não existe.', correct: true },
        { id: 'b', text: 'Mostrar todas as telas ao mesmo tempo.', porque: 'O roteador mostra uma tela por vez. O asterisco pega o que nenhuma outra pegou.' },
        { id: 'c', text: 'Proibir endereços com asterisco.', porque: 'O asterisco não é proibição: ele combina com qualquer caminho.' },
        { id: 'd', text: 'Voltar para a tela anterior.', porque: 'Voltar é o botão do navegador, ou um Link. A rota com asterisco mostra a tela de não encontrado.' },
      ]},
      explanation: 'É a tela de Página não encontrada, para quem digitou ou recebeu um endereço errado.',
    },
    {
      id: 'RE-M8-Q5', type: 'multiple_choice',
      prompt: 'Por que a Trilha.Web() e o laboratório usam o HashRouter, com o # no endereço?',
      data: { options: [
        { id: 'a', text: 'O GitHub Pages não sabe responder cada caminho.', correct: true },
        { id: 'b', text: 'O # deixa a página mais rápida.', porque: 'A velocidade é a mesma. O # resolve o servidor que não conhece os caminhos.' },
        { id: 'c', text: 'O # protege a página de invasores.', porque: 'O # não tem nada de segurança. Tudo depois dele fica só no navegador.' },
        { id: 'd', text: 'Todo roteador exige um # no endereço.', porque: 'Há roteadores sem #, mas eles precisam de um servidor que responda todo caminho.' },
      ]},
      explanation: 'Tudo depois do # fica com o navegador, e o servidor recebe sempre o mesmo endereço.',
    },
    vf('RE-M8-Q6', 'Quem abre um endereço como #/unidade/jatoba direto precisa ver a mesma tela de quem chegou clicando.', true,
      'O endereço é o que diz a tela. Ele pode ser guardado, mandado para alguém e aberto depois.',
      'É por isso que a tela lê o endereço com useParams, em vez de lembrar em que se clicou.'),
    vf('RE-M8-Q7', 'Trocar de tela numa aplicação de React recarrega a página inteira.', false,
      'A aplicação é uma página só. O roteador troca a tela e o estado não se perde.',
      'É o que a torna rápida: nada é pedido ao servidor a cada troca.'),
  ],

  /* ── Módulo 9 — Dados da rede ── */
  'm9-teoria': [
    {
      id: 'RE-M9-Q1', type: 'multiple_choice',
      prompt: 'Quais são os três estados de uma tela que busca dados na rede?',
      data: { options: [
        { id: 'a', text: 'Carregando, sucesso e erro.', correct: true },
        { id: 'b', text: 'Começo, meio e fim.', porque: 'A tela não conta uma história. Ela espera, recebe ou falha.' },
        { id: 'c', text: 'Ligado, desligado e pausado.', porque: 'Isso parece um aparelho. O pedido à rede espera, chega ou falha.' },
        { id: 'd', text: 'Rápido, lento e parado.', porque: 'A velocidade varia, mas o que a tela precisa mostrar é se está esperando, se chegou ou se falhou.' },
      ]},
      explanation: 'Cada um vira um estado do componente e um pedaço condicional da tela.',
    },
    {
      id: 'RE-M9-Q2', type: 'multiple_choice',
      prompt: 'Onde se escreve o fetch que busca os dados quando a tela aparece?',
      data: { options: [
        { id: 'a', text: 'Num useEffect com a lista vazia.', correct: true },
        { id: 'b', text: 'Solto no meio do componente.', porque: 'O meio do componente roda a cada desenho, e guardar a resposta desenha de novo: o pedido não para.' },
        { id: 'c', text: 'No onClick de um botão escondido.', porque: 'Ninguém clicaria. O efeito roda sozinho, depois de desenhar.' },
        { id: 'd', text: 'No arquivo index.html.', porque: 'O index.html só carrega o projeto. O pedido é do componente, num efeito.' },
      ]},
      explanation: 'Buscar dados é um efeito colateral, e com [] ele roda uma vez, ao aparecer.',
    },
    {
      id: 'RE-M9-Q3', type: 'multiple_choice',
      prompt: 'O painel Rede mostra dezenas de pedidos iguais, um atrás do outro. O que provavelmente está faltando?',
      data: { options: [
        { id: 'a', text: 'A lista de dependências do efeito.', correct: true },
        { id: 'b', text: 'Um .catch no fetch.', porque: 'O .catch trata a falha. Pedidos repetidos vêm do efeito rodando a cada desenho.' },
        { id: 'c', text: 'A conexão com a internet.', porque: 'Sem internet os pedidos falhariam, e não se multiplicariam.' },
        { id: 'd', text: 'Um console.log no efeito.', porque: 'O log só mostra. Quem decide quantas vezes o efeito roda é a lista.' },
      ]},
      explanation: 'Sem a lista, guardar a resposta desenha de novo, que pede de novo, que desenha de novo.',
    },
    {
      id: 'RE-M9-Q4', type: 'multiple_choice',
      prompt: 'A BrasilAPI responde 404 para o ano 1850. O que o fetch faz?',
      data: { options: [
        { id: 'a', text: 'Resolve, com resposta.ok falso.', correct: true },
        { id: 'b', text: 'Rejeita, e cai no .catch sozinho.', porque: 'O fetch só rejeita quando a resposta não chega. Um 404 chegou, e é preciso conferir resposta.ok.' },
        { id: 'c', text: 'Devolve uma lista vazia.', porque: 'A resposta traz uma mensagem de erro, e não uma lista.' },
        { id: 'd', text: 'Tenta de novo até dar certo.', porque: 'O fetch pede uma vez. Tentar de novo é decisão de quem escreveu a tela.' },
      ]},
      explanation: 'Antes do .json(), confira resposta.ok e lance um erro quando for falso, para cair no mesmo .catch.',
    },
    {
      id: 'RE-M9-Q5', type: 'multiple_choice',
      prompt: 'Sem internet, a tela fica em Carregando para sempre e o console diz Uncaught (in promise). O que falta?',
      data: { options: [
        { id: 'a', text: 'Um .catch que guarde o erro e pare o carregando.', correct: true },
        { id: 'b', text: 'Um useState a mais para os feriados.', porque: 'Os feriados não chegaram. O que falta é tratar a falha.' },
        { id: 'c', text: 'Mudar a lista de dependências para [feriados].', porque: 'Isso faria o efeito rodar de novo quando os feriados mudassem, e eles não mudam.' },
        { id: 'd', text: 'Recarregar a página quando a rede voltar.', porque: 'Recarregar não é tratar a falha. A tela precisa dizer o que houve e oferecer tentar de novo.' },
      ]},
      explanation: 'O .catch recebe a rejeição; nele se guarda a mensagem e se desliga o carregando.',
    },
    vf('RE-M9-Q6', 'Uma tela que fica vazia enquanto espera a resposta, sem dizer nada, está tratando o estado de carregando.', false,
      'A tela vazia não diz se é para esperar ou desistir. O estado de carregando precisa aparecer.',
      'Um Carregando… na tela é o que diz à pessoa que vale a pena esperar.'),
    vf('RE-M9-Q7', 'O botão Tentar de novo pode chamar a mesma função que buscou os dados da primeira vez.', true,
      'Buscar é a mesma coisa nas duas vezes: ligar o carregando, apagar o erro e pedir.',
      'Por isso o fetch vai numa função própria, chamada pelo efeito e pelo botão.'),
  ],
};
