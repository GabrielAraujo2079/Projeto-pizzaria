@echo off
title Sistema de Pizzaria - NodeJS
echo Iniciando o sistema...

cd /d "%~dp0"

REM Verifica as dependências
if not exist node_modules (
    echo Dependencias nao encontradas. Instalando...
    call npm install
)

REM Executa o arquivo principal compilado em dist
node dist\index.js

echo.
pause
