# Manual do robô

O passo a passo para levar este robô do exemplo até o trabalho de verdade, e para mudar qualquer coisa depois.
Escrito para funcionar com qualquer modelo do Claude. Cada etapa diz **o que entregar**, **o comando** e **como saber
que está certo**. Não pule etapas nem troque a ordem.

Leia junto: `FICHA.md` (o combinado) e `docs/regras-de-ouro.md` (inteiro).

## Mapa (8 etapas, 2 paradas para o dono)

| # | Etapa | Entrega | Comando |
|---|---|---|---|
| 1 | Ficha | `FICHA.md` sem "PREENCHER": passos, quando roda, contas e o que nunca faz sozinho | |
| 2 | Uma amostra de verdade | um exemplo real do que o robô vai ler, guardado em `exemplos/` | |
| 3 | Passos | cada passo com teste (antes) e código, usando só o `ctx` | `npm test` |
| 4 | Configuração e segredos | `config.json` sem a marca de exemplo; `.env.exemplo` com cada segredo | `npm run fiscal` |
| 5 | Ensaio | o robô inteiro em modo ensaio, com os dados de verdade | `npm run ensaio` |
| | **Parada 1: o dono vê o ensaio e o que seria entregue** | | |
| 6 | Rodar de verdade, duas vezes | `saida/` conferida; a segunda rodada não repete nada | `npm start` (duas vezes) |
| | **Parada 2: o dono aprova o resultado e decide se agenda** | | |
| 7 | Agendar | robô rodando sozinho, e o dono sabendo como descobre se parou | veja "Agendar" |
| 8 | Fechar | diário, lições, painel, tudo enviado | `npm run fiscal -- --final` |

## 1. Ficha

- A entrevista é feita pela skill `fabrica:novo-projeto`. Aqui, confira se a `FICHA.md` tem a tabela de passos, quando
  roda, as contas e chaves, e **o que o robô nunca faz sem o dono mandar**.
- Para cada fonte, descubra o **caminho oficial** antes de pensar em ler a página: feed (RSS/Atom), API, exportação
  em CSV. Ler o HTML de uma página é o último recurso: quebra quando o site muda o desenho e muitos sites proíbem.
- **Certo quando:** dá para dizer, para cada passo, de onde vem a entrada e para onde vai a saída.

## 2. Uma amostra de verdade

- Antes de programar, busque **uma vez** o que o robô vai ler e guarde em `exemplos/` (ex.:
  `exemplos/feed-do-canal.xml`, `exemplos/resposta-da-api.json`). É com ela que os testes rodam sem internet.
- Tire da amostra tudo o que for pessoal ou secreto (chave no endereço, e-mail, nome de cliente).
- Na nuvem do Claude, o endereço precisa estar liberado na rede do ambiente; se não estiver, peça ao dono para rodar
  no computador dele ou liberar o endereço.
- **Certo quando:** a amostra está no projeto e você leu o formato dela (não o que você lembra do formato).

## 3. Passos

Um arquivo por passo em `passos/`, com o número na frente (`1-buscar.mjs`). Cada um:

```js
export const descricao = 'buscar as publicações de cada fonte';   // aparece no registro

export const rodar = async (entrada, ctx) => {
	// entrada = o que o passo anterior devolveu (o primeiro recebe undefined)
	return saida;   // vira a entrada do próximo passo
};
```

O `ctx` é a caixa de ferramentas. **Passo não usa `fetch`, `fs` nem `process.env`** (o fiscal trava):

| Preciso de... | Use |
|---|---|
| Ler uma página, feed ou API | `await ctx.rede.buscarTexto(endereco)` ou `buscarJson(endereco)` (tenta de novo sozinho; `{cabecalhos}` opcional) |
| Uma chave ou senha | `ctx.segredo('NOME_DA_CHAVE')` |
| Lembrar algo para a próxima rodada | `ctx.memoria.ler('chave', padrao)` e `ctx.memoria.guardar('chave', valor)` |
| Gravar o resultado | `ctx.escrever('saida/arquivo.md', texto)`, `ctx.acrescentar('saida/historico.csv', linhas)` |
| Ler um arquivo do projeto | `ctx.lerArquivo('saida/historico.csv')` (devolve `null` se não existe) |
| Dizer o que está acontecendo | `ctx.registro('  3 novidades')` |
| Saber a data e se é ensaio | `ctx.hoje` (`AAAA-MM-DD`), `ctx.agora`, `ctx.ensaio` |
| Ajustes do dono | `ctx.config` (o `config.json`) |

- **Teste primeiro**, em `tests/passos.test.mjs`: copie o jeito dos testes de exemplo (`copiaDoRobo()` + `executar`
  com `buscar: internet({...})`). Para cada passo, um caso que dá certo com a amostra de verdade e um que falha
  (site fora do ar, resposta vazia, formato inesperado).
- Ferramenta que o projeto precisa (ler outro formato, montar um relatório diferente) vai em `lib/`, com outro nome e
  com teste. `lib/feed.mjs` lê RSS e Atom; `lib/executar.mjs` e `lib/rede.mjs` são da fábrica.
- Passo que **envia para fora** (e-mail, mensagem, publicação): confira `ctx.ensaio` e, no ensaio, só registre o que
  enviaria. Arquivo e memória o motor já protege; envio é o passo que precisa proteger.
- Falha de uma fonte entre várias: registre e siga (veja `1-buscar.mjs`). Falha que impede o trabalho: `throw new
  Error('mensagem que o dono entende')`.
- **Certo quando:** `npm test` passa e o fiscal não acusa nada em `passos`.

## 4. Configuração e segredos

- `config.json`: o que o dono pode querer mudar sem programar (fontes, limites, palavras). **Apague
  `"exemplo": true`** quando as fontes forem as de verdade.
- Cada `ctx.segredo('NOME')` precisa de uma linha `NOME=` no `.env.exemplo`, com um comentário dizendo onde conseguir
  a chave. O dono copia para `.env` (que não vai para o GitHub) e preenche. Na nuvem do Claude, os segredos entram
  pelos segredos do ambiente.
- Nunca peça para o dono colar uma chave na conversa.
- **Certo quando:** `npm run fiscal` sem erro de `config` nem de `segredos-do-robo`.

## 5. Ensaio

```bash
npm run ensaio
```

- Roda tudo com os dados de verdade e **não grava nem envia nada**. No fim, lista os arquivos que gravaria.
- Para conferir um passo de cada vez: `node robo.mjs --ensaio --ate 1`.
- **Certo quando:** o ensaio termina sem erro e os números do registro batem com o que você vê na fonte.

**Parada 1.** Mostre ao dono o registro do ensaio e um exemplo do que seria entregue. Diga os pontos fracos ("o site
X só mostra as 15 últimas; se o robô ficar um mês parado, perde o que saiu antes").

## 6. Rodar de verdade, duas vezes

```bash
npm start
npm start
```

- Abra `saida/` e leia como o dono vai ler. Dá para entender em dez segundos?
- A **segunda rodada** não pode repetir aviso, duplicar linha nem mandar a mesma mensagem.
- Simule a queda: troque uma fonte por um endereço que não existe e rode. O relatório deve mostrar a falha e o resto
  deve funcionar.
- **Certo quando:** as três coisas acima foram vistas, não supostas.

**Parada 2.** O dono aprova o resultado e decide como o robô vai rodar.

## 7. Agendar

| Jeito | Bom quando | Como |
|---|---|---|
| **Dois cliques** | roda quando o dono lembrar | `Rodar <nome>.bat` |
| **GitHub, sozinho** | precisa rodar todo dia, sem depender do computador ligado | `.github/workflows/agendar.yml`: tire o `#` das duas linhas de `schedule` e ajuste o horário |
| **Agendador do Windows** | precisa de algo que só existe no computador do dono | Agendador de Tarefas → Criar Tarefa Básica → apontar para o `.bat` |
| **Tarefa agendada do Claude** | o robô precisa de julgamento (ler e resumir, decidir) | pedir ao Claude: "roda isso toda segunda às 9h" |

No GitHub:

- O horário é em **UTC** (Londres): Brasília + 3 horas. `'17 11 * * *'` = todo dia às 08:17 de Brasília. Use minuto
  quebrado (17, 43): na hora cheia os agendamentos do mundo todo se atropelam e o seu atrasa.
- A cada rodada, o robô guarda `saida/` e `estado/` de volta no repositório. Antes de mexer no projeto, traga essas
  mudanças (`git pull`).
- Segredos: no repositório, **Settings → Secrets and variables → Actions → New repository secret**, e uma linha por
  segredo em `env:` do passo "Rodar" do `agendar.yml` (o fiscal avisa o que falta).
- Em repositório **público**, o GitHub desliga o agendamento depois de 60 dias sem atividade no repositório. Como o
  robô grava o resultado a cada rodada, isso só acontece se ele ficar 60 dias sem nada novo para gravar; se
  acontecer, é só religar na aba Actions.
- Quando uma rodada falha, o GitHub manda e-mail para o dono da conta. Combine com o dono que esse e-mail é o alarme.
- **Certo quando:** uma rodada disparada à mão pela aba Actions ("Run workflow") deu certo e o resultado apareceu no
  repositório.

## 8. Fechar

`npm run fiscal -- --final` sem erro, e "Fechar a mudança" do `CLAUDE.md`: diário, lições, `PAINEL.md` (com o jeito
de rodar e o horário em "Como abrir"), commit e envio.

## Receitas de entrega

| Entregar como... | Jeito | Precisa de |
|---|---|---|
| Relatório para ler | `ctx.escrever('saida/ultimo.md', ...)` | nada |
| Planilha que acumula | `ctx.acrescentar('saida/historico.csv', ...)` com `;` e a marca de UTF-8 (veja `3-entregar.mjs`) | nada |
| Página bonita | escrever um `.html` em `saida/` (ou juntar com um projeto de site da fábrica) | nada |
| Aviso no celular do dono | serviço de avisos por endereço (ntfy.sh, Telegram Bot) com `ctx.rede` | conta e segredo; OK do dono |
| E-mail | serviço de envio com API (o robô não manda e-mail sozinho) | conta e segredo; OK do dono |
| Atualizar outro projeto do dono | escrever o arquivo que o outro projeto lê, ou abrir no outro repositório | combinar o formato |

Tudo o que envia para fora começa em ensaio, depois manda **só para o dono**, e só então para os outros.

## Sintoma, causa e conserto

| Sintoma | Causa provável | Conserto |
|---|---|---|
| "Não consegui falar com <site>" | sem internet, ou (na nuvem) endereço não liberado na rede do ambiente | testar no computador do dono; na nuvem, pedir para liberar o endereço |
| "<site> respondeu 403" | o site bloqueia robôs, ou falta a chave | procurar o caminho oficial (feed, API); conferir o segredo. Nunca burlar o bloqueio |
| "<site> respondeu 429" | pedidos demais | diminuir a frequência; pedir menos por rodada |
| "Isto não é um feed" | o endereço devolveu uma página (login, erro) em vez do feed | abrir o endereço no navegador e achar o endereço certo do feed |
| O robô repete as mesmas novidades toda rodada | a memória não está sendo guardada: a rodada termina com erro, ou está sempre em ensaio | ver o fim do registro; no GitHub, conferir se o passo "Guardar o resultado" rodou |
| A primeira rodada trouxe coisa demais | `naPrimeiraVez` alto no `config.json` | diminuir; é só na primeira vez de cada fonte |
| "Falta o segredo X" | o `.env` não tem a linha, ou o GitHub não recebeu o segredo | preencher o `.env`; no GitHub, Settings → Secrets, e a linha em `env:` do `agendar.yml` |
| No GitHub roda, mas não guarda o resultado | falta `permissions: contents: write` ou a branch é protegida | conferir o `agendar.yml`; em Settings → Actions → General, permitir escrita |
| O agendamento parou sozinho | 60 dias sem atividade (repositório público), ou a rodada vem falhando | religar na aba Actions; ler o e-mail de falha |
| O horário está 3 horas errado | o GitHub usa UTC | somar 3 horas ao horário de Brasília no `cron` |
| "A memória do robô está estragada" | arquivo editado à mão ou conflito de git | recuperar `estado/memoria.json` pelo histórico do git |
| Acentos trocados no CSV aberto no Excel | faltou a marca de UTF-8 no começo do arquivo | veja como `3-entregar.mjs` começa o arquivo (`﻿`) |
| O commit é recusado | `npm run verificar` falhou | leia a saída, corrija, tente de novo (sem `--no-verify`) |
| No PowerShell o `--` não funciona | o PowerShell engole o primeiro `--` | `npm run fiscal '--' --final` (com aspas) |
