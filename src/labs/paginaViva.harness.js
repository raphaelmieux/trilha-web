/*
 * O bastidor da página viva — o que roda dentro da prévia, antes do script de
 * quem estuda.
 *
 * É JavaScript cru, e não TypeScript, e chega por `?raw`: ele vai escrito
 * dentro de um `<script>` da página que a prévia monta, e um arquivo que o
 * empacotador transformasse poderia ganhar pelo caminho uma função auxiliar
 * que mora fora dele — e aí a página quebraria só no site publicado. Este
 * texto é o mesmo no navegador e no jsdom das travas: é por isso que a
 * conferência que a tela faz e a que o teste faz são uma conferência só.
 *
 * Ele faz cinco coisas, e nenhuma aparece na página:
 *   — anota o que o console escreve e os erros que escapam, com a linha;
 *   — responde ao `fetch` dos endereços guardados da BrasilAPI, e finge a
 *     rede caída quando o painel Rede manda;
 *   — percebe o formulário enviado sem `preventDefault`, que no navegador
 *     recarregaria a página e apagaria o que estava digitado;
 *   — descreve a árvore e realça o elemento escolhido, para o painel
 *     Elementos;
 *   — e roda um cenário — clicar, digitar, enviar, esperar, ler — e devolve o
 *     que leu, que é como as tarefas se conferem.
 *
 * Tudo o que ele mesmo põe na página leva `data-trilha-interno`, e a árvore o
 * esconde: o painel Elementos mostra a página que a pessoa escreveu.
 */
(function () {
  'use strict';
  var CONFIG = window.__TRILHA_CONFIG__ || {};
  var FONTE = 'trilha-dom';
  var anfitriao = window.parent && window.parent !== window ? window.parent : null;

  var estado = {
    console: [],
    erros: [],
    requisicoes: [],
    paradas: [],
    recarregou: false,
    offline: !!CONFIG.offline,
    pendentes: 0,
  };

  function avisar(msg) {
    if (!anfitriao) return;
    msg.fonte = FONTE;
    try { anfitriao.postMessage(msg, '*'); } catch (e) { /* a página saiu */ }
  }

  /* ── Mostrar um valor, como o console do navegador mostra ─────────────── */

  function nomeDoElemento(el) {
    var s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    if (el.classList && el.classList.length) s += '.' + Array.prototype.join.call(el.classList, '.');
    return s;
  }

  function mostrar(v, fundo) {
    fundo = fundo || 0;
    if (v === null) return 'null';
    if (v === undefined) return 'undefined';
    var t = typeof v;
    if (t === 'string') return fundo === 0 ? v : "'" + v + "'";
    if (t === 'number' || t === 'boolean' || t === 'bigint') return String(v);
    if (t === 'symbol') return v.toString();
    if (t === 'function') return 'ƒ ' + (v.name || '') + '()';
    if (v instanceof Error || (v && typeof v.message === 'string' && typeof v.name === 'string' && v.stack)) {
      return v.name + ': ' + v.message;
    }
    if (typeof Element !== 'undefined' && v instanceof Element) {
      return fundo === 0 ? '<' + nomeDoElemento(v) + '>' : nomeDoElemento(v);
    }
    if (typeof Text !== 'undefined' && v instanceof Text) return '"' + v.data + '"';
    if (typeof NodeList !== 'undefined' && (v instanceof NodeList || v instanceof HTMLCollection)) {
      var itens = Array.prototype.slice.call(v, 0, 20).map(function (x) { return x.nodeType === 1 ? nomeDoElemento(x) : '#text'; });
      return (v instanceof NodeList ? 'NodeList' : 'HTMLCollection') + '(' + v.length + ') [' + itens.join(', ') + ']';
    }
    if (v && v.__resposta) return 'Response {status: ' + v.status + ', ok: ' + v.ok + ', url: ' + "'" + v.url + "'}";
    if (typeof Promise !== 'undefined' && v instanceof Promise) return 'Promise {<pending>}';
    if (fundo > 2) return Array.isArray(v) ? 'Array(' + v.length + ')' : '{…}';
    if (Array.isArray(v)) {
      var partes = v.slice(0, 50).map(function (x) { return mostrar(x, fundo + 1); });
      if (v.length > 50) partes.push('…');
      return '(' + v.length + ') [' + partes.join(', ') + ']';
    }
    var chaves = Object.keys(v);
    var corpo = chaves.slice(0, 30).map(function (k) { return k + ': ' + mostrar(v[k], fundo + 1); });
    if (chaves.length > 30) corpo.push('…');
    return '{' + corpo.join(', ') + '}';
  }

  /* As bibliotecas que a página carrega de fora — o React, na CC-FE006 —,
     pelo endereço: o erro lançado dentro delas diz o nome do arquivo, como o
     console do navegador diz, e não "index.html". */
  var BIBLIOTECAS = CONFIG.bibliotecas || {};

  function arquivoDoEndereco(endereco) {
    if (!endereco) return '';
    var m = /name=([^;,]+)/.exec(endereco);
    if (m) return decodeURIComponent(m[1]);
    if (endereco.indexOf('data:') === 0) return '';
    if (BIBLIOTECAS[endereco]) return BIBLIOTECAS[endereco];
    return 'index.html';
  }

  function escaparRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  /* A linha de quem chamou, lida da pilha: o console do navegador escreve
     "script.js:12" ao lado de cada linha, e é por ali que se acha o log.
     Quem diz quais arquivos são da pessoa é a configuração; sem ela, valem
     os `script*.js` da CC-FE004. A pilha de um aviso do próprio React não
     passa por arquivo nenhum da pessoa, e o aviso fica sem linha. */
  var ARQUIVOS_DA_PESSOA = CONFIG.arquivos && CONFIG.arquivos.length
    ? new RegExp('(' + CONFIG.arquivos.map(escaparRegex).join('|') + '):(\\d+)')
    : /(script[\w.-]*\.js):(\d+)/;

  function linhaDeQuemChamou() {
    var pilha = '';
    try { throw new Error(); } catch (e) { pilha = String(e.stack || ''); }
    var m = ARQUIVOS_DA_PESSOA.exec(pilha);
    return m ? { arquivo: m[1], linha: Number(m[2]) } : null;
  }

  /* ── Console ──────────────────────────────────────────────────────────── */

  /* Os marcadores de formato do primeiro argumento — `%s`, `%d`, `%o` —
     trocados pelos argumentos seguintes, como o console do navegador troca.
     O React escreve os avisos assim: sem a troca, o aviso de chave sairia com
     "%s%s" no meio da frase. */
  function formatar(args) {
    if (typeof args[0] !== 'string' || !/%[sdifoOc%]/.test(args[0])) {
      return args.map(function (a) { return mostrar(a, 0); }).join(' ');
    }
    var resto = args.slice(1);
    var texto = args[0].replace(/%([sdifoOc%])/g, function (m, t) {
      if (t === '%') return '%';
      if (!resto.length) return m;
      var v = resto.shift();
      if (t === 'c') return '';
      if (t === 's') return typeof v === 'string' ? v : mostrar(v, 1);
      if (t === 'd' || t === 'i') return String(parseInt(v, 10));
      if (t === 'f') return String(parseFloat(v));
      return mostrar(v, 1);
    });
    return [texto].concat(resto.map(function (a) { return mostrar(a, 0); })).join(' ');
  }

  ['log', 'info', 'warn', 'error', 'debug'].forEach(function (nivel) {
    console[nivel] = function () {
      var texto = formatar(Array.prototype.slice.call(arguments));
      var onde = linhaDeQuemChamou();
      var entrada = { nivel: nivel === 'debug' ? 'log' : nivel, texto: texto, arquivo: onde && onde.arquivo, linha: onde && onde.linha };
      estado.console.push(entrada);
      avisar({ tipo: 'console', entrada: entrada });
    };
  });

  function anotarErro(nome, mensagem, arquivo, linha) {
    var entrada = { nivel: 'error', texto: 'Uncaught ' + (nome ? nome + ': ' : '') + mensagem, arquivo: arquivo, linha: linha, erro: true };
    estado.erros.push(entrada);
    estado.console.push(entrada);
    avisar({ tipo: 'console', entrada: entrada });
  }

  window.addEventListener('error', function (e) {
    if (e.target && e.target !== window) return;
    var erro = e.error;
    var nome = erro && erro.name ? erro.name : '';
    var mensagem = erro && typeof erro.message === 'string' ? erro.message : String(e.message || '').replace(/^Uncaught\s+(\w*Error:\s*)?/, '');
    anotarErro(nome, mensagem, arquivoDoEndereco(e.filename), e.lineno || null);
  });

  /* "Uncaught (in promise)", na ordem do navegador: é a frase que a pessoa
     vai procurar quando a rede cair e ninguém tiver posto um catch. */
  function anotarRejeicao(r) {
    var nome = r && r.name ? r.name : '';
    var mensagem = r && typeof r.message === 'string' ? r.message : mostrar(r, 1);
    var entrada = { nivel: 'error', texto: 'Uncaught (in promise) ' + (nome ? nome + ': ' : '') + mensagem, arquivo: '', linha: null, erro: true };
    estado.erros.push(entrada);
    estado.console.push(entrada);
    avisar({ tipo: 'console', entrada: entrada });
  }
  window.addEventListener('unhandledrejection', function (e) { anotarRejeicao(e.reason); });

  /* O jsdom das travas não dispara `unhandledrejection`: quem ouve lá é o
     próprio teste, que avisa por aqui. */
  window.__trilhaRejeicao = anotarRejeicao;

  /* ── Rede ─────────────────────────────────────────────────────────────── */

  var redeDeVerdade = typeof window.fetch === 'function' ? window.fetch.bind(window) : null;
  var pedidos = {};
  var proximoPedido = 1;

  /* Quem sabe a resposta guardada é o anfitrião: a página pergunta por
     mensagem e ele responde. No jsdom, o teste põe a resposta à mão. */
  function perguntarAoAnfitriao(url) {
    if (typeof window.__trilhaAnfitriao === 'function') {
      return Promise.resolve(window.__trilhaAnfitriao(url));
    }
    if (!anfitriao) return Promise.resolve(null);
    return new Promise(function (resolve) {
      var id = proximoPedido++;
      pedidos[id] = resolve;
      avisar({ tipo: 'pedido', id: id, url: url });
      setTimeout(function () { if (pedidos[id]) { delete pedidos[id]; resolve(null); } }, 2000);
    });
  }

  var TEXTOS = { 200: 'OK', 404: 'Not Found', 500: 'Internal Server Error' };

  function Resposta(status, texto, url) {
    var lido = false;
    this.__resposta = true;
    this.status = status;
    this.ok = status >= 200 && status < 300;
    this.statusText = TEXTOS[status] || '';
    this.url = url;
    this.headers = { get: function (n) { return String(n).toLowerCase() === 'content-type' ? 'application/json; charset=utf-8' : null; } };
    this.text = function () {
      if (lido) return Promise.reject(new TypeError("Failed to execute 'text' on 'Response': body stream already read"));
      lido = true;
      return Promise.resolve(texto);
    };
    this.json = function () {
      if (lido) return Promise.reject(new TypeError("Failed to execute 'json' on 'Response': body stream already read"));
      lido = true;
      return new Promise(function (resolve) { resolve(JSON.parse(texto)); });
    };
  }

  window.fetch = function (entrada, opcoes) {
    var bruto = typeof entrada === 'string' ? entrada : (entrada && entrada.url) || String(entrada);
    var url;
    try { url = new URL(bruto, 'https://pagina.local/').href; } catch (e) { url = bruto; }
    var req = {
      id: estado.requisicoes.length + 1,
      url: url,
      metodo: (opcoes && opcoes.method) || 'GET',
      estado: 'pendente',
      status: null,
      origem: '',
    };
    estado.requisicoes.push(req);
    estado.pendentes++;
    avisar({ tipo: 'rede', req: req });
    var fim = function () { estado.pendentes--; avisar({ tipo: 'rede', req: req }); };

    return new Promise(function (resolve, reject) {
      /* Uma pausa, como a rede tem: sem ela, o "Carregando…" nunca chegaria a
         aparecer, e a lição de mostrar a espera não teria o que mostrar. */
      setTimeout(function () {
        if (estado.offline) {
          req.estado = 'falha';
          req.erro = 'net::ERR_INTERNET_DISCONNECTED';
          fim();
          reject(new TypeError('Failed to fetch'));
          return;
        }
        perguntarAoAnfitriao(url).then(function (r) {
          if (r) {
            req.estado = 'pronta';
            req.status = r.status;
            req.origem = 'cache';
            fim();
            resolve(new Resposta(r.status, JSON.stringify(r.corpo), url));
            return;
          }
          if (!redeDeVerdade) {
            req.estado = 'falha';
            req.erro = 'net::ERR_NAME_NOT_RESOLVED';
            fim();
            reject(new TypeError('Failed to fetch'));
            return;
          }
          redeDeVerdade(entrada, opcoes).then(function (resp) {
            req.estado = 'pronta';
            req.status = resp.status;
            req.origem = 'rede';
            fim();
            resolve(resp);
          }, function (erro) {
            req.estado = 'falha';
            req.erro = 'net::ERR_FAILED';
            fim();
            reject(erro);
          });
        });
      }, 120);
    });
  };

  /* ── O formulário enviado sem preventDefault ──────────────────────────── */

  window.addEventListener('submit', function (e) {
    if (e.defaultPrevented) return;
    /* No navegador, a página recarregaria aqui e o que estava digitado sumiria.
       A prévia faz o mesmo — o anfitrião remonta a página —, mas avisa antes. */
    e.preventDefault();
    estado.recarregou = true;
    avisar({ tipo: 'recarga' });
  });

  /* ── A árvore, para o painel Elementos ────────────────────────────────── */

  var ids = typeof WeakMap === 'function' ? new WeakMap() : null;
  var porId = {};
  var proximoId = 1;
  function idDe(no) {
    var id = ids.get(no);
    if (!id) { id = proximoId++; ids.set(no, id); }
    porId[id] = no;
    return id;
  }

  function interno(no) {
    return no.nodeType === 1 && no.hasAttribute('data-trilha-interno');
  }

  function atributosDe(el) {
    var arq = el.getAttribute('data-trilha-arquivo');
    if (arq && el.tagName === 'STYLE') return [['rel', 'stylesheet'], ['href', arq]];
    var lista = [];
    for (var i = 0; i < el.attributes.length; i++) {
      var a = el.attributes[i];
      if (a.name === 'data-trilha-arquivo') continue;
      if (arq && a.name === 'src') { lista.push(['src', arq]); continue; }
      if (a.name === 'data-trilha-tipo') { lista.unshift(['type', a.value]); continue; }
      lista.push([a.name, a.value]);
    }
    return lista;
  }

  var contados = 0;
  function descrever(no) {
    if (contados++ > 3000) return null;
    if (no.nodeType === 3) {
      var t = no.data.replace(/\s+/g, ' ');
      if (!t.trim()) return null;
      return { id: idDe(no), texto: t.trim() };
    }
    if (no.nodeType !== 1 || interno(no)) return null;
    var arq = no.getAttribute('data-trilha-arquivo');
    var tag = arq && no.tagName === 'STYLE' ? 'link' : no.tagName.toLowerCase();
    var filhos = [];
    /* O conteúdo do estilo e do script embutidos é o arquivo da pessoa, e o
       painel mostra o arquivo pelo nome, como o navegador mostra um `<link>`. */
    if (!arq && tag !== 'script' && tag !== 'style') {
      for (var c = no.firstChild; c; c = c.nextSibling) {
        var d = descrever(c);
        if (d) filhos.push(d);
      }
    }
    return { id: idDe(no), tag: tag, atributos: atributosDe(no), filhos: filhos };
  }

  function arvore() {
    contados = 0;
    porId = {};
    return descrever(document.documentElement);
  }

  var PROPRIEDADES = ['display', 'color', 'background-color', 'font-size', 'font-weight', 'margin', 'padding', 'border', 'width', 'height', 'visibility'];

  function detalhes(id) {
    var el = porId[id];
    if (!el || el.nodeType !== 1) return null;
    var cs = window.getComputedStyle(el);
    var estilos = {};
    PROPRIEDADES.forEach(function (p) { estilos[p] = cs.getPropertyValue(p); });
    var caixa = el.getBoundingClientRect ? el.getBoundingClientRect() : { width: 0, height: 0 };
    return {
      id: id,
      tag: el.tagName.toLowerCase(),
      idDoElemento: el.id || '',
      classes: el.classList ? Array.prototype.slice.call(el.classList) : [],
      nome: nomeDoElemento(el),
      largura: Math.round(caixa.width),
      altura: Math.round(caixa.height),
      estilos: estilos,
      texto: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120),
    };
  }

  var realce = null;
  function realcar(id) {
    var el = id ? porId[id] : null;
    if (!el || el.nodeType !== 1 || !el.getBoundingClientRect) {
      if (realce) realce.style.display = 'none';
      return;
    }
    if (!realce) {
      realce = document.createElement('div');
      realce.setAttribute('data-trilha-interno', '');
      realce.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483647;background:rgba(111,168,220,.45);outline:1px solid rgba(60,120,200,.9);';
      document.documentElement.appendChild(realce);
    }
    var r = el.getBoundingClientRect();
    realce.style.display = 'block';
    realce.style.left = r.left + 'px';
    realce.style.top = r.top + 'px';
    realce.style.width = r.width + 'px';
    realce.style.height = r.height + 'px';
  }

  /* O seletor do painel — a setinha do canto: o próximo clique na página
     escolhe um elemento em vez de clicar nele. */
  var escolhendo = false;
  document.addEventListener('click', function (e) {
    if (!escolhendo) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    escolhendo = false;
    var el = e.target;
    if (el && el.nodeType === 1) {
      arvore();
      var id = idDe(el);
      realcar(id);
      avisar({ tipo: 'escolhido', id: id, arvore: arvore(), detalhes: detalhes(idDe(el)) });
    }
  }, true);
  document.addEventListener('mouseover', function (e) {
    if (!escolhendo || !e.target || e.target.nodeType !== 1) return;
    realcar(idDe(e.target));
  }, true);

  var mudou = null;
  function observar() {
    if (typeof MutationObserver !== 'function' || !anfitriao) return;
    new MutationObserver(function (lista) {
      var nossas = lista.every(function (m) { return interno(m.target) || Array.prototype.every.call(m.addedNodes, interno); });
      if (nossas) return;
      clearTimeout(mudou);
      mudou = setTimeout(function () { avisar({ tipo: 'arvore', arvore: arvore() }); }, 120);
    }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true });
  }

  /* ── As paradas ───────────────────────────────────────────────────────── */

  /* Chamada pelo script instrumentado na linha da parada. Ela não para: anota
     como as variáveis estavam naquele instante, e é isso que o painel Fontes
     mostra — ver a nota em `paginaViva.ts`. */
  window.__trilhaParada = function (linha, ler) {
    var conta = estado.paradas.filter(function (p) { return p.linha === linha; }).length;
    if (conta >= 50) return;
    var variaveis = [];
    try {
      var v = ler();
      Object.keys(v).forEach(function (nome) {
        var valor = v[nome];
        if (valor === window.__trilhaNaoIniciada) variaveis.push({ nome: nome, valor: '<não iniciada>', tipo: 'tdz' });
        else variaveis.push({ nome: nome, valor: mostrar(valor, 1), tipo: valor === null ? 'null' : typeof valor });
      });
    } catch (e) { /* uma variável ilegível não derruba o programa de ninguém */ }
    var p = { linha: linha, variaveis: variaveis, vez: conta + 1 };
    estado.paradas.push(p);
    avisar({ tipo: 'parada', parada: p });
  };
  window.__trilhaNaoIniciada = {};

  /* ── O cenário ────────────────────────────────────────────────────────── */

  function tique(ms) { return new Promise(function (r) { setTimeout(r, ms || 0); }); }

  /* Espera a rede responder e as promessas assentarem — com teto, porque um
     laço que pede de novo a cada resposta nunca deixaria de ter pendência. */
  function assentar() {
    var limite = Date.now() + 3000;
    function volta() {
      if (estado.pendentes > 0 && Date.now() < limite) return tique(20).then(volta);
      return tique(0).then(function () { return tique(0); }).then(function () { return tique(10); });
    }
    return volta();
  }

  function um(seletor) {
    try { return document.querySelector(seletor); } catch (e) { return null; }
  }
  function todos(seletor) {
    try { return Array.prototype.slice.call(document.querySelectorAll(seletor)); } catch (e) { return []; }
  }
  function textoDe(el) { return (el.textContent || '').replace(/\s+/g, ' ').trim(); }

  function visivel(el) {
    for (var x = el; x && x.nodeType === 1; x = x.parentElement) {
      if (x.hidden) return false;
      var cs = window.getComputedStyle(x);
      if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    }
    return true;
  }

  function ler(passo) {
    var el = um(passo.seletor);
    switch (passo.como) {
      case 'existe': return !!el;
      case 'contagem': return todos(passo.seletor).length;
      case 'texto': return el ? textoDe(el) : null;
      case 'textos': return todos(passo.seletor).map(textoDe);
      case 'valor': return el ? el.value : null;
      case 'classes': return el ? Array.prototype.slice.call(el.classList) : null;
      case 'classesDeTodos': return todos(passo.seletor).map(function (x) { return Array.prototype.slice.call(x.classList); });
      case 'estilo': return el ? window.getComputedStyle(el).getPropertyValue(passo.propriedade) : null;
      case 'visivel': return el ? visivel(el) : null;
      case 'visiveis': return todos(passo.seletor).filter(visivel).map(textoDe);
      case 'atributo': return el ? el.getAttribute(passo.propriedade) : null;
      case 'titulo': return document.title;
      case 'endereco': return location.hash;
      default: return null;
    }
  }

  /* O valor se escreve pelo setter do protótipo, e não por `el.value =`. É o
     que o teclado faz: o React guarda o último valor que ele mesmo pôs num
     campo controlado, e um `el.value =` atualizaria essa lembrança junto —
     o `input` chegaria sem diferença nenhuma e o `onChange` não dispararia.
     Para a página sem React as duas formas são a mesma. */
  function escreverValor(el, valor) {
    var proto = Object.getPrototypeOf(el);
    var d = proto && Object.getOwnPropertyDescriptor(proto, 'value');
    if (d && d.set) d.set.call(el, valor);
    else el.value = valor;
  }

  function digitar(el, texto) {
    if (el.focus) el.focus();
    for (var i = 0; i < texto.length; i++) {
      var ch = texto[i];
      el.dispatchEvent(new KeyboardEvent('keydown', { key: ch, bubbles: true }));
      escreverValor(el, (el.value || '') + ch);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new KeyboardEvent('keyup', { key: ch, bubbles: true }));
    }
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async function rodar(passos) {
    var leituras = {};
    var falhas = [];
    /* Não espera a rede antes do primeiro passo: o "Carregando…" só se vê
       enquanto a resposta não chegou, e o cenário que quer vê-lo lê logo. Quem
       quer a página pronta pede um passo `esperar`. */
    await tique(0);
    /* O React desenha a primeira vez numa tarefa à parte, e não durante o
       carregamento: sem esta espera curta o primeiro passo leria a página
       vazia. Curta, para o "Carregando…" continuar à vista. */
    if (CONFIG.esperaInicial) await tique(CONFIG.esperaInicial);
    for (var i = 0; i < passos.length; i++) {
      var p = passos[i];
      if (estado.recarregou) break;
      if (p.acao === 'ler') { leituras[p.chave] = ler(p); continue; }
      if (p.acao === 'esperar') { await assentar(); continue; }
      /* Ir a um endereço é o que se faz digitando na barra — a rota que não
         tem link nenhum que leve a ela. */
      if (p.acao === 'endereco') { location.hash = p.texto || ''; await tique(0); continue; }
      if (p.acao === 'rede') { estado.offline = !p.online; continue; }
      var el = um(p.seletor);
      if (!el) { falhas.push('Não achei ' + p.seletor + ' na página.'); continue; }
      try {
        if (p.acao === 'clicar') el.click();
        else if (p.acao === 'digitar') digitar(el, p.texto || '');
        else if (p.acao === 'limpar') { escreverValor(el, ''); el.dispatchEvent(new Event('input', { bubbles: true })); }
        else if (p.acao === 'escolher') {
          escreverValor(el, p.texto);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (p.acao === 'enviar') {
          if (typeof el.requestSubmit === 'function') el.requestSubmit();
          else el.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      } catch (e) {
        /* Erro lançado por quem ouve o evento chega pelo evento de erro da
           janela — aqui só chega o que o próprio gesto não conseguiu fazer. */
        falhas.push(String(e && e.message || e));
      }
      await tique(0);
    }
    await assentar();
    return {
      leituras: leituras,
      falhas: falhas,
      recarregou: estado.recarregou,
      erros: estado.erros.slice(),
      console: estado.console.slice(),
      requisicoes: estado.requisicoes.map(function (r) { return { url: r.url, estado: r.estado, status: r.status }; }),
      paradas: estado.paradas.slice(),
    };
  }

  /* ── O que o anfitrião pode pedir ─────────────────────────────────────── */

  window.__trilha = { rodar: rodar, estado: estado, arvore: arvore, detalhes: detalhes };

  window.addEventListener('message', function (e) {
    if (!anfitriao || e.source !== anfitriao) return;
    var m = e.data || {};
    if (m.fonte !== FONTE) return;
    if (m.tipo === 'resposta' && pedidos[m.id]) {
      var r = pedidos[m.id];
      delete pedidos[m.id];
      r(m.resposta);
    } else if (m.tipo === 'arvore') {
      avisar({ tipo: 'arvore', arvore: arvore() });
    } else if (m.tipo === 'realcar') {
      realcar(m.id);
      avisar({ tipo: 'detalhes', detalhes: m.id ? detalhes(m.id) : null });
    } else if (m.tipo === 'escolher') {
      escolhendo = !!m.ligado;
      if (!escolhendo) realcar(null);
    } else if (m.tipo === 'ir') {
      /* O endereço digitado na barra da prévia: só o pedaço depois do #, que
         é o que muda sem sair da página. */
      location.hash = String(m.hash || '');
    } else if (m.tipo === 'offline') {
      estado.offline = !!m.valor;
    } else if (m.tipo === 'avaliar') {
      /* O que se digita no console roda no escopo global da página, como no
         navegador: alcança as variáveis de topo do script. O resultado é do
         console, e não da página — não conta como erro dela. */
      var eco = { nivel: 'eco', texto: String(m.codigo) };
      estado.console.push(eco);
      avisar({ tipo: 'console', entrada: eco });
      var saida;
      try {
        saida = { nivel: 'resultado', texto: mostrar((0, eval)(String(m.codigo)), 1) };
      } catch (err) {
        saida = { nivel: 'error', texto: 'Uncaught ' + (err && err.name ? err.name + ': ' + err.message : String(err)) };
      }
      estado.console.push(saida);
      avisar({ tipo: 'console', entrada: saida });
    } else if (m.tipo === 'cenario') {
      rodar(m.passos || []).then(function (resultado) {
        avisar({ tipo: 'resultado', vez: m.vez, resultado: resultado });
      });
    }
  });

  /* A barra de endereço da prévia acompanha a página. O roteador do React
     muda o `#` por `history.pushState`, que não dispara `hashchange` — então
     os dois métodos avisam também, além do botão voltar (`popstate`). */
  function avisarEndereco() { avisar({ tipo: 'endereco', hash: location.hash }); }
  window.addEventListener('hashchange', avisarEndereco);
  window.addEventListener('popstate', avisarEndereco);
  ['pushState', 'replaceState'].forEach(function (k) {
    var original = history[k];
    if (typeof original !== 'function') return;
    history[k] = function () {
      var r = original.apply(history, arguments);
      avisarEndereco();
      return r;
    };
  });

  window.addEventListener('load', function () {
    observar();
    avisar({ tipo: 'pronta', arvore: arvore() });
  });
})();
