import { describe, it, expect } from 'vitest';
import {
  maquinaInicial, rodar, resolver, achar, arquivosSob, mudancas, escreverArquivo,
  type Maquina,
} from './terminal';

/*
  O terminal simulado, comando por comando.

  ── Por que isto precisa de teste, e não de olhada ───────────────────────
  Um shell é um monte de casos parecidos, e cada um erra em silêncio na tela:
  `cp` que move em vez de copiar deixa a tarefa verde e o disco errado; `git
  commit` que grava o disco inteiro em vez do que foi preparado apaga a razão
  de `git add` existir, e ninguém vê. Nada disso aparece como erro — aparece
  como uma tarefa que fica verde na hora errada.

  O motor é função pura sobre um estado justamente para caber aqui, sem montar
  tela nenhuma.
*/

/** Roda uma sequência e devolve a máquina e a última saída. */
function sequencia(linhas: string[], inicial: Maquina = maquinaInicial()) {
  let m = inicial;
  let saida = '';
  for (const l of linhas) {
    const r = rodar(m, l);
    m = r.maquina;
    saida = r.saida;
  }
  return { m, saida };
}

describe('caminhos', () => {
  it('absoluto ignora onde se está; relativo parte dali', () => {
    expect(resolver('/home/desbravador/documentos', '/etc')).toBe('/etc');
    expect(resolver('/home/desbravador', 'documentos')).toBe('/home/desbravador/documentos');
  });

  it('.. sobe e ~ vai para a casa', () => {
    expect(resolver('/home/desbravador/documentos', '..')).toBe('/home/desbravador');
    expect(resolver('/etc', '~')).toBe('/home/desbravador');
    expect(resolver('/etc', '~/documentos')).toBe('/home/desbravador/documentos');
  });
});

describe('andar pelo disco', () => {
  it('pwd diz onde se está, e cd muda isso', () => {
    expect(sequencia(['pwd']).saida).toBe('/home/desbravador');
    expect(sequencia(['cd projeto-do-clube', 'pwd']).saida).toBe('/home/desbravador/projeto-do-clube');
  });

  it('cd para pasta inexistente reclama, e não muda de lugar', () => {
    const { m, saida } = sequencia(['cd nao-existe']);
    expect(saida).toContain('inexistente');
    expect(m.cwd).toBe('/home/desbravador');
  });

  it('cd num arquivo diz que não é diretório', () => {
    expect(sequencia(['cd projeto-do-clube', 'cd lista.py']).saida).toContain('não é um diretório');
  });

  /* Era o ponto do requisito: ls comum esconde o que começa com ponto, e é por
     isso que tanta gente jura que a pasta está vazia. */
  it('ls esconde os ocultos, e ls -a mostra', () => {
    const semA = sequencia(['cd projeto-do-clube', 'ls']).saida;
    const comA = sequencia(['cd projeto-do-clube', 'ls -a']).saida;
    expect(semA).not.toContain('.oculto');
    expect(comA).toContain('.oculto');
    expect(comA).toContain('..');
  });

  it('cat mostra o conteúdo, e recusa diretório', () => {
    expect(sequencia(['cat projeto-do-clube/leiame.txt']).saida).toContain('lista de presença');
    expect(sequencia(['cat projeto-do-clube']).saida).toContain('é um diretório');
  });
});

describe('mexer em arquivos', () => {
  it('mkdir cria, e recusa criar por cima', () => {
    const { m } = sequencia(['mkdir provas']);
    expect(achar(m.disco, '/home/desbravador/provas')?.tipo).toBe('pasta');
    expect(sequencia(['mkdir provas', 'mkdir provas']).saida).toContain('arquivo existe');
  });

  it('touch cria vazio e não apaga arquivo que já existe', () => {
    const { m } = sequencia(['cd projeto-do-clube', 'touch novo.txt', 'touch leiame.txt']);
    expect(achar(m.disco, '/home/desbravador/projeto-do-clube/novo.txt')?.conteudo).toBe('');
    expect(achar(m.disco, '/home/desbravador/projeto-do-clube/leiame.txt')?.conteudo).toContain('lista de presença');
  });

  /* O erro que o teste existe para pegar: copiar que na verdade move. */
  it('cp copia e deixa o original onde estava', () => {
    const { m } = sequencia(['cd projeto-do-clube', 'cp leiame.txt copia.txt']);
    expect(achar(m.disco, '/home/desbravador/projeto-do-clube/leiame.txt')).not.toBeNull();
    expect(achar(m.disco, '/home/desbravador/projeto-do-clube/copia.txt')?.conteudo)
      .toBe(achar(m.disco, '/home/desbravador/projeto-do-clube/leiame.txt')?.conteudo);
  });

  it('cp numa pasta existente põe o arquivo dentro dela', () => {
    const { m } = sequencia(['cd projeto-do-clube', 'cp leiame.txt ../documentos']);
    expect(achar(m.disco, '/home/desbravador/documentos/leiame.txt')).not.toBeNull();
  });

  it('cp de pasta exige -r, como no shell de verdade', () => {
    expect(sequencia(['cp documentos copia']).saida).toContain('-r não informado');
    const { m } = sequencia(['cp -r documentos copia']);
    expect(achar(m.disco, '/home/desbravador/copia/ata-da-reuniao.txt')).not.toBeNull();
  });

  it('mv move, e o original some', () => {
    const { m } = sequencia(['cd projeto-do-clube', 'mv leiame.txt ../documentos']);
    expect(achar(m.disco, '/home/desbravador/projeto-do-clube/leiame.txt')).toBeNull();
    expect(achar(m.disco, '/home/desbravador/documentos/leiame.txt')).not.toBeNull();
  });

  it('mv com nome novo renomeia', () => {
    const { m } = sequencia(['cd projeto-do-clube', 'mv leiame.txt README.md']);
    expect(achar(m.disco, '/home/desbravador/projeto-do-clube/README.md')).not.toBeNull();
  });

  it('rm de pasta exige -r', () => {
    expect(sequencia(['rm documentos']).saida).toContain('é um diretório');
    const { m } = sequencia(['rm -r documentos']);
    expect(achar(m.disco, '/home/desbravador/documentos')).toBeNull();
  });

  /* No shell de verdade o prompt fica apontando para uma pasta que sumiu.
     Aqui a pessoa não teria como voltar, e o laboratório viraria um beco. */
  it('apagar a pasta em que se está sobe um nível', () => {
    const { m } = sequencia(['cd documentos', 'cd ..', 'rm -r documentos', 'pwd']);
    expect(m.cwd).toBe('/home/desbravador');
  });
});

describe('o git', () => {
  const noProjeto = (extras: string[] = []) =>
    sequencia(['cd projeto-do-clube', 'git init', ...extras]);

  it('init cria o repositório na pasta atual', () => {
    const { m, saida } = noProjeto();
    expect(saida).toContain('inicializado');
    expect(m.repo?.raiz).toBe('/home/desbravador/projeto-do-clube');
    expect(m.repo?.ramoAtual).toBe('main');
  });

  it('git fora de repositório reclama', () => {
    expect(sequencia(['git status']).saida).toContain('não é um repositório git');
  });

  it('status vê os arquivos que ainda não foram registrados', () => {
    expect(noProjeto(['git status']).saida).toContain('lista.py');
  });

  /* A razão de `git add` existir: sem ele, commit não grava nada. */
  it('commit sem add recusa, e diz o que fazer', () => {
    expect(noProjeto(['git commit -m "primeiro"']).saida).toContain('git add');
  });

  it('commit sem mensagem recusa', () => {
    expect(noProjeto(['git add .', 'git commit']).saida).toContain('Falta a mensagem');
  });

  it('add e commit registram, e o log mostra', () => {
    const { m } = noProjeto(['git add .', 'git commit -m "primeiro commit"']);
    expect(m.repo?.commits).toHaveLength(1);
    expect(rodar(m, 'git log').saida).toContain('primeiro commit');
  });

  /*
    O commit grava o que foi preparado, e não o disco inteiro.

    Se gravasse o disco, `git add` viraria enfeite — e é justamente a distinção
    que o requisito 5 cobra. Aqui: dois arquivos mudados, um preparado, e só
    ele entra.
  */
  it('commit grava o que foi preparado, e não o disco inteiro', () => {
    let { m } = noProjeto(['git add .', 'git commit -m "base"']);
    m = escreverArquivo(m, 'lista.py', '# mudou\n');
    m = escreverArquivo(m, 'leiame.txt', 'também mudou\n');
    ({ m } = sequencia(['git add lista.py', 'git commit -m "só a lista"'], m));

    const ultimo = m.repo!.commits[m.repo!.commits.length - 1];
    expect(ultimo.arvore['/home/desbravador/projeto-do-clube/lista.py']).toContain('# mudou');
    expect(ultimo.arvore['/home/desbravador/projeto-do-clube/leiame.txt']).not.toContain('também mudou');
  });

  it('restore devolve o arquivo ao que o último commit registrou', () => {
    let { m } = noProjeto(['git add .', 'git commit -m "base"']);
    m = escreverArquivo(m, 'lista.py', 'estraguei tudo\n');
    expect(mudancas(m).modificados).toHaveLength(1);
    ({ m } = sequencia(['git restore lista.py'], m));
    expect(mudancas(m).modificados).toHaveLength(0);
    expect(achar(m.disco, '/home/desbravador/projeto-do-clube/lista.py')?.conteudo).toContain('nomes');
  });

  it('branch cria e lista, com um asterisco no atual', () => {
    const { m } = noProjeto(['git add .', 'git commit -m "base"', 'git branch teste']);
    expect(rodar(m, 'git branch').saida).toContain('* main');
    expect(rodar(m, 'git branch').saida).toContain('teste');
  });

  it('checkout -b cria e já entra no ramo', () => {
    const { m } = noProjeto(['git add .', 'git commit -m "base"', 'git checkout -b experimento']);
    expect(m.repo?.ramoAtual).toBe('experimento');
  });

  /*
    Trocar de ramo troca o disco.

    Sem isso a mesclagem seria encenação: o trabalho feito no ramo apareceria no
    main sem ninguém ter mesclado, e a lição do módulo desapareceria.
  */
  it('voltar para o main não traz o trabalho do outro ramo', () => {
    let { m } = noProjeto(['git add .', 'git commit -m "base"', 'git checkout -b experimento']);
    m = escreverArquivo(m, 'novo.txt', 'trabalho do ramo\n');
    ({ m } = sequencia(['git add .', 'git commit -m "no ramo"', 'git checkout main'], m));
    expect(achar(m.disco, '/home/desbravador/projeto-do-clube/novo.txt')).toBeNull();
  });

  it('merge traz o trabalho do outro ramo para o atual', () => {
    let { m } = noProjeto(['git add .', 'git commit -m "base"', 'git checkout -b experimento']);
    m = escreverArquivo(m, 'novo.txt', 'trabalho do ramo\n');
    ({ m } = sequencia(['git add .', 'git commit -m "no ramo"', 'git checkout main', 'git merge experimento'], m));
    expect(achar(m.disco, '/home/desbravador/projeto-do-clube/novo.txt')?.conteudo).toContain('trabalho do ramo');
    expect(m.repo?.commits.some(c => c.mesclagem)).toBe(true);
  });

  it('push sem remoto diz como configurar', () => {
    expect(noProjeto(['git add .', 'git commit -m "base"', 'git push']).saida).toContain('git remote add origin');
  });

  it('push publica e o remoto passa a ter trabalho de outra pessoa', () => {
    const { m } = noProjeto([
      'git add .', 'git commit -m "base"',
      'git remote add origin https://exemplo/clube.git', 'git push',
    ]);
    expect(m.repo?.publicado.main).toBe(m.repo?.ramos.main);
    expect(m.repo?.aguardando).toHaveLength(1);
  });

  /* O pull só significa alguma coisa se houver o que trazer. É por isso que o
     push cria trabalho do outro lado: sem isso, "receber alterações" seria uma
     mensagem sem nada por trás. */
  it('pull traz o que a outra pessoa registrou', () => {
    const { m } = noProjeto([
      'git add .', 'git commit -m "base"',
      'git remote add origin https://exemplo/clube.git', 'git push', 'git pull',
    ]);
    expect(achar(m.disco, '/home/desbravador/projeto-do-clube/leiame.txt')?.conteudo)
      .toContain('Clube Falcão Peregrino');
  });

  it('pull sem nada novo diz que já está atualizado', () => {
    const { m } = noProjeto([
      'git add .', 'git commit -m "base"',
      'git remote add origin https://exemplo/clube.git',
    ]);
    expect(rodar(m, 'git pull').saida).toContain('Already up to date');
  });
});

describe('o terminal aguenta curiosidade', () => {
  /* Comando que existe de verdade não pode responder "não encontrado": seria
     mentira, e ensinaria que o terminal é um trilho. */
  it('comando real fora do exercício diz o que ele é', () => {
    const saida = sequencia(['sudo apt install python']).saida;
    expect(saida).toContain('existe no terminal de verdade');
    expect(saida).not.toContain('não encontrado');
  });

  it('comando inventado responde como o shell responde', () => {
    expect(sequencia(['xyzzy']).saida).toContain('comando não encontrado');
  });

  it('help lista o que dá para fazer', () => {
    const saida = sequencia(['help']).saida;
    for (const c of ['pwd', 'ls -a', 'cd', 'cat', 'mkdir', 'cp', 'mv', 'rm', 'git']) {
      expect(saida, `help não cita ${c}`).toContain(c);
    }
  });

  it('linha vazia não faz nada e não entra no histórico', () => {
    const { m } = sequencia(['', '  ']);
    expect(m.historico).toEqual([]);
  });

  it('o histórico guarda o que foi digitado, para a seta para cima', () => {
    const { m } = sequencia(['pwd', 'ls']);
    expect(m.historico).toEqual(['pwd', 'ls']);
  });
});

describe('o disco de partida', () => {
  /* O laboratório não pode abrir com o repositório pronto — é o defeito que
     esta casa já viu três vezes, e aqui ele tomaria esta forma. */
  it('não há repositório nenhum no começo', () => {
    expect(maquinaInicial().repo).toBeNull();
  });

  it('há um arquivo oculto para o ls -a ter o que mostrar', () => {
    const arquivos = Object.keys(arquivosSob(maquinaInicial().disco, '/home/desbravador'));
    expect(arquivos.some(a => a.includes('/.'))).toBe(true);
  });
});
