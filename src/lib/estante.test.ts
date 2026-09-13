import { describe, it, expect } from 'vitest';
import { fileirasDaEstante, totalDaEstante } from './estante';
import { INSIGNIAS, codigoDaInsigniaDaTrilha } from './insignias';
import { getOpenSpecialties } from '../curriculum';
import { veredasAbertas, codigoDaInsigniaDaVereda } from '../curriculum/veredas';
import { hasIcon } from './badgeIcons';
import { catalogoSemeado } from '../../supabase/migrations/catalogoSemeado';

/*
  A estante desenha o que falta, e é isso que a torna diferente de tudo o que
  veio antes.

  Toda tela anterior desenhava só o que a pessoa já tem, e o que ela tem chega
  do banco com nome, ícone e classe prontos. Aqui o lugar vazio é desenhado a
  partir do catálogo em código — então uma insígnia que o catálogo não conheça
  simplesmente não tem prateleira, e a página fica bonita, completa e com um
  buraco que ninguém vê, porque não há nada onde ele deveria estar.

  Era exatamente o caso das de trilha e de vereda: elas não estão em
  `INSIGNIAS`, nascem do currículo na hora de conceder.
*/

const lugares = () => fileirasDaEstante().flatMap(f => f.lugares);

describe('a estante conhece o catálogo inteiro', () => {
  /* Guarda contra o vazio: uma estante que esvaziasse deixaria todas as travas
     abaixo verdes por não terem conferido nada. */
  it('tem fileiras, e nenhuma delas vazia', () => {
    const fileiras = fileirasDaEstante();
    expect(fileiras.length).toBeGreaterThanOrEqual(17);
    for (const f of fileiras) {
      expect(f.lugares.length, `a fileira "${f.titulo}" não tem lugar nenhum`).toBeGreaterThan(0);
    }
  });

  it('as treze escadas têm sete degraus cada', () => {
    const escadas = fileirasDaEstante().filter(f => f.lugares.every(l => l.alvo !== undefined));
    expect(escadas).toHaveLength(13);
    for (const e of escadas) expect(e.lugares, e.titulo).toHaveLength(7);
  });

  /*
    O total é o do catálogo, e é conferido contra o banco — e não contra um
    número escrito aqui. Um número à mão vira mentira no dia em que a próxima
    trilha abrir, e ninguém repara: a estante mostraria 132 lugares num
    catálogo de 133.
  */
  it('tem um lugar para cada insígnia que o banco semeia', () => {
    const naEstante = new Set(lugares().map(l => l.code));
    const noBanco = catalogoSemeado();
    const semPrateleira = [...noBanco.keys()].filter(c => !naEstante.has(c));
    expect(semPrateleira,
      'estas insígnias existem no banco e não têm lugar na estante — quem as '
      + 'conquistar não vai encontrá-las, e a página vai parecer completa.',
    ).toEqual([]);
    expect(totalDaEstante()).toBe(noBanco.size);
  });

  /* E o contrário: prateleira para insígnia que não existe é prometer prêmio
     por nada — a mesma regra de não semear insígnia de percurso fechado. */
  it('não reserva lugar para insígnia que o banco não tem', () => {
    const noBanco = catalogoSemeado();
    const inventadas = lugares().map(l => l.code).filter(c => !noBanco.has(c));
    expect(inventadas).toEqual([]);
  });

  it('não repete código entre as fileiras', () => {
    const codigos = lugares().map(l => l.code);
    expect(new Set(codigos).size).toBe(codigos.length);
  });
});

describe('as de percurso, que não estão em INSIGNIAS', () => {
  /* São elas o motivo deste arquivo existir: a estante é a primeira tela que
     precisa saber o nome de uma insígnia que ninguém ganhou ainda. */
  it('toda trilha aberta tem prateleira', () => {
    const naEstante = new Set(lugares().map(l => l.code));
    for (const e of getOpenSpecialties()) {
      expect(naEstante, `${e.code} sem lugar na estante`)
        .toContain(codigoDaInsigniaDaTrilha(e.code));
    }
    expect(getOpenSpecialties().length).toBeGreaterThan(0);
  });

  it('toda vereda aberta tem prateleira', () => {
    const naEstante = new Set(lugares().map(l => l.code));
    for (const v of veredasAbertas()) {
      expect(naEstante, `${v.code} sem lugar na estante`)
        .toContain(codigoDaInsigniaDaVereda(v.id));
    }
    expect(veredasAbertas().length).toBeGreaterThan(0);
  });

  /*
    E o nome do lugar vazio é o nome que o banco vai mandar quando ela for
    ganha. Divergir é a mesma insígnia se chamando uma coisa na prateleira
    vazia e outra depois de conquistada — o defeito que os quinze nomes por
    extenso já custaram, agora com a tela mostrando os dois lado a lado.
  */
  it('o nome do lugar vazio é o nome que o banco guarda', () => {
    const noBanco = catalogoSemeado();
    const divergentes = lugares()
      .filter(l => noBanco.has(l.code))
      .filter(l => noBanco.get(l.code)!.name !== l.nome)
      .map(l => ({ code: l.code, estante: l.nome, banco: noBanco.get(l.code)!.name }));
    expect(divergentes).toEqual([]);
  });
});

describe('o desenho de cada lugar', () => {
  it('todo lugar tem ícone que a plataforma sabe desenhar', () => {
    for (const l of lugares()) expect(hasIcon(l.icone), `${l.code} usa ${l.icone}`).toBe(true);
  });

  /* Só as de horário ficam fora da escala. Qualquer outra sem classe sairia
     como círculo off-white, dizendo ao desbravador que ela é de outra
     natureza quando ela é degrau de alguma coisa. */
  it('só as curiosidades ficam sem classe', () => {
    const sem = lugares().filter(l => l.semClasse).map(l => l.code).sort();
    expect(sem).toEqual(['coruja', 'fim_de_semana', 'madrugador', 'semana_inteira']);
  });

  /* O alvo é o que diz, no lugar vazio, quanto falta. Degrau sem alvo deixaria
     a prateleira muda justamente onde ela tem algo a dizer. */
  it('todo degrau de escada diz o alvo, e ninguém mais', () => {
    for (const f of fileirasDaEstante()) {
      const comAlvo = f.lugares.filter(l => l.alvo !== undefined);
      expect(comAlvo.length === 0 || comAlvo.length === f.lugares.length, f.titulo).toBe(true);
      for (const l of comAlvo) expect(l.alvo, l.code).toBeGreaterThan(0);
    }
  });

  it('todo lugar tem nome e descrição escritos', () => {
    for (const l of lugares()) {
      expect(l.nome.trim(), `${l.code} sem nome`).not.toBe('');
      expect(l.descricao.trim(), `${l.code} sem descrição`).not.toBe('');
    }
  });
});

describe('nada saiu de INSIGNIAS pelo caminho', () => {
  /* A estante deriva de `INSIGNIAS`, e derivar com filtro é onde se perde
     coisa calado: um filtro a mais e vinte e seis laboratórios somem da
     prateleira sem nada reprovar. */
  it('toda insígnia do catálogo em código tem lugar', () => {
    const naEstante = new Set(lugares().map(l => l.code));
    const perdidas = INSIGNIAS.map(i => i.code).filter(c => !naEstante.has(c));
    expect(perdidas).toEqual([]);
  });
});
