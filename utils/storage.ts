// localStorage utility functions for Note Calc
// Ensures reliable note persistence across browser sessions

export const NOTES_KEY = 'pwa-calc-notes';
export const NOTES_BACKUP_KEY = 'pwa-calc-notes-backup';
export const NOTES_SIMPLE_BACKUP_KEY = 'pwa-calc-notes-simple-backup';

export interface NotesBackup {
  content: string;
  timestamp: string;
  version: string;
}

export const saveNotesToStorage = (notes: string): boolean => {
  try {
    // Save to main storage
    localStorage.setItem(NOTES_KEY, notes);
    
    // Create backup with metadata
    const backup: NotesBackup = {
      content: notes,
      timestamp: new Date().toISOString(),
      version: 'v1'
    };
    localStorage.setItem(NOTES_BACKUP_KEY, JSON.stringify(backup));
    
    // Simple backup for fallback
    localStorage.setItem(NOTES_SIMPLE_BACKUP_KEY, notes);
    
    console.log('💾 Notes saved successfully with backup');
    return true;
  } catch (error) {
    console.error('Failed to save notes:', error);
    
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('⚠️ Storage quota exceeded. Attempting cleanup...');
      
      // Try to make space by removing old data
      try {
        cleanupOldData();
        // Retry saving
        localStorage.setItem(NOTES_KEY, notes);
        localStorage.setItem(NOTES_SIMPLE_BACKUP_KEY, notes);
        console.log('✅ Notes saved after cleanup');
        return true;
      } catch (retryError) {
        console.error('Failed to save even after cleanup:', retryError);
      }
    }
    
    return false;
  }
};

export const loadNotesFromStorage = (): string => {
  try {
    // Try main storage first
    const savedNotes = localStorage.getItem(NOTES_KEY);
    if (savedNotes) {
      console.log('✅ Notes loaded from main storage');
      return savedNotes;
    }
    
    // Try backup with metadata
    const backupData = localStorage.getItem(NOTES_BACKUP_KEY);
    if (backupData) {
      try {
        const backup: NotesBackup = JSON.parse(backupData);
        console.log('✅ Notes recovered from backup (timestamp:', backup.timestamp, ')');
        return backup.content;
      } catch (parseError) {
        console.warn('Backup data corrupted, trying simple backup');
      }
    }
    
    // Try simple backup
    const simpleBackup = localStorage.getItem(NOTES_SIMPLE_BACKUP_KEY);
    if (simpleBackup) {
      console.log('✅ Notes recovered from simple backup');
      return simpleBackup;
    }
    
    console.log('No saved notes found');
    return '';
    
  } catch (error) {
    console.error('Failed to load notes from any source:', error);
    return '';
  }
};

export const getStorageInfo = () => {
  try {
    const main = localStorage.getItem(NOTES_KEY);
    const backup = localStorage.getItem(NOTES_BACKUP_KEY);
    const simple = localStorage.getItem(NOTES_SIMPLE_BACKUP_KEY);
    
    return {
      hasMainStorage: !!main,
      hasBackup: !!backup,
      hasSimpleBackup: !!simple,
      mainStorageSize: main ? new Blob([main]).size : 0,
      backupStorageSize: backup ? new Blob([backup]).size : 0,
      estimatedStorageUsed: getEstimatedStorageSize()
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return null;
  }
};

export const cleanupOldData = () => {
  try {
    // Remove any old cache-related data
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('cache') ||
        key.includes('sw-') ||
        key.includes('workbox') ||
        key.startsWith('_')
      )) {
        localStorage.removeItem(key);
        console.log('Cleaned up old data:', key);
      }
    }
  } catch (error) {
    console.error('Failed to cleanup old data:', error);
  }
};

const getEstimatedStorageSize = (): number => {
  try {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key!);
      total += new Blob([key! + (value || '')]).size;
    }
    return total;
  } catch (error) {
    return 0;
  }
};

// Test localStorage functionality
export const testLocalStorage = (): boolean => {
  try {
    const testKey = 'pwa-calc-test';
    const testValue = 'test-data-' + Date.now();
    
    localStorage.setItem(testKey, testValue);
    const retrieved = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    
    const success = retrieved === testValue;
    console.log('localStorage test:', success ? '✅ Working' : '❌ Failed');
    return success;
  } catch (error) {
    console.error('localStorage test failed:', error);
    return false;
  }
};
