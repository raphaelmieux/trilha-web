import { describe, it, expect } from 'vitest';
import { pedeOZen, leAPlantaDoBanco, fantasiaRepintada } from './segredosDoCodigo';
import { rodar, maquinaInicial } from './terminal';

/* Os segredos que se acham escrevendo: o que está em comentário ou em texto
   não conta — senão o enunciado de uma lição que os citasse daria o segredo
   a todo mundo que a abrisse. */
describe('os segredos do código', () => {
  it('o Zen do Python é import this, de verdade', () => {
    expect(pedeOZen('import this')).toBe(true);
    expect(pedeOZen('x = 1\n  import this\n')).toBe(true);
    expect(pedeOZen('# import this')).toBe(false);
    expect(pedeOZen('print("import this")')).toBe(false);
    expect(pedeOZen('import thisway')).toBe(false);
  });

  it('a planta do banco é sqlite_master, ou sqlite_schema', () => {
    expect(leAPlantaDoBanco('SELECT name FROM sqlite_master;')).toBe(true);
    expect(leAPlantaDoBanco('select * from SQLITE_SCHEMA')).toBe(true);
    expect(leAPlantaDoBanco('-- sqlite_master\nSELECT 1;')).toBe(false);
    expect(leAPlantaDoBanco("SELECT 'sqlite_master';")).toBe(false);
  });

  it('o gato pintado é a mesma fantasia com outro desenho, e só no ator', () => {
    const sb3 = (gato: string, palco = 'p1', nome = 'fantasia1') => JSON.stringify({ targets: [
      { isStage: true, name: 'Stage', costumes: [{ name: 'fundo', assetId: palco }] },
      { isStage: false, name: 'Gato', costumes: [{ name: nome, assetId: gato }] },
    ] });
    expect(fantasiaRepintada(sb3('a1'), sb3('b2'))).toBe(true);
    expect(fantasiaRepintada(sb3('a1'), sb3('a1', 'p2'))).toBe(false);
    expect(fantasiaRepintada(sb3('a1'), sb3('b2', 'p1', 'fantasia2'))).toBe(false);
    expect(fantasiaRepintada('quebrado', sb3('a1'))).toBe(false);
  });
});

describe('os segredos do terminal', () => {
  it('--help responde e é segredo; o comando sem ele não', () => {
    const r = rodar(maquinaInicial(), 'ls --help');
    expect(r.saida).toContain('Uso: ls');
    expect(r.segredo).toBe('leitor_de_manual');
    expect(rodar(maquinaInicial(), 'ls').segredo).toBeUndefined();
  });

  it('whoami diz o nome da pasta de casa', () => {
    const r = rodar(maquinaInicial(), 'whoami');
    expect(r.saida).toBe('desbravador');
    expect(r.segredo).toBe('quem_sou_eu');
  });

  /* Voltar a um commit antigo põe o disco como ele era, recusa commit enquanto
     se está lá, e o checkout do ramo traz o presente de volta. */
  it('git checkout <id> visita o passado, e o ramo traz de volta', () => {
    let m = maquinaInicial();
    const passo = (linha: string) => { const r = rodar(m, linha); m = r.maquina; return r; };
    passo('cd projeto-do-clube');
    passo('git init');
    expect(m.repo).not.toBeNull();
    const raiz = m.repo!.raiz;
    passo('touch a.txt');
    passo('git add .');
    passo('git commit -m "primeiro"');
    passo('touch b.txt');
    passo('git add .');
    passo('git commit -m "segundo"');
    const primeiro = m.repo!.commits[0].id;

    const visita = passo(`git checkout ${primeiro}`);
    expect(visita.segredo).toBe('viajante_no_tempo');
    expect(passo('git status').saida).toContain(`HEAD destacado em ${primeiro}`);
    expect(passo('ls').saida).not.toContain('b.txt');
    expect(passo('git commit -m "no passado"').saida).toContain('Volte com git checkout');

    passo(`git checkout ${m.repo!.ramoAtual}`);
    expect(m.repo!.destacado).toBeUndefined();
    expect(passo('ls').saida).toContain('b.txt');
    expect(raiz).toBe(m.repo!.raiz);
  });
});
