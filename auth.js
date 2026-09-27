javascript
(function () {

    // ============================================================
    // VARIABLES GLOBALES DEL USUARIO
    // ============================================================

    window.usuarioSesion = null;
    window.perfilUsuario = null;
    window.rolUsuario = null;
    window.estadoUsuario = null;
    window.nombreUsuarioActual = "";


    // ============================================================
    // CONFIGURACIÓN DE INACTIVIDAD
    // ============================================================

    const TIEMPO_INACTIVIDAD = 30 * 60 * 1000;
    const CLAVE_ULTIMA_ACTIVIDAD = "biblioteca_ultima_actividad";

    let temporizadorInactividad = null;
    let intervaloActividad = null;
    let ultimaActualizacionActividad = 0;

    const INTERVALO_ACTUALIZACION_ACTIVIDAD = 30 * 1000;


    // ============================================================
    // NORMALIZAR TEXTO
    // ============================================================

    function normalizarTextoAuth(valor) {

        return String(valor || "")
            .trim()
            .toUpperCase();

    }


    // ============================================================
    // OBTENER ÚLTIMA ACTIVIDAD
    // ============================================================

    function obtenerUltimaActividad() {

        try {

            const valor = localStorage.getItem(
                CLAVE_ULTIMA_ACTIVIDAD
            );

            const numero = Number(valor);

            if (!numero || !Number.isFinite(numero)) {
                return 0;
            }

            return numero;

        } catch (error) {

            console.error(
                "ERROR AL LEER ÚLTIMA ACTIVIDAD:",
                error
            );

            return 0;
        }

    }


    // ============================================================
    // REGISTRAR ACTIVIDAD
    // ============================================================

    function registrarActividad(forzar = false) {

        if (!window.usuarioSesion) {
            return;
        }

        const ahora = Date.now();

        if (
            !forzar &&
            ahora - ultimaActualizacionActividad <
            INTERVALO_ACTUALIZACION_ACTIVIDAD
        ) {
            return;
        }

        ultimaActualizacionActividad = ahora;

        try {

            localStorage.setItem(
                CLAVE_ULTIMA_ACTIVIDAD,
                String(ahora)
            );

        } catch (error) {

            console.error(
                "ERROR AL GUARDAR ACTIVIDAD:",
                error
            );

        }

        programarCierreInactividad();

    }


    // ============================================================
    // LIMPIAR TEMPORIZADOR
    // ============================================================

    function limpiarTemporizadorInactividad() {

        if (temporizadorInactividad) {

            clearTimeout(
                temporizadorInactividad
            );

            temporizadorInactividad = null;

        }

    }


    // ============================================================
    // CERRAR SESIÓN POR INACTIVIDAD
    // ============================================================

    async function cerrarSesionPorInactividad() {

        limpiarTemporizadorInactividad();

        console.log(
            "Sesión cerrada por 30 minutos de inactividad."
        );

        try {

            localStorage.removeItem(
                CLAVE_ULTIMA_ACTIVIDAD
            );

        } catch (error) {

            console.error(
                "ERROR AL LIMPIAR ACTIVIDAD:",
                error
            );

        }

        window.usuarioSesion = null;
        window.perfilUsuario = null;
        window.rolUsuario = null;
        window.estadoUsuario = null;
        window.nombreUsuarioActual = "";

        try {

            if (
                window.supabaseClient &&
                window.supabaseClient.auth
            ) {

                await window.supabaseClient.auth.signOut();

            }

        } catch (error) {

            console.error(
                "ERROR AL CERRAR SESIÓN POR INACTIVIDAD:",
                error
            );

        }

        if (
            !window.location.pathname
                .toLowerCase()
                .endsWith("index.html")
        ) {

            window.location.href = "index.html";

        } else {

            window.location.reload();

        }

    }


    // ============================================================
    // PROGRAMAR CIERRE POR INACTIVIDAD
    // ============================================================

    function programarCierreInactividad() {

        limpiarTemporizadorInactividad();

        if (!window.usuarioSesion) {
            return;
        }

        const ultimaActividad =
            obtenerUltimaActividad();

        if (!ultimaActividad) {
            return;
        }

        const ahora = Date.now();

        const tiempoTranscurrido =
            ahora - ultimaActividad;

        const tiempoRestante =
            TIEMPO_INACTIVIDAD -
            tiempoTranscurrido;

        if (tiempoRestante <= 0) {

            cerrarSesionPorInactividad();

            return;
        }

        temporizadorInactividad =
            setTimeout(
                function () {

                    const ultima =
                        obtenerUltimaActividad();

                    if (!ultima) {
                        return;
                    }

                    const momentoActual =
                        Date.now();

                    if (
                        momentoActual - ultima >=
                        TIEMPO_INACTIVIDAD
                    ) {

                        cerrarSesionPorInactividad();

                    } else {

                        programarCierreInactividad();

                    }

                },
                Math.min(
                    tiempoRestante,
                    30000
                )
            );

    }


    // ============================================================
    // INICIAR CONTROL DE INACTIVIDAD
    // ============================================================

    function iniciarControlInactividad() {

        if (!window.usuarioSesion) {
            return;
        }

        const ultimaActividad =
            obtenerUltimaActividad();

        if (!ultimaActividad) {

            registrarActividad(true);

            return;
        }

        const tiempoTranscurrido =
            Date.now() -
            ultimaActividad;

        if (
            tiempoTranscurrido >=
            TIEMPO_INACTIVIDAD
        ) {

            cerrarSesionPorInactividad();

            return;
        }

        programarCierreInactividad();

    }


    // ============================================================
    // DETENER CONTROL DE INACTIVIDAD
    // ============================================================

    function detenerControlInactividad() {

        limpiarTemporizadorInactividad();

        try {

            localStorage.removeItem(
                CLAVE_ULTIMA_ACTIVIDAD
            );

        } catch (error) {

            console.error(
                "ERROR AL LIMPIAR ACTIVIDAD:",
                error
            );

        }

        ultimaActualizacionActividad = 0;

    }


    // ============================================================
    // DETECTAR ACTIVIDAD DEL USUARIO
    // ============================================================

    function configurarDeteccionActividad() {

        const eventosActividad = [
            "click",
            "keydown",
            "mousemove",
            "mousedown",
            "touchstart",
            "scroll",
            "pointerdown"
        ];

        eventosActividad.forEach(
            function (evento) {

                document.addEventListener(
                    evento,
                    function () {

                        if (
                            window.usuarioSesion
                        ) {

                            registrarActividad();

                        }

                    },
                    {
                        passive: true
                    }
                );

            }
        );

        if (intervaloActividad) {

            clearInterval(
                intervaloActividad
            );

        }

        intervaloActividad =
            setInterval(
                function () {

                    if (
                        !window.usuarioSesion
                    ) {
                        return;
                    }

                    const ultima =
                        obtenerUltimaActividad();

                    if (!ultima) {
                        return;
                    }

                    const tiempoTranscurrido =
                        Date.now() -
                        ultima;

                    if (
                        tiempoTranscurrido >=
                        TIEMPO_INACTIVIDAD
                    ) {

                        cerrarSesionPorInactividad();

                    }

                },
                30000
            );

    }


    // ============================================================
    // PROTEGER PÁGINA / OBTENER USUARIO
    // ============================================================

    window.protegerPagina = async function () {

        console.log(
            "AUTH REAL INICIADO"
        );

        try {

            // ----------------------------------------------------
            // 1. VERIFICAR QUE SUPABASE ESTÉ DISPONIBLE
            // ----------------------------------------------------

            if (!window.supabaseClient) {

                console.error(
                    "SUPABASECLIENT NO ESTÁ DISPONIBLE."
                );

                return false;
            }

            if (!window.supabaseClient.auth) {

                console.error(
                    "SUPABASE AUTH NO ESTÁ DISPONIBLE."
                );

                return false;
            }


            // ----------------------------------------------------
            // 2. OBTENER SESIÓN ACTUAL
            // ----------------------------------------------------

            console.log(
                "VERIFICANDO SESIÓN DE SUPABASE..."
            );

            const resultadoSesion =
                await window.supabaseClient.auth.getSession();

            if (resultadoSesion.error) {

                console.error(
                    "ERROR SESIÓN:",
                    resultadoSesion.error
                );

                return false;
            }

            const session =
                resultadoSesion.data &&
                resultadoSesion.data.session
                    ? resultadoSesion.data.session
                    : null;


            // ----------------------------------------------------
            // 3. VERIFICAR SESIÓN
            // ----------------------------------------------------

            if (!session) {

                console.error(
                    "NO HAY SESIÓN ACTIVA."
                );

                detenerControlInactividad();

                return false;
            }

            console.log(
                "SESIÓN ENCONTRADA:",
                session.user.email
            );

            window.usuarioSesion =
                session.user;


            // ----------------------------------------------------
            // 4. BUSCAR PERFIL EN usuarios
            // ----------------------------------------------------

            console.log(
                "BUSCANDO PERFIL EN usuarios..."
            );

            const resultadoPerfil =
                await window.supabaseClient
                    .from("usuarios")
                    .select(
                        "id, correo, nombre, rol, estado, fechaRegistro"
                    )
                    .eq(
                        "id",
                        session.user.id
                    )
                    .maybeSingle();

            if (resultadoPerfil.error) {

                console.error(
                    "ERROR PERFIL:",
                    resultadoPerfil.error
                );

                return false;
            }

            const perfil =
                resultadoPerfil.data;


            // ----------------------------------------------------
            // 5. VERIFICAR PERFIL
            // ----------------------------------------------------

            if (!perfil) {

                console.error(
                    "PERFIL NO ENCONTRADO PARA EL USUARIO:",
                    session.user.id
                );

                return false;
            }

            console.log(
                "PERFIL ENCONTRADO:",
                perfil
            );

            window.perfilUsuario =
                perfil;


            // ----------------------------------------------------
            // 6. OBTENER ROL Y ESTADO
            // ----------------------------------------------------

            window.rolUsuario =
                normalizarTextoAuth(
                    perfil.rol
                );

            window.estadoUsuario =
                normalizarTextoAuth(
                    perfil.estado
                );


            // ----------------------------------------------------
            // 7. VERIFICAR USUARIO ACTIVO
            // ----------------------------------------------------

            if (
                window.estadoUsuario !==
                "ACTIVO"
            ) {

                console.error(
                    "USUARIO INACTIVO. VALOR RECIBIDO:",
                    perfil.estado
                );

                return false;
            }


            // ----------------------------------------------------
            // 8. OBTENER NOMBRE REAL
            // ----------------------------------------------------

            const nombreReal =
                String(
                    perfil.nombre || ""
                ).trim();

            if (!nombreReal) {

                console.error(
                    "EL USUARIO NO TIENE NOMBRE REGISTRADO EN usuarios."
                );

                return false;
            }

            window.nombreUsuarioActual =
                nombreReal;


            // ----------------------------------------------------
            // 9. ACTIVAR CONTROL DE INACTIVIDAD
            // ----------------------------------------------------

            iniciarControlInactividad();


            // ----------------------------------------------------
            // 10. CONFIRMACIÓN
            // ----------------------------------------------------

            console.log(
                "USUARIO AUTORIZADO:",
                window.rolUsuario
            );

            console.log(
                "NOMBRE DEL USUARIO:",
                window.nombreUsuarioActual
            );

            return true;

        } catch (error) {

            console.error(
                "ERROR AUTH:",
                error
            );

            return false;
        }

    };


    // ============================================================
    // OBTENER NOMBRE DEL USUARIO ACTUAL
    // ============================================================

    window.obtenerNombreUsuarioActual =
        function () {

            if (
                window.nombreUsuarioActual &&
                String(
                    window.nombreUsuarioActual
                ).trim()
            ) {

                return String(
                    window.nombreUsuarioActual
                ).trim();

            }

            if (
                window.perfilUsuario &&
                window.perfilUsuario.nombre
            ) {

                return String(
                    window.perfilUsuario.nombre
                ).trim();

            }

            return "";

        };


    // ============================================================
    // OBTENER CORREO DEL USUARIO ACTUAL
    // ============================================================

    window.obtenerCorreoUsuarioActual =
        function () {

            if (
                window.perfilUsuario &&
                window.perfilUsuario.correo
            ) {

                return String(
                    window.perfilUsuario.correo
                ).trim();

            }

            if (
                window.usuarioSesion &&
                window.usuarioSesion.email
            ) {

                return String(
                    window.usuarioSesion.email
                ).trim();

            }

            return "";

        };


    // ============================================================
    // VERIFICAR ROL ADMINISTRADOR
    // ============================================================

    window.esAdministrador =
        function () {

            return (
                window.rolUsuario ===
                "ADMINISTRADOR"
            );

        };


    // ============================================================
    // VERIFICAR ROL USUARIO
    // ============================================================

    window.esUsuario =
        function () {

            return (
                window.rolUsuario ===
                "USUARIO"
            );

        };


    // ============================================================
    // VERIFICAR CUALQUIER ROL
    // ============================================================

    window.tieneRol =
        function (rol) {

            return (
                window.rolUsuario ===
                normalizarTextoAuth(
                    rol
                )
            );

        };


    // ============================================================
    // ACTIVAR DETECCIÓN DE ACTIVIDAD
    // ============================================================

    configurarDeteccionActividad();

})();
