# claude-kit

Meu marketplace de plugins do Claude Code. Instalado uma vez, vale em todas as sessões.

| Plugin | O que traz | Custo fixo por sessão |
|---|---|---|
| `preferencias-felipe` | Gancho de início de sessão: responder em português; recomendar o ECC e as skills de design no começo de um projeto e perguntar antes de usar. | ~0 tokens |
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

**Sessões na nuvem (claude.ai/code e app):** os plugins ativados na conta do claude.ai entram sozinhos
em toda sessão nova. Adicione este repositório como marketplace nas configurações de plugins do
claude.ai e ative os três.

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
