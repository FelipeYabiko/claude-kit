// Testes do motor do robô (o que a fábrica mantém): ordem dos passos, modo ensaio, memória, queda no meio e a rede
// paciente. Usam um robô de mentira numa pasta temporária. Não edite: `criar.mjs --atualizar` traz a versão nova.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {test} from 'node:test';
import {executar, listarPassos} from '../lib/executar.mjs';
import {criarRede} from '../lib/rede.mjs';

const montar = (passos) => {
	const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'robo-'));
	fs.mkdirSync(path.join(raiz, 'passos'));
	for (const [nome, codigo] of Object.entries(passos)) fs.writeFileSync(path.join(raiz, 'passos', nome), codigo);
	return raiz;
};
const calado = {mostrar: () => {}, agora: () => new Date('2026-06-15T08:30:00')};
const CONTAR = {
	'1-buscar.mjs': "export const descricao = 'buscar'; export const rodar = async (_e, ctx) => ({n: ctx.memoria.ler('n', 0) + 1});",
	'2-entregar.mjs': "export const rodar = async ({n}, ctx) => { ctx.memoria.guardar('n', n); ctx.escrever('saida/n.txt', String(n)); ctx.acrescentar('saida/log.txt', n + ';'); return {n}; };",
};

test('os passos rodam na ordem do número, um alimentando o outro', async () => {
	const raiz = montar({'10-fim.mjs': "export const rodar = async (e) => e + 'c';", '2-meio.mjs': "export const rodar = async (e) => e + 'b';", '1-inicio.mjs': "export const rodar = async () => 'a';", 'rascunho.mjs': 'export const rodar = async () => "x";'});
	assert.deepEqual(listarPassos(raiz), ['1-inicio.mjs', '2-meio.mjs', '10-fim.mjs']);
	const r = await executar({raiz, config: {}, ...calado});
	assert.equal(r.ok, true);
	assert.equal(r.resultado, 'abc');
	assert.equal((await executar({raiz, config: {}, ate: 2, ...calado})).resultado, 'ab');
	fs.rmSync(raiz, {recursive: true});
});

test('rodada de verdade grava arquivos, memória e registro; a seguinte continua de onde parou', async () => {
	const raiz = montar(CONTAR);
	await executar({raiz, config: {}, ...calado});
	const r = await executar({raiz, config: {}, ...calado});
	assert.equal(r.resultado.n, 2);
	assert.equal(fs.readFileSync(path.join(raiz, 'saida', 'n.txt'), 'utf8'), '2');
	assert.equal(fs.readFileSync(path.join(raiz, 'saida', 'log.txt'), 'utf8'), '1;2;');
	assert.deepEqual(JSON.parse(fs.readFileSync(path.join(raiz, 'estado', 'memoria.json'), 'utf8')), {n: 2});
	assert.match(fs.readFileSync(path.join(raiz, 'registros', '2026-06-15.log'), 'utf8'), /Passo 1-buscar: buscar/);
	fs.rmSync(raiz, {recursive: true});
});

test('modo ensaio roda tudo e não deixa rastro', async () => {
	const raiz = montar(CONTAR);
	const r = await executar({raiz, config: {}, ensaio: true, ...calado});
	assert.equal(r.ok, true);
	assert.deepEqual(r.escritos, ['saida/n.txt', 'saida/log.txt']);
	assert.deepEqual(fs.readdirSync(raiz), ['passos'], 'nada além da pasta de passos');
	assert.match(r.linhas.join('\n'), /MODO ENSAIO/);
	assert.match(r.linhas.join('\n'), /gravaria 2 arquivo/);
	fs.rmSync(raiz, {recursive: true});
});

test('passo que falha: para, explica e não grava nada (a próxima rodada recomeça do mesmo ponto)', async () => {
	const raiz = montar({...CONTAR, '3-quebra.mjs': "export const rodar = async () => { throw new Error('o site caiu'); };"});
	const r = await executar({raiz, config: {}, ...calado});
	assert.equal(r.ok, false);
	assert.equal(r.erro, 'O passo 3-quebra falhou: o site caiu');
	assert.equal(fs.existsSync(path.join(raiz, 'saida')), false, 'arquivo de rodada quebrada não é gravado');
	assert.equal(fs.existsSync(path.join(raiz, 'estado')), false, 'memória de rodada quebrada não é guardada');
	assert.match(fs.readFileSync(path.join(raiz, 'registros', '2026-06-15.log'), 'utf8'), /ERRO\. O passo 3-quebra falhou/);
	fs.rmSync(raiz, {recursive: true});
});

test('passo sem a função rodar, memória estragada e arquivo fora da pasta são recusados com explicação', async () => {
	const semRodar = montar({'1-x.mjs': 'export const outra = 1;'});
	assert.match((await executar({raiz: semRodar, config: {}, ...calado})).erro, /precisa exportar a função `rodar/);
	const fuga = montar({'1-x.mjs': "export const rodar = async (_e, ctx) => ctx.escrever('../fora.txt', 'x');"});
	assert.match((await executar({raiz: fuga, config: {}, ...calado})).erro, /fora da pasta do projeto/);
	const estragada = montar(CONTAR);
	fs.mkdirSync(path.join(estragada, 'estado'));
	fs.writeFileSync(path.join(estragada, 'estado', 'memoria.json'), '{"n": ');
	const r = await executar({raiz: estragada, config: {}, ...calado});
	assert.match(r.erro, /memória do robô.*está estragada/);
	assert.equal(fs.readFileSync(path.join(estragada, 'estado', 'memoria.json'), 'utf8'), '{"n": ', 'não sobrescreve');
	for (const raiz of [semRodar, fuga, estragada]) fs.rmSync(raiz, {recursive: true});
});

test('segredo que falta é pedido pelo nome, e o que existe é entregue', async () => {
	const raiz = montar({'1-x.mjs': "export const rodar = async (_e, ctx) => ctx.segredo('CHAVE_DO_SERVICO');"});
	assert.match((await executar({raiz, config: {}, env: {}, ...calado})).erro, /Falta o segredo CHAVE_DO_SERVICO/);
	assert.equal((await executar({raiz, config: {}, env: {CHAVE_DO_SERVICO: 'abc'}, ...calado})).resultado, 'abc');
	fs.rmSync(raiz, {recursive: true});
});

const resposta = (status, texto = '') => ({ok: status >= 200 && status < 300, status, text: async () => texto});

test('rede: tenta de novo quando o site está ocupado, desiste logo quando o endereço não existe', async () => {
	let chamadas = 0;
	const instavel = criarRede({raiz: '/', espera: 1, buscar: async () => (++chamadas < 3 ? resposta(503) : resposta(200, 'veio'))});
	assert.equal(await instavel.buscarTexto('https://exemplo.com/x'), 'veio');
	assert.equal(chamadas, 3);
	chamadas = 0;
	const sumiu = criarRede({raiz: '/', espera: 1, buscar: async () => (chamadas++, resposta(404))});
	await assert.rejects(() => sumiu.buscarTexto('https://exemplo.com/x'), /exemplo\.com respondeu 404 \(endereço não existe\)/);
	assert.equal(chamadas, 1, '404 não adianta repetir');
	const fora = criarRede({raiz: '/', espera: 1, tentativas: 2, buscar: async () => { throw Object.assign(new Error('fetch failed'), {cause: {code: 'ENOTFOUND'}}); }});
	await assert.rejects(() => fora.buscarTexto('https://exemplo.com/x'), /Não consegui falar com exemplo\.com \(ENOTFOUND\)/);
	const sempre = criarRede({raiz: '/', espera: 1, tentativas: 2, buscar: async () => resposta(429)});
	await assert.rejects(() => sempre.buscarTexto('https://exemplo.com/x'), /pedidos demais/);
});

test('rede: lê arquivo de exemplo de dentro do projeto, recusa http sem segurança e caminho para fora', async () => {
	const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'rede-'));
	fs.writeFileSync(path.join(raiz, 'a.json'), '{"x": 1}');
	const rede = criarRede({raiz, buscar: async () => resposta(200, 'não é json')});
	assert.deepEqual(await rede.buscarJson('a.json'), {x: 1});
	await assert.rejects(() => rede.buscarTexto('../segredo.txt'), /fora da pasta do projeto/);
	await assert.rejects(() => rede.buscarTexto('nao-existe.txt'), /não existe/);
	await assert.rejects(() => rede.buscarTexto('http://exemplo.com'), /use https/);
	await assert.rejects(() => rede.buscarJson('https://exemplo.com'), /não é JSON/);
	fs.rmSync(raiz, {recursive: true});
});
