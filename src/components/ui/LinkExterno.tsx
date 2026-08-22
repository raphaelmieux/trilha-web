import type { ReactNode } from 'react';

/**
 * Um link que sai do aplicativo — sempre em outra aba.
 *
 * Isto era `window.open(url, '_blank', 'noopener,noreferrer')` chamado do
 * onClick de um botão. No computador funciona; no celular, não. Navegador de
 * telefone trata `window.open` programático como popup e, quando não bloqueia,
 * costuma abrir na própria aba — e é o que acontece com o aplicativo instalado
 * na tela inicial, que roda em janela única.
 *
 * O resultado, relatado por quem usa pelo celular: o site abre por cima do
 * laboratório, e voltar significa recarregar a página. Como os laboratórios
 * guardavam as respostas só na memória da tela, todo o trabalho ia junto.
 *
 * Uma âncora de verdade não passa por essa peneira: `target="_blank"` num
 * elemento que o usuário clicou é navegação, não popup, e todo navegador
 * respeita. `rel` fica junto porque sem `noopener` a página aberta ganha
 * referência de volta para esta.
 *
 * Desabilitado vira `<span>`: âncora não tem estado desabilitado, e um `<a>` sem
 * href continua clicável para o teclado.
 */
export default function LinkExterno({
  href,
  disabled = false,
  onOpen,
  className = 'btn-secondary',
  children,
  title,
}: {
  href: string;
  disabled?: boolean;
  /** Chamado quando a pessoa abre — para a tela registrar que abriu. */
  onOpen?: () => void;
  className?: string;
  children: ReactNode;
  title?: string;
}) {
  if (disabled) {
    return (
      <span className={className} aria-disabled="true" style={{ opacity: 0.5, pointerEvents: 'none' }}>
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      title={title}
      onClick={() => onOpen?.()}
    >
      {children}
    </a>
  );
}
