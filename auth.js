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
        // SIN SESIÓN
        // ------------------------------------------

        if (error || !session) {

            window.location.replace("index.html");

            return false;
        }


        // ------------------------------------------
        // GUARDAR USUARIO DE AUTHENTICATION
        // ------------------------------------------

        window.usuarioSesion = session.user;


        // ------------------------------------------
        // BUSCAR PERFIL EN usuarios
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


        if (errorPerfil) {

            console.error(
                "Error al consultar el perfil:",
                errorPerfil
            );

            window.location.replace("index.html");

            return false;
        }


        // ------------------------------------------
        // CUENTA SIN PERFIL
        // ------------------------------------------

        if (!perfil) {

            console.error(
                "La cuenta no tiene registro en usuarios."
            );

            window.location.replace("index.html");

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
        // USUARIO INACTIVO
        // ------------------------------------------

        if (
            window.estadoUsuario !==
            "ACTIVO"
        ) {

            console.error(
                "El usuario está inactivo."
            );

            await supabaseClient.auth.signOut();

            window.location.replace("index.html");

            return false;
        }


        // ------------------------------------------
        // ACCESO CORRECTO
        // ------------------------------------------

        return true;


    } catch (error) {

        console.error(
            "Error al comprobar la sesión y el rol:",
            error
        );

        window.location.replace("index.html");

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

    await window.protegerPagina();

})();
