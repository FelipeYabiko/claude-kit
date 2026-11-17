# Manual do sistema

O passo a passo para levar este sistema do exemplo até o uso do dono, e para mudar qualquer coisa depois. Escrito
para funcionar com qualquer modelo do Claude. Cada etapa diz **o que entregar**, **o comando** e **como saber que está
certo**. Não pule etapas nem troque a ordem.

Leia junto: `FICHA.md` (o combinado) e `docs/regras-de-ouro.md` (inteiro).

## Mapa (8 etapas, 2 paradas para o dono)

| # | Etapa | Entrega | Comando |
|---|---|---|---|
| 1 | Ficha | `FICHA.md` sem "PREENCHER", com a tabela de cadastros, e o OK do dono | |
| 2 | Modelo | `modelo.mjs` com os cadastros da ficha, sem a marca `exemplo: true` | `npm run fiscal` |
| 3 | Semente | `exemplos/semente.mjs` com 4 a 8 registros realistas por cadastro | `npm test` |
| 4 | Regras | cada regra da ficha com teste (antes) e código em `regras.mjs` | `npm test` |
| 5 | Painel | os números que o dono quer ver ao abrir | `npm run fiscal` |
| 6 | Usar e olhar | uso de verdade + folha de telas, zero erro do navegador | `npm run verificar`, `npm start`, `npm run telas` |
| | **Parada 1: o dono aprova a folha de telas** | | |
| 7 | Entregar | sistema rodando no computador do dono | `npm run fiscal -- --final` |
| | **Parada 2: o dono usa uma semana e diz o que falta** | | |
| 8 | Fechar | diário, lições, painel, tudo enviado | `npm run verificar` |

## 1. Ficha

- A entrevista é feita pela skill `fabrica:novo-projeto`. Aqui, confira se a `FICHA.md` tem a **tabela de cadastros**
  (cadastro, campo, tipo, obrigatório, observação), o que o dono quer ver ao abrir e as regras.
- Faça o teste do papel: para cada tarefa de "O que a pessoa consegue fazer", aponte em qual cadastro e campo ela
  acontece. Tarefa sem lugar = falta campo ou cadastro. Campo que nenhuma tarefa usa = corte.
- **Certo quando:** o dono leu a tabela de cadastros e disse "é isso".

## 2. Modelo

Tudo em `modelo.mjs`. Troque os cadastros de exemplo pelos da ficha e **apague a linha `exemplo: true`**.

```js
clientes: {
	nome: 'Clientes',        // plural, como aparece no menu
	singular: 'cliente',     // minúsculo, para "Novo cliente", "Cliente salvo"
	genero: 'm',             // 'm' ou 'f': "Novo cliente" / "Nova tarefa"
	titulo: 'nome',          // o campo que dá nome ao registro nas listas e nas ligações
	campos: {
		nome: {rotulo: 'Nome', tipo: 'texto', obrigatorio: true, unico: true},
	},
	lista: ['nome', 'cidade'],                    // colunas da lista (padrão: os 5 primeiros campos)
	filtros: ['situacao'],                        // só campo de escolha, sim-nao ou ligacao
	ordem: {campo: 'nome', direcao: 'asc'},       // ordem inicial da lista
},
```

Identificador de cadastro: minúsculas e hífen (`notas-fiscais`). Identificador de campo: começa com minúscula, sem
acento nem espaço (`dataDeEntrega`). O que aparece na tela é o `rotulo`.

### Tipos de campo

| Tipo | Para quê | Opções próprias | Como é guardado |
|---|---|---|---|
| `texto` | nome, título, cidade (uma linha, até 200 letras) | `min`, `max` (letras) | texto |
| `texto-longo` | observações, descrição (várias linhas) | `max` | texto |
| `numero` | quantidade, medida | `inteiro: true`, `min`, `max` | número |
| `dinheiro` | preço, valor, custo (em reais) | `min`, `max` (em reais) | centavos inteiros |
| `data` | prazo, vencimento, nascimento | `padrao: 'hoje'` | `AAAA-MM-DD` |
| `escolha` | situação, categoria (lista fixa) | `opcoes` (obrigatório) | o `valor` da opção |
| `sim-nao` | pago?, ativo? | | verdadeiro ou falso |
| `ligacao` | aponta para um registro de outro cadastro | `para: 'cadastro'` (obrigatório) | o número do registro |
| `email`, `telefone`, `link` | contato (viram link clicável na lista) | | texto conferido |

Opções de qualquer campo: `rotulo` (obrigatório), `obrigatorio`, `padrao`, `unico` (não deixa repetir), `ajuda`
(frase curta embaixo do campo).

Opções de uma `escolha`: `['aberto', 'fechado']` ou, para ter rótulo e cor,
`[{valor: 'aberto', rotulo: 'Em aberto', cor: 'alerta'}]`. Cores: `neutro`, `destaque`, `alerta`, `ok`, `erro`.
O `valor` é o que fica guardado: **depois que há dados, mude só o `rotulo`**, nunca o `valor`.

- **Certo quando:** `npm run fiscal` sem erro de `modelo` (ele diz o cadastro e o campo de cada problema).

## 3. Semente

`exemplos/semente.mjs`: a lista de registros de exemplo, na ordem em que precisam ser criados.

```js
['clientes', {nome: 'Padaria do Bairro', cidade: 'São Paulo'}],
['projetos', {titulo: 'Série de Reels', cliente: ['clientes', 0], valor: '4.800,00', prazo: emDias(hoje, 9)}],
```

- `['clientes', 0]` num campo de ligação = "o primeiro cliente desta lista".
- Datas com `emDias(hoje, n)` (negativo = passado), para sempre haver coisa vencida e coisa futura.
- De 4 a 8 registros por cadastro, com casos difíceis: nome comprido, campo opcional vazio, valor alto.
- Nunca dado real de cliente: a semente vai para o GitHub.
- **Certo quando:** `npm test` passa (o teste do modelo cria todos os exemplos pela mesma conferência dos dados de
  verdade e acusa o cadastro que ficou sem exemplo).

## 4. Regras

Para cada linha da seção "Regras" da ficha, **primeiro o teste** em `tests/regras.test.mjs` (um caso que passa, um
que quebra), veja falhar, depois a regra em `regras.mjs`:

| Preciso de... | Use | Exemplo |
|---|---|---|
| Recusar um registro errado | `validar(registro, {banco, anterior, hoje})` → `{campo: 'mensagem'}` | "Projeto pago precisa do valor." |
| Mostrar algo que se calcula | `calculados: {nome: {rotulo, tipo, calcular(registro, {hoje, banco})}}` | atrasado, total, dias restantes |
| Preencher sozinho ao salvar | `aoSalvar(registro, {banco, anterior, hoje})` → registro | data de pagamento ao marcar "pago" |

- `banco.listar('cadastro')` dá os outros registros (para regra que olha mais de um, como "não repetir horário").
- Campo calculado pode entrar em `lista`, em `filtros` (se for escolha ou sim-nao) e no `onde` do painel.
- Mensagem de erro diz o que fazer, na língua do dono.
- **Certo quando:** `npm test` passa e o fiscal não lista regra sem teste.

## 5. Painel

Em `painel`, no `modelo.mjs`. De 4 a 8 itens, do que pede ação hoje para os totais.

| Tipo | Mostra | Precisa de |
|---|---|---|
| `contagem` | quantos registros | `entidade`, `onde` |
| `soma` | a soma de um campo | `entidade`, `campo` (numero ou dinheiro), `onde` |
| `lista` | os primeiros registros | `entidade`, `onde`, `ordem`, `colunas` (até 3), `limite` |
| `grupos` | barras por valor de um campo | `entidade`, `por`, e `soma` se for somar em vez de contar |

Todos aceitam `rotulo` (obrigatório), `ajuda` e `tom` (`erro` ou `ok`, para colorir o número).

O `onde` escolhe os registros. Cada campo aceita: um valor (`{situacao: 'aberto'}`), uma lista (`{situacao:
['aberto', 'atrasado']}`) ou uma faixa (`{prazo: {min: 'hoje'}}`, `{valor: {max: 1000}}`, `{prazo: {antes: 'hoje'}}`,
`{prazo: {vazio: false}}`). A palavra `'hoje'` vira a data do dia. `min` e `max` incluem o limite; `antes` e
`depois`, não.

- **Certo quando:** cada pergunta de "O que o dono quer ver ao abrir" da ficha tem um item no painel.

## 6. Usar e olhar

```bash
npm run verificar
npm start
npm run telas
```

1. **Use de verdade** (`npm start`, na nuvem com `-- --sem-abrir`): em cada cadastro, cadastre um registro, erre de
   propósito (deixe o obrigatório vazio, quebre uma regra), edite, busque, filtre, ordene, exporte e apague.
2. **Folha de telas:** `npm run telas` fotografa painel, lista, formulário novo e registro aberto de cada cadastro,
   com os dados da semente. Erro do navegador se corrige antes de mostrar ao dono.
3. **Abra cada `folha/folha-*.png`** e confira:
   - As colunas da lista são as que o dono usa para achar as coisas? Alguma coluna vazia em todos?
   - Os rótulos e as opções são as palavras do dono?
   - O formulário pede as coisas na ordem em que a pessoa pensa? (A ordem é a de `campos` no modelo.)
   - No celular, cada cartão mostra o essencial?
   - O painel responde às perguntas da ficha?
- **Certo quando:** verificar sem erro, uso completo sem tropeço e todas as folhas olhadas depois da última mudança.

**Parada 1.** Mande ao dono as folhas e diga os pontos fracos ("a lista de projetos tem 7 colunas, no celular fica
comprida").

## 7. Entregar

1. `npm run fiscal -- --final`: zero erro (sem cadastro de exemplo, sem "PREENCHER", "Pronto quando" todo marcado).
2. Commit e envio (com o OK do dono).
3. No computador do dono: baixar o repositório (GitHub Desktop ou "Code → Download ZIP"), ter o Node.js 22 ou mais
   novo (https://nodejs.org, versão LTS) e dar dois cliques em `Abrir <nome>.bat`.
4. Na primeira abertura com o modelo de verdade, o banco começa vazio (a semente só entra no banco real enquanto
   existir a marca `exemplo: true`).
5. Combine a cópia de segurança: os dados ficam em `dados/` só naquele computador. O sistema guarda uma cópia por
   dia em `dados/copias/`, mas se o computador quebrar, só salva quem copiou a pasta para outro lugar (pendrive,
   Google Drive). Escreva isso no `PAINEL.md`.

**Parada 2.** Depois de uma semana de uso, pergunte o que atrapalhou. O que ele pedir vira "Falta fazer" no painel.

## 8. Fechar

Siga "Fechar a mudança" do `CLAUDE.md`: diário, lições, `PAINEL.md`, commit e envio.

## Mudança depois que o dono já usa

| Mudança | É seguro? | Como |
|---|---|---|
| Acrescentar campo ou cadastro | Sim | modelo + semente + `npm run verificar`. Registros antigos ficam com o campo vazio; por isso campo novo **não** nasce obrigatório sem combinar |
| Mudar o `rotulo` de campo ou opção | Sim | só o texto muda |
| Tirar um campo | Sim, com aviso | o dado continua guardado, só some da tela. Diga isso ao dono |
| Acrescentar opção numa `escolha` | Sim | |
| Tirar opção de uma `escolha` | Cuidado | registros com a opção antiga dão erro ao editar. Antes, peça ao dono para trocar esses registros |
| Trocar identificador ou tipo de um campo | **Não sem plano** | é como criar um campo vazio: os dados antigos não aparecem. Combine com o dono, peça a cópia de `dados/` e escreva a conversão num script com teste |
| Regra nova que os dados antigos não cumprem | Cuidado | o registro antigo só reclama quando for editado. Avise o dono |

## O que o motor não faz (fale com o dono antes de inventar)

- **Várias pessoas ao mesmo tempo pela internet, com senha.** O motor atende um computador. Veja abaixo.
- **Anexar arquivo ou foto** a um registro. Por enquanto: campo `link` apontando para o Drive.
- **Uma tela desenhada sob medida** (calendário, quadro de colunas, gráfico de linha). Dá para acrescentar uma tela
  própria em `telas/` usando a mesma API (`/api/e/<cadastro>`), mas é trabalho de uma conversa inteira: combine antes.
- **Importar planilha.** Dá para escrever um script que lê o CSV e cria os registros pela API (que confere tudo);
  combine o formato com o dono.
- **Imprimir recibo, mandar e-mail ou WhatsApp sozinho.** São projetos à parte (modelo `robo` da fábrica).

Quando o motor não tiver uma peça que **vários** sistemas vão querer, anote no diário e avise o dono: a peça entra
na fábrica (claude-kit) e chega aqui pela atualização, em vez de ser feita só neste projeto.

## Quando o sistema precisa ir para a internet

Sinais: mais de uma pessoa usando, uso pelo celular fora de casa, cliente acessando. Isso muda o projeto: precisa de
senha, hospedagem e banco de dados de verdade, e dados de outras pessoas trazem obrigações (LGPD). Não adapte este
sistema por conta própria. Leve ao dono a escolha, com o custo de cada caminho (referência:
`referencias/decisoes.md` da skill `fabrica:novo-projeto`).

## Sintoma, causa e conserto

| Sintoma | Causa provável | Conserto |
|---|---|---|
| "O modelo.mjs tem N problema(s)" ao abrir | erro de descrição no modelo | a mensagem diz o cadastro e o campo; corrija e rode `npm run fiscal` |
| "O sistema já está aberto (a porta está em uso)" | outra janela do sistema aberta | use a que já está aberta, ou feche a janela preta antiga |
| Tela "O sistema não respondeu" | a janela preta do sistema foi fechada | abrir o `.bat` de novo e recarregar a página |
| Campo novo não aparece na lista | não está em `lista` | acrescente o identificador em `lista` do cadastro |
| Teste do modelo falha em "dados de exemplo" | a semente não acompanha o modelo (campo obrigatório novo, opção que mudou) | atualize `exemplos/semente.mjs` |
| Registros antigos sumiram depois de mudar um campo | trocou o identificador do campo | volte o identificador antigo (o dado continua guardado) e mude só o `rotulo` |
| "O arquivo de dados está estragado" | o computador desligou no meio, ou alguém editou o arquivo à mão | copiar a cópia mais recente de `dados/copias/` por cima de `dados/banco.json` (peça ao dono) |
| Valor aparece 100 vezes maior ou menor | dinheiro guardado como número (ou o contrário) | o tipo certo é `dinheiro`; se já há dados, é troca de tipo: precisa de plano |
| A data mostra mês antes do dia na folha de telas | o navegador de teste da nuvem é americano | no computador do dono aparece dia/mês/ano; não é defeito |
| `npm run telas` diz que falta o Playwright | no computador ele não vem instalado | rode na nuvem do Claude, ou instale como a mensagem ensina |
| O commit é recusado | `npm run verificar` falhou | leia a saída, corrija, tente de novo (sem `--no-verify`) |
| Tentei mexer em `dados/` e foi bloqueado | trava de segurança: são os dados reais | use o banco em memória dos testes; nunca os dados do dono |
| No PowerShell o `--` não funciona | o PowerShell engole o primeiro `--` | `npm run fiscal '--' --final` (com aspas) |
