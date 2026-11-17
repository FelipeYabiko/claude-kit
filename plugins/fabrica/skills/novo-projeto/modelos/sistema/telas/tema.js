// Roda antes de a tela ser desenhada: aplica o tema (claro ou escuro) que a pessoa escolheu da última vez.
try {
	var tema = localStorage.getItem('tema');
	if (tema === 'claro' || tema === 'escuro') document.documentElement.dataset.tema = tema;
} catch (e) {
	// navegação anônima pode bloquear: fica o tema do aparelho
}
