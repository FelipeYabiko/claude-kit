// Diz à folha de telas quais são as telas do sistema: sobe o sistema com os dados de exemplo (só na memória, sem
// tocar em dados/) e lista o painel, a lista, o formulário novo e um registro aberto de cada cadastro.
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {semear} from '../exemplos/semente.mjs';
import {modelo} from '../modelo.mjs';
import {hojeIso} from '../motor/formato.mjs';
import {iniciar} from '../motor/http.mjs';
import {regras} from '../regras.mjs';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const preparar = async () => {
	const sistema = await iniciar({modelo, regras, pastaDados: null, pastaTelas: path.join(raiz, 'telas'), porta: 0});
	const erros = await semear(sistema.api, hojeIso());
	if (erros.length) console.log(`Atenção: os dados de exemplo (exemplos/semente.mjs) têm problema e as telas vão sair vazias:\n${erros.join('\n')}`);
	const telas = [{nome: 'painel', caminho: '/#/', esperar: 'h1'}];
	for (const entidade of Object.values(sistema.modelo.entidades)) {
		const primeiro = sistema.banco.listar(entidade.id)[0];
		telas.push({nome: `${entidade.id}-lista`, caminho: `/#/e/${entidade.id}`, esperar: '.resultado > *'});
		telas.push({nome: `${entidade.id}-novo`, caminho: `/#/e/${entidade.id}/novo`, esperar: 'form'});
		if (primeiro) telas.push({nome: `${entidade.id}-aberto`, caminho: `/#/e/${entidade.id}/${primeiro.id}`, esperar: 'form'});
	}
	return {endereco: sistema.endereco, telas, fechar: () => sistema.servidor.close()};
};
