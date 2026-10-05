/**
 * O construtor de formulários da CC-ES012: o módulo 4 e o módulo 5.
 *
 * A janela é a de `construtorDeFormularios.tsx`, a mesma da CC-ES008. O que
 * este arquivo decide é do **exercício**: que gestos a lição oferece e de que
 * formulário se parte.
 *
 * ── Onde o módulo 5 começa e onde ele acaba ──────────────────────────────
 * Ele parte do construtor — é onde as respostas chegam — e termina na
 * planilha, que é onde se vê se a importação funcionou. É o arranjo da
 * CC-ES008, escrito lá: onde a lição **começa** e onde ela **acaba** não são a
 * mesma coisa, e por isso a travessia mora no painel de tarefas, onde as
 * coisas da plataforma moram.
 */

import { useState } from 'react';
import { Download, Scissors, Palette, Hash, Table2 } from 'lucide-react';
import {
  CartaoDeCabecalho, CartaoDoConstrutor, CorpoDoConstrutor, IconeDoTipo,
  ListaDeOpcoes, PeDoCartao, SeletorDeTipo, TopoDoConstrutor,
  type AbaDoConstrutor,
} from './construtorDeFormularios';
import { NOME_DO_TIPO, type Campo } from './formulario';
import { comFormularioArrumado } from './metasDaCcEs012';
import {
  NOME_DA_ABA_DE_RESPOSTAS, importarRespostas, respostasEmLinhas,
  respostasQueFaltam,
} from './projetoDocumental';
import { planilhaPorNome } from './planilha';
import type { PropsDaSuperficie } from './projetoNaPlataforma';

function CartaoDoCampo({ campo, ativo, aoAtivar, aoTrocarTipo }: {
  campo: Campo; ativo: boolean; aoAtivar: () => void;
  aoTrocarTipo?: (tipo: Campo['tipo']) => void;
}) {
  const [tipoAberto, setTipoAberto] = useState(false);
  return (
    <CartaoDoConstrutor ativo={ativo} aoAtivar={aoAtivar}>
      <div className="fb-linha-tipo">
        <span className="fb-rotulo">{campo.rotulo}</span>
        {aoTrocarTipo
          ? (
            <SeletorDeTipo
              tipo={campo.tipo} aberto={tipoAberto}
              aoAbrir={() => setTipoAberto(a => !a)}
              aoEscolher={tipo => { aoTrocarTipo(tipo); setTipoAberto(false); }}
            />
          )
          : (
            <span className="fb-tipo" aria-label={`Tipo: ${NOME_DO_TIPO[campo.tipo]}`}>
              <IconeDoTipo tipo={campo.tipo} /> {NOME_DO_TIPO[campo.tipo]}
            </span>
          )}
      </div>
      {campo.opcoes && <ListaDeOpcoes tipo={campo.tipo} opcoes={campo.opcoes} />}
      <PeDoCartao obrigatorio={campo.obrigatorio} />
    </CartaoDoConstrutor>
  );
}

/* ── Módulo 4: o formulário desenhado para a planilha ─────────────────────── */

export function FormularioDaFeira({ ctx, mudar, avisar }: PropsDaSuperficie) {
  const [aba, setAba] = useState<AbaDoConstrutor>('perguntas');
  const [ativo, setAtivo] = useState<string | null>(null);
  const f = ctx.p.formulario;

  const trocarTipo = (id: string, tipo: Campo['tipo']) => {
    mudar(c => ({
      ...c,
      p: {
        ...c.p,
        formulario: {
          ...c.p.formulario,
          campos: c.p.formulario.campos.map(x => (x.id === id ? { ...x, tipo } : x)),
        },
      },
    }));
    avisar(tipo === 'numero'
      ? 'A quantidade passou a ser número. A planilha vai somar a coluna.'
      : `O campo passou para ${NOME_DO_TIPO[tipo]}.`);
  };

  return (
    <div className="fb-janela">
      <TopoDoConstrutor
        nome={f.titulo} aba={aba} aoTrocarAba={setAba}
        respostas={f.respostas.length}
      />

      <CorpoDoConstrutor>
        <div className="fb-barra-respostas">
          <button
            type="button" className="fb-bt"
            onClick={() => {
              mudar(c => ({ ...c, p: { ...c.p, formulario: comFormularioArrumado(c.p.formulario) } }));
              avisar('A pergunta virou duas, a quantidade virou número e o tema entrou. As seis respostas chegaram.');
            }}
          >
            <Scissors className="w-3.5 h-3.5" /> Separar unidade e especialidade
          </button>
          <button
            type="button" className="fb-bt"
            onClick={() => {
              const quantos = f.campos.find(x => x.rotulo.startsWith('Quantos'));
              if (!quantos) { avisar('Não há campo de quantidade para trocar.'); return; }
              trocarTipo(quantos.id, 'numero');
            }}
          >
            <Hash className="w-3.5 h-3.5" /> Quantidade como número
          </button>
          <button
            type="button" className="fb-bt"
            onClick={() => {
              mudar(c => ({
                ...c,
                p: {
                  ...c.p,
                  formulario: {
                    ...c.p.formulario,
                    aparencia: {
                      fonte: c.p.identidade.fonteDosTitulos, cor: c.p.identidade.cor,
                    },
                  },
                },
              }));
              avisar('O formulário vestiu a identidade do conjunto.');
            }}
          >
            <Palette className="w-3.5 h-3.5" /> Personalizar tema
          </button>
        </div>

        <CartaoDeCabecalho titulo={f.titulo} descricao={f.descricao} />
        {f.campos.map(campo => (
          <CartaoDoCampo
            key={campo.id} campo={campo} ativo={ativo === campo.id}
            aoAtivar={() => setAtivo(campo.id)}
            aoTrocarTipo={tipo => trocarTipo(campo.id, tipo)}
          />
        ))}
      </CorpoDoConstrutor>
    </div>
  );
}

/* ── Módulo 5: do formulário para a planilha ──────────────────────────────── */

export function ImportacaoDasRespostas({ ctx, mudar, avisar }: PropsDaSuperficie) {
  const [aba, setAba] = useState<AbaDoConstrutor>('respostas');
  const f = ctx.p.formulario;
  const linhas = respostasEmLinhas(f);
  const faltam = respostasQueFaltam(ctx.p);
  const naAba = planilhaPorNome(ctx.p.controle, NOME_DA_ABA_DE_RESPOSTAS);

  return (
    <div className="fb-janela">
      <TopoDoConstrutor
        nome={f.titulo} aba={aba} aoTrocarAba={setAba}
        respostas={f.respostas.length}
      />

      <CorpoDoConstrutor>
        <div className="fb-barra-respostas">
          <button
            type="button" className="fb-bt"
            onClick={() => {
              mudar(c => ({ ...c, p: importarRespostas(c.p) }));
              avisar('As respostas foram para a aba Respostas, uma linha por envio.');
            }}
          >
            <Download className="w-3.5 h-3.5" /> Importar para a planilha
          </button>
        </div>

        <div className="fb-tabela-caixa">
          <table className="fb-tabela">
            <thead>
              <tr>{linhas[0]?.map(h => <th key={h} scope="col">{h}</th>)}</tr>
            </thead>
            <tbody>
              {linhas.slice(1).map((l, i) => (
                <tr key={f.respostas[i]?.id ?? i}>
                  {l.map((v, j) => <td key={j}>{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="fb-aviso">
          <Table2 className="w-3.5 h-3.5 inline mr-1" />
          {faltam === 0
            ? `A aba ${NOME_DA_ABA_DE_RESPOSTAS} tem as ${f.respostas.length} respostas.`
            : `${faltam === 1 ? 'Falta 1 resposta' : `Faltam ${faltam} respostas`} na aba ${NOME_DA_ABA_DE_RESPOSTAS}.`}
          {naAba && faltam === 0 && ' As fórmulas da aba Controle podem ler daqui.'}
        </p>
      </CorpoDoConstrutor>
    </div>
  );
}
