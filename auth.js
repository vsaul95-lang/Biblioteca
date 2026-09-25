```javascript
// ==========================================
// PROTECCIÓN DE ACCESO Y ROLES
// Biblioteca FFdE
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

    console.log("==========================================");
    console.log("AUTH - INICIANDO VALIDACIÓN");
    console.log("==========================================");

    try {

        // ==========================================
        // 1. COMPROBAR SESIÓN DE SUPABASE
        // ==========================================

        const {
            data: { session },
            error
        } = await supabaseClient.auth.getSession();


        console.log("AUTH - Sesión encontrada:", session);
        console.log("AUTH - Error de sesión:", error);


        if (error) {

            console.error(
                "AUTH - Error al comprobar la sesión:",
                error
            );

            return false;
        }


        if (!session) {

            console.error(
                "AUTH - NO EXISTE UNA SESIÓN ACTIVA."
            );

            return false;
        }


        // ==========================================
        // 2. GUARDAR USUARIO AUTENTICADO
        // ==========================================

        window.usuarioSesion = session.user;


        console.log(
            "AUTH - Usuario autenticado:",
            session.user.email
        );

        console.log(
            "AUTH - ID del usuario:",
            session.user.id
        );


        // ==========================================
        // 3. CONSULTAR PERFIL EN usuarios
        // ==========================================

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


        console.log(
            "AUTH - Perfil encontrado:",
            perfil
        );

        console.log(
            "AUTH - Error al consultar perfil:",
            errorPerfil
        );


        // ==========================================
        // 4. ERROR EN LA CONSULTA DEL PERFIL
        // ==========================================

        if (errorPerfil) {

            console.error(
                "AUTH - ERROR CONSULTANDO usuarios:",
                errorPerfil
            );

            console.error(
                "AUTH - Código del error:",
                errorPerfil.code
            );

            console.error(
                "AUTH - Mensaje del error:",
                errorPerfil.message
            );

            console.error(
                "AUTH - Detalles del error:",
                errorPerfil.details
            );

            console.error(
                "AUTH - Hint del error:",
                errorPerfil.hint
            );

            return false;
        }


        // ==========================================
        // 5. NO EXISTE PERFIL
        // ==========================================

        if (!perfil) {

            console.error(
                "AUTH - NO SE ENCONTRÓ EL PERFIL EN usuarios."
            );

            console.error(
                "AUTH - Se buscó el ID:",
                session.user.id
            );

            return false;
        }


        // ==========================================
        // 6. GUARDAR PERFIL
        // ==========================================

        window.perfilUsuario = perfil;


        // ==========================================
        // 7. OBTENER ROL Y ESTADO
        // ==========================================

        window.rolUsuario =
            normalizarTexto(perfil.rol);


        window.estadoUsuario =
            normalizarTexto(perfil.estado);


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
            "AUTH - Rol normalizado:",
            window.rolUsuario
        );

        console.log(
            "AUTH - Estado:",
            perfil.estado
        );

        console.log(
            "AUTH - Estado normalizado:",
            window.estadoUsuario
        );


        // ==========================================
        // 8. COMPROBAR ESTADO
        // ==========================================

        if (
            window.estadoUsuario !==
            "ACTIVO"
        ) {

            console.error(
                "AUTH - EL USUARIO NO ESTÁ ACTIVO."
            );

            console.error(
                "AUTH - Estado recibido:",
                perfil.estado
            );

            /*
             * IMPORTANTE:
             * NO cerramos sesión automáticamente.
             *
             * Primero necesitamos identificar
             * cualquier problema de permisos.
             */

            return false;
        }


        // ==========================================
        // 9. VALIDACIÓN CORRECTA
        // ==========================================

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

        console.log("==========================================");


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

        console.error(
            "AUTH - Stack:",
            error.stack
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


// ==========================================
// FIN DE auth.js
// ==========================================
```
