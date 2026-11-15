import { getAllSpecialties, nomeDoGrupo } from '../../curriculum';
import {
  VEREDAS, codigoDaInsigniaDaVereda, licoesDaVereda,
} from '../../curriculum/veredas';
import { tiposDeLaboratorioDaTrilha, laboratoriosDaVereda, LABORATORIOS_PREVISTOS } from '../../curriculum/laboratoriosPrevistos';
import {
  INSIGNIAS, classeDaTrilha, classeDaVereda, classeDoLaboratorio, classeDoTamanhoDaVereda,
  classeDosLaboratoriosDoNivel, codigoDaInsigniaDaTrilha, insigniasDosLaboratoriosDeVereda,
} from '../insignias';
import { ESCADAS } from '../escadasDeInsignia';
import { CURIOSIDADES, ICONE_DO_TEMA, NOME_DO_TEMA, type TemaDaCuriosidade } from '../catalogoDeCuriosidades';
import { mestrados, slugDaFamilia as slug } from '../mestrados';
import { NIVEIS_DA_INSIGNIA, type NivelDaInsignia } from '../nivelDaInsignia';
import { ALTURA, LARGURA } from '../formaDaInsignia';
import { nomeCompleto } from '../../types';

/*
  O catálogo da Faixa: toda peça que ela tem lugar para receber, e onde cada
  uma mora em relação à unidade dela.

  ── Tudo sai do registro ─────────────────────────────────────────────────────
  Nenhuma peça é escrita à mão aqui. A trilha que abrir traz o patch e os
  laboratórios dela; a vereda anunciada traz o button e os laboratórios
  previstos (`laboratoriosPrevistos.ts`); a escada traz os sete degraus; a
  curiosidade nova entra no tema dela. É a regra da estante, pelo mesmo motivo:
  lista escrita à mão envelhece calada.

  ── Uma peça, uma insígnia ───────────────────────────────────────────────────
  O que acende uma peça é o código de uma insígnia: o patch da trilha acende
  com `apNNN_complete`, o button da vereda com `vereda_<id>`, o laboratório
  com o dele, o degrau com o dele. Uma pergunta só — "a pessoa tem esta
  insígnia?" — responde pela Faixa inteira, e não há segunda conta que possa
  discordar da estante. O laboratório previsto não tem código ainda: o lugar
  dele existe, e fica vazio até a lição existir.

  ── O desenho é o mesmo para todo mundo ──────────────────────────────────────
  Este catálogo não lê nada da pessoa: tamanho, giro e lugar de cada peça saem
  do código dela, sem exceção: todo lugar existe para todo mundo.
*/

export type Material = 'patch' | 'button' | 'button-aureo' | 'pin' | 'pin-curioso';
export type Zona = 'trilhas' | 'escadas' | 'curiosidades' | 'veredas';

export interface PecaDaFaixa {
  /** Único na Faixa: o código da insígnia, ou `previsto:<percurso>:<n>`. */
  id: string;
  /** A insígnia que acende a peça. Ausente no laboratório previsto. */
  insignia?: string;
  material: Material;
  /** Polígono da classe, nos pins de classe. */
  classe?: NivelDaInsignia;
  /** O glifo do pin de classe e do pin provisório da curiosidade. */
  icone?: string;
  nome: string;
  descricao: string;
  /** Tamanho de desenho, em pixels da Faixa a 520 de altura. */
  w: number;
  h: number;
  /** Onde a arte mora, para patch, button e pin recortado. */
  arte?: string;
  /** O percurso anunciado: o lugar existe e diz "em breve". */
  emBreve?: boolean;
  /** Segredo: antes de achado, só a dica aparece. */
  dica?: string;
  /** O código do currículo cujo Token.Web() a peça abre. */
  token?: string;
  /** Rótulo do lugar vazio — o código do percurso, escrito a giz. */
  rotulo?: string;
}

/** Uma peça no lugar dela dentro da unidade. */
export interface PecaNaUnidade extends PecaDaFaixa {
  dx: number;
  dy: number;
  giro: number;
}

export interface UnidadeDaFaixa {
  chave: string;
  pecas: PecaNaUnidade[];
  /** Folga a mais entre esta unidade e as vizinhas. */
  respiro?: number;
  /** O Mestrado fecha a família: procura lugar a partir do fim dela. */
  fecha?: boolean;
}

export interface GrupoDaFaixa {
  nome: string;
  zona: Zona;
  /** Quanto o grupo pode entrar no fim do anterior, para as bordas se encaixarem. */
  encaixe: number;
  /** Espaço que o grupo deixa depois de si, antes da zona seguinte. */
  folgaDepois?: number;
  unidades: UnidadeDaFaixa[];
}

/* ── O sorteio que se repete ─────────────────────────────────────────────── */

/**
 * O mesmo texto dá sempre a mesma sequência. É o que faz a Faixa ser igual
 * para todo mundo e nenhuma peça mudar de lugar quando outra é conquistada.
 */
export function semente(texto: string): () => number {
  let h = 2166136261;
  for (const ch of texto) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => {
    h += 0x6D2B79F5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── Tamanhos (P0) ───────────────────────────────────────────────────────── */

/** O pin cresce com a classe: Amigo 30 de altura, até o Líder com 60, metade de um button. */
export const alturaDoPin = (c: NivelDaInsignia) => 30 + 5 * NIVEIS_DA_INSIGNIA.indexOf(c);
const larguraDoPin = (c: NivelDaInsignia) => alturaDoPin(c) * LARGURA / ALTURA;

const PATCH = { w: 190, h: Math.round(190 * 558 / 710) };
const BUTTON = 114;
const BUTTON_DE_PROJETO = 148;
const PHI = 1.618;
const MESTRADO = { w: 150, h: Math.round(150 / PHI) };
/* A arte oficial do ME006 tem 965 × 709. */
const ME006 = { w: 196, h: Math.round(196 * 709 / 965) };
const CURIOSIDADE = 52;

const ARTE = {
  emblema: (codigo: string) => `assets/specialties/${codigo}.png`,
  mestrado: (codigo: string) => `assets/mestrados/${codigo}.png`,
  pin: (codigo: string) => `assets/pins/${codigo}.png`,
};

/* ── Os satélites: os laboratórios em anel em volta da peça ──────────────── */

interface Satelite { id: string; insignia?: string; nome: string; classe: NivelDaInsignia }

/**
 * O anel fica a dez pixels da borda da peça, e alarga sozinho quando os pins
 * não cabem na volta — doze laboratórios em volta de um button pequeno
 * ficariam encavalados.
 */
function anel(rx: number, ry: number, satelites: Satelite[], de: string, inicio: number): PecaNaUnidade[] {
  if (satelites.length === 0) return [];
  const sorte = semente('sat' + de);
  const maior = satelites.reduce((m, s) => Math.max(m, alturaDoPin(s.classe)), 0);
  const largura = satelites.reduce((m, s) => Math.max(m, larguraDoPin(s.classe)), 0);
  const precisa = (satelites.length * largura * 1.2) / (2 * Math.PI);
  const ax = Math.max(rx + maior / 2 + 10, precisa);
  const ay = Math.max(ry + maior / 2 + 10, precisa);
  return satelites.map((s, i) => {
    const a = (inicio + i * 360 / satelites.length + (sorte() * 10 - 5)) * Math.PI / 180;
    return {
      id: s.id, insignia: s.insignia, material: 'pin', classe: s.classe, icone: 'lab',
      nome: s.nome, descricao: `Laboratório de ${de}.`,
      w: larguraDoPin(s.classe), h: alturaDoPin(s.classe),
      dx: ax * Math.cos(a), dy: ay * Math.sin(a), giro: sorte() * 20 - 10,
    };
  });
}

const giroDe = (chave: string, amplitude = 10) => semente('g' + chave)() * amplitude - amplitude / 2;

/* ── As unidades ─────────────────────────────────────────────────────────── */

const NOME_DO_LABORATORIO = new Map(INSIGNIAS.filter(i => i.code.startsWith('lab_')).map(i => [i.code, i.nome]));

function unidadesDasTrilhas(): GrupoDaFaixa[] {
  const trilhas = getAllSpecialties();
  const familias = [...new Set(trilhas.map(t => t.familia))];
  const daPlataforma = new Map(mestrados().filter(m => !m.oficial).map(m => [m.code, m]));
  return familias.map((familia, f) => {
    const unidades: UnidadeDaFaixa[] = trilhas.filter(t => t.familia === familia).map(t => {
      const de = nomeCompleto(t);
      const satelites: Satelite[] = t.emConstrucao
        ? Array.from({ length: LABORATORIOS_PREVISTOS[t.code] ?? 0 }, (_, i) => ({
          id: `previsto:${t.code}:${i + 1}`, nome: `Laboratório ${i + 1} (previsto)`, classe: classeDosLaboratoriosDoNivel(t.level),
        }))
        : tiposDeLaboratorioDaTrilha(t).map(tipo => ({
          id: `lab_${tipo}`, insignia: `lab_${tipo}`, nome: NOME_DO_LABORATORIO.get(`lab_${tipo}`) ?? tipo, classe: classeDoLaboratorio(tipo),
        }));
      return {
        chave: t.code,
        pecas: [
          {
            id: codigoDaInsigniaDaTrilha(t.code), insignia: codigoDaInsigniaDaTrilha(t.code), material: 'patch' as const,
            classe: classeDaTrilha(t.code), nome: de, descricao: `Trilha ${de}.`,
            w: PATCH.w, h: PATCH.h, arte: ARTE.emblema(t.code), emBreve: !!t.emConstrucao,
            token: t.code, rotulo: t.code, dx: 0, dy: 0, giro: giroDe(t.code),
          },
          ...anel(PATCH.w / 2, PATCH.h / 2, satelites, de, -90),
        ],
      };
    });
    const m = daPlataforma.get(`mestrado_${slug(familia)}`);
    if (m) unidades.push(unidadeDoMestrado(m.code, m.nome, m.descricao));
    /* O nome que a régua escreve é o do grupo na tela (`nomeDoGrupo`), e não o
       da família: o painel chama HM079 e HM090 de Fina Arte, e a Faixa tem de
       chamar igual. */
    return { nome: nomeDoGrupo(familia), zona: 'trilhas', encaixe: f === 0 ? 0 : 120, unidades };
  });
}

function unidadeDoMestrado(code: string, nome: string, descricao: string): UnidadeDaFaixa {
  return {
    chave: code, fecha: true,
    pecas: [{
      id: code, insignia: code, material: 'button-aureo', nome, descricao,
      w: MESTRADO.w, h: MESTRADO.h, arte: ARTE.mestrado(code), rotulo: nome,
      dx: 0, dy: 0, giro: giroDe(code),
    }],
  };
}

function grupoDoMe006(): GrupoDaFaixa {
  const m = mestrados().find(x => x.oficial)!;
  return {
    nome: 'ME006', zona: 'trilhas', encaixe: 60, folgaDepois: 60,
    unidades: [{
      chave: m.code,
      pecas: [{
        id: m.code, insignia: m.code, material: 'patch', nome: m.nome, descricao: m.descricao,
        w: ME006.w, h: ME006.h, arte: ARTE.mestrado('ME006'), token: 'ME006',
        dica: 'Sete especialidades dizem mais juntas.', dx: 0, dy: 0, giro: 3,
      }],
    }],
  };
}

/** Cacho: o Líder no meio, os outros seis em volta. */
function grupoDasEscadas(): GrupoDaFaixa {
  const unidades = ESCADAS.map(e => {
    const sorte = semente('c' + e.chave);
    const giroDoCacho = sorte() * 60;
    const pecas = e.degraus.map((d, i): PecaNaUnidade => {
      let dx = 0, dy = 0;
      if (i < e.degraus.length - 1) {
        const a = (giroDoCacho - 90 + i * 60 + sorte() * 12 - 6) * Math.PI / 180;
        const raio = 64 + sorte() * 8;
        dx = raio * Math.cos(a);
        dy = raio * Math.sin(a);
      }
      return {
        id: d.code, insignia: d.code, material: 'pin', classe: d.classe, icone: e.icone,
        nome: d.nome, descricao: d.descricao, w: larguraDoPin(d.classe), h: alturaDoPin(d.classe),
        dx, dy, giro: sorte() * 24 - 12,
      };
    });
    return { chave: 'escada-' + e.chave, respiro: 22, pecas };
  });
  return { nome: 'Escadas', zona: 'escadas', encaixe: 0, folgaDepois: 40, unidades };
}

/*
  Curiosidades: um cacho por tema, em espiral de girassol.

  A espiral foi medida para o pin redondo provisório, e a arte não é redonda:
  é deitada, em pé, e há um pin largo de propósito. Com o passo da espiral
  sozinho, os desenhos dos segredos caíram uns por cima dos outros — o mapa do
  banco tapava o crachá, a planilha tapava o terminal. Cada pin desce pela
  própria direção da espiral até a caixa dele, já girada, não encostar em
  nenhuma das que vieram antes. A ordem é a do catálogo e a semente é fixa,
  então o desenho continua o mesmo para todo mundo.
*/
const VAO_ENTRE_PINS = 4;

/** Meia largura e meia altura da caixa de uma peça girada. */
function meiaCaixaGirada(w: number, h: number, giro: number): [number, number] {
  const r = (Math.abs(giro) * Math.PI) / 180;
  return [(w * Math.cos(r) + h * Math.sin(r)) / 2, (w * Math.sin(r) + h * Math.cos(r)) / 2];
}

function gruposDasCuriosidades(): GrupoDaFaixa[] {
  const temas = [...new Set(CURIOSIDADES.map(c => c.tema))] as TemaDaCuriosidade[];
  return temas.map((tema, t) => {
    const sorte = semente('cur' + tema);
    const passo = 34;
    const postas: { dx: number; dy: number; mw: number; mh: number }[] = [];
    const pecas = CURIOSIDADES.filter(c => c.tema === tema).map((c, i): PecaNaUnidade => {
      const a = i * 2.39996 + sorte();
      const giro = sorte() * 24 - 12;
      const w = Math.round(CURIOSIDADE * (c.proporcao ?? 1)), h = CURIOSIDADE;
      const [mw, mh] = meiaCaixaGirada(w, h, giro);
      const encosta = (dx: number, dy: number) => postas.some(o =>
        Math.abs(dx - o.dx) < mw + o.mw + VAO_ENTRE_PINS && Math.abs(dy - o.dy) < mh + o.mh + VAO_ENTRE_PINS);
      let r = passo * Math.sqrt(i + 0.5);
      while (encosta(r * Math.cos(a), r * Math.sin(a))) r += 2;
      const dx = r * Math.cos(a), dy = r * Math.sin(a);
      postas.push({ dx, dy, mw, mh });
      return {
        id: c.code, insignia: c.code, material: 'pin-curioso', icone: ICONE_DO_TEMA[tema],
        nome: c.nome, descricao: c.descricao, w, h, arte: ARTE.pin(c.code),
        ...(c.dica ? { dica: c.dica } : {}),
        dx, dy, giro,
      };
    });
    return {
      nome: tema === 'calendario' ? 'Calendário' : NOME_DO_TEMA[tema], zona: 'curiosidades',
      encaixe: t === 0 ? 0 : 60, folgaDepois: t === temas.length - 1 ? 60 : 0,
      unidades: [{ chave: 'cur-' + tema, respiro: 22, pecas }],
    };
  });
}

function gruposDasVeredas(): GrupoDaFaixa[] {
  const familias = [...new Set(VEREDAS.map(v => v.familia))];
  const daPlataforma = new Map(mestrados().filter(m => !m.oficial).map(m => [m.code, m]));
  const dosLaboratorios = new Map<string, Satelite[]>();
  for (const l of insigniasDosLaboratoriosDeVereda()) {
    const lista = dosLaboratorios.get(l.veredaId) ?? [];
    lista.push({ id: l.code, insignia: l.code, nome: l.nome, classe: l.classe });
    dosLaboratorios.set(l.veredaId, lista);
  }
  return familias.map((familia, f) => {
    const unidades: UnidadeDaFaixa[] = VEREDAS.filter(v => v.familia === familia).map(v => {
      const de = nomeCompleto(v);
      const previstos = laboratoriosDaVereda(v);
      /* A anunciada ainda não tem lição: a classe sai do tamanho previsto,
         uma teoria e um laboratório por laboratório anunciado. */
      const classe = v.emConstrucao ? classeDoTamanhoDaVereda(previstos * 2) : classeDaVereda(v.id);
      const deLab = NIVEIS_DA_INSIGNIA[Math.max(0, NIVEIS_DA_INSIGNIA.indexOf(classe) - 1)];
      const satelites = dosLaboratorios.get(v.id)
        ?? Array.from({ length: previstos }, (_, i) => ({
          id: `previsto:${v.code}:${i + 1}`, nome: `Laboratório ${i + 1} (previsto)`, classe: deLab,
        }));
      const d = /^Projeto/.test(v.name) ? BUTTON_DE_PROJETO : BUTTON;
      return {
        chave: v.code,
        pecas: [
          {
            id: codigoDaInsigniaDaVereda(v.id), insignia: codigoDaInsigniaDaVereda(v.id), material: 'button' as const,
            classe, nome: de, descricao: `Vereda ${de}, com ${licoesDaVereda(v).length || previstos * 2} lições.`,
            w: d, h: d, arte: ARTE.emblema(v.code), emBreve: !!v.emConstrucao, token: v.code, rotulo: v.code,
            dx: 0, dy: 0, giro: giroDe(v.code),
          },
          ...anel(d / 2, d / 2, satelites, de, -90 + semente('i' + v.code)() * 40),
        ],
      };
    });
    const m = daPlataforma.get(`mestrado_${slug(familia)}`);
    if (m) unidades.push(unidadeDoMestrado(m.code, m.nome, m.descricao));
    return { nome: familia, zona: 'veredas', encaixe: f === 0 ? 0 : 140, unidades };
  });
}

/**
 * Os grupos da Faixa, na ordem em que ela se lê: Trilhas, Escadas,
 * Curiosidades e Veredas. As zonas curtas vêm primeiro, porque as veredas são
 * mais da metade da Faixa e na frente elas empurrariam as outras para depois
 * de dez telas.
 */
export function gruposDaFaixa(): GrupoDaFaixa[] {
  return [
    ...unidadesDasTrilhas(),
    grupoDoMe006(),
    grupoDasEscadas(),
    ...gruposDasCuriosidades(),
    ...gruposDasVeredas(),
  ];
}
