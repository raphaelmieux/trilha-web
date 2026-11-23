import { describe, it, expect } from 'vitest';
import { LICOES_REACT_DA_CC_FE007, type LicaoReactDaCcFe007, colunasDaLista, largurasFixas, temViewport } from './metasDaCcFe007';
import type { ContextoDoReact } from './metasDaCcFe006';
import { conferirNoJsdom } from './reactNoJsdom';
import {
  AGENDA_COM_API, AGENDA_COM_COMPONENTES, AGENDA_COM_TELAS, AGENDA_RESPONSIVA, CARTAO_DE_EVENTO, EVENTO_COM_COMPONENTES,
  FERIADOS_COM_API, FOLHA_PARA_O_COMPUTADOR, FOLHA_RESPONSIVA, MENSAGEM_DE_ERRO,
} from './agendaDoClube';

/*
  Os quatro laboratórios de React da CC-FE007, com o React de verdade no
  jsdom. A solução de referência de cada um é a etapa seguinte da agenda, que
  é também a partida da lição seguinte — se uma não fechar a outra, a vereda
  inteira emperra no meio.
*/

const REFERENCIA: Record<LicaoReactDaCcFe007, Record<string, string>> = {
  'agenda-telas': AGENDA_COM_TELAS,
  'agenda-componentes': AGENDA_COM_COMPONENTES,
  'agenda-api': AGENDA_COM_API,
  'agenda-responsivo': AGENDA_RESPONSIVA,
};
const LICOES = Object.keys(LICOES_REACT_DA_CC_FE007) as LicaoReactDaCcFe007[];
const com = (l: LicaoReactDaCcFe007, troca: Record<string, string> = {}) => ({ ...REFERENCIA[l], ...troca });
const feitas = (l: LicaoReactDaCcFe007, ctx: ContextoDoReact) =>
  Object.fromEntries(LICOES_REACT_DA_CC_FE007[l].metas.map(m => [m.id, m.feita(ctx)]));

describe('os laboratórios da agenda', () => {
  it('cada lição parte de onde a anterior chegou', () => {
    expect(LICOES_REACT_DA_CC_FE007['agenda-componentes'].arquivos['Inicio.tsx']).toBe(AGENDA_COM_TELAS['Inicio.tsx']);
    expect(LICOES_REACT_DA_CC_FE007['agenda-api'].arquivos).toEqual(AGENDA_COM_COMPONENTES);
    expect(LICOES_REACT_DA_CC_FE007['agenda-responsivo'].arquivos).toEqual(AGENDA_COM_API);
  });

  it.each(LICOES)('%s abre com toda meta por fazer, e cada uma diz por quê', async l => {
    const ctx = await conferirNoJsdom(l, LICOES_REACT_DA_CC_FE007[l].arquivos);
    for (const m of LICOES_REACT_DA_CC_FE007[l].metas) {
      expect(m.feita(ctx), `${l}/${m.id} abriu verde`).toBe(false);
      expect(m.motivo?.(ctx), `${l}/${m.id} sem motivo`).toBeTruthy();
    }
  }, 90000);

  it.each(LICOES)('%s se fecha inteira com a etapa seguinte da agenda', async l => {
    const ctx = await conferirNoJsdom(l, com(l));
    expect(ctx.compilacao?.diagnosticos).toEqual([]);
    const abertas = Object.entries(feitas(l, ctx)).filter(([, v]) => !v)
      .map(([k]) => `${k}: ${LICOES_REACT_DA_CC_FE007[l].metas.find(m => m.id === k)!.motivo?.(ctx)}`);
    expect(abertas).toEqual([]);
  }, 90000);
});

describe('os caminhos errados da agenda', () => {
  it('a tela do evento que não lê o endereço acerta o clique e erra quem chega digitando', async () => {
    const semParams = AGENDA_COM_TELAS['Evento.tsx'].replace("const { id } = useParams();\n  const evento = EVENTOS.find(e => e.id === id);", "const evento = EVENTOS[1];\n  void useParams;");
    const ctx = await conferirNoJsdom('agenda-telas', com('agenda-telas', { 'Evento.tsx': semParams }));
    expect(feitas('agenda-telas', ctx)['tela-do-evento']).toBe(false);
  }, 60000);

  it('o cartão usado num lugar só não conta como reaproveitado', async () => {
    const umLugar = EVENTO_COM_COMPONENTES
      .replace("import CartaoDeEvento from './CartaoDeEvento';\n", "import { Link as L } from 'react-router-dom';\n")
      .replace('{outros.map(e => <CartaoDeEvento key={e.id} evento={e} />)}', '{outros.map(e => <p key={e.id}><L to={`/evento/${e.id}`}>{e.titulo}</L></p>)}');
    const ctx = await conferirNoJsdom('agenda-componentes', com('agenda-componentes', { 'Evento.tsx': umLugar }));
    expect(feitas('agenda-componentes', ctx).reusados).toBe(false);
  }, 60000);

  it('any nas propriedades cala o compilador e não fecha a tipagem', async () => {
    const comAny = CARTAO_DE_EVENTO.replace('  evento: Evento;', '  evento: any;').replace("import { formatarData, type Evento } from './dados';", "import { formatarData } from './dados';");
    const ctx = await conferirNoJsdom('agenda-componentes', com('agenda-componentes', { 'CartaoDeEvento.tsx': comAny }));
    expect(ctx.compilacao?.diagnosticos).toEqual([]);
    expect(feitas('agenda-componentes', ctx)['tres-componentes']).toBe(false);
  }, 60000);

  it('o erro escrito à mão aparece e não fecha — o componente já existia', async () => {
    const aMao = FERIADOS_COM_API.replace('{erro && <MensagemDeErro texto={erro} aoTentarDeNovo={buscar} />}', '{erro && <p className="erro" role="alert">{erro} <button onClick={buscar}>Tentar de novo</button></p>}')
      .replace("import MensagemDeErro from './MensagemDeErro';\n", '');
    const ctx = await conferirNoJsdom('agenda-api', com('agenda-api', { 'Feriados.tsx': aMao }));
    expect(feitas('agenda-api', ctx)).toMatchObject({ 'carregando-e-lista': true, 'erro-visivel': false });
  }, 60000);

  it('a mensagem sem o botão opcional fecha o erro e não o tentar de novo', async () => {
    const semBotao = MENSAGEM_DE_ERRO.replace('      {aoTentarDeNovo && <button onClick={aoTentarDeNovo}>Tentar de novo</button>}\n', '');
    const ctx = await conferirNoJsdom('agenda-api', com('agenda-api', { 'MensagemDeErro.tsx': semBotao }));
    expect(feitas('agenda-api', ctx)).toMatchObject({ 'erro-visivel': true, 'tentar-de-novo': false });
  }, 60000);
});

describe('a folha no celular', () => {
  it('a folha de partida passa da tela e faz três colunas no celular', () => {
    expect(largurasFixas(FOLHA_PARA_O_COMPUTADOR)).toEqual(['main { width: 960px }']);
    expect(colunasDaLista(FOLHA_PARA_O_COMPUTADOR, 375)).toBe(3);
    expect(temViewport(AGENDA_COM_API['index.html'])).toBe(false);
  });

  it('a de referência faz uma coluna no celular e três no computador', () => {
    expect(largurasFixas(FOLHA_RESPONSIVA)).toEqual([]);
    expect(colunasDaLista(FOLHA_RESPONSIVA, 375)).toBe(1);
    expect(colunasDaLista(FOLHA_RESPONSIVA, 1280)).toBe(3);
  });

  it('auto-fit com um mínimo largo também resolve, e é certo dizer que resolve', () => {
    const autoFit = FOLHA_PARA_O_COMPUTADOR.replace('width: 960px', 'max-width: 960px').replace('repeat(3, 1fr)', 'repeat(auto-fit, minmax(240px, 1fr))');
    expect(colunasDaLista(autoFit, 375)).toBe(1);
    expect(colunasDaLista(autoFit, 1280)).toBeGreaterThanOrEqual(3);
  });

  it('o @media que vale só para o computador não serve ao celular', () => {
    const aoContrario = FOLHA_RESPONSIVA.replace('@media (max-width: 700px)', '@media (min-width: 701px)');
    expect(colunasDaLista(aoContrario, 375)).toBe(3);
    expect(colunasDaLista(aoContrario, 1280)).toBe(1);
  });

  it('o menu em coluna também no computador não fecha a meta do menu', async () => {
    const sempre = FOLHA_RESPONSIVA.replace('.cabecalho {\n  display: flex;', '.cabecalho {\n  flex-direction: column;\n  display: flex;');
    const ctx = await conferirNoJsdom('agenda-responsivo', com('agenda-responsivo', { 'estilo.css': sempre }));
    expect(feitas('agenda-responsivo', ctx)['menu-no-celular']).toBe(false);
  }, 60000);
});
