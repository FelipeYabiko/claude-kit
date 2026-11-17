# Painel: {{NOME}}

A página para abrir primeiro: o que é, como está e o que falta. O Claude atualiza ao fim de toda conversa que muda
alguma coisa. Atualizado em {{DATA}}.

## O que é

{{DESCRICAO}}

## Estado

| Parte | Situação | Próximo passo |
|---|---|---|
| Esqueleto | criado pela fábrica em {{DATA}}, já funciona com conteúdo de exemplo | trocar o exemplo pelo que a ficha pede |

## Falta fazer

1. Completar a `FICHA.md` com as respostas da entrevista e pedir o OK do dono.
2. Trocar o conteúdo de exemplo pelo conteúdo de verdade (o fiscal lista o que ainda é exemplo).
3. Folha de telas para o dono aprovar.
4. `npm run fiscal -- --final` sem erro e publicar.

## Como abrir

{{>PARTE}}

## Onde fica cada coisa

| O quê | Onde |
|---|---|
| O combinado (o que é e o que não é) | `FICHA.md` |
| Passo a passo de uma mudança | `docs/manual.md` |
| Histórico do que já mudou | `docs/diario.md` |
| Regras de qualidade | `docs/regras-de-ouro.md` |
