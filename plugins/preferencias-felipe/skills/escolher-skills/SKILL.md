---
name: escolher-skills
description: Mapa de qual skill ou agente usar para cada tipo de pedido do Felipe (código, revisão, testes, segurança, planos, telas, imagens, animação, documentos, planilhas, PDF, pesquisa), para perguntar quais ele quer usar. Use quando não estiver claro qual skill ou agente instalado se aplica, quando o pedido combina várias etapas, ou quando o usuário perguntar quais skills usar.
---

# Escolher skills

As skills instaladas já aparecem para o Claude com a descrição de cada uma. Este mapa serve para
achar quais combinam com o pedido, principalmente quando mais de uma serve, ou nenhuma parece servir
à primeira vista. Em projeto, o Claude pergunta quais usar antes de começar.

## Como decidir

1. Leia o pedido e ache a linha da tabela que combina. Pode ser mais de uma: siga a ordem do fluxo.
2. Liste as skills e os agentes instalados que servem e pergunte ao usuário quais quer usar, com uma
   linha dizendo para que serve cada um. Use só os aprovados. Se o usuário já aprovou um deles neste
   projeto, não pergunte dele de novo.
3. Os itens marcados com **(API paga)** gastam créditos: deixe isso claro na linha da pergunta.
4. Itens marcados com **(comando)** só rodam quando o usuário digita o comando: o autor bloqueou a
   chamada pelo Claude. Não tente carregar a skill. Diga em uma linha qual comando serve e por quê,
   por exemplo: "Para planejar essa tela, digite `/rtadewald-design:plan-screen`". Se o usuário não
   quiser, siga sem ela.
5. Se o item não estiver instalado nesta sessão, siga sem ele e avise em uma linha qual faltou.
6. Pedido rápido, uma pergunta ou uma conta, que não é trabalho de projeto: não use nada disto e não
   pergunte nada, responda direto.
7. As skills e agentes que o próprio projeto define em `.claude/` ou no `CLAUDE.md` seguem as regras
   daquele projeto, não esta pergunta.

## Mapa

### Código

| Situação | Use |
|---|---|
| Começar projeto ou mudança grande de código | skill `ecc:processo-ecc` |
| Planejar feature, refatoração ou arquitetura | agente `ecc:planner` (ou skill `writing-plans`) |
| Escrever feature, corrigir bug | agente `ecc:tdd-guide` (teste antes do código) |
| Depois de escrever código | agente `ecc:code-reviewer`; em Python também `ecc:python-reviewer` |
| Código com entrada do usuário, auth, SQL, arquivos, rede, segredos | agente `ecc:security-reviewer` |
| Recebeu review de outra pessoa ou bot | skill `receiving-code-review` |
| Antes de dizer que terminou, commitar ou abrir PR | skill `verification-before-completion` |
| Afiar um plano ou design com perguntas **(comando)** | `/rtadewald-design:grill-me` |
| Quebrar um plano em tickets **(comando)** | `/rtadewald-design:to-tickets` |
| Passar o trabalho para outra sessão ou agente **(comando)** | `/rtadewald-design:handoff` |

### Telas, imagens e animação

| Situação | Use |
|---|---|
| Planejar tela ou fluxo de app **(comando)** | `/rtadewald-design:plan-screen` |
| Wireframe a partir de imagem ou brief **(comando)** | `/rtadewald-design:to-wireframe` |
| Gerar ou editar imagem com Gemini **(API paga)** | skill `rtadewald-design:nano-banana-pro` |
| Gerar imagem pelo OpenRouter **(comando; usa API paga)** | `/rtadewald-design:to-img` ou `/rtadewald-design:openrouter-img` |
| Transformar mock em imagem em HTML **(comando)** | `/rtadewald-design:img-to-html` |
| Animações para site **(comando)** | `/rtadewald-design:animate` |
| Montar design system de um site pronto | skill `rtadewald-design:extract-ds` |
| HTML animado a partir de imagem + vídeo **(comando; usa API paga)** | `/rtadewald-design:video2html` |
| OCR ou caixas de texto numa imagem **(comando; usa API paga)** | `/rtadewald-design:fal-ai` |
| Manipular áudio ou vídeo no navegador | skill `rtadewald-design:mediabunny` |
| Criticar design, acessibilidade, textos de interface | `design:design-critique`, `design:accessibility-review`, `design:ux-copy` (se instalados) |

Fluxo típico de tela: `/rtadewald-design:plan-screen` → `/rtadewald-design:to-wireframe` → mock em
imagem (`nano-banana-pro`) → `/rtadewald-design:img-to-html` → `/rtadewald-design:animate`. Como a
maioria dos passos é **(comando)**, sugira o próximo comando ao fim de cada etapa.

### Documentos e dados

| Situação | Use |
|---|---|
| Documento para ler, compartilhar ou comentar | skill `docs` |
| Arquivo Word, Excel, PowerPoint ou PDF | `docx`, `xlsx`, `pptx`, `pdf` |
| Google Docs, Sheets ou Slides | `google-workspace` |
| Pesquisa com várias fontes e relatório | `deep-research` |
| Criar ou melhorar uma skill | `skill-creator` |

## Chaves de API

Sem a chave, a skill não roda: avise e ofereça outra opção.

| Skill | Variável |
|---|---|
| `nano-banana-pro`, `video2html` | `GEMINI_API_KEY` |
| `to-img`, `openrouter-img` | `OPENROUTER_API_KEY` |
| `fal-ai` | `FAL_KEY` |
