// Testes do modelo deste projeto: o modelo.mjs é válido, os dados de exemplo entram sem erro e cada cadastro abre,
// lista e exporta. Não dependem dos nomes dos cadastros: continuam valendo quando o modelo mudar.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {semear, semente} from '../exemplos/semente.mjs';
import {modelo} from '../modelo.mjs';
import {criarApi} from '../motor/api.mjs';
import {abrirBanco} from '../motor/banco.mjs';
import {hojeIso} from '../motor/formato.mjs';
import {normalizarModelo, validarModelo} from '../motor/modelo.mjs';
import {regras} from '../regras.mjs';

const montar = () => {
	const normal = normalizarModelo(modelo, regras);
	const banco = abrirBanco({pasta: null, entidades: Object.keys(normal.entidades)});
	return {normal, banco, api: criarApi({modelo: normal, regras, banco})};
};

test('o modelo.mjs não tem problema', () => {
	assert.deepEqual(validarModelo(modelo, regras), []);
});

test('os dados de exemplo entram todos, passando pela mesma conferência dos dados de verdade', async () => {
	const {api} = montar();
	assert.deepEqual(await semear(api, hojeIso()), []);
});

test('todo cadastro tem dados de exemplo (é com eles que as telas são fotografadas e aprovadas)', () => {
	const comExemplo = new Set(semente(hojeIso()).map(([entidade]) => entidade));
	const sem = Object.keys(modelo.entidades).filter((id) => !comExemplo.has(id));
	assert.deepEqual(sem, [], `faltam exemplos em exemplos/semente.mjs para: ${sem.join(', ')}`);
});

test('cada cadastro lista, abre, exporta e aparece no painel sem erro', async () => {
	const {normal, banco, api} = montar();
	await semear(api, hojeIso());
	for (const entidade of Object.values(normal.entidades)) {
		const lista = await api({metodo: 'GET', caminho: `/api/e/${entidade.id}`});
		assert.equal(lista.status, 200, entidade.id);
		const primeiro = banco.listar(entidade.id)[0];
		if (primeiro) assert.equal((await api({metodo: 'GET', caminho: `/api/e/${entidade.id}/${primeiro.id}`})).status, 200, entidade.id);
		const csv = await api({metodo: 'GET', caminho: `/api/e/${entidade.id}/exportar.csv`});
		assert.equal(csv.texto.trim().split('\r\n').length, lista.json.total + 1, `exportação de ${entidade.id}`);
	}
	const painel = await api({metodo: 'GET', caminho: '/api/painel'});
	assert.equal(painel.status, 200);
	assert.equal(painel.json.itens.length, normal.painel.length);
});
