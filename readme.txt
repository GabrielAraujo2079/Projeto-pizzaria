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

controllers/ → Controla fluxo do sistema.

AdminControllers.ts → Funções administrativas.

ClienteControllers.ts → Lógica do cliente.

MenuControllers.ts → Cardápio e navegação.

models/ → Modelos de dados (User, Produto, Pedido).

services/ → Regras de negócio.

DataServices.ts, Pedido.ts, Produto.ts, Usuario.ts.

utils/ → Funções auxiliares.

FileUtils.ts, promptUtils.ts, validators.ts.

main.ts → Ponto de entrada do sistema.

📂 raiz do projeto

package.json → Dependências e scripts.

package-lock.json → Versões exatas das libs.

PizzariaEdu.exe → Versão executável para Windows.

PizzariaEduEmBat.bat → Versão batch (roda na faculdade).

readme.txt → Instruções antigas.

tsconfig.json → Configuração do compilador TypeScript.

🛠️ Extras & Decisões

Projeto foi transpilado de TS para JS para compatibilidade.

Tem versão .bat (para rodar no domínio da faculdade) e versão .exe (não precisa Node).

package.json serve como nosso “requirements.txt” — cada integrante deve colocar seu nome lá.

💡 Recomendações de Comentários no Código

Explicar bem o MenuController e o que cada opção faz.

Documentar funções de cadastro/login (principalmente uso de hash).

Avisar no código que hash é irreversível (pra lembrar que não tem como recuperar senha).

Deixar observação onde as datas estão sendo tratadas.

Comentar funções de manipulação de arquivos (salvar/ler) pra facilitar manutenção.

Marcar no código pontos futuros de melhoria (ex: formatar datas pro padrão BR).