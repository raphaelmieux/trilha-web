import { useEffect, useState } from 'react';
import { Folder, HardDrive, Monitor, Palette, ShieldAlert } from 'lucide-react';
import { BarraDeJanela, DialogoDoWindows } from './windows';

/*
 * O assistente de instalação, do jeito que ele aparece de verdade.
 *
 * Antes, escolher o site oficial já deixava o programa instalado. Praticava a
 * lição — de onde se baixa —, e mentia sobre o resto: quem fizesse isso num
 * computador de verdade encontraria o controle de conta de usuário, a escolha
 * de idioma, o contrato, a pasta de destino, os atalhos e uma barra de
 * progresso, nada disso tendo aparecido aqui. Simulação que pula as etapas
 * ensina a pessoa a esperar uma tela que não existe, e o preço é ela travar na
 * primeira instalação de verdade.
 *
 * Então o caminho inteiro está aqui, e as escolhas valem: quem não marcar o
 * atalho na área de trabalho não vai encontrar atalho nenhum lá depois, e quem
 * mudar a pasta de destino vai achar o programa na pasta que escolheu.
 *
 * A ordem é a do Inno Setup, que é o instalador da maior parte dos programas
 * de Windows — idioma, boas-vindas, contrato, destino, atalhos, resumo,
 * progresso, fim.
 */

export type DestinoDaInstalacao = 'programas' | 'clube' | 'area';

export interface EscolhasDaInstalacao {
  idioma: string;
  destino: DestinoDaInstalacao;
  atalhoNaArea: boolean;
  atalhoNoMenu: boolean;
  executarAoFim: boolean;
}

const CAMINHO_DO_DESTINO: Record<DestinoDaInstalacao, string> = {
  programas: 'C:\\Arquivos de Programas\\Desenhador',
  clube: 'C:\\Documentos\\Clube\\Desenhador',
  area: 'C:\\Área de Trabalho\\Desenhador',
};

const IDIOMAS = ['Português (Brasil)', 'English', 'Español'];

/* Os arquivos que passam na barra de progresso. São os que um programa de
   desenho tem mesmo — quem já viu uma instalação reconhece a lista correndo. */
const ARQUIVOS_COPIADOS = [
  'desenhador.exe',
  'recursos\\idiomas\\pt-BR.lng',
  'recursos\\pinceis\\aquarela.brp',
  'recursos\\pinceis\\giz.brp',
  'recursos\\paletas\\padrao.pal',
  'bibliotecas\\imagem.dll',
  'desinstalar.exe',
];

const ETAPAS = ['boas-vindas', 'licenca', 'destino', 'atalhos', 'pronto', 'instalando', 'fim'] as const;
type Etapa = (typeof ETAPAS)[number];

const CABECALHO: Record<Etapa, [string, string]> = {
  'boas-vindas': ['', ''],
  licenca: ['Contrato de Licença', 'Leia as informações importantes antes de continuar.'],
  destino: ['Selecione o Local de Destino', 'Onde o Desenhador deve ser instalado?'],
  atalhos: ['Selecionar Tarefas Adicionais', 'Quais tarefas adicionais devem ser executadas?'],
  pronto: ['Pronto para Instalar', 'O assistente está pronto para começar a instalação do Desenhador.'],
  instalando: ['Instalando', 'Aguarde enquanto o Desenhador é instalado no seu computador.'],
  fim: ['', ''],
};

/**
 * O aviso do Controle de Conta de Usuário, que aparece antes de todo
 * instalador. Vale a pena mostrar porque é ele que separa um instalador
 * assinado de um baixado de qualquer lugar — a linha "Editor verificado".
 */
export function AvisoDeContaDeUsuario({ arquivo, aoPermitir, aoRecusar }: {
  arquivo: string; aoPermitir: () => void; aoRecusar: () => void;
}) {
  return (
    <DialogoDoWindows
      titulo="Controle de Conta de Usuário"
      acoes={<>
        <button className="win-bt primario" onClick={aoPermitir}>Sim</button>
        <button className="win-bt" onClick={aoRecusar}>Não</button>
      </>}
    >
      <div className="flex gap-3">
        <ShieldAlert className="w-8 h-8 flex-none" style={{ color: '#0F6CBD' }} />
        <div>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1B1B1B' }}>
            Deseja permitir que este aplicativo faça alterações no seu dispositivo?
          </p>
          <p style={{ marginTop: 10, fontSize: 12.5, color: '#1B1B1B' }}>{arquivo}</p>
          {/* Esta é a linha que interessa. Instalador de site oficial vem
              assinado e o Windows sabe dizer o nome de quem assinou; o que
              chega por link de grupo costuma dizer "Editor desconhecido". */}
          <p style={{ marginTop: 4, fontSize: 12, color: '#5B5B5B' }}>
            Editor verificado: <strong>Desenhador Software Ltda.</strong>
          </p>
          <p style={{ marginTop: 2, fontSize: 12, color: '#5B5B5B' }}>
            Origem do arquivo: baixado da Internet
          </p>
        </div>
      </div>
    </DialogoDoWindows>
  );
}

/** O diálogo de idioma, que no Inno Setup vem antes da janela do assistente. */
function EscolhaDeIdioma({ idioma, aoMudar, aoSeguir, aoCancelar }: {
  idioma: string; aoMudar: (i: string) => void; aoSeguir: () => void; aoCancelar: () => void;
}) {
  return (
    <DialogoDoWindows
      titulo="Selecionar Idioma da Instalação"
      acoes={<>
        <button className="win-bt primario" onClick={aoSeguir}>OK</button>
        <button className="win-bt" onClick={aoCancelar}>Cancelar</button>
      </>}
    >
      <p style={{ fontSize: 12.5, marginBottom: 10, color: '#1B1B1B' }}>
        Selecione o idioma a ser usado durante a instalação:
      </p>
      <select className="win-lista-op" value={idioma} aria-label="Idioma da instalação"
        onChange={e => aoMudar(e.target.value)}>
        {IDIOMAS.map(i => <option key={i} value={i}>{i}</option>)}
      </select>
    </DialogoDoWindows>
  );
}

/** O diálogo de "Procurar…", com as pastas que existem no disco simulado. */
function EscolhaDePasta({ destino, aoMudar, aoFechar }: {
  destino: DestinoDaInstalacao; aoMudar: (d: DestinoDaInstalacao) => void; aoFechar: () => void;
}) {
  const opcoes: [DestinoDaInstalacao, typeof Folder, string][] = [
    ['programas', HardDrive, 'Este Computador › Disco Local (C:) › Arquivos de Programas'],
    ['clube', Folder, 'Documentos › Clube'],
    ['area', Monitor, 'Área de Trabalho'],
  ];

  return (
    <DialogoDoWindows
      titulo="Procurar Pasta"
      acoes={<button className="win-bt primario" onClick={aoFechar}>OK</button>}
    >
      <p style={{ fontSize: 12.5, marginBottom: 10, color: '#1B1B1B' }}>
        Selecione a pasta onde o Desenhador será instalado e clique em OK.
      </p>
      <div style={{ border: '1px solid #B8B8B8', background: '#FFFFFF', padding: 4 }}>
        {opcoes.map(([id, Ico, rotulo]) => (
          <button key={id} onClick={() => aoMudar(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
              padding: '7px 8px', fontSize: 12.5, border: 'none', cursor: 'pointer',
              background: destino === id ? '#CCE4F7' : 'transparent', color: '#1B1B1B',
            }}>
            <Ico className="w-4 h-4 flex-none" style={{ color: '#5B5B5B' }} />
            <span className="truncate">{rotulo}</span>
          </button>
        ))}
      </div>
      <p style={{ marginTop: 10, fontSize: 12, color: '#5B5B5B' }}>
        Uma pasta chamada <strong>Desenhador</strong> será criada dentro da que você escolher.
      </p>
    </DialogoDoWindows>
  );
}

/**
 * O assistente inteiro. Guarda as próprias escolhas e só devolve no fim —
 * quem cancela no meio não deixa nada instalado, como não deixa mesmo.
 */
export function AssistenteDeInstalacao({ aoConcluir, aoCancelar, aoMinimizar }: {
  aoConcluir: (e: EscolhasDaInstalacao) => void;
  aoCancelar: () => void;
  aoMinimizar: () => void;
}) {
  const [idiomaEscolhido, setIdiomaEscolhido] = useState(false);
  const [idioma, setIdioma] = useState(IDIOMAS[0]);
  const [etapa, setEtapa] = useState<Etapa>('boas-vindas');
  const [aceitou, setAceitou] = useState(false);
  const [destino, setDestino] = useState<DestinoDaInstalacao>('programas');
  const [procurando, setProcurando] = useState(false);
  const [atalhoNaArea, setAtalhoNaArea] = useState(true);
  const [atalhoNoMenu, setAtalhoNoMenu] = useState(true);
  const [executarAoFim, setExecutarAoFim] = useState(true);
  const [progresso, setProgresso] = useState(0);

  /* A barra de progresso anda sozinha e leva a última página junto. Dois
     segundos: tempo de ver a barra encher e os arquivos passando, sem virar
     espera. Instalação de verdade demora mais, e ninguém aprende nada
     esperando. */
  useEffect(() => {
    if (etapa !== 'instalando') return;
    const passo = setInterval(() => {
      setProgresso(p => {
        if (p >= 100) return 100;
        return p + 4;
      });
    }, 70);
    return () => clearInterval(passo);
  }, [etapa]);

  useEffect(() => {
    if (etapa === 'instalando' && progresso >= 100) setEtapa('fim');
  }, [etapa, progresso]);

  if (!idiomaEscolhido) {
    return (
      <EscolhaDeIdioma
        idioma={idioma} aoMudar={setIdioma}
        aoSeguir={() => setIdiomaEscolhido(true)}
        aoCancelar={aoCancelar}
      />
    );
  }

  const arquivoDaVez = ARQUIVOS_COPIADOS[
    Math.min(ARQUIVOS_COPIADOS.length - 1, Math.floor((progresso / 100) * ARQUIVOS_COPIADOS.length))
  ];

  const avancar = () => {
    const i = ETAPAS.indexOf(etapa);
    setEtapa(ETAPAS[i + 1]);
  };
  const voltar = () => {
    const i = ETAPAS.indexOf(etapa);
    setEtapa(ETAPAS[Math.max(0, i - 1)]);
  };

  const podeAvancar = etapa !== 'licenca' || aceitou;
  const [titulo, subtitulo] = CABECALHO[etapa];
  const semMoldura = etapa === 'boas-vindas' || etapa === 'fim';

  return (
    <>
      <div className="win-janela media" style={{ maxWidth: 560, maxHeight: 420, margin: 'auto', inset: 0 }}>
        <BarraDeJanela
          icone={<Palette className="w-4 h-4" style={{ color: '#C0392B' }} />}
          titulo="Instalar - Desenhador 6.2"
          aoMinimizar={aoMinimizar}
          aoFechar={aoCancelar}
        />

        {!semMoldura && (
          <div className="setup-cab">
            <div className="min-w-0" style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1B1B1B' }}>{titulo}</p>
              <p style={{ fontSize: 12, color: '#5B5B5B' }}>{subtitulo}</p>
            </div>
            <Palette className="w-6 h-6 flex-none" style={{ color: '#C0392B' }} />
          </div>
        )}

        <div style={{ flex: 1, minHeight: 0, display: 'flex', background: '#FFFFFF' }}>
          {semMoldura && (
            <div className="setup-faixa">
              <Palette className="w-10 h-10" style={{ color: 'rgba(255,255,255,.9)' }} />
            </div>
          )}

          <div className="setup-corpo">
            {etapa === 'boas-vindas' && (
              <>
                <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                  Bem-vindo ao Assistente de Instalação do Desenhador
                </p>
                <p style={{ marginBottom: 10 }}>
                  Este assistente instalará o Desenhador 6.2 no seu computador.
                </p>
                <p style={{ marginBottom: 10 }}>
                  É recomendado que você feche todos os outros aplicativos antes
                  de continuar.
                </p>
                <p>Clique em Avançar para continuar, ou em Cancelar para sair.</p>
              </>
            )}

            {etapa === 'licenca' && (
              <>
                <p style={{ marginBottom: 8 }}>
                  Leia o contrato antes de continuar. Você precisa aceitar os
                  termos para seguir com a instalação.
                </p>
                <div className="setup-quadro">
                  <p style={{ fontWeight: 700, marginBottom: 6 }}>CONTRATO DE LICENÇA DE USO</p>
                  <p style={{ marginBottom: 6 }}>
                    1. Este programa é licenciado, não vendido. Você pode instalá-lo
                    em quantos computadores usar, para uso pessoal ou do seu clube.
                  </p>
                  <p style={{ marginBottom: 6 }}>
                    2. Os desenhos que você fizer são seus. O fabricante não
                    reivindica nenhum direito sobre eles.
                  </p>
                  <p style={{ marginBottom: 6 }}>
                    3. Não é permitido revender o programa nem distribuir cópias
                    modificadas dele.
                  </p>
                  <p style={{ marginBottom: 6 }}>
                    4. O programa é fornecido sem garantia. O fabricante não
                    responde por perda de arquivos.
                  </p>
                  <p>
                    5. Ao instalar, você concorda com os termos acima.
                  </p>
                </div>
                <label className="win-marca" style={{ marginTop: 10 }}>
                  <input type="radio" name="licenca" checked={aceitou}
                    onChange={() => setAceitou(true)} />
                  Eu aceito os termos do contrato
                </label>
                <label className="win-marca" style={{ marginTop: 4 }}>
                  <input type="radio" name="licenca" checked={!aceitou}
                    onChange={() => setAceitou(false)} />
                  Eu não aceito os termos do contrato
                </label>
              </>
            )}

            {etapa === 'destino' && (
              <>
                <p style={{ marginBottom: 10 }}>
                  O Desenhador será instalado na seguinte pasta. Para continuar,
                  clique em Avançar. Para escolher outra pasta, clique em Procurar.
                </p>
                <div className="flex gap-2">
                  <input className="win-campo" readOnly aria-label="Pasta de destino"
                    value={CAMINHO_DO_DESTINO[destino]} />
                  <button className="win-bt" style={{ minWidth: 88 }} onClick={() => setProcurando(true)}>
                    Procurar…
                  </button>
                </div>
                <p style={{ marginTop: 12, color: '#5B5B5B' }}>
                  São necessários pelo menos <strong>284,0 MB</strong> de espaço
                  livre em disco.
                </p>
              </>
            )}

            {etapa === 'atalhos' && (
              <>
                <p style={{ marginBottom: 10 }}>
                  Selecione as tarefas adicionais que deseja que o assistente
                  execute durante a instalação do Desenhador e clique em Avançar.
                </p>
                <p style={{ fontWeight: 700, marginBottom: 6 }}>Ícones adicionais:</p>
                <label className="win-marca" style={{ marginBottom: 6 }}>
                  <input type="checkbox" checked={atalhoNaArea}
                    onChange={e => setAtalhoNaArea(e.target.checked)} />
                  Criar um ícone na Área de Trabalho
                </label>
                <label className="win-marca">
                  <input type="checkbox" checked={atalhoNoMenu}
                    onChange={e => setAtalhoNoMenu(e.target.checked)} />
                  Criar um ícone no Menu Iniciar
                </label>
                {/* Dito aqui, e não numa correção depois: quem desmarcar vai
                    encontrar a área de trabalho vazia, e é bom saber por quê. */}
                <p style={{ marginTop: 12, color: '#5B5B5B' }}>
                  Se desmarcar as duas, o programa fica instalado do mesmo jeito —
                  só não vai ter atalho para abrir.
                </p>
              </>
            )}

            {etapa === 'pronto' && (
              <>
                <p style={{ marginBottom: 8 }}>
                  Clique em Instalar para prosseguir com a instalação, ou em
                  Voltar se quiser revisar alguma configuração.
                </p>
                <div className="setup-quadro" style={{ fontFamily: 'Consolas, monospace' }}>
                  <p>Local de destino:</p>
                  <p style={{ marginLeft: 16, marginBottom: 8 }}>{CAMINHO_DO_DESTINO[destino]}</p>
                  <p>Tarefas adicionais:</p>
                  <p style={{ marginLeft: 16 }}>Ícones adicionais:</p>
                  {atalhoNaArea && <p style={{ marginLeft: 32 }}>Criar um ícone na Área de Trabalho</p>}
                  {atalhoNoMenu && <p style={{ marginLeft: 32 }}>Criar um ícone no Menu Iniciar</p>}
                  {!atalhoNaArea && !atalhoNoMenu && <p style={{ marginLeft: 32 }}>(nenhuma)</p>}
                  <p style={{ marginTop: 8 }}>Idioma: {idioma}</p>
                </div>
              </>
            )}

            {etapa === 'instalando' && (
              <>
                <p style={{ marginBottom: 10 }}>
                  Extraindo arquivos…
                </p>
                <div className="setup-barra">
                  <span style={{ width: `${Math.min(100, progresso)}%` }} />
                </div>
                <p style={{ marginTop: 8, fontSize: 12, color: '#5B5B5B' }} className="truncate">
                  {CAMINHO_DO_DESTINO[destino]}\{arquivoDaVez}
                </p>
              </>
            )}

            {etapa === 'fim' && (
              <>
                <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                  Finalizando a Instalação do Desenhador
                </p>
                <p style={{ marginBottom: 10 }}>
                  O Desenhador 6.2 foi instalado no seu computador. O programa
                  pode ser aberto pelos ícones que foram criados.
                </p>
                <p style={{ marginBottom: 12 }}>Clique em Concluir para sair do assistente.</p>
                <label className="win-marca">
                  <input type="checkbox" checked={executarAoFim}
                    onChange={e => setExecutarAoFim(e.target.checked)} />
                  Executar o Desenhador agora
                </label>
              </>
            )}
          </div>
        </div>

        <div className="setup-pe">
          {etapa !== 'fim' && (
            <button className="win-bt" onClick={voltar}
              disabled={etapa === 'boas-vindas' || etapa === 'instalando'}>
              &lt; Voltar
            </button>
          )}
          {etapa === 'fim' ? (
            <button className="win-bt primario"
              onClick={() => aoConcluir({ idioma, destino, atalhoNaArea, atalhoNoMenu, executarAoFim })}>
              Concluir
            </button>
          ) : (
            <button className="win-bt primario" onClick={avancar}
              disabled={!podeAvancar || etapa === 'instalando'}>
              {etapa === 'pronto' ? 'Instalar' : 'Avançar >'}
            </button>
          )}
          <button className="win-bt" style={{ marginLeft: 12 }} onClick={aoCancelar}
            disabled={etapa === 'fim'}>
            Cancelar
          </button>
        </div>
      </div>

      {procurando && (
        <EscolhaDePasta destino={destino} aoMudar={setDestino} aoFechar={() => setProcurando(false)} />
      )}
    </>
  );
}

/** A janelinha do programa recém-instalado, para quem marcou "executar agora". */
export function JanelaDesenhador({ aoMinimizar, aoFechar }: {
  aoMinimizar: () => void; aoFechar: () => void;
}) {
  return (
    <div className="win-janela media">
      <BarraDeJanela
        icone={<Palette className="w-4 h-4" style={{ color: '#C0392B' }} />}
        titulo="Sem título - Desenhador 6.2"
        aoMinimizar={aoMinimizar}
        aoFechar={aoFechar}
      />
      <div className="win-menus">
        {['Arquivo', 'Editar', 'Imagem', 'Cores', 'Ajuda'].map(m => (
          <button key={m}>{m}</button>
        ))}
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', background: '#C8C8C8' }}>
        <div style={{ width: 44, flex: 'none', background: '#EFEFEF', borderRight: '1px solid #D0D0D0', padding: 4 }}>
          {['✏️', '🖌️', '🪣', '🔤', '⬜', '⭕'].map((f, i) => (
            <div key={i} style={{
              height: 32, display: 'grid', placeItems: 'center', fontSize: 14,
              background: i === 0 ? '#CCE4F7' : 'transparent', borderRadius: 3,
            }}>{f}</div>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 0, padding: 12, overflow: 'auto' }}>
          <div style={{ background: '#FFFFFF', height: '100%', minHeight: 140, border: '1px solid #9E9E9E' }} />
        </div>
      </div>
      <div className="win-status">
        <span>Pronto</span>
        <span style={{ marginLeft: 'auto' }}>800 × 600</span>
      </div>
    </div>
  );
}
