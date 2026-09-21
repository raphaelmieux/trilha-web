import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC-ES005 Contas e Segurança Digital.
 *
 * ── O que elas medem ──────────────────────────────────────────────────────
 * A definição vale uma vez. Depois dela vêm consequência, discriminação e
 * diagnóstico — e nesta vereda o diagnóstico carrega quase tudo, porque a
 * matéria inteira é feita de telas que parecem certas: a que diz "ativada" sem
 * códigos guardados, a que diz "nada encontrado" e não é atestado, a conta
 * recuperada com três portas abertas, o cofre dizendo que alguém não tem
 * acesso a uma senha que essa pessoa decorou.
 *
 * ── E há um segundo eixo, que é o do falso positivo ───────────────────────
 * Metade do estrago que uma lição de segurança causa é ensinar a desconfiar de
 * tudo — de todo prazo, de todo link, de toda mensagem. Quem aprende isso
 * cansa em duas semanas e volta a clicar em tudo. Então várias questões daqui
 * medem o contrário: reconhecer o que **não** é indício.
 *
 * Toda alternativa errada diz por que está errada, no campo porque, e a certa
 * não carrega motivo nenhum. E nada de crase nem de asterisco: a questão vai
 * para o QuestionRenderer, que imprime texto puro, e a marcação sairia na tela
 * como marcação.
 */

export const QUESTOES_DE_CONTAS: Record<string, Question[]> = {
  /* ──────────────────────────────────────────────────────────────────────
     Módulo 1 — Senha forte, e o cofre
     ────────────────────────────────────────────────────────────────────── */
  'm1-teoria': [
    {
      id: 'ES5-M1-Q1', type: 'multiple_choice',
      prompt: 'O que mais aumenta o tempo que uma senha leva para ser adivinhada?',
      data: { options: [
        { id: 'a', text: 'O comprimento dela.', correct: true },
        { id: 'b', text: 'A quantidade de símbolos que ela tem.', porque: 'Símbolo aumenta o tamanho do alfabeto em alguns caracteres. Quatro letras a mais multiplicam o trabalho por vinte e seis quatro vezes.' },
        { id: 'c', text: 'Trocar letras por números parecidos, como a por 4.', porque: 'É a primeira coisa que um ataque de dicionário desfaz, antes de tentar qualquer outra combinação.' },
        { id: 'd', text: 'Começar com letra maiúscula.', porque: 'Quase toda senha do mundo começa com maiúscula, justamente porque o formulário pede. Isso não acrescenta dificuldade nenhuma.' },
      ]},
      explanation: 'A conta é o alfabeto elevado ao comprimento, e quem manda é o expoente. É por isso que uma frase vence uma sigla com símbolos.',
    },
    {
      id: 'ES5-M1-Q2', type: 'scenario',
      prompt: 'Alguém cadastra a senha Senha@123 num serviço. O formulário aceita e diz que ela é forte. O que acontece na prática?',
      data: { scenarios: [
        { id: 'a', text: 'Ela está nas listas públicas de senhas vazadas.', correct: true },
        { id: 'b', text: 'Ela resiste bem, porque tem as quatro classes de caractere.', porque: 'O medidor do formulário conta classes. Quem ataca não adivinha caractere a caractere: tenta primeiro as senhas das listas, e ela está lá.' },
        { id: 'c', text: 'Ela é fraca porque tem menos de doze caracteres.', porque: 'Ela tem nove, mas não é o comprimento que a derruba. Uma senha inédita de nove caracteres aguenta muito mais do que esta.' },
        { id: 'd', text: 'O serviço vai recusá-la na próxima vez que ela for usada.', porque: 'Nenhum serviço faz isso sozinho. Ela continua valendo até alguém trocá-la.' },
      ]},
      explanation: 'Ninguém a adivinha: alguém a tenta. E tentar as mil senhas mais comuns leva segundos.',
    },
    {
      id: 'ES5-M1-Q3', type: 'multiple_choice',
      prompt: 'Por que reutilizar a mesma senha em vários serviços é falha mais grave do que usar senha curta em um só?',
      data: { options: [
        { id: 'a', text: 'Porque basta um dos serviços vazar para as outras caírem.', correct: true },
        { id: 'b', text: 'Porque uma senha repetida é mais fácil de adivinhar.', porque: 'Repetir não muda em nada a dificuldade de adivinhá-la. A senha repetida pode até ser longa e inédita.' },
        { id: 'c', text: 'Porque os serviços conseguem ver que a senha é a mesma.', porque: 'Eles não conseguem: cada serviço guarda a senha embaralhada e não fala com os outros. O problema aparece depois de um vazamento.' },
        { id: 'd', text: 'Porque senha repetida expira mais rápido.', porque: 'Senha não expira sozinha em lugar nenhum. Ela vale até alguém trocá-la.' },
      ]},
      explanation: 'A curta depende de alguém escolher você. A repetida depende de alguém escolher qualquer um dos serviços em que ela está.',
    },
    {
      id: 'ES5-M1-Q4', type: 'true_false',
      prompt: 'Depois de um vazamento, trocar a senha apenas no serviço que vazou resolve o problema.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'As outras contas que usavam aquela mesma senha continuam abrindo com ela, e é nelas que quem baixou a lista vai tentar.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Quem tem a lista não tenta só onde ela vazou: tenta o par de e-mail e senha em todo lugar.',
    },
    {
      id: 'ES5-M1-Q5', type: 'multiple_choice',
      prompt: 'Qual é a razão de um gerenciador de senhas permitir senhas impossíveis de decorar?',
      data: { options: [
        { id: 'a', text: 'Quem as digita é o programa, e não você.', correct: true },
        { id: 'b', text: 'Ele troca as senhas sozinho de tempos em tempos.', porque: 'Ele guarda e preenche. Trocar continua sendo um gesto de quem usa, feito quando é preciso.' },
        { id: 'c', text: 'As senhas dele são aceitas por todos os serviços sem cadastro.', porque: 'Não há nada disso: a senha gerada é cadastrada no serviço como qualquer outra.' },
        { id: 'd', text: 'Ele esconde a senha do próprio serviço onde ela é usada.', porque: 'O serviço precisa recebê-la para conferir. O que o cofre esconde é a senha de quem olha a sua tela.' },
      ]},
      explanation: 'Você decora uma frase longa, a do cofre. As outras quarenta podem ser vinte caracteres sem sentido nenhum.',
    },
    {
      id: 'ES5-M1-Q6', type: 'scenario',
      prompt: 'O clube tem seis contas: quatro com a mesma senha longa, uma com Senha@123 e uma com uma senha curta e única. Qual delas, se vazar, causa o maior estrago?',
      data: { scenarios: [
        { id: 'a', text: 'Qualquer uma das quatro que dividem a senha.', correct: true },
        { id: 'b', text: 'A que usa Senha@123, porque é a mais fraca de todas.', porque: 'Ela é a mais fácil de cair, e leva uma conta só. Gravidade aqui não é só probabilidade: é quanto vai junto.' },
        { id: 'c', text: 'A da senha curta e única, porque senha curta cai rápido.', porque: 'Ela cai rápido e derruba uma conta. É exatamente o caso com que o requisito 3 manda comparar a repetida.' },
        { id: 'd', text: 'Todas causam o mesmo estrago, porque toda conta vale o mesmo.', porque: 'O estrago não depende só do valor da conta: depende de quantas outras caem junto com ela.' },
      ]},
      explanation: 'As três contas que caem junto não foram atacadas e não tinham defeito nenhum. Foi a repetição que as entregou.',
    },
    {
      id: 'ES5-M1-Q7', type: 'true_false',
      prompt: 'Uma frase longa só é boa senha se as palavras dela não forem uma frase conhecida.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Frases conhecidas — versos, letras de música, ditados — estão nas listas inteiras, e são tentadas como uma senha só.' },
      ]},
      explanation: 'O que dá força é o comprimento junto da imprevisibilidade. Uma frase famosa tem o comprimento e não tem a segunda metade.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 2 — Verificação em duas etapas
     ────────────────────────────────────────────────────────────────────── */
  'm2-teoria': [
    {
      id: 'ES5-M2-Q1', type: 'multiple_choice',
      prompt: 'O que a verificação em duas etapas acrescenta à senha?',
      data: { options: [
        { id: 'a', text: 'Algo que você tem, além de algo que você sabe.', correct: true },
        { id: 'b', text: 'Uma segunda senha, guardada no mesmo lugar da primeira.', porque: 'Seriam duas coisas da mesma natureza, e quem descobrisse uma teria caminho para a outra. A força vem de serem naturezas diferentes.' },
        { id: 'c', text: 'Uma troca automática da senha a cada trinta dias.', porque: 'Isso é outra prática, e uma que caiu em desuso: trocar por obrigação faz as pessoas escolherem senhas piores.' },
        { id: 'd', text: 'Um aviso por e-mail sempre que alguém entrar.', porque: 'O aviso existe em muitos serviços e é útil, mas ele conta depois. A segunda etapa impede antes.' },
      ]},
      explanation: 'Quem descobre a senha do outro lado do país ainda precisa do seu telefone na mão.',
    },
    {
      id: 'ES5-M2-Q2', type: 'scenario',
      prompt: 'Alguém liga a verificação em duas etapas, vê a caixa dos códigos de reserva e fecha sem baixá-los. O que a tela mostra depois?',
      data: { scenarios: [
        { id: 'a', text: 'Que a verificação está ativada, sem aviso nenhum.', correct: true },
        { id: 'b', text: 'Um alerta dizendo que a configuração ficou incompleta.', porque: 'Ela não ficou incompleta: a verificação está mesmo ativada. O que falta é o caminho de volta, e nada na tela fala disso.' },
        { id: 'c', text: 'A caixa dos códigos aparece de novo no próximo acesso.', porque: 'Eles são mostrados uma vez. O serviço não os guarda em texto para poder mostrá-los outra vez.' },
        { id: 'd', text: 'A verificação volta a ficar desligada até os códigos serem baixados.', porque: 'Ela continua ligada. Seria mais seguro se voltasse, e nenhum serviço faz isso.' },
      ]},
      explanation: 'A conta fica protegida e sem caminho de volta. O problema aparece no dia em que o telefone se perde.',
    },
    {
      id: 'ES5-M2-Q3', type: 'multiple_choice',
      prompt: 'Contra o que o código por mensagem de texto não protege?',
      data: { options: [
        { id: 'a', text: 'Contra quem passa o seu número para outro chip.', correct: true },
        { id: 'b', text: 'Contra quem descobriu a sua senha.', porque: 'Contra isso ele protege, e é para isso que serve: com a senha na mão, ainda falta o código que chega no seu número.' },
        { id: 'c', text: 'Contra quem tenta adivinhar a senha por força bruta.', porque: 'Também protege: adivinhar a senha não dá acesso ao código.' },
        { id: 'd', text: 'Contra senhas que apareceram em vazamentos públicos.', porque: 'Protege igualmente. A senha vazada deixa de bastar assim que existe uma segunda etapa.' },
      ]},
      explanation: 'A troca de chip é um golpe comum e barato, e é por isso que o SMS é o mais oferecido e o mais fraco dos três.',
    },
    {
      id: 'ES5-M2-Q4', type: 'multiple_choice',
      prompt: 'A conta do clube tem senha forte e duas etapas ligadas, e o e-mail de recuperação é a caixa pessoal da secretária. Qual é o problema?',
      data: { options: [
        { id: 'a', text: 'Quem entra na caixa pessoal dela recupera a conta do clube.', correct: true },
        { id: 'b', text: 'Nenhum: a recuperação só é usada se alguém esquecer a senha.', porque: 'Quem invade não precisa esquecer nada: ele usa "esqueci minha senha" de propósito, justamente porque é o caminho mais fácil.' },
        { id: 'c', text: 'O serviço vai parar de enviar avisos para a conta do clube.', porque: 'A recuperação não muda para onde vão os avisos comuns. Ela só recebe o código de redefinir a senha.' },
        { id: 'd', text: 'A secretária passa a ver todas as mensagens da conta do clube.', porque: 'Ser endereço de recuperação não dá acesso às mensagens. O problema é poder tomar a conta, e não ler o que chega nela.' },
      ]},
      explanation: 'A recuperação é a conta. Trancar a porta e deixar a chave com quem está de saída não protege nada.',
    },
    {
      id: 'ES5-M2-Q5', type: 'true_false',
      prompt: 'Guardar os códigos de reserva num arquivo dentro da mesma nuvem que a conta protege é um bom lugar.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Essa nuvem também pede a segunda etapa. Sem o telefone, você não abre o arquivo que existe justamente para o caso de não ter o telefone.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'É a versão digital de trancar a chave dentro de casa. Impressos numa pasta, ou dentro do cofre de senhas, funcionam.',
    },
    {
      id: 'ES5-M2-Q6', type: 'scenario',
      prompt: 'Numa conta compartilhada pela diretoria, qual é o inconveniente de escolher o código por mensagem de texto?',
      data: { scenarios: [
        { id: 'a', text: 'O código vai para o número de uma pessoa só.', correct: true },
        { id: 'b', text: 'O SMS custa caro para o serviço e ele pode cobrar do clube.', porque: 'O custo é do serviço e ninguém repassa isso. O inconveniente é de quem precisa entrar quando a pessoa do número não está.' },
        { id: 'c', text: 'O SMS só funciona em um aparelho por vez.', porque: 'Isso vale para qualquer método, e não é o ponto: o ponto é que o número pertence a alguém que um dia sai do clube.' },
        { id: 'd', text: 'A mensagem de texto não chega quando não há internet.', porque: 'SMS não depende de internet — chega com sinal de celular. É até uma vantagem dele.' },
      ]},
      explanation: 'O aplicativo autenticador pode ser instalado em mais de um aparelho da diretoria, e não amarra a conta a um número.',
    },
    {
      id: 'ES5-M2-Q7', type: 'multiple_choice',
      prompt: 'Qual método protege contra alguém que monta uma página igualzinha à verdadeira?',
      data: { options: [
        { id: 'a', text: 'A chave de segurança física.', correct: true },
        { id: 'b', text: 'O código por mensagem de texto.', porque: 'A pessoa digita o código na página falsa, e quem a montou o usa na página verdadeira em segundos.' },
        { id: 'c', text: 'O código de um aplicativo autenticador.', porque: 'Mesmo caso: o código é válido por trinta segundos, e trinta segundos bastam para quem está do outro lado.' },
        { id: 'd', text: 'Qualquer um dos três, desde que a senha seja forte.', porque: 'A força da senha não entra nesta conta: na página falsa a pessoa entrega a senha e o código juntos.' },
      ]},
      explanation: 'A chave confere o endereço do site antes de responder. Na página falsa o endereço é outro, e ela simplesmente não responde.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 3 — Permissão de aplicativo
     ────────────────────────────────────────────────────────────────────── */
  'm3-teoria': [
    {
      id: 'ES5-M3-Q1', type: 'multiple_choice',
      prompt: 'O que um aplicativo recebe quando você clica em "Entrar com o Google"?',
      data: { options: [
        { id: 'a', text: 'Uma autorização com permissões, e não a sua senha.', correct: true },
        { id: 'b', text: 'A sua senha, guardada de forma embaralhada.', porque: 'Ele não recebe a senha de jeito nenhum, e é por isso que "Entrar com" é mais seguro do que criar uma senha nova em cada site.' },
        { id: 'c', text: 'Uma cópia da sua conta, que passa a existir nos dois lugares.', porque: 'Não há cópia nenhuma: a conta continua sendo uma só, e o aplicativo pede acesso a ela.' },
        { id: 'd', text: 'Só o seu endereço de e-mail, sempre.', porque: 'Varia: o aplicativo pede o que quiser, e a tela de permissões lista o que ele pediu. Pode ser só o e-mail, e pode ser todas as suas mensagens.' },
      ]},
      explanation: 'É um crachá. E crachá é separado da senha, o que tem uma consequência que quase ninguém conhece.',
    },
    {
      id: 'ES5-M3-Q2', type: 'true_false',
      prompt: 'Trocar a senha da conta cancela a autorização dos aplicativos conectados a ela.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O crachá é separado da senha, e continua valendo depois da troca. Cancelá-lo é outro gesto, em outra tela.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Trocar a senha é o primeiro conselho que todo mundo dá, e ele não alcança os aplicativos autorizados.',
    },
    {
      id: 'ES5-M3-Q3', type: 'scenario',
      prompt: 'Um aplicativo de filtro de fotos pede para ver o seu nome, ler todas as suas mensagens e ver a sua lista de contatos. O que isso sugere?',
      data: { scenarios: [
        { id: 'a', text: 'Que ele pede muito mais do que o serviço dele explica.', correct: true },
        { id: 'b', text: 'Que ele precisa disso para funcionar melhor com as suas fotos.', porque: 'Ler mensagens e ver contatos não tem relação nenhuma com aplicar filtro numa imagem.' },
        { id: 'c', text: 'Que o serviço de contas exige essas permissões de todo aplicativo.', porque: 'Quem escolhe o que pedir é o aplicativo. É por isso que a lista muda de um para outro.' },
        { id: 'd', text: 'Que a lista é só um aviso, e ele na prática só acessa as fotos.', porque: 'A lista é exatamente o que ele vai poder fazer. Não há diferença entre o que foi pedido e o que fica autorizado.' },
      ]},
      explanation: 'A pergunta a fazer é sempre a mesma: isto que ele pede é o que ele faz?',
    },
    {
      id: 'ES5-M3-Q4', type: 'multiple_choice',
      prompt: 'Qual dado ajuda mais a decidir se um aplicativo conectado deve continuar autorizado?',
      data: { options: [
        { id: 'a', text: 'A data do último uso dele.', correct: true },
        { id: 'b', text: 'A data em que ele foi autorizado.', porque: 'Ela diz quando começou, e não se ele ainda serve. Um aplicativo autorizado há três anos pode ser o mais usado de todos.' },
        { id: 'c', text: 'A quantidade de permissões que ele pediu.', porque: 'Ela ajuda a julgar o risco, e não se ele está em uso. Um aplicativo com poucas permissões também pode estar abandonado.' },
        { id: 'd', text: 'O tamanho do aplicativo no aparelho.', porque: 'Não tem relação nenhuma: o crachá vive na conta, e não no aparelho. Desinstalar o aplicativo não cancela a autorização.' },
      ]},
      explanation: 'Aplicativo que ninguém abre há um ano é porta aberta sem ninguém do outro lado.',
    },
    {
      id: 'ES5-M3-Q5', type: 'scenario',
      prompt: 'A diretoria decide remover todos os aplicativos conectados à conta do clube de uma vez. O que acontece?',
      data: { scenarios: [
        { id: 'a', text: 'A inscrição do acampamento para de funcionar junto.', correct: true },
        { id: 'b', text: 'Nada, porque os aplicativos pedem autorização de novo sozinhos.', porque: 'Eles não pedem sozinhos: simplesmente param de funcionar, e é preciso voltar em cada um para autorizar outra vez.' },
        { id: 'c', text: 'Só os abandonados são removidos, porque o serviço protege os que estão em uso.', porque: 'O serviço não distingue: remove o que mandarem remover.' },
        { id: 'd', text: 'A conta fica mais lenta, porque perde as integrações.', porque: 'Não há efeito nenhum sobre a velocidade. O efeito é sobre o que deixa de funcionar.' },
      ]},
      explanation: 'E quem desligou não vai desconfiar disso quando as inscrições pararem de chegar. Revisar é decidir um por um.',
    },
    {
      id: 'ES5-M3-Q6', type: 'true_false',
      prompt: 'Desinstalar um aplicativo do celular cancela o acesso dele à sua conta.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O crachá mora na conta, e não no aparelho. Desinstalar tira o aplicativo do celular e deixa a autorização de pé.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'É por isso que a lista de aplicativos conectados costuma ter coisas que ninguém tem instalado há anos.',
    },
    {
      id: 'ES5-M3-Q7', type: 'multiple_choice',
      prompt: 'Quando é o melhor momento para revisar os aplicativos conectados às contas do clube?',
      data: { options: [
        { id: 'a', text: 'Uma vez por ano, no mesmo dia em que a diretoria muda.', correct: true },
        { id: 'b', text: 'Toda semana, junto da conferência da caixa de entrada.', porque: 'Revisão que volta toda semana é revisão que a pessoa aprende a pular. A lista muda devagar demais para isso.' },
        { id: 'c', text: 'Só quando alguma coisa estranha acontecer na conta.', porque: 'Aí já é tarde: a revisão existe para achar a porta antes de alguém entrar por ela.' },
        { id: 'd', text: 'Nunca: o serviço cancela sozinho as autorizações antigas.', porque: 'Permissão não vence sozinha. Quem autorizou uma vez continua autorizado até alguém cancelar.' },
      ]},
      explanation: 'Amarrar o gesto a uma data que já existe é o que faz ele acontecer de verdade.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 4 — Vazamento de dados
     ────────────────────────────────────────────────────────────────────── */
  'm4-teoria': [
    {
      id: 'ES5-M4-Q1', type: 'multiple_choice',
      prompt: 'O que é um vazamento de dados?',
      data: { options: [
        { id: 'a', text: 'A lista de usuários de um serviço acaba publicada.', correct: true },
        { id: 'b', text: 'Alguém descobre a sua senha tentando várias combinações.', porque: 'Isso é um ataque à sua conta, um de cada vez. O vazamento acontece do lado da empresa e atinge todos os clientes dela de uma vez.' },
        { id: 'c', text: 'Um aplicativo que você autorizou passa a ler as suas mensagens.', porque: 'Isso é permissão concedida, e é outro assunto: ali você autorizou, ainda que sem ler.' },
        { id: 'd', text: 'Você envia por engano uma mensagem para a pessoa errada.', porque: 'É um erro de envio, e não um vazamento de dados no sentido do requisito: não houve invasão de serviço nenhum.' },
      ]},
      explanation: 'Acontece do lado da empresa. Você não fez nada, e ainda assim o prejuízo pode ser seu.',
    },
    {
      id: 'ES5-M4-Q2', type: 'scenario',
      prompt: 'Você consulta o endereço do clube e a resposta é "não aparece em nenhuma das listas públicas consultadas". O que isso permite concluir?',
      data: { scenarios: [
        { id: 'a', text: 'Que nenhuma lista pública tem esse endereço.', correct: true },
        { id: 'b', text: 'Que nenhum serviço usado pelo clube foi invadido.', porque: 'Há vazamento que ninguém descobriu, vazamento descoberto e não publicado, e vazamento publicado sem os endereços dentro.' },
        { id: 'c', text: 'Que as senhas do clube estão seguras.', porque: 'A consulta não diz nada sobre as senhas: ela procura o endereço, e o endereço pode não estar numa lista por muitos motivos.' },
        { id: 'd', text: 'Que o endereço é novo demais para constar em algum vazamento.', porque: 'Não há como saber isso pela consulta, e um endereço antigo também pode não constar em lista nenhuma.' },
      ]},
      explanation: 'A consulta é um sinal quando acha, e não é sinal nenhum quando não acha. Ela serve para agir, nunca para relaxar.',
    },
    {
      id: 'ES5-M4-Q3', type: 'multiple_choice',
      prompt: 'O que muda conforme o que vazou junto com o endereço?',
      data: { options: [
        { id: 'a', text: 'Vazou só o endereço, é spam; vazou a senha, é conta aberta.', correct: true },
        { id: 'b', text: 'Nada muda: qualquer vazamento pede trocar todas as senhas.', porque: 'Trocar tudo a cada aviso cansa, e quem cansa para de trocar. A informação do que vazou existe justamente para guiar a resposta.' },
        { id: 'c', text: 'Vazou o telefone, é preciso trocar de número.', porque: 'Trocar de número é caro e raramente necessário. O que o telefone vazado costuma trazer é ligação e mensagem indesejada.' },
        { id: 'd', text: 'Só os vazamentos com dados de cartão exigem alguma providência.', porque: 'Senha vazada exige providência imediata, e é o caso mais comum de todos.' },
      ]},
      explanation: 'A resposta certa muda com o dado. É por isso que a consulta mostra o que vazou, e não só que vazou.',
    },
    {
      id: 'ES5-M4-Q4', type: 'scenario',
      prompt: 'A consulta acha um vazamento de abril, com senha. A senha da conta não muda desde 2024. Qual é o primeiro gesto?',
      data: { scenarios: [
        { id: 'a', text: 'Trocar a senha desse serviço e de todos os outros.', correct: true },
        { id: 'b', text: 'Apagar a conta do serviço que vazou.', porque: 'Apagar a conta lá não muda nada nas outras contas em que aquela mesma senha continua valendo.' },
        { id: 'c', text: 'Trocar o endereço de e-mail para um novo.', porque: 'O endereço vazado já está na lista e continuará lá. O que ainda pode ser mudado é a senha.' },
        { id: 'd', text: 'Esperar o serviço avisar oficialmente antes de fazer qualquer coisa.', porque: 'A lista já é pública. Esperar o comunicado oficial é dar tempo a quem já a baixou.' },
      ]},
      explanation: 'O segundo gesto é o que quase ninguém faz, e é justamente onde a reutilização cobra o preço dela.',
    },
    {
      id: 'ES5-M4-Q5', type: 'true_false',
      prompt: 'Um vazamento antigo cuja senha já foi trocada desde então continua sendo um risco para aquela conta.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Se a senha que vazou já não abre mais nada, aquele vazamento virou história. É por isso que a data dele importa.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Comparar a data do vazamento com a da última troca de senha é o que separa o aviso que pede ação do que não pede.',
    },
    {
      id: 'ES5-M4-Q6', type: 'multiple_choice',
      prompt: 'Trocar Pioneiros2026 por Pioneiros2027 depois de um vazamento resolve?',
      data: { options: [
        { id: 'a', text: 'Não: variações da senha vazada são as primeiras a ser tentadas.', correct: true },
        { id: 'b', text: 'Sim, porque a senha nova nunca esteve em lista nenhuma.', porque: 'Ela não esteve, e não precisa: quem tem a lista gera as variações óbvias a partir do que vazou, e tenta essas primeiro.' },
        { id: 'c', text: 'Sim, desde que ela continue tendo mais de doze caracteres.', porque: 'O comprimento não ajuda quando a senha nova é previsível a partir da antiga.' },
        { id: 'd', text: 'Depende do serviço: alguns bloqueiam senhas parecidas com a anterior.', porque: 'Alguns bloqueiam mesmo, e isso não muda a resposta: onde não bloqueiam, a variação é tentada e funciona.' },
      ]},
      explanation: 'Somar um ao número no fim é o que quase todo mundo faz, e por isso é a primeira coisa que se tenta.',
    },
    {
      id: 'ES5-M4-Q7', type: 'scenario',
      prompt: 'Qual dos três gestos protege o clube até de um vazamento que ninguém ainda descobriu?',
      data: { scenarios: [
        { id: 'a', text: 'Senha diferente em cada serviço.', correct: true },
        { id: 'b', text: 'Consultar as listas públicas toda semana.', porque: 'A consulta só enxerga o que já foi publicado. Contra o vazamento não descoberto ela não tem o que dizer.' },
        { id: 'c', text: 'Usar apenas serviços de empresas grandes.', porque: 'Empresas grandes também vazam, e algumas das maiores listas públicas vieram exatamente de serviços enormes.' },
        { id: 'd', text: 'Criar um endereço de e-mail novo a cada ano.', porque: 'Isso complica a vida do clube e não impede que o serviço novo seja invadido no ano seguinte.' },
      ]},
      explanation: 'Os gestos que valem não dependem de saber do vazamento. É por isso que eles vêm antes da consulta, e não depois.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 5 — Configurações de privacidade
     ────────────────────────────────────────────────────────────────────── */
  'm5-teoria': [
    {
      id: 'ES5-M5-Q1', type: 'multiple_choice',
      prompt: 'Por que as configurações de privacidade quase nunca começam fechadas?',
      data: { options: [
        { id: 'a', text: 'Porque o serviço ganha com a conta visível.', correct: true },
        { id: 'b', text: 'Porque a lei exige que o perfil seja público por padrão.', porque: 'A lei brasileira caminha no sentido contrário: ela cobra transparência e consentimento sobre o uso dos dados.' },
        { id: 'c', text: 'Porque fechá-las por padrão impediria o serviço de funcionar.', porque: 'O serviço funciona igual com o perfil fechado. O que muda é quanto alcance ele ganha com o seu conteúdo.' },
        { id: 'd', text: 'Porque a maioria das pessoas prefere o perfil aberto.', porque: 'A maioria nunca escolheu: ficou com o padrão, que é exatamente o que torna o padrão tão poderoso.' },
      ]},
      explanation: 'Quase ninguém procura essa tela, e é por isso que ela decide mais do que qualquer escolha consciente.',
    },
    {
      id: 'ES5-M5-Q2', type: 'scenario',
      prompt: 'O clube publica a foto do acampamento com o ajuste de local ligado. O que sai junto?',
      data: { scenarios: [
        { id: 'a', text: 'O lugar onde o acampamento está acontecendo agora.', correct: true },
        { id: 'b', text: 'Apenas a cidade, que é uma informação pública de qualquer jeito.', porque: 'O celular grava a coordenada, e não a cidade. Muitos serviços publicam o local com precisão de rua.' },
        { id: 'c', text: 'O local só aparece para quem já segue a página do clube.', porque: 'Quem vê o local é quem vê a foto, e isso depende de outro ajuste. Os dois são independentes.' },
        { id: 'd', text: 'Nada, porque o local só é gravado quando a pessoa escolhe marcá-lo.', porque: 'O celular grava sozinho, dentro do arquivo. Marcar manualmente é outra coisa, que se faz por cima disso.' },
      ]},
      explanation: 'Num clube de crianças este é o ajuste que mais custa, e o que menos gente sabe que existe.',
    },
    {
      id: 'ES5-M5-Q3', type: 'multiple_choice',
      prompt: 'Qual é o problema de usar o botão "deixar tudo privado" na conta do clube?',
      data: { options: [
        { id: 'a', text: 'Ele tira a página do clube dos sites de busca.', correct: true },
        { id: 'b', text: 'Ele é irreversível, e os ajustes não podem ser reabertos depois.', porque: 'Todos podem ser reabertos um por um. O problema não é a reversão: é ninguém perceber o que foi fechado junto.' },
        { id: 'c', text: 'Ele apaga as publicações antigas da página.', porque: 'Nenhum ajuste de privacidade apaga conteúdo. Ele muda quem pode ver o que existe.' },
        { id: 'd', text: 'Ele não funciona em contas com mais de um administrador.', porque: 'Funciona igual. O número de administradores não muda o que o botão faz.' },
      ]},
      explanation: 'Os dados ficam guardados e o clube fica invisível. O requisito diz ajustar, e ajustar é decidir um por um.',
    },
    {
      id: 'ES5-M5-Q4', type: 'true_false',
      prompt: 'Apagar a legenda de uma foto já publicada tira dela a informação de onde ela foi tirada.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O local vai dentro do arquivo, e não só na legenda. Quem baixar a foto continua tendo a coordenada.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'É por isso que o ajuste certo é o que impede a publicação do local, e não a edição da legenda depois.',
    },
    {
      id: 'ES5-M5-Q5', type: 'scenario',
      prompt: 'Na conta do clube, quais ajustes precisam fechar e qual precisa continuar aberto?',
      data: { scenarios: [
        { id: 'a', text: 'Fecham os que mostram dados de gente; a busca continua aberta.', correct: true },
        { id: 'b', text: 'Fecham todos, porque é uma conta com dados de menores.', porque: 'Fechando todos, o clube some da busca — e um clube que ninguém acha para de receber desbravador novo.' },
        { id: 'c', text: 'Abrem todos, porque a conta existe para divulgar o clube.', porque: 'Divulgar o clube não exige publicar o nome completo e o telefone dos pais de cada criança.' },
        { id: 'd', text: 'Nenhum precisa mudar: o padrão do serviço já é adequado para clubes.', porque: 'O padrão é o mais aberto que a lei deixa, e ele não foi pensado para uma conta com dados de crianças.' },
      ]},
      explanation: 'São duas perguntas diferentes na mesma tela: o que protege quem está no clube, e o que faz o clube ser achado.',
    },
    {
      id: 'ES5-M5-Q6', type: 'multiple_choice',
      prompt: 'Com que frequência vale conferir a tela de privacidade de uma conta do clube?',
      data: { options: [
        { id: 'a', text: 'Uma vez por ano: ajustes novos nascem abertos.', correct: true },
        { id: 'b', text: 'Uma vez só, quando a conta é criada.', porque: 'A tela muda: ajustes novos aparecem sem aviso, e aparecem no padrão aberto como todos os outros.' },
        { id: 'c', text: 'Toda vez que uma foto for publicada.', porque: 'É trabalho demais para a frequência com que os ajustes mudam, e quem faz demais acaba não fazendo.' },
        { id: 'd', text: 'Nunca: uma vez ajustada, a conta permanece como foi deixada.', porque: 'Ela não permanece. Atualizações do serviço trazem ajustes que ninguém escolheu.' },
      ]},
      explanation: 'Ninguém avisa quando um ajuste novo aparece. Conferir junto da troca de diretoria resolve as duas coisas de uma vez.',
    },
    {
      id: 'ES5-M5-Q7', type: 'true_false',
      prompt: 'Deixar a lista de membros visível para qualquer pessoa é um risco maior num clube do que numa conta pessoal.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'A lista de um clube traz nome completo de criança, e os dados foram dados na inscrição para o clube usar, e não para ficarem públicos.' },
      ]},
      explanation: 'Quem entregou o dado foi o pai, para o clube. Publicá-lo é usar o dado para uma coisa que ninguém autorizou.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 6 — Mensagem fraudulenta
     ────────────────────────────────────────────────────────────────────── */
  'm6-teoria': [
    {
      id: 'ES5-M6-Q1', type: 'multiple_choice',
      prompt: 'Por que um antivírus não impede uma mensagem fraudulenta de funcionar?',
      data: { options: [
        { id: 'a', text: 'Porque ela não explora o computador: convence a pessoa.', correct: true },
        { id: 'b', text: 'Porque os antivírus não conseguem ler mensagens de e-mail.', porque: 'Muitos leem, e alguns até marcam as mais grosseiras. O que nenhum deles impede é a pessoa digitar a senha numa página falsa.' },
        { id: 'c', text: 'Porque essas mensagens chegam criptografadas.', porque: 'Elas chegam como qualquer outra mensagem. O que as torna eficazes não é esconder o conteúdo.' },
        { id: 'd', text: 'Porque o antivírus só analisa arquivos baixados.', porque: 'A maioria analisa também o que chega, e ainda assim a mensagem funciona: ela pede um gesto seu, e não uma execução.' },
      ]},
      explanation: 'O caminho dela é você. É por isso que reconhecê-la é uma habilidade, e não um programa.',
    },
    {
      id: 'ES5-M6-Q2', type: 'scenario',
      prompt: 'Uma mensagem assinada "Banco do Brasil" vem do endereço seguranca@bb-atendimento-cliente.com. O que isso indica?',
      data: { scenarios: [
        { id: 'a', text: 'Que o domínio depois do arroba não é do banco.', correct: true },
        { id: 'b', text: 'Que o banco usa vários domínios para atendimento.', porque: 'Bancos usam o domínio deles. Um domínio parecido, criado para a ocasião, é o indício mais direto que existe.' },
        { id: 'c', text: 'Que a mensagem passou por um servidor intermediário e mudou de endereço.', porque: 'Servidor intermediário não reescreve o remetente. O que aparece é o que foi escrito por quem enviou.' },
        { id: 'd', text: 'Que é preciso abrir a mensagem para saber, porque o endereço não diz nada.', porque: 'O endereço diz muito, e é a primeira coisa a olhar — antes de abrir qualquer link.' },
      ]},
      explanation: 'O nome que aparece qualquer um escreve. O que não se falsifica é o que vem depois do arroba.',
    },
    {
      id: 'ES5-M6-Q3', type: 'multiple_choice',
      prompt: 'Como se descobre para onde um link realmente leva, antes de clicar?',
      data: { options: [
        { id: 'a', text: 'Parando o ponteiro em cima e lendo a barra de baixo.', correct: true },
        { id: 'b', text: 'Lendo o texto do link, que é sempre o endereço de destino.', porque: 'O texto é livre: ele pode dizer bb.com.br e levar a qualquer outro lugar. É justamente essa diferença que denuncia.' },
        { id: 'c', text: 'Clicando e voltando rápido se o site parecer errado.', porque: 'Voltar não desfaz nada: a página já foi aberta, e uma página falsa bem feita não parece errada.' },
        { id: 'd', text: 'Copiando o link e colando na barra de endereços.', porque: 'Funciona, e é mais trabalhoso do que parar o ponteiro — e quem copia acaba apertando Enter sem ler.' },
      ]},
      explanation: 'No celular, segurando o dedo no link. É o único indício que não se vê sem esse gesto.',
    },
    {
      id: 'ES5-M6-Q4', type: 'scenario',
      prompt: 'Uma mensagem da secretária do clube diz "quem não puder ir, me avisa antes de sexta". Isso é indício de fraude?',
      data: { scenarios: [
        { id: 'a', text: 'Não: o indício é a ameaça junto do prazo.', correct: true },
        { id: 'b', text: 'Sim, porque toda mensagem com prazo curto tenta apressar quem lê.', porque: 'Gente marca reunião e combina horário. Tratar todo prazo como indício faz desconfiar de quase toda mensagem verdadeira.' },
        { id: 'c', text: 'Sim, se ela não vier do endereço institucional do clube.', porque: 'A secretária escrevendo da caixa pessoal dela é comum e não denuncia nada por si só.' },
        { id: 'd', text: 'Não se pode dizer sem ver se há link na mensagem.', porque: 'Link também não é indício sozinho. O que se olha é se o texto do link discorda do destino.' },
      ]},
      explanation: 'Quem aprende "prazo é golpe" passa a desconfiar da própria secretária — e cansa, e volta a clicar em tudo.',
    },
    {
      id: 'ES5-M6-Q5', type: 'multiple_choice',
      prompt: 'O que nenhum serviço legítimo pede por mensagem?',
      data: { options: [
        { id: 'a', text: 'A sua senha ou o código da verificação em duas etapas.', correct: true },
        { id: 'b', text: 'A confirmação do seu endereço de e-mail.', porque: 'Serviços pedem isso o tempo todo, com um link de confirmação. É comum e legítimo.' },
        { id: 'c', text: 'Que você responda dizendo se reconhece um acesso recente.', porque: 'Avisos de acesso são normais. O que não é normal é pedir a senha junto.' },
        { id: 'd', text: 'Que você atualize o aplicativo para a versão mais nova.', porque: 'É um pedido comum e inofensivo — embora a mensagem que o faz também possa ser falsa, por outros indícios.' },
      ]},
      explanation: 'Quem pede senha, pede porque não tem. Nem o suporte do serviço precisa dela.',
    },
    {
      id: 'ES5-M6-Q6', type: 'true_false',
      prompt: 'Uma mensagem sem erros de português é sinal de que ela é verdadeira.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Erro de escrita é indício quando aparece, e a ausência dele não prova nada. As mensagens que mais custam dinheiro são bem escritas.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A melhor delas chega num dia em que faz sentido e fala de uma coisa que você estava mesmo esperando.',
    },
    {
      id: 'ES5-M6-Q7', type: 'scenario',
      prompt: 'Qual é o custo de marcar como golpe uma mensagem verdadeira da secretária?',
      data: { scenarios: [
        { id: 'a', text: 'As próximas dela caem no lixo eletrônico.', correct: true },
        { id: 'b', text: 'Nenhum: marcar por engano é sempre o lado seguro de errar.', porque: 'Tem custo, e ele é silencioso: a informação do clube deixa de chegar, e ninguém vai ligar uma coisa à outra.' },
        { id: 'c', text: 'A conta de quem mandou é bloqueada pelo serviço.', porque: 'Uma denúncia isolada não bloqueia ninguém. O efeito é sobre a entrega das mensagens seguintes para você.' },
        { id: 'd', text: 'O clube recebe uma advertência do provedor de e-mail.', porque: 'Não existe advertência nenhuma. O efeito acontece em silêncio, na classificação das mensagens.' },
      ]},
      explanation: 'Desconfiar de tudo não é o lado seguro: é o lado em que a escala do acampamento some sem ninguém saber por quê.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 7 — Quando a conta cai
     ────────────────────────────────────────────────────────────────────── */
  'm7-teoria': [
    {
      id: 'ES5-M7-Q1', type: 'ordering',
      prompt: 'Ordene as providências de quem descobriu que a conta do clube foi invadida.',
      data: { items: [
        { id: 'a', text: 'Trocar a senha', order: 1 },
        { id: 'b', text: 'Conferir o e-mail de recuperação da conta', order: 2 },
        { id: 'c', text: 'Encerrar as sessões que sobraram', order: 3 },
        { id: 'd', text: 'Conferir aplicativos autorizados e regras de encaminhamento', order: 4 },
        { id: 'e', text: 'Ligar a verificação em duas etapas', order: 5 },
        { id: 'f', text: 'Avisar a diretoria e as famílias', order: 6 },
      ]},
      explanation: 'A senha vem primeiro porque ela derruba as outras sessões junto. Encerrar sessões antes disso põe para fora alguém que ainda sabe a senha.',
    },
    {
      id: 'ES5-M7-Q2', type: 'scenario',
      prompt: 'Alguém encerra a sessão do invasor sem ter trocado a senha antes. O que acontece?',
      data: { scenarios: [
        { id: 'a', text: 'Ele entra de novo, porque continua sabendo a senha.', correct: true },
        { id: 'b', text: 'Ele fica de fora até alguém autorizá-lo novamente.', porque: 'Não há autorização nenhuma envolvida: com a senha na mão, entrar é digitar.' },
        { id: 'c', text: 'O serviço bloqueia o aparelho dele permanentemente.', porque: 'Encerrar sessão não bloqueia aparelho. Ele simplesmente pede a senha de novo, e o invasor a tem.' },
        { id: 'd', text: 'Nada, porque encerrar sessões não tem efeito nenhum.', porque: 'Tem efeito: derruba as sessões abertas, inclusive as de quem é do clube. O que ela não faz é impedir a próxima entrada.' },
      ]},
      explanation: 'Na ordem errada, o que se perde é o celular de quem trabalha no clube, e o invasor volta no minuto seguinte.',
    },
    {
      id: 'ES5-M7-Q3', type: 'multiple_choice',
      prompt: 'Qual destas coisas continua valendo depois de a senha ser trocada?',
      data: { options: [
        { id: 'a', text: 'A autorização de um aplicativo que ele conectou.', correct: true },
        { id: 'b', text: 'A sessão aberta no navegador dele.', porque: 'Na maioria dos serviços, trocar a senha derruba as outras sessões junto. É o que faz a ordem das providências funcionar.' },
        { id: 'c', text: 'A senha antiga, por mais algumas horas.', porque: 'Ela deixa de valer imediatamente. Não há período de transição em serviço nenhum.' },
        { id: 'd', text: 'O acesso pelo aplicativo do celular já instalado.', porque: 'Ele pede a senha nova na próxima vez que tentar sincronizar, como qualquer outro.' },
      ]},
      explanation: 'O crachá de aplicativo é separado da senha. É por isso que conferir a lista de aplicativos faz parte da recuperação.',
    },
    {
      id: 'ES5-M7-Q4', type: 'scenario',
      prompt: 'Depois de recuperar a conta, o clube continua sem ver nada estranho na caixa de entrada — e tudo o que chega é copiado para fora. O que ficou?',
      data: { scenarios: [
        { id: 'a', text: 'Uma regra de encaminhamento copiando as mensagens.', correct: true },
        { id: 'b', text: 'Uma sessão aberta, que ninguém encerrou.', porque: 'Sessão aberta aparece na lista de aparelhos, e não copia mensagem nenhuma para fora sozinha.' },
        { id: 'c', text: 'A senha antiga, que ainda funciona em algum aparelho.', porque: 'Senha antiga deixa de valer em todo lugar assim que é trocada.' },
        { id: 'd', text: 'Um vírus instalado no computador da secretaria.', porque: 'O encaminhamento é um ajuste da conta, e funciona mesmo que o computador seja trocado.' },
      ]},
      explanation: 'É a pior de esquecer porque não deixa sinal: a caixa de entrada continua exatamente igual.',
    },
    {
      id: 'ES5-M7-Q5', type: 'multiple_choice',
      prompt: 'Por que conferir o e-mail de recuperação é urgente numa conta invadida?',
      data: { options: [
        { id: 'a', text: 'Porque com ele o invasor recebe o código da senha nova.', correct: true },
        { id: 'b', text: 'Porque sem ele a conta não pode ser recuperada por ninguém.', porque: 'A conta já está recuperada — o problema é o invasor poder recuperá-la de volta a qualquer momento.' },
        { id: 'c', text: 'Porque é para lá que vão as mensagens da conta.', porque: 'A recuperação não recebe as mensagens comuns: ela recebe o código de redefinir a senha, que é pior.' },
        { id: 'd', text: 'Porque o serviço bloqueia a conta enquanto a recuperação estiver errada.', porque: 'Nenhum serviço bloqueia por isso. A conta segue funcionando normalmente, com a porta aberta.' },
      ]},
      explanation: 'A senha nova pode ser a mais longa do mundo. Ela não vale nada enquanto a recuperação for dele.',
    },
    {
      id: 'ES5-M7-Q6', type: 'true_false',
      prompt: 'Depois de recuperar a conta do clube, avisar as famílias é opcional se nada parecer ter sido enviado.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'A pasta de enviados pode ter sido limpa, e o uso mais comum de uma conta tomada é pedir dinheiro a quem confia nela.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Avisar cedo evita o prejuízo. Avisar depois é explicar por que alguém pagou um boleto falso.',
    },
    {
      id: 'ES5-M7-Q7', type: 'multiple_choice',
      prompt: 'O que a pasta de enviados ajuda a decidir depois de uma invasão?',
      data: { options: [
        { id: 'a', text: 'A quem avisar primeiro.', correct: true },
        { id: 'b', text: 'Qual foi a senha usada pelo invasor.', porque: 'Nada na conta guarda a senha usada para entrar. O que fica registrado é o acesso, e não a credencial.' },
        { id: 'c', text: 'De que cidade partiu o acesso.', porque: 'Isso aparece na lista de sessões e de atividade recente, e não nos enviados.' },
        { id: 'd', text: 'Se a conta ainda está comprometida.', porque: 'Quem responde a isso é a recuperação, a lista de aplicativos e as regras de encaminhamento.' },
      ]},
      explanation: 'O que saiu de lá durante o período diz exatamente quem recebeu mensagem em nome do clube.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 8 — O plano de contas do clube
     ────────────────────────────────────────────────────────────────────── */
  'm8-teoria': [
    {
      id: 'ES5-M8-Q1', type: 'multiple_choice',
      prompt: 'Por que uma conta do clube não deve estar vinculada ao endereço pessoal de um membro?',
      data: { options: [
        { id: 'a', text: 'Porque quando essa pessoa sai, a conta vai junto.', correct: true },
        { id: 'b', text: 'Porque o serviço cobra a mais de contas pessoais usadas por grupos.', porque: 'Quase nenhum serviço cobra por isso, e não é daí que vem o problema.' },
        { id: 'c', text: 'Porque duas pessoas não conseguem usar a mesma conta ao mesmo tempo.', porque: 'Conseguem, na maioria dos serviços. O problema aparece quando uma delas some, e não quando as duas estão presentes.' },
        { id: 'd', text: 'Porque a lei proíbe usar conta pessoal para atividade de entidade.', porque: 'Não há proibição desse tipo. A razão é prática: continuidade do clube e separação do que é de quem.' },
      ]},
      explanation: 'E não precisa ninguém sair de má-fé: basta perder o telefone com o aplicativo das duas etapas dentro.',
    },
    {
      id: 'ES5-M8-Q2', type: 'multiple_choice',
      prompt: 'Quantas pessoas devem ter acesso a cada conta do clube?',
      data: { options: [
        { id: 'a', text: 'Duas: uma só se perde, e muitas ninguém acompanha.', correct: true },
        { id: 'b', text: 'Uma, para que fique claro quem é o responsável.', porque: 'Fica claro e fica frágil: basta essa pessoa ficar doente na semana do acampamento para o clube não entrar.' },
        { id: 'c', text: 'Toda a diretoria, para que ninguém dependa de ninguém.', porque: 'Com muita gente, ninguém sabe quem ainda entra — e a lista deixa de ser confiável.' },
        { id: 'd', text: 'Depende da conta: as importantes com uma só, as outras com várias.', porque: 'É o contrário do que a prática recomenda: quanto mais importante a conta, menos ela pode depender de uma pessoa só.' },
      ]},
      explanation: 'Duas é o número que sobrevive a uma ausência e continua sendo acompanhável.',
    },
    {
      id: 'ES5-M8-Q3', type: 'scenario',
      prompt: 'A secretária deixa o clube. A diretoria tira o acesso dela no cofre de senhas e não faz mais nada. O que ficou por fazer?',
      data: { scenarios: [
        { id: 'a', text: 'Trocar as senhas que ela sabia de cor.', correct: true },
        { id: 'b', text: 'Nada: sem acesso ao cofre, ela não consegue mais entrar.', porque: 'O cofre guarda as senhas, e não as esquece por ela. As senhas que ela digitou por três anos continuam na cabeça dela.' },
        { id: 'c', text: 'Apagar a conta de e-mail que ela usava.', porque: 'A conta é do clube e continua sendo necessária. O que muda é quem consegue abri-la.' },
        { id: 'd', text: 'Pedir que ela assine um termo de confidencialidade.', porque: 'Um termo não desfaz o acesso técnico, e o problema é técnico: a senha continua valendo.' },
      ]},
      explanation: 'O cofre passa a dizer que ela não tem acesso, e ela continua entrando em tudo. As duas coisas ao mesmo tempo.',
    },
    {
      id: 'ES5-M8-Q4', type: 'ordering',
      prompt: 'Ordene o que a troca de diretoria precisa fazer com as contas do clube.',
      data: { items: [
        { id: 'a', text: 'Tirar o acesso de quem saiu', order: 1 },
        { id: 'b', text: 'Trocar a senha de toda conta que essa pessoa abria', order: 2 },
        { id: 'c', text: 'Conferir o e-mail de recuperação de cada conta', order: 3 },
        { id: 'd', text: 'Dar acesso a duas pessoas da diretoria nova', order: 4 },
        { id: 'e', text: 'Entregar o cofre e o plano à diretoria nova', order: 5 },
      ]},
      explanation: 'O segundo passo é o que quase ninguém faz — e sem ele o primeiro vira um registro que não corresponde à realidade.',
    },
    {
      id: 'ES5-M8-Q5', type: 'multiple_choice',
      prompt: 'O que o plano de contas do clube precisa responder?',
      data: { options: [
        { id: 'a', text: 'Quais contas existem, quem entra, e como isso passa adiante.', correct: true },
        { id: 'b', text: 'Quais são as senhas de cada conta, escritas no documento.', porque: 'Senha mora no cofre, e não num documento que circula. O plano diz quem tem acesso, e não qual é a senha.' },
        { id: 'c', text: 'Quanto cada serviço custa por mês.', porque: 'É informação útil para a tesouraria, e não é o que o requisito 8 pede: ele pergunta por existência, acesso e transferência.' },
        { id: 'd', text: 'Há quanto tempo cada conta existe.', porque: 'Não muda nada sobre quem consegue entrar nela hoje nem sobre como o acesso é transferido.' },
      ]},
      explanation: 'A primeira pergunta é a mais fácil de errar por omissão: quase todo clube descobre uma conta esquecida no meio do ano.',
    },
    {
      id: 'ES5-M8-Q6', type: 'true_false',
      prompt: 'Uma conta do clube que ninguém usa há dois anos não representa risco, porque está parada.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Ela continua existindo, continua com dados dentro e continua invadível — e ninguém está olhando para ela.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Conta esquecida é a que ninguém percebe ser invadida, justamente porque ninguém entra nela para notar.',
    },
    {
      id: 'ES5-M8-Q7', type: 'scenario',
      prompt: 'Qual é o argumento a apresentar a um diretor que diz "sempre foi no meu e-mail e nunca deu problema"?',
      data: { scenarios: [
        { id: 'a', text: 'Que o problema só aparece no dia em que ele não estiver.', correct: true },
        { id: 'b', text: 'Que ele pode estar lendo as mensagens do clube sem autorização.', porque: 'Acusar quem cuidou da conta afasta a pessoa da conversa, e não é disso que se trata: a mudança protege o clube e também protege ele.' },
        { id: 'c', text: 'Que o serviço vai apagar a conta se descobrir o uso institucional.', porque: 'Não vai, e prever um castigo que não existe faz a recomendação inteira perder credibilidade.' },
        { id: 'd', text: 'Que é regra da Associação e não há o que discutir.', porque: 'Pode até ser, e um argumento de autoridade não ensina nada: no ano seguinte a conta nova volta a nascer no e-mail de alguém.' },
      ]},
      explanation: 'Misturar também expõe a pessoa: a caixa pessoal dela passa a ser a porta de entrada de tudo o que é do clube.',
    },
  ],
};
