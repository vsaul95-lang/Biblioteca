// ==========================================
// AUTH.JS
// PROTECCION DE ACCESO Y ROLES
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
// PROTEGER PAGINA
// ==========================================

window.protegerPagina = async function () {

    console.log("AUTH - INICIANDO VALIDACION");

    try {

        // ------------------------------------------
        // COMPROBAR SESION
        // ------------------------------------------

        const resultadoSesion =
            await supabaseClient.auth.getSession();

        console.log(
            "AUTH - Resultado sesion:",
            resultadoSesion
        );

        const session =
            resultadoSesion &&
            resultadoSesion.data
                ? resultadoSesion.data.session
                : null;

        const errorSesion =
            resultadoSesion
                ? resultadoSesion.error
                : null;


        if (errorSesion) {

            console.error(
                "AUTH - ERROR DE SESION:",
                errorSesion
            );

            return false;
        }


        if (!session) {

            console.error(
                "AUTH - NO EXISTE UNA SESION ACTIVA"
            );

            return false;
        }


        // ------------------------------------------
        // GUARDAR USUARIO
        // ------------------------------------------

        window.usuarioSesion =
            session.user;


        console.log(
            "AUTH - Usuario:",
            session.user.email
        );

        console.log(
            "AUTH - ID:",
            session.user.id
        );


        // ------------------------------------------
        // CONSULTAR PERFIL
        // ------------------------------------------

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


        console.log(
            "AUTH - Resultado perfil:",
            resultadoPerfil
        );


        const perfil =
            resultadoPerfil &&
            resultadoPerfil.data
                ? resultadoPerfil.data
                : null;

        const errorPerfil =
            resultadoPerfil
                ? resultadoPerfil.error
                : null;


        // ------------------------------------------
        // ERROR DEL PERFIL
        // ------------------------------------------

        if (errorPerfil) {

            console.error(
                "AUTH - ERROR CONSULTANDO usuarios"
            );

            console.error(
                "AUTH - Codigo:",
                errorPerfil.code
            );

            console.error(
                "AUTH - Mensaje:",
                errorPerfil.message
            );

            console.error(
                "AUTH - Detalles:",
                errorPerfil.details
            );

            console.error(
                "AUTH - Hint:",
                errorPerfil.hint
            );

            return false;
        }


        // ------------------------------------------
        // PERFIL NO ENCONTRADO
        // ------------------------------------------

        if (!perfil) {

            console.error(
                "AUTH - NO SE ENCONTRO EL PERFIL"
            );

            console.error(
                "AUTH - ID buscado:",
                session.user.id
            );

            return false;
        }


        // ------------------------------------------
        // GUARDAR PERFIL
        // ------------------------------------------

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


        console.log(
            "AUTH - Nombre:",
            perfil.nombre
        );

        console.log(
            "AUTH - Correo:",
            perfil.correo
        );

        console.log(
            "AUTH - Rol:",
            perfil.rol
        );

        console.log(
            "AUTH - Estado:",
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
                "AUTH - USUARIO INACTIVO"
            );

            console.error(
                "AUTH - Estado recibido:",
                perfil.estado
            );

            return false;
        }


        // ------------------------------------------
        // VALIDACION CORRECTA
        // ------------------------------------------

        console.log(
            "AUTH - VALIDACION CORRECTA"
        );

        console.log(
            "AUTH - Rol normalizado:",
            window.rolUsuario
        );

        console.log(
            "AUTH - Estado normalizado:",
            window.estadoUsuario
        );


        return true;


    } catch (error) {

        console.error(
            "AUTH - ERROR INESPERADO:",
            error
        );

        console.error(
            "AUTH - Mensaje:",
            error.message
        );

        return false;
    }
};


// ==========================================
// COMPROBAR ADMINISTRADOR
// ==========================================

window.esAdministrador = function () {

    return (
        window.rolUsuario ===
        "ADMINISTRADOR"
    );
};


// ==========================================
// COMPROBAR USUARIO
// ==========================================

window.esUsuario = function () {

    return (
        window.rolUsuario ===
        "USUARIO"
    );
};


// ==========================================
// COMPROBAR ROL
// ==========================================

window.tieneRol = function (rol) {

    return (
        window.rolUsuario ===
        normalizarTexto(rol)
    );
};


// ==========================================
// FIN AUTH.JS
// ==========================================
```
