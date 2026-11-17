// O MODELO: a descrição dos cadastros deste sistema. É o arquivo que mais se mexe: acrescentar um cadastro ou um
// campo é escrever aqui, e a tela de lista, o formulário, a busca, os filtros e a exportação aparecem sozinhos.
// O guia completo (tipos de campo, opções, painel) está em docs/manual.md. Depois de mudar: `npm run verificar`.
//
// Tipos de campo: texto, texto-longo, numero, dinheiro, data, escolha, sim-nao, ligacao, email, telefone, link.
// Opções de qualquer campo: rotulo (obrigatório), obrigatorio, padrao, unico, ajuda, min, max.

export const modelo = {
	nome: '{{NOME_JS}}',

	// Marca de que estes cadastros ainda são os de exemplo da fábrica. Apague esta linha quando trocar pelos de
	// verdade: com ela, o sistema enche o banco vazio com dados de mentira e o fiscal trava a entrega.
	exemplo: true,

	entidades: {
		clientes: {
			nome: 'Clientes',
			singular: 'cliente',
			genero: 'm',
			titulo: 'nome', // o campo que dá nome ao registro nas listas e nas ligações
			campos: {
				nome: {rotulo: 'Nome', tipo: 'texto', obrigatorio: true, unico: true},
				contato: {rotulo: 'Pessoa de contato', tipo: 'texto'},
				telefone: {rotulo: 'WhatsApp', tipo: 'telefone'},
				email: {rotulo: 'E-mail', tipo: 'email'},
				cidade: {rotulo: 'Cidade', tipo: 'texto'},
				observacoes: {rotulo: 'Observações', tipo: 'texto-longo', ajuda: 'Como chegou, do que gosta, o que evitar.'},
			},
			lista: ['nome', 'contato', 'telefone', 'cidade'], // as colunas da tela de lista
		},

		projetos: {
			nome: 'Projetos',
			singular: 'projeto',
			genero: 'm',
			titulo: 'titulo',
			campos: {
				titulo: {rotulo: 'Título', tipo: 'texto', obrigatorio: true},
				cliente: {rotulo: 'Cliente', tipo: 'ligacao', para: 'clientes', obrigatorio: true},
				situacao: {
					rotulo: 'Situação',
					tipo: 'escolha',
					obrigatorio: true,
					padrao: 'orcamento',
					opcoes: [
						{valor: 'orcamento', rotulo: 'Orçamento', cor: 'neutro'},
						{valor: 'andamento', rotulo: 'Em andamento', cor: 'destaque'},
						{valor: 'entregue', rotulo: 'Entregue', cor: 'alerta'},
						{valor: 'pago', rotulo: 'Pago', cor: 'ok'},
					],
				},
				valor: {rotulo: 'Valor', tipo: 'dinheiro'},
				prazo: {rotulo: 'Prazo', tipo: 'data'},
				link: {rotulo: 'Link dos arquivos', tipo: 'link'},
				observacoes: {rotulo: 'Observações', tipo: 'texto-longo'},
			},
			lista: ['titulo', 'cliente', 'situacao', 'valor', 'prazo', 'atrasado'], // "atrasado" é calculado em regras.mjs
			filtros: ['situacao', 'cliente', 'atrasado'],
			ordem: {campo: 'prazo', direcao: 'asc'},
		},
	},

	// O painel é a tela inicial: os números que o dono quer ver ao abrir. Tipos: contagem, soma, lista, grupos.
	painel: [
		{tipo: 'contagem', rotulo: 'Em andamento', entidade: 'projetos', onde: {situacao: 'andamento'}},
		{tipo: 'contagem', rotulo: 'Atrasados', entidade: 'projetos', onde: {atrasado: true}, tom: 'erro'},
		{tipo: 'soma', rotulo: 'A receber', entidade: 'projetos', campo: 'valor', onde: {situacao: 'entregue'}, ajuda: 'Entregues e ainda não pagos'},
		{tipo: 'soma', rotulo: 'Recebido', entidade: 'projetos', campo: 'valor', onde: {situacao: 'pago'}, tom: 'ok'},
		{tipo: 'lista', rotulo: 'Próximos prazos', entidade: 'projetos', onde: {situacao: ['orcamento', 'andamento'], prazo: {vazio: false}}, ordem: {campo: 'prazo', direcao: 'asc'}, colunas: ['titulo', 'cliente', 'prazo'], limite: 5},
		{tipo: 'grupos', rotulo: 'Projetos por situação', entidade: 'projetos', por: 'situacao'},
	],
};
