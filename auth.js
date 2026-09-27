(function () {
    window.usuarioSesion = null;
    window.perfilUsuario = null;
    window.rolUsuario = null;
    window.estadoUsuario = null;
    window.nombreUsuarioActual = "";

    /* =========================================================
       CONFIGURACIÓN DE INACTIVIDAD
       30 minutos = 1,800,000 milisegundos
       ========================================================= */

    const TIEMPO_INACTIVIDAD = 30 * 60 * 1000;

    let temporizadorInactividad = null;

    function normalizarTextoAuth(valor) {
        return String(valor || "")
            .trim()
            .toUpperCase();
    }

    /* =========================================================
       CIERRE DE SESIÓN POR INACTIVIDAD
       ========================================================= */

    function iniciarTemporizadorInactividad() {
        if (temporizadorInactividad) {
            clearTimeout(temporizadorInactividad);
        }

        temporizadorInactividad = setTimeout(
            async function () {
                console.log(
                    "SESION CERRADA POR 30 MINUTOS DE INACTIVIDAD"
                );

                try {
                    await supabaseClient.auth.signOut();
                } catch (error) {
                    console.error(
                        "ERROR AL CERRAR SESION POR INACTIVIDAD:",
                        error
                    );
                }

                window.usuarioSesion = null;
                window.perfilUsuario = null;
                window.rolUsuario = null;
                window.estadoUsuario = null;
                window.nombreUsuarioActual = "";

                window.location.href = "index.html";
            },
            TIEMPO_INACTIVIDAD
        );
    }

    function reiniciarTemporizadorInactividad() {
        if (!window.usuarioSesion) {
            return;
        }

        iniciarTemporizadorInactividad();
    }

    /* =========================================================
       ACTIVIDAD DEL USUARIO
       ========================================================= */

    const eventosActividad = [
        "click",
        "mousemove",
        "mousedown",
        "keydown",
        "scroll",
        "touchstart",
        "touchmove",
        "wheel"
    ];

    eventosActividad.forEach(function (evento) {
        document.addEventListener(
            evento,
            reiniciarTemporizadorInactividad,
            {
                passive: true
            }
        );
    });

    /* =========================================================
       PROTEGER PAGINA
       ========================================================= */

    window.protegerPagina = async function () {
        console.log("AUTH REAL INICIADO");

        try {
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
                console.error("NO HAY SESION");
                return false;
            }

            console.log(
                "SESION ENCONTRADA:",
                session.user.email
            );

            window.usuarioSesion = session.user;

            const resultadoPerfil =
                await supabaseClient
                    .from("usuarios")
                    .select(
                        "id, correo, nombre, rol, estado, fechaRegistro"
                    )
                    .eq("id", session.user.id)
                    .maybeSingle();

            if (resultadoPerfil.error) {
                console.error(
                    "ERROR PERFIL:",
                    resultadoPerfil.error
                );
                return false;
            }

            const perfil = resultadoPerfil.data;

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

            window.perfilUsuario = perfil;

            window.rolUsuario =
                normalizarTextoAuth(perfil.rol);

            window.estadoUsuario =
                normalizarTextoAuth(perfil.estado);

            if (window.estadoUsuario !== "ACTIVO") {
                console.error(
                    "USUARIO INACTIVO. VALOR RECIBIDO:",
                    perfil.estado
                );
                return false;
            }

            const nombreReal =
                String(perfil.nombre || "").trim();

            if (!nombreReal) {
                console.error(
                    "EL USUARIO NO TIENE NOMBRE REGISTRADO EN usuarios"
                );
                return false;
            }

            window.nombreUsuarioActual =
                nombreReal;

            console.log(
                "USUARIO AUTORIZADO:",
                window.rolUsuario
            );

            console.log(
                "NOMBRE DEL USUARIO:",
                window.nombreUsuarioActual
            );

            /* =================================================
               INICIAR LOS 30 MINUTOS DESDE LA AUTORIZACIÓN
               ================================================= */

            iniciarTemporizadorInactividad();

            return true;

        } catch (error) {
            console.error(
                "ERROR AUTH:",
                error
            );

            return false;
        }
    };

    /* =========================================================
       OBTENER NOMBRE DEL USUARIO
       ========================================================= */

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

    /* =========================================================
       OBTENER CORREO DEL USUARIO
       ========================================================= */

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

    /* =========================================================
       COMPROBAR ADMINISTRADOR
       ========================================================= */

    window.esAdministrador =
        function () {
            return (
                window.rolUsuario ===
                "ADMINISTRADOR"
            );
        };

    /* =========================================================
       COMPROBAR USUARIO
       ========================================================= */

    window.esUsuario =
        function () {
            return (
                window.rolUsuario ===
                "USUARIO"
            );
        };

    /* =========================================================
       COMPROBAR ROL
       ========================================================= */

    window.tieneRol =
        function (rol) {
            return (
                window.rolUsuario ===
                normalizarTextoAuth(rol)
            );
        };

})();
