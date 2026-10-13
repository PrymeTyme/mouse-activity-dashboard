import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Fehler: Supabase URL oder Anon-Key fehlen in der .env Datei!",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
