---
name: escolher-skills
description: Mapa de qual skill ou agente usar para cada tipo de pedido do Felipe (código, revisão, testes, segurança, planos, telas, imagens, animação, documentos, planilhas, PDF, pesquisa). Use quando não estiver claro qual skill ou agente instalado se aplica, quando o pedido combina várias etapas, ou quando o usuário perguntar quais skills usar.
---

# Escolher skills

As skills instaladas já aparecem para o Claude com a descrição de cada uma, e ele as ativa sozinho
quando o pedido combina. Este mapa serve para os casos em que mais de uma serve, ou nenhuma parece
servir à primeira vista.

## Como decidir

1. Leia o pedido e ache a linha da tabela que combina. Pode ser mais de uma: siga a ordem do fluxo.
2. Se a skill ou o agente estiver instalado, use direto. Não precisa anunciar, só diga em uma linha o
   que está usando.
3. Pergunte antes só nos casos marcados com **(perguntar)**: são processos longos ou que gastam
   créditos de API. Se o usuário já disse sim neste projeto, não pergunte de novo.
4. Se o item não estiver instalado nesta sessão, siga sem ele e avise em uma linha qual faltou.
5. Pergunta rápida, conta, texto curto: não use nada disto, responda direto.

## Mapa

### Código

| Situação | Use |
|---|---|
| Começar projeto ou mudança grande de código **(perguntar)** | skill `ecc:processo-ecc` |
| Planejar feature, refatoração ou arquitetura | agente `ecc:planner` (ou skill `writing-plans`) |
| Escrever feature, corrigir bug | agente `ecc:tdd-guide` (teste antes do código) |
| Depois de escrever código | agente `ecc:code-reviewer`; em Python também `ecc:python-reviewer` |
| Código com entrada do usuário, auth, SQL, arquivos, rede, segredos | agente `ecc:security-reviewer` |
| Recebeu review de outra pessoa ou bot | skill `receiving-code-review` |
| Antes de dizer que terminou, commitar ou abrir PR | skill `verification-before-completion` |
| Afiar um plano ou design com perguntas | skill `grill-me` |
| Quebrar um plano em tickets | skill `to-tickets` |
| Passar o trabalho para outra sessão ou agente | skill `handoff` |

### Telas, imagens e animação

| Situação | Use |
|---|---|
| Planejar tela ou fluxo de app **(perguntar)** | `plan-screen` |
| Wireframe a partir de imagem ou brief | `to-wireframe` |
| Gerar ou editar imagem (mock, variação) **(perguntar: usa API paga)** | `nano-banana-pro` (Gemini), `to-img` ou `openrouter-img` (OpenRouter) |
| Transformar mock em imagem em HTML **(perguntar)** | `img-to-html` |
| Animações para site | `animate` |
| Montar design system de um site pronto **(perguntar)** | `extract-ds` |
| HTML animado a partir de imagem + vídeo **(perguntar: usa API paga)** | `video2html` |
| OCR ou caixas de texto numa imagem | `fal-ai` |
| Manipular áudio ou vídeo no navegador | `mediabunny` |
| Criticar design, acessibilidade, textos de interface | `design:design-critique`, `design:accessibility-review`, `design:ux-copy` (se instalados) |

Fluxo típico de tela: `plan-screen` → `to-wireframe` → mock em imagem → `img-to-html` → `animate`.

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
