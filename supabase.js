// ==========================================
// CONEXIÓN CON SUPABASE
// ==========================================

const SUPABASE_URL = "https://ddlgygqdevtuztmrrajn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_WEmIPksHvCja4P1JaSc8IQ_VoXdSjwN";

// La biblioteca de Supabase debe cargarse
// antes de ejecutar este archivo.
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);