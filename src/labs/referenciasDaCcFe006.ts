import type { LicaoDaCcFe006 } from './metasDaCcFe006';

/**
 * As soluções de referência dos nove laboratórios da CC-FE006.
 *
 * Moram fora do currículo, pela regra de sempre: gabarito no currículo fica a
 * um import de distância da tela. A trava de motor e a que clica escrevem o
 * mesmo texto, e é por isso que ele mora num arquivo só.
 */
export interface Referencia { arquivos: Record<string, string> }

const MURAL = `import { avisos } from './dados';

export default function App() {
  return (
    <main>
      <h1 className="titulo">Mural da Unidade Ipê</h1>
      <p id="total">{avisos.length} avisos</p>
      <ul id="avisos">
        {avisos.map(aviso => <li key={aviso.id}>{aviso.texto}</li>)}
      </ul>
    </main>
  );
}
`;

const CARTAO = `interface Props {
  nome: string;
  lema: string;
  membros: number;
}

export default function CartaoDaUnidade({ nome, lema, membros }: Props) {
  return (
    <article className="cartao">
      <h2>{nome}</h2>
      <p className="lema">{lema}</p>
      <p className="membros">
        {membros} {membros === 1 ? 'membro' : 'membros'}
      </p>
    </article>
  );
}
`;

const CARTAO_APP = `import CartaoDaUnidade from './CartaoDaUnidade';
import { ipe } from './dados';

export default function App() {
  return (
    <main>
      <h1>Unidades do Clube Pioneiros</h1>
      <CartaoDaUnidade nome={ipe.nome} lema={ipe.lema} membros={ipe.membros} />
    </main>
  );
}
`;

const BOTAO = `import type { ReactNode } from 'react';

interface Props {
  cor: 'verde' | 'azul' | 'vermelho';
  aoClicar: () => void;
  children: ReactNode;
}

export default function Botao({ cor, aoClicar, children }: Props) {
  return (
    <button className={\`botao botao-\${cor}\`} onClick={aoClicar}>
      {children}
    </button>
  );
}
`;

const PLACAR = `import { useState } from 'react';
import Botao from './Botao';

export default function App() {
  const [pontos, setPontos] = useState(0);

  return (
    <main>
      <h1>Placar da gincana</h1>
      <p className="placar">{pontos} pontos</p>
      <div className="botoes">
        <Botao cor="verde" aoClicar={() => setPontos(pontos + 1)}>+1 ponto</Botao>
        <Botao cor="azul" aoClicar={() => setPontos(pontos + 5)}>+5 pontos</Botao>
        <Botao cor="vermelho" aoClicar={() => setPontos(0)}>Zerar</Botao>
      </div>
    </main>
  );
}
`;

const CHAMADA = `import { useState } from 'react';
import { QUORUM } from './dados';

export default function App() {
  const [presentes, setPresentes] = useState(0);

  function chegou() {
    setPresentes(presentes + 1);
  }

  function saiu() {
    if (presentes > 0) setPresentes(presentes - 1);
  }

  return (
    <main>
      <h1>Chamada da Unidade Ipê</h1>
      <p>
        Presentes: <strong id="presentes">{presentes}</strong> (quórum: {QUORUM})
      </p>
      <button id="chegou" onClick={chegou}>Chegou mais um</button>
      <button id="saiu" onClick={saiu}>Saiu um</button>
      {presentes >= QUORUM && <p className="quorum">Temos quórum para a reunião!</p>}
    </main>
  );
}
`;

const TAREFAS = `import { useState } from 'react';
import ItemDaTarefa from './ItemDaTarefa';
import { TAREFAS } from './dados';

export default function App() {
  const [tarefas, setTarefas] = useState(TAREFAS);

  function remover(id: number) {
    setTarefas(tarefas.filter(t => t.id !== id));
  }

  return (
    <main>
      <h1>Tarefas do acampamento</h1>
      <p>{tarefas.length} tarefas</p>
      <ul id="tarefas">
        {tarefas.map(t => (
          <ItemDaTarefa key={t.id} texto={t.texto} aoRemover={() => remover(t.id)} />
        ))}
      </ul>
    </main>
  );
}
`;

const INSCRICAO = `import { useState, type FormEvent } from 'react';
import { UNIDADES } from './dados';

interface Inscricao {
  id: number;
  nome: string;
  unidade: string;
  idade: number;
}

export default function App() {
  const [inscritos, setInscritos] = useState<Inscricao[]>([]);
  const [nome, setNome] = useState('');
  const [unidade, setUnidade] = useState(UNIDADES[0]);
  const [idade, setIdade] = useState('');
  const [erro, setErro] = useState('');

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (nome.trim() === '') {
      setErro('Escreva o nome.');
      return;
    }
    setInscritos([...inscritos, { id: Date.now(), nome, unidade, idade: Number(idade) }]);
    setErro('');
    setNome('');
    setUnidade(UNIDADES[0]);
    setIdade('');
  }

  return (
    <main>
      <h1>Inscrição no campori</h1>
      <form id="inscricao" onSubmit={enviar}>
        <label>
          Nome <input id="nome" value={nome} onChange={e => setNome(e.target.value.toUpperCase())} />
        </label>
        <label>
          Unidade
          <select id="unidade" value={unidade} onChange={e => setUnidade(e.target.value)}>
            {UNIDADES.map(u => <option key={u}>{u}</option>)}
          </select>
        </label>
        <label>
          Idade <input id="idade" type="number" value={idade} onChange={e => setIdade(e.target.value)} />
        </label>
        <button type="submit">Inscrever</button>
      </form>
      {erro && <p className="erro">{erro}</p>}
      <p className="previa">Inscrevendo: {nome}</p>
      <ul id="inscritos">
        {inscritos.map(i => (
          <li key={i.id}>
            {i.nome} — {i.unidade}, {i.idade} anos
          </li>
        ))}
      </ul>
    </main>
  );
}
`;

const EFEITO = `import { useEffect, useState } from 'react';
import { MEMBROS, UNIDADE } from './dados';

export default function App() {
  const [presentes, setPresentes] = useState<string[]>([]);
  const [busca, setBusca] = useState('');

  function alternar(nome: string) {
    setPresentes(presentes.includes(nome) ? presentes.filter(n => n !== nome) : [...presentes, nome]);
  }

  useEffect(() => {
    document.title = \`(\${presentes.length}) Chamada da \${UNIDADE}\`;
    console.log(\`Salvando a chamada: \${presentes.length} de \${MEMBROS.length}\`);
  }, [presentes]);

  const visiveis = MEMBROS.filter(m => m.toLowerCase().includes(busca.toLowerCase()));

  return (
    <main>
      <h1>Chamada da Unidade {UNIDADE}</h1>
      <input id="busca" placeholder="Procurar" value={busca} onChange={e => setBusca(e.target.value)} />
      <ul id="membros">
        {visiveis.map(m => (
          <li key={m}>
            <label>
              <input type="checkbox" checked={presentes.includes(m)} onChange={() => alternar(m)} /> {m}
            </label>
          </li>
        ))}
      </ul>
      <p id="contagem">{presentes.length} presentes</p>
    </main>
  );
}
`;

const ROTAS = `import { Link, Route, Routes, useParams } from 'react-router-dom';
import { UNIDADES_DO_CLUBE } from './dados';

function ListaDeUnidades() {
  return (
    <section>
      <h2>Unidades</h2>
      <ul id="unidades">
        {UNIDADES_DO_CLUBE.map(u => (
          <li key={u.id}>
            <Link to={\`/unidade/\${u.id}\`}>{u.nome}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DetalheDaUnidade() {
  const { id } = useParams();
  const unidade = UNIDADES_DO_CLUBE.find(u => u.id === id);
  if (!unidade) return <h2>Unidade não encontrada</h2>;
  return (
    <section>
      <h2>{unidade.nome}</h2>
      <p className="lema">{unidade.lema}</p>
      <p className="membros">{unidade.membros} membros</p>
      <Link to="/" className="voltar">Voltar</Link>
    </section>
  );
}

export default function App() {
  return (
    <main>
      <h1>Clube Pioneiros</h1>
      <Routes>
        <Route path="/" element={<ListaDeUnidades />} />
        <Route path="/unidade/:id" element={<DetalheDaUnidade />} />
        <Route path="*" element={<h2>Página não encontrada</h2>} />
      </Routes>
    </main>
  );
}
`;

const API = `import { useEffect, useState } from 'react';
import { ANO } from './dados';

interface Feriado {
  date: string;
  name: string;
  type: string;
}

export default function App() {
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
      .then(dados => setFeriados(dados))
      .catch(() => setErro('Não deu para buscar os feriados.'))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    buscar();
  }, []);

  return (
    <main>
      <h1>Feriados de {ANO}</h1>
      {carregando && <p className="carregando">Carregando…</p>}
      {erro && (
        <p className="erro">
          {erro} <button onClick={buscar}>Tentar de novo</button>
        </p>
      )}
      <ul id="feriados">
        {feriados.map(f => (
          <li key={f.date}>
            {f.date.split('-').reverse().join('/')} — {f.name}
          </li>
        ))}
      </ul>
    </main>
  );
}
`;

export const REFERENCIAS_DA_CC_FE006: Record<LicaoDaCcFe006, Referencia> = {
  declarar: { arquivos: { 'App.tsx': MURAL } },
  propriedades: { arquivos: { 'App.tsx': CARTAO_APP, 'CartaoDaUnidade.tsx': CARTAO } },
  reaproveitar: { arquivos: { 'App.tsx': PLACAR, 'Botao.tsx': BOTAO } },
  estado: { arquivos: { 'App.tsx': CHAMADA } },
  listas: { arquivos: { 'App.tsx': TAREFAS } },
  formulario: { arquivos: { 'App.tsx': INSCRICAO } },
  efeito: { arquivos: { 'App.tsx': EFEITO } },
  navegacao: { arquivos: { 'App.tsx': ROTAS } },
  api: { arquivos: { 'App.tsx': API } },
};

/** A lista com a chave na posição: desenha certo e erra a marca quando alguém sai. */
export const TAREFAS_COM_INDICE = TAREFAS.replace('key={t.id}', 'key={i}').replace('tarefas.map(t => (', 'tarefas.map((t, i) => (');

/** O efeito sem a lista de dependências: salva a cada letra da busca. */
export const EFEITO_SEM_DEPENDENCIAS = EFEITO.replace('  }, [presentes]);', '  });');
