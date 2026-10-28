# claude-kit

Meu marketplace de plugins do Claude Code. Instalado uma vez, vale em todas as sessões.

| Plugin | O que traz | Custo fixo por sessão |
|---|---|---|
| `preferencias-felipe` | Ganchos de início de sessão e de cada mensagem: responder em português e, em projeto, avaliar quais skills e agentes servem, perguntar quais você quer usar e usar só os aprovados. Traz a skill `escolher-skills`, um mapa de qual skill ou agente usar em cada caso. | ~200 tokens + ~60 por mensagem |
| `ecc` | ECC essencial: agentes `planner`, `tdd-guide`, `code-reviewer`, `python-reviewer` e `security-reviewer`, mais a skill `processo-ecc` com as regras `common`, `python`, `typescript` e `web`. | ~500 tokens |
| `rtadewald-design` | 14 skills de [rtadewald/skills](https://github.com/rtadewald/skills), lidas direto de lá: `plan-screen`, `to-wireframe`, `img-to-html`, `animate`, `extract-ds`, `video2html`, `nano-banana-pro`, `to-img`, `openrouter-img`, `fal-ai`, `mediabunny`, `grill-me`, `to-tickets`, `handoff`. | ~1.600 tokens |

## Instalar

**Claude Code no computador** (terminal):

```
/plugin marketplace add FelipeYabiko/claude-kit
/plugin install preferencias-felipe@claude-kit
/plugin install ecc@claude-kit
/plugin install rtadewald-design@claude-kit
```

**Automático no computador:** o `.claude/settings.json` deste repositório registra o marketplace e
ativa os três plugins quando você abre o projeto no Claude Code do computador (terminal, app ou IDE).
O Claude Code pede para confiar na pasta e instalar os plugins na primeira vez. Para ter o mesmo em
outro projeto, copie o arquivo para o `.claude/` dele; para valer em todos os projetos do computador,
junte o mesmo conteúdo ao `~/.claude/settings.json`.

> Esse arquivo **não vale nas sessões na nuvem**: elas não instalam os plugins que o
> `.claude/settings.json` de um repositório ativa.

**Sessões na nuvem (claude.ai/code e app) e chat do claude.ai:** instale pela conta do claude.ai. Os
plugins da conta entram sozinhos em toda sessão nova, em qualquer repositório.

1. Abra [Customize → Plugins](https://claude.ai/customize/plugins).
2. Clique em **Add → Add marketplace** (não use a busca do **Discover**: ela só mostra o diretório
   oficial e os marketplaces já adicionados).
3. Digite `FelipeYabiko/claude-kit` e confirme.
4. Abra `preferencias-felipe`, `ecc` e `rtadewald-design` e clique em **Add** em cada um.
5. Opcional: ligue **Sync automatically** no marketplace para receber as mudanças deste repositório.

No chat do claude.ai entram só as skills; ganchos e agentes funcionam no Claude Code e no Cowork.

## Como usar no dia a dia

Não precisa fazer nada especial: peça o que quer, do jeito normal, e o Claude escolhe a ferramenta.
O Claude já vê a descrição de cada skill instalada e ativa a que combina com o pedido; o
`preferencias-felipe` reforça isso com um gancho que, a cada mensagem, lembra de avaliar quais skills
e agentes servem e de perguntar quais você quer usar, e a skill `escolher-skills` tem o mapa para quando mais de uma serve.

### Quem ativa cada coisa

| Tipo | Quem ativa | Exemplo |
|---|---|---|
| Skills (a maioria) | O Claude, sozinho, quando o pedido combina | "faz uma planilha disso" → `xlsx` |
| Agentes do ECC | O Claude, durante o trabalho | depois de escrever código → `ecc:code-reviewer` |
| 11 skills do `rtadewald-design` | Você, digitando o comando que o Claude sugere | `/rtadewald-design:plan-screen` |

As skills só por comando são `plan-screen`, `to-wireframe`, `img-to-html`, `animate`, `video2html`,
`to-img`, `openrouter-img`, `fal-ai`, `grill-me`, `to-tickets` e `handoff`: o autor bloqueou a
chamada pelo Claude.

### Quando o Claude pergunta antes

Em todo trabalho de projeto: o Claude avalia quais skills e agentes do kit servem, lista cada um com
uma linha dizendo para que serve e usa só os que você aprovar. Depois de um sim no projeto, ele não
pergunta do mesmo de novo. Pedido rápido, pergunta ou conta não gera pergunta nenhuma, e as skills e
agentes que o próprio projeto define em `.claude/` ou no `CLAUDE.md` seguem as regras daquele projeto.

### Exemplos

| Você pede | O que acontece |
|---|---|
| "Cria um app de tarefas em Python" | Pergunta quais usar (ECC, planner, tdd-guide, revisores...); com sim: plano → seu OK → testes primeiro → código → revisores → commit |
| "Arruma esse bug" | Pergunta se quer `tdd-guide` e revisor; com sim: teste que reproduz o bug, correção, revisão |
| "Quero uma landing page" | Sugere `/rtadewald-design:plan-screen` e, a cada etapa, o próximo comando |
| "Transforma esse relatório em PDF" | Pergunta se pode usar `pdf` e segue com o que você aprovar |
| Pergunta rápida | Responde direto, sem ferramenta |

### Atalhos

- Digite `/` no campo de mensagem para ver todas as skills e comandos.
- Para forçar uma skill ou agente, cite pelo nome: "usa o processo ECC", "revisa com o security-reviewer".
- Para não usar nada: "responde só, sem skill".

### Onde funciona

| Onde | O que entra |
|---|---|
| Claude Code (nuvem e computador) e Cowork | Tudo: skills, agentes e ganchos |
| Chat do claude.ai | Só as skills |

Skills de imagem e vídeo precisam das [chaves de API](#chaves-de-api).

### Mudar o comportamento

- Qual skill usar em cada caso: `plugins/preferencias-felipe/skills/escolher-skills/SKILL.md`.
- Regras gerais e a pergunta de quais skills usar: `plugins/preferencias-felipe/hooks/lembrete.md`.
- Depois, veja [Atualizar](#atualizar). Ou peça ao Claude numa sessão deste repositório para editar e
  fazer o merge.

## Chaves de API

Algumas skills de design chamam serviços pagos. Sem a chave, elas não funcionam, mas as outras sim.

| Skill | Variável |
|---|---|
| `nano-banana-pro`, `video2html` | `GEMINI_API_KEY` |
| `to-img`, `openrouter-img` | `OPENROUTER_API_KEY` |
| `fal-ai` | `FAL_KEY` |

Na nuvem, coloque as chaves nas variáveis do ambiente (menu do ambiente → Editar). No computador, nas
variáveis de ambiente do sistema.

## Atualizar

- `ecc` e `preferencias-felipe` moram aqui: edite, aumente `version` no `plugin.json` do plugin e faça
  merge na `main`. Na conta do claude.ai, abra o marketplace `claude-kit` em
  [Customize → Plugins](https://claude.ai/customize/plugins) e clique em **Check for updates** (ou
  deixe **Sync automatically** ligado). No computador, rode `/plugin marketplace update claude-kit`.
  A versão nova entra na próxima sessão.
- `rtadewald-design` é lido do repositório original. Para pegar a versão nova, aumente `version` dele em
  `.claude-plugin/marketplace.json` e rode o mesmo update.
- Para trazer mais coisas do ECC completo, copie de [affaan-m/ECC](https://github.com/affaan-m/ECC)
  os agentes para `plugins/ecc/agents/` e as regras para `plugins/ecc/skills/processo-ecc/regras/`.
  Ou instale o ECC inteiro (`/plugin marketplace add affaan-m/ECC`), sabendo que ele traz 71 agentes e
  311 skills.

Valide antes do push: `claude plugin validate .`

## Créditos

- `plugins/ecc`: recorte do [ECC](https://github.com/affaan-m/ECC), © Affaan Mustafa, licença MIT
  (`plugins/ecc/LICENSE`).
- `rtadewald-design`: as skills ficam no repositório de [rtadewald](https://github.com/rtadewald/skills)
  e não são copiadas para cá; este kit só aponta para elas.
