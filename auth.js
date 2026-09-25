window.protegerPagina = async function () {

    console.log("auth.js cargado correctamente");

    return true;

};

window.esAdministrador = function () {

    return false;

};

window.esUsuario = function () {

    return true;

};

window.tieneRol = function (rol) {

    return true;

};
