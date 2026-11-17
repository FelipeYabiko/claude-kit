// A API do sistema: o que as telas pedem ao servidor. Recebe um pedido já lido ({metodo, caminho, consulta, corpo}) e
// devolve {status, json} ou {status, texto, tipo, arquivo}, sem saber nada de rede. Assim os testes chamam direto.
import {comCalculados, consultar, resumir} from './consultas.mjs';
import {montarCsv} from './csv.mjs';
import {escrever, hojeIso} from './formato.mjs';
import {validarRegistro} from './validacao.mjs';

const naoAchei = (mensagem = 'Não encontrado.') => ({status: 404, json: {mensagem}});

export const criarApi = ({modelo, regras = {}, banco, agora = () => new Date()}) => {
	const contexto = () => ({hoje: hojeIso(agora()), banco});

	/** Registros de uma entidade já com os campos calculados. */
	const ler = (entidade) => {
		const ctx = contexto();
		return banco.listar(entidade.id).map((r) => comCalculados(r, entidade, regras, ctx));
	};

	/** {entidade: {id: título}} dos cadastros para os quais esta entidade aponta (para mostrar o nome, não o número). */
	const ligadosDe = (entidade) => {
		const ligados = {};
		for (const campo of Object.values(entidade.campos)) {
			if (campo.tipo !== 'ligacao' || ligados[campo.para]) continue;
			const alvo = modelo.entidades[campo.para];
			ligados[campo.para] = Object.fromEntries(banco.listar(alvo.id).map((r) => [r.id, r[alvo.titulo] ?? `#${r.id}`]));
		}
		return ligados;
	};

	/** Quem aponta para este registro (não se apaga cliente que tem pedido: o pedido ficaria órfão). */
	const quemAponta = (entidade, id) => {
		const achados = [];
		for (const outra of Object.values(modelo.entidades)) {
			for (const [idCampo, campo] of Object.entries(outra.campos)) {
				if (campo.tipo !== 'ligacao' || campo.para !== entidade.id) continue;
				const quantos = banco.listar(outra.id).filter((r) => r[idCampo] === id).length;
				if (quantos) achados.push({entidade: outra, quantos});
			}
		}
		return achados;
	};

	const filtrosDa = (consulta) => Object.fromEntries([...consulta].filter(([chave]) => chave.startsWith('f.')).map(([chave, valor]) => [chave.slice(2), valor]));

	return async ({metodo, caminho, consulta = new URLSearchParams(), corpo}) => {
		const partes = caminho.replace(/^\/api\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);

		if (metodo === 'GET' && partes[0] === 'modelo' && partes.length === 1) return {status: 200, json: modelo};

		if (metodo === 'GET' && partes[0] === 'painel' && partes.length === 1) {
			const hoje = hojeIso(agora());
			const itens = modelo.painel.map((item) => {
				const entidade = modelo.entidades[item.entidade];
				return resumir(item, ler(entidade), entidade, {hoje, ligados: ligadosDe(entidade)});
			});
			const ligados = Object.assign({}, ...modelo.painel.filter((i) => i.tipo === 'lista').map((i) => ligadosDe(modelo.entidades[i.entidade])));
			return {status: 200, json: {itens, ligados, vazio: banco.vazio()}};
		}

		if (metodo === 'GET' && partes[0] === 'copia' && partes.length === 1) {
			return {status: 200, texto: JSON.stringify(banco.tudo(), null, '\t'), tipo: 'application/json; charset=utf-8', arquivo: `copia-dos-dados-${hojeIso(agora())}.json`};
		}

		if (partes[0] !== 'e' || !partes[1]) return naoAchei('Endereço da API desconhecido.');
		const entidade = modelo.entidades[partes[1]];
		if (!entidade) return naoAchei(`O cadastro "${partes[1]}" não existe.`);
		const resto = partes.slice(2);

		if (metodo === 'GET' && !resto.length) {
			const ligados = ligadosDe(entidade);
			const resultado = consultar(ler(entidade), entidade, {busca: consulta.get('busca') ?? '', filtros: filtrosDa(consulta), ordem: consulta.get('ordem') ?? undefined, direcao: consulta.get('direcao') ?? undefined, pagina: consulta.get('pagina') ?? 1, porPagina: consulta.get('porPagina') ?? 50}, ligados);
			return {status: 200, json: {...resultado, ligados, totalGeral: banco.listar(entidade.id).length}};
		}

		if (metodo === 'GET' && resto[0] === 'opcoes' && resto.length === 1) {
			const itens = banco.listar(entidade.id).map((r) => ({id: r.id, titulo: r[entidade.titulo] ?? `#${r.id}`})).sort((a, b) => String(a.titulo).localeCompare(String(b.titulo), 'pt-BR', {numeric: true}));
			return {status: 200, json: {itens}};
		}

		if (metodo === 'GET' && resto[0] === 'exportar.csv' && resto.length === 1) {
			const ligados = ligadosDe(entidade);
			// a exportação leva todos os registros da consulta, não só uma página: junta página por página
			const pedido = {busca: consulta.get('busca') ?? '', filtros: filtrosDa(consulta), ordem: consulta.get('ordem') ?? undefined, direcao: consulta.get('direcao') ?? undefined, porPagina: 500};
			const registros = ler(entidade);
			const todos = [];
			for (let pagina = 1; ; pagina++) {
				const parte = consultar(registros, entidade, {...pedido, pagina}, ligados);
				todos.push(...parte.itens);
				if (todos.length >= parte.total) break;
			}
			const campos = {...entidade.campos, ...entidade.calculados};
			const linhas = todos.map((r) => Object.entries(campos).map(([id, campo]) => escrever(campo, r[id], ligados)));
			return {status: 200, texto: montarCsv(Object.values(campos).map((c) => c.rotulo), linhas), tipo: 'text/csv; charset=utf-8', arquivo: `${entidade.id}-${hojeIso(agora())}.csv`};
		}

		if (metodo === 'POST' && !resto.length) {
			const conferido = validarRegistro(entidade, corpo, {banco, regras, hoje: hojeIso(agora())});
			if (!conferido.ok) return {status: 422, json: {mensagem: 'Confira os campos marcados.', erros: conferido.erros}};
			return {status: 201, json: {registro: comCalculados(banco.criar(entidade.id, conferido.valor), entidade, regras, contexto())}};
		}

		const id = Number(resto[0]);
		if (!Number.isInteger(id) || resto.length !== 1) return naoAchei();
		const atual = banco.pegar(entidade.id, id);
		if (!atual) return naoAchei(`${entidade.genero === 'f' ? 'Essa' : 'Esse'} ${entidade.singular} não existe mais (pode ter sido ${entidade.genero === 'f' ? 'apagada' : 'apagado'}).`);

		if (metodo === 'GET') return {status: 200, json: {registro: comCalculados(atual, entidade, regras, contexto()), ligados: ligadosDe(entidade)}};

		if (metodo === 'PUT') {
			const conferido = validarRegistro(entidade, corpo, {banco, regras, anterior: atual, hoje: hojeIso(agora())});
			if (!conferido.ok) return {status: 422, json: {mensagem: 'Confira os campos marcados.', erros: conferido.erros}};
			return {status: 200, json: {registro: comCalculados(banco.atualizar(entidade.id, id, conferido.valor), entidade, regras, contexto())}};
		}

		if (metodo === 'DELETE') {
			const usos = quemAponta(entidade, id);
			if (usos.length) {
				const lista = usos.map((u) => `${u.quantos} ${u.quantos === 1 ? u.entidade.singular : u.entidade.nome.toLowerCase()}`).join(' e ');
				return {status: 409, json: {mensagem: `Não dá para apagar: ${lista} ${usos.reduce((s, u) => s + u.quantos, 0) === 1 ? 'usa' : 'usam'} ${entidade.genero === 'f' ? 'esta' : 'este'} ${entidade.singular}. Apague ou troque primeiro.`}};
			}
			banco.apagar(entidade.id, id);
			return {status: 200, json: {apagado: true}};
		}

		return {status: 405, json: {mensagem: 'Operação não aceita neste endereço.'}};
	};
};
