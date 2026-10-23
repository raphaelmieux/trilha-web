import { describe, expect, it } from 'vitest';
import {
  LICOES_DA_CC_DG006, ORIGENS_DE_REFERENCIA, PROPOSTA_DE_REFERENCIA, ROTEIRO_DE_REFERENCIA, VERSOES_DE_REFERENCIA,
  arquivoDaTratada, estadoDepois, metasDa, type ContextoDoProjetoDeDesign, type LicaoDaCcDg006,
} from './metasDaCcDg006';
import {
  CREDITO_DA_FOGUEIRA, MAPA_DA_ENTREGA, NOMES_DOS_FINAIS, NOME_DA_CRUA, RESPONDENTES, postAdaptado,
  postEncolhido, simboloDeReferencia,
} from './acampamentoDasFamilias';
import { PRANCHA_DO_POST, PRANCHA_DO_SIMBOLO, enviarParaAprovacao, PROPOSTA_EM_BRANCO } from './projetoDeDesign';
import { comTamanho, duplicarPrancha, excluir, mudarPrancha, type Objeto, type Prancha, type Texto } from './design';
import { exportarPdf } from './diagramacao';
import { exportar } from './formatosDeImagem';
import { imagemDo } from './raster';
import { fotoCrua } from './metasDaCcDg003';
import { mandarParaALixeira, mover } from './arquivoCompartilhado';

/*
  As nove lições da CC-DG006 contra o motor: nenhuma meta abre verde, a
  referência de cada lição fecha todas, a lição seguinte não desfaz o que a
  anterior fechou, e os caminhos rápidos e errados reprovam.

  Os caminhos errados são os que alguém tomaria fazendo o projeto pela
  primeira vez: começar antes da aprovação, apagar o clipart sem desenhar o
  seu, exportar a foto por cima do original, encolher o convite em vez de
  adaptá-lo, pôr tudo na pasta de finais, seguir todo comentário. Cada um
  deixa a tarefa dele vermelha, e só ela.
*/

const ORDEM = Object.keys(LICOES_DA_CC_DG006) as LicaoDaCcDg006[];
const feita = (l: LicaoDaCcDg006, id: string, c: ContextoDoProjetoDeDesign) => metasDa(l).find(m => m.id === id)!.feita(c);
const fim = (l: LicaoDaCcDg006) => estadoDepois(l);
const inicio = (l: LicaoDaCcDg006) => LICOES_DA_CC_DG006[l].contexto();
const comPost = (c: ContextoDoProjetoDeDesign, f: (p: Prancha) => Prancha) => ({ ...c, arte: mudarPrancha(c.arte, PRANCHA_DO_POST, f) });
const comTextoNoPost = (c: ContextoDoProjetoDeDesign, id: string, f: (t: Texto) => Texto) =>
  comPost(c, p => ({ ...p, objetos: p.objetos.map((o: Objeto) => (o.tipo === 'texto' && o.id === id ? f(o) : o)) }));

describe('as metas da CC-DG006, uma lição de cada vez', () => {
  it.each(ORDEM)('%s: nenhuma meta abre verde', l => {
    const c = inicio(l);
    expect(metasDa(l).filter(m => m.feita(c)).map(m => m.id)).toEqual([]);
  });

  it.each(ORDEM)('%s: a referência fecha todas', l => {
    const c = fim(l);
    expect(metasDa(l).filter(m => !m.feita(c)).map(m => m.id)).toEqual([]);
  });

  it('o fim do projeto ainda fecha as metas de todas as lições', () => {
    const c = fim('apresentacao');
    const abertas = ORDEM.flatMap(l => metasDa(l).filter(m => !m.feita(c)).map(m => `${l}/${m.id}`));
    expect(abertas).toEqual([]);
  });
});

describe('os caminhos errados', () => {
  it('proposta: começar antes da aprovação, "todo mundo", e a proposta incompleta que volta', () => {
    expect(feita('proposta', 'aprovada-antes', { ...fim('proposta'), comecouAntes: true })).toBe(false);
    expect(feita('proposta', 'demanda-e-publico', { ...fim('proposta'), proposta: { ...PROPOSTA_DE_REFERENCIA, publico: 'todo mundo' } })).toBe(false);
    const incompleta = enviarParaAprovacao({ ...PROPOSTA_EM_BRANCO, demanda: 'Convidar as famílias.' }, '2026-08-10');
    expect(incompleta.aprovadaEm).toBeNull();
    expect(incompleta.devolvida).toBeTruthy();
    const semDigital = { ...PROPOSTA_DE_REFERENCIA, pecas: PROPOSTA_DE_REFERENCIA.pecas.filter(p => p !== 'digital') };
    expect(feita('proposta', 'quatro-pecas', { ...fim('proposta'), proposta: semDigital })).toBe(false);
  });

  it('símbolo: apagar o clipart sem desenhar, apagar a primeira ideia, traço fino, e não olhar pequeno', () => {
    const c = inicio('simbolo');
    const soApagou = { ...c, arte: mudarPrancha(c.arte, PRANCHA_DO_SIMBOLO, p => excluir(p, ['c-clipart'])) };
    expect(feita('simbolo', 'sem-clipart', soApagou)).toBe(false);

    const semIdeia = { ...fim('simbolo'), arte: { ...fim('simbolo').arte, pranchas: fim('simbolo').arte.pranchas.filter(p => p.id !== 'simbolo-tentativa') } };
    expect(feita('simbolo', 'simbolo-seu', semIdeia)).toBe(false);

    const fino = simboloDeReferencia();
    const comTraco = { ...fino, filhos: fino.filhos.map(o => (o.tipo === 'caminho' ? { ...o, preenchimento: null, traco: { cor: '#000000', espessura: 3, extremidade: 'reta' as const } } : o)) };
    const c2 = fim('simbolo');
    expect(feita('simbolo', 'le-pequeno', { ...c2, arte: mudarPrancha(c2.arte, PRANCHA_DO_SIMBOLO, p => ({ ...p, objetos: [comTraco] })) })).toBe(false);
    expect(feita('simbolo', 'le-pequeno', { ...c2, descobertas: [] })).toBe(false);

    /* O clipart agrupado com uma forma continua sendo o clipart. */
    const comClipart = { ...fino, filhos: [...fino.filhos, { id: 'x', nome: 'clip', tipo: 'foto' as const, x: 0, y: 0, largura: 10, altura: 10, motivo: 'barracas' as const, tons: ['#000000', '#FFFFFF'] as [string, string] }] };
    expect(feita('simbolo', 'simbolo-seu', { ...c2, arte: mudarPrancha(c2.arte, PRANCHA_DO_SIMBOLO, p => ({ ...p, objetos: [comClipart] })) })).toBe(false);
  });

  it('imagens: exportar por cima do original, exportar sem tratar, licença errada, autor faltando, crédito sem licença', () => {
    const c = fim('imagens');
    const porCima = { ...c, pasta: [{ ...arquivoDaTratada(), nome: NOME_DA_CRUA }] };
    expect(feita('imagens', 'tratou-a-foto', porCima)).toBe(false);
    /* Exportar a tratada com nome novo e depois de novo por cima do original. */
    const asDuas = { ...c, pasta: [...c.pasta.filter(a => a.nome !== NOME_DA_CRUA), { ...arquivoDaTratada(), nome: NOME_DA_CRUA }] };
    expect(feita('imagens', 'tratou-a-foto', asDuas)).toBe(false);
    const semTratar = { ...c, pasta: [...inicio('imagens').pasta, { ...exportar(imagemDo(fotoCrua()), 'jpg', 'acampamento-novo.jpg', 90), original: false }] };
    expect(feita('imagens', 'tratou-a-foto', semTratar)).toBe(false);

    const livreDemais = { ...ORIGENS_DE_REFERENCIA, clipart: { licenca: 'livre' as const, autor: 'site de ícones' } };
    expect(feita('imagens', 'declarou-as-origens', { ...c, caderno: { ...c.caderno, origens: livreDemais } })).toBe(false);
    const semAutor = { ...ORIGENS_DE_REFERENCIA, acampamento: { licenca: 'propria' as const, autor: '' } };
    expect(feita('imagens', 'declarou-as-origens', { ...c, caderno: { ...c.caderno, origens: semAutor } })).toBe(false);
    expect(feita('imagens', 'escreveu-o-credito', { ...c, caderno: { ...c.caderno, credito: 'Foto de Ana Souza' } })).toBe(false);
  });

  it('impressa: a crua sangrando, a tratada parando na borda, PDF velho e PDF em RGB', () => {
    const c = fim('impressa');
    const crua = { ...c, convite: { ...c.convite, imagens: c.convite.imagens.map(q => (q.imagem === 'tratada' ? { ...q, imagem: 'acampamento' } : q)) } };
    expect(feita('impressa', 'foto-tratada-sangrando', crua)).toBe(false);
    const naBorda = { ...c, convite: { ...c.convite, imagens: c.convite.imagens.map(q => (q.imagem === 'tratada' ? { ...q, x: 0, y: 0, largura: 148, altura: 92 } : q)) } };
    expect(feita('impressa', 'foto-tratada-sangrando', naBorda)).toBe(false);

    const comOClipart = { ...c, convite: { ...c.convite, imagens: [...c.convite.imagens, inicio('impressa').convite.imagens.find(q => q.imagem === 'clipart')!] } };
    expect(feita('impressa', 'simbolo-no-convite', comOClipart)).toBe(false);
    const asDuasFotos = { ...c, convite: { ...c.convite, imagens: [...c.convite.imagens, { id: 'crua-pequena', pagina: 0, imagem: 'acampamento', x: 80, y: 162, largura: 40, altura: 26.7 }] } };
    expect(feita('impressa', 'foto-tratada-sangrando', asDuasFotos)).toBe(false);

    const antes = inicio('impressa');
    const pdfVelho = { ...c, pdfs: [exportarPdf(antes.convite, 'convite.pdf', { sangria: 3, marcasDeCorte: true, cor: 'cmyk' })] };
    expect(feita('impressa', 'pdf-da-grafica', pdfVelho)).toBe(false);
    const rgb = { ...c, pdfs: [exportarPdf(c.convite, 'convite.pdf', { sangria: 3, marcasDeCorte: true, cor: 'rgb' })] };
    expect(feita('impressa', 'pdf-da-grafica', rgb)).toBe(false);

    /* Tirar a fogueira em vez de creditá-la também resolve. */
    const semFogueira = { ...antes, convite: { ...antes.convite, imagens: antes.convite.imagens.filter(q => q.imagem !== 'fogueira') } };
    expect(feita('impressa', 'credita-a-fogueira', semFogueira)).toBe(true);
    expect(feita('impressa', 'credita-a-fogueira', { ...antes, convite: { ...antes.convite, historia: [...antes.convite.historia, { id: 'x', papel: 'legenda', estilo: 'legenda', texto: CREDITO_DA_FOGUEIRA }] } })).toBe(true);
  });

  it('digital: refazer sem guardar, folha A5, letra de 38, palavra demais, sem o lugar, clipart que fica', () => {
    const c = fim('digital');
    const semGuardar = { ...c, arte: { ...c.arte, pranchas: c.arte.pranchas.filter(p => p.id !== 'post-encolhido') } };
    expect(feita('digital', 'guardou-o-encolhido', semGuardar)).toBe(false);

    /* Duplicar depois de refazer guarda a versão nova, e não a encolhida. */
    const copiaDaNova = { ...semGuardar, arte: duplicarPrancha(semGuardar.arte, PRANCHA_DO_POST) };
    expect(feita('digital', 'guardou-o-encolhido', copiaDaNova)).toBe(false);

    const a5 = comPost(c, p => comTamanho(p, 1080, 1528));
    expect(feita('digital', 'proporcao-do-feed', a5)).toBe(false);
    expect(feita('digital', 'proporcao-do-feed', comPost(c, p => comTamanho(p, 1080, 1920)))).toBe(true);

    expect(feita('digital', 'letra-do-celular', comTextoNoPost(c, 'pa-convite', t => ({ ...t, corpo: 38 })))).toBe(false);
    const longo = comTextoNoPost(c, 'pa-convite', t => ({ ...t, texto: 'Venha passar o dia com a gente e conhecer o clube de perto, com trilha curta, almoço na fogueira, oficina de nós e a cerimônia do fim da tarde' }));
    expect(feita('digital', 'so-o-essencial', longo)).toBe(false);
    expect(feita('digital', 'so-o-essencial', comTextoNoPost(c, 'pa-lugar', t => ({ ...t, texto: 'Na chácara' })))).toBe(false);

    const comClipart = comPost(c, p => ({ ...p, objetos: [...p.objetos, postEncolhido().objetos.find(o => o.id === 'pe-clipart')!] }));
    expect(feita('digital', 'mesmo-simbolo', comClipart)).toBe(false);
    const semSimbolo = comPost(c, () => ({ ...postAdaptado(), objetos: postAdaptado().objetos.filter(o => o.tipo !== 'grupo') }));
    expect(feita('digital', 'mesmo-simbolo', semSimbolo)).toBe(false);

    /* Duplicar e só então refazer: o gesto que a lição pede, do começo. */
    const d = inicio('digital');
    const duplicada = duplicarPrancha(d.arte, PRANCHA_DO_POST);
    expect(feita('digital', 'guardou-o-encolhido', { ...d, arte: duplicada })).toBe(true);
  });

  it('processo: o mesmo motivo duas vezes, dois rascunhos, a mesma ideia três vezes', () => {
    const c = fim('processo');
    const mesmo = Object.fromEntries(Object.keys(VERSOES_DE_REFERENCIA).map(k => [k, { descartada: true, motivo: 'Não ficou bom do jeito que eu queria que ficasse.' }]));
    expect(feita('processo', 'versoes-com-motivo', { ...c, caderno: { ...c.caderno, versoes: mesmo } })).toBe(false);
    const uma = { ...VERSOES_DE_REFERENCIA, 'post-encolhido': { ...VERSOES_DE_REFERENCIA['post-encolhido'], descartada: false } };
    expect(feita('processo', 'versoes-com-motivo', { ...c, caderno: { ...c.caderno, versoes: uma } })).toBe(false);
    expect(feita('processo', 'rascunhos', { ...c, caderno: { ...c.caderno, rascunhos: c.caderno.rascunhos.slice(0, 2) } })).toBe(false);
    const repetida = Array.from({ length: 3 }, () => ({ ideia: 'Barraca com a porta aberta' }));
    expect(feita('processo', 'rascunhos', { ...c, caderno: { ...c.caderno, rascunhos: repetida } })).toBe(false);
  });

  it('arquivos: tudo em finais, versões no lixo, clipart guardado numa subpasta, final sem versão', () => {
    const c = fim('arquivos');
    let tudoNosFinais = c.nuvem;
    for (const id of Object.keys(MAPA_DA_ENTREGA)) if (id !== 'f-clipart') tudoNosFinais = mover(tudoNosFinais, id, 'pasta-finais');
    expect(feita('arquivos', 'editavel-e-final', { ...c, nuvem: tudoNosFinais })).toBe(false);

    const semVersoes = mandarParaALixeira(mandarParaALixeira(c.nuvem, 'f-post-v1'), 'f-foto-crua');
    expect(feita('arquivos', 'nada-solto', { ...c, nuvem: semVersoes })).toBe(false);

    const guardado = mover({ arquivos: c.nuvem.arquivos.map(a => (a.id === 'f-clipart' ? { ...a, naLixeira: undefined } : a)) }, 'f-clipart', 'pasta-originais');
    expect(feita('arquivos', 'clipart-fora', { ...c, nuvem: guardado })).toBe(false);

    const levouJunto = mandarParaALixeira(c.nuvem, 'f-fogueira');
    expect(feita('arquivos', 'clipart-fora', { ...c, nuvem: levouJunto })).toBe(false);

    const semVersao = { arquivos: c.nuvem.arquivos.map(a => (a.id === 'f-post-png' ? { ...a, nome: 'post-2026-09-01.png' } : a)) };
    expect(feita('arquivos', 'finais-no-padrao', { ...c, nuvem: semVersao })).toBe(false);
    expect(Object.keys(NOMES_DOS_FINAIS).length).toBe(5);
  });

  it('retorno: os sete juntos, tudo muda, a mudança que é gosto, a que é de fora, e o post que deixou de se ler', () => {
    const c = fim('retorno');
    expect(feita('retorno', 'cinco-do-publico', { ...c, caderno: { ...c.caderno, doPublico: RESPONDENTES.map(r => r.id) } })).toBe(false);
    const tudoMuda = Object.fromEntries(RESPONDENTES.map(r => [r.id, 'mudar' as const]));
    expect(feita('retorno', 'leu-cada-um', { ...c, caderno: { ...c.caderno, leitura: tudoMuda } })).toBe(false);

    for (const quem of ['renata', 'marcio', 'jorge']) {
      expect(feita('retorno', 'mudou-a-peca', { ...c, caderno: { ...c.caderno, alteracao: { ...c.caderno.alteracao, respondente: quem } } }), quem).toBe(false);
    }
    /* Registrar a da Cláudia sem mexer nas crianças: a peça não mudou no que ela pediu. */
    expect(feita('retorno', 'mudou-a-peca', { ...c, caderno: { ...c.caderno, alteracao: { ...c.caderno.alteracao, respondente: 'claudia' } } })).toBe(false);
    expect(feita('retorno', 'mudou-a-peca', { ...c, caderno: { ...c.caderno, alteracao: { ...c.caderno.alteracao, oQueMudou: 'Pus a hora.' } } })).toBe(false);
    const hora38 = comTextoNoPost(c, 'pa-data', t => ({ ...t, corpo: 38 }));
    expect(feita('retorno', 'mudou-a-peca', hora38)).toBe(false);
  });

  it('apresentação: dezesseis minutos, sem processo, e a demanda maior que as peças', () => {
    const c = fim('apresentacao');
    const com = (r: typeof ROTEIRO_DE_REFERENCIA) => ({ ...c, caderno: { ...c.caderno, roteiro: r } });
    expect(feita('apresentacao', 'cabe-em-quinze', com({ ...ROTEIRO_DE_REFERENCIA, perguntas: 3 }))).toBe(false);
    expect(feita('apresentacao', 'cabe-em-quinze', com({ ...ROTEIRO_DE_REFERENCIA, processo: 0 }))).toBe(false);
    expect(feita('apresentacao', 'pecas-no-centro', com({ ...ROTEIRO_DE_REFERENCIA, demanda: 6 }))).toBe(false);
    expect(feita('apresentacao', 'leva-a-impressa', { ...c, caderno: { ...c.caderno, levaImpressa: false } })).toBe(false);
    /* O convite mexido depois do PDF: a peça em mãos seria a de antes. */
    const mexido = { ...c, convite: { ...c.convite, sangria: 5 } };
    expect(feita('apresentacao', 'leva-a-impressa', mexido)).toBe(false);
  });
});
