import { supabase } from "../../../auth-server/src/authController"


async function downloadFile(file: string) {
    const { data, error } = await supabase
        .storage
        .from('world-db-data')
        .download(file);
}


async function uploadFile(file: File, filePath: string) {
    const { data, error } = await supabase
        .storage
        .from('world-db-data')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });
}
