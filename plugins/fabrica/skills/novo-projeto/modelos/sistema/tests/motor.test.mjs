// Testes do motor (o que a fábrica mantém): formatos, conferência do modelo e dos dados, banco, consultas, API e as
// travas do servidor. Usam um modelo próprio, pequeno, para não quebrar quando os cadastros do projeto mudarem.
// Não edite: `criar.mjs --atualizar` traz a versão nova. Os testes do projeto ficam em regras.test.mjs e modelo.test.mjs.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {test} from 'node:test';
import {criarApi} from '../motor/api.mjs';
import {abrirBanco} from '../motor/banco.mjs';
import {casa, consultar, resumir} from '../motor/consultas.mjs';
import {montarCsv} from '../motor/csv.mjs';
import {escrever, escreverDinheiro, lerData, lerDinheiro, lerNumero, paraBusca} from '../motor/formato.mjs';
import {iniciar} from '../motor/http.mjs';
import {normalizarModelo, validarModelo} from '../motor/modelo.mjs';
import {validarRegistro} from '../motor/validacao.mjs';

const bruto = {
	nome: 'Teste',
	entidades: {
		pessoas: {nome: 'Pessoas', singular: 'pessoa', genero: 'f', campos: {nome: {rotulo: 'Nome', tipo: 'texto', obrigatorio: true, unico: true}, email: {rotulo: 'E-mail', tipo: 'email'}}},
		contas: {
			nome: 'Contas',
			singular: 'conta',
			genero: 'f',
			titulo: 'descricao',
			campos: {
				descricao: {rotulo: 'Descrição', tipo: 'texto', obrigatorio: true},
				pessoa: {rotulo: 'Pessoa', tipo: 'ligacao', para: 'pessoas'},
				valor: {rotulo: 'Valor', tipo: 'dinheiro', obrigatorio: true},
				vence: {rotulo: 'Vence em', tipo: 'data', padrao: 'hoje'},
				tipo: {rotulo: 'Tipo', tipo: 'escolha', opcoes: ['fixa', {valor: 'variavel', rotulo: 'Variável'}], padrao: 'fixa'},
				paga: {rotulo: 'Paga', tipo: 'sim-nao'},
				parcelas: {rotulo: 'Parcelas', tipo: 'numero', inteiro: true, min: 1, max: 48},
				site: {rotulo: 'Site', tipo: 'link'},
				fone: {rotulo: 'Telefone', tipo: 'telefone'},
				nota: {rotulo: 'Nota', tipo: 'texto-longo'},
			},
			filtros: ['tipo', 'paga', 'pessoa', 'vencida'],
		},
	},
	painel: [
		{tipo: 'contagem', rotulo: 'Em aberto', entidade: 'contas', onde: {paga: false}},
		{tipo: 'soma', rotulo: 'Total em aberto', entidade: 'contas', campo: 'valor', onde: {paga: false}},
		{tipo: 'lista', rotulo: 'Próximas', entidade: 'contas', onde: {vence: {min: 'hoje'}}, ordem: {campo: 'vence', direcao: 'asc'}, limite: 2},
		{tipo: 'grupos', rotulo: 'Por tipo', entidade: 'contas', por: 'tipo', soma: 'valor'},
	],
};
const regras = {
	contas: {
		validar: (c) => (c.tipo === 'variavel' && c.parcelas > 12 ? {parcelas: 'Conta variável tem no máximo 12 parcelas.'} : {}),
		calculados: {vencida: {rotulo: 'Vencida', tipo: 'sim-nao', calcular: (c, {hoje}) => !c.paga && Boolean(c.vence) && c.vence < hoje}},
		aoSalvar: (c) => ({...c, descricao: c.descricao.toUpperCase()}),
	},
};
const HOJE = '2026-06-15';
const agora = () => new Date('2026-06-15T12:00:00');
const montar = (pasta = null) => {
	const modelo = normalizarModelo(bruto, regras);
	const banco = abrirBanco({pasta, entidades: Object.keys(modelo.entidades), agora});
	return {modelo, banco, api: criarApi({modelo, regras, banco, agora})};
};
const pasta = () => fs.mkdtempSync(path.join(os.tmpdir(), 'motor-'));

test('formato: números e dinheiro do jeito brasileiro', () => {
	assert.equal(lerNumero('1.234,56'), 1234.56);
	assert.equal(lerNumero('1234.56'), 1234.56);
	assert.equal(lerNumero('1.234'), 1234);
	assert.equal(lerNumero('12,5'), 12.5);
	assert.equal(lerNumero('doze'), null);
	assert.equal(lerNumero(''), null);
	assert.equal(lerDinheiro('R$ 1.250,00'), 125000);
	assert.equal(lerDinheiro('0,1'), 10);
	assert.equal(lerDinheiro(1999), 1999);
	assert.equal(lerDinheiro(19.99), null, 'número quebrado não é centavo');
	assert.equal(escreverDinheiro(123456), 'R$ 1.234,56');
	assert.equal(escreverDinheiro(-50), '-R$ 0,50');
	assert.equal(escreverDinheiro(0), 'R$ 0,00');
});

test('formato: datas que existem e que não existem', () => {
	assert.equal(lerData('31/12/2026'), '2026-12-31');
	assert.equal(lerData('2026-02-28'), '2026-02-28');
	assert.equal(lerData('30/02/2026'), null);
	assert.equal(lerData('2026-13-01'), null);
	assert.equal(paraBusca('  São João  '), 'sao joao');
});

test('modelo: o de exemplo deste teste é válido', () => {
	assert.deepEqual(validarModelo(bruto, regras), []);
});

test('modelo: cada erro comum é apontado com o nome do cadastro e do campo', () => {
	const erros = (mudar) => {
		const copia = structuredClone(bruto);
		mudar(copia);
		return validarModelo(copia, regras).join('\n');
	};
	assert.match(erros((m) => (m.entidades.contas.campos.valor.tipo = 'moeda')), /contas.*valor.*tipo "moeda" não existe/);
	assert.match(erros((m) => (m.entidades.contas.campos.pessoa.para = 'gente')), /contas.*pessoa.*`para`/);
	assert.match(erros((m) => delete m.entidades.contas.campos.tipo.opcoes), /precisa de `opcoes`/);
	assert.match(erros((m) => (m.entidades.contas.campos.tipo.padrao = 'outra')), /`padrao` "outra" não está nas opções/);
	assert.match(erros((m) => (m.entidades.contas.campos.id = {rotulo: 'Id', tipo: 'texto'})), /usado pelo próprio sistema/);
	assert.match(erros((m) => (m.entidades['Contas Pagas'] = m.entidades.contas)), /só minúsculas/);
	assert.match(erros((m) => (m.entidades.contas.campos['data-fim'] = {rotulo: 'Fim', tipo: 'data'})), /começa com minúscula/);
	assert.match(erros((m) => (m.entidades.contas.lista = ['nada'])), /`lista` cita "nada"/);
	assert.match(erros((m) => (m.entidades.contas.filtros = ['descricao'])), /só dá para filtrar/);
	assert.match(erros((m) => (m.entidades.contas.titulo = 'x')), /`titulo` aponta para "x"/);
	assert.match(erros((m) => (m.painel[1].campo = 'descricao')), /soma precisa ser um campo de numero ou dinheiro/);
	assert.match(erros((m) => (m.painel[0].onde = {sumiu: 1})), /`onde` cita "sumiu"/);
	assert.match(erros((m) => (m.painel[0].tipo = 'pizza')), /tipo "pizza" não existe/);
	assert.match(erros((m) => delete m.entidades.pessoas.singular), /pessoas.*falta `singular`/);
	assert.match(validarModelo({nome: 'x', entidades: {}}).join('\n'), /pelo menos um cadastro/);
});

test('validação: preenche padrões, arruma formatos e recusa o que está errado', () => {
	const {modelo, banco} = montar();
	const contas = modelo.entidades.contas;
	const certo = validarRegistro(contas, {descricao: '  Luz   de  junho ', valor: '150,90', site: 'exemplo.com.br', paga: 'sim'}, {banco, hoje: HOJE});
	assert.equal(certo.ok, true);
	assert.deepEqual(certo.valor, {descricao: 'Luz de junho', pessoa: null, valor: 15090, vence: HOJE, tipo: 'fixa', paga: true, parcelas: null, site: 'https://exemplo.com.br', fone: null, nota: null});
	const errado = validarRegistro(contas, {descricao: '', valor: 'muito', vence: '31/02/2026', tipo: 'outra', parcelas: '2,5', site: 'nao é site', fone: '123', pessoa: 99}, {banco, hoje: HOJE});
	assert.equal(errado.ok, false);
	assert.deepEqual(Object.keys(errado.erros).sort(), ['descricao', 'fone', 'parcelas', 'pessoa', 'site', 'tipo', 'valor', 'vence']);
	assert.equal(errado.erros.descricao, 'Preencha descrição.');
	assert.match(validarRegistro(contas, {descricao: 'x', valor: '-5'}, {banco, hoje: HOJE}).erros.valor, /negativo/);
	assert.match(validarRegistro(contas, {descricao: 'x', valor: '5', parcelas: '60'}, {banco, hoje: HOJE}).erros.parcelas, /máximo é 48/);
	assert.match(validarRegistro(contas, {descricao: 'x'.repeat(201), valor: '5'}, {banco, hoje: HOJE}).erros.descricao, /No máximo 200/);
});

test('validação: único ignora maiúsculas e acentos, e não briga com o próprio registro', () => {
	const {modelo, banco} = montar();
	const pessoas = modelo.entidades.pessoas;
	const ana = banco.criar('pessoas', validarRegistro(pessoas, {nome: 'Ana Júlia'}, {banco}).valor);
	assert.match(validarRegistro(pessoas, {nome: 'ana julia'}, {banco}).erros.nome, /Já existe uma pessoa/);
	assert.equal(validarRegistro(pessoas, {nome: 'Ana Júlia', email: 'ANA@Exemplo.com'}, {banco, anterior: ana}).ok, true);
});

test('validação: regras do projeto rodam depois dos campos, e edição parcial mantém o resto', () => {
	const {modelo, banco} = montar();
	const contas = modelo.entidades.contas;
	assert.equal(validarRegistro(contas, {descricao: 'x', valor: '1', tipo: 'variavel', parcelas: 24}, {banco, regras, hoje: HOJE}).erros.parcelas, 'Conta variável tem no máximo 12 parcelas.');
	const criada = banco.criar('contas', validarRegistro(contas, {descricao: 'luz', valor: '10'}, {banco, regras, hoje: HOJE}).valor);
	assert.equal(criada.descricao, 'LUZ', 'aoSalvar muda o registro');
	const editada = validarRegistro(contas, {paga: true}, {banco, regras, anterior: criada, hoje: HOJE});
	assert.equal(editada.ok, true);
	assert.equal(editada.valor.valor, 1000);
	assert.equal(editada.valor.paga, true);
});

test('banco: grava de verdade, guarda cópia do dia e não perde campo que saiu do modelo', () => {
	const dir = pasta();
	const a = abrirBanco({pasta: dir, entidades: ['pessoas'], agora});
	const ana = a.criar('pessoas', {nome: 'Ana', apelido: 'Aninha'});
	assert.equal(ana.id, 1);
	a.atualizar('pessoas', 1, {nome: 'Ana Maria'});
	const b = abrirBanco({pasta: dir, entidades: ['pessoas', 'contas'], agora: () => new Date('2026-06-16T09:00:00')});
	assert.deepEqual(b.listar('pessoas').map((p) => [p.id, p.nome, p.apelido]), [[1, 'Ana Maria', 'Aninha']]);
	assert.deepEqual(b.listar('contas'), [], 'cadastro novo no modelo começa vazio');
	assert.ok(fs.existsSync(path.join(dir, 'copias', 'banco-2026-06-16.json')), 'cópia do dia');
	assert.equal(b.criar('pessoas', {nome: 'Bia'}).id, 2);
	assert.equal(b.apagar('pessoas', 1), true);
	assert.equal(b.criar('pessoas', {nome: 'Caio'}).id, 3, 'número apagado não é reaproveitado');
	const lida = b.pegar('pessoas', 2);
	lida.nome = 'mexi';
	assert.equal(b.pegar('pessoas', 2).nome, 'Bia', 'o que sai do banco é cópia');
	fs.rmSync(dir, {recursive: true});
});

test('banco: arquivo estragado não é sobrescrito', () => {
	const dir = pasta();
	fs.writeFileSync(path.join(dir, 'banco.json'), '{"versao": 1, "entidades": {');
	assert.throws(() => abrirBanco({pasta: dir, entidades: ['pessoas']}), /está estragado e não foi alterado/);
	assert.equal(fs.readFileSync(path.join(dir, 'banco.json'), 'utf8'), '{"versao": 1, "entidades": {');
	fs.rmSync(dir, {recursive: true});
});

test('consultas: condições do painel (igual, lista, faixas, vazio, hoje)', () => {
	const r = {situacao: 'aberta', valor: 100, vence: '2026-06-10', nota: null};
	assert.equal(casa(r, {situacao: 'aberta'}), true);
	assert.equal(casa(r, {situacao: ['paga', 'aberta']}), true);
	assert.equal(casa(r, {situacao: 'paga'}), false);
	assert.equal(casa(r, {valor: {min: 100, max: 100}}), true);
	assert.equal(casa(r, {valor: {min: 101}}), false);
	assert.equal(casa(r, {vence: {antes: 'hoje'}}, '2026-06-15'), true);
	assert.equal(casa(r, {vence: {depois: 'hoje'}}, '2026-06-15'), false);
	assert.equal(casa(r, {nota: {vazio: true}}), true);
	assert.equal(casa(r, {nota: {min: 1}}), false, 'campo vazio não entra em faixa');
	assert.equal(casa(r, {}), true);
});

const comDados = async () => {
	const s = montar();
	const criar = async (entidade, corpo) => (await s.api({metodo: 'POST', caminho: `/api/e/${entidade}`, corpo})).json.registro;
	const ana = await criar('pessoas', {nome: 'Ana'});
	const beto = await criar('pessoas', {nome: 'Beto'});
	await criar('contas', {descricao: 'Luz', pessoa: ana.id, valor: '150,00', vence: '2026-06-10'});
	await criar('contas', {descricao: 'Água', pessoa: beto.id, valor: '80,00', vence: '2026-06-20', tipo: 'variavel'});
	await criar('contas', {descricao: 'Aluguel', pessoa: ana.id, valor: '1.200,00', vence: '2026-07-05', paga: true});
	await criar('contas', {descricao: 'Internet 10', valor: '99,90', vence: '2026-06-25'});
	await criar('contas', {descricao: 'Internet 9', valor: '99,90', vence: null});
	return {...s, ana, beto};
};
const listar = async (api, consulta) => (await api({metodo: 'GET', caminho: '/api/e/contas', consulta: new URLSearchParams(consulta)})).json;

test('API: lista com busca (sem acento, pelo nome do item ligado), filtros, ordem e páginas', async () => {
	const {api, ana} = await comDados();
	assert.equal((await listar(api, '')).total, 5);
	assert.deepEqual((await listar(api, 'busca=agua')).itens.map((c) => c.descricao), ['ÁGUA']);
	assert.equal((await listar(api, 'busca=ana')).total, 2, 'acha pelo nome da pessoa ligada');
	assert.equal((await listar(api, 'busca=variavel')).total, 1, 'acha pelo rótulo da opção');
	assert.equal((await listar(api, `f.pessoa=${ana.id}`)).total, 2);
	assert.equal((await listar(api, 'f.paga=sim')).total, 1);
	assert.equal((await listar(api, 'f.vencida=sim')).total, 1, 'filtra por campo calculado');
	assert.equal((await listar(api, 'f.tipo=variavel&busca=agua')).total, 1);
	assert.deepEqual((await listar(api, 'ordem=valor&direcao=desc')).itens.map((c) => c.valor), [120000, 15000, 9990, 9990, 8000]);
	assert.deepEqual((await listar(api, 'ordem=vence')).itens.map((c) => c.vence), ['2026-06-10', '2026-06-20', '2026-06-25', '2026-07-05', null], 'vazio vai para o fim');
	assert.deepEqual((await listar(api, 'ordem=descricao')).itens.map((c) => c.descricao), ['ÁGUA', 'ALUGUEL', 'INTERNET 9', 'INTERNET 10', 'LUZ'], 'ordem de dicionário, com número');
	const pagina = await listar(api, 'porPagina=2&pagina=3&ordem=id');
	assert.deepEqual([pagina.itens.length, pagina.pagina, pagina.total], [1, 3, 5]);
	assert.equal((await listar(api, 'pagina=99&porPagina=2')).pagina, 3, 'página além do fim volta para a última');
	assert.equal((await listar(api, '')).ligados.pessoas[ana.id], 'Ana');
});

test('API: cadastrar, abrir, editar e apagar, com as respostas certas', async () => {
	const {api, banco, ana} = await comDados();
	const ruim = await api({metodo: 'POST', caminho: '/api/e/contas', corpo: {descricao: ''}});
	assert.equal(ruim.status, 422);
	assert.deepEqual(Object.keys(ruim.json.erros).sort(), ['descricao', 'valor']);
	const aberta = await api({metodo: 'GET', caminho: '/api/e/contas/1'});
	assert.equal(aberta.json.registro.vencida, true, 'calculado vem junto');
	const editada = await api({metodo: 'PUT', caminho: '/api/e/contas/1', corpo: {paga: true}});
	assert.equal(editada.status, 200);
	assert.equal(editada.json.registro.vencida, false);
	assert.equal((await api({metodo: 'GET', caminho: '/api/e/contas/999'})).status, 404);
	assert.equal((await api({metodo: 'GET', caminho: '/api/e/nada'})).status, 404);
	assert.equal((await api({metodo: 'PUT', caminho: '/api/e/contas/abc', corpo: {}})).status, 404);
	const emUso = await api({metodo: 'DELETE', caminho: `/api/e/pessoas/${ana.id}`});
	assert.equal(emUso.status, 409);
	assert.match(emUso.json.mensagem, /2 contas usam esta pessoa/);
	assert.equal(banco.listar('pessoas').length, 2, 'não apagou');
	assert.equal((await api({metodo: 'DELETE', caminho: '/api/e/contas/5'})).status, 200);
	assert.equal(banco.listar('contas').length, 4);
});

test('API: painel soma, conta, lista e agrupa', async () => {
	const {api} = await comDados();
	const {itens, vazio} = (await api({metodo: 'GET', caminho: '/api/painel'})).json;
	assert.equal(vazio, false);
	assert.equal(itens[0].valor, 4);
	assert.equal(itens[1].valor, 15000 + 8000 + 9990 + 9990);
	assert.deepEqual(itens[2].itens.map((c) => c.descricao), ['ÁGUA', 'INTERNET 10']);
	assert.equal(itens[2].total, 3);
	assert.deepEqual(itens[3].grupos.map((g) => [g.rotulo, g.valor]), [['fixa', 15000 + 120000 + 9990 + 9990], ['Variável', 8000]]);
});

test('API: exportação leva tudo (não só uma página) e opções para os campos de ligação', async () => {
	const {api} = await comDados();
	const csv = await api({metodo: 'GET', caminho: '/api/e/contas/exportar.csv', consulta: new URLSearchParams('ordem=id')});
	assert.equal(csv.tipo, 'text/csv; charset=utf-8');
	const linhas = csv.texto.split('\r\n').filter(Boolean);
	assert.equal(linhas.length, 6);
	assert.equal(linhas[0], '﻿Descrição;Pessoa;Valor;Vence em;Tipo;Paga;Parcelas;Site;Telefone;Nota;Vencida');
	assert.equal(linhas[1], 'LUZ;Ana;R$ 150,00;10/06/2026;fixa;Não;;;;;Sim');
	assert.deepEqual((await api({metodo: 'GET', caminho: '/api/e/pessoas/opcoes'})).json.itens.map((o) => o.titulo), ['Ana', 'Beto']);
	const copia = await api({metodo: 'GET', caminho: '/api/copia'});
	assert.equal(JSON.parse(copia.texto).entidades.contas.itens.length, 5);
});

test('CSV: aspas, ponto e vírgula, quebra de linha e fórmula desarmada', () => {
	const csv = montarCsv(['A', 'B'], [['x;y', 'disse "oi"'], ['=SOMA(A1)', 'linha\nnova'], ['-12,50', '+55 11']]);
	assert.equal(csv, '﻿A;B\r\n"x;y";"disse ""oi"""\r\n\'=SOMA(A1);"linha\nnova"\r\n-12,50;\'+55 11\r\n');
});

test('escrever: cada tipo do jeito que aparece na tela', () => {
	const {modelo} = montar();
	const c = modelo.entidades.contas.campos;
	assert.equal(escrever(c.valor, 15090), 'R$ 150,90');
	assert.equal(escrever(c.vence, '2026-06-10'), '10/06/2026');
	assert.equal(escrever(c.paga, false), 'Não');
	assert.equal(escrever(c.tipo, 'variavel'), 'Variável');
	assert.equal(escrever(c.pessoa, 7, {pessoas: {7: 'Ana'}}), 'Ana');
	assert.equal(escrever(c.pessoa, 8, {}), '#8');
	assert.equal(escrever(c.nota, null), '');
});

test('servidor: entrega as telas, atende a API e recusa quem não é da casa', async () => {
	const telas = pasta();
	fs.writeFileSync(path.join(telas, 'index.html'), '<!doctype html><title>t</title>');
	const {servidor, endereco, porta} = await iniciar({modelo: bruto, regras, pastaDados: null, pastaTelas: telas, porta: 0});
	try {
		const inicio = await fetch(`${endereco}/`);
		assert.equal(inicio.status, 200);
		assert.match(inicio.headers.get('content-security-policy'), /default-src 'self'/);
		assert.equal((await fetch(`${endereco}/formato.mjs`)).status, 200, 'as telas usam os formatos do servidor');
		assert.equal((await fetch(`${endereco}/api/modelo`)).status, 200);
		const postar = (cabecalhos, corpo = '{"nome":"Ana"}') => fetch(`${endereco}/api/e/pessoas`, {method: 'POST', headers: cabecalhos, body: corpo});
		assert.equal((await postar({'content-type': 'application/json'})).status, 201);
		assert.equal((await postar({'content-type': 'text/plain'})).status, 415, 'formulário de outro site não manda JSON');
		assert.equal((await postar({'content-type': 'application/json', origin: 'https://site-estranho.example'})).status, 403);
		assert.equal((await postar({'content-type': 'application/json', origin: `http://localhost:${porta}`}, '{"nome":"Bia"}')).status, 201);
		assert.equal((await postar({'content-type': 'application/json'}, '{quebrado')).status, 400);
		assert.equal((await postar({'content-type': 'application/json'}, '[1,2]')).status, 400);
		assert.equal((await postar({'content-type': 'application/json'}, JSON.stringify({nome: 'x'.repeat(1100000)}))).status, 413);
		// pedido com outro nome de máquina (truque de apontar um site para 127.0.0.1) é recusado
		const estranho = await new Promise((resolve) => {
			import('node:http').then(({default: http}) => http.get({host: '127.0.0.1', port: porta, path: '/api/modelo', headers: {host: 'site-estranho.example'}}, (r) => resolve(r.statusCode)));
		});
		assert.equal(estranho, 403);
		const fuga = await new Promise((resolve) => {
			import('node:http').then(({default: http}) => http.get({host: '127.0.0.1', port: porta, path: '/../motor/banco.mjs', headers: {host: `localhost:${porta}`}}, (r) => resolve(r.statusCode)));
		});
		assert.equal(fuga, 404, 'não entrega arquivo de fora da pasta das telas');
	} finally {
		servidor.close();
		fs.rmSync(telas, {recursive: true});
	}
});

test('servidor: modelo errado não sobe, e diz por quê', async () => {
	await assert.rejects(() => iniciar({modelo: {nome: 'x', entidades: {a: {nome: 'A', campos: {}}}}, pastaDados: null, pastaTelas: '.', porta: 0}), /O modelo\.mjs tem \d+ problema/);
});
