/**
 * A agenda do clube: a aplicação que a CC-FE007 constrói do começo ao fim.
 *
 * ── Uma aplicação, e não uma por lição ───────────────────────────────────
 * É o arranjo do almoxarifado da CC006 e do convite da CC-DG006, pelo motivo
 * escrito lá: o requisito 3 pede **uma** aplicação, e cada etapa parte de
 * onde a anterior chegou. As versões moram aqui, e não no teste: a solução de
 * referência de uma lição é o modelo da seguinte, e o repositório das lições
 * de Git e a página publicada são feitos destas mesmas versões.
 *
 * ── O que ela é ──────────────────────────────────────────────────────────
 * Três telas — os eventos do clube, a tela de cada evento e os feriados do
 * ano, que vêm da BrasilAPI —, com três componentes usados mais de uma vez
 * (`Secao`, `CartaoDeEvento` e `MensagemDeErro`), o erro que aparece na
 * tela, e o celular tratado como tela de verdade.
 */

export interface EventoDaAgenda { id: string; titulo: string; data: string; local: string; descricao: string }

export const EVENTOS_DA_AGENDA: EventoDaAgenda[] = [
  { id: 'acampamento', titulo: 'Acampamento de inverno', data: '2026-07-10', local: 'Chácara Recanto Verde', descricao: 'Três dias de barraca, fogueira e especialidades de campo.' },
  { id: 'campori', titulo: 'Campori regional', data: '2026-08-20', local: 'Parque da Cidade', descricao: 'Todos os clubes da região, com provas por unidade.' },
  { id: 'feira', titulo: 'Feira de especialidades', data: '2026-09-19', local: 'Salão da igreja', descricao: 'Cada unidade apresenta uma especialidade para as famílias.' },
  { id: 'investidura', titulo: 'Investidura', data: '2026-11-28', local: 'Templo central', descricao: 'A cerimônia de quem completou a classe do ano.' },
];

/** Outra agenda, para a conferência: quem escreveu os eventos à mão acerta a primeira e erra esta. */
export const EVENTOS_NA_VARIANTE: EventoDaAgenda[] = [
  { id: 'mutirao', titulo: 'Mutirão do córrego', data: '2025-05-17', local: 'Córrego do Ipê', descricao: 'Limpeza das margens com as famílias.' },
  { id: 'gincana', titulo: 'Gincana da primavera', data: '2025-09-27', local: 'Quadra do colégio', descricao: 'Provas de nós, primeiros socorros e orientação.' },
  { id: 'portas', titulo: 'Dia de portas abertas', data: '2025-10-12', local: 'Sede do clube', descricao: 'A comunidade conhece o clube por dentro.' },
];

const aspas = (s: string) => `'${s.replace(/'/g, "\\'")}'`;

export const dadosDaAgenda = (eventos: EventoDaAgenda[], ano: number) => `export interface Evento {
  id: string;
  titulo: string;
  data: string;
  local: string;
  descricao: string;
}

export const EVENTOS: Evento[] = [
${eventos.map(e => `  {
    id: ${aspas(e.id)},
    titulo: ${aspas(e.titulo)},
    data: ${aspas(e.data)},
    local: ${aspas(e.local)},
    descricao: ${aspas(e.descricao)},
  },`).join('\n')}
];

// O ano dos feriados que a tela de feriados mostra.
export const ANO = ${ano};

// 2026-07-10 vira 10/07/2026.
export function formatarData(iso: string): string {
  return iso.split('-').reverse().join('/');
}
`;

export const DADOS_DA_AGENDA = dadosDaAgenda(EVENTOS_DA_AGENDA, 2026);

export const formatarData = (iso: string) => iso.split('-').reverse().join('/');

export const INDEX_DA_AGENDA = (comViewport: boolean) => `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
${comViewport ? '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' : ''}    <link rel="stylesheet" href="estilo.css" />
    <title>Agenda do Clube</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>
`;

export const MAIN_DA_AGENDA = `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </HashRouter>
  </StrictMode>,
);
`;

/* ── A folha: chega pensada para o computador, e o módulo 5 a conserta ──── */

const FOLHA_COMUM = `body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background-color: #F4F1E8;
  color: #1F2A24;
}

.cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background-color: #23402F;
  color: #FFFFFF;
}

.cabecalho h1 {
  margin: 0;
  font-size: 20px;
}

.cabecalho nav {
  display: flex;
  gap: 16px;
}

.cabecalho a {
  color: #FFFFFF;
}

.cabecalho a.active {
  font-weight: bold;
}

.secao h2 {
  color: #23402F;
}

.cartao {
  background-color: #FFFFFF;
  border-radius: 8px;
  padding: 10px 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.cartao h3 {
  margin: 0 0 4px;
  font-size: 17px;
}

.quando {
  margin: 0;
  color: #5B6B61;
}

.erro {
  background-color: #FBE9E7;
  border: 1px solid #9A3B2F;
  border-radius: 6px;
  padding: 8px 12px;
}

.erro button {
  margin-left: 8px;
}

.voltar {
  display: inline-block;
  margin-top: 16px;
}
`;

/** A folha de partida: uma página de 960 pontos, com três colunas sempre. */
export const FOLHA_PARA_O_COMPUTADOR = `${FOLHA_COMUM}
main {
  width: 960px;
  margin: 0 auto;
  padding: 16px 20px;
}

.lista {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
`;

/** A folha de referência do módulo 5: a largura que cabe, e uma coluna no celular. */
export const FOLHA_RESPONSIVA = `${FOLHA_COMUM}
main {
  max-width: 960px;
  margin: 0 auto;
  padding: 16px 20px;
}

.lista {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

@media (max-width: 700px) {
  .lista {
    grid-template-columns: 1fr;
  }

  .cabecalho {
    flex-direction: column;
    align-items: flex-start;
  }
}
`;

/* ── As telas do módulo 2: tudo escrito no lugar, ainda sem componente ──── */

export const APP_INICIAL = `import { EVENTOS, formatarData } from './dados';

// Por enquanto a agenda é uma página só: a lista dos eventos. O mapa de telas
// da proposta tem três — os eventos, a tela de cada evento e os feriados do
// ano. As telas moram nos arquivos Inicio.tsx, Evento.tsx e Feriados.tsx.
export default function App() {
  return (
    <>
      <header className="cabecalho">
        <h1>Agenda do Clube</h1>
      </header>
      <main>
        <section className="secao">
          <h2>Próximos eventos</h2>
          <div className="lista">
            {EVENTOS.map(e => (
              <article key={e.id} className="cartao">
                <h3>{e.titulo}</h3>
                <p className="quando">{formatarData(e.data)} — {e.local}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
`;

export const TELA_EM_BRANCO = (nome: string, oQue: string) => `// A tela ${oQue}.
export default function ${nome}() {
  return <section className="secao"></section>;
}
`;

export const APP_COM_TELAS = `import { NavLink, Route, Routes } from 'react-router-dom';
import Inicio from './Inicio';
import Evento from './Evento';
import Feriados from './Feriados';

export default function App() {
  return (
    <>
      <header className="cabecalho">
        <h1>Agenda do Clube</h1>
        <nav>
          <NavLink to="/">Eventos</NavLink>
          <NavLink to="/feriados">Feriados</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/evento/:id" element={<Evento />} />
          <Route path="/feriados" element={<Feriados />} />
          <Route path="*" element={<p className="erro">Página não encontrada.</p>} />
        </Routes>
      </main>
    </>
  );
}
`;

export const INICIO_COM_TELAS = `import { Link } from 'react-router-dom';
import { EVENTOS, formatarData } from './dados';

export default function Inicio() {
  return (
    <section className="secao">
      <h2>Próximos eventos</h2>
      <div className="lista">
        {EVENTOS.map(e => (
          <article key={e.id} className="cartao">
            <h3><Link to={\`/evento/\${e.id}\`}>{e.titulo}</Link></h3>
            <p className="quando">{formatarData(e.data)} — {e.local}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
`;

export const EVENTO_COM_TELAS = `import { Link, useParams } from 'react-router-dom';
import { EVENTOS, formatarData } from './dados';

export default function Evento() {
  const { id } = useParams();
  const evento = EVENTOS.find(e => e.id === id);
  if (!evento) return <p className="erro">Evento não encontrado.</p>;
  const outros = EVENTOS.filter(e => e.id !== evento.id);
  return (
    <section className="secao">
      <h2>{evento.titulo}</h2>
      <p className="quando">{formatarData(evento.data)} — {evento.local}</p>
      <p className="descricao">{evento.descricao}</p>
      <h3>Outros eventos</h3>
      <div className="lista">
        {outros.map(e => (
          <article key={e.id} className="cartao">
            <h3><Link to={\`/evento/\${e.id}\`}>{e.titulo}</Link></h3>
            <p className="quando">{formatarData(e.data)} — {e.local}</p>
          </article>
        ))}
      </div>
      <Link to="/" className="voltar">Voltar</Link>
    </section>
  );
}
`;

export const FERIADOS_COM_TELAS = `import { ANO } from './dados';

export default function Feriados() {
  return (
    <section className="secao">
      <h2>Feriados de {ANO}</h2>
      <p>Os feriados do ano vão aparecer aqui.</p>
    </section>
  );
}
`;

/* ── Os componentes do módulo 3 ─────────────────────────────────────────── */

export const COMPONENTE_EM_BRANCO = (nome: string, oQue: string) => `// ${oQue}
export default function ${nome}() {
  return null;
}
`;

export const SECAO = `import type { ReactNode } from 'react';

interface Props {
  titulo: string;
  children: ReactNode;
}

export default function Secao({ titulo, children }: Props) {
  return (
    <section className="secao">
      <h2>{titulo}</h2>
      {children}
    </section>
  );
}
`;

export const CARTAO_DE_EVENTO = `import { Link } from 'react-router-dom';
import { formatarData, type Evento } from './dados';

interface Props {
  evento: Evento;
}

export default function CartaoDeEvento({ evento }: Props) {
  return (
    <article className="cartao">
      <h3><Link to={\`/evento/\${evento.id}\`}>{evento.titulo}</Link></h3>
      <p className="quando">{formatarData(evento.data)} — {evento.local}</p>
    </article>
  );
}
`;

export const MENSAGEM_DE_ERRO = `interface Props {
  texto: string;
  aoTentarDeNovo?: () => void;
}

export default function MensagemDeErro({ texto, aoTentarDeNovo }: Props) {
  return (
    <p className="erro" role="alert">
      {texto}
      {aoTentarDeNovo && <button onClick={aoTentarDeNovo}>Tentar de novo</button>}
    </p>
  );
}
`;

export const APP_COM_COMPONENTES = APP_COM_TELAS
  .replace("import Feriados from './Feriados';", "import Feriados from './Feriados';\nimport MensagemDeErro from './MensagemDeErro';")
  .replace('<p className="erro">Página não encontrada.</p>', '<MensagemDeErro texto="Página não encontrada." />');

export const INICIO_COM_COMPONENTES = `import { EVENTOS } from './dados';
import CartaoDeEvento from './CartaoDeEvento';
import Secao from './Secao';

export default function Inicio() {
  return (
    <Secao titulo="Próximos eventos">
      <div className="lista">
        {EVENTOS.map(e => <CartaoDeEvento key={e.id} evento={e} />)}
      </div>
    </Secao>
  );
}
`;

export const EVENTO_COM_COMPONENTES = `import { Link, useParams } from 'react-router-dom';
import { EVENTOS, formatarData } from './dados';
import CartaoDeEvento from './CartaoDeEvento';
import MensagemDeErro from './MensagemDeErro';
import Secao from './Secao';

export default function Evento() {
  const { id } = useParams();
  const evento = EVENTOS.find(e => e.id === id);
  if (!evento) return <MensagemDeErro texto="Evento não encontrado." />;
  const outros = EVENTOS.filter(e => e.id !== evento.id);
  return (
    <Secao titulo={evento.titulo}>
      <p className="quando">{formatarData(evento.data)} — {evento.local}</p>
      <p className="descricao">{evento.descricao}</p>
      <h3>Outros eventos</h3>
      <div className="lista">
        {outros.map(e => <CartaoDeEvento key={e.id} evento={e} />)}
      </div>
      <Link to="/" className="voltar">Voltar</Link>
    </Secao>
  );
}
`;

export const FERIADOS_COM_COMPONENTES = `import { ANO } from './dados';
import Secao from './Secao';

export default function Feriados() {
  return (
    <Secao titulo={\`Feriados de \${ANO}\`}>
      <p>Os feriados do ano vão aparecer aqui.</p>
    </Secao>
  );
}
`;

/* ── A API do módulo 4 ───────────────────────────────────────────────────── */

export const FERIADOS_COM_API = `import { useEffect, useState } from 'react';
import { ANO, formatarData } from './dados';
import MensagemDeErro from './MensagemDeErro';
import Secao from './Secao';

interface Feriado {
  date: string;
  name: string;
  type: string;
}

export default function Feriados() {
  const [feriados, setFeriados] = useState<Feriado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  function buscar() {
    setCarregando(true);
    setErro('');
    fetch(\`https://brasilapi.com.br/api/feriados/v1/\${ANO}\`)
      .then(resposta => {
        if (!resposta.ok) throw new Error(\`A API respondeu \${resposta.status}.\`);
        return resposta.json();
      })
      .then((dados: Feriado[]) => setFeriados(dados))
      .catch(() => setErro('Não deu para buscar os feriados.'))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    buscar();
  }, []);

  return (
    <Secao titulo={\`Feriados de \${ANO}\`}>
      {carregando && <p className="carregando">Carregando…</p>}
      {erro && <MensagemDeErro texto={erro} aoTentarDeNovo={buscar} />}
      <ul className="feriados">
        {feriados.map(f => (
          <li key={f.date}>
            {formatarData(f.date)} — {f.name}
          </li>
        ))}
      </ul>
    </Secao>
  );
}
`;

/** O projeto inteiro, numa etapa: os arquivos como estão depois dela. */
export interface EtapaDaAgenda { arquivos: Record<string, string> }

const MOLDURA = (folha: string, comViewport: boolean) => ({
  'index.html': INDEX_DA_AGENDA(comViewport),
  'main.tsx': MAIN_DA_AGENDA,
  'estilo.css': folha,
  'dados.ts': DADOS_DA_AGENDA,
});

export const AGENDA_NO_COMECO: Record<string, string> = {
  ...MOLDURA(FOLHA_PARA_O_COMPUTADOR, false),
  'App.tsx': APP_INICIAL,
  'Inicio.tsx': TELA_EM_BRANCO('Inicio', 'de início: a lista dos eventos, cada um com um link para a tela dele'),
  'Evento.tsx': TELA_EM_BRANCO('Evento', 'de um evento: o título, a data, o local, a descrição e os outros eventos'),
  'Feriados.tsx': TELA_EM_BRANCO('Feriados', 'dos feriados do ano — por enquanto, só o título'),
};

export const AGENDA_COM_TELAS: Record<string, string> = {
  ...MOLDURA(FOLHA_PARA_O_COMPUTADOR, false),
  'App.tsx': APP_COM_TELAS,
  'Inicio.tsx': INICIO_COM_TELAS,
  'Evento.tsx': EVENTO_COM_TELAS,
  'Feriados.tsx': FERIADOS_COM_TELAS,
};

export const AGENDA_COM_COMPONENTES: Record<string, string> = {
  ...MOLDURA(FOLHA_PARA_O_COMPUTADOR, false),
  'App.tsx': APP_COM_COMPONENTES,
  'Inicio.tsx': INICIO_COM_COMPONENTES,
  'Evento.tsx': EVENTO_COM_COMPONENTES,
  'Feriados.tsx': FERIADOS_COM_COMPONENTES,
  'Secao.tsx': SECAO,
  'CartaoDeEvento.tsx': CARTAO_DE_EVENTO,
  'MensagemDeErro.tsx': MENSAGEM_DE_ERRO,
};

export const AGENDA_COM_API: Record<string, string> = { ...AGENDA_COM_COMPONENTES, 'Feriados.tsx': FERIADOS_COM_API };

export const AGENDA_RESPONSIVA: Record<string, string> = {
  ...AGENDA_COM_API,
  'index.html': INDEX_DA_AGENDA(true),
  'estilo.css': FOLHA_RESPONSIVA,
};
