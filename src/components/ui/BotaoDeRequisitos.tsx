import { FileDown } from 'lucide-react';
import LinkExterno from './LinkExterno';
import { urlDosRequisitos, type PercursoComRequisitos } from '../../lib/requisitosEmPdf';

/**
 * "Requisitos oficiais (PDF)" — o documento pelo qual a pessoa será avaliada.
 *
 * Fica no cabeçalho da trilha e no da vereda, ao lado do nome, porque é ali que
 * se decide se vale a pena começar. Quem está estudando precisa saber o que o
 * documento pede, e não só o que a plataforma resolveu ensinar.
 *
 * Por `LinkExterno`, e não `window.open`: é uma âncora de verdade, que o
 * navegador do celular trata como navegação em vez de popup. Abre em outra aba
 * para não descartar o percurso de quem só quis conferir a lista.
 */
export default function BotaoDeRequisitos({ percurso, className }: {
  percurso: PercursoComRequisitos;
  className?: string;
}) {
  return (
    <LinkExterno
      href={urlDosRequisitos(percurso)}
      className={className ?? 'btn-secondary text-sm inline-flex items-center gap-1.5'}
      title={`Requisitos oficiais de ${percurso.code} em PDF`}
    >
      <FileDown className="w-4 h-4" /> Requisitos oficiais (PDF)
    </LinkExterno>
  );
}
