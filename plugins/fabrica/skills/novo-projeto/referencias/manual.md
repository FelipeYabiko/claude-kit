# Manual da fábrica: da ideia ao projeto entregue

O passo a passo completo, escrito para funcionar com qualquer modelo do Claude, inclusive o mais barato. Cada etapa
diz **o que entregar**, **o comando** e **como saber que está certo**. Não pule etapas nem troque a ordem: cada uma
evita um erro que já custou caro.

`<base>` é o diretório da skill (aparece quando ela carrega). Criado em 17/11/2026.

## Mapa (8 etapas, 3 paradas para o dono)

| # | Etapa | Entrega | Como saber que está certo |
|---|---|---|---|
| 1 | Entrevista | a ideia dita de volta em uma frase | o dono disse "é isso" |
| 2 | Modelo | `site`, `sistema`, `robo` ou `livre` | a tabela de `decisoes.md` aponta para ele |
| 3 | Ficha | a ficha completa, com suposições marcadas | sem "PREENCHER"; "Fora do combinado" e "Pronto quando" preenchidos |
| | **Parada 1: o dono aprova a ficha** | | |
| 4 | Casa | o repositório do projeto | a conversa enxerga a pasta do repositório |
| 5 | Criar | o projeto com o exemplo do modelo, já rodando | `criar.mjs` terminou com "0 erro(s)" e "Testes: passaram" |
| 6 | Construir | o exemplo trocado pelo que a ficha pede | `npm run verificar` sem erro; manual do projeto seguido |
| | **Parada 2: o dono aprova a folha de telas (ou o ensaio)** | | |
| 7 | Entregar | no ar, ou rodando no computador do dono | `npm run fiscal -- --final` sem erro; o dono abriu e usou |
| | **Parada 3: o dono usa e diz o que falta** | | |
| 8 | Fechar e aprender | diário, painel, lições, tudo enviado | a próxima conversa retoma sem perguntar nada |

Tempo de conversa esperado: etapas 1 a 3 numa conversa; 4 a 6 numa segunda (ou na mesma, se for curto); 7 e 8 depois
da aprovação. **Uma etapa de construção por conversa** quando o projeto for grande: conversa longa custa mais a cada
mensagem e erra mais.

## 1. Entrevista

- Siga `entrevista.md`: primeiro ouça; rodada 1 (4 perguntas); escolha o modelo; rodada 2 do modelo.
- Perguntas com opções e recomendação. Peça um caso real.
- **Certo quando:** você disse a ideia de volta em uma frase e o dono confirmou; você sabe quem usa, onde, as 3 a 7
  tarefas e o que fica de fora.

## 2. Modelo

- Tabela 1 de `decisoes.md`, de cima para baixo. Diga ao dono qual é e por quê, em uma linha, e o que isso significa
  para ele ("roda no seu computador, com dois cliques, sem custo").
- Algum sinal de alerta de `entrevista.md` (dados de outras pessoas, pagamento, login, várias pessoas, mensalidade)?
  Pare e leve a escolha ao dono, com as opções da seção 4 de `decisoes.md`.
- Para `site`, escolha o estilo com ele: `node "<base>/scripts/criar.mjs" --listar` mostra os três em uma linha cada.
- **Certo quando:** modelo (e estilo) escolhidos, e nenhum alerta ficou sem resposta do dono.

## 3. Ficha

- Escreva a ficha inteira (as seções estão no fim de `entrevista.md` e no `FICHA.md` de cada modelo). Palavras do
  dono. Suposições marcadas com "supus que".
- "Pronto quando": de 3 a 8 itens conferíveis, um por tarefa principal.
- Mostre ao dono em texto simples (não o arquivo cru) e diga: o que ficou de fora, o que você supôs e o que precisa
  dele (fotos, textos, uma amostra da planilha, criar uma conta).
- **Certo quando:** ele leu e aprovou. Mudança de ideia depois disso muda a ficha primeiro.

**Parada 1.** Sem o "pode fazer" do dono, não crie nada.

## 4. Casa (o repositório)

Cada projeto mora no seu próprio repositório do GitHub. É a memória que todas as conversas e as duas contas do Claude
dividem; sem ele, o projeto some quando a conversa acaba.

- **Já existe um repositório vazio para o projeto nesta conversa?** Use a pasta dele.
- **Não existe:** peça ao dono (o Claude não cria repositório sozinho):
  1. Abrir https://github.com/new
  2. Nome: minúsculas com hífen, sem acento (ex.: `controle-de-projetos`).
  3. Visibilidade: **Public** para `site` no GitHub Pages grátis; **Private** para o resto.
  4. Marcar **Add a README file** e clicar em **Create repository**.
  5. Se o aplicativo do Claude no GitHub estiver liberado só para alguns repositórios, incluir o novo em
     https://github.com/apps/claude → Configure.
  6. Abrir uma conversa nova no Claude Code escolhendo esse repositório (ou, se a conversa atual tiver a ferramenta de
     adicionar repositório, usar aqui mesmo).
- Enquanto o repositório não chega, dá para adiantar: crie o projeto numa pasta temporária, mostre a folha de telas do
  exemplo e depois copie para o repositório. **Nada do que está só na conversa está salvo.**
- **Certo quando:** `git -C <pasta> status` responde e `git remote -v` mostra o repositório do projeto.

## 5. Criar

```bash
node "<base>/scripts/criar.mjs" <tipo> <pasta-do-repositorio> --nome "Nome do Projeto" --descricao "A frase do 'O que é' da ficha."
```

- Para `site`, acrescente `--estilo editorial|vibrante|tecnico`. Se a ficha está num arquivo, `--ficha arquivo.md`.
- O comando cria tudo, roda o fiscal e os testes. Os **avisos** de "exemplo" e "PREENCHER" são esperados: é o que a
  etapa 6 resolve.
- Em seguida: escreva a `FICHA.md` do projeto (se não usou `--ficha`), leia o `CLAUDE.md` e o `docs/manual.md` **do
  projeto** inteiros, e faça o primeiro commit ("projeto criado pela fábrica").
- Commits e envio: skill `aprendizado:commits-limpos` (autor é o Felipe, sem assinatura do Claude; `main` com o OK
  dele).
- **Certo quando:** "0 erro(s)" e "Testes: passaram"; `npm run verificar` passa dentro da pasta; primeiro commit feito
  e enviado.

## 6. Construir

- **Quem manda agora é o `docs/manual.md` do projeto.** Ele tem as etapas do tipo (site: marca, texto, imagens,
  seções, olhar; sistema: modelo, semente, regras, painel, usar e olhar; robô: amostra, passos, configuração, ensaio).
- Uma parte por vez, com `npm run verificar` entre elas. O gancho do projeto roda a verificação antes de cada commit e
  recusa se falhar: corrija o projeto, nunca o fiscal.
- O fiscal lista o que ainda é exemplo. A construção termina quando a lista zera.
- Tela mexida: `npm run telas`, **abrir as imagens de `folha/`** e olhar. Robô: `npm run ensaio`.
- **Certo quando:** o manual do projeto chegou na parada dele; verificar sem erro; folhas olhadas depois da última
  mudança.

**Parada 2.** Mande as folhas de telas (arquivos `folha/folha-*.png`) ou o registro do ensaio, com os pontos fracos
ditos antes que ele pergunte.

## 7. Entregar

- `npm run fiscal -- --final` sem erro: nenhum exemplo, nenhum "PREENCHER", "Pronto quando" todo marcado (marque cada
  item só depois de conferir de verdade).
- Siga a etapa de entrega do manual do projeto (site: capa, endereço, GitHub Pages; sistema: baixar e abrir no
  computador do dono; robô: rodar duas vezes e agendar).
- O que depende do dono (ligar o GitHub Pages, criar uma conta, instalar o Node) vai escrito no `PAINEL.md` em passos
  numerados, com o endereço de cada clique.
- **Certo quando:** o dono abriu e usou, do aparelho dele.

**Parada 3.** Combine uma semana de uso. O que ele pedir vira "Falta fazer" do painel, uma mudança por conversa.

## 8. Fechar e aprender

1. No projeto: `docs/diario.md`, lições em `docs/regras-de-ouro.md` ou `docs/aprendizados.md`, `PAINEL.md` em dia,
   tudo enviado.
2. Para a fábrica: houve algo que serviria a **todo** projeto do tipo? (regra que o fiscal devia ter; peça que faltou
   no motor; pergunta que a entrevista devia fazer; linha para a tabela de problemas.) Proponha ao dono levar ao
   `claude-kit`: mudança em `plugins/fabrica/`, teste em `plugins/fabrica/tests/`, versão do plugin aumentada.
3. A ideia veio do `banco-de-ideias.md`? Marque lá como feita, com o endereço do repositório.
- **Certo quando:** uma conversa nova, em qualquer conta, lê o painel e sabe continuar sem perguntar nada.

## Sintoma, causa e conserto

| Sintoma | Causa provável | Conserto |
|---|---|---|
| A skill `fabrica:novo-projeto` não aparece na conversa | o plugin `fabrica` não foi adicionado na conta | em claude.ai → Customize → Plugins → `claude-kit` → `fabrica` → **Add** (uma vez por conta); no computador, `/plugin install fabrica@claude-kit` |
| "A pasta já tem coisa dentro" ao criar | a pasta não é um repositório vazio | projeto existente: `--adotar`; pasta errada: confira o caminho |
| "Tipo ... não existe" / "Estilo ... não existe" | nome digitado errado | `--listar` mostra os nomes |
| O projeto criado tem erro no fiscal logo de cara | defeito do modelo da fábrica | não contorne: avise o dono; o conserto é no `claude-kit`, com teste |
| O commit é recusado no projeto | o gancho rodou `npm run verificar` e ele falhou | leia a saída e corrija; nunca `--no-verify` |
| `npm install <pacote>` é bloqueado | o projeto roda sem dependências de propósito | pergunte ao dono; com o sim, anote em "Dependências aprovadas" da ficha |
| Edição recusada em `ferramentas/fiscal/` ou `.claude/hooks/` | são as travas do projeto | regra só do projeto: `ferramentas/fiscal/regras-do-projeto.mjs` |
| O fiscal avisa "peça da fábrica mexida à mão" | alguém editou o motor ou o fiscal no projeto | `--atualizar` desfaz; se era conserto de verdade, leve ao `claude-kit` |
| `npm run telas` diz que falta o Playwright | no computador ele não vem instalado | rode na nuvem do Claude, ou siga a mensagem para instalar |
| A conversa não enxerga o repositório novo | ele foi criado depois de a conversa começar | conversa nova escolhendo o repositório, ou adicionar pela ferramenta de repositórios |
| Não consigo enviar para o GitHub (push recusado) | o aplicativo do Claude não está instalado no repositório | o dono instala em https://github.com/apps/claude → Configure |
| O dono pediu algo fora da ficha no meio da construção | a ideia cresceu | pare, atualize a ficha com ele ("Pronto quando" incluso) e só então continue |
| A ideia não cabe em nenhum modelo | é um tipo novo | modelo `livre` e seção 5 de `decisoes.md`; avise que vai mais devagar |
| No PowerShell do dono o comando com `--` não funciona | o PowerShell engole o primeiro `--` | `npm run fiscal '--' --final` (com aspas) |
| O projeto está numa versão antiga da fábrica | a fábrica melhorou depois | `node "<base>/scripts/criar.mjs" --atualizar <pasta>` e `npm run verificar` |

## O que a fábrica não faz (diga ao dono, não improvise)

- Sistema com login para várias pessoas, pagamento, aplicativo de loja: `decisoes.md`, seção 4.
- Publicar ou criar conta em nome do dono: ele faz os cliques, com o passo a passo no painel.
- Garantir limites e preços de serviços de terceiros: confira a data em `decisoes.md`.
- Substituir o olho: o fiscal e a folha de telas acusam o que é mensurável; beleza, clareza e bom senso são da
  revisão de quem constrói e da aprovação do dono.
