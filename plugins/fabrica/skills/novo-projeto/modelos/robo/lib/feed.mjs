// Leitor de "feeds" (as listas de novidades que sites, blogs e canais do YouTube publicam em RSS ou Atom).
// Sem dependência: lê o suficiente para saber o que saiu, quando e onde. Não é um leitor de XML completo.

const ENTIDADES = {amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' '};

/** Tira as marcas de CDATA e troca &amp; e parecidos pelo caractere de verdade. */
export const limpar = (texto = '') =>
	texto
		.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
		.replace(/<[^>]+>/g, '')
		.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (tudo, codigo) => {
			if (codigo[0] !== '#') return ENTIDADES[codigo.toLowerCase()] ?? tudo;
			const numero = codigo[1].toLowerCase() === 'x' ? parseInt(codigo.slice(2), 16) : Number(codigo.slice(1));
			return Number.isFinite(numero) ? String.fromCodePoint(numero) : tudo;
		})
		.replace(/\s+/g, ' ')
		.trim();

const tag = (bloco, nome) => bloco.match(new RegExp(`<${nome}(?:\\s[^>]*)?>([\\s\\S]*?)</${nome}>`, 'i'))?.[1];
const atributo = (bloco, nome, atr) => bloco.match(new RegExp(`<${nome}\\b[^>]*\\b${atr}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1];

/** Data do feed (RFC 822 ou ISO) → "AAAA-MM-DDTHH:MM:SSZ". Devolve null se não der para entender. */
const lerData = (texto) => {
	const d = new Date(limpar(texto ?? ''));
	return Number.isNaN(d.getTime()) ? null : d.toISOString().replace(/\.\d{3}Z$/, 'Z');
};

/**
 * Lê um feed RSS 2.0 ou Atom. Devolve {titulo, itens: [{id, titulo, link, data, autor}]}, do mais novo para o mais
 * antigo. Lança erro se o texto não for um feed (página de erro, HTML de login).
 */
export const lerFeed = (xml) => {
	if (!/<(rss|feed|rdf:RDF)\b/i.test(xml)) throw new Error(`Isto não é um feed (começa com "${xml.slice(0, 60).replace(/\s+/g, ' ')}"). O endereço está certo?`);
	const atom = /<feed\b/i.test(xml);
	const blocos = [...xml.matchAll(atom ? /<entry\b[\s\S]*?<\/entry>/gi : /<item\b[\s\S]*?<\/item>/gi)].map((m) => m[0]);
	const cabeca = blocos.length ? xml.slice(0, xml.indexOf(blocos[0])) : xml;
	const itens = blocos.map((bloco) => {
		const link = atom ? (bloco.match(/<link\b(?=[^>]*\brel\s*=\s*["']alternate["'])[^>]*\bhref\s*=\s*["']([^"']*)["']/i)?.[1] ?? atributo(bloco, 'link', 'href')) : limpar(tag(bloco, 'link'));
		const id = limpar(tag(bloco, atom ? 'id' : 'guid')) || link;
		return {
			id,
			titulo: limpar(tag(bloco, 'title')) || '(sem título)',
			link: limpar(link ?? ''),
			data: lerData(tag(bloco, atom ? 'published' : 'pubDate') ?? tag(bloco, atom ? 'updated' : 'dc:date')),
			autor: limpar(tag(tag(bloco, 'author') ?? '', 'name') ?? tag(bloco, 'dc:creator') ?? tag(bloco, 'author') ?? ''),
		};
	});
	itens.sort((a, b) => String(b.data ?? '').localeCompare(String(a.data ?? '')));
	return {titulo: limpar(tag(cabeca, 'title')), itens: itens.filter((i) => i.id)};
};
