// Passo 3: entregar o resultado. Aqui, um relatório para ler (saida/ultimo.md) e uma planilha que vai acumulando
// (saida/historico.csv). É o passo que mais muda de um robô para outro: mandar e-mail, atualizar uma planilha...
export const descricao = 'escrever o relatório e o histórico';

const dataBr = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : 'sem data');
const celula = (texto) => {
	let valor = String(texto ?? '');
	// planilha executa célula que começa com = + - @ : uma aspa simples na frente desarma
	if (/^[=+\-@]/.test(valor)) valor = `'${valor}`;
	return /[";\n]/.test(valor) ? `"${valor.replace(/"/g, '""')}"` : valor;
};

export const rodar = async ({novidades, falhas, fontes}, ctx) => {
	const linhas = [`# Novidades de ${dataBr(ctx.hoje)}`, '', `${novidades.length} novidade(s) em ${fontes.length} fonte(s) acompanhada(s).`, ''];
	for (const fonte of [...new Set(novidades.map((n) => n.fonte))]) {
		linhas.push(`## ${fonte}`, '');
		for (const item of novidades.filter((n) => n.fonte === fonte)) linhas.push(`- ${dataBr(item.data)} · [${item.titulo.replace(/[[\]]/g, '')}](${item.link})`);
		linhas.push('');
	}
	if (!novidades.length) linhas.push('Nada de novo desde a última rodada.', '');
	if (falhas.length) linhas.push('## Fontes que falharam', '', ...falhas.map((f) => `- ${f.nome}: ${f.motivo}`), '');
	ctx.escrever('saida/ultimo.md', linhas.join('\n'));

	if (novidades.length) {
		const cabecalho = ctx.lerArquivo('saida/historico.csv') === null ? '﻿Visto em;Fonte;Publicado em;Título;Link\r\n' : '';
		ctx.acrescentar('saida/historico.csv', cabecalho + novidades.map((n) => [dataBr(ctx.hoje), n.fonte, dataBr(n.data), n.titulo, n.link].map(celula).join(';')).join('\r\n') + '\r\n');
	}
	ctx.registro(`  ${novidades.length} novidade(s)${falhas.length ? `, ${falhas.length} fonte(s) com falha` : ''}. Relatório em saida/ultimo.md`);
	return {novidades: novidades.length, falhas: falhas.length};
};
