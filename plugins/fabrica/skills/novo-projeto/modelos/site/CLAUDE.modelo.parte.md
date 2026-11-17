| `npm run ver` | abre o site neste computador (http://localhost:4173) |
| `npm run telas` | folha de telas: fotos de cada página no celular e no computador, clara e escura, em `folha/` |
| `npm run capa` | gera a capa que aparece quando o link é mandado no WhatsApp e nas redes |
| `npm run endereco -- https://...` | grava o endereço definitivo do site em todos os lugares que precisam |

## Como este site é feito

- **Tudo o que vai ao ar está em `site/`**: `index.html` (as seções, na ordem em que aparecem), `estilo/`, `js/`,
  `imagens/`, `fontes/`. O que está fora de `site/` não é publicado.
- **Cores, fontes, raios e sombras moram só em `site/estilo/tokens.css`.** Nos outros CSS, só `var(--...)`. Trocar a
  marca é trocar os valores de lá; o fiscal mede o contraste dos dois temas.
- **Texto e imagem de exemplo estão marcados** (`data-exemplo` e `imagens/exemplo-*.svg`). Ao trocar pelo conteúdo
  de verdade, apague a marca. O fiscal conta o que falta e trava a entrega (`--final`) enquanto sobrar algum.
- **Seção nova** sai da biblioteca `secoes/` (copiar o HTML para o `index.html` e o CSS para o fim de
  `site/estilo/secoes.css`). Seção sem conteúdo de verdade é apagada, nunca preenchida com invenção.
- **Sem biblioteca, sem CDN, sem passo de montagem**: HTML, CSS e um JavaScript pequeno. Caminhos sempre relativos
  (`imagens/foto.jpg`, nunca `/imagens/foto.jpg`).
- **Publicação:** GitHub Pages, sozinho, a cada envio para a `main` (`.github/workflows/publicar.yml`), e só se o
  fiscal passar no modo final.
