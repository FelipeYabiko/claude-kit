// Confere e arruma um registro antes de guardar. Toda entrada passa por aqui (tela, importação, teste): é a única
// porta. Devolve {ok, erros: {campo: mensagem}, valor}. As mensagens vão direto para a tela, embaixo do campo.
import {lerData, lerDinheiro, lerNumero, paraBusca, hojeIso} from './formato.mjs';

const vazio = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

const LIMITE = {texto: 200, 'texto-longo': 5000, email: 200, telefone: 30, link: 500};

/** Confere um valor contra o tipo do campo. Devolve {valor} já arrumado ou {erro}. */
const lerCampo = (campo, bruto, {banco}) => {
	switch (campo.tipo) {
		case 'texto':
		case 'texto-longo': {
			if (typeof bruto !== 'string') return {erro: 'Escreva um texto.'};
			const valor = campo.tipo === 'texto' ? bruto.trim().replace(/\s+/g, ' ') : bruto.trim();
			const max = campo.max ?? LIMITE[campo.tipo];
			if (valor.length > max) return {erro: `No máximo ${max} letras (tem ${valor.length}).`};
			if (campo.min && valor.length < campo.min) return {erro: `Pelo menos ${campo.min} letras.`};
			return {valor};
		}
		case 'numero': {
			const valor = lerNumero(bruto);
			if (valor === null) return {erro: 'Escreva um número (ex.: 12 ou 12,5).'};
			if (campo.inteiro && !Number.isInteger(valor)) return {erro: 'Só número inteiro, sem vírgula.'};
			if (campo.min !== undefined && valor < campo.min) return {erro: `O mínimo é ${campo.min}.`};
			if (campo.max !== undefined && valor > campo.max) return {erro: `O máximo é ${campo.max}.`};
			return {valor};
		}
		case 'dinheiro': {
			const valor = lerDinheiro(bruto);
			if (valor === null) return {erro: 'Escreva um valor em reais (ex.: 1.250,00).'};
			if (campo.min !== undefined && valor < Math.round(campo.min * 100)) return {erro: `O mínimo é R$ ${campo.min}.`};
			if (campo.max !== undefined && valor > Math.round(campo.max * 100)) return {erro: `O máximo é R$ ${campo.max}.`};
			if (campo.min === undefined && valor < 0) return {erro: 'O valor não pode ser negativo.'};
			return {valor};
		}
		case 'data': {
			const valor = lerData(bruto);
			return valor ? {valor} : {erro: 'Escolha uma data que exista (dia/mês/ano).'};
		}
		case 'escolha':
			return campo.opcoes.some((o) => o.valor === bruto) ? {valor: bruto} : {erro: `Escolha uma das opções: ${campo.opcoes.map((o) => o.rotulo).join(', ')}.`};
		case 'sim-nao': {
			if (typeof bruto === 'boolean') return {valor: bruto};
			const texto = paraBusca(bruto);
			if (['sim', 's', 'true', '1'].includes(texto)) return {valor: true};
			if (['nao', 'n', 'false', '0'].includes(texto)) return {valor: false};
			return {erro: 'Marque sim ou não.'};
		}
		case 'ligacao': {
			const id = typeof bruto === 'number' ? bruto : Number(bruto);
			if (!Number.isInteger(id) || !banco.pegar(campo.para, id)) return {erro: 'Escolha um item da lista (o escolhido não existe mais).'};
			return {valor: id};
		}
		case 'email': {
			const valor = String(bruto).trim().toLowerCase();
			return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor) && valor.length <= LIMITE.email ? {valor} : {erro: 'Escreva um e-mail completo (nome@exemplo.com).'};
		}
		case 'telefone': {
			const valor = String(bruto).trim();
			const digitos = valor.replace(/\D/g, '');
			return digitos.length >= 8 && digitos.length <= 15 && valor.length <= LIMITE.telefone ? {valor} : {erro: 'Escreva o telefone com DDD (ex.: 11 91234-5678).'};
		}
		case 'link': {
			let valor = String(bruto).trim();
			if (!/^https?:\/\//i.test(valor)) valor = `https://${valor}`;
			try {
				const url = new URL(valor);
				if (!url.hostname.includes('.') || valor.length > LIMITE.link) throw new Error('curto');
				return {valor};
			} catch {
				return {erro: 'Escreva um endereço de site (ex.: exemplo.com.br).'};
			}
		}
		default:
			return {erro: `Tipo de campo desconhecido: ${campo.tipo}.`};
	}
};

/**
 * Confere os dados de um registro. `anterior` é o registro guardado (numa edição) ou null (num cadastro novo).
 * Campo que não veio numa edição mantém o valor antigo; num cadastro novo recebe o padrão.
 */
export const validarRegistro = (entidade, dados, {banco, regras = {}, anterior = null, hoje = hojeIso()} = {}) => {
	const erros = {};
	const valor = {};
	for (const [id, campo] of Object.entries(entidade.campos)) {
		let bruto = dados?.[id];
		if (bruto === undefined && anterior) {
			valor[id] = anterior[id] ?? (campo.tipo === 'sim-nao' ? false : null);
			continue;
		}
		if (bruto === undefined && campo.padrao !== undefined) bruto = campo.padrao === 'hoje' && campo.tipo === 'data' ? hoje : campo.padrao;
		if (vazio(bruto)) {
			if (campo.tipo === 'sim-nao') valor[id] = false;
			else if (campo.obrigatorio) erros[id] = `Preencha ${campo.rotulo.toLowerCase()}.`;
			else valor[id] = null;
			continue;
		}
		const lido = lerCampo(campo, bruto, {banco});
		if (lido.erro) {
			erros[id] = lido.erro;
			continue;
		}
		valor[id] = lido.valor;
		if (campo.unico) {
			const igual = banco.listar(entidade.id).find((r) => r.id !== anterior?.id && paraBusca(r[id]) === paraBusca(lido.valor));
			if (igual) erros[id] = `Já existe ${entidade.genero === 'f' ? 'uma' : 'um'} ${entidade.singular} com ${campo.rotulo.toLowerCase()} "${lido.valor}".`;
		}
	}
	// regras próprias do projeto só rodam com os campos básicos certos (recebem dados limpos)
	if (!Object.keys(erros).length) {
		const extras = regras[entidade.id]?.validar?.({...anterior, ...valor}, {banco, anterior, hoje}) ?? {};
		for (const [campo, mensagem] of Object.entries(extras)) if (mensagem) erros[campo] = mensagem;
	}
	if (Object.keys(erros).length) return {ok: false, erros, valor: null};
	const final = regras[entidade.id]?.aoSalvar?.({...valor}, {banco, anterior, hoje}) ?? valor;
	return {ok: true, erros: {}, valor: final};
};
