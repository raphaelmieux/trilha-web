import { useState, type ComponentType } from 'react';
import { CSS_DO_EDITOR_DE_DESIGN, EditorDeDesign } from '../labs/editorDeDesign';
import type { Arte, Forma, Paleta, Prancha, Texto } from '../labs/design';
import { COR_DA_SITUACAO } from '../labs/arteDoClube';

/*
 * As cenas do editor de design: a janela que as veredas de design abrem, com
 * peças de exemplo.
 *
 * Aqui se monta a janela direto, sem o laboratório em volta: o editor já é um
 * programa inteiro — arquivo, seleção, desfazer — e não precisa de nada do
 * exercício para funcionar. As peças são outras que as das lições: a noite de
 * talentos, o convite do Dia das Mães, a saída para o campori. A lição de
 * hierarquia pede degraus no cartaz do acampamento; mostrar o cartaz do
 * acampamento com degraus seria mostrar a resposta.
 */

const TINTA = '#1F2A24';
const BRANCO = '#FFFFFF';
const SEM_PALETA: Paleta = { fundo: null, texto: null, destaque: null, apoio: null, neutro: null };

const texto = (id: string, nome: string, t: string, x: number, y: number, largura: number,
  extra: Partial<Texto> = {}): Texto => ({
  id, nome, tipo: 'texto', texto: t, x, y, largura,
  familia: 'Arial', peso: 400, corpo: 18, entrelinha: 1.4, cor: TINTA, alinhamento: 'esquerda',
  ...extra,
});

const retangulo = (id: string, nome: string, x: number, y: number, largura: number, altura: number,
  preenchimento: string): Forma => ({ id, nome, tipo: 'retangulo', x, y, largura, altura, preenchimento });

const ponto = (id: string, nome: string, x: number, y: number, preenchimento: string): Forma =>
  ({ id, nome, tipo: 'elipse', x, y, largura: 16, altura: 16, preenchimento });

const prancha = (id: string, nome: string, objetos: Prancha['objetos'], fundo = BRANCO): Prancha =>
  ({ id, nome, largura: 480, altura: 680, fundo, objetos });

/* A cena guarda o arquivo, como o laboratório guardaria: o editor só desenha
   o que recebe e devolve o que mudou. */
export const cena = (inicial: Arte, arquivo: string, primeira = inicial.pranchas[0].id) =>
  function CenaDoEditor() {
    const [arte, setArte] = useState(inicial);
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <style>{CSS_DO_EDITOR_DE_DESIGN}</style>
        <EditorDeDesign arte={arte} mudar={setArte} pranchaInicial={primeira} nomeDoArquivo={arquivo} />
      </div>
    );
  };

/* ── Hierarquia: o cartaz da noite de talentos, sem e com degraus ─────────── */

const TALENTOS = {
  titulo: 'Noite de Talentos',
  data: 'Sábado, 23 de agosto, às 19h',
  local: 'No salão da igreja, com entrada livre',
  texto: 'Cada unidade apresenta um número: música, jogral ou teatro. As famílias estão convidadas.',
  clube: 'Clube de Desbravadores Pioneiros',
};

const TALENTOS_PLANO = prancha('plano', 'Sem degraus', [
  texto('titulo', 'Título', TALENTOS.titulo, 32, 56, 416),
  texto('data', 'Data', TALENTOS.data, 32, 124, 416),
  texto('local', 'Local', TALENTOS.local, 32, 170, 416),
  texto('texto', 'Texto', TALENTOS.texto, 32, 214, 416),
  texto('clube', 'Clube', TALENTOS.clube, 32, 600, 416),
]);

const TALENTOS_COM_DEGRAUS = prancha('degraus', 'Com degraus', [
  texto('titulo', 'Título', TALENTOS.titulo, 32, 56, 416, { corpo: 40, peso: 700 }),
  texto('data', 'Data', TALENTOS.data, 32, 124, 416, { corpo: 24, peso: 700, cor: '#C13516' }),
  texto('local', 'Local', TALENTOS.local, 32, 170, 416),
  texto('texto', 'Texto', TALENTOS.texto, 32, 214, 416),
  texto('clube', 'Clube', TALENTOS.clube, 32, 622, 416, { corpo: 14, cor: '#5B625E' }),
]);

/* ── Alinhamento: o convite do Dia das Mães, cada linha num lugar ──────────── */

const CONVITE_TORTO = prancha('convite', 'Convite', [
  texto('titulo', 'Título', 'Homenagem às mães', 32, 60, 400, { corpo: 34, peso: 700 }),
  texto('quando', 'Quando', 'Sábado, 9 de maio', 47, 128, 360, { corpo: 22 }),
  texto('hora', 'Hora', 'Às 16h, depois da reunião', 39, 168, 380, { corpo: 22 }),
  texto('onde', 'Onde', 'No salão da igreja', 58, 208, 360, { corpo: 22 }),
]);

/* ── Proximidade: o aviso da saída para o campori ─────────────────────────── */

const LINHAS_DO_AVISO = [
  ['titulo', 'Título', 'Saída para o campori'],
  ['dia', 'Dia', 'Sexta, 9 de outubro'],
  ['hora', 'Hora', 'Às 18h'],
  ['lugar', 'Lugar', 'No pátio da igreja'],
  ['traga', 'Traga', 'Traga:'],
  ['ficha', 'Ficha', 'A ficha de saúde'],
  ['autorizacao', 'Autorização', 'A autorização assinada'],
  ['saco', 'Saco de dormir', 'O saco de dormir'],
] as const;

const aviso = (id: string, nome: string, ys: number[]) => prancha(id, nome, LINHAS_DO_AVISO.map(([oid, onome, t], i) =>
  texto(oid, onome, t, 32, ys[i], 416, i === 0 ? { corpo: 30, peso: 700 } : i === 4 ? { peso: 700 } : {})));

const AVISO_VAO_IGUAL = aviso('igual', 'Vão igual', [56, 130, 186, 242, 298, 354, 410, 466]);
const AVISO_AGRUPADO = aviso('agrupado', 'Vão que agrupa', [56, 130, 160, 190, 268, 298, 328, 358]);

/* ── Repetição: os três cartões das classes ───────────────────────────────── */

const CARTOES_DESIGUAIS = prancha('classes', 'Classes', [
  retangulo('c1', 'Cartão Amigo', 32, 60, 416, 120, '#F1F4F2'),
  texto('t1', 'Nome Amigo', 'Classe de Amigo', 52, 80, 376, { corpo: 22, peso: 700, cor: '#2E7D4F' }),
  texto('d1', 'Quando Amigo', 'Sábados, das 9h às 10h', 52, 120, 376, { corpo: 16 }),
  retangulo('c2', 'Cartão Companheiro', 32, 210, 416, 120, '#F1F4F2'),
  texto('t2', 'Nome Companheiro', 'Classe de Companheiro', 52, 230, 376, { corpo: 25, familia: 'Georgia', cor: '#7A4A22' }),
  texto('d2', 'Quando Companheiro', 'Sábados, das 10h às 11h', 52, 272, 376, { corpo: 16 }),
  retangulo('c3', 'Cartão Pesquisador', 32, 360, 416, 120, '#F1F4F2'),
  texto('t3', 'Nome Pesquisador', 'Classe de Pesquisador', 52, 380, 376, { corpo: 19, peso: 700, familia: 'Verdana', cor: '#1F4E8C' }),
  texto('d3', 'Quando Pesquisador', 'Domingos, das 9h às 10h', 52, 418, 376, { corpo: 16 }),
]);

/* ── Espaço negativo: o título colado na borda ────────────────────────────── */

const FEIRA_SEM_MARGEM = prancha('feira', 'Feira', [
  texto('titulo', 'Título', 'Feira de Especialidades', 4, 4, 460, { corpo: 30, peso: 700 }),
  texto('quando', 'Quando', 'Domingo, 14 de setembro, das 9h ao meio-dia', 32, 110, 416, { corpo: 18 }),
  texto('texto', 'Texto', 'Cada unidade monta uma mesa com o que aprendeu: nós, primeiros socorros, astronomia e culinária.', 32, 160, 416),
]);

/* ── Cor: a paleta da unidade Jatobá e o verde que não se imprime ────────────────── */

const PALETA_DA_UNIDADE: Paleta = {
  fundo: BRANCO, texto: TINTA, destaque: '#2E7D4F', apoio: '#76B290', neutro: '#8A938E',
};

const ACAMPAMENTO_DA_UNIDADE = prancha('cartaz', 'Cartaz da unidade', [
  retangulo('faixa', 'Faixa', 0, 0, 480, 150, '#76B290'),
  texto('titulo', 'Título', 'Acampamento Jatobá', 32, 52, 416, { corpo: 34, peso: 700 }),
  texto('data', 'Data', '17 a 19 de outubro', 32, 180, 416, { corpo: 24, peso: 700, cor: '#2E7D4F' }),
  texto('texto', 'Texto', 'Barracas, trilha e fogueira na chácara da regional.', 32, 226, 416),
  texto('rodape', 'Rodapé', 'Unidade Jatobá — Clube Pioneiros', 32, 630, 416, { corpo: 14, cor: '#8A938E' }),
]);

const NEON = prancha('neon', 'Cartaz da gincana', [
  retangulo('fundo', 'Fundo escuro', 0, 0, 480, 680, '#1D2B22'),
  texto('titulo', 'Título', 'Gincana Noturna', 32, 60, 416, { corpo: 44, peso: 700, cor: '#39FF14' }),
  texto('data', 'Data', 'Sexta, 5 de setembro, às 20h', 32, 140, 416, { corpo: 22, cor: BRANCO }),
]);

/* ── Letras: o folheto de boas-vindas ─────────────────────────────────────── */

const PARAGRAFO = 'O primeiro sábado no clube começa com a chamada por unidade, segue com a aula da classe e termina com o jogo no pátio. Traga o caderno e um lápis, e chegue dez minutos antes.';

const FOLHETO = prancha('folheto', 'Georgia + Arial', [
  texto('titulo', 'Título', 'Bem-vindo ao clube', 32, 56, 416, { corpo: 34, peso: 700, familia: 'Georgia' }),
  texto('texto', 'Texto', PARAGRAFO, 32, 120, 416, { corpo: 16, entrelinha: 1 }),
]);

const FOLHETO_EM_CONFLITO = prancha('conflito', 'Arial + Verdana', [
  texto('titulo', 'Título', 'Bem-vindo ao clube', 32, 56, 416, { corpo: 34, peso: 700, familia: 'Arial' }),
  texto('texto', 'Texto', PARAGRAFO, 32, 120, 416, { corpo: 16, familia: 'Verdana', entrelinha: 1.5 }),
]);

/* ── Contraste medido ─────────────────────────────────────────────────────── */

const MEDIDAS = prancha('medidas', 'Aviso da cantina', [
  texto('titulo', 'Título amarelo', 'Cantina aberta', 32, 56, 416, { corpo: 40, peso: 700, cor: '#E8C547' }),
  texto('hora', 'Hora cinza', 'Das 19h às 22h, nas três noites', 32, 130, 416, { cor: '#999999' }),
  texto('raspando', 'Texto #767676', 'Pastel, suco, pipoca e água gelada.', 32, 180, 416, { cor: '#767676' }),
  texto('quase', 'Texto #808080', 'O dinheiro vai para a viagem das unidades.', 32, 224, 416, { cor: '#808080' }),
]);

/* ── A cor que não carrega sozinha: a lista da caminhada ──────────────────── */

/* As cores da escala da cantina: a lista é outra, e o par de cores é o mesmo
   que a teoria mede. */
const VERDE = COR_DA_SITUACAO.confirmado;
const VERMELHO = COR_DA_SITUACAO.cancelado;
const AMARELO = COR_DA_SITUACAO.pendente;
const NOMES = [['Ana Clara', VERDE, 'confirmou'], ['Davi', VERMELHO, 'não vai'], ['Lucas', AMARELO, 'sem resposta'], ['Sara', VERDE, 'confirmou'], ['Tiago', VERMELHO, 'não vai']] as const;

const lista = (id: string, nome: string, comPalavra: boolean) => prancha(id, nome, [
  texto('titulo', 'Título', 'Caminhada de sábado', 32, 56, 416, { corpo: 30, peso: 700 }),
  ...NOMES.flatMap(([n, cor, palavra], i) => [
    ponto(`p${i}`, `Ponto ${n}`, 32, 134 + i * 44, cor),
    texto(`n${i}`, n, comPalavra ? `${n} — ${palavra}` : n, 60, 128 + i * 44, 380),
  ]),
]);

/* ── Refazer sem perder: o convite que vai ser refeito ────────────────────── */

const ANIVERSARIO = prancha('aniversario', 'Convite do aniversário', [
  texto('titulo', 'Título', '15 anos do clube', 60, 40, 380, { corpo: 26, familia: 'Brush Script MT', cor: '#E8C547', alinhamento: 'centro' }),
  texto('data', 'Data', 'Domingo, 30 de novembro', 90, 90, 300, { corpo: 26, alinhamento: 'centro' }),
  texto('hora', 'Hora', 'Às 17h, no salão', 120, 140, 240, { corpo: 18, cor: '#999999', alinhamento: 'centro' }),
]);

export const CENAS_DE_DESIGN: Record<string, ComponentType> = {
  'design-talentos': cena({ pranchas: [TALENTOS_PLANO, TALENTOS_COM_DEGRAUS], paleta: SEM_PALETA }, 'noite-de-talentos'),
  'design-convite-torto': cena({ pranchas: [CONVITE_TORTO], paleta: SEM_PALETA }, 'convite-dia-das-maes'),
  'design-aviso': cena({ pranchas: [AVISO_VAO_IGUAL, AVISO_AGRUPADO], paleta: SEM_PALETA }, 'aviso-do-campori'),
  'design-classes': cena({ pranchas: [CARTOES_DESIGUAIS], paleta: SEM_PALETA }, 'programacao-das-classes'),
  'design-feira': cena({ pranchas: [FEIRA_SEM_MARGEM], paleta: SEM_PALETA }, 'feira-de-especialidades'),
  'design-paleta': cena({ pranchas: [ACAMPAMENTO_DA_UNIDADE], paleta: PALETA_DA_UNIDADE }, 'cartaz-da-unidade-jatoba'),
  'design-neon': cena({ pranchas: [NEON], paleta: { fundo: '#1D2B22', texto: BRANCO, destaque: '#39FF14', apoio: '#2F5A3D', neutro: '#8A938E' } }, 'cartaz-da-gincana'),
  'design-folheto': cena({ pranchas: [FOLHETO, FOLHETO_EM_CONFLITO], paleta: SEM_PALETA }, 'folheto-de-boas-vindas'),
  'design-medidas': cena({ pranchas: [MEDIDAS], paleta: SEM_PALETA }, 'aviso-da-cantina'),
  'design-caminhada': cena({ pranchas: [lista('so-cor', 'Só a cor', false), lista('com-palavra', 'Cor e palavra', true)], paleta: SEM_PALETA }, 'lista-da-caminhada'),
  'design-aniversario': cena({ pranchas: [ANIVERSARIO], paleta: SEM_PALETA }, 'convite-15-anos'),
};
