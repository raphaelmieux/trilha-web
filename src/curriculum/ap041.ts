import type { Specialty } from '../types';
import { modulo1 } from './ap041/modulo1';
import { modulo2 } from './ap041/modulo2';
import { modulo3 } from './ap041/modulo3';
import { modulo4 } from './ap041/modulo4';

/*
 * AP041 — Computação 1
 *
 * Os 26 requisitos abaixo são os do documento oficial da especialidade, na
 * ordem e com a numeração dele. O documento traz uma troca de letras no item 5
 * (duas alíneas "e)", nenhuma "c)"); a numeração aqui segue a ordem em que os
 * itens aparecem, que é o que importa para conferir o cumprimento.
 *
 * A trilha é escrita para desbravadores a partir de dez anos: frases curtas,
 * exemplos do dia a dia deles, lições menores que as da AP034.
 *
 * A trilha foi aberta em 21/08/2026, quando o último módulo ficou pronto. Até
 * ali ela vinha com `emConstrucao`, que a mostra no painel como aviso do que
 * está por vir — acinzentada, sem link e sem permitir início.
 */

export const ap041: Specialty = {
  code: 'AP041',
  name: 'Computação 1',
  level: 'basico',
  familia: 'Computação',
  description: 'Como o computador funciona por dentro, para que serve cada peça e como cuidar dele.',

  requirements: [
    // 1 — História
    { code: 'AP041-1.1', title: 'História dos computadores', description: 'Pesquisar a história dos computadores e escrever um relatório de, pelo menos, 250 palavras com os resultados da pesquisa.', type: 'practice' },

    // 2 — Definições
    { code: 'AP041-2.1', title: 'Hardware', description: 'Definir hardware.', type: 'theory' },
    { code: 'AP041-2.2', title: 'Software', description: 'Definir software.', type: 'theory' },
    { code: 'AP041-2.3', title: 'Sistema operacional', description: 'Definir sistema operacional.', type: 'theory' },
    { code: 'AP041-2.4', title: 'Driver', description: 'Definir driver.', type: 'theory' },
    { code: 'AP041-2.5', title: 'Disco rígido e SSD', description: 'Definir disco rígido (HD) e SSD.', type: 'theory' },
    { code: 'AP041-2.6', title: 'Memória RAM', description: 'Definir memória RAM.', type: 'theory' },
    { code: 'AP041-2.7', title: 'Memória ROM', description: 'Definir memória ROM.', type: 'theory' },

    // 3 — Apresentar ao examinador
    { code: 'AP041-3.1', title: 'Proteger da sujeira', description: 'Apresentar ao examinador como proteger seu computador da sujeira.', type: 'mixed' },
    { code: 'AP041-3.2', title: 'Manutenção preventiva', description: 'Apresentar ao examinador o que é manutenção preventiva do computador.', type: 'mixed' },
    { code: 'AP041-3.3', title: 'Ligar e desligar', description: 'Apresentar ao examinador como ligar e desligar corretamente um computador.', type: 'mixed' },

    // 4 — Função dos equipamentos
    { code: 'AP041-4.1', title: 'Teclado', description: 'Descrever a função do teclado.', type: 'theory' },
    { code: 'AP041-4.2', title: 'Mouse', description: 'Descrever a função do mouse.', type: 'theory' },
    { code: 'AP041-4.3', title: 'Monitor', description: 'Descrever a função do monitor.', type: 'theory' },
    { code: 'AP041-4.4', title: 'Impressora', description: 'Descrever a função da impressora.', type: 'theory' },
    { code: 'AP041-4.5', title: 'Scanner', description: 'Descrever a função do scanner.', type: 'theory' },
    { code: 'AP041-4.6', title: 'CPU', description: 'Descrever a função da CPU.', type: 'theory' },
    { code: 'AP041-4.7', title: 'Cabos', description: 'Descrever a função dos cabos.', type: 'theory' },
    { code: 'AP041-4.8', title: 'Modem', description: 'Descrever a função do modem.', type: 'theory' },
    { code: 'AP041-4.9', title: 'Roteador', description: 'Descrever a função do roteador.', type: 'theory' },

    // 5 — Demonstrações no computador
    { code: 'AP041-5.1', title: 'Criar e renomear pasta', description: 'Criar uma pasta na área de trabalho e renomeá-la.', type: 'practice' },
    { code: 'AP041-5.2', title: 'Copiar pasta', description: 'Copiar uma pasta de um local para outro.', type: 'practice' },
    { code: 'AP041-5.3', title: 'Mover pasta', description: 'Mover uma pasta de um local para outro.', type: 'practice' },
    { code: 'AP041-5.4', title: 'Criar atalho', description: 'Criar um atalho de um arquivo ou pasta.', type: 'practice' },
    { code: 'AP041-5.5', title: 'Excluir e esvaziar a lixeira', description: 'Excluir um arquivo e esvaziar a lixeira.', type: 'practice' },
    { code: 'AP041-5.6', title: 'Organizar arquivos', description: 'Organizar os arquivos em uma pasta por nome, data de modificação e tamanho.', type: 'practice' },
  ],

  /*
   * Os cinco módulos de conteúdo seguem a ordem dos requisitos oficiais, um por
   * requisito, e a avaliação final fecha a trilha.
   *
   * Cada módulo mora no seu arquivo, em ap041/. A AP034 guarda os nove no mesmo
   * lugar, passa de mil e duzentas linhas, e achar uma questão lá dentro custa
   * caro; aqui a separação veio desde o começo.
   */
  modules: [
    modulo1,
    modulo2,
    modulo3,
    modulo4,
    {
      code: 'AP041.5',
      title: 'Achar as coisas depois',
      description: 'Criar, copiar, mover e organizar pastas e arquivos sem se perder.',
      lessons: [
        {
          code: 'AP041.5-L1',
          title: 'Mexendo em pastas e arquivos',
          type: 'lab',
          content: '',
          requirementCodes: [
            'AP041-5.1', 'AP041-5.2', 'AP041-5.3',
            'AP041-5.4', 'AP041-5.5', 'AP041-5.6',
          ],
          labType: 'file_manager',
        },
      ],
    },
    {
      code: 'AP041.F',
      title: 'Avaliação Final',
      description: 'A prova que fecha a trilha, com questões dos cinco requisitos.',
      lessons: [
        {
          code: 'AP041.F-L1',
          title: 'Avaliação Final de Computação 1',
          type: 'final',
          content: '',
          requirementCodes: [],
          labType: 'final_exam',
        },
      ],
    },
  ],
};
