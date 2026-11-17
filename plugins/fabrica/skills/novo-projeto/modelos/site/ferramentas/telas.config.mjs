// Diz à folha de telas quais são as telas do site: sobe a pasta site/ e lista cada página .html dela.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {servir} from './servir.mjs';

const pasta = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');

const paginas = (dir, base = dir) =>
	fs.readdirSync(dir, {withFileTypes: true}).flatMap((item) => {
		const inteiro = path.join(dir, item.name);
		if (item.isDirectory()) return paginas(inteiro, base);
		return item.name.endsWith('.html') ? [path.relative(base, inteiro).split(path.sep).join('/')] : [];
	});

export const preparar = async () => {
	const {servidor, endereco} = await servir({pasta, porta: 0});
	const telas = paginas(pasta)
		.sort((a, b) => (a === 'index.html' ? -1 : b === 'index.html' ? 1 : a.localeCompare(b)))
		.map((rel) => ({nome: rel === 'index.html' ? 'inicio' : rel.replace(/\.html$/, '').replace(/\//g, '-'), caminho: `/${rel}`}));
	return {endereco, telas, fechar: () => servidor.close()};
};
