@echo off
rem Roda o robo uma vez neste computador. Dois cliques e pronto.
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
node robo.mjs
echo.
echo  Terminou. O resultado esta na pasta "saida". Se apareceu ERRO acima, copie o texto e mostre ao Claude.
pause
