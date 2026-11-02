import { describe, it, expect } from 'vitest';
import { rodar, escreverArquivo, mudancas, type Maquina } from './terminal';
import { validarTerminal, mensagemDiz } from '../lib/terminalValidator';
import {
  computadorDoVersionamento, computadorDoReadme, COMMITS_DA_HISTORIA, MUDANCAS_PENDENTES,
  RAIZ_DO_ALMOXARIFADO,
} from './repositorioDoAlmoxarifado';

/*
  O repositório dos módulos 6 e 7 da CC006.

  O que se confere aqui é o caminho da pessoa, e não só o fim: um commit por
  mudança fecha a lição, e o `git add .` que junta as quatro num só não fecha
  — mesmo deixando a árvore limpa e o histórico com quatro dias.
*/

const VERSIONAR = ['quinzeCommits', 'quatroDias', 'umAssuntoPorCommit', 'mensagensQueDizem', 'arvoreLimpa'];
const README = ['leiameDescreve', 'leiameInstala', 'leiameUsa', 'leiameExemplo', 'leiameVersionado'];

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

const UM_POR_ARQUIVO = [
  'git add entrada.py', 'git commit -m "Dá um exemplo de número na mensagem de entrada inválida"',
  'git add principal.py', 'git commit -m "Avisa quando não há material cadastrado"',
  'git add banco.py', 'git commit -m "Ordena a lista sem separar maiúsculas de minúsculas"',
  'git add .gitignore', 'git commit -m "Tira o cache do Python do controle de versão"',
];

const LEIAME = `# Almoxarifado do clube

## Descrição

Programa de linha de comando que guarda o material do clube e quanto há de cada coisa, para a secretaria saber o que levar ao acampamento.

## Instalação

É preciso ter o Python 3. Baixe a pasta do projeto; o banco se cria sozinho na primeira vez.

## Uso

Na pasta do projeto, digite python principal.py e escolha uma opção do menu.

## Exemplo de execução

\`\`\`
1 - Cadastrar material
2 - Listar materiais
3 - Alterar quantidade
4 - Remover material
0 - Sair
Escolha: 2
1 - Barraca: 4
\`\`\`
`;

describe('o repositório de partida', () => {
  it('chega com onze commits em três dias e as quatro mudanças sem commit', () => {
    const m = computadorDoVersionamento();
    expect(m.repo?.commits).toHaveLength(11);
    expect(new Set(COMMITS_DA_HISTORIA.map(c => c.data)).size).toBe(3);
    const { modificados, novos, apagados } = mudancas(m);
    expect([...modificados, ...novos, ...apagados].sort())
      .toEqual(Object.keys(MUDANCAS_PENDENTES).map(n => `${RAIZ_DO_ALMOXARIFADO}/${n}`).sort());
  });

  it('cada mudança pendente é de um arquivo só, e muda alguma coisa nele', () => {
    const ultimo = COMMITS_DA_HISTORIA[COMMITS_DA_HISTORIA.length - 1].arvore;
    for (const [nome, texto] of Object.entries(MUDANCAS_PENDENTES)) {
      expect(ultimo[`${RAIZ_DO_ALMOXARIFADO}/${nome}`]).not.toBe(texto);
    }
  });

  it('as mensagens da história dizem o que mudou', () => {
    for (const c of COMMITS_DA_HISTORIA) expect(mensagemDiz(c.mensagem)).toBe(true);
  });

  it('nenhuma tarefa de versionar abre verde', () => {
    expect(verdes(computadorDoVersionamento(), VERSIONAR)).toEqual([]);
  });

  it('nenhuma tarefa do README abre verde', () => {
    expect(verdes(computadorDoReadme(), README)).toEqual([]);
  });

  it('o histórico do README é o de quem versionou certo, e com a árvore limpa', () => {
    const m = computadorDoReadme();
    expect(m.repo?.commits).toHaveLength(15);
    const { modificados, novos, apagados } = mudancas(m);
    expect([...modificados, ...novos, ...apagados]).toEqual([]);
  });
});

describe('versionar', () => {
  it('um commit por arquivo, com mensagem que diz, fecha a lição', () => {
    const { maquina } = sessao(UM_POR_ARQUIVO, computadorDoVersionamento());
    expect(verdes(maquina, VERSIONAR)).toEqual(VERSIONAR);
  });

  it('git add . junta as quatro num commit e não fecha', () => {
    const { maquina } = sessao(['git add .', 'git commit -m "Melhora mensagens, lista e cache"'], computadorDoVersionamento());
    const v = verdes(maquina, VERSIONAR);
    expect(v).toContain('arvoreLimpa');
    expect(v).toContain('quatroDias');
    expect(v).not.toContain('umAssuntoPorCommit');
    expect(v).not.toContain('quinzeCommits');
  });

  it('mensagem vaga reprova, mesmo com um commit por arquivo', () => {
    const vagas = UM_POR_ARQUIVO.map(l => l.startsWith('git commit') ? 'git commit -m "ajustes"' : l);
    const { maquina } = sessao(vagas, computadorDoVersionamento());
    const v = verdes(maquina, VERSIONAR);
    expect(v).not.toContain('mensagensQueDizem');
    expect(v).toContain('umAssuntoPorCommit');
  });

  it('esquecer uma mudança deixa a árvore suja e o histórico com catorze', () => {
    const { maquina } = sessao(UM_POR_ARQUIVO.slice(0, 6), computadorDoVersionamento());
    const v = verdes(maquina, VERSIONAR);
    expect(v).not.toContain('arvoreLimpa');
    expect(v).not.toContain('quinzeCommits');
  });

  it('o commit de hoje leva a data de hoje, e o log a mostra', () => {
    const { maquina, saidas } = sessao([...UM_POR_ARQUIVO, 'git log'], computadorDoVersionamento());
    expect(maquina.repo?.commits.slice(-1)[0]?.data).toBe(maquina.hoje);
    expect(saidas[saidas.length - 1]).toContain(`Date:   ${maquina.hoje}`);
  });

  it('o diff mostra a linha que saiu e a que entrou', () => {
    const { saidas } = sessao(['git diff banco.py'], computadorDoVersionamento());
    expect(saidas[0]).toMatch(/^-.*ORDER BY nome"/m);
    expect(saidas[0]).toMatch(/^\+.*ORDER BY nome COLLATE NOCASE"/m);
    expect(saidas[0]).not.toMatch(/^[-+]def conectar/m);
  });
});

describe('o README', () => {
  it('escrito com as quatro partes e versionado fecha a lição', () => {
    const escrito = escreverArquivo(computadorDoReadme(), 'README.md', LEIAME);
    const { maquina } = sessao(['git add README.md', 'git commit -m "Escreve o README do almoxarifado"'], escrito);
    expect(verdes(maquina, README)).toEqual(README);
  });

  it('escrito e nunca versionado não fecha a última tarefa', () => {
    const escrito = escreverArquivo(computadorDoReadme(), 'README.md', LEIAME);
    expect(verdes(escrito, README)).toEqual(README.filter(id => id !== 'leiameVersionado'));
  });

  it('mexido depois do commit volta a pedir commit', () => {
    const escrito = escreverArquivo(computadorDoReadme(), 'README.md', LEIAME);
    const { maquina } = sessao(['git add README.md', 'git commit -m "Escreve o README do almoxarifado"'], escrito);
    const mexido = escreverArquivo(maquina, 'README.md', `${LEIAME}\nMais uma linha.\n`);
    expect(verdes(mexido, ['leiameVersionado'])).toEqual([]);
  });

  it('exemplo inventado sem o menu, ou fora do bloco de código, não vale', () => {
    const semMenu = LEIAME.replace(/1 - Cadastrar[\s\S]*?Escolha: 2\n/, 'Escolha uma opção e pronto.\n');
    expect(verdes(escreverArquivo(computadorDoReadme(), 'README.md', semMenu), ['leiameExemplo'])).toEqual([]);
    const semBloco = LEIAME.replace(/```\n/g, '');
    expect(verdes(escreverArquivo(computadorDoReadme(), 'README.md', semBloco), ['leiameExemplo'])).toEqual([]);
  });

  it('seção com título e sem nada dentro não conta', () => {
    const oco = '# Almoxarifado\n\n## Descrição\n\n## Instalação\n\n## Uso\n\n## Exemplo de execução\n';
    expect(verdes(escreverArquivo(computadorDoReadme(), 'README.md', oco), README)).toEqual([]);
  });

  it('o uso sem o comando que abre o programa não conta', () => {
    const semComando = LEIAME.replace('digite python principal.py e escolha', 'escolha');
    expect(verdes(escreverArquivo(computadorDoReadme(), 'README.md', semComando), ['leiameUsa'])).toEqual([]);
  });
});
