import { ArrowLeft, ArrowRight, RotateCw, Lock, Search, Star } from 'lucide-react';

/*
 * A janela do navegador, compartilhada.
 *
 * ── Por que ela é arquivo à parte ────────────────────────────────────────
 * Pela razão do `digitalizador.tsx`, e não porque uma cópia esteja a caminho:
 * a arquitetura da casa separa o **programa** do **exercício**, e escrever uma
 * barra de endereço, uma fileira de abas e uma lista de resultados dentro do
 * componente da lição faria daquele componente duas coisas.
 *
 * O que mora aqui é do navegador — a barra de título com as abas, a barra de
 * endereço com o cadeado, a fileira de botões de navegação, como um resultado
 * de busca se desenha. O que mora no laboratório é do exercício: que páginas
 * existem, o que se cobra delas, e o que vira ficha.
 *
 * Como as outras janelas desta casa, as peças **não guardam estado**: quem sabe
 * que aba está aberta e que página está carregada é o laboratório, que é quem
 * responde à verificação. Uma janela com estado próprio obrigaria os dois lados
 * a concordar sobre a mesma página, que é a forma mais rápida de mostrarem
 * coisas diferentes.
 *
 * ── E ela não imita marca nenhuma ────────────────────────────────────────
 * É a regra do editor de código, escrita no CLAUDE.md: Word e Explorador são
 * *aquele* programa, e o desbravador vai encontrar exatamente aquele. Navegador
 * não — ele pode abrir o Chrome, o Firefox, o Edge ou o do celular. O que se
 * repete entre todos é o arranjo: abas em cima, endereço com cadeado, voltar e
 * avançar à esquerda, e a página embaixo. É ele que se desenha aqui.
 */

export const CSS_NAVEGADOR = `
.nv-janela {
  flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column;
  background: #FFFFFF; color: #1F1F1F;
  font-family: system-ui, "Segoe UI", sans-serif; font-size: 13.5px;
}

/* A faixa de cima: abas e endereço, no cinza que todo navegador usa para
   separar a casca da página. */
.nv-casca { background: #DEE1E6; padding: 6px 8px 0; flex: none; }

.nv-abas { display: flex; gap: 4px; align-items: flex-end; }
.nv-aba {
  display: flex; align-items: center; gap: 6px;
  max-width: 220px; padding: 7px 12px; border: none;
  border-radius: 8px 8px 0 0; background: #C9CCD1; color: #3C4043;
  font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.nv-aba[aria-current="true"] { background: #FFFFFF; color: #1F1F1F; }

.nv-barra {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 4px; background: #FFFFFF;
}
.nv-bt {
  display: inline-flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 50%; border: none;
  background: transparent; color: #3C4043;
}
.nv-bt:hover:not(:disabled) { background: #F1F3F4; }
.nv-bt:disabled { color: #BDC1C6; }

.nv-endereco {
  flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px;
  height: 32px; padding: 0 12px; border-radius: 16px;
  background: #F1F3F4; color: #1F1F1F;
}
.nv-endereco input {
  flex: 1; min-width: 0; border: none; background: transparent; outline: none;
  font-size: 13px; color: #1F1F1F;
}
/* 4,6:1 sobre #F1F3F4 — o cinza que os navegadores usam aqui mede menos e some
   numa barra de 13px, que é o defeito do contador de folhas da CC-ES002. */
.nv-endereco .nv-cadeado { color: #5F6368; flex: none; }

.nv-pagina {
  flex: 1; min-height: 0; overflow: auto; padding: 22px 26px;
  background: #FFFFFF; color: #1F1F1F; line-height: 1.6;
}
@media (max-width: 720px) { .nv-pagina { padding: 16px 14px; } }

/* ── A lista de resultados ─────────────────────────────────────────────── */
.nv-resultado { margin-bottom: 22px; max-width: 640px; }
.nv-resultado-url { font-size: 12px; color: #5F6368; margin-bottom: 2px; }
.nv-resultado-titulo {
  display: block; text-align: left; border: none; background: transparent; padding: 0;
  font-size: 18px; color: #1A0DAB; line-height: 1.3;
}
.nv-resultado-titulo:hover { text-decoration: underline; }
.nv-resultado-resumo { font-size: 13.5px; color: #4D5156; margin-top: 3px; }

/* ── O cabeçalho de uma página aberta ──────────────────────────────────── */
.nv-cabecalho {
  border-bottom: 1px solid #E0E0E0; padding-bottom: 12px; margin-bottom: 16px;
}
/* A cor é dita, e não herdada. A plataforma pinta h1..h4 de quase branco — o
   que está certo num aplicativo escuro e some em cima de uma página branca de
   navegador. É a regra escrita no CLAUDE.md, e o título da página saiu cinza
   claríssimo sobre branco até o Chromium mostrar. */
.nv-titulo-pagina { font-size: 21px; font-weight: 700; margin-bottom: 8px; line-height: 1.25; color: #1F1F1F; }
/* A ficha técnica da página: quem assina, quando, de onde tirou. É por ela que
   o desbravador decide, então ela não pode ser um cinza que some — 5,4:1. */
.nv-ficha { font-size: 12.5px; color: #5C5C5C; }
.nv-ficha strong { color: #1F1F1F; font-weight: 600; }
.nv-ficha-falta { color: #9A3412; }

/* A frase que pode virar ficha. Ela é um botão, e precisa parecer um: um
   parágrafo clicável sem nada dizendo isso é o gesto que ninguém descobre. */
.nv-frase {
  display: block; width: 100%; text-align: left; margin-bottom: 10px;
  padding: 10px 12px; border-radius: 6px; border: 1px dashed #BDC1C6;
  background: #FFFFFF; color: #1F1F1F; font-size: 14px; line-height: 1.55;
}
.nv-frase:hover { background: #F8F9FA; border-color: #1A73E8; }
.nv-frase[aria-pressed="true"] {
  border-style: solid; border-color: #1E8E3E; background: #E6F4EA;
}
.nv-frase-marca { font-size: 11.5px; color: #1E8E3E; display: block; margin-top: 4px; }
`;

/* ── As abas e a barra de endereço ────────────────────────────────────────── */

export interface AbaDoNavegador {
  id: string;
  titulo: string;
}

export function CascaDoNavegador({
  abas, atual, endereco, aoTrocarAba, aoVoltar, podeVoltar, busca, aoBuscar,
}: {
  abas: AbaDoNavegador[];
  atual: string;
  /** O que a barra de endereço mostra. Ela é de leitura: navegar é clicar. */
  endereco: string;
  aoTrocarAba: (id: string) => void;
  aoVoltar: () => void;
  podeVoltar: boolean;
  /** O termo buscado, quando a aba aberta é a do buscador. */
  busca?: string;
  /** Presença do setter decide: sem ele, não há campo de busca nesta aba. */
  aoBuscar?: (termo: string) => void;
}) {
  return (
    <div className="nv-casca">
      <div className="nv-abas" role="tablist">
        {abas.map(a => (
          <button
            key={a.id} type="button" className="nv-aba" role="tab"
            aria-current={a.id === atual} aria-selected={a.id === atual}
            onClick={() => aoTrocarAba(a.id)}
          >
            {a.titulo}
          </button>
        ))}
      </div>
      <div className="nv-barra">
        <button type="button" className="nv-bt" aria-label="Voltar"
          disabled={!podeVoltar} onClick={aoVoltar}>
          <ArrowLeft size={17} />
        </button>
        {/* Avançar existe porque todo navegador tem, e fica desligado porque
            daqui não há para onde avançar. Escondê-lo faria a janela deixar de
            ser reconhecível; ligá-lo prometeria um gesto sem efeito. */}
        <button type="button" className="nv-bt" aria-label="Avançar" disabled>
          <ArrowRight size={17} />
        </button>
        <button type="button" className="nv-bt" aria-label="Recarregar" disabled>
          <RotateCw size={15} />
        </button>
        <div className="nv-endereco">
          <Lock size={13} className="nv-cadeado" aria-hidden />
          <input value={endereco} readOnly aria-label="Barra de endereço" />
          <Star size={14} className="nv-cadeado" aria-hidden />
        </div>
      </div>
      {aoBuscar && (
        <div className="nv-barra" style={{ paddingTop: 0 }}>
          <div className="nv-endereco">
            <Search size={14} className="nv-cadeado" aria-hidden />
            <input
              value={busca ?? ''} aria-label="Pesquisar na web"
              placeholder="Pesquisar na web"
              onChange={e => aoBuscar(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Um resultado de busca ────────────────────────────────────────────────── */

export function ResultadoDaBusca({ url, titulo, resumo, aoAbrir }: {
  url: string; titulo: string; resumo: string; aoAbrir: () => void;
}) {
  return (
    <div className="nv-resultado">
      <p className="nv-resultado-url">{url}</p>
      <button type="button" className="nv-resultado-titulo" onClick={aoAbrir}>{titulo}</button>
      <p className="nv-resultado-resumo">{resumo}</p>
    </div>
  );
}

/* ── O cabeçalho de uma página ────────────────────────────────────────────── */

/**
 * Quem assina, quando, e de onde tirou.
 *
 * As três linhas aparecem sempre, inclusive quando estão vazias — e é aí que
 * elas dizem mais. Uma página que não diz o autor precisa **mostrar** que não
 * diz; esconder a linha faria a falta desaparecer, e o desbravador não teria o
 * que comparar entre uma página e outra.
 */
export function FichaTecnicaDaPagina({ autor, publicado, referencias }: {
  autor: string; publicado: string; referencias: string;
}) {
  const linha = (rotulo: string, valor: string, semNada: string) => (
    <p className={valor ? 'nv-ficha' : 'nv-ficha nv-ficha-falta'}>
      <strong>{rotulo}:</strong> {valor || semNada}
    </p>
  );
  return (
    <div>
      {linha('Quem escreveu', autor, 'a página não diz')}
      {linha('Quando', publicado, 'a página não tem data')}
      {linha('De onde tirou', referencias, 'a página não cita fonte nenhuma')}
    </div>
  );
}
