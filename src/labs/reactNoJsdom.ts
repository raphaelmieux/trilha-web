import type { Arquivos } from './paginaViva';
import { rodarPaginaNoJsdom } from './paginaNoJsdom';
import { montarPaginaDeReact } from './paginaDeReact';
import { compilarReactNoNode, ts } from './compiladorReactNoNode';
import { bibliotecasNoNode } from './bibliotecasNoNode';
import { analisarReact } from './analiseReact';
import { arquivosDoCenario, type ContextoDoReact } from './metasDaCcFe006';
import { LICOES_DE_REACT, type LicaoDeReact } from './licoesDeReact';
import type { ResultadoDoCenario } from './paginaViva';

/**
 * A conferência da CC-FE006 inteira no jsdom, para as travas: a mesma
 * compilação, a mesma página montada e os mesmos cenários que a tela roda
 * nas páginas escondidas. O endereço é `about:srcdoc`, que é o da prévia —
 * e é nele que o roteador do React tropeça, se tropeçar.
 *
 * Só as travas importam este arquivo.
 */
export async function conferirNoJsdom(licao: LicaoDeReact, arquivos: Arquivos): Promise<ContextoDoReact> {
  const def = LICOES_DE_REACT[licao];
  const compilacao = await compilarReactNoNode(arquivos);
  const analise = Object.fromEntries(Object.entries(arquivos)
    .filter(([n]) => /\.tsx?$/.test(n))
    .map(([n, t]) => [n, analisarReact(ts, t, n)]));
  const cenarios: Record<string, ResultadoDoCenario> = {};
  for (const c of def.cenarios) {
    const deles = arquivosDoCenario(c, arquivos);
    const comp = deles === arquivos ? compilacao : await compilarReactNoNode(deles);
    const html = montarPaginaDeReact(deles, comp, { offline: c.offline, bibliotecas: bibliotecasNoNode() });
    cenarios[c.id] = await rodarPaginaNoJsdom(html, c.passos, 'about:srcdoc');
  }
  return { arquivos, compilacao, analise, cenarios };
}
