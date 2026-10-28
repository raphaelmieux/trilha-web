/**
 * A nuvem da CC-DG006: a pasta do projeto, para separar o editável do final.
 *
 * A janela é a de `nuvem.tsx`, a mesma da CC-ES006 e da CC-ES012. O que este
 * arquivo decide é do **exercício**: que gestos a lição oferece e de que
 * pasta se parte. Aqui são os quatro de arrumar — criar pasta, mover,
 * renomear e mandar para a lixeira —, que é o que entregar "organizado em
 * estrutura de pastas" pede; compartilhar fica de fora porque nenhuma tarefa
 * desta lição depende de quem tem acesso, e um menu que oferecesse e não
 * levasse a lugar nenhum ensinaria a desconfiar do programa.
 */

import { useState } from 'react';
import { ArrowRightLeft, FolderPen, FolderPlus, RotateCcw, Trash2 } from 'lucide-react';
import {
  BotaoDaNuvem, CabecalhoDaLista, CaminhoDaNuvem, ItemDoMenu, LateralDaNuvem, LinhaDaNuvem,
  MenuDoArquivo, RodapeDaCaixa, SecaoDaCaixa, TopoDaNuvem, type LugarDaNuvem,
} from './nuvem';
import {
  arquivoDe, mandarParaALixeira, mover, pastasAcima, restaurarDaLixeira, type Nuvem, emOrdemDaLista,
} from './arquivoCompartilhado';
import { PASTA_DO_PROJETO } from './acampamentoDasFamilias';

export interface PropsDaEntrega {
  nuvem: Nuvem;
  mudar: (f: (n: Nuvem) => Nuvem) => void;
  avisar: (texto: string) => void;
}

export function EntregaNaNuvem({ nuvem: n, mudar, avisar }: PropsDaEntrega) {
  const [lugar, setLugar] = useState<LugarDaNuvem>('meu');
  const [crescente, setCrescente] = useState(true);
  const [pasta, setPasta] = useState<string | null>(PASTA_DO_PROJETO);
  const [escolhido, setEscolhido] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [renomeando, setRenomeando] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [movendo, setMovendo] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);
  const [nomeDaPasta, setNomeDaPasta] = useState('');

  const naLixeira = lugar === 'lixeira';
  const dentro = naLixeira
    ? n.arquivos.filter(a => a.naLixeira)
    : lugar === 'comigo' ? [] : n.arquivos.filter(a => (a.pasta ?? null) === pasta && !a.naLixeira);
  const atual = pasta ? n.arquivos.find(a => a.id === pasta) : undefined;
  const trilha = naLixeira
    ? [{ id: null as string | null, nome: 'Lixeira' }]
    : [
      { id: null as string | null, nome: 'Meu Drive' },
      ...(atual ? [...pastasAcima(n, atual.id)].reverse().map(a => ({ id: a.id as string | null, nome: a.nome })) : []),
      ...(atual ? [{ id: atual.id as string | null, nome: atual.nome }] : []),
    ];
  const doMenu = menu ? n.arquivos.find(a => a.id === menu.id) : undefined;
  const aMover = movendo ? n.arquivos.find(a => a.id === movendo) : undefined;

  const renomear = (id: string, novo: string) => {
    mudar(x => ({ arquivos: x.arquivos.map(a => (a.id === id ? { ...a, nome: novo } : a)) }));
    setRenomeando(null);
  };

  const criarPasta = () => {
    const limpo = nomeDaPasta.trim();
    if (!limpo) return;
    let i = 1;
    while (n.arquivos.some(a => a.id === `pasta-nova-${i}`)) i++;
    const id = `pasta-nova-${i}`;
    mudar(x => ({ arquivos: [...x.arquivos, arquivoDe(id, limpo, 'pasta', 'voce', pasta ? { pasta } : {})] }));
    setCriando(false);
    setNomeDaPasta('');
  };

  /* Uma pasta não vai para dentro dela mesma nem de uma filha: o motor recusa,
     e a lista nem oferece. */
  const destinos = aMover
    ? n.arquivos.filter(a => a.tipo === 'pasta' && !a.naLixeira && a.id !== aMover.id
      && !pastasAcima(n, a.id).some(p => p.id === aMover.id))
    : [];

  return (
    <div className="nv-janela">
      <TopoDaNuvem quem="voce" />

      <div className="nv-corpo">
        <LateralDaNuvem lugar={lugar} aoIr={l => { setLugar(l); if (l === 'meu') setPasta(PASTA_DO_PROJETO); }} usado={0.21} />

        <div className="nv-lista">
          <CaminhoDaNuvem trilha={trilha} aoIr={id => { setLugar('meu'); setPasta(id); }} />

          {!naLixeira && lugar === 'meu' && (
            <div className="nv-pessoa" style={{ gap: 8 }}>
              {criando
                ? (
                  <>
                    <input className="nv-campo" aria-label="Nome da pasta nova" autoFocus value={nomeDaPasta}
                      placeholder="Pasta sem título"
                      onChange={e => setNomeDaPasta(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') criarPasta(); if (e.key === 'Escape') setCriando(false); }} />
                    <BotaoDaNuvem principal desligado={!nomeDaPasta.trim()} aoClicar={criarPasta}>Criar</BotaoDaNuvem>
                    <BotaoDaNuvem aoClicar={() => setCriando(false)}>Cancelar</BotaoDaNuvem>
                  </>
                )
                : (
                  <BotaoDaNuvem aoClicar={() => setCriando(true)}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><FolderPlus size={16} aria-hidden /> Nova pasta</span>
                  </BotaoDaNuvem>
                )}
            </div>
          )}

          <CabecalhoDaLista crescente={crescente} aoOrdenar={() => setCrescente(c => !c)} />
          {dentro.length === 0 && (
            <p className="nv-fraco" style={{ padding: '16px 12px' }}>
              {naLixeira ? 'A lixeira está vazia.' : 'Nada aqui ainda.'}
            </p>
          )}
          {emOrdemDaLista(dentro, crescente).map(a => (
            <div key={a.id}>
              {renomeando === a.id
                ? (
                  <div className="nv-linha">
                    <input className="nv-campo" value={nome} autoFocus aria-label={`Novo nome de ${a.nome}`}
                      onChange={e => setNome(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') renomear(a.id, nome.trim() || a.nome);
                        if (e.key === 'Escape') setRenomeando(null);
                      }} />
                    <BotaoDaNuvem principal aoClicar={() => renomear(a.id, nome.trim() || a.nome)}>Renomear</BotaoDaNuvem>
                  </div>
                )
                : (
                  <LinhaDaNuvem arquivo={a} escolhido={escolhido === a.id}
                    aoEscolher={() => setEscolhido(a.id)}
                    aoAbrir={() => {
                      if (a.tipo === 'pasta' && !naLixeira) setPasta(a.id);
                      else if (!naLixeira) avisar(`${a.nome} abriria no programa dele. Aqui a lição é onde ele mora.`);
                    }}
                    aoMenu={(_, onde) => setMenu({ id: a.id, ...onde })} />
                )}
            </div>
          ))}
        </div>
      </div>

      {menu && doMenu && (
        <MenuDoArquivo onde={{ x: menu.x, y: menu.y }} aoFechar={() => setMenu(null)}>
          {doMenu.naLixeira
            ? (
              <ItemDoMenu icone={RotateCcw} aoClicar={() => {
                mudar(x => restaurarDaLixeira(x, doMenu.id));
                avisar(`${doMenu.nome} voltou para a pasta de onde saiu.`);
                setMenu(null);
              }}>Restaurar</ItemDoMenu>
            )
            : (
              <>
                <ItemDoMenu icone={FolderPen} aoClicar={() => { setNome(doMenu.nome); setRenomeando(doMenu.id); setMenu(null); }}>
                  Renomear
                </ItemDoMenu>
                <ItemDoMenu icone={ArrowRightLeft} aoClicar={() => { setMovendo(doMenu.id); setMenu(null); }}>
                  Mover para
                </ItemDoMenu>
                <ItemDoMenu icone={Trash2} aoClicar={() => {
                  mudar(x => mandarParaALixeira(x, doMenu.id));
                  avisar(`${doMenu.nome} foi para a lixeira.`);
                  setMenu(null);
                }}>Mover para a lixeira</ItemDoMenu>
              </>
            )}
        </MenuDoArquivo>
      )}

      {aMover && (
        <div className="nv-fundo" onClick={() => setMovendo(null)} role="presentation">
          <div className="nv-caixa" role="dialog" aria-modal="true" aria-label={`Mover ${aMover.nome}`} onClick={e => e.stopPropagation()}>
            <h3>Mover «{aMover.nome}»</h3>
            <SecaoDaCaixa titulo="Para a pasta">
              <select className="nv-campo" aria-label="Pasta de destino" value={aMover.pasta ?? 'raiz'}
                onChange={e => mudar(x => mover(x, aMover.id, e.target.value === 'raiz' ? undefined : e.target.value))}>
                <option value="raiz">Meu Drive</option>
                {destinos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
              </select>
            </SecaoDaCaixa>
            <RodapeDaCaixa>
              <span />
              <BotaoDaNuvem principal aoClicar={() => setMovendo(null)}>Concluído</BotaoDaNuvem>
            </RodapeDaCaixa>
          </div>
        </div>
      )}
    </div>
  );
}
