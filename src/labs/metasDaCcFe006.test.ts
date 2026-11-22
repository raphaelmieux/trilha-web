import { describe, it, expect } from 'vitest';
import { LICOES_DA_CC_FE006, type ContextoDoReact, type LicaoDaCcFe006 } from './metasDaCcFe006';
import { REFERENCIAS_DA_CC_FE006, TAREFAS_COM_INDICE, EFEITO_SEM_DEPENDENCIAS } from './referenciasDaCcFe006';
import { conferirNoJsdom } from './reactNoJsdom';

/*
  As metas da CC-FE006, conferidas com o React de verdade rodando no jsdom.

  Três coisas para cada lição: abre com tudo por fazer, a solução de
  referência fecha tudo, e o caminho errado que a lição existe para mostrar
  deixa a meta dele vermelha — porque uma meta que aprova o errado é pior do
  que meta nenhuma.
*/

const LICOES = Object.keys(LICOES_DA_CC_FE006) as LicaoDaCcFe006[];
const comReferencia = (l: LicaoDaCcFe006, troca: Record<string, string> = {}) =>
  ({ ...LICOES_DA_CC_FE006[l].arquivos, ...REFERENCIAS_DA_CC_FE006[l].arquivos, ...troca });
const feitas = (l: LicaoDaCcFe006, ctx: ContextoDoReact) =>
  Object.fromEntries(LICOES_DA_CC_FE006[l].metas.map(m => [m.id, m.feita(ctx)]));

describe('as metas da CC-FE006', () => {
  it('são nove lições, cada uma com pelo menos três metas e passo a passo em todas', () => {
    expect(LICOES).toHaveLength(9);
    for (const l of LICOES) {
      expect(LICOES_DA_CC_FE006[l].metas.length).toBeGreaterThanOrEqual(3);
      for (const m of LICOES_DA_CC_FE006[l].metas) expect(m.passos.length, `${l}/${m.id}`).toBeGreaterThan(0);
    }
  });

  it.each(LICOES)('%s abre com toda meta por fazer, e cada uma diz por quê', async l => {
    const ctx = await conferirNoJsdom(l, LICOES_DA_CC_FE006[l].arquivos);
    for (const m of LICOES_DA_CC_FE006[l].metas) {
      expect(m.feita(ctx), `${l}/${m.id} abriu verde`).toBe(false);
      expect(m.motivo?.(ctx), `${l}/${m.id} sem motivo`).toBeTruthy();
    }
  }, 60000);

  it.each(LICOES)('%s se fecha inteira com a solução de referência', async l => {
    const ctx = await conferirNoJsdom(l, comReferencia(l));
    expect(ctx.compilacao?.diagnosticos).toEqual([]);
    const f = feitas(l, ctx);
    const abertas = Object.entries(f).filter(([, v]) => !v).map(([k]) => `${k}: ${LICOES_DA_CC_FE006[l].metas.find(m => m.id === k)!.motivo?.(ctx)}`);
    expect(abertas).toEqual([]);
  }, 60000);

  it('sem conferir, nenhuma meta de página fecha', async () => {
    const ctx = await conferirNoJsdom('estado', comReferencia('estado'));
    const semConferir = { ...ctx, cenarios: null };
    for (const m of LICOES_DA_CC_FE006.estado.metas) expect(m.feita(semConferir)).toBe(false);
  }, 60000);
});

describe('os caminhos errados', () => {
  it('a lista montada pelo document desenha certo e não fecha', async () => {
    const ctx = await conferirNoJsdom('declarar', LICOES_DA_CC_FE006.declarar.arquivos);
    expect(ctx.cenarios?.mural.leituras.avisos).toEqual(['Reunião no sábado às 9h', 'Trazer o lenço da unidade', 'Inscrições do campori até dia 20']);
    expect(feitas('declarar', ctx)['lista-no-jsx']).toBe(false);
  }, 60000);

  it('a lista sem key fecha o desenho e não a chave', async () => {
    const semChave = REFERENCIAS_DA_CC_FE006.declarar.arquivos['App.tsx'].replace(' key={aviso.id}', '');
    const ctx = await conferirNoJsdom('declarar', comReferencia('declarar', { 'App.tsx': semChave }));
    expect(feitas('declarar', ctx)).toMatchObject({ 'lista-no-jsx': false, 'total-no-jsx': true });
  }, 60000);

  it('class no lugar de className deixa o painel de Problemas apontando', async () => {
    const comClass = REFERENCIAS_DA_CC_FE006.declarar.arquivos['App.tsx'].replace('className="titulo"', 'class="titulo"');
    const ctx = await conferirNoJsdom('declarar', comReferencia('declarar', { 'App.tsx': comClass }));
    expect(ctx.compilacao?.diagnosticos[0]?.mensagem).toMatch(/className/);
    expect(feitas('declarar', ctx).classname).toBe(false);
  }, 60000);

  it('o cartão que importa os dados sozinho desenha a Ipê e não fecha', async () => {
    const sozinho = `import { ipe } from './dados';

interface Props { nome?: string }

export default function CartaoDaUnidade(_: Props) {
  return (
    <article className="cartao">
      <h2>{ipe.nome}</h2>
      <p className="lema">{ipe.lema}</p>
      <p className="membros">{ipe.membros} {ipe.membros === 1 ? 'membro' : 'membros'}</p>
    </article>
  );
}
`;
    const ctx = await conferirNoJsdom('propriedades', comReferencia('propriedades', {
      'CartaoDaUnidade.tsx': sozinho,
      'App.tsx': REFERENCIAS_DA_CC_FE006.propriedades.arquivos['App.tsx'].replace(/<CartaoDaUnidade [^/]*\/>/, '<CartaoDaUnidade />'),
    }));
    expect(ctx.cenarios?.outra.leituras.nome).toBe('Jatobá');
    expect(feitas('propriedades', ctx).desenha).toBe(false);
    expect(LICOES_DA_CC_FE006.propriedades.metas.find(m => m.id === 'desenha')!.motivo!(ctx)).toMatch(/importa o dados/);
  }, 60000);

  it('o quórum escrito à mão acerta o 5 e erra o 3', async () => {
    const amao = REFERENCIAS_DA_CC_FE006.estado.arquivos['App.tsx'].replace('presentes >= QUORUM &&', 'presentes >= 5 &&');
    const ctx = await conferirNoJsdom('estado', comReferencia('estado', { 'App.tsx': amao }));
    expect(feitas('estado', ctx).quorum).toBe(false);
  }, 60000);

  it('a chave na posição desenha a lista e deixa a marca pular para a vizinha', async () => {
    const ctx = await conferirNoJsdom('listas', comReferencia('listas', { 'App.tsx': TAREFAS_COM_INDICE }));
    expect(feitas('listas', ctx)).toMatchObject({ cada: true, chave: true, remove: true, marca: false });
    expect(ctx.cenarios?.marca.leituras.feitas).toEqual(['Cavar a vala em volta da barraca']);
  }, 60000);

  it('o campo sem onChange avisa no console e não fecha o controle', async () => {
    const semOnChange = REFERENCIAS_DA_CC_FE006.formulario.arquivos['App.tsx']
      .replace(' onChange={e => setUnidade(e.target.value)}', '');
    const ctx = await conferirNoJsdom('formulario', comReferencia('formulario', { 'App.tsx': semOnChange }));
    expect(feitas('formulario', ctx).controlado).toBe(false);
  }, 60000);

  it('enviar sem preventDefault recarrega a página e não fecha nada', async () => {
    const semPrevent = REFERENCIAS_DA_CC_FE006.formulario.arquivos['App.tsx'].replace('    e.preventDefault();\n', '');
    const ctx = await conferirNoJsdom('formulario', comReferencia('formulario', { 'App.tsx': semPrevent }));
    expect(ctx.cenarios?.enviar.recarregou).toBe(true);
    expect(feitas('formulario', ctx)).toMatchObject({ envia: false, limpa: false });
  }, 60000);

  it('o efeito sem dependências salva a cada letra da busca', async () => {
    const ctx = await conferirNoJsdom('efeito', comReferencia('efeito', { 'App.tsx': EFEITO_SEM_DEPENDENCIAS }));
    expect(feitas('efeito', ctx)).toMatchObject({ titulo: true, salva: true, 'so-quando-muda': false });
  }, 60000);

  it('o título escrito no corpo do componente muda certo e não fecha', async () => {
    const noCorpo = REFERENCIAS_DA_CC_FE006.efeito.arquivos['App.tsx'].replace(
      '    document.title = `(${presentes.length}) Chamada da ${UNIDADE}`;\n', '',
    ).replace('  const visiveis', '  document.title = `(${presentes.length}) Chamada da ${UNIDADE}`;\n  const visiveis');
    const ctx = await conferirNoJsdom('efeito', comReferencia('efeito', { 'App.tsx': noCorpo }));
    expect(ctx.cenarios?.chamada.leituras.t2).toBe('(2) Chamada da Ipê');
    expect(feitas('efeito', ctx).titulo).toBe(false);
  }, 60000);

  it('o detalhe que não lê o endereço acerta o clique e erra quem chega digitando', async () => {
    const semParams = REFERENCIAS_DA_CC_FE006.navegacao.arquivos['App.tsx']
      .replace('const { id } = useParams();\n  const unidade = UNIDADES_DO_CLUBE.find(u => u.id === id);', 'const unidade = UNIDADES_DO_CLUBE.find(u => u.id === \'jatoba\');\n  void useParams;');
    const ctx = await conferirNoJsdom('navegacao', comReferencia('navegacao', { 'App.tsx': semParams }));
    expect(feitas('navegacao', ctx).detalhe).toBe(false);
  }, 60000);

  it('sem conferir o resposta.ok, o 404 passa calado', async () => {
    const semOk = REFERENCIAS_DA_CC_FE006.api.arquivos['App.tsx']
      .replace('        if (!resposta.ok) throw new Error(`A API respondeu ${resposta.status}.`);\n', '');
    const ctx = await conferirNoJsdom('api', comReferencia('api', { 'App.tsx': semOk }));
    expect(feitas('api', ctx).erro).toBe(false);
  }, 60000);

  it('o fetch sem catch deixa o Uncaught (in promise) no console', async () => {
    const semCatch = REFERENCIAS_DA_CC_FE006.api.arquivos['App.tsx']
      .replace("      .catch(() => setErro('Não deu para buscar os feriados.'))\n", '');
    const ctx = await conferirNoJsdom('api', comReferencia('api', { 'App.tsx': semCatch }));
    expect(feitas('api', ctx).erro).toBe(false);
    expect(LICOES_DA_CC_FE006.api.metas.find(m => m.id === 'erro')!.motivo!(ctx)).toMatch(/Failed to fetch/);
  }, 60000);
});
