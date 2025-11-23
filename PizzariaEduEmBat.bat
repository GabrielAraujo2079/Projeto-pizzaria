@echo off
cd /d "%~dp0"

REM Verifica Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js nao encontrado. Instale o Node 16+.
    pause
    exit /b
)

REM Cria pasta data e arquivos se nao existirem
if not exist data (
    mkdir data
    echo [] > data\usuarios.json
    echo [] > data\produtos.json
)

REM Roda o projeto
node "dist\index.js"

pause
