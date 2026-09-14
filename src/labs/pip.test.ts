import { describe, it, expect } from 'vitest';
import { maquinaInicial, rodar, achar, PYPI, type Maquina } from './terminal';
import { validarTerminal } from '../lib/terminalValidator';

/*
  O gerenciador de pacotes, e o laboratório que ele serve.

  ── Por que ele entrou no terminal, e não no editor ──────────────────────
  O requisito 7 da CC004 pede demonstrar a instalação de uma biblioteca de
  terceiros **pelo gerenciador de pacotes**, e o gerenciador mora na linha de
  comando. Um laboratório que fizesse o `pip install` virar um botão da
  plataforma ensinaria o gesto errado: na vida não há botão, há um comando
  digitado — e é justamente isso que a lição diz, ao separar instalar de
  programar como se separa salvar de executar.

  ── E por que ele não protege ────────────────────────────────────────────
  O `reqeusts` do catálogo é o `requests` com duas letras trocadas, e ele
  **instala**, sem reclamar. É assim que a armadilha de verdade funciona: quem
  publica pacote falso não escolhe um nome que ninguém digitaria — escolhe o
  erro de digitação comum, e o `pip install` apressado o instala.

  Se todo nome errado respondesse "não encontrado", a lição seria a de que o
  pip protege, e ele não protege. O que denuncia está no `pip show` — autor
  desconhecido, publicado há quatro dias, trinta e um downloads —, que é o que
  se olharia na página do pacote, e não num alerta que a plataforma escreveria
  por cima.
*/

/** Roda uma sessão inteira e devolve a máquina e o que não deu erro. */
function sessao(linhas: string[], inicial: Maquina = maquinaInicial()) {
  let maquina = inicial;
  const executados: string[] = [];
  const saidas: string[] = [];
  for (const linha of linhas) {
    const r = rodar(maquina, linha);
    maquina = r.maquina;
    saidas.push(r.saida);
    /* O mesmo corte que a tela faz: comando que deu erro não conta como
       executado, senão digitar o comando errado valeria por tê-lo acertado. */
    if (!/^(ERROR|WARNING|bash:)/.test(r.saida) && !/comando não encontrado/.test(r.saida)) {
      executados.push(linha);
    }
  }
  return { maquina, executados, saidas };
}

const conteudo = (m: Maquina, caminho: string) => {
  const no = achar(m.disco, caminho);
  return no?.tipo === 'arquivo' ? no.conteudo ?? '' : null;
};

const VERIFICACOES = ['viu-o-que-tem', 'conferiu-antes', 'instalou', 'gravou-a-lista'];

const conferir = (s: ReturnType<typeof sessao>) =>
  validarTerminal({ maquina: s.maquina, executados: s.executados }, VERIFICACOES);

const reprovadas = (s: ReturnType<typeof sessao>) =>
  conferir(s).filter(r => !r.passed).map(r => r.id);

describe('o pip do terminal', () => {
  it('começa sem biblioteca de terceiros nenhuma', () => {
    const { saidas } = sessao(['pip list']);
    expect(saidas[0]).toContain('pip');
    expect(saidas[0]).not.toContain('requests');
  });

  it('instala o que existe no repositório', () => {
    const { maquina, saidas } = sessao(['pip install requests']);
    expect(saidas[0]).toContain('Successfully installed requests');
    expect(maquina.instalados).toEqual([`requests==${PYPI.requests.versao}`]);
  });

  it('recusa o nome que não existe, como o pip recusa', () => {
    const { maquina, saidas } = sessao(['pip install naoexiste']);
    expect(saidas[0]).toContain('No matching distribution found');
    expect(maquina.instalados).toEqual([]);
  });

  /*
    O de sempre: o falso instala. Se esta asserção um dia virar "recusa", a
    lição terá passado a ensinar que o pip confere o nome por você.
  */
  it('instala o nome trocado sem reclamar, que é o que o pip faz', () => {
    const { maquina, saidas } = sessao(['pip install reqeusts']);
    expect(saidas[0]).toContain('Successfully installed');
    expect(maquina.instalados[0]).toContain('reqeusts');
  });

  it('conta no show o que denuncia o falso', () => {
    const { saidas } = sessao(['pip show reqeusts']);
    expect(saidas[0]).toContain('desconhecido');
    expect(saidas[0]).toContain('há 4 dias');
  });

  it('desinstala o que foi instalado', () => {
    const { maquina } = sessao(['pip install requests', 'pip uninstall requests']);
    expect(maquina.instalados).toEqual([]);
  });

  it('grava a lista no arquivo com o >', () => {
    const { maquina } = sessao([
      'cd projeto-do-clube', 'pip install requests', 'pip freeze > requirements.txt',
    ]);
    expect(conteudo(maquina, '/home/desbravador/projeto-do-clube/requirements.txt'))
      .toBe(`requests==${PYPI.requests.versao}\n`);
  });

  /* O pip e o setuptools vêm com o Python: eles aparecem no list e não no
     freeze, senão o requirements mandaria quem recebe instalar o instalador. */
  it('não põe no freeze o que veio com o Python', () => {
    const { saidas } = sessao(['pip install requests', 'pip freeze']);
    expect(saidas[1]).not.toContain('setuptools');
    expect(saidas[1]).toContain('requests==');
  });

  it('responde a subcomando que não conhece, em vez de calar', () => {
    expect(sessao(['pip wheel']).saidas[0]).toContain('unknown command');
  });
});

describe('o laboratório de instalar biblioteca', () => {
  it('abre sem nenhuma verificação verde', () => {
    expect(conferir(sessao([])).filter(r => r.passed)).toEqual([]);
  });

  /*
    A sessão de referência, que é a outra metade: laboratório impossível não
    estoura em lugar nenhum, e quem faz tudo certo fica olhando uma lista
    vermelha sem explicação.
  */
  it('fica inteiro verde com a sessão de referência', () => {
    expect(reprovadas(sessao([
      'cd projeto-do-clube',
      'pip list',
      'pip show requests',
      'pip install requests',
      'pip freeze > requirements.txt',
      'cat requirements.txt',
    ]))).toEqual([]);
  });

  /*
    E a armadilha do vazio, que aqui usa um arquivo de disfarce: `pip freeze`
    sem nada instalado grava um requirements.txt de verdade, com nada dentro.
    O arquivo existe, e não é a lista.
  */
  it('não aceita o requirements.txt gravado antes de instalar', () => {
    const s = sessao([
      'cd projeto-do-clube', 'pip list', 'pip show requests', 'pip freeze > requirements.txt',
    ]);
    expect(conteudo(s.maquina, '/home/desbravador/projeto-do-clube/requirements.txt')).toBe('');
    expect(reprovadas(s)).toContain('gravou-a-lista');
  });

  /* Quem caiu no nome trocado precisa saber que caiu, e onde estava escrito. */
  it('reprova o nome trocado dizendo o que houve', () => {
    const s = sessao(['cd projeto-do-clube', 'pip list', 'pip show reqeusts', 'pip install reqeusts']);
    const instalou = conferir(s).find(r => r.id === 'instalou')!;
    expect(instalou.passed).toBe(false);
    expect(instalou.detail).toContain('letras trocadas');
  });

  /* Instalar sem olhar quem publicou passa nas outras e não nesta: é a tarefa
     que separa "instalei" de "conferi antes de instalar". */
  it('reprova quem instalou sem conferir antes', () => {
    const s = sessao([
      'cd projeto-do-clube', 'pip list', 'pip install requests', 'pip freeze > requirements.txt',
    ]);
    expect(reprovadas(s)).toEqual(['conferiu-antes']);
  });
});
