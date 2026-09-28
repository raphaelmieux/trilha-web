import type { Specialty } from '../types';
import { modulo1 } from './ap045/modulo1';
import { modulo2 } from './ap045/modulo2';
import { modulo3 } from './ap045/modulo3';
import { modulo4 } from './ap045/modulo4';
import { modulo5 } from './ap045/modulo5';
import { modulo6 } from './ap045/modulo6';
import { modulo7 } from './ap045/modulo7';

/*
 * AP045 — Computação 5
 *
 * Os dez requisitos abaixo são os do documento oficial —
 * `public/curriculum files/AP045 Computação 5.pdf` —, na ordem e com a
 * redação dele. É a trilha mais curta da família Computação: uma página só,
 * dez itens, a maioria pedindo definir ou explicar em vez de operar um
 * programa.
 *
 * O requisito 1 é "ter a especialidade de Computação 4", e ele não vira
 * módulo: quem cumpre é o próprio bloqueio da trilha. Ver `peloPreRequisito`,
 * em types.
 *
 * ── O que esta trilha fecha, e o que ela não é ────────────────────────────
 * AP041 a AP044 ensinaram a operar: pasta, editor de texto, planilha,
 * apresentação, banco de dados, correio. A AP045 fecha a família olhando para
 * o outro lado do computador — quem trabalha com ele (usuário, programador,
 * analista de sistemas, help desk), como a informação viaja por dentro dele
 * (binário, periféricos, CPU), e dois riscos que valem a vida inteira (o bug
 * do milênio como lição sobre decisão técnica de longo prazo; catfishing como
 * risco de segurança pessoal). O requisito 10 fecha a trilha, e a família,
 * pedindo que o próprio desbravador ensine — a mesma matéria que ele
 * aprendeu vira aula para outro grupo.
 *
 * Só dois requisitos pedem produção escrita com piso de palavras: o 2 (350
 * palavras, evolução da computação) usa a redação guiada, o mesmo mecanismo da
 * AP034 e da AP041; o 6 (bug do milênio) não tem piso no documento oficial, e
 * as 200 palavras do relatório dele são escolha nossa.
 *
 * O 5 e o 6 abriram como teoria e ganharam laboratórios depois: o diagrama
 * do caminho da informação (`diagrama_binario`), a pesquisa num buscador com
 * páginas confiáveis e não confiáveis misturadas (`pesquisa_web`), e o
 * relatório escrito a partir das fichas dela (`relatorio_de_pesquisa`). "Montar
 * um diagrama" e "pesquisar em sites especializados" são gestos, e gesto se
 * mede num laboratório. O segundo relatório da trilha é o que fez
 * `text_projects` passar a ter chave por projeto, e não por trilha.
 *
 * ── A abertura ──────────────────────────────────────────────────────────
 * A trilha nasceu `emConstrucao` num primeiro push: cinza no painel, sem link
 * e sem permitir início, enquanto a migration do seed — as linhas de
 * `requirements` e `lessons` — corria em paralelo no `supabase.yml`. Abrir
 * naquele mesmo push teria deixado a redação guiada comemorando sem ter
 * gravado nada.
 *
 * O `supabase.yml` daquele push falhou duas vezes seguidas — um
 * `SUPABASE_ACCESS_TOKEN` recusado pela API do Supabase, sem relação com o
 * conteúdo desta trilha — e só aplicou depois que outra correção consertou o
 * token. O flag sai agora, neste segundo push, junto com a insígnia
 * (`ap045_complete`): `fileiraDasTrilhas()`, em `lib/estante.ts`, só reserva
 * lugar na estante para trilha aberta, e semear a insígnia um push antes
 * teria reprovado `estante.test.ts` — a mesma exceção que as veredas já
 * documentam.
 */

export const ap045: Specialty = {
  code: 'AP045',
  name: 'Computação 5',
  level: 'avancado',
  familia: 'Computação',
  preRequisito: 'AP044',
  description: 'A que fecha a família Computação: quem trabalha com o computador, como a informação viaja por dentro dele, e o que ensinar para o próximo grupo.',

  requirements: [
    // 1 — A especialidade anterior
    { code: 'AP045-1.1', title: 'Computação 4', description: 'Ter a especialidade de Computação 4.', type: 'mixed', peloPreRequisito: true },

    // 2 — O relatório sobre a evolução da computação
    { code: 'AP045-2.1', title: 'A evolução da computação', description: 'Apresentar um relatório sobre a evolução da computação nas áreas de inteligência artificial, mundo virtual, internet e intranets de, no mínimo, 350 palavras.', type: 'practice' },

    // 3 — Definições
    { code: 'AP045-3.1', title: 'Usuário', description: 'Definir usuário.', type: 'theory' },
    { code: 'AP045-3.2', title: 'Programador', description: 'Definir programador.', type: 'theory' },
    { code: 'AP045-3.3', title: 'Analista de sistemas', description: 'Definir analista de sistemas.', type: 'theory' },
    { code: 'AP045-3.4', title: 'Help Desk', description: 'Definir Help Desk.', type: 'theory' },
    { code: 'AP045-3.5', title: 'Hacker', description: 'Definir Hacker.', type: 'theory' },
    { code: 'AP045-3.6', title: 'Hiperlink', description: 'Definir Hiperlink.', type: 'theory' },
    { code: 'AP045-3.7', title: 'World Wide Web (W3)', description: 'Definir World Wide Web (W3).', type: 'theory' },

    // 4 — Impressoras
    { code: 'AP045-4.1', title: 'Impressora matricial', description: 'Saber a diferença e aplicação da impressora matricial.', type: 'theory' },
    { code: 'AP045-4.2', title: 'Impressora laser', description: 'Saber a diferença e aplicação da impressora laser.', type: 'theory' },
    { code: 'AP045-4.3', title: 'Impressora plotter', description: 'Saber a diferença e aplicação da impressora plotter.', type: 'theory' },
    { code: 'AP045-4.4', title: 'Impressora jato de tinta', description: 'Saber a diferença e aplicação da impressora jato de tinta.', type: 'theory' },

    // 5 — Periféricos, CPU e binário
    { code: 'AP045-5.1', title: 'Periféricos, CPU e código binário', description: 'Saber explicar o funcionamento de informações entre periféricos e a CPU, usando o código binário 1 e 0. Montar um diagrama.', type: 'mixed' },

    // 6 — O bug do milênio
    { code: 'AP045-6.1', title: 'O bug do milênio', description: 'Pesquisar em sites especializados e apresentar um relatório a respeito do que foi o bug do milênio.', type: 'mixed' },

    // 7 — Upgrade e update
    { code: 'AP045-7.1', title: 'Upgrade e update', description: 'O que significa upgrade e update?', type: 'theory' },

    // 8 — Sistemas operacionais
    { code: 'AP045-8.1', title: 'Três sistemas operacionais', description: 'Citar três sistemas operacionais e suas semelhanças e diferenças.', type: 'theory' },

    // 9 — Catfishing
    { code: 'AP045-9.1', title: 'Catfishing', description: 'O que é catfishing e como se proteger dele?', type: 'theory' },

    // 10 — Ensinar
    { code: 'AP045-10.1', title: 'Ensinar Computação 1 ou 2', description: 'Ensinar a especialidade de Computação 1 ou Computação 2 a um grupo de desbravadores.', type: 'mixed' },
  ],

  /*
   * Sete módulos de conteúdo para dez requisitos, mais a avaliação final —
   * menor que a AP044 porque o documento oficial também é menor.
   *
   * Cada um mora no seu arquivo, em ap045/, como nas quatro anteriores.
   */
  modules: [
    modulo1,
    modulo2,
    modulo3,
    modulo4,
    modulo5,
    modulo6,
    modulo7,
    {
      code: 'AP045.F',
      title: 'Avaliação Final',
      description: 'A prova que fecha a trilha, com questões de todos os requisitos.',
      lessons: [
        {
          code: 'AP045.F-L1',
          title: 'Avaliação Final de Computação 5',
          type: 'final',
          content: '',
          requirementCodes: [],
          labType: 'final_exam',
        },
      ],
    },
  ],
};
