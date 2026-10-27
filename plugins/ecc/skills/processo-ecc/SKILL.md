---
name: processo-ecc
description: Processo de desenvolvimento ECC (pesquisar e planejar, TDD, revisão por agentes, conventional commits, PR). Use ao começar ou mudar código num projeto, quando o usuário falar em ECC, ou antes de commitar, para seguir as regras de estilo, testes, segurança e git.
---

# Processo ECC (essencial)

Recorte do [ECC](https://github.com/affaan-m/ECC) (MIT, © Affaan Mustafa). As regras completas estão em
`regras/` ao lado deste arquivo: leia as de `common/` e as da linguagem do projeto (`python/`,
`typescript/`, `web/`) antes de escrever código.

Se o projeto tiver as próprias regras (`.claude/rules/`, `CLAUDE.md`), elas valem mais que estas.

## Fluxo

1. **Pesquisar e planejar.** Para qualquer coisa maior que um ajuste pequeno, reescreva o pedido,
   liste riscos e fases e ESPERE o OK do usuário antes de mexer no código (agente `ecc:planner`).
2. **TDD.** Teste que falha primeiro, depois o código (agente `ecc:tdd-guide`). Cobertura >= 80%.
3. **Revisão.** Depois de escrever código, rode `ecc:code-reviewer` e o revisor da linguagem
   (`ecc:python-reviewer` em Python). Para entrada do usuário, SQL, arquivos, rede ou subprocessos,
   rode também `ecc:security-reviewer`. Corrija os achados CRITICAL e HIGH.
4. **Verificações antes do commit.** Lint, formatação, tipos, análise de segurança e testes, com as
   ferramentas que o projeto já usa.
5. **Git.** Conventional commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`, `ci:`,
   `perf:`), uma branch por mudança, PR com resumo e plano de testes.

## Onde está cada regra

| Assunto | Arquivo |
|---|---|
| Fluxo completo | `regras/common/development-workflow.md` |
| Estilo, imutabilidade, tamanho de arquivos e funções | `regras/common/coding-style.md` |
| Testes e TDD | `regras/common/testing.md` |
| Revisão e níveis de gravidade | `regras/common/code-review.md` |
| Segurança | `regras/common/security.md` |
| Commits e PR | `regras/common/git-workflow.md` |
| Agentes e paralelismo | `regras/common/agents.md` |
| Python | `regras/python/*.md` |
| TypeScript / JavaScript | `regras/typescript/*.md` |
| Sites e front-end (inclui qualidade de design) | `regras/web/*.md` |

Os outros agentes que as regras citam (`architect`, `build-error-resolver`, `e2e-runner`, revisores de
outras linguagens) não estão neste recorte. Quando a regra mandar usá-los, faça o trabalho você mesmo.
