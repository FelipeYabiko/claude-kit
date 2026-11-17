# A entrevista

Tira a ideia da cabeça do dono e põe na ficha. É a etapa que mais decide se o projeto vai dar certo: quase todo
projeto que fracassa foi construído certo em cima de uma ideia entendida errado.

## Como perguntar

1. **Primeiro ouça.** Peça para ele contar a ideia do jeito dele, sem interromper. Só depois pergunte o que faltou.
   Não pergunte o que ele já disse.
2. **No máximo 4 perguntas por vez**, em português simples. Quando houver a ferramenta de perguntas com opções, use.
3. **Toda pergunta tem opções e a sua recomendação** ("se tanto faz, eu faria X, porque Y"). Pergunta aberta demais
   ("como você quer o sistema?") devolve o trabalho para ele.
4. **Peça um caso real.** "Me conta a última vez que você precisou disso, do começo ao fim." Um caso de verdade
   mostra os campos, as regras e a ordem das coisas melhor do que dez perguntas.
5. **Nunca pergunte o que é técnico** (banco de dados, linguagem, hospedagem). Pergunte o que **decide** o técnico:
   quantas pessoas usam, em que aparelho, com internet ou sem, se pode custar por mês.
6. **Diga de volta em uma frase** ("Então é: ... para ... conseguir ..."). Só siga quando ele disser "é isso".
7. **Corte para a primeira versão.** Pergunte: "Qual é a menor versão que já te ajuda nesta semana?". O que sobrar vai
   para "Fora do combinado", à vista. Ele não perde a ideia, e você não constrói o que ainda é palpite.
8. **Duas rodadas, no máximo três.** Se depois disso ainda falta coisa, escreva a ficha com o que tem, marque as
   suposições e peça para ele corrigir a ficha: é mais fácil corrigir um texto do que responder mais perguntas.

## Rodada 1: vale para qualquer ideia

| # | Pergunta | Por que importa | Se ele não souber |
|---|---|---|---|
| 1 | **O que é, em uma frase que você diria a um amigo?** | vira o "O que é" da ficha e o título de tudo | proponha duas frases e peça para escolher |
| 2 | **Quem vai usar, em que aparelho e em que momento?** (só você? clientes? no celular, na rua? no computador de casa?) | decide o modelo e onde roda | "só você, no seu computador" é o padrão mais barato |
| 3 | **O que essa pessoa precisa conseguir fazer?** (de 3 a 7 coisas, da mais importante para a menos) | cada uma vira um item de "Pronto quando" | peça o caso real (regra 4) e tire as tarefas dele |
| 4 | **Como você faz isso hoje?** (planilha, caderno, WhatsApp, não faz) | mostra o que já funciona, as palavras que ele usa e de onde vêm os dados | |

Com as respostas, escolha o modelo pela tabela de `decisoes.md` **antes** da rodada 2 (as perguntas mudam).

## Rodada 2: site

| # | Pergunta | Opções para oferecer |
|---|---|---|
| 1 | **Qual é a única coisa que você quer que o visitante faça?** | chamar no WhatsApp (recomendado para negócio no Brasil) · mandar e-mail · preencher formulário · ver os trabalhos · assinar/seguir · comprar |
| 2 | **O que você já tem em mãos?** | logo · cores da marca · fotos próprias · textos · depoimentos reais · números (clientes, anos) · nada ainda |
| 3 | **Com qual destes o seu negócio mais parece?** (mostre os três estilos em uma linha cada: editorial, vibrante, técnico) e **tem algum site que você acha bonito?** | os três estilos de `--listar` |
| 4 | **Que seções fazem sentido?** | o modelo traz: topo, números, serviços, trabalhos, como funciona, depoimento, perguntas, contato. A biblioteca tem: preços, equipe, vídeo, logos de clientes, formulário, texto longo |

Pergunte também, se não ficou claro: o nome que aparece no topo; o número do WhatsApp com DDD; se o repositório pode
ser público (o GitHub Pages grátis exige). **Não invente** depoimento, número nem cliente: sem conteúdo real, a seção
sai.

## Rodada 2: sistema

| # | Pergunta | O que tirar da resposta |
|---|---|---|
| 1 | **Me conta um caso real do começo ao fim** ("chegou um cliente novo... e aí?") | os cadastros (as "coisas" que aparecem na história), os campos e a ordem |
| 2 | **O que você quer ver assim que abrir?** ("quanto tenho a receber", "o que vence esta semana") | o painel |
| 3 | **Como você procura as coisas?** ("por cliente", "só os atrasados", "do mês") | busca, filtros, ordem e colunas das listas |
| 4 | **O que nunca pode acontecer?** ("dois agendamentos no mesmo horário", "pago sem valor") | as regras, cada uma vira um teste |

Depois, feche a tabela de cadastros **com ele**, usando as palavras dele:

- Para cada campo: é texto, número, dinheiro, data, uma lista fixa de opções, sim ou não, ou aponta para outro
  cadastro? É obrigatório? Pode repetir?
- **Corte campos.** Cada campo é um campo a preencher para sempre. Pergunte: "você vai procurar, filtrar ou somar por
  isso?". Se não, fica de fora.
- **Dados que já existem** (planilha, caderno): peça uma amostra sem dados sensíveis. Ela mostra os campos de verdade
  e decide se vale um script de importação.

Sinais de que **não** é o modelo `sistema` (veja `decisoes.md` e leve a escolha ao dono): mais de uma pessoa usando ao
mesmo tempo, uso pelo celular fora de casa, clientes entrando para ver, pagamento, dados sensíveis de terceiros.

## Rodada 2: robô

| # | Pergunta | Opções para oferecer |
|---|---|---|
| 1 | **De onde ele pega as informações?** | um site ou canal público · uma planilha ou arquivo seu · um serviço em que você tem conta |
| 2 | **O que ele te entrega, e onde você quer ver?** | um relatório para abrir · uma planilha que vai acumulando · um aviso no celular · um arquivo para outro projeto seu |
| 3 | **Quando ele roda?** | quando você mandar, com dois cliques (recomendado para começar) · sozinho todo dia · sozinho toda semana |
| 4 | **O que ele nunca pode fazer sem você mandar?** | enviar mensagem a outras pessoas · publicar · apagar · gastar dinheiro |

Pergunte também: precisa de conta ou chave em algum serviço? Quem cria e quanto custa? O que acontece se uma rodada
falhar (ele tenta depois? avisa?).

## Rodada 2: quando não cabe em nenhum modelo (livre)

Jogo, aplicativo de celular, extensão de navegador, análise de dados, loja: use o modelo `livre` e pergunte:

1. **Onde isso roda?** (navegador, celular, computador)
2. **Qual é a menor coisa que, funcionando, já prova que a ideia presta?** (essa é a primeira versão)
3. **Tem algo parecido que você usa ou viu?** (referência concreta vale mais do que descrição)
4. **Pode custar por mês? Quanto?**

E diga com clareza: "isso não tem modelo pronto na fábrica; dá para fazer, mas vai ser mais devagar e com mais
perguntas". Se for o terceiro projeto parecido, proponha criar o modelo na fábrica.

## Sinais de alerta: pare e leve ao dono

| Sinal | Por quê | O que oferecer |
|---|---|---|
| Guardar dados de outras pessoas (clientes, alunos) | a lei de dados (LGPD) traz obrigações; vazamento é problema dele | guardar o mínimo; no modelo `sistema`, os dados ficam só no computador dele |
| Receber pagamento | exige serviço de pagamento, conta, e erro custa dinheiro | link de pagamento pronto (Pix, plataforma) em vez de construir |
| Login e várias pessoas | muda o projeto inteiro (senha, hospedagem, banco) | começar para uma pessoa só; ou serviço pronto |
| Publicar ou mandar mensagem em nome dele | não tem volta | ensaio → só para ele → para os outros |
| Conteúdo dos outros (fotos, música, textos, marcas) | direito autoral | só próprio ou de licença livre, com a origem anotada |
| Mensalidade | compromisso que continua depois do projeto | o caminho grátis primeiro, dizendo o limite dele |
| "Igual ao site/app X" | copiar marca e desenho de outro é problema | pegar a ideia e fazer com a cara dele |
| A lista passou de 7 tarefas | virou dois projetos | cortar para a primeira versão |

## A ficha

Escreva na `FICHA.md` do projeto (o modelo já traz as seções do tipo). Enquanto o projeto não existe, mostre a ficha
na conversa e passe-a ao criar com `--ficha arquivo.md`. Regras:

- **Palavras do dono**, frases curtas. Ele precisa ler e reconhecer a ideia dele.
- **"Fora do combinado"** nunca fica vazio: sempre há algo que foi falado e ficou para depois.
- **"Pronto quando"** tem de 3 a 8 itens que dá para conferir olhando ou rodando, um por tarefa principal. "Funciona
  bem" não serve; "cadastro um cliente em menos de um minuto pelo celular" serve.
- **Marque as suposições** ("supus que...") para ele confirmar na Parada 1.

### Exemplo de ficha preenchida (sistema)

```markdown
## O que é
Um controle dos meus projetos de vídeo: quem é o cliente, quanto vale, o prazo e se já me pagaram.

## Para quem
Só eu, no computador de casa, uma ou duas vezes por dia.

## O que a pessoa consegue fazer
1. Cadastrar um cliente e os projetos dele.
2. Ver, ao abrir, o que está atrasado e quanto tenho a receber.
3. Achar os projetos de um cliente ou de uma situação.
4. Marcar um projeto como entregue e como pago.
5. Levar a lista para uma planilha.

## Cadastros
| Cadastro | Campo | Tipo | Obrigatório? | Observação |
|---|---|---|---|---|
| Clientes | Nome | texto | sim | não pode repetir |
| Clientes | WhatsApp | telefone | não | |
| Projetos | Título | texto | sim | |
| Projetos | Cliente | ligação com Clientes | sim | |
| Projetos | Situação | escolha | sim | Orçamento, Em andamento, Entregue, Pago |
| Projetos | Valor | dinheiro | não | |
| Projetos | Prazo | data | não | |

## Regras
- Projeto pago precisa ter valor.
- "Atrasado" = prazo passou e ainda não foi entregue.

## Fora do combinado (não fazer agora)
- Emitir recibo. Mandar cobrança sozinho. Acesso pelo celular. Anexar arquivos.

## Pronto quando
- [ ] Cadastro um cliente e um projeto dele em menos de um minuto.
- [ ] Ao abrir, vejo quantos projetos estão atrasados e o total a receber.
- [ ] Filtro os projetos por situação e por cliente.
- [ ] Não consigo marcar como pago um projeto sem valor.
- [ ] Baixo a lista de projetos e ela abre certa no Excel.
```
