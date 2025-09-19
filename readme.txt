# Projeto Pizzaria P1 do Prof Edu

👥 Integrantes:

Gabriel Araujo Santos (2508678)
Leonardo da Graça Moraes (2512238)
Paulo André Silva de Lima (251263)
Paulo Vitor Macieira Carvalho (2508725)

🧾 Tecnologias & Bibliotecas
fs (File System) → leitura/escrita de arquivos (usado pra salvar cadastros no .json).
prompt-sync → leitura de dados no terminal, simulando entrada de usuário.
bcrypt → gera hash seguro de senha antes de salvar.

* Estrutura do Código
MenuController → é o “cérebro” do app. Gerencia o fluxo do menu, chamando cadastro, login e outras funções.

Cadastro

Pega nome, email, senha.

Senha é transformada em hash usando bcrypt.

Salva tudo como string no banco JSON.

Login

Lê dados do JSON.

Compara a senha digitada com o hash salvo.

Dá acesso só se bater.

Banco de Dados (JSON)

Salva lista de usuários.

Datas ficam em formato americano (YYYY-MM-DD).

Tratamento de Erros

Se algo quebrar no main, mostra erro no terminal e fecha com process.exit(1).

* Extras do Projeto

Transpilação de TypeScript pra JavaScript.

Execução multiplataforma:

.bat → feito pra rodar no domínio da faculdade sem precisar digitar comando.

.exe → versão standalone pra quem não tem Node instalado.

