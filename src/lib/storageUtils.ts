import { supabase } from './supabase';

export interface StorageQuota {
  used: number;
  total: number;
  filesUsed: number;
  filesTotal: number;
  isExceeded: boolean;
  percentUsed: number;
  isPremium: boolean;
  tier: string;
}

/**
 * Check a user's storage quota
 * @param userId The user ID to check
 * @returns Storage quota information
 */
export async function checkStorageQuota(userId: string): Promise<StorageQuota> {
  try {
    // Get user's storage limits
    const { data: limitsData, error: limitsError } = await supabase
      .from('storage_limits')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (limitsError && limitsError.code !== 'PGRST116') throw limitsError;
    
    // If no limits record exists, use defaults
    const limits = limitsData || {
      max_storage_bytes: 104857600, // 100MB
      max_files: 50,
      is_premium: false,
      tier_name: 'free'
    };
    
    // Get current storage usage
    const { data: usageData, error: usageError } = await supabase
      .from('storage_usage')
      .select('file_size')
      .eq('user_id', userId)
      .is('deleted_at', null);
    
    if (usageError) throw usageError;
    
    // Calculate total usage
    const totalUsed = usageData?.reduce((sum, file) => sum + file.file_size, 0) || 0;
    const filesUsed = usageData?.length || 0;
    
    return {
      used: totalUsed,
      total: limits.max_storage_bytes,
      filesUsed,
      filesTotal: limits.max_files,
      isExceeded: totalUsed >= limits.max_storage_bytes || filesUsed >= limits.max_files,
      percentUsed: Math.round((totalUsed / limits.max_storage_bytes) * 100),
      isPremium: limits.is_premium,
      tier: limits.tier_name
    };
  } catch (error) {
    console.error('Error checking storage quota:', error);
    throw error;
  }
}

/**
 * Track a file upload in the database
 * @param userId User ID
 * @param filePath Path to the file in storage
 * @param fileName Name of the file
 * @param fileSize Size of the file in bytes
 * @param fileType MIME type of the file
 * @param bucket Storage bucket name
 * @returns True if successful, false if quota exceeded or error
 */
export async function trackFileUpload(
  userId: string, 
  filePath: string, 
  fileName: string, 
  fileSize: number, 
  fileType: string,
  bucket: string
): Promise<boolean> {
  try {
    // Check quota first
    const quota = await checkStorageQuota(userId);
    if (quota.isExceeded) {
      return false; // Quota exceeded
    }
    
    // Track the file upload
    const { error } = await supabase
      .from('storage_usage')
      .insert([{
        user_id: userId,
        file_path: filePath,
        file_name: fileName,
        file_size: fileSize,
        file_type: fileType,
        storage_bucket: bucket
      }]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error tracking file upload:', error);
    return false;
  }
}

/**
 * Format bytes to human-readable format
 * @param bytes Number of bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}