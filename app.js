// =========================================================
// CONFIGURACIÓN
// =========================================================

const CLAVE_LIBROS = "biblioteca_libros";
const CLAVE_PRESTAMOS = "biblioteca_prestamos";


// =========================================================
// OBTENER LIBROS
// =========================================================

function obtenerLibros() {

    const datos = localStorage.getItem(CLAVE_LIBROS);

    if (!datos) {
        return [];
    }

    try {
        return JSON.parse(datos);
    } catch (error) {

        console.error(
            "Error al leer los libros:",
            error
        );

        return [];
    }
}


// =========================================================
// OBTENER PRÉSTAMOS
// =========================================================

function obtenerPrestamos() {

    const datos =
        localStorage.getItem(CLAVE_PRESTAMOS);

    if (!datos) {
        return [];
    }

    try {
        return JSON.parse(datos);
    } catch (error) {

        console.error(
            "Error al leer los préstamos:",
            error
        );

        return [];
    }
}


// =========================================================
// GUARDAR PRÉSTAMOS
// =========================================================

function guardarPrestamos(prestamos) {

    localStorage.setItem(
        CLAVE_PRESTAMOS,
        JSON.stringify(prestamos)
    );

}


// =========================================================
// FECHA ACTUAL
// =========================================================

function obtenerFechaActual() {

    const fecha = new Date();

    const año = fecha.getFullYear();

    const mes = String(
        fecha.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        fecha.getDate()
    ).padStart(2, "0");

    return `${año}-${mes}-${dia}`;
}


// =========================================================
// SUMAR 4 SEMANAS
// =========================================================

function obtenerFechaDevolucion() {

    const fecha = new Date();

    fecha.setDate(
        fecha.getDate() + 28
    );

    const año = fecha.getFullYear();

    const mes = String(
        fecha.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        fecha.getDate()
    ).padStart(2, "0");

    return `${año}-${mes}-${dia}`;
}


// =========================================================
// ACTUALIZAR ESTADÍSTICAS DEL INICIO
// =========================================================

function actualizarInicio() {

    const libros = obtenerLibros();

    const prestamos = obtenerPrestamos();

    const totalLibros =
        libros.length;

    const disponibles =
        libros.filter(
            libro => libro.estado === "Disponible"
        ).length;

    const prestados =
        prestamos.filter(
            prestamo =>
                prestamo.estado === "Prestado"
        ).length;


    const hoy =
        new Date(
            obtenerFechaActual()
        );


    const vencidos =
        prestamos.filter(
            prestamo => {

                if (
                    prestamo.estado !== "Prestado"
                ) {
                    return false;
                }

                const fechaDevolucion =
                    new Date(
                        prestamo.fechaDevolucion
                    );

                return fechaDevolucion < hoy;

            }
        ).length;


    const elementoLibros =
        document.getElementById(
            "totalLibros"
        );

    const elementoDisponibles =
        document.getElementById(
            "totalDisponibles"
        );

    const elementoPrestados =
        document.getElementById(
            "totalPrestados"
        );

    const elementoVencidos =
        document.getElementById(
            "totalVencidos"
        );


    if (elementoLibros) {
        elementoLibros.textContent =
            totalLibros;
    }

    if (elementoDisponibles) {
        elementoDisponibles.textContent =
            disponibles;
    }

    if (elementoPrestados) {
        elementoPrestados.textContent =
            prestados;
    }

    if (elementoVencidos) {
        elementoVencidos.textContent =
            vencidos;
    }

}


// =========================================================
// MENSAJE DE OPCIÓN EN DESARROLLO
// =========================================================

function mostrarMensajeProximamente(
    evento,
    nombre
) {

    evento.preventDefault();

    const mensaje =
        document.getElementById(
            "mensajeInicio"
        );

    if (!mensaje) {
        return;
    }

    mensaje.textContent =
        `${nombre} estará disponible en la siguiente etapa del sistema.`;

    mensaje.className =
        "mensaje aviso";

}


// =========================================================
// INICIAR
// =========================================================

actualizarInicio();