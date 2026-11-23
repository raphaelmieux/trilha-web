import { describe, it, expect } from 'vitest';
import { rodar, escreverArquivo, mudancas, type Maquina } from './terminal';
import { validarTerminal, mensagemDiz } from '../lib/terminalValidator';
import {
  COMMITS_DA_AGENDA, DECISOES_DA_AGENDA, MENSAGENS_DAS_MUDANCAS, MUDANCAS_PENDENTES_DA_AGENDA, RAIZ_DA_AGENDA,
  README_DA_AGENDA, computadorDaAgendaReadme, computadorDaAgendaVersionamento, decisaoCompleta, decisoesDoRegistro,
} from './repositorioDaAgenda';
import { REPOSITORIO_DE_PARTIDA, VITE_CONFIG_COM_BASE } from './hospedagem';
import { CARTAO_DE_EVENTO } from './agendaDoClube';

/*
  O repositório dos módulos 7 e 8 da CC-FE007.

  Como no do almoxarifado, o que se confere é o caminho: um commit por
  mudança chega aos vinte e aos cinco dias, e o `git add .` chega aos cinco
  dias com dezesseis commits. E o registro das decisões precisa de três que
  digam o porquê e o que ficou de fora.
*/

const VERSIONAR = ['vinteCommits', 'cincoDias', 'umAssuntoPorCommit', 'mensagensQueDizem', 'arvoreLimpa'];
const DOCUMENTAR = ['leiameDoSiteDescreve', 'leiameDoSiteInstala', 'leiameDoSiteUsa', 'leiameComLink', 'decisoesTres', 'decisoesJustificadas', 'documentosVersionados'];

function sessao(linhas: string[], inicial: Maquina) {
  let maquina = inicial;
  const saidas: string[] = [];
  for (const linha of linhas) {
    const r = rodar(maquina, linha);
    maquina = r.maquina;
    saidas.push(r.saida);
  }
  return { maquina, saidas };
}

const verdes = (maquina: Maquina, ids: string[]) =>
  validarTerminal({ maquina, executados: [] }, ids).filter(r => r.passed).map(r => r.id);

const UM_POR_ARQUIVO_DA_AGENDA = Object.entries(MENSAGENS_DAS_MUDANCAS)
  .flatMap(([nome, msg]) => [`git add ${nome}`, `git commit -m "${msg}"`]);

const documentado = (m: Maquina) =>
  escreverArquivo(escreverArquivo(m, 'README.md', README_DA_AGENDA), 'DECISOES.md', DECISOES_DA_AGENDA);
const COMMIT_DOS_DOCUMENTOS = ['git add README.md DECISOES.md', 'git commit -m "Escreve o README e o registro das decisões"'];

describe('o repositório de partida', () => {
  it('chega com quinze commits em quatro dias e as cinco mudanças sem commit', () => {
    const m = computadorDaAgendaVersionamento();
    expect(m.repo?.commits).toHaveLength(15);
    expect(new Set(COMMITS_DA_AGENDA.map(c => c.data)).size).toBe(4);
    const { modificados, novos, apagados } = mudancas(m);
    expect([...modificados, ...novos, ...apagados].sort())
      .toEqual(Object.keys(MUDANCAS_PENDENTES_DA_AGENDA).map(n => `${RAIZ_DA_AGENDA}/${n}`).sort());
  });

  it('o último commit é o repositório que o laboratório de publicação deixou no ar', () => {
    const ultimo = COMMITS_DA_AGENDA[COMMITS_DA_AGENDA.length - 1].arvore;
    const publicado = { ...REPOSITORIO_DE_PARTIDA, 'CartaoDeEvento.tsx': CARTAO_DE_EVENTO, 'vite.config.ts': VITE_CONFIG_COM_BASE };
    for (const [nome, texto] of Object.entries(publicado)) expect(ultimo[`${RAIZ_DA_AGENDA}/${nome}`], nome).toBe(texto);
  });

  it('cada mudança pendente é de um arquivo só, e muda alguma coisa nele', () => {
    const ultimo = COMMITS_DA_AGENDA[COMMITS_DA_AGENDA.length - 1].arvore;
    for (const [nome, texto] of Object.entries(MUDANCAS_PENDENTES_DA_AGENDA)) {
      expect(ultimo[`${RAIZ_DA_AGENDA}/${nome}`], nome).not.toBe(texto);
    }
  });

  it('as mensagens da história e as da referência dizem o que mudou', () => {
    for (const c of COMMITS_DA_AGENDA) expect(mensagemDiz(c.mensagem), c.mensagem).toBe(true);
    for (const m of Object.values(MENSAGENS_DAS_MUDANCAS)) expect(mensagemDiz(m), m).toBe(true);
  });

  it('nenhuma tarefa abre verde', () => {
    expect(verdes(computadorDaAgendaVersionamento(), VERSIONAR)).toEqual([]);
    expect(verdes(computadorDaAgendaReadme(), DOCUMENTAR)).toEqual([]);
  });

  it('o computador do README é o de quem versionou certo, com vinte commits e a árvore limpa', () => {
    const m = computadorDaAgendaReadme();
    expect(m.repo?.commits).toHaveLength(20);
    const { modificados, novos, apagados } = mudancas(m);
    expect([...modificados, ...novos, ...apagados]).toEqual([]);
  });
});

describe('versionar', () => {
  it('um commit por arquivo, com mensagem que diz, fecha a lição', () => {
    const { maquina } = sessao(UM_POR_ARQUIVO_DA_AGENDA, computadorDaAgendaVersionamento());
    expect(verdes(maquina, VERSIONAR)).toEqual(VERSIONAR);
  });

  it('git add . chega ao quinto dia com dezesseis commits, e não fecha', () => {
    const { maquina } = sessao(['git add .', 'git commit -m "Melhora o erro, o foco e o título"'], computadorDaAgendaVersionamento());
    const v = verdes(maquina, VERSIONAR);
    expect(v).toContain('arvoreLimpa');
    expect(v).toContain('cincoDias');
    expect(v).not.toContain('umAssuntoPorCommit');
    expect(v).not.toContain('vinteCommits');
  });

  it('a esteira mora numa subpasta, e o git a enxerga lá', () => {
    const { saidas } = sessao(['ls .github/workflows'], computadorDaAgendaVersionamento());
    expect(saidas[0]).toContain('publicar.yml');
  });
});

describe('o README e as decisões', () => {
  it('escritos e versionados fecham a lição', () => {
    const { maquina } = sessao(COMMIT_DOS_DOCUMENTOS, documentado(computadorDaAgendaReadme()));
    expect(verdes(maquina, DOCUMENTAR)).toEqual(DOCUMENTAR);
  });

  it('o README do programa de terminal não serve para o site', () => {
    const doTerminal = README_DA_AGENDA.replace('rode `npm install`', 'rode `python principal.py`')
      .replace('`npm run dev` abre', 'Abra');
    const m = escreverArquivo(computadorDaAgendaReadme(), 'README.md', doTerminal);
    const v = verdes(m, ['leiameDoSiteInstala', 'leiameDoSiteUsa']);
    expect(v).toEqual([]);
  });

  it('sem o link público, o README manda construir o que já está no ar', () => {
    const semLink = README_DA_AGENDA.replace(/Está no ar em .*\n/, '');
    expect(verdes(escreverArquivo(computadorDaAgendaReadme(), 'README.md', semLink), ['leiameComLink'])).toEqual([]);
  });

  it('decisão sem a alternativa é descrição, e não fecha', () => {
    const decisoes = decisoesDoRegistro(DECISOES_DA_AGENDA);
    expect(decisoes).toHaveLength(3);
    expect(decisoes.every(decisaoCompleta)).toBe(true);
    const descritivo = `# Decisões de interface

## A lista vira uma coluna no celular

No celular a lista mostra os cartões um embaixo do outro, porque a tela é estreita e três colunas não cabem nela direito.

## O menu fica no topo

O menu mostra os links para os eventos e os feriados no alto de todas as telas, porque é onde as pessoas procuram.

## O erro dos feriados tem botão

Quando a API não responde, a tela mostra uma mensagem e um botão de tentar de novo, para a pessoa saber o que houve.
`;
    const m = escreverArquivo(computadorDaAgendaReadme(), 'DECISOES.md', descritivo);
    const v = verdes(m, ['decisoesTres', 'decisoesJustificadas']);
    expect(v).toEqual(['decisoesTres']);
  });

  it('duas decisões não bastam, e seção sem texto não conta', () => {
    const duas = DECISOES_DA_AGENDA.replace(/## O erro dos feriados[\s\S]*$/, '## Outra\n');
    const m = escreverArquivo(computadorDaAgendaReadme(), 'DECISOES.md', duas);
    expect(verdes(m, ['decisoesTres', 'decisoesJustificadas'])).toEqual([]);
  });

  it('mexer num dos dois depois do commit volta a pedir commit', () => {
    const { maquina } = sessao(COMMIT_DOS_DOCUMENTOS, documentado(computadorDaAgendaReadme()));
    const mexido = escreverArquivo(maquina, 'DECISOES.md', `${DECISOES_DA_AGENDA}\nMais uma linha.\n`);
    expect(verdes(mexido, ['documentosVersionados'])).toEqual([]);
  });
});
