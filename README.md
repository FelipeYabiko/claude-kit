# claude-kit

Meu marketplace de plugins do Claude Code. Instalado uma vez, vale em todas as sessões.

| Plugin | O que traz | Custo fixo por sessão |
|---|---|---|
| `preferencias-felipe` | Ganchos de início de sessão e de cada mensagem: responder em português e usar as skills e agentes instalados quando se aplicam, perguntando antes só do processo ECC completo e do pipeline de design. Traz a skill `escolher-skills`, um mapa de qual skill ou agente usar em cada caso. | ~200 tokens + ~60 por mensagem |
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

## Como as skills são escolhidas

O Claude já vê a descrição de cada skill instalada e ativa a que combina com o pedido. O
`preferencias-felipe` reforça isso: a cada mensagem, um gancho lembra de conferir se alguma skill ou
agente se aplica, e a skill `escolher-skills` tem o mapa para quando mais de uma serve. Para mudar o
que é usado direto e o que pede confirmação, edite
`plugins/preferencias-felipe/skills/escolher-skills/SKILL.md` e `plugins/preferencias-felipe/hooks/lembrete.md`.

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

- `ecc` e `preferencias-felipe` moram aqui: edite e faça push; depois `/plugin marketplace update claude-kit`.
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
