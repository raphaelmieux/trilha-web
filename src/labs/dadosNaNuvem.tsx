/**
 * A nuvem da CC-ES013: a entrega do requisito 9.
 *
 * A janela é a de `nuvem.tsx`, a mesma da CC-ES006 e da CC-ES012. O que este
 * arquivo decide é do **exercício**: de que nuvem se parte e que gestos a
 * lição oferece — mover, compartilhar e ver o histórico de versões.
 *
 * ── O histórico é o único lugar que diz qual bruta é bruta ───────────────
 * As duas cópias da exportação têm o mesmo nome visto de longe, e é o que
 * acontece quando o mesmo anexo é baixado duas vezes. Uma foi aberta e
 * editada depois, e nada na lista diz isso além da data da última alteração.
 * O histórico diz quem escreveu cada versão, que é o que a nuvem de verdade
 * mostra — e é por isso que ele está no menu de três pontos de todo arquivo,
 * e não só no das duas cópias: um programa tem todos os comandos.
 */

import { useState } from 'react';
import { FolderInput, History, Link2, Share2 } from 'lucide-react';
import {
  BotaoDaNuvem, CabecalhoDaLista, CaixaDeCompartilhar, CaminhoDaNuvem, ItemDoMenu,
  LateralDaNuvem, LinhaDaNuvem, MenuDoArquivo, OQuePapelDeixa, PessoaDaCaixa,
  RodapeDaCaixa, SecaoDaCaixa, SeletorDePapel, TopoDaNuvem, type LugarDaNuvem,
} from './nuvem';
import {
  type ArquivoDaNuvem, type Nuvem, type Papel, type Pessoa,
  NOME_DO_PAPEL, PAPEIS, compartilhar, mover, mudarAcessoGeral, tirarAcessoDoArquivo,
} from './arquivoCompartilhado';
import { NOME_DO_AUTOR } from './documento';
import type { PropsDaSuperficieDeDados } from './dadosNaPlanilha';

/* Quem a caixa de compartilhar oferece: a liderança, que examina, e a equipe do clube. */
const PESSOAS: Pessoa[] = ['lideranca', 'cleide', 'marta', 'ronaldo'];

const dataBr = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;

export function EntregaDosDados({ ctx, mudar }: PropsDaSuperficieDeDados) {
  const nuvem = ctx.p.nuvem;
  const [lugar, setLugar] = useState<LugarDaNuvem>('meu');
  const [pasta, setPasta] = useState<string | null>(null);
  const [escolhido, setEscolhido] = useState<string | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [caixa, setCaixa] = useState<{ tipo: 'compartilhar' | 'mover' | 'historico'; id: string } | null>(null);
  const [paraQuem, setParaQuem] = useState<Pessoa>('lideranca');
  const [papelNovo, setPapelNovo] = useState<Papel>('leitor');

  const mexer = (f: (n: Nuvem) => Nuvem) =>
    mudar(c => ({ ...c, p: { ...c.p, nuvem: f(c.p.nuvem) } }));

  const daLista = nuvem.arquivos.filter(a => {
    if (lugar === 'lixeira') return a.naLixeira;
    if (a.naLixeira) return false;
    if (lugar === 'comigo') return a.dono !== 'voce' && !a.pasta;
    return (a.pasta ?? null) === pasta;
  });

  const trilha = (() => {
    const cadeia: ArquivoDaNuvem[] = [];
    let atual = pasta ? nuvem.arquivos.find(a => a.id === pasta) : undefined;
    while (atual) {
      cadeia.unshift(atual);
      atual = atual.pasta ? nuvem.arquivos.find(a => a.id === atual!.pasta) : undefined;
    }
    return [{ id: null as string | null, nome: 'Meu Drive' }, ...cadeia.map(p => ({ id: p.id as string | null, nome: p.nome }))];
  })();

  const alvo = menu ? nuvem.arquivos.find(a => a.id === menu) : undefined;
  const daCaixa = caixa ? nuvem.arquivos.find(a => a.id === caixa.id) : undefined;

  return (
    <div className="nv-janela">
      <TopoDaNuvem quem="voce" />
      <div className="nv-corpo">
        <LateralDaNuvem lugar={lugar} usado={0.27}
          aoIr={l => { setLugar(l); setPasta(null); setEscolhido(null); }} />
        <div className="nv-painel">
          {lugar === 'meu' && <CaminhoDaNuvem trilha={trilha} aoIr={setPasta} />}
          <div className="nv-lista">
            <CabecalhoDaLista />
            {daLista.map(a => (
              <LinhaDaNuvem key={a.id} arquivo={a} escolhido={escolhido === a.id}
                aoEscolher={() => setEscolhido(a.id)}
                aoAbrir={() => { if (a.tipo === 'pasta') { setPasta(a.id); setEscolhido(null); } }}
                aoMenu={e => { e.preventDefault(); setMenu(a.id); }} />
            ))}
          </div>
        </div>
      </div>

      {alvo && (
        <MenuDoArquivo onde={{ x: 40, y: 80 }} aoFechar={() => setMenu(null)}>
          <ItemDoMenu icone={Share2} aoClicar={() => { setCaixa({ tipo: 'compartilhar', id: alvo.id }); setMenu(null); }}>
            Compartilhar
          </ItemDoMenu>
          <ItemDoMenu icone={FolderInput} aoClicar={() => { setCaixa({ tipo: 'mover', id: alvo.id }); setMenu(null); }}>
            Mover para
          </ItemDoMenu>
          <ItemDoMenu icone={History} desligado={alvo.tipo === 'pasta'}
            aoClicar={() => { setCaixa({ tipo: 'historico', id: alvo.id }); setMenu(null); }}>
            Histórico de versões
          </ItemDoMenu>
        </MenuDoArquivo>
      )}

      {caixa?.tipo === 'compartilhar' && daCaixa && (
        <CaixaDeCompartilhar arquivo={daCaixa} aoFechar={() => setCaixa(null)}>
          <SecaoDaCaixa>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select className="nv-campo" aria-label="Pessoa" value={paraQuem}
                onChange={e => setParaQuem(e.target.value as Pessoa)}>
                {PESSOAS.filter(q => q !== daCaixa.dono)
                  .map(q => <option key={q} value={q}>{NOME_DO_AUTOR[q]}</option>)}
              </select>
              <SeletorDePapel papel={papelNovo} aoMudar={setPapelNovo} />
              <BotaoDaNuvem principal aoClicar={() => mexer(n => compartilhar(n, daCaixa.id, paraQuem, papelNovo))}>
                Adicionar
              </BotaoDaNuvem>
            </div>
            <OQuePapelDeixa papel={papelNovo} />
          </SecaoDaCaixa>

          <SecaoDaCaixa titulo="Pessoas com acesso">
            <PessoaDaCaixa quem={daCaixa.dono} dono />
            {daCaixa.acessos.map(x => (
              <PessoaDaCaixa key={x.quem} quem={x.quem}>
                <SeletorDePapel papel={x.papel}
                  aoMudar={p => mexer(n => compartilhar(n, daCaixa.id, x.quem, p))}
                  aoTirar={() => mexer(n => tirarAcessoDoArquivo(n, daCaixa.id, x.quem))} />
              </PessoaDaCaixa>
            ))}
          </SecaoDaCaixa>

          <SecaoDaCaixa titulo="Acesso geral">
            <div className="nv-acesso-geral">
              <Link2 size={17} aria-hidden />
              <span className="nv-quem">
                <b>{daCaixa.linkAberto ? 'Qualquer pessoa com o link' : 'Restrito'}</b>
                <span>
                  {daCaixa.linkAberto
                    ? `Quem tiver o endereço entra como ${NOME_DO_PAPEL[daCaixa.linkAberto]}.`
                    : 'Só quem está na lista acima abre.'}
                </span>
              </span>
              <select className="nv-papel" aria-label="Acesso geral"
                value={daCaixa.linkAberto ?? 'restrito'}
                onChange={e => mexer(n => mudarAcessoGeral(n, daCaixa.id,
                  e.target.value === 'restrito' ? undefined : e.target.value as Papel))}>
                <option value="restrito">Restrito</option>
                {PAPEIS.map(p => <option key={p} value={p}>Qualquer pessoa — {NOME_DO_PAPEL[p]}</option>)}
              </select>
            </div>
          </SecaoDaCaixa>

          <RodapeDaCaixa>
            <span />
            <BotaoDaNuvem principal aoClicar={() => setCaixa(null)}>Concluído</BotaoDaNuvem>
          </RodapeDaCaixa>
        </CaixaDeCompartilhar>
      )}

      {caixa?.tipo === 'mover' && daCaixa && (
        <CaixaDeCompartilhar arquivo={daCaixa} aoFechar={() => setCaixa(null)}>
          <SecaoDaCaixa titulo="Mover para">
            <select className="nv-campo" aria-label="Pasta de destino"
              value={daCaixa.pasta ?? 'raiz'}
              onChange={e => mexer(n => mover(n, daCaixa.id, e.target.value === 'raiz' ? undefined : e.target.value))}>
              <option value="raiz">Meu Drive</option>
              {nuvem.arquivos.filter(a => a.tipo === 'pasta' && a.id !== daCaixa.id)
                .map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
          </SecaoDaCaixa>
          <RodapeDaCaixa>
            <span />
            <BotaoDaNuvem principal aoClicar={() => setCaixa(null)}>Concluído</BotaoDaNuvem>
          </RodapeDaCaixa>
        </CaixaDeCompartilhar>
      )}

      {caixa?.tipo === 'historico' && daCaixa && (
        <div className="nv-fundo" onClick={() => setCaixa(null)} role="presentation">
          <div className="nv-caixa" role="dialog" aria-modal="true"
            aria-label={`Histórico de versões de ${daCaixa.nome}`} onClick={e => e.stopPropagation()}>
            <h3>Histórico de versões — «{daCaixa.nome}»</h3>
            <SecaoDaCaixa>
              {[...daCaixa.versoes].reverse().map((v, i) => (
                <div key={v.id} className="nv-pessoa">
                  <span className="nv-quem">
                    <b>{dataBr(v.quando)}{i === 0 ? ' · versão atual' : ''}</b>
                    <span>{v.porQuem.map(q => NOME_DO_AUTOR[q]).join(', ')}</span>
                  </span>
                </div>
              ))}
            </SecaoDaCaixa>
            <RodapeDaCaixa>
              <span />
              <BotaoDaNuvem principal aoClicar={() => setCaixa(null)}>Fechar</BotaoDaNuvem>
            </RodapeDaCaixa>
          </div>
        </div>
      )}
    </div>
  );
}
