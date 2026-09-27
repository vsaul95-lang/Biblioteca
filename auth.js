(function () {

    // ============================================================
    // VARIABLES GLOBALES DEL USUARIO
    // ============================================================

    window.usuarioSesion = null;
    window.perfilUsuario = null;
    window.rolUsuario = null;
    window.estadoUsuario = null;

    // Nombre del usuario actualmente autenticado.
    // Este valor será utilizado por:
    // PrestadoPor
    // DevueltoPor
    window.nombreUsuarioActual = "";

    // ============================================================
    // CONFIGURACIÓN DE SESIÓN POR INACTIVIDAD
    // ============================================================

    const TIEMPO_INACTIVIDAD =
        30 * 60 * 1000; // 30 minutos

    const CLAVE_ULTIMA_ACTIVIDAD =
        "biblioteca_ultima_actividad";

    let temporizadorInactividad = null;

    let ultimaActividadRegistrada = 0;

    // Evita escribir en localStorage demasiadas veces
    // cuando el usuario mueve continuamente el mouse.
    let ultimaActualizacionActividad = 0;

    const INTERVALO_ACTUALIZACION_ACTIVIDAD =
        30 * 1000; // 30 segundos


    // ============================================================
    // NORMALIZAR TEXTO
    // ============================================================

    function normalizarTextoAuth(valor) {

        return String(valor || "")
            .trim()
            .toUpperCase();

    }


    // ============================================================
    // OBTENER MARCA DE TIEMPO DE ÚLTIMA ACTIVIDAD
    // ============================================================

    function obtenerUltimaActividad() {

        const valor =
            localStorage.getItem(
                CLAVE_ULTIMA_ACTIVIDAD
            );

        const numero =
            Number(valor);

        if (
            !numero ||
            !Number.isFinite(numero)
        ) {
            return 0;
        }

        return numero;

    }


    // ============================================================
    // GUARDAR ACTIVIDAD
    // ============================================================

    function registrarActividad(
        forzar = false
    ) {

        const ahora =
            Date.now();

        if (
            !forzar &&
            ahora -
                ultimaActualizacionActividad <
            INTERVALO_ACTUALIZACION_ACTIVIDAD
        ) {
            return;
        }

        ultimaActualizacionActividad =
            ahora;

        ultimaActividadRegistrada =
            ahora;

        localStorage.setItem(
            CLAVE_ULTIMA_ACTIVIDAD,
            String(ahora)
        );

        programarCierreInactividad();

    }


    // ============================================================
    // LIMPIAR TEMPORIZADOR
    // ============================================================

    function limpiarTemporizadorInactividad() {

        if (
            temporizadorInactividad
        ) {

            clearTimeout(
                temporizadorInactividad
            );

            temporizadorInactividad =
                null;

        }

    }


    // ============================================================
    // CERRAR SESIÓN POR INACTIVIDAD
    // ============================================================

    async function cerrarSesionPorInactividad() {

        limpiarTemporizadorInactividad();

        console.log(
            "La sesión se cerrará por 30 minutos de inactividad."
        );

        localStorage.removeItem(
            CLAVE_ULTIMA_ACTIVIDAD
        );

        window.usuarioSesion = null;
        window.perfilUsuario = null;
        window.rolUsuario = null;
        window.estadoUsuario = null;
        window.nombreUsuarioActual = "";

        try {

            await supabaseClient.auth.signOut();

        } catch (error) {

            console.error(
                "ERROR AL CERRAR SESIÓN POR INACTIVIDAD:",
                error
            );

        }

        // Volver a la pantalla principal.
        // index.html mostrará nuevamente el inicio de sesión.
        if (
            !window.location.pathname
                .toLowerCase()
                .endsWith("index.html")
        ) {

            window.location.href =
                "index.html";

        } else {

            // Si ya estamos en index.html,
            // recargar para mostrar el acceso.
            window.location.reload();

        }

    }


    // ============================================================
    // PROGRAMAR CIERRE AUTOMÁTICO
    // ============================================================

    function programarCierreInactividad() {

        limpiarTemporizadorInactividad();

        const ultimaActividad =
            obtenerUltimaActividad();

        if (!ultimaActividad) {
            return;
        }

        ultimaActividadRegistrada =
            ultimaActividad;

        const ahora =
            Date.now();

        const tiempoTranscurrido =
            ahora -
            ultimaActividad;

        const tiempoRestante =
            TIEMPO_INACTIVIDAD -
            tiempoTranscurrido;

        if (
            tiempoRestante <= 0
        ) {

            cerrarSesionPorInactividad();

            return;

        }

        temporizadorInactividad =
            setTimeout(
                function () {

                    const ultima =
                        obtenerUltimaActividad();

                    const momentoActual =
                        Date.now();

                    if (
                        ultima &&
                        momentoActual -
                            ultima >=
                        TIEMPO_INACTIVIDAD
                    ) {

                        cerrarSesionPorInactividad();

                        return;

                    }

                    programarCierreInactividad();

                },
                tiempoRestante
            );

    }


    // ============================================================
    // INICIAR CONTROL DE INACTIVIDAD
    // ============================================================

    function iniciarControlInactividad() {

        const ultimaActividad =
            obtenerUltimaActividad();

        if (!ultimaActividad) {

            registrarActividad(true);

        } else {

            ultimaActividadRegistrada =
                ultimaActividad;

            programarCierreInactividad();

        }

    }


    // ============================================================
    // DETENER CONTROL DE INACTIVIDAD
    // ============================================================

    function detenerControlInactividad() {

        limpiarTemporizadorInactividad();

        localStorage.removeItem(
            CLAVE_ULTIMA_ACTIVIDAD
        );

        ultimaActividadRegistrada =
            0;

        ultimaActualizacionActividad =
            0;

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

                        // Solo registrar actividad si
                        // existe una sesión de usuario.
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

        // También revisar periódicamente el tiempo de inactividad.
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
            30 * 1000
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
            // 1. VERIFICAR INACTIVIDAD ANTES DE OBTENER SESIÓN
            // ----------------------------------------------------

            const ultimaActividad =
                obtenerUltimaActividad();

            if (
                ultimaActividad &&
                Date.now() -
                    ultimaActividad >=
                TIEMPO_INACTIVIDAD
            ) {

                console.log(
                    "SESION EXPIRADA POR INACTIVIDAD"
                );

                await cerrarSesionPorInactividad();

                return false;

            }


            // ----------------------------------------------------
            // 2. OBTENER SESIÓN ACTUAL
            // ----------------------------------------------------

            const resultadoSesion =
                await supabaseClient.auth.getSession();

            if (resultadoSesion.error) {

                console.error(
                    "ERROR SESION:",
                    resultadoSesion.error
                );

                return false;
            }

            const session =
                resultadoSesion.data.session;

            if (!session) {

                console.error(
                    "NO HAY SESION"
                );

                detenerControlInactividad();

                return false;
            }

            console.log(
                "SESION ENCONTRADA:",
                session.user.email
            );


            // Guardar usuario de Supabase Auth
            window.usuarioSesion =
                session.user;


            // ----------------------------------------------------
            // 3. VERIFICAR NUEVAMENTE EL TIEMPO
            // ----------------------------------------------------

            const actividadDespuesSesion =
                obtenerUltimaActividad();

            if (
                actividadDespuesSesion &&
                Date.now() -
                    actividadDespuesSesion >=
                TIEMPO_INACTIVIDAD
            ) {

                console.log(
                    "SESION EXPIRADA POR INACTIVIDAD"
                );

                await cerrarSesionPorInactividad();

                return false;

            }


            // ----------------------------------------------------
            // 4. BUSCAR PERFIL EN TABLA usuarios
            // ----------------------------------------------------

            const resultadoPerfil =
                await supabaseClient
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


            // Guardar perfil completo
            window.perfilUsuario =
                perfil;


            // ----------------------------------------------------
            // 5. OBTENER ROL Y ESTADO
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
            // 6. VERIFICAR QUE EL USUARIO ESTÉ ACTIVO
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
            // 7. OBTENER AUTOMÁTICAMENTE EL NOMBRE REAL
            // ----------------------------------------------------

            const nombreReal =
                String(
                    perfil.nombre || ""
                )
                    .trim();

            if (!nombreReal) {

                console.error(
                    "EL USUARIO NO TIENE NOMBRE REGISTRADO EN usuarios"
                );

                return false;
            }


            // Nombre que utilizarán los módulos
            window.nombreUsuarioActual =
                nombreReal;


            // ----------------------------------------------------
            // 8. INICIAR / CONTINUAR CONTROL DE INACTIVIDAD
            // ----------------------------------------------------

            if (
                !obtenerUltimaActividad()
            ) {

                registrarActividad(true);

            } else {

                programarCierreInactividad();

            }


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
    // ACTIVAR CONTROL DE ACTIVIDAD
    // ============================================================

    configurarDeteccionActividad();

})();

[/code]
[/writing]
