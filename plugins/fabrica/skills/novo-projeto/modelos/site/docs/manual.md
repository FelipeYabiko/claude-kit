# Manual do site

O passo a passo para levar este site do exemplo até o ar, e para mudar qualquer coisa depois. Escrito para funcionar
com qualquer modelo do Claude. Cada etapa diz **o que entregar**, **o comando** e **como saber que está certo**. Não
pule etapas nem troque a ordem.

Leia junto: `FICHA.md` (o combinado) e `docs/regras-de-ouro.md` (inteiro).

## Mapa (8 etapas, 2 paradas para o dono)

| # | Etapa | Entrega | Comando |
|---|---|---|---|
| 1 | Ficha | `FICHA.md` sem "PREENCHER", com o OK do dono | |
| 2 | Marca | cores e fontes do dono em `site/estilo/tokens.css` | `npm run fiscal` |
| 3 | Texto | todo `data-exemplo` trocado, seção por seção | `npm run fiscal` |
| | **Parada 1: o dono aprova o texto** | | |
| 4 | Imagens | fotos do dono no lugar das `exemplo-*.svg` | `npm run fiscal` |
| 5 | Seções | as que faltam entram, as sem conteúdo saem | |
| 6 | Olhar | folha de telas conferida, zero erro do navegador | `npm run verificar` e `npm run telas` |
| | **Parada 2: o dono aprova a folha de telas** | | |
| 7 | Publicar | site no ar, link testado no celular | `npm run capa`, `npm run endereco -- https://...`, `npm run fiscal -- --final` |
| 8 | Fechar | diário, lições, painel, tudo enviado | `npm run verificar` |

## 1. Ficha

- A entrevista é feita pela skill `fabrica:novo-projeto` (perguntas em `referencias/entrevista.md` dela). Aqui, confira
  se a `FICHA.md` responde: o que é, para quem, a ação principal, as seções, o tom e o que o dono vai mandar.
- **Certo quando:** `npm run fiscal` não reclama mais de "PREENCHER" na ficha e o dono disse "é isso".

## 2. Marca (cores e fontes)

Tudo em `site/estilo/tokens.css`, e só lá.

- **Cores:** cada uma é `light-dark(#clara, #escura)`. Troque primeiro `--cor-destaque` pela cor da marca do dono e
  rode o fiscal: ele mede o contraste e diz qual par falhou. Ajuste até passar. `--cor-destaque-texto` é o destaque
  usado **como texto** (precisa ser mais escuro no claro e mais claro no escuro).
- **Uma cor de destaque só.** Fundo e texto ficam neutros (um neutro puxado para a cor da marca fica mais elegante do
  que cinza puro).
- **Fontes:** as do modelo já estão em `site/fontes/` (livres). Para trocar: arquivo `.woff2` de licença livre na
  mesma pasta, um `@font-face` novo e o nome em `--fonte-titulo` ou `--fonte-texto`. Nunca link para fonte de outro
  site (cai junto se ele cair) e no máximo duas famílias.
- O estilo geral (editorial, vibrante, técnico) é o de `fabrica.json`. Os detalhes próprios dele estão em
  `site/estilo/toque.css`.
- **Certo quando:** fiscal sem erro de `contraste` e `npm run telas -- --so inicio` mostra a marca do dono nos dois
  temas.

## 3. Texto

Vá seção por seção do `site/index.html`, de cima para baixo. Em cada trecho: troque o texto, **apague o
`data-exemplo`** daquela tag. Receita de cada seção:

| Seção | O que escrever | Erro comum |
|---|---|---|
| Topo (`heroi`) | Título: o resultado para o cliente, em até ~10 palavras, com uma palavra-chave dentro de `<em>`. Apoio: o que é e como funciona, em até 2 linhas. Botão: verbo + resultado. | "Bem-vindo ao nosso site"; nome da empresa como título |
| Prova | 3 números de verdade, com o que significam | número redondo inventado |
| Serviços | 3 ou 4, cada um com o benefício, não a lista de tarefas | 8 serviços que ninguém lê |
| Trabalhos | os 4 melhores, com o que foi feito e o resultado | "Projeto 1", "Projeto 2" |
| Como funciona | 3 passos com prazo: tira o medo de começar | passos que só falam da empresa |
| Depoimento | um, real, com nome e de onde é | depoimento inventado (nunca) |
| Perguntas | as dúvidas que impedem a pessoa de chamar: preço, prazo, o que precisa mandar | "Por que somos os melhores?" |
| Contato | uma frase de convite + o botão da ação principal | três formulários |

- Também troque: `<title>`, `<meta name="description">` (50 a 160 letras, com o que a pessoa procuraria no Google),
  `og:title`, `og:description`, os links do menu e do rodapé, o número do WhatsApp e o e-mail.
- WhatsApp: `https://wa.me/55DDDNUMERO?text=` + a mensagem com espaços trocados por `%20`.
- Sem conteúdo de verdade para uma seção? **Apague a seção** (e o link dela no menu). O fiscal acusa link apontando
  para seção que sumiu.
- **Certo quando:** o fiscal não lista mais `conteudo-de-exemplo` em texto, e o texto lido em voz alta soa como o
  dono.

**Parada 1.** Mostre o texto ao dono em lista (seção: texto), antes de mexer em imagem, e diga o que você inventou
por falta de informação. Texto aprovado antes de desenho evita refazer tudo.

## 4. Imagens

- Só imagem **do dono** ou de **licença livre** (anote a origem em `site/imagens/fontes.md`). Nada de imagem de
  filme, série, jogo, marca dos outros ou tirada do Google.
- Coloque em `site/imagens/`, nome em minúsculas com hífen, sem acento (`padaria-vitrine.jpg`).
- Tamanho: até 1920 px de largura e **menos de 300 KB** (foto: `.jpg` ou `.webp`; desenho e logo: `.svg`). Com o
  ffmpeg: `ffmpeg -i original.jpg -vf scale=1600:-2 -q:v 5 site/imagens/nome.jpg`.
- Em cada `<img>`: `alt` descrevendo a imagem em uma frase, `width` e `height` com o tamanho real do arquivo.
- Apague as `exemplo-*.svg` que não forem mais usadas.
- **Certo quando:** o fiscal não lista mais imagem de exemplo, nem imagem pesada, nem imagem sem `alt`.

## 5. Seções a mais e a menos

- Biblioteca em `secoes/`: `precos`, `equipe`, `video`, `logos-de-clientes`, `formulario` e `texto-longo`. Cada
  arquivo explica quando usar. Copie o HTML para o lugar certo do `index.html` e o CSS (o que está dentro de
  `<style>`) para o **fim** de `site/estilo/secoes.css`.
- Seção que não está na biblioteca: escreva no mesmo padrão (classe da seção + `conteudo`, só tokens, `revelar` nos
  blocos) e, se servir para outros sites, avise o dono para levar à fábrica.
- Página nova (`sobre.html`, `obrigado.html`): copie o `<head>`, o topo e o rodapé do `index.html`; título e
  descrição próprios; um `<h1>`; link no menu das duas páginas.

## 6. Olhar

```bash
npm run verificar
npm run telas
```

- A folha de telas abre o site num navegador de verdade e acusa: erro de programação, imagem que não carregou,
  página vazando para o lado e botão pequeno para o dedo. **Erro dela se corrige antes de mostrar ao dono.**
- Depois **abra cada `folha/folha-*.png`** (são imagens) e confira, dobra por dobra:
  1. Dá para entender o site só com a primeira dobra?
  2. Algum texto cortado, encavalado ou encostado na borda?
  3. Os espaços entre as seções estão parecidos? Alguma seção vazia ou apertada?
  4. No celular, os botões cabem e o menu funciona?
  5. No tema escuro, alguma coisa sumiu ou ficou difícil de ler? E texto em cima de foto?
  6. As imagens estão nítidas e com o enquadramento certo?
- Achou problema: corrija e rode `npm run telas -- --so <tela>` só da tela mexida.
- **Certo quando:** zero erro do navegador e você olhou todas as folhas depois da última mudança.

**Parada 2.** Mande ao dono as folhas `folha/folha-*.png` e diga **os pontos fracos** que você vê (ex.: "falta foto
de verdade nos trabalhos", "o depoimento ainda é o de exemplo").

## 7. Publicar

1. `npm run capa` (gera `site/imagens/capa-para-redes.png`; abra e veja se o título cabe).
2. Descubra o endereço: no GitHub Pages é `https://<usuario>.github.io/<repositorio>/` (ou o domínio próprio).
3. `npm run endereco -- https://<usuario>.github.io/<repositorio>/` (grava em todas as páginas, cria `sitemap.xml` e
   `robots.txt`).
4. `npm run fiscal -- --final`: tem de dar zero erro (nenhum exemplo, nenhum "PREENCHER", "Pronto quando" todo
   marcado).
5. Commit e envio para a `main` (com o OK do dono). A publicação roda sozinha em 1 a 2 minutos.
6. **Uma vez só, o dono liga o GitHub Pages:** no repositório, **Settings → Pages → Source: "GitHub Actions"**. No
   plano grátis do GitHub o repositório precisa ser público.
7. Abra o endereço **no celular**, clique em todos os botões e mande o link para você mesmo no WhatsApp para ver a
   capa.

- **Certo quando:** o site abre no endereço, a capa aparece no WhatsApp e o botão principal leva ao lugar certo.

## 8. Fechar

Siga "Fechar a mudança" do `CLAUDE.md`: diário, lições, `PAINEL.md` (com o endereço do site em "Como abrir"), commit e
envio.

## Mudança depois de publicado

Mesmo caminho, mais curto: entender (ficha) → mexer → `npm run verificar` → `npm run telas -- --so <tela>` e olhar →
mostrar ao dono → `npm run fiscal -- --final` → enviar. Todo envio para a `main` republica o site.

## Sintoma, causa e conserto

| Sintoma | Causa provável | Conserto |
|---|---|---|
| O site abre sem estilo no GitHub Pages | caminho começando com `/` | caminhos relativos (`estilo/base.css`); o fiscal acusa |
| A publicação falhou no GitHub (aba Actions, X vermelho) | o fiscal no modo final achou erro | rode `npm run fiscal -- --final` aqui e corrija |
| A publicação nem começou | GitHub Pages não foi ligado | Settings → Pages → Source: "GitHub Actions" |
| O link no WhatsApp aparece sem capa | falta `npm run capa` ou `npm run endereco`; ou o WhatsApp guardou a versão antiga | rode os dois; teste com `?v=2` no fim do link |
| O tema escuro fica com texto apagado | cor escrita direto no CSS, fora dos tokens | leve a cor para `tokens.css` com `light-dark()` |
| A página vaza para o lado no celular | imagem ou palavra larga sem limite | `max-width: 100%` na imagem; `overflow-wrap: anywhere` no texto |
| As seções não aparecem (ficam invisíveis) | erro no `js/site.js` antes da parte de revelar | veja o erro que a folha de telas mostrou e corrija |
| A fonte não muda | nome no `@font-face` diferente do usado no token, ou caminho errado | confira o nome e `url("../fontes/arquivo.woff2")` |
| `npm run telas` diz que falta o Playwright | no computador ele não vem instalado | rode na nuvem do Claude, ou instale como a mensagem ensina |
| No PowerShell o `--` não funciona | o PowerShell engole o primeiro `--` | `npm run telas '--' --so inicio` (com aspas) |
| A página 404 aparece sem estilo no ar | falta o endereço gravado nela | `npm run endereco -- https://...` de novo |
