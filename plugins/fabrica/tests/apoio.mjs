// Apoio dos testes da fábrica: monta projetos pequenos em pastas temporárias e roda o fiscal neles.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {fiscalizar} from '../skills/novo-projeto/modelos/base/ferramentas/fiscal/nucleo.mjs';
import {todasAsRegras} from '../skills/novo-projeto/modelos/base/ferramentas/fiscal.mjs';

export const RAIZ_DO_PLUGIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CRIAR = path.join(RAIZ_DO_PLUGIN, 'skills', 'novo-projeto', 'scripts', 'criar.mjs');

const pastas = [];
export const pastaTemporaria = (prefixo = 'fabrica-') => {
	const pasta = fs.mkdtempSync(path.join(os.tmpdir(), prefixo));
	pastas.push(pasta);
	return pasta;
};
process.on('exit', () => {
	for (const pasta of pastas) fs.rmSync(pasta, {recursive: true, force: true});
});

export const escrever = (raiz, arquivos) => {
	for (const [rel, conteudo] of Object.entries(arquivos)) {
		const inteiro = path.join(raiz, rel);
		if (conteudo === null) {
			fs.rmSync(inteiro, {force: true});
			continue;
		}
		fs.mkdirSync(path.dirname(inteiro), {recursive: true});
		fs.writeFileSync(inteiro, conteudo);
	}
};

const FICHA = `# Ficha\n\n## O que é\nUm teste.\n\n## Pronto quando\n\n- [x] abre\n- [x] fecha\n- [x] funciona\n\n## Dependências aprovadas\n\nNenhuma.\n`;

/** O menor projeto que o fiscal aceita sem erro nem aviso (tipo livre). Cada teste parte dele e estraga uma coisa. */
export const MINIMO = {
	'CLAUDE.md': '# Projeto\n',
	'PAINEL.md': '# Painel\n\nAtualizado em 10/11/2026.\n\n## Estado\n\nTudo certo.\n\n## Falta fazer\n\n1. Nada.\n',
	'FICHA.md': FICHA,
	'README.md': '# Projeto\n',
	'docs/diario.md': '# Diário\n\n## 10/11/2026 · Criado\n',
	'docs/regras-de-ouro.md': '# Regras\n',
	'package.json': JSON.stringify({name: 'p', scripts: {verificar: 'x', test: 'x', fiscal: 'x'}}),
	'.gitignore': 'node_modules/\n.env\nfolha/\n',
	'fabrica.json': JSON.stringify({fabrica: '0.0.0', tipo: 'livre'}),
	'tests/a.test.mjs': '// teste\n',
};

/**
 * Monta um projeto (o mínimo + `arquivos`; valor null apaga) e roda o fiscal. Devolve {erros, avisos, de}:
 * `de('regra')` dá as mensagens daquela regra, `tem(texto)` diz se alguma mensagem casa.
 */
export const fiscal = async (arquivos = {}, {tipo = 'livre', final = false} = {}) => {
	const raiz = pastaTemporaria();
	escrever(raiz, {...MINIMO, 'fabrica.json': JSON.stringify({fabrica: '0.0.0', tipo}), ...arquivos});
	const r = await fiscalizar(raiz, await todasAsRegras(), {final});
	const linha = (a) => `${a.arquivo ?? ''}: ${a.mensagem}`;
	return {
		raiz,
		erros: r.erros,
		avisos: r.avisos,
		manuais: r.manuais,
		de: (regra, nivel) => [...r.erros, ...r.avisos].filter((a) => a.regra === regra && (!nivel || a.nivel === nivel)).map(linha),
		erro: (regra, expr) => r.erros.some((a) => a.regra === regra && expr.test(linha(a))),
		aviso: (regra, expr) => r.avisos.some((a) => a.regra === regra && expr.test(linha(a))),
	};
};

const CABECA = '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Padaria do Bairro</title><meta name="description" content="Pão quente toda manhã no bairro, com entrega e encomenda pelo WhatsApp."><meta property="og:title" content="t"><meta property="og:description" content="d"><meta property="og:image" content="https://exemplo.com.br/capa.png"><link rel="icon" href="icone.svg">';

/** Uma página de site correta. `miolo` entra no body; `cabeca` troca o <head> inteiro. */
export const pagina = (miolo = '<h1>Padaria</h1>', {cabeca = CABECA, html = '<html lang="pt-BR">'} = {}) => `<!doctype html>\n${html}\n<head>${cabeca}</head>\n<body>\n${miolo}\n</body>\n</html>\n`;

/** O mínimo de um projeto de site sem erro nem aviso. */
export const SITE = {
	'tests/a.test.mjs': null,
	'site/index.html': pagina(),
	'site/icone.svg': '<svg xmlns="http://www.w3.org/2000/svg"/>',
	'site/estilo/tokens.css': ':root { --cor-fundo: light-dark(#ffffff, #101010); --cor-texto: light-dark(#111111, #f0f0f0); }\n',
};
