| `npm start` | abre o sistema neste computador (http://localhost:4321) |
| `npm run telas` | folha de telas: fotos de cada tela no celular e no computador, clara e escura, em `folha/` |

## Como este sistema é feito

- **Cadastro novo ou campo novo se faz em `modelo.mjs`**, descrevendo (nome, tipo, opções). A lista, o formulário, a
  busca, os filtros, o painel e a exportação para planilha aparecem sozinhos. Não escreva tela à mão para isso.
- **Regra do negócio se faz em `regras.mjs`** (validação a mais, campo calculado, preencher sozinho), sempre com
  teste em `tests/regras.test.mjs` **antes** da regra.
- **`motor/` e `telas/app.js`, `telas/estilo.css` são o motor da fábrica: não mexa.** Se o motor não faz o que a ficha
  pede, veja "O que o motor não faz" no `docs/manual.md` e fale com o dono antes de inventar. O fiscal avisa quando
  uma peça do motor foi mexida.
- **Aparência** (cor da marca) só em `telas/tokens.css`.
- **`exemplos/semente.mjs`** tem os registros de exemplo de cada cadastro: são eles que aparecem na folha de telas e
  nos testes. Mudou o modelo, atualize a semente junto.
- **`dados/` são os dados reais do dono**: ficam só no computador dele, fora do GitHub. Nunca leia, apague, mova nem
  edite essa pasta (o gancho bloqueia). Para testar, o banco em memória dos testes e da folha de telas.
- **O sistema atende só o próprio computador** (127.0.0.1). Pôr na internet para várias pessoas é outro projeto:
  veja "Quando o sistema precisa ir para a internet" no manual e pergunte ao dono.
