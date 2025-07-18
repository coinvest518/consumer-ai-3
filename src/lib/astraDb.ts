import { DataAPIClient } from '@datastax/astra-db-ts';

// Singleton pattern for Astra DB client
let astraClient: any = null;

/**
 * Get or create the Astra DB client
 * @returns Astra DB client instance
 */
export function getAstraClient(): any {
  if (!astraClient) {
    const token = process.env.ASTRA_DB_APPLICATION_TOKEN || '';
    const endpoint = process.env.ASTRA_DB_ENDPOINT || '';
    
    if (!token || !endpoint) {
      throw new Error('Astra DB credentials not configured');
    }
    
    astraClient = new DataAPIClient(token);
    astraClient = astraClient.db(endpoint, {
      namespace: 'consumer_ai'
    });
    
    console.log('Astra DB client initialized');
  }
  
  return astraClient;
}

/**
 * Execute an Astra DB operation with error handling and retries
 * @param operation Function that performs the Astra DB operation
 * @param fallback Optional fallback function to call if operation fails
 * @param retries Number of retries (default: 2)
 * @returns Result of the operation or fallback
 */
export async function withAstra<T>(
  operation: (client: any) => Promise<T>,
  fallback?: () => Promise<T> | T,
  retries = 2
): Promise<T> {
  try {
    const client = getAstraClient();
    let lastError: Error | null = null;
    
    // Try the operation with retries
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation(client);
      } catch (error) {
        lastError = error as Error;
        console.error(`Astra DB operation failed (attempt ${attempt + 1}/${retries + 1}):`, error);
        
        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
        }
      }
    }
    
    // All retries failed, use fallback if provided
    if (fallback) {
      console.log('Using fallback for Astra DB operation');
      return await fallback();
    }
    
    throw lastError;
  } catch (error) {
    console.error('Astra DB operation failed:', error);
    
    if (fallback) {
      console.log('Using fallback for Astra DB operation');
      return await fallback();
    }
    
    throw error;
  }
}