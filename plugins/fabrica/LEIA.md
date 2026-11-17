# Fábrica de projetos

Transforma uma ideia do Felipe num projeto novo que **já funciona** e que qualquer modelo do Claude, inclusive o mais
barato, consegue levar até o fim no mesmo padrão. Feita em 17/11/2026, último dia do modelo mais forte sem custo
extra, seguindo a skill `aprendizado:preparar-para-modelo-barato`: o julgamento caro foi gasto uma vez e virou
modelos, fiscal, travas e manuais.

## Como usar

Na conversa, peça do jeito normal: "quero criar um site para o estúdio", "um sistema para controlar meus clientes",
"um robô que me avise quando os canais postarem". A skill `fabrica:novo-projeto` entra sozinha e segue o caminho:

1. **Entrevista** curta, com opções e recomendação (no máximo 4 perguntas por vez).
2. **Ficha** do combinado para você aprovar: o que é, o que não é, e como saber que ficou pronto.
3. **Projeto criado já funcionando**, com conteúdo de exemplo, no repositório do projeto.
4. **Construção** pelo manual do tipo, com o fiscal conferindo tudo a cada commit.
5. **Folha de telas** (fotos de cada tela no celular e no computador, clara e escura) ou ensaio do robô, para aprovar.
6. **Entrega** e o que aprendeu volta para a fábrica.

Ideias já pensadas para o seu trabalho, prontas para pedir ("faz a ideia 3"):
`skills/novo-projeto/referencias/banco-de-ideias.md`.

## Os modelos

| Modelo | Para | Já vem com |
|---|---|---|
| `site` | página de negócio, portfólio, link da bio, página de serviço | 8 seções prontas, 3 estilos visuais (editorial, vibrante, técnico) com fontes livres, tema claro e escuro, biblioteca com mais 6 seções, capa para WhatsApp e redes, publicação automática no GitHub Pages |
| `sistema` | cadastros e controle (clientes, projetos, estoque, contas, tarefas) | motor que desenha sozinho, a partir de um arquivo de descrição, as telas de lista, formulário, busca, filtros, painel com números e gráficos, exportação para Excel e cópia diária dos dados; roda no computador com dois cliques |
| `robo` | tarefa que se repete sem tela (vigiar canais e sites, juntar números, relatórios) | passos encadeados, modo ensaio, memória entre rodadas, novas tentativas na internet, relatório e planilha; roda com dois cliques ou sozinho no GitHub |
| `livre` | o que não cabe nos outros (jogo, extensão, análise) | só o esqueleto: instruções, painel, ficha, manual, fiscal e travas |

Todo projeto vem com: `CLAUDE.md`, `PAINEL.md` (estado e o que falta), `FICHA.md` (o combinado), `docs/manual.md`
(passo a passo com tabela de problemas), regras de ouro, diário, a skill `mudanca` e as travas automáticas (não deixa
commitar com erro, apagar os dados do dono, instalar pacote sem OK nem "afrouxar" o fiscal).

## Comandos

```bash
node plugins/fabrica/skills/novo-projeto/scripts/criar.mjs --listar
node plugins/fabrica/skills/novo-projeto/scripts/criar.mjs site <pasta> --nome "Nome" --estilo vibrante
node plugins/fabrica/skills/novo-projeto/scripts/criar.mjs --adotar <pasta> --tipo site --nome "Nome"
node plugins/fabrica/skills/novo-projeto/scripts/criar.mjs --atualizar <pasta>
```

## Melhorar a fábrica

- Regra nova do fiscal, peça nova de um motor, pergunta nova da entrevista: escreva o teste em `tests/` primeiro e
  rode `npm test` nesta pasta (todos precisam passar).
- Aumente `version` em `.claude-plugin/plugin.json`. Os projetos já criados recebem o novo com `--atualizar`.
- Dentro de `skills/novo-projeto/modelos/`, os arquivos que mudariam o comportamento do próprio kit têm outro nome
  (`_claude/`, `_github/`, `_gitignore`, `CLAUDE.modelo.md`, `SKILL.modelo.md`); o gerador troca ao criar. Um teste
  garante isso.

## O que ainda não foi testado de verdade

- A publicação no GitHub Pages (`publicar.yml`) e o agendamento do robô (`agendar.yml`): foram escritos pela
  documentação oficial, mas só rodam dentro do GitHub; o primeiro projeto de cada tipo é o teste.
- Os atalhos `.bat` no Windows: conferidos no texto e no fim de linha, não executados num Windows.
- A folha de telas no computador do Felipe: precisa do Playwright, que vem pronto na nuvem do Claude e não no PC.
