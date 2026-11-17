// Achar, filtrar, ordenar e resumir registros. Tudo função pura (entra lista, sai lista): fácil de testar.
import {paraBusca, rotuloDaOpcao} from './formato.mjs';

const DE_TEXTO = new Set(['texto', 'texto-longo', 'email', 'telefone', 'link']);

/** Junta ao registro os campos calculados das regras do projeto. */
export const comCalculados = (registro, entidade, regras, contexto) => {
	const calculados = regras?.[entidade.id]?.calculados;
	if (!calculados) return registro;
	const saida = {...registro};
	for (const [id, c] of Object.entries(calculados)) saida[id] = c.calcular(registro, contexto);
	return saida;
};

/** Troca a palavra "hoje" pela data de hoje nas condições do modelo. */
const resolver = (valor, hoje) => (valor === 'hoje' ? hoje : valor);

/**
 * Se o registro obedece a condição `onde` do modelo. Cada campo aceita: um valor (igual), uma lista (qualquer um) ou
 * {min, max, antes, depois, vazio}. `antes` e `depois` não incluem o próprio dia; `min` e `max` incluem.
 */
export const casa = (registro, onde = {}, hoje = '') =>
	Object.entries(onde).every(([campo, condicao]) => {
		const valor = registro[campo] ?? null;
		if (Array.isArray(condicao)) return condicao.map((c) => resolver(c, hoje)).includes(valor);
		if (condicao && typeof condicao === 'object') {
			const semValor = valor === null || valor === '';
			if (condicao.vazio !== undefined && condicao.vazio !== semValor) return false;
			const limites = ['min', 'max', 'antes', 'depois'].filter((l) => condicao[l] !== undefined);
			if (!limites.length) return true;
			if (semValor) return false;
			return limites.every((l) => {
				const limite = resolver(condicao[l], hoje);
				return l === 'min' ? valor >= limite : l === 'max' ? valor <= limite : l === 'antes' ? valor < limite : valor > limite;
			});
		}
		return valor === resolver(condicao, hoje);
	});

const comparar = (a, b, tipo) => {
	const vazioA = a === null || a === undefined || a === '';
	const vazioB = b === null || b === undefined || b === '';
	if (vazioA || vazioB) return vazioA && vazioB ? 0 : vazioA ? 1 : -1;
	if (typeof a === 'number' && typeof b === 'number') return a - b;
	if (typeof a === 'boolean') return Number(a) - Number(b);
	return String(a).localeCompare(String(b), 'pt-BR', {numeric: true, sensitivity: 'base'});
};

/**
 * A consulta da tela de lista: busca por texto, filtros, ordem e página. `ligados` = {entidade: {id: título}} serve
 * para a busca e a ordem enxergarem o nome do item ligado em vez do número dele.
 */
export const consultar = (itens, entidade, {busca = '', filtros = {}, ordem, direcao, pagina = 1, porPagina = 50} = {}, ligados = {}) => {
	const campos = {...entidade.campos, ...entidade.calculados};
	const texto = (registro, id) => {
		const campo = campos[id];
		const valor = registro[id];
		if (valor === null || valor === undefined) return '';
		if (campo.tipo === 'ligacao') return ligados[campo.para]?.[valor] ?? '';
		if (campo.tipo === 'escolha') return rotuloDaOpcao(campo, valor);
		return String(valor);
	};
	let lista = itens;
	const termos = paraBusca(busca).split(/\s+/).filter(Boolean);
	if (termos.length) {
		const buscaveis = Object.keys(campos).filter((id) => DE_TEXTO.has(campos[id].tipo) || ['escolha', 'ligacao'].includes(campos[id].tipo));
		lista = lista.filter((r) => {
			const palheiro = paraBusca(buscaveis.map((id) => texto(r, id)).join(' '));
			return termos.every((t) => palheiro.includes(t));
		});
	}
	for (const [id, bruto] of Object.entries(filtros)) {
		const campo = campos[id];
		if (!campo || bruto === '' || bruto === undefined) continue;
		const alvo = campo.tipo === 'sim-nao' ? bruto === 'sim' || bruto === true : campo.tipo === 'ligacao' ? Number(bruto) : bruto;
		lista = lista.filter((r) => (campo.tipo === 'sim-nao' ? Boolean(r[id]) === alvo : r[id] === alvo));
	}
	const campoOrdem = ordem && (ordem in campos || ['id', 'criadoEm', 'atualizadoEm'].includes(ordem)) ? ordem : entidade.ordem.campo;
	const sentido = (direcao ?? (ordem ? 'asc' : entidade.ordem.direcao)) === 'desc' ? -1 : 1;
	const tipo = campos[campoOrdem]?.tipo;
	const chave = (r) => (tipo === 'ligacao' || tipo === 'escolha' ? texto(r, campoOrdem) : r[campoOrdem]);
	lista = [...lista].sort((a, b) => sentido * comparar(chave(a), chave(b), tipo) || a.id - b.id);
	const total = lista.length;
	const tamanho = Math.min(Math.max(1, Number(porPagina) || 50), 500);
	const atual = Math.min(Math.max(1, Number(pagina) || 1), Math.max(1, Math.ceil(total / tamanho)));
	return {itens: lista.slice((atual - 1) * tamanho, atual * tamanho), total, pagina: atual, porPagina: tamanho, ordem: campoOrdem, direcao: sentido === 1 ? 'asc' : 'desc'};
};

/** Calcula um item do painel inicial (contagem, soma, lista ou grupos) a partir dos registros da entidade dele. */
export const resumir = (item, itens, entidade, {hoje, ligados = {}} = {}) => {
	const campos = {...entidade.campos, ...entidade.calculados};
	const escolhidos = itens.filter((r) => casa(r, item.onde, hoje));
	const base = {tipo: item.tipo, rotulo: item.rotulo, entidade: item.entidade, ajuda: item.ajuda ?? null, tom: item.tom ?? null};
	if (item.tipo === 'contagem') return {...base, valor: escolhidos.length};
	if (item.tipo === 'soma') return {...base, valor: escolhidos.reduce((soma, r) => soma + (r[item.campo] ?? 0), 0), formato: campos[item.campo].tipo};
	if (item.tipo === 'lista') {
		const ordem = item.ordem ?? entidade.ordem;
		const sentido = ordem.direcao === 'desc' ? -1 : 1;
		const ordenados = [...escolhidos].sort((a, b) => sentido * comparar(a[ordem.campo], b[ordem.campo]) || a.id - b.id);
		return {...base, colunas: item.colunas ?? entidade.lista.slice(0, 3), itens: ordenados.slice(0, item.limite ?? 5), total: escolhidos.length};
	}
	// grupos: quantos (ou quanto, se houver `soma`) por valor do campo `por`
	const campo = campos[item.por];
	const grupos = new Map();
	for (const r of escolhidos) {
		const valor = r[item.por] ?? null;
		const chave = campo.tipo === 'data' && valor ? valor.slice(0, 7) : valor;
		grupos.set(chave, (grupos.get(chave) ?? 0) + (item.soma ? (r[item.soma] ?? 0) : 1));
	}
	const rotulo = (chave) => {
		if (chave === null || chave === '') return 'Sem informação';
		if (campo.tipo === 'escolha') return rotuloDaOpcao(campo, chave);
		if (campo.tipo === 'ligacao') return ligados[campo.para]?.[chave] ?? `#${chave}`;
		if (campo.tipo === 'sim-nao') return chave ? 'Sim' : 'Não';
		if (campo.tipo === 'data') return chave.split('-').reverse().join('/');
		return String(chave);
	};
	let lista = [...grupos].map(([chave, valor]) => ({chave, rotulo: rotulo(chave), valor}));
	// escolha segue a ordem das opções do modelo; data, a ordem do calendário; o resto, do maior para o menor
	if (campo.tipo === 'escolha') lista.sort((a, b) => campo.opcoes.findIndex((o) => o.valor === a.chave) - campo.opcoes.findIndex((o) => o.valor === b.chave));
	else if (campo.tipo === 'data') lista.sort((a, b) => String(a.chave).localeCompare(String(b.chave)));
	else lista.sort((a, b) => b.valor - a.valor);
	lista = lista.slice(0, item.limite ?? 8);
	return {...base, grupos: lista, formato: item.soma ? campos[item.soma].tipo : 'numero'};
};
