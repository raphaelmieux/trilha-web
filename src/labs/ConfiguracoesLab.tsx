import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings, Monitor, HardDrive, Bluetooth, LayoutGrid, Users, ChevronRight,
  ChevronLeft, Printer, Trash2, Gauge, FolderOpen, Check, UserPlus,
  FileCheck2, RotateCcw, Minus, Square as SquareIcon, X, Image as ImageIcon,
  FileText, FileType,
} from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import { CSS_WINDOWS, DialogoDoWindows } from './windows';
import {
  MAQUINA_INICIAL, METAS_DA_MAQUINA, IMPRESSORAS, ARQUIVOS, PROGRAMAS_POR_TIPO,
  type Maquina, type Disco,
} from './maquinaDoClube';
import {
  upsertRequirementProgress, getRequirementId, getSpecialtyId,
  ensureEnrollment, updateEnrollmentActivity, logActivity,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import type { PropsDeLaboratorio as Props } from './tipos';

/*
 * AP044 requisito 13 — os cinco ajustes do sistema.
 *
 * ── Dois programas, e por isso uma área de trabalho ──────────────────────
 * Quatro dos cinco itens moram em Configurações; o "abrir com outro programa"
 * mora no Explorador, porque é lá que se clica com o botão direito num arquivo.
 * "Mais de um programa quer dizer área de trabalho, não sanfona" — então há
 * área de trabalho, duas janelas e barra de tarefas, com as peças de
 * `windows.tsx`.
 *
 * ── A ferramenta é a mesma; o disco responde por si ──────────────────────
 * A máquina tem um SSD e um HD, e é isso que faz a lição do item a) existir. Na
 * janela de otimizar, a coluna "Tipo de mídia" diz qual é qual, e o botão troca
 * de nome sozinho: Otimizar no SSD, Desfragmentar no HD. Ensinar a
 * desfragmentar SSD é ensinar a gastar a vida útil do disco à toa — e o
 * Windows de verdade já mostra isso escrito ali.
 *
 * ── Abrir com não é definir padrão ───────────────────────────────────────
 * Um vale para aquele arquivo, desta vez; o outro muda a regra para todos os
 * arquivos daquele tipo. As duas tarefas existem separadas por isso, e a
 * primeira só fecha se o padrão **não** tiver mudado junto.
 */

type Pagina = 'sistema' | 'armazenamento' | 'dispositivos' | 'aplicativos' | 'contas';
type Janela = 'config' | 'explorador';

const ICONE_DO_ARQUIVO: Record<string, typeof ImageIcon> = {
  jpg: ImageIcon, txt: FileText, pdf: FileType,
};

/* O nome do botão sai do disco, e não de uma escolha nossa: é o que o Windows
   escreve na janela de otimizar. */
const acaoDoDisco = (d: Disco) => (d.tipo === 'ssd' ? 'Otimizar' : 'Desfragmentar');
const nomeDoTipo = (d: Disco) =>
  d.tipo === 'ssd' ? 'Unidade de estado sólido' : 'Unidade de disco rígido';

export default function ConfiguracoesLab({ specialtyCode, lessonCode, lessonTitle, requirementCodes, userId }: Props) {
  const [maquina, setMaquina] = useState<Maquina>(MAQUINA_INICIAL);
  const [abertas, setAbertas] = useState<Janela[]>(['config']);
  const [emFoco, setEmFoco] = useState<Janela>('config');
  const [pagina, setPagina] = useState<Pagina>('sistema');
  const [dialogo, setDialogo] = useState<'limpeza' | 'otimizar' | 'novo-usuario' | null>(null);
  const [menuDoArquivo, setMenuDoArquivo] = useState<string | null>(null);
  const [nomeNovo, setNomeNovo] = useState('');
  const [contaAdmin, setContaAdmin] = useState(false);
  const [aviso, setAviso] = useState('');
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState('');
  const [gravando, setGravando] = useState(false);

  const tarefas = METAS_DA_MAQUINA.map(m => ({
    id: m.id, titulo: m.titulo, detalhe: m.detalhe, onde: m.onde,
    passos: m.passos, feita: m.feita(maquina),
  }));
  const tudoFeito = tarefas.every(t => t.feita);

  const avisar = (r: string) => { setMenuDoArquivo(null); setAviso(r); };
  const naoFazParte = (n: string) =>
    avisar(`${n} existe no Windows de verdade, e está aqui para a janela ficar igual — mas não faz parte deste exercício.`);

  const abrirJanela = (j: Janela) => {
    setAbertas(a => (a.includes(j) ? a : [...a, j]));
    setEmFoco(j);
    setMenuDoArquivo(null);
  };

  const limpar = () => {
    setMaquina(m => ({ ...m, discos: m.discos.map(d => (d.id === 'c' ? { ...d, limpo: true } : d)) }));
    setDialogo(null);
    setAviso('12 GB devolvidos. Ela apagou temporários, lixeira e restos de atualização — documento e foto seus não foram tocados.');
  };

  const otimizar = (id: string) => {
    const d = maquina.discos.find(x => x.id === id)!;
    setMaquina(m => ({ ...m, discos: m.discos.map(x => (x.id === id ? { ...x, otimizado: true } : x)) }));
    setAviso(d.tipo === 'ssd'
      ? 'No SSD não há agulha nem prato: não há ida e volta a economizar, e desfragmentar só gastaria a vida útil do disco. Por isso o botão aqui diz Otimizar.'
      : 'No disco de prato girando, juntar os pedaços de cada arquivo poupa o vaivém da agulha. Aqui o botão diz Desfragmentar, e faz sentido.');
  };

  const abrirComOutro = (arquivo: string, programa: string) => {
    setMenuDoArquivo(null);
    const tipo = ARQUIVOS.find(a => a.nome === arquivo)!.tipo;
    setMaquina(m => ({ ...m, aberturasAvulsas: [...m.aberturasAvulsas, { arquivo, programa }] }));
    setAviso(programa === maquina.padroes[tipo]
      ? `${arquivo} abriu no ${programa} — que já era o programa padrão dele. Para demonstrar "abrir com outro", escolha um diferente.`
      : `${arquivo} abriu no ${programa}, só desta vez. O padrão continua sendo o ${maquina.padroes[tipo]}: dois cliques no arquivo abrem nele.`);
  };

  const definirPadrao = (tipo: string, programa: string) => {
    setMaquina(m => ({ ...m, padroes: { ...m.padroes, [tipo]: programa } }));
    setAviso(`De agora em diante, todo arquivo .${tipo} abre no ${programa} — e não só este. Esta escolha fica guardada; a de "Abrir com" não ficava.`);
  };

  const definirImpressora = (id: string) => {
    setMaquina(m => ({ ...m, impressoraPadrao: id }));
    setAviso('Padrão trocado. É esta que vem escolhida na hora de imprimir — num clube com duas, o padrão errado imprime na sala do lado.');
  };

  const criarUsuario = () => {
    const nome = nomeNovo.trim();
    if (nome.length < 2) { setAviso('Escreva um nome para a conta nova.'); return; }
    setMaquina(m => ({ ...m, usuarios: [...m.usuarios, { nome, administrador: contaAdmin }] }));
    setDialogo(null);
    setNomeNovo('');
    setAviso(contaAdmin
      ? 'Conta criada como administrador — ela pode instalar programa e mexer no sistema inteiro. Separar usuários serve justamente para que nem todos possam.'
      : `Conta de ${nome} criada. Ela tem a própria área de trabalho, os próprios arquivos e as próprias configurações nesta mesma máquina.`);
    setContaAdmin(false);
  };

  const recomecar = () => {
    setMaquina(MAQUINA_INICIAL);
    setAbertas(['config']);
    setEmFoco('config');
    setPagina('sistema');
    setDialogo(null);
    setMenuDoArquivo(null);
    setAviso('');
  };

  const registrar = async () => {
    setErro('');
    setGravando(true);
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) {
      await ensureEnrollment(userId, specId);
      await updateEnrollmentActivity(userId, specId);
    }
    await registrarConclusaoDeLicao(userId, lessonCode);
    let gravados = 0;
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (!reqId) continue;
      await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: METAS_DA_MAQUINA.length, total_questions: METAS_DA_MAQUINA.length,
      });
      gravados++;
    }
    setGravando(false);
    if (gravados < requirementCodes.length) {
      setErro('Você fez tudo, mas o progresso não pôde ser guardado agora. Avise a liderança do clube.');
      return;
    }
    await logActivity(userId, 'configuracoes_concluidas', { specialtyCode, lessonCode, metas: METAS_DA_MAQUINA.length });
    setPronto(true);
  };

  if (pronto) {
    return (
      <div className="card p-6 text-center">
        <FileCheck2 className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
        <h2 className="text-xl font-bold mb-2">Computador do clube ajustado!</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Disco limpo, discos otimizados de acordo com o que cada um é,
          impressora certa escolhida, e cada pessoa com a própria conta. Estes
          são os ajustes que ninguém vê e todo mundo sente.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary mt-4 inline-flex">
          Voltar para a Trilha
        </Link>
      </div>
    );
  }

  const acoes = (
    <div className="flex flex-col gap-2">
      {tudoFeito && (
        <>
          {erro && <p style={{ fontSize: 11.5, color: 'var(--color-error)' }}>{erro}</p>}
          <button onClick={registrar} disabled={gravando} className="btn-primary text-sm w-full justify-center">
            {gravando ? 'Guardando…' : 'Entregar o exercício'}
          </button>
        </>
      )}
      <button onClick={recomecar} className="btn-secondary text-xs py-2 w-full justify-center inline-flex items-center gap-1">
        <RotateCcw className="w-3 h-3" /> Recomeçar a máquina
      </button>
    </div>
  );

  const Item = ({ icone, titulo, sub, aoClicar, direita }: {
    icone: React.ReactNode; titulo: string; sub: string;
    aoClicar: () => void; direita?: React.ReactNode;
  }) => (
    <button type="button" className="cf-item" aria-label={titulo} onClick={aoClicar}>
      <span className="cf-item-icone">{icone}</span>
      <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <strong>{titulo}</strong><br />
        <span style={{ color: '#5F6368', fontSize: 11.5 }}>{sub}</span>
      </span>
      {direita ?? <ChevronRight className="w-4 h-4" style={{ color: '#5F6368' }} />}
    </button>
  );

  const BarraDaJanela = ({ titulo, icone, janela }: {
    titulo: string; icone: React.ReactNode; janela: Janela;
  }) => (
    <div className="cf-barra">
      {icone}
      <span style={{ fontWeight: 600 }}>{titulo}</span>
      <span className="ml-auto flex items-center gap-1">
        <button type="button" aria-label={`Minimizar ${titulo}`}
          onClick={() => setEmFoco(janela === 'config' ? 'explorador' : 'config')}>
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button type="button" aria-label={`Maximizar ${titulo}`}
          onClick={() => naoFazParte('Maximizar')}>
          <SquareIcon className="w-3 h-3" />
        </button>
        <button type="button" aria-label={`Fechar ${titulo}`}
          onClick={() => setAbertas(a => a.filter(x => x !== janela))}>
          <X className="w-3.5 h-3.5" />
        </button>
      </span>
    </div>
  );

  return (
    <LaboratorioEmTelaCheia
      trilha={specialtyCode}
      voltarPara={`/especialidade/${specialtyCode}`}
      titulo={lessonTitle}
      programa="windows"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      rodape={46}
    >
      <style>{CSS_WINDOWS}</style>
      <style>{`
        .cf-area {
          flex: 1; min-height: 0; position: relative; overflow: hidden;
          background: linear-gradient(160deg, #1E3A5F 0%, #2B5C8A 55%, #4E86B8 100%);
          font-family: system-ui, 'Segoe UI', Roboto, sans-serif; font-size: 13px;
        }
        .cf-janela {
          position: absolute; background: #F3F3F3; color: #1B1B1B;
          border-radius: 8px; box-shadow: 0 12px 34px rgba(0,0,0,.42);
          display: flex; flex-direction: column; overflow: hidden;
        }
        .cf-janela.config { left: 3%; top: 3%; width: 62%; height: 88%; }
        .cf-janela.explorador { right: 3%; top: 14%; width: 44%; height: 66%; }
        .cf-barra {
          display: flex; align-items: center; gap: 8px; padding: 7px 10px;
          background: #FFFFFF; border-bottom: 1px solid #E5E5E5; font-size: 12.5px;
        }
        .cf-barra button { color: #5F6368; padding: 2px 6px; border-radius: 3px; }
        .cf-barra button:hover { background: #E9E9E9; }
        .cf-corpo { flex: 1; min-height: 0; display: flex; }
        .cf-lado { width: 178px; flex: none; padding: 8px 6px; overflow-y: auto; }
        .cf-maquina { font-size: 11.5px; color: #5F6368; padding: 4px 12px 10px; }
        .cf-nav {
          display: flex; align-items: center; gap: 10px; width: 100%; text-align: left;
          padding: 8px 12px; border: none; background: none; cursor: pointer;
          border-radius: 5px; color: #1B1B1B; font-size: 12.5px;
        }
        .cf-nav:hover { background: #E9E9E9; }
        .cf-nav[aria-current="true"] { background: #E4EEF7; font-weight: 600; }
        .cf-conteudo { flex: 1; min-width: 0; overflow: auto; padding: 14px 18px; background: #F3F3F3; }
        .cf-titulo { font-size: 19px; font-weight: 600; color: #1B1B1B; margin-bottom: 12px; }
        .cf-item {
          display: flex; align-items: center; gap: 12px; width: 100%;
          background: #FFFFFF; border: 1px solid #E5E5E5; border-radius: 5px;
          padding: 11px 13px; margin-bottom: 7px; cursor: pointer; color: #1B1B1B; font-size: 12.5px;
        }
        .cf-item:hover { background: #FAFAFA; }
        .cf-item-icone { color: #0F6CBD; display: flex; }
        .cf-voltar {
          display: inline-flex; align-items: center; gap: 4px; margin-bottom: 8px;
          background: none; border: none; color: #0F6CBD; font-size: 12.5px; cursor: pointer;
        }
        .cf-tabela { width: 100%; border-collapse: collapse; font-size: 12.5px; background: #FFFFFF; }
        .cf-tabela th, .cf-tabela td {
          border-bottom: 1px solid #E5E5E5; padding: 8px 10px; text-align: left; color: #1B1B1B;
        }
        .cf-tabela th { color: #5F6368; font-weight: 600; font-size: 11.5px; }
        .cf-arquivos { flex: 1; min-height: 0; overflow: auto; background: #FFFFFF; }
        .cf-arquivo {
          display: flex; align-items: center; gap: 10px; width: 100%;
          padding: 7px 12px; color: #1B1B1B; font-size: 12.5px;
        }
        .cf-arquivo:hover { background: #F0F0F0; }
        .cf-nome-arquivo {
          flex: 1; min-width: 0; text-align: left; background: none; border: none;
          color: inherit; font: inherit; cursor: pointer; padding: 2px 0;
        }
        .cf-nome-arquivo:hover { text-decoration: underline; }
        .cf-menu-arquivo {
          position: absolute; z-index: 40; background: #FFFFFF; border: 1px solid #D5D5D5;
          border-radius: 6px; box-shadow: 0 8px 24px rgba(0,0,0,.24); padding: 4px; min-width: 226px;
        }
        .cf-menu-arquivo button {
          display: flex; align-items: center; gap: 8px; width: 100%; text-align: left;
          padding: 7px 10px; border: none; background: none; border-radius: 4px;
          font-size: 12.5px; color: #1B1B1B; cursor: pointer;
        }
        .cf-menu-arquivo button:hover { background: #EAEAEA; }
        .cf-taskbar {
          position: absolute; left: 0; right: 0; bottom: 0; height: 46px;
          background: rgba(243,243,243,.94); border-top: 1px solid #DDD;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .cf-taskbar button {
          display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px;
          border-radius: 5px; background: transparent; border: none; cursor: pointer;
          color: #1B1B1B; font-size: 12px;
        }
        .cf-taskbar button:hover { background: #E4E4E4; }
        .cf-taskbar button[aria-current="true"] { background: #DCE9F5; }
        @media (max-width: 900px) {
          .cf-janela.config { left: 2%; top: 2%; width: 96%; height: 62%; }
          .cf-janela.explorador { right: 2%; top: 40%; width: 96%; height: 50%; }
        }
      `}</style>

      <div className="cf-area" onClick={() => setMenuDoArquivo(null)}>
        {/* ── Configurações ── */}
        {abertas.includes('config') && (
          <div className="cf-janela config" style={{ zIndex: emFoco === 'config' ? 20 : 10 }}
            onClick={ev => { ev.stopPropagation(); setEmFoco('config'); setMenuDoArquivo(null); }}>
            <BarraDaJanela titulo="Configurações" janela="config"
              icone={<Settings className="w-4 h-4" style={{ color: '#0F6CBD' }} />} />
            <div className="cf-corpo">
              <nav className="cf-lado">
                <p className="cf-maquina">PC-CLUBE-01</p>
                <button type="button" className="cf-nav" aria-current={pagina === 'sistema' || pagina === 'armazenamento'}
                  onClick={() => setPagina('sistema')}>
                  <Monitor className="w-4 h-4" /> Sistema
                </button>
                <button type="button" className="cf-nav" aria-current={pagina === 'dispositivos'}
                  onClick={() => setPagina('dispositivos')}>
                  <Bluetooth className="w-4 h-4" /> Bluetooth e dispositivos
                </button>
                <button type="button" className="cf-nav" aria-current={pagina === 'aplicativos'}
                  onClick={() => setPagina('aplicativos')}>
                  <LayoutGrid className="w-4 h-4" /> Aplicativos
                </button>
                <button type="button" className="cf-nav" aria-current={pagina === 'contas'}
                  onClick={() => setPagina('contas')}>
                  <Users className="w-4 h-4" /> Contas
                </button>
              </nav>

              <div className="cf-conteudo">
                {pagina === 'sistema' && (
                  <>
                    <h3 className="cf-titulo">Sistema</h3>
                    <Item icone={<Monitor className="w-4 h-4" />} titulo="Vídeo"
                      sub="Monitores, brilho, resolução"
                      aoClicar={() => naoFazParte('Vídeo')} />
                    <Item icone={<HardDrive className="w-4 h-4" />} titulo="Armazenamento"
                      sub="Espaço em disco, unidades, limpeza"
                      aoClicar={() => setPagina('armazenamento')} />
                  </>
                )}

                {pagina === 'armazenamento' && (
                  <>
                    <button type="button" className="cf-voltar" onClick={() => setPagina('sistema')}>
                      <ChevronLeft className="w-4 h-4" /> Sistema
                    </button>
                    <h3 className="cf-titulo">Armazenamento</h3>
                    {maquina.discos.map(d => (
                      <div key={d.id} style={{
                        background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 5,
                        padding: '11px 13px', marginBottom: 7,
                      }}>
                        <p style={{ fontWeight: 600 }}>{d.nome}</p>
                        <p style={{ color: '#5F6368', fontSize: 11.5 }}>
                          {nomeDoTipo(d)} · {d.limpo ? 'sem lixo acumulado' : `${d.lixoEmGb} GB de arquivos temporários`}
                        </p>
                      </div>
                    ))}
                    <Item icone={<Trash2 className="w-4 h-4" />} titulo="Limpeza de Disco"
                      sub="Remove temporários, lixeira e restos de atualização"
                      aoClicar={() => setDialogo('limpeza')}
                      direita={maquina.discos.find(d => d.id === 'c')!.limpo
                        ? <Check className="w-4 h-4" style={{ color: '#107C41' }} /> : undefined} />
                    <Item icone={<Gauge className="w-4 h-4" />} titulo="Otimizar Unidades"
                      sub="Desfragmentar e otimizar as unidades"
                      aoClicar={() => setDialogo('otimizar')}
                      direita={maquina.discos.every(d => d.otimizado)
                        ? <Check className="w-4 h-4" style={{ color: '#107C41' }} /> : undefined} />
                  </>
                )}

                {pagina === 'dispositivos' && (
                  <>
                    <h3 className="cf-titulo">Impressoras e scanners</h3>
                    {IMPRESSORAS.map(imp => (
                      <div key={imp.id} style={{
                        background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 5,
                        padding: '11px 13px', marginBottom: 7, display: 'flex',
                        alignItems: 'center', gap: 12,
                      }}>
                        <Printer className="w-4 h-4" style={{ color: '#0F6CBD' }} />
                        <span style={{ flex: 1 }}>
                          <strong>{imp.nome}</strong><br />
                          <span style={{ color: '#5F6368', fontSize: 11.5 }}>
                            {imp.local}
                            {maquina.impressoraPadrao === imp.id && ' · Padrão'}
                          </span>
                        </span>
                        {maquina.impressoraPadrao === imp.id ? (
                          <span style={{ color: '#107C41', fontSize: 11.5, display: 'flex', gap: 4 }}>
                            <Check className="w-4 h-4" /> Padrão
                          </span>
                        ) : (
                          <button type="button" className="win-bt"
                            aria-label={`Definir ${imp.nome} como padrão`}
                            onClick={() => definirImpressora(imp.id)}>
                            Definir como padrão
                          </button>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {pagina === 'aplicativos' && (
                  <>
                    <h3 className="cf-titulo">Aplicativos padrão</h3>
                    <p style={{ color: '#5F6368', fontSize: 12, marginBottom: 10 }}>
                      Escolha o programa que abre cada tipo de arquivo. Vale para todos os
                      arquivos daquele tipo, de agora em diante.
                    </p>
                    <table className="cf-tabela">
                      <thead>
                        <tr><th>Tipo de arquivo</th><th>Programa padrão</th></tr>
                      </thead>
                      <tbody>
                        {Object.keys(PROGRAMAS_POR_TIPO).map(tipo => (
                          <tr key={tipo}>
                            <td>.{tipo}</td>
                            <td>
                              <select className="win-campo" value={maquina.padroes[tipo]}
                                aria-label={`Programa padrão para .${tipo}`}
                                onChange={e => definirPadrao(tipo, e.target.value)}>
                                {PROGRAMAS_POR_TIPO[tipo].map(p => (
                                  <option key={p} value={p}>{p}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}

                {pagina === 'contas' && (
                  <>
                    <h3 className="cf-titulo">Outros usuários</h3>
                    {maquina.usuarios.map(u => (
                      <div key={u.nome} style={{
                        background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 5,
                        padding: '11px 13px', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 12,
                      }}>
                        <Users className="w-4 h-4" style={{ color: '#0F6CBD' }} />
                        <span>
                          <strong>{u.nome}</strong><br />
                          <span style={{ color: '#5F6368', fontSize: 11.5 }}>
                            {u.administrador ? 'Administrador' : 'Conta padrão'}
                          </span>
                        </span>
                      </div>
                    ))}
                    <button type="button" className="win-bt primario"
                      aria-label="Adicionar conta"
                      onClick={() => setDialogo('novo-usuario')}>
                      <UserPlus className="w-4 h-4" /> Adicionar conta
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Explorador, onde o "abrir com" acontece ── */}
        {abertas.includes('explorador') && (
          <div className="cf-janela explorador" style={{ zIndex: emFoco === 'explorador' ? 20 : 10 }}
            onClick={ev => { ev.stopPropagation(); setEmFoco('explorador'); }}>
            <BarraDaJanela titulo="Documentos do clube" janela="explorador"
              icone={<FolderOpen className="w-4 h-4" style={{ color: '#E3B341' }} />} />
            <div className="cf-arquivos">
              {ARQUIVOS.map(a => {
                const Icone = ICONE_DO_ARQUIVO[a.tipo];
                /* A linha é um `div`, e não um botão: um botão dentro de outro
                   é HTML inválido, e o navegador decide sozinho o que fazer com
                   o clique de dentro. O nome do arquivo abre no padrão; o botão
                   ao lado abre o menu. */
                return (
                  <div key={a.nome} className="cf-arquivo" style={{ position: 'relative' }}
                    onContextMenu={ev => {
                      ev.preventDefault();
                      ev.stopPropagation();
                      setMenuDoArquivo(a.nome);
                    }}>
                    <Icone className="w-4 h-4" style={{ color: '#0F6CBD' }} />
                    <button type="button" className="cf-nome-arquivo"
                      aria-label={`Arquivo ${a.nome}`}
                      onClick={ev => {
                        ev.stopPropagation();
                        abrirComOutro(a.nome, maquina.padroes[a.tipo]);
                      }}>
                      {a.nome}
                    </button>
                    <span style={{ color: '#5F6368', fontSize: 11 }}>
                      abre no {maquina.padroes[a.tipo]}
                    </span>
                    <button type="button" className="win-bt"
                      aria-label={`Abrir com — ${a.nome}`}
                      onClick={ev => { ev.stopPropagation(); setMenuDoArquivo(a.nome); }}>
                      Abrir com
                    </button>
                    {menuDoArquivo === a.nome && (
                      <div className="cf-menu-arquivo" style={{ left: 40, top: '100%' }}
                        onClick={ev => ev.stopPropagation()}>
                        <p style={{ fontSize: 11, color: '#5F6368', padding: '4px 10px 2px' }}>
                          Abrir com — só desta vez
                        </p>
                        {PROGRAMAS_POR_TIPO[a.tipo].map(p => (
                          <button key={p} type="button"
                            aria-label={`Abrir ${a.nome} com ${p}`}
                            onClick={() => abrirComOutro(a.nome, p)}>
                            {p}
                            {maquina.padroes[a.tipo] === p && (
                              <span style={{ marginLeft: 'auto', color: '#5F6368', fontSize: 11 }}>padrão</span>
                            )}
                          </button>
                        ))}
                        <div style={{ height: 1, background: '#E5E5E5', margin: '4px 6px' }} />
                        <button type="button" aria-label="Escolher outro aplicativo"
                          onClick={() => { setMenuDoArquivo(null); setEmFoco('config'); setPagina('aplicativos'); }}>
                          Escolher outro aplicativo…
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {maquina.aberturasAvulsas.length > 0 && (
                <p style={{ padding: '8px 12px', fontSize: 11.5, color: '#5F6368' }}>
                  Aberturas avulsas nesta sessão:{' '}
                  {maquina.aberturasAvulsas.map(a => `${a.arquivo} → ${a.programa}`).join(' · ')}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="cf-taskbar" onClick={ev => ev.stopPropagation()}>
          <button type="button" aria-label="Configurações na barra de tarefas"
            aria-current={emFoco === 'config' && abertas.includes('config')}
            onClick={() => abrirJanela('config')}>
            <Settings className="w-4 h-4" style={{ color: '#0F6CBD' }} /> Configurações
          </button>
          <button type="button" aria-label="Explorador de Arquivos na barra de tarefas"
            aria-current={emFoco === 'explorador' && abertas.includes('explorador')}
            onClick={() => abrirJanela('explorador')}>
            <FolderOpen className="w-4 h-4" style={{ color: '#E3B341' }} /> Explorador
          </button>
        </div>
      </div>

      {dialogo === 'limpeza' && (
        <DialogoDoWindows titulo="Limpeza de Disco — Windows (C:)"
          acoes={
            <>
              <button type="button" className="win-bt" onClick={() => setDialogo(null)}>Cancelar</button>
              <button type="button" className="win-bt primario" onClick={limpar}>OK</button>
            </>
          }>
          <p style={{ fontSize: 12.5, marginBottom: 8 }}>
            Arquivos a excluir — você ganha <strong>12 GB</strong> de espaço:
          </p>
          <ul style={{ fontSize: 12.5, listStyle: 'disc', paddingLeft: 18, color: '#1B1B1B' }}>
            <li>Arquivos temporários da Internet — 4,1 GB</li>
            <li>Lixeira — 2,6 GB</li>
            <li>Arquivos de instalação do Windows já aplicados — 5,3 GB</li>
          </ul>
          <p style={{ fontSize: 11.5, color: '#616161', marginTop: 10 }}>
            Documentos, fotos e programas instalados não são tocados.
          </p>
        </DialogoDoWindows>
      )}

      {dialogo === 'otimizar' && (
        <DialogoDoWindows titulo="Otimizar Unidades"
          acoes={<button type="button" className="win-bt" onClick={() => setDialogo(null)}>Fechar</button>}>
          <table className="cf-tabela">
            <thead>
              <tr><th>Unidade</th><th>Tipo de mídia</th><th>Estado</th><th /></tr>
            </thead>
            <tbody>
              {maquina.discos.map(d => (
                <tr key={d.id}>
                  <td>{d.nome}</td>
                  <td>{nomeDoTipo(d)}</td>
                  <td>{d.otimizado ? 'OK' : 'Precisa de otimização'}</td>
                  <td>
                    <button type="button" className="win-bt"
                      aria-label={`${acaoDoDisco(d)} ${d.nome}`}
                      onClick={() => otimizar(d.id)}>
                      {acaoDoDisco(d)}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 11.5, color: '#616161', marginTop: 10 }}>
            A ferramenta é a mesma, e o botão muda de nome conforme a unidade. Em
            unidade de estado sólido não há prato girando: desfragmentar não
            acelera nada, e por isso ali ele diz Otimizar.
          </p>
        </DialogoDoWindows>
      )}

      {dialogo === 'novo-usuario' && (
        <DialogoDoWindows titulo="Adicionar uma conta"
          acoes={
            <>
              <button type="button" className="win-bt" onClick={() => setDialogo(null)}>Cancelar</button>
              <button type="button" className="win-bt primario" onClick={criarUsuario}>Criar conta</button>
            </>
          }>
          <p style={{ fontSize: 12.5, marginBottom: 8 }}>Quem vai usar este computador?</p>
          <input className="win-campo" placeholder="Nome da pessoa" value={nomeNovo}
            aria-label="Nome da conta" style={{ marginBottom: 10 }}
            onChange={e => setNomeNovo(e.target.value)} />
          <label className="flex items-center gap-2" style={{ fontSize: 12.5 }}>
            <input type="checkbox" checked={contaAdmin}
              aria-label="Conta de administrador"
              onChange={e => setContaAdmin(e.target.checked)} />
            Tornar esta conta administrador
          </label>
          <p style={{ fontSize: 11.5, color: '#616161', marginTop: 8 }}>
            Administrador instala programa e mexe no sistema inteiro. Conta padrão
            tem a própria área de trabalho e os próprios arquivos — e é o que a
            maioria precisa.
          </p>
        </DialogoDoWindows>
      )}
    </LaboratorioEmTelaCheia>
  );
}
