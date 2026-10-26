import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC-DG006 Projeto de Design.
 *
 * A definição vale uma vez por lição; o resto é consequência e diagnóstico —
 * a proposta aprovada depois, o clipart com cara de símbolo, a foto escrita
 * por cima, o convite sem o lugar, o post encolhido, o motivo repetido, o
 * PDF sem o editável, o comentário de quem não é do público. Toda errada diz
 * por que está errada no campo porque, a certa é uma afirmação curta e o
 * porquê dela mora no explanation, pela razão escrita na CC-ES012. Sem crase
 * nem asterisco: a questão vai para o QuestionRenderer, que imprime texto
 * puro.
 */

export const QUESTOES_DO_PROJETO_DE_DESIGN: Record<string, Question[]> = {
  /* ── Módulo 1 — a proposta (requisito 2) ──────────────────────────────── */
  'm1-teoria': [
    {
      id: 'DG6-M1-Q1', type: 'multiple_choice',
      prompt: 'O que é uma demanda de comunicação?',
      data: { options: [
        { id: 'a', text: 'Algo que alguém precisa ficar sabendo.', correct: true },
        { id: 'b', text: 'A vontade de fazer um cartaz bem bonito.', porque: 'Bonito é como a peça fica, e não o que ela precisa resolver.' },
        { id: 'c', text: 'O programa que vai ser usado.', porque: 'O programa vem depois de saber o que comunicar.' },
        { id: 'd', text: 'O tamanho da folha.', porque: 'O tamanho sai do meio, que sai da demanda.' },
      ]},
      explanation: 'Metade das famílias sabendo na véspera é demanda; um cartaz bonito é só uma peça.',
    },
    {
      id: 'DG6-M1-Q2', type: 'multiple_choice',
      prompt: 'Qual destes é um público bem definido para o convite?',
      data: { options: [
        { id: 'a', text: 'Pais e avós dos desbravadores novos.', correct: true },
        { id: 'b', text: 'Todo mundo.', porque: 'Peça para todos não fala com ninguém em particular.' },
        { id: 'c', text: 'Quem gostar de acampar com a família.', porque: 'Diz um gosto, e não quem precisa ficar sabendo.' },
        { id: 'd', text: 'As pessoas da internet.', porque: 'É todo mundo com outro nome.' },
      ]},
      explanation: 'Público definido diz quem é, e é dele que saem a letra, as palavras e o meio.',
    },
    {
      id: 'DG6-M1-Q3', type: 'multiple_choice',
      prompt: 'Por que a proposta precisa ser aprovada antes de produzir?',
      data: { options: [
        { id: 'a', text: 'Para o examinador ainda poder mudar algo.', correct: true },
        { id: 'b', text: 'Para ganhar uma nota a mais no fim da vereda.', porque: 'A ordem é o requisito, e não um bônus.' },
        { id: 'c', text: 'Porque o programa só abre depois.', porque: 'O programa abre a qualquer hora; a regra é do projeto.' },
        { id: 'd', text: 'Para não gastar tinta.', porque: 'O que se perde é o trabalho, e não a tinta.' },
      ]},
      explanation: 'Aprovar o que já está pronto só deixa uma resposta possível: sim.',
    },
    {
      id: 'DG6-M1-Q4', type: 'multiple_choice',
      prompt: 'A proposta voltou do examinador com a frase: falta dizer onde a peça digital vai circular. O que fazer?',
      data: { options: [
        { id: 'a', text: 'Completar e enviar de novo.', correct: true },
        { id: 'b', text: 'Começar a produzir assim mesmo.', porque: 'Sem aprovação, a execução não pode começar.' },
        { id: 'c', text: 'Desistir da peça digital.', porque: 'O requisito pede as quatro peças.' },
        { id: 'd', text: 'Mandar a mesma proposta de novo.', porque: 'Ela volta pelo mesmo motivo.' },
      ]},
      explanation: 'O meio decide a proporção da peça digital, e por isso a proposta precisa dizê-lo.',
    },
    {
      id: 'DG6-M1-Q5', type: 'multiple_choice',
      prompt: 'Alguém fez o símbolo e o post e só então mandou a proposta. Qual o risco?',
      data: { options: [
        { id: 'a', text: 'Perder o trabalho feito.', correct: true },
        { id: 'b', text: 'Nenhum, já está pronto.', porque: 'Pronto antes de aprovar é o que o requisito proíbe.' },
        { id: 'c', text: 'O arquivo ficar pesado.', porque: 'A ordem não mexe no tamanho do arquivo.' },
        { id: 'd', text: 'A cor mudar na impressão.', porque: 'Isso é assunto da prova de cores.' },
      ]},
      explanation: 'Se o examinador pedir outro público, as peças feitas para o primeiro vão para o lixo.',
    },
    {
      id: 'DG6-M1-Q6', type: 'true_false',
      prompt: 'A demanda da proposta precisa ser uma necessidade real do clube.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O requisito pede uma demanda real de comunicação do clube.' },
      ]},
      explanation: 'O convite das famílias é o exemplo do caminho; a demanda do seu projeto é sua.',
    },
    {
      id: 'DG6-M1-Q7', type: 'true_false',
      prompt: 'Todo mundo é um público bem definido, porque ninguém fica de fora.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Sem escolher, não há como decidir letra, palavras nem meio.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Escolher o público é justamente decidir quem a peça precisa alcançar.',
    },
  ],

  /* ── Módulo 2 — o símbolo (requisito 3.3) ─────────────────────────────── */
  'm2-teoria': [
    {
      id: 'DG6-M2-Q1', type: 'multiple_choice',
      prompt: 'O que é um símbolo de autoria própria?',
      data: { options: [
        { id: 'a', text: 'Um desenho feito por você.', correct: true },
        { id: 'b', text: 'Um ícone grátis da internet.', porque: 'Grátis para baixar não é seu, nem livre para usar.' },
        { id: 'c', text: 'Uma foto do acampamento.', porque: 'Foto é imagem de pontos, e o símbolo é vetor.' },
        { id: 'd', text: 'O nome do clube em negrito.', porque: 'Isso é texto, e não um símbolo desenhado.' },
      ]},
      explanation: 'Formas suas, desenhadas no editor de vetor, com uma ideia também sua.',
    },
    {
      id: 'DG6-M2-Q2', type: 'multiple_choice',
      prompt: 'Por que o símbolo é um grupo?',
      data: { options: [
        { id: 'a', text: 'Para se mover e copiar inteiro.', correct: true },
        { id: 'b', text: 'Para ele ficar mais colorido no post.', porque: 'Agrupar não muda cor nenhuma.' },
        { id: 'c', text: 'Para o arquivo ficar menor.', porque: 'O tamanho do arquivo não muda por agrupar.' },
        { id: 'd', text: 'Porque o editor obriga.', porque: 'As formas existem soltas; agrupar é escolha.' },
      ]},
      explanation: 'É a cópia do grupo que vai para o post e para o convite, igual nos dois.',
    },
    {
      id: 'DG6-M2-Q3', type: 'multiple_choice',
      prompt: 'A barraca de traço fino ficou linda grande e sumiu no canto do post. Por quê?',
      data: { options: [
        { id: 'a', text: 'O traço ficou menor que um pixel.', correct: true },
        { id: 'b', text: 'A cor era escura demais para o post.', porque: 'A cor não faz uma forma sumir no tamanho pequeno.' },
        { id: 'c', text: 'O post era quadrado.', porque: 'O formato do post não afina o traço.' },
        { id: 'd', text: 'Faltou agrupar.', porque: 'Agrupado ou não, o traço tem a mesma espessura.' },
      ]},
      explanation: 'Traço de 3 pixels numa barraca de 280 fica com um terço de pixel em 32.',
    },
    {
      id: 'DG6-M2-Q4', type: 'multiple_choice',
      prompt: 'Onde se confere se o símbolo funciona pequeno?',
      data: { options: [
        { id: 'a', text: 'Vendo-o em 64, 32 e 16 pixels.', correct: true },
        { id: 'b', text: 'Ampliando-o bastante na tela do editor.', porque: 'Ampliado tudo aparece; o problema é o pequeno.' },
        { id: 'c', text: 'Imprimindo-o em A4.', porque: 'Grande no papel, ele também esconde o defeito.' },
        { id: 'd', text: 'Pela cor do fundo.', porque: 'O fundo não diz se um traço some.' },
      ]},
      explanation: 'O editor mostra o símbolo nos três tamanhos lado a lado.',
    },
    {
      id: 'DG6-M2-Q5', type: 'multiple_choice',
      prompt: 'A primeira ideia do símbolo foi descartada. O que fazer com ela?',
      data: { options: [
        { id: 'a', text: 'Guardar no arquivo.', correct: true },
        { id: 'b', text: 'Apagar para não confundir.', porque: 'Ela é a versão descartada que o requisito pede para mostrar.' },
        { id: 'c', text: 'Usar no post.', porque: 'Ela foi descartada justamente por não funcionar.' },
        { id: 'd', text: 'Mandar para a gráfica.', porque: 'A gráfica recebe a peça final, e não as tentativas.' },
      ]},
      explanation: 'Versões descartadas são o processo, e o processo se apresenta.',
    },
    {
      id: 'DG6-M2-Q6', type: 'true_false',
      prompt: 'Um ícone de site de ícones grátis que não diz a licença não pode ser o símbolo do projeto.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Não é de autoria própria, e sem licença ele é protegido.' },
      ]},
      explanation: 'O requisito pede autoria própria, e grátis para baixar não é livre para usar.',
    },
    {
      id: 'DG6-M2-Q7', type: 'true_false',
      prompt: 'Um símbolo bonito em tamanho grande funciona em qualquer tamanho.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Traço fino some no pequeno, e o desenho some junto.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O tamanho em que ele vai ser visto é que decide se o desenho serve.',
    },
  ],

  /* ── Módulo 3 — as imagens (requisito 3.4) ────────────────────────────── */
  'm3-teoria': [
    {
      id: 'DG6-M3-Q1', type: 'multiple_choice',
      prompt: 'O que é declarar a origem de uma imagem?',
      data: { options: [
        { id: 'a', text: 'Dizer de quem é e a licença.', correct: true },
        { id: 'b', text: 'Dizer o tamanho em pixels.', porque: 'Pixels dizem a resolução, e não de quem ela é.' },
        { id: 'c', text: 'Dizer o formato do arquivo.', porque: 'JPG ou PNG não dizem quem pode usar.' },
        { id: 'd', text: 'Dizer quando foi editada.', porque: 'A data de edição não diz a autoria.' },
      ]},
      explanation: 'Própria, livre ou protegida — e quem fez.',
    },
    {
      id: 'DG6-M3-Q2', type: 'multiple_choice',
      prompt: 'Por que exportar a foto tratada com outro nome?',
      data: { options: [
        { id: 'a', text: 'Para não apagar o original.', correct: true },
        { id: 'b', text: 'Para o arquivo ficar leve.', porque: 'O nome não muda o tamanho do arquivo.' },
        { id: 'c', text: 'Porque o JPG exige.', porque: 'Qualquer formato aceita qualquer nome.' },
        { id: 'd', text: 'Para a gráfica aceitar.', porque: 'A gráfica olha o arquivo, e não o nome.' },
      ]},
      explanation: 'Com o mesmo nome, a tratada escreve por cima do original do celular.',
    },
    {
      id: 'DG6-M3-Q3', type: 'multiple_choice',
      prompt: 'O que a licença CC BY pede para usar uma imagem?',
      data: { options: [
        { id: 'a', text: 'O crédito de quem fez.', correct: true },
        { id: 'b', text: 'Um pagamento por uso.', porque: 'A CC BY é livre de pagamento.' },
        { id: 'c', text: 'Que ela não seja mudada.', porque: 'A CC BY deixa mudar; outras licenças é que proíbem.' },
        { id: 'd', text: 'Nada.', porque: 'O crédito é a condição dela.' },
      ]},
      explanation: 'Quem fez e a licença, escritos perto da imagem.',
    },
    {
      id: 'DG6-M3-Q4', type: 'multiple_choice',
      prompt: 'Uma imagem veio de um site que não diz a licença. Como ela se classifica?',
      data: { options: [
        { id: 'a', text: 'Protegida.', correct: true },
        { id: 'b', text: 'Livre, porque estava aberta.', porque: 'Estar aberta para ver não dá licença de uso.' },
        { id: 'c', text: 'Própria, porque foi baixada.', porque: 'Baixar não transfere a autoria.' },
        { id: 'd', text: 'Livre, se ninguém reclamar.', porque: 'A licença vem antes, e não depois da reclamação.' },
      ]},
      explanation: 'Sem licença escrita, a imagem é protegida até alguém dizer o contrário.',
    },
    {
      id: 'DG6-M3-Q5', type: 'multiple_choice',
      prompt: 'A foto do acampamento foi tirada pela secretária do clube. O que a declaração precisa ter?',
      data: { options: [
        { id: 'a', text: 'O nome dela e a autorização.', correct: true },
        { id: 'b', text: 'Só que é própria.', porque: 'O clube tem vários celulares; precisa dizer de quem.' },
        { id: 'c', text: 'O modelo do celular em que foi tirada.', porque: 'O aparelho não diz quem autorizou o uso.' },
        { id: 'd', text: 'Nada, é do clube.', porque: 'A foto é de uma pessoa, e o uso é com a autorização dela.' },
      ]},
      explanation: 'Própria do clube quer dizer de alguém do clube, com autorização para usar.',
    },
    {
      id: 'DG6-M3-Q6', type: 'true_false',
      prompt: 'O crédito de uma imagem CC BY vai na própria peça, perto da imagem.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Numa lista à parte, quem vê a peça não fica sabendo.' },
      ]},
      explanation: 'No convite, ele entra como legenda debaixo da fogueira.',
    },
    {
      id: 'DG6-M3-Q7', type: 'true_false',
      prompt: 'Depois de tratar a foto, o original do celular pode ser apagado.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O original mostra o que foi tratado e permite refazer.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O original vai na pasta do projeto, junto das versões.',
    },
  ],

  /* ── Módulo 4 — a peça impressa (requisito 3.1) ───────────────────────── */
  'm4-teoria': [
    {
      id: 'DG6-M4-Q1', type: 'multiple_choice',
      prompt: 'Quais são as três perguntas que todo convite responde?',
      data: { options: [
        { id: 'a', text: 'O quê, quando e onde.', correct: true },
        { id: 'b', text: 'Quem, quanto e por quê.', porque: 'Sem quando e onde, ninguém consegue ir.' },
        { id: 'c', text: 'Cor, letra e foto.', porque: 'São escolhas de desenho, e não informações.' },
        { id: 'd', text: 'Título, corpo e legenda.', porque: 'São estilos de texto, e não perguntas.' },
      ]},
      explanation: 'Faltando uma, quem lê não vai, ou liga para perguntar.',
    },
    {
      id: 'DG6-M4-Q2', type: 'multiple_choice',
      prompt: 'Qual pergunta mais falta em convite de clube?',
      data: { options: [
        { id: 'a', text: 'Onde.', correct: true },
        { id: 'b', text: 'O quê.', porque: 'O nome do evento quase sempre está no título.' },
        { id: 'c', text: 'Quando.', porque: 'A data costuma ser a primeira coisa escrita.' },
        { id: 'd', text: 'Nenhuma.', porque: 'O lugar some porque quem escreve sabe de cor.' },
      ]},
      explanation: 'Quem escreve sabe que é na chácara, e por isso esquece de escrever.',
    },
    {
      id: 'DG6-M4-Q3', type: 'multiple_choice',
      prompt: 'A foto do convite vai de X 0 até 148 mm, parando na borda do papel. O que muda?',
      data: { options: [
        { id: 'a', text: 'Passar da borda 3 mm de cada lado.', correct: true },
        { id: 'b', text: 'Diminuir a foto até caber na margem.', porque: 'Menor, ela continua parando antes do corte.' },
        { id: 'c', text: 'Trocar por PNG.', porque: 'O formato não muda onde a foto termina.' },
        { id: 'd', text: 'Nada.', porque: 'A guilhotina erra, e o lado errado fica com fio branco.' },
      ]},
      explanation: 'X -3, Y -3 e 154 mm de largura: a sangria da CC-DG005.',
    },
    {
      id: 'DG6-M4-Q4', type: 'multiple_choice',
      prompt: 'Por que o símbolo no convite não mostra ppi?',
      data: { options: [
        { id: 'a', text: 'Ele é vetor.', correct: true },
        { id: 'b', text: 'Ele é pequeno demais.', porque: 'Uma foto pequena teria ppi alto, e mostraria.' },
        { id: 'c', text: 'Ele está em preto.', porque: 'A cor não tem nada a ver com resolução.' },
        { id: 'd', text: 'O programa travou.', porque: 'O programa diz vetor de propósito.' },
      ]},
      explanation: 'Vetor se redesenha em qualquer tamanho, sem ponto que apareça.',
    },
    {
      id: 'DG6-M4-Q5', type: 'multiple_choice',
      prompt: 'O convite foi corrigido depois de exportar o PDF. O que mandar à gráfica?',
      data: { options: [
        { id: 'a', text: 'Um PDF exportado de novo.', correct: true },
        { id: 'b', text: 'O PDF de antes.', porque: 'Ele é o retrato de antes da correção.' },
        { id: 'c', text: 'O arquivo do programa.', porque: 'A gráfica pede o PDF.' },
        { id: 'd', text: 'Os dois PDFs.', porque: 'A gráfica imprime o que receber, e pode pegar o velho.' },
      ]},
      explanation: 'O PDF congela o convite de quando foi exportado.',
    },
    {
      id: 'DG6-M4-Q6', type: 'true_false',
      prompt: 'O crédito da foto de outra pessoa é texto da peça, e entra no convite.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'É a condição da licença, e vai perto da imagem.' },
      ]},
      explanation: 'Ele entra como legenda, com o nome da fotógrafa e a licença.',
    },
    {
      id: 'DG6-M4-Q7', type: 'true_false',
      prompt: 'A foto crua do celular serve para o convite porque tem resolução de sobra.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'A resolução passa; o que a reprova é estar torta e escura.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Resolução é uma conta; a foto também precisa ser tratada.',
    },
  ],

  /* ── Módulo 5 — a peça digital (requisito 3.2) ────────────────────────── */
  'm5-teoria': [
    {
      id: 'DG6-M5-Q1', type: 'multiple_choice',
      prompt: 'O que é adaptar a peça impressa para o digital?',
      data: { options: [
        { id: 'a', text: 'Refazê-la para o meio.', correct: true },
        { id: 'b', text: 'Encolhê-la até caber.', porque: 'Encolher é o mesmo papel, pequeno.' },
        { id: 'c', text: 'Exportá-la em PNG.', porque: 'O formato muda; a peça continua a mesma.' },
        { id: 'd', text: 'Fotografar o papel.', porque: 'A foto do papel tem a proporção do papel.' },
      ]},
      explanation: 'Proporção e legibilidade próprias do meio, como pede o requisito.',
    },
    {
      id: 'DG6-M5-Q2', type: 'multiple_choice',
      prompt: 'Qual destas é uma proporção de post?',
      data: { options: [
        { id: 'a', text: '1080 por 1350.', correct: true },
        { id: 'b', text: '1080 por 1528.', porque: 'É a folha A5 em pixels, que o feed corta.' },
        { id: 'c', text: '148 por 210.', porque: 'São os milímetros do A5, que é papel.' },
        { id: 'd', text: '297 por 210.', porque: 'É uma folha A4 deitada, em milímetros.' },
      ]},
      explanation: 'Quadrado 1080 × 1080, retrato 1080 × 1350, story 1080 × 1920.',
    },
    {
      id: 'DG6-M5-Q3', type: 'multiple_choice',
      prompt: 'No convite impresso a letra tem corpo 22. No post de 1080, como ela fica no celular?',
      data: { options: [
        { id: 'a', text: 'Com uns 7 pixels: não se lê.', correct: true },
        { id: 'b', text: 'Com 22 pixels: ótima.', porque: 'O post aparece com um terço da largura no celular.' },
        { id: 'c', text: 'Maior, porque a tela tem luz.', porque: 'A luz não aumenta a letra.' },
        { id: 'd', text: 'Igual ao papel.', porque: 'Papel é lido de perto e parado; o post, de passagem.' },
      ]},
      explanation: 'O post de 1080 vira uns 360 na tela, e 22 vira uns 7.',
    },
    {
      id: 'DG6-M5-Q4', type: 'multiple_choice',
      prompt: 'Por que duplicar a prancha antes de refazer o post?',
      data: { options: [
        { id: 'a', text: 'Para guardar a versão de antes.', correct: true },
        { id: 'b', text: 'Para ter dois posts.', porque: 'Só um é a peça; o outro é a versão descartada.' },
        { id: 'c', text: 'Porque o editor só mexe numa cópia.', porque: 'Dá para refazer sem duplicar, e aí a versão se perde.' },
        { id: 'd', text: 'Para mudar o tamanho.', porque: 'O tamanho muda sem duplicar.' },
      ]},
      explanation: 'O post encolhido é a versão descartada que o requisito 4 pede para mostrar.',
    },
    {
      id: 'DG6-M5-Q5', type: 'multiple_choice',
      prompt: 'O post ficou com 60 palavras, todas em letra grande. O que falta?',
      data: { options: [
        { id: 'a', text: 'Cortar até o essencial.', correct: true },
        { id: 'b', text: 'Diminuir a letra para caber tudo.', porque: 'Letra pequena volta a não se ler no celular.' },
        { id: 'c', text: 'Aumentar o post.', porque: 'O tamanho do post é o do meio.' },
        { id: 'd', text: 'Nada.', porque: 'O post passa debaixo do dedo em um segundo e meio.' },
      ]},
      explanation: 'Umas 30 palavras, com o quê, o quando e o onde.',
    },
    {
      id: 'DG6-M5-Q6', type: 'true_false',
      prompt: 'O post leva o mesmo símbolo do convite.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O símbolo igual é o que diz que as duas peças são do mesmo projeto.' },
      ]},
      explanation: 'Copiado da prancha do símbolo, e diminuído com o grupo inteiro.',
    },
    {
      id: 'DG6-M5-Q7', type: 'true_false',
      prompt: 'Mudar o tamanho da prancha arruma sozinho o que está nela.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Os objetos ficam onde estavam; rearranjar é o trabalho.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Adaptar é rearranjar, aumentar a letra e cortar o que sobra.',
    },
  ],

  /* ── Módulo 6 — o processo (requisito 4) ──────────────────────────────── */
  'm6-teoria': [
    {
      id: 'DG6-M6-Q1', type: 'multiple_choice',
      prompt: 'O que é uma versão descartada?',
      data: { options: [
        { id: 'a', text: 'Uma tentativa guardada.', correct: true },
        { id: 'b', text: 'Um arquivo apagado.', porque: 'Apagada, ela não pode ser mostrada.' },
        { id: 'c', text: 'A peça final.', porque: 'A final é a que seguiu.' },
        { id: 'd', text: 'Um rascunho de papel.', porque: 'Rascunho vem antes; versão é feita no programa.' },
      ]},
      explanation: 'Ela fica no arquivo, e é ela que se mostra ao examinador.',
    },
    {
      id: 'DG6-M6-Q2', type: 'multiple_choice',
      prompt: 'Qual destes é um bom motivo de descarte?',
      data: { options: [
        { id: 'a', text: 'O traço sumia com 32 pixels.', correct: true },
        { id: 'b', text: 'Não ficou bom.', porque: 'Não diz o que estava errado.' },
        { id: 'c', text: 'Não gostei.', porque: 'É gosto, e não o que se viu na versão.' },
        { id: 'd', text: 'Achei melhor seguir com o outro.', porque: 'Não diz por que o outro é melhor.' },
      ]},
      explanation: 'Um bom motivo diz o que se viu, e o examinador pode conferir olhando.',
    },
    {
      id: 'DG6-M6-Q3', type: 'multiple_choice',
      prompt: 'Três rascunhos com a mesma barraca, mudando só a cor. O que falta?',
      data: { options: [
        { id: 'a', text: 'Três ideias diferentes.', correct: true },
        { id: 'b', text: 'Mais cores.', porque: 'Mais cores continuam sendo a mesma ideia.' },
        { id: 'c', text: 'Desenhar no computador.', porque: 'Rascunho é à mão, no papel.' },
        { id: 'd', text: 'Nada, são três.', porque: 'Três vezes a mesma ideia é uma ideia.' },
      ]},
      explanation: 'Rascunhos diferentes são o que permite escolher.',
    },
    {
      id: 'DG6-M6-Q4', type: 'multiple_choice',
      prompt: 'Duas versões descartadas têm o mesmo motivo escrito. O que isso diz?',
      data: { options: [
        { id: 'a', text: 'Que nenhuma foi explicada.', correct: true },
        { id: 'b', text: 'Que as duas eram iguais.', porque: 'Eram versões diferentes, com defeitos diferentes.' },
        { id: 'c', text: 'Que o motivo é bom.', porque: 'O mesmo motivo para duas não diz nada de nenhuma.' },
        { id: 'd', text: 'Nada de mais.', porque: 'É a razão do descarte que o requisito pede.' },
      ]},
      explanation: 'Cada versão tem o seu motivo, escrito olhando para ela.',
    },
    {
      id: 'DG6-M6-Q5', type: 'multiple_choice',
      prompt: 'Como as versões descartadas ficam no arquivo?',
      data: { options: [
        { id: 'a', text: 'Duplicando antes de refazer.', correct: true },
        { id: 'b', text: 'Desfazendo depois de pronto.', porque: 'Desfazer apaga o que veio depois.' },
        { id: 'c', text: 'Lembrando de como eram.', porque: 'O que só está na memória não se mostra.' },
        { id: 'd', text: 'Exportando só a final.', porque: 'Aí só a final existe.' },
      ]},
      explanation: 'A cópia guardada é a versão de antes.',
    },
    {
      id: 'DG6-M6-Q6', type: 'true_false',
      prompt: 'Os rascunhos do projeto são feitos à mão, antes do computador.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'No papel cada ideia custa um minuto, e não prende a uma só.' },
      ]},
      explanation: 'É o que a CC-DG004 ensinou, e o requisito pede para apresentá-los.',
    },
    {
      id: 'DG6-M6-Q7', type: 'true_false',
      prompt: 'Uma versão descartada é um fracasso e deve ficar fora da apresentação.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O requisito pede para apresentar as versões descartadas.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Cada versão descartada ensinou algo que a final tem.',
    },
  ],

  /* ── Módulo 7 — a entrega (requisito 5) ───────────────────────────────── */
  'm7-teoria': [
    {
      id: 'DG6-M7-Q1', type: 'multiple_choice',
      prompt: 'O que é o arquivo editável de uma peça?',
      data: { options: [
        { id: 'a', text: 'O do programa, para mudar depois.', correct: true },
        { id: 'b', text: 'O PDF que vai para a gráfica imprimir.', porque: 'O PDF é o final, que não se edita.' },
        { id: 'c', text: 'O PNG do post.', porque: 'O PNG é o final do post.' },
        { id: 'd', text: 'A foto do celular.', porque: 'É o original da imagem, e não o editável da peça.' },
      ]},
      explanation: 'No ano que vem a data muda, e é dele que se parte.',
    },
    {
      id: 'DG6-M7-Q2', type: 'multiple_choice',
      prompt: 'Qual destes é um arquivo final?',
      data: { options: [
        { id: 'a', text: 'convite.pdf', correct: true },
        { id: 'b', text: 'convite.sla', porque: 'É o editável do programa de diagramação.' },
        { id: 'c', text: 'simbolo.svg', porque: 'É o editável do editor de vetor.' },
        { id: 'd', text: 'acampamento-tratada.xcf', porque: 'É o editável do editor de foto.' },
      ]},
      explanation: 'O PDF vai para a gráfica; o .sla fica para quem vai mudar o convite.',
    },
    {
      id: 'DG6-M7-Q3', type: 'multiple_choice',
      prompt: 'O que não deve ir na pasta de entrega?',
      data: { options: [
        { id: 'a', text: 'O clipart baixado.', correct: true },
        { id: 'b', text: 'A foto original.', porque: 'O original é parte do projeto.' },
        { id: 'c', text: 'O post encolhido.', porque: 'É uma versão descartada, e o processo se apresenta.' },
        { id: 'd', text: 'A proposta aprovada.', porque: 'Ela abre o projeto.' },
      ]},
      explanation: 'Entregar o que não é seu é distribuir o que a licença não deixa.',
    },
    {
      id: 'DG6-M7-Q4', type: 'multiple_choice',
      prompt: 'Qual nome de arquivo diz a data e a versão?',
      data: { options: [
        { id: 'a', text: 'convite-2026-09-01-v03.pdf', correct: true },
        { id: 'b', text: 'convite-final-FINAL2.pdf', porque: 'Não diz qual é o mais novo.' },
        { id: 'c', text: 'convite novo.pdf', porque: 'Novo deixa de ser novo no dia seguinte.' },
        { id: 'd', text: 'convite (1).pdf', porque: 'O número é do sistema, e não uma versão.' },
      ]},
      explanation: 'Ano, mês e dia, e a versão: é o padrão da CC-ES001.',
    },
    {
      id: 'DG6-M7-Q5', type: 'multiple_choice',
      prompt: 'Alguém entregou só os PDFs e PNGs. O que acontece no ano que vem?',
      data: { options: [
        { id: 'a', text: 'Ninguém consegue mudar a data.', correct: true },
        { id: 'b', text: 'Nada, porque os finais já bastam.', porque: 'Final não se edita.' },
        { id: 'c', text: 'A gráfica recusa.', porque: 'A gráfica aceita o PDF; o problema é mudar.' },
        { id: 'd', text: 'As cores mudam.', porque: 'A cor não depende de ter o editável.' },
      ]},
      explanation: 'O editável e o final não se substituem.',
    },
    {
      id: 'DG6-M7-Q6', type: 'true_false',
      prompt: 'Cada peça precisa ter um arquivo editável e um arquivo final.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O requisito pede os dois, e cada um serve a uma pessoa.' },
      ]},
      explanation: 'O final para quem usa; o editável para quem vai mudar.',
    },
    {
      id: 'DG6-M7-Q7', type: 'true_false',
      prompt: 'As versões descartadas podem ir para a lixeira na entrega.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Elas são o processo, que também se apresenta.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Elas vão para a pasta de originais e versões.',
    },
  ],

  /* ── Módulo 8 — o retorno (requisito 6) ───────────────────────────────── */
  'm8-teoria': [
    {
      id: 'DG6-M8-Q1', type: 'multiple_choice',
      prompt: 'De quem é o retorno que o requisito pede?',
      data: { options: [
        { id: 'a', text: 'De cinco pessoas do público.', correct: true },
        { id: 'b', text: 'Do conselheiro e da diretoria do clube.', porque: 'Ele não é o público do convite.' },
        { id: 'c', text: 'Dos colegas de unidade.', porque: 'Eles não são quem o convite precisa alcançar.' },
        { id: 'd', text: 'De qualquer pessoa.', porque: 'O requisito pede o público-alvo.' },
      ]},
      explanation: 'O público é quem a peça precisa alcançar, e só ele diz se alcançou.',
    },
    {
      id: 'DG6-M8-Q2', type: 'multiple_choice',
      prompt: 'Qual pergunta ajuda mais a colher o retorno?',
      data: { options: [
        { id: 'a', text: 'O que você entendeu?', correct: true },
        { id: 'b', text: 'Gostou?', porque: 'Gostei não ensina nada sobre o que mudar.' },
        { id: 'c', text: 'Ficou bonito, né?', porque: 'Já traz a resposta dentro.' },
        { id: 'd', text: 'Qual sua cor preferida?', porque: 'Não fala da peça.' },
      ]},
      explanation: 'O que a pessoa entendeu mostra o que a peça disse de fato.',
    },
    {
      id: 'DG6-M8-Q3', type: 'multiple_choice',
      prompt: 'Uma mãe disse: não diz que horas começa. Como ler esse retorno?',
      data: { options: [
        { id: 'a', text: 'Pede mudança.', correct: true },
        { id: 'b', text: 'É gosto dela.', porque: 'Sem a hora, ela não sabe se dá para ir.' },
        { id: 'c', text: 'Não conta.', porque: 'Ela é do público.' },
        { id: 'd', text: 'Pede mais cores.', porque: 'Ela falou da hora, e não da cor.' },
      ]},
      explanation: 'Falta uma informação que alguém do público precisa para decidir.',
    },
    {
      id: 'DG6-M8-Q4', type: 'multiple_choice',
      prompt: 'Uma mãe disse: eu poria mais cores. O que fazer?',
      data: { options: [
        { id: 'a', text: 'Anotar, e manter a peça.', correct: true },
        { id: 'b', text: 'Pôr mais cores na hora.', porque: 'É gosto de uma pessoa, e não resolve a demanda.' },
        { id: 'c', text: 'Ignorar e nem anotar o que ela disse.', porque: 'Todo retorno se registra, mesmo o que não muda nada.' },
        { id: 'd', text: 'Refazer o post todo.', porque: 'Nada no comentário pede isso.' },
      ]},
      explanation: 'Seguir todo comentário é tão errado quanto não seguir nenhum.',
    },
    {
      id: 'DG6-M8-Q5', type: 'multiple_choice',
      prompt: 'Registraram que a hora entrou no post, mas o post continua sem a hora. O que falta?',
      data: { options: [
        { id: 'a', text: 'Fazer a mudança na peça.', correct: true },
        { id: 'b', text: 'Escrever mais no registro.', porque: 'O registro descreve uma mudança que não aconteceu.' },
        { id: 'c', text: 'Ouvir mais gente.', porque: 'O retorno já foi colhido.' },
        { id: 'd', text: 'Nada, está registrado.', porque: 'A alteração tem de estar na peça.' },
      ]},
      explanation: 'A alteração aparece na peça, e o registro diz qual foi e por quê.',
    },
    {
      id: 'DG6-M8-Q6', type: 'true_false',
      prompt: 'O retorno do conselheiro não conta como uma das cinco pessoas do público.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O público do convite são as famílias novas.' },
      ]},
      explanation: 'A opinião dele pode até ser boa, mas não diz se a peça alcançou as famílias.',
    },
    {
      id: 'DG6-M8-Q7', type: 'true_false',
      prompt: 'Para atender um retorno, vale aumentar o texto do post além de 30 palavras.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'A mudança não pode quebrar o resto do post.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A hora cabe na linha da data, sem fazer o post deixar de se ler.',
    },
  ],

  /* ── Módulo 9 — a apresentação (requisito 7) ──────────────────────────── */
  'm9-teoria': [
    {
      id: 'DG6-M9-Q1', type: 'multiple_choice',
      prompt: 'Quanto tempo o requisito dá para a apresentação?',
      data: { options: [
        { id: 'a', text: 'Até quinze minutos.', correct: true },
        { id: 'b', text: 'Exatamente quinze minutos.', porque: 'Quinze é o teto, e não a meta.' },
        { id: 'c', text: 'Uma hora.', porque: 'O requisito diz até quinze.' },
        { id: 'd', text: 'O tempo que precisar.', porque: 'Há um teto, e o roteiro existe para caber nele.' },
      ]},
      explanation: 'Sobrar tempo para as perguntas é bom sinal.',
    },
    {
      id: 'DG6-M9-Q2', type: 'multiple_choice',
      prompt: 'Qual parte da apresentação leva mais tempo?',
      data: { options: [
        { id: 'a', text: 'As peças.', correct: true },
        { id: 'b', text: 'A demanda.', porque: 'Ela é o começo, e não o centro.' },
        { id: 'c', text: 'As perguntas.', porque: 'Elas vêm no fim, com o tempo que sobrar.' },
        { id: 'd', text: 'A proposta.', porque: 'Ela se mostra rápido: já foi aprovada.' },
      ]},
      explanation: 'É das peças que o examinador vai perguntar.',
    },
    {
      id: 'DG6-M9-Q3', type: 'multiple_choice',
      prompt: 'Sem roteiro, o que costuma acontecer na apresentação?',
      data: { options: [
        { id: 'a', text: 'Correr justamente nas peças.', correct: true },
        { id: 'b', text: 'Sobrar tempo demais.', porque: 'O mais comum é faltar tempo no fim.' },
        { id: 'c', text: 'Nada, porque improvisar sempre funciona.', porque: 'Improviso gasta tempo no começo.' },
        { id: 'd', text: 'O examinador não perguntar.', porque: 'Ele pergunta, e o tempo pode ter acabado.' },
      ]},
      explanation: 'O roteiro dá minutos a cada parte antes de começar.',
    },
    {
      id: 'DG6-M9-Q4', type: 'multiple_choice',
      prompt: 'De onde sai a peça impressa levada ao examinador?',
      data: { options: [
        { id: 'a', text: 'Do PDF da gráfica atual.', correct: true },
        { id: 'b', text: 'De um print da tela.', porque: 'Print da tela tem a resolução da tela.' },
        { id: 'c', text: 'Do primeiro PDF exportado.', porque: 'Ele pode ser de antes da última correção.' },
        { id: 'd', text: 'Do arquivo editável.', porque: 'O editável não vai para a gráfica.' },
      ]},
      explanation: 'O PDF exportado do convite como ele está agora.',
    },
    {
      id: 'DG6-M9-Q5', type: 'multiple_choice',
      prompt: 'Como apresentar a peça digital?',
      data: { options: [
        { id: 'a', text: 'No celular.', correct: true },
        { id: 'b', text: 'Impressa em A4.', porque: 'No papel ela não é vista como vai circular.' },
        { id: 'c', text: 'Descrevendo em palavras.', porque: 'A peça se mostra, e não se descreve.' },
        { id: 'd', text: 'No telão, grande.', porque: 'Grande, a letra pequena parece boa.' },
      ]},
      explanation: 'A peça digital se apresenta no meio dela.',
    },
    {
      id: 'DG6-M9-Q6', type: 'true_false',
      prompt: 'O requisito pede a peça impressa em mãos na apresentação.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'É no papel que se vê a sangria, a letra e a cor.' },
      ]},
      explanation: 'Imprima com antecedência: gráfica tem prazo.',
    },
    {
      id: 'DG6-M9-Q7', type: 'true_false',
      prompt: 'Num roteiro de quinze minutos, a demanda pode levar mais tempo que as peças.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'As peças são o centro, e nenhuma parte leva mais que elas.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Explicar a demanda por mais tempo que mostrar as peças é apresentar um projeto que não aconteceu.',
    },
  ],
};
