/**
 * O passo a passo de cada verificação do computador simulado.
 *
 * A moldura oferece isto depois de um tempo sem ninguém concluir nada. Aqui ele
 * pesa mais do que nos laboratórios de escrever código: quem trava numa
 * instalação não trava por não saber o que quer, trava porque a tela seguinte
 * não é a que esperava — e ninguém adivinha que a caixa que faltou marcar está
 * embaixo, em letra miúda, na primeira tela.
 *
 * O de `rodouNoPrompt` separa os dois motivos de "não é reconhecido", que é a
 * única mensagem que o Windows dá para duas causas bem diferentes: não instalou,
 * ou instalou sem PATH. Ler a mesma frase sem saber disso é onde a pessoa
 * desiste.
 */
export const PASSOS_DO_AMBIENTE: Record<string, string[]> = {
  baixouDoSiteOficial: [
    'Abra o Navegador Web na barra de tarefas, embaixo.',
    'A busca traz três resultados. Dois prometem "grátis", "completo" ou "ativador" — esses juntam o instalador com outras coisas.',
    'O endereço do Python é python.org, e só ele. Repare no endereço em cinza acima de cada resultado: é ali que se confere, e não no título.',
    'Na página, clique em Download Python e espere a barra encher.',
  ],
  instalouOPython: [
    'Terminado o download, clique em Abrir — o instalador aparece na barra de tarefas.',
    'A primeira tela tem dois botões grandes e duas caixinhas embaixo. Leia as caixinhas antes de clicar em Install Now.',
    '"Add python.exe to PATH" vem desmarcada. É ela que faz o prompt entender a palavra `python` depois; sem ela o Python é instalado e mesmo assim não é encontrado.',
    'O Windows vai pedir permissão — é o Controle de Conta de Usuário, e responder Sim é o normal para um instalador que você mesmo baixou de um site oficial.',
  ],
  salvouOArquivoPy: [
    'Abra o Bloco de Notas e escreva o programa da lição.',
    'Em Arquivo, escolha Salvar como.',
    'Escreva o nome terminando em .py — programa.py.',
    'Agora a parte que engana: o campo Tipo. Deixado em "Documentos de texto (*.txt)", o Bloco de Notas acrescenta .txt ao que você escreveu, e o arquivo vira programa.py.txt.',
    'Troque o Tipo para "Todos os arquivos (*.*)". A linha embaixo do diálogo mostra o nome com que ele vai ser salvo de verdade.',
  ],
  rodouNoPrompt: [
    'Abra o Prompt de Comando na barra de tarefas.',
    'Ele começa na sua pasta de usuário, e o arquivo está em Documentos. Escreva `cd Documents` e tecle Enter.',
    '`dir` lista o que há na pasta — é assim que se confere o nome verdadeiro do arquivo, com extensão e tudo.',
    'Escreva `python programa.py` e tecle Enter.',
    'Se aparecer "\'python\' não é reconhecido", são dois motivos possíveis: ou o Python não foi instalado, ou foi instalado sem marcar o PATH. Abra o instalador de novo e use Modify para marcar — ou chame por `py programa.py`, que é o lançador e funciona mesmo sem PATH.',
    'Se aparecer "No such file or directory", o arquivo tem outro nome ou você está noutra pasta. O `dir` resolve as duas dúvidas.',
  ],
};
