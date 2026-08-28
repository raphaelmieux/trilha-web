import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Search, X, ChevronLeft, ChevronRight, AlertTriangle, Check } from 'lucide-react';
import {
  topicosDaVereda, licoesDaVereda, type Vereda, type TopicoDeVereda,
} from '../curriculum/veredas';
import { registrarTopicoLido, buscarPercurso, percursoDosEventos } from '../lib/veredas';
import { realcarLinhas } from '../labs/realce';

/*
 * O leitor de vereda.
 *
 * Serve a qualquer uma: recebe a vereda e desenha o sumário, o tópico e o
 * resultado. A de sintaxe do HTML é a primeira; a próxima entra sem tocar
 * neste arquivo.
 *
 * Abre de dois jeitos. Numa lição de teoria, com `licaoId`, mostra só os
 * tópicos daquela lição — é o percurso. Sem `licaoId`, mostra a vereda
 * inteira: é o que o ícone de livro do editor abre, para consulta no meio do
 * trabalho, e aí o sumário serve para achar, e não para andar.
 *
 * Lê-se em ordem, pelas setas do rodapé, ou cai-se direto no tópico que está
 * faltando, pela lista ou pela busca. A busca procura pela marca — quem está
 * travado numa tabela digita "table" e chega.
 *
 * Cada exemplo roda de verdade, num quadro ao lado: ler marcação sem ver o
 * resultado é decorar sem entender. O quadro é um iframe sem allow-scripts,
 * como o da prévia do editor — o exemplo aparece e não alcança a página que o
 * contém.
 *
 * O realce sai do mesmo `realce.ts` do editor, então o exemplo aqui tem
 * exatamente as cores que o desbravador vai ver quando digitar a mesma coisa
 * lá. E, como lá, tudo passa por `escapar` antes de virar HTML.
 *
 * ── O que conta como lido ────────────────────────────────────────────────
 * Abrir o tópico. Não há botão de "marcar como lido": um botão desses vira
 * uma fila de cliques no fim da leitura, e aí ele mede clique, não leitura.
 * A gravação é uma por tópico, na primeira vez, e some no segundo em que a
 * pessoa volta a um que já viu.
 */

export const CSS_REFERENCIA = `
  .ref { display: flex; flex-direction: column; min-height: 0; height: 100%;
    background: #1E1E1E; color: #D4D4D4;
    font-family: 'Segoe UI', system-ui, Roboto, sans-serif; }
  .ref-topo { flex: none; display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; background: #252526; border-bottom: 1px solid #1B1B1B; }
  .ref-topo h2 { font-size: 13.5px; font-weight: 700; color: #FFFFFF; margin: 0; }
  .ref-fechar { margin-left: auto; background: none; border: none; color: #CCCCCC; cursor: pointer; display: flex; }
  .ref-fechar:hover { color: #FFFFFF; }

  .ref-corpo { flex: 1; min-height: 0; display: flex; }

  /* ── O sumário ── */
  .ref-lista { width: 224px; flex: none; overflow-y: auto; background: #252526;
    border-right: 1px solid #1B1B1B; padding-bottom: 12px; }
  .ref-busca { position: sticky; top: 0; background: #252526; padding: 8px; z-index: 1; }
  .ref-busca div { display: flex; align-items: center; gap: 6px; padding: 0 8px;
    height: 28px; border-radius: 4px; background: #3C3C3C; }
  .ref-busca input { flex: 1; min-width: 0; background: none; border: none; outline: none;
    color: #D4D4D4; font-size: 12.5px; }
  .ref-cap { font-size: 10.5px; letter-spacing: .08em; text-transform: uppercase;
    color: #8A8A96; padding: 10px 12px 4px; }
  .ref-item { width: 100%; text-align: left; padding: 5px 12px 5px 18px;
    background: none; border: none; border-left: 2px solid transparent;
    color: #CCCCCC; font-size: 12.5px; cursor: pointer; }
  .ref-item { display: flex; align-items: center; gap: 6px; }
  .ref-item:hover { background: #2A2D2E; }
  .ref-lido { flex: none; color: #4EC9B0; }
  .ref-item .ref-titulo { flex: 1; min-width: 0; }
  .ref-item[aria-current="true"] { background: #37373D; color: #FFFFFF; border-left-color: #007ACC; }
  .ref-vazio { padding: 14px 12px; font-size: 12.5px; color: #8A8A96; }

  /* ── O tópico ── */
  .ref-texto { flex: 1; min-width: 0; overflow-y: auto; padding: 20px 24px 24px; }
  .ref-migalha { font-size: 11.5px; color: #8A8A96; }
  /* A plataforma pinta h1..h4 de quase branco; aqui o fundo é escuro e isso
     serve, mas a cor vem escrita para não depender disso. */
  .ref-texto h3 { font-size: 19px; font-weight: 700; color: #FFFFFF; margin: 3px 0 10px; }
  .ref-texto p { font-size: 13.5px; line-height: 1.65; margin: 0 0 10px; max-width: 62ch; }
  .ref-marcas { display: flex; flex-wrap: wrap; gap: 5px; margin: 0 0 14px; }
  .ref-marca { font-family: 'Cascadia Code', Consolas, monospace; font-size: 11.5px;
    padding: 1px 7px; border-radius: 10px; background: #2D2D2D; color: #9CDCFE; }

  .ref-atencao { display: flex; gap: 9px; padding: 10px 12px; border-radius: 6px;
    background: rgba(255, 196, 87, .08); border: 1px solid rgba(255, 196, 87, .3);
    color: #FFD98A; font-size: 12.5px; line-height: 1.55; margin: 4px 0 16px; max-width: 62ch; }

  .ref-dupla { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start; }
  .ref-caixa { border: 1px solid #2D2D2D; border-radius: 6px; overflow: hidden; }
  .ref-caixa-topo { padding: 5px 10px; background: #2D2D2D; font-size: 11px;
    letter-spacing: .06em; text-transform: uppercase; color: #BBBBBB; }
  .ref-codigo { margin: 0; padding: 10px 12px; overflow-x: auto;
    font-family: 'Cascadia Code', Consolas, 'Courier New', monospace;
    font-size: 12.5px; line-height: 19px; white-space: pre; }
  .ref-caixa iframe { display: block; width: 100%; height: 190px; border: none; background: #FFFFFF; }

  /* ── Andar na trilha ── */
  .ref-pe { display: flex; gap: 8px; margin-top: 20px; }
  .ref-pe button { display: flex; align-items: center; gap: 6px; padding: 7px 12px;
    border-radius: 6px; background: #2D2D2D; border: 1px solid #3C3C3C;
    color: #D4D4D4; font-size: 12.5px; cursor: pointer; max-width: 48%; }
  .ref-pe button:hover { background: #37373D; color: #FFFFFF; }
  .ref-pe span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ref-pe .adiante { margin-left: auto; }

  @media (max-width: 900px) {
    .ref-dupla { grid-template-columns: 1fr; }
    .ref-lista { width: 168px; }
    .ref-texto { padding: 16px; }
  }
  @media (max-width: 640px) {
    .ref-corpo { flex-direction: column; }
    .ref-lista { width: 100%; max-height: 168px; border-right: none; border-bottom: 1px solid #1B1B1B; }
  }
`;

/** O exemplo, com o mesmo realce do editor. */
function Codigo({ html }: { html: string }) {
  const linhas = realcarLinhas(html);
  return (
    <pre className="ref-codigo">
      {linhas.map((l, i) => (
        <div key={i} dangerouslySetInnerHTML={{ __html: l || '&nbsp;' }} />
      ))}
    </pre>
  );
}

/** O exemplo rodando. Sem allow-scripts: aparece, e não alcança nada. */
function Resultado({ html, titulo }: { html: string; titulo: string }) {
  const pagina = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body { font: 15px/1.5 system-ui, 'Segoe UI', Roboto, sans-serif; color: #201F1E;
      margin: 12px; background: #FFFFFF; }
    table { border-collapse: collapse; }
    th, td { border: 1px solid #B9B9B9; padding: 4px 9px; text-align: left; }
    caption { text-align: left; padding-bottom: 5px; font-weight: 600; }
    img { max-width: 130px; border-radius: 4px; background: #EDEDED; }
    nav a { margin-right: 10px; }
    input, button { font: inherit; padding: 3px 7px; }
  </style></head><body>${html}</body></html>`;
  return <iframe srcDoc={pagina} sandbox="" title={`Resultado: ${titulo}`} />;
}

export default function LeitorDeVereda({ vereda, userId, licaoId, aoFechar }: {
  vereda: Vereda;
  /** Quem está lendo. Sem isso a leitura não é gravada — nem tenta. */
  userId?: string;
  /** A lição de teoria a percorrer. Sem ela, o leitor é a vereda inteira. */
  licaoId?: string;
  aoFechar?: () => void;
}) {
  /* Os tópicos desta abertura: os da lição, ou os da vereda inteira. */
  const topicos = useMemo(() => {
    const todos = topicosDaVereda(vereda);
    return licaoId ? todos.filter(t => t.licaoId === licaoId) : todos;
  }, [vereda, licaoId]);

  /* O sumário agrupa por lição de teoria — que é o capítulo desta vereda. */
  const grupos = useMemo(() => {
    const vistos = new Map<string, { titulo: string; topicos: TopicoDeVereda[] }>();
    for (const t of topicos) {
      const g = vistos.get(t.licaoId) ?? { titulo: t.licao, topicos: [] };
      g.topicos.push(t);
      vistos.set(t.licaoId, g);
    }
    return [...vistos.values()];
  }, [topicos]);

  const [atual, setAtual] = useState(topicos[0]?.id ?? '');
  const [busca, setBusca] = useState('');
  const [lidos, setLidos] = useState<Set<string>>(new Set());

  /* O que já foi lido chega do servidor: quem leu metade no celular continua
     de onde parou no computador do clube. */
  useEffect(() => {
    if (!userId) return;
    let cancelado = false;
    (async () => {
      const eventos = await buscarPercurso(userId);
      if (!cancelado) setLidos(percursoDosEventos(eventos)[vereda.id]?.topicos ?? new Set());
    })();
    return () => { cancelado = true; };
  }, [userId, vereda.id]);

  /*
    Grava o tópico aberto, uma vez.

    A ref guarda o que já foi gravado nesta sessão porque `lidos` só muda
    depois da ida ao servidor: sem ela, trocar de tópico e voltar depressa
    gravaria o mesmo duas vezes, e a contagem viraria número de cliques.
  */
  const gravados = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!userId || !atual || gravados.current.has(atual)) return;
    gravados.current.add(atual);
    (async () => {
      const percurso = { topicos: lidos, laboratorios: new Set<string>() };
      /* O laboratório vencido não entra aqui: quem sabe se a vereda acabou é
         a página dela, que enxerga as duas metades. Este efeito só grava o
         tópico — a conclusão sai do mesmo `registrarTopicoLido`, que relê o
         percurso inteiro antes de decidir. */
      const novo = await registrarTopicoLido(userId, vereda, atual, percurso);
      if (novo) setLidos(antes => new Set(antes).add(atual));
    })();
  }, [userId, vereda, atual, lidos]);

  const procurado = busca.trim().toLowerCase();
  const achou = useMemo(() => {
    if (!procurado) return null;
    /* Procura pela marca antes do texto: quem está travado numa tabela digita
       "table", e não "como se escreve uma tabela". */
    return topicos.filter(t =>
      t.marcas.some(m => m.toLowerCase().includes(procurado))
      || t.titulo.toLowerCase().includes(procurado)
      || t.resumo.toLowerCase().includes(procurado));
  }, [procurado, topicos]);

  /* O nome no topo: o da lição quando se percorre uma, o da vereda quando se
     consulta a coisa inteira. */
  const titulo = licaoId
    ? (licoesDaVereda(vereda).find(l => l.id === licaoId)?.titulo ?? vereda.titulo)
    : vereda.titulo;

  const indice = topicos.findIndex(t => t.id === atual);
  const topico = topicos[indice] ?? topicos[0];
  const anterior = topicos[indice - 1];
  const proximo = topicos[indice + 1];
  const feitos = topicos.filter(t => lidos.has(t.id)).length;
  const concluida = feitos >= topicos.length;

  const Item = ({ id, titulo }: { id: string; titulo: string }) => (
    <button className="ref-item" aria-current={id === atual} onClick={() => setAtual(id)}>
      <span className="ref-titulo">{titulo}</span>
      {lidos.has(id) && <Check className="w-3.5 h-3.5 ref-lido" aria-label="lido" />}
    </button>
  );

  return (
    <div className="ref">
      <style>{CSS_REFERENCIA}</style>

      <div className="ref-topo">
        <BookOpen className="w-4 h-4" style={{ color: '#4EC9B0' }} />
        <h2>{titulo}</h2>
        <span style={{ fontSize: 11.5, color: concluida ? '#4EC9B0' : '#8A8A96' }}>
          {concluida ? 'lida' : `${feitos} de ${topicos.length} lidos`}
        </span>
        {aoFechar && (
          <button className="ref-fechar" onClick={aoFechar} aria-label="Fechar a referência">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="ref-corpo">
        <div className="ref-lista">
          <div className="ref-busca">
            <div>
              <Search className="w-3.5 h-3.5 flex-none" style={{ color: '#8A8A96' }} />
              <input value={busca} onChange={e => setBusca(e.target.value)}
                placeholder="Procure por table, img, href…" aria-label="Procurar na referência" />
            </div>
          </div>

          {achou
            ? (achou.length
              ? achou.map(t => <Item key={t.id} id={t.id} titulo={t.titulo} />)
              : <p className="ref-vazio">Nada com esse nome. Tente table, img, href, style.</p>)
            : grupos.map(g => (
              <div key={g.titulo}>
                {grupos.length > 1 && <p className="ref-cap">{g.titulo}</p>}
                {g.topicos.map(t => <Item key={t.id} id={t.id} titulo={t.titulo} />)}
              </div>
            ))}
        </div>

        <div className="ref-texto">
          <p className="ref-migalha">{topico.modulo}</p>
          <h3>{topico.titulo}</h3>
          <div className="ref-marcas">
            {topico.marcas.map(m => <span className="ref-marca" key={m}>{m}</span>)}
          </div>

          {topico.explicacao.map((paragrafo, i) => <p key={i}>{paragrafo}</p>)}

          {topico.atencao && (
            <p className="ref-atencao">
              <AlertTriangle className="w-4 h-4 flex-none" style={{ marginTop: 1 }} />
              {topico.atencao}
            </p>
          )}

          <div className={vereda.mostraResultado ? 'ref-dupla' : ''}>
            <div className="ref-caixa">
              <p className="ref-caixa-topo">Você escreve</p>
              <Codigo html={topico.exemplo} />
            </div>
            {vereda.mostraResultado && (
              <div className="ref-caixa">
                <p className="ref-caixa-topo">O navegador mostra</p>
                <Resultado html={topico.exemplo} titulo={topico.titulo} />
              </div>
            )}
          </div>

          <div className="ref-pe">
            {anterior && (
              <button onClick={() => setAtual(anterior.id)}>
                <ChevronLeft className="w-4 h-4 flex-none" />
                <span>{anterior.titulo}</span>
              </button>
            )}
            {proximo && (
              <button className="adiante" onClick={() => setAtual(proximo.id)}>
                <span>{proximo.titulo}</span>
                <ChevronRight className="w-4 h-4 flex-none" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
