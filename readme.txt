# Projeto Pizzaria P1 do Prof Edu

🤝integrantes:
    GABRIEL ARAUJO SANTOS1 (2508678) 
    
    LEONARDO DA GRAÇA MORAES2 (2512238) 

    PAULO ANDRÉ SILVA DE LIMA3 (251263) 

    PAULO VITOR MACIEIRA CARVALHO4 (2508725) 

• **import \* as fs from "fs";**
Biblioteca nativa do Node, usada pra manipulação de arquivos e pastas.

• **const input = require("prompt-sync")();**
Biblioteca padrão pra input/prompt, parecido com o Scanner do Java.

• **import \* as bcrypt from "bcrypt";**
Biblioteca usada pra **hash/encriptar** senhas.

• Transpilei o projeto de TypeScript pra JavaScript.
• Na parte de cadastro, optei até o momento por salvar tudo em string pra não dar B.O.
• Resolvi usar **hash** no lugar de encriptar porque:

* **Hash**

  * Irreversível → não dá pra “descriptografar” a senha depois.
  * Serve só pra verificar se a senha digitada bate com o hash.
  * Mais seguro pra senhas, porque mesmo se o banco vazar, ninguém consegue recuperar a senha original.
* ⚠️ Cuidado pra não esquecer senhas importantes, pesquisei sobre esse hash e o bagulho é potente!

• A data deixei em modelo americano até o momento (tava com preguiça de arrumar). Quem quiser ir mexendo, agradeço!

⚠️Escrevam o nome de vcs no package jason, ele serve como nosso requirements.txt ⚠️

