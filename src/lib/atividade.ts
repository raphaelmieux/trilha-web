import { getSpecialty, getAllSpecialties } from '../curriculum';
import type { LabType } from '../types';

/*
 * O que dizer de cada coisa que a pessoa fez.
 *
 * O painel mostrava o `event_type` cru, com os sublinhados trocados por espaços:
 * "lesson completed", "certification issued", "file manager completed". Em
 * inglês, e sem dizer de qual trilha nem de qual lição — o que sobra é a data,
 * e a data sozinha não conta história nenhuma.
 *
 * Aqui cada evento vira uma frase com a trilha na frente e o nome da lição
 * dentro, quando dá para saber: "AP041 · Laboratório concluído: Mexendo em
 * pastas e arquivos".
 *
 * A trilha e a lição são deduzidas do que já está gravado, e não de campos
 * novos: os eventos antigos, que estão no banco desde antes, precisam continuar
 * legíveis. Por isso as várias tentativas em `trilhaDoEvento` e a busca da
 * lição pelo tipo de laboratório.
 */

export interface EventoDeAtividade {
  id?: string;
  event_type: string;
  metadata?: Record<string, unknown> | null;
  curriculum_version?: string | null;
  created_at?: string;
}

export interface AtividadeDescrita {
  /** O código da trilha, quando dá para saber. */
  trilha?: string;
  /** A frase principal, já em português. */
  texto: string;
  /** Um detalhe secundário — a nota, o código do certificado. */
  detalhe?: string;
}

const texto = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim() : undefined;

/** O código da trilha, procurado em tudo o que o evento pode carregar. */
export function trilhaDoEvento(e: EventoDeAtividade): string | undefined {
  const m = e.metadata ?? {};
  const direto = texto(m.specialtyCode) ?? texto(m.especialidade);
  if (direto) return direto;

  /* A página de lição grava o código da trilha na coluna de versão do
     currículo — é onde ele coube quando a função foi escrita. */
  const naColuna = texto(e.curriculum_version);
  if (naColuna && /^AP\d{3}$/.test(naColuna)) return naColuna;

  /* Último recurso: o prefixo do código da lição ("AP041.5-L1") ou do
     requisito ("AP041-5.1"). */
  const codigo = texto(m.lessonCode) ?? texto(m.requirementCode);
  const casou = codigo?.match(/^(AP\d{3})[.-]/);
  return casou?.[1];
}

/**
 * De qual laboratório cada evento fala.
 *
 * Os laboratórios gravam o próprio nome no tipo do evento, mas não o código da
 * lição. Como cada trilha usa um laboratório uma vez só — há teste garantindo
 * isso em curriculum/index.test.ts —, o tipo do laboratório é suficiente para
 * achar a lição e, com ela, o título que a pessoa viu na tela.
 */
export const LABORATORIO_DO_EVENTO: Record<string, LabType> = {
  ai_lab_completed: 'ai_lab',
  code_lab_completed: 'code_lab',
  cuidados_concluido: 'computer_care',
  file_manager_completed: 'file_manager',
  filipenses_completed: 'filipenses',
  image_lab_completed: 'image_lab',
  mail_lab_completed: 'mail_lab',
  pact_completed: 'pact_builder',
  site_lab_completed: 'site_lab',
  threat_lab_completed: 'threat_lab',
  web_lab_completed: 'web_lab',
};

/** Os que não concluem nada — são passos dentro de um laboratório. */
const PASSOS: Record<string, string> = {
  mail_sent: 'E-mail enviado no laboratório',
  threat_sim_run: 'Simulação de ameaça executada',
  text_saved: 'Rascunho do texto salvo',
  redacao_montada: 'Texto da redação montado',
  ai_generation: 'Pedido feito à IA',
  ai_redacao: 'Resposta conferida na redação',
  /* Do laboratório de pré-requisito, aposentado quando o bloqueio da trilha
     passou a cumprir esse papel sozinho. Os eventos dele continuam no banco, e
     continuam legíveis. */
  prerequisite_verified: 'Pré-requisito conferido',
};

/** Onde mora o laboratório, procurado no currículo inteiro. */
function acharLicaoPorLaboratorio(lab: LabType): { trilha: string; titulo: string } | undefined {
  for (const t of getAllSpecialties()) {
    const l = t.modules.flatMap(m => m.lessons).find(x => x.labType === lab);
    if (l) return { trilha: t.code, titulo: l.title };
  }
  return undefined;
}

function tituloDaLicao(trilha: string | undefined, achar: (l: { labType?: LabType; code: string }) => boolean): string | undefined {
  if (!trilha) return undefined;
  const t = getSpecialty(trilha);
  return t?.modules.flatMap(m => m.lessons).find(achar)?.title;
}

export function descreverAtividade(e: EventoDeAtividade): AtividadeDescrita {
  const m = e.metadata ?? {};
  const trilha = trilhaDoEvento(e);

  if (e.event_type === 'certification_issued') {
    return { trilha, texto: 'Certificado emitido', detalhe: texto(m.certCode) };
  }

  if (e.event_type === 'final_exam_completed') {
    const nota = typeof m.score === 'number' && typeof m.total === 'number'
      ? `${m.score} de ${m.total}` : undefined;
    return { trilha, texto: 'Avaliação final concluída', detalhe: nota };
  }

  if (e.event_type === 'lesson_completed') {
    const codigo = texto(m.lessonCode);
    const titulo = tituloDaLicao(trilha, l => l.code === codigo);
    const nota = typeof m.score === 'number' && typeof m.total === 'number'
      ? `${m.score} de ${m.total}` : undefined;
    return {
      trilha,
      texto: titulo ? `Lição concluída: ${titulo}` : 'Lição concluída',
      detalhe: nota,
    };
  }

  if (e.event_type === 'text_submitted') {
    const titulo = tituloDaLicao(trilha, l => l.labType === 'redacao_guiada' || l.labType === 'text_editor');
    return { trilha, texto: titulo ? `Relatório enviado: ${titulo}` : 'Relatório enviado' };
  }

  const lab = LABORATORIO_DO_EVENTO[e.event_type];
  if (lab) {
    const codigo = texto(m.lessonCode);
    const porCodigo = codigo ? tituloDaLicao(trilha, l => l.code === codigo) : undefined;
    if (porCodigo) return { trilha, texto: `Laboratório concluído: ${porCodigo}` };

    /*
      Os eventos gravados antes de os laboratórios registrarem a trilha e a
      lição — e são a maioria do histórico de quem já usou a plataforma.

      Deles só vem o tipo do evento. Mas cada laboratório é usado uma vez em
      todo o currículo, e não só dentro de uma trilha: `file_manager` só existe
      na AP041, `web_lab` só na AP034. Então o tipo basta para achar a lição e,
      por ela, a trilha — o que devolve a frase inteira a um evento que não
      guardou nada além do nome.
    */
    const achada = acharLicaoPorLaboratorio(lab);
    if (achada) return { trilha: trilha ?? achada.trilha, texto: `Laboratório concluído: ${achada.titulo}` };

    return { trilha, texto: 'Laboratório concluído' };
  }

  const passo = PASSOS[e.event_type];
  if (passo) return { trilha, texto: passo };

  /*
    O que ainda não tem frase própria.

    Um evento novo entra por aqui em vez de sumir da lista, e aparece legível o
    bastante para alguém perceber que falta descrevê-lo. Some o sublinhado e
    entra a maiúscula inicial — nada além disso, porque inventar tradução para
    um tipo desconhecido diria uma coisa que ninguém escreveu.
  */
  const cru = e.event_type.replace(/_/g, ' ');
  return { trilha, texto: cru.charAt(0).toUpperCase() + cru.slice(1) };
}
