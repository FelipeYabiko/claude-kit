---
name: novo-projeto
description: Fábrica de projetos - transforma uma ideia do Felipe num projeto novo que já funciona (site, sistema de cadastros, robô que roda sozinho, ou outra coisa), com entrevista, ficha do combinado, modelo pronto, fiscal automático, folha de telas para aprovar e manual passo a passo. Use sempre que ele disser "quero criar", "tenho uma ideia", "faz um site", "faz um sistema", "um app para", "uma ferramenta que", "um robô que", "automatiza isso", "landing page", "controle de", "começar um projeto", pedir para pôr o padrão num projeto que já existe, ou para atualizar as ferramentas de um projeto da fábrica - mesmo que ele não fale em "fábrica". Não é para vídeo dos canais (isso é do projeto criador-video-ranking).
---

# Fábrica de projetos

Projeto novo começa sempre igual: alguém entende errado a ideia, constrói demais, e a conversa seguinte não sabe o
que foi combinado. A fábrica troca isso por um caminho fixo: **entrevista → ficha aprovada → projeto que já roda →
construir pelo manual → folha de telas aprovada → entrega**. O julgamento caro já está nos modelos, no fiscal e nos
manuais; aqui é seguir as etapas, sem pular.

O diretório desta skill aparece quando ela carrega ("Base directory for this skill"). Abaixo ele é `<base>`.

## Antes: é mesmo um projeto novo?

| O pedido é... | Então |
|---|---|
| Vídeo, Short, ranking ou canal de vídeo | projeto `FelipeYabiko/criador-video-ranking` (skills dele). Não crie projeto novo |
| Mudança num projeto que já é da fábrica (tem `fabrica.json`) | skill `mudanca` do próprio projeto e o `docs/manual.md` dele |
| Projeto que já existe e não é da fábrica | "Adotar", no fim desta página |
| Um documento, planilha ou apresentação avulsos | skills `docs`, `xlsx`, `pptx` (não é projeto) |
| Guardar um jeito de fazer | `aprendizado:guardar-skill` |
| Ideia nova de site, sistema, robô, ferramenta, jogo, app | siga abaixo |

## As etapas (3 paradas para o dono)

Detalhe de cada uma, com "certo quando" e a tabela de problemas: `referencias/manual.md`. **Leia o manual inteiro
antes da etapa 1.**

| # | Etapa | O que sai | Onde está o como |
|---|---|---|---|
| 1 | **Entrevista** | a ideia entendida, dita de volta em uma frase | `referencias/entrevista.md` |
| 2 | **Modelo** | `site`, `sistema`, `robo` ou `livre`, com o porquê | `referencias/decisoes.md` |
| 3 | **Ficha** | a ficha escrita, com "fora do combinado" e "pronto quando" | modelo de ficha em `referencias/entrevista.md` |
| | **Parada 1: o dono aprova a ficha** | | |
| 4 | **Casa** | o repositório onde o projeto vai morar | `referencias/manual.md`, etapa 4 |
| 5 | **Criar** | o projeto já funcionando, com o exemplo do modelo | comando abaixo |
| 6 | **Construir** | o exemplo trocado pelo que a ficha pede | `docs/manual.md` **do projeto criado** |
| | **Parada 2: o dono aprova a folha de telas (ou o ensaio do robô)** | | |
| 7 | **Entregar** | no ar ou rodando no computador do dono | `docs/manual.md` do projeto |
| | **Parada 3: o dono usa e diz o que falta** | | |
| 8 | **Fechar e aprender** | diário, painel, e as lições que servem para a fábrica | `referencias/manual.md`, etapa 8 |

## Comandos

```bash
node "<base>/scripts/criar.mjs" --listar
node "<base>/scripts/criar.mjs" site <pasta> --nome "Nome" --descricao "Uma frase." --estilo editorial
node "<base>/scripts/criar.mjs" sistema <pasta> --nome "Nome" --descricao "Uma frase."
node "<base>/scripts/criar.mjs" robo <pasta> --nome "Nome" --descricao "Uma frase."
node "<base>/scripts/criar.mjs" livre <pasta> --nome "Nome" --descricao "Uma frase."
```

`<pasta>` pode ser um repositório recém-criado (só com `.git`, README, LICENSE). O comando cria tudo, roda o fiscal e
os testes e diz os próximos passos. Daí em diante quem manda é o `CLAUDE.md` e o `docs/manual.md` **do projeto**.

## O que não se negocia

1. **Nada de construir antes da ficha aprovada.** Meia hora de pergunta poupa uma semana de coisa errada.
2. **Perguntar pouco e bem:** no máximo 4 perguntas por vez, em português simples, cada uma com opções e a sua
   recomendação ("se tanto faz, eu faria X"). Nunca pergunta técnica (banco de dados, linguagem): isso se decide pela
   tabela de `decisoes.md`.
3. **Primeira versão pequena.** De 3 a 7 tarefas. O resto vai para "Fora do combinado" da ficha, à vista do dono.
4. **O modelo que serve, não o mais bonito.** Na dúvida entre dois, o mais simples. Se nenhum serve, `livre`, e diga
   ao dono que essa parte não tem modelo pronto (vai custar mais conversa).
5. **Custos, contas e dados de outras pessoas são decisão do dono**, sempre perguntada antes: mensalidade, cadastro em
   serviço, guardar dados de clientes, publicar em nome dele, pagamento.
6. **Diga os negativos** em toda parada: o que você inventou por falta de informação, o que não foi testado, o que
   ficou feio.
7. **Fatos de terceiros têm data.** Limites e preços de serviços em `decisoes.md` têm a data da conferência. Passou de
   3 meses ou está em "A confirmar": confira na página oficial antes de prometer ao dono.

## Adotar um projeto que já existe

```bash
node "<base>/scripts/criar.mjs" --adotar <pasta> --tipo site|sistema|robo|livre --nome "Nome"
```

Só acrescenta o que falta (painel, ficha, manual, fiscal, travas) e nunca sobrescreve. Depois: leia o código, preencha
o `PAINEL.md` e a `FICHA.md` com o que o projeto **já é** (pergunte ao dono o que não der para saber), e resolva o que
o fiscal apontar, um item por vez. Não reescreva o projeto para "caber" no modelo.

## Atualizar as ferramentas de um projeto da fábrica

```bash
node "<base>/scripts/criar.mjs" --atualizar <pasta>
```

Traz a versão nova do fiscal, das travas e do motor, sem tocar no que é do projeto. Rode `npm run verificar` depois:
regra nova pode apontar coisa antiga. Faça quando o fiscal avisar de peça mexida, quando o dono pedir, ou quando a
versão em `fabrica.json` do projeto for mais antiga que a do plugin.

## Melhorar a fábrica

Lição que serve para **todo** projeto de um tipo (regra nova do fiscal, peça que faltou no motor, linha na tabela de
problemas) não fica só no projeto: anote no diário dele e proponha ao dono levar ao `claude-kit`
(`plugins/fabrica/`), com teste em `plugins/fabrica/tests/` e a versão do plugin aumentada. Ideias de projeto prontas
para pegar: `referencias/banco-de-ideias.md`.
