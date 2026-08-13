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
| `BookOpen` | Menu "Trilhas" | Trilhas de especialidade |
| `FileText` | Menu "Relatório" | Relatório de competências |
| `Medal` | Menu "Ranking" | Classificação |
| `Trophy` | Menu "Verificar" | Verificação de certificado |
| `User` | Menu "Perfil" | Conta do usuário |
| `ShieldCheck` | Menu "Admin" | Área administrativa |
| `LogOut` | Menu | Sair da conta |
| `Menu` | Cabeçalho (celular) | Abrir menu |
| `X` | Cabeçalho (celular), modais | Fechar |

## Grupo 2 — Especialidades e certificação (6 ícones)

| Ícone | Onde aparece | Significado |
|---|---|---|
| `Award` | Painel, Admin, Ranking, Landing | Certificação Token.Web() |
| `Trophy` | Painel, Especialidade, Prova final | Trilha concluída |
| `Printer` | Certificado, Relatório | Imprimir / salvar PDF |
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
| `Settings` | Configurações / eventos |
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

O ícone do aplicativo (favicon e atalho no celular), em
`public/icon-192.svg` e `public/icon-512.svg`, é um item à parte e também pode ser
substituído por arte sua — nesse caso, quadrado, colorido e com fundo.
