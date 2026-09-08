import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Folder, FileText, FileImage, Trash2, Monitor, HardDrive, Cpu, MemoryStick,
  Settings, Clock, Info, Grid2x2, Scissors, Link2, Image as ImageIcon,
  FileCheck2, RotateCcw, Search, ChevronRight,
} from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import { CSS_WINDOWS, BarraDeJanela, DialogoDoWindows } from './windows';
import {
  upsertRequirementProgress, getRequirementId, getSpecialtyId,
  ensureEnrollment, updateEnrollmentActivity, logActivity,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import type { PropsDeLaboratorio as Props } from './tipos';
import {
  ARQUIVOS, FICHA_DA_MAQUINA, ESTADO_INICIAL, METAS_DA_AREA as METAS,
  emKB, emMB, TIPO,
  type Arquivo, type Estado,
} from './metasDaAp043';

/* O desenho de cada espécie de arquivo fica no componente: é tela, e não
   critério. O que o teste precisa alcançar são as metas e o estado inicial. */
const ICONE: Record<Arquivo['especie'], typeof FileText> = {
  docx: FileText, pdf: FileText, jpg: FileImage, png: FileImage,
};

/*
 * AP043 requisito 8 — as cinco demonstrações no próprio sistema.
 *
 * Consultar as informações técnicas, consultar os detalhes de um arquivo,
 * acrescentar item na área de trabalho, fazer um print da tela e ajustar a
 * data e a hora. Nenhuma delas o navegador pode fazer na máquina de quem
 * estuda — a página não lê a memória do computador de ninguém, não mexe no
 * relógio do sistema e não põe atalho na área de trabalho de casa. A
 * alternativa seria marcar "fiz" numa lista, e autodeclaração é o que o resto
 * da plataforma evita.
 *
 * ── Por que a área de trabalho é o palco, e não uma janela ───────────────
 * Nos outros laboratórios da família a janela é maximizada e a área de
 * trabalho só se vê pela borda. Aqui não dá: uma das cinco tarefas é
 * justamente pôr coisa **na** área de trabalho, e o resultado dela só existe
 * se a área de trabalho estiver à vista. Então ela é o fundo, com ícones, e
 * as janelas abrem por cima.
 *
 * ── As armadilhas, uma por tarefa ────────────────────────────────────────
 *   técnicas   — as informações técnicas não estão no Explorador nem no menu
 *                do botão direito da área de trabalho: estão em Configurações,
 *                em Sistema › Sobre. Quem procura em "Este Computador" acha
 *                espaço em disco e mais nada;
 *   detalhes   — detalhes de arquivo não é o que a lista mostra. É
 *                Propriedades, no menu do botão direito — e é lá que estão o
 *                tamanho de verdade, o tipo, o local e as datas;
 *   atalho     — arrastar o arquivo para a área de trabalho **move** o
 *                arquivo, e não cria atalho. Quem faz isso tira o arquivo da
 *                pasta onde ele estava, sem perceber. O caminho certo é Enviar
 *                para › Área de Trabalho (criar atalho), ou Novo › Atalho no
 *                menu da própria área de trabalho. Os dois estão aqui, e o
 *                errado também — com o aviso na hora;
 *   print      — no Windows 11 a tecla Print Screen abre a Ferramenta de
 *                Captura, e não copia a tela em silêncio. O print vira arquivo
 *                numa pasta, e a tarefa só fecha quando ele existe;
 *   relógio    — data e hora quase sempre estão em "definir automaticamente", e
 *                é preciso desligar isso antes de conseguir mudar. É a chave
 *                que faz todo mundo achar que o campo está quebrado.
 */

/* ── O laboratório ─────────────────────────────────────────────────────────── */

type Programa = 'explorador' | 'config' | 'captura';
type PaginaDaConfig = 'sistema' | 'sobre' | 'hora';

export default function AreaDeTrabalhoLab({
  specialtyCode, lessonCode, lessonTitle, requirementCodes, userId,
}: Props) {
  const [e, setE] = useState<Estado>(ESTADO_INICIAL);
  const [abertos, setAbertos] = useState<Programa[]>([]);
  const [emFoco, setEmFoco] = useState<Programa | null>(null);
  const [iniciar, setIniciar] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number; alvo: 'area' | string } | null>(null);
  const [submenu, setSubmenu] = useState<string | null>(null);
  const [paginaConfig, setPaginaConfig] = useState<PaginaDaConfig>('sistema');
  const [propriedadesDe, setPropriedadesDe] = useState<Arquivo | null>(null);
  const [rascunhoData, setRascunhoData] = useState(ESTADO_INICIAL.data);
  const [rascunhoHora, setRascunhoHora] = useState(ESTADO_INICIAL.hora);
  const [capturaFeita, setCapturaFeita] = useState(false);
  const [aviso, setAviso] = useState('');
  const [gravando, setGravando] = useState(false);
  const [erro, setErro] = useState('');
  const [pronto, setPronto] = useState(false);

  const avisar = (texto: string) => {
    setAviso(texto);
    window.setTimeout(() => setAviso(a => (a === texto ? '' : a)), 8000);
  };

  const abrir = (p: Programa) => {
    setAbertos(a => (a.includes(p) ? a : [...a, p]));
    setEmFoco(p);
    setIniciar(false);
    setMenu(null);
  };

  const fechar = (p: Programa) => {
    setAbertos(a => a.filter(x => x !== p));
    setEmFoco(f => (f === p ? null : f));
  };

  /*
    A tecla Print Screen de verdade, quando o teclado tem uma.

    No Windows 11 ela abre a Ferramenta de Captura, e é isso que acontece aqui.
    Nem todo navegador entrega essa tecla à página — por isso o caminho pelo
    menu Iniciar existe e é o que os passos ensinam. Quem tem a tecla ganha o
    atalho; quem não tem não fica sem tarefa.
  */
  useEffect(() => {
    const aoTeclar = (ev: KeyboardEvent) => {
      if (ev.key !== 'PrintScreen') return;
      ev.preventDefault();
      abrir('captura');
      avisar('A tecla Print Screen abriu a Ferramenta de Captura — é o que ela faz no Windows 11.');
    };
    window.addEventListener('keyup', aoTeclar);
    return () => window.removeEventListener('keyup', aoTeclar);
  }, []);

  const abrirMenu = (ev: React.MouseEvent, alvo: 'area' | string) => {
    ev.preventDefault();
    ev.stopPropagation();
    setMenu({ x: ev.clientX, y: ev.clientY, alvo });
    setSubmenu(null);
    setIniciar(false);
  };

  const criarAtalho = (nome: string) => {
    setE((a: Estado) => ({
      ...a,
      itensNaArea: a.itensNaArea.some(i => i.nome === nome)
        ? a.itensNaArea
        : [...a.itensNaArea, { id: `at-${a.itensNaArea.length + 1}`, nome, tipo: 'atalho' }],
    }));
    setMenu(null);
    setSubmenu(null);
  };

  const moverParaArea = (arquivo: Arquivo) => {
    setE((a: Estado) => ({ ...a, arquivoMovido: true }));
    setMenu(null);
    avisar(`Isso moveu ${arquivo.nome} para a área de trabalho — o arquivo saiu da pasta Clube. Não é atalho: atalho é um apontador, e deixa o arquivo onde ele estava. Use Enviar para › Área de Trabalho (criar atalho).`);
  };

  const salvarPrint = () => {
    setE((a: Estado) => ({ ...a, prints: [...a.prints, `Captura ${a.prints.length + 1}.png`] }));
    setCapturaFeita(false);
    avisar('O print virou um arquivo na pasta Capturas de Tela. Print que fica só na memória se perde na próxima cópia.');
  };

  const aplicarRelogio = () => {
    if (e.relogioAutomatico) {
      avisar('Os campos estão desligados enquanto "Definir horário automaticamente" estiver ligado. Desligue a chave primeiro.');
      return;
    }
    const mudou = rascunhoData !== e.data || rascunhoHora !== e.hora;
    if (!mudou) {
      avisar('A data e a hora continuam as mesmas. Mude alguma coisa antes de aplicar.');
      return;
    }
    setE((a: Estado) => ({ ...a, data: rascunhoData, hora: rascunhoHora, relogioAjustado: true }));
    avisar('Relógio ajustado. Repare que a hora mudou também na barra de tarefas.');
  };

  const recomecar = () => {
    setE(ESTADO_INICIAL);
    setAbertos([]);
    setEmFoco(null);
    setIniciar(false);
    setMenu(null);
    setPropriedadesDe(null);
    setPaginaConfig('sistema');
    setRascunhoData(ESTADO_INICIAL.data);
    setRascunhoHora(ESTADO_INICIAL.hora);
    setCapturaFeita(false);
    setAviso('');
  };

  const tarefas = METAS.map(m => ({
    id: m.id, titulo: m.titulo, detalhe: m.detalhe, onde: m.onde, passos: m.passos,
    feita: m.feita(e),
  }));
  const tudoFeito = tarefas.every(t => t.feita);

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
        attempts: 1, correct_count: METAS.length, total_questions: METAS.length,
      });
      gravados++;
    }
    setGravando(false);
    if (gravados < requirementCodes.length) {
      setErro('Você fez as cinco, mas o progresso não pôde ser guardado agora. Avise a liderança do clube.');
      return;
    }
    await logActivity(userId, 'area_de_trabalho_concluida', { specialtyCode, lessonCode, metas: METAS.length });
    setPronto(true);
  };

  if (pronto) {
    return (
      <div className="card p-6 text-center">
        <FileCheck2 className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
        <h2 className="text-xl font-bold mb-2">As cinco demonstrações, feitas</h2>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Informações técnicas, detalhes de arquivo, item na área de trabalho, print e relógio.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary">
          Voltar para a trilha
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
            {gravando ? 'Guardando…' : 'Entregar as demonstrações'}
          </button>
        </>
      )}
      <button onClick={recomecar} className="btn-secondary text-xs py-2 w-full justify-center inline-flex items-center gap-1">
        <RotateCcw className="w-3 h-3" /> Recomeçar
      </button>
    </div>
  );

  const arquivosVisiveis = e.arquivoMovido ? ARQUIVOS.filter(a => a.id !== 'a1') : ARQUIVOS;

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
      <style>{CSS_AREA}</style>

      <div className="win-mesa" onClick={() => { setMenu(null); setIniciar(false); setSubmenu(null); }}>
        <div className="win-area" onContextMenu={ev => abrirMenu(ev, 'area')}>

          {/* ── Os ícones da área de trabalho ── */}
          <div className="ar-icones">
            <div className="ar-icone"><Trash2 className="w-7 h-7" /><span>Lixeira</span></div>
            <div className="ar-icone"><Monitor className="w-7 h-7" /><span>Este Computador</span></div>
            {e.arquivoMovido && (
              <div className="ar-icone"><FileText className="w-7 h-7" /><span>lista-de-presenca.docx</span></div>
            )}
            {e.itensNaArea.map(i => (
              <div className="ar-icone" key={i.id}>
                <span className="ar-com-seta">
                  <Folder className="w-7 h-7" />
                  <Link2 className="ar-seta w-3 h-3" />
                </span>
                <span>{i.nome}</span>
              </div>
            ))}
            {e.prints.map(nome => (
              <div className="ar-icone" key={nome}><ImageIcon className="w-7 h-7" /><span>{nome}</span></div>
            ))}
          </div>

          {/* ── Explorador ── */}
          {abertos.includes('explorador') && (
            <div className="win-janela media" style={{ zIndex: emFoco === 'explorador' ? 20 : 10 }}
              onClick={ev => { ev.stopPropagation(); setEmFoco('explorador'); setMenu(null); }}>
              <BarraDeJanela icone={<Folder className="w-4 h-4" style={{ color: '#E6B14C' }} />}
                titulo="Clube" aoMinimizar={() => setEmFoco(null)} aoFechar={() => fechar('explorador')} />
              <div className="win-endereco">
                <div className="win-caminho">
                  <button type="button">Documentos</button>
                  <ChevronRight className="w-3 h-3" style={{ color: '#767676' }} />
                  <button type="button">Clube</button>
                </div>
                <div className="win-busca"><Search className="w-3.5 h-3.5" /> Pesquisar</div>
              </div>
              <div className="win-corpo">
                <div className="win-lista">
                  <div className="win-cabecalhos">
                    <button className="win-c-nome" type="button">Nome</button>
                    <button className="win-c-data" type="button">Data de modificação</button>
                    <button className="win-c-tipo" type="button">Tipo</button>
                    <button className="win-c-tam" type="button">Tamanho</button>
                  </div>
                  <div style={{ overflowY: 'auto' }}>
                    {arquivosVisiveis.map(a => {
                      const Desenho = ICONE[a.especie];
                      return (
                        <div key={a.id} className="win-linha"
                          onContextMenu={ev => abrirMenu(ev, a.id)}>
                          <span className="win-c-nome flex items-center gap-2 px-2">
                            <Desenho className="w-4 h-4" style={{ color: '#5B7FA8' }} />
                            {a.nome}
                          </span>
                          <span className="win-c-data" style={{ color: '#5B5B5B' }}>{a.modificado}</span>
                          <span className="win-c-tipo" style={{ color: '#5B5B5B' }}>{TIPO[a.especie].split(' (')[0]}</span>
                          <span className="win-c-tam" style={{ color: '#5B5B5B', paddingRight: 10 }}>{emKB(a.bytes)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="win-status">
                <span>{arquivosVisiveis.length} itens</span>
                <span className="ml-auto">Botão direito num arquivo abre o menu</span>
              </div>
            </div>
          )}

          {/* ── Configurações ── */}
          {abertos.includes('config') && (
            <div className="win-janela media" style={{ zIndex: emFoco === 'config' ? 20 : 10 }}
              onClick={ev => { ev.stopPropagation(); setEmFoco('config'); setMenu(null); }}>
              <BarraDeJanela icone={<Settings className="w-4 h-4" style={{ color: '#0F6CBD' }} />}
                titulo="Configurações" aoMinimizar={() => setEmFoco(null)} aoFechar={() => fechar('config')} />
              <div className="ar-config">
                <nav className="ar-config-lado">
                  <p className="ar-config-maquina">{FICHA_DA_MAQUINA.nome}</p>
                  <button type="button" className={paginaConfig !== 'hora' ? 'ativo' : ''}
                    onClick={() => setPaginaConfig('sistema')}>
                    <Monitor className="w-4 h-4" /> Sistema
                  </button>
                  <button type="button" className={paginaConfig === 'hora' ? 'ativo' : ''}
                    onClick={() => setPaginaConfig('hora')}>
                    <Clock className="w-4 h-4" /> Hora e idioma
                  </button>
                </nav>

                <div className="ar-config-corpo">
                  {paginaConfig === 'sistema' && (
                    <>
                      <h3 className="ar-config-titulo">Sistema</h3>
                      <button type="button" className="ar-config-item"
                        onClick={() => avisar('Vídeo não faz parte deste exercício.')}>
                        <Monitor className="w-4 h-4" />
                        <span><strong>Vídeo</strong><br />Monitores, brilho, resolução</span>
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </button>
                      <button type="button" className="ar-config-item"
                        onClick={() => avisar('Armazenamento não faz parte deste exercício — o espaço em disco aparece em Sobre.')}>
                        <HardDrive className="w-4 h-4" />
                        <span><strong>Armazenamento</strong><br />Espaço em disco, unidades</span>
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </button>
                      <button type="button" className="ar-config-item"
                        onClick={() => { setPaginaConfig('sobre'); setE((a: Estado) => ({ ...a, viuAsInformacoes: true })); }}>
                        <Info className="w-4 h-4" />
                        <span><strong>Sobre</strong><br />Especificações do dispositivo e do Windows</span>
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </button>
                    </>
                  )}

                  {paginaConfig === 'sobre' && (
                    <>
                      <button type="button" className="ar-voltar" onClick={() => setPaginaConfig('sistema')}>
                        ‹ Sistema
                      </button>
                      <h3 className="ar-config-titulo">Sobre</h3>
                      <p className="ar-config-nome">{FICHA_DA_MAQUINA.nome}</p>

                      <p className="ar-config-sub">Especificações do dispositivo</p>
                      <dl className="ar-ficha">
                        <dt><Cpu className="w-3.5 h-3.5" /> Processador</dt>
                        <dd>{FICHA_DA_MAQUINA.processador}</dd>
                        <dt><MemoryStick className="w-3.5 h-3.5" /> RAM instalada</dt>
                        <dd>{FICHA_DA_MAQUINA.memoria}</dd>
                        <dt><HardDrive className="w-3.5 h-3.5" /> Armazenamento</dt>
                        <dd>{FICHA_DA_MAQUINA.armazenamento}</dd>
                        <dt><Monitor className="w-3.5 h-3.5" /> Tipo de sistema</dt>
                        <dd>{FICHA_DA_MAQUINA.arquitetura}</dd>
                      </dl>

                      <p className="ar-config-sub">Especificações do Windows</p>
                      <dl className="ar-ficha">
                        <dt>Edição</dt>
                        <dd>{FICHA_DA_MAQUINA.sistema}</dd>
                      </dl>

                      <p className="ar-config-dica">
                        É esta a tela que se abre quando alguém pergunta “quanta memória tem esse
                        computador?”. Ela não fica no Explorador.
                      </p>
                    </>
                  )}

                  {paginaConfig === 'hora' && (
                    <>
                      <h3 className="ar-config-titulo">Data e hora</h3>
                      <p className="ar-config-nome">{e.data} — {e.hora}</p>

                      <label className="ar-chave">
                        <span>
                          <strong>Definir horário automaticamente</strong><br />
                          <span style={{ color: '#5B5B5B' }}>O relógio acerta sozinho pela internet</span>
                        </span>
                        <button type="button"
                          role="switch" aria-checked={e.relogioAutomatico}
                          className={`ar-switch ${e.relogioAutomatico ? 'ligado' : ''}`}
                          onClick={() => setE((a: Estado) => ({ ...a, relogioAutomatico: !a.relogioAutomatico }))}>
                          <span className="ar-switch-bolinha" />
                        </button>
                      </label>

                      <div className={`ar-manual ${e.relogioAutomatico ? 'apagado' : ''}`}>
                        <p className="ar-config-sub">Definir data e hora manualmente</p>
                        <div className="flex gap-2 items-center flex-wrap">
                          <input className="ar-campo" value={rascunhoData}
                            disabled={e.relogioAutomatico}
                            onChange={ev => setRascunhoData(ev.target.value)}
                            aria-label="Data" />
                          <input className="ar-campo" value={rascunhoHora}
                            disabled={e.relogioAutomatico}
                            onChange={ev => setRascunhoHora(ev.target.value)}
                            aria-label="Hora" />
                          <button type="button" className="win-bt primario" onClick={aplicarRelogio}>
                            Alterar
                          </button>
                        </div>
                        {e.relogioAutomatico && (
                          <p className="ar-config-dica">
                            Os campos estão apagados porque a chave acima está ligada. É esta a
                            razão de tanta gente achar que o relógio não deixa mudar.
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Ferramenta de Captura ── */}
          {abertos.includes('captura') && (
            <div className="win-janela ar-captura" style={{ zIndex: emFoco === 'captura' ? 30 : 15 }}
              onClick={ev => { ev.stopPropagation(); setEmFoco('captura'); setMenu(null); }}>
              <BarraDeJanela icone={<Scissors className="w-4 h-4" style={{ color: '#0F6CBD' }} />}
                titulo="Ferramenta de Captura" aoMinimizar={() => setEmFoco(null)} aoFechar={() => fechar('captura')} />
              <div className="ar-captura-barra">
                <button type="button" className="win-bt primario" onClick={() => setCapturaFeita(true)}>
                  <Scissors className="w-3.5 h-3.5 inline mr-1" /> Nova captura
                </button>
                <button type="button" className="win-bt" disabled={!capturaFeita} onClick={salvarPrint}>
                  Salvar
                </button>
              </div>
              <div className="ar-captura-tela">
                {capturaFeita ? (
                  <div className="ar-miniatura">
                    <div className="ar-mini-mesa">
                      <div className="ar-mini-janela" />
                      <div className="ar-mini-barra" />
                    </div>
                    <p>Captura da tela inteira — ainda não salva</p>
                  </div>
                ) : (
                  <p className="ar-captura-vazio">
                    Nenhuma captura ainda. Clique em Nova captura.<br />
                    <span style={{ fontSize: 11.5 }}>
                      A tecla Print Screen abre esta mesma ferramenta, se o seu teclado tiver uma.
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Propriedades do arquivo ── */}
          {propriedadesDe && (
            <DialogoDoWindows
              titulo={`Propriedades de ${propriedadesDe.nome}`}
              acoes={
                <button type="button" className="win-bt primario" onClick={() => setPropriedadesDe(null)}>
                  OK
                </button>
              }>
              <dl className="ar-propriedades">
                <dt>Tipo de arquivo</dt><dd>{TIPO[propriedadesDe.especie]}</dd>
                <dt>Local</dt><dd>C:\Users\clube\Documentos\Clube</dd>
                <dt>Tamanho</dt>
                <dd>{emMB(propriedadesDe.bytes)} ({propriedadesDe.bytes.toLocaleString('pt-BR')} bytes)</dd>
                <dt>Tamanho em disco</dt><dd>{emKB(propriedadesDe.bytes)}</dd>
                <dt>Criado em</dt><dd>{propriedadesDe.criado}</dd>
                <dt>Modificado em</dt><dd>{propriedadesDe.modificado}</dd>
              </dl>
              <p className="ar-config-dica" style={{ marginTop: 10 }}>
                A lista do Explorador mostrava só o tamanho arredondado. O tamanho exato em bytes,
                o local completo e a data de criação só aparecem aqui.
              </p>
            </DialogoDoWindows>
          )}

          {/* ── Menu do botão direito ── */}
          {menu && (
            <div className="win-menu" style={{ left: menu.x, top: menu.y }}
              onClick={ev => ev.stopPropagation()}>
              {menu.alvo === 'area' ? (
                <>
                  <button type="button" onClick={() => setSubmenu(s => (s === 'novo' ? null : 'novo'))}>
                    Novo <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                  </button>
                  {submenu === 'novo' && (
                    <div style={{ paddingLeft: 12 }}>
                      <button type="button" onClick={() => criarAtalho('Clube')}>
                        <Link2 className="w-4 h-4" /> Atalho
                      </button>
                      <button type="button" onClick={() => avisar('Criar pasta nova não faz parte deste exercício.')}>
                        <Folder className="w-4 h-4" /> Pasta
                      </button>
                    </div>
                  )}
                  <button type="button" onClick={() => avisar('Personalizar a área de trabalho não faz parte deste exercício.')}>
                    Personalizar
                  </button>
                </>
              ) : (() => {
                const arquivo = ARQUIVOS.find(a => a.id === menu.alvo);
                if (!arquivo) return null;
                return (
                  <>
                    <button type="button" onClick={() => avisar('Abrir o arquivo não faz parte deste exercício.')}>
                      Abrir
                    </button>
                    <button type="button" onClick={() => setSubmenu(s => (s === 'enviar' ? null : 'enviar'))}>
                      Enviar para <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                    </button>
                    {submenu === 'enviar' && (
                      <div style={{ paddingLeft: 12 }}>
                        <button type="button" onClick={() => criarAtalho(`${arquivo.nome} — Atalho`)}>
                          <Link2 className="w-4 h-4" /> Área de Trabalho (criar atalho)
                        </button>
                        <button type="button" onClick={() => moverParaArea(arquivo)}>
                          <Folder className="w-4 h-4" /> Mover para a Área de Trabalho
                        </button>
                      </div>
                    )}
                    <button type="button"
                      onClick={() => {
                        setPropriedadesDe(arquivo);
                        setE((a: Estado) => ({ ...a, viuDetalhesDe: arquivo.id }));
                        setMenu(null);
                      }}>
                      Propriedades
                    </button>
                  </>
                );
              })()}
            </div>
          )}

          {/* ── Menu Iniciar ── */}
          {iniciar && (
            <div className="win-iniciar" onClick={ev => ev.stopPropagation()}>
              <p style={{ fontSize: 11.5, color: '#5B5B5B', padding: '2px 10px 6px' }}>Todos os aplicativos</p>
              <button type="button" onClick={() => abrir('explorador')}>
                <Folder className="w-4 h-4" style={{ color: '#E6B14C' }} /> Explorador de Arquivos
              </button>
              <button type="button" onClick={() => abrir('config')}>
                <Settings className="w-4 h-4" style={{ color: '#0F6CBD' }} /> Configurações
              </button>
              <button type="button" onClick={() => abrir('captura')}>
                <Scissors className="w-4 h-4" style={{ color: '#0F6CBD' }} /> Ferramenta de Captura
              </button>
            </div>
          )}
        </div>

        {/* ── A barra de tarefas ── */}
        <div className="win-tarefas">
          <button aria-label="Iniciar" title="Iniciar"
            onClick={ev => { ev.stopPropagation(); setIniciar(a => !a); setMenu(null); }}>
            <Grid2x2 className="w-5 h-5" style={{ color: '#0F6CBD' }} />
          </button>
          <button aria-label="Explorador de Arquivos" title="Explorador de Arquivos"
            className={abertos.includes('explorador') ? 'aberta' : ''}
            onClick={ev => { ev.stopPropagation(); abrir('explorador'); }}>
            <Folder className="w-5 h-5" style={{ color: '#E6B14C' }} />
          </button>
          <button aria-label="Configurações" title="Configurações"
            className={abertos.includes('config') ? 'aberta' : ''}
            onClick={ev => { ev.stopPropagation(); abrir('config'); }}>
            <Settings className="w-5 h-5" style={{ color: '#0F6CBD' }} />
          </button>
          {/* A Ferramenta de Captura não é fixada na barra: ela só aparece
              enquanto está aberta, como qualquer programa que não foi fixado.
              Sem esta entrada, um programa aberto ficaria fora da barra — e no
              Windows isso não acontece com nada. */}
          {abertos.includes('captura') && (
            <button aria-label="Ferramenta de Captura" title="Ferramenta de Captura" className="aberta"
              onClick={ev => { ev.stopPropagation(); abrir('captura'); }}>
              <Scissors className="w-5 h-5" style={{ color: '#0F6CBD' }} />
            </button>
          )}
          {/* O relógio da barra de tarefas: é aqui que se vê o efeito da tarefa
              do relógio, e não só dentro de Configurações. */}
          <span className="ar-relogio">{e.hora}<br />{e.data}</span>
        </div>
      </div>
    </LaboratorioEmTelaCheia>
  );
}

const CSS_AREA = `
.ar-icones {
  position: absolute; top: 12px; left: 12px; display: flex; flex-direction: column;
  flex-wrap: wrap; gap: 6px; max-height: calc(100% - 24px);
}
.ar-icone {
  width: 92px; padding: 6px 4px; border-radius: 5px; text-align: center;
  color: #FFFFFF; font-size: 11.5px; line-height: 1.25;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  text-shadow: 0 1px 3px rgba(0,0,0,.6); word-break: break-word;
}
.ar-icone:hover { background: rgba(255,255,255,.18); }
.ar-com-seta { position: relative; display: inline-flex; }
/* A setinha do canto é o que diz "isto é atalho", e é por ela que se
   distingue de um arquivo movido para cá. */
.ar-seta {
  position: absolute; left: -3px; bottom: -2px; background: #FFFFFF; color: #1B1B1B;
  border-radius: 2px; padding: 1px;
}

.ar-relogio {
  position: absolute; right: 12px; font-size: 11px; line-height: 1.3;
  color: #1B1B1B; text-align: right;
}

/* ── Configurações ── */
.ar-config { flex: 1; min-height: 0; display: flex; background: #F3F3F3; }
.ar-config-lado {
  width: 190px; flex: none; padding: 10px 8px; overflow-y: auto;
  border-right: 1px solid #E5E5E5;
}
.ar-config-maquina { font-size: 12px; font-weight: 600; padding: 4px 10px 10px; color: #1B1B1B; }
.ar-config-lado button {
  display: flex; align-items: center; gap: 9px; width: 100%; text-align: left;
  padding: 8px 10px; font-size: 12.5px; color: #1B1B1B; border-radius: 5px;
  background: none; border: none; cursor: pointer;
}
.ar-config-lado button:hover { background: #EAEAEA; }
.ar-config-lado button.ativo { background: #E1EDF9; font-weight: 600; }
.ar-config-corpo { flex: 1; min-width: 0; overflow-y: auto; padding: 16px 20px; background: #FFFFFF; }
.ar-config-titulo { font-size: 19px; font-weight: 600; color: #1B1B1B; margin-bottom: 12px; }
.ar-config-nome { font-size: 13px; color: #5B5B5B; margin-bottom: 14px; }
.ar-config-sub { font-size: 12.5px; font-weight: 600; color: #1B1B1B; margin: 14px 0 6px; }
.ar-config-item {
  display: flex; align-items: center; gap: 10px; width: 100%; text-align: left;
  padding: 11px 12px; margin-bottom: 6px; font-size: 12.5px; color: #1B1B1B;
  background: #FAFAFA; border: 1px solid #E5E5E5; border-radius: 6px; cursor: pointer;
}
.ar-config-item:hover { background: #F0F0F0; }
.ar-voltar { font-size: 12.5px; color: #0F6CBD; background: none; border: none; cursor: pointer; padding: 0 0 8px; }

.ar-ficha { display: grid; grid-template-columns: minmax(120px, 180px) 1fr; gap: 6px 14px; font-size: 12.5px; }
.ar-ficha dt { display: flex; align-items: center; gap: 6px; color: #5B5B5B; }
.ar-ficha dd { color: #1B1B1B; }
.ar-config-dica {
  font-size: 11.5px; color: #5B5B5B; background: #F5F8FB; border-left: 3px solid #0F6CBD;
  padding: 8px 10px; border-radius: 0 4px 4px 0; margin-top: 14px; line-height: 1.5;
}

.ar-chave {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 12px; background: #FAFAFA; border: 1px solid #E5E5E5; border-radius: 6px;
  font-size: 12.5px; color: #1B1B1B;
}
.ar-switch {
  width: 40px; height: 21px; border-radius: 11px; border: 1px solid #8A8A8A;
  background: #FFFFFF; position: relative; flex: none; cursor: pointer; padding: 0;
}
.ar-switch.ligado { background: #0F6CBD; border-color: #0F6CBD; }
.ar-switch-bolinha {
  position: absolute; top: 3px; left: 4px; width: 13px; height: 13px; border-radius: 50%;
  background: #5B5B5B; transition: left .12s, background .12s;
}
.ar-switch.ligado .ar-switch-bolinha { left: 21px; background: #FFFFFF; }

.ar-manual { margin-top: 14px; }
.ar-manual.apagado { opacity: .55; }
.ar-campo {
  height: 32px; padding: 0 10px; font-size: 12.5px; border-radius: 4px;
  border: 1px solid #D0D0D0; background: #FFFFFF; color: #1B1B1B; width: 120px;
}
.ar-campo:disabled { background: #F0F0F0; color: #A0A0A0; }

.ar-propriedades { display: grid; grid-template-columns: minmax(110px, 150px) 1fr; gap: 6px 14px; font-size: 12.5px; }
.ar-propriedades dt { color: #5B5B5B; }
.ar-propriedades dd { color: #1B1B1B; word-break: break-all; }

/* ── Ferramenta de Captura ── */
.ar-captura { inset: 12% 18% auto 18%; max-height: 70%; }
@media (max-width: 767px) { .ar-captura { inset: 8% 6% auto 6%; } }
.ar-captura-barra {
  display: flex; gap: 8px; padding: 8px 10px; background: #F3F3F3;
  border-bottom: 1px solid #E5E5E5;
}
.ar-captura-tela {
  background: #FFFFFF; padding: 16px; display: grid; place-items: center; min-height: 150px;
}
.ar-captura-vazio { font-size: 12.5px; color: #5B5B5B; text-align: center; line-height: 1.6; }
.ar-miniatura { text-align: center; font-size: 11.5px; color: #5B5B5B; }
.ar-mini-mesa {
  width: 210px; height: 118px; border: 1px solid #C9C9C9; margin: 0 auto 8px;
  background: linear-gradient(150deg, #0B3B6F 0%, #1C6EA4 45%, #3E9AC4 100%);
  position: relative; border-radius: 3px; overflow: hidden;
}
.ar-mini-janela {
  position: absolute; inset: 12% 10% 22% 10%; background: #F3F3F3;
  border: 1px solid #C9C9C9; border-radius: 3px;
}
.ar-mini-barra { position: absolute; left: 0; right: 0; bottom: 0; height: 12px; background: rgba(243,243,243,.86); }
`;
