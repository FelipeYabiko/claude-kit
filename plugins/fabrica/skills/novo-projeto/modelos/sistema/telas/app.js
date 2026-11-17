// As telas do sistema, desenhadas a partir do modelo: painel, lista e formulário de cada cadastro.
// Sem biblioteca e sem passo de montagem. Tudo o que vai para a tela é criado como elemento (função `h`), nunca como
// texto de HTML: assim o que alguém digitar num campo jamais vira código na página.
// Este arquivo é do motor: cadastro novo se faz em modelo.mjs, não aqui.
import {escrever, escreverData, escreverDinheiro, escreverNumero} from '/formato.mjs';

// ---------- Ferramentas pequenas ----------

/** Cria um elemento: h('a', {href: '#/', class: 'x', onclick: fn}, 'texto', outroElemento). */
const h = (tag, atributos = {}, ...filhos) => {
	const el = document.createElement(tag);
	for (const [chave, valor] of Object.entries(atributos ?? {})) {
		if (valor === false || valor === null || valor === undefined) continue;
		if (chave.startsWith('on')) el.addEventListener(chave.slice(2), valor);
		else if (chave === 'class') el.className = valor;
		else if (chave === 'value') el.value = valor;
		else if (chave === 'checked' || chave === 'selected' || chave === 'disabled' || chave === 'required') el[chave] = Boolean(valor);
		else el.setAttribute(chave, valor === true ? '' : valor);
	}
	for (const filho of filhos.flat(Infinity)) {
		if (filho === null || filho === undefined || filho === false) continue;
		el.append(filho instanceof Node ? filho : document.createTextNode(String(filho)));
	}
	return el;
};

/** Troca o conteúdo de um elemento. Aceita listas e ignora o que for falso (para poder escrever `condicao && h(...)`). */
const trocar = (el, ...filhos) => el.replaceChildren(...filhos.flat(Infinity).filter((f) => f !== null && f !== undefined && f !== false));

/** Fala com o servidor. Erro vira exceção com {status, mensagem, erros} para a tela mostrar. */
const api = async (caminho, {metodo = 'GET', corpo} = {}) => {
	let resposta;
	try {
		resposta = await fetch(`/api/${caminho}`, {method: metodo, headers: corpo ? {'content-type': 'application/json'} : {}, body: corpo ? JSON.stringify(corpo) : undefined});
	} catch {
		throw {status: 0, mensagem: 'O sistema não respondeu. A janela dele foi fechada? Abra o sistema de novo e recarregue esta página.'};
	}
	const json = await resposta.json().catch(() => ({}));
	if (!resposta.ok) throw {status: resposta.status, mensagem: json.mensagem ?? 'Algo deu errado.', erros: json.erros ?? {}};
	return json;
};

const miolo = document.getElementById('conteudo');
const avisos = document.getElementById('avisos');

/** Mensagem curta no canto, que some sozinha. */
const avisar = (texto, tom = 'ok') => {
	const el = h('p', {class: `aviso aviso--${tom}`}, texto);
	avisos.append(el);
	setTimeout(() => el.remove(), tom === 'erro' ? 8000 : 3500);
};

/** Pergunta de sim ou não numa janelinha (para apagar). Devolve true se a pessoa confirmou. */
const confirmar = (pergunta, textoDoSim) =>
	new Promise((resolve) => {
		const janela = h(
			'dialog',
			{class: 'janela'},
			h('p', {class: 'janela__texto'}, pergunta),
			h('div', {class: 'janela__acoes'}, h('button', {class: 'botao botao--vazado', type: 'button', onclick: () => janela.close('nao')}, 'Cancelar'), h('button', {class: 'botao botao--perigo', type: 'button', onclick: () => janela.close('sim')}, textoDoSim)),
		);
		janela.addEventListener('close', () => {
			resolve(janela.returnValue === 'sim');
			janela.remove();
		});
		document.body.append(janela);
		janela.showModal();
	});

const artigo = (entidade, masculino, feminino) => (entidade.genero === 'f' ? feminino : masculino);
const maiuscula = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);
const camposDe = (entidade) => ({...entidade.campos, ...entidade.calculados});

// ---------- Estado e rotas ----------

let modelo;

/** "#/e/projetos/3?busca=x" → {partes: ['e', 'projetos', '3'], consulta: URLSearchParams}. */
const lerRota = () => {
	const [caminho, consulta = ''] = location.hash.replace(/^#\/?/, '').split('?');
	return {partes: caminho.split('/').filter(Boolean).map(decodeURIComponent), consulta: new URLSearchParams(consulta)};
};

const mostrar = (titulo, ...conteudo) => {
	document.title = titulo ? `${titulo} · ${modelo.nome}` : modelo.nome;
	trocar(miolo, conteudo);
	miolo.scrollTo?.(0, 0);
	window.scrollTo(0, 0);
};

const marcarMenu = (ativo) => {
	for (const link of document.querySelectorAll('#menu a')) {
		if (link.dataset.rota === ativo) link.setAttribute('aria-current', 'page');
		else link.removeAttribute('aria-current');
	}
};

// ---------- Como cada valor aparece ----------

const etiqueta = (texto, tom = 'neutro') => h('span', {class: `etiqueta etiqueta--${tom}`}, texto);

/** O conteúdo de uma célula (lista e painel), conforme o tipo do campo. */
const celula = (campo, valor, ligados) => {
	if (valor === null || valor === undefined || valor === '') return h('span', {class: 'vazio', 'aria-label': 'vazio'}, '—');
	switch (campo.tipo) {
		case 'escolha': {
			const opcao = campo.opcoes.find((o) => o.valor === valor);
			return etiqueta(opcao?.rotulo ?? valor, opcao?.cor ?? 'neutro');
		}
		case 'sim-nao':
			return valor ? etiqueta('Sim', campo.calculado ? 'erro' : 'ok') : h('span', {class: 'vazio'}, 'Não');
		case 'link':
			return h('a', {href: valor, target: '_blank', rel: 'noopener noreferrer'}, valor.replace(/^https?:\/\//, ''));
		case 'email':
			return h('a', {href: `mailto:${valor}`}, valor);
		case 'telefone':
			return h('a', {href: `tel:${valor.replace(/[^\d+]/g, '')}`}, valor);
		default:
			return escrever(campo, valor, ligados);
	}
};

const ehNumero = (campo) => campo.tipo === 'numero' || campo.tipo === 'dinheiro';

// ---------- Painel ----------

const cartaoDoPainel = (item, ligados) => {
	const entidade = modelo.entidades[item.entidade];
	const numero = (valor, formato) => (formato === 'dinheiro' ? escreverDinheiro(valor) : escreverNumero(valor));
	if (item.tipo === 'contagem' || item.tipo === 'soma') {
		return h('a', {class: `cartao cartao--numero${item.tom ? ` cartao--${item.tom}` : ''}`, href: `#/e/${item.entidade}`}, h('span', {class: 'cartao__rotulo'}, item.rotulo), h('strong', {class: 'cartao__valor'}, item.tipo === 'soma' ? numero(item.valor, item.formato) : String(item.valor)), item.ajuda && h('span', {class: 'cartao__ajuda'}, item.ajuda));
	}
	if (item.tipo === 'lista') {
		const campos = camposDe(entidade);
		return h(
			'section',
			{class: 'cartao cartao--largo'},
			h('header', {class: 'cartao__cabeca'}, h('h2', {}, item.rotulo), h('a', {href: `#/e/${item.entidade}`}, `Ver ${artigo(entidade, 'todos', 'todas')}`)),
			item.itens.length
				? h(
						'ul',
						{class: 'mini'},
						item.itens.map((r) => h('li', {}, h('a', {href: `#/e/${item.entidade}/${r.id}`, class: 'mini__linha'}, item.colunas.map((c, i) => h('span', {class: i === 0 ? 'mini__titulo' : `mini__dado${ehNumero(campos[c]) || campos[c].tipo === 'data' ? ' numero' : ''}`}, i === 0 ? escrever(campos[c], r[c], ligados) || `${maiuscula(entidade.singular)} #${r.id}` : celula(campos[c], r[c], ligados)))))),
					)
				: h('p', {class: 'cartao__nada'}, 'Nada por aqui.'),
		);
	}
	const maior = Math.max(1, ...item.grupos.map((g) => g.valor));
	return h(
		'section',
		{class: 'cartao cartao--largo'},
		h('header', {class: 'cartao__cabeca'}, h('h2', {}, item.rotulo)),
		item.grupos.length
			? h(
					'ul',
					{class: 'barras'},
					item.grupos.map((g) => {
						const barra = h('span', {class: 'barras__barra'});
						barra.style.width = `${Math.max(2, (g.valor / maior) * 100)}%`;
						return h('li', {class: 'barras__linha'}, h('span', {class: 'barras__rotulo'}, g.rotulo), h('span', {class: 'barras__trilho'}, barra), h('span', {class: 'barras__valor numero'}, numero(g.valor, item.formato)));
					}),
				)
			: h('p', {class: 'cartao__nada'}, 'Nada por aqui.'),
	);
};

const telaPainel = async () => {
	marcarMenu('painel');
	const {itens, ligados, vazio} = await api('painel');
	const primeira = Object.values(modelo.entidades)[0];
	mostrar(
		'',
		h('header', {class: 'cabeca'}, h('h1', {tabindex: '-1'}, 'Painel')),
		modelo.exemplo && h('p', {class: 'faixa'}, h('strong', {}, 'Sistema de exemplo. '), 'Estes cadastros e dados vieram com o modelo da fábrica, para você ver funcionando. Eles serão trocados pelos seus.'),
		vazio && h('div', {class: 'comeco'}, h('h2', {}, 'Tudo pronto para começar'), h('p', {}, `Ainda não há nada cadastrado. Comece ${artigo(primeira, 'pelo primeiro', 'pela primeira')} ${primeira.singular}.`), h('a', {class: 'botao', href: `#/e/${primeira.id}/novo`}, `${artigo(primeira, 'Novo', 'Nova')} ${primeira.singular}`)),
		itens.length ? h('div', {class: 'painel'}, itens.map((item) => cartaoDoPainel(item, ligados))) : !vazio && h('p', {class: 'cartao__nada'}, 'O painel ainda não tem indicadores: eles são descritos em `painel`, no modelo.mjs.'),
	);
};

// ---------- Lista ----------

const telaLista = async (entidade, consulta) => {
	marcarMenu(entidade.id);
	const campos = camposDe(entidade);
	const estado = Object.fromEntries(consulta);
	const resultado = h('div', {class: 'resultado'});

	const enderecoDe = () => `#/e/${entidade.id}${Object.keys(estado).length ? `?${new URLSearchParams(estado)}` : ''}`;
	const mudar = (mudancas, {voltarPagina = true} = {}) => {
		for (const [chave, valor] of Object.entries(mudancas)) {
			if (valor === '' || valor === null || valor === undefined) delete estado[chave];
			else estado[chave] = String(valor);
		}
		if (voltarPagina) delete estado.pagina;
		// troca o endereço sem recarregar a tela: quem digita na busca não perde o cursor, e o botão voltar funciona
		history.replaceState(null, '', enderecoDe());
		carregar();
	};

	const linkExportar = h('a', {class: 'botao botao--vazado botao--pequeno', download: ''}, 'Exportar planilha');

	const carregar = async () => {
		const parametros = new URLSearchParams(estado);
		linkExportar.href = `/api/e/${entidade.id}/exportar.csv?${parametros}`;
		let dados;
		try {
			dados = await api(`e/${entidade.id}?${parametros}`);
		} catch (e) {
			trocar(resultado, h('p', {class: 'faixa faixa--erro'}, e.mensagem));
			return;
		}
		const {itens, total, totalGeral, pagina, porPagina, ordem, direcao, ligados} = dados;
		if (!totalGeral) {
			trocar(resultado, h('div', {class: 'comeco'}, h('h2', {}, `${artigo(entidade, 'Nenhum', 'Nenhuma')} ${entidade.singular} ainda`), h('p', {}, `Quando você cadastrar ${artigo(entidade, 'o primeiro', 'a primeira')}, aparece aqui.`), h('a', {class: 'botao', href: `#/e/${entidade.id}/novo`}, `${artigo(entidade, 'Novo', 'Nova')} ${entidade.singular}`)));
			return;
		}
		if (!total) {
			trocar(resultado, h('div', {class: 'comeco'}, h('h2', {}, 'Nada encontrado'), h('p', {}, 'Nenhum registro bate com a busca e os filtros.'), h('button', {class: 'botao botao--vazado', type: 'button', onclick: () => (location.hash = `#/e/${entidade.id}`)}, 'Limpar busca e filtros')));
			return;
		}
		const cabecalho = entidade.lista.map((id) => {
			const ativa = ordem === id;
			return h('th', {scope: 'col', class: ehNumero(campos[id]) ? 'numero' : '', 'aria-sort': ativa ? (direcao === 'asc' ? 'ascending' : 'descending') : 'none'}, h('button', {type: 'button', class: 'ordenar', onclick: () => mudar({ordem: id, direcao: ativa && direcao === 'asc' ? 'desc' : 'asc'})}, campos[id].rotulo, h('span', {class: 'ordenar__seta', 'aria-hidden': 'true'}, ativa ? (direcao === 'asc' ? '↑' : '↓') : '')));
		});
		const linhas = itens.map((r) =>
			h(
				'tr',
				{},
				entidade.lista.map((id, i) => {
					const conteudo = i === 0 ? h('a', {class: 'linha__titulo', href: `#/e/${entidade.id}/${r.id}`}, r[id] === null || r[id] === '' || r[id] === undefined ? `${maiuscula(entidade.singular)} #${r.id}` : escrever(campos[id], r[id], ligados)) : celula(campos[id], r[id], ligados);
					return h('td', {'data-rotulo': campos[id].rotulo, class: ehNumero(campos[id]) ? 'numero' : ''}, conteudo);
				}),
			),
		);
		const paginas = Math.ceil(total / porPagina);
		trocar(resultado, 
			h('p', {class: 'contagem'}, total === totalGeral ? `${total} ${total === 1 ? entidade.singular : entidade.nome.toLowerCase()}` : `${total} de ${totalGeral} ${entidade.nome.toLowerCase()}`),
			h('div', {class: 'tabela-caixa'}, h('table', {class: 'tabela'}, h('thead', {}, h('tr', {}, cabecalho)), h('tbody', {}, linhas))),
			paginas > 1 && h('nav', {class: 'paginas', 'aria-label': 'Páginas'}, h('button', {class: 'botao botao--vazado botao--pequeno', type: 'button', disabled: pagina <= 1, onclick: () => mudar({pagina: pagina - 1}, {voltarPagina: false})}, 'Anterior'), h('span', {}, `Página ${pagina} de ${paginas}`), h('button', {class: 'botao botao--vazado botao--pequeno', type: 'button', disabled: pagina >= paginas, onclick: () => mudar({pagina: pagina + 1}, {voltarPagina: false})}, 'Próxima')),
		);
	};

	// os filtros de ligação precisam da lista do outro cadastro
	const opcoesDeLigacao = {};
	for (const id of entidade.filtros) if (campos[id].tipo === 'ligacao') opcoesDeLigacao[id] = (await api(`e/${campos[id].para}/opcoes`)).itens;

	let espera;
	const busca = h('input', {type: 'search', id: 'busca', class: 'campo__entrada', placeholder: 'Digite para buscar…', value: estado.busca ?? '', autocomplete: 'off', oninput: (e) => {
		clearTimeout(espera);
		espera = setTimeout(() => mudar({busca: e.target.value.trim()}), 220);
	}});
	const filtros = entidade.filtros.map((id) => {
		const campo = campos[id];
		const opcoes = campo.tipo === 'escolha' ? campo.opcoes.map((o) => [o.valor, o.rotulo]) : campo.tipo === 'sim-nao' ? [['sim', 'Sim'], ['nao', 'Não']] : opcoesDeLigacao[id].map((o) => [String(o.id), o.titulo]);
		return h('div', {class: 'campo campo--filtro'}, h('label', {for: `filtro-${id}`}, campo.rotulo), h('select', {id: `filtro-${id}`, class: 'campo__entrada', onchange: (e) => mudar({[`f.${id}`]: e.target.value})}, h('option', {value: ''}, artigo({genero: 'm'}, 'Todos', 'Todas')), opcoes.map(([valor, rotulo]) => h('option', {value: valor, selected: estado[`f.${id}`] === valor}, rotulo))));
	});

	mostrar(
		entidade.nome,
		h('header', {class: 'cabeca'}, h('h1', {tabindex: '-1'}, entidade.nome), h('a', {class: 'botao', href: `#/e/${entidade.id}/novo`}, `${artigo(entidade, 'Novo', 'Nova')} ${entidade.singular}`)),
		h('div', {class: 'ferramentas'}, h('div', {class: 'campo campo--busca'}, h('label', {for: 'busca'}, 'Buscar'), busca), filtros, h('div', {class: 'ferramentas__fim'}, linkExportar)),
		resultado,
	);
	await carregar();
};

// ---------- Formulário ----------

/** A entrada de um campo no formulário, com o valor atual. Devolve {el, ler} (ler() pega o que foi digitado). */
const entradaDe = (id, campo, valor, opcoesDeLigacao) => {
	const comum = {id: `campo-${id}`, name: id, class: 'campo__entrada', 'aria-describedby': `erro-${id}${campo.ajuda ? ` ajuda-${id}` : ''}`, required: campo.obrigatorio && campo.tipo !== 'sim-nao'};
	const vazio = valor === null || valor === undefined;
	switch (campo.tipo) {
		case 'texto-longo': {
			const el = h('textarea', {...comum, rows: '4'});
			el.value = vazio ? '' : valor;
			return {el, ler: () => el.value};
		}
		case 'numero': {
			const el = h('input', {...comum, type: 'text', inputmode: 'decimal', autocomplete: 'off', value: vazio ? '' : escreverNumero(valor)});
			return {el, ler: () => el.value};
		}
		case 'dinheiro': {
			const el = h('input', {...comum, type: 'text', inputmode: 'decimal', autocomplete: 'off', placeholder: '0,00', value: vazio ? '' : escreverDinheiro(valor).replace(/^-?R\$\s/, (m) => (m.startsWith('-') ? '-' : ''))});
			return {el: h('span', {class: 'com-prefixo'}, h('span', {class: 'com-prefixo__texto', 'aria-hidden': 'true'}, 'R$'), el), ler: () => el.value};
		}
		case 'data': {
			const el = h('input', {...comum, type: 'date', value: vazio ? '' : valor});
			return {el, ler: () => el.value};
		}
		case 'escolha': {
			const el = h('select', comum, (!campo.obrigatorio || vazio) && h('option', {value: ''}, 'Escolha…'), campo.opcoes.map((o) => h('option', {value: o.valor, selected: o.valor === valor}, o.rotulo)));
			return {el, ler: () => el.value || null};
		}
		case 'ligacao': {
			const el = h('select', comum, (!campo.obrigatorio || vazio) && h('option', {value: ''}, 'Escolha…'), opcoesDeLigacao[id].map((o) => h('option', {value: String(o.id), selected: o.id === valor}, o.titulo)));
			return {el, ler: () => (el.value ? Number(el.value) : null)};
		}
		case 'sim-nao': {
			const el = h('input', {...comum, class: 'campo__caixa', type: 'checkbox', checked: Boolean(valor)});
			return {el, ler: () => el.checked};
		}
		default: {
			const tipo = {email: 'email', telefone: 'tel'}[campo.tipo] ?? 'text';
			const el = h('input', {...comum, type: tipo, value: vazio ? '' : valor, autocomplete: 'off', ...(campo.tipo === 'telefone' ? {inputmode: 'tel'} : {})});
			return {el, ler: () => el.value};
		}
	}
};

const telaFormulario = async (entidade, id) => {
	marcarMenu(entidade.id);
	const novo = id === 'novo';
	const registro = novo ? {} : (await api(`e/${entidade.id}/${id}`)).registro;
	const opcoesDeLigacao = {};
	for (const [idCampo, campo] of Object.entries(entidade.campos)) if (campo.tipo === 'ligacao') opcoesDeLigacao[idCampo] = (await api(`e/${campo.para}/opcoes`)).itens;

	const entradas = {};
	const erros = {};
	const resumo = h('p', {class: 'faixa faixa--erro', role: 'alert', hidden: ''});
	const linhas = Object.entries(entidade.campos).map(([idCampo, campo]) => {
		const valorInicial = novo ? (campo.padrao === 'hoje' ? new Date().toLocaleDateString('sv-SE') : (campo.padrao ?? null)) : registro[idCampo];
		const entrada = entradaDe(idCampo, campo, valorInicial, opcoesDeLigacao);
		entradas[idCampo] = entrada;
		erros[idCampo] = h('p', {class: 'campo__erro', id: `erro-${idCampo}`});
		const rotulo = h('label', {for: `campo-${idCampo}`}, campo.rotulo, campo.obrigatorio && campo.tipo !== 'sim-nao' && h('span', {class: 'campo__obrigatorio'}, ' (obrigatório)'));
		const semLista = campo.tipo === 'ligacao' && !opcoesDeLigacao[idCampo].length;
		const alvo = campo.tipo === 'ligacao' ? modelo.entidades[campo.para] : null;
		return h(
			'div',
			{class: `campo${campo.tipo === 'sim-nao' ? ' campo--caixa' : ''}${campo.tipo === 'texto-longo' ? ' campo--largo' : ''}`},
			campo.tipo === 'sim-nao' ? [entrada.el, rotulo] : [rotulo, entrada.el],
			campo.ajuda && h('p', {class: 'campo__ajuda', id: `ajuda-${idCampo}`}, campo.ajuda),
			semLista && h('p', {class: 'campo__ajuda'}, `Ainda não há ${alvo.nome.toLowerCase()}. `, h('a', {href: `#/e/${alvo.id}/novo`}, `Cadastrar ${artigo(alvo, 'o primeiro', 'a primeira')}`)),
			erros[idCampo],
		);
	});

	const botaoSalvar = h('button', {class: 'botao', type: 'submit'}, 'Salvar');
	const salvar = async (evento) => {
		evento.preventDefault();
		botaoSalvar.disabled = true;
		const corpo = Object.fromEntries(Object.entries(entradas).map(([idCampo, entrada]) => [idCampo, entrada.ler()]));
		try {
			await api(novo ? `e/${entidade.id}` : `e/${entidade.id}/${id}`, {metodo: novo ? 'POST' : 'PUT', corpo});
			avisar(`${maiuscula(entidade.singular)} ${artigo(entidade, 'salvo', 'salva')}.`);
			location.hash = `#/e/${entidade.id}`;
		} catch (e) {
			botaoSalvar.disabled = false;
			let primeiro = null;
			for (const [idCampo, el] of Object.entries(erros)) {
				const mensagem = e.erros?.[idCampo] ?? '';
				el.textContent = mensagem;
				const entrada = document.getElementById(`campo-${idCampo}`);
				if (mensagem) {
					entrada.setAttribute('aria-invalid', 'true');
					primeiro ??= entrada;
				} else entrada.removeAttribute('aria-invalid');
			}
			resumo.textContent = e.mensagem;
			resumo.hidden = false;
			(primeiro ?? resumo).focus?.();
			if (!primeiro) resumo.scrollIntoView({block: 'center'});
		}
	};
	const apagar = async () => {
		const nome = registro[entidade.titulo] ?? `#${id}`;
		if (!(await confirmar(`Apagar ${artigo(entidade, 'o', 'a')} ${entidade.singular} "${nome}"? Isso não tem volta.`, 'Apagar'))) return;
		try {
			await api(`e/${entidade.id}/${id}`, {metodo: 'DELETE'});
			avisar(`${maiuscula(entidade.singular)} ${artigo(entidade, 'apagado', 'apagada')}.`);
			location.hash = `#/e/${entidade.id}`;
		} catch (e) {
			avisar(e.mensagem, 'erro');
		}
	};

	const calculados = novo ? [] : Object.entries(entidade.calculados);
	const titulo = novo ? `${artigo(entidade, 'Novo', 'Nova')} ${entidade.singular}` : (registro[entidade.titulo] ?? `${maiuscula(entidade.singular)} #${id}`);
	mostrar(
		titulo,
		h('nav', {class: 'trilha', 'aria-label': 'Onde você está'}, h('a', {href: `#/e/${entidade.id}`}, `← ${entidade.nome}`)),
		h('header', {class: 'cabeca'}, h('h1', {tabindex: '-1'}, titulo)),
		h(
			'form',
			{class: 'formulario', novalidate: '', onsubmit: salvar},
			resumo,
			h('div', {class: 'formulario__campos'}, linhas),
			calculados.length > 0 && h('dl', {class: 'calculados'}, calculados.map(([idCampo, campo]) => h('div', {}, h('dt', {}, campo.rotulo), h('dd', {}, celula(campo, registro[idCampo], {}))))),
			h('div', {class: 'formulario__acoes'}, botaoSalvar, h('a', {class: 'botao botao--vazado', href: `#/e/${entidade.id}`}, 'Cancelar'), !novo && h('button', {class: 'botao botao--perigo-vazado formulario__apagar', type: 'button', onclick: apagar}, 'Apagar')),
			!novo && h('p', {class: 'formulario__nota'}, `Criado em ${escreverData(registro.criadoEm.slice(0, 10))}, alterado em ${escreverData(registro.atualizadoEm.slice(0, 10))}.`),
		),
	);
};

// ---------- Roteador ----------

const naoAchei = (mensagem) => mostrar('Não encontrado', h('div', {class: 'comeco'}, h('h1', {tabindex: '-1'}, 'Não encontrei esta tela'), h('p', {}, mensagem ?? 'O endereço não existe neste sistema.'), h('a', {class: 'botao', href: '#/'}, 'Ir para o painel')));

let pedido = 0;
const navegar = async () => {
	const meuPedido = ++pedido;
	const {partes, consulta} = lerRota();
	try {
		if (!partes.length) await telaPainel();
		else if (partes[0] === 'e' && modelo.entidades[partes[1]]) {
			const entidade = modelo.entidades[partes[1]];
			if (partes.length === 2) await telaLista(entidade, consulta);
			else if (partes.length === 3 && (partes[2] === 'novo' || /^\d+$/.test(partes[2]))) await telaFormulario(entidade, partes[2]);
			else naoAchei();
		} else naoAchei();
	} catch (e) {
		if (meuPedido !== pedido) return;
		if (e.status === 404) naoAchei(e.mensagem);
		else mostrar('Erro', h('div', {class: 'comeco'}, h('h1', {tabindex: '-1'}, 'Não consegui abrir esta tela'), h('p', {}, e.mensagem ?? String(e)), h('button', {class: 'botao', type: 'button', onclick: () => location.reload()}, 'Tentar de novo')));
		if (!e.status && !e.mensagem) console.error(e);
	}
	// o título da tela recebe o foco: quem usa teclado ou leitor de tela sabe que a tela mudou
	if (meuPedido === pedido) miolo.querySelector('h1')?.focus({preventScroll: true});
};

// ---------- Início ----------

document.getElementById('trocar-tema').addEventListener('click', () => {
	const raiz = document.documentElement;
	const atual = raiz.dataset.tema || (matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro');
	const novo = atual === 'escuro' ? 'claro' : 'escuro';
	raiz.dataset.tema = novo;
	try {
		localStorage.setItem('tema', novo);
	} catch {
		// navegação anônima: vale só para esta visita
	}
});

try {
	modelo = await api('modelo');
	trocar(document.getElementById('menu'), h('a', {href: '#/', 'data-rota': 'painel'}, 'Painel'), Object.values(modelo.entidades).map((e) => h('a', {href: `#/e/${e.id}`, 'data-rota': e.id}, e.nome)));
	window.addEventListener('hashchange', navegar);
	await navegar();
} catch (e) {
	trocar(miolo, h('div', {class: 'comeco'}, h('h1', {}, 'O sistema não abriu'), h('p', {}, e.mensagem ?? String(e))));
}
