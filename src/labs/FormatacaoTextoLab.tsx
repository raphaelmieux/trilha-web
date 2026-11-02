import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2, IndentDecrease, IndentIncrease, ArrowUpDown, MousePointer2, Replace, RotateCcw, Search,
} from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import {
  CSS_WORD, CSS_FOLHA, BarraDeTituloDoWord, GuiasDoWord, GrupoDaFaixa, BotaoDaFaixa,
  EnfeiteDaFaixa, ReguaDoWord, ZoomDoWord, FolhaDoWord,
} from './word';
import {
  CSS_FONTE_DO_WORD, GrupoAreaDeTransferencia, GrupoDeConfigurarPagina, GrupoDeEstilos, GrupoDeFonte,
  GrupoDeParagrafo,
} from './fonteDoWord';
import {
  DEGRAU_DE_RECUO_CM, MEDIDAS_DAS_MARGENS, PAGINA_PADRAO,
  medidasDaPagina, quantasPaginas, textoVisivel,
  type ConfiguracaoDaPagina,
} from './documento';
import { useEdicaoDoWord } from './useEdicaoDoWord';
import { DOC_DA_FORMATACAO, METAS_DA_FORMATACAO as METAS, type Doc } from './metasDaAp042';
import {
  upsertRequirementProgress, getRequirementId, getSpecialtyId,
  ensureEnrollment, updateEnrollmentActivity, logActivity,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import type { PropsDeLaboratorio as Props } from './tipos';

/*
 * AP042 requisito 3 — as sete demonstrações de formatação, num Word.
 *
 * O requisito manda ajustar margem, copiar, colar, trocar fonte, usar negrito,
 * alinhar, espaçar e listar. São gestos, e gesto não se prova em múltipla
 * escolha: dá para acertar a alternativa sobre o botão de negrito sem nunca ter
 * apertado um. Então aqui existe um documento de verdade, e o laboratório
 * observa cada operação acontecer nele.
 *
 * ── Um Word que se edita com cursor ──────────────────────────────────────
 * Este laboratório tinha um documento próprio, de parágrafos que se escolhiam
 * inteiros com um clique, e os botões agiam sobre o parágrafo escolhido. Era um
 * programa que não existe: no Word não há parágrafo escolhido, há cursor, e o
 * negrito vale para a seleção — uma palavra, meia frase, três linhas. A folha
 * agora é a de `word.tsx`, a mesma da CC-ES002 e da AP044, e quem sai daqui
 * para lá não aprende um segundo jeito de mexer no mesmo programa.
 *
 * ── Por que a interface imita o Word, e não a plataforma ─────────────────
 * O Word é um programa só, com uma interface que o desbravador vai encontrar
 * idêntica na escola e no clube — a faixa de opções, as guias, os grupos com o
 * nome embaixo. E metade do que o requisito cobra é *onde fica*: margem,
 * orientação e tamanho do papel não estão na guia Início, estão em Layout, e um
 * painel inventado ensinaria a procurar no lugar errado.
 *
 * ── Copiar e colar passam pela área de transferência ─────────────────────
 * O Ctrl+C copia o que está selecionado, com a formatação, e o Ctrl+V cola onde
 * está o cursor — os mesmos atalhos que valem em qualquer programa. A tarefa
 * confere o resultado **e** que houve uma colagem: escrever o nome do clube de
 * novo deixaria o documento igual, e não seria o que o requisito pede.
 */

const GUIAS_USAVEIS = ['Início', 'Layout'];
const ESTILOS_DA_GALERIA = ['Normal', 'Título 1', 'Título 2', 'Subtítulo', 'Citação'] as const;

const cm = (n: number) => `${n.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} cm`;

export default function FormatacaoTextoLab({ specialtyCode, lessonCode, lessonTitle, requirementCodes, userId }: Props) {
  const [doc, setDoc] = useState<Doc>(DOC_DA_FORMATACAO);
  const [colou, setColou] = useState(false);
  const [guia, setGuia] = useState('Início');
  const [marcas, setMarcas] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [aviso, setAviso] = useState('');
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState('');
  const [gravando, setGravando] = useState(false);

  /* Colar é o único gesto que a tarefa precisa ver acontecer, e ele passa
     pelo teclado da folha ou pelo botão — os dois chegam aqui como comando. */
  const edicao = useEdicaoDoWord(doc, setDoc, {
    permitir: c => {
      if (c.tipo === 'colar') setColou(true);
      return true;
    },
  });

  const contexto = useMemo(() => ({ doc, colou }), [doc, colou]);
  const tarefas = METAS.map(m => ({
    id: m.id, titulo: m.titulo, detalhe: m.detalhe, onde: m.onde, passos: m.passos,
    feita: m.feita(contexto),
  }));
  const tudoFeito = tarefas.every(t => t.feita);
  const palavras = textoVisivel(doc).split(/\s+/).filter(Boolean).length;
  const pagina = doc.pagina ?? PAGINA_PADRAO;
  const medidas = medidasDaPagina(doc);

  const configurar = (mudanca: Partial<ConfiguracaoDaPagina>) => {
    /* Configurar a página entra no Ctrl+Z, como no Word. */
    edicao.mudar(d => ({ ...d, pagina: { ...(d.pagina ?? PAGINA_PADRAO), ...mudanca } }));
  };

  const recomecar = () => {
    edicao.reiniciar(DOC_DA_FORMATACAO);
    setColou(false);
    setGuia('Início');
    setAviso('O documento voltou ao estado em que chegou.');
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
        attempts: 1, correct_count: METAS.length, total_questions: METAS.length,
      }, specialtyCode);
      gravados++;
    }
    setGravando(false);
    if (gravados < requirementCodes.length) {
      setErro('Você formatou tudo, mas o progresso não pôde ser guardado agora. Avise a liderança do clube.');
      return;
    }
    await logActivity(userId, 'formatacao_concluida', { specialtyCode, lessonCode, metas: METAS.length });
    setPronto(true);
  };

  if (pronto) {
    return (
      <div className="card p-6 text-center">
        <FileCheck2 className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
        <h2 className="text-xl font-bold mb-2">Documento pronto para entregar!</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Você acertou a folha em Layout, copiou, trocou a letra, destacou,
          alinhou, espaçou e listou — nos mesmos lugares em que esses botões ficam
          no Word de verdade. Abrir o programa na escola agora é reconhecer a
          faixa, e não procurar nela.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary mt-4 inline-flex">
          Voltar para a Trilha
        </Link>
      </div>
    );
  }

  const enfeite = (nome: string) => setAviso(`${nome} existe no Word de verdade, e não faz parte deste exercício.`);

  const acoes = (
    <div className="flex flex-col gap-2">
      {tudoFeito && (
        <>
          {erro && <p style={{ fontSize: 11.5, color: 'var(--color-error)' }}>{erro}</p>}
          <button onClick={registrar} disabled={gravando} className="btn-primary text-sm w-full justify-center">
            {gravando ? 'Guardando…' : 'Entregar o documento'}
          </button>
        </>
      )}
      <button onClick={recomecar} className="btn-secondary text-xs py-2 w-full justify-center inline-flex items-center gap-1">
        <RotateCcw className="w-3 h-3" /> Recomeçar o documento
      </button>
    </div>
  );

  const recuo = edicao.paragrafo?.formato?.recuo ?? 0;

  return (
    <LaboratorioEmTelaCheia
      trilha={specialtyCode}
      voltarPara={`/especialidade/${specialtyCode}`}
      titulo={lessonTitle}
      programa="word"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      rodape={26}
    >
      <style>{CSS_WORD}</style>
      <style>{CSS_FOLHA}</style>
      <style>{CSS_FONTE_DO_WORD}</style>

      <div className="wd-janela" style={{
        '--largura-cm': medidas.largura, '--altura-cm': medidas.altura, '--margem-cm': medidas.margem, '--zoom': zoom,
      } as React.CSSProperties}>
        <BarraDeTituloDoWord documento="Relatório do acampamento" aoAvisar={setAviso}
          aoDesfazer={edicao.podeDesfazer ? edicao.desfazer : undefined}
          aoRefazer={edicao.podeRefazer ? edicao.refazer : undefined} />

        <GuiasDoWord
          atual={guia} usaveis={GUIAS_USAVEIS}
          aoTrocar={setGuia}
          aoAvisar={setAviso} />

        {guia === 'Início' && (
          <div className="wd-faixa">
            <GrupoAreaDeTransferencia edicao={edicao} aoAvisar={setAviso} />
            <GrupoDeFonte edicao={edicao} aoAvisar={setAviso} />
            <GrupoDeParagrafo edicao={edicao} aoAvisar={setAviso}
              marcas={{ ligadas: marcas, alternar: () => { setMarcas(m => !m); edicao.focar(); } }} />
            <GrupoDeEstilos edicao={edicao} estilos={[...ESTILOS_DA_GALERIA]} aoAvisar={setAviso} />
            <GrupoDaFaixa nome="Edição">
              <div className="wd-linhas">
                <EnfeiteDaFaixa dica="Localizar (Ctrl+L)" rotulo="Localizar" aoAvisar={setAviso}><Search className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
                <EnfeiteDaFaixa dica="Substituir (Ctrl+U)" rotulo="Substituir" aoAvisar={setAviso}><Replace className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
                <BotaoDaFaixa dica="Selecionar Tudo (Ctrl+A)" rotulo="Selecionar"
                  aoClicar={() => { edicao.executar({ tipo: 'selecionar-tudo' }); edicao.focar(); }}>
                  <MousePointer2 className="w-3.5 h-3.5" />
                </BotaoDaFaixa>
              </div>
            </GrupoDaFaixa>
          </div>
        )}

        {guia === 'Layout' && (
          <div className="wd-faixa">
            <GrupoDeConfigurarPagina pagina={doc.pagina} aoMudar={configurar} aoAvisar={setAviso} />

            <GrupoDaFaixa nome="Parágrafo">
              {/* O recuo mostra o do parágrafo do cursor, e as setas mexem nele
                  como os botões de recuo da guia Início. O espaçamento antes e
                  depois está desenhado e avisa: o requisito pede o espaçamento
                  entre linhas, que mora na guia Início. */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
                <div className="wd-linhas">
                  <span style={{ fontSize: 10.5, color: '#605E5C' }}>Recuar</span>
                  <label className="flex items-center gap-1" style={{ fontSize: 11 }}>
                    <IndentIncrease className="w-3.5 h-3.5" /> Esquerda:
                    <input className="wd-combo" style={{ width: 60 }} readOnly aria-label="Recuo à esquerda"
                      value={cm(recuo * DEGRAU_DE_RECUO_CM)} />
                    <BotaoDaFaixa dica="Diminuir Recuo" aoClicar={() => edicao.paragrafar({ tipo: 'recuo', delta: -1 })}>
                      <IndentDecrease className="w-3 h-3" />
                    </BotaoDaFaixa>
                    <BotaoDaFaixa dica="Aumentar Recuo" aoClicar={() => edicao.paragrafar({ tipo: 'recuo', delta: 1 })}>
                      <IndentIncrease className="w-3 h-3" />
                    </BotaoDaFaixa>
                  </label>
                </div>
                <div className="wd-linhas">
                  <span style={{ fontSize: 10.5, color: '#605E5C' }}>Espaçamento</span>
                  <label className="flex items-center gap-1" style={{ fontSize: 11 }}>
                    <ArrowUpDown className="w-3.5 h-3.5" /> Antes:
                    <input className="wd-combo" style={{ width: 52 }} value="0 pt" readOnly
                      onClick={() => enfeite('O espaçamento antes do parágrafo')} />
                  </label>
                  <label className="flex items-center gap-1" style={{ fontSize: 11 }}>
                    <ArrowUpDown className="w-3.5 h-3.5" /> Depois:
                    <input className="wd-combo" style={{ width: 52 }} value="8 pt" readOnly
                      onClick={() => enfeite('O espaçamento depois do parágrafo')} />
                  </label>
                </div>
              </div>
            </GrupoDaFaixa>
          </div>
        )}

        {/* A régua acompanha o papel e a margem: é o retorno visível de ter
            mexido em Layout. */}
        <ReguaDoWord larguraCm={medidas.largura} margemCm={MEDIDAS_DAS_MARGENS[pagina.margens]} />

        <FolhaDoWord doc={doc} marcas={marcas} edicao={edicao.folha} />

        <div className="wd-status">
          <span>Página 1 de {quantasPaginas(doc)}</span>
          <span>{palavras} palavras</span>
          <span className="hidden sm:inline">Português (Brasil)</span>
          <ZoomDoWord zoom={zoom} aoMudar={setZoom} aoAvisar={setAviso} />
        </div>
      </div>
    </LaboratorioEmTelaCheia>
  );
}
