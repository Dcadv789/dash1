import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = 'https://xunylnlxcpibmnhoavdy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1bnllbG54Y3BpYm1uaG9hdmR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMDE5ODYsImV4cCI6MjA1OTc3Nzk4Nn0.5nG4JXyDHdCqeJHK57rOZMPJzCN89cBSNjGthWyGX3s';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);