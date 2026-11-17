// O servidor do sistema: entrega as telas e atende a API. Feito para rodar no computador do dono e atender só ele
// (127.0.0.1). As travas daqui existem porque um site qualquer aberto no navegador pode tentar falar com programas
// do próprio computador; por isso só se aceita pedido que veio das telas deste sistema.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {criarApi} from './api.mjs';
import {abrirBanco} from './banco.mjs';
import {normalizarModelo, validarModelo} from './modelo.mjs';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const TIPOS = {'.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.json': 'application/json; charset=utf-8'};
const LIMITE_DO_CORPO = 1024 * 1024;
const SEGURANCA = {
	'x-content-type-options': 'nosniff',
	'referrer-policy': 'no-referrer',
	'content-security-policy': "default-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
};

const lerCorpo = (req) =>
	new Promise((resolve, reject) => {
		let tamanho = 0;
		const pedacos = [];
		req.on('data', (pedaco) => {
			tamanho += pedaco.length;
			// passou do limite: para de guardar, mas deixa o envio terminar para poder responder com a explicação
			if (tamanho <= LIMITE_DO_CORPO) pedacos.push(pedaco);
			else pedacos.length = 0;
		});
		req.on('end', () => (tamanho > LIMITE_DO_CORPO ? reject(Object.assign(new Error('grande'), {status: 413})) : resolve(Buffer.concat(pedacos).toString('utf8'))));
		req.on('error', reject);
	});

/**
 * Monta o sistema inteiro (modelo conferido, banco aberto, API) e devolve {tratar, modelo, banco}. `tratar(req, res)`
 * é o que o servidor chama a cada pedido. Lança erro com a lista de problemas se o modelo estiver errado.
 */
export const montarSistema = ({modelo, regras = {}, pastaDados, pastaTelas, agora}) => {
	const problemas = validarModelo(modelo, regras);
	if (problemas.length) throw new Error(`O modelo.mjs tem ${problemas.length} problema(s):\n${problemas.map((p) => `  - ${p}`).join('\n')}`);
	const normal = normalizarModelo(modelo, regras);
	const banco = abrirBanco({pasta: pastaDados, entidades: Object.keys(normal.entidades), ...(agora ? {agora} : {})});
	const api = criarApi({modelo: normal, regras, banco, ...(agora ? {agora} : {})});
	const telas = path.resolve(pastaTelas);

	const responder = (res, status, cabecalhos, corpo) => {
		res.writeHead(status, {...SEGURANCA, 'cache-control': 'no-store', ...cabecalhos});
		res.end(corpo);
	};
	const responderJson = (res, status, json) => responder(res, status, {'content-type': 'application/json; charset=utf-8'}, JSON.stringify(json));

	const tratar = async (req, res) => {
		try {
			const dono = req.headers.host ?? '';
			// só o próprio computador: recusa quem chegou por outro nome (truque de apontar um site para 127.0.0.1)
			if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(dono)) return responderJson(res, 403, {mensagem: 'Este sistema só atende o próprio computador.'});
			const url = new URL(req.url ?? '/', `http://${dono}`);

			if (url.pathname.startsWith('/api/')) {
				let corpo;
				if (req.method !== 'GET') {
					// mudança de dados só vinda das telas deste sistema e em JSON (formulário de outro site não consegue mandar assim)
					const origem = req.headers.origin;
					if (origem && origem !== `http://${dono}`) return responderJson(res, 403, {mensagem: 'Pedido recusado: não veio das telas deste sistema.'});
					if (!/^application\/json\b/i.test(req.headers['content-type'] ?? '') && req.method !== 'DELETE') return responderJson(res, 415, {mensagem: 'Envie os dados em JSON.'});
					const texto = await lerCorpo(req);
					try {
						corpo = texto ? JSON.parse(texto) : {};
					} catch {
						return responderJson(res, 400, {mensagem: 'Os dados enviados não são um JSON válido.'});
					}
					if (!corpo || typeof corpo !== 'object' || Array.isArray(corpo)) return responderJson(res, 400, {mensagem: 'Envie um objeto com os campos.'});
				}
				const resposta = await api({metodo: req.method, caminho: url.pathname, consulta: url.searchParams, corpo});
				if (resposta.json) return responderJson(res, resposta.status, resposta.json);
				return responder(res, resposta.status, {'content-type': resposta.tipo, 'content-disposition': `attachment; filename="${resposta.arquivo}"`}, resposta.texto);
			}

			if (req.method !== 'GET' && req.method !== 'HEAD') return responderJson(res, 405, {mensagem: 'Operação não aceita.'});
			// as telas usam o mesmo arquivo de formatos do servidor, para tela e exportação nunca discordarem
			const pedido = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
			const arquivo = pedido === '/formato.mjs' ? path.join(aqui, 'formato.mjs') : path.resolve(telas, `.${path.posix.normalize(pedido)}`);
			const dentro = arquivo === path.join(aqui, 'formato.mjs') || arquivo.startsWith(telas + path.sep);
			if (!dentro || !fs.existsSync(arquivo) || !fs.statSync(arquivo).isFile()) return responder(res, 404, {'content-type': 'text/plain; charset=utf-8'}, 'Não encontrado');
			return responder(res, 200, {'content-type': TIPOS[path.extname(arquivo).toLowerCase()] ?? 'application/octet-stream'}, req.method === 'HEAD' ? undefined : fs.readFileSync(arquivo));
		} catch (e) {
			if (e.status === 413) return responderJson(res, 413, {mensagem: 'Texto grande demais para um registro só.'});
			console.error(e);
			return responderJson(res, 500, {mensagem: 'O sistema tropeçou ao atender este pedido. O erro está na janela preta do sistema; mostre ao Claude.'});
		}
	};
	return {tratar, modelo: normal, banco, api};
};

/** Sobe o servidor. Porta 0 = qualquer porta livre (testes e folha de telas). Devolve {servidor, porta, endereco}. */
export const iniciar = (opcoes) =>
	new Promise((resolve, reject) => {
		let sistema;
		try {
			sistema = montarSistema(opcoes);
		} catch (e) {
			reject(e);
			return;
		}
		const servidor = http.createServer(sistema.tratar);
		servidor.once('error', reject);
		servidor.listen(opcoes.porta ?? 0, '127.0.0.1', () => {
			const porta = servidor.address().port;
			resolve({...sistema, servidor, porta, endereco: `http://localhost:${porta}`});
		});
	});
