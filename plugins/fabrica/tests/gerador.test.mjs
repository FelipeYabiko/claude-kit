// O gerador (criar.mjs): cada modelo nasce funcionando, sem marca esquecida, com as travas no lugar; projeto que já
// existe é adotado sem perder nada; atualizar traz as peças novas sem tocar no que é do projeto.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {test} from 'node:test';
import {TIPOS, VERSAO, adotarProjeto, atualizarProjeto, criarProjeto, lerManifesto, paraArquivo, paraPasta, preencher} from '../skills/novo-projeto/scripts/criar.mjs';
import {fiscalizar} from '../skills/novo-projeto/modelos/base/ferramentas/fiscal/nucleo.mjs';
import {todasAsRegras} from '../skills/novo-projeto/modelos/base/ferramentas/fiscal.mjs';
import {CRIAR, RAIZ_DO_PLUGIN, escrever, pastaTemporaria} from './apoio.mjs';

const listar = (pasta, base = pasta) => fs.readdirSync(pasta, {withFileTypes: true}).flatMap((i) => (i.isDirectory() ? listar(path.join(pasta, i.name), base) : [path.relative(base, path.join(pasta, i.name)).split(path.sep).join('/')]));
const novo = (tipo, opcoes = {}) => {
	const pasta = path.join(pastaTemporaria(), opcoes.pasta ?? 'projeto-de-teste');
	const arquivos = criarProjeto({tipo, pasta, nome: 'Estúdio D\'Água & <Cia>', descricao: 'Descrição com "aspas" e <sinais>.', ...opcoes});
	return {pasta, arquivos};
};
const fiscal = async (pasta, opcoes) => fiscalizar(pasta, await todasAsRegras(), opcoes);
const rodar = (pasta, args) => spawnSync(process.execPath, args, {cwd: pasta, encoding: 'utf8'});

test('nomes: de pasta (sem acento, com hífen) e de arquivo (seguro no Windows)', () => {
	assert.equal(paraPasta('Estúdio Aurora!'), 'estudio-aurora');
	assert.equal(paraPasta('  Ação & Reação 2  '), 'acao-reacao-2');
	assert.equal(paraArquivo('Estúdio D\'Água: "o" melhor?'), "Estudio D'Agua o melhor");
	assert.equal(paraArquivo('Relatório 10/2026.'), 'Relatorio 10 2026');
});

test('marcas: só as conhecidas são trocadas; ${{ }} do GitHub e chaves de código ficam', () => {
	assert.equal(preencher('a {{NOME}} b ${{ secrets.X }} c {{OUTRA}} d {x: {y}}', {NOME: 'N'}), 'a N b ${{ secrets.X }} c {{OUTRA}} d {x: {y}}');
});

for (const tipo of TIPOS) {
	test(`modelo ${tipo}: nasce completo, sem marca esquecida e passando no fiscal`, async () => {
		const {pasta, arquivos} = novo(tipo);
		for (const obrigatorio of ['CLAUDE.md', 'PAINEL.md', 'FICHA.md', 'README.md', 'docs/manual.md', 'docs/diario.md', 'docs/regras-de-ouro.md', 'docs/aprendizados.md', 'package.json', 'fabrica.json', '.gitignore', '.gitattributes', '.editorconfig', '.claude/settings.json', '.claude/hooks/regras.mjs', '.claude/hooks/antes-do-bash.mjs', '.claude/hooks/antes-de-editar.mjs', '.claude/hooks/inicio-da-sessao.mjs', '.claude/skills/mudanca/SKILL.md', 'ferramentas/fiscal.mjs', 'ferramentas/fiscal/regras-do-projeto.mjs']) assert.ok(arquivos.includes(obrigatorio), `falta ${obrigatorio}`);
		const noDisco = listar(pasta);
		assert.deepEqual(noDisco.filter((a) => /(^|\/)_(claude|github|gitignore|gitattributes|editorconfig|env|estilos|nojekyll)|\.parte(\.|$)|\.modelo\.md$|modelo\.json$|__NOME__/.test(a)), [], 'nome de arquivo do modelo que não foi trocado');
		for (const arquivo of noDisco.filter((a) => /\.(md|mjs|js|json|html|css|svg|yml|bat|txt|xml)$/.test(a) || /\/\.[a-z]+$/.test(`/${a}`))) {
			const texto = fs.readFileSync(path.join(pasta, arquivo), 'utf8');
			assert.doesNotMatch(texto, /\{\{>?[A-Z_]+\}\}/, `marca esquecida em ${arquivo}`);
		}
		const fabrica = JSON.parse(fs.readFileSync(path.join(pasta, 'fabrica.json'), 'utf8'));
		assert.equal(fabrica.fabrica, VERSAO);
		assert.equal(fabrica.tipo, tipo);
		assert.ok(Object.keys(fabrica.pecas).length >= 10, 'as peças da fábrica ficam assinadas');
		assert.equal(JSON.parse(fs.readFileSync(path.join(pasta, 'package.json'), 'utf8')).name, 'projeto-de-teste');
		const r = await fiscal(pasta);
		assert.deepEqual(r.erros.map((e) => `${e.regra}: ${e.arquivo ?? ''} ${e.mensagem}`), [], 'projeto recém-criado não pode nascer com erro');
		const naEntrega = await fiscal(pasta, {final: true});
		assert.ok(naEntrega.erros.some((e) => e.regra === 'ficha'), 'a ficha por preencher trava a entrega');
		if (tipo !== 'livre') assert.ok(naEntrega.erros.some((e) => ['conteudo-de-exemplo', 'modelo', 'config'].includes(e.regra)), 'o exemplo da fábrica trava a entrega');
	});
}

test('os ganchos e as instruções do projeto citam o nome certo, e as travas carregam', async () => {
	const {pasta} = novo('livre');
	assert.match(fs.readFileSync(path.join(pasta, 'CLAUDE.md'), 'utf8'), /^# Estúdio D'Água & <Cia>\n\nDescrição com "aspas" e <sinais>\./);
	const settings = JSON.parse(fs.readFileSync(path.join(pasta, '.claude', 'settings.json'), 'utf8'));
	assert.deepEqual(Object.keys(settings.hooks), ['SessionStart', 'PreToolUse']);
	const entrada = JSON.stringify({tool_input: {command: 'rm -rf dados'}, cwd: pasta});
	const gancho = spawnSync(process.execPath, [path.join(pasta, '.claude', 'hooks', 'antes-do-bash.mjs')], {input: entrada, encoding: 'utf8', env: {...process.env, CLAUDE_PROJECT_DIR: pasta}});
	assert.equal(JSON.parse(gancho.stdout).hookSpecificOutput.permissionDecision, 'deny');
	const editar = spawnSync(process.execPath, [path.join(pasta, '.claude', 'hooks', 'antes-de-editar.mjs')], {input: JSON.stringify({tool_input: {file_path: path.join(pasta, 'ferramentas', 'fiscal', 'nucleo.mjs')}}), encoding: 'utf8', env: {...process.env, CLAUDE_PROJECT_DIR: pasta}});
	assert.match(JSON.parse(editar.stdout).hookSpecificOutput.permissionDecisionReason, /Não mude o fiscal/);
	const inicio = spawnSync(process.execPath, [path.join(pasta, '.claude', 'hooks', 'inicio-da-sessao.mjs')], {encoding: 'utf8'});
	assert.match(JSON.parse(inicio.stdout).hookSpecificOutput.additionalContext, /Falta fazer:\n1\. Completar a `FICHA\.md`/);
});

test('o gancho de commit roda a verificação e recusa quando ela falha', () => {
	const {pasta} = novo('livre');
	const commit = (comando) => spawnSync(process.execPath, [path.join(pasta, '.claude', 'hooks', 'antes-do-bash.mjs')], {input: JSON.stringify({tool_input: {command: comando}}), encoding: 'utf8', env: {...process.env, CLAUDE_PROJECT_DIR: pasta}});
	assert.equal(commit('git commit -m "x"').stdout, '', 'projeto são: o commit passa');
	fs.rmSync(path.join(pasta, 'PAINEL.md'));
	const recusado = JSON.parse(commit('git commit -m "x"').stdout).hookSpecificOutput;
	assert.equal(recusado.permissionDecision, 'deny');
	assert.match(recusado.permissionDecisionReason, /npm run verificar falhou[\s\S]*falta PAINEL\.md/);
});

test('site: cada estilo nasce com as suas cores e fontes, e os três passam no contraste', async () => {
	const estilos = Object.keys(lerManifesto('site').estilos);
	assert.deepEqual(estilos, ['editorial', 'vibrante', 'tecnico']);
	const tokens = new Set();
	for (const estilo of estilos) {
		const {pasta} = novo('site', {estilo});
		const css = fs.readFileSync(path.join(pasta, 'site', 'estilo', 'tokens.css'), 'utf8');
		tokens.add(css);
		for (const fonte of css.matchAll(/url\("\.\.\/fontes\/([^"]+)"\)/g)) assert.ok(fs.existsSync(path.join(pasta, 'site', 'fontes', fonte[1])), `${estilo}: falta a fonte ${fonte[1]}`);
		assert.equal(JSON.parse(fs.readFileSync(path.join(pasta, 'fabrica.json'), 'utf8')).estilo, estilo);
		const r = await fiscal(pasta);
		assert.deepEqual(r.erros, [], estilo);
		assert.deepEqual(r.avisos.filter((a) => ['contraste', 'estilo-nos-tokens', 'links', 'imagens', 'formularios', 'titulos-de-secao'].includes(a.regra)), [], `${estilo}: o modelo não pode nascer com aviso de qualidade`);
		const html = fs.readFileSync(path.join(pasta, 'site', 'index.html'), 'utf8');
		assert.match(html, /<title>Estúdio D'Água &amp; &lt;Cia&gt;<\/title>/, 'o nome entra no HTML sem virar tag');
		assert.match(html, /content="Descrição com &quot;aspas&quot; e &lt;sinais&gt;\."/);
		assert.ok(fs.existsSync(path.join(pasta, "Ver Estudio D'Agua & Cia.bat")), 'atalho do Windows com nome seguro');
	}
	assert.equal(tokens.size, 3);
	assert.throws(() => novo('site', {estilo: 'gotico'}), /Estilo "gotico" não existe.*editorial, vibrante, tecnico/);
});

test('site: a biblioteca de seções só usa classes e tokens que existem', () => {
	const {pasta} = novo('site');
	const tokens = fs.readFileSync(path.join(pasta, 'site', 'estilo', 'tokens.css'), 'utf8');
	for (const arquivo of fs.readdirSync(path.join(pasta, 'secoes')).filter((f) => f.endsWith('.html'))) {
		const texto = fs.readFileSync(path.join(pasta, 'secoes', arquivo), 'utf8');
		assert.match(texto, /^<!-- [A-ZÇÃÕÉÍ ()]+\n\s+Quando usar|^<!-- [^\n]+\n\s+(Atenção|Quando usar)/, `${arquivo}: começa dizendo quando usar`);
		for (const m of texto.matchAll(/var\((--[a-z0-9-]+)/g)) assert.ok(tokens.includes(`${m[1]}:`), `${arquivo}: usa ${m[1]}, que não existe nos tokens`);
		assert.doesNotMatch(texto.match(/<style>([\s\S]*)<\/style>/)[1].replace(/\/\*[\s\S]*?\*\//g, ''), /#[0-9a-f]{3,8}\b|rgba?\(/i, `${arquivo}: cor fora dos tokens`);
	}
});

test('sistema e robô: os testes que vêm com o projeto passam, e o nome com apóstrofo não quebra o código', () => {
	for (const tipo of ['sistema', 'robo']) {
		const {pasta} = novo(tipo);
		const r = rodar(pasta, ['--test', '--test-reporter=dot', 'tests/*.test.mjs']);
		assert.equal(r.status, 0, `${tipo}:\n${r.stdout}${r.stderr}`);
	}
	const {pasta} = novo('sistema');
	assert.match(fs.readFileSync(path.join(pasta, 'modelo.mjs'), 'utf8'), /nome: 'Estúdio D\\'Água & <Cia>'/);
	assert.match(fs.readFileSync(path.join(pasta, '.gitignore'), 'utf8'), /^dados\/$/m);
	assert.match(fs.readFileSync(path.join(pasta, "Abrir Estudio D'Agua & Cia.bat"), 'utf8'), /\r\nnode servidor\.mjs\r\n/, 'o atalho sai com o fim de linha do Windows');
});

test('robô: roda do começo ao fim sem internet, e a segunda rodada não repete', () => {
	const {pasta} = novo('robo');
	const ensaio = rodar(pasta, ['robo.mjs', '--ensaio']);
	assert.equal(ensaio.status, 0, ensaio.stdout + ensaio.stderr);
	assert.equal(fs.existsSync(path.join(pasta, 'saida', 'ultimo.md')), false, 'ensaio não grava');
	assert.equal(rodar(pasta, ['robo.mjs']).status, 0);
	assert.match(fs.readFileSync(path.join(pasta, 'saida', 'ultimo.md'), 'utf8'), /3 novidade\(s\)/);
	assert.equal(rodar(pasta, ['robo.mjs']).status, 0);
	assert.match(fs.readFileSync(path.join(pasta, 'saida', 'ultimo.md'), 'utf8'), /Nada de novo/);
	assert.equal(fs.readFileSync(path.join(pasta, 'saida', 'historico.csv'), 'utf8').split('\r\n').filter(Boolean).length, 4);
});

test('pasta de destino: aceita repositório recém-criado, recusa pasta com coisa dentro', () => {
	const pasta = pastaTemporaria();
	escrever(pasta, {'README.md': '# vazio\n', 'LICENSE': 'MIT', '.git/HEAD': 'ref: refs/heads/main\n'});
	criarProjeto({tipo: 'livre', pasta, nome: 'Novo'});
	assert.match(fs.readFileSync(path.join(pasta, 'README.md'), 'utf8'), /^# Novo/);
	assert.ok(fs.existsSync(path.join(pasta, '.git', 'HEAD')), 'não mexe no git que já existe');
	assert.throws(() => criarProjeto({tipo: 'livre', pasta, nome: 'De novo'}), /já tem coisa dentro.*use --adotar/);
	assert.throws(() => criarProjeto({tipo: 'aplicativo', pasta: path.join(pastaTemporaria(), 'x'), nome: 'X'}), /Tipo "aplicativo" não existe/);
	assert.throws(() => criarProjeto({tipo: 'livre', pasta: path.join(pastaTemporaria(), 'x')}), /Falta o nome/);
});

test('adotar: põe o padrão num projeto que já existe sem sobrescrever nada', async () => {
	const pasta = path.join(pastaTemporaria(), 'portfolio');
	const antes = {'index.html': '<!doctype html><title>Meu</title>', 'README.md': '# Meu README\n', 'package.json': JSON.stringify({name: 'meu', scripts: {test: 'meu-teste', build: 'vite'}, dependencies: {vite: '^5'}}), '.gitignore': 'dist\n', 'CLAUDE.md': '# Regras minhas\n'};
	escrever(pasta, antes);
	const {criados, mantidos} = adotarProjeto({pasta, nome: 'Portfólio'});
	for (const arquivo of ['index.html', 'README.md', 'CLAUDE.md']) assert.equal(fs.readFileSync(path.join(pasta, arquivo), 'utf8'), antes[arquivo], `${arquivo} não foi tocado`);
	assert.ok(mantidos.includes('README.md') && mantidos.includes('CLAUDE.md'));
	const pkg = JSON.parse(fs.readFileSync(path.join(pasta, 'package.json'), 'utf8'));
	assert.deepEqual(pkg.scripts, {test: 'meu-teste', build: 'vite', verificar: 'node ferramentas/fiscal.mjs --quieto && node --test "tests/*.test.mjs"', fiscal: 'node ferramentas/fiscal.mjs'}, 'só acrescenta os comandos que faltam');
	assert.deepEqual(pkg.dependencies, {vite: '^5'});
	assert.equal(fs.readFileSync(path.join(pasta, '.gitignore'), 'utf8'), 'dist\n\n# Acrescentado pela fábrica\nnode_modules/\nfolha/\n.env\n');
	for (const arquivo of ['PAINEL.md', 'FICHA.md', 'docs/manual.md', 'ferramentas/fiscal.mjs', '.claude/hooks/regras.mjs', 'fabrica.json']) assert.ok(criados.includes(arquivo), `criou ${arquivo}`);
	assert.match(fs.readFileSync(path.join(pasta, 'PAINEL.md'), 'utf8'), /^# Painel: Portfólio/);
	const r = await fiscal(pasta);
	assert.ok(r.erros.every((e) => e.regra === 'comandos'), 'o que o fiscal aponta é do projeto (aqui: dependência sem trava), não da adoção');
	const segunda = adotarProjeto({pasta, nome: 'Portfólio'});
	assert.deepEqual(segunda.criados, [], 'adotar de novo não muda nada');
});

test('adotar um site com as páginas na pasta principal: traz as ferramentas do site e aponta para a pasta certa', async () => {
	const pasta = path.join(pastaTemporaria(), 'site-antigo');
	escrever(pasta, {'index.html': '<!doctype html>\n<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Antigo</title></head><body><h1>Oi</h1><a href="https://x.com"></a></body></html>\n', 'styles/style.css': 'body { color: #333; }\n'});
	adotarProjeto({pasta, tipo: 'site', nome: 'Site Antigo'});
	const fabrica = JSON.parse(fs.readFileSync(path.join(pasta, 'fabrica.json'), 'utf8'));
	assert.equal(fabrica.pastaDoSite, '.', 'as páginas estão na raiz, não em site/');
	for (const arquivo of ['ferramentas/folha-de-telas.mjs', 'ferramentas/telas.config.mjs', 'ferramentas/capa.mjs', 'ferramentas/endereco.mjs']) assert.ok(fs.existsSync(path.join(pasta, arquivo)), `trouxe ${arquivo}`);
	const scripts = JSON.parse(fs.readFileSync(path.join(pasta, 'package.json'), 'utf8')).scripts;
	assert.ok(scripts.telas && scripts.capa && scripts.ver && scripts.endereco, 'os comandos do site entram');
	assert.ok(!fs.existsSync(path.join(pasta, 'site')), 'não inventa uma pasta site/');
	const {preparar} = await import(`${path.join(pasta, 'ferramentas', 'telas.config.mjs')}?t=${Date.now()}`);
	const {telas, fechar} = await preparar();
	assert.deepEqual(telas.map((t) => t.caminho), ['/index.html'], 'a folha de telas acha a página da raiz e ignora docs/, ferramentas/ e .claude/');
	fechar();
	const r = await fiscal(pasta);
	assert.ok(r.erros.some((e) => e.regra === 'links' && /<a> sem texto/.test(e.mensagem)), 'o fiscal já aponta o que o site antigo tem de errado');
	const novoSite = path.join(pastaTemporaria(), 'com-pasta-site');
	escrever(novoSite, {'site/index.html': '<!doctype html><title>x</title>'});
	adotarProjeto({pasta: novoSite, tipo: 'site', nome: 'Com Pasta'});
	assert.equal(JSON.parse(fs.readFileSync(path.join(novoSite, 'fabrica.json'), 'utf8')).pastaDoSite, undefined, 'site em site/ não precisa da marca');
});

test('atualizar: traz as peças novas da fábrica e não toca no que é do projeto', () => {
	const {pasta} = novo('sistema');
	const meu = {'modelo.mjs': '// meu modelo\n', 'regras.mjs': '// minhas regras\n', 'telas/tokens.css': ':root { --cor-fundo: #fff; }\n', 'ferramentas/fiscal/regras-do-projeto.mjs': '// minha regra\nexport const regrasDoProjeto = [];\n', 'FICHA.md': '# minha ficha\n', 'exemplos/semente.mjs': '// meus exemplos\n'};
	escrever(pasta, {...meu, 'motor/csv.mjs': '// estraguei\n', 'ferramentas/fiscal/nucleo.mjs': null, 'fabrica.json': JSON.stringify({fabrica: '0.0.1', tipo: 'sistema', nome: "Estúdio D'Água & <Cia>", criadoEm: '2026-01-01'})});
	const {atualizados, versaoAntiga} = atualizarProjeto({pasta});
	assert.equal(versaoAntiga, '0.0.1');
	assert.deepEqual(atualizados, ['ferramentas/fiscal/nucleo.mjs', 'motor/csv.mjs']);
	for (const [arquivo, texto] of Object.entries(meu)) assert.equal(fs.readFileSync(path.join(pasta, arquivo), 'utf8'), texto, `${arquivo} é do projeto`);
	assert.match(fs.readFileSync(path.join(pasta, 'motor', 'csv.mjs'), 'utf8'), /montarCsv/);
	const fabrica = JSON.parse(fs.readFileSync(path.join(pasta, 'fabrica.json'), 'utf8'));
	assert.deepEqual([fabrica.fabrica, fabrica.nome, fabrica.criadoEm], [VERSAO, "Estúdio D'Água & <Cia>", '2026-01-01']);
	assert.ok(fabrica.pecas['motor/csv.mjs']);
	assert.deepEqual(atualizarProjeto({pasta}).atualizados, [], 'atualizar de novo não muda nada');
	assert.throws(() => atualizarProjeto({pasta: pastaTemporaria()}), /não tem fabrica\.json/);
});

test('pela linha de comando: lista os modelos, cria com git e diz os próximos passos', () => {
	const lista = spawnSync(process.execPath, [CRIAR, '--listar'], {encoding: 'utf8'});
	for (const tipo of TIPOS) assert.match(lista.stdout, new RegExp(`\\n  ${tipo}: `));
	assert.match(lista.stdout, /--estilo editorial \(padrão\)/);
	const pasta = path.join(pastaTemporaria(), 'vigia');
	const criado = spawnSync(process.execPath, [CRIAR, 'robo', pasta, '--nome', 'Vigia'], {encoding: 'utf8'});
	assert.equal(criado.status, 0, criado.stdout + criado.stderr);
	assert.match(criado.stdout, /Projeto "Vigia" criado[\s\S]*0 erro\(s\)[\s\S]*Testes: passaram[\s\S]*Próximos passos/);
	assert.ok(fs.existsSync(path.join(pasta, '.git')), 'começa um repositório git');
	const semNome = spawnSync(process.execPath, [CRIAR, 'site', path.join(pastaTemporaria(), 'x')], {encoding: 'utf8'});
	assert.equal(semNome.status, 1);
	assert.match(semNome.stderr, /Não deu: Falta o nome do projeto/);
	assert.equal(spawnSync(process.execPath, [CRIAR], {encoding: 'utf8'}).status, 1);
});

test('o plugin está inteiro: versão, skill e nada que mude o comportamento do próprio claude-kit', () => {
	const plugin = JSON.parse(fs.readFileSync(path.join(RAIZ_DO_PLUGIN, '.claude-plugin', 'plugin.json'), 'utf8'));
	assert.match(plugin.version, /^\d+\.\d+\.\d+$/);
	const modelos = path.join(RAIZ_DO_PLUGIN, 'skills', 'novo-projeto', 'modelos');
	const perigosos = listar(modelos).filter((a) => /(^|\/)(\.gitignore|\.gitattributes|\.claude\/|\.github\/|CLAUDE\.md|SKILL\.md)$|(^|\/)\.(claude|github)\//.test(a));
	assert.deepEqual(perigosos, [], 'dentro dos modelos esses nomes ficam com "_" ou ".modelo" (senão valeriam para o kit)');
});
