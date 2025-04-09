import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = 'https://xunylnlxcpibmnhoavdy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1bnllbG54Y3BpYm1uaG9hdmR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMDE5ODYsImV4cCI6MjA1OTc3Nzk4Nn0.5nG4JXyDHdCqeJHK57rOZMPJzCN89cBSNjGthWyGX3s';

// Create Supabase client with retryable fetch
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  // Add retry configuration
  fetch: (url, options) => {
    return fetch(url, {
      ...options,
      credentials: 'include' // Add credentials inclusion
    }).catch(error => {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        // Retry the request once
        return fetch(url, {
          ...options,
          credentials: 'include'
        });
      }
      throw error;
    });
  }
});

// Add error handling for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    // Clear any cached data
    localStorage.removeItem('supabase.auth.token');
  }
});