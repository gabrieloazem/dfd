/*
    SISTEMAS DEPENDENTES
    - Catálogo
    - Licitações
*/

async function delay(tempo){
    await new Promise(resolve => setTimeout(resolve, tempo))
}

async function loading_comeco(){
    criar_elemento({
        tipo: 'div',
        id: 'loading',
        classes: 'absolute bg-black cor-white df-c-c w-100 h-100 font-2 texto-centralizado opacity-50 camada3',
        destino: ['janela']
    })
    
    criar_elemento({
        tipo: 'div',
        classes: 'spinner',
        destino: ['loading']
    })
    
    criar_elemento({
        tipo: 'div',
        texto: 'Carregando',
        destino: ['loading']
    })
    
    await delay(200)
}

function loading_final(){
    document.getElementById('loading').remove()
}