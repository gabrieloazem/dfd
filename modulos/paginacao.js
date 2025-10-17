/* EXEMPLO ==========================================================================

    await iniciar_paginacao({
        link: 'https://jeyoredfield.online/dfd2/api/grupos.php', 
        funcao_de_inserir: inserir_registro_grupo
    })
    
================================================================================= */ 

let paginacao = {}

async function iniciar_paginacao(dados){
    paginacao_resetar_dados()
    paginacao_atualizar_dados(dados)
    paginacao_remover_registros()
    await paginacao_carregar_registros()
}

async function paginacao_filtro_geral(atributo, filtro){
    paginacao['registros_adicionados'] = 0
    paginacao['parametros']['registros_adicionados'] = 0
    paginacao['parametros']['filtros'] = {}
    paginacao['parametros']['filtros'][atributo] = filtro
    paginacao_remover_registros()
    await paginacao_carregar_registros()
}

async function paginacao_filtro_unico(atributo, filtro){
    paginacao['registros_adicionados'] = 0
    paginacao['parametros']['registros_adicionados'] = 0
    paginacao['parametros']['filtros'][atributo] = filtro
    paginacao_remover_registros()
    await paginacao_carregar_registros()
}

async function paginacao_limpar_filtros(){
    paginacao['registros_adicionados'] = 0
    paginacao['parametros']['registros_adicionados'] = 0
    paginacao['parametros']['filtros'] = {}
    paginacao_remover_registros()
    await paginacao_carregar_registros()
}

function paginacao_resetar_dados(){
    paginacao = {
        link: '',

        parametros: {
            registros_adicionados: 0,
            filtros: {}
        },
        
        agrupamento: '',
        
        ordenacao: '',
        
        funcao_de_inserir: '',
        total_de_registros: 0,
        registros_adicionados: 0,
        em_carregamento: false
    }
}

function paginacao_atualizar_dados(dados){
    paginacao['link'] =  dados['link'] || ''
    paginacao['funcao_de_inserir'] = dados['funcao_de_inserir'] || '' 
    
    if (!paginacao['parametros']) {
        paginacao['parametros'] = {};
    }
    
    paginacao['parametros'] = dados['parametros'] || '' 
    // paginacao['parametros']['filtros'] = dados['filtros'] || {}
    
    paginacao['agrupamento'] = dados['agrupamento'] || ''
    paginacao['ordenacao'] = dados['ordenacao'] || ''
}

function paginacao_remover_registros(){
    // Colocar essa classe em todo registro pagincao ( register )
    remover_elementos('register')
}

async function paginacao_carregar_registros(){
    let registros_adicionados = paginacao['registros_adicionados']
    let parametros = paginacao['parametros']
    
    parametros['inicio'] = registros_adicionados
    
    let resultado = await api(paginacao['link'], parametros)
    
    // aquii
    console.log(resultado)
    
    paginacao['total_de_registros'] = resultado['total']
    let total = paginacao['total_de_registros']
    
    let el = document.getElementById('total_de_resultados');
    if (el) {
        el.innerHTML = `${total} Resultados`;
    }
    
    let funcao_de_inserir = paginacao['funcao_de_inserir']
    let dados = resultado['dados']
    
    for ( let c1 = 0; ( c1 < dados.length && paginacao['registros_adicionados'] < total) ; c1 ++ ){
        paginacao['registros_adicionados'] += 1
        paginacao['parametros']['registros_adicionados'] += 1
        let registro = dados[c1]
        funcao_de_inserir(registro)
    }
    
}

async function paginacao_carregar_mais_registros(){
    // O container dos registros deve se chamar 'registros'
    let conteudo = document.getElementById('registros')
    let altura_atual = conteudo.scrollTop
    let altura_total = conteudo.scrollHeight

    if ((altura_total - altura_atual) < 1500) {
        let em_carregamento = paginacao['em_carregamento']
        let registros_adicionados = paginacao['registros_adicionados']
        let total = paginacao['total_de_registros']
        
        if (em_carregamento) return;
        if (registros_adicionados >= total) return;

        paginacao['em_carregamento'] = true

        await paginacao_carregar_registros()
        
        paginacao['em_carregamento'] = false
    }
}

async function paginacao_carregar_todos(){
    let acabou = 'N'
    while(acabou == 'N'){
        let total = paginacao['total_de_registros']
        let registros_adicionados = paginacao['registros_adicionados']
        if(registros_adicionados == total){
            acabou = 'S'
        }
        await paginacao_carregar_registros()
    }
}