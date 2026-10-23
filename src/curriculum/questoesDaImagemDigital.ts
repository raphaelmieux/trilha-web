import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC-DG003 Imagem Digital.
 *
 * A definição vale uma vez por lição; o resto é consequência e diagnóstico —
 * a foto que borra, o céu que estourou, o fundo que voltou branco, o original
 * que sumiu. Toda errada diz por que está errada no campo porque, a certa é
 * uma afirmação curta e o porquê dela mora no explanation, pela razão escrita
 * na CC-ES012. Sem crase nem asterisco: a questão vai para o
 * QuestionRenderer, que imprime texto puro.
 */

export const QUESTOES_DA_IMAGEM_DIGITAL: Record<string, Question[]> = {
  /* ── Módulo 1 — pixel e resolução (requisitos 2.1 e 3) ───────────────── */
  'm1-teoria': [
    {
      id: 'DG3-M1-Q1', type: 'multiple_choice',
      prompt: 'O que é um pixel?',
      data: { options: [
        { id: 'a', text: 'Um quadradinho de uma cor só.', correct: true },
        { id: 'b', text: 'Uma linha desenhada por nós.', porque: 'Nós e alças são do vetor, não da foto.' },
        { id: 'c', text: 'Um centímetro do papel impresso.', porque: 'O tamanho no papel depende do ppi; o pixel não tem medida própria.' },
        { id: 'd', text: 'Uma camada da imagem.', porque: 'Camada é uma folha inteira da imagem, feita de muitos pixels.' },
      ]},
      explanation: 'Uma foto é uma grade de pixels, e cada um guarda uma cor só.',
    },
    {
      id: 'DG3-M1-Q2', type: 'multiple_choice',
      prompt: 'O conta-gotas mostra R 0, G 0, B 0. Que cor é essa?',
      data: { options: [
        { id: 'a', text: 'Preto.', correct: true },
        { id: 'b', text: 'Branco.', porque: 'Branco é os três no máximo, 255.' },
        { id: 'c', text: 'Transparente.', porque: 'Transparência mora no quarto número, o alfa.' },
        { id: 'd', text: 'Cinza médio.', porque: 'Cinza médio tem os três por volta de 128.' },
      ]},
      explanation: 'Zero de vermelho, de verde e de azul é a tela apagada ali: preto.',
    },
    {
      id: 'DG3-M1-Q3', type: 'multiple_choice',
      prompt: 'O que a resolução de uma foto diz?',
      data: { options: [
        { id: 'a', text: 'Quantos pixels ela tem.', correct: true },
        { id: 'b', text: 'Quantas cores a câmera enxerga.', porque: 'Toda foto colorida usa os mesmos três números por pixel.' },
        { id: 'c', text: 'Quanto o arquivo pesa.', porque: 'O peso depende também do formato e da compressão.' },
        { id: 'd', text: 'Em que programa ela abre.', porque: 'O programa depende do formato, não da resolução.' },
      ]},
      explanation: 'Resolução é a largura e a altura em pixels: o quanto de detalhe a câmera conseguiu guardar.',
    },
    {
      id: 'DG3-M1-Q4', type: 'multiple_choice',
      prompt: 'Uma miniatura de 200 pixels é ampliada para 600. De onde vêm os pixels novos?',
      data: { options: [
        { id: 'a', text: 'O programa os inventa pela média.', correct: true },
        { id: 'b', text: 'A câmera os tinha guardado.', porque: 'A miniatura só tem 200 colunas; o resto nunca foi gravado.' },
        { id: 'c', text: 'Vêm da internet, de outra foto.', porque: 'O programa não busca nada fora do arquivo.' },
        { id: 'd', text: 'Vêm do ppi escrito no arquivo.', porque: 'O ppi só diz o tamanho no papel, não guarda pixel nenhum.' },
      ]},
      explanation: 'Cada pixel de antes vira nove, e os oito novos são a média dos vizinhos — é isso que borra a borda.',
    },
    {
      id: 'DG3-M1-Q5', type: 'multiple_choice',
      prompt: 'Por que o escudo em vetor pode ser ampliado sem borrar e a foto dele não?',
      data: { options: [
        { id: 'a', text: 'O vetor refaz a receita no tamanho novo.', correct: true },
        { id: 'b', text: 'O vetor guarda mais pixels que a foto.', porque: 'O vetor não guarda pixel nenhum: guarda formas.' },
        { id: 'c', text: 'A foto foi tirada com o celular errado.', porque: 'Qualquer foto borra ao ser ampliada além do que gravou.' },
        { id: 'd', text: 'O vetor tem resolução de 300 ppi.', porque: 'Vetor não tem ppi; ele é desenhado em qualquer tamanho.' },
      ]},
      explanation: 'O vetor guarda a forma e é redesenhado a cada tamanho. A foto só tem os pixels que gravou.',
    },
    {
      id: 'DG3-M1-Q6', type: 'true_false',
      prompt: 'Dar zoom de 1600% na tela não muda a resolução da foto.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O zoom só desenha os mesmos pixels maiores; o arquivo continua igual.' },
      ]},
      explanation: 'Zoom é jeito de olhar. A resolução só muda quando se reamostra a imagem.',
    },
    {
      id: 'DG3-M1-Q7', type: 'true_false',
      prompt: 'Um bom programa consegue ampliar uma foto e recuperar o detalhe que a câmera não gravou.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O que não foi gravado não existe no arquivo; o programa só pode inventar.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Ampliar sempre inventa o que falta, e inventar sempre borra.',
    },
  ],

  /* ── Módulo 2 — nivelar e recortar (requisito 4.1) ───────────────────── */
  'm2-teoria': [
    {
      id: 'DG3-M2-Q1', type: 'multiple_choice',
      prompt: 'Numa foto de paisagem, o que precisa ficar reto ao endireitar?',
      data: { options: [
        { id: 'a', text: 'O horizonte.', correct: true },
        { id: 'b', text: 'A barraca.', porque: 'A lona da barraca é inclinada de propósito, e engana.' },
        { id: 'c', text: 'As nuvens.', porque: 'Nuvem não tem linha reta nenhuma para servir de guia.' },
        { id: 'd', text: 'A borda da foto.', porque: 'A borda já é reta; o que entorta é o que está dentro.' },
      ]},
      explanation: 'A linha onde o chão encontra o fundo é a referência: se ela sobe de um lado, a foto está torta.',
    },
    {
      id: 'DG3-M2-Q2', type: 'multiple_choice',
      prompt: 'Depois de girar uma foto, o que aparece nos quatro cantos?',
      data: { options: [
        { id: 'a', text: 'Triângulos vazios, sem foto.', correct: true },
        { id: 'b', text: 'Pedaços repetidos da foto.', porque: 'Girar não copia nada; só deixa à mostra onde não há foto.' },
        { id: 'c', text: 'Nada, a foto continua igual.', porque: 'Um retângulo girado não cabe no mesmo retângulo.' },
        { id: 'd', text: 'A foto em preto e branco.', porque: 'Girar não mexe na cor de pixel nenhum.' },
      ]},
      explanation: 'O retângulo girado deixa quatro triângulos sem foto, e é por isso que girar e recortar andam juntos.',
    },
    {
      id: 'DG3-M2-Q3', type: 'multiple_choice',
      prompt: 'O recorte deixou um canto ainda vazio. O que fazer?',
      data: { options: [
        { id: 'a', text: 'Recortar mais para dentro.', correct: true },
        { id: 'b', text: 'Girar mais um pouco.', porque: 'Girar mais abre cantos maiores.' },
        { id: 'c', text: 'Exportar em PNG.', porque: 'O formato não enche o canto; só guarda o vazio.' },
        { id: 'd', text: 'Aumentar a exposição.', porque: 'Clarear não cria foto onde não há.' },
      ]},
      explanation: 'O recorte precisa caber inteiro na parte com foto; para dentro, os cantos vazios ficam de fora.',
    },
    {
      id: 'DG3-M2-Q4', type: 'multiple_choice',
      prompt: 'O que a regra dos terços sugere?',
      data: { options: [
        { id: 'a', text: 'Pôr o assunto perto de uma das linhas.', correct: true },
        { id: 'b', text: 'Cortar um terço de cada lado.', porque: 'A regra fala de onde pôr o assunto, não de quanto cortar.' },
        { id: 'c', text: 'Deixar o assunto no meio exato.', porque: 'É justamente o que ela sugere evitar, por deixar a foto parada.' },
        { id: 'd', text: 'Usar três fotos lado a lado.', porque: 'Ela divide um quadro só, em três por três.' },
      ]},
      explanation: 'O quadro dividido em três por três dá linhas onde o assunto costuma ficar mais vivo do que no centro.',
    },
    {
      id: 'DG3-M2-Q5', type: 'multiple_choice',
      prompt: 'Um recorte deixou a ponta da barraca para fora. Qual o problema?',
      data: { options: [
        { id: 'a', text: 'O assunto da foto foi cortado.', correct: true },
        { id: 'b', text: 'O arquivo vai pesar mais.', porque: 'Recortar só tira pixels; o arquivo fica menor.' },
        { id: 'c', text: 'O horizonte entortou de novo.', porque: 'Recortar não gira a foto.' },
        { id: 'd', text: 'A foto perdeu a transparência.', porque: 'Recorte não mexe no canal de transparência.' },
      ]},
      explanation: 'Cortar o assunto parece erro de quem tirou a foto. O recorte escolhe o quadro sem tirar o que importa.',
    },
    {
      id: 'DG3-M2-Q6', type: 'true_false',
      prompt: 'A foto saiu inclinada 3,5 graus para um lado. Endireita-se girando 3,5 graus para o outro.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Girar o mesmo tanto ao contrário desfaz a inclinação.' },
      ]},
      explanation: 'Endireitar é compensar a inclinação: o mesmo ângulo, no sentido contrário.',
    },
    {
      id: 'DG3-M2-Q7', type: 'true_false',
      prompt: 'Os pixels que o recorte tira continuam guardados no arquivo exportado.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O arquivo exportado só tem o retângulo escolhido; o resto se perdeu.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Por isso se guarda a foto original antes de recortar: ela é a única com a foto inteira.',
    },
  ],

  /* ── Módulo 3 — histograma e ajustes (requisito 4.2) ─────────────────── */
  'm3-teoria': [
    {
      id: 'DG3-M3-Q1', type: 'multiple_choice',
      prompt: 'O que o histograma mostra?',
      data: { options: [
        { id: 'a', text: 'Quantos pixels há em cada tom.', correct: true },
        { id: 'b', text: 'Quantas camadas a foto tem.', porque: 'As camadas aparecem no painel de camadas.' },
        { id: 'c', text: 'Quanto o arquivo pesa.', porque: 'O peso aparece ao exportar, não no histograma.' },
        { id: 'd', text: 'Em que dia a foto foi tirada.', porque: 'O histograma só conta tons.' },
      ]},
      explanation: 'Da esquerda (preto) à direita (branco), cada barra é quantos pixels têm aquele tom.',
    },
    {
      id: 'DG3-M3-Q2', type: 'multiple_choice',
      prompt: 'O histograma é um morro encostado na esquerda. Como está a foto?',
      data: { options: [
        { id: 'a', text: 'Escura.', correct: true },
        { id: 'b', text: 'Estourada.', porque: 'Estourada tem uma parede na direita, no branco.' },
        { id: 'c', text: 'Azulada.', porque: 'A cor puxada para o azul não aparece na posição do morro.' },
        { id: 'd', text: 'Torta.', porque: 'O histograma não sabe nada da posição do horizonte.' },
      ]},
      explanation: 'Pixels amontoados nos tons escuros: a foto pede exposição.',
    },
    {
      id: 'DG3-M3-Q3', type: 'multiple_choice',
      prompt: 'Qual ajuste conserta uma foto acinzentada, sem pretos nem brancos?',
      data: { options: [
        { id: 'a', text: 'Contraste.', correct: true },
        { id: 'b', text: 'Temperatura.', porque: 'Temperatura mexe na cor, entre azul e laranja.' },
        { id: 'c', text: 'Recorte.', porque: 'Recortar muda o quadro, não os tons.' },
        { id: 'd', text: 'Carimbo.', porque: 'O carimbo copia pedaços, não afasta tons.' },
      ]},
      explanation: 'O contraste afasta os tons do meio, e o morro estreito se abre para os dois lados.',
    },
    {
      id: 'DG3-M3-Q4', type: 'multiple_choice',
      prompt: 'Como conferir se a temperatura ficou certa?',
      data: { options: [
        { id: 'a', text: 'Ler no conta-gotas algo que é branco.', correct: true },
        { id: 'b', text: 'Ver se o céu ficou bem azul.', porque: 'O céu pode sair azul demais justamente por a foto estar fria.' },
        { id: 'c', text: 'Ver se o histograma ficou no meio.', porque: 'O histograma mostra luz, e a temperatura é cor.' },
        { id: 'd', text: 'Ver se o arquivo ficou menor.', porque: 'A temperatura não muda o tamanho do arquivo.' },
      ]},
      explanation: 'Num branco de verdade, como a placa, vermelho, verde e azul precisam ficar parecidos.',
    },
    {
      id: 'DG3-M3-Q5', type: 'multiple_choice',
      prompt: 'Depois de muito contraste, o histograma ganhou uma parede na direita. O que aconteceu?',
      data: { options: [
        { id: 'a', text: 'Os claros estouraram e perderam detalhe.', correct: true },
        { id: 'b', text: 'A foto ficou escura demais.', porque: 'Escuro demais seria uma parede na esquerda.' },
        { id: 'c', text: 'A foto ficou com o contraste ideal.', porque: 'Parede é sinal de que passou do ponto.' },
        { id: 'd', text: 'Nada; a parede é normal.', porque: 'Parede no branco quer dizer pixels que viraram branco puro.' },
      ]},
      explanation: 'Branco estourado é detalhe que se perdeu, e escurecer depois não o traz de volta.',
    },
    {
      id: 'DG3-M3-Q6', type: 'true_false',
      prompt: 'Uma foto fria, azulada, se conserta puxando a temperatura para o quente.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Puxar para o laranja compensa o azul a mais.' },
      ]},
      explanation: 'A temperatura vai do azul ao laranja; fria pede o lado quente até o branco voltar a ser branco.',
    },
    {
      id: 'DG3-M3-Q7', type: 'true_false',
      prompt: 'Branco estourado volta a ter detalhe se a exposição for baixada depois.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O detalhe já virou branco puro; baixar só deixa o branco cinza.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Por isso se ajusta aos poucos, olhando o histograma, antes de chegar à parede.',
    },
  ],

  /* ── Módulo 4 — o carimbo (requisito 4.3) ────────────────────────────── */
  'm4-teoria': [
    {
      id: 'DG3-M4-Q1', type: 'multiple_choice',
      prompt: 'O que o carimbo faz?',
      data: { options: [
        { id: 'a', text: 'Copia um pedaço da foto para outro lugar.', correct: true },
        { id: 'b', text: 'Pinta com uma cor escolhida.', porque: 'Isso é o pincel.' },
        { id: 'c', text: 'Apaga e deixa transparente.', porque: 'Isso é excluir uma seleção.' },
        { id: 'd', text: 'Escolhe pixels de cor parecida.', porque: 'Isso é a varinha.' },
      ]},
      explanation: 'Cada pincelada copia o que está na origem para onde se pinta.',
    },
    {
      id: 'DG3-M4-Q2', type: 'multiple_choice',
      prompt: 'Para tirar a garrafa do chão, onde fica a origem do carimbo?',
      data: { options: [
        { id: 'a', text: 'Na grama limpa, ao lado.', correct: true },
        { id: 'b', text: 'No céu, que é liso.', porque: 'Céu copiado no chão vira uma mancha azul.' },
        { id: 'c', text: 'Em cima da própria garrafa.', porque: 'Copiaria a garrafa sobre ela mesma.' },
        { id: 'd', text: 'Na grama longe, perto da serra.', porque: 'Grama de longe tem outro tamanho e outra luz.' },
      ]},
      explanation: 'Grama perto e na mesma altura tem o mesmo tamanho e a mesma luz, e o remendo some.',
    },
    {
      id: 'DG3-M4-Q3', type: 'multiple_choice',
      prompt: 'Pintar a garrafa com um verde parecido deixa o quê?',
      data: { options: [
        { id: 'a', text: 'Uma mancha lisa, sem textura.', correct: true },
        { id: 'b', text: 'Grama perfeita.', porque: 'Grama tem um tom por folha; tinta tem um só.' },
        { id: 'c', text: 'Um buraco transparente.', porque: 'Pintar cobre; quem deixa transparente é excluir.' },
        { id: 'd', text: 'A garrafa ainda visível.', porque: 'A garrafa some; o que aparece é a mancha.' },
      ]},
      explanation: 'Sem a variação de tons da grama, a mancha aparece de longe mesmo com a cor certa.',
    },
    {
      id: 'DG3-M4-Q4', type: 'multiple_choice',
      prompt: 'O que é textura, numa foto?',
      data: { options: [
        { id: 'a', text: 'A variação miúda de tons.', correct: true },
        { id: 'b', text: 'O formato do arquivo.', porque: 'Formato é como o arquivo guarda os pixels.' },
        { id: 'c', text: 'A cor média de uma área.', porque: 'A média apaga justamente a variação.' },
        { id: 'd', text: 'O brilho da foto inteira.', porque: 'Brilho é exposição.' },
      ]},
      explanation: 'É a textura que faz o olho reconhecer grama, areia ou lona, e é ela que o carimbo copia.',
    },
    {
      id: 'DG3-M4-Q5', type: 'multiple_choice',
      prompt: 'Depois de carimbar, a grama mostra o mesmo tufo repetido três vezes. O que houve?',
      data: { options: [
        { id: 'a', text: 'Clicou-se várias vezes no mesmo ponto.', correct: true },
        { id: 'b', text: 'A origem estava longe demais.', porque: 'Longe daria grama diferente, e não repetida.' },
        { id: 'c', text: 'O raio estava pequeno demais.', porque: 'Raio pequeno pede mais pinceladas, não repete o tufo.' },
        { id: 'd', text: 'A foto estava escura.', porque: 'A luz não faz o carimbo repetir nada.' },
      ]},
      explanation: 'Cada clique no mesmo lugar copia o mesmo pedaço, e o olho acha o desenho repetido.',
    },
    {
      id: 'DG3-M4-Q6', type: 'true_false',
      prompt: 'A origem do carimbo anda junto com o pincel, sempre à mesma distância.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'É assim que cada pincelada copia o vizinho certo da área que se pinta.' },
      ]},
      explanation: 'A distância entre origem e pincel fica fixa durante a pincelada.',
    },
    {
      id: 'DG3-M4-Q7', type: 'true_false',
      prompt: 'Tirar a garrafa com o carimbo também clareia a barraca.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O carimbo só mexe onde se pinta; o resto fica como estava.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Uma boa remoção só muda o lugar da garrafa. A barraca, a placa e o céu ficam iguais.',
    },
  ],

  /* ── Módulo 5 — camadas e máscara (requisito 4.6) ────────────────────── */
  'm5-teoria': [
    {
      id: 'DG3-M5-Q1', type: 'multiple_choice',
      prompt: 'O que é uma camada?',
      data: { options: [
        { id: 'a', text: 'Uma folha da imagem, empilhada.', correct: true },
        { id: 'b', text: 'Um arquivo de outro formato.', porque: 'As camadas moram dentro de um arquivo só.' },
        { id: 'c', text: 'Uma faixa de tons do histograma.', porque: 'O histograma conta tons da imagem inteira.' },
        { id: 'd', text: 'O canal de transparência.', porque: 'O alfa é um número de cada pixel.' },
      ]},
      explanation: 'O que está na camada de cima aparece por cima da de baixo, como papel vegetal empilhado.',
    },
    {
      id: 'DG3-M5-Q2', type: 'multiple_choice',
      prompt: 'Por que duplicar a camada antes de ajustar?',
      data: { options: [
        { id: 'a', text: 'Para a original ficar intacta embaixo.', correct: true },
        { id: 'b', text: 'Para a foto ficar duas vezes mais clara.', porque: 'A cópia só aparece por cima; não soma luz.' },
        { id: 'c', text: 'Para o arquivo ficar menor.', porque: 'Uma camada a mais deixa o arquivo maior.' },
        { id: 'd', text: 'Porque o programa só ajusta cópias.', porque: 'Dá para ajustar a única camada, mas sem volta.' },
      ]},
      explanation: 'Se a cópia der errado, basta escondê-la ou apagá-la: a de baixo está como chegou.',
    },
    {
      id: 'DG3-M5-Q3', type: 'multiple_choice',
      prompt: 'Numa máscara, o que faz o preto?',
      data: { options: [
        { id: 'a', text: 'Esconde a camada ali.', correct: true },
        { id: 'b', text: 'Pinta a camada de preto.', porque: 'A máscara não pinta a foto; diz onde ela aparece.' },
        { id: 'c', text: 'Mostra a camada ali.', porque: 'Quem mostra é o branco.' },
        { id: 'd', text: 'Apaga os pixels para sempre.', porque: 'O pixel continua lá; pintar de branco o traz de volta.' },
      ]},
      explanation: 'Preto esconde e branco mostra: a camada some onde a máscara é preta e deixa ver a de baixo.',
    },
    {
      id: 'DG3-M5-Q4', type: 'multiple_choice',
      prompt: 'Clarear a foto inteira estourou o céu. Como clarear só a barraca?',
      data: { options: [
        { id: 'a', text: 'Cópia clareada com máscara na barraca.', correct: true },
        { id: 'b', text: 'Mais exposição na foto inteira.', porque: 'É o que estourou o céu.' },
        { id: 'c', text: 'Pintar a barraca de laranja claro.', porque: 'Pintar apaga a textura da lona.' },
        { id: 'd', text: 'Recortar só a barraca.', porque: 'O recorte jogaria fora o resto da foto.' },
      ]},
      explanation: 'A cópia clara aparece só onde a máscara é branca, e o céu continua o da camada de baixo.',
    },
    {
      id: 'DG3-M5-Q5', type: 'multiple_choice',
      prompt: 'A varinha escolheu a barraca. O que a máscara faz com essa seleção?',
      data: { options: [
        { id: 'a', text: 'Nasce branca nela e preta fora.', correct: true },
        { id: 'b', text: 'Apaga a barraca.', porque: 'Apagar seria excluir a seleção.' },
        { id: 'c', text: 'Copia a barraca para outra camada.', porque: 'Isso seria duplicar.' },
        { id: 'd', text: 'Nasce preta nela e branca fora.', porque: 'Assim a camada apareceria em tudo menos na barraca.' },
      ]},
      explanation: 'A máscara criada a partir da seleção mostra a camada só no que estava selecionado.',
    },
    {
      id: 'DG3-M5-Q6', type: 'true_false',
      prompt: 'Pintar de branco numa parte preta da máscara faz a camada aparecer de novo ali.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'A máscara só esconde; o pixel da camada continua guardado.' },
      ]},
      explanation: 'É a vantagem da máscara sobre a borracha: dá para voltar atrás.',
    },
    {
      id: 'DG3-M5-Q7', type: 'true_false',
      prompt: 'Depois de achatar a imagem, ainda dá para esconder a camada de cima.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Achatar junta tudo numa camada só; a de cima deixa de existir.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Achatar é o último passo, e só se faz quando não há mais o que mexer.',
    },
  ],

  /* ── Módulo 6 — transparência (requisitos 2.4 e 4.4) ─────────────────── */
  'm6-teoria': [
    {
      id: 'DG3-M6-Q1', type: 'multiple_choice',
      prompt: 'O que o canal de transparência guarda?',
      data: { options: [
        { id: 'a', text: 'O quanto cada pixel cobre.', correct: true },
        { id: 'b', text: 'A cor do fundo da foto.', porque: 'A cor fica em vermelho, verde e azul.' },
        { id: 'c', text: 'O nome de quem tirou a foto.', porque: 'Isso não mora em pixel nenhum.' },
        { id: 'd', text: 'Quantas camadas há.', porque: 'O alfa é um número por pixel, não por arquivo.' },
      ]},
      explanation: 'O alfa vai de 0, transparente, a 255, opaco.',
    },
    {
      id: 'DG3-M6-Q2', type: 'multiple_choice',
      prompt: 'O que o xadrez cinza e branco atrás do escudo significa?',
      data: { options: [
        { id: 'a', text: 'Ali não há nada.', correct: true },
        { id: 'b', text: 'O fundo virou xadrez.', porque: 'O xadrez é só o desenho do programa; ele não vai para o arquivo.' },
        { id: 'c', text: 'A foto está com defeito.', porque: 'É o jeito normal de mostrar transparência.' },
        { id: 'd', text: 'Ali a foto está cinza.', porque: 'Cinza seria um pixel opaco, sem xadrez.' },
      ]},
      explanation: 'O programa desenha o transparente como xadrez para que se veja onde ele está.',
    },
    {
      id: 'DG3-M6-Q3', type: 'multiple_choice',
      prompt: 'A varinha escolheu a mesa e também a borda amarela do escudo. O que mudar?',
      data: { options: [
        { id: 'a', text: 'Baixar a tolerância.', correct: true },
        { id: 'b', text: 'Subir a tolerância.', porque: 'Subir escolhe ainda mais tons parecidos.' },
        { id: 'c', text: 'Exportar em JPG.', porque: 'O formato não muda o que foi escolhido.' },
        { id: 'd', text: 'Aumentar o contraste.', porque: 'O problema é a seleção, não a foto.' },
      ]},
      explanation: 'Tolerância é o quanto a cor pode diferir da clicada. Alta demais pega o que não é mesa.',
    },
    {
      id: 'DG3-M6-Q4', type: 'multiple_choice',
      prompt: 'A mesa tem vários tons. Como escolher todos com a varinha?',
      data: { options: [
        { id: 'a', text: 'Clicar com Shift para somar.', correct: true },
        { id: 'b', text: 'Clicar várias vezes sem Shift.', porque: 'Sem Shift, cada clique troca a seleção em vez de somar.' },
        { id: 'c', text: 'Pôr a tolerância no máximo.', porque: 'No máximo ela escolhe a foto inteira, escudo junto.' },
        { id: 'd', text: 'Usar o carimbo.', porque: 'O carimbo copia pixels; não seleciona.' },
      ]},
      explanation: 'Cada clique com Shift acrescenta um pedaço à seleção, até a mesa inteira estar escolhida.',
    },
    {
      id: 'DG3-M6-Q5', type: 'multiple_choice',
      prompt: 'O escudo sem fundo foi exportado em JPG. O que aparece no cartaz?',
      data: { options: [
        { id: 'a', text: 'O escudo num retângulo branco.', correct: true },
        { id: 'b', text: 'O escudo sem fundo.', porque: 'O JPG não tem canal de transparência.' },
        { id: 'c', text: 'O xadrez cinza atrás do escudo.', porque: 'O xadrez nunca vai para o arquivo.' },
        { id: 'd', text: 'A mesa de volta, inteira.', porque: 'A mesa foi apagada; o que volta é um fundo branco.' },
      ]},
      explanation: 'Sem alfa, o transparente vira uma cor sólida. PNG e WEBP guardam o canal; JPG não.',
    },
    {
      id: 'DG3-M6-Q6', type: 'true_false',
      prompt: 'Um pixel com alfa zero não aparece, qualquer que seja a cor dele.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Alfa zero quer dizer que o pixel não cobre nada.' },
      ]},
      explanation: 'Com alfa zero a cor fica guardada, mas não é desenhada.',
    },
    {
      id: 'DG3-M6-Q7', type: 'true_false',
      prompt: 'Para o escudo sem fundo, o JPG é melhor por ser menor.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Menor não adianta se o fundo volta branco.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O arquivo certo é o que guarda a transparência, mesmo maior.',
    },
  ],

  /* ── Módulo 7 — pontos por polegada (requisitos 2.2 e 4.5) ───────────── */
  'm7-teoria': [
    {
      id: 'DG3-M7-Q1', type: 'multiple_choice',
      prompt: 'O que o ppi diz?',
      data: { options: [
        { id: 'a', text: 'Quantos pixels vão em cada polegada de papel.', correct: true },
        { id: 'b', text: 'Quantos pixels a foto tem.', porque: 'Isso é a resolução, largura por altura.' },
        { id: 'c', text: 'Quanto o arquivo pesa.', porque: 'O peso vem do formato e da compressão.' },
        { id: 'd', text: 'A nitidez da foto na tela.', porque: 'A tela ignora o ppi.' },
      ]},
      explanation: 'Pontos por polegada: quantos pixels a impressora põe em cada 2,54 cm de papel.',
    },
    {
      id: 'DG3-M7-Q2', type: 'multiple_choice',
      prompt: 'Uma foto de 1800 pixels de largura, a 300 ppi, sai com quantos centímetros?',
      data: { options: [
        { id: 'a', text: 'Cerca de 15 cm.', correct: true },
        { id: 'b', text: 'Cerca de 63 cm.', porque: 'Esse é o tamanho a 72 ppi.' },
        { id: 'c', text: 'Cerca de 6 cm.', porque: 'Seriam 6 polegadas, e cada polegada tem 2,54 cm.' },
        { id: 'd', text: 'Cerca de 300 cm.', porque: 'O ppi divide os pixels, não multiplica.' },
      ]},
      explanation: '1800 ÷ 300 = 6 polegadas, e 6 × 2,54 dá 15,2 cm.',
    },
    {
      id: 'DG3-M7-Q3', type: 'multiple_choice',
      prompt: 'Mudar o ppi sem reamostrar muda o quê?',
      data: { options: [
        { id: 'a', text: 'Só o tamanho no papel.', correct: true },
        { id: 'b', text: 'Os pixels da foto.', porque: 'Sem reamostrar, nenhum pixel muda.' },
        { id: 'c', text: 'A nitidez na tela do celular.', porque: 'A tela não lê o ppi.' },
        { id: 'd', text: 'O formato do arquivo.', porque: 'O formato é escolhido ao exportar.' },
      ]},
      explanation: 'O ppi é só um número escrito no arquivo; sem reamostrar, os pixels ficam os mesmos.',
    },
    {
      id: 'DG3-M7-Q4', type: 'multiple_choice',
      prompt: 'A foto vai para o site do clube. Qual arquivo serve?',
      data: { options: [
        { id: 'a', text: 'Um de uns 1080 pixels de largura.', correct: true },
        { id: 'b', text: 'O de 4000 pixels, por ser melhor.', porque: 'A tela não mostra mais que a largura dela; só fica lenta.' },
        { id: 'c', text: 'Um de 300 ppi.', porque: 'A tela ignora o ppi; o que conta são os pixels.' },
        { id: 'd', text: 'Um TIFF sem compressão.', porque: 'TIFF é pesado e para a gráfica, não para o site.' },
      ]},
      explanation: 'Na tela o que importa são os pixels: uns mil já enchem a tela do celular.',
    },
    {
      id: 'DG3-M7-Q5', type: 'multiple_choice',
      prompt: 'A gráfica pediu 300 ppi, e a foto só tem pixels para 72. Subir o ppi reamostrando resolve?',
      data: { options: [
        { id: 'a', text: 'Não: os pixels novos são inventados.', correct: true },
        { id: 'b', text: 'Sim: a foto fica mais nítida.', porque: 'Reamostrar para mais é ampliar, e ampliar borra.' },
        { id: 'c', text: 'Sim, se for exportada em PNG.', porque: 'O formato não cria detalhe.' },
        { id: 'd', text: 'Não, porque a gráfica não lê ppi.', porque: 'A gráfica lê o ppi; o problema são os pixels que faltam.' },
      ]},
      explanation: 'O número fica certo e a foto continua sem o detalhe, igual a ampliar.',
    },
    {
      id: 'DG3-M7-Q6', type: 'true_false',
      prompt: 'O celular mostra a foto pelo número de pixels, e não pelo ppi.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'A tela ignora o ppi; ela conta pixels.' },
      ]},
      explanation: 'É por isso que o arquivo da tela e o do papel são diferentes.',
    },
    {
      id: 'DG3-M7-Q7', type: 'true_false',
      prompt: 'Do arquivo pequeno, feito para a tela, dá para voltar ao grande sem perder nada.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Os pixels jogados fora ao reduzir não voltam.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Reduz-se a cópia, nunca a única foto que se tem.',
    },
  ],

  /* ── Módulo 8 — formatos (requisitos 2.3, 2.5 e 5) ───────────────────── */
  'm8-teoria': [
    {
      id: 'DG3-M8-Q1', type: 'multiple_choice',
      prompt: 'O que a compressão com perda faz?',
      data: { options: [
        { id: 'a', text: 'Joga fora detalhe que o olho quase não vê.', correct: true },
        { id: 'b', text: 'Guarda cada pixel exatamente igual.', porque: 'Isso é a compressão sem perda.' },
        { id: 'c', text: 'Apaga a foto depois de enviada.', porque: 'Perda é de detalhe, não do arquivo.' },
        { id: 'd', text: 'Tira a cor da foto.', porque: 'A foto continua colorida.' },
      ]},
      explanation: 'O pixel volta parecido, não igual: é a troca do JPG e do WEBP por um arquivo pequeno.',
    },
    {
      id: 'DG3-M8-Q2', type: 'multiple_choice',
      prompt: 'Qual formato é sem perda e guarda transparência?',
      data: { options: [
        { id: 'a', text: 'PNG.', correct: true },
        { id: 'b', text: 'JPG.', porque: 'O JPG é com perda e não tem transparência.' },
        { id: 'c', text: 'Nenhum dos quatro.', porque: 'O PNG faz as duas coisas.' },
        { id: 'd', text: 'Só o vetor.', porque: 'A pergunta é sobre formatos de imagem de pontos.' },
      ]},
      explanation: 'O PNG devolve cada pixel como era e guarda o alfa: serve a emblema e captura de tela.',
    },
    {
      id: 'DG3-M8-Q3', type: 'multiple_choice',
      prompt: 'Que formato se entrega à gráfica para imprimir uma foto?',
      data: { options: [
        { id: 'a', text: 'TIFF.', correct: true },
        { id: 'b', text: 'WEBP.', porque: 'O WEBP é feito para a tela, e com perda.' },
        { id: 'c', text: 'JPG de qualidade baixa.', porque: 'Qualidade baixa aparece no papel em quadradinhos.' },
        { id: 'd', text: 'Uma captura de tela.', porque: 'A captura tem os pixels da tela, poucos para o papel.' },
      ]},
      explanation: 'O TIFF é sem perda e leva o ppi escrito: pesado, e é o que a impressão pede.',
    },
    {
      id: 'DG3-M8-Q4', type: 'multiple_choice',
      prompt: 'Baixando a qualidade do JPG, apareceram quadradinhos no céu. O que significa?',
      data: { options: [
        { id: 'a', text: 'A perda começou a se ver.', correct: true },
        { id: 'b', text: 'A foto ficou com mais pixels.', porque: 'A qualidade não muda a largura nem a altura.' },
        { id: 'c', text: 'O arquivo ficou maior.', porque: 'Baixar a qualidade deixa o arquivo menor.' },
        { id: 'd', text: 'A foto ganhou transparência.', porque: 'O JPG não tem transparência em qualidade nenhuma.' },
      ]},
      explanation: 'Os quadradinhos são o detalhe que a compressão jogou fora. É hora de subir a qualidade.',
    },
    {
      id: 'DG3-M8-Q5', type: 'multiple_choice',
      prompt: 'Depois de otimizar a foto, por que guardar o arquivo original?',
      data: { options: [
        { id: 'a', text: 'Para mostrar o antes e o depois.', correct: true },
        { id: 'b', text: 'Porque o otimizado não abre.', porque: 'O otimizado abre normalmente.' },
        { id: 'c', text: 'Porque o original é menor.', porque: 'O original é o maior dos dois.' },
        { id: 'd', text: 'Porque o JPG exige dois arquivos.', porque: 'Um JPG é um arquivo só.' },
      ]},
      explanation: 'O examinador pede os dois, e o original é também o único de onde editar de novo.',
    },
    {
      id: 'DG3-M8-Q6', type: 'true_false',
      prompt: 'Abrir e salvar o mesmo JPG várias vezes vai perdendo um pouco a cada vez.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Cada salvamento comprime de novo, e joga fora mais um pouco.' },
      ]},
      explanation: 'Por isso se edita sempre a partir do original, e se exporta uma vez.',
    },
    {
      id: 'DG3-M8-Q7', type: 'true_false',
      prompt: 'O PNG é o melhor formato para foto na página do clube.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Para foto o PNG fica muito maior que o JPG, e a página fica lenta.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Foto na tela pede JPG ou WEBP; o PNG é para emblema e captura.',
    },
  ],

  /* ── Módulo 9 — direitos de imagem (requisito 6) ─────────────────────── */
  'm9-teoria': [
    {
      id: 'DG3-M9-Q1', type: 'multiple_choice',
      prompt: 'Uma imagem achada na busca, sem licença escrita, é de que tipo?',
      data: { options: [
        { id: 'a', text: 'Protegida.', correct: true },
        { id: 'b', text: 'Livre, porque estava na internet.', porque: 'Estar na internet não dá permissão de uso.' },
        { id: 'c', text: 'Sua, porque você achou.', porque: 'Achar não é criar.' },
        { id: 'd', text: 'De domínio público.', porque: 'Domínio público precisa estar dito, ou a obra ser muito antiga.' },
      ]},
      explanation: 'Toda imagem nasce protegida por direito autoral. Não dizer nada não é permitir.',
    },
    {
      id: 'DG3-M9-Q2', type: 'multiple_choice',
      prompt: 'Um colega fez um desenho e mandou para você ver. Ele é de quem?',
      data: { options: [
        { id: 'a', text: 'Do colega.', correct: true },
        { id: 'b', text: 'Seu, porque ele mandou.', porque: 'Mostrar não é dar.' },
        { id: 'c', text: 'Do clube.', porque: 'Quem fez é o colega, e não o clube.' },
        { id: 'd', text: 'De ninguém.', porque: 'Toda obra criada tem autor.' },
      ]},
      explanation: 'Para usá-lo num cartaz, peça a ele.',
    },
    {
      id: 'DG3-M9-Q3', type: 'multiple_choice',
      prompt: 'Uma foto marcada CC BY pode ser usada como?',
      data: { options: [
        { id: 'a', text: 'Com o crédito de quem fez.', correct: true },
        { id: 'b', text: 'De qualquer jeito, sem dizer nada.', porque: 'Sem pedir nada é a CC0.' },
        { id: 'c', text: 'Só pagando ao autor.', porque: 'A licença já deixa usar, sem pagar.' },
        { id: 'd', text: 'Nunca; ela é protegida.', porque: 'A licença é justamente a permissão escrita.' },
      ]},
      explanation: 'BY quer dizer "por": a licença pede o nome de quem fez junto da imagem.',
    },
    {
      id: 'DG3-M9-Q4', type: 'multiple_choice',
      prompt: 'Qual destas é uma fonte confiável de imagens de uso permitido?',
      data: { options: [
        { id: 'a', text: 'Wikimedia Commons.', correct: true },
        { id: 'b', text: 'A busca de imagens de um buscador.', porque: 'Ela acha imagens de qualquer lugar e não garante licença.' },
        { id: 'c', text: 'Um painel de imagens salvas.', porque: 'Quem salvou nem sempre era o dono.' },
        { id: 'd', text: 'Um site de papel de parede grátis.', porque: 'Grátis para baixar não quer dizer licença para usar.' },
      ]},
      explanation: 'Fonte confiável diz, em cada imagem, quem fez e com que licença.',
    },
    {
      id: 'DG3-M9-Q5', type: 'multiple_choice',
      prompt: 'O que o crédito de uma imagem CC BY precisa dizer?',
      data: { options: [
        { id: 'a', text: 'Autor, licença e onde estava.', correct: true },
        { id: 'b', text: 'Só a palavra "internet".', porque: 'Não diz quem fez, que é o que a licença pede.' },
        { id: 'c', text: 'O seu nome.', porque: 'O crédito é de quem fez a imagem.' },
        { id: 'd', text: 'A data em que foi baixada.', porque: 'A data não identifica o autor nem a licença.' },
      ]},
      explanation: '"Foto: Ana Lima, CC BY 4.0, via Wikimedia Commons" — quem, com que licença, e de onde.',
    },
    {
      id: 'DG3-M9-Q6', type: 'true_false',
      prompt: 'A foto que você tirou no acampamento é sua.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Quem fotografa é o autor da foto.' },
      ]},
      explanation: 'Você decide o que fazer com ela, inclusive dar uma licença livre.',
    },
    {
      id: 'DG3-M9-Q7', type: 'true_false',
      prompt: 'Escrever "créditos ao autor" torna livre uma imagem protegida.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O crédito é o que a licença livre pede, e não o que a substitui.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Sem licença do autor, a imagem continua protegida, com ou sem nome embaixo.',
    },
  ],

  /* ── Módulo 10 — a edição completa (requisito 7) ─────────────────────── */
  'm10-teoria': [
    {
      id: 'DG3-M10-Q1', type: 'multiple_choice',
      prompt: 'Qual passo vem primeiro numa edição?',
      data: { options: [
        { id: 'a', text: 'Endireitar e recortar.', correct: true },
        { id: 'b', text: 'Tirar a garrafa.', porque: 'O recorte ainda pode jogá-la fora.' },
        { id: 'c', text: 'Ajustar a temperatura.', porque: 'Não adianta acertar a cor do que vai ser cortado.' },
        { id: 'd', text: 'Exportar.', porque: 'Exportar é o último passo.' },
      ]},
      explanation: 'Do maior para o menor: primeiro o quadro, depois a luz, por fim os detalhes.',
    },
    {
      id: 'DG3-M10-Q2', type: 'multiple_choice',
      prompt: 'Por que tirar a garrafa depois de ajustar a luz?',
      data: { options: [
        { id: 'a', text: 'A origem já tem a cor final.', correct: true },
        { id: 'b', text: 'O carimbo só funciona em foto clara.', porque: 'O carimbo funciona em qualquer luz.' },
        { id: 'c', text: 'A garrafa some sozinha ao clarear.', porque: 'Clarear não tira objeto nenhum.' },
        { id: 'd', text: 'Porque o programa exige essa ordem.', porque: 'O programa aceita qualquer ordem; a escolha é de quem edita.' },
      ]},
      explanation: 'Escolhida depois do ajuste, a grama de origem já é a grama que vai ficar na foto.',
    },
    {
      id: 'DG3-M10-Q3', type: 'multiple_choice',
      prompt: 'Qual é o jeito honesto de mostrar a edição ao examinador?',
      data: { options: [
        { id: 'a', text: 'Antes e depois, lado a lado.', correct: true },
        { id: 'b', text: 'Só a editada, a mais bonita.', porque: 'Sem o antes, não se vê o que foi feito.' },
        { id: 'c', text: 'Só a original.', porque: 'Sem o depois, não há edição para mostrar.' },
        { id: 'd', text: 'A editada em tamanho maior.', porque: 'Tamanhos diferentes atrapalham a comparação.' },
      ]},
      explanation: 'No mesmo tamanho, lado a lado, aparece o que cada passo mudou.',
    },
    {
      id: 'DG3-M10-Q4', type: 'multiple_choice',
      prompt: 'A editada foi exportada com o nome da original. O que se perdeu?',
      data: { options: [
        { id: 'a', text: 'O antes.', correct: true },
        { id: 'b', text: 'A edição inteira.', porque: 'A editada foi salva; o que sumiu foi a de antes.' },
        { id: 'c', text: 'Nada; o programa guarda as duas.', porque: 'Mesmo nome escreve por cima.' },
        { id: 'd', text: 'Só o ppi.', porque: 'Sumiu o arquivo inteiro de antes.' },
      ]},
      explanation: 'Exportar com o mesmo nome escreve por cima, e sem o original não há antes para mostrar.',
    },
    {
      id: 'DG3-M10-Q5', type: 'multiple_choice',
      prompt: 'No antes e depois, o céu da editada está todo branco. O que isso indica?',
      data: { options: [
        { id: 'a', text: 'Algum ajuste passou do ponto.', correct: true },
        { id: 'b', text: 'A edição ficou perfeita.', porque: 'Céu branco puro é detalhe perdido.' },
        { id: 'c', text: 'O céu foi apagado com a varinha.', porque: 'Apagado ficaria transparente, em xadrez.' },
        { id: 'd', text: 'A foto foi tirada à noite.', porque: 'O antes mostra o céu da tarde.' },
      ]},
      explanation: 'É para isso que se compara: o lado a lado mostra também o que estourou.',
    },
    {
      id: 'DG3-M10-Q6', type: 'true_false',
      prompt: 'Ao mostrar a edição, vale dizer o que cada passo mudou e por quê.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'É isso que mostra que a edição foi decidida, e não acaso.' },
      ]},
      explanation: 'A pergunta de cada lição — o que este controle conserta? — é a que o examinador faz.',
    },
    {
      id: 'DG3-M10-Q7', type: 'true_false',
      prompt: 'Uma boa edição sempre aparece bem na primeira olhada.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Uma edição boa às vezes nem parece edição; o lado a lado é que mostra.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Horizonte reto e luz certa parecem naturais: só a comparação revela o trabalho.',
    },
  ],
};
