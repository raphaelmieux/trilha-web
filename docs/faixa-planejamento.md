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

## 5. O que precisa ser decidido antes do desenho

**D1. O número estimado vira compromisso?** Recomendo que sim: cada anunciada
ganha no registro um campo `laboratoriosPrevistos`, a Faixa reserva exatamente
esse número de satélites, e uma trava reprova a abertura de uma vereda cujo
número real for diferente. Mudar o número continua possível, mas em edição
consciente do registro. Isso também protege o desenho: cada cacho tem um anel
de tamanho fixo, e um anel que muda de tamanho empurraria os vizinhos.

**D2. O laboratório de trilha pertence a uma trilha só.** A insígnia é
`lab_<tipo>`, do *tipo* de laboratório, e não da lição. Se a AP052 reutilizar
o laboratório de pesquisa da AP045, ela ganha zero satélites, e o pin da
pesquisa não tem como orbitar dois patches. Proposta: uma trava que exija
`LabType` exclusivo por trilha. Um motor pode ser reaproveitado, como o Word
foi; o que precisa ser novo é o tipo. A alternativa seria trocar a identidade
para `lab_trilha_<código>_<lição>`, como nas veredas, mas isso mexe nos 28
códigos que já foram concedidos.

**D3. As escadas fecham no fim, ou no meio?**
- *(a) Manter como estão.* Tudo alcançável; Lições, Módulos e Requisitos
  fecham cedo.
- *(b) O sétimo degrau é "tudo".* Nas escadas que contam conteúdo, o topo
  passa a ser calculado do currículo ("Todas as lições"), e os degraus 5 e 6
  se redistribuem entre o que existe hoje e o todo. A Faixa só fecha com a
  plataforma inteira percorrida. Custo: os códigos de topo atuais
  (`licoes_110`, `modulos_45`, `requisitos_192`, `tokens_40` e outros) têm o
  número no nome. Seria preciso criar códigos novos, e quem já tem os antigos
  continua com eles, pela regra do CLAUDE.md de nunca tirar insígnia de quem a
  conquistou.

Recomendo (b), porque é ela que faz o último pin significar "fechou a Faixa".

**D4. Que XP é esse?** Recomendo um XP por **primeira vitória** — lição,
laboratório, prova, trilha —, com valor fixo por tipo. Assim o máximo é um
número conhecido, e o topo da escada pode ser ele. Hoje refazer a mesma lição
soma de novo. A vereda continua fora do XP, como está decidido.

**D5. "Sem erro" conta a teoria de vereda?** Ou fica só com a trilha, como
hoje?

**D6. O button e o patch de quem está no meio.** Recomendação: vazio até
concluir — só a marca da costura, ou o furo do button —, e os satélites
acendendo um por um em volta. Assim se vê o progresso sem que a peça principal
apareça antes da hora. O que tiver o Token.Web() revogado mostra a peça
apagada, com o cartão dizendo que foi revogado.

## 6. O que não depende destas decisões

Os protótipos dos materiais (patch, button, pin, tecido e arrasto) não usam
nenhum destes números e podem começar já. Só a composição (o P1) precisa da
contagem final.
