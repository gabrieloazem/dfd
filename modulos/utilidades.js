/*
    SISTEMAS DEPENDENTES
    - SIMP
    - GOVI
    ! CATALOGO ( Arquivar Catalogo )
    
    MÓDULOS DEPENDENTES
    - elementos_html.js
    
*/

async function api(link, parametros = {}) {
    const response = await fetch(link, {
        method: "POST",
        headers: {
            "Content-Type": "application/json", // Diz ao servidor que está enviando JSON
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        },
        body: JSON.stringify(parametros) // Envia exatamente o objeto recebido
    });

    if (!response.ok) {
        alert('Ocorreu um erro !')
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const dados = await response.json();
    return dados;
}

async function planilha_google(funcao,id, aba,dados,linha) {
 var response = await fetch('https://jeyoredfield.online/dfd2/api/planilha_google/index.php', {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({funcao, id, aba, dados,linha})
 })
 if(response.status !== 200){
  throw new Error(erro(response.status))
 }
 if(response.status == 200){
  return response.json()
 }
}

async function data_hora_atual(){
    return await api('https://jeyoredfield.online/dfd2/api/data_hora.php')
}

async function hora_atual() {
    let result = await api('https://jeyoredfield.online/dfd2/api/data_hora.php');
    let partes = result.data.split(' às ');
    return partes[1];
}

function cronometro_inicio ( ) {
    console.log ( `Inicio = ${data_hora_atual ( )}` )
}

function cronometro_fim ( ) {
    console.log ( `Fim = ${data_hora_atual ( )}` )
}

function hyperlink(link){
   window.open(link, "_blank");
}

function iniciar_cronometro(){
    cronometro_inicio = performance.now()
}

function finalizar_cronometro(){
    cronometro_fim = performance.now()
    console.log(`Tempo: ${((cronometro_fim - cronometro_inicio) / 1000).toFixed(2)}s`);
}

function copiar_texto(texto){
    navigator.clipboard.writeText(texto)
}

function criar_total_de_resultados(){
    criar_elemento({
        id: 'total_de_resultados',
        tipo: 'div',
        classes: 'f df-c-c w-100 hr-2 texto-centralizado',
        texto: '? Resultados',
        destino: ['conteudo']
    })
}

function texto_iniciais_maiusculas(nome){
    console.log(nome)
    if(['',null,undefined,'null'].includes(nome)){
        return '-'
    }else{
        nome = nome.trim()
        let nome_dividido = nome.split(' ')
        let nome_final = ''
        for(let c1 = 0; c1 < nome_dividido.length; c1++){
            let subnome = nome_dividido[c1]
                subnome = subnome.toLowerCase()
                subnome = subnome[0].toUpperCase() + subnome.slice(1);
            nome_final += `${subnome} `
        }
        nome_final = nome_final.trim()
        return nome_final
    }
}

function texto_maiusculo(dado){
    if(['',null,undefined,'null'].includes(dado)){
        return '-'
    }
    else{
        return dado.toUpperCase()
    }
}

function texto_sem_quebra_de_linha(texto) {
    return texto
        .replace(/['"`]/g, '')                        // remove aspas
        .replace(/[\r\n\u2028\u2029\t]+/g, ' ')       // remove quebras de linha e tabulações
        .replace(/\s\s+/g, ' ')                       // reduz múltiplos espaços a um só
        .trim();                                      // remove espaços no início e fim
}

function valor_real(valor) {
    // Converte o valor para string e divide em partes inteiras e decimais
    let valorFormatado = valor.toFixed(2); // Garante que o valor tenha sempre 2 casas decimais
    let partes = valorFormatado.split(".");
    
    // Formata a parte inteira com pontos
    let parteInteira = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    // Retorna o valor formatado com vírgula para separar os centavos
    return `${parteInteira},${partes[1]}`;
}

function remover_elemento_da_lista(lista, elemento) {
    let index = lista.indexOf(elemento);

    if (index !== -1) {
        lista.splice(index, 1);  // Remove 1 elemento na posição index
    }
    return lista;
}

// Nova Função
function obter_data_atual(){
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
    const ano = hoje.getFullYear();
    const dataFormatada = `${ano}-${mes}-${dia}`
    return dataFormatada
}

// Remover Função Obsoleta
function hoje(){
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
    const ano = hoje.getFullYear();
    const dataFormatada = `${ano}-${mes}-${dia}`
    return dataFormatada
}

function converter_data_database_para_normal(data) {
    if(['',null,undefined].includes(data)){
        return '-'
    }
    else{
        let data_dividida = data.split('-')
        let dia = data_dividida[2]
        let mes = data_dividida[1]
        let ano = data_dividida[0]
        return `${dia}/${mes}/${ano}`
    }
}