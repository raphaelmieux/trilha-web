/*
  A folha da Faixa: os materiais aprovados no P0.

  Uma faixa de tecido verde correndo na horizontal, com a bainha costurada em
  cima e embaixo. Não tem versão clara: o tecido de verdade também não tem.

  Atenção: esta folha é um template literal. Comentário dentro dela não leva
  crase, senão a string fecha no meio (já aconteceu nove vezes nesta casa).
*/
export const CSS_DA_FAIXA = `
.fx {
  --fx-tecido: #173726;
  --fx-tecido-escuro: #0f2619;
  --fx-linha: #2f6146;
  --fx-giz: rgba(236, 232, 214, .62);
  display: grid;
  gap: 10px;
}
.fx-dica { margin: 0; font-size: 13px; color: var(--color-text-dim); transition: opacity .4s; }
.fx-dica.fx-some { opacity: 0; }

/* O rolo: a faixa inteira, rolando de lado. A barra de rolagem some, e quem
   mostra onde se está é a régua. */
.fx-rolo {
  position: relative;
  overflow-x: auto; overflow-y: hidden;
  scrollbar-width: none;
  cursor: grab;
  overscroll-behavior-x: contain;
  border-radius: 6px;
}
.fx-rolo::-webkit-scrollbar { display: none; }
.fx-rolo.fx-arrastando, .fx-rolo.fx-arrastando * { cursor: grabbing !important; }
.fx-rolo:focus-visible, .fx-regua:focus-visible, .fx-peca:focus-visible { outline: 2px solid #ffd27a; outline-offset: 3px; }
.fx-tecido { position: relative; }
.fx-pano {
  position: absolute; top: 0; left: 0;
  transform-origin: 0 0;
  user-select: none; -webkit-user-select: none;
  background-color: var(--fx-tecido);
  background-image:
    repeating-linear-gradient(135deg, rgba(255,255,255,.05) 0 1px, transparent 1px 3.5px),
    repeating-linear-gradient(45deg, rgba(0,0,0,.20) 0 1px, transparent 1px 3.5px),
    repeating-linear-gradient(90deg, rgba(255,255,255,0) 0 380px, rgba(255,255,255,.035) 470px, rgba(0,0,0,.06) 560px, rgba(255,255,255,0) 700px),
    radial-gradient(120% 90% at 50% 45%, #1e4631 0%, var(--fx-tecido) 55%, var(--fx-tecido-escuro) 100%);
  box-shadow: inset 0 14px 18px -12px rgba(0,0,0,.6), inset 0 -14px 18px -12px rgba(0,0,0,.6);
}
/* A bainha: a dobra do tecido em cima e embaixo, com a costura reta. */
.fx-pano::before, .fx-pano::after {
  content: ""; position: absolute; left: 0; right: 0; height: 16px;
  background: linear-gradient(var(--fx-tecido-escuro), #12301f);
  border-bottom: 2px dashed var(--fx-linha);
  pointer-events: none;
}
.fx-pano::before { top: 0; }
.fx-pano::after { bottom: 0; transform: scaleY(-1); }

.fx-peca {
  position: absolute; padding: 0; margin: 0; border: 0; background: none;
  display: block;
  transform: rotate(var(--giro, 0deg));
  transform-origin: center;
  transition: transform .18s ease, filter .18s ease;
  -webkit-tap-highlight-color: transparent;
}
button.fx-peca { cursor: pointer; }
button.fx-peca:hover { transform: rotate(var(--giro, 0deg)) translateY(-2px) scale(1.03); }
/* O lugar vazio não sobe no hover: giz não descola do pano. Ele acende o
   traço, que é o que diz que ali há o que ver. */
button.fx-peca.fx-vazia:hover { transform: rotate(var(--giro, 0deg)); }
button.fx-vazia:hover, button.fx-vazia:focus-visible { --fx-giz: rgba(255, 244, 205, .95); }
button.fx-vazia:hover .fx-giz { fill: rgba(255,255,255,.08); }
.fx-peca svg { display: block; width: 100%; height: 100%; overflow: visible; }
.fx-recorte { display: block; width: 100%; height: 100%; object-fit: contain; pointer-events: none; }

/* Patch bordado */
.fx-patch .fx-arte {
  position: absolute; inset: 0;
  -webkit-mask: var(--src) center / contain no-repeat; mask: var(--src) center / contain no-repeat;
  background: var(--src) center / contain no-repeat;
}
.fx-patch .fx-arte::after {
  content: ""; position: absolute; inset: 0;
  background:
    repeating-linear-gradient(62deg, rgba(255,255,255,.13) 0 1px, rgba(0,0,0,.10) 1px 2px, transparent 2px 3px),
    radial-gradient(90% 80% at 35% 25%, rgba(255,255,255,.18), transparent 60%);
  mix-blend-mode: overlay;
}
.fx-patch .fx-overloque { position: absolute; inset: -6px; width: calc(100% + 12px); height: calc(100% + 12px); pointer-events: none; }
.fx-patch.fx-cheia, .fx-patch.fx-revogada { filter: drop-shadow(0 1px 0 rgba(0,0,0,.6)) drop-shadow(0 6px 9px rgba(0,0,0,.45)); }

/* Button americano */
.fx-button .fx-disco { position: absolute; inset: 0; border-radius: 50%; background: var(--src) center / cover no-repeat; }
.fx-button .fx-brilho {
  position: absolute; inset: 0; border-radius: 50%;
  background:
    radial-gradient(60% 45% at 34% 24%, rgba(255,255,255,.55), rgba(255,255,255,.08) 55%, transparent 70%),
    radial-gradient(closest-side, transparent 88%, rgba(0,0,0,.35) 97%, rgba(0,0,0,.55));
  box-shadow: inset 0 -4px 7px rgba(0,0,0,.35), inset 0 3px 3px rgba(255,255,255,.35);
}
.fx-button.fx-cheia, .fx-button.fx-revogada { filter: drop-shadow(0 2px 1px rgba(0,0,0,.55)) drop-shadow(0 8px 10px rgba(0,0,0,.45)); }
.fx-button.fx-cheia::before, .fx-button.fx-revogada::before {
  content: ""; position: absolute; inset: -2px; border-radius: 50%;
  background: conic-gradient(from 210deg, #f4f4f2, #9a9ea2, #e6e8ea, #6c7075, #f4f4f2);
}
.fx-button-aureo.fx-cheia { filter: drop-shadow(0 2px 1px rgba(0,0,0,.55)) drop-shadow(0 8px 10px rgba(0,0,0,.45)); }
.fx-aureo-provisorio {
  position: absolute; inset: 0; border-radius: 16px; display: grid; place-content: center; text-align: center; gap: 2px;
  background: linear-gradient(160deg, #24407a, #0e1d3d); color: #fff;
  box-shadow: inset 0 -4px 7px rgba(0,0,0,.35), inset 0 3px 3px rgba(255,255,255,.35);
}
.fx-aureo-provisorio b { font: 700 11px 'Space Mono', monospace; letter-spacing: .14em; color: #fde7a6; }
.fx-aureo-provisorio span { font-weight: 600; font-size: 15px; }

/* Pin esmaltado */
.fx-pin.fx-cheia, .fx-pin-curioso.fx-cheia { filter: drop-shadow(0 1px 0 rgba(0,0,0,.6)) drop-shadow(0 4px 4px rgba(0,0,0,.45)); }

/* Revogado: o documento existe e não vale. A peça fica, apagada. */
.fx-revogada { opacity: .38; filter: grayscale(.85) !important; }

/* O lugar vazio: o contorno de giz do alfaiate */
.fx-giz { stroke: var(--fx-giz); fill: rgba(0,0,0,.10); stroke-dasharray: 5 4; stroke-linecap: round; }
.fx-giz-miudo { stroke-dasharray: 2.4 2.2; }
.fx-furo { fill: rgba(0,0,0,.55); stroke: rgba(255,255,255,.12); stroke-width: .6; }
.fx-rotulo-giz {
  position: absolute; left: 0; right: 0; top: 50%; transform: translateY(-50%);
  text-align: center; font: 600 17px/1.1 'Space Mono', ui-monospace, monospace; color: var(--fx-giz);
  pointer-events: none;
}
.fx-rotulo-giz small { display: block; font-size: 11px; font-weight: 400; margin-top: 3px; }
.fx-rotulo-mestrado { font-size: 12px; padding: 0 10px; }
.fx-interrogacao { font-size: 28px; }

/* A régua: os grupos, e a janela do que está à vista */
.fx-regua { position: relative; height: 34px; border-radius: 8px; background: #19191d; border: 1px solid var(--color-border, #2e2e34); cursor: pointer; overflow: hidden; touch-action: none; }
.fx-trecho { position: absolute; display: flex; align-items: center; justify-content: center; white-space: nowrap; overflow: hidden; border-left: 1px solid rgba(255,255,255,.08); color: var(--color-text-dim); }
.fx-zona { top: 0; height: 15px; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
.fx-familia { bottom: 0; height: 18px; font-size: 10px; }
.fx-trecho > span { max-width: 100%; overflow: hidden; white-space: nowrap; padding: 0 3px; }
.fx-zona-trilhas { background: rgba(193,53,22,.12); }
.fx-zona-escadas { background: rgba(210,165,58,.10); }
.fx-zona-curiosidades { background: rgba(250,249,246,.06); }
.fx-zona-veredas { background: rgba(22,156,216,.10); }
.fx-zona-antiga { background: rgba(160,160,160,.10); }
.fx-janela { position: absolute; top: 2px; bottom: 2px; border-radius: 6px; background: rgba(236,235,230,.14); border: 1px solid rgba(236,235,230,.45); pointer-events: none; }

/* O Token.Web() emoldurado, pronto para a parede */
.fx-parede-veu { position: fixed; inset: 0; z-index: 60; display: grid; place-items: center; padding: 12px; background: rgba(0,0,0,.62); overflow-y: auto; }
.fx-parede {
  position: relative; width: min(820px, 100%); border-radius: 14px; color: #1a1a1a;
  padding: 28px 22px 22px; display: grid; gap: 14px; justify-items: center; text-align: center;
  background:
    radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,.55), transparent 60%),
    repeating-linear-gradient(90deg, rgba(0,0,0,.018) 0 2px, transparent 2px 5px), #d9d3c7;
  box-shadow: 0 30px 80px rgba(0,0,0,.6);
}
.fx-parede h2 { margin: 0; font-size: 18px; font-weight: 700; color: #1a1a1a; text-wrap: balance; }
.fx-parede p { margin: 0; color: #4a463e; }
.fx-parede-fechar { position: absolute; top: 10px; right: 10px; border: 0; background: transparent; color: #4a463e; cursor: pointer; padding: 6px; border-radius: 8px; }
.fx-parede-fechar:hover { background: rgba(0,0,0,.06); }
.fx-prego { width: 10px; height: 10px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #f4f4f4, #8d8d8d 60%, #4b4b4b); box-shadow: 0 2px 2px rgba(0,0,0,.35); margin-bottom: -12px; position: relative; z-index: 1; }
.fx-moldura {
  position: relative; width: 100%; max-width: 720px;
  padding: clamp(10px, 2.6vw, 22px);
  background:
    linear-gradient(135deg, rgba(255,255,255,.18), transparent 35%, rgba(0,0,0,.25)),
    repeating-linear-gradient(92deg, #3b2414 0 3px, #4a2e1a 3px 5px, #35200f 5px 9px);
  box-shadow: 0 18px 30px rgba(40,25,10,.45), 0 4px 6px rgba(0,0,0,.3), inset 0 0 0 1px rgba(0,0,0,.6), inset 0 2px 1px rgba(255,255,255,.15);
  transform: rotate(-.6deg);
}
.fx-moldura.fx-revogado { filter: grayscale(.9); opacity: .6; }
.fx-passepartout { padding: clamp(10px, 3vw, 28px); background: #f7f4ec; box-shadow: inset 0 0 0 1px rgba(0,0,0,.08), inset 2px 2px 3px rgba(0,0,0,.18); }
.fx-certificado { position: relative; display: block; width: 100%; aspect-ratio: 2340 / 1655; box-shadow: 0 0 0 1px rgba(0,0,0,.12); }
.fx-certificado svg { width: 100%; height: 100%; display: block; }
.fx-vidro { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(115deg, rgba(255,255,255,0) 30%, rgba(255,255,255,.22) 38%, rgba(255,255,255,0) 46%, rgba(255,255,255,0) 70%, rgba(255,255,255,.1) 76%, rgba(255,255,255,0) 82%); }
.fx-codigo { font: 13px 'Space Mono', monospace; }
.fx-acoes { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.fx-acoes button { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; font-size: 14px; border-radius: 8px; padding: 9px 14px; cursor: pointer; background: #fff; border: 1px solid #bdb6a8; color: #1a1a1a; }
.fx-acoes button.fx-principal { background: #C13516; border-color: #C13516; color: #fff; }
.fx-acoes button:disabled { opacity: .6; cursor: wait; }
.fx-erro { color: #8a1c0b !important; font-size: 13px; }

@media (prefers-reduced-motion: reduce) {
  .fx-peca, .fx-dica { transition: none; }
}

/* Imprimir o Token.Web(): só o certificado, em A4 deitado e sem margem. A
   moldura é da tela; o papel é o que vai para a moldura de verdade. */
@media print {
  @page { size: A4 landscape; margin: 0; }
  html.imprimindo-token body * { visibility: hidden !important; }
  html.imprimindo-token .fx-para-imprimir, html.imprimindo-token .fx-para-imprimir * { visibility: visible !important; }
  html.imprimindo-token .fx-para-imprimir { position: fixed; inset: 0; width: 100vw; height: 100vh; box-shadow: none; }
  html.imprimindo-token .fx-vidro { display: none; }
}
`;
