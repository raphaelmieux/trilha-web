import { useEffect, useId, useState } from 'react';
import { CLASSES, type NivelDaInsignia } from '../../lib/nivelDaInsignia';
import { ALTURA, LARGURA, CIRCULO_SEM_CLASSE, corDoGlifo, encaixeDoGlifo, formaDaClasse, type Forma } from '../../lib/formaDaInsignia';
import { RAIO_DA_TINTA, iconShape, iconeCanonico } from '../../lib/badgeIcons';
import { bordaDaArte, type BordaDaArte } from '../../lib/faixa/bordaDaArte';

/*
  Os materiais da Faixa, aprovados no P0: patch bordado, button de metal e
  plástico, pin esmaltado de aro dourado, e o lugar vazio desenhado a giz,
  como o alfaiate marca no tecido onde a peça vai.

  O glifo do pin é o mesmo desenho da estante e do PDF (`iconShape`): três
  lugares mostrando a mesma insígnia com três desenhos seriam três insígnias.
*/

/** O caminho de um arquivo de `public/`, com a base do site na frente. */
const doSite = (caminho: string) => `${import.meta.env.BASE_URL}${caminho}`;

function Glifo({ forma, icone, cor }: { forma: Forma; icone: string; cor: string }) {
  const e = encaixeDoGlifo(forma, RAIO_DA_TINTA[iconeCanonico(icone)] ?? 12);
  return (
    <g transform={e.transform} fill="none" stroke={cor} strokeWidth={e.traco}
      strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: iconShape(icone) }} />
  );
}

/** O pin esmaltado de uma classe: a cor preenche o polígono, o aro é dourado. */
export function PinDeClasse({ classe, icone }: { classe: NivelDaInsignia; icone: string }) {
  const id = useId().replace(/:/g, '');
  const forma = formaDaClasse(classe);
  const c = CLASSES[classe];
  return (
    <svg viewBox={`-2 -2 ${LARGURA + 4} ${ALTURA + 4}`} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}o`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff4c2" /><stop offset=".45" stopColor="#d2a53a" />
          <stop offset=".7" stopColor="#7e5a12" /><stop offset="1" stopColor="#e6c25e" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".45" /><stop offset=".5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}c`}><polygon points={forma.pontos} /></clipPath>
      </defs>
      <polygon points={forma.pontos} fill={c.cor} stroke={`url(#${id}o)`} strokeWidth={2.2} strokeLinejoin="round" />
      <g clipPath={`url(#${id}c)`}>
        <ellipse cx={LARGURA * 0.32} cy={ALTURA * 0.18} rx={LARGURA * 0.55} ry={ALTURA * 0.32} fill={`url(#${id}b)`} />
      </g>
      <Glifo forma={forma} icone={icone} cor={corDoGlifo(c.cor)} />
    </svg>
  );
}

/** O lugar vazio de um pin de classe: o polígono dela a giz, e o furo do alfinete. */
export function GizDeClasse({ classe }: { classe: NivelDaInsignia }) {
  const forma = formaDaClasse(classe);
  return (
    <svg viewBox={`-2 -2 ${LARGURA + 4} ${ALTURA + 4}`} aria-hidden="true">
      <polygon className="fx-giz fx-giz-miudo" points={forma.pontos} strokeWidth={1} />
      <circle className="fx-furo" cx={forma.centroX} cy={forma.centroY} r={1} />
    </svg>
  );
}

const CIRCULO: Forma = { pontos: '', centroX: LARGURA / 2, centroY: ALTURA / 2, raioInscrito: ALTURA / 2 };

/**
 * A curiosidade: o pin recortado na silhueta do desenho, quando a arte chega.
 * Até lá, a face provisória — um pin redondo off-white com o glifo do tema —,
 * que é a forma que nenhuma classe usa.
 */
export function PinCurioso({ arte, icone }: { arte: string; icone?: string }) {
  const [semArte, setSemArte] = useState(false);
  if (!semArte) {
    return <img src={doSite(arte)} alt="" draggable={false} className="fx-recorte" onError={() => setSemArte(true)} />;
  }
  return (
    <svg viewBox={`-1 -1 ${LARGURA + 2} ${ALTURA + 2}`} aria-hidden="true">
      <circle cx={LARGURA / 2} cy={ALTURA / 2} r={ALTURA / 2 - 0.4} fill={CIRCULO_SEM_CLASSE} stroke="#c9a347" strokeWidth={1.6} />
      {icone
        ? <Glifo forma={CIRCULO} icone={icone} cor="#2a2416" />
        : <text x={LARGURA / 2} y={ALTURA / 2 + 4.6} textAnchor="middle" fontWeight={700} fontSize={13} fill="#2a2416">!</text>}
      <ellipse cx={LARGURA * 0.36} cy={ALTURA * 0.25} rx={8} ry={3.6} fill="#fff" opacity={0.35} />
    </svg>
  );
}

/** O lugar vazio redondo: curiosidade, segredo e button. */
export function GizRedondo({ rotulo, emBreve, interrogacao }: { rotulo?: string; emBreve?: boolean; interrogacao?: boolean }) {
  return (
    <>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <circle className="fx-giz" cx={50} cy={50} r={47} strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
        {!interrogacao && <circle className="fx-furo" cx={50} cy={50} r={1.6} />}
      </svg>
      {interrogacao && <span className="fx-rotulo-giz fx-interrogacao" aria-hidden="true">?</span>}
      {rotulo && <span className="fx-rotulo-giz" aria-hidden="true">{rotulo}{emBreve && <small>em breve</small>}</span>}
    </>
  );
}

/** O lugar vazio do patch: o oval da arte, a giz, com o código. */
export function GizOval({ rotulo, emBreve }: { rotulo?: string; emBreve?: boolean }) {
  return (
    <>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <ellipse className="fx-giz" cx={50} cy={50} rx={48} ry={48} strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
      </svg>
      {rotulo && <span className="fx-rotulo-giz" aria-hidden="true">{rotulo}{emBreve && <small>em breve</small>}</span>}
    </>
  );
}

/** O lugar vazio do Mestrado: o retângulo áureo, a giz, com o nome. */
export function GizAureo({ rotulo }: { rotulo: string }) {
  return (
    <>
      <svg viewBox="0 0 150 93" preserveAspectRatio="none" aria-hidden="true">
        <rect className="fx-giz" x={1} y={1} width={148} height={91} rx={14} strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
        <circle className="fx-furo" cx={75} cy={46.5} r={1.6} />
      </svg>
      <span className="fx-rotulo-giz fx-rotulo-mestrado" aria-hidden="true">{rotulo}</span>
    </>
  );
}

/*
  O patch bordado: a arte, os fios por cima, e o overloque em volta.

  O overloque segue o contorno da própria arte e tem a cor da beirada dela —
  as duas coisas lidas do arquivo, e não de uma lista por código. Uma arte
  nova chega com a borda certa sem ninguém mexer aqui. Enquanto a leitura não
  termina (ou onde não há canvas), o overloque é um oval vermelho, que é o que
  a maior parte das artes tem.
*/
export function PatchBordado({ arte }: { arte: string }) {
  const src = doSite(arte);
  const [borda, setBorda] = useState<BordaDaArte | null>(null);
  useEffect(() => {
    let vivo = true;
    bordaDaArte(src).then(b => { if (vivo) setBorda(b); });
    return () => { vivo = false; };
  }, [src]);
  const contorno = borda?.contorno ?? 'M 500 20 A 480 480 0 1 1 499.9 20 Z';
  const cor = borda?.cor ?? '#C13516';
  return (
    <>
      <span className="fx-arte" style={{ ['--src' as string]: `url("${src}")` }} />
      <svg className="fx-overloque" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
        <path d={contorno} fill="none" stroke="rgba(0,0,0,.45)" strokeWidth={7} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <path d={contorno} fill="none" stroke={cor} strokeWidth={6.5} strokeDasharray="1.1 1.1" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <path d={contorno} fill="none" stroke="rgba(255,255,255,.28)" strokeWidth={2} strokeDasharray="1.1 1.1" vectorEffect="non-scaling-stroke" transform="translate(-1 -1.5)" />
      </svg>
    </>
  );
}

/** O button: aro de metal, a arte, e o brilho do plástico por cima. */
export function ButtonDePlastico({ arte }: { arte: string }) {
  return (
    <>
      <span className="fx-disco" style={{ ['--src' as string]: `url("${doSite(arte)}")` }} />
      <span className="fx-brilho" />
    </>
  );
}

/** O Mestrado da plataforma: a arte dele já traz o retângulo áureo e o aro. */
export function ButtonAureo({ arte, nome }: { arte: string; nome: string }) {
  const [semArte, setSemArte] = useState(false);
  if (semArte) {
    return <span className="fx-aureo-provisorio"><b>MESTRADO</b><span>{nome.replace(/^Mestrado /, '')}</span></span>;
  }
  return <img src={doSite(arte)} alt="" draggable={false} className="fx-recorte" onError={() => setSemArte(true)} />;
}
