import type { Specialty } from '../types';
import { modulo1 } from './ap044/modulo1';
import { modulo2 } from './ap044/modulo2';
import { modulo3 } from './ap044/modulo3';
import { modulo4 } from './ap044/modulo4';
import { modulo5 } from './ap044/modulo5';
import { modulo6 } from './ap044/modulo6';
import { modulo7 } from './ap044/modulo7';
import { modulo8 } from './ap044/modulo8';

/*
 * AP044 — Computação 4
 *
 * Os requisitos abaixo são os do documento oficial —
 * `public/curriculum files/AP044 Computação 4.pdf` —, na ordem e com a redação
 * dele.
 *
 * O documento troca uma letra no item 11: as alíneas saem a), b), **e)**, d),
 * e), f), g), h), i), sem nenhuma c). É o mesmo deslize da AP041 no item 5, da
 * AP042 no 6 e da AP043 no 2, e a resposta aqui é a de sempre — a numeração
 * segue a ordem em que os itens aparecem, que é o que importa para conferir
 * cumprimento.
 *
 * O requisito 1 é "ter a especialidade de Computação 3", e ele não vira módulo:
 * quem cumpre é o próprio bloqueio da trilha. Ver `peloPreRequisito`, em types.
 *
 * ── O que esta trilha é, e a AP043 não era ───────────────────────────────
 * A AP043 monta um documento e uma planilha: uma tabela, uma imagem, um
 * cabeçalho, uma fórmula. Cada peça é posta à mão, uma vez, no lugar onde ela
 * fica.
 *
 * Aqui o que se aprende é a **parar de pôr à mão**. Estilo em vez de negrito
 * repetido, sumário que se gera do que já foi marcado, filtro em vez de olhar
 * linha por linha, slide mestre em vez de mover caixa de texto em vinte slides,
 * banco de dados em vez de vinte e cinco nomes soltos num papel. É a mesma
 * lição em cinco programas diferentes: descrever a estrutura uma vez e deixar o
 * computador aplicá-la em toda parte.
 *
 * Por isso seis dos oito módulos terminam em laboratório. "Saber gerar um
 * sumário" não se prova em múltipla escolha — e nenhuma alternativa separa quem
 * aplicou um estilo de quem leu sobre estilos.
 */

export const ap044: Specialty = {
  code: 'AP044',
  name: 'Computação 4',
  level: 'intermediario',
  familia: 'Computação',
  preRequisito: 'AP043',
  description: 'Parar de fazer à mão o que o programa faz sozinho: estilo, sumário, filtro, gráfico, slide mestre e banco de dados.',

  /*
    Continua anunciada até o schema chegar.

    A trilha entrou em vários pushes, e enquanto `emConstrucao` for verdadeiro o
    cartão fica cinza no painel e a trilha não abre — então cada push pôde
    fechar verde sem que ninguém entrasse num percurso pela metade. É a mesma
    regra que a vereda já segue: conteúdo escrito é conferido, publicado ou não.

    O que falta agora não é conteúdo nem arte: o emblema e o fundo do
    certificado já estão no repositório. É a **ordem de publicação**. O
    frontend e o Supabase saem do mesmo push e correm ao mesmo tempo, e as
    linhas de `requirements` e `lessons` desta trilha entram por migration —
    abrir a trilha no mesmo push que as cria deixaria os seis laboratórios
    comemorando sem ter gravado nada, que é o defeito que a AP041 já mostrou.

    Então isto sai no push seguinte, depois de o `supabase.yml` fechar verde
    em `main`.
  */
  emConstrucao: true,

  requirements: [
    // 1 — A especialidade anterior
    { code: 'AP044-1.1', title: 'Computação 3', description: 'Ter a especialidade de Computação 3.', type: 'mixed', peloPreRequisito: true },

    // 2 — As unidades de medida
    { code: 'AP044-2.1', title: 'Bit', description: 'Definir bit.', type: 'theory' },
    { code: 'AP044-2.2', title: 'Kilobyte', description: 'Definir kilobyte.', type: 'theory' },
    { code: 'AP044-2.3', title: 'Megabyte', description: 'Definir megabyte.', type: 'theory' },
    { code: 'AP044-2.4', title: 'Gigabyte', description: 'Definir gigabyte.', type: 'theory' },
    { code: 'AP044-2.5', title: 'Terabyte', description: 'Definir terabyte.', type: 'theory' },

    // 3 — Vírus
    { code: 'AP044-3.1', title: 'Vírus e proteção', description: 'O que são vírus e como podemos nos proteger deles?', type: 'theory' },

    // 4 — Internet
    { code: 'AP044-4.1', title: 'A internet e a vida moderna', description: 'O que é a internet e como ela influencia a vida moderna?', type: 'theory' },

    // 5 — Sites educativos
    { code: 'AP044-5.1', title: 'Cinco sites educativos', description: 'Acessar e descrever o conteúdo de cinco sites da internet com conteúdo educativo.', type: 'practice' },

    // 6 — Banco de dados
    { code: 'AP044-6.1', title: 'Agenda em banco de dados', description: 'Montar um banco de dados para cadastrar, em forma de uma agenda, o nome de, no mínimo, 25 pessoas, contendo nome, endereço, telefone e e-mail de cada uma delas.', type: 'practice' },

    // 7 — Demonstrações num editor de texto
    { code: 'AP044-7.1', title: 'Estilos de título, ênfase e citação', description: 'Utilizar e formatar estilos para títulos, ênfase e citação.', type: 'practice' },
    { code: 'AP044-7.2', title: 'Colar mantendo a formatação', description: 'Colar um texto mantendo a formatação original.', type: 'practice' },
    { code: 'AP044-7.3', title: 'Colar com a formatação do destino', description: 'Colar um texto usando a formatação do destino.', type: 'practice' },
    { code: 'AP044-7.4', title: 'Sobrescrito e subscrito', description: 'Utilizar sobrescrito e subscrito.', type: 'practice' },
    { code: 'AP044-7.5', title: 'Destacar com cores', description: 'Destacar textos com cores.', type: 'practice' },
    { code: 'AP044-7.6', title: 'Alternar maiúsculas e minúsculas', description: 'Alternar maiúsculas e minúsculas.', type: 'practice' },
    { code: 'AP044-7.7', title: 'Colunas', description: 'Fazer colunas.', type: 'practice' },
    { code: 'AP044-7.8', title: 'Nota de rodapé', description: 'Inserir uma nota de rodapé.', type: 'practice' },
    { code: 'AP044-7.9', title: 'Sumário', description: 'Criar um sumário.', type: 'practice' },

    // 8 — Demonstrações numa planilha eletrônica
    { code: 'AP044-8.1', title: 'Filtros', description: 'Criar e usar filtros.', type: 'practice' },
    { code: 'AP044-8.2', title: 'Congelar linhas e colunas', description: 'Congelar linhas/colunas.', type: 'practice' },
    { code: 'AP044-8.3', title: 'Gráfico', description: 'Criar um gráfico.', type: 'practice' },

    // 9 — Demonstrações num editor de apresentações
    { code: 'AP044-9.1', title: 'Apresentação a partir de um modelo', description: 'Criar uma apresentação com base em um modelo (template).', type: 'practice' },
    { code: 'AP044-9.2', title: 'Layout do slide', description: 'Alterar o layout do slide.', type: 'practice' },
    { code: 'AP044-9.3', title: 'Criar, duplicar, reorganizar e excluir slides', description: 'Criar, duplicar, reorganizar e excluir slides.', type: 'practice' },
    { code: 'AP044-9.4', title: 'Imagens no slide', description: 'Inserir imagens e organizá-las adequadamente no slide.', type: 'practice' },
    { code: 'AP044-9.5', title: 'Vídeo', description: 'Inserir um vídeo.', type: 'practice' },
    { code: 'AP044-9.6', title: 'Áudio', description: 'Inserir um áudio.', type: 'practice' },
    { code: 'AP044-9.7', title: 'Salvar em PDF', description: 'Salvar a apresentação em formato pdf.', type: 'practice' },

    // 10 — Programas por função
    { code: 'AP044-10.1', title: 'Editores de texto', description: 'Citar uma ou duas opções de softwares atuais para editores de texto.', type: 'theory' },
    { code: 'AP044-10.2', title: 'Planilhas eletrônicas', description: 'Citar uma ou duas opções de softwares atuais para planilhas eletrônicas.', type: 'theory' },
    { code: 'AP044-10.3', title: 'Banco de dados', description: 'Citar uma ou duas opções de softwares atuais para banco de dados.', type: 'theory' },
    { code: 'AP044-10.4', title: 'Linguagem de programação', description: 'Citar uma ou duas opções de softwares atuais para linguagem de programação.', type: 'theory' },
    { code: 'AP044-10.5', title: 'Editores de imagens', description: 'Citar uma ou duas opções de softwares atuais para editores de imagens.', type: 'theory' },
    { code: 'AP044-10.6', title: 'Editores de vídeo', description: 'Citar uma ou duas opções de softwares atuais para editores de vídeo.', type: 'theory' },

    // 11 — Demonstrações na correspondência eletrônica
    { code: 'AP044-11.1', title: 'Destinatário', description: 'Adicionar um destinatário.', type: 'practice' },
    { code: 'AP044-11.2', title: 'Cópia', description: 'Adicionar destinatário em cópia.', type: 'practice' },
    { code: 'AP044-11.3', title: 'Cópia oculta', description: 'Adicionar destinatário em cópia oculta.', type: 'practice' },
    { code: 'AP044-11.4', title: 'Anexo', description: 'Inserir um arquivo.', type: 'practice' },
    { code: 'AP044-11.5', title: 'Assinatura', description: 'Personalizar uma assinatura.', type: 'practice' },
    { code: 'AP044-11.6', title: 'Enviar', description: 'Enviar o e-mail.', type: 'practice' },
    { code: 'AP044-11.7', title: 'Arquivar', description: 'Arquivar um e-mail.', type: 'practice' },
    { code: 'AP044-11.8', title: 'Responder', description: 'Responder um e-mail.', type: 'practice' },
    { code: 'AP044-11.9', title: 'Encaminhar', description: 'Encaminhar um e-mail.', type: 'practice' },

    // 12 — Segurança na correspondência
    { code: 'AP044-12.1', title: 'Segurança no e-mail', description: 'Que princípios de segurança devemos ter ao enviar e receber/abrir e-mails.', type: 'theory' },

    // 13 — Demonstrações no sistema
    { code: 'AP044-13.1', title: 'Limpeza e desfragmentação do disco', description: 'Fazer uma limpeza de disco e desfragmentação do disco.', type: 'practice' },
    { code: 'AP044-13.2', title: 'Abrir com outro programa', description: 'Abrir um arquivo usando um software diferente do padrão.', type: 'practice' },
    { code: 'AP044-13.3', title: 'Programa padrão', description: 'Definir um software padrão para abrir tipos de arquivo.', type: 'practice' },
    { code: 'AP044-13.4', title: 'Impressora padrão', description: 'Definir uma impressora padrão.', type: 'practice' },
    { code: 'AP044-13.5', title: 'Criar um usuário', description: 'Criar um usuário.', type: 'practice' },
  ],

  /*
   * Oito módulos para treze requisitos.
   *
   * Os requisitos 3, 4 e 5 viram um módulo só: o que é a internet, o que vem
   * junto com ela, e sair para usá-la. Separá-los daria dois módulos de uma
   * pergunta cada e um laboratório sem contexto.
   *
   * E o 10 fecha o módulo do sistema, junto com o 13. Parece pareamento
   * estranho até se ler os dois em voz alta: saber que programas existem para
   * cada tarefa, e dizer ao computador qual deles abre cada tipo de arquivo,
   * são a mesma pergunta feita de dois lados — a do catálogo e a da escolha.
   *
   * Cada um no seu arquivo, em ap044/, como nas três anteriores.
   *
   * ── A avaliação final entrou junto com as questões ──────────────────────
   * Ela ficou de fora enquanto a trilha se escrevia, e não por esquecimento: a
   * trava `index.test.ts > gives every trail with a final module its own exam`
   * existe porque uma trilha já apontou para um módulo de prova vazio e,
   * calada, aplicou a prova de outra especialidade. Declarar `AP044.F` antes
   * das questões abriria exatamente esse buraco.
   */
  modules: [
    modulo1,
    modulo2,
    modulo3,
    modulo4,
    modulo5,
    modulo6,
    modulo7,
    modulo8,
    {
      code: 'AP044.F',
      title: 'Avaliação Final',
      description: 'A prova que fecha a trilha, com questões de todos os requisitos.',
      lessons: [
        {
          code: 'AP044.F-L1',
          title: 'Avaliação Final de Computação 4',
          type: 'final',
          content: '',
          requirementCodes: [],
          labType: 'final_exam',
        },
      ],
    },
  ],
};
