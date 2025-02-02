import { supabase } from "../../../auth-server/src/authController"

export async function downloadFile(file: string) {
    if (!process.env.supabase_bucket) {
        throw Error("Your server env needs the SUPABASE_BUCKET var. Check README for info")
    }

    const { data, error } = await supabase
        .storage
        .from(process.env.supabase_bucket)
        .download(file);
}


export async function uploadFile(file: File, filePath: string) {
    if (!process.env.supabase_bucket) {
        throw Error("Your server env needs the SUPABASE_BUCKET var. Check README for info")
    }

    const { data, error } = await supabase
        .storage
        .from(process.env.supabase_bucket)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });
}
