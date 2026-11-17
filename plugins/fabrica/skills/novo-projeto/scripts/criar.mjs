// Fábrica de projetos: cria um projeto novo já funcionando a partir de um modelo, ou põe o padrão da fábrica num
// projeto que já existe. Sem dependências: só precisa do Node 22+.
//   node criar.mjs --listar
//   node criar.mjs site <pasta> --nome "Estúdio Aurora" --descricao "Site do estúdio..." [--estilo editorial]
//   node criar.mjs sistema <pasta> --nome "Controle de Clientes"
//   node criar.mjs robo <pasta> --nome "Vigia de Canais"
//   node criar.mjs livre <pasta> --nome "Outra Ideia"
//   node criar.mjs --adotar <pasta> [--tipo site]      põe o padrão num projeto existente, sem sobrescrever nada
//   node criar.mjs --atualizar <pasta>                 traz as ferramentas novas da fábrica para um projeto dela
// A pasta pode ser um repositório recém-criado (só com .git, README, LICENSE e .gitignore).
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync, spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
export const PASTA_MODELOS = path.resolve(aqui, '..', 'modelos');
export const VERSAO = JSON.parse(fs.readFileSync(path.resolve(aqui, '..', '..', '..', '.claude-plugin', 'plugin.json'), 'utf8')).version;

/** O nome que o dono usa → a pasta do modelo. "livre" é o esqueleto puro. */
const PASTA_DO_TIPO = {livre: 'base', site: 'site', sistema: 'sistema', robo: 'robo'};
export const TIPOS = Object.keys(PASTA_DO_TIPO);

const BINARIO = /\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|mp4|webm|mp3|wav|pdf|zip)$/i;

/** Nomes guardados com "_" no modelo porque, com o nome de verdade, mudariam o comportamento do próprio claude-kit. */
const RENOMEAR = [
	[/(^|\/)_gitignore$/, '$1.gitignore'],
	[/(^|\/)_gitattributes$/, '$1.gitattributes'],
	[/(^|\/)_editorconfig$/, '$1.editorconfig'],
	[/(^|\/)_env\.exemplo$/, '$1.env.exemplo'],
	[/(^|\/)_nojekyll$/, '$1.nojekyll'],
	[/^_claude\//, '.claude/'],
	[/^_github\//, '.github/'],
	[/(^|\/)CLAUDE\.modelo\.md$/, '$1CLAUDE.md'],
	[/(^|\/)SKILL\.modelo\.md$/, '$1SKILL.md'],
];

/** O que pode existir numa pasta "vazia" (repositório recém-criado no GitHub). */
const PODE_EXISTIR = new Set(['.git', 'README.md', 'LICENSE', 'LICENSE.md', '.gitignore', '.gitattributes']);

export const semAcento = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '');

/** "Estúdio Aurora!" → "estudio-aurora" (nome de pasta e de pacote: minúsculas, sem acento, com hífen). */
export const paraPasta = (texto) =>
	semAcento(texto)
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

/** Nome seguro para arquivo no Windows, mantendo espaços e maiúsculas ("Abrir Estudio Aurora.bat"). */
export const paraArquivo = (texto) =>
	semAcento(texto)
		.replace(/[<>:"/\\|?*]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/[. ]+$/, '');

const listar = (pasta, base = pasta) =>
	fs.existsSync(pasta)
		? fs.readdirSync(pasta, {withFileTypes: true}).flatMap((item) => {
				const inteiro = path.join(pasta, item.name);
				return item.isDirectory() ? listar(inteiro, base) : [path.relative(base, inteiro).split(path.sep).join('/')];
			})
		: [];

export const lerManifesto = (tipo) => JSON.parse(fs.readFileSync(path.join(PASTA_MODELOS, PASTA_DO_TIPO[tipo], 'modelo.json'), 'utf8'));

const juntarJson = (a, b) => {
	if (Array.isArray(a) || Array.isArray(b) || typeof a !== 'object' || typeof b !== 'object' || !a || !b) return b;
	const saida = {...a};
	for (const [chave, valor] of Object.entries(b)) saida[chave] = chave in a ? juntarJson(a[chave], valor) : valor;
	return saida;
};

/** "PAINEL.parte.md" → "PAINEL.md"; "_gitignore.parte" → "_gitignore". Null se não for um pedaço. */
const alvoDaParte = (rel) => {
	const m = rel.match(/^(.*)\.parte(\.[a-z0-9]+)?$/i);
	return m ? m[1] + (m[2] ?? '') : null;
};

/**
 * Junta as camadas de um modelo (base, depois o tipo, depois o estilo escolhido) num mapa {caminho: conteúdo}.
 * Arquivo da camada de cima substitui o de baixo; `X.parte.ext` entra no lugar de `{{>PARTE}}` de `X.ext`
 * (ou no fim, se não houver a marca); `package.json` é fundido chave por chave.
 */
export const montarArquivos = (tipo, {estilo} = {}) => {
	const camadas = [path.join(PASTA_MODELOS, 'base')];
	if (tipo !== 'livre') camadas.push(path.join(PASTA_MODELOS, PASTA_DO_TIPO[tipo]));
	if (estilo) camadas.push(path.join(PASTA_MODELOS, PASTA_DO_TIPO[tipo], '_estilos', estilo));
	const arquivos = new Map();
	const partes = new Map();
	for (const camada of camadas) {
		for (const rel of listar(camada)) {
			if (rel === 'modelo.json' || (rel.startsWith('_estilos/') && !camada.includes(`${path.sep}_estilos${path.sep}`))) continue;
			const conteudo = fs.readFileSync(path.join(camada, rel));
			const alvo = alvoDaParte(rel);
			if (alvo) partes.set(alvo, [...(partes.get(alvo) ?? []), conteudo.toString('utf8').replace(/\n$/, '')]);
			else if (rel === 'package.json' && arquivos.has(rel)) arquivos.set(rel, Buffer.from(`${JSON.stringify(juntarJson(JSON.parse(arquivos.get(rel)), JSON.parse(conteudo)), null, '\t')}\n`));
			else arquivos.set(rel, conteudo);
		}
	}
	for (const [rel, conteudo] of arquivos) {
		if (BINARIO.test(rel)) continue;
		let texto = conteudo.toString('utf8');
		const parte = (partes.get(rel) ?? []).join('\n\n');
		partes.delete(rel);
		if (texto.includes('{{>PARTE}}')) texto = texto.replace(/\{\{>PARTE\}\}\n?/g, parte ? `${parte}\n` : '');
		else if (parte) texto = `${texto.replace(/\n*$/, '\n')}\n${parte}\n`;
		arquivos.set(rel, Buffer.from(texto));
	}
	if (partes.size) throw new Error(`Pedaço sem arquivo-base no modelo: ${[...partes.keys()].join(', ')}`);
	return arquivos;
};

const dataBr = (d = new Date()) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

/** Troca as marcas `{{NOME}}` etc. Só as marcas conhecidas: `${{ ... }}` do GitHub Actions e chaves de código ficam. */
export const preencher = (texto, valores) => texto.replace(/\{\{([A-Z_]+)\}\}/g, (tudo, chave) => (chave in valores ? valores[chave] : tudo));

export const nomeFinal = (rel, valores) => {
	let nome = rel.replace(/__NOME__/g, valores.NOME_ARQUIVO);
	for (const [de, para] of RENOMEAR) nome = nome.replace(de, para);
	return nome;
};

const gravar = (destino, rel, conteudo) => {
	const inteiro = path.join(destino, rel);
	fs.mkdirSync(path.dirname(inteiro), {recursive: true});
	// os atalhos do Windows só funcionam com o fim de linha do Windows
	const final = /\.(bat|cmd)$/i.test(rel) ? Buffer.from(conteudo.toString('utf8').replace(/\r?\n/g, '\r\n')) : conteudo;
	fs.writeFileSync(inteiro, final);
	if (/\.(command|sh)$/i.test(rel)) fs.chmodSync(inteiro, 0o755);
};

const paraHtml = (texto) => texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const valoresDe = ({nome, descricao, tipo, pasta}) => ({
	NOME: nome,
	// o mesmo nome, pronto para cada lugar onde entra: dentro de HTML e dentro de um texto de JavaScript entre aspas simples
	NOME_HTML: paraHtml(nome),
	NOME_JS: nome.replace(/\\/g, '\\\\').replace(/'/g, "\\'"),
	DESCRICAO_HTML: paraHtml(descricao),
	NOME_ARQUIVO: paraArquivo(nome),
	INICIAL: (semAcento(nome).match(/[A-Za-z0-9]/)?.[0] ?? 'A').toUpperCase(),
	PASTA: paraPasta(path.basename(path.resolve(pasta))) || paraPasta(nome),
	DESCRICAO: descricao,
	DESCRICAO_JSON: JSON.stringify(descricao).slice(1, -1),
	DATA: dataBr(),
	ANO: String(new Date().getFullYear()),
	TIPO: tipo,
	VERSAO,
});

/** As peças que são da fábrica (fiscal, travas, motor) num projeto de certo tipo: {atualizaveis, protegidos}. */
const pecasDe = (tipo) => {
	const base = lerManifesto('livre');
	const doTipo = tipo === 'livre' ? base : lerManifesto(tipo);
	return {atualizaveis: [...new Set([...base.atualizaveis, ...(doTipo.atualizaveis ?? [])])], protegidos: new Set([...base.protegidos, ...(doTipo.protegidos ?? [])])};
};

const ehPeca = (arquivo, {atualizaveis, protegidos}) => !protegidos.has(arquivo) && atualizaveis.some((a) => arquivo === a || arquivo.startsWith(`${a}/`));

/**
 * A "assinatura" de cada peça da fábrica no projeto ({arquivo: resumo do conteúdo}). Fica no fabrica.json; o fiscal
 * compara e avisa quando uma peça foi mexida à mão (o conserto certo é na fábrica, para valer em todos os projetos).
 */
export const assinarPecas = (destino, tipo) => {
	const pecas = pecasDe(tipo);
	const assinaturas = {};
	for (const rel of listar(destino)) {
		if (rel.startsWith('node_modules/') || rel.startsWith('.git/') || !ehPeca(rel, pecas)) continue;
		// fim de linha não conta: o git do Windows pode trocar
		assinaturas[rel] = createHash('sha256').update(fs.readFileSync(path.join(destino, rel), 'utf8').replace(/\r\n/g, '\n')).digest('hex').slice(0, 12);
	}
	return assinaturas;
};

/** Cria o projeto. Devolve a lista de arquivos gravados. Lança erro (com mensagem para o dono) se algo impedir. */
export const criarProjeto = ({tipo, pasta, nome, descricao = '', estilo, ficha}) => {
	if (!TIPOS.includes(tipo)) throw new Error(`Tipo "${tipo}" não existe. Tipos: ${TIPOS.join(', ')}.`);
	if (!nome) throw new Error('Falta o nome do projeto: --nome "Nome do Projeto".');
	const manifesto = lerManifesto(tipo);
	const estilos = Object.keys(manifesto.estilos ?? {});
	const estiloFinal = estilo ?? manifesto.estiloPadrao;
	if (estilos.length && !estilos.includes(estiloFinal)) throw new Error(`Estilo "${estiloFinal}" não existe no modelo ${tipo}. Estilos: ${estilos.join(', ')}.`);
	const destino = path.resolve(pasta);
	if (fs.existsSync(destino)) {
		const sobra = fs.readdirSync(destino).filter((item) => !PODE_EXISTIR.has(item));
		if (sobra.length) throw new Error(`A pasta ${destino} já tem coisa dentro (${sobra.slice(0, 5).join(', ')}). Para pôr o padrão num projeto que já existe, use --adotar.`);
	}
	const valores = valoresDe({nome, descricao: descricao || `${nome}.`, tipo, pasta: destino});
	const gravados = [];
	for (const [rel, conteudo] of montarArquivos(tipo, {estilo: estilos.length ? estiloFinal : undefined})) {
		const final = nomeFinal(rel, valores);
		if (final.endsWith('.gitkeep')) {
			fs.mkdirSync(path.join(destino, path.dirname(final)), {recursive: true});
			continue;
		}
		gravar(destino, final, BINARIO.test(rel) ? conteudo : Buffer.from(preencher(conteudo.toString('utf8'), valores)));
		gravados.push(final);
	}
	if (ficha) fs.copyFileSync(path.resolve(ficha), path.join(destino, 'FICHA.md'));
	fs.writeFileSync(path.join(destino, 'fabrica.json'), `${JSON.stringify({fabrica: VERSAO, tipo, nome, ...(estilos.length ? {estilo: estiloFinal} : {}), criadoEm: new Date().toISOString().slice(0, 10), pecas: assinarPecas(destino, tipo)}, null, '\t')}\n`);
	gravados.push('fabrica.json');
	return gravados.sort();
};

/**
 * Põe o padrão da fábrica num projeto que já existe: só acrescenta o que falta (nunca sobrescreve) e completa os
 * comandos do package.json. Devolve {criados, mantidos}.
 */
export const adotarProjeto = ({pasta, tipo = 'livre', nome, descricao = ''}) => {
	const destino = path.resolve(pasta);
	if (!fs.existsSync(destino)) throw new Error(`A pasta ${destino} não existe.`);
	if (!TIPOS.includes(tipo)) throw new Error(`Tipo "${tipo}" não existe. Tipos: ${TIPOS.join(', ')}.`);
	const nomeFinalDoProjeto = nome ?? path.basename(destino);
	const valores = valoresDe({nome: nomeFinalDoProjeto, descricao: descricao || `${nomeFinalDoProjeto}.`, tipo, pasta: destino});
	const criados = [];
	const mantidos = [];
	// de um projeto existente só entra o esqueleto (documentos, fiscal, travas): o miolo é o que ele já tem
	for (const [rel, conteudo] of montarArquivos('livre')) {
		const final = nomeFinal(rel, valores);
		if (final.endsWith('.gitkeep')) continue;
		const inteiro = path.join(destino, final);
		if (final === 'package.json' && fs.existsSync(inteiro)) {
			const atual = JSON.parse(fs.readFileSync(inteiro, 'utf8'));
			const modelo = JSON.parse(preencher(conteudo.toString('utf8'), valores));
			const novos = Object.entries(modelo.scripts).filter(([chave]) => !atual.scripts?.[chave]);
			if (novos.length) {
				atual.scripts = {...atual.scripts, ...Object.fromEntries(novos)};
				fs.writeFileSync(inteiro, `${JSON.stringify(atual, null, '\t')}\n`);
				criados.push(`package.json (comandos: ${novos.map(([c]) => c).join(', ')})`);
			} else mantidos.push(final);
			continue;
		}
		if (final === '.gitignore' && fs.existsSync(inteiro)) {
			const atual = fs.readFileSync(inteiro, 'utf8');
			const faltam = ['node_modules/', 'folha/', '.env'].filter((linha) => !atual.split(/\r?\n/).some((l) => l.trim().replace(/\/$/, '') === linha.replace(/\/$/, '')));
			if (faltam.length) {
				fs.writeFileSync(inteiro, `${atual.replace(/\n*$/, '\n')}\n# Acrescentado pela fábrica\n${faltam.join('\n')}\n`);
				criados.push(`.gitignore (linhas: ${faltam.join(', ')})`);
			} else mantidos.push(final);
			continue;
		}
		if (fs.existsSync(inteiro)) {
			mantidos.push(final);
			continue;
		}
		gravar(destino, final, BINARIO.test(rel) ? conteudo : Buffer.from(preencher(conteudo.toString('utf8'), valores)));
		criados.push(final);
	}
	const arquivoFabrica = path.join(destino, 'fabrica.json');
	if (!fs.existsSync(arquivoFabrica)) {
		fs.writeFileSync(arquivoFabrica, `${JSON.stringify({fabrica: VERSAO, tipo, nome: nomeFinalDoProjeto, adotadoEm: new Date().toISOString().slice(0, 10), pecas: assinarPecas(destino, 'livre')}, null, '\t')}\n`);
		criados.push('fabrica.json');
	}
	return {criados: criados.sort(), mantidos: mantidos.sort()};
};

/**
 * Traz para um projeto da fábrica a versão nova das peças que são da fábrica (fiscal, travas, motor). O que é do
 * projeto (conteúdo, modelo de dados, regras próprias) nunca é tocado. Devolve {atualizados, versaoAntiga}.
 */
export const atualizarProjeto = ({pasta}) => {
	const destino = path.resolve(pasta);
	const arquivoFabrica = path.join(destino, 'fabrica.json');
	if (!fs.existsSync(arquivoFabrica)) throw new Error(`${destino} não tem fabrica.json: não é um projeto da fábrica (use --adotar).`);
	const fabrica = JSON.parse(fs.readFileSync(arquivoFabrica, 'utf8'));
	const tipo = TIPOS.includes(fabrica.tipo) ? fabrica.tipo : 'livre';
	const pecas = pecasDe(tipo);
	const valores = valoresDe({nome: fabrica.nome ?? path.basename(destino), descricao: '', tipo, pasta: destino});
	const atualizados = [];
	for (const [rel, conteudo] of montarArquivos(tipo, {estilo: undefined})) {
		const final = nomeFinal(rel, valores);
		if (!ehPeca(final, pecas)) continue;
		const novo = BINARIO.test(rel) ? conteudo : Buffer.from(preencher(conteudo.toString('utf8'), valores));
		const inteiro = path.join(destino, final);
		if (fs.existsSync(inteiro) && fs.readFileSync(inteiro).equals(novo)) continue;
		gravar(destino, final, novo);
		atualizados.push(final);
	}
	fs.writeFileSync(arquivoFabrica, `${JSON.stringify({...fabrica, fabrica: VERSAO, atualizadoEm: new Date().toISOString().slice(0, 10), pecas: assinarPecas(destino, tipo)}, null, '\t')}\n`);
	return {atualizados: atualizados.sort(), versaoAntiga: fabrica.fabrica};
};

const dentroDeGit = (pasta) => {
	let atual = path.resolve(pasta);
	for (;;) {
		if (fs.existsSync(path.join(atual, '.git'))) return true;
		const acima = path.dirname(atual);
		if (acima === atual) return false;
		atual = acima;
	}
};

const rodarFiscal = (destino, extra = []) => {
	const r = spawnSync(process.execPath, [path.join(destino, 'ferramentas', 'fiscal.mjs'), ...extra], {cwd: destino, encoding: 'utf8'});
	return {ok: r.status === 0, saida: `${r.stdout ?? ''}${r.stderr ?? ''}`.trim()};
};

const ehPrincipal = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (ehPrincipal) {
	const args = process.argv.slice(2);
	const COM_VALOR = new Set(['nome', 'descricao', 'estilo', 'ficha', 'tipo', 'adotar', 'atualizar']);
	const opcoes = {};
	const soltos = [];
	for (let i = 0; i < args.length; i++) {
		if (!args[i].startsWith('--')) soltos.push(args[i]);
		else if (COM_VALOR.has(args[i].slice(2))) opcoes[args[i].slice(2)] = args[++i];
		else opcoes[args[i].slice(2)] = true;
	}
	try {
		if (opcoes.listar) {
			console.log(`Fábrica de projetos ${VERSAO}. Modelos:`);
			for (const tipo of TIPOS) {
				const m = lerManifesto(tipo);
				console.log(`\n  ${tipo}: ${m.descricao}`);
				for (const [estilo, descricao] of Object.entries(m.estilos ?? {})) console.log(`      --estilo ${estilo}${estilo === m.estiloPadrao ? ' (padrão)' : ''}: ${descricao}`);
			}
		} else if (opcoes.adotar) {
			const {criados, mantidos} = adotarProjeto({pasta: opcoes.adotar, tipo: opcoes.tipo, nome: opcoes.nome, descricao: opcoes.descricao});
			console.log(`Padrão da fábrica posto em ${path.resolve(opcoes.adotar)}.`);
			console.log(`Criados (${criados.length}):\n${criados.map((a) => `  + ${a}`).join('\n') || '  (nada)'}`);
			console.log(`Mantidos como estavam (${mantidos.length}): ${mantidos.join(', ') || 'nenhum'}`);
			console.log(`\n${rodarFiscal(path.resolve(opcoes.adotar)).saida}`);
			console.log('\nPróximo passo: preencher PAINEL.md e FICHA.md com o que o projeto já é (leia o código e pergunte ao dono o que faltar), e resolver o que o fiscal apontou.');
		} else if (opcoes.atualizar) {
			const {atualizados, versaoAntiga} = atualizarProjeto({pasta: opcoes.atualizar});
			console.log(`Projeto atualizado da fábrica ${versaoAntiga ?? '?'} para ${VERSAO}: ${atualizados.length} arquivo(s).`);
			for (const a of atualizados) console.log(`  ~ ${a}`);
			const fiscal = rodarFiscal(path.resolve(opcoes.atualizar), ['--quieto']);
			console.log(`\n${fiscal.saida}\nRode \`npm run verificar\` no projeto antes de commitar: regra nova do fiscal pode apontar coisa antiga.`);
		} else {
			const [tipo, pasta] = soltos;
			if (!tipo || !pasta) {
				console.log('Uso: node criar.mjs <tipo> <pasta> --nome "Nome do Projeto" [--descricao "..."] [--estilo <estilo>] [--ficha <arquivo.md>] [--sem-git]');
				console.log(`Tipos: ${TIPOS.join(', ')}.  Veja os modelos e estilos com --listar.  Projeto que já existe: --adotar <pasta>.`);
				process.exit(1);
			}
			const gravados = criarProjeto({tipo, pasta, nome: opcoes.nome, descricao: opcoes.descricao, estilo: opcoes.estilo, ficha: opcoes.ficha});
			const destino = path.resolve(pasta);
			if (!opcoes['sem-git'] && !dentroDeGit(destino)) {
				try {
					execFileSync('git', ['init', '-q', '-b', 'main'], {cwd: destino, stdio: 'ignore'});
				} catch {
					console.log('Aviso: não consegui rodar `git init` (o git está instalado?). O projeto foi criado mesmo assim.');
				}
			}
			console.log(`Projeto "${opcoes.nome}" criado em ${destino} (modelo ${tipo}, fábrica ${VERSAO}): ${gravados.length} arquivos.`);
			const fiscal = rodarFiscal(destino);
			console.log(`\n${fiscal.saida}`);
			const testes = spawnSync(process.execPath, ['--test', '--test-reporter=dot', 'tests/*.test.mjs'], {cwd: destino, encoding: 'utf8'});
			console.log(`\nTestes: ${testes.status === 0 ? 'passaram' : `FALHARAM\n${testes.stdout}${testes.stderr}`}`);
			console.log(['', 'Próximos passos (manual do projeto: docs/manual.md):', '  1. Escreva a FICHA.md com as respostas da entrevista e peça o OK do dono.', '  2. Troque o conteúdo de exemplo pelo de verdade, uma parte por vez.', '  3. `npm run verificar` e, se tem tela, `npm run telas` (abra as folhas e olhe).', '  4. Mostre a folha ao dono; depois `npm run fiscal -- --final` e publique.'].join('\n'));
			if (!fiscal.ok || testes.status !== 0) process.exit(1);
		}
	} catch (e) {
		console.error(`Não deu: ${e.message}`);
		process.exit(1);
	}
}
