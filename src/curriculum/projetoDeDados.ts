import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DO_PROJETO_DE_DADOS } from './questoesDoProjetoDeDados';

/*
 * A vereda CC-ES013 Projeto de Dados.
 *
 * ── O que ela é ─────────────────────────────────────────────────────────
 * A segunda vereda de integração, e a do lado dos números. As contas já foram
 * ensinadas: as medidas e a comparação de grupos na CC-ES009, a dispersão e a
 * reta na CC-ES010, e a fala de dez minutos na CC-ES011 — as duas últimas são
 * as que o requisito 1 exige antes desta.
 *
 * O que ela ensina é o que nenhuma delas podia ensinar: uma pergunta que alguém
 * fez **antes** de olhar o dado, uma base que chega suja e precisa ser limpa
 * sem deixar de existir como chegou, e uma resposta que vai para quem decide.
 * As veredas anteriores entregavam a base fechada e arrumada; aqui arrumá-la é
 * o trabalho, e a bruta continuar bruta é a condição.
 *
 * ── A base é o clube que a CC-ES009 já conhece ──────────────────────────
 * Os mesmos sessenta e um membros, com os nomes, as unidades e as idades de
 * lá, e a pergunta é a deles: quem mora mais longe falta mais às reuniões? Os
 * números que a teoria cita saem dessa base pelo mesmo motor que responde ao
 * desbravador, e `exemplosDoProjetoDeDados.test.ts` os confere.
 *
 * ── E o que ela não confere ─────────────────────────────────────────────
 * O requisito 8 pede apresentar a público real do clube. Isso acontece fora
 * do aplicativo: o que a plataforma faz é preparar o roteiro e guardar o
 * registro do que aconteceu.
 *
 * ── O quadro de resultado fica desligado ────────────────────────────────
 * Os exemplos daqui são trechos de base, contas e roteiros, e não há o que
 * executar.
 */

const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], exemplo: string, atencao: string, marcas: string[],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, exemplo, exemploComo: 'texto' as const, atencao, marcas,
});

/* ── Módulo 1: a proposta ─────────────────────────────────────────────────── */

const A_PROPOSTA: TopicoDeVereda[] = [
  t(
    'a-pergunta-antes-do-dado',
    'A pergunta vem antes do dado',
    'Quem olha a base primeiro escreve a pergunta que ela já respondeu.',
    [
      'O requisito 2 pede uma proposta escrita, aprovada pelo examinador, e diz que a execução **não pode começar** antes da aprovação. Num projeto de dados isso pesa mais do que em qualquer outro: o perigo não é só fazer o trabalho errado, é fazer a pergunta errada.',
      'Quem abre a base antes de escrever a pergunta encontra alguma coisa interessante — sempre encontra — e escreve a pergunta que aquele achado responde. A análise sai bonita e não serve a ninguém, porque ninguém tinha perguntado aquilo.',
      'Uma pergunta é diferente de um assunto. "A presença no clube" é um assunto: qualquer gráfico serve e nenhum responde. "Quem mora mais longe falta mais às reuniões?" é uma pergunta, e o dado pode dizer sim ou não.',
    ],
    `Assunto ou pergunta?

  A presença no clube                        assunto
  Presença e distância                       assunto
  Quem mora mais longe falta mais?           pergunta
  A carona faz alguém vir mais?              pergunta`,
    'O ponto de interrogação é a parte fácil. O teste de verdade é: dá para responder com um número?',
    ['proposta antes', 'pergunta e assunto'],
  ),
  t(
    'quem-decide-o-que',
    'Quem decide, e o quê',
    'Um projeto de dados existe para alguém fazer alguma coisa com o resultado.',
    [
      'A proposta pede três coisas: a pergunta, a **origem dos dados** e **quem vai tomar alguma decisão** a partir do resultado. A terceira é a que separa um projeto de uma curiosidade.',
      'Dizer só "a diretoria" não basta. Que decisão a diretoria vai tomar? "Se monta uma lista de carona para o segundo semestre, e para quem" é uma decisão: dá para saber, no fim, se o resultado ajudou a tomá-la.',
      'E é ela que decide para quem você vai apresentar no fim. Se a decisão é da diretoria, a apresentação é para a diretoria — e não para a família em casa, que ouve com gosto e não decide nada no clube.',
    ],
    `A proposta da presença

  Pergunta       Quem mora mais longe do clube falta mais às reuniões?
  Origem         A chamada do semestre, da secretaria, cruzada com
                 um questionário de transporte das famílias
  Quem decide    A diretoria do clube
  Que decisão    Se monta uma lista de carona, e para quem`,
    'A origem se escreve antes de buscar a base. Se ela não existe, a proposta descobre isso a tempo.',
    ['quem decide', 'origem dos dados'],
  ),
];

/* ── Módulo 2: a base ─────────────────────────────────────────────────────── */

const A_BASE: TopicoDeVereda[] = [
  t(
    'a-base-que-responde',
    'A base que responde à pergunta',
    'Tamanho é o mínimo; o que pesa é a base falar da pergunta.',
    [
      'O requisito 3 pede uma base com, no mínimo, **sessenta registros e cinco campos**. Registro é uma linha — uma pessoa, um evento, uma coisa contada. Campo é uma coluna — uma informação sobre cada registro.',
      'A base pode ser coletada por você ou vir de fonte pública. Nos dois casos, ela precisa ter **na mesma linha** o que se quer explicar e o que pode explicar. Para a pergunta da presença, isso é a presença de cada desbravador e a distância de cada um, juntas.',
      'Uma base grande que não fala da pergunta não serve. A pesquisa pública de deslocamento do Distrito Federal é oficial e cuidadosa — e fala de regiões inteiras, não de quem falta ao clube.',
    ],
    `As bases ao alcance, e por que só uma serve

  Inscrições do acampamento    48 registros       poucos
  Chamada do ano passado       66 registros, 3 campos  sem distância
  Pesquisa pública do DF       33 registros       fala de regiões
  Chamada deste semestre       62 registros, 6 campos  serve`,
    'A base do acampamento é a que você já conhece, e por isso a mais tentadora. Com quarenta e oito, ela não chega aos sessenta.',
    ['registro e campo', 'base que responde'],
  ),
  t(
    'origem-e-data',
    'A origem e a data de obtenção',
    'Quem confere precisa buscar o mesmo arquivo de novo.',
    [
      'O requisito 3 pede que você **declare a origem e a data de obtenção**. A origem diz quem forneceu, de que sistema saiu e com o que foi cruzado — o suficiente para outra pessoa ir buscar o mesmo arquivo.',
      'A data de obtenção é o dia em que o arquivo chegou às suas mãos. Ela é diferente do **período** dos dados: a chamada é de fevereiro a julho, e foi exportada em 3 de agosto. As duas datas aparecem juntas, e é fácil escrever a errada.',
      'A data importa porque a base muda. A secretaria pode corrigir uma presença em setembro, e a sua análise continua sendo sobre a versão de agosto. Sem a data, ninguém sabe de que versão você fala.',
    ],
    `Ficha da base

  Arquivo     chamada_1sem_2026.xlsx
  Origem      Exportação do sistema de chamada da secretaria,
              cruzada com o questionário de transporte de junho
  Período     fevereiro a julho de 2026
  Obtida em   03/08/2026`,
    '"Da secretaria" não é origem: é um endereço sem rua. Diga de que sistema, e cruzado com o quê.',
    ['data de obtenção', 'período dos dados'],
  ),
];

/* ── Módulo 3: a grafia ───────────────────────────────────────────────────── */

const A_GRAFIA: TopicoDeVereda[] = [
  t(
    'a-bruta-continua-bruta',
    'A bruta continua bruta',
    'Limpa-se numa cópia, porque a base como chegou é parte da entrega.',
    [
      'O requisito 9 pede a **base bruta** e a **base tratada** na entrega. Só consegue entregar a bruta quem nunca mexeu nela. Por isso o primeiro passo da limpeza é fazer uma cópia e trabalhar nela.',
      'No Excel isso é **Mover ou Copiar**: clique com o botão direito na aba, ou vá em Página Inicial, Formatar. A caixa **"Criar uma cópia" nasce desmarcada** — quem esquece de marcá-la só troca a aba de lugar e continua limpando o original.',
      'Depois, dê à cópia um nome que diga o que ela é. "Bruta (2)" é o nome que o Excel dá, e entregar a tratada com ele é entregar duas abas que se chamam bruta.',
    ],
    `Antes de limpar

  1. Mover ou Copiar → marque "Criar uma cópia" → OK
  2. A cópia aparece como "Bruta (2)"
  3. Renomear → Tratada
  4. Toda limpeza acontece na Tratada`,
    'A bruta não ganha nem uma conta ao lado. Uma CONT.VALORES escrita para conferir os sessenta já a deixa de ser como chegou.',
    ['base bruta', 'criar uma cópia'],
  ),
  t(
    'a-mesma-coisa-um-jeito-so',
    'A mesma coisa escrita de um jeito só',
    'Para a planilha, "aguia", "AGUIA" e "Águia" são três unidades.',
    [
      'Numa conta por unidade, cada jeito de escrever vira um grupo. A Águia aparece dividida em quatro pedaços, e a média de cada pedaço é de duas ou três pessoas. Nada dá erro: a tabela só sai com grupos a mais.',
      '**Localizar e Substituir** conserta isso, e tem duas caixas que mudam tudo. "Diferenciar maiúsculas" desmarcada faz `aguia` achar `AGUIA` e `Aguia` — mas **não** `Águia`, porque o acento é outra letra. "Coincidir conteúdo da célula inteira" faz a troca valer só quando a célula inteira é aquilo.',
      'E o alcance: com uma célula só selecionada, o Excel procura na planilha inteira. Selecione a coluna antes. Sem isso e sem a célula inteira, trocar "aguia" por "Águia" transforma o **Pedro Aguiar** em Pedro Águiar — e a contagem de trocas parece exatamente a esperada.',
    ],
    `Substituir na coluna Unidade, célula inteira

  aguia    → Águia      pega aguia, AGUIA, Aguia
  onça     → Onça
  onca     → Onça       o acento é outra letra
  tucano   → Tucano`,
    'Depois de substituir, filtre a coluna e conte os valores diferentes. Seis unidades, seis valores.',
    ['localizar e substituir', 'célula inteira'],
  ),
  t(
    'a-linha-repetida',
    'A linha repetida, e a pessoa com o mesmo nome',
    'Remover Duplicatas compara o que está escrito.',
    [
      'A exportação trouxe a Carla Menezes duas vezes, a segunda com "aguia" e "onibus". **Dados → Remover Duplicatas** apaga linhas repetidas — mas compara o que está escrito, e aquelas duas linhas não são iguais. Rodado antes de padronizar, ele responde que não há duplicata nenhuma.',
      'A ordem resolve: primeiro padronize a grafia, depois remova as duplicatas. Aí as duas linhas da Carla ficam idênticas, e a de baixo sai.',
      'A caixa abre com todas as colunas marcadas, e é assim que deve ficar. Desmarcar tudo menos o nome parece esperto e apaga gente: há **duas Ana Clara Ribeiro** no clube, uma no Tucano e outra na Arara, e são duas pessoas.',
    ],
    `Remover Duplicatas

  Antes de padronizar     Nenhum valor duplicado encontrado.
  Depois de padronizar    1 valor duplicado removido;
                          61 valores exclusivos permanecem.
  Só com o Nome marcado   apaga uma das duas Ana Clara`,
    '"Nenhum valor duplicado" é uma resposta que ninguém confere duas vezes. Confira a contagem de linhas depois.',
    ['remover duplicatas', 'homônimo'],
  ),
];

/* ── Módulo 4: números, impossíveis e ausências ───────────────────────────── */

const OS_NUMEROS: TopicoDeVereda[] = [
  t(
    'numero-guardado-como-texto',
    'Número guardado como texto',
    '"3,75 km" e "13.5" encostam à esquerda, e a média os pula.',
    [
      'A planilha só soma o que é número. "3,75 km" tem letra, "13 anos" tem palavra, e "13.5" tem ponto no lugar da vírgula — em português, o ponto só vale como separador de milhar. Os três ficam guardados como **texto**.',
      'Texto encosta à esquerda na célula, e a MÉDIA o pula sem avisar. A conta sai plausível, e sobre menos gente do que a base tem. Selecione a coluna e olhe a régua do Excel embaixo: a **Contagem** conta toda célula preenchida, e a **Média** só os números.',
      'Para consertar, selecione **só os números** da coluna e use Substituir: o ponto pela vírgula, e o " km" por nada. Só os números, porque o cabeçalho "Distância (km)" também tem "km" — e selecionando pela letra da coluna ele vai junto.',
    ],
    `Na coluna da distância

  Escrito      Para a planilha    Conserto
  3,75 km      texto              tirar o " km"
  13.5         texto              ponto vira vírgula
  4,5km        texto              tirar o "km"
  6,5          número             nada`,
    'Substituir dentro da coluna, e nunca na planilha inteira: o nome de alguém pode ter um "km" que você não viu.',
    ['número como texto', 'contagem na régua'],
  ),
  t(
    'valor-impossivel',
    'O valor impossível, com evidência e sem',
    'Corrige-se o que tem evidência; o resto vira ausência.',
    [
      'A Isabela aparece morando a **1.250 km** do clube. A planilha lê "1.250" como mil duzentos e cinquenta — é o único defeito da base que ela aceita como número —, e a média da distância da bruta pula de 6 para perto de 30 quilômetros sem nenhuma célula com cara de errada.',
      'Esse valor tem evidência do certo: ela vem a pé, e a mesma secretaria escreveu outros números com ponto no lugar da vírgula. O certo é **1,25**, e você pode corrigir.',
      'A Ana Clara do Tucano aparece com **41 anos**. Pode ser 11, pode ser 14 — as teclas ficam lado a lado — e nada na base diz qual. Sem evidência, a célula fica **vazia**, e a linha fica: a presença dela vale. Adivinhar 14 seria inventar um dado com cara de dado.',
    ],
    `Dois impossíveis, duas decisões

  Isabela      1.250 km   vem a pé; ponto no lugar da vírgula
                          → corrige para 1,25
  Ana Clara    41 anos    pode ser 11 ou 14
                          → célula vazia, linha mantida`,
    'Ache os impossíveis olhando os extremos: classifique a coluna, ou peça o MÁXIMO, e pergunte se aquele número pode existir.',
    ['valor impossível', 'evidência'],
  ),
  t(
    'a-ausencia',
    'O que falta não se inventa',
    'Quatro famílias não responderam. A linha fica, e o valor fica em branco.',
    [
      'Bruno, Eduarda, Enzo e Pedro Henrique não têm distância nem jeito de chegar: as famílias não responderam ao questionário. A presença deles está na chamada e vale.',
      'Há dois atalhos, e os dois estragam. **Excluir as linhas** derruba a base de 61 para 57 — abaixo dos sessenta do requisito — e joga fora quatro presenças verdadeiras. **Preencher com a média** inventa quatro distâncias iguais que ninguém mediu, e deixa a reta mais confiante do que o dado.',
      'O certo é deixar as duas células em branco. As funções da planilha pulam o vazio: a média da distância passa a ser de quem respondeu, que é o que ela de fato é — e o relatório diz isso.',
    ],
    `Quatro sem questionário

  Excluir as linhas      base com 57: abaixo do requisito
  Preencher com 6,43     quatro distâncias inventadas
  Deixar em branco       a média é de quem respondeu`,
    'Ausência documentada não é defeito: é o que o diário de limpeza existe para contar.',
    ['ausência', 'não inventar'],
  ),
  t(
    'o-diario-de-limpeza',
    'O diário de limpeza',
    'Cada decisão por escrito: o que você fez, e por quê.',
    [
      'O requisito 4 pede para **documentar por escrito cada decisão de limpeza**. Quem abrir a base tratada no ano que vem precisa saber o que mudou da bruta para ela — e por quê.',
      'Uma decisão tem duas metades. O que se fez: "troquei aguia, AGUIA e Aguia por Águia, só na coluna Unidade". E por quê: "para a conta por unidade não separar a mesma unidade em quatro".',
      'Uma decisão por problema e por coluna. A idade e a distância tiveram valores impossíveis tratados de jeitos diferentes, e é exatamente isso que quem ler precisa saber: por que um foi corrigido e o outro não.',
    ],
    `Diário de limpeza

  Problema             Coluna      Decisão
  Grafia               Unidade     padronizei pela lista do clube
  Registro repetido    a linha     tirei a segunda da Carla
  Valor impossível     Distância   1.250 → 1,25: ela vem a pé
  Valor impossível     Idade       41 → vazio: não há evidência
  Valor que falta      Distância   mantive as linhas em branco`,
    '"Arrumei a base" não é decisão. É o resumo que não deixa ninguém refazer o caminho.',
    ['documentar a decisão', 'diário'],
  ),
];

/* ── Módulo 5: as medidas ─────────────────────────────────────────────────── */

const AS_MEDIDAS: TopicoDeVereda[] = [
  t(
    'medidas-sobre-a-tratada',
    'As medidas, sobre a tratada',
    'Média, mediana e desvio das duas variáveis da pergunta.',
    [
      'O requisito 5.1 pede **medidas descritivas das variáveis principais**. Principais são as da pergunta: a presença, que é o que se quer explicar, e a distância, que é a suspeita. Medir todas as colunas da base transforma o relatório numa tabela que ninguém lê.',
      'Escreva as contas numa aba própria, apontando para a **tratada**: `=MÉDIA(Tratada!F2:F62)`. A presença média é **15,39** reuniões de 20, a mediana é **16**, e o desvio padrão é **3,67**. O desvio é DESVPADP, com P, porque a base é o clube inteiro.',
      'Apontar para a bruta é o erro que mais engana: a mediana da presença sai **igual** nas duas, porque a bruta só tem uma linha a mais. A média da distância não: com o 1.250 lá dentro, ela passa de 6 para perto de 30.',
    ],
    `Aba Cálculos

  Presenças — média            =MÉDIA(Tratada!F2:F62)     15,39
  Presenças — mediana          =MED(Tratada!F2:F62)       16
  Presenças — desvio padrão    =DESVPADP(Tratada!F2:F62)  3,67
  Distância — média            =MÉDIA(Tratada!E2:E62)     6,43
  Distância — mediana          =MED(Tratada!E2:E62)       5`,
    'Fórmula que lê a outra aba começa pelo nome dela e uma exclamação: Tratada!F2.',
    ['medidas descritivas', 'aba tratada'],
  ),
  t(
    'media-ou-mediana',
    'Média ou mediana, para a distância típica',
    'Quando poucos estão muito longe, a média anda para o lado deles.',
    [
      'A distância média é **6,43 km**, e a mediana é **5 km**. Metade do clube mora a 5 km ou menos — e a média diz 6,43 porque uns poucos moram a mais de 13 km e puxam a conta para cima.',
      'Quando os valores se espalham de um lado só, a **mediana** descreve melhor quem está no meio. A média continua certa como conta, e erra como resumo.',
      'Na presença as duas ficam perto — 15,39 e 16 —, e qualquer uma serve. É comparando as duas que se sabe qual usar.',
    ],
    `Distância até o clube

  Média      6,43 km    puxada por quem mora longe
  Mediana    5 km       metade do clube mora até aqui`,
    'Média muito maior que a mediana é o sinal de que alguns valores altos estão puxando a conta.',
    ['média e mediana', 'assimetria'],
  ),
];

/* ── Módulo 6: os grupos ──────────────────────────────────────────────────── */

const OS_GRUPOS: TopicoDeVereda[] = [
  t(
    'a-media-de-cada-grupo',
    'A média de cada grupo, sem MÉDIASE',
    'A soma do grupo dividida pela quantidade dele.',
    [
      'O requisito 5.2 pede a **comparação entre, no mínimo, dois grupos**. Aqui os grupos são os jeitos de chegar: a pé, de bicicleta, de carona e de ônibus.',
      'Esta planilha não tem MÉDIASE, e é a mesma conta da CC-ES009: `CONT.SE` conta quantos há no grupo, e `SOMASE` soma a coluna que interessa só para aquele grupo. A média é a soma dividida pela contagem.',
      'Quem não respondeu ao questionário não tem jeito de chegar escrito, e por isso não entra na soma nem na contagem de grupo nenhum — a conta continua certa. Os quatro grupos somam 57, que é quem respondeu.',
    ],
    `Aba Grupos

  Como chega   Quantos   Média de presenças   Média da distância
  A pé           14            18,93                 1,07
  Bicicleta       4            16,50                 2,81
  Carona         19            17,37                 8,37
  Ônibus         20            11,35                 9,05`,
    'Escreva a primeira linha com cifrão no intervalo — $D$2:$D$62 — e arraste para baixo. Sem o cifrão, o intervalo desce junto e a última linha conta metade do clube.',
    ['comparar grupos', 'SOMASE e CONT.SE'],
  ),
  t(
    'o-que-a-comparacao-mostra',
    'O que a comparação mostra',
    'Carona e ônibus moram longe parecido, e a presença é muito diferente.',
    [
      'Quem vem de carona mora, em média, a **8,37 km**; quem vem de ônibus, a **9,05 km** — quase a mesma distância. E a presença é **17,37** para a carona e **11,35** para o ônibus: seis reuniões de diferença no semestre.',
      'É essa comparação que muda a conversa. Se fosse só a distância, os dois grupos faltariam parecido. Não faltam — e o que os separa é o jeito de chegar.',
      'O grupo de bicicleta tem a segunda maior presença, e tem **quatro pessoas**. Uma que falte muito muda a média inteira, e por isso ele não sustenta conclusão nenhuma. Média de grupo pequeno se mostra, e não se usa para decidir.',
    ],
    `Mesma distância, presença diferente

  Carona    8,37 km    17,37 reuniões de 20
  Ônibus    9,05 km    11,35 reuniões de 20`,
    'Antes de comparar médias, olhe o tamanho de cada grupo. Quatro pessoas não pesam o mesmo que vinte.',
    ['grupo pequeno', 'comparação'],
  ),
];

/* ── Módulo 7: a relação ──────────────────────────────────────────────────── */

const A_RELACAO: TopicoDeVereda[] = [
  t(
    'a-dispersao-da-base-inteira',
    'A dispersão, com a base inteira',
    'Cada ponto é uma pessoa: a distância de um lado, a presença do outro.',
    [
      'O requisito 5.3 pede **uma relação entre duas variáveis, com gráfico de dispersão e linha de tendência**. É a mecânica da CC-ES010, agora sobre a base que você limpou.',
      'Selecione as duas colunas inteiras da tratada — a distância e a presença, que ficam lado a lado — e insira uma dispersão. Os 57 que responderam viram 57 pontos; os quatro sem distância ficam de fora sozinhos, porque ponto precisa dos dois números.',
      'Depois, em Elementos do Gráfico, marque **Linha de Tendência** e **Exibir Equação**. A nuvem desce da esquerda para a direita, e a reta também: a correlação é **-0,70**.',
    ],
    `Dispersão na tratada

  Seleção     E1:F62
  Eixo X      Distância até o clube (km)
  Eixo Y      Presenças no semestre (de 20)
  Pontos      57
  Correlação  -0,70`,
    'Selecionar só uma parte das linhas desenha uma nuvem plausível sobre metade do clube.',
    ['dispersão', 'linha de tendência'],
  ),
  t(
    'o-que-a-relacao-nao-prova',
    'O que a relação não prova',
    'Quem mora longe falta mais — e quem mora longe também pega ônibus.',
    [
      'Uma correlação de -0,70 é forte: quem mora mais longe tende a ir a menos reuniões. Isso **não prova** que a distância é a causa.',
      'Quem mora longe também é quem mais pega ônibus, e o ônibus de sábado pode ser o problema — o horário, a passagem, a família que trabalha no fim de semana. A comparação de grupos já mostrou isso: a carona mora tão longe quanto e falta pouco.',
      'É a correlação espúria da CC-ES010 do lado da decisão. Se a causa fosse a distância, a única saída seria mudar o clube de lugar. Se for o transporte, uma lista de carona resolve — e a recomendação muda inteira.',
    ],
    `Duas explicações para o mesmo desenho

  A distância faz faltar         → mudar o clube de lugar
  O ônibus de sábado faz faltar  → lista de carona`,
    'Antes de escrever a conclusão, pergunte: que outra coisa anda junto com a distância?',
    ['correlação e causa', 'outra explicação'],
  ),
];

/* ── Módulo 8: o painel ───────────────────────────────────────────────────── */

const O_PAINEL: TopicoDeVereda[] = [
  t(
    'cada-grafico-uma-pergunta',
    'Cada gráfico responde a uma pergunta',
    'O título é a pergunta, escrita como pergunta.',
    [
      'O requisito 6 pede **painel ou relatório com, no mínimo, quatro gráficos, cada um respondendo a uma pergunta declarada expressamente**. Declarada quer dizer escrita — e o lugar dela é o título.',
      '"Presença por unidade" é um assunto. "Alguma unidade falta mais que as outras?" é uma pergunta, e quem olha o gráfico sabe o que procurar nele. As quatro perguntas são diferentes: dois gráficos para a mesma pergunta ocupam lugar e não dizem nada novo.',
      'Gráfico sobre faixa vazia conta como gráfico e não mostra nada. Confira que cada um desenhou.',
    ],
    `O painel da presença

  Quem mora mais longe vai a menos reuniões?           dispersão
  Quem vem de carona falta menos que quem vem de ônibus?  colunas
  Alguma unidade falta mais que as outras?             colunas
  Quantos desbravadores moram longe do clube?          pizza`,
    'Escreva a pergunta antes de escolher o tipo. O tipo sai da pergunta, e não o contrário.',
    ['painel', 'pergunta no título'],
  ),
  t(
    'o-tipo-que-responde',
    'O tipo que responde',
    'Linha é para tempo; pizza é para partes de um todo.',
    [
      'São as regras da CC-ES009, e valem aqui igual. **Colunas** comparam: qual é maior que qual. **Dispersão** relaciona duas medidas. **Pizza** mostra de que o todo é feito — e só quando as partes somam o todo.',
      '**Linha** mostra evolução ao longo do tempo, e esta base não tem tempo: ligar o Falcão ao Tucano com um traço afirma que um virou o outro.',
      'A pizza das médias de presença por unidade sai com fatias perfeitamente plausíveis de um todo que não existe — média não soma. A pizza de **quantos** moram em cada faixa de distância soma o clube, e responde.',
    ],
    `Que tipo para que pergunta

  Qual é maior?                 colunas
  Duas medidas andam juntas?    dispersão
  De que o todo é feito?        pizza, só sobre contagem
  Como mudou com o tempo?       linha — esta base não tem tempo`,
    'Gráfico errado não dá erro. Ele desenha certinho uma coisa que não quer dizer nada.',
    ['tipo de gráfico', 'pizza de contagem'],
  ),
];

/* ── Módulo 9: a conclusão ────────────────────────────────────────────────── */

const A_CONCLUSAO: TopicoDeVereda[] = [
  t(
    'tres-partes-duas-paginas',
    'Três partes, em duas páginas',
    'O que os dados mostram, o que não permitem afirmar, e o que recomendar.',
    [
      'O requisito 7 pede uma conclusão de **no máximo duas páginas** com três partes: o que os dados mostram, o que **não permitem afirmar**, e uma recomendação prática ao clube.',
      'Duas páginas é o limite, e não a meta. A primeira versão costuma recontar a limpeza inteira — e ela já está no diário, que vai junto no relatório. O que fica na conclusão é o que muda a decisão.',
      'O que os dados mostram vem **com os números**. "Quem mora longe falta mais" é uma impressão; "quem vem de ônibus vai a 11,35 de 20 reuniões, e quem vem de carona a 17,37" é um resultado.',
    ],
    `A conclusão

  O que os dados mostram         com os números do painel
  O que não permitem afirmar     o que a base não cobre
  Recomendação ao clube          quem faz o quê`,
    'Uma página tem perto de 450 palavras. Conte antes de entregar.',
    ['duas páginas', 'três partes'],
  ),
  t(
    'o-que-nao-permitem-afirmar',
    'O que os dados não permitem afirmar',
    'A parte que quase ninguém escreve, e a que mais protege quem decide.',
    [
      'Toda base tem um limite, e escrever esse limite é o que impede quem decide de pedir à análise mais do que ela pode dar.',
      'Nesta base: é **um semestre só**; **quatro famílias** não responderam ao questionário; quem já **saiu do clube** não está na chamada — e talvez tenha saído justamente por morar longe; e a relação **não prova causa**.',
      'A recomendação vem depois disso, e diz **quem faz o quê**. "O clube deveria melhorar a presença" não tem dono, e ninguém a cumpre. "Que a diretoria monte uma lista de carona para quem vem de ônibus, e que a secretaria compare a presença em dezembro" se aprova, se faz e se confere.',
    ],
    `Recomendação sem dono e com dono

  O clube deveria melhorar a presença.
      ninguém faz

  Que a diretoria monte uma lista de carona para quem vem
  de ônibus, e que a secretaria compare a presença em dezembro.
      quem, o quê, e como conferir`,
    'Escrever o limite não enfraquece a conclusão. É o que faz quem decide confiar no resto.',
    ['limites da base', 'recomendação prática'],
  ),
];

/* ── Módulo 10: a apresentação ────────────────────────────────────────────── */

const A_APRESENTACAO: TopicoDeVereda[] = [
  t(
    'dez-minutos-para-quem-decide',
    'Dez minutos para quem decide',
    'A pergunta, o painel, a recomendação, e tempo para perguntarem.',
    [
      'O requisito 8 pede apresentar o resultado **em até dez minutos** a público real do clube — diretoria, unidade ou conselho. Público real quer dizer gente que pode decidir alguma coisa com a recomendação.',
      'O roteiro que todo mundo escreve primeiro gasta seis minutos contando a limpeza. É trabalho de verdade, e quem decide não precisa dele: precisa da pergunta, do painel, da recomendação e de **tempo para perguntar**. A limpeza cabe em um minuto, e o diário vai junto para quem quiser ler.',
      'É a regra da CC-ES011, do outro lado: a fala carrega o que o slide não diz, e o slide não carrega a fala.',
    ],
    `Roteiro de dez minutos

  1   A pergunta e quem decide
  1   De onde veio o dado
  1   O que eu limpei
  3   Os quatro gráficos
  2   O que mostram e o que não permitem
  1   A recomendação
  1   Perguntas`,
    'A família em casa ouve com gosto e não decide nada no clube. Ensaie com ela; apresente para quem decide.',
    ['dez minutos', 'público real'],
  ),
  t(
    'registrar-a-decisao',
    'Registrar a decisão, ou a reação',
    'O que aconteceu, e não o que se esperava.',
    [
      'Depois de apresentar, o requisito pede **registrar por escrito a decisão tomada ou a reação obtida**: quando foi, quem estava, e o que disseram.',
      'O registro é do que aconteceu. "A diretoria aprovou a lista de carona e pediu a presença de dezembro para comparar" é decisão. "Vão pensar até a próxima reunião" também é registro — e diz que a recomendação ainda não virou decisão.',
      'Escreva com as palavras de quem decidiu, e no mesmo dia. Uma semana depois, a lembrança já virou o que você queria que eles tivessem dito.',
    ],
    `Registro

  Quando     29/08/2026
  Quem       o diretor, a secretária e a tesoureira
  O que      A diretoria aprovou a lista de carona e pediu à
             secretaria a presença de dezembro para comparar.`,
    'Reação negativa também se registra. Ela é o resultado do projeto tanto quanto um sim.',
    ['registro da decisão', 'reação'],
  ),
];

/* ── Módulo 11: a entrega ─────────────────────────────────────────────────── */

const A_ENTREGA: TopicoDeVereda[] = [
  t(
    'tres-entregaveis',
    'A bruta, a tratada e o relatório, juntos',
    'Num repositório compartilhado, e só os três.',
    [
      'O requisito 9 pede entregar ao examinador **a base bruta, a base tratada e o relatório final**, mantidos em repositório compartilhado — uma pasta na nuvem, compartilhada com quem examina.',
      'Só os três. O rascunho da conclusão e a foto da reunião são seus, e não da entrega: quem confere não deveria ter de adivinhar qual arquivo vale.',
      'E a bruta é a que **ninguém editou**. Quem baixa o mesmo anexo duas vezes fica com duas cópias de mesmo nome; se uma delas foi aberta e mexida, ela já não é bruta. O **histórico de versões** diz qual é qual: quem escreveu cada versão, e quando.',
    ],
    `Pasta "Projeto de dados — presença"

  chamada_1sem_2026                   a bruta, uma versão só
  Análise da presença                 a tratada e as contas
  Relatório final — presença          a conclusão, o painel e o diário`,
    'Abra o histórico das duas cópias antes de escolher. A data da última alteração já dá a pista.',
    ['entrega', 'histórico de versões'],
  ),
  t(
    'compartilhar-para-conferir',
    'Compartilhar para conferir',
    'Quem examina lê; não edita. E o link fica restrito.',
    [
      'O examinador precisa ver os três arquivos — e não mexer neles. Compartilhe a pasta como **leitor** ou **comentarista**: editor pode mudar uma célula da bruta sem querer, e aí ela deixa de ser a prova do que chegou.',
      'Compartilhar a pasta alcança o que está dentro, como a CC-ES006 ensinou: não é preciso compartilhar arquivo por arquivo.',
      'E o acesso geral fica **Restrito**. A base tem o nome de sessenta e uma crianças do clube, e "qualquer pessoa com o link" é qualquer pessoa — inclusive quem recebeu o link encaminhado por alguém que você nem conhece.',
    ],
    `Compartilhar a pasta do projeto

  Liderança        Leitor
  Acesso geral     Restrito`,
    'Na caixa de compartilhar, a lista de nomes e o acesso geral são duas coisas. Confira as duas.',
    ['leitor e editor', 'link restrito'],
  ),
];

/* ── Os onze módulos ─────────────────────────────────────────────────────── */

const Q = QUESTOES_DO_PROJETO_DE_DADOS;

export const MODULOS_DO_PROJETO_DE_DADOS: ModuloDeVereda[] = [
  {
    id: 'm1', titulo: 'A pergunta vem antes do dado',
    resumo: 'A proposta, aprovada antes de abrir qualquer base.',
    licoes: [
      {
        id: 'm1-teoria', tipo: 'teoria', questoes: Q['m1-teoria'], perguntas: 4,
        titulo: 'Pergunta, origem e quem decide',
        resumo: 'O que a proposta precisa dizer antes de o dado existir.',
        topicos: A_PROPOSTA,
      },
      {
        id: 'm1-lab', tipo: 'projeto-de-dados', licao: 'proposta',
        titulo: 'Escrevendo a proposta do projeto',
        resumo: 'E descobrindo o que custa abrir a base antes da aprovação.',
        verificacoes: ['proposta-pergunta', 'proposta-quem-decide', 'proposta-aprovada-antes'],
      },
    ],
  },
  {
    id: 'm2', titulo: 'A base que responde',
    resumo: 'Sessenta registros, cinco campos, e a pergunta na mesma linha.',
    licoes: [
      {
        id: 'm2-teoria', tipo: 'teoria', questoes: Q['m2-teoria'], perguntas: 4,
        titulo: 'Escolher a base e declarar de onde ela veio',
        resumo: 'Tamanho, pergunta, origem e as duas datas que se confundem.',
        topicos: A_BASE,
      },
      {
        id: 'm2-lab', tipo: 'projeto-de-dados', licao: 'base',
        titulo: 'Escolhendo a base e preenchendo a ficha',
        resumo: 'Quatro arquivos ao alcance, e um que serve.',
        verificacoes: ['base-que-serve', 'origem-declarada', 'data-de-obtencao'],
      },
    ],
  },
  {
    id: 'm3', titulo: 'A mesma coisa escrita de um jeito só',
    resumo: 'Limpar numa cópia, padronizar a grafia e tirar a linha repetida.',
    licoes: [
      {
        id: 'm3-teoria', tipo: 'teoria', questoes: Q['m3-teoria'], perguntas: 4,
        titulo: 'A bruta, a cópia e a grafia',
        resumo: 'Mover ou Copiar, Localizar e Substituir, Remover Duplicatas.',
        topicos: A_GRAFIA,
      },
      {
        id: 'm3-lab', tipo: 'projeto-de-dados', licao: 'grafia',
        titulo: 'Limpando a grafia numa cópia',
        resumo: 'Sem estragar o Pedro Aguiar, e sem apagar uma das Anas.',
        verificacoes: ['copia-com-nome', 'unidades-padronizadas', 'transporte-padronizado', 'sem-repetida', 'diario-da-grafia'],
      },
    ],
  },
  {
    id: 'm4', titulo: 'Números, impossíveis e ausências',
    resumo: 'O que a média pula, o que não existe, e o que falta.',
    licoes: [
      {
        id: 'm4-teoria', tipo: 'teoria', questoes: Q['m4-teoria'], perguntas: 4,
        titulo: 'Consertar, corrigir com evidência, e não inventar',
        resumo: 'Número como texto, valor impossível, ausência e o diário.',
        topicos: OS_NUMEROS,
      },
      {
        id: 'm4-lab', tipo: 'projeto-de-dados', licao: 'numeros',
        titulo: 'Consertando números e decidindo o que falta',
        resumo: 'E escrevendo no diário por que cada decisão foi tomada.',
        verificacoes: ['texto-virou-numero', 'impossiveis-tratados', 'ausencias-de-pe', 'diario-dos-numeros'],
      },
    ],
  },
  {
    id: 'm5', titulo: 'As medidas de quem está no meio',
    resumo: 'Média, mediana e desvio das variáveis da pergunta.',
    licoes: [
      {
        id: 'm5-teoria', tipo: 'teoria', questoes: Q['m5-teoria'], perguntas: 4,
        titulo: 'Medidas sobre a tratada',
        resumo: 'E quando a mediana descreve melhor que a média.',
        topicos: AS_MEDIDAS,
      },
      {
        id: 'm5-lab', tipo: 'projeto-de-dados', licao: 'descritivas',
        titulo: 'As medidas da presença e da distância',
        resumo: 'Seis contas, todas lendo a tratada.',
        verificacoes: ['medidas-da-presenca', 'medidas-da-distancia', 'medida-tipica'],
      },
    ],
  },
  {
    id: 'm6', titulo: 'Comparando grupos',
    resumo: 'Quem chega de cada jeito, e quanto falta cada grupo.',
    licoes: [
      {
        id: 'm6-teoria', tipo: 'teoria', questoes: Q['m6-teoria'], perguntas: 4,
        titulo: 'A média de cada grupo',
        resumo: 'SOMASE dividido por CONT.SE, e o grupo pequeno demais.',
        topicos: OS_GRUPOS,
      },
      {
        id: 'm6-lab', tipo: 'projeto-de-dados', licao: 'grupos',
        titulo: 'A presença de quem chega de cada jeito',
        resumo: 'Carona e ônibus, na mesma distância.',
        verificacoes: ['quantos-por-grupo', 'medias-por-grupo', 'comparacao-escrita'],
      },
    ],
  },
  {
    id: 'm7', titulo: 'Duas medidas que andam juntas',
    resumo: 'A dispersão da distância com a presença, e o que ela não prova.',
    licoes: [
      {
        id: 'm7-teoria', tipo: 'teoria', questoes: Q['m7-teoria'], perguntas: 4,
        titulo: 'A relação, e outra explicação',
        resumo: 'A reta, o r, e a variável que anda junto.',
        topicos: A_RELACAO,
      },
      {
        id: 'm7-lab', tipo: 'projeto-de-dados', licao: 'relacao',
        titulo: 'A distância e a presença na mesma nuvem',
        resumo: 'Com a reta, a equação e a correlação.',
        verificacoes: ['dispersao-da-base', 'reta-e-equacao', 'correlacao-calculada', 'relacao-lida'],
      },
    ],
  },
  {
    id: 'm8', titulo: 'Um painel de perguntas',
    resumo: 'Quatro gráficos, cada um com a pergunta que ele responde.',
    licoes: [
      {
        id: 'm8-teoria', tipo: 'teoria', questoes: Q['m8-teoria'], perguntas: 4,
        titulo: 'A pergunta no título, e o tipo que responde',
        resumo: 'Colunas, dispersão, pizza — e por que não linha.',
        topicos: O_PAINEL,
      },
      {
        id: 'm8-lab', tipo: 'projeto-de-dados', licao: 'painel',
        titulo: 'Quatro gráficos, quatro perguntas',
        resumo: 'E nenhuma pizza de médias.',
        verificacoes: ['quatro-graficos', 'cada-um-uma-pergunta', 'cada-tipo-responde'],
      },
    ],
  },
  {
    id: 'm9', titulo: 'A conclusão em duas páginas',
    resumo: 'O que mostram, o que não permitem, e quem faz o quê.',
    licoes: [
      {
        id: 'm9-teoria', tipo: 'teoria', questoes: Q['m9-teoria'], perguntas: 4,
        titulo: 'Três partes, e o limite da base',
        resumo: 'A parte que quase ninguém escreve, e a recomendação com dono.',
        topicos: A_CONCLUSAO,
      },
      {
        id: 'm9-lab', tipo: 'projeto-de-dados', licao: 'conclusao',
        titulo: 'Reescrevendo a conclusão',
        resumo: 'Do rascunho de três páginas para duas que decidem.',
        verificacoes: ['tres-partes-em-duas-paginas', 'mostram-com-numero', 'o-que-nao-permitem', 'recomendacao-pratica'],
      },
    ],
  },
  {
    id: 'm10', titulo: 'Dez minutos para quem decide',
    resumo: 'O roteiro, o público, e o registro do que aconteceu.',
    licoes: [
      {
        id: 'm10-teoria', tipo: 'teoria', questoes: Q['m10-teoria'], perguntas: 4,
        titulo: 'Apresentar e registrar',
        resumo: 'O que cabe em dez minutos, e o que se escreve depois.',
        topicos: A_APRESENTACAO,
      },
      {
        id: 'm10-lab', tipo: 'projeto-de-dados', licao: 'apresentacao',
        titulo: 'O roteiro e o registro da decisão',
        resumo: 'Da limpeza em seis minutos para a recomendação com tempo.',
        verificacoes: ['cabe-em-dez-minutos', 'publico-que-decide', 'registro-da-decisao'],
      },
    ],
  },
  {
    id: 'm11', titulo: 'A entrega',
    resumo: 'A bruta, a tratada e o relatório, numa pasta compartilhada.',
    licoes: [
      {
        id: 'm11-teoria', tipo: 'teoria', questoes: Q['m11-teoria'], perguntas: 4,
        titulo: 'O que se entrega, e para quem ler',
        resumo: 'Os três arquivos, a bruta que ninguém editou, e o link restrito.',
        topicos: A_ENTREGA,
      },
      {
        id: 'm11-lab', tipo: 'projeto-de-dados', licao: 'entrega',
        titulo: 'Bruta, tratada e relatório na pasta do projeto',
        resumo: 'E o histórico de versões, que diz qual bruta é bruta.',
        verificacoes: ['entregaveis-na-pasta', 'bruta-nunca-editada', 'compartilhada-para-conferir'],
      },
    ],
  },
];
