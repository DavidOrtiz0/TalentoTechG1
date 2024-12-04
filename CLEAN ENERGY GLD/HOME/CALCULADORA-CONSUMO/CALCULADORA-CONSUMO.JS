// Función para calcular totalUsoTWH y constTotalPorcentage
function calcular() {
    // Obtener el consumo del usuario desde el input
    const consumoUsuario = parseFloat(document.getElementById('consumo').value);
    
    // Calcular totalUsoTWH
    const totalUsoTWH = (consumoUsuario / 1000) * 12;

    // Definir el dato x para la regla de tres
    const x = 0.32; // Este es el valor dado en tu ejemplo

    // Aplicar la regla de tres: 100% / x = 3000 / constTotalPorcentage
    const constTotalPorcentage = (totalUsoTWH / x) ;

    // Mostrar el resultado en la página
    document.getElementById('resultado').textContent = `Porcentaje Total: ${constTotalPorcentage.toFixed(2)}%`;
}

// Añadir evento al botón para calcular
document.getElementById('calcular').addEventListener('click', calcular);