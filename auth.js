// ==========================================
// PROTECCIÓN DE ACCESO Y ROLES
// ==========================================

window.usuarioSesion = null;
window.perfilUsuario = null;
window.rolUsuario = null;
window.estadoUsuario = null;


// ==========================================
// NORMALIZAR TEXTO
// ==========================================

function normalizarTexto(valor) {

    return String(valor || "")
        .trim()
        .toUpperCase();

}


// ==========================================
// COMPROBAR SESIÓN Y CARGAR PERFIL
// ==========================================

window.protegerPagina = async function () {

    try {

        const {
            data: { session },
            error
        } = await supabaseClient.auth.getSession();


        // ------------------------------------------
        // SI NO HAY SESIÓN
        // ------------------------------------------

        if (error) {

            console.error(
                "Error al comprobar la sesión:",
                error
            );

            window.location.replace("index.html");

            return false;
        }


        if (!session) {

            window.location.replace("index.html");

            return false;
        }


        // ------------------------------------------
        // GUARDAR USUARIO DE SESIÓN
        // ------------------------------------------

        window.usuarioSesion = session.user;


        // ------------------------------------------
        // CONSULTAR PERFIL
        // ------------------------------------------

        const {
            data: perfil,
            error: errorPerfil
        } = await supabaseClient

            .from("usuarios")

            .select(`
                id,
                correo,
                nombre,
                rol,
                estado,
                fechaRegistro
            `)

            .eq(
                "id",
                session.user.id
            )

            .maybeSingle();


        // ------------------------------------------
        // SI HUBO ERROR AL CONSULTAR PERFIL
        // ------------------------------------------

        if (errorPerfil) {

            console.error(
                "Error al consultar el perfil de usuario:",
                errorPerfil
            );

            /*
             * IMPORTANTE:
             * No cerramos la sesión aquí.
             *
             * La sesión de Supabase puede estar correcta
             * aunque temporalmente falle la consulta.
             */

            return false;
        }


        // ------------------------------------------
        // SI NO EXISTE PERFIL
        // ------------------------------------------

        if (!perfil) {

            console.error(
                "La cuenta no tiene registro en la tabla usuarios."
            );

            return false;
        }


        // ------------------------------------------
        // GUARDAR PERFIL
        // ------------------------------------------

        window.perfilUsuario = perfil;


        window.rolUsuario =
            normalizarTexto(perfil.rol);


        window.estadoUsuario =
            normalizarTexto(perfil.estado);


        // ------------------------------------------
        // COMPROBAR ESTADO
        // ------------------------------------------

        if (
            window.estadoUsuario !==
            "ACTIVO"
        ) {

            console.error(
                "El usuario está marcado como inactivo."
            );

            await supabaseClient.auth.signOut();

            window.location.replace("index.html");

            return false;
        }


        // ------------------------------------------
        // TODO CORRECTO
        // ------------------------------------------

        return true;


    } catch (error) {

        console.error(
            "Error al comprobar la sesión y el rol:",
            error
        );

        /*
         * No cerramos la sesión automáticamente
         * por un error inesperado.
         */

        return false;
    }

};


// ==========================================
// COMPROBAR SI ES ADMINISTRADOR
// ==========================================

window.esAdministrador = function () {

    return (
        window.rolUsuario ===
        "ADMINISTRADOR"
    );

};


// ==========================================
// COMPROBAR SI ES USUARIO NORMAL
// ==========================================

window.esUsuario = function () {

    return (
        window.rolUsuario ===
        "USUARIO"
    );

};


// ==========================================
// COMPROBAR UN ROL ESPECÍFICO
// ==========================================

window.tieneRol = function (rol) {

    return (
        window.rolUsuario ===
        normalizarTexto(rol)
    );

};


// ==========================================
// EJECUTAR PROTECCIÓN
// ==========================================

(async function iniciarProteccion() {

    const autorizado =
        await window.protegerPagina();


    /*
     * Si hubo un error al consultar el perfil,
     * no hacemos nada más.
     *
     * La página podrá mostrar el error en consola
     * sin cerrar la sesión de Supabase.
     */

    if (!autorizado) {

        console.warn(
            "No fue posible completar la validación del perfil."
        );

    }

})();
