// Exportação para planilha (CSV). Ponto e vírgula como separador e marca de UTF-8 no começo: é assim que o Excel
// em português abre direto, com acento certo e sem juntar tudo numa coluna.

const celula = (valor) => {
	let texto = valor === null || valor === undefined ? '' : String(valor);
	// planilha executa célula que começa com = + - @ : uma aspa simples na frente desarma (ataque conhecido de CSV)
	if (/^[=+\-@\t\r]/.test(texto) && !/^-?[\d.,]+$/.test(texto)) texto = `'${texto}`;
	return /[";\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
};

/** Monta o texto do CSV a partir do cabeçalho e das linhas (listas de valores já como texto). */
export const montarCsv = (cabecalho, linhas) => `﻿${[cabecalho, ...linhas].map((linha) => linha.map(celula).join(';')).join('\r\n')}\r\n`;
