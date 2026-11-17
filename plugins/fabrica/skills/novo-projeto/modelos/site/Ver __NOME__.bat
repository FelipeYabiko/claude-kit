@echo off
rem Abre o site neste computador para conferir antes de publicar. Dois cliques e pronto.
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
	echo.
	echo  O Node.js nao esta instalado neste computador.
	echo  Baixe a versao LTS em https://nodejs.org , instale e abra este atalho de novo.
	echo.
	pause
	exit /b 1
)
echo  Abrindo o site no navegador... Para fechar, feche esta janela.
node ferramentas\servir.mjs --abrir
pause
