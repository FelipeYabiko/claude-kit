## Robôs

1. **Ensaio primeiro.** Todo robô roda em modo ensaio (`npm run ensaio`) mostrando o que faria, antes de fazer.
   Enviar e apagar não têm volta; ensaiar é de graça.
2. **Rodar duas vezes dá o mesmo que rodar uma.** O robô lembra o que já fez (memória) e não repete aviso, não
   duplica linha, não manda a mesma mensagem. Teste sempre a segunda rodada.
3. **Cair no meio não estraga nada.** Memória e arquivos só são gravados quando a rodada inteira deu certo; a próxima
   recomeça do mesmo ponto.
4. **Uma fonte fora do ar não derruba as outras.** Falha parcial vira uma linha no relatório; só falha total é erro.
5. **Erro que o dono entende.** "youtube.com respondeu 404 (endereço não existe)", não um código. E dizendo o que
   fazer.
6. **Educado com o site dos outros.** Pedir só o necessário, com intervalo, de preferência pelo caminho oficial (feed,
   API). Nada de mil pedidos por minuto, nada de burlar bloqueio ou login: além de errado, derruba o robô.
7. **Segredo fora do código e do config.** `.env` no computador, "Secrets" no GitHub, nome no `.env.exemplo`.
8. **O que sai para o mundo precisa do OK do dono.** Robô que envia mensagem, publica ou paga só faz isso com o dono
   tendo pedido na ficha; e mesmo assim começa em ensaio, depois manda só para o dono, depois para os outros.
9. **Passo pequeno, com teste.** Um passo faz uma coisa. Internet de faz de conta no teste: um caso que dá certo, um
   que falha.
10. **O relatório é o produto.** Abra `saida/` e leia como o dono vai ler: dá para entender em dez segundos o que
    aconteceu e o que fazer?
11. **Robô agendado precisa de alguém olhando.** Combine como o dono fica sabendo que parou de funcionar (o GitHub
    manda e-mail quando a rodada falha; no computador, o registro em `registros/`).
