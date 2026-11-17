// Gera a capa que aparece quando o link do site é mandado no WhatsApp ou nas redes (1200 × 630), com o nome, o
// título e as cores do próprio site. Sai em site/imagens/capa-para-redes.png.
//   npm run capa
//   npm run capa -- --titulo "Outro texto para a capa"
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {lerTags, textoDe} from './fiscal/html.mjs';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opcao = (nome) => (args.includes(`--${nome}`) ? args[args.indexOf(`--${nome}`) + 1] : undefined);

let playwright;
try {
	playwright = createRequire(import.meta.url)('playwright');
} catch {
	console.error('A capa precisa do Playwright. Na nuvem do Claude ele já vem; no computador: `npm install --no-save playwright` e `npx playwright install chromium`.');
	process.exit(2);
}

const fabrica = JSON.parse(fs.readFileSync(path.join(raiz, 'fabrica.json'), 'utf8'));
// num projeto adotado o site pode não morar em site/: o fabrica.json diz onde (pastaDoSite)
const pastaDoSite = path.resolve(raiz, fabrica.pastaDoSite ?? 'site');
const html = fs.readFileSync(path.join(pastaDoSite, 'index.html'), 'utf8');
const tags = lerTags(html);
const de = (nome) => {
	const tag = tags.find((t) => t.nome === nome);
	return tag ? textoDe(html, tag) : '';
};
const marca = fabrica.nome ?? de('title');
const titulo = opcao('titulo') ?? de('h1') ?? marca;
const escapar = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const estilo = (arquivo) => pathToFileURL(path.join(pastaDoSite, 'estilo', arquivo)).href;

const pagina = `<!doctype html><html lang="pt-BR" data-tema="claro"><head><meta charset="utf-8">
<link rel="stylesheet" href="${estilo('tokens.css')}"><link rel="stylesheet" href="${estilo('base.css')}">
<style>
	body { width: 1200px; height: 630px; display: grid; grid-template-rows: auto 1fr auto; padding: 64px 72px; overflow: hidden; }
	.marca { font-family: var(--fonte-titulo); font-weight: var(--peso-titulo); font-size: 34px; letter-spacing: var(--aperto-titulo); }
	h1 { align-self: center; max-width: 18ch; font-size: ${titulo.length > 60 ? 64 : 82}px; line-height: 1.02; }
	.barra { height: 14px; width: 220px; border-radius: 999px; background: var(--cor-destaque); }
</style></head><body><div class="marca">${escapar(marca)}</div><h1>${escapar(titulo)}</h1><div class="barra"></div></body></html>`;

const temporario = path.join(pastaDoSite, '_capa.html');
fs.writeFileSync(temporario, pagina);
const navegador = await playwright.chromium.launch();
try {
	const aba = await navegador.newPage({viewport: {width: 1200, height: 630}, colorScheme: 'light'});
	await aba.goto(pathToFileURL(temporario).href, {waitUntil: 'load'});
	await aba.evaluate(() => document.fonts.ready);
	fs.mkdirSync(path.join(pastaDoSite, 'imagens'), {recursive: true});
	const saida = path.join(pastaDoSite, 'imagens', 'capa-para-redes.png');
	await aba.screenshot({path: saida});
	console.log(`Capa gravada em ${path.relative(raiz, saida).split(path.sep).join('/')} (${Math.round(fs.statSync(saida).size / 1024)} KB). Abra e olhe: o título cabe? Dá para ler pequeno?`);
} finally {
	await navegador.close();
	fs.rmSync(temporario, {force: true});
}
