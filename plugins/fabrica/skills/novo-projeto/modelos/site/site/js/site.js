// Comportamentos do site: menu do celular, troca de tema e a entrada suave das seções ao rolar.
// Sem biblioteca nenhuma. Se este arquivo não carregar, a página continua inteira e legível.

const raiz = document.documentElement;

// ---------- Menu do celular ----------
const botaoMenu = document.querySelector('.topo__menu');
const nav = document.getElementById('navegacao');
if (botaoMenu && nav) {
	const fechar = () => {
		nav.classList.remove('aberto');
		botaoMenu.setAttribute('aria-expanded', 'false');
	};
	botaoMenu.addEventListener('click', () => {
		const aberto = nav.classList.toggle('aberto');
		botaoMenu.setAttribute('aria-expanded', String(aberto));
	});
	// escolheu uma seção ou apertou Esc: o menu sai da frente
	nav.addEventListener('click', (e) => e.target.closest('a') && fechar());
	document.addEventListener('keydown', (e) => e.key === 'Escape' && fechar());
}

// ---------- Tema claro e escuro ----------
const escuroNoAparelho = window.matchMedia('(prefers-color-scheme: dark)');
const temaAtual = () => raiz.dataset.tema || (escuroNoAparelho.matches ? 'escuro' : 'claro');
for (const botao of document.querySelectorAll('[data-trocar-tema]')) {
	botao.addEventListener('click', () => {
		const novo = temaAtual() === 'escuro' ? 'claro' : 'escuro';
		raiz.dataset.tema = novo;
		try {
			localStorage.setItem('tema', novo);
		} catch {
			// navegação anônima pode bloquear: o tema vale só para esta visita
		}
	});
}

// ---------- Entrada das seções ao rolar ----------
const revelar = document.querySelectorAll('.revelar');
if ('IntersectionObserver' in window) {
	// irmãos entram um depois do outro (a ordem vira um pequeno atraso no CSS)
	for (const el of revelar) {
		const irmaos = [...el.parentElement.children].filter((i) => i.classList.contains('revelar'));
		el.style.setProperty('--ordem', String(Math.min(irmaos.indexOf(el), 5)));
	}
	const observador = new IntersectionObserver(
		(entradas) => {
			for (const entrada of entradas) {
				if (!entrada.isIntersecting) continue;
				entrada.target.classList.add('visivel');
				observador.unobserve(entrada.target);
			}
		},
		{rootMargin: '0px 0px -8% 0px', threshold: 0.05},
	);
	for (const el of revelar) observador.observe(el);
} else {
	for (const el of revelar) el.classList.add('visivel');
}

// ---------- Ano do rodapé sempre em dia ----------
for (const el of document.querySelectorAll('[data-ano]')) el.textContent = String(new Date().getFullYear());
