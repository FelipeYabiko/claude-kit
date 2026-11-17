# Decisões

As escolhas técnicas de um projeto novo, já tomadas. Siga a tabela em vez de escolher de novo a cada projeto: escolha
diferente em cada um é o que deixa o conjunto impossível de manter. Para sair da tabela, o motivo vai na seção
"Decisões" da `FICHA.md`, com o OK do dono.

## 1. Qual modelo

Responda de cima para baixo e pare na primeira linha que servir.

| Se a ideia é... | Modelo | Exemplos |
|---|---|---|
| Uma página ou algumas páginas para **mostrar** algo a quem visita | `site` | página de um negócio, portfólio, página do canal, convite, currículo, página de um produto |
| **Guardar e consultar** coisas, usado por uma pessoa (ou uma casa) num computador | `sistema` | clientes e projetos, estoque, contas a pagar, tarefas, acervo de referências, calendário de postagens |
| Uma tarefa que se repete **sem tela**: buscar, juntar, conferir, avisar | `robo` | vigiar canais e sites, juntar números numa planilha, relatório semanal, conferir links quebrados |
| Um site **e** um robô (o robô gera o que o site mostra) | os dois, em repositórios separados | o robô escreve um arquivo que o site lê |
| Outra coisa | `livre` | jogo no navegador, extensão, script de uma vez só, análise de dados |
| Precisa de login, várias pessoas ao mesmo tempo, pagamento ou app de loja | **nenhum ainda**: veja a seção 4 | |

Na dúvida entre `site` e `sistema`: o visitante **só lê** (site) ou alguém **digita e guarda** (sistema)? Na dúvida
entre `sistema` e `robo`: alguém abre uma tela todo dia (sistema) ou o trabalho acontece sozinho (robô)?

## 2. O que cada modelo já decide

| | `site` | `sistema` | `robo` | `livre` |
|---|---|---|---|---|
| Feito com | HTML, CSS e um JavaScript pequeno | Node, sem instalar nada | Node, sem instalar nada | o que a ideia pedir (veja a seção 5) |
| Onde roda | no ar, GitHub Pages | no computador do dono | no computador ou no GitHub | a decidir |
| Onde ficam os dados | não guarda | `dados/` no computador (fora do GitHub) | `saida/` e `estado/` no repositório | a decidir |
| Custo | zero | zero | zero | a decidir |
| O dono abre com | o endereço do site | dois cliques no `.bat` | dois cliques no `.bat`, ou sozinho | a decidir |
| Para aprovar | folha de telas | folha de telas + uso | ensaio + resultado | a combinar |
| Precisa no computador do dono | nada | Node.js 22 ou mais novo | Node.js 22 ou mais novo | a decidir |

Por que **sem dependências**: cada pacote instalado é algo que pode quebrar na atualização, sumir ou ser atacado, e o
dono não tem como consertar. O Node e o navegador de hoje já trazem servidor, testes, leitura de arquivos e
formatação. Dependência só entra com o OK do dono, anotada na ficha (o gancho do projeto cobra).

## 3. Onde publicar e o que é grátis

Fatos de serviços mudam. Cada linha tem a data da conferência; passou de 3 meses, confira na página oficial antes de
prometer ao dono.

### Conferido (na página oficial, em 17/11/2026)

| Fato | Fonte |
|---|---|
| GitHub Pages no plano grátis só funciona em repositório **público**; em repositório privado exige plano pago | docs.github.com, "GitHub Pages limits" |
| GitHub Pages: site de até 1 GB e limite brando de 100 GB de tráfego por mês | docs.github.com, "GitHub Pages limits" |
| Em repositório **público**, agendamento do GitHub Actions é desligado depois de 60 dias sem atividade no repositório | docs.github.com, "Disabling and enabling a workflow" |
| O agendamento do GitHub Actions roda em UTC por padrão, no mínimo de 5 em 5 minutos, e pode atrasar nos horários cheios (começo de cada hora) | docs.github.com, "Events that trigger workflows", seção `schedule` |
| GitHub Actions é grátis em repositório **público** (máquinas padrão); em repositório privado, o plano grátis inclui US$ 12 de uso por mês (cerca de 2.000 minutos de Linux) | docs.github.com, "Billing for GitHub Actions" |
| YouTube: cada canal publica um feed (Atom) dos vídeos mais recentes, sem chave: `https://www.youtube.com/feeds/videos.xml?channel_id=<id>` (traz os 15 últimos) | testado com um canal real nesta data |
| YouTube Data API: cota padrão de 10.000 unidades por dia; consultar vídeos (`videos.list`) custa 1 unidade por chamada, com até 50 vídeos por chamada; lê dado público só com chave de API | developers.google.com/youtube/v3 |
| Cloudflare Pages no plano grátis: 500 publicações por mês | developers.cloudflare.com/pages/platform/limits |

### A confirmar (veio de fonte de terceiros ou não foi testado: conferir antes de usar)

| Afirmação | Onde conferir |
|---|---|
| O agendamento do GitHub Actions já aceita fuso horário (a documentação cita um nome de fuso no padrão IANA, como `America/Sao_Paulo`); a escrita exata não foi testada, por isso o `agendar.yml` usa UTC | docs.github.com, seção `schedule` |
| A busca do YouTube (`search.list`) tem limite próprio, bem menor (cerca de 100 buscas por dia) | console do Google Cloud, página de cotas |
| Cloudflare Pages grátis aceita repositório privado e não cobra tráfego | página de preços da Cloudflare |
| Supabase grátis: 2 projetos, 500 MB de banco, e o projeto **pausa depois de 7 dias sem uso** | supabase.com/pricing |
| Formulário em site parado: Formspree grátis aceita 50 envios por mês; Web3Forms, 250 | páginas de preço de cada um |
| Números do Instagram e do TikTok por programa exigem conta profissional e aplicativo aprovado pela plataforma | documentação de cada plataforma |
| A publicação pelo `.github/workflows/publicar.yml` (GitHub Pages) e o agendamento pelo `agendar.yml` não foram executados de verdade na criação da fábrica: a primeira publicação de cada projeto é o teste | aba Actions do repositório |

### Caminho padrão de cada coisa

| Preciso de... | Padrão | Alternativa, e quando |
|---|---|---|
| Site no ar | GitHub Pages (repositório público) | Cloudflare Pages, se o repositório precisa ser privado |
| Endereço próprio (`.com.br`) | começar com o endereço grátis do GitHub | domínio próprio custa por ano (registro.br): decisão do dono |
| Receber contato pelo site | botão de WhatsApp e de e-mail | serviço de formulário, se o dono precisar de formulário (conta em serviço: perguntar) |
| Rodar todo dia sozinho | GitHub Actions (`agendar.yml`) | Agendador do Windows, se depende do computador dele |
| Tarefa que precisa de julgamento (resumir, escolher) | tarefa agendada do Claude | |
| Guardar segredo | `.env` no computador; "Secrets" no GitHub; segredos do ambiente na nuvem do Claude | nunca no código, no config ou na conversa |
| Números do YouTube | feed público (novidades) ou YouTube Data API com chave (visualizações) | print do YouTube Studio, para o que a API não dá sem login |

## 4. Quando não há modelo: login, várias pessoas, pagamento

O modelo `sistema` atende **um computador**. Estes pedidos são outro tipo de projeto, com custo e responsabilidade
que o dono precisa escolher. Não adapte o `sistema` por conta própria.

| O dono quer... | Antes de construir, ofereça | Se ainda assim for construir |
|---|---|---|
| Várias pessoas preenchendo a mesma lista | **Google Forms + Planilhas**: zero código, grátis, pronto hoje | |
| Clientes agendando horário | serviço pronto de agenda (o link vai no site) | |
| Vender e receber | link de pagamento ou loja pronta; o site da fábrica aponta para lá | |
| Um sistema dele, com login, no celular e no computador | deixar claro: precisa de hospedagem e banco de dados na internet, tem limite grátis e pode virar mensalidade | projeto `livre`, feito com o modelo mais capaz do Claude, com pesquisa das opções atuais e a escolha registrada na ficha. É candidato a virar modelo novo da fábrica |
| Aplicativo na loja do celular | um site que funciona bem no celular resolve quase sempre, sem loja | |

A pergunta que decide: **"quem mais vai usar, além de você?"**. Se a resposta for "ninguém, por enquanto", comece
com o modelo `sistema` e anote o resto em "Fora do combinado".

## 5. Projeto `livre`: escolhas padrão

| Escolha | Padrão | Por quê |
|---|---|---|
| Linguagem | JavaScript no Node 22+ (arquivos `.mjs`), sem TypeScript e sem passo de montagem | é o que os outros projetos do dono usam; roda direto |
| Interface | HTML, CSS e JavaScript puros, cores e fontes num `tokens.css` | o fiscal de páginas já confere; sem biblioteca para atualizar |
| Jogo no navegador | `<canvas>` e JavaScript puro, um arquivo por parte (laço, entrada, desenho, regras) | sem motor de jogo até a ideia provar que precisa |
| Análise de dados | Python só se a análise pedir (pandas, gráficos); senão Node | |
| Testes | `node --test` em `tests/*.test.mjs`; regra de negócio em função pura | o `npm run verificar` já roda |
| Dados | arquivo JSON ou CSV no projeto | banco de dados só com o OK do dono |
| Biblioteca externa | só se escrever à mão custar mais de uma conversa inteira **e** o dono aprovar | cada dependência é manutenção para sempre |

Em projeto `livre` não há manual do tipo: o `docs/manual.md` é o genérico (entender, teste primeiro, fazer, verificar,
olhar, fechar). Escreva nele as etapas próprias do projeto assim que elas se repetirem pela segunda vez.

## 6. Nomes

| Coisa | Regra | Exemplo |
|---|---|---|
| Repositório e pasta | minúsculas, sem acento, com hífen, curto | `controle-de-projetos` |
| Arquivos | minúsculas, sem acento, com hífen (o fiscal trava o que quebra no Windows) | `padaria-vitrine.jpg` |
| Nome que aparece para o dono | como ele fala, com acento | "Controle de Projetos" |
| Código, comentários, mensagens | português, comentário curto que explica o porquê | |
