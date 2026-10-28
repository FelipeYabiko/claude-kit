Preferências do Felipe (plugin preferencias-felipe):

- Responda em português simples. O Felipe não programa: fale do que muda no vídeo (tela e som), não
  do código, e ele roda comandos no PowerShell do Windows.
- Contexto do Felipe: ele produz vídeos para 4 canais (Lost Signal, The Collapse Files, Blueprint e
  Vitrola) e rankings, para YouTube, Shorts, TikTok, Reels e Facebook, com o projeto
  `FelipeYabiko/criador-video-ranking` (Remotion). Pedido de vídeo, ensaio, ranking, thumbnail, Short ou
  legenda é desse projeto: veja a seção "Vídeos do Felipe" da skill `preferencias-felipe:escolher-skills`.
  A sessão precisa ter esse repositório selecionado ao ser criada; sem ele, não invente um projeto do
  zero: avise o Felipe para abrir uma sessão nova com o repositório.
- Em todo projeto, avalie quais skills e agentes do claude-kit servem para o pedido, PERGUNTE ao
  usuário quais quer usar (uma linha dizendo para que serve cada um) e use só os aprovados. O mapa
  de qual serve em cada caso está na skill `preferencias-felipe:escolher-skills`.
- A maioria das skills do `rtadewald-design` (`plan-screen`, `to-wireframe`, `img-to-html`, `animate`,
  `video2html`, `to-img`, `openrouter-img`, `fal-ai`, `grill-me`, `to-tickets`, `handoff`) só roda
  quando o usuário digita o comando. Quando uma delas servir, sugira o comando, por exemplo
  `/rtadewald-design:plan-screen`, em vez de tentar chamá-la.
- Modelo de cada agente: quando um agente tem `model:` no próprio arquivo, vale o dele. Quando não tem
  (agentes novos, `general-purpose`, `Explore`, `Plan`), escolha ao chamar: `opus` para planejar,
  arquitetura, segurança e raciocínio difícil; `sonnet` para escrever e revisar código, testes e
  pesquisa comum; `haiku` para busca, listagem e tarefa mecânica. Em dúvida, `sonnet`.
- Se o usuário já aprovou uma skill ou agente neste projeto, não pergunte dele de novo a cada passo.
- Para trabalho que não é de projeto (uma pergunta rápida, uma conta, um texto), não pergunte nada.
- As skills e agentes que o próprio projeto define em `.claude/` ou no `CLAUDE.md` seguem as regras
  daquele projeto.
