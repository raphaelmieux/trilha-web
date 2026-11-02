import type { CSSProperties } from 'react';
import {
  AArrowDown, AArrowUp, Accessibility, AlignCenter, AlignJustify, AlignLeft, AlignRight, AppWindow,
  ArrowDownAZ, ArrowUpDown, ArrowUpZA, BarChart3, BookMarked, BookOpen, Bookmark, Box, Brush,
  Calculator, Calendar, Camera, CaseSensitive, ChartColumn, ChartLine, ChartPie, ChartScatter,
  ChevronDown, ChevronUp, CircleHelp, ClipboardPaste, Clapperboard, Columns2, Combine, Copy, Crop,
  Database, DollarSign, Droplet, Eraser, Eye, File, FilePlus2, FileText, Filter, Focus, Frame,
  Globe, Grid2x2, Grid3x3, Group, Hand, Hash, Highlighter, Image, Images, IndentDecrease,
  IndentIncrease, Languages, Layers, LayoutGrid, LayoutTemplate, Lightbulb, Link, List, ListChecks,
  ListFilter, ListOrdered, ListTree, Lock, Mail, Maximize2, Merge, MessageSquare,
  MessageSquarePlus, Mic, Minus, Monitor, MonitorPlay, MousePointer2, Music, Omega, PaintBucket,
  Paintbrush, Palette, PanelBottom, PanelLeft, PanelTop, Pen, PenLine, PenTool, Percent, Pilcrow,
  Play, Plus, Puzzle, RefreshCw, Replace, RotateCw, Rows3, Ruler, Scissors, Search, ShieldCheck,
  Shapes, Sigma, SlidersHorizontal, Smile, Snowflake, Sparkles, SpellCheck, Square, SquareDashed,
  Star, Strikethrough, Subscript, Superscript, Table, Tags, Timer, Trash2, TrendingUp, Type, Users,
  Video, Volume2, Wand2, Workflow, WrapText, X, ZoomIn, Undo2, Redo2, type LucideIcon,
} from 'lucide-react';

/*
 * O que é do Office e não é da tela: os três programas, a frase de quem clica
 * num comando que não faz parte, e a faixa inteira de cada guia de cada um.
 *
 * Mora fora de `office.tsx` porque é dado, e não componente — e a tela recarrega
 * sozinha no servidor de desenvolvimento só quando o arquivo dela exporta
 * componente e nada mais.
 */

/* ── Os três programas ────────────────────────────────────────────────────── */

export type AppDoOffice = 'word' | 'excel' | 'powerpoint' | 'access';

/**
 * Nome, letra e cor de cada programa.
 *
 * As cores são as que os três laboratórios já usavam na faixa e nos botões —
 * as do tema clássico do Office —, e não as do logotipo novo: trocar aqui
 * deixaria a guia ativa de uma cor e os botões marcados de outra.
 */
export const APPS_DO_OFFICE: Record<AppDoOffice, {
  nome: string; letra: string; cor: string; escuro: string;
}> = {
  word: { nome: 'Word', letra: 'W', cor: '#2B579A', escuro: '#1E3F73' },
  excel: { nome: 'Excel', letra: 'X', cor: '#217346', escuro: '#185C37' },
  powerpoint: { nome: 'PowerPoint', letra: 'P', cor: '#B7472A', escuro: '#923820' },
  access: { nome: 'Access', letra: 'A', cor: '#A4373A', escuro: '#7E2A2C' },
};

/** As variáveis de cor que a folha lê, para pôr na raiz de cada peça. */
export function corDoApp(app: AppDoOffice): CSSProperties {
  const a = APPS_DO_OFFICE[app];
  return { '--of-cor': a.cor, '--of-escuro': a.escuro } as CSSProperties;
}

/** A frase de quem clica num comando que existe e não faz parte do exercício. */
export function naoFazParte(app: AppDoOffice, comando: string): string {
  return `${comando} existe no ${APPS_DO_OFFICE[app].nome} de verdade, e está aqui para a faixa ficar igual — mas não faz parte deste exercício.`;
}

/** Um comando da faixa. Sem ícone, desenha a letra; com `combo`, uma caixa. */
export interface Comando {
  r: string;
  I?: LucideIcon;
  /** A letra no lugar do ícone — N, I, S, x², A. */
  letra?: string;
  letraEstilo?: CSSProperties;
  /** A cor da tira embaixo do ícone: realce e cor da fonte. */
  cor?: string;
  seta?: boolean;
  /** Largura da caixa de combinação, com o texto dentro dela. */
  combo?: number;
  valor?: string;
}

export type Bloco =
  | { t: 'grande'; c: Comando }
  | { t: 'pilha'; c: Comando[] }
  | { t: 'linhas'; c: Comando[][] }
  | { t: 'galeria'; c: { nome: string; amostra?: string; estilo?: CSSProperties }[] };

export interface GrupoPadrao {
  nome: string;
  blocos: Bloco[];
  /** A setinha no canto do grupo, que abre a caixa completa. */
  lancador?: boolean;
}

const g = (r: string, I: LucideIcon, seta?: boolean): Bloco => ({ t: 'grande', c: { r, I, seta } });
const p = (...c: Comando[]): Bloco => ({ t: 'pilha', c });
const l = (...c: Comando[][]): Bloco => ({ t: 'linhas', c });
const c = (r: string, I?: LucideIcon, extra: Partial<Comando> = {}): Comando => ({ r, I, ...extra });
const combo = (r: string, valor: string, largura: number): Comando => ({ r, valor, combo: largura });
const letra = (r: string, txt: string, estilo?: CSSProperties, extra: Partial<Comando> = {}): Comando =>
  ({ r, letra: txt, letraEstilo: estilo, ...extra });
const galeria = (...nomes: (string | { nome: string; amostra?: string; estilo?: CSSProperties })[]): Bloco =>
  ({ t: 'galeria', c: nomes.map(n => (typeof n === 'string' ? { nome: n } : n)) });

/* As peças que se repetem entre os três. */
const AREA_DE_TRANSFERENCIA: GrupoPadrao = {
  nome: 'Área de Transferência', lancador: true,
  blocos: [g('Colar', ClipboardPaste, true), p(c('Recortar', Scissors), c('Copiar', Copy, { seta: true }), c('Pincel de Formatação', Paintbrush))],
};
const N_I_S = [
  letra('Negrito (Ctrl+N)', 'N', { fontWeight: 700 }),
  letra('Itálico (Ctrl+I)', 'I', { fontStyle: 'italic', fontFamily: 'Georgia, serif' }),
  letra('Sublinhado (Ctrl+S)', 'S', { textDecoration: 'underline' }, { seta: true }),
];
const COR_DA_FONTE = letra('Cor da Fonte', 'A', { fontWeight: 600 }, { cor: '#E81123', seta: true });
const REALCE = c('Cor do Realce do Texto', Highlighter, { cor: '#FFFF00', seta: true });
const DESENHAR: GrupoPadrao[] = [
  { nome: 'Ferramentas de Desenho', blocos: [g('Desenhar com o Toque', Hand), g('Borracha', Eraser), g('Caneta', PenTool, true), g('Lápis', PenLine, true), g('Marca-texto', Highlighter, true)] },
  { nome: 'Converter', blocos: [g('Tinta em Forma', Shapes), g('Tinta em Matemática', Sigma)] },
  { nome: 'Reproduzir', blocos: [g('Reprodução de Tinta', Play)] },
];
const AJUDA: GrupoPadrao[] = [
  { nome: 'Ajuda', blocos: [g('Ajuda', CircleHelp), g('Contatar o Suporte', Users), g('Comentários', MessageSquare), g('Mostrar Treinamento', MonitorPlay), g('Novidades', Sparkles)] },
];
const EDICAO: GrupoPadrao = {
  nome: 'Edição',
  blocos: [p(c('Localizar', Search, { seta: true }), c('Substituir', Replace), c('Selecionar', MousePointer2, { seta: true }))],
};
const VOZ: GrupoPadrao = { nome: 'Voz', blocos: [g('Ditar', Mic, true)] };

const FAIXAS_DO_WORD: Record<string, GrupoPadrao[]> = {
  'Início': [
    AREA_DE_TRANSFERENCIA,
    {
      nome: 'Fonte', lancador: true,
      blocos: [l(
        [combo('Fonte', 'Aptos (Corpo)', 128), combo('Tamanho da Fonte', '11', 44), c('Aumentar Tamanho da Fonte', AArrowUp), c('Diminuir Tamanho da Fonte', AArrowDown), c('Maiúsculas e Minúsculas', CaseSensitive, { seta: true }), c('Limpar Toda a Formatação', Eraser)],
        [...N_I_S, c('Tachado', Strikethrough), c('Subscrito', Subscript), c('Sobrescrito', Superscript), c('Efeitos de Texto e Tipografia', Sparkles, { seta: true }), REALCE, COR_DA_FONTE],
      )],
    },
    {
      nome: 'Parágrafo', lancador: true,
      blocos: [l(
        [c('Marcadores', List, { seta: true }), c('Numeração', ListOrdered, { seta: true }), c('Lista de Vários Níveis', ListTree, { seta: true }), c('Diminuir Recuo', IndentDecrease), c('Aumentar Recuo', IndentIncrease), c('Classificar', ArrowDownAZ), c('Mostrar Tudo (Ctrl+*)', Pilcrow)],
        [c('Alinhar à Esquerda (Ctrl+Q)', AlignLeft), c('Centralizar (Ctrl+E)', AlignCenter), c('Alinhar à Direita (Ctrl+G)', AlignRight), c('Justificar (Ctrl+J)', AlignJustify), c('Espaçamento de Linha e Parágrafo', ArrowUpDown, { seta: true }), c('Sombreamento', PaintBucket, { seta: true }), c('Bordas', Grid2x2, { seta: true })],
      )],
    },
    {
      nome: 'Estilos', lancador: true,
      blocos: [galeria(
        { nome: 'Normal', amostra: 'AaBbCcDd' },
        { nome: 'Sem Espaçamento', amostra: 'AaBbCcDd' },
        { nome: 'Título 1', amostra: 'AaBbCc', estilo: { color: '#0F4761', fontSize: 16 } },
        { nome: 'Título 2', amostra: 'AaBbCcD', estilo: { color: '#0F4761' } },
        { nome: 'Título', amostra: 'AaB', estilo: { fontSize: 20 } },
      )],
    },
    EDICAO, VOZ,
    { nome: 'Editor', blocos: [g('Editor', SpellCheck)] },
    { nome: 'Suplementos', blocos: [g('Suplementos', Puzzle)] },
  ],
  'Inserir': [
    { nome: 'Páginas', blocos: [p(c('Folha de Rosto', FileText, { seta: true }), c('Página em Branco', File), c('Quebra de Página', SquareDashed))] },
    { nome: 'Tabelas', blocos: [g('Tabela', Table, true)] },
    { nome: 'Ilustrações', blocos: [g('Imagens', Image, true), g('Formas', Shapes, true), g('Ícones', Smile), g('Modelos 3D', Box, true), p(c('SmartArt', Workflow), c('Gráfico', BarChart3), c('Instantâneo', Camera, { seta: true }))] },
    { nome: 'Mídia', blocos: [g('Vídeo Online', Video)] },
    { nome: 'Links', blocos: [p(c('Link', Link, { seta: true }), c('Indicador', Bookmark), c('Referência Cruzada', Combine))] },
    { nome: 'Comentários', blocos: [g('Comentário', MessageSquarePlus)] },
    { nome: 'Cabeçalho e Rodapé', blocos: [p(c('Cabeçalho', PanelTop, { seta: true }), c('Rodapé', PanelBottom, { seta: true }), c('Número de Página', Hash, { seta: true }))] },
    { nome: 'Texto', blocos: [g('Caixa de Texto', Type, true), l([c('Partes Rápidas', LayoutTemplate, { seta: true }), c('WordArt', Wand2, { seta: true })], [c('Letra Capitular', CaseSensitive, { seta: true }), c('Linha de Assinatura', PenLine, { seta: true })], [c('Data e Hora', Calendar), c('Objeto', Box, { seta: true })])] },
    { nome: 'Símbolos', blocos: [p(c('Equação', Sigma, { seta: true }), c('Símbolo', Omega, { seta: true }))] },
  ],
  'Desenhar': DESENHAR,
  'Design': [
    { nome: 'Formatação do Documento', blocos: [g('Temas', Palette, true), galeria({ nome: 'Título', amostra: 'Aa' }, { nome: 'Básico', amostra: 'Aa' }, { nome: 'Linhas', amostra: 'Aa' }, { nome: 'Sombreado', amostra: 'Aa' }), p(c('Cores', Droplet, { seta: true }), c('Fontes', Type, { seta: true })), p(c('Espaçamento entre Parágrafos', ArrowUpDown, { seta: true }), c('Efeitos', Sparkles, { seta: true }), c('Definir como Padrão', Star))] },
    { nome: 'Plano de Fundo da Página', blocos: [g("Marca-d'água", Droplet, true), g('Cor da Página', PaintBucket, true), g('Bordas de Página', Frame)] },
  ],
  'Layout': [
    { nome: 'Configurar Página', lancador: true, blocos: [g('Margens', Frame, true), g('Orientação', RotateCw, true), g('Tamanho', File, true), g('Colunas', Columns2, true), p(c('Quebras', SquareDashed, { seta: true }), c('Números de Linha', ListOrdered, { seta: true }), c('Hifenização', Minus, { seta: true }))] },
    { nome: 'Parágrafo', lancador: true, blocos: [l([letra('Recuo à Esquerda', 'Recuo', { fontSize: 11, color: '#616161' }), combo('Esquerda', '0 cm', 64), combo('Direita', '0 cm', 64)], [letra('Espaçamento', 'Espaç.', { fontSize: 11, color: '#616161' }), combo('Antes', '0 pt', 64), combo('Depois', '8 pt', 64)])] },
    { nome: 'Organizar', blocos: [g('Posição', LayoutGrid, true), g('Quebra de Texto Automática', WrapText, true), p(c('Avançar', Layers, { seta: true }), c('Recuar', Layers, { seta: true }), c('Painel de Seleção', PanelLeft)), p(c('Alinhar', AlignLeft, { seta: true }), c('Agrupar', Group, { seta: true }), c('Girar', RotateCw, { seta: true }))] },
  ],
  'Referências': [
    { nome: 'Sumário', blocos: [g('Sumário', ListTree, true), p(c('Adicionar Texto', Plus, { seta: true }), c('Atualizar Sumário', RefreshCw))] },
    { nome: 'Notas de Rodapé', lancador: true, blocos: [g('Inserir Nota de Rodapé', PanelBottom), p(c('Inserir Nota de Fim', FileText), c('Próxima Nota de Rodapé', ChevronDown, { seta: true }), c('Mostrar Notas', Eye))] },
    { nome: 'Pesquisa', blocos: [g('Pesquisar', Search), g('Pesquisador', BookOpen)] },
    { nome: 'Citações e Bibliografia', blocos: [g('Inserir Citação', MessageSquare, true), p(c('Gerenciar Fontes', BookMarked), combo('Estilo', 'APA', 64), c('Bibliografia', BookOpen, { seta: true }))] },
    { nome: 'Legendas', blocos: [g('Inserir Legenda', Tags), p(c('Inserir Índice de Ilustrações', Images), c('Atualizar Tabela', RefreshCw), c('Referência Cruzada', Combine))] },
    { nome: 'Índice', blocos: [g('Marcar Entrada', Tags), p(c('Inserir Índice', ListChecks), c('Atualizar Índice', RefreshCw))] },
  ],
  'Correspondências': [
    { nome: 'Criar', blocos: [g('Envelopes', Mail), g('Etiquetas', Tags)] },
    { nome: 'Iniciar Mala Direta', blocos: [g('Iniciar Mala Direta', FilePlus2, true), g('Selecionar Destinatários', Users, true), g('Editar Lista de Destinatários', Pen)] },
    { nome: 'Gravar e Inserir Campos', blocos: [g('Realçar Campos de Mesclagem', Highlighter), g('Bloco de Endereço', FileText), g('Linha de Saudação', Type), g('Inserir Campo de Mesclagem', Plus, true)] },
    { nome: 'Visualizar Resultados', blocos: [g('Visualizar Resultados', Eye), p(c('Localizar Destinatário', Search), c('Verificar Erros', ShieldCheck))] },
    { nome: 'Concluir', blocos: [g('Concluir e Mesclar', Merge, true)] },
  ],
  'Revisão': [
    { nome: 'Revisão de Texto', blocos: [g('Editor', SpellCheck), p(c('Dicionário de Sinônimos', BookOpen), c('Contagem de Palavras', Hash))] },
    { nome: 'Fala', blocos: [g('Ler em Voz Alta', Volume2)] },
    { nome: 'Acessibilidade', blocos: [g('Verificar Acessibilidade', Accessibility, true)] },
    { nome: 'Idioma', blocos: [g('Traduzir', Languages, true), g('Idioma', Globe, true)] },
    { nome: 'Comentários', blocos: [g('Novo Comentário', MessageSquarePlus), p(c('Excluir', Trash2, { seta: true }), c('Anterior', ChevronUp), c('Próximo', ChevronDown)), g('Mostrar Comentários', MessageSquare, true)] },
    { nome: 'Controle', lancador: true, blocos: [g('Controlar Alterações', PenLine, true), l([combo('Exibir para Revisão', 'Marcação Simples', 118)], [c('Mostrar Marcação', Eye, { seta: true })], [c('Painel de Revisão', PanelLeft, { seta: true })])] },
    { nome: 'Alterações', blocos: [g('Aceitar', ShieldCheck, true), g('Rejeitar', X, true), p(c('Anterior', ChevronUp), c('Próximo', ChevronDown))] },
    { nome: 'Comparar', blocos: [g('Comparar', Columns2, true)] },
    { nome: 'Proteger', blocos: [g('Restringir Edição', Lock)] },
  ],
  'Exibir': [
    { nome: 'Modos de Exibição', blocos: [g('Modo de Leitura', BookOpen), g('Layout de Impressão', FileText), g('Layout da Web', Globe), p(c('Estrutura de Tópicos', ListTree), c('Rascunho', AlignLeft))] },
    { nome: 'Imersivo', blocos: [g('Foco', Focus), g('Leitura Avançada', BookOpen)] },
    { nome: 'Movimentação de Página', blocos: [g('Vertical', ArrowUpDown), g('Lado a Lado', Columns2)] },
    { nome: 'Mostrar', blocos: [p(c('Régua', Ruler), c('Linhas de Grade', Grid3x3), c('Painel de Navegação', PanelLeft))] },
    { nome: 'Zoom', blocos: [g('Zoom', ZoomIn), g('100%', Search), p(c('Uma Página', File), c('Várias Páginas', Columns2), c('Largura da Página', Maximize2))] },
    { nome: 'Janela', blocos: [g('Nova Janela', AppWindow), g('Organizar Tudo', LayoutGrid), g('Dividir', Rows3), p(c('Exibir Lado a Lado', Columns2), c('Rolagem Sincronizada', ArrowUpDown), c('Redefinir Posição da Janela', RefreshCw)), g('Alternar Janelas', AppWindow, true)] },
    { nome: 'Macros', blocos: [g('Macros', Play, true)] },
  ],
  'Ajuda': AJUDA,
};

const FAIXAS_DO_EXCEL: Record<string, GrupoPadrao[]> = {
  'Página Inicial': [
    { nome: 'Desfazer', blocos: [l([c('Desfazer', Undo2, { seta: true })], [c('Refazer', Redo2, { seta: true })])] },
    AREA_DE_TRANSFERENCIA,
    {
      nome: 'Fonte', lancador: true,
      blocos: [l(
        [combo('Fonte', 'Aptos Narrow', 112), combo('Tamanho da Fonte', '11', 44), c('Aumentar Tamanho da Fonte', AArrowUp), c('Diminuir Tamanho da Fonte', AArrowDown)],
        [...N_I_S, c('Bordas', Grid2x2, { seta: true }), c('Cor de Preenchimento', PaintBucket, { cor: '#FFFF00', seta: true }), COR_DA_FONTE],
      )],
    },
    {
      nome: 'Alinhamento', lancador: true,
      blocos: [l(
        [c('Alinhar em Cima', AlignJustify), c('Alinhar no Meio', AlignCenter), c('Alinhar Embaixo', AlignJustify), c('Orientação', RotateCw, { seta: true }), c('Quebrar Texto Automaticamente', WrapText)],
        [c('Alinhar à Esquerda', AlignLeft), c('Centralizar', AlignCenter), c('Alinhar à Direita', AlignRight), c('Diminuir Recuo', IndentDecrease), c('Aumentar Recuo', IndentIncrease), c('Mesclar e Centralizar', Merge, { seta: true })],
      )],
    },
    {
      nome: 'Número', lancador: true,
      blocos: [l(
        [combo('Formato de Número', 'Geral', 110)],
        [c('Formato de Número de Contabilização', DollarSign, { seta: true }), c('Estilo de Porcentagem', Percent), letra('Separador de Milhares', '000', { fontSize: 11 }), letra('Aumentar Casas Decimais', ',0→', { fontSize: 10.5 }), letra('Diminuir Casas Decimais', '←,00', { fontSize: 10.5 })],
      )],
    },
    { nome: 'Estilos', blocos: [p(c('Formatação Condicional', LayoutGrid, { seta: true }), c('Formatar como Tabela', Table, { seta: true }), c('Estilos de Célula', Palette, { seta: true }))] },
    { nome: 'Células', blocos: [p(c('Inserir', Plus, { seta: true }), c('Excluir', Trash2, { seta: true }), c('Formatar', SlidersHorizontal, { seta: true }))] },
    { nome: 'Edição', blocos: [l([c('AutoSoma', Sigma, { seta: true })], [c('Preencher', ArrowUpDown, { seta: true })], [c('Limpar', Eraser, { seta: true })]), g('Classificar e Filtrar', ListFilter, true), g('Localizar e Selecionar', Search, true)] },
    { nome: 'Análise', blocos: [g('Analisar Dados', TrendingUp)] },
  ],
  'Inserir': [
    { nome: 'Tabelas', blocos: [g('Tabela Dinâmica', Table, true), g('Tabelas Dinâmicas Recomendadas', Sparkles), g('Tabela', Grid3x3)] },
    { nome: 'Ilustrações', blocos: [g('Ilustrações', Shapes, true)] },
    { nome: 'Gráficos', lancador: true, blocos: [g('Gráficos Recomendados', BarChart3), l([c('Inserir Gráfico de Colunas ou de Barras', ChartColumn, { seta: true }), c('Inserir Gráfico de Linhas ou de Área', ChartLine, { seta: true }), c('Inserir Gráfico de Pizza ou de Rosca', ChartPie, { seta: true })], [c('Inserir Gráfico de Dispersão (X, Y) ou de Bolhas', ChartScatter, { seta: true }), c('Mapas', Globe, { seta: true }), c('Gráfico Dinâmico', BarChart3, { seta: true })])] },
    { nome: 'Minigráficos', blocos: [p(c('Linha', ChartLine), c('Coluna', ChartColumn), c('Ganhos/Perdas', BarChart3))] },
    { nome: 'Filtros', blocos: [p(c('Segmentação de Dados', Filter), c('Linha do Tempo', Timer))] },
    { nome: 'Links', blocos: [g('Link', Link)] },
    { nome: 'Comentários', blocos: [g('Comentário', MessageSquarePlus)] },
    { nome: 'Texto', blocos: [g('Texto', Type, true)] },
    { nome: 'Símbolos', blocos: [p(c('Equação', Sigma, { seta: true }), c('Símbolo', Omega))] },
  ],
  'Desenhar': DESENHAR,
  'Layout da Página': [
    { nome: 'Temas', blocos: [g('Temas', Palette, true), p(c('Cores', Droplet, { seta: true }), c('Fontes', Type, { seta: true }), c('Efeitos', Sparkles, { seta: true }))] },
    { nome: 'Configurar Página', lancador: true, blocos: [g('Margens', Frame, true), g('Orientação', RotateCw, true), g('Tamanho', File, true), g('Área de Impressão', Crop, true), g('Quebras', SquareDashed, true), g('Plano de Fundo', Image), g('Imprimir Títulos', Rows3)] },
    { nome: 'Dimensionar para Ajustar', lancador: true, blocos: [l([letra('Largura', 'Largura:', { fontSize: 11 }), combo('Largura', 'Automático', 84)], [letra('Altura', 'Altura:', { fontSize: 11 }), combo('Altura', 'Automático', 84)], [letra('Escala', 'Escala:', { fontSize: 11 }), combo('Escala', '100%', 84)])] },
    { nome: 'Opções de Planilha', lancador: true, blocos: [p(c('Linhas de Grade: Exibir', Grid3x3), c('Linhas de Grade: Imprimir', Grid3x3)), p(c('Títulos: Exibir', Columns2), c('Títulos: Imprimir', Columns2))] },
    { nome: 'Organizar', blocos: [p(c('Avançar', Layers, { seta: true }), c('Recuar', Layers, { seta: true }), c('Painel de Seleção', PanelLeft)), p(c('Alinhar', AlignLeft, { seta: true }), c('Agrupar', Group, { seta: true }), c('Girar', RotateCw, { seta: true }))] },
  ],
  'Fórmulas': [
    { nome: 'Biblioteca de Funções', blocos: [g('Inserir Função', Sigma), g('AutoSoma', Sigma, true), g('Usadas Recentemente', Timer, true), g('Financeira', DollarSign, true), g('Lógica', ShieldCheck, true), g('Texto', Type, true), g('Data e Hora', Calendar, true), g('Pesquisa e Referência', Search, true), g('Matemática e Trigonometria', Calculator, true), g('Mais Funções', Plus, true)] },
    { nome: 'Nomes Definidos', blocos: [g('Gerenciador de Nomes', Tags), p(c('Definir Nome', Tags, { seta: true }), c('Usar em Fórmula', Sigma, { seta: true }), c('Criar a partir da Seleção', Table))] },
    { nome: 'Auditoria de Fórmulas', blocos: [p(c('Rastrear Precedentes', TrendingUp), c('Rastrear Dependentes', TrendingUp), c('Remover Setas', X, { seta: true })), p(c('Mostrar Fórmulas', Sigma), c('Verificação de Erros', ShieldCheck, { seta: true }), c('Avaliar Fórmula', Search)), g('Janela de Inspeção', Eye)] },
    { nome: 'Cálculo', blocos: [g('Opções de Cálculo', Calculator, true), p(c('Calcular Agora', RefreshCw), c('Calcular Planilha', RefreshCw))] },
  ],
  'Dados': [
    { nome: 'Obter e Transformar Dados', blocos: [g('Obter Dados', Database, true), p(c('De Texto/CSV', FileText), c('Da Web', Globe), c('De Tabela/Intervalo', Table))] },
    { nome: 'Consultas e Conexões', blocos: [g('Atualizar Tudo', RefreshCw, true)] },
    { nome: 'Classificar e Filtrar', blocos: [p(c('Classificar de A a Z', ArrowDownAZ), c('Classificar de Z a A', ArrowUpZA)), g('Classificar', ArrowUpDown), g('Filtro', Filter), p(c('Limpar', Eraser), c('Reaplicar', RefreshCw), c('Avançado', SlidersHorizontal))] },
    { nome: 'Ferramentas de Dados', blocos: [g('Texto para Colunas', Columns2), p(c('Preenchimento Relâmpago', Sparkles), c('Remover Duplicatas', Trash2), c('Validação de Dados', ShieldCheck, { seta: true })), p(c('Consolidar', Combine), c('Relações', Workflow), c('Gerenciar Modelo de Dados', Database))] },
    { nome: 'Previsão', blocos: [g('Teste de Hipóteses', Lightbulb, true), g('Planilha de Previsão', TrendingUp)] },
    { nome: 'Estrutura de Tópicos', lancador: true, blocos: [g('Agrupar', Group, true), g('Desagrupar', Group, true), g('Subtotal', Sigma)] },
  ],
  'Revisão': [
    { nome: 'Revisão de Texto', blocos: [g('Verificar Ortografia', SpellCheck), p(c('Dicionário de Sinônimos', BookOpen), c('Estatísticas da Pasta de Trabalho', BarChart3))] },
    { nome: 'Acessibilidade', blocos: [g('Verificar Acessibilidade', Accessibility, true)] },
    { nome: 'Idioma', blocos: [g('Traduzir', Languages)] },
    { nome: 'Comentários', blocos: [g('Novo Comentário', MessageSquarePlus), p(c('Excluir', Trash2), c('Anterior', ChevronUp), c('Próximo', ChevronDown)), g('Mostrar Comentários', MessageSquare)] },
    { nome: 'Anotações', blocos: [g('Anotações', FileText, true)] },
    { nome: 'Proteger', blocos: [g('Proteger Planilha', Lock), g('Proteger Pasta de Trabalho', Lock), g('Permitir Edição de Intervalos', Grid3x3)] },
  ],
  'Exibir': [
    { nome: 'Modos de Exibição de Pasta de Trabalho', blocos: [g('Normal', Grid3x3), g('Visualização da Quebra de Página', SquareDashed), g('Layout da Página', FileText), g('Modos de Exibição Personalizados', Eye)] },
    { nome: 'Mostrar', blocos: [p(c('Régua', Ruler), c('Linhas de Grade', Grid3x3)), p(c('Barra de Fórmulas', Sigma), c('Títulos', Columns2))] },
    { nome: 'Zoom', blocos: [g('Zoom', ZoomIn), g('100%', Search), g('Zoom na Seleção', Maximize2)] },
    { nome: 'Janela', blocos: [g('Nova Janela', AppWindow), g('Organizar Tudo', LayoutGrid), g('Congelar Painéis', Snowflake, true), p(c('Dividir', Rows3), c('Ocultar', Eye), c('Reexibir', Eye)), g('Alternar Janelas', AppWindow, true)] },
    { nome: 'Macros', blocos: [g('Macros', Play, true)] },
  ],
  'Ajuda': AJUDA,
};

const FAIXAS_DO_POWERPOINT: Record<string, GrupoPadrao[]> = {
  'Página Inicial': [
    AREA_DE_TRANSFERENCIA,
    { nome: 'Slides', blocos: [g('Novo Slide', FilePlus2, true), p(c('Layout', LayoutTemplate, { seta: true }), c('Redefinir', RefreshCw), c('Seção', Rows3, { seta: true }))] },
    {
      nome: 'Fonte', lancador: true,
      blocos: [l(
        [combo('Fonte', 'Aptos (Corpo)', 120), combo('Tamanho da Fonte', '18', 44), c('Aumentar Tamanho da Fonte', AArrowUp), c('Diminuir Tamanho da Fonte', AArrowDown), c('Limpar Toda a Formatação', Eraser)],
        [...N_I_S, letra('Sombra de Texto', 'S', { textShadow: '1px 1px 0 #A0A0A0' }), c('Tachado', Strikethrough), c('Espaçamento entre Caracteres', ArrowUpDown, { seta: true }), c('Maiúsculas e Minúsculas', CaseSensitive, { seta: true }), COR_DA_FONTE],
      )],
    },
    {
      nome: 'Parágrafo', lancador: true,
      blocos: [l(
        [c('Marcadores', List, { seta: true }), c('Numeração', ListOrdered, { seta: true }), c('Diminuir Nível da Lista', IndentDecrease), c('Aumentar Nível da Lista', IndentIncrease), c('Espaçamento entre Linhas', ArrowUpDown, { seta: true })],
        [c('Alinhar à Esquerda', AlignLeft), c('Centralizar', AlignCenter), c('Alinhar à Direita', AlignRight), c('Justificar', AlignJustify), c('Colunas', Columns2, { seta: true })],
      )],
    },
    { nome: 'Desenho', lancador: true, blocos: [g('Formas', Shapes, true), g('Organizar', Layers, true), g('Estilos Rápidos', Palette, true), p(c('Preenchimento da Forma', PaintBucket, { seta: true }), c('Contorno da Forma', Square, { seta: true }), c('Efeitos de Forma', Sparkles, { seta: true }))] },
    EDICAO, VOZ,
    { nome: 'Designer', blocos: [g('Designer', Wand2)] },
  ],
  'Inserir': [
    { nome: 'Slides', blocos: [g('Novo Slide', FilePlus2, true)] },
    { nome: 'Tabelas', blocos: [g('Tabela', Table, true)] },
    { nome: 'Imagens', blocos: [g('Imagens', Image, true), g('Instantâneo', Camera, true), g('Álbum de Fotografias', Images, true)] },
    { nome: 'Ilustrações', blocos: [g('Formas', Shapes, true), g('Ícones', Smile), g('Modelos 3D', Box, true), g('SmartArt', Workflow), g('Gráfico', BarChart3)] },
    { nome: 'Links', blocos: [g('Zoom', ZoomIn, true), g('Link', Link), g('Ação', MousePointer2)] },
    { nome: 'Comentários', blocos: [g('Comentário', MessageSquarePlus)] },
    { nome: 'Texto', blocos: [g('Caixa de Texto', Type), g('Cabeçalho e Rodapé', PanelBottom), g('WordArt', Wand2, true)] },
    { nome: 'Símbolos', blocos: [p(c('Equação', Sigma, { seta: true }), c('Símbolo', Omega))] },
    { nome: 'Mídia', blocos: [g('Vídeo', Video, true), g('Áudio', Music, true), g('Gravação de Tela', Monitor)] },
  ],
  'Desenhar': DESENHAR,
  'Design': [
    { nome: 'Temas', blocos: [galeria({ nome: 'Tema do Office', amostra: 'Aa' }, { nome: 'Facetado', amostra: 'Aa', estilo: { color: '#2E7D32' } }, { nome: 'Íon', amostra: 'Aa', estilo: { color: '#1565C0' } }, { nome: 'Retrospectiva', amostra: 'Aa', estilo: { color: '#B7472A' } })] },
    { nome: 'Variantes', blocos: [galeria({ nome: 'Variante 1', amostra: '■' }, { nome: 'Variante 2', amostra: '■', estilo: { color: '#1565C0' } }, { nome: 'Variante 3', amostra: '■', estilo: { color: '#2E7D32' } })] },
    { nome: 'Personalizar', blocos: [g('Tamanho do Slide', Frame, true), g('Formatar Plano de Fundo', PaintBucket)] },
    { nome: 'Designer', blocos: [g('Designer', Wand2)] },
  ],
  'Transições': [
    { nome: 'Visualizar', blocos: [g('Visualizar', Play)] },
    { nome: 'Transição para este Slide', blocos: [galeria({ nome: 'Nenhuma', amostra: '▭' }, { nome: 'Transformar', amostra: '◐' }, { nome: 'Esmaecer', amostra: '◌' }, { nome: 'Empurrar', amostra: '⇥' }, { nome: 'Revelar', amostra: '◧' }), g('Opções de Efeito', SlidersHorizontal, true)] },
    { nome: 'Intervalo', blocos: [l([letra('Som', 'Som:', { fontSize: 11 }), combo('Som', '[Sem Som]', 96)], [letra('Duração', 'Duração:', { fontSize: 11 }), combo('Duração', '01,00', 60)], [c('Aplicar a Todos', Copy)]), p(c('Ao Clicar com o Mouse', MousePointer2), c('Após', Timer))] },
  ],
  'Animações': [
    { nome: 'Visualizar', blocos: [g('Visualizar', Play)] },
    { nome: 'Animação', lancador: true, blocos: [galeria({ nome: 'Nenhuma', amostra: '☆' }, { nome: 'Aparecer', amostra: '★', estilo: { color: '#2E7D32' } }, { nome: 'Esmaecer', amostra: '★', estilo: { color: '#2E7D32' } }, { nome: 'Surgir', amostra: '★', estilo: { color: '#2E7D32' } }, { nome: 'Flutuar para Dentro', amostra: '★', estilo: { color: '#2E7D32' } }), g('Opções de Efeito', SlidersHorizontal, true)] },
    { nome: 'Animação Avançada', blocos: [g('Adicionar Animação', Plus, true), p(c('Painel de Animação', PanelLeft), c('Disparar', Play, { seta: true }), c('Pincel de Animação', Brush))] },
    { nome: 'Intervalo', blocos: [l([letra('Iniciar', 'Iniciar:', { fontSize: 11 }), combo('Iniciar', 'Ao Clicar', 90)], [letra('Duração', 'Duração:', { fontSize: 11 }), combo('Duração', '00,50', 60)], [letra('Atraso', 'Atraso:', { fontSize: 11 }), combo('Atraso', '00,00', 60)])] },
  ],
  'Apresentação de Slides': [
    { nome: 'Iniciar Apresentação de Slides', blocos: [g('Do Começo', Play), g('Do Slide Atual', Play), g('Apresentar Online', Globe, true), g('Apresentação de Slides Personalizada', ListChecks, true)] },
    { nome: 'Configurar', blocos: [g('Configurar Apresentação de Slides', SlidersHorizontal), g('Ocultar Slide', Eye), g('Testar Intervalos', Timer), g('Gravar', Clapperboard, true)] },
    { nome: 'Legendas e Subtítulos', blocos: [p(c('Sempre Usar Legendas', Type), c('Configurações de Legenda', SlidersHorizontal, { seta: true }))] },
    { nome: 'Monitores', blocos: [l([letra('Monitor', 'Monitor:', { fontSize: 11 }), combo('Monitor', 'Automático', 96)], [c('Usar Modo de Exibição do Apresentador', Monitor)])] },
  ],
  'Revisão': [
    { nome: 'Revisão de Texto', blocos: [g('Ortografia', SpellCheck), g('Dicionário de Sinônimos', BookOpen)] },
    { nome: 'Acessibilidade', blocos: [g('Verificar Acessibilidade', Accessibility, true)] },
    { nome: 'Idioma', blocos: [g('Traduzir', Languages), g('Idioma', Globe, true)] },
    { nome: 'Comentários', blocos: [g('Novo Comentário', MessageSquarePlus), p(c('Excluir', Trash2), c('Anterior', ChevronUp), c('Próximo', ChevronDown)), g('Mostrar Comentários', MessageSquare)] },
    { nome: 'Comparar', blocos: [g('Comparar', Columns2)] },
    { nome: 'Tinta', blocos: [g('Ocultar Tinta', PenLine, true)] },
  ],
  'Exibir': [
    { nome: 'Modos de Exibição de Apresentação', blocos: [g('Normal', LayoutTemplate), g('Estrutura de Tópicos', ListTree), g('Classificação de Slides', LayoutGrid), g('Anotações', FileText), g('Modo de Exibição de Leitura', BookOpen)] },
    { nome: 'Modos de Exibição Mestres', blocos: [g('Slide Mestre', LayoutTemplate), g('Folheto Mestre', FileText), g('Anotações Mestras', FileText)] },
    { nome: 'Mostrar', lancador: true, blocos: [p(c('Régua', Ruler), c('Linhas de Grade', Grid3x3), c('Guias', Grid2x2)), g('Anotações', FileText)] },
    { nome: 'Zoom', blocos: [g('Zoom', ZoomIn), g('Ajustar à Janela', Maximize2)] },
    { nome: 'Cor/Escala de Cinza', blocos: [p(c('Cor', Palette), c('Escala de Cinza', Droplet), c('Preto e Branco', Droplet))] },
    { nome: 'Janela', blocos: [g('Nova Janela', AppWindow), p(c('Organizar Tudo', LayoutGrid), c('Em Cascata', Layers), c('Mover Divisão', Rows3)), g('Alternar Janelas', AppWindow, true)] },
    { nome: 'Macros', blocos: [g('Macros', Play)] },
  ],
  'Ajuda': AJUDA,
};

const FAIXAS_DO_ACCESS: Record<string, GrupoPadrao[]> = {
  'Página Inicial': [
    { nome: 'Modos de Exibição', blocos: [g('Modo de Exibição', Table, true)] },
    AREA_DE_TRANSFERENCIA,
    { nome: 'Classificar e Filtrar', blocos: [g('Filtro', Filter), p(c('Crescente', ArrowDownAZ), c('Decrescente', ArrowUpZA), c('Remover Classificação', Eraser)), p(c('Seleção', Filter, { seta: true }), c('Avançado', SlidersHorizontal, { seta: true }), c('Alternar Filtro', Filter))] },
    { nome: 'Registros', blocos: [g('Atualizar Tudo', RefreshCw, true), p(c('Novo', Plus), c('Salvar', FileText), c('Excluir', Trash2, { seta: true })), p(c('Totais', Sigma), c('Verificação Ortográfica', SpellCheck), c('Mais', ChevronDown, { seta: true }))] },
    { nome: 'Localizar', blocos: [g('Localizar', Search), p(c('Substituir', Replace), c('Ir Para', ChevronDown, { seta: true }), c('Selecionar', MousePointer2, { seta: true }))] },
    { nome: 'Janela', blocos: [g('Ajustar ao Formulário', Maximize2), g('Alternar Janelas', AppWindow, true)] },
    { nome: 'Formatação de Texto', lancador: true, blocos: [l([combo('Fonte', 'Aptos (Detalhe)', 112), combo('Tamanho da Fonte', '11', 44), c('Marcadores', List), c('Numeração', ListOrdered)], [...N_I_S, COR_DA_FONTE, REALCE, c('Alinhar à Esquerda', AlignLeft), c('Centralizar', AlignCenter), c('Alinhar à Direita', AlignRight)])] },
  ],
  'Criar': [
    { nome: 'Modelos', blocos: [g('Partes do Aplicativo', LayoutTemplate, true)] },
    { nome: 'Tabelas', blocos: [g('Tabela', Table), g('Design da Tabela', Ruler), g('Listas do SharePoint', List, true)] },
    { nome: 'Consultas', blocos: [g('Assistente de Consulta', Wand2), g('Design da Consulta', Sigma)] },
    { nome: 'Formulários', blocos: [g('Formulário', FileText), g('Design do Formulário', Ruler), g('Formulário em Branco', File), p(c('Assistente de Formulário', Wand2), c('Navegação', PanelLeft, { seta: true }), c('Mais Formulários', Plus, { seta: true }))] },
    { nome: 'Relatórios', blocos: [g('Relatório', FileText), g('Design do Relatório', Ruler), g('Relatório em Branco', File), p(c('Assistente de Relatório', Wand2), c('Etiquetas', Tags))] },
    { nome: 'Macros e Código', blocos: [g('Macro', Play), p(c('Módulo', Box), c('Módulo de Classe', Box), c('Visual Basic', Type))] },
  ],
  'Dados Externos': [
    { nome: 'Importar e Vincular', blocos: [g('Gerenciador de Tabelas Vinculadas', Link), g('Nova Fonte de Dados', Database, true), g('Importações Salvas', ListChecks)] },
    { nome: 'Exportar', blocos: [g('Exportações Salvas', ListChecks), g('Excel', Grid3x3), g('Arquivo de Texto', FileText), g('Arquivo XML', FileText), g('PDF ou XPS', File), g('E-mail', Mail), g('Mais', ChevronDown, true)] },
  ],
  'Ferramentas de Banco de Dados': [
    { nome: 'Ferramentas', blocos: [g('Compactar e Reparar Banco de Dados', Database)] },
    { nome: 'Macro', blocos: [g('Visual Basic', Type), g('Executar Macro', Play)] },
    { nome: 'Relações', blocos: [g('Relações', Workflow), g('Dependências do Objeto', Combine)] },
    { nome: 'Analisar', blocos: [p(c('Documentador de Banco de Dados', FileText), c('Analisar Desempenho', TrendingUp), c('Analisar Tabela', Table))] },
    { nome: 'Mover Dados', blocos: [g('SQL Server', Database), g('Banco de Dados do Access', Database)] },
    { nome: 'Suplementos', blocos: [g('Suplementos', Puzzle, true)] },
  ],
  'Ajuda': AJUDA,
};

export const FAIXAS: Record<AppDoOffice, Record<string, GrupoPadrao[]>> = {
  word: FAIXAS_DO_WORD,
  excel: FAIXAS_DO_EXCEL,
  powerpoint: FAIXAS_DO_POWERPOINT,
  access: FAIXAS_DO_ACCESS,
};

/*
  Nomes de grupo que os laboratórios escreveram de outro jeito e que são o
  mesmo grupo do programa. "Editando" é o nome que o Word dá ao modo, e não
  ao grupo; o grupo é Edição.
*/
const SINONIMOS: Record<string, string> = {
  'Editando': 'Edição',
  'Desfazer': 'Desfazer',
};

/**
 * A posição de um grupo na faixa do programa, pelo nome; -1 se o programa não
 * tem grupo com esse nome nessa guia.
 */
export function ordemDoGrupo(grupos: GrupoPadrao[], nome: string): number {
  const alvo = SINONIMOS[nome] ?? nome;
  const exato = grupos.findIndex(gr => gr.nome === alvo);
  if (exato >= 0 || !alvo) return exato;
  /* "Classificar" é o começo de "Classificar e Filtrar", e "Consultas" o de
     "Consultas e Conexões": o laboratório encurtou o nome, e o grupo é o
     mesmo. Pôr o do programa ao lado daria dois grupos para os mesmos botões. */
  return grupos.findIndex(gr => gr.nome.startsWith(`${alvo} `) || alvo.startsWith(`${gr.nome} `));
}

/**
 * O grupo sem os comandos que o laboratório já desenhou em outro lugar.
 *
 * O botão do exercício é o que funciona; repeti-lo como enfeite num grupo
 * completado poria na mesma faixa dois "Atualizar Tudo", um que faz e outro
 * que avisa. Grupo que fica sem nada não entra.
 */
export function semRepetir(gr: GrupoPadrao, jaDesenhados: ReadonlySet<string>): GrupoPadrao | null {
  const fica = (c: Comando) => !jaDesenhados.has(c.r.replace(/\s*\(Ctrl\+[^)]*\)$/, ''));
  const blocos = gr.blocos.map((b): Bloco | null => {
    if (b.t === 'grande') return fica(b.c) ? b : null;
    if (b.t === 'pilha') { const c = b.c.filter(fica); return c.length ? { t: 'pilha', c } : null; }
    if (b.t === 'linhas') {
      const c = b.c.map(linha => linha.filter(fica)).filter(linha => linha.length);
      return c.length ? { t: 'linhas', c } : null;
    }
    const c = b.c.filter(item => !jaDesenhados.has(item.nome));
    return c.length ? { t: 'galeria', c } : null;
  }).filter((b): b is Bloco => b !== null);
  return blocos.length ? { ...gr, blocos } : null;
}

/** As guias que têm faixa padrão desenhada — a trava confere que são todas. */
export function guiasComFaixaPadrao(app: AppDoOffice): string[] {
  return Object.keys(FAIXAS[app]);
}

/** Os comandos que a faixa padrão de uma guia desenha, para a trava. */
export function comandosDaFaixaPadrao(app: AppDoOffice, guia: string): string[] {
  return (FAIXAS[app][guia] ?? []).flatMap(gr => gr.blocos.flatMap(b => {
    if (b.t === 'grande') return [b.c.r];
    if (b.t === 'pilha') return b.c.map(x => x.r);
    if (b.t === 'linhas') return b.c.flat().map(x => x.r);
    return b.c.map(x => x.nome);
  }));
}

