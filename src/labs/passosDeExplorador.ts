import { RELATORIO, SUMIU } from './discoDoClube';

/**
 * O passo a passo de cada verificação do Explorador.
 *
 * A moldura oferece isto depois de um tempo sem ninguém concluir nada, e aqui
 * ele pesa por um motivo próprio: no Explorador quase tudo mora em dois
 * lugares ao mesmo tempo — na barra de comandos e no botão direito —, e quem
 * não acha num não sabe que existe no outro. Pior, três das opções desta vereda
 * ficam atrás de um menu que ninguém abre por conta própria: Exibir, Abrir com
 * e Versões anteriores.
 *
 * Por isso cada passo diz **onde clicar**, e não "use a opção de compactar".
 * Ninguém adivinha que a extensão se liga no menu Exibir, que o histórico de
 * versões está no botão direito, ou que ejetar fica na barra de tarefas.
 */
export const PASSOS_DO_EXPLORADOR: Record<string, string[]> = {
  /* ── A hierarquia (requisito 4.1) ── */
  tresNiveis: [
    'No painel da esquerda, clique em Documentos.',
    'Clique em "Novo" e dê o nome do projeto — por exemplo, Acampamento 2026.',
    'Dê dois cliques nela para entrar, e crie outra pasta dentro.',
    'Entre nessa segunda e crie a terceira. Agora são três níveis: projeto › assunto › detalhe.',
    'Os nomes são seus. O que se cobra é que digam o que guardam — "Nova pasta" não diz.',
  ],
  guardouOProjeto: [
    'Volte à Área de Trabalho pelo painel da esquerda.',
    'Clique num arquivo e depois na tesoura (Recortar) — recortar é o que move.',
    'Entre na pasta certa da sua estrutura e clique na prancheta (Colar).',
    'Repita com mais três. Divida entre pelo menos duas pastas: se tudo vai para a mesma, a hierarquia não está guardando nada.',
    'No computador dá para arrastar o arquivo até a pasta; com Ctrl apertado, copia em vez de mover.',
  ],

  /* ── O pacote (requisito 4.5) ── */
  compactou: [
    'Entre em Documentos e clique uma vez em "Fotos do Acampamento".',
    'Na barra de comandos, clique em "Compactar".',
    'Aparece um arquivo novo com a extensão .zip, e bem menor que a soma das fotos.',
    'Repare que a pasta original continua lá: compactar copia, não move. Quem compacta para liberar espaço e não apaga o original acabou de ocupar mais.',
  ],
  extraiu: [
    'Clique uma vez no arquivo .zip que você criou.',
    'Clique em "Extrair", na barra de comandos.',
    'O conteúdo sai na mesma pasta, igualzinho ao que entrou — zip não perde nada.',
  ],

  /* ── Salvar e excluir (requisitos 2 e 3) ── */
  salvou: [
    'Na Área de Trabalho, dê dois cliques em "o que levar.txt".',
    'O Bloco de Notas abre com o texto. Escreva mais alguma coisa nele.',
    'Clique em "Salvar" (ou Ctrl+S). O nome continua o mesmo; o conteúdo é outro.',
  ],
  salvouComo: [
    'Com o texto aberto e já mudado, clique em "Salvar como".',
    'Escreva outro nome e confirme.',
    'Agora são dois arquivos. Abra o de antes: ele continua com o texto velho — é essa a diferença entre salvar e salvar como.',
  ],
  restaurouDaLixeira: [
    'Clique uma vez num arquivo que você não precise e clique na lixeirinha (Excluir).',
    'No painel da esquerda, clique em Lixeira: ele está lá, com a pasta de onde saiu.',
    'Clique nele e em "Restaurar". Ele volta para a pasta de origem, e não para onde você está.',
  ],
  esvaziou: [
    'Exclua alguma coisa, para a Lixeira não estar vazia.',
    'Entre na Lixeira e clique em "Esvaziar Lixeira".',
    'Agora sim não volta mais pelo Explorador — o que sobra no disco só se alcança com programa de recuperação, e nem sempre.',
  ],

  /* ── Achar (requisitos 4.2, 4.3 e 4.4) ── */
  ordenou: [
    'Clique no título da coluna "Nome". Clicar de novo inverte a ordem.',
    'Clique em "Data de modificação" e depois em "Tamanho".',
    'Em tela estreita as colunas do meio somem: use o menu "Classificar", na barra de comandos.',
  ],
  buscouComFiltro: [
    'Clique na caixa "Pesquisar", à direita da barra de endereço.',
    'Escolha um tipo — Imagem, Documento, Áudio — e um período.',
    'Os dois filtros juntos: é o caso de quem lembra que era uma foto do começo do ano e não lembra o nome.',
    'Se a busca não achar nada, afrouxe o período antes de mudar o tipo.',
  ],
  extensoes: [
    'Na barra de comandos, clique em "Exibir".',
    'Marque "Extensões de nomes de arquivos".',
    'Os nomes ganham o ponto e as letras do fim. Com a extensão escondida, um arquivo chamado "foto.jpg.exe" aparece como "foto.jpg" — e não é foto nenhuma.',
  ],
  programas: [
    'Clique com o botão direito num arquivo e escolha "Abrir com".',
    'A lista mostra os programas do computador. Escolha o que abre aquele tipo.',
    'Faça isso com quatro extensões diferentes — .jpg, .txt, .pdf, .docx, .mp3.',
    'Escolher errado abre mesmo assim, e o que aparece é lixo: é o que acontece quando a associação está trocada.',
  ],

  /* ── O padrão de nomeação (requisito 5) ── */
  padrao: [
    'Clique uma vez num arquivo da Área de Trabalho e clique no lápis (Renomear), ou aperte F2.',
    'Escreva no seu padrão. Um que funciona: assunto-AAAA-MM-DD-vNN — por exemplo, ata-2026-02-16-v01.docx.',
    'A data vai de ano para dia justamente para a ordem alfabética virar ordem de tempo sozinha.',
    'Repita nos dez. O padrão é seu, mas precisa ser o mesmo nos dez: dois padrões não ordenam.',
    'Guarde a extensão no fim. Trocá-la não converte o arquivo — só faz o nome mentir sobre o que ele é.',
  ],

  /* ── O dispositivo externo (requisito 4.6) ── */
  copiouParaOPendrive: [
    'Na barra de tarefas, clique no ícone do pen drive para espetá-lo.',
    'Ele aparece no painel da esquerda, como mais uma raiz.',
    'Copie três arquivos e cole dentro dele.',
  ],
  removeuComSeguranca: [
    'Com os arquivos já copiados, clique em "Ejetar", na barra de comandos.',
    'Só depois do aviso de que é seguro é que o sistema terminou de gravar.',
    'Puxar antes disso deixa o arquivo pela metade do outro lado: ele aparece na lista, com o nome certo, e não abre.',
    'Se algum chegou quebrado, espete de novo, copie por cima e ejete direito.',
  ],

  /* ── Restaurar (requisito 8) ── */
  restaurouDoBackup: [
    'No painel da esquerda, clique em "Cópia de Segurança (D:)".',
    `Ache ${SUMIU} e clique nele.`,
    'Clique em "Copiar" — e não na tesoura.',
    'Vá até Documentos e cole. Mover traria o arquivo de volta e deixaria você sem cópia de segurança dele, que é o arquivo que você já perdeu uma vez.',
  ],
  voltouAVersao: [
    `Em Documentos, clique com o botão direito em ${RELATORIO}.`,
    'Escolha "Versões anteriores". A lista diz o que cada uma tinha e de quando é.',
    'Escolha a que tem o relatório inteiro e clique em "Restaurar".',
    'Esta lista existe porque o sistema guardou sozinho — e é por isso que ela só ajuda quem tinha o salvamento automático ligado antes de precisar.',
  ],
};
