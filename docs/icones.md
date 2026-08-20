# Inventário de ícones — Trilha.Web()

Hoje a plataforma usa **59 ícones distintos** da biblioteca [lucide-react](https://lucide.dev),
espalhados por 27 arquivos. Este documento lista todos eles, agrupados pela função
que exercem no app, para servir de base à criação de um conjunto próprio.

O arquivo [`icones.json`](icones.json) traz a mesma lista em formato de dados
(nome do ícone + arquivos onde aparece), gerado direto do código-fonte.

---

## Como enviar os ícones

**Formato preferido: SVG.** Um PNG também funciona, mas perde duas coisas
importantes que o app usa hoje:

1. **Cor dinâmica.** Os ícones mudam de cor conforme o estado (vermelho da marca
   quando ativo, cinza quando inativo, verde em sucesso, âmbar em conquistas). Isso
   só funciona se o traço do SVG usar `currentColor` em vez de uma cor fixa.
2. **Nitidez em qualquer tamanho.** Os mesmos ícones aparecem de 12px (tabelas) a
   64px (conquistas no perfil) e na impressão.

### Especificação técnica

| Item | Valor |
|---|---|
| Formato | SVG |
| Grade de desenho | 24 × 24 |
| `viewBox` | `0 0 24 24` |
| Estilo | Traço (contorno), **sem preenchimento** |
| Espessura do traço | 2 px na grade de 24 |
| Pontas e junções | arredondadas (`round`) |
| Cor | `currentColor` no `stroke` — não fixar cor |
| Margem de segurança | ~1 px em cada borda (desenho útil em 22 × 22) |

Exemplo do formato esperado:

```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="..." />
</svg>
```

> Se preferir desenhar preenchido (sólido) em vez de contornado, tudo bem — mas
> vale manter o mesmo partido para **todos**, senão o conjunto fica desigual. O
> estilo atual é inteiramente contornado.

### Como entregar

Um arquivo por ícone, nomeado com o nome da lista abaixo, por exemplo
`trophy.svg`, `flame.svg`, `shield-check.svg`. Pode mandar todos de uma vez ou em
lotes, seguindo a ordem de prioridade sugerida.

A troca é feita de forma gradual: monto um componente único de ícones que aponta
para os seus arquivos, e cada ícone entregue substitui o correspondente da
biblioteca sem quebrar o resto — não é preciso desenhar os 59 de uma vez.

---

## Prioridade sugerida

Se quiser começar pelo que mais aparece e mais define a identidade visual:

1. **Grupo 1 e 2** (navegação e marca) — é o que o usuário vê em toda tela.
2. **Grupo 3** (conquistas) — são os elementos mais "visuais" do app.
3. **Grupo 4** (estados) — aparecem centenas de vezes nas lições.
4. Demais grupos, conforme o tempo permitir.

---

## Grupo 1 — Navegação e identidade (11 ícones)

O menu principal e a marca. Máxima visibilidade.

| Ícone | Onde aparece | Significado no app |
|---|---|---|
| `Compass` | Login, Cadastro, Recuperar senha, Landing | **Símbolo da marca Trilha.Web()** |
| `Home` | Menu "Início" | Painel inicial |
| `Map` | Menu "Trilhas" | Trilhas de especialidade |
| `FileText` | Menu "Relatório" | Relatório de competências |
| `Podium` | Menu "Ranking" e título da página | Classificação |
| `Award` | Menu "Verificar" e título da página | Verificação de certificado |
| `User` | Menu "Perfil" | Conta do usuário |
| `ShieldCheck` | Menu "Admin" | Área administrativa |
| `LogOut` | Menu | Sair da conta |
| `Menu` | Cabeçalho (celular) | Abrir menu |
| `X` | Cabeçalho (celular), modais | Fechar |

## Grupo 2 — Especialidades e certificação (6 ícones)

| Ícone | Onde aparece | Significado |
|---|---|---|
| `Award` | Painel, Admin, Ranking, Landing | Certificação Token.Web() |
| `Award` | Painel, Especialidade, Prova final | Trilha concluída |
| `Download` | Certificado, Relatório | Salvar PDF |
| `Lock` | Painel, Especialidade | Trilha bloqueada |
| `Star` | Painel, Especialidade, Landing | Laboratório / destaque |
| `Play` | Especialidade | Iniciar lição |

## Grupo 3 — Conquistas e gamificação (6 ícones)

Usados nas medalhas do perfil e do ranking. Cada um representa um tipo de
conquista e tem três variações de cor (bronze, prata, ouro).

| Ícone | Conquista |
|---|---|
| `Footprints` | Primeiro Passo — primeiro requisito concluído |
| `Layers` | Módulo Concluído |
| `Flame` | Sequência de 3 / 7 / 30 dias |
| `Trophy` | Trilha AP034 ou AP035 completa |
| `Star` | Nota Máxima na avaliação final |
| `Award` | Ícone padrão de conquista |

## Grupo 4 — Estados e feedback (7 ícones)

Os mais repetidos do app: aparecem em cada questão, laboratório e formulário.

| Ícone | Significado |
|---|---|
| `CheckCircle2` | Acerto / concluído / salvo *(14 arquivos — o mais usado)* |
| `AlertCircle` | Erro / aviso *(11 arquivos)* |
| `XCircle` | Resposta errada |
| `Circle` | Não iniciado |
| `Clock` | Atividade recente |
| `Inbox` | Estado vazio (nada aqui ainda) |
| `AlertTriangle` | Aviso institucional |

## Grupo 5 — Laboratórios (18 ícones)

Cada laboratório simula uma ferramenta real; os ícones reforçam essa simulação.

**WebLab (navegador simulado)**
| Ícone | Uso |
|---|---|
| `Globe` | Site / navegação |
| `Search` | Busca |
| `RotateCw` | Recarregar página |
| `Download` | Baixar arquivo |
| `Lock` | Conexão segura (HTTPS) |
| `Home` | Página inicial |

**MailLab (e-mail simulado)**
| Ícone | Uso |
|---|---|
| `Mail` | Mensagem |
| `Send` | Enviar |
| `Paperclip` | Anexo |
| `ShieldAlert` | Alerta de phishing |
| `Inbox` | Caixa de entrada |

**CodeLab / SiteLab (editor de código)**
| Ícone | Uso |
|---|---|
| `Code2` | Código HTML |
| `FileCode` | Arquivo de código |
| `Eye` | Pré-visualizar |
| `Play` | Executar testes |
| `RotateCcw` | Restaurar |

**ImageLab**
| Ícone | Uso |
|---|---|
| `Image` | Imagem |
| `Layout` | Cabeçalho / diagramação |
| `MousePointerClick` | Botão clicável |

**AILab**
| Ícone | Uso |
|---|---|
| `Sparkles` | Geração por IA |
| `Palette` | Criação de logo |
| `ThumbsUp` / `ThumbsDown` | Avaliar resultado da IA |

**Outros laboratórios**
| Ícone | Uso |
|---|---|
| `FileSignature` | Pacto de Uso (assinatura) |
| `Shield` | Proteção / segurança |
| `Shuffle` | Embaralhar (Filipenses 4:8) |
| `BookOpen` | Texto bíblico |
| `Save` | Salvar rascunho |

## Grupo 6 — Administração e conta (11 ícones)

| Ícone | Uso |
|---|---|
| `Users` | Lista de usuários |
| `CalendarDays` | Eventos registrados |
| `KeyRound` | Senha / redefinição |
| `Copy` | Copiar valor |
| `Download` | Exportar CSV |
| `Search` | Buscar registro |
| `ArrowLeft` / `ArrowRight` | Navegação entre telas |
| `Camera` | Trocar foto de perfil |
| `Eye` / `EyeOff` | Mostrar/ocultar senha |
| `MessageCircleQuestion` | Ajuda / pergunta de segurança |
| `Map` | Trilha visual (Landing) |

---

## Observação sobre os emblemas das especialidades

Os emblemas **AP034** e **AP035** (que você já forneceu) **não** fazem parte desta
lista: eles são artes completas, coloridas, e continuam sendo usados como estão em
`public/assets/specialties/`. O mesmo vale para as artes de fundo dos certificados
em `public/assets/certificates/`.

O ícone do aplicativo (favicon e atalho no celular), em `public/icon.svg`, é um
item à parte. Desde 20/08/2026 são os parênteses da marca em vermelho sobre fundo
transparente — a mesma forma que fecha "Trilha.Web()". O `purpose` no manifest é
`any`, e não `maskable`: um ícone maskable é recortado pelo formato do lançador e
só garante os 80% centrais, o que cortaria as pontas dos parênteses, além de
pressupor fundo opaco.

---

## Alterações de 19/08/2026

O `Trophy` deixou de significar "certificado" e passou a significar **apenas
insígnia de conquista** (Grupo 3). Onde antes marcava trilha concluída ou
verificação, agora está o `Award`.

| Antes | Agora | Onde |
|---|---|---|
| `BookOpen` | `Map` | Menu "Trilhas" |
| `Medal` | `Podium` | Menu e página "Ranking" |
| `Trophy` | `Award` | Menu e página "Verificar" |
| `Trophy` | `Award` | Painel, Especialidade, Prova final |
| `Printer` | `Download` | Certificado e Relatório |
| `Settings` | `CalendarDays` | Card "Eventos" no admin |

O `Printer` já não existia no código: a impressão pelo navegador foi substituída
por geração nativa de PDF, e o botão passou a ser "Baixar PDF". A entrada no
catálogo é que estava velha.

O `Settings` saiu do app inteiro — ele só era usado no card de Eventos. Não há
tela de Configurações, então não há mais engrenagem em lugar nenhum.

As medalhas de 1º, 2º e 3º lugar no ranking continuam sendo `Medal`: ali a
medalha é o significado certo.

A biblioteca subiu de `lucide-react` 0.400 para 1.33, porque o `Podium` só existe
a partir de uma versão posterior. Dos 74 ícones em uso, só o `XCircle` mudou de
nome — virou `CircleX`.
