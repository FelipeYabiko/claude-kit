// Passo 1: buscar a lista de publicações de cada fonte do config.json.
// Um passo recebe a saída do passo anterior (`entrada`) e o `ctx` com as ferramentas do robô:
//   ctx.config · ctx.rede.buscarTexto(endereço) e buscarJson · ctx.memoria.ler/guardar · ctx.escrever(arquivo, texto)
//   ctx.acrescentar · ctx.lerArquivo · ctx.segredo('NOME') · ctx.registro('texto') · ctx.hoje · ctx.ensaio
// Nunca use `fetch` nem `fs` direto num passo: é o ctx que garante o modo ensaio, os testes sem internet e o registro.
import {lerFeed} from '../lib/feed.mjs';

export const descricao = 'buscar as publicações de cada fonte';

export const rodar = async (_entrada, ctx) => {
	const fontes = [];
	const falhas = [];
	for (const fonte of ctx.config.fontes) {
		try {
			const feed = lerFeed(await ctx.rede.buscarTexto(fonte.endereco));
			const itens = feed.itens.slice(0, ctx.config.maximoPorFonte ?? 15);
			fontes.push({nome: fonte.nome, endereco: fonte.endereco, itens});
			ctx.registro(`  ${fonte.nome}: ${itens.length} publicação(ões) na lista`);
		} catch (e) {
			// uma fonte fora do ar não derruba as outras; ela aparece no relatório como falha
			falhas.push({nome: fonte.nome, motivo: e.message});
			ctx.registro(`  ${fonte.nome}: FALHOU (${e.message})`);
		}
	}
	if (ctx.config.fontes.length && !fontes.length) throw new Error(`nenhuma das ${ctx.config.fontes.length} fonte(s) respondeu. A primeira falha: ${falhas[0].motivo}`);
	return {fontes, falhas};
};
