import { describe, it, expect } from 'vitest';
import {
  BASE_CERTA, CARTAO_COM_ERRO, METAS_DA_HOSPEDAGEM, REPOSITORIO_DE_PARTIDA, VITE_CONFIG_COM_BASE, contextoDaHospedagem,
  fontesDoSite, lerBase, paginaDoSite, rodarAEsteira, siteFunciona, type ContextoDaHospedagem, type FonteDoPages,
} from './hospedagem';
import { CARTAO_DE_EVENTO } from './agendaDoClube';
import { compilarReactNoNode } from './compiladorReactNoNode';
import { bibliotecasNoNode } from './bibliotecasNoNode';
import { rodarPaginaNoJsdom } from './paginaNoJsdom';
import type { Arquivos } from './paginaViva';

/*
  A publicação da agenda: a esteira, o site que sai dela e as tarefas.

  As três armadilhas — o build que recusa o que o dev aceitava, a base que
  deixa o site em branco e o ramo publicado sem construir — precisam
  acontecer de verdade aqui, senão a lição ensina um GitHub Pages que não
  existe.
*/

async function publicar(c: ContextoDaHospedagem, repo: Arquivos, fonte: FonteDoPages, mensagem = 'Envio'): Promise<ContextoDaHospedagem> {
  const comp = await compilarReactNoNode(fontesDoSite(repo));
  const p = rodarAEsteira(c.publicacoes.length + 1, mensagem, repo, fonte, comp.diagnosticos);
  return { ...c, repositorio: repo, fonte, publicacoes: [...c.publicacoes, p] };
}

const CONSERTADO: Arquivos = { ...REPOSITORIO_DE_PARTIDA, 'CartaoDeEvento.tsx': CARTAO_DE_EVENTO };
const PRONTO: Arquivos = { ...CONSERTADO, 'vite.config.ts': VITE_CONFIG_COM_BASE };

describe('a esteira', () => {
  it('o repositório de partida chega com o erro que o dev não mostrava, e o build o recusa', async () => {
    expect(CARTAO_COM_ERRO).toContain('evento.lugar');
    const comp = await compilarReactNoNode(fontesDoSite(REPOSITORIO_DE_PARTIDA));
    expect(comp.sintaxe).toEqual([]);
    expect(comp.modulos['CartaoDeEvento.tsx']).toBeDefined();
    const p = rodarAEsteira(1, 'x', REPOSITORIO_DE_PARTIDA, 'acoes', comp.diagnosticos);
    expect(p.ok).toBe(false);
    expect(p.log.join('\n')).toMatch(/CartaoDeEvento\.tsx:\d+:\d+ - error TS2339/);
    expect(p.log[p.log.length - 1]).toBe('Error: Process completed with exit code 2.');
  }, 30000);

  it('a base sai do vite.config.ts, e a de fábrica é a raiz', () => {
    expect(lerBase(REPOSITORIO_DE_PARTIDA['vite.config.ts'])).toBe('/');
    expect(lerBase(VITE_CONFIG_COM_BASE)).toBe(BASE_CERTA);
    expect(lerBase("export default { // base: '/x/'\n}")).toBe('/');
  });

  it('o ramo publica sem construir, e o site sai em branco pedindo /main.tsx', async () => {
    const c = await publicar(contextoDaHospedagem(), PRONTO, 'ramo');
    const p = c.publicacoes[0];
    expect(p.ok).toBe(true);
    expect(siteFunciona(p)).toBe(false);
    const html = paginaDoSite(p, null, bibliotecasNoNode())!;
    const r = await rodarPaginaNoJsdom(html, [{ acao: 'ler', chave: 'filhos', seletor: '#root *', como: 'contagem' }], 'about:srcdoc');
    expect(r.leituras.filhos).toBe(0);
    expect(r.console.map(e => e.texto).join('\n')).toContain('/main.tsx');
  }, 30000);

  it('com a base de fábrica o build passa e o site sai em branco, com o 404 só no console', async () => {
    const c = await publicar(contextoDaHospedagem(), CONSERTADO, 'acoes');
    const p = c.publicacoes[0];
    expect(p.ok).toBe(true);
    expect(p.base).toBe('/');
    const html = paginaDoSite(p, null, bibliotecasNoNode())!;
    const r = await rodarPaginaNoJsdom(html, [{ acao: 'ler', chave: 'filhos', seletor: '#root *', como: 'contagem' }], 'about:srcdoc');
    expect(r.leituras.filhos).toBe(0);
    expect(r.console.map(e => e.texto).join('\n')).toMatch(/404.*github\.io\/assets\/index-/);
  }, 30000);

  it('com a base certa, o site publicado é a agenda funcionando', async () => {
    const c = await publicar(contextoDaHospedagem(), PRONTO, 'acoes');
    const p = c.publicacoes[0];
    expect(siteFunciona(p)).toBe(true);
    const comp = await compilarReactNoNode(fontesDoSite(p.arquivos));
    const r = await rodarPaginaNoJsdom(paginaDoSite(p, comp, bibliotecasNoNode())!, [
      { acao: 'esperar' }, { acao: 'ler', chave: 'cartoes', seletor: '.cartao', como: 'contagem' },
      { acao: 'ler', chave: 'quando', seletor: '.cartao .quando', como: 'texto' },
    ], 'about:srcdoc');
    expect(r.erros).toEqual([]);
    expect(r.leituras.cartoes).toBe(4);
    expect(r.leituras.quando).toBe('10/07/2026 — Chácara Recanto Verde');
  }, 30000);

  it('o nome do arquivo construído muda quando o código muda', () => {
    const a = rodarAEsteira(1, 'x', PRONTO, 'acoes', []);
    const b = rodarAEsteira(2, 'x', { ...PRONTO, 'Inicio.tsx': `${PRONTO['Inicio.tsx']}\n` }, 'acoes', []);
    expect(a.arquivoJs).not.toBe(b.arquivoJs);
  });
});

describe('as tarefas da publicação', () => {
  const feitas = (c: ContextoDaHospedagem) => Object.fromEntries(METAS_DA_HOSPEDAGEM.map(m => [m.id, m.feita(c)]));

  it('abrem todas por fazer, e cada uma diz por quê', () => {
    const c = contextoDaHospedagem();
    for (const m of METAS_DA_HOSPEDAGEM) {
      expect(m.feita(c), m.id).toBe(false);
      expect(m.motivo(c), m.id).toBeTruthy();
    }
  });

  it('o caminho inteiro fecha as quatro', async () => {
    let c = await publicar(contextoDaHospedagem(), REPOSITORIO_DE_PARTIDA, 'acoes', 'Liga o Pages');
    expect(feitas(c)['build-sem-erro']).toBe(false);
    c = await publicar(c, CONSERTADO, 'acoes', 'Conserta o local do cartão');
    expect(feitas(c)).toMatchObject({ 'pela-esteira': true, 'build-sem-erro': true, 'base-certa': false });
    c = await publicar(c, PRONTO, 'acoes', 'Diz a base do site');
    const id = c.publicacoes[c.publicacoes.length - 1].id;
    c = { ...c, visitas: [{ publicacao: id, endereco: '' }, { publicacao: id, endereco: '#/evento/campori' }, { publicacao: id, endereco: '#/feriados' }] };
    expect(feitas(c)).toEqual({ 'pela-esteira': true, 'build-sem-erro': true, 'base-certa': true, 'link-publico': true });
  }, 60000);

  it('calar o compilador passa o build e não fecha a tarefa', async () => {
    const calado = { ...PRONTO, 'CartaoDeEvento.tsx': CARTAO_COM_ERRO.replace('{evento.lugar}', '{(evento as any).lugar}') };
    const c = await publicar(contextoDaHospedagem(), calado, 'acoes');
    expect(c.publicacoes[0].ok).toBe(true);
    expect(feitas(c)['build-sem-erro']).toBe(false);
  }, 30000);

  it('visitar o site em branco não conta como link funcionando', async () => {
    const c0 = await publicar(contextoDaHospedagem(), CONSERTADO, 'acoes');
    const c = { ...c0, visitas: ['', '#/evento/campori', '#/feriados'].map(endereco => ({ publicacao: 1, endereco })) };
    expect(feitas(c)['link-publico']).toBe(false);
  }, 30000);
});
