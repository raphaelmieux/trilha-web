/**
 * As camadas da moldura, num lugar só.
 *
 * A plataforma (a bolha de tarefas, o caminho de volta, o aviso) fica acima
 * do programa imitado — `LaboratorioEmTelaCheia` diz por que é 600. O menu
 * que a pessoa acabou de abrir fica acima da plataforma: no celular a bolha
 * de tarefas ocupa a metade de baixo da tela, e um menu da célula ou da linha
 * do Explorador aberto ali saía com metade dos itens atrás dela — os de baixo,
 * que são Excluir e Propriedades. Cobrir o menu que alguém acabou de abrir é
 * trocar um defeito por outro, que é a regra que a moldura já tinha escrito
 * para o menu do Scratch.
 *
 * O véu que fecha o menu fica na mesma altura, logo abaixo dele: tocar na
 * bolha com o menu aberto fecha o menu, como tocar em qualquer outro lugar.
 */
export const CAMADA_DA_PLATAFORMA = 600;
export const CAMADA_DO_VEU_DO_MENU = 700;
export const CAMADA_DO_MENU = 701;
