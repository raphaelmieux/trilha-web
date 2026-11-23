import { LICOES_DA_CC_FE006, type DefinicaoDaLicaoDeReact, type LicaoDaCcFe006 } from './metasDaCcFe006';
import { LICOES_REACT_DA_CC_FE007, type LicaoReactDaCcFe007 } from './metasDaCcFe007';

/**
 * Todas as lições que abrem o laboratório de React: as nove da CC-FE006 e as
 * quatro da agenda da CC-FE007.
 *
 * São o mesmo laboratório — o projeto do Vite e a página viva —, e por isso
 * um tipo de lição só. O registro soma os dois, e é ele que a tela, a trava
 * de passo a passo e a conferência no jsdom leem: um nome repetido entre as
 * duas veredas faria a segunda apagar a primeira, e o compilador não deixa,
 * porque as duas uniões não se cruzam.
 */
export type LicaoDeReact = LicaoDaCcFe006 | LicaoReactDaCcFe007;

export const LICOES_DE_REACT: Record<LicaoDeReact, DefinicaoDaLicaoDeReact> = {
  ...LICOES_DA_CC_FE006,
  ...LICOES_REACT_DA_CC_FE007,
};
