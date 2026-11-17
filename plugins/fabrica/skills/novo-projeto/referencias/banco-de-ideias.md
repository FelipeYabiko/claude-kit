# Banco de ideias

Projetos já pensados para o trabalho do Felipe (canais de vídeo, portfólio, clientes), cada um com o modelo, a
primeira versão e o que precisa. Servem para ele escolher ("faz a ideia 3") e para a entrevista começar adiantada.
Mesmo com a ideia pronta, a **ficha passa pela aprovação dele**: aqui está o ponto de partida, não o combinado.

Feito em 17/11/2026. Ao terminar uma, marque a situação e o endereço do repositório. Ideia nova entra no fim, no mesmo
formato, com os fatos separados em **Conferido** (com fonte e data) e **A confirmar**.

| # | Ideia | Modelo | Esforço | Situação |
|---|---|---|---|---|
| 1 | Vigia de canais | `robo` | pequeno (o exemplo do modelo já faz) | a fazer |
| 2 | Placar dos vídeos | `sistema` | pequeno | a fazer |
| 3 | Página do canal (link da bio) | `site` | pequeno | a fazer |
| 4 | Números do YouTube sozinhos | `robo` | médio | a fazer |
| 5 | Calendário de postagens | `sistema` | pequeno | a fazer |
| 6 | Portfólio no padrão da fábrica | adotar | pequeno | a fazer |
| 7 | Clientes e projetos | `sistema` | pequeno (é o exemplo do modelo) | a fazer |
| 8 | Banco de pautas com busca | `sistema` | médio | a fazer |
| 9 | Vigia de links das descrições | `robo` | médio | a fazer |
| 10 | Painel de gastos com voz | `robo` | pequeno | a fazer |
| 11 | Acervo de referências | `sistema` | pequeno | a fazer |
| 12 | Página de serviço de edição | `site` | pequeno | a fazer |
| 13 | Radar de assuntos | `robo` | médio | a fazer |
| 14 | Mini-jogo de física | `livre` | grande | a fazer |

Ordem sugerida para começar: **1, 2 e 3**. São pequenos, usam os três modelos (bom para conhecer a fábrica) e
resolvem dores de hoje: saber o que os concorrentes postaram, ter os números num lugar só e ter um link único na bio.

---

## 1. Vigia de canais (`robo`)

**Para quê:** saber, sem abrir o YouTube, quando os canais que ele acompanha postam vídeo novo. Alimenta o estudo
mensal de concorrentes do projeto de vídeos.

**Primeira versão:** a lista de canais no `config.json`; rodar com dois cliques; relatório com os vídeos novos por
canal (título, data, link) e planilha de histórico.

**Depois:** rodar sozinho toda manhã no GitHub; separar Shorts de vídeos longos; marcar os que passam de N
visualizações (precisa da ideia 4).

**Precisa:** o endereço de cada canal. Nenhuma chave.

**Conferido (17/11/2026):** o feed público `https://www.youtube.com/feeds/videos.xml?channel_id=<id>` responde sem
chave e traz os 15 vídeos mais recentes com título, link e data (testado com um canal real; o link de Short já vem
como `/shorts/...`). O modelo `robo` já vem com este robô funcionando sobre um feed de exemplo.

**A confirmar:** como achar o `channel_id` (começa com `UC`) a partir do endereço com `@nome`: está no código-fonte
da página do canal; confirmar o jeito mais simples para o dono. Se o feed vale para TikTok e Instagram: não há feed
público oficial conhecido; tratar como "só YouTube".

## 2. Placar dos vídeos (`sistema`)

**Para quê:** trocar o `canais/placar.md` preenchido à mão por um lugar onde ele registra cada vídeo, onde foi postado
e os números, e vê o que rendeu.

**Primeira versão:** cadastro de **Vídeos** (título, canal, duração, pronto para postar) e de **Postagens** (vídeo,
rede, data, visualizações, link); regra "o mesmo vídeo não entra duas vezes na mesma rede"; painel com vídeos prontos
sem postar, visualizações por rede e por vídeo, últimas postagens.

**Depois:** retenção e curtidas; meta por vídeo; importar da planilha do YouTube Studio.

**Precisa:** nada. Os números ele digita (ou vêm da ideia 4).

**Conferido (17/11/2026):** este sistema foi montado como prova do modelo `sistema` só escrevendo o `modelo.mjs`, as
regras e a semente, e as telas saíram prontas (painel com barras por rede, por mês e por vídeo).

## 3. Página do canal, o link da bio (`site`)

**Para quê:** um endereço só para pôr na bio do TikTok, do Instagram e do YouTube, com a cara do canal, os últimos
vídeos e todas as redes. Substitui serviços de "link na bio".

**Primeira versão:** uma página por canal (O Truque da Física; Tamanho Formiga): nome, uma frase, botões grandes para
cada rede, de 3 a 6 vídeos em destaque com capa e link. Estilo `vibrante`.

**Depois:** versão em inglês; os vídeos em destaque atualizados sozinhos (o robô da ideia 1 escreve um arquivo que o
site lê).

**Precisa:** as capas dos vídeos (ele tem), os links das redes, repositório público.

**Cuidado:** nada de logo ou imagem que não seja dele. Página de bio é aberta no celular, dentro do navegador do
aplicativo: testar o toque e o tamanho dos botões na folha de telas.

## 4. Números do YouTube sozinhos (`robo`)

**Para quê:** todo dia, anotar visualizações, curtidas e comentários de cada vídeo dos canais dele numa planilha que
vai acumulando, para ver a curva de cada vídeo sem tirar print.

**Primeira versão:** lista de canais (ou de vídeos) no config; um passo que pede os números; histórico em CSV (uma
linha por vídeo por dia); relatório "o que mais cresceu desde ontem".

**Precisa:** uma chave de API do YouTube (grátis, criada por ele no Google Cloud, no mesmo projeto que já usa para a
voz, ou em outro). Entra como segredo (`ctx.segredo`).

**Conferido (17/11/2026):** a YouTube Data API tem cota padrão de 10.000 unidades por dia, e consultar vídeos
(`videos.list`) custa 1 unidade por chamada, com até 50 vídeos por chamada; dado público só precisa de chave, sem
login (developers.google.com/youtube/v3).

**A confirmar:** retenção e tempo de exibição **não** vêm por esta API (são da YouTube Analytics API, que exige login
do dono do canal): para isso continuam os prints do Studio. O passo a passo atual para criar a chave no console do
Google. Se a busca (`search.list`) tem limite próprio menor: evitar busca, listar pelos envios do canal.

## 5. Calendário de postagens (`sistema`)

**Para quê:** saber o que postar hoje, em qual rede, e o que já foi. Hoje isso está espalhado nos `publicacao.md` de
cada vídeo.

**Primeira versão:** cadastro de **Postagens planejadas** (vídeo, rede, data, situação: a postar, postado, pulado;
link depois de postado); painel com "para hoje", "atrasadas" e "esta semana"; filtro por rede e por canal.

**Depois:** guardar a legenda pronta de cada rede no próprio registro (texto longo), para copiar e colar.

**Precisa:** nada.

**Cuidado:** não é para postar sozinho. Postar por programa exige aprovação de cada plataforma e não tem volta; o
sistema só organiza.

## 6. Portfólio no padrão da fábrica (adotar)

**Para quê:** o repositório `portfolio` já existe e funciona; falta o que faz qualquer conversa futura saber mexer
nele sem estragar: painel, ficha, fiscal e folha de telas.

**Primeira versão:** `criar.mjs --adotar` no repositório, com `--tipo site`; preencher `PAINEL.md` e `FICHA.md` com o
que o site já é; resolver o que o fiscal apontar (imagens pesadas, textos alternativos, contraste), um item por vez.

**Cuidado:** adotar **não** reescreve o site nem muda o desenho. As páginas dele ficam na raiz, e não em `site/`:
conferir se o fiscal e a folha de telas precisam de ajuste de caminho antes de prometer.

## 7. Clientes e projetos (`sistema`)

**Para quê:** quem é o cliente, quanto vale cada trabalho, o prazo, o que está atrasado e quanto falta receber.

**Primeira versão:** é o exemplo que vem no modelo `sistema` (Clientes e Projetos, com situação, valor, prazo, e o
painel de atrasados, a receber e recebido). Basta ajustar os campos às palavras dele e tirar a marca de exemplo.

**Depois:** parcelas; horas gastas; recibo.

## 8. Banco de pautas com busca (`sistema`)

**Para quê:** o `banco-de-pautas.md` do projeto de vídeos cresce e fica difícil de consultar. Aqui cada pauta é um
registro: dá para filtrar por canal e situação e ver quantas estão prontas.

**Primeira versão:** cadastro de **Pautas** (título, canal, gancho, frase da capa, situação: ideia, pesquisada,
roteirizada, feita; fatos conferidos em texto longo; fontes); painel com pautas prontas por canal.

**Cuidado:** os agentes do projeto de vídeos leem o `banco-de-pautas.md`. Enquanto isso não mudar lá, este sistema é
um espelho para o dono consultar, e o arquivo continua sendo a fonte. Combinar antes quem manda.

## 9. Vigia de links das descrições (`robo`)

**Para quê:** as descrições dos vídeos citam fontes e créditos. Link que sai do ar passa vergonha e pode derrubar um
crédito obrigatório. O robô confere todos de tempos em tempos.

**Primeira versão:** lê os `publicacao.md` (ou uma lista de endereços no config); pede cada link; relatório com os que
não respondem ou mudaram de endereço.

**Cuidado:** pedir devagar (um por vez, com pausa) e aceitar que alguns sites bloqueiam robô: marcar como "não deu
para conferir", não como "quebrado".

## 10. Painel de gastos com voz (`robo`)

**Para quê:** o projeto de vídeos registra cada fala paga em `canais/gastos-voz.jsonl` e tem limite de R$ 5 por mês.
Um relatório mensal fácil de abrir mostra quanto foi, em quais vídeos e quanto falta para o limite.

**Primeira versão:** lê o arquivo de gastos; soma por mês e por vídeo; relatório com barra de "usado do limite".

**Cuidado:** já existe `npm run gastos` no projeto de vídeos. Ver antes se um relatório melhor **lá dentro** não
resolve; projeto separado só se ele quiser ver junto com outros gastos.

## 11. Acervo de referências (`sistema`)

**Para quê:** guardar as referências visuais e de edição (link, canal, por que é boa, onde usar) com busca, em vez de
uma lista em arquivo.

**Primeira versão:** cadastro de **Referências** (título, link, tipo: gancho, transição, capa, cena 3D, som; canal de
origem; o que aprender; já usei em); filtro por tipo.

**Cuidado:** guardar o **link** e a anotação, nunca a imagem ou o vídeo dos outros.

## 12. Página de serviço de edição (`site`)

**Para quê:** se ele quiser oferecer edição ou motion para terceiros: uma página que explica o serviço, mostra
trabalhos e leva ao WhatsApp.

**Primeira versão:** o próprio modelo `site` (o texto de exemplo já é de um estúdio de vídeo): título, 3 serviços, 4
trabalhos, como funciona, perguntas, contato. Estilo `editorial` ou `vibrante`.

**Precisa:** trabalhos que ele possa mostrar (dele, ou de cliente com autorização), preço ou "a partir de", número do
WhatsApp.

## 13. Radar de assuntos (`robo`)

**Para quê:** achar pautas com procura: quais assuntos de física e de bichos estão sendo mais lidos.

**Primeira versão:** uma lista de assuntos no config; o robô anota quantas vezes a página de cada um foi lida na
Wikipédia em português e em inglês; relatório com o que subiu.

**A confirmar:** a Wikimedia oferece uma API pública de visitas por página (Pageviews), sem chave; conferir o endereço
atual e as regras de uso (pedem identificação no pedido e moderação). O Google Trends não tem API oficial aberta:
não contar com ele.

## 14. Mini-jogo de física (`livre`)

**Para quê:** um joguinho de navegador ligado a um episódio (acertar a curva da bola, sair da areia movediça), para
pôr o link no comentário fixado e na bio.

**Primeira versão:** uma fase, um controle (arrastar ou tocar), placar, funciona no celular; mesmo visual do canal.

**Cuidado:** não tem modelo pronto: vai pelo `livre`, é mais conversa e mais teste. Jogo original, com a mecânica do
episódio; nada de recriar jogo existente. Só vale depois de um canal ter público que clique em link.
