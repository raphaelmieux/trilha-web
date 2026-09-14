import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC-ES001 Arquivos e Armazenamento.
 *
 * ── O que elas medem ──────────────────────────────────────────────────────
 * A definição vale uma vez. Depois dela vêm consequência, discriminação e
 * diagnóstico — e nesta vereda a discriminação é quase toda a matéria, porque
 * ela é feita de pares que se parecem e fazem coisas opostas: salvar e salvar
 * como, atalho e cópia, sincronizar e fazer backup, zip e jpg, excluir e
 * apagar.
 *
 * ── E o diagnóstico aqui é sempre o mesmo formato ─────────────────────────
 * Nada nesta matéria estoura. O arquivo salvo por cima abre normalmente, com o
 * conteúdo errado; o pen drive puxado cedo demais parece ter copiado; a
 * extensão escondida mostra um nome que não é o nome; a cópia de segurança
 * nunca testada tem o tamanho certo. Toda pergunta de diagnóstico daqui
 * descreve um sintoma que **parece** funcionamento normal, porque é assim que
 * a perda de arquivo chega.
 *
 * Toda alternativa errada diz por que está errada, no campo porque, e a certa
 * não carrega motivo nenhum. E nada de crase nem de asterisco: a questão vai
 * para o QuestionRenderer, que imprime texto puro, e a marcação sairia na tela
 * como marcação.
 */

export const QUESTOES_DE_ARQUIVOS: Record<string, Question[]> = {
  /* ──────────────────────────────────────────────────────────────────────
     Módulo 1 — O arquivo e a pasta
     ────────────────────────────────────────────────────────────────────── */
  'm1-teoria': [
    {
      id: 'ES1-M1-Q1', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre um arquivo e uma pasta?',
      data: { options: [
        { id: 'a', text: 'A pasta guarda arquivos e outras pastas; o arquivo guarda conteúdo.', correct: true },
        { id: 'b', text: 'A pasta é do sistema e o arquivo é do usuário.', porque: 'Você cria pastas o tempo todo, e o sistema tem arquivos próprios. A origem não separa os dois.' },
        { id: 'c', text: 'A pasta ocupa espaço e o arquivo não.', porque: 'É quase o contrário: uma pasta vazia ocupa praticamente nada, porque não há nada dentro dela.' },
        { id: 'd', text: 'A pasta pode ser aberta e o arquivo só pode ser copiado.', porque: 'Arquivo se abre no programa dele. O que muda é o que aparece ao abrir: conteúdo num caso, uma lista no outro.' },
      ]},
      explanation: 'A pasta é a gaveta, e não o que está dentro dela. É por isso que pasta dentro de pasta faz sentido, e arquivo dentro de arquivo não.',
    },
    {
      id: 'ES1-M1-Q2', type: 'multiple_choice',
      prompt: 'Para que serve a extensão no nome de um arquivo?',
      data: { options: [
        { id: 'a', text: 'Para o sistema saber qual programa abre aquele arquivo.', correct: true },
        { id: 'b', text: 'Para ordenar os arquivos dentro da pasta.', porque: 'A ordem sai da coluna escolhida na janela. A extensão só entra nela quando você ordena por tipo.' },
        { id: 'c', text: 'Para dizer o tamanho que o arquivo ocupa.', porque: 'O tamanho é uma propriedade à parte, e dois arquivos com a mesma extensão podem ter tamanhos muito diferentes.' },
        { id: 'd', text: 'Para impedir que o arquivo seja renomeado.', porque: 'Renomear é livre, inclusive a extensão — e é justamente por isso que trocá-la por engano causa problema.' },
      ]},
      explanation: 'É a extensão que decide o que acontece nos dois cliques. Sem ela, o sistema pergunta com que programa abrir.',
    },
    {
      id: 'ES1-M1-Q3', type: 'scenario',
      prompt: 'Você renomeou um documento do Word de relatorio.docx para relatorio.pdf. O leitor de PDF abre e diz que o arquivo está danificado. O que aconteceu?',
      data: { scenarios: [
        { id: 'a', text: 'Nada foi convertido: o conteúdo continua sendo do Word.', correct: true },
        { id: 'b', text: 'A conversão falhou no meio e corrompeu o arquivo.', porque: 'Não houve conversão nenhuma para falhar. Renomear só troca o nome; o conteúdo não é tocado.' },
        { id: 'c', text: 'O arquivo precisa ser reaberto no Word para completar a troca.', porque: 'Não há troca a completar. Converter é uma ação do programa, com Salvar como ou Exportar.' },
        { id: 'd', text: 'A extensão está certa e o problema é o leitor de PDF.', porque: 'O leitor está certo em recusar: ele leu o conteúdo e não encontrou um PDF ali dentro.' },
      ]},
      explanation: 'A extensão é uma promessa sobre o conteúdo. Trocá-la não muda o conteúdo — faz o nome mentir, e quem descobre a mentira é o programa que tenta abrir.',
    },
    {
      id: 'ES1-M1-Q4', type: 'multiple_choice',
      prompt: 'Em que ordem se lê um caminho como C:\\Clube\\2026\\ata.docx?',
      data: { options: [
        { id: 'a', text: 'Do disco para o arquivo, entrando uma pasta por vez.', correct: true },
        { id: 'b', text: 'Do arquivo para o disco, que é como o sistema procura.', porque: 'O caminho se escreve e se lê do mais geral para o mais específico. Subir pelos pais é outra operação.' },
        { id: 'c', text: 'Da pasta mais recente para a mais antiga.', porque: 'Data não tem nada a ver com caminho: ele descreve onde a coisa está, e não quando foi feita.' },
        { id: 'd', text: 'Não há ordem: as partes podem ser escritas em qualquer sequência.', porque: 'A ordem é o que faz o caminho funcionar. Trocar duas partes de lugar aponta para uma pasta que não existe.' },
      ]},
      explanation: 'Cada barra é uma pasta a mais de profundidade. O último pedaço é o arquivo, e tudo antes dele é onde ele está.',
    },
    {
      id: 'ES1-M1-Q5', type: 'true_false',
      prompt: 'Dois arquivos com exatamente o mesmo nome podem existir no mesmo computador.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Podem, desde que estejam em pastas diferentes: o que identifica um arquivo é o caminho inteiro, e não só o nome.' },
      ]},
      explanation: 'O que não pode é dois irmãos com o mesmo nome na mesma pasta. Por isso o sistema oferece renomear quando você copia um arquivo para onde já há outro igual.',
    },
    {
      id: 'ES1-M1-Q6', type: 'scenario',
      prompt: 'Há um atalho de 2 KB na Área de Trabalho apontando para uma pasta de 184 MB. Você apaga o atalho. O que acontece com a pasta?',
      data: { scenarios: [
        { id: 'a', text: 'Nada: ela continua onde estava.', correct: true },
        { id: 'b', text: 'Ela vai para a Lixeira junto com o atalho.', porque: 'O atalho não contém a pasta: ele guarda o endereço dela. Apagar o bilhete não apaga o lugar.' },
        { id: 'c', text: 'Ela perde 2 KB, que era a parte guardada no atalho.', porque: 'Os 2 KB são do próprio atalho, e não um pedaço da pasta. O conteúdo está inteiro do outro lado.' },
        { id: 'd', text: 'Ela fica inacessível até que outro atalho seja criado.', porque: 'A pasta continua acessível pelo caminho dela. O atalho era um caminho a mais, e não o único.' },
      ]},
      explanation: 'O contrário é que dói: apagar o original deixa o atalho na tela, com o ícone certo, abrindo para um erro.',
    },
    {
      id: 'ES1-M1-Q7', type: 'matching',
      prompt: 'Ligue cada extensão ao que ela guarda.',
      data: { pairs: [
        { left: '.docx', right: 'Documento de texto formatado' },
        { left: '.xlsx', right: 'Planilha com fórmulas' },
        { left: '.jpg', right: 'Foto' },
        { left: '.mp3', right: 'Som' },
      ]},
      explanation: 'Saber a extensão de cor é o que permite ler uma pasta sem abrir nada — e é o que faz um arquivo com a extensão errada saltar aos olhos.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 2 — O que está dentro do nome
     ────────────────────────────────────────────────────────────────────── */
  'm2-teoria': [
    {
      id: 'ES1-M2-Q1', type: 'multiple_choice',
      prompt: 'O que torna um formato de arquivo aberto?',
      data: { options: [
        { id: 'a', text: 'A receita dele é publicada, e qualquer um pode escrever um programa que o leia.', correct: true },
        { id: 'b', text: 'O arquivo pode ser aberto sem senha.', porque: 'Senha é proteção de um arquivo específico. Formato aberto fala do tipo, e não daquele arquivo.' },
        { id: 'c', text: 'O programa que o abre é gratuito.', porque: 'Preço e formato são coisas separadas: há programa pago que grava formato aberto e programa gratuito que grava proprietário.' },
        { id: 'd', text: 'Ele pode ser aberto no Bloco de Notas.', porque: 'Isso vale para formatos de texto puro. O PNG é aberto e não faz sentido nenhum no Bloco de Notas.' },
      ]},
      explanation: 'O que se abre é a especificação, e não o arquivo. É ela que permite a um segundo programa ler o que o primeiro gravou.',
    },
    {
      id: 'ES1-M2-Q2', type: 'multiple_choice',
      prompt: 'Por que guardar a ata do clube em formato aberto importa mais daqui a dez anos do que hoje?',
      data: { options: [
        { id: 'a', text: 'Porque o programa que a criou pode não existir mais.', correct: true },
        { id: 'b', text: 'Porque os arquivos antigos ocupam mais espaço com o tempo.', porque: 'Arquivo parado não cresce. O tamanho dele é o mesmo daqui a dez anos.' },
        { id: 'c', text: 'Porque formatos abertos comprimem melhor.', porque: 'Compressão é outra propriedade, e não acompanha ser aberto ou proprietário.' },
        { id: 'd', text: 'Porque o computador atual vai ficar lento e não abrirá arquivos grandes.', porque: 'O problema não é o computador conseguir abrir: é haver um programa que entenda o formato.' },
      ]},
      explanation: 'A ata dura mais do que a diretoria que a escreveu, e mais do que a licença do programa. É essa distância que o formato aberto atravessa.',
    },
    {
      id: 'ES1-M2-Q3', type: 'multiple_choice',
      prompt: 'Qual é a razão mais comum, no dia a dia, para compactar arquivos?',
      data: { options: [
        { id: 'a', text: 'Juntar vários num pacote só.', correct: true },
        { id: 'b', text: 'Proteger o conteúdo contra cópia.', porque: 'O zip comum não protege nada: qualquer um descompacta. Senha é um recurso à parte, e nem sempre usado.' },
        { id: 'c', text: 'Converter os arquivos para um formato único.', porque: 'Nada é convertido: cada arquivo sai do pacote exatamente como entrou, com a extensão que tinha.' },
        { id: 'd', text: 'Fazer os arquivos abrirem mais rápido depois.', porque: 'É o contrário: para usar o arquivo é preciso descompactar antes, o que leva um tempo a mais.' },
      ]},
      explanation: 'Encolher é bom e nem sempre é muito. Anexar um arquivo em vez de trinta é o que faz o zip aparecer todo dia.',
    },
    {
      id: 'ES1-M2-Q4', type: 'true_false',
      prompt: 'Descompactar um arquivo zip devolve os originais exatamente como eram.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O zip é compactação sem perda: o que sai é byte por byte igual ao que entrou. Quem não devolve igual é o jpg e o mp3.' },
      ]},
      explanation: 'É essa garantia que permite compactar um documento e confiar nele do outro lado. Se o zip perdesse conteúdo, ninguém o usaria para enviar trabalho.',
    },
    {
      id: 'ES1-M2-Q5', type: 'scenario',
      prompt: 'Uma foto foi aberta, salva em jpg, enviada, aberta de novo e salva mais três vezes. Agora ela tem manchas quadradas em volta das letras. Ninguém a editou. Por quê?',
      data: { scenarios: [
        { id: 'a', text: 'Cada salvamento em jpg joga fora mais um pouco do conteúdo.', correct: true },
        { id: 'b', text: 'O arquivo foi corrompido por um dos envios.', porque: 'Arquivo corrompido não abre, ou abre pela metade. Aqui ele abre inteiro, só com a qualidade pior.' },
        { id: 'c', text: 'A foto foi redimensionada automaticamente pelo programa.', porque: 'Redimensionar deixaria a imagem menor ou borrada por igual, e não com blocos quadrados junto às bordas de contraste.' },
        { id: 'd', text: 'É um defeito da tela, e a foto está intacta.', porque: 'Abrir a mesma foto noutro aparelho mostra as mesmas manchas: elas estão gravadas no arquivo.' },
      ]},
      explanation: 'Compactação com perda não é um evento único: ela acontece de novo a cada salvamento, e o que foi jogado fora não volta para ser jogado fora outra vez.',
    },
    {
      id: 'ES1-M2-Q6', type: 'scenario',
      prompt: 'Você compactou a pasta do acampamento para liberar espaço no disco. O espaço livre não aumentou. O que faltou?',
      data: { scenarios: [
        { id: 'a', text: 'Apagar a pasta original: o zip é uma cópia.', correct: true },
        { id: 'b', text: 'Escolher a taxa de compressão máxima.', porque: 'Mudaria o tamanho do zip em alguns por cento. O espaço não aumentou nada, e isso não é questão de taxa.' },
        { id: 'c', text: 'Esvaziar a Lixeira depois de compactar.', porque: 'Nada foi para a Lixeira: compactar não exclui nada, só cria um arquivo novo.' },
        { id: 'd', text: 'Reiniciar o computador para o espaço ser recalculado.', porque: 'O espaço livre é calculado na hora. Se não mudou, é porque nada saiu do disco.' },
      ]},
      explanation: 'Compactar cria; não substitui. Quem compacta e não apaga o original acabou de ocupar mais espaço do que antes.',
    },
    {
      id: 'ES1-M2-Q7', type: 'matching',
      prompt: 'Ligue cada extensão ao tipo de compactação que ela usa.',
      data: { pairs: [
        { left: '.zip', right: 'Sem perda: desfaz e volta igual' },
        { left: '.png', right: 'Sem perda, para imagem' },
        { left: '.jpg', right: 'Com perda, para foto' },
        { left: '.mp3', right: 'Com perda, para som' },
      ]},
      explanation: 'Saber de que lado cada uma está decide onde usar: documento digitalizado pede sem perda, foto do mural aceita com perda.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 3 — Salvar e excluir
     ────────────────────────────────────────────────────────────────────── */
  'm3-teoria': [
    {
      id: 'ES1-M3-Q1', type: 'multiple_choice',
      prompt: 'O que acontece com o arquivo original quando você usa Salvar como?',
      data: { options: [
        { id: 'a', text: 'Ele fica como estava, e você passa a editar o novo.', correct: true },
        { id: 'b', text: 'Ele é apagado assim que o novo é criado.', porque: 'Nada é apagado. Os dois arquivos passam a existir, e é justamente para isso que o comando serve.' },
        { id: 'c', text: 'Ele recebe as mesmas mudanças que o novo.', porque: 'A partir do Salvar como os dois são independentes: mexer num não toca no outro.' },
        { id: 'd', text: 'Ele vira um atalho para o arquivo novo.', porque: 'Ele continua sendo o arquivo inteiro, com o conteúdo que tinha. Atalho é outra coisa, e não se cria assim.' },
      ]},
      explanation: 'Salvar como é a forma de partir de um documento sem estragá-lo. Salvar, sem o como, escreve por cima.',
    },
    {
      id: 'ES1-M3-Q2', type: 'scenario',
      prompt: 'Você abriu o modelo de autorização do ano passado, mudou as datas e apertou Ctrl+S sem pensar. O que se perdeu?',
      data: { scenarios: [
        { id: 'a', text: 'O modelo: ele agora tem as datas deste ano.', correct: true },
        { id: 'b', text: 'Nada: o Ctrl+S sempre pergunta onde salvar.', porque: 'Ele só pergunta em arquivo que nunca foi salvo. Num arquivo existente ele grava direto, sem caixa nenhuma.' },
        { id: 'c', text: 'As mudanças, porque o modelo é somente leitura.', porque: 'Modelo comum não é somente leitura. Se fosse, o programa teria recusado e avisado.' },
        { id: 'd', text: 'Nada ainda: a gravação só acontece ao fechar o documento.', porque: 'O Ctrl+S grava na hora. Fechar depois disso não desfaz o que já foi para o disco.' },
      ]},
      explanation: 'O Salvar como vem antes de mexer, e não depois. Quem edita primeiro e se lembra depois já escreveu por cima.',
    },
    {
      id: 'ES1-M3-Q3', type: 'multiple_choice',
      prompt: 'O que acontece com um arquivo no instante em que você aperta Delete?',
      data: { options: [
        { id: 'a', text: 'Ele é movido para a Lixeira.', correct: true },
        { id: 'b', text: 'Ele é apagado do disco imediatamente.', porque: 'Não é: ele muda de pasta e continua ocupando o mesmo espaço, até alguém esvaziar a Lixeira.' },
        { id: 'c', text: 'Ele é compactado para ocupar menos até ser apagado.', porque: 'Nada é compactado. O conteúdo fica exatamente como estava.' },
        { id: 'd', text: 'Ele fica marcado como oculto e some da lista.', porque: 'Oculto é outra coisa, e o arquivo continuaria na pasta. Aqui ele realmente sai dela.' },
      ]},
      explanation: 'A Lixeira é uma pasta como qualquer outra, e a rede de proteção existe porque excluir por engano é comum.',
    },
    {
      id: 'ES1-M3-Q4', type: 'true_false',
      prompt: 'Um arquivo apagado de um pen drive pode ser recuperado na Lixeira do computador.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'A Lixeira é do disco do computador. O que é apagado de pen drive ou de unidade de rede não passa por ela.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A mesma exceção vale para o Shift+Delete, que pula a Lixeira de propósito. Nos dois casos não há de onde restaurar com um clique.',
    },
    {
      id: 'ES1-M3-Q5', type: 'multiple_choice',
      prompt: 'Por que esvaziar a Lixeira não apaga de verdade o conteúdo do disco?',
      data: { options: [
        { id: 'a', text: 'O sistema só marca aquele espaço como livre para uso.', correct: true },
        { id: 'b', text: 'Uma cópia de segurança é criada automaticamente antes.', porque: 'Nenhuma cópia é feita. Os dados continuam nos mesmos lugares em que sempre estiveram.' },
        { id: 'c', text: 'O arquivo é movido para uma pasta oculta do sistema.', porque: 'Ele não é movido para lugar nenhum: o que muda é o índice deixar de apontar para ele.' },
        { id: 'd', text: 'O disco guarda tudo por trinta dias antes de apagar.', porque: 'Não há prazo nenhum. O conteúdo some quando outro arquivo for gravado por cima, que pode ser em minutos ou nunca.' },
      ]},
      explanation: 'Apagar de verdade seria lento sem necessidade. Riscar o nome do índice é instantâneo, e o conteúdo fica lá até alguém precisar daquele espaço.',
    },
    {
      id: 'ES1-M3-Q6', type: 'scenario',
      prompt: 'Você esvaziou a Lixeira por engano e quer recuperar um documento que estava nela. Qual é a atitude que mais aumenta a chance?',
      data: { scenarios: [
        { id: 'a', text: 'Parar de usar o computador.', correct: true },
        { id: 'b', text: 'Baixar um programa de recuperação e instalá-lo no mesmo disco.', porque: 'Instalar grava arquivos novos, e eles podem cair justamente no espaço do documento que você quer de volta.' },
        { id: 'c', text: 'Reiniciar o computador para o sistema refazer o índice.', porque: 'Reiniciar grava arquivos de sistema e não restaura índice nenhum. Só gasta parte da chance.' },
        { id: 'd', text: 'Copiar todos os outros arquivos para um pen drive antes de mexer.', porque: 'Copiar lê do disco e não ajuda, e o programa que faz a cópia também grava. É trabalho que consome tempo sem ganho.' },
      ]},
      explanation: 'Cada gravação nova pode cair em cima do que sobrou. Quanto menos o disco for usado, maior a chance de o conteúdo ainda estar inteiro.',
    },
    {
      id: 'ES1-M3-Q7', type: 'ordering',
      prompt: 'Ordene o que acontece com um documento desde a exclusão até ele deixar de existir.',
      data: { items: [
        { id: 'a', text: 'Delete: ele é movido para a Lixeira', order: 1 },
        { id: 'b', text: 'A Lixeira é esvaziada e o nome sai do índice', order: 2 },
        { id: 'c', text: 'O espaço dele passa a constar como livre', order: 3 },
        { id: 'd', text: 'Outro arquivo é gravado por cima daquele espaço', order: 4 },
      ]},
      explanation: 'Só o último passo apaga de verdade, e ele pode demorar meses ou não acontecer nunca. É por isso que "apaguei tudo" antes de doar um computador não apaga nada.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 4 — Achar sem procurar
     ────────────────────────────────────────────────────────────────────── */
  'm4-teoria': [
    {
      id: 'ES1-M4-Q1', type: 'multiple_choice',
      prompt: 'Você quer saber o que está ocupando o disco. Por qual coluna ordenar?',
      data: { options: [
        { id: 'a', text: 'Tamanho.', correct: true },
        { id: 'b', text: 'Data de modificação, porque o que é recente costuma ser maior.', porque: 'Não há relação: um vídeo de cinco anos atrás ocupa muito mais do que a ata de ontem.' },
        { id: 'c', text: 'Nome, para agrupar os arquivos parecidos.', porque: 'Agrupa por nome, e não por peso. A pasta de fotos continua no meio da lista, do tamanho que for.' },
        { id: 'd', text: 'Tipo, porque cada tipo tem um tamanho característico.', porque: 'Ajuda a agrupar, e não responde. Dois arquivos do mesmo tipo podem diferir mil vezes em tamanho.' },
      ]},
      explanation: 'Ordenar por tamanho quase sempre mostra que a resposta são dois ou três itens, e não duzentos — o que faz a limpeza levar minutos em vez de uma tarde.',
    },
    {
      id: 'ES1-M4-Q2', type: 'true_false',
      prompt: 'Ordenar os arquivos de uma pasta muda alguma coisa em disco.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'A ordem é só uma maneira de olhar a pasta: nada é movido, renomeado ou alterado por ordenar.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'É por isso que dá para ordenar à vontade enquanto procura: a janela muda, a pasta não.',
    },
    {
      id: 'ES1-M4-Q3', type: 'scenario',
      prompt: 'Você precisa de um documento de que só lembra duas coisas: era do começo deste ano e tinha a palavra autorização no nome. Qual caminho chega mais rápido?',
      data: { scenarios: [
        { id: 'a', text: 'Buscar por autoriza e filtrar por tipo documento e por data.', correct: true },
        { id: 'b', text: 'Abrir pasta por pasta olhando os nomes.', porque: 'Funciona e é o caminho mais longo. A busca já procura na pasta atual e em todas abaixo dela, de uma vez.' },
        { id: 'c', text: 'Ordenar tudo por data e rolar até o começo do ano.', porque: 'Ordenar só vale dentro de uma pasta. Se o arquivo estiver duas pastas abaixo, ele não aparece na lista.' },
        { id: 'd', text: 'Buscar pelo nome completo do arquivo.', porque: 'Você não lembra o nome completo — é exatamente esse o problema. A busca aceita um pedaço.' },
      ]},
      explanation: 'Filtro serve para quem não lembra o nome. Duas condições fracas juntas — o tipo e o mês — costumam deixar menos resultados do que uma forte.',
    },
    {
      id: 'ES1-M4-Q4', type: 'multiple_choice',
      prompt: 'Por que vale a pena ligar a exibição das extensões num computador novo?',
      data: { options: [
        { id: 'a', text: 'Porque sem elas dois arquivos diferentes aparecem com o mesmo nome.', correct: true },
        { id: 'b', text: 'Porque o computador fica mais rápido ao listar as pastas.', porque: 'Não muda a velocidade em nada: a extensão já estava no nome, só não estava sendo desenhada.' },
        { id: 'c', text: 'Porque sem elas não é possível ordenar por tipo.', porque: 'A ordem por tipo continua funcionando: o sistema conhece a extensão mesmo sem mostrá-la.' },
        { id: 'd', text: 'Porque o sistema passa a associar programas às extensões.', porque: 'A associação já existe e é o que faz os dois cliques funcionarem. Exibir é só mostrar o que já está lá.' },
      ]},
      explanation: 'Na pasta, lista.csv e lista.xlsx viram dois "lista" — e o que distingue passa a ser o ícone, que é a parte falsificável.',
    },
    {
      id: 'ES1-M4-Q5', type: 'scenario',
      prompt: 'Chegou por e-mail um arquivo que aparece na tela como boleto.pdf, com ícone de PDF. Com as extensões exibidas, ele se chama boleto.pdf.exe. O que isso significa?',
      data: { scenarios: [
        { id: 'a', text: 'É um programa, e abrir vai executá-lo.', correct: true },
        { id: 'b', text: 'É um PDF que foi compactado em formato de programa.', porque: 'Não existe PDF compactado assim. A extensão que vale é a última, e ela diz executável.' },
        { id: 'c', text: 'É um PDF com um leitor embutido, para abrir sem instalar nada.', porque: 'É exatamente a história que esse tipo de arquivo quer contar. O que se instala ao abrir não é um leitor.' },
        { id: 'd', text: 'É um arquivo comum com o nome mal escrito por quem enviou.', porque: 'O nome duplo é deliberado: ele existe para mostrar pdf a quem tem as extensões escondidas.' },
      ]},
      explanation: 'O ícone se escolhe; a extensão não. Só o último pedaço depois do último ponto diz o que o arquivo é.',
    },
    {
      id: 'ES1-M4-Q6', type: 'multiple_choice',
      prompt: 'A busca do gerenciador de arquivos procura pelo quê?',
      data: { options: [
        { id: 'a', text: 'Pelo nome do arquivo, na pasta atual e nas que estão abaixo.', correct: true },
        { id: 'b', text: 'Pelo conteúdo escrito dentro dos documentos.', porque: 'A busca comum olha o nome. Procurar dentro do conteúdo é um recurso à parte, e bem mais lento.' },
        { id: 'c', text: 'Em todo o computador, sempre.', porque: 'Ela parte da pasta em que você está. Para procurar no computador inteiro é preciso começar da raiz.' },
        { id: 'd', text: 'Apenas nos arquivos abertos recentemente.', porque: 'Isso é a lista de recentes, que é outra coisa. A busca olha o que está em disco, aberto ou não.' },
      ]},
      explanation: 'É por isso que o nome do arquivo é o que salva o arquivo: um documento chamado doc1.docx com a ata inteira dentro não aparece em busca nenhuma por ata.',
    },
    {
      id: 'ES1-M4-Q7', type: 'matching',
      prompt: 'Ligue cada coluna do gerenciador à pergunta que ela responde.',
      data: { pairs: [
        { left: 'Nome', right: 'Onde está aquele arquivo que eu sei como se chama?' },
        { left: 'Data de modificação', right: 'Em que eu estava mexendo ontem?' },
        { left: 'Tamanho', right: 'O que está enchendo o disco?' },
        { left: 'Tipo', right: 'Quantas fotos há nesta pasta?' },
      ]},
      explanation: 'Cada ordenação é uma pergunta diferente, e escolher a coluna certa costuma ser mais rápido do que qualquer busca.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 5 — O nome diz quando e qual
     ────────────────────────────────────────────────────────────────────── */
  'm5-teoria': [
    {
      id: 'ES1-M5-Q1', type: 'multiple_choice',
      prompt: 'Por que a data no nome do arquivo se escreve como 2026-03-14 e não como 14-03-2026?',
      data: { options: [
        { id: 'a', text: 'Porque assim a ordem por nome fica igual à ordem por data.', correct: true },
        { id: 'b', text: 'Porque é o formato que o sistema exige em nome de arquivo.', porque: 'O sistema aceita qualquer um dos dois. A escolha é de quem nomeia, e a consequência aparece ao ordenar.' },
        { id: 'c', text: 'Porque ocupa menos caracteres no nome.', porque: 'Os dois têm exatamente dez caracteres. O que muda é a ordem das partes.' },
        { id: 'd', text: 'Porque o dia à frente confunde a busca por data.', porque: 'A busca por data usa a data do arquivo, e não a que está escrita no nome.' },
      ]},
      explanation: 'O computador compara caractere por caractere, da esquerda para a direita. Com o ano na frente, ordem alfabética e ordem cronológica viram a mesma coisa.',
    },
    {
      id: 'ES1-M5-Q2', type: 'multiple_choice',
      prompt: 'Por que escrever v01 em vez de v1?',
      data: { options: [
        { id: 'a', text: 'Porque com um dígito só a v10 se ordena antes da v2.', correct: true },
        { id: 'b', text: 'Porque v1 pode ser confundido com o número da página.', porque: 'A letra v já diz o que é. O problema aparece na ordenação, e não na leitura.' },
        { id: 'c', text: 'Porque o sistema reserva nomes de uma letra e um dígito.', porque: 'Não há reserva nenhuma: v1 é um nome de arquivo perfeitamente válido.' },
        { id: 'd', text: 'Porque assim cabem até cem versões, e com v1 só caberiam dez.', porque: 'Nada limita a quantidade. Com v1 dá para chegar a v100 — o que quebra é a ordem, e não o limite.' },
      ]},
      explanation: 'É o mesmo motivo do zero à esquerda no mês. Comparação de texto olha o primeiro caractere primeiro, e 1 vem antes de 2.',
    },
    {
      id: 'ES1-M5-Q3', type: 'scenario',
      prompt: 'Numa pasta há ata-final.docx, ata-final2.docx, ata-FINAL-mesmo.docx e ata-final-revisada-ok.docx. Qual é a mais recente?',
      data: { scenarios: [
        { id: 'a', text: 'Não dá para saber pelos nomes.', correct: true },
        { id: 'b', text: 'A que se chama ata-FINAL-mesmo, pela ênfase no nome.', porque: 'Ênfase não é informação. Quem escreveu isso achava que era a última, e depois escreveu mais uma.' },
        { id: 'c', text: 'A ata-final2, porque tem o número maior.', porque: 'O número existe só nessa: não há como compará-lo com nomes que não têm número nenhum.' },
        { id: 'd', text: 'A ata-final-revisada-ok, porque é a de nome mais longo.', porque: 'Comprimento do nome não diz ordem. Ele só cresce conforme alguém vai acrescentando palavras.' },
      ]},
      explanation: 'A data de modificação responderia, e ela mente assim que alguém abre a antiga e salva sem querer. É por isso que a ordem vai no nome.',
    },
    {
      id: 'ES1-M5-Q4', type: 'true_false',
      prompt: 'Aplicar o padrão de nomeação a três dos dez arquivos já organiza a pasta.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Meio aplicado não é padrão: a pasta continua sem ordem, agora com a impressão de ter uma. E impressão errada custa mais do que desordem visível.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O valor do padrão vem de poder confiar nele. Quem sabe que três em dez seguem a regra precisa conferir os dez de qualquer jeito.',
    },
    {
      id: 'ES1-M5-Q5', type: 'multiple_choice',
      prompt: 'Por que um padrão de nomeação evita espaço e acento?',
      data: { options: [
        { id: 'a', text: 'Porque endereço de internet e terminal tropeçam neles.', correct: true },
        { id: 'b', text: 'Porque o Windows não aceita espaço em nome de arquivo.', porque: 'Aceita, e é comum. O problema aparece quando o nome sai do computador — num link, num comando, num servidor.' },
        { id: 'c', text: 'Porque nomes com acento ocupam mais espaço em disco.', porque: 'A diferença é de poucos bytes por nome, e não é por isso que se evita.' },
        { id: 'd', text: 'Porque a busca não encontra arquivos com acento no nome.', porque: 'A busca encontra. O que varia entre sistemas é como o acento é guardado, não se ele é procurável.' },
      ]},
      explanation: 'O nome que fica só no seu computador aguenta tudo. O que vai virar link, anexo ou caminho num servidor é que pede cuidado — e como não se sabe qual será qual, a regra vale para todos.',
    },
    {
      id: 'ES1-M5-Q6', type: 'ordering',
      prompt: 'Ordene os nomes como o gerenciador os mostraria ao ordenar por nome.',
      data: { items: [
        { id: 'a', text: 'ata-reuniao-v01.docx', order: 1 },
        { id: 'b', text: 'ata-reuniao-v02.docx', order: 2 },
        { id: 'c', text: 'ata-reuniao-v10.docx', order: 3 },
        { id: 'd', text: 'inscritos-acampamento-v01.xlsx', order: 4 },
      ]},
      explanation: 'Com dois dígitos a v10 fica depois da v02, que é onde ela deve estar. Com um dígito só, ela apareceria logo depois da v1.',
    },
    {
      id: 'ES1-M5-Q7', type: 'scenario',
      prompt: 'A secretaria mandou um boleto chamado 20260412_bol_4471.pdf. O padrão do clube é outro. O que fazer?',
      data: { scenarios: [
        { id: 'a', text: 'Renomear no padrão ao guardar na pasta do clube.', correct: true },
        { id: 'b', text: 'Manter o nome, porque arquivo de terceiro não se renomeia.', porque: 'Depois de guardado, o arquivo é seu. Mantê-lo fora do padrão abre a exceção que esvazia o padrão.' },
        { id: 'c', text: 'Responder pedindo que reenviem com o nome certo.', porque: 'O padrão é interno ao clube. Pedir a terceiros que o sigam gasta tempo de todo mundo e não se sustenta.' },
        { id: 'd', text: 'Renomear na mensagem antes de baixar, para já chegar certo.', porque: 'Não dá para renomear o que está do outro lado. E renomear no meio do caminho quebraria o que a outra pessoa espera.' },
      ]},
      explanation: 'O padrão vale para o que está na sua pasta. Renomear ao guardar é o momento em que o arquivo passa a ser seu e entra na organização.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 6 — Onde o arquivo mora
     ────────────────────────────────────────────────────────────────────── */
  'm6-teoria': [
    {
      id: 'ES1-M6-Q1', type: 'matching',
      prompt: 'Ligue cada lugar de armazenamento ao risco principal dele.',
      data: { pairs: [
        { left: 'Disco do computador', right: 'Uma cópia só, num lugar só' },
        { left: 'Pen drive', right: 'Some do bolso, e estraga sem avisar' },
        { left: 'Nuvem', right: 'Depende de internet e de uma conta' },
        { left: 'Papel impresso', right: 'Não se busca, e não se copia rápido' },
      ]},
      explanation: 'Nenhum dos três é o melhor: cada um falha de um jeito. É por isso que a cópia de segurança usa mais de um.',
    },
    {
      id: 'ES1-M6-Q2', type: 'multiple_choice',
      prompt: 'Qual é a vantagem principal de guardar no disco do próprio computador?',
      data: { options: [
        { id: 'a', text: 'Não depende de internet nem de mais ninguém.', correct: true },
        { id: 'b', text: 'É o lugar mais seguro contra perda.', porque: 'É o menos seguro: uma cópia só, num aparelho só. Disco queima, e o computador é roubado.' },
        { id: 'c', text: 'Só você consegue abrir os arquivos.', porque: 'Local não quer dizer privado. No computador do clube, quem sentar depois abre a mesma pasta.' },
        { id: 'd', text: 'Tem mais espaço do que qualquer outra opção.', porque: 'Um HD externo costuma ter mais, e a nuvem não tem limite físico. Espaço não é a vantagem do local.' },
      ]},
      explanation: 'Rápido e sempre disponível é muita coisa, e é o que faz o disco ser o padrão. O que ele não dá é segunda chance.',
    },
    {
      id: 'ES1-M6-Q3', type: 'scenario',
      prompt: 'A barra de cópia para o pen drive chegou a 100% e você puxou o dispositivo. No outro computador um dos arquivos não abre. Por quê?',
      data: { scenarios: [
        { id: 'a', text: 'Parte do conteúdo ainda não tinha sido gravada.', correct: true },
        { id: 'b', text: 'O arquivo é grande demais para o sistema do pen drive.', porque: 'Aí a cópia teria sido recusada no começo, com aviso — e não chegaria a 100%.' },
        { id: 'c', text: 'O outro computador não tem o programa que abre aquele tipo.', porque: 'Faltar programa dá uma mensagem sobre qual programa usar, e não um arquivo que não abre.' },
        { id: 'd', text: 'O pen drive precisa ser formatado antes de receber arquivos.', porque: 'Ele já estava recebendo: a cópia aconteceu. Formatar apagaria tudo e não tem relação com isso.' },
      ]},
      explanation: 'A barra mede o que saiu do seu lado. O que ainda está por gravar do outro só termina na remoção segura — e é por isso que ela existe.',
    },
    {
      id: 'ES1-M6-Q4', type: 'multiple_choice',
      prompt: 'O que a nuvem resolve que os outros dois não resolvem?',
      data: { options: [
        { id: 'a', text: 'Os arquivos sobrevivem à perda do aparelho.', correct: true },
        { id: 'b', text: 'Ela protege os arquivos contra exclusão por engano.', porque: 'É o contrário: com sincronia, apagar num lugar apaga no outro na hora. O que ajuda ali é o histórico de versões.' },
        { id: 'c', text: 'Ela abre os arquivos mais rápido do que o disco local.', porque: 'É mais lenta: o arquivo atravessa a internet. O disco de dentro da máquina é o mais rápido dos três.' },
        { id: 'd', text: 'Ela dispensa cópia de segurança.', porque: 'Uma cópia espelhada não é cópia de segurança. O engano feito aqui chega lá em segundos.' },
      ]},
      explanation: 'Notebook roubado, disco queimado, celular no chão — em qualquer um dos três os arquivos reaparecem no aparelho seguinte. É essa a troca que a nuvem oferece.',
    },
    {
      id: 'ES1-M6-Q5', type: 'true_false',
      prompt: 'Manter a pasta do clube sincronizada com a nuvem já é uma cópia de segurança.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Sincronizar espelha: apagar aqui apaga lá, e o arquivo estragado sobe estragado. A sincronia repete o engano, e não protege dele.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O que transforma nuvem em proteção é o histórico de versões que ela guarda por trás — e é preciso saber que ele existe para usá-lo.',
    },
    {
      id: 'ES1-M6-Q6', type: 'multiple_choice',
      prompt: 'Qual é o risco do pen drive que os outros dois lugares não têm na mesma medida?',
      data: { options: [
        { id: 'a', text: 'Ele é pequeno e vai junto: perde-se com facilidade.', correct: true },
        { id: 'b', text: 'Ele apaga sozinho os arquivos antigos quando enche.', porque: 'Ele não apaga nada: ao encher, recusa a cópia nova e avisa que não há espaço.' },
        { id: 'c', text: 'Ele só funciona no computador em que foi formatado.', porque: 'Ser transportável entre computadores é justamente a utilidade dele.' },
        { id: 'd', text: 'Ele exige internet para abrir os arquivos.', porque: 'Isso é da nuvem. O pen drive funciona sem rede nenhuma.' },
      ]},
      explanation: 'E o que se perde vai aberto: não há senha ali por padrão, então quem achar abre tudo.',
    },
    {
      id: 'ES1-M6-Q7', type: 'ordering',
      prompt: 'Ordene os passos para levar a pasta do acampamento num pen drive.',
      data: { items: [
        { id: 'a', text: 'Conectar o dispositivo e esperar que ele apareça na lista', order: 1 },
        { id: 'b', text: 'Copiar a pasta para dentro dele', order: 2 },
        { id: 'c', text: 'Pedir a remoção segura e esperar a confirmação', order: 3 },
        { id: 'd', text: 'Puxar o dispositivo', order: 4 },
      ]},
      explanation: 'O terceiro passo é o que quase todo mundo pula, e é o único que garante que o que aparece copiado está mesmo copiado.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 7 — A cópia que salva
     ────────────────────────────────────────────────────────────────────── */
  'm7-teoria': [
    {
      id: 'ES1-M7-Q1', type: 'multiple_choice',
      prompt: 'O que define uma cópia de segurança?',
      data: { options: [
        { id: 'a', text: 'Ela está em outro lugar, e não junto do original.', correct: true },
        { id: 'b', text: 'Ela é feita por um programa, e não à mão.', porque: 'Programa ajuda a não esquecer, e copiar à mão para um HD externo é cópia de segurança do mesmo jeito.' },
        { id: 'c', text: 'Ela é compactada para ocupar menos.', porque: 'Compactar é opcional e não muda a natureza da cópia. O que a define é onde ela está.' },
        { id: 'd', text: 'Ela guarda só os arquivos que mudaram no dia.', porque: 'Isso descreve um tipo de backup, o incremental. Uma cópia completa também é cópia de segurança.' },
      ]},
      explanation: 'Uma cópia na mesma máquina protege contra apagar por engano e não protege contra o disco queimar — que leva as duas de uma vez.',
    },
    {
      id: 'ES1-M7-Q2', type: 'multiple_choice',
      prompt: 'O que a regra 3-2-1 exige?',
      data: { options: [
        { id: 'a', text: 'Três cópias, em dois meios, com uma fora do local.', correct: true },
        { id: 'b', text: 'Três cópias por semana, duas por mês, uma por ano.', porque: 'Os números são de cópias, meios e lugares — e não de frequência. Com que frequência copiar é outra decisão.' },
        { id: 'c', text: 'Três pastas, dois computadores e um responsável.', porque: 'Não há nada sobre pastas nem sobre quem cuida. O que a regra distribui são cópias, meios e locais.' },
        { id: 'd', text: 'Três dias de histórico, em dois formatos, num disco.', porque: 'Histórico e formato são outra conversa. A regra fala de quantas cópias e de onde elas ficam.' },
      ]},
      explanation: 'Três porque duas viram uma quando a primeira falha; dois meios porque a falha costuma ser de meio; uma fora por causa do que atinge o lugar inteiro.',
    },
    {
      id: 'ES1-M7-Q3', type: 'scenario',
      prompt: 'O clube tem o arquivo no computador da secretaria, num HD externo no armário ao lado, e num segundo HD externo na mesma sala. A regra 3-2-1 está cumprida?',
      data: { scenarios: [
        { id: 'a', text: 'Não: falta uma cópia fora do local.', correct: true },
        { id: 'b', text: 'Sim: são três cópias em dois meios diferentes.', porque: 'São três cópias, e os dois HDs são o mesmo meio. E as três estão na mesma sala, que é o que o 1 existe para evitar.' },
        { id: 'c', text: 'Não: faltam cópias, porque a regra pede três além do original.', porque: 'O original conta como uma das três. O que falta aqui é lugar, e não quantidade.' },
        { id: 'd', text: 'Sim, desde que os dois HDs sejam de marcas diferentes.', porque: 'Marca não muda o meio nem o local. Um incêndio na sala leva os três do mesmo jeito.' },
      ]},
      explanation: 'O 3 é o mais fácil de cumprir e o que menos protege. Incêndio, enchente e furto da sede não distinguem qual aparelho é qual.',
    },
    {
      id: 'ES1-M7-Q4', type: 'multiple_choice',
      prompt: 'Por que restaurar para um lugar novo antes de substituir o original?',
      data: { options: [
        { id: 'a', text: 'Para conferir a cópia sem apagar o que ainda está lá.', correct: true },
        { id: 'b', text: 'Porque restaurar por cima é bloqueado pelo sistema.', porque: 'Não é bloqueado: o sistema pergunta se quer substituir, e substitui. É por isso que o cuidado é seu.' },
        { id: 'c', text: 'Para o arquivo restaurado manter a data original.', porque: 'A data vem do que estava na cópia, e não do lugar para onde ele foi restaurado.' },
        { id: 'd', text: 'Porque a cópia de segurança fica somente leitura depois de usada.', porque: 'Ela não muda de estado por ter sido lida. O motivo do cuidado é outro: o que está no destino.' },
      ]},
      explanation: 'Restaurar por cima na hora do nervoso é a forma mais rápida de apagar a versão boa com a versão velha — e aí a perda vira definitiva.',
    },
    {
      id: 'ES1-M7-Q5', type: 'scenario',
      prompt: 'A planilha da tesouraria está lá, abre normalmente, e alguém apagou três meses de lançamentos e salvou. O que resolve?',
      data: { scenarios: [
        { id: 'a', text: 'Abrir o histórico de versões e restaurar a de ontem.', correct: true },
        { id: 'b', text: 'Recuperar o arquivo na Lixeira.', porque: 'Nada foi excluído: o arquivo está no lugar, com o conteúdo errado. A Lixeira não tem o que devolver.' },
        { id: 'c', text: 'Usar um programa de recuperação de arquivos apagados.', porque: 'Esses programas procuram arquivos que sumiram do índice. Este não sumiu — ele foi alterado e salvo.' },
        { id: 'd', text: 'Desfazer com Ctrl+Z na próxima vez que abrir.', porque: 'O desfazer vale enquanto o programa está aberto. Depois de fechar, ele começa do zero.' },
      ]},
      explanation: 'Nem toda perda é o arquivo sumir. Quando ele está lá e está errado, o que se quer de volta é uma versão anterior — e é o histórico que a guarda.',
    },
    {
      id: 'ES1-M7-Q6', type: 'true_false',
      prompt: 'Uma cópia de segurança que nunca foi restaurada pode não servir para nada.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Rotina que grava a pasta errada tem tamanho, data e nome com cara de certos. Só restaurar revela isso, e quase sempre revela tarde.' },
      ]},
      explanation: 'Testar uma vez por ano leva cinco minutos: escolher um arquivo, restaurar, abrir. É a única pergunta que a cópia precisa responder.',
    },
    {
      id: 'ES1-M7-Q7', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre o histórico de versões e o salvamento automático?',
      data: { options: [
        { id: 'a', text: 'Um guarda versões antigas; o outro guarda o que você ainda não salvou.', correct: true },
        { id: 'b', text: 'Um é do programa e o outro é do sistema operacional.', porque: 'Os dois costumam ser do programa ou do serviço de nuvem. O que os separa é o que cada um guarda.' },
        { id: 'c', text: 'Um funciona sem internet e o outro exige conexão.', porque: 'O salvamento automático é local, e o histórico existe tanto em nuvem quanto em programas locais.' },
        { id: 'd', text: 'Um serve para documentos e o outro para planilhas.', porque: 'Os dois existem nos dois tipos. O tipo de arquivo não decide qual recurso está disponível.' },
      ]},
      explanation: 'O salvamento automático cobre o programa fechar sozinho, e a oferta de recuperar aparece uma vez só. O histórico cobre a semana passada, e continua lá.',
    },
  ],
};
