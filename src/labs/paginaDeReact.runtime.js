/*
 * O carregador de módulos da página de React — o que faz o papel do Vite
 * dentro da prévia.
 *
 * Cada `.tsx` chega compilado para CommonJS, embrulhado numa função
 * `(require, module, exports)` e registrado aqui pelo nome do arquivo. O
 * `require` dele acha os outros arquivos pela pasta — `./CartaoDaUnidade` é
 * `CartaoDaUnidade.tsx` — e os pacotes pelo nome, que respondem com o React
 * de navegador que a página já carregou.
 *
 * É JavaScript cru, pelo motivo escrito no bastidor: vai escrito dentro da
 * página, e um arquivo que o empacotador transformasse poderia ganhar uma
 * função auxiliar que mora fora dele.
 */
(function () {
  'use strict';

  /*
   * O endereço da prévia não tem caminho, e o roteador precisa de um.
   *
   * A prévia é um `iframe` com `srcdoc`, e o endereço dele é `about:srcdoc`
   * — que não tem a forma `protocolo://servidor/caminho`. O roteador do
   * React monta cada rota com `new URL('/rota', location.href)`, e contra
   * `about:srcdoc` o navegador recusa: a primeira tela já sai em branco, com
   * "Invalid URL" no console. No computador do clube a página tem endereço
   * de verdade, e isso nunca acontece. Então, só aqui, um endereço montado
   * contra uma base `about:` é montado contra uma base de mentira com
   * caminho — o roteador lê dele só o caminho, a busca e o `#`, que são os
   * mesmos. Fora desse caso, o `URL` é o do navegador, sem mudança nenhuma.
   */
  var URLDoNavegador = window.URL;
  function URLDaPrevia(endereco, base) {
    if (arguments.length < 2 || base === undefined) return new URLDoNavegador(endereco);
    try {
      return new URLDoNavegador(endereco, base);
    } catch (e) {
      if (String(base).indexOf('about:') === 0) return new URLDoNavegador(endereco, 'http://localhost:5173/');
      throw e;
    }
  }
  URLDaPrevia.prototype = URLDoNavegador.prototype;
  ['createObjectURL', 'revokeObjectURL', 'canParse', 'parse'].forEach(function (k) {
    if (typeof URLDoNavegador[k] === 'function') URLDaPrevia[k] = URLDoNavegador[k].bind(URLDoNavegador);
  });
  window.URL = URLDaPrevia;

  var definicoes = {};
  var prontos = {};
  var EXTENSOES = ['', '.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts'];

  /*
   * O `react/jsx-runtime`, em três linhas.
   *
   * O React servido é o de navegador, de um arquivo só, e ele não traz o
   * runtime de JSX. Cada chamada vira o `createElement` de sempre, com os
   * filhos como argumentos — `jsx` com um filho só, `jsxs` com a lista
   * espalhada. A diferença importa: o React de desenvolvimento confere a
   * chave dos filhos que recebe **como argumento**, e é assim que a lista
   * gerada por `map` sem `key` continua dando o aviso que daria no Vite.
   */
  function separar(props, chave) {
    var p = {};
    for (var k in props) if (k !== 'children' && Object.prototype.hasOwnProperty.call(props, k)) p[k] = props[k];
    if (chave !== undefined) p.key = chave;
    return p;
  }
  var jsxRuntime = {
    Fragment: window.React && window.React.Fragment,
    jsx: function (tipo, props, chave) {
      var p = separar(props || {}, chave);
      return props && 'children' in props ? window.React.createElement(tipo, p, props.children) : window.React.createElement(tipo, p);
    },
    jsxs: function (tipo, props, chave) {
      var p = separar(props || {}, chave);
      var filhos = props && Array.isArray(props.children) ? props.children : [];
      return window.React.createElement.apply(null, [tipo, p].concat(filhos));
    },
  };

  /* O `react-dom/client` é o que o `react-dom/client.js` do pacote faz:
     marca que veio pela porta certa, para o React não reclamar de
     `createRoot` importado de `react-dom`. */
  function cliente() {
    var dom = window.ReactDOM;
    var internos = dom && dom.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function marcado(fn) {
      return function () {
        if (internos) internos.usingClientEntryPoint = true;
        try { return fn.apply(dom, arguments); } finally { if (internos) internos.usingClientEntryPoint = false; }
      };
    }
    return { createRoot: marcado(dom.createRoot), hydrateRoot: marcado(dom.hydrateRoot) };
  }

  var PACOTES = {
    react: function () { return window.React; },
    'react/jsx-runtime': function () { return jsxRuntime; },
    'react/jsx-dev-runtime': function () { return { Fragment: jsxRuntime.Fragment, jsxDEV: jsxRuntime.jsx }; },
    'react-dom': function () { return window.ReactDOM; },
    'react-dom/client': cliente,
    'react-router-dom': function () { return window.ReactRouterDOM; },
    'react-router': function () { return window.ReactRouter; },
  };

  function normalizar(caminho) {
    var pilha = [];
    caminho.split('/').forEach(function (p) {
      if (p === '' || p === '.') return;
      if (p === '..') pilha.pop();
      else pilha.push(p);
    });
    return pilha.join('/');
  }

  function resolver(de, pedido) {
    var pasta = de.indexOf('/') >= 0 ? de.slice(0, de.lastIndexOf('/')) : '';
    var base = normalizar((pasta ? pasta + '/' : '') + pedido).replace(/\.(js|jsx)$/, '');
    for (var i = 0; i < EXTENSOES.length; i++) {
      if (Object.prototype.hasOwnProperty.call(definicoes, base + EXTENSOES[i])) return base + EXTENSOES[i];
    }
    return null;
  }

  function exigirDe(de) {
    return function (pedido) {
      if (Object.prototype.hasOwnProperty.call(PACOTES, pedido)) {
        var pacote = PACOTES[pedido]();
        if (!pacote) throw new Error("O pacote '" + pedido + "' não está nesta página.");
        return pacote;
      }
      if (pedido.charAt(0) !== '.') {
        throw new Error("Failed to resolve import \"" + pedido + "\" from \"" + (de || 'index.html') + "\". Does the file exist?");
      }
      var alvo = resolver(de, pedido);
      if (!alvo) throw new Error("Failed to resolve import \"" + pedido + "\" from \"" + (de || 'index.html') + "\". Does the file exist?");
      return carregar(alvo);
    };
  }

  function carregar(nome) {
    if (prontos[nome]) return prontos[nome].exports;
    var modulo = { exports: {} };
    prontos[nome] = modulo;
    definicoes[nome].call(undefined, exigirDe(nome), modulo, modulo.exports);
    return modulo.exports;
  }

  window.__trilhaDefinir = function (nome, fn) { definicoes[nome] = fn; };
  window.__trilhaIniciar = function (entrada) { carregar(entrada); };
})();
