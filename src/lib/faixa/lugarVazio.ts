import { getSpecialty } from '../../curriculum';
import { getVereda, codigoDaInsigniaDaVereda } from '../../curriculum/veredas';
import { ESCADAS, EDICAO_ANTIGA } from '../escadasDeInsignia';
import { codigoDaInsigniaDaTrilha } from '../insignias';
import { mestrados } from '../mestrados';
import { CLASSES } from '../nivelDaInsignia';
import { nomeCompleto } from '../../types';
import type { PecaPosta } from './empacotarFaixa';

/*
  O que um lugar vazio da Faixa diz a quem clica nele.

  A peça acesa abre o que ela rendeu — o Token.Web() emoldurado ou a
  explicação da insígnia. O lugar vazio abria nada, e a Faixa inteira é feita
  de lugares vazios: seiscentos contornos de giz com um código escrito, e
  nenhum jeito de saber o que pôr ali. Um quadro de metas que não diz qual é a
  meta é só um desenho.

  ── O que cada lugar responde ─────────────────────────────────────────────
  As duas perguntas de quem olha um contorno são "o que é isto?" e "como eu
  ponho isto aqui?". O nome, a classe e a família respondem à primeira; à
  segunda, a frase do catálogo — a mesma que a peça acesa mostra como "o que
  rendeu", porque o que se pede e o que se ganhou são o mesmo feito — e,
  quando há para onde ir, o caminho: a trilha, a vereda, ou o que falta de um
  Mestrado.

  ── O segredo continua segredo ────────────────────────────────────────────
  O lugar vazio do segredo diz a dica, e nada mais: nem o nome, nem a forma,
  nem a família. O nome é a resposta, e é a regra que a Faixa já desenha — o
  "?" de giz é do mesmo tamanho para todo segredo, inclusive o ME006.

  ── E não promete o que ninguém mais ganha ────────────────────────────────
  A edição antiga não tem lugar vazio na estante. Na Faixa ela aparece inteira
  para quem tem uma; o lugar das outras diz que elas não se ganham mais, em
  vez de pedir um feito que nenhuma regra concede.
*/

export interface PassoDoMestrado {
  nome: string;
  feito: boolean;
}

export interface LugarVazio {
  /** O nome da peça; no segredo, "Segredo". */
  titulo: string;
  /** Classe e família, ou o tipo da peça, numa linha. */
  subtitulo: string;
  /** Como se conquista. */
  como: string;
  /** Dica do segredo — o único texto que ele mostra. */
  dica?: string;
  /** O percurso ainda está sendo escrito. */
  emBreve?: boolean;
  /** Os percursos que fecham um Mestrado, com o que já foi feito. */
  passos?: PassoDoMestrado[];
  /** Para onde ir. */
  caminho?: { para: string; rotulo: string };
}

const familiaDaEscada = (code: string) => ESCADAS.find(e => e.degraus.some(d => d.code === code));

/** O caminho até uma trilha ou vereda pelo código; nenhum, se ela ainda não abriu. */
function caminhoDoPercurso(codigo: string): LugarVazio['caminho'] {
  const trilha = getSpecialty(codigo);
  if (trilha && !trilha.emConstrucao) return { para: `/especialidade/${trilha.code}`, rotulo: `Abrir ${nomeCompleto(trilha)}` };
  const vereda = getVereda(codigo);
  if (vereda && !vereda.emConstrucao) return { para: `/vereda/${vereda.code}`, rotulo: `Abrir ${nomeCompleto(vereda)}` };
  return undefined;
}

export function explicarLugarVazio(p: PecaPosta, conquistadas: ReadonlySet<string>): LugarVazio {
  if (p.dica) {
    return {
      titulo: 'Segredo', subtitulo: 'Ainda não achado',
      como: 'Os segredos não dizem o que são: a dica é tudo o que se sabe antes de achá-los.',
      dica: p.dica,
    };
  }

  const classe = p.classe ? CLASSES[p.classe].nome : undefined;
  const comClasse = (resto: string) => (classe ? `${classe} · ${resto}` : resto);

  if (EDICAO_ANTIGA.some(x => x.code === p.insignia)) {
    return {
      titulo: p.nome, subtitulo: comClasse('Edição antiga'),
      como: 'Este era o topo da escada antes de ela ir até o fim da plataforma. Não se ganha mais: quem a tem continua com ela.',
    };
  }

  /* O Mestrado: a família inteira, com o que já está feito. É o único lugar
     em que a resposta a "como eu ponho isto aqui?" é uma lista, e escondê-la
     mandaria a pessoa contar as peças da família na própria Faixa. */
  const mestrado = mestrados().find(m => m.code === p.insignia);
  if (mestrado) {
    const passos: (PassoDoMestrado & { emBreve: boolean })[] = [
      ...mestrado.trilhas.map(code => {
        const t = getSpecialty(code);
        return { nome: t ? nomeCompleto(t) : code, feito: conquistadas.has(codigoDaInsigniaDaTrilha(code)), emBreve: !!t?.emConstrucao };
      }),
      ...mestrado.veredas.map(id => {
        const v = getVereda(id);
        return { nome: v ? nomeCompleto(v) : id, feito: conquistadas.has(codigoDaInsigniaDaVereda(id)), emBreve: !!v?.emConstrucao };
      }),
    ];
    const feitos = passos.filter(x => x.feito).length;
    const deQue = mestrado.trilhas.length > 0 ? 'trilhas' : 'veredas';
    const como = mestrado.oficial
      ? `Concluir nesta plataforma ${mestrado.minimo} das ${passos.length} trilhas da lista oficial do Mestrado em Ciência e Tecnologia. Você tem ${feitos}.`
      : `Concluir todas as ${passos.length} ${deQue} da família. Você tem ${feitos}.`;
    return {
      titulo: p.nome,
      subtitulo: mestrado.oficial ? 'Mestrado oficial' : 'Mestrado da plataforma',
      como,
      emBreve: passos.some(x => x.emBreve),
      passos: passos.map(({ nome, feito }) => ({ nome, feito })),
    };
  }

  if (p.material === 'patch' || p.material === 'button') {
    const tipo = p.material === 'patch' ? 'Trilha' : 'Vereda';
    return {
      titulo: p.nome, subtitulo: comClasse(tipo),
      como: p.emBreve
        ? `Esta ${tipo.toLowerCase()} ainda está sendo escrita. O lugar dela já está reservado na sua faixa.`
        : `Concluir a ${tipo.toLowerCase()} inteira. A peça é costurada aqui, e o Token.Web() sai junto.`,
      emBreve: p.emBreve,
      caminho: p.token ? caminhoDoPercurso(p.token) : undefined,
    };
  }

  /* O satélite: o laboratório mora na unidade da trilha ou da vereda dele, e
     o código da unidade é o do percurso. */
  if (p.icone === 'lab' && p.material === 'pin' && !familiaDaEscada(p.insignia ?? '')) {
    const caminho = caminhoDoPercurso(p.unidade);
    if (!p.insignia) {
      return {
        titulo: p.nome, subtitulo: comClasse('Laboratório previsto'),
        como: `${p.descricao.replace(/\.$/, '')}. A lição ainda está sendo escrita, e o lugar dela já está reservado.`,
        emBreve: true,
      };
    }
    return {
      titulo: p.nome, subtitulo: comClasse('Laboratório'),
      como: `Vencer este laboratório, em ${p.descricao.replace(/^Laboratório de /, '').replace(/\.$/, '')}.`,
      caminho,
    };
  }

  const escada = familiaDaEscada(p.insignia ?? '');
  if (escada) {
    const degrau = escada.degraus.findIndex(d => d.code === p.insignia) + 1;
    return {
      titulo: p.nome, subtitulo: comClasse(`${escada.familia}, degrau ${degrau} de ${escada.degraus.length}`),
      como: p.descricao,
    };
  }

  return { titulo: p.nome, subtitulo: 'Curiosidade', como: p.descricao };
}
