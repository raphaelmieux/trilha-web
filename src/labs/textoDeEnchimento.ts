/*
  O `=rand()` do Word: escrever isso sozinho num parágrafo e apertar Enter
  enche o documento de texto de exemplo.

  Existe no Word de verdade, e serve a uma coisa séria — testar estilo,
  coluna e quebra de página sem digitar meia página de nada. Aqui ele é
  também o segredo do Texto de Enchimento: quem pediu ao programa que
  escrevesse sozinho descobriu que ele sabe.

  As frases são nossas, e falam do próprio Word: o texto de exemplo do
  programa de verdade é dele, e copiá-lo seria pôr na plataforma o que a
  licença dela não comporta.

  `=rand(p;f)` pede p parágrafos de f frases — com ponto e vírgula, que é o
  separador do Office em português, ou com vírgula, que é o do inglês e é o
  que aparece em todo tutorial. Sem números, são cinco de três, como no Word.
*/

const FRASES = [
  'Os estilos guardam a aparência de cada parte do documento, e mudar um estilo muda todos os parágrafos que o usam.',
  'O sumário se monta a partir dos títulos, por isso vale a pena marcar cada título com o estilo certo.',
  'Na guia Inserir há tabelas, imagens, formas e cabeçalhos, tudo pronto para ajustar ao seu documento.',
  'Para mudar a aparência do texto, selecione o que quer mudar e escolha uma opção na guia Início.',
  'O controle de alterações mostra o que cada pessoa mudou, e cada mudança pode ser aceita ou rejeitada.',
  'Um parágrafo termina quando se aperta a tecla de nova linha, e a quebra de linha manual continua o mesmo parágrafo.',
  'As margens e a orientação da página ficam na guia Layout, junto do tamanho do papel.',
  'Salvar com frequência evita perder trabalho, e um nome com data ajuda a achar a versão certa depois.',
  'A legenda numerada pelo próprio programa se corrige sozinha quando uma figura muda de lugar.',
  'O número da página no rodapé é um campo, e cada folha mostra o seu sem ninguém digitar nada.',
];

/** O texto que se pede, e quantos parágrafos e frases ele pede — ou nada, se não for pedido. */
export function pedidoDeEnchimento(texto: string): { paragrafos: number; frases: number } | null {
  const m = /^\s*=rand\(\s*(\d+)?\s*(?:[;,]\s*(\d+)\s*)?\)\s*$/i.exec(texto);
  if (!m) return null;
  /* O Word aceita números grandes e escreve páginas e páginas; aqui há um
     teto, porque um `=rand(999)` travaria a folha sem ensinar nada a mais. */
  const limitar = (v: string | undefined, padrao: number, teto: number) =>
    Math.min(teto, Math.max(1, v === undefined ? padrao : Number(v)));
  return { paragrafos: limitar(m[1], 5, 20), frases: limitar(m[2], 3, 10) };
}

/** Os parágrafos de exemplo, separados por quebra de parágrafo (`\n`). */
export function textoDeEnchimento(paragrafos: number, frases: number): string {
  let i = 0;
  const um = () => FRASES[i++ % FRASES.length];
  return Array.from({ length: paragrafos }, () => Array.from({ length: frases }, um).join(' ')).join('\n');
}
