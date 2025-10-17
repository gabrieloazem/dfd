// Variaveis Globais
let filtros = {}
let registros_adicionados = 0
let atualizacoes = []
let ultimo_grupo = ''
let demanda = 'INFORMAR'
let selecao_grupos = []
let selecao_unidades = []
let quantidades_informadas = []
const data_atual = hoje()
let unidade_selecionada = ''
let id_logado = ''
let link_do_sistema = 'https://jeyoredfield.online/dfd2'

function iniciais_maiusculas(nome){
    if(['',null,undefined,'null'].includes(nome)){
        return '-'
    }
    else{
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

function data_por_extenso(data){
    let data_dividida = data.split('-')
    let dia = parseInt(data_dividida[2])
    let meses = {
        '1': 'Janeiro',
        '2': 'Fevereiro',
        '3': 'Março',
        '4': 'Abril',
        '5': 'Maio',
        '6': 'Junho',
        '7': 'Julho',
        '8': 'Agosto',
        '9': 'Setembro',
        '10': 'Outubro',
        '11': 'Novembro',
        '12': 'Dezembro'
    }
    let mes = parseInt(data_dividida[1])
        mes = meses[mes]
    let ano = data_dividida[0]
    return `${dia} de ${mes} de ${ano}`
}

function somatorio(lista){
 soma = 0
 for(c1 = 0; c1 < lista.length; c1 ++){
  soma += lista[c1]
 }
 return soma
}

async function grafico_status(){
    remover_elemento('grafico_gerenciac')
    
    let registros = ''
    if(acesso == 'TOTAL'){
        registros = await api(`${link_do_sistema}/api/captacoes_total.php`)
    }
    if(acesso == 'UNIDADE'){
        registros = await api(`${link_do_sistema}/api/captacoes_unidade.php`,{unidade: unidade_logada} )
    }
    
    // marck
    let dataX = []
    let dataY = []
    for(let c1 = 0; c1 < registros.length; c1++){
        let registro = registros[c1]
        let risco = registro['status']
        if(risco == ''){
            risco = 'AGUARDANDO'
        }
        let quantidade = registro['quantidade']
        dataX.push(risco)
        dataY.push(quantidade)
    }
    
    const soma = somatorio(dataY)
    
    elem('div',['id','grafico_gerenciac'],'', ['graficos'], 'f w-20 h-100 graphics')
    
    elem('canvas',['id','grafico_gerencia'],'', ['grafico_gerenciac'], 'f w-100 h-100')
    
    grafico_donutss({
        id: 'grafico_gerencia',
        titulo: `Status dos Grupos (${soma})`,
        legendas: dataX,
        valores: dataY,
        cores: ['#27548A','#46A4A5','#9fd1e7'],
        onClick: async(indice, legenda,valor) => {
        } 
    })
}

function criar_filtros(){
    criar_elemento({
        id: 'filtro_grupo',
        tipo: 'input',
        classes: 'f w-20 h-100 df-c-c borda-radius pointer borda-gray texto-centralizado',
        placeholder: 'Pesquise um Nº Grupo',
        destino: ['filtros'],
        onFiltro: async() => {
            let elemento = document.getElementById('filtro_grupo').value
            let filtro = ''
            if(elemento == ''){
                filtro = ''
            }
            if(elemento != ''){
                filtro = elemento
            }
            await paginacao_filtro_unico('grupo_id',elemento)
        }
    })
    
    if(acesso == 'UNIDADE'){
        document.getElementById('filtro_grupo').style.width = '100%'
    }
    
    if(acesso == 'TOTAL'){
        let grupos = []
        for(let c1 = 1; c1 < 104; c1++){
            grupos.push(c1)
        }
        
        criar_elemento({
            id: 'filtro_grupos',
            tipo: 'filter_select',
            classes: 'f w-20 h-100 df-c-c borda-radius pointer borda-gray',
            placeholder: 'Grupos',
            opcoes: grupos,
            destino: ['filtros'],
            onFiltrar: (selecionadas) => {
                selecao_grupos = selecionadas
            }
        })
        
        criar_elemento({
            id: 'filtro_unidades',
            tipo: 'filter_select',
            classes: 'f w-20 h-100 df-c-c borda-radius pointer borda-gray',
            placeholder: 'Unidades',
            opcoes: lista_de_unidades,
            destino: ['filtros'],
            onFiltrar: (selecionadas) => {
                selecao_unidades = selecionadas
            }
        });
        
        criar_elemento({
            id: 'data_inicial',
            tipo: 'input',
            categoria: 'data',
            classes: 'f w-20 h-100 df-c-c borda-radius pointer borda-gray',
            destino: ['filtros']
        })
        
        criar_elemento({
            id: 'data_final',
            tipo: 'input',
            categoria: 'data',
            classes: 'f w-20 h-100 df-c-c borda-radius pointer borda-gray',
            destino: ['filtros']
        })
        
        criar_elemento({
            id: 'solicitar_demanda',
            tipo: 'div',
            classes: 'f bg-27548A cor-white w-20 h-100 df-c-c borda-radius pointer',
            texto: 'Solicitar Demanda',
            destino: ['filtros'],
            onClick: async() => {
                await solicitar_demanda()
            }
        })   
    }
}

async function solicitar_demanda(){
    // akii
    let demanda_inicio = document.getElementById('data_inicial').value
    let demanda_fim = document.getElementById('data_final').value
    
    if(selecao_grupos != '' && selecao_unidades != '' && demanda_inicio && demanda_fim){
        parametros = {
            grupos: selecao_grupos,
            unidades: selecao_unidades,
            demanda_inicio: demanda_inicio,
            demanda_fim: demanda_fim
        }
        
        let resultado = await api(`${link_do_sistema}/api/solicitar_demanda.php`, parametros)
        
        alert('Demanda Solicitada !')
        await pagina_geral()   
        document.getElementById('dados_do_usuario').innerHTML = `<b>${usuario_logado}</b><br>${unidade_logada}`
    }
    else{
        let erro = ''
        if(selecao_grupos == ''){
            erro = 'Informe os Grupos'
        }
        if(selecao_unidades == ''){
            erro = 'Informe as Unidades'
        }
        if(!demanda_inicio || !demanda_fim){
            erro = 'Informe o Período'
        }
        alert(erro)
    }
}

async function pagina_total(){
    remover_elemento('conteudo')
    criar_conteudo()
    
    criar_elemento({
        id: 'graficos',
        tipo: 'div',
        classes: 'f w-100 hr-25 df-c-c',
        destino: ['conteudo']
    })
    
    await grafico_status()
    
    criar_card_filtros()
    criar_filtros()
    
    criar_elemento({
        id: 'cabecalho',
        tipo: 'div',
        classes: `f w-98 ml-1 hr-2 d-flex bg-27548A mt-1 cor-white pt-05 mr-1`,
        destino: ['conteudo']
    })
    
    let cabecalho = [
        'Setor Responsável', 
        'Nº do Grupo', 
        'Nome do Grupo', 
        'Quantidade de Itens', 
        'Processo Instrutivo', 
        'Status',
        'Inicio',
        'Fim',
        'Demanda'
    ]
    
    for(let c1 = 0; c1 < cabecalho.length; c1++){
        let atributo = cabecalho[c1]

        criar_elemento({
            tipo: 'div',
            classes: `f w-17 h-100 texto-centralizado df-c-c`,
            texto: atributo,
            destino: ['cabecalho']
        }) 
    }
    
    criar_elemento({
        id: 'registros',
        tipo: 'div',
        classes: `f w-98 ml-1 hr-35 scroll-y-invisivel mr-1`,
        destino: ['conteudo'],
        onScroll: () => {
            paginacao_carregar_mais_registros()
        }
    })
    
    if(acesso == 'TOTAL'){
        // aquii
        let dados = {
            link: `${link_do_sistema}/api/grupos.php`, 
            funcao_de_inserir: inserir_registro_grupo,
            parametros: {filtros: {}}
        }
        await iniciar_paginacao(dados)   
    }
    
    if(acesso == 'UNIDADE'){
        // aquii
        let dados = {
            link: `${link_do_sistema}/api/grupos_unidade.php`, 
            funcao_de_inserir: inserir_registro_grupo,
            parametros: {unidade: unidade_logada, filtros: {}}
        }
        await iniciar_paginacao(dados)   
    }

}

function inserir_registro_grupo(registro){
    let indice = paginacao['registros_adicionados']
    
    let atributos = [
        registro['setor_responsavel'],
        registro['grupo_id'],
        maiusculo(registro['grupo_nome']),
        registro['itens'],
        registro['processo'],
        registro['status'],
        converter_data_database_para_normal(registro['demanda_inicio']),
        converter_data_database_para_normal(registro['demanda_fim'])
    ]
    
    let status = registro['status']
    let cor = 'f5f5f5'
    if(status == 'EM CAPTAÇÃO'){
        cor = '9fd1e7'
    }
    if(status == 'CAPTURADO'){
        cor = '46A4A5'
    }
    
    criar_elemento({
        id: `Registro${indice}`,
        tipo: 'div',
        classes: `f w-100 texto-centralizado d-flex bg-${cor} mt-02 pt-05 font-07 ai-center register`,
        destino: ['registros']
    }) 
    
    for(let c2 = 0; c2 < atributos.length; c2++){
        let atributo = atributos[c2]

        criar_elemento({
            tipo: 'div',
            classes: 'f w-17 h-100 texto-centralizado df-c-c atributo_valor ocultar',
            texto: atributo,
            destino: [`Registro${indice}`]
        }) 
    }
    
    criar_elemento({
        tipo: 'div',
        classes: 'f w-17 h-100 texto-centralizado df-c-c negrito pointer',
        texto: demanda,
        destino: [`Registro${indice}`],
        onClick: async() => {
            if(acesso == 'TOTAL' || ( acesso == 'UNIDADE' && status == 'EM CAPTAÇÃO' ) ){
                let grupo = registro['grupo_nome']
                let grupo_id = registro['grupo_id']
                // remover_classe(`grupo${grupo}`,'none')
                // remover_classe(`grupo${grupo}_registros`,'none')
                ultimo_grupo = grupo_id
                await pagina_unidade(grupo)   
            }
        }
    }) 
}

async function pagina_unidade(grupo){
    criar_conteudo()
    
   criar_elemento({
        id: 'conteudo_unidades',
        tipo: 'div',
        classes: 'f w-98 ml-1 mt-1',
        destino: ['conteudo']
    })
    
   criar_elemento({
        id: 'informacoes',
        tipo: 'div',
        classes: 'f w-98 ml-1 hr-5 mt-1',
        destino: ['conteudo']
    })
    
    criar_elemento({
        id: 'logo',
        tipo: 'div',
        classes: 'f df-c-c w-5 h-100 bg-black',
        imagem: ['imagens/logo_prefeitura','png'], 
        destino: ['informacoes']
    })
    
    criar_elemento({
        id: 'textos',
        tipo: 'div',
        classes: 'f w-94 pl-1 h-100 d-flex flex-direction-column justify-content-center',
        destino: ['informacoes']
    })
    
    criar_elemento({
        id: 'textos',
        tipo: 'div',
        classes: 'f negrito font-2',
        texto: 'PREFEITURA DA CIDADE DO RIO DE JANEIRO',
        destino: ['textos']
    })
    
    criar_elemento({
        id: 'textos',
        tipo: 'div',
        classes: 'f font-105',
        texto: 'Secretaria Municipal de Saúde',
        destino: ['textos']
    })
    
    criar_elemento({
        tipo: 'div',
        classes: 'f df-c-c w-100 hr-2 texto-centralizado font-105 cor-2f71d7 sublinhado negrito mt-1',
        texto: 'DOCUMENTAÇÃO DE FORMALIZAÇÃO DE DEMANDA (DFD)',
        destino: ['conteudo']
    })
    
    criar_elemento({
        tipo: 'div',
        classes: 'f df-c-e w-98 ml-1 hr-2 font-102 negrito mt-1',
        texto: '1. Identificação da Área Requisitante',
        destino: ['conteudo']
    })
    
    criar_legenda({
        id: 'assinatura_da_unidade',
        destino: 'conteudo',
        legenda: 'assinatura',
        somente_leitura: true
    })
    
    criar_legenda({
        destino: 'conteudo',
        legenda: 'unidade requisitante',
        valor: 'Subsecretaria de Atenção Hospitalar de Urgência e Emergência',
        somente_leitura: true
    })
    
    criar_legenda({
        destino: 'conteudo',
        legenda: 'projeto',
        valor: 'Assegurar ao Usuário, Atendimento Integral a Assistência à Saúde',
        somente_leitura: true
    })
    
    criar_legenda({
        destino: 'conteudo',
        legenda: 'responsável pela demanda',
        valor: unidade_logada,
        somente_leitura: true
    })
    
    criar_legenda({
        destino: 'conteudo',
        legenda: 'e-mail do responsável',
    })
    
    criar_elemento({
        tipo: 'div',
        classes: 'f df-c-e w-49 ml-1 hr-2 font-102 negrito mt-1',
        texto: '2. Demanda - Quantidade',
        destino: ['conteudo']
    })
    
    criar_elemento({
        id: 'total_de_resultados',
        tipo: 'div',
        classes: 'f df-c-d w-49 hr-2 texto-centralizado mt-1',
        texto: '? Resultados',
        destino: ['conteudo']
    })
    
    criar_elemento({
        id: 'filtros',
        tipo: 'div',
        classes: 'f w-98 ml-1 hr-2 mt-1 d-flex gap-05',
        destino: ['conteudo']
    }) 
    
    if(acesso == 'TOTAL'){
        criar_elemento({
            id: 'unidade',
            tipo: 'select',
            opcoes: [
                'SUBPAV',
                'SUBHUE',
                'Coordenadoria de Saúde da AP 1.0',
                'Coordenadoria de Saúde da AP 2.1',
                'Coordenadoria de Saúde da AP 2.2',
                'Coordenadoria de Saúde da AP 3.1',
                'Coordenadoria de Saúde da AP 3.2',
                'Coordenadoria de Saúde da AP 3.3',
                'Coordenadoria de Saúde da AP 4.0',
                'Coordenadoria de Saúde da AP 5.1',
                'Coordenadoria de Saúde da AP 5.2',
                'Coordenadoria de Saúde da AP 5.3',
                'Hospital Municipal Souza Aguiar',
                'Hospital Municipal Fernando Magalhães',
                'Hospital Municipal Miguel Couto',
                'Hospital Municipal Jesus',
                'Hospital Municipal do Paulino Weneck',
                'Hospital Municipal Salgado Filho',
                'Hospital Maternidade Carmela Dutra',
                'Hospital Municipal da Piedade',
                'Hospital Municipal da Assistência a Saúde Nise da Silveira',
                'Hospital Maternidade Herculano Pinheiro',
                'Hospital Municipal Ronaldo Gazzola',
                'Hospital Municipal Francisco da Silva Telles',
                'Hospital Municipal Alexander Fleming',
                'Hospital Municipal Lourenço Jorge',
                'Hospital Municipal Raphael de Paula Souza',
                'Hospital Municipal de Assistência a Saúde Juliano Moreira',
                'Hospital Municipal Nossa Senhora do Loreto',
                'Hospital Municipal Barata Ribeiro',
                'Hospital Municipal Philippe Pinel',
                'Hospital Municipal Rocha Maia',
                'Hospital Municipal Alvaro Ramos',
                'Hospital de Geriatria e Gerontologia Miguel Pedro',
                'Hospital da Mulher Mariska Ribeiro',
                'Novo Complexo Hospitalar Municipal Pedro II',
                'Hospital Municipal Rocha Faria'
            ],
            classes: 'f w-15 hr-100 borda-radius texto-centralizado',
            destino: ['filtros'],
            onChange: async () =>{
                let elemento = document.getElementById('unidade').value
                document.getElementById('container_responsável pela demanda_valor').value = elemento
                // unidade_selecionada = maiusculo(unidades[elemento])
                unidade_selecionada = unidades[elemento]
                await mostrar_itens(unidade_logada)
                await atualizar_assinatura()
                // await paginacao_filtro_2(`AND grupo_id = '${ultimo_grupo}'`)
            }
        }) 
    }

    criar_elemento({
        id: 'categoria',
        tipo: 'input',
        classes: 'f w-15 hr-100 borda-radius texto-centralizado borda-gray',
        destino: ['filtros'],
        placeholder: 'Nº Grupo',
        onKeyUp: async(event) =>{
            let tecla = event.key
            let elemento = document.getElementById('categoria').value
            if(tecla == 'Enter' || elemento == ''){
                if(elemento != ''){
                    ultimo_grupo = elemento
                    await paginacao_filtro_unico('grupo_id',elemento)
                    await atualizar_assinatura()
                }
                atualizacoes = []
            }
        }
    })
    
    criar_elemento({
        id: 'codigo_sigma',
        tipo: 'input',
        classes: 'f w-15 hr-100 borda-radius texto-centralizado borda-gray',
        destino: ['filtros'],
        placeholder: 'Código Sigma',
        onKeyUp: async(event) =>{
            let tecla = event.key
            let elemento = document.getElementById('codigo_sigma').value
            if(tecla == 'Enter' || elemento == ''){
                if(elemento == ''){
                    await paginacao_filtro_unico('codigo_sigma','')
                }
                else{
                    await paginacao_filtro_unico('codigo_sigma',elemento)
                }
            }
        }
    }) 
    
    criar_elemento({
        id: 'item',
        tipo: 'input',
        classes: 'f w-15 hr-100 borda-radius texto-centralizado borda-gray',
        destino: ['filtros'],
        placeholder: 'Item',
        onKeyUp: async(event) =>{
            let tecla = event.key
            let elemento = document.getElementById('item').value
            if(tecla == 'Enter' || elemento == ''){
                if(elemento == ''){
                    await paginacao_filtro_unico('item','')
                }
                else{
                    await paginacao_filtro_unico('item',elemento)
                }
            }
        }
    }) 
    
    /*
    criar_elemento({
        tipo: 'div',
        classes: 'f w-15 hr-100 borda-radius texto-centralizado df-c-c cor-white bg-3484ac pointer',
        destino: ['filtros'],
        texto: 'Itens Zerados',
        onClick: async () => {
            if(acesso == 'UNIDADE'){
            }
            if(acesso == 'TOTAL'){
            }
        }
    }) 
    
    criar_elemento({
        tipo: 'div',
        classes: 'f w-15 hr-100 borda-radius texto-centralizado df-c-c cor-white bg-3484ac pointer',
        destino: ['filtros'],
        texto: 'Limpar Filtros',
        onClick: async () => {
            await mostrar_itens(unidade_selecionada)
        }
    }) 
    
    criar_elemento({
        tipo: 'div',
        classes: 'f w-15 hr-100 borda-radius texto-centralizado df-c-c cor-white bg-3484ac pointer',
        destino: ['filtros'],
        texto: 'Buscar',
        onClick: async () => {
            await pagina_individual()
        }
    }) 
    */
    
    criar_elemento({
        tipo: 'div',
        classes: 'f w-15 hr-100 borda-radius texto-centralizado df-c-c cor-white bg-3484ac pointer',
        destino: ['filtros'],
        texto: 'Gerar PDF',
        onClick: async () => {
            await construir_pdf()
        }
    }) 
    
    if(acesso == 'TOTAL'){
        criar_elemento({
            tipo: 'div',
            classes: 'f w-15 hr-100 borda-radius texto-centralizado df-c-c cor-white bg-3484ac pointer',
            destino: ['filtros'],
            texto: 'Gerar PDF Total',
            onClick: async () => {
                await construir_pdf_total()
            }
        }) 
        
        criar_elemento({
            tipo: 'div',
            classes: 'f w-15 hr-100 borda-radius texto-centralizado df-c-c cor-white bg-3484ac pointer',
            destino: ['filtros'],
            texto: 'Gerar Excel',
            onClick: async () => {
                await loading_comeco()
                await gerar_excel()
                loading_final()
            }
        }) 
    }
    
    if(acesso == 'UNIDADE'){
        criar_elemento({
            tipo: 'div',
            classes: 'f w-15 hr-100 borda-radius texto-centralizado df-c-c cor-white bg-3484ac pointer',
            destino: ['filtros'],
            texto: 'Informar Demanda',
            onClick: async () => {
                let resultado = await api(`${link_do_sistema}/api/atualizar_quantidades.php`, atualizacoes)
                atualizacoes = []
                alert('Demanda Atualizada !')
            }
        }) 
    }
    
    remover_elemento('cabecalho')
    remover_elemento('registros')
    
    let largura_da_tabela = 98
    
    criar_elemento({
        id: 'cabecalho',
        tipo: 'div',
        classes: `f w-${largura_da_tabela} ml-1 hr-2 d-flex bg-27548A mt-1 cor-white pt-05 mr-1`,
        destino: ['conteudo']
    })
    
    let cabecalho = [
        'Grupo',
        'Nome do Grupo',
        'Código SIGMA',
        'Código BR',
        'Descritivo',
        'Estimativa Anual'
    ]
    
    for(let c1 = 0; c1 < cabecalho.length; c1++){
        let atributo = cabecalho[c1]
        let tamanho = 20
        if (atributo == 'Descritivo') {
            tamanho = 40
        }
        let ocultar = ''

        criar_elemento({
            tipo: 'div',
            classes: `f w-${tamanho} h-100 texto-centralizado df-c-c ${ocultar}`,
            texto: atributo,
            destino: ['cabecalho']
        }) 
    }
    
    criar_elemento({
        id: 'registros',
        tipo: 'div',
        classes: `f w-98 ml-1 hr-35 scroll-y-invisivel mr-1`,
        destino: ['conteudo'],
        onScroll: () => {
            paginacao_carregar_mais_registros()
        }
    })
    
    await mostrar_itens(unidade_selecionada)
    
    criar_elemento({
        tipo: 'div',
        classes: 'f df-c-e w-98 ml-1 hr-2 font-102 negrito mt-1',
        texto: '3 Fonte de Dados',
        destino: ['conteudo']
    })
    
    let fontes = [
        'Relatórios oficiais, histórico de consumo, inventários, sistemas de controle.',
        'Projeções baseadas em parte dos dados disponíveis, cálculos técnicos ou comparativos.',
        'Opinião do solicitante, leventamentos preliminares, ausência de registros confiáveis.'
    ]
    for(let c1 = 0; c1 < fontes.length; c1++){
        let fonte = fontes[c1]
        
        criar_elemento({
            tipo: 'input',
            categoria: 'checkbox',
            classes: 'f df-c-e w-98 ml-1 hr-2 mt-1',
            texto: fonte,
            destino: ['conteudo']
        })
    }
    
    criar_elemento({
        tipo: 'div',
        classes: 'f df-c-e w-98 ml-1 hr-2 font-102 negrito mt-3',
        texto: '4 Exemplo de Uso',
        destino: ['conteudo']
    })
    
    let usos = [
        'Solicitação de material com base no consumo médio mensal dos últimos meses registrado no almoxarifado.',
        'Solicitação de material projetada a partir da média de 6 meses sem considerar sazonalidades.',
        'Solicitação de material sem histórico de uso ou com base em expectativa de aumento de demanda.'
    ]
    for(let c1 = 0; c1 < usos.length; c1++){
        let uso = usos[c1]
        
        criar_elemento({
            tipo: 'input',
            categoria: 'checkbox',
            classes: 'f df-c-e w-98 ml-1 hr-2 mt-1',
            texto: uso,
            destino: ['conteudo']
        })
    }
  
    criar_elemento({
        id: 'container_confiabilidade',
        tipo: 'div',
        classes: 'f w-98 ml-1 mt-1',
        destino: ['conteudo']
    })
    
    criar_elemento({
        id: 'assinatura_digital',
        tipo: 'div',
        classes: 'f w-50 ml-25 pt-05 mt-3 texto-centralizado texto-centralizado pointer',
        texto: '<b>Clique aqui para assinar digitalmente</b>',
        destino: ['conteudo'],
        onClick: async () => {
            await assinar_digitalmente()
        }
    })
    
    criar_elemento({
        tipo: 'div',
        classes: 'f df-c-c w-98 ml-1 hr-01 mt-1 texto-centralizado texto-centralizado',
        texto: '____________________________________________________',
        destino: ['conteudo']
    })
    
    criar_elemento({
        tipo: 'div',
        classes: 'f df-c-c w-98 ml-1 hr-2 font-1 mt-1 texto-centralizado',
        texto: `Rio de Janeiro, ${data_por_extenso(data_atual)}`,
        destino: ['conteudo']
    })
}

async function construir_pdf(){
    await loading_comeco()
    await paginacao_carregar_todos()
    loading_final()
    print()   
}

async function construir_pdf_total(){
    await loading_comeco()
    registros_adicionados = 0
    for(let c1 = 0; c1 < lista_de_unidades.length; c1++){
        let indice = c1
        let unidade = lista_de_unidades[c1]
        // cabecalho
        construir_base(unidade,indice)
        
        let parametros = {unidade: unidade, filtros: {grupo_id: ultimo_grupo} }
        let registros = await api(`${link_do_sistema}/api/itens_unidade_total.php`, parametros)
        
        criar_elemento({
            id: `cabecalho_${indice}`,
            tipo: 'div',
            classes: `f w-98 ml-1 hr-2 d-flex bg-27548A mt-1 cor-white pt-05 mr-1`,
            destino: ['conteudo_unidades']
        })
        
        let cabecalho = [
            'Grupo',
            'Nome do Grupo',
            'Código SIGMA',
            'Código BR',
            'Descritivo',
            'Estimativa Anual'
        ]
        
        // aquii
        
        for(let c1 = 0; c1 < cabecalho.length; c1++){
            let atributo = cabecalho[c1]
            let tamanho = 20
            if (atributo == 'Descritivo') {
                tamanho = 40
            }
            let ocultar = ''
    
            criar_elemento({
                tipo: 'div',
                classes: `f w-${tamanho} h-100 texto-centralizado df-c-c ${ocultar}`,
                texto: atributo,
                destino: [`cabecalho_${indice}`]
            }) 
        }
        
        for(let c2 = 0; c2 < registros.length; c2++){
            inserir_registro_dfd2(registros[c2],registros_adicionados)
        }
        construir_base2(unidade,indice)
    }
    loading_final()
    print()
    remover_elemento('conteudo_unidades')
   criar_elemento({
        id: 'conteudo_unidades',
        tipo: 'div',
        classes: 'f w-98 ml-1 mt-1',
        destino: ['conteudo']
    })
}

function construir_base(unidade, indice){
   criar_elemento({
        id: `informacoes_${indice}`,
        tipo: 'div',
        classes: 'f w-98 ml-1 hr-5 mt-1',
        destino: ['conteudo_unidades']
    })
    
    criar_elemento({
        tipo: 'div',
        classes: 'f df-c-c w-5 h-100 bg-black',
        imagem: ['imagens/logo_prefeitura','png'], 
        destino: [`informacoes_${indice}`]
    })
    
    criar_elemento({
        id: `textos_${indice}`,
        tipo: 'div',
        classes: 'f w-94 pl-1 h-100 d-flex flex-direction-column justify-content-center',
        destino: [`informacoes_${indice}`]
    })
    
    criar_elemento({
        tipo: 'div',
        classes: 'f negrito font-2',
        texto: 'PREFEITURA DA CIDADE DO RIO DE JANEIRO',
        destino: [`textos_${indice}`]
    })
    
    criar_elemento({
        tipo: 'div',
        classes: 'f font-105',
        texto: 'Secretaria Municipal de Saúde',
        destino: [`textos_${indice}`]
    })
    
    criar_elemento({
        tipo: 'div',
        classes: 'f df-c-c w-100 hr-2 texto-centralizado font-105 cor-2f71d7 sublinhado negrito mt-1',
        texto: 'DOCUMENTAÇÃO DE FORMALIZAÇÃO DE DEMANDA (DFD)',
        destino: ['conteudo_unidades']
    })
    
    criar_elemento({
        tipo: 'div',
        classes: 'f df-c-e w-98 ml-1 hr-2 font-102 negrito mt-1',
        texto: '1. Identificação da Área Requisitante',
        destino: ['conteudo_unidades']
    })

    
    criar_elemento({
        tipo: 'div',
        classes: 'f w-29 ml-1 bg-27548A mt-02 cor-white pt-05 df-c-c hr-1',
        texto: 'Unidade',
        destino: ['conteudo_unidades']
    })
    
    criar_elemento({
        tipo: 'div',
        classes: 'f w-68 bg-f5f5f5 pt-05 mt-02 hr-1 pl-1',
        texto: unidade,
        destino: ['conteudo_unidades']
    })
    
    criar_elemento({
        tipo: 'div',
        classes: 'f w-29 ml-1 bg-27548A mt-02 cor-white pt-05 df-c-c hr-1',
        texto: 'Assinatura',
        destino: ['conteudo_unidades']
    })
    
    criar_elemento({
        tipo: 'div',
        classes: 'f w-68 bg-f5f5f5 pt-05 mt-02 hr-1 pl-1',
        texto: '-',
        destino: ['conteudo_unidades']
    })
    
    criar_elemento({
        tipo: 'div',
        classes: 'f df-c-e w-49 ml-1 hr-2 font-102 negrito mt-1',
        texto: '2. Demanda - Quantidade',
        destino: ['conteudo_unidades']
    })
    
}

function construir_base2(unidade,indice){
    criar_elemento({
        id: 'assinatura_digital',
        tipo: 'div',
        classes: 'f w-50 ml-25 pt-05 mt-3 texto-centralizado texto-centralizado pointer',
        destino: ['conteudo_unidades']
    })
    
    criar_elemento({
        tipo: 'div',
        classes: 'f df-c-c w-98 ml-1 hr-01 mt-1 texto-centralizado texto-centralizado',
        texto: '____________________________________________________',
        destino: ['conteudo_unidades']
    })
    
    criar_elemento({
        tipo: 'div',
        classes: 'f df-c-c w-98 ml-1 hr-2 font-1 mt-1 texto-centralizado',
        texto: `Rio de Janeiro, ${data_por_extenso(data_atual)}`,
        destino: ['conteudo_unidades']
    })
}

async function pagina_unidades(){
    remover_elemento('conteudo')
    
    criar_elemento({
        id: 'conteudo',
        tipo: 'div',
        classes: 'f w-100 h-90 scroll-y',
        destino: ['janela']
    })
    
    criar_elemento({
        id: 'total_de_resultados',
        tipo: 'div',
        classes: 'f df-c-d w-49 hr-2 texto-centralizado mt-1',
        texto: '? Resultados',
        destino: ['conteudo']
    })
    
    criar_elemento({
        id: 'filtros',
        tipo: 'div',
        classes: 'f w-98 ml-1 hr-2 mt-1 d-flex gap-05',
        destino: ['conteudo']
    }) 
    
    criar_elemento({
        id: 'categoria',
        tipo: 'input',
        classes: 'f w-15 hr-100 borda-radius texto-centralizado',
        destino: ['filtros'],
        placeholder: 'Nome do Grupo',
        onKeyUp: (event) =>{
            let tecla = event.key
            let elemento = document.getElementById('categoria').value
            if(tecla == 'Enter' || elemento == ''){
                if(elemento == ''){
                }
                else{
                }
            }
        }
    }) 

    criar_elemento({
        id: 'processo',
        tipo: 'input',
        classes: 'f w-15 hr-100 borda-radius texto-centralizado',
        destino: ['filtros'],
        placeholder: 'Processo',
        onKeyUp: (event) =>{
            let tecla = event.key
            let elemento = document.getElementById('processo').value
            if(tecla == 'Enter' || elemento == ''){
                if(elemento == ''){
                }
                else{
                }
            }
        }
    }) 

    criar_elemento({
        id: 'codigo_sigma',
        tipo: 'input',
        classes: 'f w-15 hr-100 borda-radius texto-centralizado',
        destino: ['filtros'],
        placeholder: 'Código Sigma',
        onKeyUp: (event) =>{
            let tecla = event.key
            let elemento = document.getElementById('codigo_sigma').value
            if(tecla == 'Enter' || elemento == ''){
                if(elemento == ''){
                }
                else{
                }
            }
        }
    }) 

    criar_elemento({
        id: 'item',
        tipo: 'input',
        classes: 'f w-15 hr-100 borda-radius texto-centralizado',
        destino: ['filtros'],
        placeholder: 'Item',
        onKeyUp: (event) =>{
            let tecla = event.key
            let elemento = document.getElementById('item').value
            if(tecla == 'Enter' || elemento == ''){
                if(elemento == ''){
                }
                else{
                }
            }
        }
    }) 
    
    criar_elemento({
        tipo: 'div',
        classes: 'f w-15 hr-100 borda-radius texto-centralizado df-c-c cor-white bg-3484ac pointer',
        destino: ['filtros'],
        texto: 'Quantidades Fora',
        onClick: async () => {
        }
    }) 
    
    criar_elemento({
        tipo: 'div',
        classes: 'f w-15 hr-100 borda-radius texto-centralizado df-c-c cor-white bg-3484ac pointer',
        destino: ['filtros'],
        texto: 'Gerar PDF',
        onClick: async () => {
            await loading_comeco()
            await paginacao_carregar_todos()
            loading_final()
             print()
        }
    }) 
    

    criar_elemento({
        tipo: 'div',
        classes: 'f w-15 hr-100 borda-radius texto-centralizado df-c-c cor-white bg-3484ac pointer',
        destino: ['filtros'],
        texto: 'Gerar Excel',
        onClick: async () => {
            await loading_comeco()
            await gerar_excel()
            loading_final()
        }
    }) 
    
    let largura_da_tabela = 300
    
    criar_elemento({
        id: 'cabecalho',
        tipo: 'div',
        classes: `f w-${largura_da_tabela} ml-1 hr-2 d-flex bg-27548A mt-1 cor-white pt-05 mr-1`,
        destino: ['conteudo']
    })
    
    let cabecalho = [
        'Grupo',
        'Nome do Grupo',
        'Código SIGMA',
        'Código BR',
        'Processo',
        'Descritivo',
        'Quantidade das Unidades',
        'Unidades Atendidas',
        'Quantidade Média',
        'CDSAP1',
        'CDSAP21',
        'CDSAP22',
        'CDSAP31',
        'CDSAP32',
        'CDSAP33',
        'CDSAP4',
        'CDSAP51',
        'CDSAP52',
        'CDSAP53',
        'HMSA',
        'HMFM',
        'HMMC',
        'HMJ',
        'HMPW',
        'HMSF',
        'HMCD',
        'HMP',
        'HMASNS',
        'HMHP',
        'HMRG',
        'HMFST',
        'HMAF',
        'IMASJM',
        'HMRPS',
        'HMNSL',
        'HMBR',
        'HMLJ',
        'HMPP',
        'HMRM',
        'HMAR',
        'HGGMP',
        'HMMR',
        'NCHMP',
        'HMRF'
    ]
    
    for(let c1 = 0; c1 < cabecalho.length; c1++){
        let atributo = cabecalho[c1]
        let tamanho = 20
        if (atributo == 'Descritivo') {
            tamanho = 40
        }
        let ocultar = ''

        criar_elemento({
            tipo: 'div',
            classes: `f w-${tamanho} h-100 texto-centralizado df-c-c ${ocultar}`,
            texto: atributo,
            destino: ['cabecalho']
        }) 
    }
    
    criar_elemento({
        id: 'registros',
        tipo: 'div',
        classes: `f w-${largura_da_tabela} ml-1 hr-35 scroll-y-invisivel mr-1`,
        destino: ['conteudo'],
        onScroll: () => {
            paginacao_carregar_mais_registros()
        }
    })
    
    dados = {
        destino: 'DFD',
        
        atributos: `        
            id,
            pca,
            gerencia,
            processo,
            codigo_br,
            codigo_sigma,
            item,
            grupo_id,
            grupo_nome,
            data_prevista,
            (
                q_CDSAP1 +
                q_CDSAP21 +
                q_CDSAP22 +
                q_CDSAP31 +
                q_CDSAP32 +
                q_CDSAP33 +
                q_CDSAP4 +
                q_CDSAP51 + 
                q_CDSAP52 +
                q_CDSAP53 +
                q_HMSA +
                q_HMFM +
                q_HMMC +
                q_HMJ +
                q_HMPW +
                q_hmsf +
                q_HMCD +
                q_HMP +
                q_HMASNS +
                q_HMHP +
                q_HMRG +
                q_HMFST +
                q_HMAF +
                q_imasjm +
                q_HMRPS +
                q_HMNSL +
                q_HMBR +
                q_hmlj +
                q_HMPP +
                q_HMRM +
                q_HMAR +
                q_HGGMP +
                q_HMMR +
                q_NCHMP +
                q_HMRF
            ) AS quantidade,
            q_CDSAP1,
            q_CDSAP21,
            q_CDSAP22,
            q_CDSAP31,
            q_CDSAP32,
            q_CDSAP33,
            q_CDSAP4,
            q_CDSAP51, 
            q_CDSAP52,
            q_CDSAP53,
            q_HMSA,
            q_HMFM,
            q_HMMC,
            q_HMJ,
            q_HMPW,
            q_HMSF,
            q_HMCD,
            q_HMP,
            q_HMASNS,
            q_HMHP,
            q_HMRG,
            q_HMFST,
            q_HMAF,
            q_IMASJM,
            q_HMRPS,
            q_HMNSL,
            q_HMBR,
            q_HMLJ,
            q_HMPP,
            q_HMRM,
            q_HMAR,
            q_HGGMP,
            q_HMMR,
            q_NCHMP,
            q_HMRF,
            quantidade_total,
            unidades_atendidas,
            ROUND(quantidade_total / unidades_atendidas, 0) AS quantidade_media
        `,
        
        // Marcador b
        
        base:`
            FROM cla_dfd
            WHERE id > 0
        `,
        
        ordenacao: `
            ORDER BY 
                gerencia ASC,
                grupo_id ASC
        `,
        
        funcao_de_inserir: inserir_registro_dfd_total
    }   
    quantidades_informadas = []
    await paginacao_iniciar(dados)
    
    
    // alert('Módulo em construção !')
}

async function inserir_usuario_pendente(registro,indice){
    let id = registro['id']
    var emailll = registro['email']
    elem('div',['class',''],registro['nome'], ['conteudo'], 'f usuario df-c-c w-77 hr-2 bg-F1EFEC mt-1 ml-1 texto-centralizado')
    elem('div',['class',''],'Permitir Acesso', ['conteudo'], 'acesso f bg-27548A df-c-c w-20 hr-2 cor-white mt-1 ml-1 texto-centralizado pointer borda-radius')
    document.getElementsByClassName('acesso')[indice].addEventListener('click',async function(){
        var escolha = confirm('Você realmente deseja permitir que esse usuário possa acessar o sistema ?')
        if(escolha == true){
            // email('Coordenadoria de Licitações e Aquisições',`${emailll}`, 'assunto', `Seu acesso ao SIMP foi autorizado`, '')
            var usuario = document.getElementsByClassName('usuario')[indice].innerHTML
            let resultado = await api(`${link_do_sistema}/api/usuario_autorizado.php`,{id: id})
            await pagina_usuarios()
        }
    })
}


async function pagina_geral(){
    remover_elemento('conteudo')
    criar_janela()
    
    criar_elemento({
        id: 'menu',
        tipo: 'div',
        classes: 'f w-100 h-10 bg-27548A cor-white d-flex ai-center font-cabin',
        destino: ['janela']
    })
    
    criar_elemento({
        id: 'foto',
        tipo: 'div',
        classes: 'f w-5 ml-1 h-80 redondo pointer',
        imagem: ['imagens/perfil','png'],
        legenda: ['Clique para Sair','abaixo'],
        onClick: () => {
            remover_elemento('janela')
            pagina_login()
        },
        destino: ['menu']
    })
    
    criar_elemento({
        id: 'dados_do_usuario',
        tipo: 'div',
        classes: 'f w-90 ml-1',
        texto: '<b>Usuário</b><br>Unidade Logada',
        destino: ['menu']
    })
    
    if(acesso == 'TOTAL'){
        criar_elementos([
            {
                id: 'icone_usuarios',
                tipo: 'div',
                classes: 'fr w-3 h-50 mr-1 pointer',
                imagem: ['imagens/icone_usuarios','png'],
                legenda: ['Usuários','abaixo'],
                destino: ['menu'],
                onClick: () => {
                    pagina_usuarios()
                }
            }
        ])
    }
    
    /*
            {
                id: 'icone_unidades',
                tipo: 'div',
                classes: 'fr w-3 h-50 mr-1 pointer',
                imagem: ['imagens/icone_unidades','png'],
                legenda: ['Unidades','abaixo'],
                destino: ['menu'],
                onClick: () => {
                    pagina_unidades()
                }
            }
    */
    
    
        criar_elementos([
            {
                id: 'icone_itens',
                tipo: 'div',
                classes: 'fr w-3 h-50 mr-1 pointer',
                imagem: ['imagens/icone_itens','png'],
                legenda: ['Itens','abaixo'],
                destino: ['menu'],
                onClick: () => {
                    pagina_total()
                }
            }
        ])
    
    
    criar_elemento({
        id: 'conteudo',
        tipo: 'div',
        classes: 'f w-100 h-90 scroll-x font-cabin',
        destino: ['janela']
    })
    
    await pagina_total()
}

async function pagina_usuarios(){
    criar_conteudo()
    
    let registros = await api(`${link_do_sistema}/api/usuarios_novos.php`)
    for(c1 = 0; c1 < registros.length; c1 ++){
        inserir_usuario_pendente(registros[c1],c1)
    }
}

async function atualizar_assinatura(){
    let parametros = {unidade: unidade_selecionada, grupo_id: ultimo_grupo}
    let registro = await api(`${link_do_sistema}/api/consultar_assinatura.php`, parametros)
    
    let nome = registro[0]['assinatura_usuario']
    let cargo = registro[0]['assinatura_cargo']
    let data = converter_data_database_para_normal(registro[0]['assinatura_data'])
    let hora = registro[0]['assinatura_hora']
    let matricula = registro[0]['assinatura_matricula']
    let email = registro[0]['unidade_email']
    
    document.getElementById('container_assinatura_valor').value = ''
    if(nome != ''){
        document.getElementById('container_assinatura_valor').value = `Assinado digitalmente por ${nome} - ${data} às ${hora}`
    }
    document.getElementById('container_e-mail do responsável_valor').value = email
    
    document.getElementById('assinatura_digital').innerHTML = `<b>Clique aqui para assinar digitalmente</b>`
    if(nome != ''){
        document.getElementById('assinatura_digital').innerHTML = `Assinado digitalmente por<br><br><b>${usuario_logado}</b><br>${cargo_logado}<br>Matrícula ${matricula_logado}`
    }
    
}

async function assinar_digitalmente(){
    if(unidade_logada == unidade_selecionada){
        
        let parametros = {grupo_id: ultimo_grupo, unidade: unidade_logada}
        let itens_zerados = await api(`${link_do_sistema}/api/itens_zerados.php`, parametros)
        
        if(itens_zerados != ''){
            alert('É necessário informar a quantidade de todos os itens antes de assinar !')
        }
        if(itens_zerados == ''){
        let senha_digitada = prompt('Informe sua senha para confirmar a assinatura')
            if(senha_digitada){
                // API para validação da senha
                let parametros = {id: id_logado, senha: senha_digitada}
                let resultado = await api(`${link_do_sistema}/api/auth_senha.php`, parametros)
                if(resultado == true){
                    
                    let hora = await hora_atual()
                    
                    parametros = {
                        unidade: unidade_logada,
                        usuario: usuario_logado,
                        cargo: cargo_logado,
                        matricula: matricula_logado,
                        data: data_atual,
                        hora: hora,
                        email: email_logado,
                        grupo_id: ultimo_grupo
                    }
                    resultado = await api(`${link_do_sistema}/api/assinar.php`, parametros)
                    
                    alert('Assinatura Digital realizada com sucesso !')
                    await atualizar_assinatura()
                }
                if(resultado == false){
                    alert('Senha incorreta !')
                }
            }  
        }
    }
}

async function gerar_excel(){
    let registros = await api(`${link_do_sistema}/api/excel_unidades.php`)
    
    let dados = []
    for(let c1 = 0; c1 < registros.length; c1++){
        let registro = registros[c1]
        
        let lista = [
            registro['grupo_id'],
            registro['grupo_nome'],
            registro['processo'],
            registro['codigo_sigma'],
            registro['codigo_br'],
            registro['item'],
            registro['quantidade_total'],
            registro['CDSAP1'],
            registro['CDSAP21'],
            registro['CDSAP22'],
            registro['CDSAP31'],
            registro['CDSAP32'],
            registro['CDSAP33'],
            registro['CDSAP4'],
            registro['CDSAP51'],
            registro['CDSAP52'],
            registro['CDSAP53'],
            registro['HMSA'],
            registro['HMFM'],
            registro['HMMC'],
            registro['HMJ'],
            registro['HMPW'],
            registro['HMSF'],
            registro['HMCD'],
            registro['HMP'],
            registro['HMASNS'],
            registro['HMHP'],
            registro['HMRG'],
            registro['HMFST'],
            registro['HMAF'],
            registro['IMASJM'],
            registro['HMRPS'],
            registro['HMNSL'],
            registro['HMBR'],
            registro['HMLJ'],
            registro['HMPP'],
            registro['HMRM'],
            registro['HMAR'],
            registro['HGGMP'],
            registro['HMMR'],
            registro['NCHMP'],
            registro['HMRF']
        ]
        
        dados.push(lista)
    }
    
    cabecalho = [
        'Grupo',
        'Nome do Grupo',
        'Processo',
        'Código Sigma',
        'Código BR',
        'Descrição do Produto',
        'Quantidade das Unidades',
        'CAP 1',
        'CAP 2.1',
        'CAP 2.2',
        'CAP 3.1',
        'CAP 3.2',
        'CAP 3.3',
        'CAP 4',
        'CAP 5.1',
        'CAP 5.2',
        'CAP 5.3',
        'HMSA',
        'HMFM',
        'HMMC',
        'HMJ',
        'HMPW',
        'HMSF',
        'HMCD',
        'HMP',
        'HMASNS',
        'HMHP',
        'HMRG',
        'HMFST',
        'HMAF',
        'IMASJM',
        'HMRPS',
        'HMNSL',
        'HMBR',
        'HMLJ',
        'HMPP',
        'HMRM',
        'HMAR',
        'HGGMP',
        'HMMR',
        'NCHMP',
        'HMRF'
    ]
    
    gerar_planilha('DFD', 'Itens', cabecalho, dados, 17)
}

async function gerar_planilha(nome, aba, cabecalho, dados, largura_coluna) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(aba);

  const allData = [cabecalho, ...dados];

  allData.forEach((row, rowIndex) => {
    const excelRow = worksheet.getRow(rowIndex + 1);
    row.forEach((val, colIndex) => {
      const cell = excelRow.getCell(colIndex + 1);
      cell.value = val;

      // Estilo geral para todas as células: alinhamento ao centro + bordas
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };

      // Cabeçalho em negrito
      if (rowIndex === 0) {
        cell.font = { bold: true, size: 11 };
      }
    });
    excelRow.commit();
  });

  worksheet.columns.forEach(col => {
    col.width = largura_coluna;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nome}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

async function pagina_individual(){
    await loading_comeco()
    mostrar_itens()
    loading_final()
}

function tecla_pressionada ( event ) {
    var tecla = event.key
    return tecla
}

async function mostrar_itens(unidade_selecionada){
    atualizacoes = []

    if(['SUBPAV','SUBHUE'].includes(unidade_selecionada) == true){
        let dados = {
            link: `${link_do_sistema}/api/itens_unidades.php`, 
            funcao_de_inserir: inserir_registro_dfd,
            parametros: {filtros: {grupo_id: ultimo_grupo} }
        }
        await iniciar_paginacao(dados)
    }
    
    if(['SUBPAV','SUBHUE'].includes(unidade_selecionada) == false){
        let dados = {
            link: `${link_do_sistema}/api/itens_unidade.php`, 
            funcao_de_inserir: inserir_registro_dfd,
            parametros: {unidade: unidade_selecionada, filtros: {grupo_id: ultimo_grupo} }
        }
        await iniciar_paginacao(dados)
    }
}

function maiusculo(dado){
    if(['',null,undefined,'null'].includes(dado)){
        return '-'
    }
    else{
        return dado.toUpperCase()
    }
}

function minusculo(dado){
    if(['',null,undefined,'null'].includes(dado)){
        return '-'
    }
    else{
        return dado.toLowerCase()
    }
}

function inserir_registro_dfd2(registro,indice){
    registros_adicionados += 1
    let id = registro['id']
    let codigo_br = registro['codigo_br']
    let codigo_sigma = registro['codigo_sigma']
    let item = maiusculo(registro['item'])
    let usuario = registro['nome']
    let informado = registro['informado']
    
    let grupo_id = registro['grupo_id']
    let grupo_nome = maiusculo(registro['grupo_nome'])
    
    let quantidade = registro['quantidade']
    if(quantidade == 0 && informado == 'SIM'){
        quantidade = '-'
    }
    let unidade_coluna = ''
    if(acesso == 'UNIDADE'){
        unidade_coluna = `q_${unidade_selecionada}`
    }
    
    criar_elemento({
        id: `Registros${indice}`,
        tipo: 'div',
        classes: 'f w-98 ml-1 texto-centralizado d-flex bg-f5f5f5 mt-02 pt-05 font-07 ai-center register',
        destino: ['conteudo_unidades'],
        legenda: [usuario,'abaixo']
    }) 

    let atributos = [
        grupo_id,
        grupo_nome,
        codigo_sigma,
        codigo_br,
        item,
        ''
    ]
    
    if(acesso == 'TOTAL'){
        atributos.push('Data Prevista')
    }

    criar_elemento({
        tipo: 'div',
        classes: 'f w-20 h-100 texto-centralizado df-c-c atributo_valor',
        texto: grupo_id,
        destino: [`Registros${indice}`]
    }) 
    
    criar_elemento({
        tipo: 'div',
        classes: 'f w-20 h-100 texto-centralizado df-c-c atributo_valor',
        texto: grupo_nome,
        destino: [`Registros${indice}`]
    }) 
    
    criar_elemento({
        tipo: 'div',
        classes: 'f w-20 h-100 texto-centralizado df-c-c atributo_valor',
        texto: codigo_sigma,
        destino: [`Registros${indice}`]
    }) 
    
    criar_elemento({
        tipo: 'div',
        classes: 'f w-20 h-100 texto-centralizado df-c-c atributo_valor',
        texto: codigo_br,
        destino: [`Registros${indice}`]
    }) 

    criar_elemento({
        tipo: 'div',
        classes: 'f w-40 h-100 texto-centralizado df-c-c atributo_valor',
        texto: item,
        destino: [`Registros${indice}`]
    }) 
    
    // aqui
    let somente_leitura = false
    if(acesso == 'TOTAL'){
        somente_leitura = true
    }
    
    criar_elemento({
        id: `quantidade${indice}`,
        tipo: 'input',
        classes: 'f w-20 h-100 texto-centralizado df-c-c bg-f5f5f5 borda-none atributo_valor',
        valor: quantidade,
        somente_leitura: somente_leitura,
        destino: [`Registros${indice}`]
    }) 
}


function inserir_registro_dfd(registro){
    quantidades_informadas.push('')
    let indice = paginacao['registros_adicionados']
    let id = registro['id']
    let codigo_br = registro['codigo_br']
    let codigo_sigma = registro['codigo_sigma']
    let item = maiusculo(registro['item'])
    let usuario = registro['usuario']
    let informado = registro['informado']
    
    let grupo_id = registro['grupo_id']
    let grupo_nome = maiusculo(registro['grupo_nome'])
    
    let quantidade = registro['quantidade']
    if(quantidade == 0 && informado == 'SIM'){
        quantidade = '-'
    }
    let unidade_coluna = ''
    if(acesso == 'UNIDADE'){
        unidade_coluna = `q_${unidade_selecionada}`
    }
    
    let q_CDSAP1 = registro['q_CDSAP1']
    let q_CDSAP21 = registro['q_CDSAP21']
    let q_CDSAP22 = registro['q_CDSAP22']
    let q_CDSAP31 = registro['q_CDSAP31']
    let q_CDSAP32 = registro['q_CDSAP32']
    let q_CDSAP33 = registro['q_CDSAP33']
    let q_CDSAP4 = registro['q_CDSAP4']
    let q_CDSAP51 = registro['q_CDSAP51']
    let q_CDSAP52 = registro['q_CDSAP52']
    let q_CDSAP53 = registro['q_CDSAP53']
    let q_HMSA = registro['q_HMSA']
    let q_HMFM = registro['q_HMFM']
    let q_HMMC = registro['q_HMMC']
    let q_HMJ = registro['q_HMJ']
    let q_HMPW = registro['q_HMPW']
    let q_HMSF = registro['q_HMSF']
    let q_HMCD = registro['q_HMCD']
    let q_HMP = registro['q_HMP']
    let q_HMASNS = registro['q_HMASNS']
    let q_HMHP = registro['q_HMHP']
    let q_HMRG = registro['q_HMRG']
    let q_HMFST = registro['q_HMFST']
    let q_HMAF = registro['q_HMAF']
    let q_IMASJM = registro['q_IMASJM']
    let q_HMRPS = registro['q_HMRPS']
    let q_HMNSL = registro['q_HMNSL']
    let q_HMBR = registro['q_HMBR']
    let q_HMLJ = registro['q_HMLJ']
    let q_HMPP = registro['q_HMPP']
    let q_HMRM = registro['q_HMRM']
    let q_HMAR = registro['q_HMAR']
    let q_HGGMP = registro['q_HGGMP']
    let q_HMMR = registro['q_HMMR']
    let q_NCHMP = registro['q_NCHMP']
    let q_HMRF = registro['q_HMRF']
    
    criar_elemento({
        id: `Registro${indice}`,
        tipo: 'div',
        classes: 'f w-100 texto-centralizado d-flex bg-f5f5f5 mt-02 pt-05 font-07 ai-center register',
        destino: ['registros'],
        legenda: [usuario,'abaixo']
    }) 

    let atributos = [
        grupo_id,
        grupo_nome,
        codigo_sigma,
        codigo_br,
        item,
        ''
    ]
    
    if(acesso == 'TOTAL'){
        atributos.push('Data Prevista')
    }

    criar_elemento({
        tipo: 'div',
        classes: 'f w-20 h-100 texto-centralizado df-c-c atributo_valor',
        texto: grupo_id,
        destino: [`Registro${indice}`]
    }) 
    
    criar_elemento({
        tipo: 'div',
        classes: 'f w-20 h-100 texto-centralizado df-c-c atributo_valor',
        texto: grupo_nome,
        destino: [`Registro${indice}`]
    }) 
    
    criar_elemento({
        tipo: 'div',
        classes: 'f w-20 h-100 texto-centralizado df-c-c atributo_valor',
        texto: codigo_sigma,
        destino: [`Registro${indice}`]
    }) 
    
    criar_elemento({
        tipo: 'div',
        classes: 'f w-20 h-100 texto-centralizado df-c-c atributo_valor',
        texto: codigo_br,
        destino: [`Registro${indice}`]
    }) 

    criar_elemento({
        tipo: 'div',
        classes: 'f w-40 h-100 texto-centralizado df-c-c atributo_valor',
        texto: item,
        destino: [`Registro${indice}`]
    }) 
    
    // aqui
    let somente_leitura = false
    if(acesso == 'TOTAL'){
        somente_leitura = true
    }
    
    criar_elemento({
        id: `quantidade${indice}`,
        tipo: 'input',
        classes: 'f w-20 h-100 texto-centralizado df-c-c bg-f5f5f5 borda-none atributo_valor',
        valor: quantidade,
        somente_leitura: somente_leitura,
        destino: [`Registro${indice}`],
        onKeyUp: async(event) =>{
            let unidade_quantidade = document.getElementById(`quantidade${indice}`).value
            if(unidade_coluna != ''){
                if(unidade_quantidade == ''){
                    atualizacoes.push({
                        informado: 'NÃO',
                        usuario: '',
                        quantidade: 0,
                        id: id
                    })
                }
                if(unidade_quantidade != ''){
                    atualizacoes.push({
                        informado: 'SIM',
                        usuario: usuario_logado,
                        quantidade: unidade_quantidade,
                        id: id
                    })
                }    
            }
        },
        onEnter: (event) => {
          event.preventDefault();
        
          // Pega todos os inputs da página (ou substitua 'input' pelo seletor do seu container)
          const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
        
          // Pega o input atual
          const currentInput = event.target;
        
          // Encontra o índice do input atual na lista
          const index = inputs.indexOf(currentInput);
        
          // Se não for o último input, foca o próximo
          if (index > -1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
          }
        }
    }) 
}


function inserir_registro_dfd_total(registro){
    let indice = paginacao['registros_adicionados']
    let id = registro['id']
    let pca = registro['pca']
    let gerencia = registro['gerencia']
    let processo = registro['processo']
    let codigo_br = registro['codigo_br']
    let codigo_sigma = registro['codigo_sigma']
    let item = maiusculo(registro['item'])
    
    let grupo_id = registro['grupo_id']
    let grupo_nome = maiusculo(registro['grupo_nome'])
    let data_prevista = maiusculo(registro['data_prevista'])
    
    let quantidade = registro['quantidade']
    
    let q_CDSAP1 = registro['q_CDSAP1']
    let q_CDSAP21 = registro['q_CDSAP21']
    let q_CDSAP22 = registro['q_CDSAP22']
    let q_CDSAP31 = registro['q_CDSAP31']
    let q_CDSAP32 = registro['q_CDSAP32']
    let q_CDSAP33 = registro['q_CDSAP33']
    let q_CDSAP4 = registro['q_CDSAP4']
    let q_CDSAP51 = registro['q_CDSAP51']
    let q_CDSAP52 = registro['q_CDSAP52']
    let q_CDSAP53 = registro['q_CDSAP53']
    let q_HMSA = registro['q_HMSA']
    let q_HMFM = registro['q_HMFM']
    let q_HMMC = registro['q_HMMC']
    let q_HMJ = registro['q_HMJ']
    let q_HMPW = registro['q_HMPW']
    let q_HMSF = registro['q_HMSF']
    let q_HMCD = registro['q_HMCD']
    let q_HMP = registro['q_HMP']
    let q_HMASNS = registro['q_HMASNS']
    let q_HMHP = registro['q_HMHP']
    let q_HMRG = registro['q_HMRG']
    let q_HMFST = registro['q_HMFST']
    let q_HMAF = registro['q_HMAF']
    let q_IMASJM = registro['q_IMASJM']
    let q_HMRPS = registro['q_HMRPS']
    let q_HMNSL = registro['q_HMNSL']
    let q_HMBR = registro['q_HMBR']
    let q_HMLJ = registro['q_HMLJ']
    let q_HMPP = registro['q_HMPP']
    let q_HMRM = registro['q_HMRM']
    let q_HMAR = registro['q_HMAR']
    let q_HGGMP = registro['q_HGGMP']
    let q_HMMR = registro['q_HMMR']
    let q_NCHMP = registro['q_NCHMP']
    let q_HMRF = registro['q_HMRF']
    
    let quantidade_total = registro['quantidade_total']
    let unidades_atendidas = registro['unidades_atendidas']
    let quantidade_media = registro['quantidade_media']
    
    criar_elemento({
        id: `Registro${indice}`,
        tipo: 'div',
        classes: 'f w-100 texto-centralizado d-flex bg-f5f5f5 mt-02 pt-05 font-07 ai-center register',
        destino: ['registros']
    }) 
    

    let atributos = [
        grupo_id,
        grupo_nome,
        codigo_sigma,
        codigo_br,
        processo,
        item,
        quantidade_total,
        unidades_atendidas,
        quantidade_media,
        
        q_CDSAP1,
        q_CDSAP21,
        q_CDSAP22,
        q_CDSAP31,
        q_CDSAP32,
        q_CDSAP33,
        q_CDSAP4,
        q_CDSAP51, 
        q_CDSAP52,
        q_CDSAP53,
        q_HMSA,
        q_HMFM,
        q_HMMC,
        q_HMJ,
        q_HMPW,
        q_HMSF,
        q_HMCD,
        q_HMP,
        q_HMASNS,
        q_HMHP,
        q_HMRG,
        q_HMFST,
        q_HMAF,
        q_IMASJM,
        q_HMRPS,
        q_HMNSL,
        q_HMBR,
        q_HMLJ,
        q_HMPP,
        q_HMRM,
        q_HMAR,
        q_HGGMP,
        q_HMMR,
        q_NCHMP,
        q_HMRF
    ]
    
    for(let c1 = 0; c1 < atributos.length; c1++){
        let atributo = atributos[c1]
        let tamanho = 20
        let cor = ''
        if (c1 == 5) {
            tamanho = 40
        }
        if(c1 >= 9){
            if(atributo > 0 && atributo > registro['quantidade_media']){
                cor = `bg-D4C9BE`
            }
        }

        criar_elemento({
            tipo: 'div',
            classes: `f w-${tamanho} ${cor} h-100 texto-centralizado df-c-c`,
            texto: atributo,
            destino: [`Registro${indice}`]
        }) 
    }
}

function pagina_login(){
    criar_elemento({
        id: 'conteudo',
        tipo: 'div',
        classes: 'f w-100 h-100',
        destino: ['body']
    })
    
    criar_elemento({
        id: 'wallpaper',
        tipo: 'div',
        classes: 'f w-100 h-100 camada1',
        imagem: ['imagens/login','png'],
        destino: ['conteudo']
    })
    
    criar_elemento({
        id: 'filtro',
        tipo: 'div',
        classes: 'f w-100 h-100 bg-black absolute camada2 opacity-25',
        destino: ['conteudo']
    })
    
    criar_elemento({
        id: 'dados',
        tipo: 'div',
        classes: 'f w-30 ml-70 h-100 bg-0a2745 absolute camada3 df-c-c',
        destino: ['conteudo']
    })
    
    criar_elemento({
        id: 'login_card',
        tipo: 'div',
        classes: 'f w-100 borda-radius padding-2',
        destino: ['dados']
    })
    
    criar_elemento({
        tipo: 'div',
        texto: 'DFD',
        classes: 'f font-2 cor-white w-100 texto-centralizado sombra-black pt-05',
        destino: ['login_card']
    })
    
    criar_elemento({
        id: 'legenda_subunidade',
        tipo: 'div',
        classes: 'f w-99 pl-1 hr-2 cor-white font-102 sombra-black mt-1 none',
        texto: 'Subunidade',
        destino: ['login_card']
    })
    
    criar_elemento({
        id: 'subunidade',
        tipo: 'select',
        opcoes: ['Não','Sim'],
        classes: 'f bg-transparent w-99 pl-1 hr-2 cor-white font-1 sombra-black mt-02 borda-radius placeholder-branco outline borda-3484ac none',
        destino: ['login_card'],
    })
    
    criar_elemento({
        id: 'legenda_unidade',
        tipo: 'div',
        classes: 'f w-99 pl-1 hr-2 cor-white font-102 sombra-black mt-1 none',
        texto: 'Unidade',
        destino: ['login_card']
    })
    
    criar_elemento({
        id: 'unidade',
        tipo: 'filter_select_unico',
        opcoes: lista_de_unidades,
        classes: 'f bg-transparent w-99 pl-1 hr-2 cor-white font-1 sombra-black mt-02 borda-radius placeholder-branco outline borda-3484ac none',
        destino: ['login_card'],
    })
    
    
    criar_elemento({
        id: 'legenda_cargo',
        tipo: 'div',
        classes: 'f w-99 pl-1 hr-2 cor-white font-102 sombra-black mt-02 none',
        texto: 'Cargo',
        destino: ['login_card']
    })
    
    criar_elemento({
        id: 'cargo',
        tipo: 'select',
        opcoes: [ 'Diretor(a)', 'Outro'],
        classes: 'f bg-transparent w-99 pl-1 hr-2 cor-white font-1 sombra-black mt-02 borda-radius placeholder-branco outline borda-3484ac none',
        destino: ['login_card'],
        onChange: () => {
            let cargo = document.getElementById('cargo').value
            if(cargo == 'Outro'){
                remover_classe('cargo_digitavel','none')
            }
            if(cargo != 'Outro'){
                adicionar_classe('cargo_digitavel','none')
            }
        }
    })
    
    criar_elemento({
        id: 'cargo_digitavel',
        tipo: 'input',
        placeholder: 'Informe seu cargo',
        classes: 'f bg-transparent w-99 pl-1 hr-2 cor-white font-1 sombra-black mt-02 borda-radius placeholder-branco outline borda-3484ac none',
        destino: ['login_card'],
    })
    
    criar_elemento({
        id: 'legenda_nome',
        tipo: 'div',
        classes: 'f w-99 pl-1 hr-2 cor-white font-102 sombra-black none mt-1',
        texto: 'Nome Completo',
        destino: ['login_card']
    })
    
    criar_elemento({
        id: 'nome',
        tipo: 'input',
        classes: 'f bg-transparent w-99 pl-1 hr-2 cor-white font-1 sombra-black mt-02 borda-radius placeholder-branco outline borda-3484ac none',
        placeholder: 'Informe seu Nome Completo',
        destino: ['login_card']
    })
    
    criar_elemento({
        tipo: 'div',
        classes: 'f w-99 pl-1 hr-2 cor-white df-c-e font-102 sombra-black mt-02',
        texto: 'Usuário',
        destino: ['login_card']
    })
    
    criar_elemento({
        id: 'usuario',
        tipo: 'input',
        classes: 'f bg-transparent w-99 pl-1 hr-2 cor-white df-c-e font-1 sombra-black mt-02 borda-radius placeholder-branco outline borda-3484ac',
        placeholder: 'Informe seu CPF',
        texto: 'Usuário',
        destino: ['login_card'],
        onKeyUp: (tecla) => {
            if(tecla.key == 'Enter' ) {
                logar()
            }
        }
    })
    
    criar_elemento({
        tipo: 'div',
        classes: 'f w-99 pl-1 hr-2 cor-white df-c-e font-102 sombra-black mt-02',
        texto: 'Senha',
        destino: ['login_card']
    })
    
    criar_elemento({
        id: 'senha',
        tipo: 'input',
        categoria: 'password',
        classes: 'f bg-transparent w-99 pl-1 hr-2 cor-white df-c-e font-1 sombra-black mt-02 borda-radius placeholder-branco outline borda-3484ac',
        placeholder: 'Informe sua Senha',
        texto: 'Usuário',
        destino: ['login_card'],
        onKeyUp: (tecla) => {
            if(tecla.key == 'Enter' ) {
                logar()
            }
        }
    })
    
    criar_elemento({
        id: 'legenda_email',
        tipo: 'div',
        classes: 'f w-99 pl-1 hr-2 cor-white font-102 sombra-black mt-02 none',
        texto: 'E-mail',
        destino: ['login_card']
    })
    
    criar_elemento({
        id: 'email',
        tipo: 'input',
        classes: 'f bg-transparent w-99 pl-1 hr-2 cor-white font-1 sombra-black mt-02 borda-radius placeholder-branco outline borda-3484ac none',
        placeholder: 'Informe seu E-mail',
        destino: ['login_card']
    })
    
    criar_elemento({
        id: 'legenda_matricula',
        tipo: 'div',
        classes: 'f w-99 pl-1 hr-2 cor-white font-102 sombra-black mt-02 none',
        texto: 'Matrícula',
        destino: ['login_card']
    })
    
    criar_elemento({
        id: 'matricula',
        tipo: 'input',
        classes: 'f bg-transparent w-99 pl-1 hr-2 cor-white font-1 sombra-black mt-02 borda-radius placeholder-branco outline borda-3484ac none',
        placeholder: 'Informe sua Matrícula',
        destino: ['login_card']
    })
    
    criar_elemento({
        id: 'entrar',
        tipo: 'div',
        classes: 'f bg-3a9cca w-100 hr-2 cor-white df-c-c font-1 mt-1 borda-radius pointer',
        texto: 'Entrar',
        destino: ['login_card'],
        onClick: () => {
            logar()
        }
    })
    
    criar_elemento({
        id: 'cadastre-se',
        tipo: 'div',
        classes: 'f w-100 hr-2 df-c-c font-1 mt-1 borda-branco cor-white borda-radius pointer',
        texto: 'Cadastre-se',
        destino: ['login_card'],
        onClick: () => {
            adicionar_classe('entrar','none')
            adicionar_classe('cadastre-se','none')
            
            remover_classe('cadastrar','none')
            remover_classe('ja_possuo_conta','none')
            remover_classe('legenda_nome','none')
            remover_classe('nome','none')
            remover_classe('legenda_unidade','none')
            remover_classe('unidade','none')
            // remover_classe('legenda_subunidade','none')
            // remover_classe('subunidade','none')
            remover_classe('legenda_cargo','none')
            remover_classe('cargo','none')
            remover_classe('legenda_matricula','none')
            remover_classe('matricula','none')
            remover_classe('legenda_email','none')
            remover_classe('email','none')
        }
    })
    
    criar_elemento({
        id: 'cadastrar',
        tipo: 'div',
        classes: 'f bg-3a9cca w-100 hr-2 cor-white font-1 mt-1 borda-radius pointer df-c-c none',
        texto: 'Cadastrar',
        destino: ['login_card'],
        onClick: async () => {
            await cadastrar()
        }
    })
    
    criar_elemento({
        id: 'ja_possuo_conta',
        tipo: 'div',
        classes: 'f w-100 hr-2 font-1 mt-1 borda-branco cor-white borda-radius pointer df-c-c none',
        texto: 'Já possuo conta',
        destino: ['login_card'],
        onClick: () => {
            remover_classe('entrar','none')
            remover_classe('cadastre-se','none')
            
            adicionar_classe('cadastrar','none')
            adicionar_classe('ja_possuo_conta','none')
            adicionar_classe('legenda_nome','none')
            adicionar_classe('nome','none')
            // adicionar_classe('legenda_subunidade','none')
            // adicionar_classe('subunidade','none')
            adicionar_classe('legenda_unidade','none')
            adicionar_classe('unidade','none')
            adicionar_classe('legenda_cargo','none')
            adicionar_classe('cargo','none')
            adicionar_classe('legenda_matricula','none')
            adicionar_classe('matricula','none')
            adicionar_classe('legenda_email','none')
            adicionar_classe('email','none')
            
            adicionar_classe('cargo_digitavel','none')
        }
    })
}

function iniciais_maiusculas(nome){
    if(['',null,undefined,'null'].includes(nome)){
        return '-'
    }
    else{
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

async function logar(){
    let usuario = document.getElementById('usuario').value
    usuario = usuario.trim()
    usuario = usuario.toLowerCase()
    let senha = document.getElementById('senha').value
    senha = senha.trim()
    senha = senha.toLowerCase()
    
    let parametros = {login: usuario, senha: senha}
    let resultado = await api(`${link_do_sistema}/api/auth.php`, parametros)
    if(resultado['dados']){
        let registro = resultado['dados']
        id_logado = registro['id']
        usuario_logado = iniciais_maiusculas(registro['nome'])
        senha_logado = registro['senha']
        cargo_logado = registro['cargo']
        matricula_logado = registro['matricula']
        let unidade = registro['unidade']
        email_logado = registro['email']
        unidade_logada = unidade

        // Tipo de Acesso
        if(['SUBPAV','SUBHUE'].includes(unidade) == true){
            acesso = 'TOTAL'
            demanda = 'VISUALIZAR'
        }
        else{
            acesso = 'UNIDADE'
        }
        unidade_selecionada = unidade

        pagina_geral()
        document.getElementById('dados_do_usuario').innerHTML = `<b>${usuario_logado}</b><br>${unidade_logada}`
    }
    else{
        alert("Você não possui permissão para acessar o sistema !")
    }
}

async function cadastrar(){
    let subunidade = document.getElementById('subunidade').value
    let unidade = document.getElementById('unidade_valor').innerHTML
    let nome = document.getElementById('nome').value
    let usuario = document.getElementById('usuario').value
    let senha = document.getElementById('senha').value
    let cargo = document.getElementById('cargo').value
    let cargo_digitavel = document.getElementById('cargo_digitavel').value
    if(cargo_digitavel != ''){
        cargo = cargo_digitavel
    }
    let matricula = document.getElementById('matricula').value
    let endereco_de_email = document.getElementById('email').value
    
    let parametros = {
        sistema: 'DFD',
        unidade: unidade,
        subunidade: subunidade,
        cpf: usuario,
        senha: senha,
        cargo: cargo,
        matricula: matricula,
        endereco_de_email: endereco_de_email,
        nome: nome
    }
    let resultado = await api(`${link_do_sistema}/api/usuario_novo.php`, parametros)
    alert('Seu acesso ao sistema foi solicitado !')
}

function inicial_maiusculo(dado){
    if(['',null,undefined,'null'].includes(dado)){
        return '-'
    }
    else{
        return dado.charAt(0).toUpperCase() + dado.slice(1).toLowerCase();  
    }
}

// inicio
let usuario_logado = ''
let senha_logado = ''
let cargo_logado = ''
let matricula_logado = ''
let unidade_logada = ''
let email_logado = ''
let acesso = ''
let unidades = {
    'SUBPAV': 'SUBPAV',
    'SUBHUE': 'SUBHUE',
    'Coordenadoria de Saúde da AP 1.0': 'CDSAP1',
    'Coordenadoria de Saúde da AP 2.1': 'CDSAP21',
    'Coordenadoria de Saúde da AP 2.2': 'CDSAP22',
    'Coordenadoria de Saúde da AP 3.1': 'CDSAP31',
    'Coordenadoria de Saúde da AP 3.2': 'CDSAP32',
    'Coordenadoria de Saúde da AP 3.3': 'CDSAP33',
    'Coordenadoria de Saúde da AP 4.0': 'CDSAP4',
    'Coordenadoria de Saúde da AP 5.1': 'CDSAP51',
    'Coordenadoria de Saúde da AP 5.2': 'CDSAP52',
    'Coordenadoria de Saúde da AP 5.3': 'CDSAP53',
    'Hospital Municipal Souza Aguiar': 'HMSA',
    'Hospital Municipal Fernando Magalhães': 'HMFM',
    'Hospital Municipal Miguel Couto': 'HMMC',
    'Hospital Municipal Jesus': 'HMJ',
    'Hospital Municipal do Paulino Weneck': 'HMPW',
    'Hospital Municipal Salgado Filho': 'HMSF',
    'Hospital Maternidade Carmela Dutra': 'HMCD',
    'Hospital Municipal da Piedade': 'HMP',
    'Hospital Municipal da Assistência a Saúde Nise da Silveira': 'HMASNS',
    'Hospital Maternidade Herculano Pinheiro': 'HMHP',
    'Hospital Municipal Ronaldo Gazzola': 'HMRG',
    'Hospital Municipal Francisco da Silva Telles': 'HMFST',
    'Hospital Municipal Alexander Fleming': 'HMAF',
    'Hospital Municipal Lourenço Jorge': 'HMLJ',
    'Hospital Municipal de Assistência a Saúde Juliano Moreira': 'IMASJM',
    'Hospital Municipal Raphael de Paula Souza': 'HMRPS',
    'Hospital Municipal Nossa Senhora do Loreto': 'HMNSL',
    'Hospital Municipal Barata Ribeiro': 'HMBR',
    'Hospital Municipal Philippe Pinel': 'HMPP',
    'Hospital Municipal Rocha Maia': 'HMRM',
    'Hospital Municipal Alvaro Ramos': 'HMAR',
    'Hospital de Geriatria e Gerontologia Miguel Pedro': 'HGGMP',
    'Hospital da Mulher Mariska Ribeiro': 'HMMR',
    'Novo Complexo Hospitalar Municipal Pedro II': 'NCHMP',
    'Hospital Municipal Rocha Faria': 'HMRF'
}


let siglaParaNome = {}

for (let nome in unidades) {
  let sigla = unidades[nome]
  siglaParaNome[sigla] = nome
}

let lista_de_unidades = [
    'Coordenadoria de Saúde da AP 1.0',
    'Coordenadoria de Saúde da AP 2.1',
    'Coordenadoria de Saúde da AP 2.2',
    'Coordenadoria de Saúde da AP 3.1',
    'Coordenadoria de Saúde da AP 3.2',
    'Coordenadoria de Saúde da AP 3.3',
    'Coordenadoria de Saúde da AP 4.0',
    'Coordenadoria de Saúde da AP 5.1',
    'Coordenadoria de Saúde da AP 5.2',
    'Coordenadoria de Saúde da AP 5.3',
    'Hospital Municipal Souza Aguiar',
    'Hospital Municipal Fernando Magalhães',
    'Hospital Municipal Miguel Couto',
    'Hospital Municipal Jesus',
    'Hospital Municipal do Paulino Weneck',
    'Hospital Municipal Salgado Filho',
    'Hospital Maternidade Carmela Dutra',
    'Hospital Municipal da Piedade',
    'Hospital Municipal da Assistência a Saúde Nise da Silveira',
    'Hospital Maternidade Herculano Pinheiro',
    'Hospital Municipal Ronaldo Gazzola',
    'Hospital Municipal Francisco da Silva Telles',
    'Hospital Municipal Alexander Fleming',
    'Hospital Municipal Lourenço Jorge',
    'Hospital Municipal de Assistência a Saúde Juliano Moreira',
    'Hospital Municipal Raphael de Paula Souza',
    'Hospital Municipal Nossa Senhora do Loreto',
    'Hospital Municipal Barata Ribeiro',
    'Hospital Municipal Philippe Pinel',
    'Hospital Municipal Rocha Maia',
    'Hospital Municipal Alvaro Ramos',
    'Hospital de Geriatria e Gerontologia Miguel Pedro',
    'Hospital da Mulher Mariska Ribeiro',
    'Novo Complexo Hospitalar Municipal Pedro II',
    'Hospital Municipal Rocha Faria',
    'SMS INSTITUTO NISE DA SILVEIRA AP 32',
    'SMS INSTITUTO MUNICIPAL PHILIPPE PINEL AP 21',
    'SMS IMAS JULIANO MOREIRA AP 40'
]



function hoje(){
 const hoje = new Date();
 const dia = String(hoje.getDate()).padStart(2, '0');
 const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
 const ano = hoje.getFullYear();
 const dataFormatada = `${ano}-${mes}-${dia}`
 return dataFormatada
}

pagina_login()