| `npm run ensaio` | roda o robô sem gravar nem enviar nada: mostra o que faria |
| `npm start` | roda o robô de verdade, uma vez |

## Como este robô é feito

- **O trabalho está em `passos/`**, um arquivo por passo, na ordem do número (`1-buscar`, `2-separar`,
  `3-entregar`). Cada passo exporta `descricao` e `rodar(entrada, ctx)`: recebe a saída do passo anterior e devolve a
  entrada do próximo.
- **Passo não mexe em arquivo nem na internet por conta própria.** Usa o `ctx`: `ctx.rede.buscarTexto/buscarJson`,
  `ctx.escrever/acrescentar/lerArquivo`, `ctx.memoria.ler/guardar`, `ctx.segredo('NOME')`, `ctx.registro('texto')`.
  É isso que faz o modo ensaio, os testes sem internet e o registro funcionarem. O fiscal trava passo com `fetch`,
  `fs` ou `process.env`.
- **Sempre `npm run ensaio` antes de `npm start`**, e sempre antes de qualquer passo que envie algo para fora.
- **A memória** (`estado/memoria.json`) guarda o que já foi visto. Só é gravada quando todos os passos dão certo: se o
  robô cair no meio, a próxima rodada recomeça do mesmo ponto.
- **O que muda sem programar fica em `config.json`** (fontes, limites). Segredo nunca vai lá: `.env` no computador,
  "Secrets" no GitHub, e o nome listado no `.env.exemplo`.
- **`lib/executar.mjs` e `lib/rede.mjs` são o motor da fábrica: não mexa.** Ferramenta nova do projeto (ler outro
  formato, montar outro relatório) vai em `lib/` com outro nome, com teste.
- **Todo passo tem teste** em `tests/passos.test.mjs`, com a internet trocada por um faz de conta.
- **Agendar** é uma decisão do dono: no computador (dois cliques ou Agendador de Tarefas do Windows) ou no GitHub
  (`.github/workflows/agendar.yml`, que vem desligado).
