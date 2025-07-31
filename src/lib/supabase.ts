
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

//Supabase com persistência em cookies
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Configura para usar cookies.
    storage: {
      getItem: (key: string) => {
        return getCookie(key);
      },
      setItem: (key: string, value: string) => {
        setCookie(key, value, {
          expires: 7, // 7 dias
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Lax',
          path: '/'
        });
      },
      removeItem: (key: string) => {
        deleteCookie(key);
      }
    },
    // Configurações JWT
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
    // Configuração de cookies para produção
    flowType: 'pkce'
  },
  // Configurações globais
  global: {
    headers: {
      'X-Client-Info': 'CRM-App',
      'X-Client-Version': '1.0.0',
    }
  }
});

// Funções utilitárias para manipulação de cookies
function setCookie(name: string, value: string, options: {
  expires?: number;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  path?: string;
} = {}) {
  let cookieString = `${name}=${encodeURIComponent(value)}`;
  
  if (options.expires) {
    const date = new Date();
    date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
    cookieString += `; expires=${date.toUTCString()}`;
  }
  
  if (options.path) {
    cookieString += `; path=${options.path}`;
  }
  
  if (options.secure) {
    cookieString += '; secure';
  }
  
  if (options.sameSite) {
    cookieString += `; samesite=${options.sameSite}`;
  }
  
  document.cookie = cookieString;
}

function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export default supabase;


export { setCookie, getCookie, deleteCookie };