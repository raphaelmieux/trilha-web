/*
 * A vereda CC-FE007 Projeto de Interface.
 *
 * ── Ela não ensina ferramenta nova ───────────────────────────────────────
 * O React é o da CC-FE006, o TypeScript é o da CC-FE005, o CSS é o da
 * CC-FE002, o Git e o terminal são os da CC003. O que ela ensina é o que
 * nenhuma delas podia ensinar sozinha: uma aplicação que alguém usa, feita do
 * começo ao fim — proposta antes, construída em partes, publicada num link,
 * versionada ao longo de dias, documentada e mostrada num celular de verdade.
 * É a CC006 do lado da tela.
 *
 * ── Uma aplicação só ─────────────────────────────────────────────────────
 * A agenda do clube: os eventos, a tela de cada evento e os feriados do ano,
 * da BrasilAPI. Cada laboratório parte do que o anterior deixou — as versões
 * moram em `agendaDoClube.ts` —, o laboratório de publicação põe no ar o
 * repositório das lições de React, e o terminal guarda esse mesmo
 * repositório, com as datas em que cada pedaço foi escrito.
 *
 * ── A ordem ──────────────────────────────────────────────────────────────
 * É a do documento, e aqui ela é a ordem do trabalho: a proposta antes de
 * qualquer linha, as peças do requisito 3 uma por módulo, a publicação, o
 * histórico, o README e o registro das decisões, e por fim a apresentação.
 *
 * ── Os exemplos ──────────────────────────────────────────────────────────
 * Os de React são um `App.tsx` inteiro, conferidos por
 * `exemplosDeReact.test.ts` como os da CC-FE006. O de CSS desenha a mesma
 * página em duas larguras, que é o assunto do módulo. Os de README, de
 * registro de decisões e de Git são texto, porque o que se escreve ali é
 * texto.
 */

import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DO_PROJETO_DE_INTERFACE as Q } from './questoesDoProjetoDeInterface';

const CAPITULOS: { id: string; topicos: TopicoDeVereda[] }[] = [
  {
    id: 'proposta',
    topicos: [
      {
        id: 'objetivo-e-publico',
        titulo: 'O objetivo e quem vai usar',
        resumo: 'Antes de qualquer tela, o que a aplicação resolve e para quem.',
        explicacao: [
          'Toda aplicação começa com um incômodo. No clube, é o aviso do acampamento que chega pelo grupo de mensagens e some no meio de cinquenta fotos. O **objetivo** diz o que acontece hoje, por que atrapalha, e o que muda quando a aplicação existir.',
          'O **público-alvo** diz quem vai abrir a tela. "Todo mundo" não serve: os desbravadores de dez anos, as famílias que olham pelo celular no ônibus e a secretaria do clube pedem telas diferentes. Escolher o público é o que deixa decidir o tamanho da letra, as palavras e o que vem primeiro.',
          'Os dois juntos são a régua de todo o resto. Quando surgir a vontade de pôr mais uma tela, a pergunta é: isto serve ao objetivo, para este público?',
        ],
        atencao: 'Objetivo não é a lista de telas. "Ter uma tela de eventos" é parte da solução; o objetivo é o problema que ela resolve.',
        marcas: ['objetivo', 'público-alvo'],
      },
      {
        id: 'mapa-de-telas',
        titulo: 'O mapa de telas',
        resumo: 'Quais telas existem, e para onde cada uma leva.',
        explicacao: [
          'O **mapa de telas** é um desenho com uma caixa por tela e setas entre elas. A agenda tem três: os eventos, a tela de um evento e os feriados. Da lista de eventos se vai a cada evento e aos feriados; de cada uma se volta à lista.',
          'A primeira tela é a **de entrada**: é a que abre quando alguém clica no link. Toda outra tela precisa ter um caminho a partir dela — uma tela que nenhuma seta alcança é uma tela que ninguém vai achar.',
          'O mapa vira código quase sem tradução. Cada caixa é uma rota, e cada seta é um link ou um botão. Quem desenha o mapa antes descobre no papel a tela sem volta, que no código só apareceria com alguém perdido nela.',
        ],
        marcas: ['mapa de telas', 'tela de entrada', 'navegação'],
      },
      {
        id: 'rascunho',
        titulo: 'O rascunho de cada tela',
        resumo: 'Caixas no papel, de cima para baixo, antes de qualquer cor.',
        explicacao: [
          'O **rascunho** — os programadores chamam de *wireframe* — mostra o que vai em cada tela, em caixas cinzas: o cabeçalho, o menu, o título, a lista, o botão. Sem cor, sem letra bonita, sem foto. É de propósito: com cor, a conversa vira sobre a cor.',
          'Cada seta do mapa precisa aparecer no rascunho como alguma coisa em que se toca: um item de menu, um cartão da lista, um botão. Uma seta sem o que tocar promete um caminho que a tela não tem.',
          'E a tela que busca dados de fora tem dois estados que ninguém desenha: esperando e falhando. Desenhar o aviso de "carregando" e a mensagem de erro no rascunho é o que garante que eles existam no código.',
        ],
        atencao: 'Rascunhe a tela do celular primeiro. A do computador tem espaço sobrando; a do celular é que obriga a escolher o que vem primeiro.',
        marcas: ['rascunho', 'wireframe', 'carregando', 'erro'],
      },
      {
        id: 'aprovacao',
        titulo: 'Aprovada antes de começar',
        resumo: 'O requisito proíbe começar antes da aprovação, e há um motivo.',
        explicacao: [
          'O requisito 2 diz que a execução **não pode ser iniciada antes da aprovação**. Não é burocracia: mudar uma caixa no papel custa um minuto; mudar uma tela já programada custa a tela, os componentes que ela usa e as rotas que apontam para ela.',
          'O examinador pode devolver a proposta pedindo mais uma tela, ou tirando uma. Quem já começou a programar joga código fora — ou, pior, defende o que fez em vez de ouvir.',
        ],
        marcas: ['aprovação', 'proposta'],
      },
    ],
  },
  {
    id: 'telas',
    topicos: [
      {
        id: 'tela-e-rota',
        titulo: 'Cada tela, uma rota',
        resumo: 'O mapa de telas vira as Routes, e as setas viram Link.',
        explicacao: [
          'Na CC-FE006 você viu que uma aplicação React é uma página só, que troca o que mostra conforme o endereço. Cada caixa do mapa vira uma `Route`, com o caminho dela: `/` para os eventos, `/feriados` para os feriados. O roteador fica em volta de tudo, no `main.tsx`.',
          'Cada seta vira um `Link` ou um `NavLink`. O `NavLink` é o do menu: ele sabe se a tela dele é a de agora e ganha a classe `active`, que o CSS pinta — é por ela que se sabe onde se está.',
        ],
        exemplo: `import { Routes, Route, NavLink } from 'react-router-dom';

function Eventos() { return <h2>Próximos eventos</h2>; }
function Feriados() { return <h2>Feriados do ano</h2>; }

export default function App() {
  return (
    <>
      <p>
        <NavLink to="/">Eventos</NavLink> · <NavLink to="/feriados">Feriados</NavLink>
      </p>
      <Routes>
        <Route path="/" element={<Eventos />} />
        <Route path="/feriados" element={<Feriados />} />
      </Routes>
    </>
  );
}`,
        exemploComo: 'react',
        exemploSaida: `Eventos · Feriados
Próximos eventos`,
        marcas: ['Routes', 'Route', 'NavLink'],
      },
      {
        id: 'parametro',
        titulo: 'Uma tela para muitos itens',
        resumo: 'A tela do evento é uma só, e o endereço diz qual evento mostrar.',
        explicacao: [
          'A agenda não tem uma tela para o acampamento e outra para o campori. Tem **uma** tela de evento, com o caminho `/evento/:id`, e o `:id` é um **parâmetro**: o pedaço do endereço que muda.',
          'Dentro da tela, `useParams()` devolve o que veio no endereço, e a tela procura o evento com aquele id. É por isso que o link de um evento pode ser mandado no grupo: ele abre direto na tela certa.',
          'E se o id não existir? A tela precisa dizer isso, em vez de quebrar. Um endereço digitado errado, ou um evento que já passou e saiu da lista, chegam ali do mesmo jeito.',
        ],
        atencao: 'O parâmetro chega como texto, sempre. Um id numérico precisa de Number() antes de comparar com o número da lista.',
        marcas: ['useParams', ':id', 'parâmetro'],
      },
      {
        id: 'hash',
        titulo: 'Por que a agenda usa o HashRouter',
        resumo: 'Num servidor que só entrega arquivos, o endereço depois do # não pede nada a ele.',
        explicacao: [
          'O `BrowserRouter` faz endereços limpos, como `/evento/campori`. Ao recarregar, o navegador pede ao servidor um arquivo com esse caminho. Num servidor que só entrega arquivos — o GitHub Pages é assim —, esse arquivo não existe, e a resposta é 404.',
          'O `HashRouter` põe a rota depois do `#`: `/#/evento/campori`. O que vem depois do `#` nunca vai ao servidor, então recarregar pede sempre o `index.html`, e o React lê o resto. É o que a própria Trilha.Web() usa, pelo mesmo motivo.',
        ],
        marcas: ['HashRouter', 'BrowserRouter', '#'],
      },
    ],
  },
  {
    id: 'componentes',
    topicos: [
      {
        id: 'quando-separar',
        titulo: 'Quando separar um componente',
        resumo: 'O que aparece em mais de um lugar vira componente; o que aparece uma vez pode ficar.',
        explicacao: [
          'O requisito 3.6 pede **três componentes reutilizados**: cada um usado em mais de um lugar. Na agenda, o cartão de evento aparece na lista de eventos e nos "outros eventos" da tela de um evento; a seção com título aparece nas três telas; a mensagem de erro aparece na tela dos feriados e na do evento que não existe.',
          'Separar um componente que só aparece uma vez não é proibido, mas não é reúso. E copiar o mesmo cartão em duas telas é o contrário: no dia em que o cartão mudar, alguém muda uma das cópias e esquece a outra.',
          'Cada componente mora no seu arquivo, com o nome dele: `CartaoDeEvento.tsx`. É assim que se acha a peça depois.',
        ],
        marcas: ['componente', 'reúso', 'um arquivo por componente'],
      },
      {
        id: 'props-tipadas',
        titulo: 'O que o componente recebe, com tipo',
        resumo: 'A interface das props é o contrato: quem usa o componente sabe o que passar.',
        explicacao: [
          'O requisito 3.4 pede **código tipado**. Num componente, o lugar onde isso mais pesa são as propriedades: uma `interface Props` diz o que o componente espera, e o compilador recusa quem esquecer de passar ou passar errado.',
          'O `any` desliga isso. Com `evento: any`, o compilador aceita `evento.lugar` mesmo que o campo se chame `local` — e o cartão sai sem o local, sem erro nenhum. É o engano que a lição de publicação mostra: o build recusa o que o `any` teria escondido.',
        ],
        exemplo: `interface Props {
  titulo: string;
  local: string;
}

function Cartao({ titulo, local }: Props) {
  return <p>{titulo} — {local}</p>;
}

export default function App() {
  return (
    <>
      <Cartao titulo="Campori" local="Parque da Cidade" />
      <Cartao titulo="Feira" local="Salão da igreja" />
    </>
  );
}`,
        exemploComo: 'react',
        exemploSaida: `Campori — Parque da Cidade
Feira — Salão da igreja`,
        marcas: ['interface', 'Props', 'any'],
      },
      {
        id: 'children',
        titulo: 'O que vai dentro: children',
        resumo: 'A seção com título tem um miolo que muda em cada tela.',
        explicacao: [
          'A `Secao` da agenda desenha o título e uma moldura, e o que vai dentro é diferente em cada tela: a lista de eventos, os detalhes de um evento, os feriados. O que se escreve entre `<Secao>` e `</Secao>` chega como `children`, e o tipo dele é `ReactNode`.',
          'É assim que um componente serve a telas diferentes sem saber o que cada uma tem.',
        ],
        marcas: ['children', 'ReactNode'],
      },
    ],
  },
  {
    id: 'api',
    topicos: [
      {
        id: 'publica-ou-propria',
        titulo: 'API pública ou própria',
        resumo: 'A agenda consome uma API pública, e o requisito aceita as duas.',
        explicacao: [
          'O requisito 3.2 pede o consumo de uma **API própria ou pública**. Própria é a que você mesmo escreveu, num servidor seu — é assunto das veredas de Back-end. Pública é a que alguém mantém para qualquer um usar, como a BrasilAPI, que responde os feriados de um ano.',
          'API pública sem chave é a mais simples para começar. A que pede chave pede cuidado: a chave escrita no código do navegador vai junto com a página para qualquer visitante, e quem a copiar usa a sua conta.',
        ],
        atencao: 'Chave de API não vai no código de uma aplicação que roda no navegador. Tudo o que está ali chega a quem abrir a página.',
        marcas: ['API pública', 'API própria', 'chave'],
      },
      {
        id: 'erro-visivel',
        titulo: 'O erro que o usuário vê',
        resumo: 'O console é do programador; quem usa a agenda precisa ver na tela.',
        explicacao: [
          'O requisito 3.5 pede **tratamento de erro visível ao usuário**. Um `console.log` no `catch` trata o erro para quem está com as ferramentas do navegador abertas — e mais ninguém. A família no celular vê "Carregando…" para sempre.',
          'O erro visível diz o que aconteceu em palavras de gente e o que fazer: "Não deu para buscar os feriados. Confira a internet e tente de novo." E oferece o botão de tentar de novo, que chama a mesma função da primeira busca.',
          'O `role="alert"` faz o leitor de tela anunciar a mensagem quando ela aparece. Sem ele, quem não enxerga a tela também fica esperando para sempre.',
        ],
        exemplo: `import { useEffect, useState } from 'react';

export default function App() {
  const [erro, setErro] = useState('');
  useEffect(() => {
    fetch('https://brasilapi.com.br/api/feriados/v1/1850')
      .then(r => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .catch(() => setErro('Não deu para buscar os feriados.'));
  }, []);
  return erro ? <p role="alert">{erro}</p> : <p>Carregando…</p>;
}`,
        exemploComo: 'react',
        exemploSaida: 'Não deu para buscar os feriados.',
        marcas: ['catch', 'role="alert"', 'resposta.ok'],
      },
      {
        id: 'componente-do-erro',
        titulo: 'A mensagem de erro é um componente',
        resumo: 'Um jeito só de dizer que algo deu errado, em toda tela.',
        explicacao: [
          'A agenda tem um componente `MensagemDeErro`, que recebe o texto e, quando faz sentido, a função de tentar de novo. A tela dos feriados o usa quando a API falha; a do evento o usa quando o id não existe; a rota que não existe o usa também.',
          'Um componente só para o erro garante que todo erro tenha a mesma cara e o mesmo `role="alert"`. Escrito à mão em cada tela, um dos três esquece o `role`, e o leitor de tela fica calado só ali.',
        ],
        marcas: ['MensagemDeErro', 'tentar de novo'],
      },
    ],
  },
  {
    id: 'responsivo',
    topicos: [
      {
        id: 'viewport',
        titulo: 'A meta viewport',
        resumo: 'Sem ela, o celular finge ter tela de computador e encolhe tudo.',
        explicacao: [
          'Os celulares, para mostrar páginas antigas, fingem ter uns 980 pixels de largura e encolhem a página para caber. A letra fica do tamanho de uma formiga, e as consultas de mídia para celular nunca valem, porque o celular diz que é largo.',
          'A linha `<meta name="viewport" content="width=device-width, initial-scale=1.0">` no `index.html` desliga o fingimento: a largura da página passa a ser a da tela. É a primeira coisa de qualquer site responsivo, e o `npm create vite` já a escreve — some quando alguém monta o `index.html` à mão.',
        ],
        marcas: ['viewport', 'device-width'],
      },
      {
        id: 'largura',
        titulo: 'Largura máxima, e não largura fixa',
        resumo: 'width: 960px passa da tela do celular; max-width: 960px não passa.',
        explicacao: [
          'Uma `width: 960px` no `main` deixa a página com 960 pixels mesmo num celular de 375: o resto sai pela direita, e a pessoa rola de lado sem saber que há mais coisa lá.',
          '`max-width: 960px` diz "no máximo 960": no computador fica igual, e no celular a página encolhe até a largura da tela. É a troca de uma palavra, e é a que mais conserta site no celular.',
        ],
        atencao: 'Para conferir, estreite a janela até a largura de um celular. Se aparecer barra de rolagem de lado, alguma coisa tem largura fixa.',
        marcas: ['max-width', 'width', 'rolagem lateral'],
      },
      {
        id: 'consulta-de-midia',
        titulo: 'Uma coluna no celular, três no computador',
        resumo: 'A consulta de mídia troca a grade conforme a largura da tela.',
        explicacao: [
          'Três colunas no computador viram três tiras de dois centímetros no celular. A consulta de mídia `@media (max-width: 700px)` diz: quando a tela tiver até 700 pixels, use estas regras — e ali a grade passa a ter uma coluna só.',
          'O cabeçalho é o outro lugar que aperta: o nome do clube e o menu, lado a lado, não cabem em 375 pixels. Na mesma consulta, ele empilha.',
        ],
        exemplo: `.lista {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.cartao {
  background-color: #e8f0ec;
  padding: 8px;
}
@media (max-width: 700px) {
  .lista {
    grid-template-columns: 1fr;
  }
}`,
        exemploComo: 'css',
        exemploMarcacao: `<div class="lista">
  <p class="cartao">Acampamento</p>
  <p class="cartao">Campori</p>
  <p class="cartao">Feira</p>
</div>`,
        exemploLarguras: [360, 900],
        marcas: ['@media', 'grid-template-columns', 'max-width'],
      },
      {
        id: 'celular-de-verdade',
        titulo: 'O celular de verdade',
        resumo: 'A janela estreitada parece um celular, e não tem dedo, nem teclado, nem a rede dele.',
        explicacao: [
          'O modo celular do navegador acerta a largura, e só. No aparelho de verdade há o dedo, que é mais grosso que o ponteiro e erra botões pequenos; o teclado, que sobe e cobre metade da tela; a rede do celular, que cai no meio da busca.',
          'Por isso o requisito 7 pede a demonstração **num aparelho celular real**. É lá que aparece o botão que não se acerta com o dedo e o erro que só a rede ruim provoca.',
        ],
        marcas: ['celular real', 'toque'],
      },
    ],
  },
  {
    id: 'publicar',
    topicos: [
      {
        id: 'dev-e-build',
        titulo: 'O npm run dev não é o site',
        resumo: 'O servidor de desenvolvimento traduz na hora; o site publicado é o que o build gerou.',
        explicacao: [
          'O `npm run dev` abre a aplicação traduzindo cada arquivo quando o navegador pede, e não espera o TypeScript conferir nada: com erro de tipo, a página abre do mesmo jeito. É bom para trabalhar, e é o motivo de um erro passar despercebido.',
          'O `npm run build` faz o site de verdade: roda `tsc -b`, que confere os tipos e **recusa** com erro, e depois o Vite junta tudo na pasta `dist` — um `index.html` e os arquivos de `assets`. É essa pasta que vai para o ar.',
        ],
        atencao: 'Rode o npm run build antes de publicar. O erro que o dev deixou passar aparece aqui, na sua máquina, e não no meio da publicação.',
        marcas: ['npm run dev', 'npm run build', 'dist', 'tsc -b'],
      },
      {
        id: 'pages',
        titulo: 'Onde a aplicação mora',
        resumo: 'Um site que só tem arquivos pode morar num serviço que só entrega arquivos.',
        explicacao: [
          'A agenda não tem servidor próprio: depois do build, ela é um `index.html`, um JavaScript e um CSS. Serviços como o GitHub Pages entregam arquivos assim de graça, num **link público** — `https://pioneiros.github.io/agenda-do-clube/`.',
          'O Pages tem duas origens. **Um ramo** entrega os arquivos como estão no repositório: o `index.html` pedindo `/main.tsx`, que nenhum navegador roda. **O GitHub Actions** roda uma esteira que constrói antes e publica a pasta `dist`. Para uma aplicação com build, é a segunda.',
        ],
        marcas: ['GitHub Pages', 'GitHub Actions', 'link público'],
      },
      {
        id: 'base',
        titulo: 'A base: o site não mora na raiz',
        resumo: 'O link é /agenda-do-clube/, e o build precisa saber disso.',
        explicacao: [
          'O site mora em `/agenda-do-clube/`, e não na raiz do endereço. Com a configuração de fábrica, o build escreve no `index.html` que o JavaScript está em `/assets/...` — na raiz, onde não há nada.',
          'O resultado é a armadilha mais conhecida de quem publica pela primeira vez: a página abre **em branco**, sem mensagem nenhuma, e o 404 aparece só no console. A correção é uma linha no `vite.config.ts`: `base: \'/agenda-do-clube/\'`.',
        ],
        exemplo: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/agenda-do-clube/',
});`,
        exemploComo: 'texto',
        atencao: 'Página em branco depois de publicar? Abra o console antes de mexer no código: quase sempre é um 404 de arquivo pedido no lugar errado.',
        marcas: ['base', 'vite.config.ts', '404'],
      },
    ],
  },
  {
    id: 'versionar',
    topicos: [
      {
        id: 'vinte-em-cinco',
        titulo: 'Vinte commits em cinco dias',
        resumo: 'O requisito mede o trabalho ao longo do tempo, e não o tamanho do último dia.',
        explicacao: [
          'O requisito 5 pede **vinte commits em pelo menos cinco dias distintos**. Não é para encher o histórico: é o retrato de um projeto feito aos poucos — o esqueleto num dia, as telas no outro, a API e o celular depois.',
          'Vinte commits num dia só mostram uma noite de digitação; cinco commits enormes em cinco dias mostram que o trabalho foi guardado de vez em quando. O que o requisito pede é o hábito: terminou uma coisa, guarde.',
        ],
        exemplo: `$ git log --oneline
a15 Publica na pasta do repositório pela base do Vite
a14 Corrige o local do evento, que o build recusava
a13 Acrescenta a esteira que publica no Pages
a12 Põe a meta viewport no index.html
a11 Deixa a lista em uma coluna no celular`,
        exemploComo: 'texto',
        marcas: ['commit', 'git log', 'histórico'],
      },
      {
        id: 'um-assunto',
        titulo: 'Um assunto por commit',
        resumo: 'O git add . junta o que não tem nada a ver; um arquivo por vez separa.',
        explicacao: [
          'Depois de uma noite de trabalho, o `git status` lista cinco arquivos mudados: o botão de erro, o foco do teclado, a mensagem dos feriados, o título da página, o `.gitignore`. São cinco assuntos. O `git add .` põe os cinco num commit só, com uma mensagem que não consegue dizer tudo.',
          'Um commit por assunto deixa o histórico legível e deixa desfazer uma mudança sem levar as outras. O `git diff`, com o nome do arquivo, mostra o que mudou nele antes de guardar — é a leitura que faz a mensagem sair certa.',
        ],
        marcas: ['git add', 'git diff', 'git status'],
      },
      {
        id: 'gitignore',
        titulo: 'O que não entra no repositório',
        resumo: 'node_modules e dist se refazem; guardá-los só pesa.',
        explicacao: [
          'A pasta `node_modules` tem as bibliotecas que o `npm install` baixa — dezenas de milhares de arquivos, que qualquer um refaz com um comando. A pasta `dist` é o que o build gera, e a esteira gera de novo a cada publicação. As duas vão no `.gitignore`.',
          'E o arquivo `.env`, quando houver, também: ele guarda chaves, e o repositório pode ser público.',
        ],
        marcas: ['.gitignore', 'node_modules', 'dist'],
      },
    ],
  },
  {
    id: 'documentar',
    topicos: [
      {
        id: 'readme-de-site',
        titulo: 'O README de uma aplicação web',
        resumo: 'O que é, onde está no ar, como instalar e como rodar.',
        explicacao: [
          'O README é a primeira coisa que aparece no repositório. O de uma aplicação web diz **o que ela é e para quem**, **o link em que está no ar** — é por ele que a maioria vai chegar, sem instalar nada —, **como instalar** (o Node.js e o `npm install`) e **como rodar** no computador (`npm run dev`).',
          'O link é o que mais falta, e o que mais faz falta: sem ele, quem só queria ver a agenda acha que precisa construí-la.',
        ],
        exemplo: `# Agenda do Clube

## Descrição

Os próximos eventos do clube, a tela de cada um e os feriados do ano.

Está no ar em https://pioneiros.github.io/agenda-do-clube/

## Instalação

Precisa do Node.js 20. Na pasta do projeto: npm install

## Uso

npm run dev abre a agenda em http://localhost:5173`,
        exemploComo: 'texto',
        marcas: ['README', 'link público', 'npm install'],
      },
      {
        id: 'registro-de-decisoes',
        titulo: 'O registro das decisões de interface',
        resumo: 'O que se escolheu, por quê, e o que ficou de fora.',
        explicacao: [
          'Toda interface é feita de escolhas: o menu fica no topo ou numa gaveta, a lista vira uma coluna ou rola de lado, o erro tem botão ou pede para recarregar. O **registro de decisões** guarda cada uma, num arquivo como `DECISOES.md`.',
          'Cada decisão tem três partes: **o que se escolheu**, **por quê**, e **qual era a outra opção**. Sem a alternativa, é descrição — "o menu fica no topo" não diz que se pensou em outra coisa. Sem o porquê, quem chega depois desfaz a decisão sem saber o que ela evitava.',
          'As equipes de software escrevem isto há décadas, com o nome de registro de decisões de arquitetura. O de interface é o mesmo, para as telas.',
        ],
        exemplo: `## O menu fica no topo, e não numa gaveta

Com duas telas no menu, uma gaveta escondida atrás de um ícone
esconderia metade da agenda. Ficou no topo, porque assim os dois
links aparecem sempre, em vez de esperar alguém abrir.`,
        exemploComo: 'texto',
        marcas: ['DECISOES.md', 'alternativa', 'porquê'],
      },
    ],
  },
  {
    id: 'apresentar',
    topicos: [
      {
        id: 'quinze-minutos',
        titulo: 'Quinze minutos, e o celular no centro',
        resumo: 'O objetivo em uma frase, a agenda rodando, e as decisões.',
        explicacao: [
          'O requisito 7 dá **até quinze minutos**. É pouco para contar cada componente, e é o bastante para mostrar a aplicação funcionando. O roteiro tem três partes: o objetivo e o público, em uma ou duas frases; a agenda rodando no celular, que é a maior; e as decisões de interface, cada uma mostrada na tela em que aparece.',
          'As perguntas do examinador ficam com o que sobrar. Um roteiro que gasta dez minutos explicando e dois mostrando é a apresentação de uma aplicação que não se viu.',
        ],
        marcas: ['roteiro', 'quinze minutos'],
      },
      {
        id: 'o-que-mostrar',
        titulo: 'O que mostrar no celular',
        resumo: 'O link, as três telas, a coluna única e o erro provocado.',
        explicacao: [
          'Cada peça do requisito 3 aparece no celular: abrir pelo **link público** (digitado ou lido num QR code), andar pelas **três telas** e voltar pelo menu, mostrar a lista em **uma coluna** sem rolar de lado, e o **erro visível** — que só aparece se alguém o provoca. Ligar o modo avião na tela dos feriados e tocar em tentar de novo é o jeito mais rápido.',
          'O erro provocado de propósito mostra mais do que tudo o que funciona: é a prova de que a aplicação foi pensada para quando as coisas dão errado.',
        ],
        marcas: ['modo avião', 'QR code', 'demonstração'],
      },
      {
        id: 'plano-b',
        titulo: 'Quando a internet da sala falha',
        resumo: 'O plano B é outra rede, e não uma captura de tela.',
        explicacao: [
          'A rede da sala do clube cai na hora que mais importa. O plano B é ter outra rede à mão: os dados do próprio celular, ou a rede de outra pessoa. Teste antes, no mesmo lugar.',
          'Capturas de tela não são plano B: mostram uma agenda que não roda, e o requisito pede o funcionamento. Se nada funcionar, é melhor dizer isso ao examinador e combinar outro dia do que mostrar fotos.',
        ],
        marcas: ['plano B', 'dados móveis'],
      },
    ],
  },
];

const cap = (id: string) => CAPITULOS.find(c => c.id === id)!.topicos;

export const MODULOS_DO_PROJETO_DE_INTERFACE: ModuloDeVereda[] = [
  {
    id: 'm1', titulo: 'A proposta',
    resumo: 'O objetivo, o público, o mapa de telas e o rascunho, aprovados antes.',
    licoes: [
      { id: 'm1-teoria', tipo: 'teoria', questoes: Q['m1-teoria'], perguntas: 4,
        titulo: 'Antes da primeira linha', resumo: 'O objetivo, o público, o mapa de telas, o rascunho e a aprovação.', topicos: cap('proposta') },
      { id: 'm1-lab', tipo: 'projeto-de-interface', licao: 'proposta',
        titulo: 'Escrevendo a proposta da agenda', resumo: 'O objetivo e o público, três telas ligadas, o rascunho de cada uma e a aprovação.',
        verificacoes: ['objetivo-e-publico', 'mapa-de-telas', 'rascunho', 'aprovada-antes'] },
    ],
  },
  {
    id: 'm2', titulo: 'As telas',
    resumo: 'O mapa de telas vira rotas, com uma tela por item e resposta para o endereço errado.',
    licoes: [
      { id: 'm2-teoria', tipo: 'teoria', questoes: Q['m2-teoria'], perguntas: 4,
        titulo: 'Do mapa às rotas', resumo: 'Cada tela uma rota, o parâmetro no endereço e o HashRouter.', topicos: cap('telas') },
      { id: 'm2-lab', tipo: 'react', licao: 'agenda-telas',
        titulo: 'As três telas da agenda', resumo: 'Os eventos, a tela de cada evento e os feriados, ligados pelo menu.',
        verificacoes: ['inicio-com-links', 'tela-do-evento', 'feriados-e-menu', 'endereco-perdido'] },
    ],
  },
  {
    id: 'm3', titulo: 'Os componentes',
    resumo: 'Três peças reutilizadas, com as propriedades tipadas.',
    licoes: [
      { id: 'm3-teoria', tipo: 'teoria', questoes: Q['m3-teoria'], perguntas: 4,
        titulo: 'Peças que se repetem', resumo: 'Quando separar, a interface das props e o children.', topicos: cap('componentes') },
      { id: 'm3-lab', tipo: 'react', licao: 'agenda-componentes',
        titulo: 'Os componentes da agenda', resumo: 'A seção, o cartão de evento e a mensagem de erro, cada um em mais de uma tela.',
        verificacoes: ['tres-componentes', 'reusados', 'mesmas-telas'] },
    ],
  },
  {
    id: 'm4', titulo: 'Os dados de fora',
    resumo: 'A API, e o erro que aparece para quem usa.',
    licoes: [
      { id: 'm4-teoria', tipo: 'teoria', questoes: Q['m4-teoria'], perguntas: 4,
        titulo: 'Quando a rede responde, e quando não', resumo: 'API pública ou própria, o erro visível e o componente dele.', topicos: cap('api') },
      { id: 'm4-lab', tipo: 'react', licao: 'agenda-api',
        titulo: 'Os feriados, com o erro à vista', resumo: 'A BrasilAPI na tela dos feriados, com o carregando, o erro e o tentar de novo.',
        verificacoes: ['carregando-e-lista', 'erro-visivel', 'tentar-de-novo'] },
    ],
  },
  {
    id: 'm5', titulo: 'Celular e computador',
    resumo: 'A mesma agenda nas duas telas, sem rolar de lado.',
    licoes: [
      { id: 'm5-teoria', tipo: 'teoria', questoes: Q['m5-teoria'], perguntas: 4,
        titulo: 'Do tamanho da tela', resumo: 'A viewport, a largura máxima, a consulta de mídia e o celular de verdade.', topicos: cap('responsivo') },
      { id: 'm5-lab', tipo: 'react', licao: 'agenda-responsivo',
        titulo: 'A agenda no celular', resumo: 'A viewport, a largura que cabe, uma coluna e o cabeçalho que empilha.',
        verificacoes: ['viewport', 'largura-que-cabe', 'uma-coluna', 'menu-no-celular'] },
    ],
  },
  {
    id: 'm6', titulo: 'No ar',
    resumo: 'Publicar num link público, pelo build e com a base certa.',
    licoes: [
      { id: 'm6-teoria', tipo: 'teoria', questoes: Q['m6-teoria'], perguntas: 4,
        titulo: 'Do computador para o link', resumo: 'O dev e o build, o Pages pela esteira e a base.', topicos: cap('publicar') },
      { id: 'm6-lab', tipo: 'hospedagem',
        titulo: 'Publicando a agenda', resumo: 'Ligar o Pages, consertar o build, acertar a base e andar pelo link.',
        verificacoes: ['pela-esteira', 'build-sem-erro', 'base-certa', 'link-publico'] },
    ],
  },
  {
    id: 'm7', titulo: 'O histórico',
    resumo: 'Vinte commits em cinco dias, cada um com um assunto.',
    licoes: [
      { id: 'm7-teoria', tipo: 'teoria', questoes: Q['m7-teoria'], perguntas: 4,
        titulo: 'Guardar aos poucos', resumo: 'Vinte em cinco dias, um assunto por commit e o .gitignore.', topicos: cap('versionar') },
      { id: 'm7-lab', tipo: 'terminal', computador: 'agenda-versionamento',
        titulo: 'Guardando a última noite', resumo: 'Cinco mudanças sem commit, e cada uma no seu.',
        verificacoes: ['vinteCommits', 'cincoDias', 'umAssuntoPorCommit', 'mensagensQueDizem', 'arvoreLimpa'] },
    ],
  },
  {
    id: 'm8', titulo: 'README e decisões',
    resumo: 'O que a agenda é, onde está, e por que ela é assim.',
    licoes: [
      { id: 'm8-teoria', tipo: 'teoria', questoes: Q['m8-teoria'], perguntas: 4,
        titulo: 'O que fica escrito', resumo: 'O README de uma aplicação web e o registro das decisões.', topicos: cap('documentar') },
      { id: 'm8-lab', tipo: 'terminal', computador: 'agenda-readme',
        titulo: 'O README e as decisões da agenda', resumo: 'O README com o link, e três decisões com o porquê e a alternativa.',
        verificacoes: ['leiameDoSiteDescreve', 'leiameDoSiteInstala', 'leiameDoSiteUsa', 'leiameComLink', 'decisoesTres', 'decisoesJustificadas', 'documentosVersionados'] },
    ],
  },
  {
    id: 'm9', titulo: 'A apresentação',
    resumo: 'Quinze minutos, com a agenda rodando num celular de verdade.',
    licoes: [
      { id: 'm9-teoria', tipo: 'teoria', questoes: Q['m9-teoria'], perguntas: 4,
        titulo: 'Mostrar funcionando', resumo: 'O roteiro, o que mostrar no celular e o plano B.', topicos: cap('apresentar') },
      { id: 'm9-lab', tipo: 'projeto-de-interface', licao: 'apresentacao',
        titulo: 'Preparando os quinze minutos', resumo: 'O roteiro com o celular no centro, o que mostrar e o aparelho de verdade.',
        verificacoes: ['cabe-em-quinze', 'celular-no-centro', 'o-que-mostrar', 'aparelho-real'] },
    ],
  },
];
