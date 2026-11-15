import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, Loader2, Printer, X } from 'lucide-react';
import CertificateCanvas from '../CertificateCanvas';
import { MarcaEmTexto } from '../ui/BrandMark';
import { exportCertificatePdf } from '../../lib/pdf';
import { registrarCuriosidade } from '../../lib/registroDeCuriosidades';
import type { Certification } from '../../types';

/*
  O Token.Web() pendurado na parede.

  Clicar no patch de uma trilha, no button de uma vereda ou no patch do ME006
  abre o certificado de verdade — a arte de fundo com o nome, o código e a data
  nas posições de sempre (`CertificateCanvas`) —, numa moldura de madeira com
  passe-partout e vidro, presa num prego. É o que a pessoa vai fazer com ele, e
  a tela já mostra isso.

  Embaixo, Baixar PDF e Imprimir. Imprimir manda para a impressora só o
  certificado, em A4 deitado e sem margem: a moldura é da tela, e o papel é o
  que vai para a moldura de verdade. As duas são a curiosidade Na Parede.
*/

const CLASSE_DE_IMPRESSAO = 'imprimindo-token';

export default function CertificadoNaParede({ cert, nome, titulo, legenda, aoFechar }: {
  cert: Certification;
  /** O nome que sai no certificado. */
  nome: string;
  titulo: string;
  legenda: string;
  aoFechar: () => void;
}) {
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState('');
  const revogado = cert.status !== 'active';

  useEffect(() => {
    const comEsc = (ev: KeyboardEvent) => { if (ev.key === 'Escape') aoFechar(); };
    document.addEventListener('keydown', comEsc);
    return () => document.removeEventListener('keydown', comEsc);
  }, [aoFechar]);

  const baixar = async () => {
    setBaixando(true);
    setErro('');
    try {
      await exportCertificatePdf(cert, nome);
      registrarCuriosidade('tokenBaixado', { code: cert.code });
    } catch (e) {
      setErro((e as Error).message || 'Não foi possível gerar o PDF.');
    } finally {
      setBaixando(false);
    }
  };

  /* A folha de impressão esconde a página inteira e mostra só o certificado.
     A classe vai no documento e sai quando a impressão termina — ou quando o
     diálogo fecha, para a próxima impressão da plataforma não sair em branco. */
  const imprimir = () => {
    document.documentElement.classList.add(CLASSE_DE_IMPRESSAO);
    const tirar = () => document.documentElement.classList.remove(CLASSE_DE_IMPRESSAO);
    window.addEventListener('afterprint', tirar, { once: true });
    registrarCuriosidade('tokenImpresso', { code: cert.code });
    window.print();
  };
  useEffect(() => () => document.documentElement.classList.remove(CLASSE_DE_IMPRESSAO), []);

  return createPortal(
    <div className="fx-parede-veu" role="presentation" onClick={aoFechar}>
      <div className="fx-parede" role="dialog" aria-modal="true" aria-label={titulo} onClick={e => e.stopPropagation()}>
        <button type="button" className="fx-parede-fechar" onClick={aoFechar} aria-label="Fechar"><X className="w-5 h-5" /></button>
        <span className="fx-prego" aria-hidden="true" />
        <div className={`fx-moldura${revogado ? ' fx-revogado' : ''}`}>
          <div className="fx-passepartout">
            <div className="fx-certificado fx-para-imprimir">
              <CertificateCanvas cert={cert} studentName={nome} />
              <span className="fx-vidro" aria-hidden="true" />
            </div>
          </div>
        </div>
        <h2>{titulo}</h2>
        <p>
          {revogado
            ? <>Este <MarcaEmTexto marca="token" /> foi revogado pela liderança e não vale mais.</>
            : <>{legenda} · <MarcaEmTexto marca="token" /> emitido em {new Date(cert.issued_at).toLocaleDateString('pt-BR')}</>}
        </p>
        <p className="fx-codigo">{cert.code}</p>
        {!revogado && (
          <div className="fx-acoes">
            <button type="button" className="fx-principal" onClick={() => { void baixar(); }} disabled={baixando}>
              {baixando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Baixar PDF
            </button>
            <button type="button" onClick={imprimir}><Printer className="w-4 h-4" /> Imprimir</button>
          </div>
        )}
        {erro && <p className="fx-erro" role="alert">{erro}</p>}
      </div>
    </div>,
    document.body,
  );
}
