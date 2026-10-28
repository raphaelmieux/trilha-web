import { useState, type ComponentType } from 'react';
import { FileText, Layers } from 'lucide-react';
import { CSS_DO_EDITOR_DE_DESIGN, EditorDeDesign, type ArquivoExportado } from '../labs/editorDeDesign';
import { BarraDeTarefas, BlocoDeNotas, CSS_DO_BLOCO_DE_NOTAS } from '../labs/blocoDeNotas';
import { comCaixaRefeita, type Arte, type Caminho, type Forma, type Foto, type Grupo, type Objeto, type Prancha, type Texto, type Traco } from '../labs/design';
import { contornoDaElipse, contornoDoPoligono, type Contorno, type Ponto } from '../labs/vetor';
import { cena } from './cenasDeDesign';

/*
 * As cenas da CC-DG002, no mesmo editor de design com as ferramentas de vetor.
 *
 * As peças são outras que as de `arteVetorial.ts`: a casa, a bandeirola e a
 * fatia de melancia no lugar da barraca, da lua e da nuvem; a pedra e a gota
 * no lugar da bandeira e da folha; a bandeira da unidade no lugar dos três
 * ícones. A lição manda combinar, desenhar e agrupar aquelas — mostrar o
 * gesto nelas seria mostrar a resposta.
 */

const SEM_PALETA = { fundo: null, texto: null, destaque: null, apoio: null, neutro: null };

const prancha = (id: string, nome: string, objetos: Objeto[], lado = 400): Prancha =>
  ({ id, nome, largura: lado, altura: lado, fundo: '#FFFFFF', objetos });

const elipse = (id: string, nome: string, x: number, y: number, l: number, a: number, preenchimento: string, traco?: Traco): Forma =>
  ({ id, nome, tipo: 'elipse', x, y, largura: l, altura: a, preenchimento, traco });

const retangulo = (id: string, nome: string, x: number, y: number, l: number, a: number, preenchimento: string, traco?: Traco): Forma =>
  ({ id, nome, tipo: 'retangulo', x, y, largura: l, altura: a, preenchimento, traco });

const caminho = (id: string, nome: string, contornos: Contorno[], preenchimento: string | null, traco: Traco | null = null): Caminho =>
  comCaixaRefeita<Caminho>({ id, nome, tipo: 'caminho', x: 0, y: 0, largura: 0, altura: 0, contornos, preenchimento, traco });

const grupo = (id: string, nome: string, filhos: Objeto[]): Grupo =>
  comCaixaRefeita<Grupo>({ id, nome, tipo: 'grupo', x: 0, y: 0, largura: 0, altura: 0, filhos });

const texto = (id: string, nome: string, t: string, x: number, y: number, largura: number, extra: Partial<Texto> = {}): Texto => ({
  id, nome, tipo: 'texto', texto: t, x, y, largura,
  familia: 'Arial', peso: 700, corpo: 18, entrelinha: 1.2, cor: '#1F2A24', alinhamento: 'esquerda', ...extra,
});

const poligono = (pts: Ponto[]) => contornoDoPoligono(pts);
const aberto = (pts: Ponto[]): Contorno => ({ ...contornoDoPoligono(pts), fechado: false });
const linha = (cor: string, espessura: number, extremidade: Traco['extremidade'] = 'reta'): Traco => ({ cor, espessura, extremidade });

const arte = (...pranchas: Prancha[]): Arte => ({ pranchas, paleta: SEM_PALETA });

/** A estrela de cinco pontas, entre dois raios. */
const estrela = (cx: number, cy: number, r: number): Contorno => poligono(Array.from({ length: 10 }, (_, i) => {
  const raio = i % 2 === 0 ? r : r * 0.45;
  const ang = -Math.PI / 2 + (i * Math.PI) / 5;
  return { x: Math.round(cx + raio * Math.cos(ang)), y: Math.round(cy + raio * Math.sin(ang)) };
}));

/* ── Módulo 1: a estrela e a foto, ampliadas ─────────────────────────────── */

const ESTRELA = prancha('estrela', 'Estrela', [caminho('estrela', 'Estrela', [estrela(50, 46, 40)], '#C9A227')]);
const FOTO = prancha('foto', 'Foto', [{
  id: 'foto', nome: 'Foto do acampamento', tipo: 'foto', motivo: 'barracas',
  x: 6, y: 6, largura: 90, altura: 70, tons: ['#2F4A3A', '#E8EEF2'], resolucao: 18,
} satisfies Foto]);

/* ── Módulo 2: peças soltas que viram três desenhos ───────────────────────── */

const FORMAS = prancha('formas', 'Casa, bandeirola e melancia', [
  retangulo('parede', 'Parede', 40, 120, 120, 90, '#8A5A20'),
  caminho('telhado', 'Telhado', [poligono([{ x: 25, y: 122 }, { x: 100, y: 55 }, { x: 175, y: 122 }])], '#B5652A'),
  retangulo('pano', 'Bandeirola', 220, 60, 150, 70, '#1F6FB2'),
  caminho('corte', 'Bandeirola — o que sai', [poligono([{ x: 375, y: 55 }, { x: 330, y: 95 }, { x: 375, y: 135 }])], '#9AA0A6'),
  elipse('melancia', 'Melancia', 220, 230, 150, 150, '#D9412B'),
  retangulo('metade', 'Melancia — o que fica', 205, 305, 180, 90, '#9AA0A6'),
]);

/* ── Módulo 3: a pedra, e a prancha vazia da gota ─────────────────────────── */

const PEDRA = prancha('pedra', 'Pedra', [caminho('pedra', 'Pedra', [contornoDaElipse(80, 110, 240, 160)], '#8A938E')]);
const GOTA = prancha('gota', 'Gota', []);

/* ── Módulo 4: preenchimento, traço e as três pontas ──────────────────────── */

const ETIQUETA = prancha('etiqueta', 'Etiqueta e mapa', [
  retangulo('etiqueta', 'Etiqueta da mochila', 60, 50, 230, 120, '#F2E3B3', linha('#7A4B12', 6)),
  caminho('mapa', 'Caminho do mapa', [aberto([{ x: 50, y: 300 }, { x: 140, y: 230 }, { x: 230, y: 320 }, { x: 340, y: 250 }])],
    null, linha('#1B4D3E', 8, 'redonda')),
]);

const PONTAS = prancha('pontas', 'Três pontas', [
  retangulo('fim-a', 'Onde o caminho começa', 99, 40, 2, 320, '#C13516'),
  retangulo('fim-b', 'Onde o caminho termina', 299, 40, 2, 320, '#C13516'),
  caminho('reta', 'Ponta reta', [aberto([{ x: 100, y: 100 }, { x: 300, y: 100 }])], null, linha('#1F2A24', 36, 'reta')),
  caminho('redonda', 'Ponta redonda', [aberto([{ x: 100, y: 200 }, { x: 300, y: 200 }])], null, linha('#1F2A24', 36, 'redonda')),
  caminho('quadrada', 'Ponta quadrada', [aberto([{ x: 100, y: 300 }, { x: 300, y: 300 }])], null, linha('#1F2A24', 36, 'quadrada')),
]);

/* ── Módulo 5: a bandeira da unidade, e três ícones da mochila ────────────── */

const BANDEIRA = prancha('bandeira', 'Bandeira da unidade', [
  retangulo('mastro', 'Mastro', 120, 60, 12, 250, '#7A4B12'),
  caminho('pano', 'Pano', [poligono([{ x: 132, y: 62 }, { x: 270, y: 105 }, { x: 132, y: 148 }])], '#C13516'),
  retangulo('base', 'Base', 90, 306, 72, 16, '#4A4F4C'),
]);

const MOCHILA = prancha('mochila', 'Ícones da mochila', [
  grupo('lanterna', 'Lanterna', [
    retangulo('l-corpo', 'Corpo', 40, 150, 40, 90, '#1F6FB2'),
    elipse('l-luz', 'Luz', 30, 125, 60, 36, '#F2C14E'),
  ]),
  grupo('cantil', 'Cantil', [
    elipse('c-corpo', 'Corpo', 150, 210, 80, 90, '#3F8F3F'),
    retangulo('c-tampa', 'Tampa', 178, 196, 24, 18, '#4A4F4C'),
  ]),
  grupo('bussola', 'Bússola', [
    elipse('b-caixa', 'Caixa', 290, 120, 80, 80, '#C9A227'),
    caminho('b-agulha', 'Agulha', [poligono([{ x: 330, y: 130 }, { x: 340, y: 160 }, { x: 330, y: 190 }, { x: 320, y: 160 }])], '#C13516'),
  ]),
]);

/* ── Módulo 6: o nome em Space Mono, e o subtítulo em Arial ───────────────── */

const NOME = prancha('nome', 'Nome do evento', [
  texto('nome', 'Nome do evento', 'CAMPORI', 40, 120, 320, { familia: 'Space Mono', corpo: 56, cor: '#1B4D3E' }),
  texto('sub', 'Subtítulo', 'Regional Centro-Oeste', 40, 210, 320, { peso: 400, corpo: 22 }),
]);

/* ── Módulo 7: o escudo da unidade, e a estrela que se estica ─────────────── */

const ESCUDO = [
  retangulo('e-topo', 'Topo do escudo', 120, 60, 160, 120, '#1B4D3E'),
  caminho('e-ponta', 'Ponta do escudo', [poligono([{ x: 120, y: 180 }, { x: 280, y: 180 }, { x: 200, y: 280 }])], '#1B4D3E'),
  elipse('e-sol', 'Sol', 160, 90, 80, 80, '#F2C14E'),
];
const LOGO = prancha('escudo', 'Escudo da unidade', ESCUDO);
const PROPORCAO = prancha('proporcao', 'Escudo e estrela', [
  grupo('escudo', 'Escudo', [
    retangulo('g-topo', 'Topo do escudo', 40, 40, 96, 72, '#1B4D3E'),
    caminho('g-ponta', 'Ponta do escudo', [poligono([{ x: 40, y: 112 }, { x: 136, y: 112 }, { x: 88, y: 172 }])], '#1B4D3E'),
    elipse('g-sol', 'Sol', 64, 58, 48, 48, '#F2C14E'),
  ]),
  caminho('estrela', 'Estrela', [estrela(300, 100, 50)], '#C9A227'),
]);

/* ── Módulo 8: a lanterna, com detalhe e sem ─────────────────────────────── */

const LANTERNA_DETALHADA = prancha('detalhada', 'Lanterna com detalhes', [
  elipse('fundo', 'Fundo', 16, 16, 224, 224, '#1B4D3E'),
  retangulo('corpo', 'Corpo', 104, 120, 48, 90, '#F2C14E'),
  retangulo('alca', 'Alça', 112, 100, 32, 6, '#F2C14E'),
  retangulo('janela', 'Janelinha', 122, 140, 12, 10, '#1B4D3E'),
  retangulo('raio-1', 'Raio 1', 126, 44, 4, 40, '#FFFFFF'),
  retangulo('raio-2', 'Raio 2', 80, 70, 30, 4, '#FFFFFF'),
  retangulo('raio-3', 'Raio 3', 146, 70, 30, 4, '#FFFFFF'),
], 256);
const LANTERNA_SIMPLES = prancha('simples', 'Lanterna simples', [
  elipse('fundo', 'Fundo', 16, 16, 224, 224, '#1B4D3E'),
  elipse('luz', 'Luz', 78, 46, 100, 70, '#FFFFFF'),
  retangulo('corpo', 'Corpo', 92, 100, 72, 110, '#F2C14E'),
], 256);

/* ── Módulo 9: a placa de saída, que vira texto ──────────────────────────── */

const SAIDA = prancha('saida', 'Placa de saída', [
  retangulo('placa', 'Placa', 16, 16, 224, 224, '#3F8F3F'),
  caminho('seta', 'Seta', [poligono([{ x: 60, y: 110 }, { x: 140, y: 110 }, { x: 140, y: 80 }, { x: 200, y: 128 }, { x: 140, y: 176 }, { x: 140, y: 146 }, { x: 60, y: 146 }])], '#FFFFFF'),
  retangulo('faixa', 'Faixa', 40, 200, 176, 16, '#FFFFFF'),
], 256);

/** O editor de design e o editor de texto, lendo a mesma pasta, como na lição. */
const desenhoETexto = () => function DesenhoETexto() {
  const [a, setA] = useState(arte(SAIDA));
  const [tela, setTela] = useState<'design' | 'texto'>('design');
  const [pasta, setPasta] = useState<ArquivoExportado[]>([]);
  const [aberto, setAberto] = useState<string | null>(null);
  const exportar = (x: ArquivoExportado) => { setPasta(p => [...p.filter(y => y.nome !== x.nome), x]); setAberto(x.nome); };
  const salvar = (nome: string, conteudo: string) => setPasta(p => p.map(y => (y.nome === nome ? { ...y, conteudo } : y)));
  const svgs = pasta.filter(x => x.tipo === 'svg');
  const atual = svgs.find(x => x.nome === aberto) ?? null;
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <style>{CSS_DO_EDITOR_DE_DESIGN}</style>
      <style>{CSS_DO_BLOCO_DE_NOTAS}</style>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: tela === 'design' ? 'contents' : 'none' }}>
          <EditorDeDesign arte={a} mudar={setA} pranchaInicial="saida" nomeDoArquivo="placas-do-acampamento"
            aoExportar={exportar} svgsParaReabrir={svgs.map(x => ({ nome: x.nome, conteudo: x.conteudo }))} />
        </div>
        {tela === 'texto' && (
          <BlocoDeNotas aberto={atual ? { nome: atual.nome, conteudo: atual.conteudo } : null}
            naPasta={svgs.map(x => ({ nome: x.nome, conteudo: x.conteudo }))}
            aoAbrir={setAberto} aoSalvar={salvar} pasta="Desenhos" />
        )}
      </div>
      <BarraDeTarefas programas={[
        { id: 'design' as const, nome: 'Editor de design', icone: Layers },
        { id: 'texto' as const, nome: 'Editor de texto', icone: FileText },
      ]} atual={tela} aoTrocar={setTela} />
    </div>
  );
};

export const CENAS_VETORIAIS: Record<string, ComponentType> = {
  'vetor-estrela-e-foto': cena(arte(ESTRELA, FOTO), 'estrela-e-foto'),
  'vetor-formas': cena(arte(FORMAS), 'pecas-para-combinar'),
  'vetor-pedra': cena(arte(PEDRA), 'pedra-e-gota'),
  'vetor-gota': cena(arte(GOTA), 'pedra-e-gota'),
  'vetor-etiqueta': cena(arte(ETIQUETA), 'etiqueta-e-mapa'),
  'vetor-pontas': cena(arte(PONTAS), 'tres-pontas'),
  'vetor-bandeira': cena(arte(BANDEIRA), 'bandeira-da-unidade'),
  'vetor-mochila': cena(arte(MOCHILA), 'icones-da-mochila'),
  'vetor-nome': cena(arte(NOME), 'nome-do-campori'),
  'vetor-escudo': cena(arte(LOGO), 'escudo-da-unidade'),
  'vetor-proporcao': cena(arte(PROPORCAO), 'escudo-da-unidade'),
  'vetor-lanterna': cena(arte(LANTERNA_DETALHADA, LANTERNA_SIMPLES), 'icone-da-lanterna'),
  'vetor-svg': desenhoETexto(),
};
