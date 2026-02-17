import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Missing Supabase server-side environment variables");
}

export const supabaseAdmin = createClient(
  supabaseUrl || "",
  supabaseServiceKey || ""
);

export async function ensureBucketExists(bucketName: string) {
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    if (!buckets?.find((b) => b.name === bucketName)) {
      console.log(`Creating bucket: ${bucketName}`);
      const { error } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
      });
      if (error) console.error(`Error creating bucket ${bucketName}:`, error);
    }
  } catch (err) {
    console.error(`Unexpected error checking/creating bucket ${bucketName}:`, err);
  }
}
