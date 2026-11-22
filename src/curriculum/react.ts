/*
 * A vereda CC-FE006 React.
 *
 * ── De onde ela vem ──────────────────────────────────────────────────────
 * Das duas que o requisito 1 pede: a CC-FE004, porque React é outra maneira
 * de fazer o que ela fazia à mão — mudar a página depois que ela abriu —, e
 * a CC-FE005, porque o projeto é em TypeScript, como os projetos de React
 * que se criam hoje. A origem é a de DOM: é dela que a vereda continua.
 *
 * ── O projeto é o do Vite ────────────────────────────────────────────────
 * Os laboratórios abrem o arranjo que o `npm create vite` deixa — `index.html`,
 * `main.tsx`, `App.tsx` —, compilado pelo mesmo TypeScript da CC-FE005 e
 * rodado com o React de verdade, o de desenvolvimento, que avisa da lista sem
 * chave e do campo descontrolado. A página roda mesmo com erro de tipo,
 * porque o Vite não espera a verificação; o painel de Problemas é o editor
 * sublinhando.
 *
 * ── Os exemplos da teoria ────────────────────────────────────────────────
 * Cada exemplo é um `App.tsx` inteiro, e o quadro ao lado diz o que a página
 * mostra, linha a linha. `exemplosDeReact.test.ts` compila cada um, roda com
 * o React de verdade e confere.
 *
 * ── A ordem ──────────────────────────────────────────────────────────────
 * Primeiro o porquê — descrever a tela em vez de mexer nela, que é o
 * requisito 3 e a CC-FE004 vista de fora. Depois as peças, uma por módulo,
 * na ordem em que uma precisa da outra: componente, propriedade, reuso,
 * estado, lista, formulário e efeito. Por fim as duas coisas que toda
 * aplicação tem: mais de uma tela, e dados que chegam pela rede.
 */

import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DE_REACT } from './questoesDeReact';

const CAPITULOS: { id: string; topicos: TopicoDeVereda[] }[] = [
  {
    id: 'declarar',
    topicos: [
      {
        id: 'descrever-ou-mexer',
        titulo: 'Mexer na página, ou descrever a página',
        resumo: 'Na CC-FE004 você dizia o que mudar; no React você diz como a tela é, e ele muda o que precisar.',
        explicacao: [
          'Na CC-FE004, para mostrar uma lista de avisos, você achava o `<ul>` com o `document`, criava cada `<li>`, punha o texto e pendurava na página. Cada passo era uma ordem: faça isto, depois aquilo. É o jeito **imperativo**.',
          'O React troca a pergunta. Em vez de "o que eu mudo?", você escreve **como a tela é** para os dados de agora: "uma lista com um item por aviso". Quando os dados mudam, ele compara a tela nova com a antiga e mexe só no que mudou. É o jeito **declarativo**.',
          'A diferença aparece quando a página cresce. No imperativo, cada mudança precisa lembrar de atualizar cada pedaço que depende dela — esquecer um é o defeito mais comum. No declarativo não há o que lembrar: a tela sempre sai dos dados.',
        ],
        exemplo: `const avisos = ['Reunião no sábado', 'Trazer o lenço'];

export default function App() {
  return (
    <ul>
      {avisos.map(aviso => <li key={aviso}>{aviso}</li>)}
    </ul>
  );
}`,
        exemploComo: 'react',
        exemploSaida: `Reunião no sábado
Trazer o lenço`,
        marcas: ['imperativo', 'declarativo', 'document'],
      },
      {
        id: 'componente',
        titulo: 'Componente: uma função que devolve um pedaço de tela',
        resumo: 'O nome começa com letra maiúscula, e ele se usa como uma tag.',
        explicacao: [
          'Um **componente** é uma função que devolve um pedaço de tela. Ela se escreve como qualquer função, e se usa como se fosse uma tag nova do HTML: `<Saudacao />`.',
          'O nome começa com **letra maiúscula**. É assim que o React sabe que `<Saudacao />` é um componente seu, e `<p>` é um elemento do HTML.',
          'A tela inteira é um componente — o `App` — feito de outros componentes, que são feitos de outros. Cada um cuida de um pedaço, e o mesmo pedaço pode aparecer quantas vezes precisar.',
        ],
        exemplo: `function Saudacao() {
  return <p>Bem-vindo à Unidade Ipê!</p>;
}

export default function App() {
  return (
    <main>
      <h1>Mural</h1>
      <Saudacao />
      <Saudacao />
    </main>
  );
}`,
        exemploComo: 'react',
        exemploSaida: `Mural
Bem-vindo à Unidade Ipê!
Bem-vindo à Unidade Ipê!`,
        marcas: ['componente', 'maiúscula', 'App'],
      },
      {
        id: 'jsx',
        titulo: 'JSX: a tela escrita no meio do código',
        resumo: 'Parece HTML, mas é TypeScript: as chaves põem um valor na tela, e a classe se chama className.',
        explicacao: [
          '**JSX** é o jeito de escrever a tela dentro do código. Parece HTML, mas o compilador o transforma em chamadas de função — por isso o arquivo é `.tsx`, e não `.ts`.',
          'Entre **chaves** vai qualquer valor do programa: `{avisos.length}` escreve o número na tela. Texto fora das chaves é escrito como está.',
          'Três diferenças do HTML pegam todo mundo. A classe é `className`, porque `class` é palavra reservada do JavaScript. Toda tag fecha, até `<img />` e `<br />`. E o componente devolve **um** elemento só — dois lado a lado vão dentro de um `<main>`, ou de um `<>...</>`, que agrupa sem pôr nada na página.',
        ],
        exemplo: `const avisos = ['Reunião', 'Lenço', 'Campori'];

export default function App() {
  return (
    <>
      <h1 className="titulo">Mural da Ipê</h1>
      <p>{avisos.length} avisos</p>
      <p>Hoje somos {8 + 4} na unidade.</p>
    </>
  );
}`,
        exemploComo: 'react',
        exemploSaida: `Mural da Ipê
3 avisos
Hoje somos 12 na unidade.`,
        marcas: ['JSX', 'className', 'chaves', '.tsx'],
      },
    ],
  },
  {
    id: 'propriedades',
    topicos: [
      {
        id: 'prop',
        titulo: 'Propriedade: o que o componente recebe de quem o usa',
        resumo: 'Escrita como atributo na tag, chega como parâmetro da função.',
        explicacao: [
          'Um componente que sempre mostra a mesma coisa serve pouco. A **propriedade** — prop, para os íntimos — é o que ele recebe de quem o usa, escrita como um atributo: `<Cartao nome="Ipê" />`.',
          'Dentro do componente, as propriedades chegam juntas num objeto, o primeiro parâmetro da função. Quase sempre já se desmonta ali mesmo: `function Cartao({ nome })`.',
          'Texto vai entre aspas; qualquer outro valor vai entre chaves: `membros={8}`, `ativa={true}`. A propriedade é só de leitura: o componente usa, e não muda. Quem decide o valor é quem escreveu a tag.',
        ],
        exemplo: `function Cartao({ nome, membros }: { nome: string; membros: number }) {
  return <p>{nome}: {membros} membros</p>;
}

export default function App() {
  return (
    <main>
      <Cartao nome="Ipê" membros={8} />
      <Cartao nome="Jatobá" membros={12} />
    </main>
  );
}`,
        exemploComo: 'react',
        exemploSaida: `Ipê: 8 membros
Jatobá: 12 membros`,
        marcas: ['propriedade', 'prop', 'atributo'],
      },
      {
        id: 'tipar-props',
        titulo: 'O tipo das propriedades, numa interface',
        resumo: 'A interface diz o que o componente aceita, e o compilador confere cada uso.',
        explicacao: [
          'É a interface da CC-FE005, agora para um componente. Escreva antes dele `interface Props { nome: string; membros: number }` e receba `({ nome, membros }: Props)`.',
          'A partir daí, todo lugar que usa o componente é conferido. Esquecer o `nome`, passar `membros="oito"` ou escrever `nomi` aparece no painel de Problemas, com a linha, antes de a página rodar.',
          'Propriedade que pode faltar leva o ponto de interrogação, como na CC-FE005: `destaque?: boolean`.',
        ],
        exemplo: `interface Props {
  nome: string;
  lema: string;
}

function Cartao({ nome, lema }: Props) {
  return <p>{nome} — {lema}</p>;
}

export default function App() {
  return <Cartao nome="Ipê" lema="Firmes como a raiz" />;
}`,
        exemploComo: 'react',
        exemploSaida: 'Ipê — Firmes como a raiz',
        marcas: ['interface', 'Props', 'tipo'],
      },
      {
        id: 'quem-decide',
        titulo: 'Quem decide o que o componente mostra',
        resumo: 'O componente que vai buscar os dados sozinho desenha certo uma vez e não serve para mais nada.',
        explicacao: [
          'Um cartão pode importar a unidade Ipê direto do arquivo de dados e mostrar o nome dela. Desenha certo. Mas aí ele só mostra a Ipê, para sempre — e no dia em que precisar de quatro cartões, são quatro componentes quase iguais.',
          'Recebendo pela propriedade, quem decide é quem usa. O mesmo cartão mostra qualquer unidade, e o arquivo de dados fica num lugar só, no componente de cima.',
          'É por isso que o laboratório troca o arquivo de dados ao conferir: o cartão que recebe acompanha; o que foi buscar sozinho, não.',
        ],
        marcas: ['propriedade', 'dados', 'import'],
      },
    ],
  },
  {
    id: 'reaproveitar',
    topicos: [
      {
        id: 'mesmo-componente',
        titulo: 'O mesmo componente, de jeitos diferentes',
        resumo: 'Escrito uma vez, usado várias, cada uso com as suas propriedades.',
        explicacao: [
          'Três botões quase iguais escritos três vezes são três lugares para consertar o mesmo defeito. Um componente `Botao`, usado três vezes, é um lugar só.',
          'O que muda de um para o outro vira propriedade: a cor, o texto, o que fazer no clique. O que é igual fica escrito uma vez, dentro do componente.',
          'Uma propriedade que só aceita algumas palavras se escreve com o tipo de união da CC-FE005: `cor: \'verde\' | \'azul\' | \'vermelho\'`. Escrever `cor="roxo"` aparece no painel de Problemas.',
        ],
        exemplo: `function Selo({ cor, texto }: { cor: 'verde' | 'azul'; texto: string }) {
  return <p className={'selo-' + cor}>{texto} ({cor})</p>;
}

export default function App() {
  return (
    <main>
      <Selo cor="verde" texto="Inscrição aberta" />
      <Selo cor="azul" texto="Campori confirmado" />
    </main>
  );
}`,
        exemploComo: 'react',
        exemploSaida: `Inscrição aberta (verde)
Campori confirmado (azul)`,
        marcas: ['reaproveitar', 'união', 'propriedade'],
      },
      {
        id: 'children',
        titulo: 'children: o que vai dentro da tag',
        resumo: 'O que se escreve entre a abertura e o fechamento chega numa propriedade chamada children.',
        explicacao: [
          'Um botão tem texto dentro: `<Botao>Zerar</Botao>`. O que vai entre a abertura e o fechamento da tag chega ao componente numa propriedade especial, chamada **children** — os filhos.',
          'O tipo dela é `ReactNode`, que aceita texto, número, outros elementos ou nada: `import type { ReactNode } from \'react\'`.',
          'Com `children`, o componente cuida da forma e quem o usa decide o conteúdo — que é como as tags do HTML funcionam.',
        ],
        exemplo: `import type { ReactNode } from 'react';

function Destaque({ children }: { children: ReactNode }) {
  return <p className="destaque">★ {children}</p>;
}

export default function App() {
  return (
    <main>
      <Destaque>Campori em julho</Destaque>
      <Destaque>Ensaio da fanfarra</Destaque>
    </main>
  );
}`,
        exemploComo: 'react',
        exemploSaida: `★ Campori em julho
★ Ensaio da fanfarra`,
        marcas: ['children', 'ReactNode'],
      },
      {
        id: 'funcao-como-prop',
        titulo: 'Uma função como propriedade',
        resumo: 'O botão não sabe o que fazer no clique: ele chama a função que recebeu.',
        explicacao: [
          'O botão de +1 e o de Zerar fazem coisas diferentes, e o Botao não precisa saber de nenhuma delas. Ele recebe uma **função** pela propriedade — `aoClicar` — e a entrega ao `onClick` do `<button>`.',
          'Quem sabe o que fazer é quem usa o Botao: `<Botao aoClicar={() => setPontos(0)}>Zerar</Botao>`. O nome da propriedade começa com "ao" por costume, para se ler como "ao clicar, faça isto".',
          'O tipo de uma função que não recebe nada e não devolve nada é `() => void`.',
        ],
        marcas: ['função', 'onClick', 'aoClicar'],
      },
    ],
  },
  {
    id: 'estado',
    topicos: [
      {
        id: 'variavel-nao-basta',
        titulo: 'Por que uma variável comum não muda a tela',
        resumo: 'A variável muda, e o React nem fica sabendo.',
        explicacao: [
          'Um contador com `let presentes = 0` e um botão que soma 1 parece certo. O console até mostra o número subindo. A tela, não.',
          'O React desenha o componente chamando a função dele. Mudar uma variável não chama a função de novo: ninguém pediu para desenhar outra vez. E, quando alguma outra coisa pedir, a função começa do zero, e o `let presentes = 0` volta a valer zero.',
          'Para a tela acompanhar, o valor precisa ser **estado**.',
        ],
        marcas: ['variável', 'desenhar', 'estado'],
      },
      {
        id: 'useState',
        titulo: 'Estado: o que o componente lembra entre um desenho e outro',
        resumo: 'useState devolve o valor e a função que o troca — e trocar desenha de novo.',
        explicacao: [
          'O **estado** é o que o componente lembra entre um desenho e outro. `const [presentes, setPresentes] = useState(0)` cria um estado que começa em 0 e devolve duas coisas: o valor de agora e a função que o troca.',
          'Chamar `setPresentes(presentes + 1)` faz duas coisas: guarda o valor novo e pede ao React para desenhar o componente de novo. É por isso que a tela acompanha.',
          'Nunca se muda o estado direto: `presentes = presentes + 1` não pede desenho nenhum. Toda mudança passa pela função. Funções que começam com `use`, como `useState`, se chamam **ganchos** e só podem ser chamadas no topo do componente.',
        ],
        exemplo: `import { useState } from 'react';

export default function App() {
  const [presentes, setPresentes] = useState(3);
  return (
    <main>
      <p>Presentes: {presentes}</p>
      <button onClick={() => setPresentes(presentes + 1)}>Chegou mais um</button>
    </main>
  );
}`,
        exemploComo: 'react',
        exemploSaida: `Presentes: 3
Chegou mais um`,
        marcas: ['estado', 'useState', 'gancho'],
      },
      {
        id: 'condicional',
        titulo: 'Renderização condicional: o que aparece conforme o estado',
        resumo: 'Com && o pedaço só existe quando a condição vale; com ?: escolhe-se entre dois.',
        explicacao: [
          '**Renderização condicional** é a tela que muda de forma conforme os dados. `{presentes >= 5 && <p>Temos quórum!</p>}` só põe o parágrafo na página quando a conta dá verdadeiro.',
          'Para escolher entre duas coisas, o ternário: `{presentes === 1 ? \'membro\' : \'membros\'}`.',
          'Note a diferença para a CC-FE004: lá se escondia o elemento com uma classe, e ele continuava na página. Aqui, quando a condição é falsa, o parágrafo **não existe** — não está escondido, não está lá.',
        ],
        exemplo: `function Chamada({ presentes, quorum }: { presentes: number; quorum: number }) {
  return (
    <section>
      <p>{presentes} {presentes === 1 ? 'presente' : 'presentes'}</p>
      {presentes >= quorum && <p>Temos quórum!</p>}
      {presentes < quorum && <p>Faltam {quorum - presentes}.</p>}
    </section>
  );
}

export default function App() {
  return <Chamada presentes={4} quorum={5} />;
}`,
        exemploComo: 'react',
        exemploSaida: `4 presentes
Faltam 1.`,
        marcas: ['renderização condicional', '&&', 'ternário'],
      },
    ],
  },
  {
    id: 'listas',
    topicos: [
      {
        id: 'map',
        titulo: 'Uma lista é um map',
        resumo: 'Para cada item do arranjo, um elemento na tela.',
        explicacao: [
          'O `map` da CC-FE003 transforma cada item de um arranjo em outra coisa. No React, transforma cada item num elemento: `{tarefas.map(t => <li>{t.texto}</li>)}`.',
          'A lista na tela sai do arranjo, e não de itens escritos à mão. Uma tarefa a mais no arranjo é um item a mais na tela, sem mexer em nada.',
          'E como a tela sai dos dados, tirar uma tarefa é tirar do arranjo: `setTarefas(tarefas.filter(t => t.id !== id))` — um arranjo novo, sem ela.',
        ],
        exemplo: `const tarefas = [
  { id: 1, texto: 'Montar a barraca' },
  { id: 2, texto: 'Recolher lenha' },
];

export default function App() {
  return (
    <ul>
      {tarefas.map(t => <li key={t.id}>{t.texto}</li>)}
    </ul>
  );
}`,
        exemploComo: 'react',
        exemploSaida: `Montar a barraca
Recolher lenha`,
        marcas: ['map', 'lista', 'filter'],
      },
      {
        id: 'key',
        titulo: 'A chave: como o React reconhece cada item',
        resumo: 'Cada item de uma lista leva uma key, única entre os irmãos e que não muda.',
        explicacao: [
          'Quando a lista muda, o React precisa saber qual item é qual — o que saiu, o que entrou, o que ficou. É para isso a **chave**: `<li key={t.id}>`.',
          'A chave precisa ser **única** entre os irmãos e **ficar a mesma** enquanto o item existir. O id que o item já tem é a chave certa.',
          'Sem chave, a lista aparece igual — e o console avisa: Each child in a list should have a unique "key" prop. O aviso é a primeira pista de que algo vai dar errado quando a lista mudar.',
        ],
        marcas: ['key', 'chave', 'id'],
      },
      {
        id: 'indice-nao',
        titulo: 'Por que a posição não serve de chave',
        resumo: 'A posição muda quando alguém sai da lista; o id, não.',
        explicacao: [
          'O `map` entrega também a posição: `tarefas.map((t, i) => ...)`. Usar `key={i}` cala o aviso. E erra, só que mais tarde.',
          'Cada item pode guardar estado próprio — a marca de feito, o que está escrito num campo. Esse estado fica preso à **chave**. Se a chave é a posição e a primeira tarefa sai, a que estava em terceiro passa a ser a segunda, e herda o estado que era da segunda.',
          'O resultado é a marca de feito pulando para a tarefa vizinha, sem erro nenhum. Com o id como chave, cada marca fica com a tarefa dela.',
        ],
        marcas: ['índice', 'posição', 'key'],
      },
    ],
  },
  {
    id: 'formulario',
    topicos: [
      {
        id: 'controlado',
        titulo: 'Formulário controlado: o campo mostra o que o estado guarda',
        resumo: 'value vem do estado, onChange guarda no estado — e o campo deixa de ter vida própria.',
        explicacao: [
          'Um `<input>` sozinho guarda o que se digita por conta própria, e o React não sabe o que está lá. Num **formulário controlado**, quem guarda é o estado: `value={nome}` diz o que o campo mostra, e `onChange={e => setNome(e.target.value)}` guarda cada tecla.',
          'Com isso, o que está escrito é sempre um valor do programa. Dá para mostrar uma prévia enquanto se digita, passar tudo para maiúsculas e limpar o campo depois de enviar só com `setNome(\'\')`.',
          'Os dois lados vão juntos. `value` sem `onChange` trava o campo — o React avisa no console —, e trocar de um campo sem `value` para um com `value` também é avisado.',
        ],
        exemplo: `import { useState } from 'react';

export default function App() {
  const [nome, setNome] = useState('ana');
  return (
    <main>
      <input value={nome} onChange={e => setNome(e.target.value.toUpperCase())} />
      <p>Inscrevendo: {nome.toUpperCase()}</p>
    </main>
  );
}`,
        exemploComo: 'react',
        exemploSaida: 'Inscrevendo: ANA',
        marcas: ['controlado', 'value', 'onChange'],
      },
      {
        id: 'enviar',
        titulo: 'Enviar sem recarregar',
        resumo: 'No onSubmit, o primeiro passo é e.preventDefault().',
        explicacao: [
          'É a mesma armadilha da CC-FE004: enviar um formulário, por padrão, recarrega a página — e no React isso apaga o estado inteiro, com tudo o que foi digitado.',
          'O `onSubmit` vai no `<form>`, e não no botão: assim Enter dentro de um campo também envia. A primeira linha dele é `e.preventDefault()`.',
          'Para acrescentar a inscrição à lista, cria-se um arranjo novo com ela no fim: `setInscritos([...inscritos, nova])`. Mudar o arranjo de agora com `push` não pede desenho nenhum.',
        ],
        marcas: ['onSubmit', 'preventDefault', 'formulário'],
      },
      {
        id: 'validar',
        titulo: 'Recusar o que está faltando',
        resumo: 'Conferir antes de guardar, e dizer na tela o que faltou.',
        explicacao: [
          'Antes de guardar, confira: `if (nome.trim() === \'\')`. O `trim` tira os espaços, para um nome feito só de espaços também ser recusado.',
          'Recusar em silêncio deixa a pessoa clicando sem saber por quê. Guarde o motivo num estado e mostre com renderização condicional: `{erro && <p className="erro">{erro}</p>}`.',
          'E apague o erro quando der certo, senão ele continua na tela depois de o problema ter sido resolvido.',
        ],
        marcas: ['validar', 'trim', 'erro'],
      },
    ],
  },
  {
    id: 'efeito',
    topicos: [
      {
        id: 'efeito-colateral',
        titulo: 'Efeito colateral: o que não é desenhar',
        resumo: 'Mudar o título da aba, salvar, pedir dados à rede — vai num useEffect, que roda depois de desenhar.',
        explicacao: [
          'Desenhar é devolver a tela. Tudo o que mexe em algo **fora** do componente é um **efeito colateral**: mudar o título da aba do navegador, salvar a chamada, buscar dados na internet.',
          'Efeito não vai no meio do componente, que o React pode chamar quantas vezes quiser. Vai num `useEffect`, que roda **depois** de a tela ser desenhada: `useEffect(() => { document.title = \'Chamada\'; })`.',
          'Mexer no `document` é justamente o que a CC-FE004 fazia o tempo todo. No React ele aparece pouco, e quando aparece é num efeito.',
        ],
        marcas: ['efeito colateral', 'useEffect', 'document.title'],
      },
      {
        id: 'dependencias',
        titulo: 'Do que o efeito depende',
        resumo: 'O segundo argumento diz quando rodar de novo: [presentes] roda quando presentes muda; [] roda só ao montar.',
        explicacao: [
          'Sem o segundo argumento, o efeito roda depois de **todo** desenho. Numa tela com um campo de busca, isso é a cada letra digitada — e salvar a chamada a cada letra é salvar à toa.',
          'A **lista de dependências** diz quando o efeito precisa rodar de novo: `useEffect(() => { ... }, [presentes])` roda na primeira vez e depois só quando `presentes` mudar.',
          'Com a lista vazia, `[]`, ele roda uma vez só, quando o componente aparece — que é o caso de buscar dados que não dependem de nada.',
        ],
        marcas: ['dependências', '[]', 'useEffect'],
      },
      {
        id: 'duas-vezes',
        titulo: 'Por que o efeito roda duas vezes no começo',
        resumo: 'No modo de desenvolvimento, o StrictMode monta tudo duas vezes, de propósito.',
        explicacao: [
          'O `main.tsx` do Vite embrulha o App num `<StrictMode>`. No modo de desenvolvimento ele monta cada componente, desmonta e monta de novo — e o efeito da primeira vez aparece em dobro no console.',
          'Não é defeito: é um teste. Um efeito que deixa sujeira quando o componente sai — um relógio que continua contando, um pedido que chega depois — aparece logo, em vez de aparecer semanas depois.',
          'No site publicado, o StrictMode não monta nada duas vezes.',
        ],
        marcas: ['StrictMode', 'desenvolvimento', 'duas vezes'],
      },
    ],
  },
  {
    id: 'navegacao',
    topicos: [
      {
        id: 'uma-pagina',
        titulo: 'Várias telas numa página só',
        resumo: 'A aplicação troca de tela sem recarregar: quem decide o que mostrar é o endereço.',
        explicacao: [
          'Um site de várias páginas pede ao servidor uma página nova a cada clique. Uma aplicação de React é uma página só, que troca de **tela** sem recarregar — é mais rápido, e o estado não se perde.',
          'Quem diz qual tela mostrar é o **endereço**. É o pedaço depois do `#`: `#/unidade/ipe` é a tela da Ipê. O endereço pode ser guardado, mandado para alguém e aberto direto na tela certa.',
          'Isso é o trabalho do **roteador**, e o mais usado é o React Router. O laboratório usa o `HashRouter` dele, o mesmo que a própria Trilha.Web() usa: o GitHub Pages não sabe responder a `/faixa`, e com o `#` ele nem precisa — tudo depois do `#` fica com o navegador.',
        ],
        marcas: ['rota', 'endereço', 'HashRouter', 'roteador'],
      },
      {
        id: 'route-e-link',
        titulo: 'Routes, Route e Link',
        resumo: 'Cada Route liga um caminho a um componente; o Link troca de tela sem recarregar.',
        explicacao: [
          'Dentro de `<Routes>`, cada `<Route path="/" element={<Lista />} />` diz: neste endereço, esta tela. O roteador mostra a primeira que combina.',
          'Para ir de uma tela a outra, `<Link to="/unidade/ipe">Ipê</Link>`. Na página ele vira um `<a>`, mas o clique troca a tela sem pedir nada ao servidor.',
          'A rota `path="*"` combina com qualquer endereço. Posta por último, ela pega o que nenhuma outra pegou — é a tela de "Página não encontrada".',
        ],
        exemplo: `import { Link, Route, Routes } from 'react-router-dom';

export default function App() {
  return (
    <main>
      <h1>Clube Pioneiros</h1>
      <Routes>
        <Route path="/" element={<p>Escolha uma unidade.</p>} />
        <Route path="/sobre" element={<p>Fundado em 1998.</p>} />
      </Routes>
      <Link to="/sobre">Sobre o clube</Link>
    </main>
  );
}`,
        exemploComo: 'react',
        exemploSaida: `Clube Pioneiros
Escolha uma unidade.`,
        marcas: ['Routes', 'Route', 'Link'],
      },
      {
        id: 'parametro',
        titulo: 'O pedaço do endereço que muda',
        resumo: 'path="/unidade/:id" é uma rota para todas as unidades, e useParams lê qual.',
        explicacao: [
          'Escrever uma rota por unidade seria escrever o mesmo componente quatro vezes. Com dois-pontos, o pedaço vira um **parâmetro**: `path="/unidade/:id"` combina com `/unidade/ipe`, `/unidade/jatoba` e qualquer outro.',
          'Dentro da tela, `const { id } = useParams()` lê o valor. Com ele se acha a unidade: `UNIDADES.find(u => u.id === id)`.',
          'O `find` pode não achar ninguém — alguém digitou um endereço que não existe —, e o TypeScript já avisa que o resultado pode ser `undefined`. A tela responde "Unidade não encontrada", em vez de quebrar.',
        ],
        marcas: ['useParams', 'parâmetro', ':id'],
      },
    ],
  },
  {
    id: 'api',
    topicos: [
      {
        id: 'tres-estados',
        titulo: 'Carregando, sucesso e erro',
        resumo: 'Todo pedido à rede passa por três estados, e a tela precisa mostrar os três.',
        explicacao: [
          'A resposta da rede não chega na hora, e às vezes não chega. Por isso uma tela que busca dados tem **três estados**: **carregando**, enquanto espera; **sucesso**, quando os dados chegam; e **erro**, quando algo falhou.',
          'Cada um vira um estado do componente e um pedaço condicional da tela: `{carregando && <p>Carregando…</p>}`. A tela vazia, sem dizer nada, é o pior dos quatro — a pessoa não sabe se é para esperar ou desistir.',
          'É a BrasilAPI da CC-FE004, agora num componente: no laboratório o painel Rede deixa desligar a internet para ver o estado de erro acontecer.',
        ],
        exemplo: `import { useState } from 'react';

export default function App() {
  const [carregando] = useState(true);
  const [erro] = useState('');
  return (
    <main>
      <h1>Feriados</h1>
      {carregando && <p>Carregando…</p>}
      {erro && <p>{erro}</p>}
    </main>
  );
}`,
        exemploComo: 'react',
        exemploSaida: `Feriados
Carregando…`,
        marcas: ['carregando', 'sucesso', 'erro'],
      },
      {
        id: 'buscar-no-efeito',
        titulo: 'Buscar dados é um efeito',
        resumo: 'O fetch vai num useEffect com [], para pedir uma vez quando a tela aparece.',
        explicacao: [
          'Pedir dados à rede é um efeito colateral, e vai num `useEffect`. Com a lista de dependências vazia, `[]`, ele pede uma vez, quando a tela aparece.',
          'Sem a lista, o efeito roda depois de cada desenho — e guardar a resposta no estado desenha de novo, que pede de novo, que desenha de novo. É um laço que não para, e o painel Rede mostra os pedidos se acumulando.',
          'Quando a resposta chega, `setFeriados(dados)` e `setCarregando(false)` trocam a tela.',
        ],
        exemplo: `import { useEffect, useState } from 'react';

export default function App() {
  const [feriados, setFeriados] = useState<{ name: string }[]>([]);
  useEffect(() => {
    fetch('https://brasilapi.com.br/api/feriados/v1/2026')
      .then(r => r.json())
      .then(dados => setFeriados(dados.slice(0, 2)));
  }, []);
  return (
    <ul>
      {feriados.map(f => <li key={f.name}>{f.name}</li>)}
    </ul>
  );
}`,
        exemploComo: 'react',
        exemploSaida: `Confraternização mundial
Carnaval`,
        marcas: ['fetch', 'useEffect', '[]'],
      },
      {
        id: 'quando-falha',
        titulo: 'Os dois jeitos de falhar',
        resumo: 'Sem rede, o fetch rejeita; com o pedido recusado, ele chega com resposta.ok falso.',
        explicacao: [
          'Sem internet, o `fetch` **rejeita**, e um `.catch` trata: sem ele, o console diz Uncaught (in promise) e a tela fica em "Carregando…" para sempre.',
          'O segundo jeito engana mais. Quando o servidor responde que não pode — o ano 1850, que a BrasilAPI não conhece, volta com status 404 —, o `fetch` **não** rejeita: a resposta chegou. É preciso conferir `resposta.ok` antes do `.json()`, e lançar um erro quando ela for falsa, para cair no mesmo `.catch`.',
          'E a tela de erro oferece a saída: um botão Tentar de novo, que chama a mesma função que buscou da primeira vez.',
        ],
        marcas: ['catch', 'resposta.ok', '404'],
      },
    ],
  },
];

const cap = (id: string) => CAPITULOS.find(c => c.id === id)!.topicos;

export const MODULOS_DE_REACT: ModuloDeVereda[] = [
  {
    id: 'm1', titulo: 'Descrever a tela',
    resumo: 'O jeito declarativo, o componente e o JSX.',
    licoes: [
      { id: 'm1-teoria', tipo: 'teoria', questoes: QUESTOES_DE_REACT['m1-teoria'], perguntas: 4,
        titulo: 'Mexer ou descrever', resumo: 'A diferença para a CC-FE004, o componente e o JSX.', topicos: cap('declarar') },
      { id: 'm1-lab', tipo: 'react', licao: 'declarar',
        titulo: 'O mural, descrito', resumo: 'Trocar a lista montada com o document por uma lista descrita no JSX.',
        verificacoes: ['lista-no-jsx', 'total-no-jsx', 'classname'] },
    ],
  },
  {
    id: 'm2', titulo: 'Propriedades',
    resumo: 'O que o componente recebe de quem o usa, com tipo.',
    licoes: [
      { id: 'm2-teoria', tipo: 'teoria', questoes: QUESTOES_DE_REACT['m2-teoria'], perguntas: 4,
        titulo: 'O que o componente recebe', resumo: 'A propriedade, o tipo dela, e quem decide o que aparece.', topicos: cap('propriedades') },
      { id: 'm2-lab', tipo: 'react', licao: 'propriedades',
        titulo: 'O cartão da unidade', resumo: 'Um cartão que recebe o nome, o lema e os membros, e desenha qualquer unidade.',
        verificacoes: ['tipadas', 'desenha', 'um-membro'] },
    ],
  },
  {
    id: 'm3', titulo: 'Reaproveitar',
    resumo: 'O mesmo componente com propriedades diferentes, children e funções.',
    licoes: [
      { id: 'm3-teoria', tipo: 'teoria', questoes: QUESTOES_DE_REACT['m3-teoria'], perguntas: 4,
        titulo: 'Um componente, vários usos', resumo: 'O que muda vira propriedade; o que vai dentro é children.', topicos: cap('reaproveitar') },
      { id: 'm3-lab', tipo: 'react', licao: 'reaproveitar',
        titulo: 'Os botões do placar', resumo: 'Trocar três botões repetidos por um Botao usado três vezes.',
        verificacoes: ['componente', 'tres-usos', 'cores', 'contas'] },
    ],
  },
  {
    id: 'm4', titulo: 'Estado',
    resumo: 'O que o componente lembra, e a tela que muda conforme ele.',
    licoes: [
      { id: 'm4-teoria', tipo: 'teoria', questoes: QUESTOES_DE_REACT['m4-teoria'], perguntas: 4,
        titulo: 'O que o componente lembra', resumo: 'A variável que não basta, o useState e a renderização condicional.', topicos: cap('estado') },
      { id: 'm4-lab', tipo: 'react', licao: 'estado',
        titulo: 'A chamada que conta', resumo: 'O número que muda na tela, e o aviso que só existe com quórum.',
        verificacoes: ['muda', 'zero', 'quorum'] },
    ],
  },
  {
    id: 'm5', titulo: 'Listas e chaves',
    resumo: 'Uma lista a partir de um arranjo, com uma chave que não muda.',
    licoes: [
      { id: 'm5-teoria', tipo: 'teoria', questoes: QUESTOES_DE_REACT['m5-teoria'], perguntas: 4,
        titulo: 'Para cada item, um elemento', resumo: 'O map, a key, e por que a posição não serve.', topicos: cap('listas') },
      { id: 'm5-lab', tipo: 'react', licao: 'listas',
        titulo: 'As tarefas do acampamento', resumo: 'Desenhar as tarefas, remover uma, e ver a marca de feito ficar no lugar certo.',
        verificacoes: ['cada', 'chave', 'remove', 'marca'] },
    ],
  },
  {
    id: 'm6', titulo: 'Formulário controlado',
    resumo: 'O campo que mostra o estado, o envio sem recarregar e a validação.',
    licoes: [
      { id: 'm6-teoria', tipo: 'teoria', questoes: QUESTOES_DE_REACT['m6-teoria'], perguntas: 4,
        titulo: 'O estado manda no campo', resumo: 'value e onChange, o preventDefault e recusar o que falta.', topicos: cap('formulario') },
      { id: 'm6-lab', tipo: 'react', licao: 'formulario',
        titulo: 'A inscrição no campori', resumo: 'Campos controlados, a lista de inscritos, e o nome que não pode faltar.',
        verificacoes: ['controlado', 'envia', 'limpa', 'vazio'] },
    ],
  },
  {
    id: 'm7', titulo: 'Efeitos',
    resumo: 'O que roda depois de desenhar, e só quando precisa.',
    licoes: [
      { id: 'm7-teoria', tipo: 'teoria', questoes: QUESTOES_DE_REACT['m7-teoria'], perguntas: 4,
        titulo: 'Depois de desenhar', resumo: 'O efeito colateral, a lista de dependências e o StrictMode.', topicos: cap('efeito') },
      { id: 'm7-lab', tipo: 'react', licao: 'efeito',
        titulo: 'A chamada que se salva', resumo: 'O título da aba e o salvamento num efeito, que não roda a cada letra da busca.',
        verificacoes: ['titulo', 'salva', 'so-quando-muda'] },
    ],
  },
  {
    id: 'm8', titulo: 'Navegação',
    resumo: 'Mais de uma tela, trocada pelo endereço.',
    licoes: [
      { id: 'm8-teoria', tipo: 'teoria', questoes: QUESTOES_DE_REACT['m8-teoria'], perguntas: 4,
        titulo: 'Telas e endereços', resumo: 'A aplicação de uma página só, Routes, Link e useParams.', topicos: cap('navegacao') },
      { id: 'm8-lab', tipo: 'react', licao: 'navegacao',
        titulo: 'As telas das unidades', resumo: 'A lista, a tela de cada unidade, a volta e o endereço que não existe.',
        verificacoes: ['lista', 'detalhe', 'voltar', 'perdido'] },
    ],
  },
  {
    id: 'm9', titulo: 'Dados da rede',
    resumo: 'Consumir uma API mostrando carregando, sucesso e erro.',
    licoes: [
      { id: 'm9-teoria', tipo: 'teoria', questoes: QUESTOES_DE_REACT['m9-teoria'], perguntas: 4,
        titulo: 'Os três estados', resumo: 'Carregando, sucesso e erro, o fetch num efeito e as duas falhas.', topicos: cap('api') },
      { id: 'm9-lab', tipo: 'react', licao: 'api',
        titulo: 'Os feriados do ano', resumo: 'A BrasilAPI num componente, com os três estados e o Tentar de novo.',
        verificacoes: ['carregando', 'sucesso', 'erro', 'de-novo'] },
    ],
  },
];
