// localStorage utility functions for Note Calc
// Ensures reliable note persistence across browser sessions
// Disable console.log calls in this module while leaving other console methods intact.
(() => {
    const noop = (..._args: any[]): void => {};
    if (typeof console === 'undefined') return;
    try {
        if (typeof (console as any).log === 'function') {
            try {
                (console as any).log = noop;
            } catch {
                try {
                    Object.defineProperty(console, 'log', {
                        configurable: true,
                        writable: true,
                        value: noop
                    });
                } catch {
                    // intentionally ignore if unable to override
                }
            }
        }
    } catch {
        // intentionally ignore
    }
})();
export const NOTES_KEY = 'pwa-calc-notes';
export const NOTES_BACKUP_KEY = 'pwa-calc-notes-backup';
export const NOTES_SIMPLE_BACKUP_KEY = 'pwa-calc-notes-simple-backup';

// Configuration for debounced saving
export const SAVE_DEBOUNCE_DELAY = 2000; // 1 second
export const QUICK_SAVE_DEBOUNCE_DELAY = 3000; // 3 seconds for less frequent saves

export interface NotesBackup {
  content: string;
  timestamp: string;
  version: string;
}

export const saveNotesToStorage = (notes: string): boolean => {
  console.log(`💾 saveNotesToStorage: Saving ${notes.length} characters...`);
  
  try {
    // Save to main storage
    localStorage.setItem(NOTES_KEY, notes);
    console.log('✅ Saved to main storage');
    
    // Create backup with metadata
    const backup: NotesBackup = {
      content: notes,
      timestamp: new Date().toISOString(),
      version: 'v1'
    };
    localStorage.setItem(NOTES_BACKUP_KEY, JSON.stringify(backup));
    console.log('✅ Saved to backup storage');
    
    // Simple backup for fallback
    localStorage.setItem(NOTES_SIMPLE_BACKUP_KEY, notes);
    console.log('✅ Saved to simple backup');
    
    console.log(`💾 Notes saved successfully with all backups (${notes.length} chars at ${new Date().toLocaleTimeString()})`);
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
  console.log('🔍 loadNotesFromStorage: Starting to load notes...');
  
  try {
    // Try main storage first
    const savedNotes = localStorage.getItem(NOTES_KEY);
    console.log('🔍 Main storage check:', savedNotes ? `Found ${savedNotes.length} characters` : 'Empty');
    
    if (savedNotes) {
      console.log('✅ Notes loaded from main storage');
      return savedNotes;
    }
    
    // Try backup with metadata
    const backupData = localStorage.getItem(NOTES_BACKUP_KEY);
    console.log('🔍 Backup storage check:', backupData ? 'Found backup data' : 'Empty');
    
    if (backupData) {
      try {
        const backup: NotesBackup = JSON.parse(backupData);
        console.log('✅ Notes recovered from backup (timestamp:', backup.timestamp, ')');
        console.log('📝 Backup content length:', backup.content.length);
        return backup.content;
      } catch (parseError) {
        console.warn('Backup data corrupted, trying simple backup');
      }
    }
    
    // Try simple backup
    const simpleBackup = localStorage.getItem(NOTES_SIMPLE_BACKUP_KEY);
    console.log('🔍 Simple backup check:', simpleBackup ? `Found ${simpleBackup.length} characters` : 'Empty');
    
    if (simpleBackup) {
      console.log('✅ Notes recovered from simple backup');
      return simpleBackup;
    }
    
    console.log('ℹ️ No saved notes found in any storage location');
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

// Debug function - call this in browser console to check localStorage
export const debugStorage = () => {
  console.log('🔍 DEBUG STORAGE INFORMATION:');
  console.log('===============================');
  
  try {
    const main = localStorage.getItem(NOTES_KEY);
    const backup = localStorage.getItem(NOTES_BACKUP_KEY);
    const simple = localStorage.getItem(NOTES_SIMPLE_BACKUP_KEY);
    
    console.log('Main storage (pwa-calc-notes):', main ? `"${main.substring(0, 100)}${main.length > 100 ? '...' : ''}" (${main.length} chars)` : '❌ EMPTY');
    console.log('Backup storage (pwa-calc-notes-backup):', backup ? `Found backup data (${backup.length} chars)` : '❌ EMPTY');
    console.log('Simple backup (pwa-calc-notes-simple-backup):', simple ? `"${simple.substring(0, 100)}${simple.length > 100 ? '...' : ''}" (${simple.length} chars)` : '❌ EMPTY');
    
    if (backup) {
      try {
        const parsedBackup = JSON.parse(backup);
        console.log('Backup timestamp:', parsedBackup.timestamp);
        console.log('Backup content preview:', parsedBackup.content.substring(0, 100));
      } catch (e) {
        console.log('❌ Backup data is corrupted');
      }
    }
    
    console.log('Total localStorage keys:', localStorage.length);
    console.log('Storage test:', testLocalStorage() ? '✅ WORKING' : '❌ FAILED');
    
    // List all localStorage keys
    console.log('All localStorage keys:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key!);
      console.log(`  ${key}: ${value ? value.length + ' chars' : 'empty'}`);
    }
    
  } catch (error) {
    console.error('Debug failed:', error);
  }
  
  console.log('===============================');
};

// Make debug function available globally
if (typeof window !== 'undefined') {
  (window as any).debugStorage = debugStorage;
  console.log('💡 Debug function available: window.debugStorage() or debugStorage()');
}
