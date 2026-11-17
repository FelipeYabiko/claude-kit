// Registros de exemplo: alimentam a folha de telas, os testes e (enquanto o modelo tiver `exemplo: true`) o banco
// vazio na primeira vez que o sistema abre. Mantenha de 4 a 8 registros realistas por cadastro, com casos variados
// (campo vazio, texto comprido, valor alto), porque é com eles que as telas são fotografadas e aprovadas.
// As datas são relativas a hoje, para sempre haver coisa atrasada e coisa futura. Nunca ponha dado real de cliente.

const emDias = (hoje, dias) => {
	const d = new Date(`${hoje}T12:00:00`);
	d.setDate(d.getDate() + dias);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Devolve os registros de exemplo, na ordem em que precisam ser criados. `ref('clientes', 0)` é o primeiro cliente
 * desta lista (vira o id de verdade na hora de criar).
 */
export const semente = (hoje) => [
	['clientes', {nome: 'Padaria do Bairro', contato: 'Marina Souza', telefone: '11 91234-5678', email: 'marina@padariadobairro.com.br', cidade: 'São Paulo', observacoes: 'Prefere falar por áudio. Aprova rápido.'}],
	['clientes', {nome: 'Clínica Horizonte', contato: 'Dr. Paulo Mendes', telefone: '21 99876-5432', cidade: 'Rio de Janeiro'}],
	['clientes', {nome: 'Loja Trama', contato: 'Beatriz Antunes', email: 'bia@lojatrama.com.br', cidade: 'Belo Horizonte'}],
	['clientes', {nome: 'Curso Raiz', telefone: '31 98888-7777', cidade: 'Belo Horizonte', observacoes: 'Pagamento sempre em duas vezes.'}],
	['projetos', {titulo: 'Série de 12 Reels', cliente: ['clientes', 0], situacao: 'andamento', valor: '4.800,00', prazo: emDias(hoje, 9), link: 'drive.exemplo.com/padaria-reels'}],
	['projetos', {titulo: 'Vídeo da sala de espera', cliente: ['clientes', 1], situacao: 'andamento', valor: '2.200,00', prazo: emDias(hoje, -3), observacoes: 'Aguardando as fotos da clínica para fechar o roteiro.'}],
	['projetos', {titulo: 'Logo animado e vinhetas', cliente: ['clientes', 2], situacao: 'entregue', valor: '1.500,00', prazo: emDias(hoje, -12)}],
	['projetos', {titulo: 'Abertura do curso', cliente: ['clientes', 3], situacao: 'pago', valor: '900,00', prazo: emDias(hoje, -40)}],
	['projetos', {titulo: 'Oito aulas animadas', cliente: ['clientes', 3], situacao: 'orcamento', valor: '6.400,00', prazo: emDias(hoje, 30)}],
	['projetos', {titulo: 'Vídeo de fim de ano', cliente: ['clientes', 0], situacao: 'orcamento'}],
];

/**
 * Cria os registros de exemplo pela própria API (assim passam pela mesma conferência dos dados de verdade).
 * Devolve a lista de erros (vazia = tudo criado). Usado pelo servidor, pela folha de telas e pelos testes.
 */
export const semear = async (api, hoje) => {
	const criados = {};
	const erros = [];
	for (const [entidade, dados] of semente(hoje)) {
		const corpo = Object.fromEntries(Object.entries(dados).map(([campo, valor]) => [campo, Array.isArray(valor) ? criados[valor[0]]?.[valor[1]] : valor]));
		const resposta = await api({metodo: 'POST', caminho: `/api/e/${entidade}`, corpo});
		if (resposta.status !== 201) erros.push(`${entidade} "${Object.values(dados)[0]}": ${JSON.stringify(resposta.json.erros ?? resposta.json.mensagem)}`);
		else (criados[entidade] ??= []).push(resposta.json.registro.id);
	}
	return erros;
};
