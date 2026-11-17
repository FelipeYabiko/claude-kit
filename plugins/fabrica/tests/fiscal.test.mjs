// O fiscal dos projetos: cada regra com um caso que passa e um que quebra (regra dura demais trava projeto bom;
// regra frouxa deixa passar o erro que ela existe para pegar). Regra nova: escreva o teste aqui primeiro.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {test} from 'node:test';
import {contraste, lerTokens, paresDe} from '../skills/novo-projeto/modelos/base/ferramentas/fiscal/cores.mjs';
import {lerTags, textoDe} from '../skills/novo-projeto/modelos/base/ferramentas/fiscal/html.mjs';
import {listarArquivos} from '../skills/novo-projeto/modelos/base/ferramentas/fiscal/nucleo.mjs';
import {MINIMO, SITE, escrever, fiscal, pagina, pastaTemporaria} from './apoio.mjs';

test('o projeto mínimo passa sem erro nem aviso', async () => {
	const r = await fiscal();
	assert.deepEqual([r.erros, r.avisos], [[], []]);
	const site = await fiscal(SITE, {tipo: 'site'});
	assert.deepEqual([site.erros, site.avisos], [[], []]);
});

// ---------- Regras gerais ----------

test('arquivos do projeto: cada um que falta é apontado com o motivo', async () => {
	const r = await fiscal({'PAINEL.md': null, 'FICHA.md': null, 'docs/diario.md': null});
	assert.equal(r.de('arquivos-do-projeto').length, 3);
	assert.ok(r.erro('arquivos-do-projeto', /falta PAINEL\.md \(a página que diz o estado/));
});

test('ficha: trecho por preencher é aviso no dia a dia e erro na entrega', async () => {
	const ficha = '# Ficha\n\n## O que é\nPREENCHER\n\n## Pronto quando\n\n- [x] a\n- [ ] b\n- [ ] c\n';
	const normal = await fiscal({'FICHA.md': ficha});
	assert.ok(normal.aviso('ficha', /1 trecho\(s\) ainda com "PREENCHER"/));
	assert.equal(normal.erros.length, 0);
	const final = await fiscal({'FICHA.md': ficha}, {final: true});
	assert.ok(final.erro('ficha', /PREENCHER/));
	assert.ok(final.erro('ficha', /2 item\(ns\) de "Pronto quando" sem marcar: b; c/));
	const poucos = await fiscal({'FICHA.md': '# Ficha\n\n## Pronto quando\n\n- [x] a\n'});
	assert.ok(poucos.aviso('ficha', /pelo menos 3 itens/));
});

test('segredos: chave conhecida e .env no git são erro; exemplo e variável de ambiente passam', async () => {
	// chaves de mentira montadas em pedaços, para o próprio repositório do kit não acusar vazamento
	const anthropic = `sk-ant-${'a1B2'.repeat(8)}`;
	const google = `AIza${'x'.repeat(35)}`;
	const github = `ghp_${'Z9'.repeat(18)}`;
	const r = await fiscal({'a.mjs': `const chave = '${anthropic}';\n`, 'b.json': `{"k": "${google}"}`, 'c.md': `token ${github}`, '.gitignore': 'node_modules/\n', '.env': 'X=1\n'});
	assert.ok(r.erro('segredos', /a\.mjs.*chave de Anthropic/));
	assert.ok(r.erro('segredos', /b\.json.*chave de Google/));
	assert.ok(r.erro('segredos', /c\.md.*chave de GitHub/));
	assert.ok(r.erro('segredos', /\.env.*arquivo de segredos indo para o GitHub/));
	const suspeito = await fiscal({'a.mjs': 'const senha = "minhaSenhaSuperSecreta123";\n'});
	assert.ok(suspeito.aviso('segredos', /"senha" com um valor fixo/));
	const limpo = await fiscal({'a.mjs': 'const senha = process.env.SENHA;\nconst token = "coloque-a-sua-chave-aqui-123";\nconst apiKey = "<sua-chave-de-exemplo>";\n', '.env': 'SEGREDO=1\n', '.env.exemplo': 'SEGREDO=\n'});
	assert.deepEqual(limpo.de('segredos'), [], 'o .env está no .gitignore e os valores são de exemplo');
});

test('nomes que quebram no Windows', async () => {
	const r = await fiscal({'Foto.png': 'a', 'foto.png': 'b', 'docs/aux.md': 'x', 'notas/fim.': 'x'});
	// em disco que não diferencia maiúsculas (Mac, Windows) o segundo arquivo nem chega a existir: a regra é para quem roda no Linux
	if (fs.readdirSync(r.raiz).filter((f) => f.toLowerCase() === 'foto.png').length === 2) assert.ok(r.erro('nomes-windows', /só muda maiúscula\/minúscula/));
	assert.ok(r.erro('nomes-windows', /"aux\.md" é nome reservado do Windows/));
	assert.ok(r.erro('nomes-windows', /terminando em ponto ou espaço/));
	const doisPontos = await fiscal({'relatorio 10:30.txt': 'x'});
	assert.ok(doisPontos.erro('nomes-windows', /caractere que o Windows não aceita/));
	assert.deepEqual((await fiscal({'Abrir Estudio Aurora.bat': '@echo off\r\n', '.gitattributes': '*.bat text eol=crlf\n'})).de('nomes-windows'), [], 'espaço e maiúscula no nome são permitidos');
});

test('arquivo grande demais para o GitHub', async () => {
	const raiz = pastaTemporaria();
	escrever(raiz, MINIMO);
	// arquivos "ocos": têm o tamanho mas não ocupam disco
	for (const [nome, mb] of [['video.mp4', 96], ['foto.psd', 30]]) fs.closeSync(fs.openSync(path.join(raiz, nome), 'w')), fs.truncateSync(path.join(raiz, nome), mb * 1024 * 1024);
	const {fiscalizar} = await import('../skills/novo-projeto/modelos/base/ferramentas/fiscal/nucleo.mjs');
	const {todasAsRegras} = await import('../skills/novo-projeto/modelos/base/ferramentas/fiscal.mjs');
	const r = await fiscalizar(raiz, await todasAsRegras());
	assert.ok(r.erros.some((a) => a.regra === 'arquivo-grande' && a.arquivo === 'video.mp4'));
	assert.ok(r.avisos.some((a) => a.regra === 'arquivo-grande' && a.arquivo === 'foto.psd'));
});

test('comandos e dependências', async () => {
	const semComandos = await fiscal({'package.json': JSON.stringify({scripts: {test: 'x'}})});
	assert.ok(semComandos.erro('comandos', /falta o comando "npm run verificar"/));
	assert.ok(semComandos.erro('comandos', /falta o comando "npm run fiscal"/));
	const pkg = (deps) => JSON.stringify({scripts: {verificar: 'x', test: 'x', fiscal: 'x'}, dependencies: deps});
	const semTrava = await fiscal({'package.json': pkg({lodash: '^4'})});
	assert.ok(semTrava.erro('comandos', /falta o package-lock\.json/));
	assert.ok(semTrava.aviso('comandos', /dependência "lodash" sem o OK anotado/));
	const aprovada = await fiscal({'package.json': pkg({lodash: '^4'}), 'package-lock.json': '{}', 'FICHA.md': `${MINIMO['FICHA.md'].replace('Nenhuma.', '- lodash: agrupar listas (OK em 10/11/2026)')}`});
	assert.deepEqual(aprovada.de('comandos'), []);
	assert.ok((await fiscal({'package.json': '{quebrado'})).erro('comandos', /não abre como JSON/));
});

test('testes: sistema e robô sem teste é erro; projeto livre, aviso; site, nada', async () => {
	assert.ok((await fiscal({'tests/a.test.mjs': null})).aviso('testes', /nenhum teste/));
	assert.equal((await fiscal({...SITE}, {tipo: 'site'})).de('testes').length, 0);
});

test('painel parado no tempo e painel sem data', async () => {
	const atrasado = await fiscal({'docs/diario.md': '# Diário\n\n## 15/11/2026 · Mudança nova\n\n## 10/11/2026 · Criado\n'});
	assert.ok(atrasado.aviso('painel-em-dia', /o diário tem mudança de 15\/11\/2026 e o painel parou antes/));
	assert.ok((await fiscal({'PAINEL.md': '# Painel\n'})).aviso('painel-em-dia', /falta a linha "Atualizado em/));
	assert.equal((await fiscal({'docs/diario.md': '# Diário\n\n## 09/11/2026 · Antiga\n'})).de('painel-em-dia').length, 0);
});

test('acentos quebrados (arquivo salvo na codificação errada)', async () => {
	const r = await fiscal({'texto.md': `A${String.fromCharCode(0xc3, 0xa7)}${String.fromCharCode(0xc3, 0xa3)}o\n`, 'bom.md': 'Ação, coração, não.\n'});
	assert.equal(r.de('texto-quebrado').length, 1);
	assert.ok(r.erro('texto-quebrado', /texto\.md.*acentos quebrados/));
});

test('pendências e provisórios: aviso no dia a dia, provisório trava a entrega', async () => {
	const arquivos = {'a.mjs': '// TODO: tratar o erro\nconst voz = "PROVISÓRIO";\n'};
	const normal = await fiscal(arquivos);
	assert.ok(normal.aviso('pendencias', /1 marca\(s\) de pendência \(TODO\)/));
	assert.ok(normal.aviso('pendencias', /PROVISÓRIO/));
	assert.ok((await fiscal(arquivos, {final: true})).erro('pendencias', /PROVISÓRIO/));
	assert.equal((await fiscal({'docs/manual.md': 'Marque como PROVISÓRIO o que for provisório. TODO é pendência.\n'})).de('pendencias').length, 0, 'documentação pode falar das palavras');
});

test('peças da fábrica: mexida à mão é aviso, apagada é erro, intacta passa', async () => {
	const {createHash} = await import('node:crypto');
	const assinatura = (texto) => createHash('sha256').update(texto).digest('hex').slice(0, 12);
	const fabrica = (pecas) => JSON.stringify({fabrica: '0.0.0', tipo: 'livre', pecas});
	const intacta = await fiscal({'ferramentas/x.mjs': 'export const a = 1;\n', 'fabrica.json': fabrica({'ferramentas/x.mjs': assinatura('export const a = 1;\n')})});
	assert.equal(intacta.de('pecas-da-fabrica').length, 0);
	const comOutroFimDeLinha = await fiscal({'ferramentas/x.mjs': 'export const a = 1;\r\n', 'fabrica.json': fabrica({'ferramentas/x.mjs': assinatura('export const a = 1;\n')})});
	assert.equal(comOutroFimDeLinha.de('pecas-da-fabrica').length, 0, 'fim de linha do Windows não conta como mexida');
	const mexida = await fiscal({'ferramentas/x.mjs': 'export const a = 2;\n', 'fabrica.json': fabrica({'ferramentas/x.mjs': assinatura('export const a = 1;\n'), 'ferramentas/sumiu.mjs': 'abc'})});
	assert.ok(mexida.aviso('pecas-da-fabrica', /mexida\(s\) à mão: ferramentas\/x\.mjs/));
	assert.ok(mexida.erro('pecas-da-fabrica', /apagada\(s\): ferramentas\/sumiu\.mjs/));
});

test('atalho .bat precisa do fim de linha do Windows garantido', async () => {
	assert.ok((await fiscal({'Abrir.bat': '@echo off\r\n'})).aviso('bat-no-windows', /eol=crlf/));
	assert.equal((await fiscal({'Abrir.bat': '@echo off\r\n', '.gitattributes': '* text=auto eol=lf\n*.bat text eol=crlf\n'})).de('bat-no-windows').length, 0);
});

test('a lista de arquivos respeita o .gitignore (pasta, arquivo, curinga e exceção)', () => {
	const raiz = pastaTemporaria();
	escrever(raiz, {'.gitignore': '# comentário\nnode_modules/\ndados/\n*.log\n.env\n.env.*\n!.env.exemplo\n/so-na-raiz.txt\n', 'a.mjs': '', 'dados/banco.json': '', 'x/dados/y.json': '', 'erro.log': '', 'x/outro.log': '', '.env': '', '.env.local': '', '.env.exemplo': '', 'so-na-raiz.txt': '', 'x/so-na-raiz.txt': '', 'node_modules/p/i.js': '', 'folha/f.png': ''});
	assert.deepEqual(listarArquivos(raiz), ['.env.exemplo', '.gitignore', 'a.mjs', 'x/so-na-raiz.txt']);
});

// ---------- Páginas (site e telas de sistema) ----------

const site = (arquivos, opcoes = {}) => fiscal({...SITE, ...arquivos}, {tipo: 'site', ...opcoes});

test('página: o básico que falta é erro', async () => {
	const r = await site({'site/index.html': '<html><head></head><body><h1>Oi</h1></body></html>'});
	for (const expr of [/falta `<!doctype html>`/, /falta o idioma/, /falta `<meta charset/, /falta `<meta name="viewport"/, /falta o `<title>`/]) assert.ok(r.erro('pagina-base', expr), String(expr));
});

test('página: descrição, capa das redes e ícone são avisos; página fora do Google não precisa deles', async () => {
	const pelada = '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Padaria do Bairro</title>';
	const r = await site({'site/index.html': pagina('<h1>Oi</h1>', {cabeca: pelada})});
	assert.equal(r.erros.length, 0);
	for (const expr of [/falta `<meta name="description">`/, /og:title/, /og:image/, /ícone da aba/]) assert.ok(r.aviso('pagina-base', expr), String(expr));
	const escondida = await site({'site/404.html': pagina('<h1>Não achei</h1>', {cabeca: `${pelada.replace('Padaria do Bairro', 'Página não encontrada')}<meta name="robots" content="noindex">`})});
	assert.equal(escondida.de('pagina-base').length, 0);
});

test('página: título comprido, título repetido e descrição fora do tamanho', async () => {
	const cabeca = (titulo, descricao) => `<meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${titulo}</title><meta name="description" content="${descricao}"><meta property="og:title" content="t"><meta property="og:description" content="d"><meta property="og:image" content="https://x.com/c.png"><link rel="icon" href="icone.svg">`;
	const boa = 'Pão quente toda manhã no bairro, com entrega e encomenda pelo WhatsApp.';
	const r = await site({'site/index.html': pagina('<h1>A</h1>', {cabeca: cabeca('Padaria', 'Curta.')}), 'site/sobre.html': pagina('<h1>B</h1>', {cabeca: cabeca('Padaria', boa)}), 'site/longa.html': pagina('<h1>C</h1>', {cabeca: cabeca('T'.repeat(70), boa)})});
	assert.ok(r.aviso('pagina-base', /descrição com 6 letras/));
	assert.ok(r.aviso('pagina-base', /mesmo título de site\/index\.html/));
	assert.ok(r.aviso('pagina-base', /título com 70 letras/));
});

test('capa das redes: caminho curto avisa que falta gerar e trava a entrega até ter o endereço completo', async () => {
	const comCapaCurta = SITE['site/index.html'].replace('https://exemplo.com.br/capa.png', 'imagens/capa-para-redes.png');
	assert.ok((await site({'site/index.html': comCapaCurta})).aviso('pagina-base', /rode `npm run capa`/));
	assert.ok((await site({'site/index.html': comCapaCurta, 'site/imagens/capa-para-redes.png': 'x'}, {final: true})).erro('pagina-base', /rode `npm run endereco/));
});

test('títulos de seção: um h1 só, sem pular nível', async () => {
	assert.ok((await site({'site/index.html': pagina('<h2>Sem principal</h2>')})).erro('titulos-de-secao', /tem 0 título\(s\) principal/));
	assert.ok((await site({'site/index.html': pagina('<h1>A</h1><h1>B</h1>')})).erro('titulos-de-secao', /tem 2 título/));
	assert.ok((await site({'site/index.html': pagina('<h1>A</h1><h2>B</h2><h4>C</h4>')})).aviso('titulos-de-secao', /pulou de <h2> para <h4>/));
	assert.equal((await site({'site/index.html': pagina('<h1>A</h1><h2>B</h2><h3>C</h3><h2>D</h2>')})).de('titulos-de-secao').length, 0);
});

test('imagens: sem alt é erro, sem tamanho é aviso, pesada é aviso ou erro', async () => {
	const r = await site({'site/index.html': pagina('<h1>A</h1><img src="a.png"><img src="a.png" alt="" width="10" height="10">'), 'site/a.png': 'x', 'site/media.jpg': Buffer.alloc(600 * 1024), 'site/enorme.jpg': Buffer.alloc(2100 * 1024)});
	assert.equal(r.de('imagens', 'erro').filter((m) => /sem `alt`/.test(m)).length, 1, 'alt vazio vale (imagem de enfeite)');
	assert.ok(r.aviso('imagens', /sem `width` e `height`/));
	assert.equal((await site({'site/index.html': pagina('<h1>A</h1><div class="preview"><img alt=""></div>')})).de('imagens').length, 0, 'moldura vazia que o site preenche depois não precisa de tamanho');
	assert.ok(r.aviso('imagens', /media\.jpg: imagem de 600 KB/));
	assert.ok(r.erro('imagens', /enorme\.jpg: imagem de 2\.1 MB/));
});

test('links: arquivo que não existe, âncora que não existe, caminho com barra e link vazio', async () => {
	const miolo = '<h1 id="topo">A</h1><a href="sumiu.html">Sumiu</a><a href="#nada">Nada</a><a href="#topo">Topo</a><a href="/imagens/x.png">Barra</a><a href="#">Vazio</a><a href="sobre.html#time">Time</a><a href="sobre.html#equipe">Equipe</a><a href="https://exemplo.com">Fora</a><a href="mailto:a@b.co">Carta</a><script src="js/x.js"></script>';
	const r = await site({'site/index.html': pagina(miolo), 'site/sobre.html': pagina('<h1>Sobre</h1><h2 id="equipe">Equipe</h2>', {cabeca: SITE['site/index.html'].match(/<head>(.*)<\/head>/s)[1].replace('Padaria do Bairro', 'Sobre a padaria')})});
	assert.ok(r.erro('links', /aponta para "sumiu\.html", que não existe/));
	assert.ok(r.erro('links', /aponta para "#nada"/));
	assert.ok(r.erro('links', /caminho começando com "\/"/));
	assert.ok(r.erro('links', /aponta para "#time", mas não existe nada com esse id em site\/sobre\.html/));
	assert.ok(r.erro('links', /aponta para "js\/x\.js"/));
	assert.ok(r.aviso('links', /link vazio/));
	assert.equal(r.de('links').length, 6, 'os links certos (âncora que existe, outra página, site de fora, e-mail) passam');
	assert.ok((await site({'site/index.html': pagina('<h1>A</h1><a href="#">Vazio</a>')}, {final: true})).erro('links', /link vazio/));
});

test('links: botão ou link sem texto é erro; texto vago é aviso; imagem com alt e aria-label valem', async () => {
	const miolo = '<h1>A</h1><a href="https://x.com"></a><button type="button"><span></span></button><a href="https://x.com">clique aqui</a><a href="https://x.com"><img src="a.png" alt="Instagram" width="1" height="1"></a><button type="button" aria-label="Abrir menu"></button><a href="https://x.com">Ver os trabalhos</a>';
	const r = await site({'site/index.html': pagina(miolo), 'site/a.png': 'x'});
	assert.equal(r.de('links', 'erro').length, 2);
	assert.ok(r.erro('links', /<a> sem texto/));
	assert.ok(r.erro('links', /<button> sem texto/));
	assert.ok(r.aviso('links', /texto vago \("clique aqui"\)/));
});

test('links: o CSS apontando para arquivo que não existe', async () => {
	const r = await site({'site/estilo/base.css': '@font-face { src: url("../fontes/sumiu.woff2"); }\n.a { background: url(../icone.svg); }\n.b { background: url("data:image/png;base64,AAAA"); }\n/* url(comentario.png) */\n'});
	assert.deepEqual(r.de('links'), ['site/estilo/base.css: o CSS aponta para "../fontes/sumiu.woff2", que não existe']);
});

test('formulários: campo sem rótulo é erro; label ligado, label em volta e aria-label valem', async () => {
	const miolo = '<h1>A</h1><form><input type="text" name="solto"><label for="n">Nome</label><input id="n" type="text"><label>E-mail <input type="email"></label><input type="search" aria-label="Buscar"><input type="hidden" name="x"><button type="submit">Enviar</button><textarea placeholder="Só placeholder"></textarea></form>';
	const r = await site({'site/index.html': pagina(miolo)});
	assert.equal(r.de('formularios').length, 2, 'o input solto e o textarea só com placeholder');
});

test('contraste: mede os dois temas e todo par sobre-X em cima de X', async () => {
	assert.equal(Math.round(contraste('#000', '#ffffff')), 21);
	assert.equal(contraste('#777777', '#ffffff').toFixed(2), '4.48');
	const tokens = lerTokens(':root { --cor-fundo: light-dark(#fff, #111); --cor-texto: #222; /* --cor-velha: #000; */ --cor-vivo: light-dark(#c8f751, #6d4dff); --cor-sobre-vivo: light-dark(#141c00, #ffffff); --cor-x: oklch(50% 0.1 20); --cor-y: var(--cor-x); }');
	assert.deepEqual(tokens.claro, {fundo: '#fff', texto: '#222', vivo: '#c8f751', 'sobre-vivo': '#141c00'});
	assert.equal(tokens.escuro.fundo, '#111');
	assert.deepEqual(tokens.ilegiveis, ['x'], 'var() não é ilegível, só não entra na conta');
	assert.deepEqual(paresDe(tokens.claro), [['texto', 'fundo'], ['sobre-vivo', 'vivo']]);
	const ruim = await site({'site/estilo/tokens.css': ':root { --cor-fundo: light-dark(#ffffff, #101010); --cor-texto: light-dark(#111111, #f0f0f0); --cor-texto-suave: light-dark(#aaaaaa, #555555); --cor-destaque: #ffcc00; --cor-sobre-destaque: #ffffff; --cor-z: rgb(0 0 0); }'});
	assert.ok(ruim.erro('contraste', /tema claro: --cor-texto-suave \(#aaaaaa\) sobre --cor-fundo \(#ffffff\) tem contraste 2\.3/));
	assert.ok(ruim.erro('contraste', /tema escuro: --cor-texto-suave/));
	assert.ok(ruim.erro('contraste', /--cor-sobre-destaque \(#ffffff\) sobre --cor-destaque \(#ffcc00\)/));
	assert.ok(ruim.aviso('contraste', /não consegui ler a cor --cor-z/));
});

test('estilo: cor fora dos tokens, animação sem respeito a quem pediu menos movimento e estilo na tag', async () => {
	const r = await site({'site/estilo/base.css': '.a { color: #ff0000; background: rgba(0, 0, 0, 0.5); transition: opacity 1s; }\n/* #123456 em comentário não conta */\n', 'site/index.html': pagina('<h1 style="color: red">A</h1><p style="margin: 0">b</p><p style="margin: 0">c</p><p style="margin: 0">d</p>')});
	assert.ok(r.aviso('estilo-nos-tokens', /2 cor\(es\) escrita\(s\) direto no CSS \(a primeira: #ff0000\)/));
	assert.ok(r.aviso('estilo-nos-tokens', /prefers-reduced-motion/));
	assert.ok(r.aviso('estilo-nos-tokens', /4 estilos escritos direto na tag/));
	const certo = await site({'site/estilo/base.css': '.a { color: var(--cor-texto); background: color-mix(in srgb, var(--cor-texto) 8%, transparent); transition: opacity 1s; }\n@media (prefers-reduced-motion: reduce) { .a { transition: none; } }\n'});
	assert.equal(certo.de('estilo-nos-tokens').length, 0);
});

test('conteúdo de exemplo: aviso enquanto se trabalha, erro na entrega; lorem ipsum é sempre erro', async () => {
	const arquivos = {'site/index.html': pagina('<h1 data-exemplo>Título de exemplo</h1><p data-exemplo>Texto</p><img src="imagens/exemplo-capa.svg" alt="x" width="1" height="1">'), 'site/imagens/exemplo-capa.svg': '<svg xmlns="http://www.w3.org/2000/svg"/>'};
	const normal = await site(arquivos);
	assert.ok(normal.aviso('conteudo-de-exemplo', /2 trecho\(s\) ainda com o texto de exemplo/));
	assert.ok(normal.aviso('conteudo-de-exemplo', /1 imagem\(ns\) de exemplo/));
	assert.equal(normal.erros.length, 0);
	assert.equal((await site(arquivos, {final: true})).de('conteudo-de-exemplo', 'erro').length, 2);
	assert.ok((await site({'site/index.html': pagina('<h1>A</h1><p>Lorem ipsum dolor sit amet.</p>')})).erro('conteudo-de-exemplo', /lorem ipsum/));
	const antigas = await site({'site/index.html': pagina('<h1>A</h1><img src="images/exemplo.png" alt="a" width="1" height="1"><img src="images/exemplo2.png" alt="b" width="1" height="1"><img src="img/placeholder_1.jpg" alt="c" width="1" height="1"><img src="images/exemplos-de-uso.png" alt="d" width="1" height="1">'), 'site/images/exemplo.png': 'x', 'site/images/exemplo2.png': 'x', 'site/img/placeholder_1.jpg': 'x', 'site/images/exemplos-de-uso.png': 'x'});
	assert.ok(antigas.aviso('conteudo-de-exemplo', /3 imagem\(ns\) de exemplo, que só seguram o lugar \(exemplo\.png, exemplo2\.png, placeholder_1\.jpg\)/), 'nome parecido ("exemplos-de-uso") não conta');
});

test('link que ainda é de exemplo: perfil "seu-...", e-mail de exemplo e telefone 9999', async () => {
	const miolo = '<h1>A</h1><a href="https://linkedin.com/in/seu-linkedin" aria-label="LinkedIn"></a><a href="mailto:contato@exemplo.com.br">E-mail</a><a href="https://wa.me/5511999999999">WhatsApp</a><a href="https://github.com/FelipeYabiko" aria-label="GitHub"></a><a href="https://linkedin.com/in/maria-souza">LinkedIn</a><a href="mailto:ana@exemploseguros.com.br">Seguros</a><a href="https://x.com" data-exemplo>Marcado</a>';
	const r = await site({'site/index.html': pagina(miolo)});
	assert.equal(r.de('conteudo-de-exemplo').filter((m) => /link que ainda é de exemplo/.test(m)).length, 3);
	assert.ok(r.aviso('conteudo-de-exemplo', /"https:\/\/linkedin\.com\/in\/seu-linkedin"/));
	assert.ok((await site({'site/index.html': pagina(miolo)}, {final: true})).erro('conteudo-de-exemplo', /seu-linkedin/));
});

test('a biblioteca de seções (pedaços para copiar) não é conferida como página', async () => {
	const r = await site({'secoes/precos.html': '<section><h2 data-exemplo>Preços</h2><img src="nao-existe.png"></section>'});
	assert.deepEqual([r.erros, r.avisos], [[], []]);
});

test('peso da página: soma o que a página carrega logo de cara', async () => {
	const r = await site({'site/index.html': pagina('<h1>A</h1><img src="a.jpg" alt="a" width="1" height="1"><img src="b.jpg" alt="b" width="1" height="1"><img src="c.jpg" alt="c" width="1" height="1"><img src="d.jpg" alt="d" width="1" height="1">'), ...Object.fromEntries(['a', 'b', 'c', 'd'].map((n) => [`site/${n}.jpg`, Buffer.alloc(450 * 1024)]))});
	assert.ok(r.aviso('peso-da-pagina', /carrega 1\.8 MB logo de cara/));
});

test('leitor de HTML: ignora comentário e miolo de script, lê atributos com e sem aspas', () => {
	const html = '<!-- <img src="comentado.png"> -->\n<script>const a = "<img src=dentro.png>";</script>\n<a HREF=\'x.html\' data-exemplo class=botao>Ver <b>tudo</b></a>\n<img\n  src="real.png"\n  alt="">';
	const tags = lerTags(html);
	assert.deepEqual(tags.map((t) => t.nome), ['script', 'a', 'b', 'img']);
	assert.deepEqual(tags[1].atributos, {href: 'x.html', 'data-exemplo': '', class: 'botao'});
	assert.equal(textoDe(html, tags[1]), 'Ver tudo');
	assert.equal(tags[3].linha, 4);
	assert.deepEqual(tags[3].atributos, {src: 'real.png', alt: ''});
});

// ---------- Sistemas ----------

const MOTOR = '../skills/novo-projeto/modelos/sistema/motor/modelo.mjs';
const sistema = async (arquivos, opcoes = {}) => {
	const motor = fs.readFileSync(new URL(MOTOR, import.meta.url), 'utf8');
	return fiscal({'.gitignore': 'node_modules/\n.env\ndados/\n', 'motor/modelo.mjs': motor, 'regras.mjs': 'export const regras = {};\n', 'tests/regras.test.mjs': '// testes\n', ...arquivos}, {tipo: 'sistema', ...opcoes});
};
const MODELO_BOM = "export const modelo = {nome: 'S', entidades: {clientes: {nome: 'Clientes', singular: 'cliente', campos: {nome: {rotulo: 'Nome', tipo: 'texto'}}}}};\n";

test('sistema: modelo certo passa; modelo com problema, que não carrega ou de exemplo é apontado', async () => {
	assert.equal((await sistema({'modelo.mjs': MODELO_BOM})).de('modelo').length, 0);
	const ruim = await sistema({'modelo.mjs': MODELO_BOM.replace("tipo: 'texto'", "tipo: 'moeda'")});
	assert.ok(ruim.erro('modelo', /cadastro "clientes", campo "nome": tipo "moeda" não existe/));
	assert.ok((await sistema({'modelo.mjs': 'export const modelo = {nome: \n'})).erro('modelo', /não carrega \(erro de escrita\)/));
	const exemplo = MODELO_BOM.replace("nome: 'S',", "nome: 'S', exemplo: true,");
	assert.ok((await sistema({'modelo.mjs': exemplo})).aviso('modelo', /ainda são os de exemplo/));
	assert.ok((await sistema({'modelo.mjs': exemplo}, {final: true})).erro('modelo', /ainda são os de exemplo/));
});

test('sistema: regra do negócio sem teste é aviso; regra de cadastro que não existe é erro', async () => {
	const regras = "export const regras = {clientes: {validar: () => ({}), calculados: {vip: {rotulo: 'VIP', tipo: 'sim-nao', calcular: () => true}}}, pedidos: {validar: () => ({})}};\n";
	const r = await sistema({'modelo.mjs': MODELO_BOM, 'regras.mjs': regras, 'tests/regras.test.mjs': "regras.clientes.validar({});\n"});
	assert.ok(r.aviso('modelo', /regra sem teste.*clientes\.vip/));
	assert.ok(!r.aviso('modelo', /clientes\.validar/), 'a que tem teste não é citada');
	assert.ok(r.erro('modelo', /regras para "pedidos", que não é um cadastro/));
	const testado = await sistema({'modelo.mjs': MODELO_BOM, 'regras.mjs': regras.replace(", pedidos: {validar: () => ({})}", ''), 'tests/regras.test.mjs': 'regras.clientes.validar({});\nregras.clientes.calculados.vip.calcular({});\n'});
	assert.equal(testado.de('modelo').length, 0);
});

test('sistema: os dados reais do dono nunca vão para o GitHub', async () => {
	const r = await sistema({'modelo.mjs': MODELO_BOM, '.gitignore': 'node_modules/\n.env\n', 'dados/banco.json': '{}'});
	assert.ok(r.erro('dados-do-dono', /dados\/banco\.json.*indo para o GitHub/));
	assert.ok(r.erro('dados-do-dono', /o \.gitignore precisa da linha `dados\/`/));
	assert.equal((await sistema({'modelo.mjs': MODELO_BOM, 'dados/banco.json': '{}'})).de('dados-do-dono').length, 0, 'com dados/ no .gitignore, o arquivo nem entra na lista');
});

test('sistema: as rotas das telas e os endereços da API não são tratados como link quebrado', async () => {
	const tela = pagina('<a href="#/">Início</a><a href="#/e/clientes">Clientes</a><a href="/api/copia" download>Baixar</a><script src="app.js"></script>');
	const r = await sistema({'modelo.mjs': MODELO_BOM, 'telas/index.html': tela, 'telas/app.js': '', 'telas/icone.svg': '<svg xmlns="http://www.w3.org/2000/svg"/>'});
	assert.deepEqual(r.de('links'), []);
});

// ---------- Robôs ----------

const PASSO = "export const descricao = 'buscar';\nexport const rodar = async (entrada, ctx) => ctx.rede.buscarTexto(ctx.config.endereco);\n";
const robo = (arquivos, opcoes = {}) => fiscal({'config.json': '{"fontes": []}', 'passos/1-buscar.mjs': PASSO, 'tests/passos.test.mjs': "import {executar} from '../lib/executar.mjs';\nawait executar({});\n", ...arquivos}, {tipo: 'robo', ...opcoes});

test('robô: o mínimo passa; config de exemplo, quebrado ou com segredo é apontado', async () => {
	const bom = await robo();
	assert.deepEqual([bom.erros, bom.avisos], [[], []]);
	assert.ok((await robo({'config.json': '{"exemplo": true}'})).aviso('config', /ainda é o de exemplo/));
	assert.ok((await robo({'config.json': '{"exemplo": true}'}, {final: true})).erro('config', /ainda é o de exemplo/));
	assert.ok((await robo({'config.json': '{quebrado'})).erro('config', /não abre como JSON/));
	assert.ok((await robo({'config.json': '{"servico": {"token": "abcdef123456"}, "chaveDeBusca": "gatos"}'})).erro('config', /"servico\.token" parece um segredo/));
	assert.equal((await robo({'config.json': '{"palavraChave": "gatos", "tokenDeTeste": ""}'})).de('config').length, 0, 'valor curto ou vazio não é segredo');
});

test('robô: passo que mexe em arquivo, internet ou segredo por conta própria é erro', async () => {
	const r = await robo({
		'passos/2-gravar.mjs': "import fs from 'node:fs';\nexport const descricao = 'x';\nexport const rodar = async () => fs.writeFileSync('a', 'b');\n",
		'passos/3-pedir.mjs': "export const descricao = 'x';\nexport const rodar = async () => (await fetch('https://x.com')).text();\n",
		'passos/4-segredo.mjs': "export const descricao = 'x';\nexport const rodar = async () => process.env.CHAVE;\n",
		'passos/5-certo.mjs': "// não use fetch( nem fs aqui\nexport const descricao = 'x';\nexport const rodar = async (e, ctx) => ctx.rede.buscarTexto('https://x.com');\n",
		'passos/6-sem-rodar.mjs': "export const descricao = 'x';\nexport const outra = 1;\n",
		'passos/Sete.mjs': PASSO,
		'passos/8-sem-descricao.mjs': 'export async function rodar() {}\n',
	});
	assert.ok(r.erro('passos', /2-gravar\.mjs.*mexe em arquivo direto/));
	assert.ok(r.erro('passos', /3-pedir\.mjs.*chama a internet direto/));
	assert.ok(r.erro('passos', /4-segredo\.mjs.*lê segredo direto/));
	assert.ok(r.erro('passos', /6-sem-rodar\.mjs.*precisa exportar a função `rodar/));
	assert.ok(r.erro('passos', /Sete\.mjs.*nome fora do padrão/));
	assert.ok(r.aviso('passos', /8-sem-descricao\.mjs.*falta `export const descricao/));
	assert.equal(r.de('passos').filter((m) => /5-certo/.test(m)).length, 0, 'comentário falando de fetch não conta');
	assert.ok((await robo({'tests/passos.test.mjs': '// vazio\n'})).aviso('passos', /os passos não aparecem nos testes/));
});

test('robô: segredo pedido por um passo precisa estar no .env.exemplo e no agendamento', async () => {
	const passo = "export const descricao = 'x';\nexport const rodar = async (e, ctx) => ctx.rede.buscarJson('https://x.com', {cabecalhos: {chave: ctx.segredo('CHAVE_DO_SERVICO')}});\n";
	assert.ok((await robo({'passos/1-buscar.mjs': passo})).erro('segredos-do-robo', /falta o \.env\.exemplo/));
	assert.ok((await robo({'passos/1-buscar.mjs': passo, '.env.exemplo': '# nada\n'})).erro('segredos-do-robo', /CHAVE_DO_SERVICO é pedido por um passo mas não está no \.env\.exemplo/));
	const fluxo = (env) => `on:\n  workflow_dispatch:\njobs:\n  rodar:\n    steps:\n      - run: node robo.mjs\n${env}`;
	const semEnv = await robo({'passos/1-buscar.mjs': passo, '.env.exemplo': 'CHAVE_DO_SERVICO=\n', '.github/workflows/agendar.yml': fluxo('')});
	assert.ok(semEnv.aviso('segredos-do-robo', /não passa o segredo CHAVE_DO_SERVICO/));
	const completo = await robo({'passos/1-buscar.mjs': passo, '.env.exemplo': '# onde conseguir: painel do serviço\nCHAVE_DO_SERVICO=\n', '.github/workflows/agendar.yml': fluxo('        env:\n          CHAVE_DO_SERVICO: ${{ secrets.CHAVE_DO_SERVICO }}\n')});
	assert.equal(completo.de('segredos-do-robo').length, 0);
});

test('robô: agendamento com horário torto ou frequente demais; o que está desligado (comentado) não conta', async () => {
	const fluxo = (linha) => `on:\n  schedule:\n${linha}\njobs:\n  rodar:\n    steps:\n      - run: node robo.mjs\n`;
	assert.ok((await robo({'.github/workflows/agendar.yml': fluxo("    - cron: '0 8 * *'")})).erro('agendamento', /precisa de 5 partes/));
	assert.ok((await robo({'.github/workflows/agendar.yml': fluxo("    - cron: '*/5 * * * *'")})).aviso('agendamento', /mais de uma vez por hora/));
	assert.equal((await robo({'.github/workflows/agendar.yml': fluxo("    - cron: '17 11 * * *'")})).de('agendamento').length, 0);
	assert.equal((await robo({'.github/workflows/agendar.yml': fluxo("  #   - cron: '* * * * *'")})).de('agendamento').length, 0);
});
