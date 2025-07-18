/**
 * Debug helper for authentication issues
 */

// Function to check all possible user ID storage locations
export function debugAuth() {
  console.log('=== AUTH DEBUG INFO ===');
  
  try {
    // Check sb-session
    const sbSession = localStorage.getItem('sb-ffvvesrqtdktayjwurwm-auth-token');
    console.log('sb-ffvvesrqtdktayjwurwm-auth-token:', sbSession ? 'Found' : 'Not found');
    if (sbSession) {
      try {
        const parsed = JSON.parse(sbSession);
        console.log('- User ID:', parsed?.user?.id || 'Not found in parsed data');
      } catch (e) {
        console.log('- Error parsing sb-session:', e);
      }
    }
    
    // Check supabase.auth.token
    const supabaseAuth = localStorage.getItem('supabase.auth.token');
    console.log('supabase.auth.token:', supabaseAuth ? 'Found' : 'Not found');
    if (supabaseAuth) {
      try {
        const parsed = JSON.parse(supabaseAuth);
        console.log('- User ID:', parsed?.currentSession?.user?.id || 'Not found in parsed data');
      } catch (e) {
        console.log('- Error parsing supabase.auth.token:', e);
      }
    }
    
    // Check manual-user-id
    const manualUserId = localStorage.getItem('manual-user-id');
    console.log('manual-user-id:', manualUserId || 'Not found');
    
    // Check all localStorage keys
    console.log('All localStorage keys:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      console.log(`- ${key}`);
    }
  } catch (e) {
    console.error('Error in debugAuth:', e);
  }
  
  console.log('======================');
}

// Export a function to set the user ID manually
export function setUserId(userId: string) {
  localStorage.setItem('manual-user-id', userId);
  console.log(`User ID manually set to: ${userId}`);
}

// Auto-run on import
debugAuth();