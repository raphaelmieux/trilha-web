import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, PenLine } from 'lucide-react';

/**
 * Picks a club from the official Adventist directory.
 *
 * The field was free text, which meant the platform could not tell "Olho de
 * Tigre" from "olho de tigre" from a club that does not exist. Since the
 * competency report is handed to a real club's leadership, the club has to be a
 * real one.
 *
 * Mirrors the portal's own cascade — state, then city, then club — because that
 * is how its data is indexed and how a Pathfinder thinks about where their club
 * is. Each step is one request through our proxy (see supabase/functions/clubes).
 *
 * There is always a way out. If the portal is unreachable, or a brand-new club
 * has not been listed yet, the student can type the name; the record simply
 * carries no official code, and the admin screen can tell the two apart.
 */

export interface ClubeEscolhido {
  nome: string;
  codigo: string | null;
  cidade: string | null;
  associacao: string | null;
}

interface Opcao { cod: string; nome: string }
interface ClubeOpcao extends Opcao { associacao: string }

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/clubes`;

async function consultar<T>(query: string): Promise<T> {
  const res = await fetch(`${ENDPOINT}?${query}`, {
    headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? 'Falha na consulta.');
  return data as T;
}

export default function ClubPicker({
  valor,
  onChange,
}: {
  valor: ClubeEscolhido;
  onChange: (v: ClubeEscolhido) => void;
}) {
  const [estados, setEstados] = useState<Opcao[]>([]);
  const [cidades, setCidades] = useState<Opcao[]>([]);
  const [clubes, setClubes] = useState<ClubeOpcao[]>([]);

  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');

  const [carregando, setCarregando] = useState<'estados' | 'cidades' | 'clubes' | null>('estados');
  const [indisponivel, setIndisponivel] = useState(false);
  /* Manual entry is opt-in, except when the portal itself fails — then it is the
     only way forward and switching automatically is kinder than an error. */
  const [manual, setManual] = useState(false);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const dados = await consultar<Opcao[]>('nivel=estados');
        if (!cancelado) setEstados(dados);
      } catch {
        if (!cancelado) { setIndisponivel(true); setManual(true); }
      } finally {
        if (!cancelado) setCarregando(null);
      }
    })();
    return () => { cancelado = true; };
  }, []);

  const escolherEstado = async (cod: string) => {
    setEstado(cod);
    setCidade('');
    setCidades([]);
    setClubes([]);
    onChange({ nome: '', codigo: null, cidade: null, associacao: null });
    if (!cod) return;
    setCarregando('cidades');
    try {
      setCidades(await consultar<Opcao[]>(`nivel=cidades&estado=${cod}`));
    } catch {
      setIndisponivel(true);
    } finally {
      setCarregando(null);
    }
  };

  const escolherCidade = async (cod: string) => {
    setCidade(cod);
    setClubes([]);
    onChange({ nome: '', codigo: null, cidade: null, associacao: null });
    if (!cod) return;
    setCarregando('clubes');
    try {
      setClubes(await consultar<ClubeOpcao[]>(`nivel=clubes&cidade=${cod}`));
    } catch {
      setIndisponivel(true);
    } finally {
      setCarregando(null);
    }
  };

  const escolherClube = (cod: string) => {
    const c = clubes.find(x => x.cod === cod);
    const nomeCidade = cidades.find(x => x.cod === cidade)?.nome ?? null;
    onChange(c
      ? { nome: c.nome, codigo: c.cod, cidade: nomeCidade, associacao: c.associacao }
      : { nome: '', codigo: null, cidade: null, associacao: null });
  };

  if (manual) {
    return (
      <div>
        <input
          value={valor.nome}
          onChange={e => onChange({ nome: e.target.value, codigo: null, cidade: null, associacao: null })}
          className="input-field"
          placeholder="Nome do clube"
          aria-label="Nome do clube"
        />
        <p className="text-xs mt-1 flex items-start gap-1.5" style={{ color: 'var(--color-text-dim)' }}>
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
          {indisponivel
            ? 'A lista oficial não respondeu agora. O nome digitado fica registrado sem validação.'
            : 'Digitado à mão, sem validação na lista oficial.'}
        </p>
        {!indisponivel && (
          <button type="button" onClick={() => setManual(false)} className="btn-secondary text-xs mt-2">
            Escolher da lista oficial
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid sm:grid-cols-2 gap-2">
        <select
          value={estado}
          onChange={e => void escolherEstado(e.target.value)}
          className="input-field"
          aria-label="Estado do clube"
          disabled={carregando === 'estados'}
        >
          <option value="">{carregando === 'estados' ? 'Carregando estados…' : 'Estado'}</option>
          {estados.map(e => <option key={e.cod} value={e.cod}>{e.nome}</option>)}
        </select>

        <select
          value={cidade}
          onChange={e => void escolherCidade(e.target.value)}
          className="input-field"
          aria-label="Cidade do clube"
          disabled={!estado || carregando === 'cidades'}
        >
          <option value="">{carregando === 'cidades' ? 'Carregando cidades…' : 'Cidade'}</option>
          {cidades.map(c => <option key={c.cod} value={c.cod}>{c.nome}</option>)}
        </select>
      </div>

      <select
        value={valor.codigo ?? ''}
        onChange={e => escolherClube(e.target.value)}
        className="input-field"
        aria-label="Clube"
        disabled={!cidade || carregando === 'clubes'}
      >
        <option value="">
          {carregando === 'clubes' ? 'Carregando clubes…'
            : cidade && clubes.length === 0 ? 'Nenhum clube de Desbravadores nesta cidade'
            : 'Clube'}
        </option>
        {clubes.map(c => <option key={c.cod} value={c.cod}>{c.nome}</option>)}
      </select>

      {carregando && (
        <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--color-text-dim)' }}>
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Consultando a lista oficial…
        </p>
      )}

      {valor.codigo && (
        <p className="text-xs flex items-start gap-1.5" style={{ color: 'var(--color-success)' }}>
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
          <span>
            <strong>{valor.nome}</strong> confirmado na lista oficial
            {valor.associacao ? ` — ${valor.associacao}` : ''}.
          </span>
        </p>
      )}

      <button type="button" onClick={() => setManual(true)} className="btn-secondary text-xs">
        <PenLine className="w-3 h-3 mr-1" /> Meu clube não está na lista
      </button>
    </div>
  );
}
