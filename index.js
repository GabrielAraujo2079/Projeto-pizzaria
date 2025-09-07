"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var input = require("prompt-sync")();
var arquivo = "usuarios.json";
/*Cadastro dos Clientes */
if (!fs.existsSync(arquivo)) {
    fs.writeFileSync(arquivo, "[]");
}
// lê os usuários do arquivo JSON e coloca no array
var usuarios = JSON.parse(fs.readFileSync(arquivo, "utf-8"));
var _loop_1 = function () {
    console.log("[1]Cadastro \n[2]logar [3]Sair");
    var cliente = input("Digite oque deseja fazer: ");
    if (cliente == "1") {
        var nome = input("Digite Seu nome: ");
        var senha = input("Crie uma senha: ");
        var cpf_1 = input("Digite seu CPF: ");
        var email = input("Digite seu email: ");
        var dataNascmtoInput = input("Digite sua data de nascimento (AAAA-MM-DD): ");
        var dataNascimento = new Date(dataNascmtoInput);
        var hoje = new Date();
        if (dataNascimento > hoje) {
            console.log("Data de nascimento inválida! Não pode ser no futuro.");
            return "continue";
        }
        if (usuarios.find(function (u) { return u.cpf == cpf_1; })) {
            console.log("Usuario ja existe: ");
            return "continue";
        }
        usuarios.push({ nome: nome, senha: senha, cpf: cpf_1, email: email, dataNascmto: dataNascmtoInput.toString() });
        fs.writeFileSync(arquivo, JSON.stringify(usuarios, null, 4));
        console.log("Usuário cadastrado com sucesso!");
    }
    else if (cliente == "2") {
        // Login
        var email_1 = input("Nome: ");
        var senha_1 = input("Senha: ");
        var user = usuarios.find(function (u) { return u.email === email_1 && u.senha === senha_1; });
        if (user) {
            console.log("Bem-vindo, ".concat(user.nome, "!"));
        }
        else {
            console.log("Usuário ou senha incorretos!");
        }
    }
    else if (cliente === "3") {
        console.log("Saindo...");
        return "break";
    }
    else {
        console.log("Opção inválida!");
    }
};
while (true) {
    var state_1 = _loop_1();
    if (state_1 === "break")
        break;
}
