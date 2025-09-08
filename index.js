"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var input = require("prompt-sync")();
var bcrypt = require("bcrypt");
var arquivo = "usuarios.json";
// Verifica se o arquivo JSON existe, caso não, cria automaticamente um vazio
if (!fs.existsSync(arquivo)) {
    fs.writeFileSync(arquivo, "[]");
}
// lê os usuários do arquivo JSON e coloca no array
var usuarios = JSON.parse(fs.readFileSync(arquivo, "utf-8"));
var _loop_1 = function () {
    console.log("[1] Cadastro \n[2] Logar \n[3] Sair");
    var cliente = input("Digite o que deseja fazer: ");
    switch (cliente) {
        case "1":
            // Parte de cadastro
            var nome = input("Digite seu nome: ");
            var senha = input("Crie uma senha: ");
            var cpf_1 = input("Digite seu CPF: ");
            var email = input("Digite seu email: ");
            var dataNascmtoInput = input("Digite sua data de nascimento (AAAA-MM-DD): ");
            var dataNascimento = new Date(dataNascmtoInput);
            var hoje = new Date();
            if (dataNascimento > hoje) {
                console.log("Data de nascimento inválida! Não pode ser no futuro.");
                break;
            }
            // Verifica se o usuário já existe
            if (usuarios.find(function (u) { return u.cpf == cpf_1; })) {
                console.log("Usuário já existe!");
                break;
            }
            //Salva a senha como hash (10 e o numero de vez que ele vai embaralhar)
            var senhaHash = bcrypt.hashSync(senha, 10);
            // Puxa todas as informações e salva em JSON
            usuarios.push({ nome: nome, senha: senhaHash, cpf: cpf_1, email: email, dataNascmto: dataNascimento.toISOString().split("T")[0] });
            fs.writeFileSync(arquivo, JSON.stringify(usuarios, null, 4));
            console.log("Usuário cadastrado com sucesso!");
            break;
        case "2":
            // Login
            var emailLogin_1 = input("Email: ");
            var senhaLogin = input("Senha: ");
            //Confirma se a conta do usuario existe, to LowerCase foi usado pois o TypeScript e case sensitive
            var user = usuarios.find(function (u) { return u.email.toLowerCase() === emailLogin_1.toLowerCase(); });
            //menu de boas vindas
            if (user && bcrypt.compareSync(senhaLogin, user.senha)) {
                console.log("Bem-vindo, ".concat(user.nome, "!"));
            }
            else {
                console.log("Usuário ou senha incorretos!");
            }
            break;
        case "3":
            console.log("Saindo...");
            process.exit(0);
        default:
            console.log("Opção inválida!");
            break;
    }
};
// Loop principal do programa (menu: cadastro, login, sair)
while (true) {
    _loop_1();
}
