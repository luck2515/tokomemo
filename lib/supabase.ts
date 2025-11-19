
import { createClient } from '@supabase/supabase-js';

// 注意: このアプリケーションはSPA（ブラウザのみで動作）構成であるため、
// Supabaseへの接続には「Anon Key（公開キー）」を使用します。
// Anon Keyは、データベース側のRow Level Security (RLS)ポリシーによって
// セキュリティが担保されているため、ブラウザで使用しても安全です。
// ※ Service Role Key（秘密鍵）は絶対に使用しないでください。

const SUPABASE_URL = 'https://fyekglgzgugyqtxdwvmk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5ZWtnbGd6Z3VneXF0eGR3dm1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0ODE4NzksImV4cCI6MjA3ODA1Nzg3OX0.boHZtvQ-5x8OV4OEVgGM4lJUviZpOl9o46Dd_Do5Veo';

export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
