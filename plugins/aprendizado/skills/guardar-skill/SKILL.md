---
name: guardar-skill
description: Guarda como skill permanente uma lição, um jeito de fazer ou uma regra (vinda de um vídeo, de uma conversa, de um documento ou de uma correção do Felipe) e salva no GitHub para valer em todas as sessões e projetos. Use quando o Felipe disser "guarda isso", "salva como skill", "lembra disso sempre", "faz assim daqui pra frente", quando ele corrigir o mesmo ponto pela segunda vez, ou quando a skill aprender-com-video mandar guardar.
---

# Guardar skill

Transforma o que foi aprendido numa skill de verdade, salva no lugar certo e faz com que ela passe a
valer nas próximas sessões. A conversa acaba e é esquecida; a skill fica.

## 1. Decidir onde guardar

| A lição vale para... | Guarde em | Repositório |
|---|---|---|
| Qualquer projeto (jeito de pesquisar, de escrever, preferência geral) | `plugins/aprendizado/skills/<nome>/SKILL.md` | `FelipeYabiko/claude-kit` |
| Um projeto só (ex.: regra de edição dos vídeos dos canais) | `.claude/skills/<nome>/SKILL.md` | o repositório do projeto, ex.: `FelipeYabiko/criador-video-ranking` |

Lição de vídeo dos canais costuma ser do projeto `criador-video-ranking`: lá, as regras e skills do
próprio projeto mandam, então é lá que ela deve morar. Se não der para saber onde, pergunte em uma
linha.

## 2. Ver se já existe

Procure uma skill parecida: as que aparecem nesta sessão, o `plugins/aprendizado/CATALOGO.md` do
claude-kit e o `.claude/skills/` do projeto. Se existir, **atualize essa skill** em vez de criar
outra. Duas skills quase iguais confundem a escolha e gastam espaço em toda sessão.

## 3. Escrever

Siga o modelo de `referencias/modelo.md`. O mais importante:

- **`name`:** minúsculas com hífen, em português, curto. Exemplos: `gancho-primeiros-segundos`,
  `ritmo-de-cortes-documentario`.
- **`description`:** é ela que faz a skill ser usada na hora certa. Diga o que a skill faz e **em que
  situações usar**, com as palavras que o Felipe usaria. Seja insistente: "Use sempre que...".
- **Corpo:** curto, de preferência até ~150 linhas. Explique o porquê de cada regra, porque assim ela
  funciona melhor em casos novos. Dê um exemplo concreto. Sem comandos que você não entende.
- **Origem:** de onde veio a lição e quando.

## 4. Mostrar e esperar o OK

Mostre ao Felipe, em português simples, **o que muda no trabalho dele** com essa skill (tela, som,
roteiro), e não o arquivo. Ofereça mostrar o texto inteiro se ele quiser. Só salve com o OK.

## 5. Salvar no GitHub

1. **Repositório na sessão:** se o repositório de destino não estiver nesta sessão, chame `add_repo`
   (owner `FelipeYabiko`, o repo do destino, `access: "push"`) e clone como o resultado mandar.
2. **Branch:** use o branch de trabalho da sessão quando ele for desse repositório; se não, crie
   `aprendizado/<nome>` a partir da `main`.
3. **Arquivos, no claude-kit:**
   - a skill em `plugins/aprendizado/skills/<nome>/SKILL.md`;
   - uma linha no `plugins/aprendizado/CATALOGO.md`;
   - `version` de `plugins/aprendizado/.claude-plugin/plugin.json` aumentada no último número
     (0.1.0 → 0.1.1). Sem isso, as sessões não percebem a mudança.
   - Rode `claude plugin validate .` na raiz do repositório, se o comando existir, e corrija o que
     ele apontar.
4. **Arquivos, num projeto:** a skill em `.claude/skills/<nome>/SKILL.md`, seguindo as regras do
   `CLAUDE.md` do projeto.
5. **Commit e push:** mensagem `feat(aprendizado): skill <nome>` ou `feat(aprendizado): atualiza
   <nome>`, depois `git push -u origin <branch>`.
6. **Valer em todo lugar:** só a `main` vale para as sessões. Pergunte: "Posso colocar na `main` para
   valer nas próximas sessões?" Com o sim, envie para a `main`. Se não der para enviar direto, abra
   um pull request e mande o link para ele aprovar.

## 6. Contar ao Felipe

Diga em poucas linhas:
- o nome da skill e em que situação ela vai aparecer;
- **claude-kit:** ela entra nas sessões novas. Se o **Sync automatically** do marketplace `claude-kit`
  estiver ligado em claude.ai/customize/plugins, é automático. Se não, ele abre essa página, entra no
  `claude-kit` e clica em **Check for updates**;
- **projeto:** ela vale nas sessões novas daquele repositório.

Lembre também que cada skill instalada ocupa um pouco de espaço em toda sessão. Se o kit crescer
muito, a skill `aprendizado:recomendar-skills` ajuda a juntar ou tirar as que não são usadas.
