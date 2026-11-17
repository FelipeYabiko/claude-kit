// Onde os dados moram: um arquivo só (dados/banco.json), legível, fácil de copiar para o pendrive. Serve bem para
// uso pessoal e de equipe pequena (dezenas de milhares de registros). Cada gravação escreve num arquivo provisório e
// troca de uma vez, para a luz acabar no meio e o arquivo não ficar pela metade. Uma cópia por dia fica em
// dados/copias/. Quem confere os dados é validacao.mjs; aqui só se guarda.
import fs from 'node:fs';
import path from 'node:path';

const VERSAO = 1;
const COPIAS_GUARDADAS = 30;

const dia = (agora) => `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;

/**
 * Abre (ou cria) o banco na pasta. `pasta: null` deixa tudo só na memória (testes e folha de telas).
 * Devolve as operações; todas devolvem cópias, para ninguém mudar o que está guardado sem passar por `atualizar`.
 */
export const abrirBanco = ({pasta, entidades, agora = () => new Date()}) => {
	const arquivo = pasta ? path.join(pasta, 'banco.json') : null;
	let dados = {versao: VERSAO, entidades: {}};
	if (arquivo && fs.existsSync(arquivo)) {
		try {
			dados = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
		} catch (e) {
			// nunca seguir com banco vazio por cima de um arquivo estragado: a próxima gravação apagaria tudo
			throw new Error(`O arquivo de dados (${arquivo}) está estragado e não foi alterado. Há cópias diárias em ${path.join(pasta, 'copias')}: copie a mais recente por cima dele. Detalhe: ${e.message}`);
		}
		const pastaCopias = path.join(pasta, 'copias');
		const copia = path.join(pastaCopias, `banco-${dia(agora())}.json`);
		if (!fs.existsSync(copia)) {
			fs.mkdirSync(pastaCopias, {recursive: true});
			fs.copyFileSync(arquivo, copia);
			const antigas = fs.readdirSync(pastaCopias).filter((f) => /^banco-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
			for (const velha of antigas.slice(0, Math.max(0, antigas.length - COPIAS_GUARDADAS))) fs.rmSync(path.join(pastaCopias, velha));
		}
	}
	for (const id of entidades) dados.entidades[id] ??= {proximo: 1, itens: []};

	const gravar = () => {
		if (!arquivo) return;
		fs.mkdirSync(pasta, {recursive: true});
		const provisorio = `${arquivo}.gravando`;
		fs.writeFileSync(provisorio, JSON.stringify(dados, null, '\t'));
		fs.renameSync(provisorio, arquivo);
	};
	const tabela = (entidade) => {
		const t = dados.entidades[entidade];
		if (!t) throw new Error(`Cadastro "${entidade}" não existe no banco.`);
		return t;
	};
	const copiar = (registro) => (registro ? structuredClone(registro) : null);

	return {
		listar: (entidade) => tabela(entidade).itens.map(copiar),
		pegar: (entidade, id) => copiar(tabela(entidade).itens.find((r) => r.id === id)),
		criar: (entidade, valores) => {
			const t = tabela(entidade);
			const momento = agora().toISOString();
			const registro = {...valores, id: t.proximo++, criadoEm: momento, atualizadoEm: momento};
			t.itens.push(registro);
			gravar();
			return copiar(registro);
		},
		atualizar: (entidade, id, valores) => {
			const t = tabela(entidade);
			const i = t.itens.findIndex((r) => r.id === id);
			if (i < 0) return null;
			// campos que saíram do modelo continuam guardados: tirar um campo da tela não pode apagar o que foi digitado
			t.itens[i] = {...t.itens[i], ...valores, id, criadoEm: t.itens[i].criadoEm, atualizadoEm: agora().toISOString()};
			gravar();
			return copiar(t.itens[i]);
		},
		apagar: (entidade, id) => {
			const t = tabela(entidade);
			const i = t.itens.findIndex((r) => r.id === id);
			if (i < 0) return false;
			t.itens.splice(i, 1);
			gravar();
			return true;
		},
		tudo: () => structuredClone(dados),
		vazio: () => Object.values(dados.entidades).every((t) => !t.itens.length),
	};
};
