/**
 * O computador dos módulos 6 e 7 da CC006: o repositório do almoxarifado.
 *
 * ── A história chega pronta, e o quarto dia é o de hoje ──────────────────
 * O requisito 4 pede quinze commits em pelo menos quatro dias distintos, e a
 * plataforma não faz o calendário andar. O que ela pode fazer é o que acontece
 * na vida: o programa dos módulos 2 a 5 foi escrito ao longo de três dias, com
 * onze commits, e a lição é o quarto. A pessoa chega com quatro mudanças feitas
 * e não guardadas — a noite em que se escreveu e não se commitou —, e o que se
 * ensina é guardar cada uma no seu commit, com uma mensagem que diga o que ela
 * fez.
 *
 * Um repositório que já viesse com quinze abriria a lição verde; um que viesse
 * vazio pediria quinze commits num dia só, que é o contrário do requisito.
 *
 * ── O que está no disco é o programa da CC006 ────────────────────────────
 * As versões moram em `almoxarifado.ts`, e cada commit da história guarda a do
 * dia dele. O disco de hoje é a última, mais as quatro mudanças pendentes.
 */

import { arquivo, pasta, type Commit, type Maquina, type No } from './terminal';
import {
  BANCO_DO_CRUD, BANCO_DO_ESQUELETO, ENTRADA_VALIDADA, PRINCIPAL_DO_CRUD, PRINCIPAL_DO_ESQUELETO,
  PRINCIPAL_FINAL, PRINCIPAL_VALIDADO,
} from './almoxarifado';

export const RAIZ_DO_ALMOXARIFADO = '/home/desbravador/almoxarifado';

/** O dia da lição de versionar, e o da lição do README, que vem depois. */
export const HOJE_DO_VERSIONAMENTO = '2026-10-24';
export const HOJE_DO_README = '2026-10-25';

const GITIGNORE = 'almoxarifado.db\n';

type Arquivos = Record<string, string>;

const comRaiz = (a: Arquivos) => Object.fromEntries(Object.entries(a).map(([n, t]) => [`${RAIZ_DO_ALMOXARIFADO}/${n}`, t]));

/* As mudanças da noite em que ninguém commitou: quatro, em quatro arquivos, e
   cada uma é um assunto só. É por isso que cada uma pede o seu commit. */
export const MUDANCAS_PENDENTES = {
  'entrada.py': ENTRADA_VALIDADA.replace('print("Digite um número inteiro.")', 'print("Digite um número inteiro, como 12.")'),
  'principal.py': PRINCIPAL_FINAL.replace(
    `        elif opcao == "2":
            for id_material, nome, quantidade in listar(conexao):
                print(f"{id_material} - {nome}: {quantidade}")`,
    `        elif opcao == "2":
            materiais = listar(conexao)
            if not materiais:
                print("Nenhum material cadastrado.")
            for id_material, nome, quantidade in materiais:
                print(f"{id_material} - {nome}: {quantidade}")`),
  'banco.py': BANCO_DO_CRUD.replace('ORDER BY nome"', 'ORDER BY nome COLLATE NOCASE"'),
  '.gitignore': `${GITIGNORE}__pycache__/\n`,
} satisfies Arquivos;

/** Os onze commits dos três dias de programação, do mais velho ao mais novo. */
function historia(): Commit[] {
  const passos: [string, string, Arquivos][] = [
    ['2026-10-17', 'Cria a tabela de materiais no banco', { 'banco.py': BANCO_DO_ESQUELETO }],
    ['2026-10-17', 'Liga o programa principal ao banco', { 'banco.py': BANCO_DO_ESQUELETO, 'principal.py': PRINCIPAL_DO_ESQUELETO }],
    ['2026-10-17', 'Tira o arquivo do banco do controle de versão', { 'banco.py': BANCO_DO_ESQUELETO, 'principal.py': PRINCIPAL_DO_ESQUELETO, '.gitignore': GITIGNORE }],
    ['2026-10-18', 'Cadastra material pelo menu', { 'banco.py': BANCO_DO_CRUD, 'principal.py': PRINCIPAL_DO_CRUD.replace(/\n {8}elif opcao == "2":[\s\S]*?(?=\n {8}elif opcao == "0")/, ''), '.gitignore': GITIGNORE }],
    ['2026-10-18', 'Lista os materiais em ordem de nome', { 'banco.py': BANCO_DO_CRUD, 'principal.py': PRINCIPAL_DO_CRUD.replace(/\n {8}elif opcao == "3":[\s\S]*?(?=\n {8}elif opcao == "0")/, ''), '.gitignore': GITIGNORE }],
    ['2026-10-18', 'Altera a quantidade de um material', { 'banco.py': BANCO_DO_CRUD, 'principal.py': PRINCIPAL_DO_CRUD.replace(/\n {8}elif opcao == "4":[\s\S]*?(?=\n {8}elif opcao == "0")/, ''), '.gitignore': GITIGNORE }],
    ['2026-10-18', 'Remove material pelo id', { 'banco.py': BANCO_DO_CRUD, 'principal.py': PRINCIPAL_DO_CRUD, '.gitignore': GITIGNORE }],
    ['2026-10-21', 'Valida o nome e a quantidade digitados', { 'banco.py': BANCO_DO_CRUD, 'principal.py': PRINCIPAL_VALIDADO, 'entrada.py': ENTRADA_VALIDADA, '.gitignore': GITIGNORE }],
    ['2026-10-21', 'Avisa quando a opção do menu não existe', { 'banco.py': BANCO_DO_CRUD, 'principal.py': PRINCIPAL_VALIDADO, 'entrada.py': ENTRADA_VALIDADA, '.gitignore': GITIGNORE }],
    ['2026-10-21', 'Trata o nome repetido sem fechar o programa', { 'banco.py': BANCO_DO_CRUD, 'principal.py': PRINCIPAL_FINAL.replace(/\n {12}if alterar[\s\S]*?\n {16}print\("Nenhum material com esse id."\)/, '\n            alterar(conexao, id_material, quantidade)'), 'entrada.py': ENTRADA_VALIDADA, '.gitignore': GITIGNORE }],
    ['2026-10-21', 'Avisa quando o id não existe ao alterar ou remover', { 'banco.py': BANCO_DO_CRUD, 'principal.py': PRINCIPAL_FINAL, 'entrada.py': ENTRADA_VALIDADA, '.gitignore': GITIGNORE }],
  ];
  return passos.map(([data, mensagem, arquivos], i) => ({
    id: `c${i + 1}`,
    mensagem,
    arvore: comRaiz(arquivos),
    pai: i === 0 ? null : `c${i}`,
    ramo: 'main',
    data,
  }));
}

export const COMMITS_DA_HISTORIA = historia();

const discoCom = (arquivos: Arquivos): No => pasta({
  home: pasta({
    desbravador: pasta({
      almoxarifado: pasta(Object.fromEntries(Object.entries(arquivos).map(([n, t]) => [n, arquivo(t)]))),
    }),
  }),
});

const comHistoria = (commits: Commit[], disco: Arquivos, hoje: string): Maquina => ({
  disco: discoCom(disco),
  cwd: RAIZ_DO_ALMOXARIFADO,
  repo: {
    raiz: RAIZ_DO_ALMOXARIFADO,
    commits,
    ramos: { main: commits[commits.length - 1].id },
    ramoAtual: 'main',
    preparados: [],
    remoto: null,
    publicado: {},
    aguardando: [],
  },
  historico: [],
  instalados: [],
  hoje,
});

/** O computador do módulo 6: onze commits, e quatro mudanças por guardar. */
export function computadorDoVersionamento(): Maquina {
  const ultimo = COMMITS_DA_HISTORIA[COMMITS_DA_HISTORIA.length - 1].arvore;
  const disco = Object.fromEntries(Object.entries(ultimo).map(([c, t]) => [c.slice(RAIZ_DO_ALMOXARIFADO.length + 1), t]));
  return comHistoria(COMMITS_DA_HISTORIA, { ...disco, ...MUDANCAS_PENDENTES }, HOJE_DO_VERSIONAMENTO);
}

/**
 * O computador do módulo 7: o do módulo 6 depois de cada mudança ganhar o seu
 * commit, e um dia depois. É o arranjo de toda vereda daqui — a lição seguinte
 * parte de onde a anterior chegou —, e o README é escrito sobre o repositório
 * que a pessoa acabou de arrumar.
 */
export function computadorDoReadme(): Maquina {
  const mensagens: Record<keyof typeof MUDANCAS_PENDENTES, string> = {
    'entrada.py': 'Dá um exemplo de número na mensagem de entrada inválida',
    'principal.py': 'Avisa quando não há material cadastrado',
    'banco.py': 'Ordena a lista sem separar maiúsculas de minúsculas',
    '.gitignore': 'Tira o cache do Python do controle de versão',
  };
  const commits = [...COMMITS_DA_HISTORIA];
  let arvore = { ...commits[commits.length - 1].arvore };
  for (const [nome, texto] of Object.entries(MUDANCAS_PENDENTES) as [keyof typeof MUDANCAS_PENDENTES, string][]) {
    arvore = { ...arvore, [`${RAIZ_DO_ALMOXARIFADO}/${nome}`]: texto };
    commits.push({
      id: `c${commits.length + 1}`, mensagem: mensagens[nome], arvore, pai: commits[commits.length - 1].id,
      ramo: 'main', data: HOJE_DO_VERSIONAMENTO,
    });
  }
  const disco = Object.fromEntries(Object.entries(arvore).map(([c, t]) => [c.slice(RAIZ_DO_ALMOXARIFADO.length + 1), t]));
  return comHistoria(commits, disco, HOJE_DO_README);
}
