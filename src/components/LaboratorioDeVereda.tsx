import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import LeitorDeVereda from './LeitorDeVereda';
import {
  CSS_IDE, CabecalhoDaIde, LateralDaIde, EditorDeCodigo, PreviaDaIde,
  StatusDaIde, AlternadorDaIde,
} from '../labs/ide';
import { contarLinhas } from '../labs/realce';
import { PASSOS } from '../labs/desafioDeHtml';
import { validateHtml, type CheckResult } from '../lib/htmlValidator';
import { lerRascunho, descartarRascunho } from '../lib/rascunho';
import { useRascunhoLocal } from '../hooks/useRascunhoLocal';
import type { Vereda, LicaoDeVereda } from '../curriculum/veredas';

/*
 * O laboratório de uma vereda.
 *
 * É o mesmo editor dos laboratórios da trilha — as peças saem todas de
 * `ide.tsx` —, com duas diferenças que vêm do que uma vereda é: não grava
 * requisito nenhum, porque vereda não tem requisito, e o que ela grava é um
 * evento de atividade dizendo que este laboratório foi vencido.
 *
 * O que é cobrado sai da própria lição, em `verificacoes`, contra o mesmo
 * validador que a trilha usa. Assim um laboratório novo é uma lista de ids, e
 * não uma tela nova.
 */
export default function LaboratorioDeVereda({ vereda, licao, userId, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'laboratorio' }>;
  userId: string;
  /** Chamado uma vez, quando todas as verificações passam e a pessoa entrega. */
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  /* A chave do rascunho leva a lição: sete laboratórios numa vereda são sete
     arquivos diferentes, e um só rascunho misturaria os sete. */
  const chave = `${vereda.codigo}-${licao.id}`;
  const [codigo, setCodigo] = useState(() => {
    const guardado = lerRascunho<string>(userId, chave);
    return typeof guardado?.conteudo === 'string' ? guardado.conteudo : licao.modelo;
  });
  const [voltou] = useState(() => {
    const guardado = lerRascunho<string>(userId, chave);
    return typeof guardado?.conteudo === 'string' && guardado.conteudo !== licao.modelo;
  });
  const [entregue, setEntregue] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [vendo, setVendo] = useState<'codigo' | 'previa'>('codigo');
  const [consultando, setConsultando] = useState(false);
  const [aviso, setAviso] = useState(voltou ? 'Seu código voltou como você deixou.' : '');

  useRascunhoLocal(userId, chave, codigo, !entregue);

  const resultados: CheckResult[] = useMemo(
    () => validateHtml(codigo, licao.verificacoes), [codigo, licao.verificacoes]);
  const passaram = resultados.filter(r => r.passed).length;
  const tudoPassa = passaram === resultados.length;

  /* A prévia espera a digitação parar: reconstruir o iframe a cada tecla
     pisca a tela inteira. */
  const [previa, setPrevia] = useState(codigo);
  useEffect(() => {
    const t = setTimeout(() => setPrevia(codigo), 400);
    return () => clearTimeout(t);
  }, [codigo]);

  const entregar = async () => {
    setSalvando(true);
    await aoVencer();
    descartarRascunho(userId, chave);
    setSalvando(false);
    setEntregue(true);
  };

  if (entregue) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
        <h1 className="text-2xl font-bold mb-2">{licao.titulo} — vencido!</h1>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Sua página passou nas {resultados.length} verificações.
        </p>
        <button onClick={aoSair} className="btn-primary">Voltar para a vereda</button>
      </div>
    );
  }

  const tarefas = resultados.map(r => ({
    id: r.id,
    titulo: r.label,
    detalhe: r.passed ? undefined : (r.detail || r.hint),
    passos: PASSOS[r.id],
    feita: r.passed,
  }));

  const acoes = (
    <div className="flex flex-col gap-2">
      <button onClick={entregar} disabled={!tudoPassa || salvando}
        className="btn-primary text-sm w-full justify-center disabled:opacity-50">
        {salvando ? 'Salvando…' : tudoPassa ? 'Entregar' : `Faltam ${resultados.length - passaram}`}
      </button>
      <button onClick={() => setCodigo(licao.modelo)} className="btn-secondary text-xs w-full justify-center">
        <RotateCcw className="w-3 h-3 mr-1" /> Recomeçar do zero
      </button>
    </div>
  );

  const naoFazParte = (o: string) =>
    setAviso(`${o} existe num editor de verdade, e está aqui para a tela ficar igual — mas não faz parte deste exercício.`);

  return (
    <LaboratorioEmTelaCheia
      trilha={vereda.codigo}
      titulo={licao.titulo}
      programa="editor-de-codigo"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      rodape={26}
    >
      <style>{CSS_IDE}</style>

      <div className="ide">
        <CabecalhoDaIde arquivo={licao.arquivo} projeto={licao.projeto} aoAvisar={naoFazParte} />

        <div className="ide-corpo">
          {consultando && (
            <div className="ide-referencia">
              <LeitorDeVereda vereda={vereda} aoFechar={() => setConsultando(false)} />
            </div>
          )}

          <LateralDaIde
            projeto={licao.projeto}
            arquivos={[{ nome: licao.arquivo, problemas: resultados.length - passaram }]}
            atual={licao.arquivo}
            aoAbrir={() => {}}
            aoAvisar={naoFazParte}
            aoConsultar={() => setConsultando(true)}
          />

          <div className="ide-painel">
            <div className="ide-guias">
              <button className="ide-guia" aria-current="true">
                <span style={{ color: '#E37933' }}>◆</span> {licao.arquivo}
              </button>
            </div>

            <AlternadorDaIde vendo={vendo} aoTrocar={setVendo} />

            <div className="ide-codigo-e-previa" style={{ flex: 1, minHeight: 0, display: 'flex' }}>
              <div className={`ide-lado-codigo${vendo === 'previa' ? ' escondido' : ''}`}>
                <EditorDeCodigo codigo={codigo} aoMudar={setCodigo} rotulo="Editor de código HTML" />
              </div>
              <div className={`ide-lado-previa${vendo === 'codigo' ? ' escondido' : ''}`}>
                <PreviaDaIde html={previa} arquivo={licao.arquivo} aoAvisar={naoFazParte} />
              </div>
            </div>
          </div>
        </div>

        <StatusDaIde problemas={resultados.length - passaram} linhas={contarLinhas(codigo)}
          aoAvisar={naoFazParte} />
      </div>
    </LaboratorioEmTelaCheia>
  );
}
