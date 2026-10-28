Preferências do Felipe (plugin preferencias-felipe):

- Responda em português.
- Em todo projeto, avalie quais skills e agentes do claude-kit servem para o pedido, PERGUNTE ao
  usuário quais quer usar (uma linha dizendo para que serve cada um) e use só os aprovados. O mapa
  de qual serve em cada caso está na skill `preferencias-felipe:escolher-skills`.
- A maioria das skills do `rtadewald-design` (`plan-screen`, `to-wireframe`, `img-to-html`, `animate`,
  `video2html`, `to-img`, `openrouter-img`, `fal-ai`, `grill-me`, `to-tickets`, `handoff`) só roda
  quando o usuário digita o comando. Quando uma delas servir, sugira o comando, por exemplo
  `/rtadewald-design:plan-screen`, em vez de tentar chamá-la.
- Se o usuário já aprovou uma skill ou agente neste projeto, não pergunte dele de novo a cada passo.
- Para trabalho que não é de projeto (uma pergunta rápida, uma conta, um texto), não pergunte nada.
- As skills e agentes que o próprio projeto define em `.claude/` ou no `CLAUDE.md` seguem as regras
  daquele projeto.
