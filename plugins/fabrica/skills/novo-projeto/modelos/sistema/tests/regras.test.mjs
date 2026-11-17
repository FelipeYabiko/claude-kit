// Testes das regras do negócio (regras.mjs). Cada regra da seção "Regras" da FICHA.md tem aqui um caso que passa e
// um que quebra. Regra nova: escreva o teste primeiro, veja falhar, depois escreva a regra.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {regras} from '../regras.mjs';

const HOJE = '2026-06-15';

test('projeto pago precisa do valor', () => {
	assert.deepEqual(regras.projetos.validar({situacao: 'pago', valor: 90000}), {});
	assert.deepEqual(regras.projetos.validar({situacao: 'pago', valor: null}), {valor: 'Projeto pago precisa do valor.'});
	assert.deepEqual(regras.projetos.validar({situacao: 'orcamento', valor: null}), {}, 'orçamento ainda pode estar sem valor');
});

test('atrasado: prazo vencido e ainda não entregue', () => {
	const atrasado = (projeto) => regras.projetos.calculados.atrasado.calcular(projeto, {hoje: HOJE});
	assert.equal(atrasado({situacao: 'andamento', prazo: '2026-06-14'}), true);
	assert.equal(atrasado({situacao: 'andamento', prazo: '2026-06-15'}), false, 'no dia do prazo ainda não atrasou');
	assert.equal(atrasado({situacao: 'entregue', prazo: '2026-06-01'}), false);
	assert.equal(atrasado({situacao: 'pago', prazo: '2026-06-01'}), false);
	assert.equal(atrasado({situacao: 'andamento', prazo: null}), false, 'sem prazo não atrasa');
});
