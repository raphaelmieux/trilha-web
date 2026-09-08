import type { Specialty } from '../types';
import { modulo1 } from './ap043/modulo1';
import { modulo2 } from './ap043/modulo2';
import { modulo3 } from './ap043/modulo3';
import { modulo4 } from './ap043/modulo4';
import { modulo5 } from './ap043/modulo5';
import { modulo6 } from './ap043/modulo6';

/*
 * AP043 — Computação 3
 *
 * Os 26 requisitos abaixo são os do documento oficial —
 * `public/curriculum files/AP043 Computação 3.pdf` —, na ordem e com a redação
 * dele.
 *
 * O documento troca as letras no item 2: as alíneas saem a), b), **e)**, d),
 * e), f), g), sem nenhuma c). É a mesma coisa que a AP041 faz no item 5 e a
 * AP042 no item 6, e a resposta aqui é a de sempre: a numeração segue a ordem
 * em que os itens aparecem, que é o que importa para conferir cumprimento.
 *
 * O requisito 1 é "ter a especialidade de Computação 2", e ele não vira módulo:
 * quem cumpre é o próprio bloqueio da trilha. Enquanto a AP042 não estiver
 * concluída esta nem abre; assim que estiver, abre — e o requisito se dá por
 * cumprido no mesmo instante. Ver `peloPreRequisito`, em types.
 *
 * ── O que esta trilha é, e a AP042 não era ───────────────────────────────
 * A AP042 usa o computador para tarefas de uma peça só: formatar um parágrafo,
 * comprimir um arquivo, imprimir. Aqui as tarefas têm partes que precisam
 * conversar entre si — uma tabela dentro de um texto, uma fórmula que lê um
 * intervalo de células, um cabeçalho que se repete em toda página. É por isso
 * que três dos oito requisitos são demonstração, e os três viram laboratório:
 * "saber inserir uma tabela" não se prova em múltipla escolha, e nenhuma
 * alternativa distingue quem já mesclou uma célula de quem leu sobre isso.
 */

export const ap043: Specialty = {
  code: 'AP043',
  name: 'Computação 3',
  level: 'intermediario',
  familia: 'Computação',
  preRequisito: 'AP042',
  description: 'Montar documentos e planilhas de verdade: tabela, imagem, cabeçalho, fórmula — e conhecer as peças, as redes e o backup por trás disso.',

  requirements: [
    // 1 — A especialidade anterior
    { code: 'AP043-1.1', title: 'Computação 2', description: 'Ter a especialidade de Computação 2.', type: 'mixed', peloPreRequisito: true },

    // 2 — Definições
    { code: 'AP043-2.1', title: 'Placa mãe', description: 'Definir placa mãe.', type: 'theory' },
    { code: 'AP043-2.2', title: 'Placa de vídeo', description: 'Definir placa de vídeo.', type: 'theory' },
    { code: 'AP043-2.3', title: 'Placa de som', description: 'Definir placa de som.', type: 'theory' },
    { code: 'AP043-2.4', title: 'Porta VGA e HDMI', description: 'Definir porta VGA e HDMI.', type: 'theory' },
    { code: 'AP043-2.5', title: 'Porta USB', description: 'Definir porta USB.', type: 'theory' },
    { code: 'AP043-2.6', title: 'Fonte de alimentação', description: 'Definir fonte de alimentação.', type: 'theory' },
    { code: 'AP043-2.7', title: 'Banco de dados', description: 'Definir banco de dados.', type: 'theory' },

    // 3 — Backup
    { code: 'AP043-3.1', title: 'Backup', description: 'O que significa backup e por que é importante fazê-lo? Citar algumas formas de como se fazia backup no passado e atualmente.', type: 'theory' },

    // 4 — Demonstrações num editor de texto
    { code: 'AP043-4.1', title: 'Inserir uma tabela', description: 'Inserir uma tabela e saber adicionar e excluir colunas e linhas, bem como formatá-las.', type: 'practice' },
    { code: 'AP043-4.2', title: 'Inserir uma imagem', description: 'Inserir uma imagem e saber ajustá-la ao texto.', type: 'practice' },
    { code: 'AP043-4.3', title: 'Inserir cabeçalho e rodapé', description: 'Inserir cabeçalho e rodapé e saber editá-los.', type: 'practice' },
    { code: 'AP043-4.4', title: 'Inserir numeração de páginas', description: 'Inserir numeração de páginas.', type: 'practice' },

    // 5 — Demonstrações numa planilha eletrônica
    { code: 'AP043-5.1', title: 'Tamanho das linhas e colunas', description: 'Ajustar o tamanho das linhas e colunas.', type: 'practice' },
    { code: 'AP043-5.2', title: 'Alinhar o texto à célula', description: 'Alinhar o texto à célula (acima, meio, abaixo; esquerda, centralizar, direita).', type: 'practice' },
    { code: 'AP043-5.3', title: 'Mesclar células', description: 'Mesclar células e desfazer mesclagem de células.', type: 'practice' },
    { code: 'AP043-5.4', title: 'Inserir e excluir linhas e colunas', description: 'Inserir e excluir linhas e colunas.', type: 'practice' },
    { code: 'AP043-5.5', title: 'Layout da tabela', description: 'Formatar o layout da tabela (de forma automática e manual).', type: 'practice' },
    { code: 'AP043-5.6', title: 'Funções soma e média', description: 'Utilizar as funções soma e média.', type: 'practice' },

    // 6 — Compatibilidade
    { code: 'AP043-6.1', title: 'Compatibilidade de equipamentos e versões', description: 'O que significa compatibilidade de equipamentos e versões?', type: 'theory' },

    // 7 — Redes
    { code: 'AP043-7.1', title: 'Computadores conectados e tipos de redes', description: 'Como os computadores podem estar conectados num escritório ou empresa? Quais os tipos de redes existentes?', type: 'theory' },

    // 8 — Demonstrações no sistema
    { code: 'AP043-8.1', title: 'Informações técnicas do computador', description: 'Consultar as informações técnicas do computador (memória, armazenamento, processador, sistema operacional, etc.).', type: 'practice' },
    { code: 'AP043-8.2', title: 'Detalhes de um arquivo', description: 'Consultar os detalhes de um arquivo.', type: 'practice' },
    { code: 'AP043-8.3', title: 'Itens na área de trabalho', description: 'Adicionar itens à área de trabalho.', type: 'practice' },
    { code: 'AP043-8.4', title: 'Print da tela', description: 'Fazer um print da tela.', type: 'practice' },
    { code: 'AP043-8.5', title: 'Data e hora do computador', description: 'Ajustar a data e a hora do computador.', type: 'practice' },
  ],

  /*
   * Seis módulos, e não oito: os requisitos 6 e 7 são uma pergunta cada, e uma
   * pergunta não sustenta um módulo. Os dois falam de máquinas que precisam se
   * entender — uma com a outra pela rede, ou com o arquivo que recebem —, e por
   * isso ficam juntos no módulo 5.
   *
   * Cada um no seu arquivo, em ap043/, como na AP041 e na AP042.
   */
  modules: [
    modulo1,
    modulo2,
    modulo3,
    modulo4,
    modulo5,
    modulo6,
    {
      code: 'AP043.F',
      title: 'Avaliação Final',
      description: 'A prova que fecha a trilha, com questões de todos os requisitos.',
      lessons: [
        {
          code: 'AP043.F-L1',
          title: 'Avaliação Final de Computação 3',
          type: 'final',
          content: '',
          requirementCodes: [],
          labType: 'final_exam',
        },
      ],
    },
  ],
};
