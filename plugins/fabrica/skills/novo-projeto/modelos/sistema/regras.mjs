// AS REGRAS do negócio: o que o modelo sozinho não sabe dizer. Para cada cadastro dá para ter:
//   validar(registro, {banco, anterior, hoje})  → {campo: 'mensagem'} com o que está errado (vazio = tudo certo)
//   calculados: {nome: {rotulo, tipo, calcular(registro, {hoje, banco})}}  → campo que não se digita, se calcula
//   aoSalvar(registro, {banco, anterior, hoje}) → o registro, com o que quiser preencher sozinho
// Toda regra daqui vem da seção "Regras" da FICHA.md e tem teste em tests/regras.test.mjs (um caso que passa e um
// que quebra). Função simples, sem ler arquivo nem a internet: entra registro, sai resposta.

export const regras = {
	projetos: {
		validar: (projeto) => {
			const erros = {};
			// não existe projeto pago de graça: se marcou "pago", tem que dizer quanto
			if (projeto.situacao === 'pago' && !projeto.valor) erros.valor = 'Projeto pago precisa do valor.';
			return erros;
		},
		calculados: {
			atrasado: {
				rotulo: 'Atrasado',
				tipo: 'sim-nao',
				// atrasado = prazo já passou e ainda não foi entregue nem pago
				calcular: (projeto, {hoje}) => Boolean(projeto.prazo) && projeto.prazo < hoje && !['entregue', 'pago'].includes(projeto.situacao),
			},
		},
	},
};
