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
| Laboratórios de trilha | pin satélite do patch | 49 (31 hoje, com D2; 18 previstos) |
| Laboratórios de vereda | pin satélite do button | ~434 |
| Escadas (13 famílias × 7 classes) | pin, em cacho | 91 |
| Curiosidades | pin recortado | 58 (seção 7) |
| Mestrados | tarja bordada | 13 + ME006 (seção 8) |
| **Total** | | **~710** |

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

## 7. Curiosidades

Hoje são quatro, e as quatro medem só o **horário**. A proposta tem **58**, em
cinco temas; a diversidade vem dos temas, e não da contagem.

### Decisões já tomadas (13/11/2026)

- **O dia vira quatro turnos**, e a Coruja se aposenta. São quatro pins:
  Madrugador (00:00 às 05:59), Pessoa da Manhã (06:00 às 11:59), Pessoa da
  Tarde (12:00 às 17:59) e Noturno (18:00 às 23:59), sempre no horário de
  Brasília. Quem não alcança o Madrugador com dez anos alcança mais velho — a
  Faixa acompanha o desbravador por anos, incluindo as trilhas que pedem mais
  maturidade.
  - `madrugador` mantém o código e passa a valer de 00:00 às 05:59. Quem já o
    tem continua com ele, mesmo que tenha ganhado às 6h30 pela regra antiga:
    insígnia não se tira.
  - `coruja` sai do catálogo pela regra do CLAUDE.md: a migration primeiro
    concede `madrugador` a quem tem `coruja`, com o `awarded_at` original, e
    só então apaga a linha. Todo horário da Coruja (00h às 05h) cabe no
    Madrugador novo.
- **Sábado e sexta valem.** O sábado adventista vai do pôr do sol de sexta ao
  pôr do sol de sábado, então os dois dias têm horas em que estudar é
  plausível. Fim de Semana e Semana Inteira ficam como estão.
- **As curiosidades são pins recortados na forma do desenho** (a mariposa, o
  π, o cadeado). Assim elas nunca se confundem com as classes, que são
  polígonos regulares. A arte será fornecida depois; a especificação está no
  fim desta seção.

### As regras que toda curiosidade cumpre

1. **Ao alcance de quem percorre tudo, sem precisar fazer nada ruim** —
   reprovar de propósito, parar de estudar por um mês. A idade é a única
   espera aceita, e o calendário: uma data por ano, ou a cada quatro no caso do
   dia 29 de fevereiro.
2. **Sem classe, sem XP e fora das escadas.** Elas dizem *como* e *quando*, e
   não *quanto*.
3. **O cartão ensina alguma coisa:** a data, a pessoa, o porquê, o atalho.
4. **Sai de dado gravado, e não de autodeclaração.** As que pedem evento novo
   estão marcadas, e cada evento novo precisa ser classificado como "passo do
   meio" em `ofensiva.test.ts`.

### A. Calendário da computação — 23

Vale estudar **na semana** da data: quem tem dez anos não controla a própria
agenda. A única exceção é o dia 29 de fevereiro, que só existe se for no dia.
Todas saem dos eventos datados que já existem, e quem já estudou nessas
semanas recebe a concessão retroativa, com a data em que estudou. Todo mês do
ano tem pelo menos uma.

| Mês | Pin | Data | O que o cartão conta | Liga com |
|---|---|---|---|---|
| jan | Virada sem Bug | 1º de janeiro | o bug do milênio | AP045 |
| fev | Internet Segura | Dia da Internet Segura (terça da 2ª semana) | o dia mundial pelo uso seguro da rede | AP034, CC-ES005 |
| fev | Mulheres na Ciência | 11 de fevereiro | o dia internacional das mulheres e meninas na ciência | — |
| fev | O Dia que Quase Não Existe | 29 de fevereiro, só no dia | o ano bissexto, e o 29/02/1900 que o Excel conta e que nunca existiu | CC-ES003 |
| mar | Nascimento da Web | 12 de março | a proposta de Tim Berners-Lee, em 1989 | AP034 |
| mar | Dia do π | 14 de março | 3/14, o começo do π | CC002 |
| mar | Cópia de Segurança | 31 de março, Dia Mundial do Backup | a regra 3-2-1 | CC-ES001 |
| abr | Meninas nas TIC | 4ª quinta-feira de abril | o dia internacional das meninas na tecnologia | — |
| mai | Senha Forte | Dia Mundial da Senha (1ª quinta-feira) | senha longa e diferente em cada conta | CC-ES005 |
| mai | O Homem que Calculava | 6 de maio, Dia Nacional da Matemática | Malba Tahan, que dá nome à data | CC-ES003 |
| mai | Sociedade da Informação | 17 de maio | o dia mundial das telecomunicações | AP034 |
| jun | Alan Turing | 23 de junho | o nascimento de Turing | CC001 |
| jul | Dia do Emoji | 17 de julho | por que o emoji é um caractere, e não uma imagem | CC-FE001 |
| ago | Primeiro Site | 6 de agosto | o primeiro site público, em 1991 | CC-FE001 |
| ago | Dia da Fotografia | 19 de agosto | a fotografia, e o que o pixel fez com ela | CC-DG003 |
| ago | Pinguim | 25 de agosto | o anúncio do Linux, em 1991 | CC003 |
| set | Byte do Ano | 256º dia do ano (13 ou 12 de setembro) | o Dia do Programador: 256 = 2⁸ | CC002 |
| set | Código Aberto | Dia do Software Livre (3º sábado) | software livre, e por que esta plataforma é um | rodapé `CodigoFonte` |
| out | Ada Lovelace | 2ª terça-feira de outubro | a primeira pessoa a escrever um programa | CC001 |
| out | Quadro a Quadro | 28 de outubro, Dia Internacional da Animação | como a animação engana o olho | HM090 |
| nov | Dia do Designer | 5 de novembro | Aloísio Magalhães, que dá nome à data | CC-DG004 |
| nov | Segurança da Informação | 30 de novembro | o dia mundial da segurança de computadores | CC-ES005 |
| dez | Grace Hopper | 9 de dezembro | a mariposa presa no computador, o "bug" de verdade | AP045 |

### B. Ritmo — quando se estuda — 9

| Pin | Critério | Dado |
|---|---|---|
| Madrugador | estudou entre 00:00 e 05:59 | eventos datados |
| Pessoa da Manhã | estudou entre 06:00 e 11:59 | eventos datados |
| Pessoa da Tarde | estudou entre 12:00 e 17:59 | eventos datados |
| Noturno | estudou entre 18:00 e 23:59 | eventos datados |
| Fim de Semana | estudou num sábado ou domingo | já existe |
| Semana Inteira | estudou em cada um dos sete dias da semana | já existe |
| Pausa Boa | duas sessões no mesmo dia, com duas horas ou mais entre elas | eventos datados |
| Doze Meses | estudou em cada um dos doze meses | eventos datados |
| Um Ano de Faixa | estudou na semana em que fez um ano da primeira atividade | eventos datados |

### C. Jeito de estudar — 10

| Pin | Critério | Dado |
|---|---|---|
| Revisão | refez uma lição de trilha já vencida e venceu de novo | tentativas de lição |
| De Primeira | venceu uma prova final na primeira tentativa | tentativas de prova |
| Módulo de uma Vez | venceu a teoria e o laboratório do mesmo módulo no mesmo dia | eventos |
| Consulta | abriu a referência da vereda (o ícone de livro) e venceu o laboratório | **evento novo** |
| Palavra Própria | acrescentou a primeira palavra ao dicionário pessoal | tabela `dicionario_pessoal` |
| Mão no Teclado | usou cinco atalhos de teclado diferentes nas simulações | **evento novo** |
| Botão Direito | abriu um menu de contexto, com o botão direito ou o toque longo | **evento novo** |
| Na Parede | baixou ou imprimiu um Token.Web() | **evento novo** |
| Relatório Entregue | gerou o relatório para o clube | **evento novo** |
| Conferido | verificou um Token.Web() na página pública de verificação | **evento novo** |

### D. Explorador — variedade — 5

| Pin | Critério | Dado |
|---|---|---|
| Rosa dos Ventos | venceu ao menos uma lição em cada uma das oito famílias de vereda | eventos |
| Três Frentes | avançou em três trilhas diferentes na mesma semana | eventos |
| Ponte | concluiu uma vereda e a trilha de onde ela saiu | registro (`origem`) |
| Todas as Janelas | venceu um laboratório em cada programa imitado | mapa laboratório → programa |
| Poliglota | venceu laboratórios em cinco linguagens (blocos, Python, SQL, JavaScript, HTML/CSS, Bash…) | mapa laboratório → linguagem |

### E. Segredos — easter eggs nas simulações — 11

Na Faixa o lugar aparece com "?" e uma dica curta, e o desenho só se revela
depois de achado. Todos pedem **evento novo** no laboratório, e todos ensinam
um recurso que o programa de verdade também tem.

| Pin | Onde e o quê | Dica no lugar vazio |
|---|---|---|
| Arquivo Escondido | Explorador: mostrar itens ocultos e abrir o arquivo que estava lá | "Nem tudo aparece na pasta." |
| Extensões à Mostra | Explorador: ligar as extensões de nome de arquivo | "Todo nome tem um sobrenome." |
| Lixeira Arqueológica | Explorador: restaurar o item mais antigo da Lixeira | "Alguém jogou fora há muito tempo." |
| Leitor de Manual | terminal: pedir `--help` a um comando | "Todo comando tem instruções." |
| Quem Sou Eu | terminal: `whoami` | "O computador sabe quem você é?" |
| Viajante no Tempo | terminal: voltar o repositório a um commit antigo | "O Git lembra de tudo." |
| Zen do Python | editor de Python: `import this` | "O Python tem uma filosofia escondida." |
| Mapa do Banco | editor de SQL: consultar `sqlite_master` | "O banco guarda a própria planta." |
| Fim da Planilha | Excel: Ctrl+↓ numa coluna vazia, até a última linha | "Até onde vai uma planilha?" |
| Texto de Enchimento | Word: `=rand()` e Enter gera parágrafos, como no Word de verdade | "O Word escreve sozinho, se você pedir." |
| Gato Pintado | Scratch: trocar a cor do ator | "O gato não precisa ser laranja." |

O Texto de Enchimento pede implementar o `=rand()` na folha do Word, e o Fim
da Planilha pede que a grade conheça o número de linhas do Excel. Os outros
nove usam o que a simulação já faz, e só precisam do evento.

### Total

| Tema | Pins |
|---|---:|
| A. Calendário da computação | 23 |
| B. Ritmo | 9 |
| C. Jeito de estudar | 10 |
| D. Explorador | 5 |
| E. Segredos | 11 |
| **Curiosidades** | **58** (hoje são 4) |

Com isso a Faixa completa passa de ~639 para ~693 peças.

### Lista fechada (13/11/2026)

As 58 curiosidades acima são a lista. Mudanças a partir daqui são edição
consciente do planejamento.

## 8. Mestrados

No clube, completar um conjunto de especialidades de uma área rende um
**Mestrado**, que vai na faixa. Aqui, cada família de trilha e cada família de
vereda concluída rende o seu. São **13 peças**, e a Faixa completa passa a ter
cerca de **706**.

| Família | Tipo | Percursos que fecham o Mestrado |
|---|---|---|
| Internet | trilhas | AP034, AP035 |
| Computação | trilhas | AP041, AP042, AP043, AP044, AP045 |
| Programação | trilhas | AP049, AP052 |
| Web Design | trilhas | AP063, AP064 |
| Artes e Habilidades Manuais | trilhas | HM079, HM090 |
| Base | veredas | CC001 a CC006 |
| Escritório | veredas | CC-ES001 a CC-ES013 |
| Design | veredas | CC-DG001 a CC-DG006 |
| Front-end | veredas | CC-FE001 a CC-FE007 |
| Mobile | veredas | CC-MB001 a CC-MB005 |
| Back-end | veredas | CC-BE001 a CC-BE006 |
| Sistemas | veredas | CC-SI001 a CC-SI005 |
| Infraestrutura | veredas | CC-IE001 a CC-IE003 |

**Regras.** A lista de cada Mestrado sai do registro (`familia`), e não de uma
lista escrita à mão. O Mestrado não tem classe e não rende XP. Ele fica perto do
cacho da família dele na Faixa, e o código é `mestrado_<familia>` (a família
sem acento, em minúsculas, com hífen no lugar do espaço).

**Especificação da arte:**
- Um arquivo por Mestrado, em `public/assets/mestrados/<codigo>.png`. A pasta é
  a fonte da verdade, como `specialties`.
- PNG de **970 × 600** (o retângulo áureo), sem transparência nos cantos: o
  arredondamento é a Faixa que recorta.
- **Material: button**, e não patch, para não se confundir com o Mestrado
  oficial (ME006, que é patch) nem com a especialidade (o patch oval).
- **Forma: retângulo áureo** (1,618 : 1), deitado, com os cantos um pouco
  arredondados, do tamanho de um button de vereda. A arte é a face do button;
  o aro de metal e o brilho do plástico são a Faixa que desenha.
- Até a arte chegar, o lugar mostra a face lisa com o nome da família.

### O Mestrado oficial: ME006 Mestrado em Ciência e Tecnologia (segredo)

Este é real, e não uma invenção da plataforma: o requisito oficial está em
`public/curriculum files/ME006 Mestrado em Ciência e Tecnologia.pdf`. Ele pede
**sete de vinte especialidades**, e onze delas são trilhas da plataforma:

| Na lista do ME006 | Trilha |
|---|---|
| Computação 1 a 5 | AP041, AP042, AP043, AP044, AP045 |
| Desenvolvimento de Software | AP049 |
| Informática Programável | AP052 |
| Internet / Internet, Avançado | AP034, AP035 |
| Web Designer / Web Designer, Avançado | AP063, AP064 |

As outras nove (Eletrônica, Experimentos Científicos, Física, Habilidades em
Matemática 1 e 2, Metodologia de Estudo, Óptica, Química e Segurança nas Redes
Sociais) não existem aqui, e a plataforma não conta o que não confere: dizer
"eu fiz Física" seria autodeclaração.

- **Regra:** sete trilhas concluídas dentre as onze da tabela. A lista é
  declarada à mão, porque sai do documento oficial, e uma trava confere que
  todo código citado existe no registro.
- **Segredo:** até a sétima trilha, o lugar é um "?" com a dica "Sete
  especialidades dizem mais juntas.", e ninguém vê o que é antes de alcançar.
- **O cartão diz o que a plataforma pode dizer:** que as sete trilhas foram
  concluídas aqui, e que o Mestrado oficial é entregue pelo clube. Ele não
  emite Token.Web(), porque o Mestrado não é um percurso da plataforma.
- **Código e arte:** `mestrado_me006`, com a arte em
  `public/assets/mestrados/ME006.png`. Ela é **patch**, como a especialidade: um
  retângulo deitado de cantos bem arredondados, com os lados maiores retos e
  paralelos e o mesmo raio nos quatro cantos, na proporção da tarja real
  (cerca de 1,36 : 1), com a borda de overloque no desenho e fundo
  transparente. É a única peça desenhada a partir de uma tarja que existe de
  verdade.
- **Os Mestrados de família não são oficiais**, e o cartão deles precisa dizer
  isso, para que o relatório entregue ao clube não os apresente como se fossem
  da Divisão. Proposta: "Mestrado da plataforma" no cartão deles, e "Mestrado
  oficial" no do ME006.

Com ele a Faixa completa tem cerca de **707 peças**.

## 9. Especificação da arte dos pins recortados

- Um arquivo por curiosidade, em `public/assets/pins/<codigo>.png`, com o
  nome sendo o código da insígnia. É a mesma regra de `specialties`: a pasta é
  a fonte da verdade.
- PNG com fundo transparente, 512 × 512, com o desenho encostando na borda
  maior. O recorte é a silhueta do próprio desenho.
- A forma **não pode ser polígono regular** (triângulo, losango, pentágono…),
  porque essas são as formas das classes.
- O desenho já traz o esmalte, o aro metálico e o brilho. A sombra no tecido é
  a Faixa que desenha.
- Até a arte chegar, o lugar usa o círculo off-white com o glifo, como hoje. Uma
  trava confere, nos dois sentidos, que toda curiosidade tem arte e que
  nenhuma arte ficou sem curiosidade, a partir do dia em que a primeira leva
  chegar.

## 10. Ligação das curiosidades com a BNCC

O público começa aos dez anos, no Ensino Fundamental dos anos finais.

- O tema **A** trabalha o eixo Cultura Digital do complemento de Computação da
  BNCC (história da computação, quem a fez, segurança e cidadania digital) e a
  Competência Geral 5. Mulheres na Ciência, Meninas nas TIC, Ada Lovelace e
  Grace Hopper também trabalham a Competência Geral 9, de empatia e respeito à
  diversidade.
- Os temas **B** e **C** trabalham a Competência Geral 8, de autoconhecimento
  e autocuidado.
- Os temas **D** e **E** trabalham a curiosidade investigativa da Competência
  Geral 2 e o eixo Mundo Digital: o que o computador guarda e como.

## 11. Materiais aprovados no P0 (13/11/2026)

Protótipo: https://claude.ai/artifact/2NNp6Jm8ZRRQvAeJbeX93p (versão 2).

| Peça | Material | Forma | Tamanho |
|---|---|---|---|
| Trilha | patch bordado, borda de overloque | oval da arte (710 × 558) | ~200 px de largura |
| ME006 (oficial) | patch bordado | retângulo de cantos bem arredondados | como o patch de trilha |
| Vereda | button: aro de metal, brilho do plástico | círculo | ~112 a 128 px |
| Mestrado da plataforma | button | retângulo áureo, cantos levemente arredondados | ~150 × 93 px |
| Pin de classe (escadas e satélites) | pin esmaltado, aro dourado | polígono da classe | **cresce com a classe**: Amigo 30 px de altura, +5 px por classe, até o Líder com 60 px, metade de um button |
| Curiosidade | pin esmaltado recortado | silhueta do desenho | ~60 a 90 px |
| Segredo | lugar de giz com "?" | círculo | 58 px |

- **Lugar vazio:** o contorno de giz do alfaiate, com o código escrito. Pins e
  buttons vazios mostram o furo do alfinete.
- **Satélites:** em anel em volta da peça, a 10 px de folga da borda. O anel
  alarga sozinho quando os pins não cabem na volta.
- **Cachos das escadas:** o Líder no meio, os outros seis em volta.
- **Cartão do Token.Web():** o certificado de verdade (a arte de fundo, com o
  nome, o código e a data nas posições de `CertificateCanvas`) numa moldura de
  madeira com passe-partout e vidro, pendurada num prego na parede, e Baixar
  PDF e Imprimir embaixo.
- **Rolagem:** arrasto com a mãozinha e inércia, a roda do mouse anda para o
  lado, o dedo no celular e as setas do teclado. Arrastar e soltar em cima de
  uma peça não abre o cartão.
- **Régua:** fica até o produto final. Ela mostra os grupos da Faixa e a janela
  do que está à vista; clicar ou arrastar nela leva até lá.

## 12. P1 — a composição (13/11/2026)

Protótipo: https://claude.ai/artifact/Wd4RqdPXqWCJqhQ6tUt5Lp. O código está em
`docs/prototipos/faixa-p1.*`.

**O motor.** Cada unidade (uma peça com os seus satélites, um cacho de escada,
um Mestrado, um tema de curiosidades) procura o lugar mais à esquerda do seu
grupo em que nenhuma das **peças** dela toque peça de outra unidade. A colisão
é peça a peça, e não por uma elipse em volta da unidade: assim o anel de uma
vereda se encaixa no vão do anel da vizinha. A altura é sorteada a partir do
código, com um gerador de semente fixa, então a Faixa é a mesma para todo
mundo e nenhuma peça muda de lugar quando outra é conquistada. Cada família
começa um pouco antes de a anterior terminar, para as bordas se encaixarem. O
Mestrado procura lugar a partir do fim da família, que é o grupo que ele
fecha. Cachos e temas têm mais respiro entre si, para não se misturarem.

**O resultado:** 710 peças em cerca de 12.750 px de largura, na altura de
desenho de 520 px.

**Achado — D2 ainda não vale nas trilhas abertas.** Dois tipos de laboratório
aparecem em mais de uma trilha: `redacao_guiada` (AP034, AP041 e AP045) e
`web_lab` (AP034 e AP044). Pela D2, cada trilha precisa do seu: são **três
tipos novos**, com três insígnias novas e a concessão a quem já venceu aqueles
laboratórios naquelas trilhas. Com isso, os laboratórios de trilha passam a
ser 31 hoje e 49 na plataforma escrita.
