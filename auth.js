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
        .toLocaleUpperCase("es");
}


// ==========================================
// COMPROBAR SESIÓN
// ==========================================

window.protegerPagina = async function () {

    console.log("AUTH REAL INICIADO");

    try {

        // ==========================================
        // SESIÓN
        // ==========================================

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

            return false;
        }


        console.log(
            "SESION ENCONTRADA:",
            session.user.email
        );


        window.usuarioSesion =
            session.user;


        // ==========================================
        // PERFIL DEL USUARIO
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
                "ERROR PERFIL:",
                resultadoPerfil.error
            );

            return false;
        }


        const perfil =
            resultadoPerfil.data;


        if (!perfil) {

            console.error(
                "PERFIL NO ENCONTRADO"
            );

            return false;
        }


        console.log(
            "PERFIL ENCONTRADO:",
            perfil
        );


        window.perfilUsuario =
            perfil;


        // ==========================================
        // ROL
        // ==========================================

        window.rolUsuario =
            normalizarTexto(
                perfil.rol
            );


        // ==========================================
        // ESTADO
        // ==========================================

        window.estadoUsuario =
            normalizarTexto(
                perfil.estado
            );


        console.log(
            "ROL NORMALIZADO:",
            window.rolUsuario
        );


        console.log(
            "ESTADO NORMALIZADO:",
            window.estadoUsuario
        );


        // ==========================================
        // COMPROBAR ESTADO
        // ==========================================

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


        // ==========================================
        // USUARIO AUTORIZADO
        // ==========================================

        console.log(
            "USUARIO AUTORIZADO:",
            window.rolUsuario
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
