/*
    SISTEMAS DEPENDENTES
    - SIMP
    - GOVI 
    ! Catálogo
    - Anotações
    - Games
*/

// const versao_da_imagem = 9
const versao_da_imagem = Date.now();

function elem(tipo, identificador, texto, destino, css) {
    document.getElementsByTagName("body")[0].style.margin = 0;

    var elemento = document.createElement(`${tipo}`);

    // Adiciona atributo se identificador existir
    if (identificador.length >= 2) {
        elemento.setAttribute(`${identificador[0]}`, `${identificador[1]}`);
    }

    // Se for option, o texto deve ser adicionado como innerText
    if (tipo === 'option') {
        elemento.innerText = texto;
    } else {
        elemento.innerHTML = texto;
    }

    // Ajustes específicos para input
    if (tipo === 'input') {
        elemento.placeholder = texto;
        elemento.value = texto;

        const idLower = identificador[1].toLowerCase();

        if (idLower.includes('senha')) {
            elemento.setAttribute("type", "password");
        } else if (idLower.includes('file')) {
            elemento.setAttribute("type", "file");
        } else if (idLower.includes('data')) {
            elemento.setAttribute("type", "date");
            elemento.value = "";  // opcional: para não mostrar a data como texto
        } else {
            elemento.setAttribute("type", "text");
        }
    }

    // Ajuste para checkbox
    if (identificador[2] === 'checkbox') {
        elemento.setAttribute("type", "checkbox");
    }

    // Ajuste para input tipo file
    if (identificador[1] === 'file') {
        elemento.setAttribute("type", "file");
    }

    // Aplica classe se fornecido
    if (css) {
        elemento.className = css;
    }

    // Inserção no destino
    if (tipo === 'option') {
        // Para <option>, destino[0] é o ID do select
        document.getElementById(destino[0]).appendChild(elemento);
    } else if (destino[0] === 'body') {
        document.getElementsByTagName("body")[0].appendChild(elemento);
    } else {
        if (destino.length === 1) {
            document.getElementById(`${destino[0]}`).appendChild(elemento);
        } else if (destino.length === 2) {
            document.getElementsByClassName(`${destino[0]}`)[destino[1]].appendChild(elemento);
        }
    }
}

function criar_elementos(elementos){
    for(let c1 = 0; c1 < elementos.length; c1++){
        let elemento = elementos[c1]
        criar_elemento(elemento)
    }
}

function criar_elementos2(config_base, elementos){

    for (let c1 = 0; c1 < elementos.length; c1++) {
        let elemento = elementos[c1]
        
        // Mesclar as configurações padrão com os dados específicos do elemento
        let config_final = {
            ...config_base,  // Espalha as configurações base
            ...elemento      // Sobrescreve com as configurações específicas do elemento
        }

        // Criar o elemento com a configuração final
        criar_elemento(config_final);
    }
}

function criar_elemento(config) {
    
    const {
        id,
        tipo,
        categoria, // Input ( Data )
        classes,
        texto,
        valor,
        placeholder,
        opcoes,
        opcao, // Ficando Obsoleto
        somente_leitura,
        imagem,
        destino,
        onClick,
        onClickEsquerdo,
        onClickDireito,
        onChange,
        onKeyUp,
        onEnter,
        onFiltro,
        onScroll,
        onMouseEnter,
        onMouseLeave,
        legenda,
        hover
    } = config;

    
    // Tipo
    var elemento = document.createElement(`${tipo}`);

    if (legenda) {
        if(legenda[0] != ''){
            elemento.setAttribute("data-tooltip", legenda[0]);
            elemento.setAttribute("data-pos", legenda[1]);   
        }
    }
    
    if (tipo === 'filter_select') {
        criar_filter_select(config);
        return;
    }
    
    if (tipo === 'filter_select_unico') {
        criar_filter_select_unico(config);
        return
    }
    
    if (valor != undefined && valor != '') {
        elemento.value = valor;
    }
    
    if(opcao != undefined){
        elemento.innerText = opcao
    }
    
    if (somente_leitura != undefined && somente_leitura === true) {
        elemento.readOnly = true; 
    }
    
    // Adicionar um option no elemento que esta sendo criado ( select )
    if(opcoes != undefined){
        for(let c1 = 0; c1 < opcoes.length; c1 ++){
            const opcao_nova = document.createElement('option');
            opcao_nova.innerText = opcoes[c1]
    
            // Cor do texto dentro do dropdown
            opcao_nova.style.color = "black";     
            opcao_nova.style.backgroundColor = "white";
    
            elemento.appendChild(opcao_nova)
        }
    }
    
    if (hover) {
        let corOriginal = elemento.style.backgroundColor;
        elemento.addEventListener("mouseenter", e => {
            corOriginal = e.target.style.backgroundColor; // salva a cor atual
            e.target.style.backgroundColor = hover;
        });
        elemento.addEventListener("mouseleave", e => {
            e.target.style.backgroundColor = corOriginal;
        });
    }
    
    // ID
    if(id != undefined && id != ''){
        elemento.setAttribute("id", id);
    }
    
    // CSS
    if (classes != undefined && classes != '') {
        elemento.className = classes;
    }
    
    // Texto
    if(texto != undefined && texto != ''){
        if (tipo == 'option') {
            elemento.innerText = texto;
        } 
        if (tipo != 'option') {
            elemento.innerHTML = texto;
        }
    }
    
    if (Array.isArray(imagem) && imagem.length === 2) {
        elemento.style.background = `url("${imagem[0]}.${imagem[1]}?v=${Date.now()}")`;
        elemento.style.backgroundSize = '100% 100%';
        elemento.style.backgroundRepeat = 'no-repeat';
    }
    
    if (onClick && typeof onClick === 'function') {
        elemento.addEventListener('click', onClick);
    }
    
    // Clique esquerdo (button 0)
    if (onClickEsquerdo && typeof onClickEsquerdo === 'function') {
        elemento.addEventListener('mousedown', (event) => {
          if (event.button === 0) {
            onClickEsquerdo(event);
          }
        });
    }
    
    // Clique direito (button 2)
    if (onClickDireito && typeof onClickDireito === 'function') {
        // Previne o menu de contexto padrão
        elemento.addEventListener('contextmenu', (event) => event.preventDefault());
        
        elemento.addEventListener('mousedown', (event) => {
          if (event.button === 2) {
            onClickDireito(event);
          }
        });
    }
    
    if (onKeyUp && typeof onKeyUp === 'function') {
        elemento.addEventListener('keyup', onKeyUp);
    }
    
    if (config.onEnter && typeof config.onEnter === 'function') {
        elemento.addEventListener('keyup', function (event) {
            if (event.key === 'Enter') {
                config.onEnter(event)
            }
        })
    }

    if (config.onFiltro && typeof config.onFiltro === 'function') {
        elemento.addEventListener('keyup', function (event) {
            const valor = elemento.value.trim()
    
            if (
                event.key === 'Enter' ||
                event.key.toLowerCase() === 'v' || // detecta 'v' maiúsculo ou minúsculo
                valor === ''
            ) {
                config.onFiltro(event)
            }
        });
    }
    
    if (onChange && typeof onChange === 'function') {
        elemento.addEventListener('change', onChange);
    }
    
    if (onScroll && typeof onScroll === 'function') {
        elemento.addEventListener('scroll', onScroll);
    }
    
    if (onMouseEnter && typeof onMouseEnter === 'function') {
        elemento.addEventListener('mouseenter', onMouseEnter);
    }
    
    if (onMouseLeave && typeof onMouseLeave === 'function') {
        elemento.addEventListener('mouseleave', onMouseLeave);
    }
    
    if (placeholder != undefined && placeholder != '') {
        elemento.placeholder = placeholder;
    }
    
    if(categoria == 'data'){
        elemento.setAttribute('type', 'date');
    }
    
    if(categoria == 'password'){
        elemento.setAttribute('type', 'password');
    }
    
    if(categoria == 'file'){
        elemento.setAttribute('type', 'file');
    }
     
    if(categoria == 'checkbox'){
        elemento.setAttribute('type', 'checkbox');
        
    // Criar label que será o container do checkbox + texto
    const label = document.createElement('label');
    label.className = classes ? classes : '';
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.style.justifyContent = 'flex-start';

    // Criar o input checkbox
    elemento = document.createElement('input');
    elemento.setAttribute('type', 'checkbox');
    elemento.style.marginRight = '6px';

    // Inserir input no label
    label.appendChild(elemento);

    // Inserir texto se existir
    if (texto && texto !== '') {
        const span = document.createElement('span');
        span.innerText = texto;
        label.appendChild(span);
    }

    // Substituir destino: o que vai pro DOM é o label
    if (destino[0] === 'body') {
        document.body.appendChild(label);
    } else if (destino.length === 1) {
        document.getElementById(destino[0]).appendChild(label);
    } else if (destino.length === 2) {
        document.getElementsByClassName(destino[0])[destino[1]].appendChild(label);
    }

    return; // já finalizou a criação do checkbox
    }
    
    // Destino
    if (tipo === 'option') {
        // Para <option>, destino[0] é o ID do select
        document.getElementById(destino[0]).appendChild(elemento);
    } 
    else if (destino[0] === 'body') {
        document.getElementsByTagName("body")[0].appendChild(elemento);
    } 
    else {
        if (destino.length === 1) {
            document.getElementById(`${destino[0]}`).appendChild(elemento);
        } 
        else if (destino.length === 2) {
            document.getElementsByClassName(`${destino[0]}`)[destino[1]].appendChild(elemento);
        }
    }
}

function remover_elemento(id) {
    var elemento = document.getElementById(id);
    if(document.body.contains(elemento)) {
        elemento.remove()
    }
}

function remover_elementos(nome){
    while(document.body.contains ( document.getElementsByClassName(nome)[0]) == true  ) {
        document.getElementsByClassName(nome)[0].remove()
    }
}

function criar_janela(){
    remover_elemento('janela')
    
    criar_elemento({
        id: 'janela',
        tipo: 'div',
        classes: 'f w-100 h-100',
        destino: ['body']
    })
}

function criar_conteudo(){
    remover_elemento('conteudo')
    remover_elemento('impressao')
    
    criar_elemento({
        id: 'conteudo',
        tipo: 'div',
        classes: 'f w-100 h-90 scroll-y-invisivel',
        destino: ['janela']
    })
}

function imagem(nome, extensao, destino) {
    let url = `${nome}.${extensao}?v=${Date.now()}`
    
    let el = document.getElementById(destino)
    el.style.background = `url("${url}")`
    el.style.backgroundSize = '100% 100%'
    el.style.backgroundRepeat = 'no-repeat'
}

function imagem2(nome, extensao, destino, indice) {
    let url = `${nome}.${extensao}?v=${versao_da_imagem}`

    let el = document.getElementsByClassName(destino)[indice]
    el.style.background = `url("${url}")`
    el.style.backgroundSize = '100% 100%'
    el.style.backgroundRepeat = 'no-repeat'
}

function novo_elemento ( tipo, identificador , texto, destino  ) {

    var elemento = document . createElement ( `${tipo}` )
    elemento . setAttribute ( `${identificador[0]}`, `${identificador[1]}`)
    elemento. innerHTML = texto 
    if ( tipo == 'input' ) {
        elemento.placeholder = texto
        elemento.value = texto
        if ( identificador [1].toLowerCase ( ). includes ( 'senha' ) ) {
            elemento . setAttribute ( "type" , "password" )
        }
    }
    if ( identificador[2] == 'checkbox') {
        elemento . setAttribute ( "type" , "checkbox" )
    }
    if ( identificador[1] == 'file') {
        elemento . setAttribute ( "type" , "file" )
    }
    if ( destino [0] == 'body' ) {
        document.getElementsByTagName ( "body" ) [ 0 ] . appendChild ( elemento )
    }
    if ( destino [0] != 'body' ) {
        if ( destino.length == 1 ) {
            document.getElementById (`${destino[0]}`).appendChild ( elemento )
        }
        if ( destino.length == 2 ) {
            document.getElementsByClassName (`${destino[0]}`) [destino[1]].appendChild ( elemento )
        }
    }
}

function elemento_leitura(id){
    document.getElementById(id).readOnly = true
}

function get_classes(id){
    return document.getElementById(id).className
}

function adicionar_classe(id,classe){
    document.getElementById(id).classList.add(classe)
}

function remover_classe(id,classe){
    document.getElementById(id).classList.remove(classe)
}

function elemento_existe(id){
    return document.body.contains(document.getElementById(id))
}

function criar_legenda(config){
    const {
        destino,
        legenda,
        valor,
        tipo,
        categoria,
        somente_leitura
    } = config
    
    criar_elemento({
        id: `container_${legenda}`,
        tipo: 'div',
        classes: 'f w-98 ml-1 hr-2 mt-02',
        destino: [destino]
    })
    
    let somente_leitura_valor = false
    if(somente_leitura){
        somente_leitura_valor = true
    }
    
    let tipo_valor = 'input'
    if(tipo){
        tipo_valor = tipo
    }
    
    let categoria_valor = undefined
    if(categoria){
        categoria_valor = categoria
    }

    criar_elemento({
        tipo: 'div',
        classes: 'f w-20 h-100 bg-27548A cor-white df-c-c',
        texto: texto_iniciais_maiusculas(legenda),
        destino: [`container_${legenda}`]
    })
    
    criar_elemento({
        id: `container_${legenda}_valor`,
        tipo: tipo_valor,
        categoria: categoria_valor,
        classes: 'f w-79 pl-1 h-100 borda-none bg-f5f5f5',
        valor: valor,
        opcoes: valor,
        somente_leitura: somente_leitura_valor,
        destino: [`container_${legenda}`]
    })
}

function criar_cabecalho(atributos,destino){
    
    criar_elemento({
        id: `cabecalho`,
        tipo: 'div',
        classes: 'f bg-27548A cor-white w-98 ml-1 hr-2 mt-02 d-flex ai-center texto-centralizado',
        destino: [destino]
    })
    
    for(let c1 = 0; c1 < atributos.length; c1++){
        let atributo = atributos[c1]

        criar_elemento({
            tipo: 'div',
            classes: 'f w-15',
            texto: atributo,
            destino: ['cabecalho']
        })
    }
    
}

function criar_cabecalhoo(atributos){
    
    criar_elemento({
        id: `cabecalho`,
        tipo: 'div',
        classes: 'f bg-27548A cor-white w-98 ml-1 pt-05 mt-02 d-flex ai-center texto-centralizado font-08',
        destino: ['conteudo']
    })
    
    for(let c1 = 0; c1 < atributos.length; c1++){
        let atributo = atributos[c1]

        criar_elemento({
            tipo: 'div',
            classes: 'f w-15',
            texto: atributo,
            destino: ['cabecalho']
        })
    }
    
}

// Apagar
function tecla_pressionada ( event ) {
    var tecla = event.key
    return tecla
}

function criar_menu(config){
    const {
        background,
        cor,
        texto
    } = config
    
    criar_elemento({
        tipo: 'div',
        classes: `f bg-${background} cor-${cor} w-100 h-10 font-105 df-c-c`,
        texto: texto,
        destino: ['janela']
    })
}

function criar_card_graficos(){
    criar_elemento({
        id: 'graficos',
        tipo: 'div',
        classes: `f w-100 hr-25 df-c-c`,
        destino: ['conteudo']
    })
}

function criar_card_total_de_resultados(){
    criar_elemento({
        id: 'total_de_resultados',
        tipo: 'div',
        classes: 'f df-c-c w-100 hr-2 texto-centralizado',
        texto: '? Resultados',
        destino: ['conteudo']
    })
}

function criar_card_filtros(){
    criar_elemento({
        id: 'filtros',
        tipo: 'div',
        classes: 'f df-c-c w-98 ml-1 hr-2 mb-05 texto-centralizado',
        destino: ['conteudo']
    })
}

function criar_card_registros(){
    criar_elemento({
        id: 'registros',
        tipo: 'div',
        classes: 'f w-98 ml-1 hr-35 bg-gray scroll-y-invisivel',
        destino: ['conteudo'],
        onScroll: () => {
            paginacao_carregar_mais_registros()
        }
    })
}

function criar_botao_pdf_total(tamanho){
    criar_elemento({
        id: 'pdf',
        tipo: 'div',
        classes: `f w-${tamanho} h-100 borda-gray borda-radius texto-centralizado filtross df-c-c bg-3484ac cor-white pointer`,
        texto: 'PDF',
        destino: ['filtros'],
        onClick: async () => {
            await loading_comeco()
            await paginacao_carregar_todos ()
            loading_final()
            print()
        }
    })
}

function criar_botao_limpar_filtros(tamanho){
    criar_elemento({
        id: 'limpar_filtros',
        tipo: 'div',
        classes: `f w-${tamanho} h-100 borda-gray borda-radius texto-centralizado filtross df-c-c bg-3484ac cor-white pointer`,
        texto: 'Limpar Filtros',
        destino: ['filtros'],
        onClick: async () => {
            await paginacao_filtro_grafico('')
        }
    })
}

function criar_filtro_input(config){
    const {
        nome,
        tamanho,
        filtro,
        consulta_base
    } = config
    
    criar_elemento({
        id: `filtro_${nome}`,
        tipo: 'input',
        classes: `f w-${tamanho} h-100 borda-radius texto-centralizado`,
        placeholder: nome,
        destino: ['filtros'],
        onFiltro: async () =>{
            let elemento = document.getElementById(`filtro_${nome}`).value
            if(elemento == ''){
                await filtro('')   
            }
            if(elemento != ''){
                await filtro(`${consulta_base} LIKE '%${elemento}%'`)  
            }
        }
    })
}

function criar_filtro_select(config){
    const {
        nome,
        opcoes,
        tamanho,
        filtro,
        consulta_base
    } = config
    
    criar_elemento({
        id: `filtro_${nome}`,
        tipo: 'select',
        classes: `f w-${tamanho} h-100 borda-radius texto-centralizado`,
        opcoes: opcoes,
        destino: ['filtros'],
        onChange: async () =>{
            let elemento = document.getElementById(`filtro_${nome}`).value
            if(elemento == opcoes[0]){
                await filtro('')   
            }
            if(elemento != opcoes[0]){
                await filtro(`${consulta_base} = '${elemento}'`)  
            }
        }
    })
}

function criar_balao_aviso(texto, x = null, y = null, duracao = 1000, e) {
    e.preventDefault(); // evita o menu do navegador
    
    remover_elementos('balao-copiado');

    const balao = document.createElement('div');
    balao.className = 'balao-copiado';
    balao.innerText = texto;

    balao.style.position = 'fixed';
    balao.style.padding = '8px 14px';
    balao.style.background = 'rgba(0, 0, 0, 0.8)';
    balao.style.color = '#fff';
    balao.style.borderRadius = '10px';
    balao.style.fontSize = '14px';
    balao.style.zIndex = 9999;
    balao.style.opacity = 0;
    balao.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    balao.style.transform = 'translateY(-10px)';

    // Posição
    if (x !== null && y !== null) {
        balao.style.left = `${x}px`;
        balao.style.top = `${y}px`;
    } else {
        balao.style.top = '20px';
        balao.style.right = '20px';
    }

    document.body.appendChild(balao);

    setTimeout(() => {
        balao.style.opacity = 1;
        balao.style.transform = 'translateY(0)';
    }, 10);

    setTimeout(() => {
        balao.style.opacity = 0;
        balao.style.transform = 'translateY(-10px)';
        setTimeout(() => balao.remove(), 300);
    }, duracao);
}

function criar_filter_select(config) {
    const { id, classes, placeholder, opcoes, destino } = config;

    // Container principal
    const container = document.createElement('div');
    container.id = id;
    container.className = `${classes} filter-select`;
    container.style.position = 'relative';
    container.style.userSelect = 'none';

    // Cabeçalho (parte clicável)
    const header = document.createElement('div');
    header.className = 'filter-select-header';
    header.style.cursor = 'pointer';
    header.style.width = '100%';
    header.style.height = '100%';
    header.style.display = 'flex';
    header.style.justifyContent = 'center';
    header.style.alignItems = 'center';

    const labelInterno = document.createElement('span');
    labelInterno.className = 'filter-select-label';
    labelInterno.innerText = placeholder || 'Filtrar...';
    header.appendChild(labelInterno);

    // Dropdown (menu)
    const dropdown = document.createElement('div');
    dropdown.className = 'filter-select-dropdown';
    Object.assign(dropdown.style, {
        position: 'absolute',
        top: '100%',
        left: '0',
        width: '260px',
        maxHeight: '320px',
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        display: 'none',
        flexDirection: 'column',
        padding: '8px',
        zIndex: '9999'
    });

    // Campo de busca
    const busca = document.createElement('input');
    busca.type = 'text';
    busca.placeholder = 'Buscar...';
    Object.assign(busca.style, {
        width: '100%',
        marginBottom: '8px',
        padding: '6px',
        border: '1px solid #ccc',
        borderRadius: '4px'
    });

    // Container para os botões de seleção rápida
    const botoesSelecao = document.createElement('div');
    Object.assign(botoesSelecao.style, {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '6px'
    });

    const btnSelecionarTodos = document.createElement('button');
    btnSelecionarTodos.innerText = 'Selecionar todos';
    Object.assign(btnSelecionarTodos.style, {
        fontSize: '12px',
        padding: '4px 8px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        background: '#f5f5f5',
        cursor: 'pointer'
    });

    const btnDesmarcarTodos = document.createElement('button');
    btnDesmarcarTodos.innerText = 'Desmarcar todos';
    Object.assign(btnDesmarcarTodos.style, {
        fontSize: '12px',
        padding: '4px 8px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        background: '#f5f5f5',
        cursor: 'pointer'
    });

    botoesSelecao.appendChild(btnSelecionarTodos);
    botoesSelecao.appendChild(btnDesmarcarTodos);

    // Lista de opções
    const lista = document.createElement('div');
    Object.assign(lista.style, {
        maxHeight: '200px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    });

    let estadoAnterior = [];
    let estadoAtual = [];

    // Função para renderizar
    function renderizar(filtro = '') {
        lista.innerHTML = '';
        opcoes
            .filter(op => op.toString().toLowerCase().includes(filtro.toLowerCase()))
            .forEach(op => {
                const label = document.createElement('label');
                Object.assign(label.style, {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '2px 4px',
                    cursor: 'pointer'
                });

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = op;
                checkbox.checked = estadoAtual.includes(op);

                const span = document.createElement('span');
                span.textContent = op;

                checkbox.addEventListener('change', (e) => {
                    e.stopPropagation();
                    if (e.target.checked) {
                        if (!estadoAtual.includes(op)) estadoAtual.push(op);
                    } else {
                        estadoAtual = estadoAtual.filter(v => v !== op);
                    }
                });

                span.addEventListener('click', (e) => {
                    e.stopPropagation();
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                });

                label.appendChild(checkbox);
                label.appendChild(span);
                lista.appendChild(label);
            });
    }

    estadoAtual = [...opcoes];
    renderizar();

    busca.addEventListener('input', e => renderizar(e.target.value));
    busca.addEventListener('click', e => e.stopPropagation());

    // Selecionar todos
    btnSelecionarTodos.addEventListener('click', (e) => {
        e.stopPropagation();
        estadoAtual = [...opcoes];
        renderizar(busca.value);
    });

    // Desmarcar todos
    btnDesmarcarTodos.addEventListener('click', (e) => {
        e.stopPropagation();
        estadoAtual = [];
        renderizar(busca.value);
    });

    // Botões de ação (OK / Cancelar)
    const botoes = document.createElement('div');
    Object.assign(botoes.style, {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '6px',
        marginTop: '8px'
    });

    const btnCancelar = document.createElement('button');
    btnCancelar.innerText = 'Cancelar';
    Object.assign(btnCancelar.style, {
        padding: '4px 10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: 'pointer'
    });
    btnCancelar.onclick = (e) => {
        e.stopPropagation();
        estadoAtual = [...estadoAnterior];
        dropdown.style.display = 'none';
    };

    const btnOk = document.createElement('button');
    btnOk.innerText = 'OK';
    Object.assign(btnOk.style, {
        padding: '4px 10px',
        background: '#27548A',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    });
    btnOk.onclick = (e) => {
        e.stopPropagation();
        const selecionados = [...estadoAtual];
        labelInterno.innerText = `${placeholder}: ${selecionados.length}`;
        dropdown.style.display = 'none';
        if (typeof config.onFiltrar === 'function') config.onFiltrar(selecionados);
    };

    botoes.appendChild(btnCancelar);
    botoes.appendChild(btnOk);

    dropdown.appendChild(busca);
    dropdown.appendChild(botoesSelecao);
    dropdown.appendChild(lista);
    dropdown.appendChild(botoes);

    container.appendChild(header);
    container.appendChild(dropdown);

    // Abre / fecha dropdown
    header.addEventListener('click', (e) => {
        e.stopPropagation();
        const aberto = dropdown.style.display === 'flex';
        document.querySelectorAll('.filter-select-dropdown').forEach(el => el.style.display = 'none');
        if (!aberto) {
            estadoAnterior = [...estadoAtual];
            renderizar();
            dropdown.style.display = 'flex';
        }
    });

    // Fecha ao clicar fora
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) dropdown.style.display = 'none';
    });

    // Inserir no destino
    if (destino[0] === 'body') document.body.appendChild(container);
    else document.getElementById(destino[0]).appendChild(container);
}

function criar_filter_select_unico(config) {
    const { id, classes, placeholder, opcoes, destino } = config;

    // Container principal
    const container = document.createElement('div');
    container.id = id;
    container.className = `${classes} filter-select-unico`;
    container.style.position = 'relative';
    container.style.userSelect = 'none';

    // Cabeçalho (parte clicável)
    const header = document.createElement('div');
    header.className = 'filter-select-header';
    header.style.cursor = 'pointer';
    header.style.width = '100%';
    header.style.height = '100%';
    header.style.display = 'flex';
    header.style.justifyContent = 'left';
    header.style.alignItems = 'center';

    const labelInterno = document.createElement('span');
    labelInterno.id = `${id}_valor`;
    labelInterno.className = 'filter-select-label';
    labelInterno.innerText = placeholder || 'Selecionar...';
    header.appendChild(labelInterno);

    // Dropdown (menu)
    const dropdown = document.createElement('div');
    dropdown.className = 'filter-select-dropdown';
    Object.assign(dropdown.style, {
        position: 'absolute',
        top: '100%',
        left: '0',
        width: '260px',
        maxHeight: '320px',
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        display: 'none',
        flexDirection: 'column',
        padding: '8px',
        zIndex: '9999'
    });

    // Campo de busca
    const busca = document.createElement('input');
    busca.type = 'text';
    busca.placeholder = 'Buscar...';
    Object.assign(busca.style, {
        width: '100%',
        marginBottom: '8px',
        padding: '6px',
        border: '1px solid #ccc',
        borderRadius: '4px'
    });

    // Lista de opções
    const lista = document.createElement('div');
    Object.assign(lista.style, {
        maxHeight: '240px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    });

    // Renderiza opções
    function renderizar(filtro = '') {
        lista.innerHTML = '';
        opcoes
            .filter(op => op.toString().toLowerCase().includes(filtro.toLowerCase()))
            .forEach(op => {
                const item = document.createElement('div');
                item.innerText = op;
                
                Object.assign(item.style, {
                    padding: '6px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    background: 'white',
                    fontSize: '14px',
                    fontWeight: '400',   // normal, evita bold
                    fontFamily: 'Arial, sans-serif', // fonte limpa
                    color: '#222',       // preto mais suave que o #000
                });
                
                item.addEventListener('mouseenter', () => {
                    item.style.background = '#f0f0f0';
                });
                item.addEventListener('mouseleave', () => {
                    item.style.background = 'white';
                });


                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    labelInterno.innerText = op; // Atualiza o cabeçalho
                    dropdown.style.display = 'none'; // Fecha dropdown
                    if (typeof config.onFiltrar === 'function') {
                        config.onFiltrar(op);
                    }
                });

                lista.appendChild(item);
            });
    }

    renderizar();

    busca.addEventListener('input', e => renderizar(e.target.value));
    busca.addEventListener('click', e => e.stopPropagation());

    dropdown.appendChild(busca);
    dropdown.appendChild(lista);

    container.appendChild(header);
    container.appendChild(dropdown);

    // Abre / fecha dropdown
    header.addEventListener('click', (e) => {
        e.stopPropagation();
        const aberto = dropdown.style.display === 'flex';
        document.querySelectorAll('.filter-select-dropdown').forEach(el => el.style.display = 'none');
        if (!aberto) {
            renderizar();
            dropdown.style.display = 'flex';
        }
    });

    // Fecha ao clicar fora
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) dropdown.style.display = 'none';
    });

    // Inserir no destino
    if (destino[0] === 'body') document.body.appendChild(container);
    else document.getElementById(destino[0]).appendChild(container);
}

