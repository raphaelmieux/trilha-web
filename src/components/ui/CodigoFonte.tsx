import { ExternalLink } from 'lucide-react';
import LinkExterno from './LinkExterno';

/**
 * O link para o código-fonte, no rodapé de toda tela.
 *
 * Não é enfeite nem vaidade: é a obrigação central da AGPL-3.0 num aplicativo
 * servido pela rede. A seção 13 diz que quem interage com o programa por uma
 * rede precisa ter como obter a fonte correspondente, e o próprio texto da
 * licença sugere exatamente isto — "se o seu programa é uma aplicação web, a
 * interface dela pode mostrar um link 'Source'".
 *
 * A plataforma passou a ser AGPL porque embute o Scratch, que é AGPL. Antes
 * disso ela era MIT, e este link não existia porque nada o exigia.
 *
 * Fica em `App`, e não em cada página, para que não haja tela sem ele — uma
 * página que esquecesse o link seria uma tela servida sem cumprir a licença.
 */
const REPOSITORIO = 'https://github.com/raphaelmieux/trilha-web';

export default function CodigoFonte() {
  return (
    <div className="no-print text-center py-6 px-4">
      <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
        Trilha.Web() é software livre, sob a licença{' '}
        <LinkExterno href={`${REPOSITORIO}/blob/main/LICENSE`} className="underline">
          AGPL-3.0
        </LinkExterno>
        .{' '}
        <LinkExterno href={REPOSITORIO} className="underline inline-flex items-center gap-1">
          Código-fonte <ExternalLink className="w-3 h-3" />
        </LinkExterno>
      </p>
    </div>
  );
}
