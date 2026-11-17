// As travas que todo projeto da fábrica recebe (.claude/hooks/regras.mjs): o que bloqueiam e o que deixam passar.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {decidirBash, decidirEdicao, pacotesPedidos, resumoDoPainel} from '../skills/novo-projeto/modelos/base/_claude/hooks/regras.mjs';
import {escrever, pastaTemporaria} from './apoio.mjs';

const acao = (comando, ficha = '') => decidirBash({command: comando}, {ficha}).acao;

test('commit passa pela verificação; comando comum segue', () => {
	assert.equal(acao('git commit -m "x"'), 'verificar');
	assert.equal(acao('git add -A && git commit -q -m "x"'), 'verificar');
	assert.equal(acao('git status'), 'seguir');
	assert.equal(acao('npm run verificar'), 'seguir');
	assert.equal(acao('npm install'), 'seguir', 'instalar o que já está combinado é livre');
});

test('não deixa pular a verificação nem forçar o envio', () => {
	assert.equal(acao('git commit --no-verify -m "x"'), 'bloquear');
	assert.equal(acao('git push --force origin main'), 'bloquear');
	assert.equal(acao('git push -f'), 'bloquear');
	assert.equal(acao('git push -u origin main'), 'seguir');
});

test('dados/ do dono: não apaga, não move, não sobrescreve', () => {
	for (const comando of ['rm -rf dados', 'rm -rf ./dados/', 'rm dados/banco.json', 'mv dados dados-velho', 'del dados\\banco.json', 'Remove-Item -Recurse dados', 'echo "{}" > dados/banco.json', 'cd projeto && rm -r "dados"']) assert.equal(acao(comando), 'bloquear', comando);
	for (const comando of ['rm relatorio-de-dados.txt', 'rm exemplos/dados.json', 'ls dados', 'cat dados/banco.json | head', 'mv a.txt b.txt', 'rm -rf node_modules']) assert.notEqual(acao(comando), 'bloquear', comando);
});

test('dependência nova só com o OK anotado na ficha', () => {
	assert.deepEqual(pacotesPedidos('npm install lodash'), ['lodash']);
	assert.deepEqual(pacotesPedidos('npm i -D @types/node@22 typescript@5.6.0 --save-exact'), ['@types/node', 'typescript']);
	assert.deepEqual(pacotesPedidos('npm install'), []);
	assert.deepEqual(pacotesPedidos('pnpm add zod && yarn add dayjs'), ['zod', 'dayjs']);
	assert.equal(acao('npm install lodash'), 'bloquear');
	const ficha = '# Ficha\n\n## Dependências aprovadas\n\n- lodash: para agrupar listas (OK do dono em 10/11/2026)\n\n## Decisões\n';
	assert.equal(acao('npm install lodash', ficha), 'seguir');
	assert.equal(acao('npm install lodash axios', ficha), 'bloquear', 'o axios não foi aprovado');
	assert.match(decidirBash({command: 'npm i axios'}, {ficha}).motivo, /axios.*precisa do OK do dono/);
	assert.equal(acao('npm install lodash', '# Ficha\n\nUsamos lodash aqui.\n'), 'bloquear', 'citar fora da seção não vale');
});

test('edição: protege os dados reais, o fiscal e as próprias travas; o resto é livre', () => {
	const raiz = '/projeto';
	const edicao = (rel) => decidirEdicao(`${raiz}/${rel}`, raiz).acao;
	for (const rel of ['dados/banco.json', 'dados/copias/banco-2026-01-01.json', 'ferramentas/fiscal.mjs', 'ferramentas/fiscal/nucleo.mjs', 'ferramentas/fiscal/regras-gerais.mjs', '.claude/hooks/regras.mjs']) assert.equal(edicao(rel), 'bloquear', rel);
	for (const rel of ['ferramentas/fiscal/regras-do-projeto.mjs', 'modelo.mjs', 'site/index.html', 'exemplos/dados.json', 'docs/diario.md', 'ferramentas/outra.mjs', '.claude/settings.json']) assert.equal(edicao(rel), 'seguir', rel);
	assert.match(decidirEdicao('/projeto/ferramentas/fiscal/nucleo.mjs', '/projeto').motivo, /Não mude o fiscal para ele passar/);
});

test('início da sessão: resume o estado e o que falta, tirados do painel', () => {
	const raiz = pastaTemporaria();
	assert.equal(resumoDoPainel(raiz), '', 'sem painel, não inventa');
	escrever(raiz, {'PAINEL.md': '# Painel: Loja\n\nAtualizado em 01/01/2026.\n\n## O que é\n\nUma loja.\n\n## Estado\n\n| Parte | Situação |\n|---|---|\n| Site | no ar |\n\n## Falta fazer\n\n1. Trocar a foto.\n2. Publicar.\n\n## Como abrir\n\nDois cliques.\n'});
	const resumo = resumoDoPainel(raiz);
	assert.match(resumo, /^Painel: Loja \(projeto da Fábrica/);
	assert.match(resumo, /Estado:\n\| Parte \| Situação \|/);
	assert.match(resumo, /Falta fazer:\n1\. Trocar a foto\.\n2\. Publicar\./);
	assert.doesNotMatch(resumo, /Dois cliques/);
	escrever(raiz, {'PAINEL.md': `# P\n\n## Falta fazer\n\n${'- item comprido\n'.repeat(500)}`});
	assert.ok(resumoDoPainel(raiz).length < 2600, 'painel gigante não enche a conversa');
});
