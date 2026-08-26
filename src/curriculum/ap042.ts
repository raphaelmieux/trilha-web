import type { Specialty } from '../types';
import { modulo1 } from './ap042/modulo1';
import { modulo2 } from './ap042/modulo2';
import { modulo3 } from './ap042/modulo3';
import { modulo4 } from './ap042/modulo4';
import { modulo5 } from './ap042/modulo5';

/*
 * AP042 — Computação 2
 *
 * Os 24 requisitos abaixo são os do documento oficial, na ordem e com a
 * numeração dele. O documento traz uma troca de letras no item 6 (duas alíneas
 * "e)", nenhuma "c)"), do mesmo jeito que a AP041 no item 5; a numeração aqui
 * segue a ordem em que os itens aparecem, que é o que importa para conferir o
 * cumprimento.
 *
 * O requisito 1 é "ter a especialidade de Computação 1", e ele não vira módulo:
 * quem cumpre é o próprio bloqueio da trilha. Enquanto a AP041 não estiver
 * concluída, esta nem abre; assim que estiver, abre — e o requisito se dá por
 * cumprido no mesmo instante. Ver `peloPreRequisito`, em types.
 *
 * A diferença de assunto para a AP041 é grande e vale registrar: lá o
 * computador é estudado por dentro, aqui ele é usado. Metade dos requisitos —
 * o 3 e o 6 — pede demonstração de tarefa, não definição, e nenhuma delas cabe
 * numa pergunta de múltipla escolha. Daí os dois laboratórios novos.
 */

export const ap042: Specialty = {
  code: 'AP042',
  name: 'Computação 2',
  level: 'basico',
  familia: 'Computação',
  preRequisito: 'AP041',
  description: 'Usar o computador para fazer as coisas: formatar um texto, escolher uma máquina, proteger da energia e resolver as tarefas do dia.',

  requirements: [
    // 1 — A especialidade anterior
    { code: 'AP042-1.1', title: 'Computação 1', description: 'Ter a especialidade de Computação 1.', type: 'mixed', peloPreRequisito: true },

    // 2 — Definições
    { code: 'AP042-2.1', title: 'Netbook', description: 'Definir netbook.', type: 'theory' },
    { code: 'AP042-2.2', title: 'Notebook', description: 'Definir notebook.', type: 'theory' },
    { code: 'AP042-2.3', title: 'Microcomputador', description: 'Definir microcomputador.', type: 'theory' },
    { code: 'AP042-2.4', title: 'Tablet', description: 'Definir tablet.', type: 'theory' },
    { code: 'AP042-2.5', title: 'Smartphone', description: 'Definir smartphone.', type: 'theory' },
    { code: 'AP042-2.6', title: 'Servidor', description: 'Definir servidor.', type: 'theory' },

    // 3 — Formatação num documento
    { code: 'AP042-3.1', title: 'Margens, tamanho e orientação do papel', description: 'Ajustar as margens, o tamanho e a orientação do papel.', type: 'practice' },
    { code: 'AP042-3.2', title: 'Copiar e colar textos', description: 'Copiar e colar textos.', type: 'practice' },
    { code: 'AP042-3.3', title: 'Fonte e tamanho da fonte', description: 'Alterar a fonte e o tamanho da fonte.', type: 'practice' },
    { code: 'AP042-3.4', title: 'Negrito, itálico e sublinhado', description: 'Usar negrito, itálico e sublinhado.', type: 'practice' },
    { code: 'AP042-3.5', title: 'Alinhamento do texto', description: 'Alinhar o texto (esquerda, centralizado, direita e justificado).', type: 'practice' },
    { code: 'AP042-3.6', title: 'Espaçamento do parágrafo', description: 'Ajustar o espaçamento do parágrafo.', type: 'practice' },
    { code: 'AP042-3.7', title: 'Marcadores e numeração', description: 'Utilizar marcadores e numeração.', type: 'practice' },

    // 4 — Avaliar um computador antes de comprar
    { code: 'AP042-4.1', title: 'Quantidade de memória', description: 'Saber como avaliar a quantidade de memória.', type: 'theory' },
    { code: 'AP042-4.2', title: 'HD ou SSD', description: 'Saber como avaliar o armazenamento: HD ou SSD.', type: 'theory' },
    { code: 'AP042-4.3', title: 'Tipo de processador', description: 'Saber como avaliar o tipo de processador.', type: 'theory' },
    { code: 'AP042-4.4', title: 'Velocidade do processador', description: 'Saber como avaliar a velocidade do processador.', type: 'theory' },
    { code: 'AP042-4.5', title: 'Tipo de monitor', description: 'Saber como avaliar o tipo de monitor.', type: 'theory' },

    // 5 — Energia
    { code: 'AP042-5.1', title: 'Oscilações de energia', description: 'Saber como proteger o computador de oscilações de energia.', type: 'mixed' },

    // 6 — Demonstrações
    { code: 'AP042-6.1', title: 'Comprimir e descomprimir arquivos', description: 'Comprimir e descomprimir arquivos.', type: 'practice' },
    { code: 'AP042-6.2', title: 'Salvar em pdf', description: 'Salvar um arquivo de texto, planilha ou apresentação em pdf.', type: 'practice' },
    { code: 'AP042-6.3', title: 'Instalar e desinstalar um software', description: 'Instalar e desinstalar um software.', type: 'practice' },
    { code: 'AP042-6.4', title: 'Imprimir um documento', description: 'Imprimir um documento, sabendo utilizar corretamente a quantidade de cópias, agrupamento, qualidade da impressão, ajustar o tamanho e modo múltiplo.', type: 'practice' },
  ],

  /*
   * Cinco módulos de conteúdo, um por requisito oficial do 2 ao 6, e a
   * avaliação final fechando a trilha. Cada um no seu arquivo, em ap042/, como
   * na AP041 — e pelo mesmo motivo: a AP034 guarda nove módulos num arquivo só,
   * passa de mil e duzentas linhas, e achar uma questão lá dentro custa caro.
   */
  modules: [
    modulo1,
    modulo2,
    modulo3,
    modulo4,
    modulo5,
    {
      code: 'AP042.F',
      title: 'Avaliação Final',
      description: 'A prova que fecha a trilha, com questões de todos os requisitos.',
      lessons: [
        {
          code: 'AP042.F-L1',
          title: 'Avaliação Final de Computação 2',
          type: 'final',
          content: '',
          requirementCodes: [],
          labType: 'final_exam',
        },
      ],
    },
  ],
};
