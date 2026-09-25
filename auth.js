```javascript
// ==========================================
// PROTECCIÓN DE ACCESO Y ROLES
// BIBLIOTECA FFdE
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
// PROTEGER PÁGINA
// ==========================================

window.protegerPagina = async function () {

    console.log("==========================================");
    console.log("AUTH - INICIANDO VALIDACIÓN");
    console.log("==========================================");


    try {

        // ==========================================
        // COMPROBAR SESIÓN
        // ==========================================

        const resultadoSesion =
            await supabaseClient.auth.getSession();


        console.log(
            "AUTH - Resultado completo de sesión:",
            resultadoSesion
        );


        const session =
            resultadoSesion?.data?.session;


        const errorSesion =
            resultadoSesion?.error;


        console.log(
            "AUTH - Sesión encontrada:",
            session
        );


        console.log(
            "AUTH - Error de sesión:",
            errorSesion
        );


        if (errorSesion) {

            console.error(
                "AUTH - ERROR AL OBTENER LA SESIÓN"
            );

            console.error(
                errorSesion
            );

            return false;
        }


        if (!session) {

            console.error(
                "AUTH - NO EXISTE UNA SESIÓN ACTIVA"
            );

            return false;
        }


        // ==========================================
        // USUARIO AUTENTICADO
        // ==========================================

        window.usuarioSesion =
            session.user;


        console.log(
            "AUTH - USUARIO AUTENTICADO"
        );


        console.log(
            "AUTH - Email:",
            session.user.email
        );


        console.log(
            "AUTH - ID:",
            session.user.id
        );


        // ==========================================
        // CONSULTAR PERFIL
        // ==========================================

        console.log(
            "AUTH - CONSULTANDO TABLA usuarios..."
        );


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


        console.log(
            "AUTH - Resultado completo del perfil:",
            resultadoPerfil
        );


        const perfil =
            resultadoPerfil?.data;


        const errorPerfil =
            resultadoPerfil?.error;


        console.log(
            "AUTH - Perfil encontrado:",
            perfil
        );


        console.log(
            "AUTH - Error del perfil:",
            errorPerfil
        );


        // ==========================================
        // ERROR CONSULTANDO USUARIOS
        // ==========================================

        if (errorPerfil) {

            console.error(
                "AUTH - ERROR CONSULTANDO usuarios"
            );


            console.error(
                "AUTH - Código:",
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


        // ==========================================
        // PERFIL NO ENCONTRADO
        // ==========================================

        if (!perfil) {

            console.error(
                "AUTH - NO EXISTE PERFIL PARA ESTE USUARIO"
            );


            console.error(
                "AUTH - ID buscado:",
                session.user.id
            );


            return false;
        }


        // ==========================================
        // GUARDAR PERFIL
        // ==========================================

        window.perfilUsuario =
            perfil;


        // ==========================================
        // OBTENER ROL
        // ==========================================

        window.rolUsuario =
            normalizarTexto(
                perfil.rol
            );


        // ==========================================
        // OBTENER ESTADO
        // ==========================================

        window.estadoUsuario =
            normalizarTexto(
                perfil.estado
            );


        console.log(
            "AUTH - DATOS DEL PERFIL"
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
            "AUTH - Rol original:",
            perfil.rol
        );


        console.log(
            "AUTH - Rol normalizado:",
            window.rolUsuario
        );


        console.log(
            "AUTH - Estado original:",
            perfil.estado
        );


        console.log(
            "AUTH - Estado normalizado:",
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
                "AUTH - EL USUARIO NO ESTÁ ACTIVO"
            );


            console.error(
                "AUTH - Estado recibido:",
                perfil.estado
            );


            /*
             * NO CERRAMOS SESIÓN.
             *
             * Esta versión solamente devuelve false
             * para poder identificar el problema.
             */

            return false;
        }


        // ==========================================
        // VALIDACIÓN CORRECTA
        // ==========================================

        console.log(
            "=========================================="
        );


        console.log(
            "AUTH - VALIDACIÓN CORRECTA"
        );


        console.log(
            "AUTH - Usuario:",
            perfil.nombre
        );


        console.log(
            "AUTH - Rol:",
            perfil.rol
        );


        console.log(
            "AUTH - Estado:",
            perfil.estado
        );


        console.log(
            "=========================================="
        );


        return true;


    } catch (error) {

        console.error(
            "=========================================="
        );


        console.error(
            "AUTH - ERROR INESPERADO"
        );


        console.error(
            error
        );


        console.error(
            "AUTH - Mensaje:",
            error?.message
        );


        console.error(
            "AUTH - Stack:",
            error?.stack
        );


        console.error(
            "=========================================="
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
// COMPROBAR USUARIO NORMAL
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
// FIN DE auth.js
// ==========================================
```
