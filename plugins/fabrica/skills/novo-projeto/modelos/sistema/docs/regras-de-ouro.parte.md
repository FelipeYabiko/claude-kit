## Sistemas

1. **O modelo descreve, o motor desenha.** Cadastro e campo novos entram em `modelo.mjs`. Tela escrita à mão para o
   que o modelo resolve é trabalho dobrado e quebra na próxima atualização do motor.
2. **As palavras do dono.** Nome de cadastro, de campo e de opção é o que ele fala no dia a dia ("Orçamento", não
   "Lead"; "Situação", não "Status"). Sistema com palavra estranha não é usado.
3. **Menos campos.** Cada campo a mais é um campo a preencher para sempre. Só entra o que o dono vai consultar,
   filtrar ou somar. Na dúvida, fica para depois.
4. **Obrigatório só o indispensável.** Campo obrigatório que a pessoa não sabe na hora faz ela inventar um valor.
5. **Dinheiro é `dinheiro`, data é `data`, lista fixa é `escolha`.** Guardar número ou data como texto impede somar,
   ordenar e filtrar depois, e consertar com dados já digitados é caro.
6. **Regra do negócio tem teste antes** (um caso que passa, um que quebra) e mensagem que diz o que fazer ("Projeto
   pago precisa do valor."), não o que deu errado por dentro.
7. **Os dados do dono são sagrados.** Nunca tocar em `dados/`. Mudança de modelo não pode perder o que foi digitado:
   acrescentar campo é seguro; trocar o tipo ou o identificador de um campo que já tem dados exige plano de
   conversão combinado com o dono e cópia de segurança antes.
8. **Tirar um campo da tela não apaga o que estava nele** (o motor guarda), mas trocar o identificador é como criar
   um campo novo vazio. Para mudar só o nome que aparece, mude o `rotulo`.
9. **O painel responde às perguntas do dono**, de cima para baixo: primeiro o que pede ação hoje (atrasado, a vencer),
   depois os totais. De 4 a 8 itens; mais do que isso ninguém lê.
10. **Semente realista.** Os exemplos têm casos difíceis: nome comprido, campo vazio, valor alto, data vencida. É com
    eles que a tela é aprovada; exemplo bonitinho esconde tela quebrada.
11. **Usar de verdade antes de mostrar.** Cadastrar, errar de propósito, editar, buscar, filtrar e apagar um registro
    de cada cadastro (`npm start`). Folha de telas não substitui o uso.
