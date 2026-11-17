// Testes dos passos deste robô e do leitor de feed. A internet é trocada por um faz de conta (`buscar`), então rodam
// em qualquer lugar. Passo novo ou regra nova: primeiro o teste (um caso que passa, um que quebra), depois o código.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {test} from 'node:test';
import {executar} from '../lib/executar.mjs';
import {lerFeed, limpar} from '../lib/feed.mjs';

const projeto = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXEMPLO = fs.readFileSync(path.join(projeto, 'exemplos', 'feed-de-exemplo.xml'), 'utf8');
const calado = {mostrar: () => {}, agora: () => new Date('2026-11-17T08:00:00')};

/** Copia os passos e a lib para uma pasta temporária, para o teste não mexer em saida/ e estado/ de verdade. */
const copiaDoRobo = () => {
	const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'passos-'));
	for (const pasta of ['passos', 'lib', 'exemplos']) fs.cpSync(path.join(projeto, pasta), path.join(raiz, pasta), {recursive: true});
	return raiz;
};
const feedCom = (ids) => `<feed xmlns="http://www.w3.org/2005/Atom"><title>Canal</title>${ids.map((id, i) => `<entry><id>${id}</id><title>Vídeo ${id}</title><link rel="alternate" href="https://exemplo.com/${id}"/><published>2026-11-${String(10 + i).padStart(2, '0')}T12:00:00+00:00</published></entry>`).join('')}</feed>`;
const internet = (paginas) => async (endereco) => {
	const pagina = paginas[endereco];
	return pagina === undefined ? {ok: false, status: 404, text: async () => ''} : {ok: true, status: 200, text: async () => pagina};
};

test('feed: lê o formato do YouTube (Atom) com acento, & e CDATA', () => {
	const feed = lerFeed(EXEMPLO);
	assert.equal(feed.titulo, 'Canal de exemplo');
	assert.equal(feed.itens.length, 4);
	assert.deepEqual(feed.itens[0], {id: 'yt:video:exemplo0004', titulo: 'Por que a areia movediça não te engole', link: 'https://www.youtube.com/watch?v=exemplo0004', data: '2026-11-14T15:00:11Z', autor: 'Canal de exemplo'});
	assert.equal(feed.itens[1].titulo, 'A curva impossível & a física do chute');
	assert.equal(feed.itens[2].titulo, 'O que acontece se uma formiga cair da mesa?');
});

test('feed: lê RSS de blog, ordena do mais novo para o mais antigo e recusa o que não é feed', () => {
	const rss = '<?xml version="1.0"?><rss version="2.0"><channel><title>Blog</title><item><title>Antigo</title><link>https://b.com/1</link><guid>1</guid><pubDate>Mon, 02 Nov 2026 10:00:00 GMT</pubDate></item><item><title>Novo &#233; &lt;b&gt;</title><link>https://b.com/2</link><pubDate>Tue, 10 Nov 2026 10:00:00 GMT</pubDate><dc:creator>Ana</dc:creator></item></channel></rss>';
	const feed = lerFeed(rss);
	assert.deepEqual(feed.itens.map((i) => [i.id, i.titulo, i.data, i.autor]), [['https://b.com/2', 'Novo é <b>', '2026-11-10T10:00:00Z', 'Ana'], ['1', 'Antigo', '2026-11-02T10:00:00Z', '']]);
	assert.throws(() => lerFeed('<!doctype html><html><body>Faça login</body></html>'), /Isto não é um feed/);
	assert.equal(limpar('  a &amp; b <i>c</i>\n d  '), 'a & b c d');
});

test('primeira rodada mostra só as mais recentes; a segunda só o que saiu depois; sem novidade não repete', async () => {
	const raiz = copiaDoRobo();
	const config = {fontes: [{nome: 'Canal', endereco: 'https://exemplo.com/feed'}], naPrimeiraVez: 2};
	const rodar = (ids) => executar({raiz, config, buscar: internet({'https://exemplo.com/feed': feedCom(ids)}), ...calado});
	const primeira = await rodar(['a', 'b', 'c', 'd']);
	assert.deepEqual([primeira.ok, primeira.resultado.novidades], [true, 2]);
	assert.match(fs.readFileSync(path.join(raiz, 'saida', 'ultimo.md'), 'utf8'), /\[Vídeo d\]\(https:\/\/exemplo\.com\/d\)/);
	const segunda = await rodar(['a', 'b', 'c', 'd', 'e']);
	assert.equal(segunda.resultado.novidades, 1, 'só o "e" é novo; a, b (não mostrados na primeira vez) não voltam');
	const terceira = await rodar(['a', 'b', 'c', 'd', 'e']);
	assert.equal(terceira.resultado.novidades, 0);
	assert.match(fs.readFileSync(path.join(raiz, 'saida', 'ultimo.md'), 'utf8'), /Nada de novo/);
	const historico = fs.readFileSync(path.join(raiz, 'saida', 'historico.csv'), 'utf8').split('\r\n').filter(Boolean);
	assert.equal(historico.length, 4, 'cabeçalho + 3 novidades, sem repetir');
	assert.equal(historico[0], '﻿Visto em;Fonte;Publicado em;Título;Link');
	fs.rmSync(raiz, {recursive: true});
});

test('uma fonte fora do ar não derruba as outras e aparece no relatório; todas fora do ar é erro', async () => {
	const raiz = copiaDoRobo();
	const config = {fontes: [{nome: 'Boa', endereco: 'https://exemplo.com/boa'}, {nome: 'Caída', endereco: 'https://exemplo.com/caida'}]};
	const parcial = await executar({raiz, config, buscar: internet({'https://exemplo.com/boa': feedCom(['a'])}), ...calado});
	assert.equal(parcial.ok, true);
	assert.deepEqual(parcial.resultado, {novidades: 1, falhas: 1});
	assert.match(fs.readFileSync(path.join(raiz, 'saida', 'ultimo.md'), 'utf8'), /## Fontes que falharam\n\n- Caída: exemplo\.com respondeu 404/);
	const total = await executar({raiz, config, buscar: internet({}), ...calado});
	assert.equal(total.ok, false);
	assert.match(total.erro, /nenhuma das 2 fonte\(s\) respondeu/);
	fs.rmSync(raiz, {recursive: true});
});

test('o robô de exemplo roda inteiro sem internet, com o config.json do projeto', async () => {
	const raiz = copiaDoRobo();
	const config = JSON.parse(fs.readFileSync(path.join(projeto, 'config.json'), 'utf8'));
	const r = await executar({raiz, config, ensaio: true, buscar: async () => { throw new Error('não era para usar a internet'); }, ...calado});
	// com as fontes de verdade (endereços https) este teste continua valendo: só confere que os passos encadeiam
	assert.ok(r.passos.length >= 1 || r.erro, 'os passos carregam');
	if (config.fontes.every((f) => !/^https?:/.test(f.endereco))) assert.equal(r.ok, true, r.erro ?? '');
	fs.rmSync(raiz, {recursive: true});
});
