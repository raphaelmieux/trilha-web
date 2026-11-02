import { describe, it, expect } from 'vitest';
import {
  HOJE_DA_PROPOSTA, LEMBRANCAS_DO_CAMINHO, contextoInicial, enviarParaAprovacao, metasDaCc006, operacoesDe,
  type ContextoDaCc006, type LicaoDaCc006,
} from './metasDaCc006';
import { COMMITS_DA_HISTORIA } from './repositorioDoAlmoxarifado';

/*
  As três lições da CC006 que são tela da plataforma.

  Cada uma abre sem nada verde, a referência fecha a lista inteira, e cada
  caminho errado que a lição existe para pegar deixa a meta dele vermelha.
*/

const LICOES: LicaoDaCc006[] = ['proposta', 'diario', 'apresentacao'];

const verdes = (licao: LicaoDaCc006, c: ContextoDaCc006) => metasDaCc006(licao).filter(m => m.feita(c)).map(m => m.id);
const todas = (licao: LicaoDaCc006) => metasDaCc006(licao).map(m => m.id);

const PROPOSTA_CERTA = {
  problema: 'A lista do material do clube fica num caderno no armário, ninguém sabe quanto há de cada coisa, e no acampamento sempre falta corda.',
  usuario: 'O conselheiro responsável pelo almoxarifado do clube',
  funcionalidades: [
    'Cadastrar um material com o nome e a quantidade',
    'Listar os materiais em ordem de nome',
    'Alterar a quantidade de um material',
    'Remover um material que o clube não tem mais',
  ],
};

const comProposta = (parcial: Partial<typeof PROPOSTA_CERTA> = {}): ContextoDaCc006 => {
  const c = contextoInicial();
  return { ...c, proposta: { ...c.proposta, ...PROPOSTA_CERTA, ...parcial } };
};
const aprovada = (c: ContextoDaCc006): ContextoDaCc006 => ({ ...c, proposta: enviarParaAprovacao(c.proposta, HOJE_DA_PROPOSTA) });

const DIARIO_CERTO = [
  {
    problema: 'A quantidade digitada por extenso derrubava o programa inteiro no meio do cadastro.',
    comoApareceu: 'ValueError: invalid literal for int()',
    solucao: 'Escrevi ler_inteiro no entrada.py, com except ValueError, que avisa e pergunta de novo.',
  },
  {
    problema: 'Cadastrar o mesmo material duas vezes fechava o programa e perdia o menu.',
    comoApareceu: 'sqlite3.IntegrityError, UNIQUE constraint failed',
    solucao: 'Pus o cadastrar num try com except sqlite3.IntegrityError e uma frase que explica o motivo.',
  },
  {
    problema: 'Guardei quatro mudanças diferentes num commit só e não consegui desfazer uma delas.',
    comoApareceu: 'O git log mostrava um commit chamado ajustes',
    solucao: 'Passei a usar git diff e git add arquivo por arquivo, com uma mensagem para cada assunto.',
  },
];

const APRESENTACAO_CERTA = (c: ContextoDaCc006): ContextoDaCc006 => ({
  ...c,
  roteiro: { problema: 2, demonstracao: 7, decisao: 3, perguntas: 3 },
  demonstrar: ['cadastrar', 'listar', 'alterar', 'remover', 'erro'],
  decisao: {
    escolhida: 'unique',
    alternativa: 'Conferir com um SELECT antes de cada INSERT',
    porque: 'Se outro programa gravar no mesmo arquivo, a conferência do meu não o alcança; o UNIQUE vale para todos, e eu só apanho o IntegrityError e aviso.',
  },
});

const REFERENCIA: Record<LicaoDaCc006, (c: ContextoDaCc006) => ContextoDaCc006> = {
  proposta: () => aprovada(comProposta()),
  diario: c => ({ ...c, diario: DIARIO_CERTO }),
  apresentacao: APRESENTACAO_CERTA,
};

describe('as lições da plataforma da CC006', () => {
  for (const licao of LICOES) {
    it(`${licao} abre sem nada verde`, () => {
      expect(verdes(licao, contextoInicial())).toEqual([]);
    });
    it(`${licao}: a referência fecha a lista inteira`, () => {
      expect(verdes(licao, REFERENCIA[licao](contextoInicial()))).toEqual(todas(licao));
    });
    it(`${licao}: toda meta tem passo a passo`, () => {
      for (const m of metasDaCc006(licao)) expect(m.passos.length, m.id).toBeGreaterThan(0);
    });
  }
});

describe('a proposta', () => {
  it('a aprovação vem antes do primeiro commit do almoxarifado', () => {
    const primeiro = COMMITS_DA_HISTORIA.map(c => c.data!).sort()[0];
    expect(HOJE_DA_PROPOSTA < primeiro).toBe(true);
  });

  it('começar a programar antes da aprovação não se desfaz aprovando depois', () => {
    const c = aprovada({ ...comProposta(), comecouAntes: true });
    expect(c.proposta.aprovadaEm).not.toBeNull();
    expect(verdes('proposta', c)).not.toContain('aprovada-antes');
  });

  it('sem remover, o examinador devolve a proposta dizendo o que falta', () => {
    const c = aprovada(comProposta({ funcionalidades: PROPOSTA_CERTA.funcionalidades.slice(0, 3) }));
    expect(c.proposta.aprovadaEm).toBeNull();
    expect(c.proposta.devolvida).toContain('remover');
    expect(verdes('proposta', c)).not.toContain('quatro-operacoes');
  });

  it('"todo mundo" não é usuário-alvo', () => {
    const c = aprovada(comProposta({ usuario: 'todo mundo do clube inteiro' }));
    expect(c.proposta.aprovadaEm).toBeNull();
    expect(verdes('proposta', c)).not.toContain('problema-e-usuario');
  });

  it('uma solução no lugar do problema, curta, não passa', () => {
    expect(verdes('proposta', comProposta({ problema: 'Fazer um programa de estoque.' }))).not.toContain('problema-e-usuario');
  });

  it('a aprovação reenviada não troca a data da primeira', () => {
    const uma = aprovada(comProposta());
    const outra = { ...uma, proposta: enviarParaAprovacao(uma.proposta, '2026-12-01') };
    expect(outra.proposta.aprovadaEm).toBe(HOJE_DA_PROPOSTA);
  });

  it('o verbo se lê inteiro: crianças não é criar, e lista não é listar', () => {
    expect(operacoesDe('Consultar as crianças de cada unidade')).toEqual(['consultar']);
    expect(operacoesDe('Pôr a lista de compras no mural')).toEqual([]);
    expect(operacoesDe('Excluir um material')).toEqual(['remover']);
  });

  it('funcionalidade de duas palavras não conta', () => {
    const c = comProposta({ funcionalidades: ['Cadastrar material', 'Listar tudo', 'Alterar quantidade', 'Remover material'] });
    expect(verdes('proposta', c)).not.toContain('quatro-operacoes');
  });
});

describe('o diário de bordo', () => {
  const com = (d: typeof DIARIO_CERTO) => ({ ...contextoInicial(), diario: d });

  it('o mesmo problema três vezes não é registrar três', () => {
    expect(verdes('diario', com([DIARIO_CERTO[0], DIARIO_CERTO[0], DIARIO_CERTO[0]]))).not.toContain('tres-problemas');
  });

  it('copiar a lembrança da lista não vale como problema próprio', () => {
    const copiado = DIARIO_CERTO.map((r, i) => (i === 0 ? { ...r, problema: LEMBRANCAS_DO_CAMINHO[0] } : r));
    expect(verdes('diario', com(copiado))).not.toContain('tres-problemas');
  });

  it('a solução que repete o problema não é solução', () => {
    const repetido = DIARIO_CERTO.map((r, i) => (i === 1 ? { ...r, solucao: r.problema } : r));
    expect(verdes('diario', com(repetido))).not.toContain('solucao-de-cada');
  });

  it('o sintoma em branco deixa a meta do sintoma vermelha, e só ela', () => {
    const semSintoma = DIARIO_CERTO.map((r, i) => (i === 2 ? { ...r, comoApareceu: 'deu erro' } : r));
    expect(verdes('diario', com(semSintoma))).toEqual(['tres-problemas', 'solucao-de-cada']);
  });
});

describe('a apresentação', () => {
  const certa = APRESENTACAO_CERTA(contextoInicial());

  it('dezesseis minutos não cabem em quinze', () => {
    expect(verdes('apresentacao', { ...certa, roteiro: { ...certa.roteiro, perguntas: 4 } })).not.toContain('cabe-em-quinze');
  });

  it('pular a decisão técnica não cabe no roteiro, por mais curto que fique', () => {
    expect(verdes('apresentacao', { ...certa, roteiro: { problema: 2, demonstracao: 7 } })).not.toContain('cabe-em-quinze');
  });

  it('mais tempo no problema que na demonstração não põe o programa no centro', () => {
    const v = verdes('apresentacao', { ...certa, roteiro: { problema: 6, demonstracao: 5, decisao: 3 } });
    expect(v).toContain('cabe-em-quinze');
    expect(v).not.toContain('demonstracao-no-centro');
  });

  it('demonstrar sem o erro de propósito não mostra o tratamento', () => {
    expect(verdes('apresentacao', { ...certa, demonstrar: ['cadastrar', 'listar', 'alterar', 'remover'] })).not.toContain('mostra-funcionando');
  });

  it('justificar sem dizer a alternativa não justifica', () => {
    expect(verdes('apresentacao', { ...certa, decisao: { ...certa.decisao, alternativa: '' } })).not.toContain('decisao-justificada');
  });

  it('a alternativa copiada na justificativa não conta como comparação', () => {
    const d = { ...certa.decisao, alternativa: certa.decisao.porque };
    expect(verdes('apresentacao', { ...certa, decisao: d })).not.toContain('decisao-justificada');
  });
});
