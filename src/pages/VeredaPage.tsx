import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CircleAlert, Play, Lock, HardHat } from 'lucide-react';
import { useFecharAoNavegar } from '../hooks/useFecharAoNavegar';
import { useAuth } from '../context/AuthContext';
import { NOME_DO_TIPO, nomeCompleto } from '../types';
import {
  getVereda, licoesDaVereda, type LicaoDeVereda, textoDaOrigem } from '../curriculum/veredas';
import { licaoVencida, registrarLicaoVencida, percursoVazio } from '../lib/veredas';
import { useVeredas } from '../hooks/useVeredas';
import { useCertifications } from '../hooks/useCertifications';
import TeoriaDaVereda from '../components/TeoriaDaVereda';
import TokenDaVereda from '../components/TokenDaVereda';
import LaboratorioDeVereda from '../components/LaboratorioDeVereda';
import LaboratorioDeBlocos from '../components/LaboratorioDeBlocos';
import LaboratorioDeScratch from '../components/LaboratorioDeScratch';
import LaboratorioDeAmbiente from '../components/LaboratorioDeAmbiente';
import LaboratorioDePython from '../components/LaboratorioDePython';
import RedacaoGuiadaLab from '../labs/RedacaoGuiadaLab';
import ProgressBar from '../components/ui/ProgressBar';
import MarcaDaLicao from '../components/ui/MarcaDaLicao';
import Emblema from '../components/ui/Emblema';
import BotaoDeRequisitos from '../components/ui/BotaoDeRequisitos';

/*
 * A tela de uma vereda.
 *
 * Tem a forma da tela de uma trilha: módulos em ordem, cada um com as lições
 * dentro, e o progresso em cima. É de propósito — o desbravador já sabe
 * percorrer uma trilha aqui, e inventar uma segunda gramática de percurso só
 * para o material curto seria pedir que ele aprendesse duas.
 *
 * O que ela não tem é o peso: nenhum percentual de especialidade se move, e
 * nada disto vira requisito. A lição aberta ocupa a tela inteira — teoria no
 * leitor, laboratório no editor — e voltar recarrega o percurso, que é como a
 * lista se repinta sem recarregar a página.
 */
export default function VeredaPage() {
  const { code } = useParams();
  const { profile } = useAuth();
  const vereda = getVereda(code);
  const { percursoDe, recarregar, carregando } = useVeredas(profile?.id);
  const { getByCurriculum, refresh: recarregarCertificados } = useCertifications(profile?.id);
  const [aberta, setAberta] = useState<string | null>(null);

  const fechar = async () => { setAberta(null); await recarregar(); };

  /*
    Sair da lição pelo menu.

    "Vereda Atual" aponta para esta mesma página — a lição da vereda não tem
    endereço próprio, abre aqui dentro por estado. Sem isto o clique não fazia
    nada: o React Router chegava ao endereço em que já estava e não havia rota a
    trocar. Ver `useFecharAoNavegar`.
  */
  useFecharAoNavegar(() => { if (aberta !== null) void fechar(); });

  if (!vereda) {
    return (
      <div className="card p-8 text-center">
        <CircleAlert className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-faint)' }} />
        <h1 className="text-xl font-bold mb-2">Vereda não encontrada</h1>
        <p className="mb-5" style={{ color: 'var(--color-text-muted)' }}>
          O endereço aponta para uma vereda que não existe.
        </p>
        <Link to="/" className="btn-primary">Voltar ao Início</Link>
      </div>
    );
  }

  /*
    A vereda anunciada não abre, nem pelo endereço.

    O cartão do painel não leva aqui — ele é cinza e sem link —, mas o endereço
    é adivinhável, e uma vereda sem lição abria uma página de progresso 0 de 0,
    sem nada para fazer. É a mesma guarda que a trilha já tinha; a vereda ficou
    sem ela quando a tela nasceu, e com trinta e uma anunciadas isso passou a
    ser trinta e uma páginas vazias acessíveis a quem digitar o código.
  */
  if (vereda.emConstrucao) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <HardHat className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-secondary)' }} />
        <h1 className="text-xl font-bold mb-2">Esta vereda ainda está em construção</h1>
        <p style={{ color: 'var(--color-text-dim)' }}>
          Estamos preparando as lições. Ela abre no painel assim que ficar pronta.
        </p>
        <div className="flex justify-center mt-4">
          <BotaoDeRequisitos percurso={vereda} />
        </div>
        <Link to="/" className="btn-primary mt-6 inline-flex">Voltar ao Início</Link>
      </div>
    );
  }

  const feito = percursoDe(vereda.id);
  const licoes = licoesDaVereda(vereda);
  const vencidas = licoes.filter(l => licaoVencida(l, feito)).length;
  const percentual = licoes.length ? Math.round((vencidas / licoes.length) * 100) : 0;

  const licaoAberta = licoes.find(l => l.id === aberta);

  /* Uma gravação só para os dois tipos: a lição diz qual evento é dela. */
  const vencer = async () => {
    if (!profile?.id || !licaoAberta) return;
    await registrarLicaoVencida(profile.id, vereda, licaoAberta, feito ?? percursoVazio());
  };

  if (licaoAberta?.tipo === 'teoria' && profile?.id) {
    return <TeoriaDaVereda vereda={vereda} licao={licaoAberta} aoVencer={vencer} aoSair={fechar} />;
  }

  /*
    A redação é o laboratório de redação guiada da plataforma, o mesmo da AP034
    e da AP041 — e não uma tela nova. `aoVencer` é o que muda: a vereda grava um
    evento de percurso, e não requisito nem matrícula, que ela não tem.

    `roteiro` é a chave em ROTEIROS, e vai no lugar do código da trilha porque é
    por ela que o laboratório acha as perguntas — e é a mesma chave que o
    servidor usa para achar os fatos.
  */
  if (licaoAberta?.tipo === 'redacao' && profile?.id) {
    return (
      <RedacaoGuiadaLab
        specialtyCode={licaoAberta.roteiro}
        lessonCode={`${vereda.id}:${licaoAberta.id}`}
        lessonTitle={licaoAberta.titulo}
        requirementCodes={[]}
        userId={profile.id}
        aoVencer={async () => { await vencer(); await fechar(); }}
      />
    );
  }

  /*
    O computador simulado não passa pelo editor.

    Ele não tem arquivo nem linguagem: o que se confere é um computador — o que
    foi baixado, o que foi instalado, com que nome o arquivo foi salvo e se o
    programa rodou pelo prompt. Por isso é um tipo de lição, e não uma linguagem
    a mais do laboratório de texto.
  */
  if (licaoAberta?.tipo === 'ambiente' && profile?.id) {
    return (
      <LaboratorioDeAmbiente vereda={vereda} licao={licaoAberta}
        aoVencer={vencer} aoSair={fechar} />
    );
  }

  if (licaoAberta?.tipo === 'laboratorio' && profile?.id) {
    /*
      Blocos não é uma linguagem a mais do editor de código — é outro editor.

      HTML e CSS são texto, e por isso dividem a mesma IDE: muda o realce e o
      validador, o resto é o mesmo. Blocos não tem texto para realçar nem
      arquivo para escrever; tem paleta, palco e árvore. Enfiá-lo no editor de
      código pediria um `<textarea>` que ninguém digita, e a lateral de
      arquivos de um projeto sem arquivo.
    */
    /*
      Scratch é o Scratch de verdade, embutido.

      Foi a decisão que trocou a licença da plataforma inteira para AGPL: o
      editor do MIT é AGPL, e embutir código AGPL contamina o que o embute. A
      alternativa era um `<iframe>` para o site deles — e ali o editor é caixa
      fechada, sem `toJSON()`, o que faria a lição cair em "clicou em salvar,
      então passou". O laboratório existe para conferir o que foi montado.

      `LaboratorioDeBlocos` continua no repositório como reserva. Ele não é
      código morto por descuido: é o que volta se o Scratch embutido se mostrar
      pesado demais para o computador do clube, e a lição não precisa mudar
      para trocar de um para o outro — os dois cobram os mesmos dez ids.
    */
    if (licaoAberta.linguagem === 'scratch') {
      return (
        <LaboratorioDeScratch vereda={vereda} licao={licaoAberta} userId={profile.id}
          aoVencer={vencer} aoSair={fechar} />
      );
    }
    if (licaoAberta.linguagem === 'blocos') {
      return (
        <LaboratorioDeBlocos vereda={vereda} licao={licaoAberta} userId={profile.id}
          aoVencer={vencer} aoSair={fechar} />
      );
    }
    /*
      Python usa o mesmo arranjo de editor, e mesmo assim é outra tela.

      Em HTML e CSS a verificação é síncrona: o texto muda e a lista se
      repinta. Saber se um programa Python roda exige rodá-lo — leva tempo,
      acontece noutra thread e pode não terminar. A lista passa a mostrar a
      última execução, e não o texto de agora, e isso muda a tela toda.
    */
    if (licaoAberta.linguagem === 'python') {
      return (
        <LaboratorioDePython vereda={vereda} licao={licaoAberta} userId={profile.id}
          aoVencer={vencer} aoSair={fechar} />
      );
    }
    return (
      <LaboratorioDeVereda vereda={vereda} licao={licaoAberta} userId={profile.id}
        aoVencer={vencer} aoSair={fechar} />
    );
  }

  const Licao = ({ licao, ordem }: { licao: LicaoDeVereda; ordem: number }) => {
    const pronta = licaoVencida(licao, feito);
    /* Sem conta, a vereda se lê mas não se grava — e um laboratório que não
       registra nada não é lição, é rascunho. Melhor dizer isso do que deixar
       a pessoa fazer tudo e descobrir depois. */
    const semConta = !profile?.id;

    return (
      <button
        onClick={() => !semConta && setAberta(licao.id)}
        disabled={semConta}
        className="w-full text-left p-4 rounded-lg flex items-start gap-3 transition disabled:opacity-60"
        style={{
          backgroundColor: 'var(--color-bg-input)',
          border: `1px solid ${pronta ? 'var(--color-success-a40, var(--color-border))' : 'var(--color-border)'}`,
        }}>
        {/* A mesma marca da trilha: o ícone diz o tipo, o disco diz o estado. */}
        <span className="mt-0.5">
          <MarcaDaLicao tipo={licao.tipo === 'teoria' ? 'theory' : 'lab'} feita={pronta} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono" style={{ color: 'var(--color-text-faint)' }}>
              {ordem}
            </span>
            <span className="font-semibold">{licao.titulo}</span>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: 'var(--color-bg-hover)',
                color: 'var(--color-text-muted)',
              }}>
              {NOME_DO_TIPO[licao.tipo === 'teoria' ? 'theory' : 'lab']}
            </span>
          </span>
          <span className="block text-sm mt-1" style={{ color: 'var(--color-text-dim)' }}>
            {licao.resumo}
          </span>
        </span>
        {semConta
          ? <Lock className="w-4 h-4 flex-none mt-1" style={{ color: 'var(--color-text-faint)' }} />
          : <Play className="w-4 h-4 flex-none mt-1" style={{ color: 'var(--color-text-faint)' }} />}
      </button>
    );
  };

  let ordem = 0;

  return (
    <div className="space-y-6">
      {/*
        O emblema encabeça a página, como na trilha.

        Ele não estava aqui, e a vereda abria só com o nome — enquanto o cartão
        que trouxe a pessoa até aqui mostrava a medalha. O disco da vereda e a
        elipse da trilha saem do mesmo `Emblema`, que lê a forma da própria arte:
        o que se reencontra ao entrar é o que se viu no painel.

        O caminho de volta sobe para a linha de cima: com a medalha ao lado do
        título, "Início" no meio da mesma linha empurrava o nome para longe dela.
      */}
      <div className="space-y-3">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm"
          style={{ color: 'var(--color-text-muted)' }}>
          <ArrowLeft className="w-4 h-4" /> Início
        </Link>
        <div className="flex items-center gap-4">
          <Emblema
            code={vereda.code}
            status={
              getByCurriculum(vereda.code) ? 'certificado'
                : licoes.length > 0 && vencidas === licoes.length ? 'concluido'
                : 'em-andamento'
            }
            size={88}
          />
          <div className="min-w-0 space-y-2">
            <div>
              <h1 className="text-2xl font-bold">{nomeCompleto(vereda)}</h1>
              <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>{vereda.description}</p>
            </div>
            <BotaoDeRequisitos percurso={vereda} />
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span style={{ color: 'var(--color-text-muted)' }}>
            Progresso
            <span className="ml-2" style={{ color: 'var(--color-text-dim)' }}>
              · {vencidas} de {licoes.length} lições
            </span>
          </span>
          <span className="font-semibold"
            style={{ color: percentual === 100 ? 'var(--color-success)' : 'var(--color-primary-hover)' }}>
            {carregando ? '—' : `${percentual}%`}
          </span>
        </div>
        <ProgressBar percent={percentual} />
        {/* Dito na tela, e não só no relatório: quem percorre uma vereda
            precisa saber, antes de começar, que ela não move a trilha. */}
        <p className="text-xs mt-2" style={{ color: 'var(--color-text-faint)' }}>
          {vereda.origem && `Saiu ${textoDaOrigem(vereda.origem)}. `}Não conta no
          percentual de nenhuma especialidade — é bônus, e rende insígnia ao terminar.
        </p>
      </div>

      {/* Concluída: o certificado. Depois do progresso e antes dos módulos, que
          é onde a conquista fica à vista sem empurrar a lista para baixo. */}
      {profile?.id && licoes.length > 0 && vencidas === licoes.length && (
        <TokenDaVereda
          vereda={vereda}
          userId={profile.id}
          certificado={getByCurriculum(vereda.code)}
          aoEmitir={recarregarCertificados}
        />
      )}

      {vereda.modulos.map(m => (
        <section key={m.id} className="card p-5 space-y-3">
          <div>
            <h2 className="font-bold">{m.titulo}</h2>
            <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>{m.resumo}</p>
          </div>
          <div className="space-y-2">
            {m.licoes.map(l => { ordem += 1; return <Licao key={l.id} licao={l} ordem={ordem} />; })}
          </div>
        </section>
      ))}
    </div>
  );
}
