import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowLeft, X, ListChecks, MonitorSmartphone } from 'lucide-react';

/*
 * A moldura do laboratório que imita um programa.
 *
 * Antes, a janela do Word era um cartão dentro da página: barra de menu da
 * plataforma em cima, migalha de pão, lista de tarefas acima dela, e só então o
 * programa. Quem olhava via um site mostrando uma figura de um Word. A ideia
 * aqui é a outra: a tela inteira é o programa, e a plataforma volta por cima.
 *
 * ── Onde a plataforma reaparece ──────────────────────────────────────────
 * No computador, a lista de tarefas é um **painel lateral**, do jeito que o
 * próprio Word põe os dele — Estilos, Navegação, Restringir Edição. Não é
 * enxerto: é a forma que o programa imitado já usa, e fechar um painel é gesto
 * que o desbravador vai repetir na escola.
 *
 * No celular não cabe painel lateral, e o Word também não põe um lá: vira uma
 * **bolha** no canto, que recolhe para um botão. A escolha entre as duas é do
 * CSS, por largura — sem ouvir redimensionamento, sem estado, sem descompasso
 * entre o que o JavaScript acha e o que a tela mostra.
 *
 * ── O que a sobreposição não cobre ───────────────────────────────────────
 * Barra de título e faixa de opções ficam livres. São elas que o desbravador
 * precisa reconhecer depois, e tapá-las para caber um aviso da plataforma seria
 * esconder justamente a matéria. Canto inferior e lateral são de quem sobrepõe.
 *
 * ── E o caminho de volta ─────────────────────────────────────────────────
 * A moldura cobre a barra de navegação, então ela precisa devolver a saída: a
 * cápsula tem a seta para a trilha e o progresso. Sem isso, sair da lição
 * dependeria do botão voltar do navegador — que existe, mas ninguém deve
 * precisar dele para sair de uma tela.
 *
 * Serve a qualquer laboratório que imite um programa. Os que não imitam nada —
 * ordenar, classificar, escrever — continuam sendo tela da plataforma: moldura
 * de aplicativo neles seria fantasia sem ganho.
 */

export interface TarefaDoLaboratorio {
  id: string;
  titulo: string;
  /** O que ainda falta. Aparece só enquanto a tarefa não está feita. */
  detalhe?: string;
  /** Onde, dentro do programa imitado, isso se resolve. */
  onde?: string;
  feita: boolean;
}

interface Props {
  /** Código da trilha, para o caminho de volta e para a cápsula. */
  trilha: string;
  /** O nome da lição, na cápsula do computador. */
  titulo: string;
  tarefas: TarefaDoLaboratorio[];
  /** Mensagem passageira do laboratório — erro, dica, retorno de um clique. */
  aviso?: string;
  /** O programa imitado. */
  children: React.ReactNode;
  /** As ações da lição: entregar, recomeçar. Ficam no pé do painel. */
  acoes?: React.ReactNode;
}

/*
  O aviso de tela pequena.

  Estes laboratórios imitam programas de computador, e programa de computador
  foi desenhado para tela de computador: a janela encolhe até caber num
  celular, mas o que ela mostra fica menor do que o desbravador vai encontrar
  na escola. Dizer isso uma vez é honesto; repetir a cada lição é estorvo — daí
  a lembrança guardada.

  Guardada com try, como todo acesso a localStorage nesta base: em navegação
  privada ele lança, e um aviso não pode derrubar o laboratório.
*/
const CHAVE_AVISO = 'trilha:aviso-tela-pequena';

function jaAvisado(): boolean {
  try { return localStorage.getItem(CHAVE_AVISO) === '1'; } catch { return false; }
}

function marcarAvisado(): void {
  try { localStorage.setItem(CHAVE_AVISO, '1'); } catch { /* sem memória, avisa de novo */ }
}

export default function LaboratorioEmTelaCheia({
  trilha, titulo, tarefas, aviso, children, acoes,
}: Props) {
  const [painelAberto, setPainelAberto] = useState(true);
  const [avisoDeTela, setAvisoDeTela] = useState(() => !jaAvisado());
  /* Com o aviso de pé a bolha começa fechada: dois painéis escuros empilhados
     num celular são um só borrão, e o aviso vem antes da lista de tarefas. */
  const [bolhaAberta, setBolhaAberta] = useState(() => jaAvisado());

  const feitas = tarefas.filter(t => t.feita).length;
  const proporcao = tarefas.length ? feitas / tarefas.length : 0;

  /* A página atrás não deve rolar por baixo da moldura: no celular isso vira
     aquele arrasto que devolve a tela para um lugar que ninguém pediu. */
  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = anterior; };
  }, []);

  const Marca = ({ feita }: { feita: boolean }) => (
    <span aria-hidden="true" style={{
      flex: 'none', width: 15, height: 15, borderRadius: '50%', marginTop: 2,
      border: feita ? 'none' : '1.5px solid #C8C6C4',
      background: feita ? '#107C41' : 'transparent',
      color: '#fff', fontSize: 10, lineHeight: '15px', textAlign: 'center',
    }}>{feita ? '✓' : ''}</span>
  );

  return (
    <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: '#E6E6E6' }}>
      <div className="flex-1 flex min-h-0">
        {/* O programa imitado */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">{children}</div>

        {/* A · painel lateral, como os painéis do próprio Word */}
        {painelAberto && (
          <aside className="hidden lg:flex flex-col w-[286px] shrink-0 min-h-0"
            style={{ background: '#FFFFFF', borderLeft: '1px solid #E1DFDD', color: '#201F1E' }}>
            <div className="flex items-center gap-2 px-3 py-2.5"
              style={{ borderBottom: '1px solid #E1DFDD' }}>
              <ListChecks className="w-4 h-4" style={{ color: '#2B579A' }} />
              {/* A cor vem escrita aqui porque a plataforma pinta h1..h4 de
                  quase branco — regra certa num aplicativo escuro, e invisível
                  em cima de painel branco. Toda superfície clara dentro desta
                  moldura precisa dizer a própria cor. */}
              <h2 style={{ fontSize: 13, fontWeight: 700, color: '#201F1E' }}>Tarefas do laboratório</h2>
              <button onClick={() => setPainelAberto(false)} aria-label="Fechar o painel de tarefas"
                className="ml-auto" style={{ color: '#605E5C' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="px-3 py-2" style={{ fontSize: 11, color: '#605E5C', borderBottom: '1px solid #F3F2F1' }}>
              {feitas} de {tarefas.length} concluídas
            </p>

            {/* Só a lista rola: com sete tarefas, um pé rolante esconderia o
                botão de entregar justamente quando ele aparece. */}
            <div className="flex-1 min-h-0 overflow-auto">
              {tarefas.map(t => (
                <div key={t.id} className="flex gap-2 px-3 py-2.5"
                  style={{ borderBottom: '1px solid #F3F2F1', fontSize: 12, color: '#3B3A39' }}>
                  <Marca feita={t.feita} />
                  <div className="min-w-0">
                    <p style={{ fontWeight: t.feita ? 400 : 600 }}>{t.titulo}</p>
                    {!t.feita && t.detalhe && (
                      <p style={{ marginTop: 2, color: '#605E5C' }}>{t.detalhe}</p>
                    )}
                    {!t.feita && t.onde && (
                      <p style={{ marginTop: 3, color: '#2B579A', fontSize: 10.5 }}>{t.onde}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {(acoes || aviso) && (
              <div className="px-3 py-3 shrink-0" style={{ borderTop: '1px solid #E1DFDD' }}>
                {aviso && (
                  <p className="mb-2" style={{ fontSize: 11.5, color: '#8A5700', background: '#FFF4CE', padding: '8px 10px', borderRadius: 4 }}>
                    {aviso}
                  </p>
                )}
                {acoes}
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Reabrir o painel, quando fechado */}
      {!painelAberto && (
        <button onClick={() => setPainelAberto(true)}
          className="hidden lg:flex items-center gap-2 absolute right-4 top-1/2 -translate-y-1/2 px-3 py-2 rounded-l-lg"
          style={{ background: '#FFFFFF', border: '1px solid #E1DFDD', borderRight: 'none', color: '#2B579A', fontSize: 12 }}>
          <ListChecks className="w-4 h-4" /> {feitas}/{tarefas.length}
        </button>
      )}

      {/* A cápsula da plataforma: o caminho de volta e o progresso, nos dois tamanhos */}
      {/* Acima da barra de status, e não em cima dela: a régua de baixo do
          programa continua legível, que é a regra desta moldura — o que a
          pessoa precisa reconhecer depois não se cobre. */}
      <div className="hidden lg:flex absolute left-3 bottom-9 z-10 items-center gap-2.5 rounded-full pl-2 pr-3.5 py-1.5"
        style={{
          background: 'rgba(10, 11, 16, 0.74)',
          backdropFilter: 'blur(14px) saturate(140%)',
          WebkitBackdropFilter: 'blur(14px) saturate(140%)',
          border: '1px solid rgba(255,255,255,0.13)',
          boxShadow: '0 10px 26px rgba(0,0,0,0.5)',
          color: 'var(--color-text)',
        }}>
        <Link to={`/especialidade/${trilha}`} aria-label={`Voltar para a trilha ${trilha}`}
          style={{ color: 'var(--color-primary-hover)', display: 'flex' }}>
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="font-bold" style={{ fontSize: 11.5 }}>{trilha}</span>
        <span className="hidden sm:inline" style={{ fontSize: 11.5, color: 'var(--color-text-dim)' }}>{titulo}</span>
        <span style={{ width: 58, height: 4, borderRadius: 3, background: 'rgba(255,255,255,0.16)', overflow: 'hidden' }}>
          <span style={{ display: 'block', height: '100%', width: `${proporcao * 100}%`, background: 'var(--color-success)' }} />
        </span>
        <span style={{ fontSize: 11.5, color: 'var(--color-text-dim)' }}>{feitas}/{tarefas.length}</span>
      </div>

      {/* B · a bolha do celular */}
      <div className="lg:hidden absolute right-3 bottom-9 z-10 rounded-2xl"
        style={{
          width: bolhaAberta ? 'min(320px, calc(100vw - 24px))' : 'auto',
          background: 'rgba(10, 11, 16, 0.78)',
          backdropFilter: 'blur(14px) saturate(140%)',
          WebkitBackdropFilter: 'blur(14px) saturate(140%)',
          border: '1px solid rgba(255,255,255,0.13)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.55)',
          color: 'var(--color-text)',
        }}>
        {/* No celular a bolha é a plataforma inteira: a seta de voltar entra
            aqui, e a cápsula some. Duas peças flutuantes numa tela de 390 px
            disputariam o mesmo canto — foi o que aconteceu na primeira
            tentativa, com a bolha por cima da cápsula. */}
        <button onClick={() => setBolhaAberta(a => !a)}
          className="flex items-center gap-2 w-full px-3 py-2"
          aria-expanded={bolhaAberta}>
          <Link to={`/especialidade/${trilha}`} aria-label={`Voltar para a trilha ${trilha}`}
            onClick={e => e.stopPropagation()}
            style={{ color: 'var(--color-primary-hover)', display: 'flex' }}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span style={{ fontSize: 12, fontWeight: 700 }}>{feitas}/{tarefas.length} tarefas</span>
          {bolhaAberta
            ? <ChevronDown className="w-4 h-4 ml-auto" style={{ color: 'var(--color-text-dim)' }} />
            : <ChevronUp className="w-4 h-4 ml-auto" style={{ color: 'var(--color-text-dim)' }} />}
        </button>

        {bolhaAberta && (
          <div className="px-3 pb-3 max-h-[46vh] overflow-auto">
            {aviso && (
              <p className="mb-2 p-2 rounded-lg" style={{ fontSize: 11.5, backgroundColor: 'var(--color-warning-a10)' }}>
                {aviso}
              </p>
            )}
            <ul className="flex flex-col gap-2">
              {tarefas.map(t => (
                <li key={t.id} className="flex gap-2" style={{ fontSize: 12.5 }}>
                  <span aria-hidden="true" style={{ color: t.feita ? 'var(--color-success)' : 'var(--color-text-faint)' }}>
                    {t.feita ? '✓' : '○'}
                  </span>
                  <div className="min-w-0">
                    <p style={{ color: t.feita ? 'var(--color-success)' : 'var(--color-text)' }}>{t.titulo}</p>
                    {!t.feita && t.onde && (
                      <p style={{ fontSize: 11, color: 'var(--color-secondary)' }}>{t.onde}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {acoes && <div className="mt-3">{acoes}</div>}
          </div>
        )}
      </div>

      {/*
        O aviso de tela pequena, uma vez só.

        Aparece abaixo de 768 px — celular. Tablet em pé já tem 768 e passa
        sem aviso, que é o que a mensagem promete. Vem como faixa de baixo, e
        não como caixa no meio: barra de título e faixa de opções do programa
        imitado são o que o desbravador precisa reconhecer depois, e um aviso
        em cima delas esconderia justamente a matéria.
      */}
      {avisoDeTela && (
        <div className="md:hidden absolute inset-x-0 bottom-0 z-20 p-3">
          <div className="flex items-start gap-3 rounded-2xl p-3"
            style={{
              background: 'rgba(10, 11, 16, 0.94)',
              backdropFilter: 'blur(14px) saturate(140%)',
              WebkitBackdropFilter: 'blur(14px) saturate(140%)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
              color: 'var(--color-text)',
            }}>
            <MonitorSmartphone className="w-5 h-5 flex-none" style={{ color: 'var(--color-secondary)' }} />
            <div className="min-w-0">
              <p style={{ fontSize: 13, fontWeight: 700 }}>Melhor numa tela maior</p>
              <p className="mt-1" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                Este laboratório imita um programa de computador, e no celular ele
                fica apertado: os botões encolhem e algumas colunas somem. Dá para
                fazer tudo por aqui, mas num tablet ou num computador você vê a
                tela do jeito que vai encontrar na escola.
              </p>
              <button onClick={() => { setAvisoDeTela(false); marcarAvisado(); setBolhaAberta(true); }}
                className="btn-primary text-sm mt-3">
                Entendi, pode continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
