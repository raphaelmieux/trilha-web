import react from '../../node_modules/react/umd/react.development.js?url';
import reactDom from '../../node_modules/react-dom/umd/react-dom.development.js?url';
import remixRouter from '../../node_modules/@remix-run/router/dist/router.umd.js?url';
import reactRouter from '../../node_modules/react-router/dist/umd/react-router.development.js?url';
import reactRouterDom from '../../node_modules/react-router-dom/dist/umd/react-router-dom.development.js?url';
import type { Biblioteca } from './paginaDeReact';

/**
 * O React que a prévia da CC-FE006 carrega: os arquivos de navegador dos
 * mesmos pacotes que constroem a plataforma, servidos junto com ela.
 *
 * A prévia é um `iframe` numa origem opaca, e um `<script src>` comum chega
 * lá sem pedir licença a ninguém — é o mesmo pedido que qualquer página faz a
 * uma biblioteca de outro endereço. O endereço vai inteiro, porque o
 * documento do `iframe` não tem endereço próprio de onde resolver um
 * caminho relativo.
 *
 * A ordem é a das dependências: o React antes do ReactDOM, e o roteador
 * depois dos dois. Só a tela importa este arquivo; as travas leem os mesmos
 * arquivos do disco (`bibliotecasNoNode.ts`).
 */
const inteiro = (u: string) => new URL(u, window.location.href).href;

export const BIBLIOTECAS_DO_REACT: Biblioteca[] = [
  { nome: 'react.development.js', src: inteiro(react) },
  { nome: 'react-dom.development.js', src: inteiro(reactDom) },
  { nome: 'router.umd.js', src: inteiro(remixRouter) },
  { nome: 'react-router.development.js', src: inteiro(reactRouter) },
  { nome: 'react-router-dom.development.js', src: inteiro(reactRouterDom) },
];
