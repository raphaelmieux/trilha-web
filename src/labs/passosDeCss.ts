/**
 * O passo a passo de cada verificação de CSS.
 *
 * A moldura oferece isto depois de um tempo sem ninguém concluir nada. É
 * convite, não despejo: quem está achando sozinho tem o direito de achar
 * sozinho, e por isso o texto diz o caminho sem entregar a linha pronta.
 *
 * Toda verificação tem a sua — `veredas.test.ts` cobra o par: modelo vazio
 * pede passos completos, porque tirar o andaime só é honesto se o caminho
 * ficar.
 */
export const PASSOS_DE_CSS: Record<string, string[]> = {
  seletorElemento: [
    'Olhe a página no arquivo pagina.html, ao lado. Escolha uma tag que existe lá: body, h1, p.',
    'No arquivo de estilo, escreva o nome dela sem ponto e sem cerquilha, e abra chaves: p {',
    'Dentro das chaves, escreva uma propriedade e um valor, terminando com ponto e vírgula.',
    'Feche as chaves. A regra vale para todos os elementos daquela tag.',
  ],
  seletorClasse: [
    'Procure em pagina.html um class= — o nome que vem depois dele é a classe.',
    'No estilo, escreva um ponto colado no nome: .destaque',
    'Abra chaves, escreva o que quer mudar, feche.',
    'Classe serve para vários elementos ao mesmo tempo. Se nada mudou, confira se copiou o nome exatamente como está na página.',
  ],
  seletorId: [
    'Procure em pagina.html um id= — o nome que vem depois dele é o identificador.',
    'No estilo, escreva uma cerquilha colada no nome: #topo',
    'Abra chaves, escreva o que quer mudar, feche.',
    'Identificador é de um elemento só na página. É por isso que ele vence a classe quando os dois disputam.',
  ],
  cor: [
    'Escolha uma regra que já exista no seu arquivo, ou escreva uma nova.',
    'Dentro das chaves, escreva color: e o valor.',
    'O valor pode ser um nome (crimson), um código de seis dígitos (#1B4D3E) ou rgb(27, 77, 62).',
    'Se não mudou nada, leia a palavra de novo: color tem uma letra o. colr some sem avisar.',
  ],
  corDeFundo: [
    'Escolha o elemento cuja caixa você quer pintar por trás.',
    'Escreva background-color: e o valor, do mesmo jeito que a cor do texto.',
    'Cuidado com o contraste: fundo escuro pede texto claro, e vice-versa. Texto que não se lê é pior do que texto sem cor.',
  ],
  tipografia: [
    'Numa regra ampla, como a de body, escreva font-family:',
    'Depois dela vem a fonte desejada e, separada por vírgula, uma de reserva: Georgia, serif.',
    'A reserva existe porque a fonte pode não estar no computador de quem lê. Sem ela, o navegador escolhe sozinho.',
    'Fonte com nome de duas palavras vai entre aspas: "Times New Roman", serif.',
  ],
  tamanhoDeTexto: [
    'Escolha a regra do texto que quer mudar.',
    'Escreva font-size: e a medida.',
    'Para o corpo do texto, algo por volta de 1rem. Para um título, mais.',
  ],
  unidadeRelativa: [
    'Procure no seu arquivo uma medida escrita em px.',
    'Troque uma delas por rem, em ou %.',
    'rem parte do tamanho de letra do navegador: quem aumenta a letra por enxergar mal vê a sua página crescer junto. px não cresce.',
    'Para largura, % costuma ser melhor: 80% ocupa oitenta por cento do espaço disponível, seja qual for a tela.',
  ],
  margem: [
    'Margem é o espaço de fora da caixa, o que a afasta das vizinhas.',
    'Escreva margin: e uma medida — margin: 1rem afasta pelos quatro lados.',
    'Para um lado só, use margin-top, margin-bottom, margin-left ou margin-right.',
    'Dois valores valem "em cima e embaixo" e "nos lados": margin: 1rem 2rem.',
  ],
  espacamento: [
    'Espaçamento interno é o espaço de dentro, entre a borda da caixa e o conteúdo.',
    'Escreva padding: e uma medida.',
    'Repare na diferença olhando a prévia: margem afasta a caixa das outras; padding afasta o texto da borda dela.',
  ],
  borda: [
    'Escreva border: com três coisas, nesta ordem: espessura, estilo e cor.',
    'Exemplo da forma: 2px solid seguido da cor que você escolher.',
    'O estilo é obrigatório. Sem solid, dashed ou dotted, a borda não aparece nem tendo espessura.',
    'Para cantos arredondados, acrescente border-radius: e uma medida.',
  ],
  flex: [
    'Escolha a caixa que contém as peças a alinhar — a que envolve, não as de dentro.',
    'Nela, escreva display: flex. Isso põe as peças lado a lado.',
    'Agora diga como distribuí-las: justify-content trata do sentido da linha, align-items do outro.',
    'gap: acrescenta espaço entre as peças sem margem em nenhuma delas.',
    'Só display: flex não alinha nada — ele liga o modo. Quem dispõe é a propriedade seguinte.',
  ],
  grid: [
    'Escolha a caixa que contém as peças, como no flex.',
    'Escreva display: grid.',
    'Diga as colunas em grid-template-columns. Duas iguais: 1fr 1fr.',
    'fr é uma fração do espaço que sobrou. 2fr 1fr faz a primeira coluna com o dobro da segunda.',
    'gap: também vale aqui, e separa linhas e colunas.',
  ],
  consultaDeMidia: [
    'No fim do arquivo, escreva @media (max-width: 600px) e abra chaves.',
    'Dentro delas, repita os seletores que precisam mudar em tela pequena, com os novos valores.',
    'Só o que está dentro muda, e só quando a tela for daquele tamanho para baixo. O resto do arquivo continua valendo.',
    'Feche as chaves da regra e depois as da consulta — são duas.',
    'Para conferir, estreite a janela do navegador: a mudança acontece ao cruzar a largura que você escreveu.',
  ],
};
