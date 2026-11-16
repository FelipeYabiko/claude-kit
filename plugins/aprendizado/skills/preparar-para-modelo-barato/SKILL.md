---
name: preparar-para-modelo-barato
description: Usa uma sessão do modelo mais forte para deixar um trabalho repetido pronto para o modelo mais barato - um gerador de esqueleto que já roda, um fiscal automático das regras, um manual passo a passo e um banco de temas pesquisados. Use sempre que o Felipe disser que a cota ou o modelo forte vai acabar, pedir para "deixar pronto para o futuro", "salvar aprendizados e ferramentas", "economizar cota", ou quando o mesmo tipo de trabalho (vídeo, relatório, tela, script) já foi feito três vezes ou mais à mão.
---

# Preparar um trabalho para o modelo barato

Modelo forte é caro e some. O que ele sabe fazer bem (decidir, julgar, pesquisar) pode ser gasto **uma vez** e virar
arquivo: daí em diante o modelo barato só preenche e confere. O resultado é o mesmo padrão de qualidade gastando uma
fração da cota.

## Quando usar

- A cota ou o acesso ao modelo forte está no fim.
- Um tipo de trabalho se repete e cada vez recomeça do zero (copiando o anterior).
- As regras estão em texto ("lembre de...") e continuam sendo quebradas.

## Como fazer (nesta ordem; cada peça é salva antes de começar a próxima)

1. **Ache o que se repete.** Abra os dois ou três trabalhos mais recentes e marque o que é igual em todos (a parte
   chata) e o que muda (a parte criativa). Só a parte igual vira ferramenta.
2. **Peças comuns.** Tire a parte igual para um lugar só, **sem mexer nos trabalhos já entregues** (eles continuam
   funcionando do jeito antigo; mexer neles é risco sem ganho).
3. **Gerador de esqueleto.** Um comando que cria o trabalho novo já funcionando, com recheio de exemplo. "Já roda" é a
   regra: o modelo barato melhora algo que existe muito melhor do que monta do zero. Teste gerando um de verdade,
   olhe o resultado e apague.
4. **Fiscal automático.** Transforme em checagem toda regra que dá para conferir sem olhar o resultado (tamanhos,
   ordem, limites, arquivo que falta, texto proibido). Erro trava; aviso é para olhar. Cada regra com um teste que
   passa e um que quebra. Rode nos trabalhos antigos: os aprovados não podem dar erro (se derem, a regra está dura
   demais). Regra em comando não é esquecida; regra em texto é.
5. **Recurso caro por último.** Se o trabalho usa algo pago (voz, imagem, API), crie uma versão provisória grátis para
   montar e conferir tudo, e faça o fiscal travar a entrega enquanto o provisório estiver lá.
6. **Manual passo a passo.** Etapas numeradas, cada uma com o que entregar, o comando e "certo quando...". Inclua uma
   tabela de sintoma, causa e conserto com os erros que já aconteceram. Escreva para alguém que nunca viu o projeto.
7. **Banco de temas.** Gaste o raciocínio do modelo forte adiantando a parte criativa dos próximos trabalhos (ideia,
   ângulo, estrutura), com os fatos pesquisados. Separe **Conferido** (com fonte) de **A confirmar**: o que está em
   "a confirmar" não entra no trabalho sem fonte.
8. **Ligue tudo.** Uma linha no arquivo de instruções do projeto e no painel apontando para o manual, senão ninguém
   acha. Guarde como skill do projeto.

## Exemplo

No projeto de vídeos (16/11/2026), numa sessão só: `npm run novo-3d` cria um episódio 3D completo que já renderiza,
com voz provisória grátis; `npm run checar-3d` confere câmera, legenda, números, sons e textos de publicação;
`npm run folha-3d` tira a folha de quadros para aprovar; um manual de 11 etapas; e 10 pautas com números conferidos.
Dois números que o modelo "lembrava" foram derrubados pela conferência e ficaram em "A confirmar".

## Cuidados

- Não reescreva o que já foi entregue para "aproveitar" as peças novas.
- Fiscal não substitui olhar e ouvir: diga no próprio relatório dele o que continua manual.
- Memória do modelo não é fonte. Número sem fonte fica em "A confirmar", mesmo parecendo certo.
- Pergunte ao Felipe o que priorizar antes de começar: é ele quem sabe o que mais repete.

## Origem

- Conversa de 2026-11-16 no projeto `criador-video-ranking` (último dia do modelo mais forte sem custo extra).
