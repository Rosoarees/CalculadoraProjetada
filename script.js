document.addEventListener('DOMContentLoaded', function() {
    const calcularBtn = document.getElementById('calcularBtn');
    if (calcularBtn) {
        calcularBtn.addEventListener('click', calcularValuation);
    }
});

function exibirAviso(mensagem) {
    const warningDiv = document.getElementById('warningMessage');
    warningDiv.textContent = mensagem;
}

function limparResultadosEAlerta() {
    document.getElementById('lpaProjetado').textContent = '';
    document.getElementById('dividendo').textContent = '';
    document.getElementById('precoTeto').textContent = '';
    document.getElementById('margemSeguranca').textContent = '';
    exibirAviso('');
}

function formatarDinheiro(valor) {
    if (isNaN(valor) || valor === null || valor === undefined) return 'N/A';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarPercentual(valor, casasDecimais = 2) {
    if (isNaN(valor) || valor === null || valor === undefined) return 'N/A';
    return (valor * 100).toFixed(casasDecimais) + '%';
}

function calcularValuation() {
    limparResultadosEAlerta();

    // Obter valores dos inputs
    const cotacaoInput = document.getElementById('cotacao');
    const lpaInput = document.getElementById('lpa');
    const cagrInput = document.getElementById('cagr');
    const payoutInput = document.getElementById('payout');
    const dyDesejadoInput = document.getElementById('dyDesejado');
    const anosInput = document.getElementById('anos');

    const cotacao = parseFloat(cotacaoInput.value);
    const lpa = parseFloat(lpaInput.value);
    const cagr = parseFloat(cagrInput.value) / 100; // Converter para decimal
    const payout = parseFloat(payoutInput.value) / 100; // Converter para decimal
    const dyDesejado = parseFloat(dyDesejadoInput.value) / 100; // Converter para decimal
    const anos = parseInt(anosInput.value);

    // Validação
    let camposValidos = true;
    let mensagemErro = "";

    if (isNaN(cotacao) || isNaN(lpa) || isNaN(cagr) || isNaN(payout) || isNaN(dyDesejado) || isNaN(anos)) {
        mensagemErro = "Por favor, preencha todos os campos com valores numéricos válidos.";
        camposValidos = false;
    } else if (cotacao <= 0) {
        mensagemErro = "A cotação deve ser um valor positivo.";
        camposValidos = false;
    } else if (lpa < 0 && cagr < 0) {
        // Lógica para LPA negativo e CAGR negativo
    } else if (cagr < -1) {
        mensagemErro = "O CAGR não pode ser inferior a -100%.";
        camposValidos = false;
    } else if (payout < 0 || payout > 1) {
        mensagemErro = "O Payout deve estar entre 0% e 100%.";
        camposValidos = false;
    } else if (dyDesejado <= 0) {
        mensagemErro = "O DY Desejado deve ser um valor positivo.";
        camposValidos = false;
    } else if (anos <= 0 || !Number.isInteger(anos)) {
        mensagemErro = "O número de anos para projeção deve ser um inteiro positivo.";
        camposValidos = false;
    }

    if (!camposValidos) {
        exibirAviso(mensagemErro);
        return;
    }

    // 1. Calcular LPA Projetado
    const lpaProjetado = lpa * Math.pow((1 + cagr), anos);
    document.getElementById('lpaProjetado').textContent = formatarDinheiro(lpaProjetado);

    // 2. Calcular Dividendo Projetado
    const dividendo = (lpaProjetado > 0) ? lpaProjetado * payout : 0;
    document.getElementById('dividendo').textContent = formatarDinheiro(dividendo);

    // 3. Calcular Preço Teto
    let precoTeto = 0;
    if (dyDesejado > 0) {
        if (dividendo > 0) {
            precoTeto = dividendo / dyDesejado;
            document.getElementById('precoTeto').textContent = formatarDinheiro(precoTeto);
        } else {
            document.getElementById('precoTeto').textContent = formatarDinheiro(0);
            exibirAviso( (mensagemErro ? mensagemErro + " " : "") + "Dividendo projetado é zero ou negativo, Preço Teto não aplicável ou zero.");
        }
    } else {
        document.getElementById('precoTeto').textContent = 'N/A (DY Desejado inválido)';
    }

    // 4. Calcular Margem de Segurança
    let margemSeguranca = 0;
    if (precoTeto > 0) {
        margemSeguranca = (precoTeto - cotacao) / precoTeto;
        document.getElementById('margemSeguranca').textContent = formatarPercentual(margemSeguranca);
    } else {
        document.getElementById('margemSeguranca').textContent = 'N/A';
        if(dyDesejado > 0 && dividendo > 0) {
             exibirAviso( (mensagemErro ? mensagemErro + " " : "") + "Margem de segurança não calculada devido ao Preço Teto ser zero ou negativo.");
        }
    }
}