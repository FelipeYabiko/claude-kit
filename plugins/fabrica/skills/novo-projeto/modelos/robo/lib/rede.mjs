// Buscar coisas na internet do jeito paciente: tempo limite, novas tentativas com espera e mensagem de erro que diz o
// que aconteceu. Os passos usam `ctx.rede`, nunca o `fetch` direto: assim os testes trocam a internet por um faz de
// conta e o robô inteiro roda sem rede.
import fs from 'node:fs';
import path from 'node:path';

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Erros que valem tentar de novo: a internet piscou ou o site está ocupado. Página que não existe (404) não adianta. */
const valeTentar = (status) => status === 429 || status >= 500;

/**
 * Cria a "rede" do robô. `buscar` é o fetch (trocado nos testes); `raiz` é a pasta do projeto (endereço que não
 * começa com http é lido como arquivo de dentro dela, para os exemplos funcionarem sem internet).
 */
export const criarRede = ({raiz, buscar = fetch, tentativas = 3, tempoLimite = 20000, espera = 1500, registro = () => {}} = {}) => {
	const buscarTexto = async (endereco, {cabecalhos = {}} = {}) => {
		if (!/^https?:\/\//i.test(endereco)) {
			const arquivo = path.resolve(raiz, endereco);
			if (arquivo !== raiz && !arquivo.startsWith(raiz + path.sep)) throw new Error(`"${endereco}" aponta para fora da pasta do projeto.`);
			if (!fs.existsSync(arquivo)) throw new Error(`O arquivo "${endereco}" não existe.`);
			return fs.readFileSync(arquivo, 'utf8');
		}
		if (!/^https:\/\//i.test(endereco)) throw new Error(`"${endereco}" usa http sem segurança: use https.`);
		const site = new URL(endereco).hostname;
		let ultimo;
		for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
			let resposta = null;
			try {
				resposta = await buscar(endereco, {headers: {'user-agent': 'robo-da-fabrica', ...cabecalhos}, signal: AbortSignal.timeout(tempoLimite)});
			} catch (e) {
				ultimo = e.name === 'TimeoutError' ? new Error(`${site} não respondeu em ${tempoLimite / 1000} segundos.`) : new Error(`Não consegui falar com ${site} (${e.cause?.code ?? e.message}). A internet está funcionando? Na nuvem, o endereço precisa estar liberado na rede do ambiente.`);
			}
			if (resposta?.ok) return await resposta.text();
			if (resposta) {
				const dica = resposta.status === 404 ? ' (endereço não existe)' : resposta.status === 401 || resposta.status === 403 ? ' (sem permissão: confira a chave)' : resposta.status === 429 ? ' (pedidos demais: espere e tente mais tarde)' : '';
				ultimo = new Error(`${site} respondeu ${resposta.status}${dica}.`);
				if (!valeTentar(resposta.status)) throw ultimo;
			}
			if (tentativa < tentativas) {
				registro(`  tentativa ${tentativa} falhou (${ultimo.message}); tentando de novo em ${(espera * tentativa) / 1000}s`);
				await esperar(espera * tentativa);
			}
		}
		throw ultimo;
	};
	const buscarJson = async (endereco, opcoes) => {
		const texto = await buscarTexto(endereco, opcoes);
		try {
			return JSON.parse(texto);
		} catch {
			throw new Error(`A resposta de ${endereco} não é JSON (começa com "${texto.slice(0, 40).replace(/\s+/g, ' ')}").`);
		}
	};
	return {buscarTexto, buscarJson};
};
