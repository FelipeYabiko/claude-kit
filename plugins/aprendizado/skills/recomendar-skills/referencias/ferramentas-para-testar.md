# Ferramentas para testar

Ferramentas de fora que já foram estudadas e parecem servir para o Felipe, mas **ainda não foram
testadas** nem entraram no kit. Sugira quando o pedido combinar com a coluna "Quando sugerir". Antes
de instalar, leia o `SKILL.md` ou o README de novo: o projeto pode ter mudado depois do commit lido.

| Ferramenta | O que faz | Quando sugerir | Cuidados | Repositório e commit lido |
|---|---|---|---|---|
| **earshot** (testado em 08/11/2026 no `criador-video-ranking`) | Dá "ouvidos" ao Claude. Traz 252 efeitos sonoros feitos por programa, sem direitos autorais: whoosh, batida, clique, pop, sino, gota. Cada um sai com a duração e o momento pedidos. Também escuta um vídeo pronto e aponta, com o minuto, o som que entra atrasado em relação ao corte ou que fica baixo demais. Vem como linha de comando, servidor MCP e duas skills (`earshot` e `real-sound`). | Som dos rankings e Shorts no `criador-video-ranking`: escolher efeitos, alinhar efeito com corte, revisar a mixagem antes de publicar. | Testado: `rank` e `critique` funcionam muito bem (escolher o som pela descrição e conferir volume e espectro do vídeo pronto); o banco é de sons gráficos (whoosh, pancada, clique), **sem** chuva, terra, batida ou trinca realistas: para isso, gravações CC0. Instalado com `uv tool install` no commit indicado; os modelos (~1,1 GB) baixam uma vez. Só os efeitos são livres; a música de fundo continua sendo do Felipe. Precisa de `uv` e `ffmpeg`, roda na CPU e baixa modelos na primeira vez (cada comando leva de 20 a 40 s para carregar). Licença MIT para o código; os modelos têm as licenças dos autores deles. | `Leonxlnx/earshot` @ `4ac3d2ac2b15` |
| **reanimate** | Skill do Claude Code que copia uma animação (de um site, gravação de tela, mp4, GIF ou Lottie). Grava a original, faz a cópia, grava a cópia do mesmo jeito e compara quadro a quadro; repete de 2 a 5 vezes até a diferença sumir. | Quando o Felipe quiser copiar o movimento de uma entrada de título, contador ou transição que viu em outro canal ou site. | Feita para sites (CSS, Framer Motion, GSAP, three.js), não testada com o Remotion. Não grava YouTube direto: precisa de uma gravação de tela. Precisa do Bun; macOS e Linux (Windows não testado), então vale rodar na nuvem. Baixa cerca de 250 MB na primeira vez. Parecida com `rtadewald-design:video2html`; a diferença é o ciclo de medir e repetir. MIT. | `NiazMorshed2007/reanimate` @ `3f7a55a2986a` |
| **teardown** | Skill do Claude Code que monta uma máquina como simulador 3D numa página HTML: dá para desmontar e abrir cada peça, e a página faz um tour sozinha. Grava o tour em vídeo a 60 quadros por segundo, com som. | Vídeos do **Blueprint** (como as coisas funcionam) e do **The Collapse Files** (como uma máquina ou estrutura falhou). | Precisa de Node 20+, Playwright e `ffmpeg`; Python para o som. Feita a partir do `whaleyxbt/claude-motion`. MIT. | `elvarofficial/teardown` @ `a91262ac1109` |
| **Kensaku** | Programa para o PC (Windows, Mac e Linux) que acha arquivos pelo que está escrito dentro deles: PDFs, documentos e texto em prints. Também entende busca por sentido, como "prints da semana passada". Tudo fica no computador. Tem MCP para o Claude buscar no mesmo índice. | Quando o Felipe precisar achar material antigo de vídeo no próprio PC. | Programa comum, não é skill. O Windows mostra um aviso na instalação porque o programa não é assinado: baixe só da página de releases oficial. Uma sessão na nuvem só usa o MCP dele se estiver ligada ao PC do Felipe. MIT. | `yjid/kensaku` @ `919775155b24` |

## Receita para criar ferramentas parecidas: fazer, medir, corrigir

As três primeiras funcionam do mesmo jeito, e é por isso que dão resultado melhor do que pedir
"faz igual" uma vez só:

1. O Claude **faz** a animação, o som ou a máquina.
2. Um programa **mede** o resultado: compara quadros, escuta o som, confere os números.
3. O Claude **corrige** a maior diferença e mede de novo, até passar ou até um limite de rodadas.
   O que não passar entra no relatório, com o motivo.

Sem o passo 2 o Claude não sabe o quanto errou e para cedo. Quando o Felipe pedir uma skill nova que
gera algo visual ou sonoro, proponha esse ciclo. Exemplo: uma skill `conferir-ranking` que, depois
de montar um vídeo, tira prints dos momentos-chave e escuta o som, confere se o texto aparece na hora
certa, se cabe na tela do Short e se o efeito bate no corte, e corrige antes de mostrar.

## Origem

Vídeo "Mais 15 projetos open source do GitHub que valem o seu tempo | Vol. 22", do canal Eddwan
Hallen (https://www.youtube.com/watch?v=HskCGNN6gfA), lido pela descrição em 08/11/2026: o vídeo não
pôde ser assistido. Os detalhes vêm dos READMEs dos repositórios, nos commits indicados. Os outros 11
projetos do vídeo (Zero Breach, ESP32 AirPrint, Yuzic, Experiential, Looseleaf, blaze, DevBox,
Kanzo, Ayakaleaf Pro, OpenIDEA e Dossier) ficaram de fora porque não combinam com o trabalho do
Felipe.
