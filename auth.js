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


        window.usuarioSesion = session.user;


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
                "Error al consultar el perfil de usuario:",
                errorPerfil
            );

            return false;
        }


        if (!perfil) {

            console.error(
                "La cuenta no tiene registro en la tabla usuarios."
            );

            return false;
        }


        window.perfilUsuario = perfil;


        window.rolUsuario =
            normalizarTexto(perfil.rol);


        window.estadoUsuario =
            normalizarTexto(perfil.estado);


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


        return true;


    } catch (error) {

        console.error(
            "Error al comprobar la sesión y el rol:",
            error
        );

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
