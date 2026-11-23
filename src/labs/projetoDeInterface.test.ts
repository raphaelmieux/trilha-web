import { describe, it, expect } from 'vitest';
import {
  HOJE_DA_PROPOSTA_DA_AGENDA, PROPOSTA_DA_AGENDA, contextoDoCadernoDaCcFe007, enviarPropostaDeInterface,
  faltasDaPropostaDeInterface, metasDoCadernoDaCcFe007, rascunhoSemCaminho, telasSoltas,
  type ContextoDaCcFe007Caderno, type LicaoDoCadernoDaCcFe007,
} from './projetoDeInterface';

/*
  O caderno da CC-FE007: a proposta e o roteiro da apresentação.

  Os caminhos errados são os que se tentam de verdade: três telas sem ligação
  nenhuma, uma seta no mapa sem nada em que tocar no rascunho, programar
  antes de a proposta voltar, e o celular trocado pela janela estreitada ou
  por capturas de tela.
*/

const feitas = (l: LicaoDoCadernoDaCcFe007, c: ContextoDaCcFe007Caderno) =>
  metasDoCadernoDaCcFe007(l).filter(m => m.feita(c)).map(m => m.id);

const aprovada = (): ContextoDaCcFe007Caderno => ({
  ...contextoDoCadernoDaCcFe007(),
  proposta: enviarPropostaDeInterface(PROPOSTA_DA_AGENDA, HOJE_DA_PROPOSTA_DA_AGENDA),
});

const roteiroCerto = (): ContextoDaCcFe007Caderno => ({
  ...contextoDoCadernoDaCcFe007(),
  roteiro: { objetivo: 2, celular: 7, decisoes: 3, perguntas: 3 },
  noCelular: ['link', 'telas', 'coluna', 'erro'],
  aparelho: 'real',
  planoB: 'Uso os dados móveis do meu celular, que testei antes na sala do clube.',
});

describe('a proposta', () => {
  it('nenhuma meta abre verde', () => {
    expect(feitas('proposta', contextoDoCadernoDaCcFe007())).toEqual([]);
    expect(feitas('apresentacao', contextoDoCadernoDaCcFe007())).toEqual([]);
  });

  it('a proposta da agenda, enviada, volta aprovada e fecha a lição', () => {
    expect(faltasDaPropostaDeInterface(PROPOSTA_DA_AGENDA)).toEqual([]);
    const c = aprovada();
    expect(c.proposta.aprovadaEm).toBe(HOJE_DA_PROPOSTA_DA_AGENDA);
    expect(feitas('proposta', c)).toEqual(metasDoCadernoDaCcFe007('proposta').map(m => m.id));
  });

  it('três telas sem ligação não são um mapa, e o examinador devolve', () => {
    const soltas = { ...PROPOSTA_DA_AGENDA, telas: PROPOSTA_DA_AGENDA.telas.map(t => ({ ...t, leva: [] })) };
    expect(telasSoltas(soltas).map(t => t.nome)).toEqual(['Evento', 'Feriados']);
    const c = { ...contextoDoCadernoDaCcFe007(), proposta: enviarPropostaDeInterface(soltas, HOJE_DA_PROPOSTA_DA_AGENDA) };
    expect(c.proposta.aprovadaEm).toBeNull();
    expect(c.proposta.devolvida).toContain('Não há caminho até Evento, Feriados');
    expect(feitas('proposta', c)).not.toContain('mapa-de-telas');
  });

  it('uma seta no mapa sem nada em que tocar no rascunho não passa', () => {
    const semMenu = {
      ...PROPOSTA_DA_AGENDA,
      telas: PROPOSTA_DA_AGENDA.telas.map(t => (t.id === 't3' ? { ...t, rascunho: ['cabecalho' as const, 'titulo' as const, 'carregando' as const, 'erro' as const] } : t)),
    };
    expect(rascunhoSemCaminho(semMenu).map(t => t.nome)).toEqual(['Feriados']);
    expect(feitas('proposta', { ...contextoDoCadernoDaCcFe007(), proposta: semMenu })).not.toContain('rascunho');
  });

  it('o rascunho que não prevê o erro em tela nenhuma não passa', () => {
    const semErro = { ...PROPOSTA_DA_AGENDA, telas: PROPOSTA_DA_AGENDA.telas.map(t => ({ ...t, rascunho: t.rascunho.filter(b => b !== 'erro') })) };
    expect(feitas('proposta', { ...contextoDoCadernoDaCcFe007(), proposta: semErro })).not.toContain('rascunho');
  });

  it('"todo mundo" não é público', () => {
    const vago = { ...PROPOSTA_DA_AGENDA, publico: 'Todo mundo' };
    expect(feitas('proposta', { ...contextoDoCadernoDaCcFe007(), proposta: vago })).not.toContain('objetivo-e-publico');
  });

  it('começar a programar antes da aprovação não fecha, mesmo aprovando depois', () => {
    const c = { ...aprovada(), comecouAntes: true };
    expect(feitas('proposta', c)).not.toContain('aprovada-antes');
  });

  it('reenviar uma proposta já aprovada não troca a data da aprovação', () => {
    const c = aprovada();
    expect(enviarPropostaDeInterface(c.proposta, '2026-12-01').aprovadaEm).toBe(HOJE_DA_PROPOSTA_DA_AGENDA);
  });
});

describe('a apresentação', () => {
  it('o roteiro de referência fecha a lição', () => {
    expect(feitas('apresentacao', roteiroCerto())).toEqual(metasDoCadernoDaCcFe007('apresentacao').map(m => m.id));
  });

  it('dezesseis minutos não cabem, e as decisões sem tempo também não', () => {
    expect(feitas('apresentacao', { ...roteiroCerto(), roteiro: { objetivo: 3, celular: 7, decisoes: 3, perguntas: 3 } })).not.toContain('cabe-em-quinze');
    expect(feitas('apresentacao', { ...roteiroCerto(), roteiro: { objetivo: 3, celular: 7 } })).not.toContain('cabe-em-quinze');
  });

  it('explicar mais do que mostrar tira o celular do centro', () => {
    const c = { ...roteiroCerto(), roteiro: { objetivo: 8, celular: 4, decisoes: 2 } };
    expect(feitas('apresentacao', c)).toContain('cabe-em-quinze');
    expect(feitas('apresentacao', c)).not.toContain('celular-no-centro');
  });

  it('sem provocar o erro, o que se mostra fica pela metade', () => {
    expect(feitas('apresentacao', { ...roteiroCerto(), noCelular: ['link', 'telas', 'coluna'] })).not.toContain('o-que-mostrar');
  });

  it('a janela estreitada e as capturas não são o aparelho, e captura não é plano B', () => {
    expect(feitas('apresentacao', { ...roteiroCerto(), aparelho: 'janela' })).not.toContain('aparelho-real');
    expect(feitas('apresentacao', { ...roteiroCerto(), aparelho: 'capturas' })).not.toContain('aparelho-real');
    expect(feitas('apresentacao', { ...roteiroCerto(), planoB: 'Se a internet cair, mostro as capturas de tela que tirei antes.' })).not.toContain('aparelho-real');
  });
});
