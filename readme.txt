# Projeto Pizzaria P1 do Prof Edu

🤝integrantes:
    GABRIEL ARAUJO SANTOS (2508678) 
    
    LEONARDO DA GRAÇA MORAES (2512238) 

    PAULO ANDRÉ SILVA DE LIMA (251263) 

    PAULO VITOR MACIEIRA CARVALHO (2508725) 

📂 Estrutura do Projeto
📂 data

Contém os dados e relatórios.

notas-fiscais/ → Notas fiscais dos pedidos.

Relatorio setembro/ → Relatórios de vendas.

pedidos.json → Histórico de pedidos.

produtos.json → Cadastro de produtos.

usuarios.json → Lista de usuários cadastrados.

📂 dist

Arquivos compilados de TypeScript para JavaScript.

📂 node_modules

Dependências instaladas via npm.

📂 src (Código-Fonte)



📂 raiz do projeto

package.json → Dependências e scripts.

package-lock.json → Versões das libs.

PizzariaEdu.exe → Versão executável para Windows (Não pegou em Linux).

PizzariaEduEmBat.bat → Versão batch (roda na faculdade).


tsconfig.json → Configuração do compilador TypeScript.

🛠️ Extras & Decisões

Projeto foi transpilado de TS para JS para compatibilidade.

Tem versão .bat (para rodar no domínio da faculdade) e versão .exe

package.json serve como nosso “requirements.txt” 


💻 Advanced BAT to EXE Converter v4.62 
Usamos esse aplicativo para transforma o Bat em .EXE


Claro! Vou te ajudar a deixar essa lista de dependências e instruções mais organizadas, claras e com aquele “enchimento de linguiça” para o usuário entender melhor, principalmente no Linux. Veja só:

---

# ⚠️ Lista de Dependências ⚠️

Para garantir que seu projeto funcione corretamente, é necessário ter o **Node.js versão 16 ou superior** instalado na sua máquina. Caso ainda não tenha, faça o download no site oficial [nodejs.org](https://nodejs.org).

---

## Dependências do projeto

```json
"dependencies": {
  "bcrypt": "^6.0.0",
  "prompt-sync": "^4.2.0"
},
"devDependencies": {
  "@types/bcrypt": "^6.0.0"
},
"engines": {
  "node": ">=16.0.0"
}
```

---

## Sobre o TypeScript

Você pode usar o TypeScript de forma **local** (instalado apenas dentro do projeto, o que é recomendado para evitar conflitos de versões) ou **global** (instalado no seu sistema, para uso geral).

* **Local**: mais seguro para projetos específicos, você controla a versão usada por cada projeto.
* **Global**: pode ser usado em vários projetos, mas pode causar problemas de compatibilidade se as versões não coincidirem.

---

# Instruções para executar o projeto

### Para Usuários Windows

* Simplesmente execute o arquivo `.bat` ou `.exe` que acompanha o projeto.
* Esses arquivos já têm tudo configurado para facilitar a instalação das dependências e execução do programa.
* Basta dar um duplo clique e seguir as instruções que aparecem no prompt.

---

### Para Usuários Linux

Aqui, o processo é um pouco diferente

1. Abra o terminal.
2. Navegue até a pasta raiz do projeto, onde está localizado o arquivo `package.json`.
3. Execute o comando abaixo para instalar todas as dependências necessárias:

```bash
npm install
```

Esse comando irá baixar e configurar tudo o que o projeto precisa para funcionar corretamente. Pode demorar um pouco dependendo da velocidade da sua internet, mas fique tranquilo, é só aguardar.

4. Depois que a instalação terminar, você pode executar o projeto conforme as instruções específicas do seu código (geralmente com `npm start` ou o comando indicado no README).

---

### Dicas extras para o Linux

* Certifique-se de que o Node.js está instalado e atualizado para a versão 16 ou superior. Você pode verificar isso com:

```bash
node -v
```

Se o comando não retornar a versão correta, será necessário instalar ou atualizar o Node.js.

* Caso precise instalar, recomendo usar o **Node Version Manager (nvm)** para facilitar o gerenciamento de versões:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.bashrc
nvm install 16
nvm use 16
```

---

Se precisar de ajuda ou encontrar algum problema durante a instalação, pode me chamar que te auxilio no que for necessário!

---
