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

        const resultadoSesion =
            await supabaseClient.auth.getSession();

        const session =
            resultadoSesion.data.session;

        const error =
            resultadoSesion.error;


        // ------------------------------------------
        // ERROR AL COMPROBAR SESIÓN
        // ------------------------------------------

        if (error) {

            console.error(
                "Error al comprobar la sesión:",
                error
            );

            window.location.replace("index.html");

            return false;
        }


        // ------------------------------------------
        // NO HAY SESIÓN
        // ------------------------------------------

        if (!session) {

            console.error(
                "No existe una sesión activa."
            );

            window.location.replace("index.html");

            return false;
        }


        // ------------------------------------------
        // GUARDAR USUARIO DE SUPABASE
        // ------------------------------------------

        window.usuarioSesion =
            session.user;


        // ------------------------------------------
        // BUSCAR PERFIL EN USUARIOS
        // ------------------------------------------

        const resultadoPerfil =
            await supabaseClient
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


        const perfil =
            resultadoPerfil.data;

        const errorPerfil =
            resultadoPerfil.error;


        // ------------------------------------------
        // ERROR AL CONSULTAR PERFIL
        // ------------------------------------------

        if (errorPerfil) {

            console.error(
                "Error al consultar el perfil de usuario:",
                errorPerfil
            );

            return false;
        }


        // ------------------------------------------
        // PERFIL NO ENCONTRADO
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

        window.perfilUsuario =
            perfil;


        // ------------------------------------------
        // GUARDAR ROL
        // ------------------------------------------

        window.rolUsuario =
            normalizarTexto(
                perfil.rol
            );


        // ------------------------------------------
        // GUARDAR ESTADO
        // ------------------------------------------

        window.estadoUsuario =
            normalizarTexto(
                perfil.estado
            );


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
