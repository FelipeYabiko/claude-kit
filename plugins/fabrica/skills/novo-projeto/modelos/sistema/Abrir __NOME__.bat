@echo off
rem Abre o sistema neste computador. Dois cliques e pronto. Para fechar o sistema, feche esta janela.
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
node servidor.mjs
echo.
echo  O sistema fechou. Se apareceu um erro acima, copie o texto e mostre ao Claude.
pause
