function grafico_donutss(config) {
  const {
    id,
    titulo,
    legendas,  // Alterado de 'labels' para 'legendas'
    valores,
    cores,
    onClick
  } = config;

  const canvas = document.getElementById(id);

  let total = valores.reduce((acc, val) => acc + val, 0);
  let percentuais = valores.map(v => parseFloat(((v / total) * 100).toFixed(1)));

  // Filtra os dados com percentual > 0
  const dadosFiltrados = percentuais
    .map((percentual, i) => ({
      percentual,
      legenda: legendas[i],  // Alterado de 'label' para 'legenda'
      valor: valores[i],
      cor: cores[i],
      indexOriginal: i
    }))
    .filter(item => item.percentual > 0);

  const legendasFormatadas = dadosFiltrados.map(item => `${item.legenda} (${item.valor})`); // Alterado 'label' para 'legenda'
  const percentuaisFiltrados = dadosFiltrados.map(item => item.percentual);
  const coresFiltradas = dadosFiltrados.map(item => item.cor);

  // Criar o gráfico e armazenar em uma variável para retorno
  const chart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: legendasFormatadas,
      datasets: [{
        data: percentuaisFiltrados,
        borderWidth: 1,
        backgroundColor: coresFiltradas
      }]
    },
    options: {
      onClick: (event, elements) => {
        if (elements.length > 0) {
          const chartElement = elements[0];
          const index = chartElement.index;
          const item = dadosFiltrados[index];

          // Chama o onClick externo com o índice, legenda e valor
          if (typeof onClick === 'function') {
            onClick(item.indexOriginal, item.legenda, item.valor); // Alterado para passar o índice, legenda e valor
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: titulo,
          font: { size: 15 },
          color: '#333'
        },
        datalabels: {
          color: '#fff',
          font: { weight: 'bold', size: 16 },
          formatter: value => `${value}%`,
          anchor: 'center',
          align: 'center'
        }
      },
      scales: {
        y: { beginAtZero: true }
      }
    },
    plugins: [ChartDataLabels]
  });

  return chart; // permite guardar a instância para atualizações futuras
}

function grafico_barras(config) {
  const {
    id,
    titulo,
    orientacao = 'x', // 'x' para horizontal, 'y' para vertical
    legendas,
    valores,
    cores,
    onClick,
    tamanho_minimo // 👈 parâmetro opcional
  } = config;

  const canvas = document.getElementById(id);
  canvas.width = '100%';
  canvas.height = '100%';

  // Monta dataset
  const dataset = {
    data: valores,
    backgroundColor: cores
  };

  // Só adiciona se o usuário passar
  if (tamanho_minimo !== undefined && tamanho_minimo !== null) {
    dataset.minBarLength = tamanho_minimo;
  }

  return new Chart(canvas, {
    type: 'bar',
    data: {
      labels: legendas,
      datasets: [dataset]
    },
    options: {
      indexAxis: orientacao,
      onClick: (event, barElement) => {
        if (barElement.length > 0 && typeof onClick === 'function') {
          const indice = barElement[0].index;
          onClick(indice, legendas[indice], valores[indice]);
        }
      },
      scales: {
        x: { ticks: { autoSkip: false } },
        y: { beginAtZero: true }
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: titulo,
          font: { size: 15 },
          color: '#333'
        },
        datalabels: {
          anchor: 'end',
          align: 'start',
          color: '#fff',
          font: { weight: 'bold', size: 14 },
          formatter: value => value
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}



function grafico_grupo_barras(config) {
    const { id, titulo, grupos, series, onClick } = config;

    const canvas = document.getElementById(id);
    canvas.width = '100%';
    canvas.height = '100%';

    return new Chart(canvas, {
        type: 'bar',
        data: {
            labels: grupos, // grupos (ex: anos)
            datasets: series.map(s => ({
                label: s.nome,
                data: s.valores,
                backgroundColor: s.cor
            }))
        },
        options: {
            responsive: true,
            onClick: (event, elements) => {
                if (elements.length > 0 && typeof onClick === 'function') {
                    const datasetIndex = elements[0].datasetIndex; // série
                    const dataIndex = elements[0].index; // grupo

                    const grupo = grupos[dataIndex];
                    const serie = series[datasetIndex];
                    const valor = serie.valores[dataIndex];

                    onClick(grupo, serie.nome, valor);
                }
            },
            scales: {
                x: { stacked: false },
                y: { beginAtZero: true }
            },
            plugins: {
                legend: { display: true },
                title: {
                    display: true,
                    text: titulo,
                    font: { size: 15 },
                    color: '#333'
                },
                datalabels: {
                    anchor: 'end',
                    align: 'start',
                    color: '#fff',
                    font: { weight: 'bold', size: 14 },
                    formatter: value => value
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function atualizarGrafico(tipo,grafico,dataX,dataY,cores){

 if(tipo == 'donuts'){
    var somatorio = 0
    for(var c1 = 0; c1 < dataY.length; c1++){
        somatorio += dataY[c1]
    }
    for(var c1 = 0; c1 < dataY.length; c1++){
        dataY[c1] = dataY[c1] / somatorio * 100
        dataY[c1] = parseFloat(dataY[c1].toFixed(1))
    }
 }

 if(dataX != ''){
   grafico.data.labels = dataX
 }

 if(dataY != ''){
   if(dataY.length == 2){
   }
   grafico.data.datasets[0].data = dataY
 }

 if(cores != ''){
   grafico.data.datasets[0].backgroundColor = cores
 }

 grafico.update()
}

function graficoDonuts(destino, titulo, dataX, dataY, cores,funcao){

 var grafico = document.getElementById(destino);
 
 var total = 0
 for(var c1 = 0; c1 < dataY.length; c1++){
     total += dataY[c1]
 }
 for(var c1 = 0; c1 < dataY.length; c1++){
     dataY[c1] = dataY[c1] / total * 100
     dataY[c1] = parseFloat(dataY[c1].toFixed(1))
 }


 grafico = new Chart(grafico, {
     type: 'doughnut',
     data: {
       labels: dataX,
       datasets: [{
         data: dataY,
         borderWidth: 1,
         backgroundColor: cores
       }]
     },
     options: {

      onClick: (event, barElement) => {
         var indice = barElement[0].index
         var elemento = dataX[indice]

         if(funcao == 'gerencias'){
             pagina_licitatorios_filtrar_andamento(dataX[indice])
         }

         if(funcao == 'gerenciasConcluidas'){
             pagina_licitatorios_filtrar_cargas(dataX[indice])
         }

      },

    plugins: {
      title: {
        display: true,
        text: titulo,
        font: {
          size: 18
        },
        color: '#333'
      },
        datalabels: {
          color: '#fff',           // Cor dos rótulos
          font: {
            weight: 'bold',        // Peso da fonte
            size: 16               // Tamanho da fonte
          },
          formatter: (value, context) => {
            return `${value}%`;    // Exibe o valor como percentual
          },
          anchor: 'center',        // Centraliza o rótulo na fatia
          align: 'center',         // Alinha o rótulo na posição central
        }

    },

       scales: {
         y: {
           beginAtZero: true
         }
       }
     },plugins: [ChartDataLabels]
 });
 return grafico
}

function grafico_linhas(config) {
  const {
    id,
    titulo,
    legendas,  // <- substituído "labels" por "legendas"
    valores,
    cores,
    onClick
  } = config;

  const canvas = document.getElementById(id);

  // Garantir que o canvas ocupe 100% do container
  canvas.style.width = '100%';
  canvas.style.height = '100%';

  const dadosFiltrados = valores
    .map((valor, i) => ({
      valor,
      label: legendas[i], // <- aqui também usa "legendas"
      cor: cores[i] || 'rgba(0,0,0,0.5)',
      indexOriginal: i
    }))
    .filter(item => item.valor > 0);

  const valoresFiltrados = dadosFiltrados.map(item => item.valor);
  const legendasFiltradas = dadosFiltrados.map(item => item.label);
  const corLinha = dadosFiltrados[0]?.cor || 'rgba(0, 123, 255, 0.8)';

  const chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: legendasFiltradas, // <- aqui também
      datasets: [{
        label: '', // removido o label do dataset
        data: valoresFiltrados,
        borderColor: corLinha,
        backgroundColor: corLinha,
        fill: false,
        tension: 0.3,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      onClick: (event, elements) => {
        if (elements.length > 0 && typeof onClick === 'function') {
          const index = elements[0].index;
          const item = dadosFiltrados[index];
          onClick(item.indexOriginal, item.label, item.valor)
        }
      },
      plugins: {
        title: {
          display: true,
          text: titulo,
          font: { size: 18 },
          color: '#333'
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  return chart;
}

function grafico_polar(config) {
  const {
    id,
    titulo,
    legendas,
    valores,
    cores,
    onClick
  } = config;

  const canvas = document.getElementById(id);

  // Ocupa 100% do container
  canvas.style.width = '100%';
  canvas.style.height = '100%';

  const dadosFiltrados = valores
    .map((valor, i) => ({
      valor,
      label: legendas[i],
      cor: cores[i] || 'rgba(0,0,0,0.5)',
      indexOriginal: i
    }))
    .filter(item => item.valor > 0);

  const valoresFiltrados = dadosFiltrados.map(item => item.valor);
  const legendasFiltradas = dadosFiltrados.map(item => item.label);
  const coresFiltradas = dadosFiltrados.map(item => item.cor);

  const chart = new Chart(canvas, {
    type: 'polarArea',
    data: {
      labels: legendasFiltradas,
      datasets: [{
        data: valoresFiltrados,
        backgroundColor: coresFiltradas,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      onClick: (event, elements) => {
        if (elements.length > 0 && typeof onClick === 'function') {
          const index = elements[0].index;
          const item = dadosFiltrados[index];
          onClick(item.indexOriginal, item.label, item.valor); // retorna os três
        }
      },
      plugins: {
        title: {
          display: true,
          text: titulo,
          font: { size: 18 },
          color: '#333'
        },
        legend: {
          display: true
        }
      }
    }
  });

  return chart;
}