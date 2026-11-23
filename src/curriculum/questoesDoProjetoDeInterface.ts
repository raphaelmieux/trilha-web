import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC-FE007 Projeto de Interface.
 *
 * ── O que elas medem ──────────────────────────────────────────────────────
 * A definição vale uma vez; depois vêm consequência, discriminação e
 * diagnóstico. Nesta vereda o diagnóstico é olhar um projeto que deu errado —
 * a página em branco depois de publicar, a lista que rola de lado no celular,
 * o erro que só aparece no console, o histórico com um commit só — e dizer de
 * onde vem. Os atalhos que parecem resolver e não resolvem (o any, a captura
 * de tela no lugar do celular, o git add . de uma noite) aparecem nas
 * alternativas erradas de propósito.
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

export const QUESTOES_DO_PROJETO_DE_INTERFACE: Record<string, Question[]> = {
  /* ── Módulo 1 — A proposta ── */
  'm1-teoria': [
    {
      id: 'PI-M1-Q1', type: 'multiple_choice',
      prompt: 'O que é um mapa de telas?',
      data: { options: [
        { id: 'a', text: 'As telas da aplicação e os caminhos entre elas.', correct: true },
        { id: 'b', text: 'A lista das cores e letras de cada tela.', porque: 'Cor e letra são de outra etapa. O mapa diz quais telas existem e para onde cada uma leva.' },
        { id: 'c', text: 'O endereço do servidor em que o site está.', porque: 'O endereço é da publicação. O mapa é desenhado antes de existir qualquer servidor.' },
        { id: 'd', text: 'Uma foto de cada tela já programada.', porque: 'O mapa vem antes do código. Uma foto do que já existe não ajuda a decidir o que fazer.' },
      ]},
      explanation: 'Uma caixa por tela e setas entre elas. Cada caixa vira uma rota, e cada seta vira um link.',
    },
    {
      id: 'PI-M1-Q2', type: 'multiple_choice',
      prompt: 'O mapa da agenda tem três telas, e a dos feriados não recebe seta de nenhuma outra. O que isso quer dizer?',
      data: { options: [
        { id: 'a', text: 'Ninguém vai achar a tela dos feriados.', correct: true },
        { id: 'b', text: 'A tela dos feriados é a de entrada.', porque: 'A de entrada é a que abre pelo link, e ela é a primeira do mapa. Sem seta chegando, a dos feriados fica fora de alcance.' },
        { id: 'c', text: 'A tela dos feriados não precisa de rascunho.', porque: 'Toda tela precisa de rascunho. O problema dela é outro: não há caminho até lá.' },
        { id: 'd', text: 'Nada: o mapa só mostra as telas, e não os caminhos.', porque: 'As setas são justamente os caminhos. Uma tela sem seta chegando só se abre digitando o endereço.' },
      ]},
      explanation: 'Toda tela precisa ter um caminho a partir da de entrada. Achar a tela solta no papel custa um traço; achar no código custa alguém perdido.',
    },
    {
      id: 'PI-M1-Q3', type: 'multiple_choice',
      prompt: 'Por que o rascunho de uma tela não leva cor nem foto?',
      data: { options: [
        { id: 'a', text: 'Para a conversa ser sobre o que vai na tela.', correct: true },
        { id: 'b', text: 'Porque a aplicação vai ser toda em cinza.', porque: 'O cinza é só do rascunho. A cor vem depois, quando já se sabe o que vai em cada lugar.' },
        { id: 'c', text: 'Porque o examinador não aceita cor na proposta.', porque: 'Não há proibição. O rascunho fica sem cor para ninguém discutir a cor antes do conteúdo.' },
        { id: 'd', text: 'Porque cor só se escolhe depois de publicar.', porque: 'A cor se escolhe durante a construção, bem antes de publicar. Só não é assunto do rascunho.' },
      ]},
      explanation: 'Com cor, a conversa vira sobre a cor. O rascunho decide o que vai em cada tela e em que ordem.',
    },
    {
      id: 'PI-M1-Q4', type: 'multiple_choice',
      prompt: 'O mapa diz que a tela de um evento leva de volta à lista. O que o rascunho dessa tela precisa ter?',
      data: { options: [
        { id: 'a', text: 'Alguma coisa em que se toca para voltar.', correct: true },
        { id: 'b', text: 'O nome da lista escrito no rodapé.', porque: 'Um nome escrito não leva a lugar nenhum. A seta precisa virar menu, botão ou link.' },
        { id: 'c', text: 'Nada: o botão voltar do celular resolve.', porque: 'O botão do aparelho não aparece para quem abriu o evento direto pelo link. A tela precisa do caminho dela.' },
        { id: 'd', text: 'Uma foto do evento, para ficar bonita.', porque: 'A foto pode até entrar, mas não leva a lugar nenhum. O que a seta pede é um caminho.' },
      ]},
      explanation: 'Cada seta do mapa vira, no rascunho, um item de menu, um cartão ou um botão.',
    },
    {
      id: 'PI-M1-Q5', type: 'multiple_choice',
      prompt: 'Qual destes é um público-alvo que ajuda a decidir a interface?',
      data: { options: [
        { id: 'a', text: 'As famílias do clube, pelo celular.', correct: true },
        { id: 'b', text: 'Todo mundo que tiver internet.', porque: 'Todo mundo não decide nada: a criança, a avó e a secretaria pedem telas diferentes.' },
        { id: 'c', text: 'Quem gostar de aplicativos.', porque: 'Gosto não diz quem abre a tela nem em que aparelho. Não ajuda a escolher nada.' },
        { id: 'd', text: 'O examinador da especialidade.', porque: 'O examinador avalia, mas não é quem vai usar a agenda no dia a dia.' },
      ]},
      explanation: 'Saber que são famílias no celular decide o tamanho da letra, as palavras e o que vem primeiro.',
    },
    {
      id: 'PI-M1-Q6', type: 'multiple_choice',
      prompt: 'Por que o requisito proíbe começar a programar antes de a proposta ser aprovada?',
      data: { options: [
        { id: 'a', text: 'Mudar no papel custa menos do que no código.', correct: true },
        { id: 'b', text: 'Porque o computador só libera depois da aprovação.', porque: 'Nada impede de digitar. A regra existe porque mudar código pronto custa caro.' },
        { id: 'c', text: 'Porque a proposta vira o código sozinha.', porque: 'A proposta não vira código. Ela decide o que será escrito, e mudá-la depois joga código fora.' },
        { id: 'd', text: 'Para o examinador escrever o código junto.', porque: 'O examinador aprova o plano, e não programa. O código é de quem propôs.' },
      ]},
      explanation: 'Se o examinador pede mais uma tela, ou tira uma, mudar uma caixa no papel custa um minuto. No código custa a tela inteira.',
    },
    vf('PI-M1-Q7',
      'O objetivo da agenda é ter uma tela de eventos e uma de feriados.',
      false,
      'Telas são a solução. O objetivo é o problema que elas resolvem: o aviso que se perde no grupo.',
      'O objetivo diz o que acontece hoje e o que muda. A lista de telas vem depois, para cumprir o objetivo.'),
  ],

  /* ── Módulo 2 — As telas ── */
  'm2-teoria': [
    {
      id: 'PI-M2-Q1', type: 'multiple_choice',
      prompt: 'No React com rotas, o que vira cada caixa do mapa de telas?',
      data: { options: [
        { id: 'a', text: 'Uma Route, com o caminho dela.', correct: true },
        { id: 'b', text: 'Um arquivo index.html separado.', porque: 'A aplicação tem um index.html só. É o endereço que decide qual tela aparece.' },
        { id: 'c', text: 'Uma aba nova do navegador.', porque: 'As telas trocam dentro da mesma aba, sem recarregar a página.' },
        { id: 'd', text: 'Um servidor diferente para cada tela.', porque: 'Um servidor só entrega a aplicação inteira. As rotas são resolvidas no navegador.' },
      ]},
      explanation: 'Cada caixa vira uma Route com o caminho dela, e cada seta vira um Link ou NavLink.',
    },
    {
      id: 'PI-M2-Q2', type: 'multiple_choice',
      prompt: 'A agenda tem quatro eventos. Quantas telas de evento ela precisa?',
      data: { options: [
        { id: 'a', text: 'Uma, com o id no endereço.', correct: true },
        { id: 'b', text: 'Quatro, uma para cada evento.', porque: 'Quatro telas iguais seriam quatro cópias para manter. Uma tela com o parâmetro serve a todos.' },
        { id: 'c', text: 'Nenhuma: tudo fica na lista.', porque: 'O mapa da agenda tem a tela do evento, com a data, o local e a descrição.' },
        { id: 'd', text: 'Duas: uma para os passados e outra para os próximos.', porque: 'A tela é a mesma para qualquer evento. O que muda é o id que chega pelo endereço.' },
      ]},
      explanation: 'O caminho /evento/:id faz uma tela só servir a qualquer evento. O useParams diz qual.',
    },
    {
      id: 'PI-M2-Q3', type: 'multiple_choice',
      prompt: 'O que o useParams devolve na tela /evento/:id quando o endereço é /evento/campori?',
      data: { options: [
        { id: 'a', text: 'Um objeto com id igual a campori.', correct: true },
        { id: 'b', text: 'O evento campori inteiro, com data e local.', porque: 'O useParams só lê o endereço. Procurar o evento na lista é trabalho da tela.' },
        { id: 'c', text: 'O endereço completo, com o domínio.', porque: 'Ele devolve só os parâmetros declarados no caminho, como o id.' },
        { id: 'd', text: 'Nada, porque campori não é um número.', porque: 'O parâmetro chega sempre como texto, seja número ou palavra.' },
      ]},
      explanation: 'O useParams devolve os pedaços variáveis do endereço. Com eles, a tela procura o que mostrar.',
    },
    {
      id: 'PI-M2-Q4', type: 'multiple_choice',
      prompt: 'Alguém abre /evento/acantonamento, mas não há evento com esse id. O que a tela deve fazer?',
      data: { options: [
        { id: 'a', text: 'Dizer que o evento não foi encontrado.', correct: true },
        { id: 'b', text: 'Mostrar o primeiro evento da lista.', porque: 'Mostrar outro evento engana: a pessoa acha que abriu o certo.' },
        { id: 'c', text: 'Ficar em branco até a pessoa voltar.', porque: 'A tela em branco não diz nada, e a pessoa não sabe se é erro ou se está carregando.' },
        { id: 'd', text: 'Fechar a aba do navegador.', porque: 'Fechar a aba tira a pessoa da agenda inteira. A tela precisa explicar e oferecer o caminho de volta.' },
      ]},
      explanation: 'Endereço errado e evento que saiu da lista chegam do mesmo jeito. A tela responde com uma mensagem, e não com o vazio.',
    },
    {
      id: 'PI-M2-Q5', type: 'multiple_choice',
      prompt: 'Para que serve o NavLink no menu, em vez do Link comum?',
      data: { options: [
        { id: 'a', text: 'Ele marca a tela em que se está.', correct: true },
        { id: 'b', text: 'Ele abre a tela numa aba nova.', porque: 'Os dois trocam de tela na mesma aba. A diferença é a classe active.' },
        { id: 'c', text: 'Ele funciona sem o roteador.', porque: 'Os dois precisam do roteador em volta da aplicação.' },
        { id: 'd', text: 'Ele carrega a tela mais depressa.', porque: 'A velocidade é a mesma. O NavLink só ganha a classe active quando a tela dele é a de agora.' },
      ]},
      explanation: 'O NavLink ganha a classe active na tela dele, e o CSS a pinta: é assim que se sabe onde se está.',
    },
    {
      id: 'PI-M2-Q6', type: 'multiple_choice',
      prompt: 'Uma agenda publicada num serviço que só entrega arquivos usa BrowserRouter. O que acontece ao recarregar em /evento/campori?',
      data: { options: [
        { id: 'a', text: 'O servidor responde 404.', correct: true },
        { id: 'b', text: 'A tela do evento abre normalmente.', porque: 'Ao recarregar, o navegador pede ao servidor um arquivo com esse caminho, e ele não existe.' },
        { id: 'c', text: 'O navegador volta para a lista de eventos.', porque: 'O navegador não sabe da lista. Ele pede o arquivo e recebe 404.' },
        { id: 'd', text: 'O React corrige o endereço sozinho.', porque: 'O React nem chega a rodar: a resposta do servidor já é o 404.' },
      ]},
      explanation: 'Com o HashRouter, a rota fica depois do #, que nunca vai ao servidor. Recarregar pede sempre o index.html.',
    },
    vf('PI-M2-Q7',
      'No HashRouter, o que vem depois do # nunca é enviado ao servidor.',
      true,
      'O navegador guarda o que vem depois do # para si. O servidor só recebe o que vem antes.',
      'É por isso que recarregar /#/evento/campori pede o index.html, e o React lê a rota.'),
  ],

  /* ── Módulo 3 — Os componentes ── */
  'm3-teoria': [
    {
      id: 'PI-M3-Q1', type: 'multiple_choice',
      prompt: 'O que o requisito quer dizer com componente reutilizado?',
      data: { options: [
        { id: 'a', text: 'Um componente usado em mais de um lugar.', correct: true },
        { id: 'b', text: 'Um componente copiado de outro projeto.', porque: 'Copiar de fora não é reusar dentro da aplicação. O que conta é a mesma peça em mais de um lugar.' },
        { id: 'c', text: 'Um componente que existe num arquivo próprio.', porque: 'Arquivo próprio ajuda a achar, mas um componente usado uma vez só não foi reusado.' },
        { id: 'd', text: 'Um componente que se desenha duas vezes no mesmo lugar.', porque: 'Desenhar de novo no mesmo lugar não é reúso. Reúso é servir a telas ou pontos diferentes.' },
      ]},
      explanation: 'O cartão de evento na lista e nos outros eventos, a seção nas três telas: a mesma peça em lugares diferentes.',
    },
    {
      id: 'PI-M3-Q2', type: 'multiple_choice',
      prompt: 'O cartão de evento foi copiado em duas telas. Um dia o cartão ganha a hora do evento. O que costuma acontecer?',
      data: { options: [
        { id: 'a', text: 'Uma das cópias fica sem a hora.', correct: true },
        { id: 'b', text: 'As duas cópias mudam juntas.', porque: 'Cópias não sabem uma da outra. Só um componente usado nos dois lugares muda de uma vez.' },
        { id: 'c', text: 'O compilador avisa que falta a hora.', porque: 'O compilador não sabe que as duas cópias deveriam ser iguais. Ele aceita as duas.' },
        { id: 'd', text: 'O navegador junta as duas cópias.', porque: 'O navegador desenha o que recebe. Ele não percebe que eram para ser a mesma coisa.' },
      ]},
      explanation: 'Duas cópias divergem no primeiro ajuste. Um componente só muda em todo lugar de uma vez.',
    },
    {
      id: 'PI-M3-Q3', type: 'multiple_choice',
      prompt: 'Para que serve a interface Props de um componente?',
      data: { options: [
        { id: 'a', text: 'Diz o que o componente espera receber.', correct: true },
        { id: 'b', text: 'Desenha o componente na tela.', porque: 'Quem desenha é a função do componente. A interface só descreve as propriedades.' },
        { id: 'c', text: 'Guarda o estado do componente.', porque: 'O estado é do useState. A interface diz o que chega de quem usa o componente.' },
        { id: 'd', text: 'Escolhe a cor do componente.', porque: 'A cor é do CSS. A interface diz os nomes e os tipos das propriedades.' },
      ]},
      explanation: 'Com a interface, o compilador recusa quem esquecer de passar uma propriedade ou passar do tipo errado.',
    },
    {
      id: 'PI-M3-Q4', type: 'multiple_choice',
      prompt: 'Com evento: any, o cartão usa evento.lugar, mas o campo se chama local. O que aparece?',
      data: { options: [
        { id: 'a', text: 'O cartão sem o local, sem erro nenhum.', correct: true },
        { id: 'b', text: 'Um erro do compilador apontando lugar.', porque: 'O any desliga a conferência: o compilador aceita qualquer campo.' },
        { id: 'c', text: 'O local certo, porque o React corrige.', porque: 'O React não sabe o nome do campo. Ele desenha o que recebe, e lugar não existe.' },
        { id: 'd', text: 'A palavra lugar escrita no cartão.', porque: 'O campo inexistente vale undefined, e o JSX não desenha nada para ele.' },
      ]},
      explanation: 'Com o tipo certo, o compilador aponta evento.lugar. Com any, o erro passa calado até alguém reparar no cartão.',
    },
    {
      id: 'PI-M3-Q5', type: 'multiple_choice',
      prompt: 'A Secao desenha um título e uma moldura, e o miolo muda em cada tela. Como o miolo chega a ela?',
      data: { options: [
        { id: 'a', text: 'Pelo children.', correct: true },
        { id: 'b', text: 'Por uma variável global.', porque: 'Uma variável global faria todas as seções mostrarem a mesma coisa. Cada uso passa o seu miolo.' },
        { id: 'c', text: 'Por um fetch dentro da Secao.', porque: 'A seção não busca nada. O miolo vem de quem a usa, entre as tags.' },
        { id: 'd', text: 'Pelo useParams.', porque: 'O useParams lê o endereço. O miolo é o que se escreve entre Secao e o fechamento dela.' },
      ]},
      explanation: 'O que se escreve entre <Secao> e </Secao> chega como children, do tipo ReactNode.',
    },
    {
      id: 'PI-M3-Q6', type: 'multiple_choice',
      prompt: 'Qual destas peças da agenda é a candidata mais fraca a virar componente reutilizado?',
      data: { options: [
        { id: 'a', text: 'Um parágrafo que só aparece na tela dos feriados.', correct: true },
        { id: 'b', text: 'O cartão de evento, que aparece em duas telas.', porque: 'Este aparece em dois lugares: é o caso clássico de componente.' },
        { id: 'c', text: 'A mensagem de erro, usada em três lugares.', porque: 'Usada em três lugares, ela ganha muito em ser uma peça só.' },
        { id: 'd', text: 'A seção com título, presente nas três telas.', porque: 'Presente nas três telas, ela é reúso de verdade.' },
      ]},
      explanation: 'O que aparece uma vez pode ficar onde está. O que se repete vira componente.',
    },
    vf('PI-M3-Q7',
      'Trocar o tipo de uma propriedade por any é um jeito de deixar o código tipado.',
      false,
      'O any é o contrário de tipar: ele diz ao compilador para não conferir nada.',
      'Código tipado é o compilador conferindo os tipos. O any desliga a conferência naquele ponto.'),
  ],

  /* ── Módulo 4 — Os dados de fora ── */
  'm4-teoria': [
    {
      id: 'PI-M4-Q1', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre uma API pública e uma API própria?',
      data: { options: [
        { id: 'a', text: 'A pública é de outros; a própria é sua.', correct: true },
        { id: 'b', text: 'A pública é paga; a própria é grátis.', porque: 'Há APIs públicas grátis, como a BrasilAPI. A diferença é quem escreveu e mantém.' },
        { id: 'c', text: 'A pública não precisa de internet.', porque: 'As duas respondem pela rede. A pública só não é você quem mantém.' },
        { id: 'd', text: 'A própria só funciona no celular.', porque: 'Uma API não depende do aparelho de quem a chama. Própria quer dizer feita por você.' },
      ]},
      explanation: 'A BrasilAPI é pública: alguém a mantém para qualquer um usar. Uma própria é escrita no seu servidor, assunto do Back-end.',
    },
    {
      id: 'PI-M4-Q2', type: 'multiple_choice',
      prompt: 'Uma API pede uma chave. Por que ela não pode ir escrita no código da agenda?',
      data: { options: [
        { id: 'a', text: 'O código vai junto com a página para quem a abre.', correct: true },
        { id: 'b', text: 'Porque o TypeScript recusa textos compridos.', porque: 'O compilador aceita a chave como qualquer texto. O problema é ela chegar a todo visitante.' },
        { id: 'c', text: 'Porque a chave deixa a página mais lenta.', porque: 'A velocidade é a mesma. O risco é qualquer pessoa copiar a chave e usar a sua conta.' },
        { id: 'd', text: 'Porque a chave só vale no computador de quem a criou.', porque: 'A chave vale de qualquer lugar, e é por isso que ela não pode ficar exposta.' },
      ]},
      explanation: 'Tudo o que a aplicação do navegador tem chega a quem abrir a página, inclusive uma chave escrita no código.',
    },
    {
      id: 'PI-M4-Q3', type: 'multiple_choice',
      prompt: 'Quando a busca falha, o código faz console.log(erro) e nada mais. Quem fica sabendo?',
      data: { options: [
        { id: 'a', text: 'Só quem abrir as ferramentas do navegador.', correct: true },
        { id: 'b', text: 'Todo mundo que estiver usando a agenda.', porque: 'O console não aparece na tela. Quem usa a agenda continua vendo Carregando.' },
        { id: 'c', text: 'O examinador, por um aviso automático.', porque: 'Nenhum aviso sai do console para outra pessoa. A mensagem fica escondida ali.' },
        { id: 'd', text: 'A BrasilAPI, que recebe o erro de volta.', porque: 'O console é do navegador de quem usa. Nada volta para a API.' },
      ]},
      explanation: 'O requisito pede erro visível ao usuário: uma mensagem na tela, e não no console.',
    },
    {
      id: 'PI-M4-Q4', type: 'multiple_choice',
      prompt: 'Qual mensagem de erro serve melhor a uma família no celular?',
      data: { options: [
        { id: 'a', text: 'Não deu para buscar os feriados. Confira a internet e tente de novo.', correct: true },
        { id: 'b', text: 'TypeError: Failed to fetch', porque: 'É a mensagem do navegador, em inglês, para programadores. A família não sabe o que fazer com ela.' },
        { id: 'c', text: 'Erro 404 na linha 12.', porque: 'Número de erro e linha de código são para quem programa. Não dizem o que fazer.' },
        { id: 'd', text: 'Ocorreu um erro inesperado. Contate o administrador do sistema.', porque: 'Não diz o que falhou nem o que a pessoa pode fazer, e a família não tem administrador para chamar.' },
      ]},
      explanation: 'A mensagem boa diz o que aconteceu em palavras de gente e o que fazer em seguida.',
    },
    {
      id: 'PI-M4-Q5', type: 'multiple_choice',
      prompt: 'O que o botão Tentar de novo da tela dos feriados deve fazer?',
      data: { options: [
        { id: 'a', text: 'Chamar de novo a função que buscou.', correct: true },
        { id: 'b', text: 'Recarregar a página inteira.', porque: 'Recarregar perde o lugar onde a pessoa estava e refaz tudo. Basta buscar de novo.' },
        { id: 'c', text: 'Apagar a mensagem de erro e mais nada.', porque: 'Sem buscar de novo, a tela fica vazia e a pessoa acha que não há feriados.' },
        { id: 'd', text: 'Mandar a pessoa para a lista de eventos.', porque: 'A pessoa queria os feriados. Levá-la para outra tela não resolve o que ela pediu.' },
      ]},
      explanation: 'A mesma função da primeira busca: ela mostra Carregando, limpa o erro e busca outra vez.',
    },
    {
      id: 'PI-M4-Q6', type: 'multiple_choice',
      prompt: 'Por que a mensagem de erro da agenda leva role igual a alert?',
      data: { options: [
        { id: 'a', text: 'Para o leitor de tela anunciá-la quando aparece.', correct: true },
        { id: 'b', text: 'Para ela sair em vermelho.', porque: 'A cor é do CSS. O role diz ao leitor de tela que aquilo é um aviso.' },
        { id: 'c', text: 'Para o navegador abrir uma janela de alerta.', porque: 'O role não abre janela nenhuma. Ele só marca o texto como aviso para o leitor de tela.' },
        { id: 'd', text: 'Para o compilador conferir o texto.', porque: 'O compilador não lê o role. Quem usa é a tecnologia assistiva.' },
      ]},
      explanation: 'Sem o role, quem não enxerga a tela continua esperando, sem saber que a busca falhou.',
    },
    vf('PI-M4-Q7',
      'Quando a BrasilAPI responde 404, o fetch cai direto no catch, sem precisar conferir nada.',
      false,
      'O fetch só rejeita quando não há resposta. Com 404 a resposta chegou, e é preciso conferir resposta.ok.',
      'Sem conferir resposta.ok, o 404 passa calado e a tela mostra uma lista vazia em vez do erro.'),
  ],

  /* ── Módulo 5 — Celular e computador ── */
  'm5-teoria': [
    {
      id: 'PI-M5-Q1', type: 'multiple_choice',
      prompt: 'O que faz a meta viewport com width igual a device-width?',
      data: { options: [
        { id: 'a', text: 'Usa a largura da tela do aparelho.', correct: true },
        { id: 'b', text: 'Aumenta o tamanho de toda letra.', porque: 'Ela não mexe na letra. Ela faz a página ter a largura da tela, e aí a letra para de encolher.' },
        { id: 'c', text: 'Esconde a página no computador.', porque: 'No computador nada muda. Ela vale para o celular, que deixa de fingir ser largo.' },
        { id: 'd', text: 'Faz a página carregar mais depressa.', porque: 'A velocidade não muda. Muda a largura que o celular diz ter.' },
      ]},
      explanation: 'Sem ela, o celular finge ter uns 980 pixels e encolhe tudo. Com ela, a página tem a largura da tela.',
    },
    {
      id: 'PI-M5-Q2', type: 'multiple_choice',
      prompt: 'A consulta de mídia para celular nunca vale, nem num aparelho de 375 pixels. Qual é a causa mais provável?',
      data: { options: [
        { id: 'a', text: 'Falta a meta viewport no index.html.', correct: true },
        { id: 'b', text: 'O celular não entende CSS.', porque: 'O celular entende CSS. Sem a viewport ele só diz que a tela é larga.' },
        { id: 'c', text: 'A consulta precisa estar num arquivo próprio.', porque: 'A consulta pode morar na mesma folha. O problema é a largura que o celular informa.' },
        { id: 'd', text: 'O React desliga as consultas de mídia.', porque: 'O React não mexe no CSS. A consulta depende da largura da página.' },
      ]},
      explanation: 'Sem a viewport, o celular diz que tem 980 pixels, e max-width de 700 nunca é verdade.',
    },
    {
      id: 'PI-M5-Q3', type: 'multiple_choice',
      prompt: 'No celular, a agenda tem uma barra de rolagem de lado. O que procurar primeiro no CSS?',
      data: { options: [
        { id: 'a', text: 'Uma largura fixa maior que a tela.', correct: true },
        { id: 'b', text: 'Uma cor de fundo escura.', porque: 'Cor não muda a largura. A rolagem lateral vem de algo mais largo que a tela.' },
        { id: 'c', text: 'Um texto em negrito.', porque: 'Negrito engrossa a letra, mas não passa da largura da tela.' },
        { id: 'd', text: 'A ordem dos componentes.', porque: 'A ordem muda o que vem primeiro, e não a largura.' },
      ]},
      explanation: 'Um width de 960 pixels passa da tela do celular. max-width resolve, com uma palavra.',
    },
    {
      id: 'PI-M5-Q4', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre width: 960px e max-width: 960px no celular?',
      data: { options: [
        { id: 'a', text: 'Com max-width, a página encolhe até caber.', correct: true },
        { id: 'b', text: 'Nenhuma: os dois deixam a página com 960.', porque: 'O max-width só limita o máximo. Num celular de 375, a página fica com 375.' },
        { id: 'c', text: 'O width encolhe e o max-width estica.', porque: 'É o contrário: o width fixa a largura, e o max-width deixa encolher.' },
        { id: 'd', text: 'O max-width só vale no computador.', porque: 'Ele vale nos dois. No computador limita a 960, e no celular deixa caber.' },
      ]},
      explanation: 'No computador os dois dão 960. No celular, só o max-width deixa a página caber na tela.',
    },
    {
      id: 'PI-M5-Q5', type: 'multiple_choice',
      prompt: 'O que a regra @media com max-width igual a 700px faz na agenda?',
      data: { options: [
        { id: 'a', text: 'Aplica as regras de dentro em telas de até 700.', correct: true },
        { id: 'b', text: 'Impede a agenda de abrir em telas menores.', porque: 'Ela não impede nada. Só troca as regras quando a tela é estreita.' },
        { id: 'c', text: 'Aplica as regras só em telas maiores que 700.', porque: 'max-width quer dizer até 700. Para maiores seria min-width.' },
        { id: 'd', text: 'Faz a página ter sempre 700 de largura.', porque: 'A consulta não muda a largura da página. Ela escolhe quais regras valem.' },
      ]},
      explanation: 'Dentro dela, a lista passa a ter uma coluna e o cabeçalho empilha.',
    },
    {
      id: 'PI-M5-Q6', type: 'multiple_choice',
      prompt: 'A agenda ficou perfeita no modo celular do navegador. O que ainda pode dar errado no aparelho de verdade?',
      data: { options: [
        { id: 'a', text: 'Um botão pequeno demais para o dedo.', correct: true },
        { id: 'b', text: 'A largura, que o modo celular erra.', porque: 'A largura é justamente o que o modo celular acerta. O que ele não tem é o dedo.' },
        { id: 'c', text: 'As rotas, que mudam no celular.', porque: 'As rotas são as mesmas em qualquer aparelho.' },
        { id: 'd', text: 'Nada: o modo celular é igual ao aparelho.', porque: 'O modo celular não tem dedo, teclado subindo nem a rede do aparelho.' },
      ]},
      explanation: 'O dedo é mais grosso que o ponteiro, o teclado cobre metade da tela, e a rede do celular cai.',
    },
    vf('PI-M5-Q7',
      'Com a lista em três colunas no celular, cada cartão fica estreito demais para ler.',
      true,
      'Três colunas em 375 pixels dão cartões de pouco mais de cem pixels. Não cabe o título de um evento.',
      'É por isso que a consulta de mídia troca a grade para uma coluna na tela estreita.'),
  ],

  /* ── Módulo 6 — No ar ── */
  'm6-teoria': [
    {
      id: 'PI-M6-Q1', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre npm run dev e npm run build?',
      data: { options: [
        { id: 'a', text: 'O build confere os tipos e gera a pasta dist.', correct: true },
        { id: 'b', text: 'O dev publica e o build só testa.', porque: 'Nenhum dos dois publica. O dev serve na sua máquina; o build gera o que vai ser publicado.' },
        { id: 'c', text: 'São o mesmo comando com nomes diferentes.', porque: 'O dev não confere tipos nem gera arquivos. O build faz as duas coisas.' },
        { id: 'd', text: 'O dev só roda no celular.', porque: 'O dev roda no computador, em localhost.' },
      ]},
      explanation: 'O dev traduz na hora e não espera o TypeScript. O build roda tsc -b, recusa com erro, e gera a dist.',
    },
    {
      id: 'PI-M6-Q2', type: 'multiple_choice',
      prompt: 'A agenda abre no npm run dev, mas a esteira de publicação falha com error TS2339. Por quê?',
      data: { options: [
        { id: 'a', text: 'O dev não confere os tipos; o build confere.', correct: true },
        { id: 'b', text: 'A esteira usa outra versão do React.', porque: 'A versão vem do package.json, a mesma nos dois. O que muda é a conferência de tipos.' },
        { id: 'c', text: 'O GitHub não aceita TypeScript.', porque: 'A esteira roda o TypeScript sem problema. Ela só recusa o erro que ele aponta.' },
        { id: 'd', text: 'A internet caiu durante a esteira.', porque: 'Erro de rede não tem código TS. TS2339 é o compilador dizendo que um campo não existe.' },
      ]},
      explanation: 'O erro já estava lá; o dev só não o mostrava. Rodar o build antes de publicar o acha na sua máquina.',
    },
    {
      id: 'PI-M6-Q3', type: 'multiple_choice',
      prompt: 'Por que publicar a agenda a partir do ramo main, sem a esteira, deixa o site em branco?',
      data: { options: [
        { id: 'a', text: 'O index.html pede main.tsx, que o navegador não roda.', correct: true },
        { id: 'b', text: 'O ramo main não pode ser publicado.', porque: 'Pode, e o Pages entrega os arquivos dele. Só que eles não foram construídos.' },
        { id: 'c', text: 'Porque o ramo main não tem index.html.', porque: 'Tem. O problema é o que ele pede: um arquivo tsx, que só o build traduz.' },
        { id: 'd', text: 'Porque o Pages apaga o JavaScript.', porque: 'O Pages entrega o que recebe. O que falta é o build ter traduzido o tsx.' },
      ]},
      explanation: 'Uma aplicação com build precisa da esteira: ela roda npm run build e publica a pasta dist.',
    },
    {
      id: 'PI-M6-Q4', type: 'multiple_choice',
      prompt: 'O site publicado abre em branco, e o console mostra um 404 de /assets/index.js. Qual é a correção?',
      data: { options: [
        { id: 'a', text: 'Pôr a base com o nome do repositório no vite.config.ts.', correct: true },
        { id: 'b', text: 'Trocar o React por JavaScript puro.', porque: 'O React funciona no Pages. O 404 é de um arquivo pedido no lugar errado.' },
        { id: 'c', text: 'Apagar o repositório e publicar de novo.', porque: 'Publicar de novo com a mesma configuração dá o mesmo 404.' },
        { id: 'd', text: 'Escrever o código dentro do index.html.', porque: 'Não precisa. Basta dizer ao build que o site mora numa pasta, e não na raiz.' },
      ]},
      explanation: 'O site mora em /agenda-do-clube/. Com base certa, o build escreve os caminhos dos arquivos dentro dessa pasta.',
    },
    {
      id: 'PI-M6-Q5', type: 'multiple_choice',
      prompt: 'Uma página publicada abre em branco. Qual é o primeiro lugar a olhar?',
      data: { options: [
        { id: 'a', text: 'O console do navegador.', correct: true },
        { id: 'b', text: 'As cores do CSS.', porque: 'Uma cor errada não deixa a página inteira em branco. O motivo costuma estar no console.' },
        { id: 'c', text: 'O README do projeto.', porque: 'O README descreve o projeto, mas não diz por que esta página não abriu.' },
        { id: 'd', text: 'O histórico de commits.', porque: 'O histórico ajuda depois. Primeiro é preciso saber o que falhou, e isso o console mostra.' },
      ]},
      explanation: 'Página em branco sem mensagem quase sempre é um 404 de arquivo, e ele só aparece no console.',
    },
    {
      id: 'PI-M6-Q6', type: 'multiple_choice',
      prompt: 'O build falhou com erro de tipo. Qual destas saídas resolve de verdade?',
      data: { options: [
        { id: 'a', text: 'Consertar o campo que o erro aponta.', correct: true },
        { id: 'b', text: 'Pôr @ts-ignore em cima da linha.', porque: 'Isso cala o compilador, e o erro continua: o cartão segue sem o local.' },
        { id: 'c', text: 'Trocar o tipo da propriedade por any.', porque: 'O any desliga a conferência. O build passa e o defeito vai para o ar.' },
        { id: 'd', text: 'Publicar pelo ramo, sem o build.', porque: 'Sem o build, o site sai em branco. E o erro continua no código.' },
      ]},
      explanation: 'O erro de tipo é um defeito de verdade. Calar o compilador publica o defeito.',
    },
    vf('PI-M6-Q7',
      'Um site feito só de arquivos, depois do build, pode morar num serviço que só entrega arquivos.',
      true,
      'É justamente o caso da agenda: depois do build ela é um index.html, um JavaScript e um CSS, e não precisa de servidor próprio.',
      'O GitHub Pages entrega arquivos assim num link público, de graça.'),
  ],

  /* ── Módulo 7 — O histórico ── */
  'm7-teoria': [
    {
      id: 'PI-M7-Q1', type: 'multiple_choice',
      prompt: 'O que o requisito de vinte commits em cinco dias quer ver?',
      data: { options: [
        { id: 'a', text: 'O trabalho guardado aos poucos.', correct: true },
        { id: 'b', text: 'Que se digita depressa.', porque: 'Velocidade não aparece no histórico. Aparece o hábito de guardar o que terminou.' },
        { id: 'c', text: 'Que o projeto tem vinte arquivos.', porque: 'Commit não é arquivo. Um arquivo pode ter muitos commits, e um commit pode mexer em poucos arquivos.' },
        { id: 'd', text: 'Que o projeto levou exatamente cinco dias.', porque: 'Cinco é o mínimo de dias distintos. O que conta é o trabalho espalhado no tempo.' },
      ]},
      explanation: 'Um histórico de vários dias mostra um projeto feito em partes, guardado a cada coisa terminada.',
    },
    {
      id: 'PI-M7-Q2', type: 'multiple_choice',
      prompt: 'Depois de uma noite, o git status lista cinco arquivos mudados, cada um com um assunto. O que fazer?',
      data: { options: [
        { id: 'a', text: 'Um git add e um commit para cada arquivo.', correct: true },
        { id: 'b', text: 'git add . e um commit só.', porque: 'Junta cinco assuntos numa mensagem que não diz nenhum, e não deixa desfazer um sem os outros.' },
        { id: 'c', text: 'Apagar as mudanças e refazer amanhã.', porque: 'O trabalho está certo. Falta só guardá-lo, cada assunto no seu commit.' },
        { id: 'd', text: 'Esperar acumular mais mudanças.', porque: 'Acumular piora: mais assuntos misturados no mesmo commit.' },
      ]},
      explanation: 'Um assunto por commit deixa o histórico legível e deixa desfazer uma mudança sem levar as outras.',
    },
    {
      id: 'PI-M7-Q3', type: 'multiple_choice',
      prompt: 'Para que serve o git diff com o nome de um arquivo, antes do commit?',
      data: { options: [
        { id: 'a', text: 'Mostra o que mudou naquele arquivo.', correct: true },
        { id: 'b', text: 'Guarda o arquivo no histórico.', porque: 'Quem guarda é o commit. O diff só mostra a diferença.' },
        { id: 'c', text: 'Desfaz as mudanças do arquivo.', porque: 'O diff não desfaz nada. Ele mostra a linha que saiu e a que entrou.' },
        { id: 'd', text: 'Manda o arquivo para o GitHub.', porque: 'Quem manda é o push. O diff fica na sua máquina.' },
      ]},
      explanation: 'Ler o diff antes de escrever a mensagem é o que faz a mensagem dizer o que mudou.',
    },
    {
      id: 'PI-M7-Q4', type: 'multiple_choice',
      prompt: 'Qual destas mensagens de commit diz o que mudou?',
      data: { options: [
        { id: 'a', text: 'Põe o nome do clube no título da página', correct: true },
        { id: 'b', text: 'ajustes', porque: 'Daqui a um mês, ninguém sabe o que foi ajustado.' },
        { id: 'c', text: 'update', porque: 'Todo commit atualiza alguma coisa. A mensagem precisa dizer qual.' },
        { id: 'd', text: 'Mudanças no index.html feitas ontem à noite', porque: 'Diz o arquivo e a hora, mas não o que mudou nele.' },
      ]},
      explanation: 'A mensagem boa é uma frase que diz o que o commit fez, lida por quem não estava lá.',
    },
    {
      id: 'PI-M7-Q5', type: 'multiple_choice',
      prompt: 'Por que a pasta node_modules vai no .gitignore?',
      data: { options: [
        { id: 'a', text: 'O npm install a refaz com um comando.', correct: true },
        { id: 'b', text: 'Porque ela tem senhas do projeto.', porque: 'Senhas moram no .env. A node_modules tem as bibliotecas baixadas.' },
        { id: 'c', text: 'Porque o Git não aceita pastas.', porque: 'O Git guarda pastas normalmente. Esta só não vale a pena guardar.' },
        { id: 'd', text: 'Porque o código do projeto mora nela.', porque: 'O código do projeto mora fora dela. Ela só tem o que o npm baixou.' },
      ]},
      explanation: 'São milhares de arquivos que qualquer um refaz. Guardá-los só pesa o repositório.',
    },
    {
      id: 'PI-M7-Q6', type: 'multiple_choice',
      prompt: 'Alguém fez os vinte commits todos na véspera da entrega. O que o requisito diz disso?',
      data: { options: [
        { id: 'a', text: 'Não cumpre: são cinco dias distintos.', correct: true },
        { id: 'b', text: 'Cumpre, porque são vinte.', porque: 'O requisito pede os dois: vinte commits e cinco dias diferentes.' },
        { id: 'c', text: 'Cumpre, se as mensagens forem boas.', porque: 'Mensagens boas não trocam a exigência dos cinco dias.' },
        { id: 'd', text: 'Cumpre, se o site estiver no ar.', porque: 'A publicação é outro requisito. Este pede o histórico espalhado no tempo.' },
      ]},
      explanation: 'Vinte commits num dia mostram uma noite de digitação, e não um projeto feito aos poucos.',
    },
    vf('PI-M7-Q7',
      'A pasta dist deve ir para o repositório, porque é ela que vai para o ar.',
      false,
      'A esteira gera a dist de novo a cada publicação. Guardá-la só pesa e envelhece.',
      'A dist vai no .gitignore, como a node_modules: as duas se refazem a partir do código.'),
  ],

  /* ── Módulo 8 — README e decisões ── */
  'm8-teoria': [
    {
      id: 'PI-M8-Q1', type: 'multiple_choice',
      prompt: 'O que o README de uma aplicação web tem que o de um programa de terminal costuma não ter?',
      data: { options: [
        { id: 'a', text: 'O link em que ela está no ar.', correct: true },
        { id: 'b', text: 'O nome do projeto.', porque: 'Todo README tem o nome. O que é próprio da aplicação web é o link público.' },
        { id: 'c', text: 'Como instalar.', porque: 'Os dois dizem como instalar. O link é o que a aplicação web tem a mais.' },
        { id: 'd', text: 'A data de hoje.', porque: 'A data não ajuda quem chega. O link leva direto à aplicação.' },
      ]},
      explanation: 'Pelo link, a maioria chega à agenda sem instalar nada. Sem ele, acha que precisa construí-la.',
    },
    {
      id: 'PI-M8-Q2', type: 'multiple_choice',
      prompt: 'O que vai na seção de instalação do README da agenda?',
      data: { options: [
        { id: 'a', text: 'O Node.js e o npm install.', correct: true },
        { id: 'b', text: 'O Python e o pip install.', porque: 'A agenda é feita com Node e npm. Python é de outros projetos.' },
        { id: 'c', text: 'As cores e as letras usadas.', porque: 'Cor e letra não ajudam a instalar. A seção diz o que baixar e que comando rodar.' },
        { id: 'd', text: 'A senha do repositório.', porque: 'Senha não vai em README nenhum. O repositório pode ser público.' },
      ]},
      explanation: 'Quem baixa o repositório precisa do Node.js e de rodar npm install na pasta.',
    },
    {
      id: 'PI-M8-Q3', type: 'multiple_choice',
      prompt: 'Qual destas é uma decisão de interface registrada do jeito certo?',
      data: { options: [
        { id: 'a', text: 'Menu no topo, e não numa gaveta, para os links ficarem à vista.', correct: true },
        { id: 'b', text: 'O menu fica no topo.', porque: 'Diz o que se fez, mas não por quê nem qual era a outra opção.' },
        { id: 'c', text: 'Gosto de menus.', porque: 'Gosto não é motivo que ajude quem chega depois. Falta a alternativa e o porquê.' },
        { id: 'd', text: 'O menu usa o NavLink, que marca a tela em que se está.', porque: 'Isto é como foi feito no código, e não uma escolha de interface com alternativa.' },
      ]},
      explanation: 'A decisão tem o que se escolheu, por quê, e o que ficou de fora.',
    },
    {
      id: 'PI-M8-Q4', type: 'multiple_choice',
      prompt: 'Por que uma decisão registrada precisa dizer qual era a alternativa?',
      data: { options: [
        { id: 'a', text: 'Sem ela, é descrição, e não decisão.', correct: true },
        { id: 'b', text: 'Para o registro ficar mais comprido.', porque: 'O tamanho não importa. A alternativa mostra que houve escolha.' },
        { id: 'c', text: 'Porque o Git exige duas opções.', porque: 'O Git não lê o conteúdo. Quem precisa da alternativa é quem lê o registro.' },
        { id: 'd', text: 'Para o examinador escolher a melhor.', porque: 'A escolha já foi feita. A alternativa explica o que foi descartado.' },
      ]},
      explanation: 'Decidir é escolher entre opções. Sem a outra, quem lê não sabe que houve escolha.',
    },
    {
      id: 'PI-M8-Q5', type: 'multiple_choice',
      prompt: 'Um colega quer trocar a lista em uma coluna por rolagem de lado no celular. O que o registro de decisões evita?',
      data: { options: [
        { id: 'a', text: 'Desfazer a escolha sem saber o que ela evitava.', correct: true },
        { id: 'b', text: 'Que o colega mexa no código.', porque: 'O registro não tranca nada. Ele explica por que a escolha foi feita.' },
        { id: 'c', text: 'Que a agenda saia do ar.', porque: 'Publicação não depende do registro. Ele guarda o porquê das escolhas.' },
        { id: 'd', text: 'Que o build falhe.', porque: 'O build não lê o registro. O registro fala com pessoas.' },
      ]},
      explanation: 'O registro diz que a rolagem de lado foi considerada e descartada, e por quê: ninguém descobre que a lista continua.',
    },
    {
      id: 'PI-M8-Q6', type: 'multiple_choice',
      prompt: 'O README foi escrito no editor, mas não foi feito commit. O que aparece no repositório publicado?',
      data: { options: [
        { id: 'a', text: 'O README antigo, ou nenhum.', correct: true },
        { id: 'b', text: 'O README novo, porque já foi salvo.', porque: 'Salvar grava no disco. O repositório só recebe o que entrou num commit e foi enviado.' },
        { id: 'c', text: 'Uma mensagem de erro do GitHub.', porque: 'O GitHub não sabe do arquivo que não chegou. Ele mostra o que tem.' },
        { id: 'd', text: 'O README pela metade.', porque: 'Não há meio-termo: ou o arquivo entrou num commit, ou não entrou.' },
      ]},
      explanation: 'Salvo no disco não é guardado no histórico. É preciso git add e git commit.',
    },
    vf('PI-M8-Q7',
      'O registro de decisões de interface serve também para quem vai mexer na agenda no ano que vem.',
      true,
      'É exatamente para essa pessoa: ela não estava lá quando a escolha foi feita, e o registro conta o porquê.',
      'Quem chega depois lê o que foi decidido, por quê, e o que foi descartado, e não refaz a discussão do zero.'),
  ],

  /* ── Módulo 9 — A apresentação ── */
  'm9-teoria': [
    {
      id: 'PI-M9-Q1', type: 'multiple_choice',
      prompt: 'Nos quinze minutos, qual parte deve ter mais tempo?',
      data: { options: [
        { id: 'a', text: 'A agenda funcionando no celular.', correct: true },
        { id: 'b', text: 'A explicação de cada componente.', porque: 'Explicar cada peça come o tempo de mostrar a aplicação funcionando, que é o que o requisito pede.' },
        { id: 'c', text: 'As perguntas do examinador.', porque: 'As perguntas ficam com o que sobrar. O centro é a aplicação rodando.' },
        { id: 'd', text: 'A história de como o projeto começou.', porque: 'O objetivo cabe em uma frase. O tempo maior é da demonstração.' },
      ]},
      explanation: 'O requisito torna obrigatório o funcionamento no celular. Ele é o centro do roteiro.',
    },
    {
      id: 'PI-M9-Q2', type: 'multiple_choice',
      prompt: 'Por que vale a pena provocar o erro de propósito durante a apresentação?',
      data: { options: [
        { id: 'a', text: 'Ele só aparece se alguém o provoca.', correct: true },
        { id: 'b', text: 'Para ganhar tempo no roteiro.', porque: 'Provocar o erro leva tempo. Vale porque mostra uma peça que não se vê de outro jeito.' },
        { id: 'c', text: 'Porque a agenda sempre falha.', porque: 'Ela funciona. O erro só aparece quando a rede cai, e por isso é preciso provocá-lo.' },
        { id: 'd', text: 'Para o examinador consertar.', porque: 'O examinador avalia. Mostrar o erro é provar que a aplicação foi pensada para ele.' },
      ]},
      explanation: 'O modo avião na tela dos feriados mostra a mensagem de erro e o tentar de novo, que é o requisito 3.5.',
    },
    {
      id: 'PI-M9-Q3', type: 'multiple_choice',
      prompt: 'Qual destas é uma demonstração num aparelho celular real?',
      data: { options: [
        { id: 'a', text: 'Abrir o link público no próprio celular.', correct: true },
        { id: 'b', text: 'Estreitar a janela do navegador do computador.', porque: 'A janela estreita acerta a largura, mas não tem o dedo, o teclado nem a rede do aparelho.' },
        { id: 'c', text: 'Mostrar capturas de tela tiradas antes.', porque: 'Capturas mostram uma agenda que não roda. O requisito pede o funcionamento.' },
        { id: 'd', text: 'Projetar o código na parede.', porque: 'O código não é a aplicação funcionando. O requisito pede o celular rodando a agenda.' },
      ]},
      explanation: 'O requisito diz aparelho celular real: a agenda aberta pelo link, no aparelho, na mão.',
    },
    {
      id: 'PI-M9-Q4', type: 'multiple_choice',
      prompt: 'A internet da sala cai bem na hora da apresentação. Qual é o melhor plano B?',
      data: { options: [
        { id: 'a', text: 'Usar os dados móveis do celular.', correct: true },
        { id: 'b', text: 'Mostrar fotos da agenda.', porque: 'Fotos não mostram nada funcionando, que é o que o requisito pede.' },
        { id: 'c', text: 'Contar como a agenda seria.', porque: 'Contar não é demonstrar. O examinador precisa ver a agenda rodando.' },
        { id: 'd', text: 'Pular a parte do celular.', porque: 'A parte do celular é obrigatória. Sem ela, o requisito não se cumpre.' },
      ]},
      explanation: 'O plano B é outra rede: os dados do próprio celular, ou a rede de outra pessoa, testada antes no mesmo lugar.',
    },
    {
      id: 'PI-M9-Q5', type: 'multiple_choice',
      prompt: 'Um roteiro dá dez minutos para explicar o código e dois para mostrar a agenda. O que há de errado?',
      data: { options: [
        { id: 'a', text: 'A aplicação mal aparece.', correct: true },
        { id: 'b', text: 'Passa dos quinze minutos.', porque: 'Doze minutos cabem em quinze. O problema é a proporção.' },
        { id: 'c', text: 'Falta tempo para o código.', porque: 'O código já tem dez minutos. O que falta é a aplicação funcionando.' },
        { id: 'd', text: 'Nada: o código é o mais importante.', porque: 'O requisito pede o funcionamento no celular. O código é o meio.' },
      ]},
      explanation: 'A demonstração leva a maior fatia. Explicar muito e mostrar pouco é apresentar uma aplicação que não se viu.',
    },
    {
      id: 'PI-M9-Q6', type: 'multiple_choice',
      prompt: 'Como mostrar uma decisão de interface durante a apresentação?',
      data: { options: [
        { id: 'a', text: 'Na tela em que ela aparece.', correct: true },
        { id: 'b', text: 'Lendo o DECISOES.md inteiro.', porque: 'Ler o arquivo todo gasta o tempo. Mostrar a tela deixa a decisão à vista.' },
        { id: 'c', text: 'Pedindo ao examinador que adivinhe.', porque: 'O examinador quer ouvir o porquê de quem decidiu.' },
        { id: 'd', text: 'Deixando para depois da apresentação.', porque: 'As decisões são parte do roteiro, dentro dos quinze minutos.' },
      ]},
      explanation: 'A lista em uma coluna se mostra no celular, com uma frase dizendo por que e o que foi descartado.',
    },
    vf('PI-M9-Q7',
      'As perguntas do examinador são obrigatórias no roteiro, com tempo próprio.',
      false,
      'As perguntas ficam com o que sobrar dos quinze minutos. As partes obrigatórias são o objetivo, o celular e as decisões.',
      'O roteiro dá tempo às três partes que o requisito pede, e o examinador pergunta no tempo que restar.'),
  ],
};
