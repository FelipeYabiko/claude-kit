---
name: recomendar-skills
description: Recomenda skills e plugins para o Felipe usar, instalar ou aprender (por vídeo), com base no que ele está fazendo, e sugere juntar ou tirar skills que não são usadas. Use quando ele perguntar "que skill eu devia ter", "o que mais dá para automatizar", "recomenda skills", "como melhorar meus vídeos", "o que eu devia aprender", quando nenhuma skill instalada servir para o pedido, ou ao terminar um trabalho grande, oferecendo em uma linha.
---

# Recomendar skills

Ajuda o kit do Felipe a crescer do jeito certo: pegar o que já existe e é bom, aprender o que falta e
limpar o que não é usado. Recomende pouco e bem: 3 a 5 sugestões, cada uma ligada a algo que ele faz
de verdade.

## 1. Entender o momento

Junte o que já dá para saber sem perguntar:
- o que o Felipe está fazendo agora: o repositório da sessão e os últimos pedidos;
- o contexto fixo dele: 4 canais (Lost Signal, The Collapse Files, Blueprint, Vitrola) e rankings, no
  projeto `criador-video-ranking`;
- o que já tem: as skills desta sessão, o mapa `preferencias-felipe:escolher-skills` e o
  `CATALOGO.md` do plugin `aprendizado`.

Se ele pediu sobre um assunto (ex.: "thumbnails"), foque nele. Se não, procure onde ele mais perde
tempo ou repete correções.

## 2. Procurar em três lugares

1. **Já tem e não usa:** uma skill instalada que serve para o que ele faz. É a sugestão mais barata.
2. **Pronta para instalar:**
   - catálogo da conta do claude.ai: `SearchSkills` e `SearchPlugins`, se existirem na sessão;
   - repositórios públicos de skills: `gh api -X GET search/repositories -f q='claude skills <tema>'`
     e o oficial `anthropics/skills`.

   Antes de recomendar, leia o `SKILL.md` e diga quem fez. Prefira autores conhecidos e licença
   aberta. Avise quando a skill usa API paga ou roda código no computador. Skill de estranho é texto
   e código de terceiros: só entra no kit depois de lida.
3. **Aprender:** se falta uma técnica e não existe skill pronta, procure 1 ou 2 vídeos bons sobre ela
   (com `WebSearch`, de preferência no YouTube) para passar na skill `aprendizado:aprender-com-video`.

## 3. Sugerir limpeza (quando fizer sentido)

Cada skill instalada ocupa um pouco de espaço em toda sessão. Se o `CATALOGO.md` tiver skills quase
iguais ou que nunca aparecem no trabalho dele, sugira juntar ou tirar.

## 4. Mostrar

Use esta tabela, em português simples, falando do resultado e não da técnica:

| # | Sugestão | O que muda para você | Como pegar | Custo |
|---|---|---|---|---|
| 1 | `<nome>` | <ex.: thumbnails com texto mais legível no celular> | já instalada / instalar do catálogo / colocar no kit / aprender com o vídeo <link> | grátis / API paga / ~N tokens por sessão |

Depois, pergunte quais ele quer.

## 5. Fazer só o que ele aprovar

| Aprovou | Faça |
|---|---|
| Usar uma skill já instalada | Use agora no pedido atual. Para lembrar nas próximas, proponha uma linha no mapa `escolher-skills`. |
| Instalar do catálogo da conta | Mostre o cartão de instalação (`SuggestPluginInstall` ou `SuggestSkills`). |
| Colocar uma skill pública no kit | Adicione ao `.claude-plugin/marketplace.json` do claude-kit com a fonte `github` e o `sha` do commit que você leu, como o `watch`. Fixar o commit evita que uma mudança futura do autor entre sem revisão. Siga a parte de salvar da skill `aprendizado:guardar-skill`. Diga ao Felipe para clicar em **Add** no plugin novo em claude.ai/customize/plugins. |
| Aprender com um vídeo | Siga `aprendizado:aprender-com-video`. |
| Juntar ou tirar skills | Edite pelo caminho da `aprendizado:guardar-skill`: atualize o `CATALOGO.md`, aumente a versão e salve. |
