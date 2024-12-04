const FILTER_COUNTRY = "Colombia";
const FILTER_YEAR = 2021; // Año específico para filtrar datos

// Función para cargar y filtrar datos de un archivo CSV
async function fetchDataForCountry(filePath) {
    console.log(filePath)
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Error al cargar el archivo: ${filePath}`);

        const data = await response.text();
        const rows = data.split('\n').slice(1); // Omitir encabezado

        const dataValues = {};

        rows.forEach(row => {
            const [entity, code, year, value] = row.split(',');

            // Filtrar datos según el país y el año específico
            if (entity === FILTER_COUNTRY && year && value && parseInt(year) === FILTER_YEAR) {
                const numericValue = parseFloat(value);
                if (!isNaN(numericValue)) {
                    if (!dataValues[year]) dataValues[year] = 0;
                    dataValues[year] += numericValue; // Sumar valores si es necesario
                }
            }
        });

        //console.log(`Datos filtrados: ${JSON.stringify(dataValues)}`); // Mostrar datos filtrados
        return dataValues;
    } catch (error) {
        console.error(`Error al procesar ${filePath}:`, error);
        return {};
    }
}

// Función para combinar los datos de múltiples archivos CSV
async function fetchCombinedDataForBarChart(files) {
    const combinedData = {};
    const labelsSet = new Set();

    for (const file of files) {
        console.log(`Procesando archivo: ${file.filePath}`); // Depuración
        const data = await fetchDataForCountry(file.filePath);
        console.log(`Datos para ${file.label}:`, data); // Depuración

        Object.entries(data).forEach(([year, value]) => {
            if (!combinedData[year]) combinedData[year] = {};
            combinedData[year][file.label] = value;
            labelsSet.add(year);
        });
    }

    // Ordenar etiquetas (años)
    const labels = Array.from(labelsSet).sort((a, b) => a - b);
    console.log('Etiquetas ordenadas:', labels); // Depuración

    // Crear conjuntos de datos
    const datasets = files.map(file => ({
        label: file.label,
        data: labels.map(year => combinedData[year]?.[file.label] || 0), // Valores por año
        backgroundColor: file.color,
        borderColor: file.color,
        borderWidth: 1
    }));

    console.log('Conjuntos de datos:', datasets); // Depuración

    return { labels, datasets };
}

// Función para actualizar el gráfico de barras
function actualizarGraficoBarras(elementId, data) {
    const canvas = document.getElementById(elementId);
    const ctx = canvas.getContext('2d');

    if (canvas.chartInstance) {
        canvas.chartInstance.destroy(); // Eliminar el gráfico previo si existe
    }

    canvas.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `Comparación de Consumo y Producción de Energías - ${FILTER_COUNTRY} (${FILTER_YEAR})`
                }
            },
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Función para obtener datos y generar el gráfico de torta
let chartTorta; // Variable global para guardar la instancia del gráfico

async function crearGraficoTorta() {
    try {
        const archivos = [
            { filePath: '../../PUBLICO/DATES/04 share-electricity-renewables.csv', label: 'Electricidad Renovable', color: 'rgba(75, 192, 192, 0.5)' },
            { filePath: '../../PUBLICO/DATES/11 share-electricity-wind.csv', label: 'Electricidad Eólica', color: 'rgba(255, 206, 86, 0.5)' },
            { filePath: '../../PUBLICO/DATES/15 share-electricity-solar.csv', label: 'Electricidad Solar', color: 'rgba(54, 162, 235, 0.5)' },
            { filePath: '../../PUBLICO/DATES/07 share-electricity-hydro.csv', label: 'Electricidad Hidroeléctrica', color: 'rgba(153, 102, 255, 0.5)' }
        ];

        const datos = [];
        const etiquetas = [];
        const colores = [];

        for (const archivo of archivos) {
            const data = await fetchDataForCountry(archivo.filePath);
            const totalValue = Object.values(data).reduce((sum, value) => sum + value, 0);
            datos.push(totalValue);
            etiquetas.push(archivo.label);
            colores.push(archivo.color);
        }

        const ctx = document.getElementById('graficoTorta').getContext('2d');

        // Destruir gráfico existente si ya se creó uno
        if (chartTorta) {
            chartTorta.destroy();
        }

        // Crear nuevo gráfico
        chartTorta = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: etiquetas,
                datasets: [{
                    data: datos,
                    backgroundColor: colores,
                    borderColor: colores,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: `Distribución de Energías en ${FILTER_COUNTRY} (${FILTER_YEAR})` }
                }
            }
        });
    } catch (error) {
        console.error("Error al crear el gráfico de torta:", error);
    }
}
async function fetchDataForColombia(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Error al cargar el archivo: ${filePath}`);

        const data = await response.text();
        const rows = data.split('\n').slice(1); // Omitir encabezado

        const dataValues = {};

        rows.forEach(row => {
            const [entity, code, year, value] = row.split(',');

            // Filtrar solo los datos de Colombia entre los años 2000 y 2022
            const numericYear = parseInt(year, 10);
            if (entity === "Colombia" && numericYear >= 2000 && numericYear <= 2022 && value) {
                const numericValue = parseFloat(value);
                if (!isNaN(numericValue)) {
                    dataValues[year] = numericValue;
                }
            }
        });

        return dataValues;
    } catch (error) {
        console.error(`Error al procesar ${filePath}:`, error);
        return {};
    }
}

async function crearGraficoArea() {
    try {
        const filePath = '../../PUBLICO/DATES/02 modern-renewable-energy-consumption.csv';
        const data = await fetchDataForColombia(filePath);

        const labels = Object.keys(data).sort((a, b) => a - b); // Años ordenados
        const values = labels.map(year => data[year] || 0);

        const ctx = document.getElementById('graficoArea').getContext('2d');
        new Chart(ctx, {
            type: 'line', // Tipo de gráfico base
            data: {
                labels: labels,
                datasets: [{
                    label: 'Consumo de Energía Renovable Moderna (Colombia)',
                    data: values,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    fill: true, // Llenar el área bajo la línea
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: { 
                        display: true, 
                        text: 'Consumo de Energía Renovable Moderna en Colombia' 
                    }
                },
                scales: {
                    x: { title: { display: true, text: 'Años' } },
                    y: { 
                        beginAtZero: true, 
                        title: { display: true, text: 'Consumo (TWh)' } 
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error al crear el gráfico de área:", error);
    }
}

// Inicialización al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await crearGraficoArea(); // Crear el gráfico de área
    } catch (error) {
        console.error("Error al inicializar el gráfico de área:", error);
    }
});
// Evento al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
    // Configuración de los archivos CSV para el gráfico de barras
    const archivosBarChart = [
        { filePath: '../../PUBLICO/DATES/08 wind-generation.csv', label: 'Generación Eólica', color: 'rgba(75, 192, 192, 0.5)' },
        { filePath: '../../PUBLICO/DATES/12 solar-energy-consumption.csv', label: 'Consumo Solar', color: 'rgba(255, 206, 86, 0.5)' },
        { filePath: '../../PUBLICO/DATES/05 hydropower-consumption.csv', label: 'Consumo Hidroeléctrico', color: 'rgba(54, 162, 235, 0.5)' },
        { filePath: '../../PUBLICO/DATES/16 biofuel-production.csv', label: 'Producción de Biocombustible', color: 'rgba(153, 102, 255, 0.5)' },
        { filePath: '../../PUBLICO/DATES/17 installed-geothermal-capacity.csv', label: 'Capacidad Geotérmica', color: 'rgba(255, 99, 132, 0.5)' }
    ];

    // Depuración: Mostrar datos individuales de cada archivo
    for (const archivo of archivosBarChart) {
        const data = await fetchDataForCountry(archivo.filePath);
        console.log(`Datos procesados para ${archivo.label}:`, data);
    }

    // Obtener datos combinados y actualizar el gráfico de barras
    const combinedData = await fetchCombinedDataForBarChart(archivosBarChart);
    console.log('Datos combinados:', combinedData);

    // Actualizar gráfico de barras
    actualizarGraficoBarras('graficabarras', combinedData);

    // Crear gráfico de torta
    crearGraficoTorta();
});


// Gráfico de líneas
async function fetchDataForChina(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Error al cargar el archivo: ${filePath}`);

        const data = await response.text();
        const rows = data.split('\n').slice(1); // Omitir encabezado

        const dataValues = {};

        rows.forEach(row => {
            const [entity, code, year, value] = row.split(',');
            
            // Filtrar solo los datos de China
            if (entity === "China" && year && value) {
                const numericValue = parseFloat(value);
                if (!isNaN(numericValue)) {
                    if (!dataValues[year]) dataValues[year] = 0;
                    dataValues[year] += numericValue;
                }
            }
        });

        return dataValues;
    } catch (error) {
        console.error(`Error al procesar ${filePath}:`, error);
        return {};
    }
}

async function crearGraficoLineas() {
    try {
        const archivos = [
            { filePath: '../../PUBLICO/DATES/09 cumulative-installed-wind-energy-capacity-gigawatts.csv', label: 'Generación Eólica', color: 'rgba(75, 192, 192, 0.5)' },
            { filePath: '../../PUBLICO/DATES/13 installed-solar-PV-capacity.csv', label: 'Consumo Solar', color: 'rgba(255, 206, 86, 0.5)' },
            { filePath: '../../PUBLICO/DATES/17 installed-geothermal-capacity', label: 'Consumo Hidroeléctrico', color: 'rgba(54, 162, 235, 0.5)' }
        ];

        const combinedData = {};
        const labelsSet = new Set();

        for (const archivo of archivos) {
            const data = await fetchDataForChina(archivo.filePath); // Usar la función que filtra por China
            Object.entries(data).forEach(([year, value]) => {
                if (!combinedData[year]) combinedData[year] = {};
                combinedData[year][archivo.label] = value;
                labelsSet.add(year);
            });
        }

        const labels = Array.from(labelsSet).sort((a, b) => a - b);
        const datasets = archivos.map(archivo => ({
            label: archivo.label,
            data: labels.map(year => combinedData[year]?.[archivo.label] || 0),
            borderColor: archivo.color,
            backgroundColor: archivo.color,
            fill: false,
            tension: 0.4
        }));

        const ctx = document.getElementById('graficoLineas').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: `Tendencia de Energías en China` } // Título actualizado
                },
                scales: {
                    x: { title: { display: true, text: 'Años' } },
                    y: { beginAtZero: true, title: { display: true, text: 'Producción/Consumo' } }
                }
            }
        });
    } catch (error) {
        console.error("Error al crear el gráfico de líneas:", error);
    }
}

// Inicialización al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await crearGraficoLineas(); // Solo crear el gráfico de líneas con los datos filtrados para China
    } catch (error) {
        console.error("Error al inicializar los gráficos:", error);
    }
});
