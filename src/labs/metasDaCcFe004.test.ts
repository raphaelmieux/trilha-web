import { describe, it, expect } from 'vitest';
import {
  LICOES_DA_CC_FE004, arquivosDoCenario, contextoVazio, scriptAntesDoCorpo,
  type ContextoDoDom, type LicaoDaCcFe004, type DescobertasDoDom,
} from './metasDaCcFe004';
import { rodarNoJsdom } from './paginaNoJsdom';
import type { Arquivos, ResultadoDoCenario } from './paginaViva';
import { MURAL_CERTO, OLHOU, SOLUCOES, com } from './referenciasDaCcFe004';

/*
  As soluções de referência moram em `referenciasDaCcFe004.ts`, e não no
  currículo: gabarito no currículo fica a um import de distância da tela.

  Cada uma tem de fechar a lista inteira, e o modelo de cada lição tem de abrir
  com a lista inteira vermelha — as duas pontas que esta casa cobra de todo
  laboratório. Os quase-certos embaixo são os enganos que as lições nomeiam, e
  cada um precisa derrubar a meta que existe para ele: trava que não reprova o
  caminho errado é trava que passa por acaso.
*/

async function conferir(licao: LicaoDaCcFe004, arquivos: Arquivos, descobertas?: DescobertasDoDom): Promise<ContextoDoDom> {
  const def = LICOES_DA_CC_FE004[licao];
  const cenarios: Record<string, ResultadoDoCenario> = {};
  for (const c of def.cenarios) {
    cenarios[c.id] = await rodarNoJsdom(arquivosDoCenario(c, arquivos), c.passos, { offline: c.offline });
  }
  return { arquivos, cenarios, descobertas: descobertas ?? { inspecionados: [], paradas: [] } };
}

const feitas = (licao: LicaoDaCcFe004, ctx: ContextoDoDom) =>
  LICOES_DA_CC_FE004[licao].metas.filter(m => m.feita(ctx)).map(m => m.id);
const todas = (licao: LicaoDaCcFe004) => LICOES_DA_CC_FE004[licao].metas.map(m => m.id);

/* ── As soluções moram em referenciasDaCcFe004.ts, com a trava que clica ── */

const LICOES = Object.keys(LICOES_DA_CC_FE004) as LicaoDaCcFe004[];

describe('os laboratórios da CC-FE004', () => {
  it('são nove, e toda meta tem passo a passo', () => {
    expect(LICOES).toHaveLength(9);
    for (const l of LICOES) {
      for (const m of LICOES_DA_CC_FE004[l].metas) expect(m.passos.length, `${l}/${m.id}`).toBeGreaterThan(0);
    }
  });

  it.each(LICOES)('%s abre com a lista inteira vermelha', async licao => {
    const def = LICOES_DA_CC_FE004[licao];
    expect(feitas(licao, contextoVazio(def.arquivos))).toEqual([]);
    expect(feitas(licao, await conferir(licao, def.arquivos))).toEqual([]);
  });

  it.each(LICOES)('a solução de %s fecha a lista inteira', async licao => {
    const ctx = await conferir(licao, SOLUCOES[licao], licao === 'ferramentas' ? OLHOU : undefined);
    expect(feitas(licao, ctx)).toEqual(todas(licao));
  });

  it('toda variante muda o que diz mudar — sem isso, ela confere a mesma página duas vezes', () => {
    for (const l of LICOES) {
      for (const c of LICOES_DA_CC_FE004[l].cenarios) {
        if (!c.variante) continue;
        const antes = SOLUCOES[l];
        expect(c.variante(antes), `${l}/${c.id}`).not.toEqual(antes);
      }
    }
  });
});

describe('os enganos que as lições nomeiam', () => {
  const sem = async (licao: LicaoDaCcFe004, arquivos: Arquivos, meta: string, descobertas?: DescobertasDoDom) => {
    const ctx = await conferir(licao, arquivos, descobertas);
    const m = LICOES_DA_CC_FE004[licao].metas.find(x => x.id === meta)!;
    return { feita: m.feita(ctx), motivo: m.motivo?.(ctx) };
  };

  it('o script no <head> sem defer não liga, e diz por quê', async () => {
    const html = MURAL_CERTO.replace('<script src="script.js" defer></script>', '<script src="script.js"></script>');
    expect(scriptAntesDoCorpo(html)).toBe(true);
    const r = await sem('juntos', { ...SOLUCOES.juntos, 'index.html': html }, 'script-ligado');
    expect(r.feita).toBe(false);
    expect(r.motivo).toMatch(/defer/);
  });

  it('o contador escrito à mão acerta a página de cinco e erra a de seis', async () => {
    const r = await sem('juntos', { ...SOLUCOES.juntos, 'script.js': `${LICOES_DA_CC_FE004.juntos.arquivos['script.js']}
document.querySelector('#contador').textContent = '5 avisos';` }, 'conta-avisos');
    expect(r.feita).toBe(false);
    expect(r.motivo).toMatch(/à mão/);
  });

  it('a contagem escrita à mão no console acerta a página e erra a variante', async () => {
    const r = await sem('achar', com('achar', SOLUCOES.achar['script.js'].replace("console.log(document.querySelectorAll('.pessoa').length);", 'console.log(10);')), 'pela-classe');
    expect(r.feita).toBe(false);
    expect(r.motivo).toMatch(/à mão/);
  });

  it('contar todos os itens em vez dos de dentro da seção não passa', async () => {
    const r = await sem('achar', com('achar', SOLUCOES.achar['script.js'].replace("'#membros li'", "'li'")), 'dentro-da-secao');
    expect(r.feita).toBe(false);
  });

  it('o nome da unidade escrito de novo, em vez da constante, não passa', async () => {
    const r = await sem('mudar', com('mudar',
      SOLUCOES.mudar['script.js'].replace("'Unidade ' + unidade", "'Unidade Jatobá'")), 'titulo');
    expect(r.feita).toBe(false);
  });

  it('somar o data-pontos sem Number junta texto', async () => {
    const r = await sem('mudar', com('mudar',
      SOLUCOES.mudar['script.js'].replace('soma = soma + pontos;', 'soma = soma + membro.dataset.pontos;')), 'total');
    expect(r.feita).toBe(false);
    expect(r.motivo).toMatch(/texto/);
  });

  it('itens escritos um a um, sem sair do arranjo, não passam', async () => {
    const r = await sem('criar-e-remover', com('criar-e-remover', `const tarefas = [];
document.querySelector('#carregando').remove();
for (const t of ['Montar a barraca', 'Recolher lenha seca', 'Encher os galões de água', 'Cavar a vala em volta da barraca']) {
  const li = document.createElement('li'); li.textContent = t; document.querySelector('#tarefas').append(li);
}`), 'um-item-por-tarefa');
    expect(r.feita).toBe(false);
  });

  it('esconder o "Carregando" com hidden não é tirá-lo', async () => {
    const r = await sem('criar-e-remover', com('criar-e-remover',
      SOLUCOES['criar-e-remover']['script.js'].replace("document.querySelector('#carregando').remove();", "document.querySelector('#carregando').hidden = true;")),
    'tira-o-carregando');
    expect(r.feita).toBe(false);
  });

  it('a busca que diferencia maiúscula erra o "SA"', async () => {
    const r = await sem('eventos', com('eventos',
      SOLUCOES.eventos['script.js'].replace('busca.value.toLowerCase()', 'busca.value').replace('item.textContent.toLowerCase()', 'item.textContent')), 'procurar');
    expect(r.feita).toBe(false);
  });

  it('desfazer sem guarda passa de zero', async () => {
    const r = await sem('eventos', com('eventos',
      SOLUCOES.eventos['script.js'].replace('if (presentes > 0) presentes = presentes - 1;', 'presentes = presentes - 1;')), 'desfazer');
    expect(r.feita).toBe(false);
    expect(r.motivo).toMatch(/negativo/);
  });

  it('esquecer o preventDefault recarrega a página e perde o que estava digitado', async () => {
    const r = await sem('formulario', com('formulario',
      SOLUCOES.formulario['script.js'].replace('  evento.preventDefault();\n', '')), 'inscreve');
    expect(r.feita).toBe(false);
    expect(r.motivo).toMatch(/recarregou/);
  });

  it('a idade sem limite de cima aceita dezesseis', async () => {
    const r = await sem('formulario', com('formulario',
      SOLUCOES.formulario['script.js'].replace('idade < 10 || idade > 15', 'idade < 10')), 'idade');
    expect(r.feita).toBe(false);
    expect(r.motivo).toMatch(/16/);
  });

  it('a inscrição que não limpa o aviso anterior deixa o erro na tela', async () => {
    const r = await sem('formulario', com('formulario',
      SOLUCOES.formulario['script.js'].replace("avisar('#erro-nome', nome === '' ? 'Escreva o nome.' : '');",
        "if (nome === '') avisar('#erro-nome', 'Escreva o nome.');")), 'inscreve');
    expect(r.feita).toBe(false);
  });

  it('o placar do modelo junta texto, e a parada mostra pontos entre aspas', async () => {
    const def = LICOES_DA_CC_FE004.ferramentas;
    const r = await rodarNoJsdom(def.arquivos, def.cenarios[0].passos, { paradas: [9] });
    expect(r.leituras.quinze).toBe('0105');
    const parada = r.paradas.find(p => p.linha === 9)!;
    expect(parada.variaveis).toContainEqual({ nome: 'pontos', valor: "'10'", tipo: 'string' });
    expect(parada.variaveis.map(v => v.nome)).toEqual(expect.arrayContaining(['total', 'campo', 'placar', 'recorde']));
  });

  it('inspecionar outro elemento, ou parar fora do ouvinte, não conta', async () => {
    const outro: DescobertasDoDom = {
      inspecionados: [{ ...OLHOU.inspecionados[0], idDoElemento: 'pontos' }],
      paradas: [{ linha: 2, vez: 1, variaveis: [{ nome: 'total', valor: '0', tipo: 'number' }] }],
    };
    const ctx = await conferir('ferramentas', SOLUCOES.ferramentas, outro);
    expect(feitas('ferramentas', ctx)).toEqual(['conserto']);
  });

  it('a lista escrita à mão acerta 2026 e erra 2025', async () => {
    const r = await sem('api', com('api', SOLUCOES.api['script.js']
      .replace("escolhaDoAno.addEventListener('change', () => buscarFeriados(escolhaDoAno.value));\n", '')), 'troca-de-ano');
    expect(r.feita).toBe(false);
    expect(r.motivo).toMatch(/ninguém ouve/);
  });

  it('trocar de ano sem esvaziar a lista empilha os dois anos', async () => {
    const r = await sem('api', com('api', SOLUCOES.api['script.js'].replace("    lista.textContent = '';\n", '')), 'troca-de-ano');
    expect(r.feita).toBe(false);
    expect(r.motivo).toMatch(/28/);
  });

  it('sem catch, a falha da rede escapa para o console', async () => {
    const semCatch = SOLUCOES.api['script.js'].replace(/ {2}\} catch \(e\) \{\n[\s\S]*? {2}\} finally \{/, '  } finally {');
    const r = await sem('api', com('api', semCatch), 'avisa-falha');
    expect(r.feita).toBe(false);
    expect(r.motivo).toMatch(/in promise/);
  });

  it('esconder o carregando só no caminho feliz o deixa preso quando a rede cai', async () => {
    const semFinally = SOLUCOES.api['script.js']
      .replace('  } finally {\n    carregando.hidden = true;\n  }', '  }')
      .replace("      lista.append(item);\n    }\n", "      lista.append(item);\n    }\n    carregando.hidden = true;\n");
    const r = await sem('api', com('api', semFinally), 'mostra-espera');
    expect(r.feita).toBe(false);
    expect(r.motivo).toMatch(/finally/);
  });

  it('ordenar com < põe Paraíba antes do Pará', async () => {
    const r = await sem('pagina', com('pagina', SOLUCOES.pagina['script.js']
      .replace('a.nome.localeCompare(b.nome)', '(a.nome < b.nome ? -1 : 1)')), 'tabela');
    expect(r.feita).toBe(false);
    expect(r.motivo).toMatch(/localeCompare/);
  });

  it('filtrar o próprio arranjo perde os estados para sempre', async () => {
    const r = await sem('pagina', com('pagina', SOLUCOES.pagina['script.js']
      .replace('const visiveis = estados\n    .filter', 'estados = estados\n    .filter(e => regiao.value === \'\' || e.regiao.nome === regiao.value);\n  const visiveis = estados\n    .filter')), 'regiao');
    expect(r.feita).toBe(false);
    expect(r.motivo).toMatch(/cópia/);
  });

  it('pedir à API a cada troca de ordem não passa', async () => {
    const r = await sem('pagina', com('pagina', SOLUCOES.pagina['script.js']
      .replace("ordem.addEventListener('change', desenhar);", "ordem.addEventListener('change', carregar);")), 'ordem');
    expect(r.feita).toBe(false);
    expect(r.motivo).toMatch(/de novo/);
  });
});
