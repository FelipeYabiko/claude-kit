# {{NOME}}

{{DESCRICAO}}

Projeto criado pela Fábrica de projetos do claude-kit em {{DATA}} (tipo `{{TIPO}}`). O dono (Felipe) não programa:
responda sempre em português simples e explique o que muda **para quem usa** (a tela, o arquivo, o resultado), não o
código. Ele roda comandos no PowerShell do Windows.

## Antes de mexer em qualquer coisa

1. Leia `PAINEL.md` (estado e o que falta) e `FICHA.md` (o combinado: o que o projeto é e o que **não** é).
2. Leia `docs/regras-de-ouro.md` inteiro. O `docs/aprendizados.md` é biblioteca: busque só o assunto do momento.
3. Mudança nova: siga `docs/manual.md` etapa por etapa (a skill `mudanca` deste projeto faz isso). Não pule etapa nem
   troque a ordem: cada uma evita um erro que já aconteceu.

## Regras que não se discutem

- **A ficha manda.** Só se constrói o que está na `FICHA.md`. Pedido fora dela: pergunte, e com o sim atualize a
  ficha antes do código. Sem "já que estou aqui".
- **Uma mudança por conversa**, pequena, que termina funcionando. Mudança grande vira lista em "Falta fazer" do
  painel e é feita uma por vez.
- **Prove antes de dizer que ficou pronto:** `npm run verificar` sem erro e, se mexeu em tela, `npm run telas` com as
  folhas abertas e olhadas. Diga ao dono também o que **não** ficou bom ou não foi testado.
- **Sem dependência nova sem o OK do dono.** O projeto roda sem instalar nada de propósito. O gancho bloqueia
  `npm install <pacote>` enquanto o pacote não estiver em "Dependências aprovadas" da ficha.
- **Não mexa no fiscal para ele passar** nem nos ganchos de `.claude/hooks/`: corrija o projeto. Regra nova só deste
  projeto vai em `ferramentas/fiscal/regras-do-projeto.mjs`, com teste.
- **Segredo nunca no código:** chave e senha ficam no `.env` (fora do git) ou nos segredos do ambiente da nuvem.
- **Nomes, comentários e mensagens em português**, no estilo do código em volta; comentário curto que explica o porquê.
- **Erro corrigido pela segunda vez vira regra do fiscal** (em comando não é esquecida; em texto é).

## Fechar a mudança (sempre, antes de dizer que acabou)

1. `npm run verificar` sem erro; antes de entregar ou publicar, `npm run fiscal -- --final`.
2. `docs/diario.md`: uma entrada com a data, o que mudou para quem usa e o que ficou faltando.
3. Lição que vale para toda mudança vai para `docs/regras-de-ouro.md`; detalhe, para `docs/aprendizados.md`.
4. `PAINEL.md` atualizado (estado, "Falta fazer" e a data).
5. Commit e envio seguindo a skill `aprendizado:commits-limpos` (autor é o Felipe, sem assinatura do Claude; `main` só
   com o OK dele). O gancho roda o `npm run verificar` antes de todo commit e trava se falhar.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run verificar` | fiscal + testes; roda sozinho antes de cada commit |
| `npm run fiscal` | só o fiscal, com os avisos (`-- --final` antes de entregar) |
| `npm test` | só os testes |
{{>PARTE}}

## Onde fica cada coisa

| O quê | Onde |
|---|---|
| Estado do projeto e o que falta | `PAINEL.md` |
| O combinado com o dono | `FICHA.md` |
| Passo a passo de uma mudança | `docs/manual.md` |
| Regras de qualidade (lidas sempre) | `docs/regras-de-ouro.md` |
| Lições guardadas (busca por assunto) | `docs/aprendizados.md` |
| Histórico das mudanças | `docs/diario.md` |
| Fiscal e ferramentas | `ferramentas/` (regras só deste projeto: `ferramentas/fiscal/regras-do-projeto.mjs`) |
| Travas automáticas | `.claude/hooks/` |
