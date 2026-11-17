// Roda o robô uma vez.
//   npm start                 roda de verdade (grava os arquivos e a memória)
//   npm run ensaio            roda sem gravar nem enviar nada: mostra o que faria
//   node robo.mjs --ate 2     roda só até o passo 2 (para conferir um passo de cada vez)
// O que o robô faz está em passos/ (um arquivo por passo, na ordem do número) e em config.json.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {executar} from './lib/executar.mjs';

const raiz = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);

// os segredos do computador ficam no .env (fora do git); no GitHub Actions eles já chegam como variáveis
const arquivoEnv = path.join(raiz, '.env');
if (fs.existsSync(arquivoEnv)) process.loadEnvFile(arquivoEnv);

let config;
try {
	config = JSON.parse(fs.readFileSync(path.join(raiz, 'config.json'), 'utf8'));
} catch (e) {
	console.error(`O config.json não abre: ${e.message}`);
	process.exit(1);
}

const ate = args.includes('--ate') ? Number(args[args.indexOf('--ate') + 1]) : undefined;
const {ok, erro} = await executar({raiz, config, ensaio: args.includes('--ensaio'), ate});
if (!ok && erro) console.error(`\n${erro}`);
process.exit(ok ? 0 : 1);
