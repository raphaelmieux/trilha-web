/*
  O `scratch-gui` e o `scratch-vm` não trazem tipos.

  Declará-los aqui, e só aqui, mantém o `any` numa fronteira: `vm.ts` diz a
  superfície que de fato tocamos, e o resto do código volta a ser conferido
  pelo compilador. Sem isto, cada arquivo que importasse o Scratch precisaria
  de um `@ts-expect-error` próprio, e a ausência de tipos se espalharia.
*/
declare module 'scratch-gui';
declare module 'scratch-vm';
declare module 'scratch-storage';

/*
  As traduções oficiais dos blocos, usadas pela trava que confere se o nome
  escrito na lição existe na paleta. O pacote é o mesmo que o editor embutido
  carrega — não há segunda fonte para essa resposta.
*/
declare module 'scratch-l10n/locales/blocks-msgs' {
  const traducoes: Record<string, Record<string, string>>;
  export default traducoes;
}
