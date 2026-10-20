/**
 * A nuvem da CC-ES012: o repositório do módulo 8 e a entrega do módulo 9.
 *
 * A janela é a de `nuvem.tsx`, a mesma da CC-ES006. O que este arquivo decide
 * é do **exercício**: que gestos a lição oferece e de que repositório se parte.
 *
 * ── Por que o módulo 9 abre aqui, e não no Word ──────────────────────────
 * As duas metades do requisito 7 são da nuvem. A transferência de acesso é
 * gesto do Drive — está dentro do seletor de papel, que é onde a nuvem a
 * esconde, e é por isso que o requisito pede demonstrá-la. E as instruções
 * moram **na pasta do projeto**: é a descrição da pasta, que é onde todo Drive
 * a põe e onde a próxima diretoria vai de fato olhar. Escrevê-las num
 * documento à parte faria o conjunto ter uma sexta peça que ninguém abre.
 */

import { useState } from 'react';
import { FolderPen, ShieldCheck, UserPlus } from 'lucide-react';
import {
  BotaoDaNuvem, CabecalhoDaLista, CaixaDeCompartilhar, CaminhoDaNuvem,
  ItemDoMenu, LateralDaNuvem, LinhaDaNuvem, MenuDoArquivo, PessoaDaCaixa,
  SecaoDaCaixa, SeletorDePapel, TopoDaNuvem, type LugarDaNuvem,
} from './nuvem';
import { NOME_DO_AUTOR } from './documento';
import {
  compartilhar, pastasAcima, quemEscreveu, transferirPropriedade, type Pessoa,
} from './arquivoCompartilhado';
import { CampoLongo } from './caderno';
import {
  comAcessoPorFuncao, comColaboracaoNoHistorico, comPastasNoPadrao,
} from './metasDaCcEs012';
import { EQUIPE_DA_FEIRA, PASTA_RAIZ, PASTAS_DA_FEIRA } from './projetoDaFeira';
import {
  NOME_DA_FUNCAO, acessosForaDaFuncao, instrucoesCompletas,
  pastasForaDoPadrao, pecasComColaboracao, type Instrucoes,
} from './projetoDocumental';

import type { PropsDaSuperficie } from './projetoNaPlataforma';

const funcaoDaPasta = (id: string) => PASTAS_DA_FEIRA.find(p => p.id === id)?.funcao;

/* ── A lista do repositório, que as duas lições mostram ───────────────────── */

function ListaDoProjeto({ ctx, mudar, avisar, extra }: PropsDaSuperficie & {
  extra?: React.ReactNode;
}) {
  const [lugar, setLugar] = useState<LugarDaNuvem>('meu');
  const [pasta, setPasta] = useState<string | null>(PASTA_RAIZ);
  const [escolhido, setEscolhido] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [caixa, setCaixa] = useState<string | null>(null);
  const [renomeando, setRenomeando] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [aConvidar, setAConvidar] = useState<Pessoa>('lideranca');

  const n = ctx.p.nuvem;
  const dentro = n.arquivos.filter(a => (a.pasta ?? null) === pasta && !a.naLixeira);
  const trilha = [
    { id: null as string | null, nome: 'Meu Drive' },
    ...[...pastasAcima(n, pasta ?? '')].reverse().map(a => ({ id: a.id as string | null, nome: a.nome })),
    ...(pasta && n.arquivos.find(a => a.id === pasta)
      ? [{ id: pasta as string | null, nome: n.arquivos.find(a => a.id === pasta)!.nome }] : []),
  ];
  const aberto = caixa ? n.arquivos.find(a => a.id === caixa) : undefined;

  const renomear = (id: string, novo: string) => {
    mudar(c => ({
      ...c,
      p: {
        ...c.p,
        nuvem: { ...c.p.nuvem, arquivos: c.p.nuvem.arquivos.map(a => (a.id === id ? { ...a, nome: novo } : a)) },
      },
    }));
    setRenomeando(null);
  };

  return (
    <div className="nv-janela">
      <TopoDaNuvem quem="voce" />

      <div className="nv-corpo">
        <LateralDaNuvem lugar={lugar} aoIr={setLugar} usado={34} />

        <div className="nv-lista">
          <CaminhoDaNuvem trilha={trilha} aoIr={setPasta} />

          <div className="nv-barra-espaco">{extra}</div>

          <CabecalhoDaLista />
          {dentro.map(a => (
            <div key={a.id}>
              {renomeando === a.id
                ? (
                  <div className="nv-linha">
                    <input
                      className="nv-campo" value={nome} autoFocus
                      aria-label={`Novo nome de ${a.nome}`}
                      onChange={e => setNome(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') renomear(a.id, nome.trim() || a.nome);
                        if (e.key === 'Escape') setRenomeando(null);
                      }}
                    />
                    <BotaoDaNuvem principal aoClicar={() => renomear(a.id, nome.trim() || a.nome)}>
                      Renomear
                    </BotaoDaNuvem>
                  </div>
                )
                : (
                  <LinhaDaNuvem
                    arquivo={a} escolhido={escolhido === a.id}
                    aoEscolher={() => setEscolhido(a.id)}
                    aoAbrir={() => (a.tipo === 'pasta' ? setPasta(a.id) : setCaixa(a.id))}
                    aoMenu={e => { e.preventDefault(); setMenu({ id: a.id, x: e.clientX, y: e.clientY }); }}
                  />
                )}
              {funcaoDaPasta(a.id) && (
                <p className="nv-fraco">
                  Serve a {NOME_DA_FUNCAO[funcaoDaPasta(a.id)!].toLowerCase()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {menu && (
        <MenuDoArquivo onde={{ x: menu.x, y: menu.y }} aoFechar={() => setMenu(null)}>
          <ItemDoMenu icone={FolderPen} aoClicar={() => {
            const alvo = n.arquivos.find(a => a.id === menu.id)!;
            setNome(alvo.nome); setRenomeando(menu.id); setMenu(null);
          }}
          >
            Renomear
          </ItemDoMenu>
          <ItemDoMenu icone={UserPlus} aoClicar={() => { setCaixa(menu.id); setMenu(null); }}>
            Compartilhar
          </ItemDoMenu>
        </MenuDoArquivo>
      )}

      {aberto && (
        <CaixaDeCompartilhar arquivo={aberto} aoFechar={() => setCaixa(null)}>
          <SecaoDaCaixa titulo="Quem tem acesso">
            <PessoaDaCaixa quem={aberto.dono} dono>
              {/*
                O dono não tem seletor: a nuvem desenha "Proprietário" e ponto.
                A transferência sai da linha de **quem recebe**, que é onde o
                Drive a põe — e por isso só se transfere para quem já tem
                acesso. Foi a trava que clica quem achou: pendurar o
                `aoTransferir` aqui não desenhava nada, e o único gesto que o
                requisito 7 pede vinha sem caminho.
              */}
              <SeletorDePapel papel="dono" dono />
            </PessoaDaCaixa>
            {aberto.acessos.map(ac => (
              <PessoaDaCaixa key={ac.quem} quem={ac.quem}>
                <SeletorDePapel
                  papel={ac.papel}
                  aoMudar={p => mudar(c => ({
                    ...c,
                    p: {
                      ...c.p,
                      nuvem: {
                        ...c.p.nuvem,
                        arquivos: c.p.nuvem.arquivos.map(a => (a.id === aberto.id
                          ? { ...a, acessos: a.acessos.map(x => (x.quem === ac.quem ? { ...x, papel: p } : x)) }
                          : a)),
                      },
                    },
                  }))}
                  aoTirar={() => mudar(c => ({
                    ...c,
                    p: {
                      ...c.p,
                      nuvem: {
                        ...c.p.nuvem,
                        arquivos: c.p.nuvem.arquivos.map(a => (a.id === aberto.id
                          ? { ...a, acessos: a.acessos.filter(x => x.quem !== ac.quem) } : a)),
                      },
                    },
                  }))}
                  aoTransferir={() => {
                    mudar(c => ({
                      ...c,
                      p: { ...c.p, nuvem: transferirPropriedade(c.p.nuvem, aberto.id, ac.quem) },
                    }));
                    avisar(`${NOME_DO_AUTOR[ac.quem]} passou a ser proprietário, e você continua editor.`);
                  }}
                />
              </PessoaDaCaixa>
            ))}
          </SecaoDaCaixa>

          <SecaoDaCaixa titulo="Adicionar pessoas">
            {/* Só se transfere para quem já tem acesso, então a caixa precisa
                de como dar o primeiro. É a ordem do Drive. */}
            <div className="nv-pessoa">
              <select
                className="nv-papel" aria-label="Pessoa a adicionar"
                value={aConvidar} onChange={e => setAConvidar(e.target.value as Pessoa)}
              >
                {EQUIPE_DA_FEIRA
                  .filter(e => e.quem !== aberto.dono
                    && !aberto.acessos.some(ac => ac.quem === e.quem))
                  .map(e => (
                    <option key={e.quem} value={e.quem}>
                      {NOME_DO_AUTOR[e.quem]} — {NOME_DA_FUNCAO[e.funcao]}
                    </option>
                  ))}
              </select>
              <BotaoDaNuvem
                principal
                aoClicar={() => {
                  mudar(c => ({
                    ...c, p: { ...c.p, nuvem: compartilhar(c.p.nuvem, aberto.id, aConvidar, 'editor') },
                  }));
                  avisar(`${NOME_DO_AUTOR[aConvidar]} passou a editar o arquivo.`);
                }}
              >
                Dar acesso de editor
              </BotaoDaNuvem>
            </div>
          </SecaoDaCaixa>

          <SecaoDaCaixa titulo="Quem escreveu">
            <p className="nv-fraco">
              {quemEscreveu(aberto).map(q => NOME_DO_AUTOR[q]).join(', ') || 'Ninguém ainda'}
            </p>
          </SecaoDaCaixa>
        </CaixaDeCompartilhar>
      )}
    </div>
  );
}

/* ── Módulo 8: o repositório ──────────────────────────────────────────────── */

export function RepositorioDaFeira(props: PropsDaSuperficie) {
  const { ctx, mudar, avisar } = props;
  const fora = pastasForaDoPadrao(ctx.p);
  const desalinhados = acessosForaDaFuncao(ctx.p);

  return (
    <ListaDoProjeto
      {...props}
      extra={(
        <div className="nv-painel">
          <BotaoDaNuvem
            principal
            aoClicar={() => {
              mudar(c => ({ ...c, p: { ...c.p, nuvem: comPastasNoPadrao(c.p.nuvem) } }));
              avisar('As quatro pastas ficaram num molde só, com data e versão.');
            }}
          >
            <FolderPen size={16} aria-hidden /> Renomear no padrão da CC-ES001
          </BotaoDaNuvem>
          <BotaoDaNuvem
            aoClicar={() => {
              mudar(c => ({ ...c, p: { ...c.p, nuvem: comAcessoPorFuncao(c.p.nuvem) } }));
              avisar('Cada pasta ficou com quem exerce a função dela.');
            }}
          >
            <ShieldCheck size={16} aria-hidden /> Acerto do acesso por função
          </BotaoDaNuvem>
          <BotaoDaNuvem
            aoClicar={() => {
              mudar(c => ({ ...c, p: { ...c.p, nuvem: comColaboracaoNoHistorico(c.p.nuvem) } }));
              avisar('A Cleide recebeu acesso de editora e escreveu uma versão do regulamento.');
            }}
          >
            <UserPlus size={16} aria-hidden /> Convidar quem escreve com você
          </BotaoDaNuvem>

          <p className="nv-fraco">
            {fora.length === 0 ? 'Os nomes seguem o padrão.' : `${fora.length} pasta(s) fora do padrão.`}
            {' '}
            {desalinhados.length === 0
              ? 'O acesso bate com as funções.'
              : `${desalinhados.length} pasta(s) com acesso fora da função.`}
            {' '}
            {pecasComColaboracao(ctx.p).length === 0
              ? 'Nenhuma peça tem mais de um autor no histórico.'
              : 'O histórico mostra mais de uma pessoa.'}
          </p>
        </div>
      )}
    />
  );
}

/* ── Módulo 9: as instruções, na descrição da pasta ───────────────────────── */

const CAMPOS_DAS_INSTRUCOES: {
  id: keyof Instrucoes; rotulo: string; ajuda: string; minimo: number;
}[] = [
  {
    id: 'porOndeComecar', minimo: 40,
    rotulo: 'Por onde a próxima diretoria começa',
    ajuda: 'Qual peça se abre primeiro, e o que ela diz sobre as outras.',
  },
  {
    id: 'oQueTrocarNoAno', minimo: 40,
    rotulo: 'O que se troca a cada ano',
    ajuda: 'As datas, os valores, as unidades — e o que se refaz sozinho.',
  },
  {
    id: 'oQueNaoMexer', minimo: 40,
    rotulo: 'O que não se mexe, e por quê',
    ajuda: 'É o campo que ninguém escreve, e o que evita alguém apagar o vínculo sem saber que era ele que fazia o conjunto funcionar.',
  },
  {
    id: 'comoTransferirAcesso', minimo: 40,
    rotulo: 'Como o acesso se transfere',
    ajuda: 'Quem assume pede o quê, a quem, e o que acontece com quem sai.',
  },
];

export function EntregaDoProjeto(props: PropsDaSuperficie) {
  const { ctx, mudar } = props;
  const pecas = ctx.p.nuvem.arquivos.filter(a => a.tipo !== 'pasta');

  return (
    <ListaDoProjeto
      {...props}
      extra={(
        <div className="nv-painel">
          <p className="nv-titulo-secao">Descrição da pasta do projeto</p>
          {CAMPOS_DAS_INSTRUCOES.map(campo => (
            <CampoLongo
              key={campo.id}
              rotulo={campo.rotulo} ajuda={campo.ajuda}
              valor={ctx.p.instrucoes[campo.id]} minimo={campo.minimo}
              aoEscrever={texto => mudar(c => ({
                ...c,
                p: { ...c.p, instrucoes: { ...c.p.instrucoes, [campo.id]: texto } },
              }))}
            />
          ))}
          <p className="nv-fraco">
            {instrucoesCompletas(ctx.p.instrucoes)
              ? 'As quatro estão escritas.'
              : 'Faltam seções da descrição.'}
            {' '}
            {pecas.every(a => a.dono !== 'voce')
              ? 'As peças são da conta da diretoria.'
              : `${pecas.filter(a => a.dono === 'voce').length} peça(s) ainda na sua conta — abra a peça e transfira a propriedade.`}
          </p>
        </div>
      )}
    />
  );
}
