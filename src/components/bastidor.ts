import { createContext } from 'react';

/**
 * Verdadeiro só na página de bastidor das imagens das lições (`exemplos.html`).
 *
 * Lá a moldura da plataforma sai de cena inteira — painel de tarefas, cápsula
 * de voltar, aviso de tela pequena —, e sobra a janela do programa. A lição
 * mostra o programa, e uma tarefa do laboratório fotografada junto seria uma
 * lista de pendências de um exercício que ninguém está fazendo, posta no meio
 * da teoria.
 */
export const NoBastidor = createContext(false);
