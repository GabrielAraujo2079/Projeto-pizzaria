import * as fs from "fs";
const input = require("prompt-sync")();

const arquivo = "usuarios.json";

// Verifica se o arquivo JSON existe, se não cria um vazio
if (!fs.existsSync(arquivo)) {
    fs.writeFileSync(arquivo, "[]");
}

// lê os usuários do arquivo JSON e coloca no array
let usuarios = JSON.parse(fs.readFileSync(arquivo, "utf-8"));

// Loop principal do programa (menu: cadastro, login, sair)
while (true) {
    console.log("[1] Cadastro \n[2] Logar \n[3] Sair");
    let cliente: string = input("Digite o que deseja fazer: ");

    switch (cliente) {
        case "1":
            // Parte de cadastro
            let nome: string = input("Digite seu nome: ");
            let senha: string = input("Crie uma senha: ");
            let cpf: string = input("Digite seu CPF: ");
            let email: string = input("Digite seu email: ");
            let dataNascmtoInput: string = input("Digite sua data de nascimento (AAAA-MM-DD): ");
            let dataNascimento = new Date(dataNascmtoInput);
            const hoje = new Date();

            if (dataNascimento > hoje) {
                console.log("Data de nascimento inválida! Não pode ser no futuro.");
                break;
            }

            // Verifica se o usuário já existe
            if (usuarios.find((u: any) => u.cpf == cpf)) {
                console.log("Usuário já existe!");
                break;
            }

            // Puxa todas as informações e salva em JSON
            usuarios.push({nome, senha, cpf, email, dataNascmto: dataNascimento.toISOString().split("T")[0]
            });
            fs.writeFileSync(arquivo, JSON.stringify(usuarios, null, 4));
            console.log("Usuário cadastrado com sucesso!");
            break;

        case "2":
            // Login
            let emailLogin: string = input("Email: ");
            let senhaLogin: string = input("Senha: ");
            //Confirma se a conta do usuario existe, to lower case foi usado pois o typescript e case sensitive
            let user = usuarios.find((u: any) => u.email === emailLogin.toLowerCase() && u.senha.toLowerCase() === senhaLogin);
            //menu de boas vindas
            if (user) {
                console.log(`Bem-vindo, ${user.nome}!`);
            } else {
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
}
