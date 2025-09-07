    import * as fs from "fs";
    const input = require("prompt-sync")();


    const arquivo = "usuarios.json";

    // Verifica se o arquivo JSON existe, se não cria um vazio
    if (!fs.existsSync(arquivo)){
        fs.writeFileSync(arquivo, "[]");
    }

    // lê os usuários do arquivo JSON e coloca no array
    let usuarios = JSON.parse(fs.readFileSync(arquivo, "utf-8"));

    // Loop principal do programa (menu: cadastro, login, sair)
    while (true){   
        console.log("[1]Cadastro \n[2]logar \n[3]Sair");
        let cliente: string = input("Digite oque deseja fazer: ")
    // Parte de cadastro.
        if (cliente == "1"){
            let nome: string = input("Digite Seu nome: ");
            let senha: string = input("Crie uma senha: ");
            let cpf: string = input("Digite seu CPF: ");
            let email: string = input("Digite seu email: ")
            let dataNascmtoInput: string = input("Digite sua data de nascimento (AAAA-MM-DD): ");
            let dataNascimento = new Date(dataNascmtoInput);
            const hoje = new Date();

            if (dataNascimento > hoje) {
            console.log("Data de nascimento inválida! Não pode ser no futuro.");
            continue;
            }
                 //Verifica se o usuario já existe
                if (usuarios.find((u: any)=> u.cpf == cpf)){
                    console.log("Usuario ja existe: ");
                    continue
                }
                //Puxa todas as informaçoes e salva em json
                usuarios.push({ nome, senha, cpf, email, dataNascmto: dataNascimento.toISOString().split("T")[0] });
                fs.writeFileSync(arquivo, JSON.stringify(usuarios, null, 4));
                console.log("Usuário cadastrado com sucesso!");
        
            }else if(cliente == "2"){
                   // Login (Solicita email e senha)
            let email: string = input("Email: ");
            let senha: string = input("Senha: ");

            let user = usuarios.find((u: any) => u.email === email && u.senha === senha);

            if (user) {
                console.log(`Bem-vindo, ${user.nome}!`);
            } else {
                console.log("Usuário ou senha incorretos!");
            }

        } else if (cliente === "3") {
            console.log("Saindo...");
            break;
        } else {
            console.log("Opção inválida!");
            }

        
    
}