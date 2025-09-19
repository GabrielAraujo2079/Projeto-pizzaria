"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarEmail = validarEmail;
exports.validarCPF = validarCPF;
exports.validarDataBR = validarDataBR;
exports.validarNumero = validarNumero;
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
}
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf))
        return false;
    let soma = 0;
    for (let i = 0; i < 9; i++)
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11)
        resto = 0;
    if (resto !== parseInt(cpf.charAt(9)))
        return false;
    soma = 0;
    for (let i = 0; i < 10; i++)
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11)
        resto = 0;
    return resto === parseInt(cpf.charAt(10));
}
function validarDataBR(dataStr) {
    const [dia, mes, ano] = dataStr.split('/').map(Number);
    if (!dia || !mes || !ano)
        return false;
    const data = new Date(ano, mes - 1, dia);
    return data.getFullYear() === ano &&
        data.getMonth() === mes - 1 &&
        data.getDate() === dia &&
        data <= new Date();
}
function validarNumero(valor) {
    const num = parseFloat(valor);
    return isNaN(num) || num <= 0 ? null : num;
}
