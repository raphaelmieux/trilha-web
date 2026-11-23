import type { Diagnostico } from './compiladorTs';
import { comoOTscEscreve } from './compiladorTs';
import type { ResultadoDoReact } from './compiladorReact';
import { comBastidor, type Arquivos } from './paginaViva';
import { montarPaginaDeReact, type Biblioteca } from './paginaDeReact';
import { AGENDA_RESPONSIVA, CARTAO_DE_EVENTO } from './agendaDoClube';

/**
 * A publicação da agenda: o repositório, a esteira que constrói e o site que
 * sai no endereço público. É o requisito 4 da CC-FE007.
 *
 * ── Por que o GitHub Pages ───────────────────────────────────────────────
 * É o que a própria Trilha.Web() usa, e é de graça para quem tem um
 * repositório público. E traz as duas armadilhas que todo mundo encontra no
 * primeiro site de React publicado, e que nenhuma das veredas anteriores teve
 * como mostrar, porque elas acontecem **longe** do computador de quem
 * escreveu:
 *
 *  — **o build é mais exigente que o `npm run dev`.** O Vite serve a página
 *    com erro de tipo, e a CC-FE006 ensinou isso. O `npm run build` do modelo
 *    do Vite começa com `tsc -b`, e o erro de tipo que passou meses calado
 *    derruba a publicação inteira;
 *  — **o site não mora na raiz do endereço.** Ele mora em
 *    `pioneiros.github.io/agenda-do-clube/`, e o `index.html` construído com
 *    a base de fábrica pede `/assets/index-…js` na raiz do servidor, onde não
 *    há nada. A página abre **em branco**, sem erro nenhum na tela — só o 404
 *    no console. Conserta-se com `base` no `vite.config.ts`.
 *
 * E uma terceira, que é de configuração: publicar "a partir de um ramo"
 * entrega os arquivos do repositório como estão, e o navegador recebe um
 * `index.html` pedindo `/main.tsx`, que ele não sabe rodar. O site de React
 * se publica pela esteira, que constrói antes.
 *
 * Nada aqui fala com o GitHub de verdade: o repositório, a esteira e o site
 * são simulados, e o site publicado é a mesma página viva da CC-FE006.
 */

export const DONO = 'pioneiros';
export const REPOSITORIO = 'agenda-do-clube';
export const ENDERECO_DO_SITE = `https://${DONO}.github.io/${REPOSITORIO}/`;
export const BASE_CERTA = `/${REPOSITORIO}/`;

export type FonteDoPages = 'nenhuma' | 'ramo' | 'acoes';

export const VITE_CONFIG_DE_FABRICA = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
});
`;

export const VITE_CONFIG_COM_BASE = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: '${BASE_CERTA}',
  plugins: [react()],
});
`;

export const PACKAGE_JSON = `{
  "name": "${REPOSITORIO}",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.30.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.8"
  }
}
`;

export const ESTEIRA = `# Constrói o site e o publica no GitHub Pages a cada envio ao ramo main.
name: Publicar no Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  publicar:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
`;

/**
 * O erro de tipo que ficou para trás: `evento.lugar`, que não existe. No
 * `npm run dev` a página abre — o cartão mostra a data e um traço, e o local
 * some em silêncio. O build recusa.
 */
export const CARTAO_COM_ERRO = CARTAO_DE_EVENTO.replace('{evento.local}</p>', '{evento.lugar}</p>');

/** O repositório como a lição o recebe: a agenda do módulo 5, o erro esquecido e a configuração de fábrica. */
export const REPOSITORIO_DE_PARTIDA: Arquivos = {
  ...AGENDA_RESPONSIVA,
  'CartaoDeEvento.tsx': CARTAO_COM_ERRO,
  'vite.config.ts': VITE_CONFIG_DE_FABRICA,
  'package.json': PACKAGE_JSON,
  '.github/workflows/publicar.yml': ESTEIRA,
};

export const EDITAVEIS_DO_REPOSITORIO = Object.keys(REPOSITORIO_DE_PARTIDA)
  .filter(n => (n.endsWith('.tsx') && n !== 'main.tsx') || n === 'vite.config.ts');

/** A base que o `vite.config.ts` declara; `/` quando não declara nenhuma, que é a de fábrica. */
export function lerBase(config: string): string {
  const semComentario = config.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const m = /\bbase\s*:\s*(['"`])([^'"`]*)\1/.exec(semComentario);
  return m ? m[2] : '/';
}

/** Os arquivos que vão para o compilador: os de código, sem a configuração do repositório. */
export const fontesDoSite = (repo: Arquivos): Arquivos => Object.fromEntries(Object.entries(repo)
  .filter(([n]) => !n.startsWith('.github/') && n !== 'package.json' && n !== 'vite.config.ts'));

/** Um resumo curto e estável de um texto — é o pedaço do nome do arquivo que o Vite gera. */
export function resumo(texto: string): string {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) { h ^= texto.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36).padStart(7, '0').slice(0, 8);
}

export interface Publicacao {
  id: number;
  /** O envio que disparou: a mensagem do commit. */
  mensagem: string;
  fonte: FonteDoPages;
  ok: boolean;
  log: string[];
  /** A base com que o site foi construído; `null` quando nada foi construído. */
  base: string | null;
  /** O nome do arquivo de JavaScript que o `index.html` construído pede. */
  arquivoJs: string | null;
  /** Os arquivos do repositório naquele envio. */
  arquivos: Arquivos;
}

/**
 * Roda a esteira sobre o repositório: `npm ci`, `npm run build` — que começa
 * pelo `tsc -b` — e a publicação. `diagnosticos` são os da compilação dos
 * fontes do repositório; com qualquer um deles, o `tsc` sai com erro e nada é
 * publicado. Publicar a partir de um ramo não constrói nada: entrega os
 * arquivos como estão.
 */
export function rodarAEsteira(id: number, mensagem: string, repo: Arquivos, fonte: FonteDoPages, diagnosticos: Diagnostico[]): Publicacao {
  const base = { id, mensagem, fonte, arquivos: repo };
  if (fonte === 'nenhuma') {
    return { ...base, ok: false, base: null, arquivoJs: null, log: ['O GitHub Pages não está ligado neste repositório. Ligue-o em Configurações › Pages.'] };
  }
  if (fonte === 'ramo') {
    return {
      ...base, ok: true, base: null, arquivoJs: null,
      log: [
        'pages build and deployment',
        'Publicando o ramo main, pasta / (raiz), como está.',
        `Publicado em ${ENDERECO_DO_SITE}`,
      ],
    };
  }
  const log = [
    'Run actions/checkout@v4',
    'Run actions/setup-node@v4',
    'Run npm ci',
    'added 211 packages, and audited 212 packages in 9s',
    'Run npm run build',
    `> ${REPOSITORIO}@0.0.0 build`,
    '> tsc -b && vite build',
  ];
  if (diagnosticos.length > 0) {
    return {
      ...base, ok: false, base: null, arquivoJs: null,
      log: [
        ...log,
        ...diagnosticos.map(comoOTscEscreve),
        '',
        `Found ${diagnosticos.length} error${diagnosticos.length === 1 ? '' : 's'}.`,
        'Error: Process completed with exit code 2.',
      ],
    };
  }
  const baseDoSite = lerBase(repo['vite.config.ts'] ?? VITE_CONFIG_DE_FABRICA);
  const arquivoJs = `assets/index-${resumo(JSON.stringify(fontesDoSite(repo)))}.js`;
  const css = `assets/index-${resumo(repo['estilo.css'] ?? '')}.css`;
  return {
    ...base, ok: true, base: baseDoSite, arquivoJs,
    log: [
      ...log,
      'vite v5.4.8 building for production...',
      `✓ ${Object.keys(fontesDoSite(repo)).length + 37} modules transformed.`,
      'dist/index.html                    0.46 kB',
      `dist/${css}       1.32 kB`,
      `dist/${arquivoJs}       182.40 kB`,
      '✓ built in 2.14s',
      'Run actions/upload-pages-artifact@v3',
      'Run actions/deploy-pages@v4',
      `Publicado em ${ENDERECO_DO_SITE}`,
    ],
  };
}

/** O site funciona: construído pela esteira, com a base onde ele mora. */
export const siteFunciona = (p: Publicacao | undefined) => !!p && p.ok && p.fonte === 'acoes' && p.base === BASE_CERTA;

/** A página em branco, com o 404 no console — o que o navegador vê quando o JavaScript não chega. */
function paginaEmBranco(titulo: string, falta: string): string {
  const corpo = `<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${titulo}</title></head><body><div id="root"></div></body></html>`;
  return comBastidor(corpo, { offline: false })
    .replace('</body>', `<script data-trilha-interno>console.error(${JSON.stringify(`Failed to load resource: the server responded with a status of 404 () — https://${DONO}.github.io${falta}`).replace(/</g, '\\u003c')});</script></body>`);
}

/**
 * O que o navegador recebe em `ENDERECO_DO_SITE`, para uma publicação.
 *
 * O site que funciona é a página viva com o projeto compilado. Os dois que
 * não funcionam são **em branco**, que é o sintoma de verdade e o que faz
 * essa armadilha custar tanto: nada na tela diz o que houve, e a resposta
 * está no console.
 */
export function paginaDoSite(p: Publicacao | undefined, compilado: ResultadoDoReact | null, bibliotecas: Biblioteca[]): string | null {
  if (!p || !p.ok) return null;
  if (p.fonte === 'ramo') return paginaEmBranco('Agenda do Clube', `/main.tsx`);
  if (p.base !== BASE_CERTA) return paginaEmBranco('Agenda do Clube', `${(p.base ?? '/').replace(/\/?$/, '/')}${p.arquivoJs}`);
  if (!compilado) return null;
  return montarPaginaDeReact(fontesDoSite(p.arquivos), compilado, { bibliotecas });
}


/* ────────────────────────────────────────────────────────────────────────
   As tarefas
   ──────────────────────────────────────────────────────────────────────── */

export interface VisitaAoSite {
  /** A publicação que estava no ar. */
  publicacao: number;
  /** O pedaço do endereço depois do #. */
  endereco: string;
}

export interface ContextoDaHospedagem {
  repositorio: Arquivos;
  fonte: FonteDoPages;
  publicacoes: Publicacao[];
  visitas: VisitaAoSite[];
}

export const contextoDaHospedagem = (): ContextoDaHospedagem => ({
  repositorio: { ...REPOSITORIO_DE_PARTIDA }, fonte: 'nenhuma', publicacoes: [], visitas: [],
});

export interface MetaDaHospedagem {
  id: string;
  titulo: string;
  passos: string[];
  feita: (c: ContextoDaHospedagem) => boolean;
  motivo: (c: ContextoDaHospedagem) => string | undefined;
}

const ultima = (c: ContextoDaHospedagem) => c.publicacoes[c.publicacoes.length - 1];

/** O atalho que todo mundo tenta com o build vermelho: calar o compilador em vez de consertar. */
export const caladoNoRepositorio = (repo: Arquivos) => Object.entries(repo)
  .filter(([n]) => n.endsWith('.tsx'))
  .some(([, t]) => /@ts-(ignore|nocheck|expect-error)|:\s*any\b|\bas\s+any\b/.test(t));

const visitouNoSiteBom = (c: ContextoDaHospedagem, teste: (endereco: string) => boolean) =>
  c.visitas.some(v => siteFunciona(c.publicacoes.find(p => p.id === v.publicacao)) && teste(v.endereco));

export const METAS_DA_HOSPEDAGEM: MetaDaHospedagem[] = [
  {
    id: 'pela-esteira',
    titulo: 'O Pages publica pela esteira, que constrói antes',
    passos: [
      'Em Configurações › Pages, a origem pode ser um ramo ou o GitHub Actions.',
      'Um ramo entrega os arquivos como estão — o index.html pedindo /main.tsx, que o navegador não roda.',
      'Escolha GitHub Actions: a esteira publicar.yml constrói com npm run build e publica a pasta dist.',
    ],
    feita: c => c.fonte === 'acoes' && c.publicacoes.some(p => p.fonte === 'acoes'),
    motivo: c => (c.fonte === 'ramo' ? 'A origem do Pages é o ramo main: o site sai sem ser construído.'
      : c.fonte === 'nenhuma' ? 'O Pages ainda não está ligado.' : 'A esteira ainda não rodou nenhuma vez — envie uma mudança ou rode de novo em Ações.'),
  },
  {
    id: 'build-sem-erro',
    titulo: 'O build passa — consertando o erro, e não calando o compilador',
    passos: [
      'Abra o registro da execução vermelha em Ações e ache a linha do erro: o arquivo, a linha e o TS.',
      'No npm run dev a página abria mesmo com ele, e foi por isso que ninguém viu. O build começa com tsc -b, e recusa.',
      'Conserte no arquivo, em Código, e confirme a alteração: a esteira roda sozinha a cada envio.',
      'any e @ts-ignore fazem o build passar sem consertar nada — o local continua sumindo do cartão.',
    ],
    feita: c => !!ultima(c) && ultima(c).ok && ultima(c).fonte === 'acoes' && !caladoNoRepositorio(ultima(c).arquivos),
    motivo: c => {
      const u = ultima(c);
      if (!u) return 'Nenhuma publicação ainda.';
      if (caladoNoRepositorio(u.arquivos)) return 'O build passou com any ou @ts-ignore: o compilador foi calado, e o erro continua lá.';
      if (!u.ok) return 'A última execução da esteira ficou vermelha. O motivo está no registro dela, em Ações.';
      return 'A última publicação não passou pela esteira.';
    },
  },
  {
    id: 'base-certa',
    titulo: 'O site abre no endereço dele, e não em branco',
    passos: [
      `O site mora em ${ENDERECO_DO_SITE}, e não na raiz do servidor.`,
      'Com a base de fábrica, o index.html construído pede /assets/… na raiz, onde não há nada: a página abre em branco, e o 404 aparece só no console.',
      `No vite.config.ts, acrescente base: '${BASE_CERTA}' e confirme: a esteira constrói de novo.`,
    ],
    feita: c => siteFunciona(ultima(c)),
    motivo: c => {
      const u = ultima(c);
      if (!u || !u.ok || u.fonte !== 'acoes') return 'Primeiro a esteira precisa construir e publicar.';
      return `O site foi construído com a base ${u.base} e mora em ${BASE_CERTA}: o navegador procura o JavaScript no lugar errado.`;
    },
  },
  {
    id: 'link-publico',
    titulo: 'Pelo link público, as três telas funcionam',
    passos: [
      'Abra o site publicado e ande por ele: a lista dos eventos, a tela de um evento e a dos feriados.',
      'É por esse link que o examinador vai abrir a agenda — no computador dele, e no celular.',
    ],
    feita: c => visitouNoSiteBom(c, e => e === '' || e === '#/')
      && visitouNoSiteBom(c, e => /^#\/evento\/[^/]+$/.test(e))
      && visitouNoSiteBom(c, e => e === '#/feriados'),
    motivo: c => (!siteFunciona(ultima(c)) ? 'O site publicado ainda não funciona.'
      : 'Visite no site publicado o início, a tela de um evento e a dos feriados.'),
  },
];
