import { useState, type ComponentType } from 'react';
import { CSS_DO_EDITOR_DE_FOTO, EditorDeFoto } from '../labs/editorDeFoto';
import { documentoDe, type Imagem } from '../labs/raster';
import type { ArquivoDeImagem } from '../labs/formatosDeImagem';
import { fotoDoEmblema, fotoDoLago, lagoAjustado, lagoReto, miniaturaDoEmblema } from './fotosDeExemplo';

/*
 * As cenas da CC-DG003, no editor de foto. As fotos são as de
 * `fotosDeExemplo.ts`, e não as do laboratório, pelo motivo escrito lá.
 *
 * Cada cena parte de um estado da foto do lago — como chegou, endireitada,
 * endireitada e com a luz certa —, que é como cada lição parte do conserto da
 * anterior: mostrar o carimbo numa foto ainda torta poria dois assuntos na
 * mesma tela.
 */

/**
 * `antes` é o que Exibir → Antes e depois põe ao lado. No lago é a foto como o
 * celular a entregou; na miniatura é o emblema de antes de ir por mensagem.
 */
const cena = (fazer: () => Imagem, nome: string, antes?: () => Imagem) => function CenaDaFoto() {
  const [comparar] = useState(() => antes?.());
  const [inicial] = useState(fazer);
  const [documento, mudar] = useState(() => documentoDe(nome, inicial));
  const [pasta, setPasta] = useState<{ nome: string; imagem: Imagem }[]>(() => [{ nome, imagem: inicial }]);
  const exportar = (a: ArquivoDeImagem) => setPasta(p => [...p.filter(x => x.nome !== a.nome), { nome: a.nome, imagem: a.imagem }]);
  const abrir = (n: string) => {
    const a = pasta.find(x => x.nome === n);
    if (a) mudar(documentoDe(a.nome, a.imagem));
  };
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <style>{CSS_DO_EDITOR_DE_FOTO}</style>
      <EditorDeFoto documento={documento} mudar={mudar} pasta={pasta} aoAbrir={abrir} aoExportar={exportar}
        antes={comparar} />
    </div>
  );
};

export const CENAS_DE_FOTO: Record<string, ComponentType> = {
  'foto-lago': cena(fotoDoLago, 'IMG_lago.jpg'),
  'foto-lago-reto': cena(lagoReto, 'IMG_lago.jpg'),
  'foto-lago-ajustado': cena(lagoAjustado, 'IMG_lago.jpg'),
  'foto-lago-comparar': cena(lagoAjustado, 'IMG_lago.jpg', fotoDoLago),
  'foto-emblema': cena(fotoDoEmblema, 'emblema-pinheiro.jpg'),
  'foto-miniatura': cena(miniaturaDoEmblema, 'emblema-mensagem.jpg', fotoDoEmblema),
};
