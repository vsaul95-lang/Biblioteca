// ==========================================
// PROTECCIÓN DE ACCESO
// ==========================================

(async function protegerPagina() {

    try {

        const {
            data: { session },
            error
        } = await supabaseClient.auth.getSession();


        if (error || !session) {

            window.location.replace("index.html");

            return;
        }


    } catch (error) {

        console.error(
            "Error al comprobar la sesión:",
            error
        );

        window.location.replace("index.html");

    }

})();