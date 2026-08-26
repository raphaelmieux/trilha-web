/*
 * A associação de arquivos: que programa abre cada extensão.
 *
 * Mora fora do arquivo dos visualizadores porque é regra pura — dá para testar
 * sem montar tela — e porque misturar função com componente no mesmo arquivo
 * quebra a atualização rápida do Vite.
 */

export type FamiliaDeArquivo = 'imagem' | 'texto' | 'audio' | 'pdf' | 'documento';

/** A família do arquivo pela extensão, ou nada quando o sistema não sabe abrir. */
export function familiaDe(nome: string): FamiliaDeArquivo | null {
  const fim = nome.toLowerCase().split('.').pop() ?? '';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(fim)) return 'imagem';
  if (['txt', 'log', 'ini'].includes(fim)) return 'texto';
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(fim)) return 'audio';
  if (fim === 'pdf') return 'pdf';
  if (['docx', 'doc', 'odt', 'rtf'].includes(fim)) return 'documento';
  return null;
}

/** O nome do programa que o sistema usaria — o que aparece na barra de tarefas. */
export const PROGRAMA_DA_FAMILIA: Record<FamiliaDeArquivo, string> = {
  imagem: 'Fotos',
  texto: 'Bloco de Notas',
  audio: 'Tocador de Mídia',
  pdf: 'Leitor de PDF',
  documento: 'Editor de Texto',
};
