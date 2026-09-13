import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, HardHat, Lock } from 'lucide-react';
import {
  VEREDAS, veredasAbertas, veredasPorFamilia, licoesDaVereda,
  veredasQueFaltamAntes, type Vereda, textoDaOrigem } from '../curriculum/veredas';
import { useVeredas, type AndamentoDeVereda } from '../hooks/useVeredas';
import { useCertifications } from '../hooks/useCertifications';
import { nomeCompleto } from '../types';
import { coresDoProgresso, corDoPercentual } from '../lib/coresDoProgresso';
import Emblema from './ui/Emblema';
import ProgressBar from './ui/ProgressBar';
import TokenNoCartao from './ui/TokenNoCartao';
import type { Certification } from '../types';

/*
 * As veredas no painel.
 *
 * Último bloco de cursos, antes das certificações: a vereda é um percurso como
 * os de cima, e por isso fica junto deles — depois, porque é o extra. Ficou uma
 * vez no pé da página, atrás do mural de atividade, onde ninguém procura curso.
 *
 * ── O mesmo cartão da trilha ─────────────────────────────────────────────
 * Emblema, nome completo, família, barra de progresso, e a contagem embaixo.
 * Não é imitação: são a mesma coisa vista de dois tamanhos, e um desbravador
 * que aprendeu a ler o cartão de uma trilha não deveria ter de aprender a ler
 * outro. Em construção acinzenta e tira o link, como lá.
 *
 * A arte sai da mesma pasta e do mesmo componente das trilhas — os emblemas
 * viraram PNG e passaram a conviver em `public/assets/specialties`. Um código
 * sem arte cai no ícone de reserva do `Emblema`, e não deixa buraco.
 */

function CardDaVereda({ v, andamento, faltam, cert }: {
  v: Vereda;
  andamento?: AndamentoDeVereda;
  /*
    O Token.Web() desta vereda, quando já saiu.

    O cartão não recebia nada disso, então a vereda concluída ficava sem o
    único caminho de um clique até o documento — e sem o selo de certificado no
    emblema, que a trilha tem. Quem terminava via um cartão de 100% igual ao de
    quem ainda não tinha recebido nada, e o certificado só aparecia entrando na
    vereda. A vereda emite o mesmo documento da trilha; o cartão dela mostra a
    mesma coisa.
  */
  cert?: Certification;
  /** O pré-requisito já foi cumprido? Sem ele, o cartão não leva a lugar nenhum. */
  /* As exigidas que ainda faltam. Vazia quer dizer liberada — e é a mesma
     lista que o cartão bloqueado nomeia, em vez de um booleano que obrigaria a
     tela a redescobrir quais são. */
  faltam: Vereda[];
}) {
  const identificacao = (
    <div className="min-w-0">
      <h3 className="text-xl font-bold">{nomeCompleto(v)}</h3>
      <p className="text-sm mt-1" style={{ color: 'var(--color-text-dim)' }}>
        Vereda de {v.familia}
      </p>
    </div>
  );

  /* Anunciada: o clube vê o que vem, acinzentado e sem link. */
  if (v.emConstrucao) {
    return (
      <div className="card p-6 opacity-60" style={{ border: '2px dashed var(--color-border)' }}>
        <div className="flex items-center gap-4 mb-3">
          <Emblema code={v.code} status="bloqueado" />
          {identificacao}
        </div>
        <span className="text-xs px-2 py-1 rounded inline-flex items-center gap-1 mb-2"
          style={{ backgroundColor: 'var(--color-secondary-a08)', color: 'var(--color-secondary)' }}>
          <HardHat className="w-3.5 h-3.5" /> Em construção
        </span>
        <p className="text-sm" style={{ color: 'var(--color-text-faint)' }}>{v.description}</p>
      </div>
    );
  }

  /*
    Bloqueada: o mesmo cartão cinza da anunciada, com outro motivo escrito.

    Tem de ser outro motivo, e não o mesmo: "em construção" diz que ninguém
    pode entrar e não há o que fazer; "conclua a CC001" diz que a chave existe e
    de quem ela é. Um cartão cinza sem dizer qual dos dois é manda a pessoa
    esperar por algo que já está pronto.
  */
  /* Todas as que faltam, e não a primeira: com três exigências, nomear uma só
     manda a pessoa concluir aquela e voltar para descobrir que falta outra. */
  if (faltam.length > 0) {
    return (
      <div className="card p-6 opacity-60" style={{ border: '2px dashed var(--color-border)' }}>
        <div className="flex items-center gap-4 mb-3">
          <Emblema code={v.code} status="bloqueado" />
          {identificacao}
        </div>
        <span className="text-xs px-2 py-1 rounded inline-flex items-center gap-1 mb-2"
          style={{ backgroundColor: 'var(--color-secondary-a08)', color: 'var(--color-secondary)' }}>
          <Lock className="w-3.5 h-3.5" />
          Conclua {faltam.map(o => nomeCompleto(o)).join(' e ')}
        </span>
        <p className="text-sm" style={{ color: 'var(--color-text-faint)' }}>{v.description}</p>
      </div>
    );
  }

  const total = andamento?.total ?? licoesDaVereda(v).length;
  const vencidas = andamento?.vencidas ?? 0;
  const percent = total ? Math.round((vencidas / total) * 100) : 0;
  const cores = coresDoProgresso(percent);

  /* Caixa com dois links irmãos, e não um `<Link>` em volta de tudo: o
     certificado é um destino próprio, e âncora dentro de âncora é inválida.
     Igual ao cartão da trilha, que é o que este cartão sempre imitou. */
  return (
    <div className="card p-6 transition"
      style={{
        borderColor: percent === 100 ? 'var(--color-success-a20)' : 'var(--color-border)',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={ev => (ev.currentTarget.style.borderColor = cores.bordaAoPassar)}
      onMouseLeave={ev => (ev.currentTarget.style.borderColor = percent === 100 ? 'var(--color-success-a20)' : 'var(--color-border)')}>
      <Link to={`/vereda/${v.code}`} className="block">
        <div className="flex items-center gap-4 mb-4">
          <Emblema code={v.code}
            status={cert ? 'certificado' : percent === 100 ? 'concluido' : 'em-andamento'} />
          {identificacao}
        </div>
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span style={{ color: 'var(--color-text-muted)' }}>Progresso</span>
            <span className="font-semibold" style={{ color: corDoPercentual(percent) }}>{percent}%</span>
          </div>
          <ProgressBar percent={percent} color={cores.gradiente} />
        </div>
        <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
          {vencidas} de {total} {total === 1 ? 'lição vencida' : 'lições vencidas'}
          {v.origem && ` · saiu ${textoDaOrigem(v.origem)}`}
        </p>
      </Link>
      {cert && <TokenNoCartao cert={cert} />}
    </div>
  );
}

/*
  Quantos cartões o resumo mostra.

  Quatro, porque a grade tem duas colunas: são duas fileiras cheias, e não uma
  fileira e meia com um buraco do lado direito.
*/
const NO_RESUMO = 4;

export default function SecaoDeVeredas({ userId }: { userId?: string }) {
  const { andamento, concluida } = useVeredas(userId);
  /* O mesmo gancho do painel: a vereda emite Token.Web() pela mesma tabela, e
     `getByCurriculum` acha o dela pelo `code`, que é o que a emissão grava. */
  const { getByCurriculum } = useCertifications(userId);
  /*
    ── Trinta e duas de uma vez é um muro, não um convite ───────────────────

    Eram duas, e listar tudo era listar tudo. Com as seis famílias registradas
    a seção passou a despejar trinta e dois cartões — dezesseis fileiras — em
    cima de quem só queria chegar às certificações logo abaixo. O bloco que
    devia dizer "olha o que mais dá para fazer" virou o bloco que se rola até
    o fim sem ler.

    Então o resumo mostra poucos e o botão abre o resto, como num feed. O que
    o resumo mostra primeiro são as **abertas** — as que dá para percorrer hoje
    —, e só depois as anunciadas, porque um resumo feito só de cartão cinza
    anuncia que aqui não há nada para fazer.

    Aberto, volta a grade agrupada por família: fechado é o convite, aberto é
    o catálogo, e catálogo sem a família não se navega.
  */
  const [tudoAberto, setTudoAberto] = useState(false);
  /* Fechar de baixo deixaria a pessoa boiando no rodapé: o botão está a quase
     cinco mil pixels do começo da seção, e a seção some debaixo dele. */
  const secao = useRef<HTMLElement>(null);

  if (VEREDAS.length === 0) return null;

  const abertas = veredasAbertas();
  const familias = veredasPorFamilia();
  const emConstrucao = VEREDAS.length - abertas.length;
  const resumo = [...abertas, ...VEREDAS.filter(v => v.emConstrucao)].slice(0, NO_RESUMO);
  const temMais = VEREDAS.length > resumo.length;

  const cartao = (v: Vereda) => (
    <CardDaVereda key={v.id} v={v} andamento={andamento.find(a => a.id === v.id)}
      faltam={veredasQueFaltamAntes(v, concluida)} cert={getByCurriculum(v.code)} />
  );

  return (
    <section ref={secao} className="space-y-4">
      <div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-soft)' }}>Veredas</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
          Vereda é o caminho estreito que sai da trilha. Percurso curto, com
          módulos de teoria e laboratórios a vencer, que vale sozinho — não conta
          no percentual de especialidade nenhuma, e rende insígnia.
        </p>
        {/* A contagem sai do registro, e não de um número escrito à mão que
            envelhece na vereda seguinte. */}
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-faint)' }}>
          {abertas.length === 1 ? '1 vereda aberta' : `${abertas.length} veredas abertas`}
          {emConstrucao > 0 && ` e ${emConstrucao} a caminho`}
          {` · ${familias.length} famílias`}
        </p>
      </div>

      {tudoAberto ? (
        familias.map(({ nome, veredas }) => (
          <div key={nome} className="space-y-3">
            <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-muted)' }}>{nome}</h3>
            <div className="grid md:grid-cols-2 gap-6">{veredas.map(cartao)}</div>
          </div>
        ))
      ) : (
        <div className="grid md:grid-cols-2 gap-6">{resumo.map(cartao)}</div>
      )}

      {temMais && (
        <button
          type="button"
          onClick={() => {
            setTudoAberto(a => !a);
            if (tudoAberto) secao.current?.scrollIntoView({ block: 'start' });
          }}
          aria-expanded={tudoAberto}
          className="w-full card p-3 flex items-center justify-center gap-2 text-sm font-semibold transition"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={ev => (ev.currentTarget.style.color = 'var(--color-text-soft)')}
          onMouseLeave={ev => (ev.currentTarget.style.color = 'var(--color-text-muted)')}
        >
          {tudoAberto
            ? <>Ver menos <ChevronUp className="w-4 h-4" /></>
            : <>Ver as {VEREDAS.length} veredas <ChevronDown className="w-4 h-4" /></>}
        </button>
      )}
    </section>
  );
}
