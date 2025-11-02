# Projeto-pizzaria

Sistema de gestão de pizzaria (TypeScript + PostgreSQL).

Este README resume como o projeto está organizado, dependências e passos para rodar do zero.

Resumo dos arquivos
-------------------
- `package.json`: manifesto do projeto (dependências e scripts). Atualizei os scripts `dev` e `dev-watch` para usar `src/main.ts` e adicionei `start:dev`.
- `tsconfig.json`: configurações do compilador TypeScript.
- `.env.example`: exemplo de variáveis de ambiente necessárias para conexão com o banco.
- `src/`:
  - `app.ts`: classe `PizzariaApp` que junta DB, repositórios e serviços.
  - `main.ts`: ponto de entrada que instancia `PizzariaApp` e inicia a aplicação.
  - `database.ts`: wrapper `pg.Pool` e função `inicializarTabelas()` para criar o esquema.
  - `repositores.ts`: classe para acessar o banco (CRUD para usuários, produtos, pedidos, promoções).
  - `services.ts`: regras de negócio e geração de notas/relatórios.
  - `models.ts`: definições de tipos/classes.
  - `server.ts`: inicializador que carrega `.env` e inicia `PizzariaApp`.

Dependências (principais)
-------------------------
- Runtime:
  - pg
  - bcrypt
  - dotenv
  - prompt-sync (opcional para CLI)
- Dev:
  - typescript
  - ts-node
  - nodemon
  - @types/*

Instalação e execução (resumido)
--------------------------------
1. Clonar repositório

```bash
git clone <repo-url>
cd Projeto-pizzaria
```

2. Criar banco e usuário PostgreSQL (exemplo):

```bash
sudo -u postgres psql -c "CREATE USER pizzariauser WITH PASSWORD 'senha';"
sudo -u postgres psql -c "CREATE DATABASE pizzaria OWNER pizzariauser;"
```

3. Copiar `.env.example` para `.env` e ajustar valores:

```bash
cp .env.example .env
# editar .env
```

4. Instalar dependências:

```bash
npm install
```

5. Rodar em desenvolvimento (usa `src/main.ts`):

```bash
npm run start:dev
# ou
npx ts-node src/main.ts
```

6. Compilar para produção:

```bash
npm run build
node dist/index.js
```

Observações
-----------
- `inicializarTabelas()` cria as tabelas automaticamente no banco configurado quando `app.inicializar()` for chamado.
- Se quiser, posso também:
  - adicionar um script `npm run migrate` com uma ferramenta de migrations (ex.: Knex, TypeORM migrations or node-pg-migrate);
  - mover a configuração do DB em `src/main.ts` para leitura direta do `.env` (posso fazer isso agora);
  - criar testes unitários básicos.

---

