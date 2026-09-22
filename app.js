// =========================================================
// ACTUALIZAR ESTADÍSTICAS DEL INICIO
// =========================================================

async function actualizarInicio() {

    try {

        // =====================================================
        // OBTENER LIBROS DESDE SUPABASE
        // =====================================================

        const {
            data: libros,
            error: errorLibros
        } = await supabaseClient
            .from("libros")
            .select("*");


        if (errorLibros) {

            console.error(
                "Error al cargar los libros:",
                errorLibros
            );

            return;
        }


        // =====================================================
        // OBTENER PRÉSTAMOS ACTIVOS DESDE SUPABASE
        // =====================================================

        const {
            data: prestamos,
            error: errorPrestamos
        } = await supabaseClient
            .from("prestamos")
            .select("*");


        if (errorPrestamos) {

            console.error(
                "Error al cargar los préstamos:",
                errorPrestamos
            );

            return;
        }


        // =====================================================
        // NORMALIZAR DATOS
        // =====================================================

        const listaLibros =
            Array.isArray(libros)
                ? libros
                : [];


        const listaPrestamos =
            Array.isArray(prestamos)
                ? prestamos
                : [];


        // =====================================================
        // TOTAL DE LIBROS
        // =====================================================

        const totalLibros =
            listaLibros.length;


        // =====================================================
        // PRÉSTAMOS ACTIVOS
        // =====================================================

        const prestamosActivos =
            listaPrestamos.filter(
                prestamo =>
                    prestamo.estado === "Prestado"
            );


        // =====================================================
        // CÓDIGOS DE LIBROS PRESTADOS
        // =====================================================

        const librosPrestados =
            new Set(
                prestamosActivos.map(
                    prestamo =>
                        String(
                            prestamo.codigoLibro
                        )
                            .trim()
                            .replace(/^0+/, "") || "0"
                )
            );


        // =====================================================
        // LIBROS DISPONIBLES
        // =====================================================

        const disponibles =
            listaLibros.filter(
                libro => {

                    if (
                        libro.estado === "Baja"
                    ) {
                        return false;
                    }


                    const codigo =
                        String(
                            libro.codigoLibro
                        )
                            .trim()
                            .replace(/^0+/, "") || "0";


                    return !librosPrestados.has(
                        codigo
                    );

                }
            ).length;


        // =====================================================
        // TOTAL DE PRESTADOS
        // =====================================================

        const prestados =
            prestamosActivos.length;


        // =====================================================
        // FECHA ACTUAL
        // =====================================================

        const hoy =
            new Date();


        hoy.setHours(
            0,
            0,
            0,
            0
        );


        // =====================================================
        // TOTAL DE VENCIDOS
        // =====================================================

        const vencidos =
            prestamosActivos.filter(
                prestamo => {

                    if (
                        !prestamo.fechaDevolucion
                    ) {
                        return false;
                    }


                    const fechaDevolucion =
                        new Date(
                            prestamo.fechaDevolucion
                        );


                    fechaDevolucion.setHours(
                        0,
                        0,
                        0,
                        0
                    );


                    return fechaDevolucion < hoy;

                }
            ).length;


        // =====================================================
        // MOSTRAR RESULTADOS
        // =====================================================

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


        // =====================================================
        // INFORMACIÓN PARA CONSOLA
        // =====================================================

        console.log(
            "Estadísticas actualizadas:",
            {
                libros: totalLibros,
                disponibles: disponibles,
                prestados: prestados,
                vencidos: vencidos
            }
        );


    } catch (error) {

        console.error(
            "Error al actualizar las estadísticas:",
            error
        );

    }

}


// =========================================================
// INICIAR
// =========================================================

actualizarInicio();
