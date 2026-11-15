const DADOS = /*DADOS*/null;
const ARTE = c => `art/${c}.png`;
const H = 520, MARGEM = 28, FOLGA = 12;
const NIVEIS = Object.keys(DADOS.classes);
const alturaDoPin = c => 30 + 5 * NIVEIS.indexOf(c);
const larguraDoPin = c => alturaDoPin(c) * DADOS.LARGURA / DADOS.ALTURA;

/* ── Sorteio que se repete: o mesmo código dá sempre os mesmos números ──── */
function semente(texto) {
  let h = 2166136261;
  for (const ch of texto) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/* ── O catálogo das curiosidades (lista fechada no planejamento) ─────────── */
const CURIOSIDADES = [
  ['Calendário da computação', 'calendar', ['Virada sem Bug', 'Internet Segura', 'Mulheres na Ciência', 'O Dia que Quase Não Existe', 'Nascimento da Web', 'Dia do π', 'Cópia de Segurança', 'Meninas nas TIC', 'Senha Forte', 'O Homem que Calculava', 'Sociedade da Informação', 'Alan Turing', 'Dia do Emoji', 'Primeiro Site', 'Dia da Fotografia', 'Pinguim', 'Byte do Ano', 'Código Aberto', 'Ada Lovelace', 'Quadro a Quadro', 'Dia do Designer', 'Segurança da Informação', 'Grace Hopper']],
  ['Ritmo', 'clock', ['Madrugador', 'Pessoa da Manhã', 'Pessoa da Tarde', 'Noturno', 'Fim de Semana', 'Semana Inteira', 'Pausa Boa', 'Doze Meses', 'Um Ano de Faixa']],
  ['Jeito de estudar', 'theory', ['Revisão', 'De Primeira', 'Módulo de uma Vez', 'Consulta', 'Palavra Própria', 'Mão no Teclado', 'Botão Direito', 'Na Parede', 'Relatório Entregue', 'Conferido']],
  ['Explorador', 'route', ['Rosa dos Ventos', 'Três Frentes', 'Ponte', 'Todas as Janelas', 'Poliglota']],
  ['Segredos', null, ['Arquivo Escondido', 'Extensões à Mostra', 'Lixeira Arqueológica', 'Leitor de Manual', 'Quem Sou Eu', 'Viajante no Tempo', 'Zen do Python', 'Mapa do Banco', 'Fim da Planilha', 'Texto de Enchimento', 'Gato Pintado']],
];
const DICAS = ['Nem tudo aparece na pasta.', 'Todo nome tem um sobrenome.', 'Alguém jogou fora há muito tempo.', 'Todo comando tem instruções.', 'O computador sabe quem você é?', 'O Git lembra de tudo.', 'O Python tem uma filosofia escondida.', 'O banco guarda a própria planta.', 'Até onde vai uma planilha?', 'O Word escreve sozinho, se você pedir.', 'O gato não precisa ser laranja.'];

/* ── Quem é a pessoa do "meio do caminho" ────────────────────────────────── */
const MEIO = {
  trilhas: new Set(['AP034', 'AP041', 'AP042']),
  labsT: { AP034: 6, AP035: 3, AP041: 3, AP042: 2, AP043: 1 },
  veredas: new Set(['CC001', 'CC002', 'CC-ES001', 'CC-ES002', 'CC-FE001']),
  labsV: { CC003: 3, 'CC-ES003': 4, 'CC-ES005': 2, 'CC-DG001': 2 },
  escadas: { requisitos: 4, licoes: 4, modulos: 4, laboratorios: 3, ofensiva: 3, constancia: 3, semerro: 3, avaliacoes: 3, notamaxima: 1, trilhas: 2, veredas: 3, tokens: 3, xp: 3 },
  curiosidades: new Set(['Dia do π', 'Cópia de Segurança', 'Grace Hopper', 'Primeiro Site', 'Pessoa da Manhã', 'Pessoa da Tarde', 'Noturno', 'Fim de Semana', 'Pausa Boa', 'Revisão', 'De Primeira', 'Palavra Própria', 'Botão Direito', 'Na Parede', 'Três Frentes', 'Arquivo Escondido']),
};
/* cheia(modo): 0 = vazia, 1 = meio, 2 = completa */
const regra = noMeio => modo => modo === 2 || (modo === 1 && noMeio);

/* ── O motor: cada unidade busca o primeiro lugar livre do seu grupo ───────
   Uma unidade é uma peça com os seus satélites, um cacho, um Mestrado. Ela
   ocupa uma elipse; o lugar é o x mais à esquerda em que a elipse não toca
   nenhuma outra, e a altura é sorteada a partir do código, entre as que
   cabem. O grupo seguinte começa um pouco antes de o anterior terminar, para
   as bordas se encaixarem como numa faixa costurada à mão. */
const BALDE = 160, baldes = new Map();
function cabeForma(x, y, f, respiro) {
  const b0 = Math.floor((x - f.rx - 200) / BALDE), b1 = Math.floor((x + f.rx + 200) / BALDE);
  for (let b = b0; b <= b1; b++) for (const p of baldes.get(b) ?? []) {
    const folga = FOLGA + Math.max(respiro, p.respiro), dx = x - p.x, dy = y - p.y, sx = f.rx + p.rx + folga, sy = f.ry + p.ry + folga;
    if (Math.abs(dx) >= sx || Math.abs(dy) >= sy) continue;
    if ((dx * dx) / (sx * sx) + (dy * dy) / (sy * sy) < 1) return false;
  }
  return true;
}
function guardar(x, y, f, respiro) { const b = Math.floor(x / BALDE); if (!baldes.has(b)) baldes.set(b, []); baldes.get(b).push({ x, y, rx: f.rx, ry: f.ry, respiro }); }
/* As formas de uma unidade são as das peças dela — a peça principal e cada
   satélite —, e não uma elipse em volta de tudo: assim o anel de uma vereda
   se encaixa no vão do anel da vizinha, como pins presos à mão. */
function por(u, piso) {
  const sorte = semente(u.chave);
  const topo = Math.min(...u.formas.map(f => f.dy - f.ry)), base = Math.max(...u.formas.map(f => f.dy + f.ry));
  const esq = Math.min(...u.formas.map(f => f.dx - f.rx));
  const min = MARGEM - topo, max = H - MARGEM - base;
  const alturas = max <= min ? [(min + max) / 2] : Array.from({ length: 18 }, (_, i) => min + (max - min) * (i + sorte() * 0.8) / 18).sort(() => sorte() - 0.5);
  for (let x = piso - esq; ; x += 5) {
    for (const y of alturas) if (u.formas.every(f => cabeForma(x + f.dx, y + f.dy, f, u.respiro ?? 0))) {
      for (const f of u.formas) guardar(x + f.dx, y + f.dy, f, u.respiro ?? 0);
      return { x, y, direita: x + Math.max(...u.formas.map(f => f.dx + f.rx)) };
    }
  }
}

/* ── As peças ────────────────────────────────────────────────────────────── */
const faixa = document.getElementById('faixa');
const pecas = [];
let seq = 0;
function poe(el, { x, y, w, h, giro = 0, montar, cheia }) {
  el.style.left = (x - w / 2) + 'px'; el.style.top = (y - h / 2) + 'px'; el.style.width = w + 'px'; el.style.height = h + 'px';
  el.style.setProperty('--giro', giro + 'deg');
  faixa.appendChild(el);
  pecas.push({ el, montar, cheia });
}
function pinSvg(classe, glifo, cheia) {
  const c = DADOS.classes[classe], id = 'p' + (seq++), W = DADOS.LARGURA, A = DADOS.ALTURA;
  if (!cheia) return `<svg viewBox="-2 -2 ${W + 4} ${A + 4}"><polygon class="giz" points="${c.pontos}" stroke-width="1"/><circle class="furo" cx="${c.centro.centroX}" cy="${c.centro.centroY}" r="1"/></svg>`;
  return `<svg viewBox="-2 -2 ${W + 4} ${A + 4}"><defs>
      <linearGradient id="${id}o" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff4c2"/><stop offset=".45" stop-color="#d2a53a"/><stop offset=".7" stop-color="#7e5a12"/><stop offset="1" stop-color="#e6c25e"/></linearGradient>
      <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <clipPath id="${id}c"><polygon points="${c.pontos}"/></clipPath></defs>
    <polygon points="${c.pontos}" fill="${c.cor}" stroke="url(#${id}o)" stroke-width="2.2" stroke-linejoin="round"/>
    <g clip-path="url(#${id}c)"><ellipse cx="${W * .32}" cy="${A * .18}" rx="${W * .55}" ry="${A * .32}" fill="url(#${id}b)"/></g>
    <g transform="${glifo.transform}" fill="none" stroke="${c.glifoCor}" stroke-width="${glifo.traco}" stroke-linecap="round" stroke-linejoin="round">${glifo.shape}</g></svg>`;
}
const bordaDoPatch = cor => `<svg class="borda" viewBox="0 0 100 100" preserveAspectRatio="none">
    <ellipse cx="50" cy="50" rx="47" ry="47" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="7" vector-effect="non-scaling-stroke"/>
    <ellipse cx="50" cy="50" rx="47" ry="47" fill="none" stroke="${cor}" stroke-width="6.5" stroke-dasharray="1.1 1.1" vector-effect="non-scaling-stroke"/>
    <ellipse cx="50" cy="50" rx="47" ry="47" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="2" stroke-dasharray="1.1 1.1" vector-effect="non-scaling-stroke" transform="translate(-.4 -.5)"/></svg>`;
const gizOval = (codigo, forma, breve) => `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible">
    ${forma === 'circulo' ? '<circle class="giz" cx="50" cy="50" r="48" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle class="furo" cx="50" cy="50" r="1.4"/>'
                          : '<ellipse class="giz" cx="50" cy="50" rx="48" ry="48" stroke-width="1.6" vector-effect="non-scaling-stroke"/>'}</svg>
  <span class="rotulo-giz">${codigo}${breve ? '<small>em breve</small>' : ''}</span>`;

function anelDeSatelites(rxBase, ryBase, labs, classe, de, inicio) {
  const h = alturaDoPin(classe), w = larguraDoPin(classe);
  const precisa = (labs.length * w * 1.2) / (2 * Math.PI);
  const ax = Math.max(rxBase + h / 2 + 8, precisa), ay = Math.max(ryBase + h / 2 + 8, precisa);
  const sorte = semente('sat' + de);
  return labs.map((nome, i) => {
    const a = (inicio + i * 360 / labs.length + (sorte() * 10 - 5)) * Math.PI / 180;
    return { nome, dx: ax * Math.cos(a), dy: ay * Math.sin(a), rx: w / 2, ry: h / 2, w, h, giro: sorte() * 20 - 10 };
  });
}
function desenharSatelites(cx, cy, anel, classe, de, noMeio) {
  anel.forEach((s, i) => {
    const el = document.createElement('button'); el.type = 'button';
    poe(el, { x: cx + s.dx, y: cy + s.dy, w: s.w, h: s.h, giro: s.giro, cheia: regra(i < noMeio),
      montar(cheia) {
        el.className = 'peca pin satelite ' + (cheia ? 'cheia' : 'vazia');
        el.innerHTML = pinSvg(classe, DADOS.classes[classe].lab, cheia);
        el.setAttribute('aria-label', `${s.nome}, laboratório de ${de} — ${cheia ? 'conquistada' : 'ainda não conquistada'}`);
        el.title = cheia ? '' : `${s.nome} · ${de}`;
        el.onclick = cheia ? () => abrirInsignia(s.nome, `Laboratório de ${de}.`, classe) : null;
      } });
  });
}
function unidadeDaTrilha(t) {
  const w = 190, h = Math.round(w * 558 / 710);
  const de = `${t.code} ${t.nome}`;
  const sats = anelDeSatelites(w / 2, h / 2, t.labs, t.classeLab, de, -90);
  return { chave: t.code, formas: [{ dx: 0, dy: 0, rx: w / 2, ry: h / 2 }, ...sats], desenhar(cx, cy) {
    const el = document.createElement('button'); el.type = 'button';
    el.style.setProperty('--src', `url("${ARTE(t.code)}")`);
    const giro = semente('g' + t.code)() * 10 - 5;
    poe(el, { x: cx, y: cy, w, h, giro, cheia: regra(MEIO.trilhas.has(t.code)), montar(cheia) {
      el.className = 'peca patch ' + (cheia ? 'cheia' : 'vazia');
      el.innerHTML = cheia ? `<span class="arte"></span>${bordaDoPatch(t.corDaBorda)}` : gizOval(t.code, 'oval', !t.aberta);
      el.setAttribute('aria-label', `${t.code} ${t.nome} — ${cheia ? 'trilha concluída. Ver o Token.Web()' : 'ainda não concluída'}`);
      el.title = cheia ? '' : `${t.code} ${t.nome}${t.aberta ? '' : ' · em breve'}`;
      el.onclick = cheia ? () => abrirToken(t.code, t.nome, 'trilha') : null;
    } });
    desenharSatelites(cx, cy, sats, t.classeLab, de, MEIO.labsT[t.code] ?? 0);
  } };
}
function unidadeDaVereda(v) {
  const d = v.projeto ? 148 : 114;
  const de = `${v.code} ${v.nome}`;
  const sats = anelDeSatelites(d / 2, d / 2, v.labs, v.classeLab, de, -90 + semente('i' + v.code)() * 40);
  const concluida = MEIO.veredas.has(v.code);
  return { chave: v.code, formas: [{ dx: 0, dy: 0, rx: d / 2, ry: d / 2 }, ...sats], desenhar(cx, cy) {
    const el = document.createElement('button'); el.type = 'button';
    el.style.setProperty('--src', `url("${ARTE(v.code)}")`);
    poe(el, { x: cx, y: cy, w: d, h: d, giro: semente('g' + v.code)() * 10 - 5, cheia: regra(concluida), montar(cheia) {
      el.className = 'peca botton ' + (cheia ? 'cheia' : 'vazia');
      el.innerHTML = cheia ? `<span class="disco"></span><span class="brilho"></span>` : gizOval(v.code, 'circulo', !v.aberta);
      el.setAttribute('aria-label', `${v.code} ${v.nome} — ${cheia ? 'vereda concluída. Ver o Token.Web()' : 'ainda não concluída'}`);
      el.title = cheia ? '' : `${v.code} ${v.nome}${v.aberta ? '' : ' · em breve'}`;
      el.onclick = cheia ? () => abrirToken(v.code, v.nome, 'vereda') : null;
    } });
    desenharSatelites(cx, cy, sats, v.classeLab, de, concluida ? v.labs.length : (MEIO.labsV[v.code] ?? 0));
  } };
}
const PHI = 1.618;
function unidadeDoMestrado(familia, cor) {
  const w = 150, h = Math.round(w / PHI);
  return { chave: 'mestrado-' + familia, fecha: true, formas: [{ dx: 0, dy: 0, rx: w / 2, ry: h / 2 }], desenhar(cx, cy) {
    const el = document.createElement('button'); el.type = 'button';
    poe(el, { x: cx, y: cy, w, h, giro: semente('m' + familia)() * 10 - 5, cheia: regra(false), montar(cheia) {
      el.className = 'peca botton retangulo ' + (cheia ? 'cheia' : 'vazia');
      el.innerHTML = cheia
        ? `<span class="disco" style="background:linear-gradient(160deg, ${cor}, #0e1d3d)"></span><span class="rotulo-botton"><b>MESTRADO</b><span>${familia}</span></span><span class="brilho"></span>`
        : `<svg viewBox="0 0 ${w} ${h}" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible"><rect class="giz" x="1" y="1" width="${w - 2}" height="${h - 2}" rx="16" stroke-width="1.6"/><circle class="furo" cx="${w / 2}" cy="${h / 2}" r="1.6"/></svg><span class="rotulo-giz" style="font-size:16px">Mestrado<br>${familia}</span>`;
      el.setAttribute('aria-label', `Mestrado da plataforma ${familia} — ${cheia ? 'conquistado' : 'ainda não conquistado'}`);
      el.title = cheia ? '' : `Mestrado da plataforma · ${familia}`;
      el.onclick = cheia ? () => abrirInsignia(`Mestrado da plataforma · ${familia}`, `Concluiu todos os percursos da família ${familia}. É um Mestrado desta plataforma, e não um Mestrado oficial dos Desbravadores.`) : null;
    } });
  } };
}
/* O ME006 é patch, com a arte oficial, e o overloque na cor da beirada dela
   — a mesma regra das trilhas: a cor sai do arquivo, e não de uma lista. */
function unidadeDoMe006() {
  const w = 196, h = Math.round(w / DADOS.me006.proporcao);
  return { chave: 'me006', formas: [{ dx: 0, dy: 0, rx: w / 2, ry: h / 2 }], desenhar(cx, cy) {
    const el = document.createElement('button'); el.type = 'button';
    el.style.setProperty('--src', 'url("art/ME006.png")');
    poe(el, { x: cx, y: cy, w, h, giro: 3, cheia: regra(false), montar(cheia) {
      el.className = 'peca ' + (cheia ? 'cheia patch me006' : 'vazia pin segredo');
      const lado = cheia ? [w, h] : [58, 58];
      el.style.width = lado[0] + 'px'; el.style.height = lado[1] + 'px';
      el.style.left = (cx - lado[0] / 2) + 'px'; el.style.top = (cy - lado[1] / 2) + 'px';
      const cor = DADOS.me006.corDaBorda;
      /* O overloque segue o contorno da própria arte, traçado da
         transparência dela: um retângulo arredondado desenhado à mão erra os
         cantos, e o overloque sai para fora da tarja onde ela fecha. */
      const c = DADOS.me006.contorno;
      el.innerHTML = cheia
        ? `<span class="arte"></span><svg class="borda" viewBox="0 0 1000 1000" preserveAspectRatio="none" style="inset:0;width:100%;height:100%">
            <path d="${c}" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="7" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
            <path d="${c}" fill="none" stroke="${cor}" stroke-width="6.5" stroke-dasharray="1.1 1.1" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
            <path d="${c}" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="2" stroke-dasharray="1.1 1.1" vector-effect="non-scaling-stroke" transform="translate(-1 -1.5)"/></svg>`
        : `<svg viewBox="0 0 60 60"><circle class="giz" cx="30" cy="30" r="27" stroke-width="1.4"/></svg><span class="rotulo-giz" style="font-size:34px">?</span>`;
      el.setAttribute('aria-label', cheia ? 'ME006 Mestrado em Ciência e Tecnologia — conquistado' : 'Segredo ainda não achado. Dica: sete especialidades dizem mais juntas.');
      el.title = cheia ? '' : 'Segredo · Sete especialidades dizem mais juntas.';
      el.onclick = cheia ? () => abrirToken('ME006', 'Mestrado em Ciência e Tecnologia', 'mestrado') : null;
    } });
  } };
}
/* Cacho: o Líder no meio, os outros seis em volta. */
function unidadeDaEscada(e) {
  const sorte = semente('c' + e.chave), giroDoCacho = sorte() * 60;
  const lugares = e.degraus.map((d, i) => {
    const h = alturaDoPin(d.classe), w = larguraDoPin(d.classe);
    let dx = 0, dy = 0;
    if (i < 6) { const a = (giroDoCacho - 90 + i * 60 + sorte() * 12 - 6) * Math.PI / 180, raio = 64 + sorte() * 8; dx = raio * Math.cos(a); dy = raio * Math.sin(a); }
    return { d, dx, dy, w, h, rx: w / 2, ry: h / 2, giro: sorte() * 24 - 12 };
  });
  return { chave: 'escada-' + e.chave, respiro: 22, formas: lugares, desenhar(cx, cy) {
    lugares.forEach(({ d, dx, dy, w, h, giro }, i) => {
      const el = document.createElement('button'); el.type = 'button';
      poe(el, { x: cx + dx, y: cy + dy, w, h, giro, cheia: regra(i < (MEIO.escadas[e.chave] ?? 0)), montar(cheia) {
        el.className = 'peca pin ' + (cheia ? 'cheia' : 'vazia');
        el.innerHTML = pinSvg(d.classe, d.glifo, cheia);
        const classe = DADOS.classes[d.classe].nome;
        el.setAttribute('aria-label', `${e.familia}: ${d.nome} (${classe}) — ${cheia ? 'conquistada' : 'ainda não conquistada'}`);
        el.title = cheia ? '' : `${e.familia} · ${d.nome} · ${classe}`;
        el.onclick = cheia ? () => abrirInsignia(d.nome, `${e.familia}: ${d.alvo.toLocaleString('pt-BR')} ${e.mede}.`, d.classe) : null;
      } });
    });
  } };
}
/* Curiosidades: um cacho por tema, em espiral de girassol. A face é
   provisória — um pin redondo com o glifo do tema — até a arte recortada. */
function unidadeDeCuriosidades([tema, icone, nomes], indice) {
  const passo = 34, sorte = semente('cur' + tema);
  const lugares = nomes.map((nome, i) => { const r = passo * Math.sqrt(i + .5), a = i * 2.39996 + sorte(); return { nome, dx: r * Math.cos(a), dy: r * Math.sin(a), rx: 26, ry: 26 }; });
  return { chave: 'cur-' + tema, respiro: 22, formas: lugares, desenhar(cx, cy) {
    lugares.forEach(({ nome, dx, dy }, i) => {
      const x = cx + dx, y = cy + dy;
      const segredo = icone === null, lado = 52;
      const el = document.createElement('button'); el.type = 'button';
      poe(el, { x, y, w: lado, h: lado, giro: sorte() * 24 - 12, cheia: regra(MEIO.curiosidades.has(nome)), montar(cheia) {
        el.className = 'peca pin curiosa ' + (cheia ? 'cheia' : 'vazia') + (segredo && !cheia ? ' segredo' : '');
        const g = icone && DADOS.curiosos[icone];
        el.innerHTML = cheia
          ? `<svg viewBox="-1 -1 32 28"><circle cx="15.05" cy="13" r="12.6" fill="${DADOS.CIRCULO_SEM_CLASSE}" stroke="#c9a347" stroke-width="1.6"/>
              ${g ? `<g transform="${g.transform}" fill="none" stroke="#2a2416" stroke-width="${g.traco}" stroke-linecap="round" stroke-linejoin="round">${g.shape}</g>`
                  : '<text x="15.05" y="17.6" text-anchor="middle" font-family="Space Mono, monospace" font-weight="700" font-size="13" fill="#2a2416">!</text>'}
              <ellipse cx="11" cy="6.5" rx="8" ry="3.6" fill="#fff" opacity=".35"/></svg>`
          : `<svg viewBox="0 0 60 60"><circle class="giz" cx="30" cy="30" r="27" stroke-width="1.4"/><circle class="furo" cx="30" cy="30" r="1.6"/></svg>${segredo ? '<span class="rotulo-giz" style="font-size:28px">?</span>' : ''}`;
        el.setAttribute('aria-label', segredo && !cheia ? `Segredo ainda não achado. Dica: ${DICAS[i]}` : `Curiosidade ${nome} — ${cheia ? 'conquistada' : 'ainda não conquistada'}`);
        el.title = cheia ? '' : (segredo ? `Segredo · ${DICAS[i]}` : `${tema} · ${nome}`);
        el.onclick = cheia ? () => abrirInsignia(nome, `${tema}. A arte recortada desta curiosidade vem depois; aqui a face é provisória.`) : null;
      } });
    });
  } };
}

/* ── A composição: zona por zona, família por família ───────────────────── */
const trechos = [];
let fronteira = 40;
function grupo(nome, zona, unidades, encaixe = 120) {
  const piso = Math.max(40, fronteira - encaixe);
  let fim = fronteira;
  for (const u of unidades) {
    /* O Mestrado fecha a família: procura lugar a partir do fim dela, e não
       no primeiro vão do começo, onde ficaria longe das peças que o rendem. */
    const { x, y, direita } = por(u, u.fecha ? Math.max(piso, fim - 260) : piso);
    u.desenhar(x, y);
    fim = Math.max(fim, direita);
  }
  trechos.push({ nome, zona, de: piso, ate: fim });
  fronteira = fim;
}
const porFamilia = (lista) => { const m = new Map(); for (const x of lista) m.set(x.familia, [...(m.get(x.familia) ?? []), x]); return m; };
const COR_DA_FAMILIA = { Internet: '#7a2418', 'Computação': '#24407a', 'Programação': '#3b2a6b', 'Web Design': '#0f5b5b', 'Artes e Habilidades Manuais': '#6b3a12',
  Base: '#24407a', 'Escritório': '#1d5b34', Design: '#6b1d4f', 'Front-end': '#7a4b12', Mobile: '#12507a', 'Back-end': '#3a3a3a', Sistemas: '#5b1212', Infraestrutura: '#1d4a5b' };

for (const [familia, lista] of porFamilia(DADOS.trilhas))
  grupo(familia, 'trilhas', [...lista.map(unidadeDaTrilha), unidadeDoMestrado(familia, COR_DA_FAMILIA[familia])], familia === 'Internet' ? 0 : 120);
grupo('ME006', 'trilhas', [unidadeDoMe006()], 60);
fronteira += 60;
/* As zonas curtas primeiro, e a longa por último: as veredas são mais da
   metade da Faixa, e na frente elas empurrariam as escadas e as curiosidades
   para depois de dez telas, onde quase ninguém chega. */
grupo('Escadas', 'escadas', DADOS.escadas.map(unidadeDaEscada), 0);
fronteira += 40;
CURIOSIDADES.forEach((c, i) => grupo(c[0] === 'Calendário da computação' ? 'Calendário' : c[0], 'curiosidades', [unidadeDeCuriosidades(c, i)], i === 0 ? 0 : 60));
fronteira += 60;
for (const [familia, lista] of porFamilia(DADOS.veredas))
  grupo(familia, 'veredas', [...lista.map(unidadeDaVereda), unidadeDoMestrado(familia, COR_DA_FAMILIA[familia])], familia === 'Base' ? 0 : 140);
const LARGURA_TOTAL = Math.ceil(fronteira + 60);
faixa.style.width = LARGURA_TOTAL + 'px';

/* ── Estado ──────────────────────────────────────────────────────────────── */
let modo = 1;
function montarTudo() {
  let cheias = 0;
  for (const p of pecas) { const c = p.cheia(modo); if (c) cheias++; p.montar(c); }
  document.getElementById('contagem').textContent = `${cheias} de ${pecas.length} peças`;
}
document.querySelectorAll('[data-modo]').forEach(b => b.addEventListener('click', () => {
  modo = Number(b.dataset.modo);
  document.querySelectorAll('[data-modo]').forEach(o => o.setAttribute('aria-pressed', String(o === b)));
  montarTudo();
}));
let zoomDoUsuario = 1;
document.querySelectorAll('[data-zoom]').forEach(b => b.addEventListener('click', () => {
  const meio = (rolo.scrollLeft + rolo.clientWidth / 2) / rolo.scrollWidth;
  zoomDoUsuario = Number(b.dataset.zoom);
  document.querySelectorAll('[data-zoom]').forEach(o => o.setAttribute('aria-pressed', String(o === b)));
  ajustarAltura();
nomesQueCabem();
document.fonts?.ready.then(nomesQueCabem);
  rolo.scrollLeft = meio * rolo.scrollWidth - rolo.clientWidth / 2;
}));
montarTudo();
faixa.style.setProperty('--fibra', `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="f"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .28 0"/></filter><rect width="100%" height="100%" filter="url(#f)"/></svg>')}")`);

/* ── O cartão ────────────────────────────────────────────────────────────── */
const dialogo = document.getElementById('cartao'), corpo = document.getElementById('cartao-corpo');
const marca = '<span class="marca">Token.Web<span class="p">()</span></span>';
function abrirToken(codigo, nome, tipo) {
  dialogo.classList.add('parede');
  corpo.innerHTML = `
    <span class="prego" aria-hidden="true"></span>
    <div class="moldura"><div class="passepartout"><div class="certificado">
      <svg viewBox="0 0 2340 1655" role="img" aria-label="Token.Web() de ${codigo} ${nome}, em nome de Ana Clara Ribeiro">
        ${codigo === 'ME006' ? fundoProvisorioDoMe006() : `<image href="art/cert-${codigo}.jpg" x="0" y="0" width="2340" height="1655"/>`}
        <text x="1170" y="598" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="140" fill="#0a0a0a">Ana Clara Ribeiro</text>
        <text x="120" y="1520" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="32" letter-spacing="1" fill="#1a1a1a">TW-7K2Q9M</text>
        <text x="2220" y="1520" text-anchor="end" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="32" fill="#1a1a1a">02 de outubro de 2026</text>
      </svg><span class="vidro" aria-hidden="true"></span></div></div></div>
    <h2>${codigo} ${nome}</h2>
    <p>${tipo === 'trilha' ? 'Trilha concluída' : tipo === 'mestrado' ? 'Mestrado oficial · sete trilhas da lista concluídas aqui' : 'Vereda percorrida até o fim'} · ${marca} emitido em 02/10/2026</p>
    <div class="acoes">
      <button type="button" class="principal" data-aviso="No produto, este botão baixa o PDF do Token.Web().">Baixar PDF</button>
      <button type="button" data-aviso="No produto, este botão abre a impressão do Token.Web().">Imprimir</button>
      <button type="button" data-fechar>Fechar</button>
    </div>
    <span class="exemplo">Nome, código e data de exemplo.${codigo === 'ME006' ? ' O fundo do certificado é provisório, até a sua arte chegar.' : ''}</span>`;
  dialogo.showModal();
}
/* Fundo provisório do certificado do ME006, no layout dos outros: a faixa do
   nome no mesmo lugar e o rodapé no mesmo lugar, porque é ali que a
   plataforma escreve por cima. A arte definitiva vai em
   public/assets/certificates/ME006.png. */
function fundoProvisorioDoMe006() {
  return `<rect width="2340" height="1655" fill="#f7f2e6"/>
    <rect x="60" y="60" width="2220" height="1535" fill="none" stroke="#c13516" stroke-width="16"/>
    <rect x="96" y="96" width="2148" height="1463" fill="none" stroke="#e7c35a" stroke-width="6"/>
    <text x="1170" y="400" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="56" fill="#333">Este documento certifica que</text>
    <text x="1170" y="760" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="52" fill="#333">concluiu, nesta plataforma, sete trilhas da lista do</text>
    <text x="1170" y="880" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="700" font-size="92" fill="#111">ME006 Mestrado em Ciência e Tecnologia</text>
    <image href="art/ME006.png" x="${1170 - 260}" y="950" width="520" height="${520 * 709 / 965}"/>`;
}
function abrirInsignia(nome, texto, classe) {
  dialogo.classList.remove('parede');
  const c = classe && DADOS.classes[classe];
  corpo.innerHTML = `<h2>${nome}</h2>
    ${c ? `<p>Classe <strong style="color:var(--texto)">${c.nome}</strong></p>` : '<p>Sem classe</p>'}
    <p>${texto}</p><p class="exemplo">Conquistada em 12/10/2026 (data de exemplo).</p>
    <div class="acoes"><button type="button" data-fechar>Fechar</button></div>`;
  dialogo.showModal();
}
let relogioAviso;
corpo.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.hasAttribute('data-fechar')) dialogo.close();
  if (b.dataset.aviso) { const a = document.getElementById('aviso'); a.textContent = b.dataset.aviso; a.hidden = false; clearTimeout(relogioAviso); relogioAviso = setTimeout(() => { a.hidden = true; }, 3200); }
});
dialogo.addEventListener('click', e => { if (e.target === dialogo) dialogo.close(); });

/* ── Rolar ───────────────────────────────────────────────────────────────── */
const rolo = document.getElementById('rolo');
const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
let arrasto = null, inercia = 0, arrastou = false;
function ajustarAltura() {
  const alvo = Math.max(330, Math.min(560, window.innerHeight * 0.62));
  faixa.style.zoom = String((alvo / 520) * zoomDoUsuario);
  pintarRegua();
}
addEventListener('resize', ajustarAltura);
rolo.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'mouse' || e.button !== 0) return;
  cancelAnimationFrame(inercia);
  arrasto = { x: e.clientX, left: rolo.scrollLeft, id: e.pointerId, ultX: e.clientX, ultT: performance.now(), vel: 0, preso: false };
  arrastou = false;
});
addEventListener('pointermove', e => {
  if (!arrasto || e.pointerId !== arrasto.id) return;
  const dx = e.clientX - arrasto.x;
  if (!arrasto.preso && Math.abs(dx) > 5) { arrasto.preso = true; arrastou = true; rolo.setPointerCapture(arrasto.id); rolo.classList.add('arrastando'); sumirDica(); }
  if (!arrasto.preso) return;
  rolo.scrollLeft = arrasto.left - dx;
  const agora = performance.now(), dt = Math.max(1, agora - arrasto.ultT);
  arrasto.vel = 0.8 * ((e.clientX - arrasto.ultX) / dt) + 0.2 * arrasto.vel;
  arrasto.ultX = e.clientX; arrasto.ultT = agora;
});
function soltar(e) {
  if (!arrasto || e.pointerId !== arrasto.id) return;
  const { vel, preso } = arrasto; arrasto = null;
  rolo.classList.remove('arrastando');
  if (!preso || calmo) return;
  let v = -vel * 16;
  const passo = () => { rolo.scrollLeft += v; v *= 0.93; if (Math.abs(v) > 0.4) inercia = requestAnimationFrame(passo); };
  inercia = requestAnimationFrame(passo);
}
addEventListener('pointerup', soltar);
addEventListener('pointercancel', soltar);
rolo.addEventListener('click', e => { if (arrastou) { e.stopPropagation(); e.preventDefault(); arrastou = false; } }, true);
rolo.addEventListener('wheel', e => {
  if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
  const max = rolo.scrollWidth - rolo.clientWidth;
  const indo = e.deltaY > 0 ? rolo.scrollLeft < max - 1 : rolo.scrollLeft > 0;
  if (!indo) return;
  e.preventDefault(); rolo.scrollLeft += e.deltaY; sumirDica();
}, { passive: false });
rolo.addEventListener('keydown', e => {
  const passo = { ArrowRight: 220, ArrowLeft: -220, PageDown: rolo.clientWidth * .8, PageUp: -rolo.clientWidth * .8 }[e.key];
  if (e.key === 'Home') rolo.scrollTo({ left: 0, behavior: calmo ? 'auto' : 'smooth' });
  else if (e.key === 'End') rolo.scrollTo({ left: rolo.scrollWidth, behavior: calmo ? 'auto' : 'smooth' });
  else if (passo) rolo.scrollBy({ left: passo, behavior: calmo ? 'auto' : 'smooth' });
  else return;
  e.preventDefault();
});
faixa.addEventListener('focusin', e => e.target.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: calmo ? 'auto' : 'smooth' }));
rolo.addEventListener('scroll', () => { pintarRegua(); if (rolo.scrollLeft > 30) sumirDica(); }, { passive: true });
function sumirDica() { document.getElementById('dica').classList.add('some'); }

/* ── A régua: um trecho por família, com a cor da zona ──────────────────── */
const regua = document.getElementById('regua');
const pct = x => (x / LARGURA_TOTAL * 100);
/* Os trechos de uma família se encaixam no da anterior; na régua, cada um
   começa onde o anterior termina, para não se sobreporem. */
const ZONAS = { trilhas: 'Trilhas', veredas: 'Veredas', escadas: 'Escadas', curiosidades: 'Curiosidades' };
let inicio = 0;
const faixasDaRegua = trechos.map((t, i) => {
  const fim = i === trechos.length - 1 ? LARGURA_TOTAL : (t.ate + trechos[i + 1].de) / 2;
  const r = { ...t, de: inicio, ate: fim }; inicio = fim; return r;
});
const zonas = [];
for (const t of faixasDaRegua) { const z = zonas[zonas.length - 1]; if (z && z.zona === t.zona) z.ate = t.ate; else zonas.push({ zona: t.zona, de: t.de, ate: t.ate }); }
regua.innerHTML =
  zonas.map(z => `<span class="trecho zona zona-${z.zona}" style="left:${pct(z.de)}%;width:${pct(z.ate - z.de)}%">${ZONAS[z.zona]}</span>`).join('') +
  faixasDaRegua.map(t => `<span class="trecho familia zona-${t.zona}" title="${t.nome}" style="left:${pct(t.de)}%;width:${pct(t.ate - t.de)}%"><span>${t.nome}</span></span>`).join('') +
  '<span class="janela" id="janela"></span>';
/* O nome da família só aparece onde cabe inteiro; o resto fica no title. */
function nomesQueCabem() { regua.querySelectorAll('.familia').forEach(f => { const s = f.firstElementChild; s.style.visibility = s.scrollWidth <= s.clientWidth + 1 ? 'visible' : 'hidden'; }); }
addEventListener('resize', nomesQueCabem);
function pintarRegua() {
  const total = rolo.scrollWidth || 1, j = document.getElementById('janela');
  if (!j) return;
  j.style.left = (rolo.scrollLeft / total * 100) + '%';
  j.style.width = Math.min(100, rolo.clientWidth / total * 100) + '%';
  regua.setAttribute('aria-valuenow', String(Math.round(rolo.scrollLeft / Math.max(1, total - rolo.clientWidth) * 100)));
}
function irPara(clientX) {
  const r = regua.getBoundingClientRect();
  const f = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
  rolo.scrollLeft = f * rolo.scrollWidth - rolo.clientWidth / 2;
}
let naRegua = false;
regua.addEventListener('pointerdown', e => { naRegua = true; regua.setPointerCapture(e.pointerId); irPara(e.clientX); sumirDica(); });
regua.addEventListener('pointermove', e => { if (naRegua) irPara(e.clientX); });
regua.addEventListener('pointerup', () => { naRegua = false; });
regua.addEventListener('keydown', e => { const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!d) return; e.preventDefault(); rolo.scrollBy({ left: d * rolo.clientWidth * .5 }); });
ajustarAltura();
nomesQueCabem();
document.fonts?.ready.then(nomesQueCabem);
