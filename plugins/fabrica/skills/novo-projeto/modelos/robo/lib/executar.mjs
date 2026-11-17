// O motor do robô: roda os passos de passos/ em ordem (1-..., 2-..., 3-...), passando a saída de um para a entrada do
// seguinte. Cuida do que todo robô precisa e ninguém lembra de fazer direito:
//   - MODO ENSAIO (--ensaio): roda tudo, mas não escreve arquivo, não guarda memória e não manda nada para fora.
//   - MEMÓRIA entre uma rodada e outra (estado/memoria.json), só guardada se a rodada inteira deu certo: se o
//     robô cair no meio, a próxima rodada recomeça do mesmo ponto, sem pular nem repetir.
//   - REGISTRO de tudo o que aconteceu (registros/AAAA-MM-DD.log).
// Os passos não mexem em arquivo nem na internet por conta própria: usam o `ctx` que recebem.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {criarRede} from './rede.mjs';

const dia = (agora) => `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
const hora = (agora) => `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}:${String(agora.getSeconds()).padStart(2, '0')}`;

/** Os arquivos de passo, em ordem: "1-buscar.mjs", "2-separar.mjs"... */
export const listarPassos = (raiz) =>
	fs.readdirSync(path.join(raiz, 'passos')).filter((f) => /^\d+-[a-z0-9-]+\.mjs$/.test(f)).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

/** Grava de uma vez só (arquivo provisório + troca), para queda de luz não deixar arquivo pela metade. */
const gravarInteiro = (arquivo, texto) => {
	fs.mkdirSync(path.dirname(arquivo), {recursive: true});
	fs.writeFileSync(`${arquivo}.gravando`, texto);
	fs.renameSync(`${arquivo}.gravando`, arquivo);
};

/**
 * Roda o robô. Devolve {ok, passos: [{nome, ms}], linhas (o registro), escritos (arquivos gravados ou que seriam),
 * resultado (a saída do último passo), erro}. Nunca lança: quem chama decide o que fazer com `ok: false`.
 */
export const executar = async ({raiz, config, ensaio = false, ate, agora = () => new Date(), buscar, mostrar = console.log, env = process.env}) => {
	const inicio = agora();
	const linhas = [];
	const registro = (texto) => {
		const linha = `[${hora(agora())}] ${texto}`;
		linhas.push(linha);
		mostrar(linha);
	};
	const dentro = (rel) => {
		const arquivo = path.resolve(raiz, rel);
		if (!arquivo.startsWith(raiz + path.sep)) throw new Error(`"${rel}" aponta para fora da pasta do projeto.`);
		return arquivo;
	};
	const arquivoMemoria = path.join(raiz, 'estado', 'memoria.json');
	let memoria = {};
	if (fs.existsSync(arquivoMemoria)) {
		try {
			memoria = JSON.parse(fs.readFileSync(arquivoMemoria, 'utf8'));
		} catch (e) {
			return {ok: false, passos: [], linhas, escritos: [], erro: `A memória do robô (estado/memoria.json) está estragada: ${e.message}. Restaure pelo histórico do git ou apague o arquivo (o robô recomeça do zero).`};
		}
	}
	const escritos = [];
	// os arquivos só vão para o disco no fim, se todos os passos derem certo: rodada pela metade não deixa rastro
	const pendentes = new Map();
	const ctx = {
		config,
		ensaio,
		hoje: dia(inicio),
		agora: inicio.toISOString(),
		registro,
		rede: criarRede({raiz, registro, ...(buscar ? {buscar} : {})}),
		segredo: (nome) => {
			const valor = env[nome];
			if (!valor) throw new Error(`Falta o segredo ${nome}. No computador: no arquivo .env (copie do .env.exemplo). No GitHub: Settings → Secrets and variables → Actions.`);
			return valor;
		},
		memoria: {
			ler: (chave, padrao) => (chave in memoria ? structuredClone(memoria[chave]) : padrao),
			guardar: (chave, valor) => {
				memoria[chave] = structuredClone(valor);
			},
		},
		lerArquivo: (rel) => (pendentes.has(rel) ? pendentes.get(rel) : fs.existsSync(dentro(rel)) ? fs.readFileSync(dentro(rel), 'utf8') : null),
		escrever: (rel, texto) => {
			dentro(rel);
			pendentes.set(rel, texto);
			if (!escritos.includes(rel)) escritos.push(rel);
		},
		acrescentar: (rel, texto) => ctx.escrever(rel, (ctx.lerArquivo(rel) ?? '') + texto),
	};

	registro(`Robô começou${ensaio ? ' em MODO ENSAIO (nada será gravado nem enviado)' : ''}.`);
	const feitos = [];
	let resultado;
	let erro = null;
	for (const arquivo of listarPassos(raiz)) {
		const nome = arquivo.replace(/\.mjs$/, '');
		if (ate && parseInt(nome, 10) > ate) break;
		const comeco = Date.now();
		try {
			const passo = await import(pathToFileURL(path.join(raiz, 'passos', arquivo)).href);
			if (typeof passo.rodar !== 'function') throw new Error('o arquivo precisa exportar a função `rodar(entrada, ctx)`');
			registro(`Passo ${nome}: ${passo.descricao ?? ''}`);
			resultado = await passo.rodar(resultado, ctx);
			feitos.push({nome, ms: Date.now() - comeco});
		} catch (e) {
			erro = `O passo ${nome} falhou: ${e.message}`;
			registro(`ERRO. ${erro}`);
			break;
		}
	}

	if (!erro && !ensaio) {
		for (const [rel, texto] of pendentes) gravarInteiro(dentro(rel), texto);
		gravarInteiro(arquivoMemoria, `${JSON.stringify(memoria, null, '\t')}\n`);
	}
	if (ensaio && escritos.length) registro(`Ensaio: gravaria ${escritos.length} arquivo(s): ${escritos.map((rel) => `${rel} (${pendentes.get(rel).length} letras)`).join(', ')}.`);
	registro(erro ? 'Robô parou com erro. Nada foi gravado; a próxima rodada recomeça do mesmo ponto.' : `Robô terminou em ${((Date.now() - inicio.getTime()) / 1000).toFixed(1)}s.`);
	if (!ensaio) {
		const arquivoRegistro = path.join(raiz, 'registros', `${dia(inicio)}.log`);
		fs.mkdirSync(path.dirname(arquivoRegistro), {recursive: true});
		fs.appendFileSync(arquivoRegistro, `${linhas.join('\n')}\n\n`);
	}
	return {ok: !erro, passos: feitos, linhas, escritos, resultado, erro};
};
