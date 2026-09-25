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
// COMPROBAR SESIÓN
// ==========================================

window.protegerPagina = async function () {

    try {

        console.log("Comprobando sesión...");


        const resultadoSesion =
            await supabaseClient.auth.getSession();


        if (resultadoSesion.error) {

            console.error(
                "Error al comprobar la sesión:",
                resultadoSesion.error
            );

            return false;
        }


        const session =
            resultadoSesion.data.session;


        if (!session) {

            console.error(
                "No existe una sesión activa."
            );

            return false;
        }


        console.log(
            "Sesión encontrada:",
            session.user.email
        );


        window.usuarioSesion =
            session.user;


        // ==========================================
        // CONSULTAR PERFIL
        // ==========================================

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
                "Error al consultar el perfil:",
                resultadoPerfil.error
            );

            return false;
        }


        const perfil =
            resultadoPerfil.data;


        if (!perfil) {

            console.error(
                "No se encontró el usuario en la tabla usuarios."
            );

            return false;
        }


        console.log(
            "Perfil encontrado:",
            perfil
        );


        window.perfilUsuario =
            perfil;


        window.rolUsuario =
            normalizarTexto(
                perfil.rol
            );


        window.estadoUsuario =
            normalizarTexto(
                perfil.estado
            );


        // ==========================================
        // COMPROBAR ESTADO
        // ==========================================

        if (
            window.estadoUsuario !==
            "ACTIVO"
        ) {

            console.error(
                "El usuario está inactivo."
            );

            return false;
        }


        console.log(
            "Usuario autorizado:",
            window.rolUsuario
        );


        return true;


    } catch (error) {

        console.error(
            "Error inesperado al validar usuario:",
            error
        );

        return false;
    }

};


// ==========================================
// FUNCIONES DE ROLES
// ==========================================

window.esAdministrador = function () {

    return (
        window.rolUsuario ===
        "ADMINISTRADOR"
    );

};


window.esUsuario = function () {

    return (
        window.rolUsuario ===
        "USUARIO"
    );

};


window.tieneRol = function (rol) {

    return (
        window.rolUsuario ===
        normalizarTexto(rol)
    );

};
