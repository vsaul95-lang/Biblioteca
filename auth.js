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
    // NORMALIZAR TEXTO
    // ============================================================

    function normalizarTextoAuth(valor) {
        return String(valor || "")
            .trim()
            .toUpperCase();
    }

    // ============================================================
    // PROTEGER PÁGINA / OBTENER USUARIO
    // ============================================================

    window.protegerPagina = async function () {

        console.log("AUTH REAL INICIADO");

        try {

            // ----------------------------------------------------
            // 1. OBTENER SESIÓN ACTUAL
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

                console.error("NO HAY SESION");

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
            // 2. BUSCAR PERFIL EN TABLA usuarios
            // ----------------------------------------------------

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
            // 3. OBTENER ROL Y ESTADO
            // ----------------------------------------------------

            window.rolUsuario =
                normalizarTextoAuth(perfil.rol);

            window.estadoUsuario =
                normalizarTextoAuth(perfil.estado);

            // ----------------------------------------------------
            // 4. VERIFICAR QUE EL USUARIO ESTÉ ACTIVO
            // ----------------------------------------------------

            if (window.estadoUsuario !== "ACTIVO") {

                console.error(
                    "USUARIO INACTIVO. VALOR RECIBIDO:",
                    perfil.estado
                );

                return false;
            }

            // ----------------------------------------------------
            // 5. OBTENER AUTOMÁTICAMENTE EL NOMBRE REAL
            // ----------------------------------------------------

            const nombreReal =
                String(perfil.nombre || "")
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

    window.obtenerNombreUsuarioActual = function () {

        if (
            window.nombreUsuarioActual &&
            String(window.nombreUsuarioActual).trim()
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

    window.obtenerCorreoUsuarioActual = function () {

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

    window.esAdministrador = function () {

        return (
            window.rolUsuario ===
            "ADMINISTRADOR"
        );
    };

    // ============================================================
    // VERIFICAR ROL USUARIO
    // ============================================================

    window.esUsuario = function () {

        return (
            window.rolUsuario ===
            "USUARIO"
        );
    };

    // ============================================================
    // VERIFICAR CUALQUIER ROL
    // ============================================================

    window.tieneRol = function (rol) {

        return (
            window.rolUsuario ===
            normalizarTextoAuth(rol)
        );
    };

})();
