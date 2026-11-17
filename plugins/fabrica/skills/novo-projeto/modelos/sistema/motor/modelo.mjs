// O "modelo" é a descrição dos cadastros do sistema (modelo.mjs, na raiz). Este arquivo confere se a descrição faz
// sentido e completa o que ficou por padrão. Erro aqui aparece com o nome do cadastro e do campo, em português,
// porque quem vai corrigir é quem escreveu o modelo.

export const TIPOS = ['texto', 'texto-longo', 'numero', 'dinheiro', 'data', 'escolha', 'sim-nao', 'ligacao', 'email', 'telefone', 'link'];
const RESERVADOS = new Set(['id', 'criadoEm', 'atualizadoEm']);
const TONS = new Set(['neutro', 'ok', 'alerta', 'erro', 'destaque']);
const DE_FILTRO = new Set(['escolha', 'sim-nao', 'ligacao']);
const DE_PAINEL = new Set(['contagem', 'soma', 'lista', 'grupos']);

const normalizarOpcoes = (opcoes) => opcoes.map((o) => (typeof o === 'string' ? {valor: o, rotulo: o} : {valor: o.valor, rotulo: o.rotulo ?? o.valor, ...(o.cor ? {cor: o.cor} : {})}));

/** Os campos calculados de uma entidade (vêm de regras.mjs), no mesmo formato dos campos comuns. */
export const calculadosDe = (regras, idEntidade) => Object.fromEntries(Object.entries(regras?.[idEntidade]?.calculados ?? {}).map(([id, c]) => [id, {rotulo: c.rotulo ?? id, tipo: c.tipo ?? 'texto', ...(c.opcoes ? {opcoes: normalizarOpcoes(c.opcoes)} : {}), calculado: true}]));

/**
 * Confere o modelo. Devolve a lista de problemas (vazia = tudo certo). Não lança erro: quem chama decide o que fazer.
 */
export const validarModelo = (modelo, regras = {}) => {
	const erros = [];
	if (!modelo || typeof modelo !== 'object') return ['o modelo.mjs precisa exportar `modelo` (um objeto)'];
	if (!modelo.nome || typeof modelo.nome !== 'string') erros.push('falta `nome` (o nome do sistema)');
	const entidades = Object.entries(modelo.entidades ?? {});
	if (!entidades.length) erros.push('falta pelo menos um cadastro em `entidades`');
	for (const [id, ent] of entidades) {
		const onde = `cadastro "${id}"`;
		if (!/^[a-z][a-z0-9-]*$/.test(id)) erros.push(`${onde}: o identificador usa só minúsculas, números e hífen, sem acento (ex.: "clientes", "notas-fiscais")`);
		if (!ent.nome) erros.push(`${onde}: falta \`nome\` (plural, como aparece no menu: "Clientes")`);
		if (!ent.singular) erros.push(`${onde}: falta \`singular\` (ex.: "cliente")`);
		if (ent.genero && !['m', 'f'].includes(ent.genero)) erros.push(`${onde}: \`genero\` é "m" ou "f" (para escrever "Novo cliente" ou "Nova tarefa")`);
		const campos = Object.entries(ent.campos ?? {});
		const calculados = calculadosDe(regras, id);
		const todos = {...ent.campos, ...calculados};
		if (!campos.length) erros.push(`${onde}: falta pelo menos um campo em \`campos\``);
		for (const [idCampo, campo] of campos) {
			const ondeCampo = `${onde}, campo "${idCampo}"`;
			if (!/^[a-z][a-zA-Z0-9]*$/.test(idCampo)) erros.push(`${ondeCampo}: o identificador começa com minúscula e usa só letras sem acento e números (ex.: "dataDeEntrega")`);
			if (RESERVADOS.has(idCampo)) erros.push(`${ondeCampo}: esse nome é usado pelo próprio sistema; escolha outro`);
			if (idCampo in calculados) erros.push(`${ondeCampo}: existe um campo calculado com o mesmo nome em regras.mjs`);
			if (!campo.rotulo) erros.push(`${ondeCampo}: falta \`rotulo\` (o nome que aparece na tela)`);
			if (!TIPOS.includes(campo.tipo)) {
				erros.push(`${ondeCampo}: tipo "${campo.tipo}" não existe. Tipos: ${TIPOS.join(', ')}`);
				continue;
			}
			if (campo.tipo === 'escolha') {
				if (!Array.isArray(campo.opcoes) || !campo.opcoes.length) erros.push(`${ondeCampo}: campo de escolha precisa de \`opcoes\` (ex.: ['aberto', 'fechado'])`);
				else {
					const opcoes = normalizarOpcoes(campo.opcoes);
					if (opcoes.some((o) => typeof o.valor !== 'string' || !o.valor)) erros.push(`${ondeCampo}: cada opção é um texto ou {valor, rotulo}`);
					if (new Set(opcoes.map((o) => o.valor)).size !== opcoes.length) erros.push(`${ondeCampo}: há opção repetida`);
					for (const o of opcoes) if (o.cor && !TONS.has(o.cor)) erros.push(`${ondeCampo}: cor "${o.cor}" não existe. Cores: ${[...TONS].join(', ')}`);
					if (campo.padrao !== undefined && !opcoes.some((o) => o.valor === campo.padrao)) erros.push(`${ondeCampo}: o \`padrao\` "${campo.padrao}" não está nas opções`);
				}
			}
			if (campo.tipo === 'ligacao' && !modelo.entidades?.[campo.para]) erros.push(`${ondeCampo}: \`para\` precisa ser o identificador de um cadastro que existe (recebi "${campo.para}")`);
			if (campo.unico && ['texto-longo', 'sim-nao'].includes(campo.tipo)) erros.push(`${ondeCampo}: \`unico\` não faz sentido para o tipo ${campo.tipo}`);
			if (campo.min !== undefined && campo.max !== undefined && campo.min > campo.max) erros.push(`${ondeCampo}: \`min\` maior que \`max\``);
		}
		if (ent.titulo && !(ent.titulo in (ent.campos ?? {}))) erros.push(`${onde}: \`titulo\` aponta para "${ent.titulo}", que não é um campo (é o campo que dá nome ao registro, ex.: "nome")`);
		for (const coluna of ent.lista ?? []) if (!(coluna in todos)) erros.push(`${onde}: \`lista\` cita "${coluna}", que não é campo nem calculado`);
		for (const filtro of ent.filtros ?? []) {
			if (!(filtro in todos)) erros.push(`${onde}: \`filtros\` cita "${filtro}", que não é campo nem calculado`);
			else if (!DE_FILTRO.has(todos[filtro].tipo)) erros.push(`${onde}: só dá para filtrar por campo de escolha, sim-nao ou ligacao ("${filtro}" é ${todos[filtro].tipo})`);
		}
		if (ent.ordem && !(ent.ordem.campo in todos) && !RESERVADOS.has(ent.ordem.campo)) erros.push(`${onde}: \`ordem.campo\` aponta para "${ent.ordem.campo}", que não existe`);
	}
	for (const [i, item] of (modelo.painel ?? []).entries()) {
		const onde = `painel, item ${i + 1}${item?.rotulo ? ` ("${item.rotulo}")` : ''}`;
		if (!DE_PAINEL.has(item?.tipo)) {
			erros.push(`${onde}: tipo "${item?.tipo}" não existe. Tipos: ${[...DE_PAINEL].join(', ')}`);
			continue;
		}
		if (!item.rotulo) erros.push(`${onde}: falta \`rotulo\``);
		const ent = modelo.entidades?.[item.entidade];
		if (!ent) {
			erros.push(`${onde}: \`entidade\` "${item.entidade}" não existe`);
			continue;
		}
		const todos = {...ent.campos, ...calculadosDe(regras, item.entidade)};
		if (item.tipo === 'soma' && !['numero', 'dinheiro'].includes(todos[item.campo]?.tipo)) erros.push(`${onde}: \`campo\` da soma precisa ser um campo de numero ou dinheiro`);
		if (item.tipo === 'grupos') {
			if (!(item.por in todos)) erros.push(`${onde}: \`por\` aponta para "${item.por}", que não existe`);
			if (item.soma && !['numero', 'dinheiro'].includes(todos[item.soma]?.tipo)) erros.push(`${onde}: \`soma\` precisa ser um campo de numero ou dinheiro`);
		}
		for (const campo of Object.keys(item.onde ?? {})) if (!(campo in todos)) erros.push(`${onde}: \`onde\` cita "${campo}", que não existe em ${item.entidade}`);
	}
	return erros;
};

/** Completa o que o modelo deixou por padrão. Só chame depois de `validarModelo` não achar nada. */
export const normalizarModelo = (modelo, regras = {}) => {
	const entidades = {};
	for (const [id, ent] of Object.entries(modelo.entidades)) {
		const campos = Object.fromEntries(Object.entries(ent.campos).map(([idCampo, campo]) => [idCampo, {...campo, ...(campo.tipo === 'escolha' ? {opcoes: normalizarOpcoes(campo.opcoes)} : {})}]));
		const ids = Object.keys(campos);
		const titulo = ent.titulo ?? ids.find((c) => campos[c].tipo === 'texto') ?? ids[0];
		entidades[id] = {
			id,
			nome: ent.nome,
			singular: ent.singular,
			genero: ent.genero ?? 'm',
			titulo,
			campos,
			calculados: calculadosDe(regras, id),
			lista: ent.lista ?? ids.filter((c) => campos[c].tipo !== 'texto-longo').slice(0, 5),
			filtros: ent.filtros ?? [],
			ordem: ent.ordem ?? {campo: titulo, direcao: 'asc'},
		};
	}
	return {nome: modelo.nome, exemplo: Boolean(modelo.exemplo), entidades, painel: modelo.painel ?? []};
};
