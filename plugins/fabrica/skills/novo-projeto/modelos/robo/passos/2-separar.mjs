// Passo 2: separar o que é novidade, comparando com o que o robô já viu nas rodadas anteriores (a memória).
export const descricao = 'separar o que é novo desde a última rodada';

/** Quantos ids guardar por fonte: o bastante para não repetir aviso, sem a memória crescer para sempre. */
const MAXIMO_NA_MEMORIA = 300;

export const rodar = async ({fontes, falhas}, ctx) => {
	const vistos = ctx.memoria.ler('vistos', {});
	const novidades = [];
	for (const fonte of fontes) {
		const jaVistos = vistos[fonte.endereco];
		const novos = jaVistos ? fonte.itens.filter((item) => !jaVistos.includes(item.id)) : fonte.itens.slice(0, ctx.config.naPrimeiraVez ?? 3);
		// primeira vez de uma fonte: mostra só as mais recentes (senão o primeiro relatório vira uma enxurrada)
		if (!jaVistos) ctx.registro(`  ${fonte.nome}: primeira vez, mostrando só as ${novos.length} mais recentes`);
		else ctx.registro(`  ${fonte.nome}: ${novos.length} novidade(s)`);
		novidades.push(...novos.map((item) => ({...item, fonte: fonte.nome})));
		vistos[fonte.endereco] = [...new Set([...fonte.itens.map((item) => item.id), ...(jaVistos ?? [])])].slice(0, MAXIMO_NA_MEMORIA);
	}
	ctx.memoria.guardar('vistos', vistos);
	novidades.sort((a, b) => String(b.data ?? '').localeCompare(String(a.data ?? '')));
	return {novidades, falhas, fontes: fontes.map((f) => f.nome)};
};
