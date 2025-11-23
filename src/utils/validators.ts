// Função que valida se uma string é um email válido.
export function validarEmail(email: string): boolean {
    // Expressão regular simples para validar formato de e-mail.
    // ^[^\s@]+   → início da string, com pelo menos um caractere que não seja espaço nem "@"
    // @          → deve haver um "@" obrigatório
    // [^\s@]+    → parte do domínio antes do ponto
    // \.         → ponto obrigatório
    // [^\s@]+$   → extensão do domínio (ex.: com, br, org), sem espaços
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // "trim()" remove espaços extras no início/fim da string.
    // "regex.test()" retorna true se a string corresponde ao padrão.
    return regex.test(email.trim());
}


// Função que valida CPF (Cadastro de Pessoa Física - Brasil).
export function validarCPF(cpf: string): boolean {
    // Remove tudo que não for número (pontos, hífen, espaços).
    cpf = cpf.replace(/[^\d]/g, '');

    // CPF precisa ter exatamente 11 dígitos e não pode ser uma sequência repetida (ex.: 00000000000, 11111111111).
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    // ==================
    // Validação do 1º dígito verificador
    // ==================
    let soma = 0;
    // Multiplica os 9 primeiros dígitos por pesos decrescentes (10 → 2)
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);

    // Calcula o resto da divisão por 11.
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;

    // Se o dígito calculado não bate com o 10º dígito informado, CPF é inválido.
    if (resto !== parseInt(cpf.charAt(9))) return false;

    // ==================
    // Validação do 2º dígito verificador
    // ==================
    soma = 0;
    // Agora usa os 10 primeiros dígitos com pesos de 11 → 2.
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);

    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;

    // Retorna true se o 2º dígito calculado for igual ao último informado.
    return resto === parseInt(cpf.charAt(10));
}


// Função que valida uma data no formato brasileiro (dd/mm/aaaa).
export function validarDataBR(dataStr: string): boolean {
    // Divide a string pelo "/" e converte cada parte para número.
    const [dia, mes, ano] = dataStr.split('/').map(Number);

    // Se algum dos três não for número válido, retorna falso.
    if (!dia || !mes || !ano) return false;

    // Cria um objeto Date com os valores.
    // ⚠️ Importante: em JavaScript, o mês começa em 0 (janeiro = 0, dezembro = 11).
    const data = new Date(ano, mes - 1, dia);

    // Verifica:
    // 1. Se o ano é o mesmo que digitado.
    // 2. Se o mês (corrigido -1) é o mesmo que digitado.
    // 3. Se o dia é o mesmo que digitado.
    // 4. Se a data não está no futuro (ex.: 31/12/2099 seria inválido).
    return data.getFullYear() === ano &&
           data.getMonth() === mes - 1 &&
           data.getDate() === dia &&
           data <= new Date();
}


// Função que valida se um valor string é um número válido e positivo.
export function validarNumero(valor: string): number | null {
    // "parseFloat" tenta converter a string para número decimal.
    const num = parseFloat(valor);

    // Se não for número válido (NaN) ou se for menor/igual a 0 → retorna null.
    // Caso contrário, retorna o número convertido.
    return isNaN(num) || num <= 0 ? null : num;
}
