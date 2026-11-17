// Ler e escrever valores do jeito brasileiro (R$ 1.234,56 · 31/12/2026 · Sim/Não). Usado pelo servidor e pelas telas:
// um lugar só, para a tela e a exportação nunca discordarem.

const semAcento = (texto) => String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Texto pronto para comparar em busca: minúsculas, sem acento, sem espaço sobrando. */
export const paraBusca = (texto) => semAcento(texto ?? '').toLowerCase().trim();

/** "1.234,56", "1234.56", "1234,5" ou 1234.5 → 1234.56. Devolve null se não for número. */
export const lerNumero = (valor) => {
	if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null;
	if (typeof valor !== 'string') return null;
	let texto = valor.replace(/\s|R\$/g, '');
	if (!texto) return null;
	// com vírgula, o ponto é separador de milhar; sem vírgula, ponto seguido de 3 dígitos também é milhar
	if (texto.includes(',')) texto = texto.replace(/\./g, '').replace(',', '.');
	else if (/^-?\d{1,3}(\.\d{3})+$/.test(texto)) texto = texto.replace(/\./g, '');
	if (!/^-?\d+(\.\d+)?$/.test(texto)) return null;
	return Number(texto);
};

/** Dinheiro é guardado em centavos inteiros (conta com vírgula flutuante erra centavo). "12,50" → 1250. */
export const lerDinheiro = (valor) => {
	if (typeof valor === 'number') return Number.isInteger(valor) ? valor : null;
	const numero = lerNumero(valor);
	return numero === null ? null : Math.round(numero * 100);
};

/** 123456 (centavos) → "R$ 1.234,56". */
export const escreverDinheiro = (centavos) => {
	if (centavos === null || centavos === undefined) return '';
	const negativo = centavos < 0;
	const [inteiro, resto] = (Math.abs(centavos) / 100).toFixed(2).split('.');
	return `${negativo ? '-' : ''}R$ ${inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${resto}`;
};

/** 1234.5 → "1.234,5". */
export const escreverNumero = (numero) => {
	if (numero === null || numero === undefined) return '';
	const [inteiro, resto] = String(numero).split('.');
	return inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (resto ? `,${resto}` : '');
};

const dataExiste = (ano, mes, dia) => {
	const d = new Date(Date.UTC(ano, mes - 1, dia));
	return d.getUTCFullYear() === ano && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
};

/** "2026-12-31" ou "31/12/2026" → "2026-12-31". Devolve null se a data não existir. */
export const lerData = (valor) => {
	if (typeof valor !== 'string') return null;
	const iso = valor.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
	const br = valor.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
	const [ano, mes, dia] = iso ? [iso[1], iso[2], iso[3]].map(Number) : br ? [br[3], br[2], br[1]].map(Number) : [];
	if (!ano || !dataExiste(ano, mes, dia)) return null;
	return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
};

/** "2026-12-31" → "31/12/2026". */
export const escreverData = (iso) => (iso ? iso.split('-').reverse().join('/') : '');

/** A data de hoje no relógio do computador, como "2026-12-31". */
export const hojeIso = (agora = new Date()) => `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;

/** O rótulo de uma opção de escolha (opções já normalizadas: [{valor, rotulo}]). */
export const rotuloDaOpcao = (campo, valor) => campo.opcoes?.find((o) => o.valor === valor)?.rotulo ?? (valor ?? '');

/** O valor de um campo como texto para mostrar (lista, exportação). `ligados` = {entidade: {id: título}}. */
export const escrever = (campo, valor, ligados = {}) => {
	if (valor === null || valor === undefined || valor === '') return '';
	switch (campo.tipo) {
		case 'dinheiro':
			return escreverDinheiro(valor);
		case 'numero':
			return escreverNumero(valor);
		case 'data':
			return escreverData(valor);
		case 'sim-nao':
			return valor ? 'Sim' : 'Não';
		case 'escolha':
			return rotuloDaOpcao(campo, valor);
		case 'ligacao':
			return ligados[campo.para]?.[valor] ?? `#${valor}`;
		default:
			return String(valor);
	}
};
