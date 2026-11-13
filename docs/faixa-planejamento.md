# A Faixa — planejamento das conquistas

> Rascunho de 13/11/2026. Antecede qualquer desenho: a Faixa reserva o lugar
> de toda conquista que a plataforma **escrita** vai ter, e para isso é preciso
> saber quantas serão.

## 1. O que já foi decidido

- A seção passa a se chamar **Faixa**: um tecido verde-escuro, rolado na
  horizontal, com arrasto de mãozinha no mouse e o deslizar do dedo no celular.
- **Trilha** é um patch bordado, **vereda** é um button, **conquista** é um pin
  esmaltado.
- O patch e o button **são** o Token.Web(). Clicar abre o mesmo tipo de cartão
  que a insígnia abre hoje, com o documento, o botão de baixar o PDF e o de
  imprimir. O painel de Token.Web() some da página.
- As conquistas que pertencem a uma trilha ou a uma vereda orbitam o
  patch/button dela, como **satélites**. As que não pertencem a nenhuma — as
  treze escadas e as curiosidades — formam cachos soltos no tecido.
- A disposição é a mesma para todo mundo e já nasce com **todos** os lugares,
  inclusive os das trilhas e veredas só anunciadas.
- Nenhuma trilha ou vereda nova entra até as anunciadas ficarem prontas. A
  Faixa é desenhada para este catálogo fechado: 13 trilhas e 51 veredas.

## 2. O catálogo, hoje e quando estiver escrito

Os números das anunciadas são **estimativas**, tiradas da leitura de cada PDF
em `public/curriculum files/` (seção 4). Estão marcadas com `~`.

| | Abertas hoje | Anunciadas (estimado) | Plataforma escrita |
|---|---:|---:|---:|
| Trilhas | 7 | 6 | **13** |
| Veredas | 28 | 23 | **51** |
| Lições de trilha | 98 | ~84 | ~182 |
| Módulos de trilha | 53 | ~45 | ~98 |
| Requisitos oficiais de trilha | 211 | ~129 | ~340 |
| Laboratórios de trilha (insígnia `lab_<tipo>`) | 28 | ~18 | **~46** |
| Provas finais | 7 | 6 | 13 |
| Lições de vereda | 475 | ~394 | ~869 |
| Módulos de vereda (= laboratórios de vereda) | 237 | ~197 | **~434** |

### Peças na Faixa completa

| Peça | Material | Quantas |
|---|---|---:|
| Trilhas | patch bordado | 13 |
| Veredas | button | 51 |
| Laboratórios de trilha | pin satélite do patch | ~46 |
| Laboratórios de vereda | pin satélite do button | ~434 |
| Escadas (13 famílias × 7 classes) | pin, em cacho | 91 |
| Curiosidades (horário) | pin redondo, em cacho | 4 |
| **Total** | | **~639** |

Os satélites somam quase três quartos da Faixa. A largura dela, portanto, é
decidida pelas veredas, e não pelas trilhas.

## 3. As escadas contra o que a plataforma escrita permite

Toda escada é **alcançável** — nenhum topo passa do máximo possível —, então a
Faixa fecha de qualquer jeito. O que varia é **quando** cada uma fecha:

| Escada | O que conta | Topo hoje | Máximo na plataforma escrita | O topo chega em |
|---|---|---:|---:|---|
| Requisitos | requisitos de trilha + lições de vereda | 192 | ~1.209 | ~16% do caminho |
| Lições | lições de trilha + de vereda | 110 | ~1.051 | ~10% |
| Módulos | módulos de trilha + de vereda | 45 | ~532 | ~8% |
| Laboratórios | `LabType` distintos (só trilha) | 28 | ~46 | ~60% |
| Sem erro | lições de trilha com 100% | 90 | ~182 | ~50% |
| Avaliações | provas finais concluídas | 13 | 13 | no fim ✓ |
| Nota máxima | provas com 100% | 13 | 13 | no fim ✓ |
| Trilhas | especialidades concluídas | 13 | 13 | no fim ✓ |
| Veredas | veredas percorridas | 51 | 51 | no fim ✓ |
| Token.Web() | certificados recebidos | 40 | 64 | ~62% |
| XP | 10 por atividade de trilha, repetível | 12.000 | **sem teto** | depende de repetir |
| Ofensiva | dias seguidos | 250 | tempo | — |
| Constância | dias distintos | 365 | tempo | — |

Três problemas aparecem nessa tabela.

1. **Seis escadas fecham muito antes do fim.** Quem percorre tudo passa 90% do
   caminho sem pin novo em Lições, Módulos e Requisitos. Já Trilhas, Veredas e
   Avaliações fecham exatamente no último passo. São duas réguas convivendo.
2. **O XP não tem teto, e a vereda não dá XP.** Ele soma 10 por atividade, e
   refazer uma lição soma de novo; logo o topo de 12.000 se alcança repetindo,
   não percorrendo. E nada de vereda rende XP — essa parte é decisão já
   registrada no CLAUDE.md (a vereda é bônus, fora do XP e do percentual).
3. **"Sem erro" só olha a trilha.** A teoria de vereda também tem nota, mas não
   conta. Isso pode ser de propósito (a vereda fica fora de nota), mas aí a
   escada fecha em ~182, e não em ~1.051.

## 4. A estimativa de cada anunciada

### Veredas — um laboratório por módulo

Nas 28 abertas, todo módulo tem uma teoria e um laboratório, e o número de
módulos varia de 6 a 12 (média 8,5). Nenhuma conta automática sobre o PDF
acerta esse número — a que testei errou por até sete módulos nas abertas (a CC-FE001) —, então a
estimativa é uma leitura requisito a requisito: cada "Demonstrar o seguinte"
vira um módulo por item, e os requisitos de construir, publicar, versionar e
apresentar viram um cada.

| Vereda | Módulos (= laboratórios) | De onde sai |
|---|---:|---|
| CC-FE004 DOM | 9 | req. 3, 4.1–4.5, 5, 6, 7 |
| CC-FE005 TypeScript | 8 | 3, 4.1–4.4, 5, 6 |
| CC-FE006 React | 9 | 3, 4.1–4.6 (duas a duas onde couber), 5, 6 |
| CC-FE007 Projeto de Interface | 9 | proposta, construção, publicação, versão, README, apresentação |
| CC-MB001 Dart | 8 | 3, 4.1–4.5, 5, 6 |
| CC-MB002 Flutter | 10 | 2, 4.1–4.6, 5, 6, 7 |
| CC-MB003 Kotlin | 7 | 3, 4.1–4.4, 5, 6 |
| CC-MB004 Swift | 7 | 3, 4.1–4.4, 5, 6 |
| CC-MB005 Projeto Mobile | 10 | 2 a 9 |
| CC-BE001 Node | 9 | 3, 4.1–4.5, 5, 6, 7 |
| CC-BE002 C# | 8 | 3, 4.1–4.5, 5, 6 |
| CC-BE003 Java | 8 | 3, 4.1–4.5, 5, 6 |
| CC-BE004 Pandas | 10 | 3, 4.1–4.6, 5, 6, 7 |
| CC-BE005 R | 8 | 3, 4.1–4.5, 5, 6 |
| CC-BE006 Projeto de Servidor | 9 | 2 a 7 |
| CC-SI001 C | 9 | 3, 4.1–4.5, 5, 6, 7 |
| CC-SI002 C++ | 8 | 3, 4.1–4.5, 5, 6 |
| CC-SI003 Go | 8 | 3, 4.1–4.5, 5, 6 |
| CC-SI004 Rust | 8 | 3, 4.1–4.5, 5, 6 |
| CC-SI005 Projeto de Sistema | 9 | 2 a 8 |
| CC-IE001 Bash | 8 | 3, 4.1–4.5, 5, 6 |
| CC-IE002 Docker | 9 | 3, 4, 5.1–5.5, 6, 7 |
| CC-IE003 Projeto de Implantação | 9 | 2 a 8 |
| **Total** | **197** | |

### Trilhas — laboratórios novos

As sete abertas têm de 3 a 8 laboratórios distintos (28 ao todo).

| Trilha | Laboratórios | Quais seriam |
|---|---:|---|
| AP049 Desenvolvimento de Software | 3 | fluxograma; diagrama UML (req. 6); quadro ágil (req. 7) |
| AP052 Informática Programável | 3 | pesquisa da história (req. 1); relatório; programa útil para o clube (req. 4) |
| AP063 Web Designer | 2 | ferramentas do mercado (req. 2); página no bloco de notas com formulário (req. 3) |
| AP064 Web Designer, Avançado | 4 | página HTML/CSS/JS com validação (4); página por ferramenta gráfica (5); página dinâmica com cadastro (6); projeto escrito do site (7) |
| HM079 Desenho Vetorial | 3 | atalhos e vinte ferramentas (8); três desenhos (9); revisão por profissional (10) |
| HM090 Arte Digital | 3 | galeria de cinco obras (8); categorias (9); dois projetos autorais (13) |
| **Total** | **18** | |

## 5. Decisões tomadas (13/11/2026)

**D1. O número estimado vira compromisso.** Cada anunciada ganha
`laboratoriosPrevistos` no registro. A Faixa reserva exatamente esse número de
satélites, e uma trava reprova a abertura com número diferente. Mudar continua
possível, mas editando o registro de propósito.

**D2. `LabType` exclusivo por trilha.** Uma trava exige que todo tipo de
laboratório pertença a uma trilha só. O motor pode ser reaproveitado; o tipo
não. Os 28 códigos atuais ficam como estão.

**D3. As escadas fecham no fim.** Nas escadas que contam conteúdo, o sétimo
degrau é "tudo": todas as trilhas e veredas, as abertas e as hoje anunciadas.
Os degraus 5 e 6 se redistribuem. Os códigos de topo com número no nome viram
códigos novos, e quem já tem os antigos continua com eles.

**D4. XP por primeira vitória, com as veredas dentro.** O XP passa a ter valor
fixo por tipo de vitória e um máximo conhecido, que é o topo da escada de XP.
As veredas entram, mas as trilhas ficam com **pelo menos 75% do XP total**, e
uma trava confere essa proporção. Exemplo que respeita a regra, a calibrar
depois:

| Vitória | XP | Quantas | Soma |
|---|---:|---:|---:|
| Lição de teoria de trilha | 10 | ~126 | 1.260 |
| Laboratório de trilha | 25 | ~56 | 1.400 |
| Prova final | 50 | 13 | 650 |
| Trilha concluída | 100 | 13 | 1.300 |
| Teoria de vereda | 1 | ~434 | 434 |
| Laboratório de vereda | 2 | ~434 | 868 |
| Vereda concluída | 4 | 51 | 204 |
| **Total** | | | **~6.116** (trilhas 75,4%) |

Isso muda uma decisão registrada no CLAUDE.md ("a vereda fica fora do XP"), e
o texto de lá será reescrito junto com o código.

**D5. "Sem erro" conta a teoria de vereda.** Com isso o máximo da escada passa
de ~182 para ~616: as ~182 lições de trilha mais as ~434 teorias de vereda.

**D6. Peça vazia até concluir.** O patch ou button fica só na marca até a
conclusão, e os satélites acendem um a um em volta. Se o Token.Web() for
revogado, a peça aparece apagada e o cartão diz que foi revogado.

## 6. O que não depende destas decisões

Os protótipos dos materiais (patch, button, pin, tecido e arrasto) não usam
nenhum destes números e podem começar já. Só a composição (o P1) precisa da
contagem final.

## 7. Curiosidades — proposta (em discussão)

Hoje são quatro, e as quatro medem só o **horário**: Coruja, Madrugador, Fim
de Semana e Semana Inteira. A proposta é chegar a cerca de trinta, em cinco
temas, e a diversidade vem dos temas, e não da contagem.

### As regras que toda curiosidade cumpre

1. **Ao alcance de quem percorre tudo, sem precisar fazer nada ruim.** A Faixa
   precisa fechar de cabo a rabo. Uma curiosidade que exija parar de estudar
   por um mês, reprovar de propósito ou ficar acordado de madrugada deixa a
   Faixa impossível para quem faz tudo certo, ou ensina o hábito errado. Por
   essa regra ficaram de fora "Volta por cima" (voltar depois de 30 dias
   parado), "Segunda chance" (reprovar e depois vencer) e "Pediu o mapa" (o
   passo a passo só aparece para quem demora, e quem é rápido nunca o veria).
2. **Sem classe, sem XP e fora das escadas.** Elas dizem *como* e *quando*, e
   não *quanto*.
3. **O cartão ensina alguma coisa.** Toda curiosidade tem no cartão uma frase
   que explica de onde ela vem: a data, a pessoa, o porquê.
4. **Sai de dado gravado, e não de autodeclaração.** As que pedem um evento
   novo dizem isso abaixo.

### A. Calendário da computação — 10 pins

Vale estudar **na semana** da data, e não só no dia: quem tem dez anos não
controla a própria agenda. O ano inteiro rende um pin a cada um ou dois meses,
e cada data se liga a uma trilha ou vereda da plataforma. Sai dos eventos
datados que já existem, e dá para conceder com a data de quem já estudou
nessas semanas.

| Pin | Semana de | O que o cartão conta | Liga com |
|---|---|---|---|
| Virada sem Bug | 1º de janeiro | o bug do milênio, na virada de 1999 para 2000 | AP045 |
| Internet Segura | Dia da Internet Segura (fevereiro) | o dia mundial pelo uso seguro da rede | AP034, CC-ES005 |
| Nascimento da Web | 12 de março | a proposta de Tim Berners-Lee, em 1989 | AP034, CC-FE001 |
| Dia do π | 14 de março | 3/14, o começo do número π | CC002 |
| Cópia de Segurança | 31 de março, Dia Mundial do Backup | a regra 3-2-1 | CC-ES001 |
| Senha Forte | Dia Mundial da Senha (1ª quinta-feira de maio) | senha longa e diferente em cada conta | CC-ES005 |
| Alan Turing | 23 de junho | o nascimento de Turing, um dos pais da computação | CC001 |
| Byte do Ano | 256º dia do ano (13 ou 12 de setembro) | o Dia do Programador: 256 é 2⁸, o que cabe num byte | CC002 |
| Ada Lovelace | 2ª terça-feira de outubro | a primeira pessoa a escrever um programa | CC001 |
| Grace Hopper | 9 de dezembro | a mariposa presa no computador, o "bug" de verdade | CC002, AP045 |

### B. Ritmo — quando se estuda

| Pin | Critério | Dado |
|---|---|---|
| Madrugador | estudou antes das sete da manhã | já existe |
| Pausa Boa | duas sessões no mesmo dia, com duas horas ou mais entre elas | eventos datados |
| Doze Meses | estudou em cada um dos doze meses do ano | eventos datados |
| Fim de Semana | estudou num sábado ou domingo | já existe (ver a pergunta abaixo) |

### C. Jeito de estudar

| Pin | Critério | Dado |
|---|---|---|
| Revisão | refez uma lição já vencida e venceu de novo | tentativas de lição |
| De Primeira | venceu uma prova final na primeira tentativa | tentativas de prova |
| Módulo de uma Vez | venceu a teoria e o laboratório do mesmo módulo no mesmo dia | eventos |
| Consulta | abriu a referência da vereda (o ícone de livro) e venceu o laboratório | **evento novo** |
| Palavra Própria | acrescentou a primeira palavra ao dicionário pessoal | tabela `dicionario_pessoal` |

### D. Explorador — variedade

| Pin | Critério | Dado |
|---|---|---|
| Rosa dos Ventos | venceu ao menos uma lição em cada uma das oito famílias de vereda | eventos |
| Três Frentes | avançou em três trilhas diferentes na mesma semana | eventos |
| Ponte | concluiu uma vereda e a trilha de onde ela saiu | registro (`origem`) |
| Todas as Janelas | venceu um laboratório em cada programa imitado (Word, Excel, PowerPoint, Explorador, correio, terminal, editor de código, editor de design) | mapa laboratório → programa |

### E. Segredos — easter eggs nas simulações

A Faixa mostra o lugar com um "?" e uma dica curta, e o desenho só aparece
depois de achado. Todos pedem **evento novo** no laboratório, classificado
como "passo do meio" em `ofensiva.test.ts`.

| Pin | Onde | Dica no lugar vazio |
|---|---|---|
| Arquivo Escondido | Explorador: mostrar itens ocultos e abrir o arquivo que estava lá | "Nem tudo aparece na pasta." |
| Leitor de Manual | terminal: pedir `--help` a um comando | "Todo comando tem instruções." |
| Lixeira Arqueológica | Explorador: restaurar o item mais antigo da Lixeira | "Alguém jogou fora há muito tempo." |
| Fim da Planilha | Excel: Ctrl+↓ numa coluna vazia, até a última linha | "Até onde vai uma planilha?" |
| Gato Pintado | Scratch: trocar a cor do ator | "O gato não precisa ser laranja." |

**Total proposto:** 10 + 4 + 5 + 4 + 5 = **28 curiosidades**, contra as 4 de
hoje.

### Perguntas em aberto

- **Coruja** (entre meia-noite e cinco da manhã) contraria a regra 1: premia
  uma criança de dez anos por estudar de madrugada. Proposta: aposentá-la.
  Quem já a tem continua com ela, e o lugar na Faixa sai do catálogo.
- **Semana Inteira** exige estudar num sábado. Num clube adventista isso pode
  conflitar com a guarda do sábado, e o mesmo vale para o sábado de Fim de
  Semana. Mantém, troca para "domingo a sexta", ou aposenta?
- **Material:** pin redondo off-white com o glifo, como hoje, ou pin
  **recortado na forma do próprio desenho** — a mariposa, o π, o cadeado —,
  como os pins de verdade? O recortado deixa claro que ele não tem classe,
  porque as classes são polígonos, mas pede 28 desenhos próprios.

### Ligação com a BNCC

O público começa aos dez anos, que é o Ensino Fundamental dos anos finais.

- O tema **A** trabalha a Cultura Digital, um dos eixos do complemento de
  Computação da BNCC (história da computação, segurança e cidadania digital),
  e a Competência Geral 5.
- Os temas **B** e **C** trabalham a Competência Geral 8, de autoconhecimento
  e autocuidado: pausas, revisão, consultar a referência.
- Os temas **D** e **E** trabalham a curiosidade investigativa da Competência
  Geral 2.
