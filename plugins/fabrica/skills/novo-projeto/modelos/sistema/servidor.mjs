// Liga o sistema neste computador e abre no navegador.
//   npm start                    abre em http://localhost:4321
//   node servidor.mjs --porta 5000 --dados outra-pasta --sem-abrir
// Os dados ficam em dados/ (fora do GitHub). Para fechar o sistema, feche a janela ou aperte Ctrl+C.
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {semear} from './exemplos/semente.mjs';
import {modelo} from './modelo.mjs';
import {hojeIso} from './motor/formato.mjs';
import {iniciar} from './motor/http.mjs';
import {regras} from './regras.mjs';

const raiz = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opcao = (nome, padrao) => (args.includes(`--${nome}`) ? args[args.indexOf(`--${nome}`) + 1] : padrao);
const porta = Number(opcao('porta', process.env.PORTA ?? 4321));

try {
	const sistema = await iniciar({modelo, regras, pastaDados: path.resolve(raiz, opcao('dados', 'dados')), pastaTelas: path.join(raiz, 'telas'), porta});
	if (sistema.modelo.exemplo && sistema.banco.vazio()) {
		const erros = await semear(sistema.api, hojeIso());
		console.log(erros.length ? `Dados de exemplo com problema:\n${erros.join('\n')}` : 'Banco vazio: preenchido com os dados de exemplo.');
	}
	console.log(`${sistema.modelo.nome} aberto em ${sistema.endereco}  (para fechar, feche esta janela ou aperte Ctrl+C)`);
	if (!args.includes('--sem-abrir')) {
		const [comando, argumentos] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', sistema.endereco]] : process.platform === 'darwin' ? ['open', [sistema.endereco]] : ['xdg-open', [sistema.endereco]];
		try {
			spawn(comando, argumentos, {stdio: 'ignore', detached: true}).on('error', () => {}).unref();
		} catch {
			// sem navegador (nuvem): o endereço já está escrito acima
		}
	}
} catch (e) {
	if (e.code === 'EADDRINUSE') console.error(`O sistema já está aberto (a porta ${porta} está em uso). Use a janela que já está aberta: http://localhost:${porta}`);
	else console.error(e.message);
	process.exit(1);
}
