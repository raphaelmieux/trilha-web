/**
 * O que o aplicativo de digitalizar sabe sobre a foto, sem tela nenhuma.
 *
 * Ele mora separado de `digitalizador.tsx` pela mesma razão que `planilha.ts`
 * mora separado de `excel.tsx` e `documentoPdf.ts` de `leitorDePdf.tsx`: o
 * modelo se testa sem subir React, e a janela é só quem o desenha.
 *
 * O corte caiu exatamente onde o ícone começa. `FILTROS` nasceu carregando o
 * componente de ícone de cada filtro, o que o tornava meio modelo e meio tela
 * — e a lista do filtro é conteúdo, enquanto o desenho dele é aparência. O
 * ícone ficou lá; o resto está aqui.
 */

/**
 * Os filtros que todo aplicativo de digitalizar oferece.
 *
 * Eles não são enfeite: o filtro é **como se corrige o contraste** num
 * celular, que é metade do que o requisito 5 pede. Quem digitaliza um papel
 * escrito e deixa em "Original" fica com a foto acinzentada em que a letra
 * quase some — e o reconhecimento de texto depois erra.
 *
 * Que Preto e branco seja o melhor para ler e o pior para foto é verdade do
 * programa, e não escolha nossa: ele joga fora tudo o que não é quase-preto,
 * e é justamente isso que deixa a letra limpa.
 */
export type FiltroDoScanner = 'original' | 'automatico' | 'cinza' | 'pretoEBranco';

export interface Filtro {
  id: FiltroDoScanner;
  nome: string;
  /** O contraste que este filtro deixa na captura, de 0 a 100. */
  contraste: number;
  dica: string;
}

/*
  A ordem é a que os aplicativos usam: do que menos mexe ao que mais mexe.
  Original vem primeiro porque é onde a foto cai sozinha, que é justamente o
  estado errado do qual a lição parte.
*/
export const FILTROS: Filtro[] = [
  {
    id: 'original', nome: 'Original', contraste: 38,
    dica: 'A foto como ela saiu. Boa para guardar a cor, ruim para ler.',
  },
  {
    id: 'automatico', nome: 'Automático', contraste: 68,
    dica: 'O aplicativo escolhe. Melhora, e nem sempre o bastante.',
  },
  {
    id: 'cinza', nome: 'Tons de cinza', contraste: 80,
    dica: 'Tira a cor e firma a letra.',
  },
  {
    id: 'pretoEBranco', nome: 'Preto e branco', contraste: 96,
    dica: 'O melhor para texto: sobra a letra e some o resto.',
  },
];

export const filtroPorId = (f: FiltroDoScanner): Filtro =>
  FILTROS.find(x => x.id === f) ?? FILTROS[0];

export const contrasteDoFiltro = (f: FiltroDoScanner): number => filtroPorId(f).contraste;

/**
 * Por onde o aplicativo passa, na ordem em que ele passa.
 *
 * As quatro etapas são as do programa de verdade, e existem separadas porque
 * é a separação que faz o gesto existir: um aplicativo que fosse da câmera
 * direto ao arquivo não teria onde recortar nem onde escolher o filtro.
 */
export type EtapaDoScanner = 'camera' | 'recorte' | 'filtro' | 'salvo';
