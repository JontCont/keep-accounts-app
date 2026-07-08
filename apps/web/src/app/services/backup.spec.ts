// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isNativePlatform,
  compressBackup,
  decompressBackup,
  getImportHistory,
  logImport,
  BackupData
} from './backup';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => false),
    getPlatform: vi.fn(() => 'web')
  }
}));

vi.mock('@capacitor/filesystem', () => ({
  Filesystem: {
    writeFile: vi.fn(),
    readFile: vi.fn(),
    stat: vi.fn()
  },
  Directory: {
    Documents: 'Documents'
  }
}));

vi.mock('@capacitor/share', () => ({
  Share: {
    share: vi.fn()
  }
}));

describe('BackupService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('isNativePlatform', () => {
    it('should return false in web/test environment', () => {
      expect(isNativePlatform()).toBe(false);
    });
  });

  describe('Compression and Decompression', () => {
    it('should compress and decompress backup data correctly', () => {
      const mockData: BackupData = {
        keep_accounts_groups: [
          {
            id: '1',
            name: 'Group 1',
            emoji: '💳',
            color: '#6366f1',
            categories: []
          }
        ],
        keep_accounts_transactions: [
          {
            id: '1',
            description: 'Tx 1',
            amount: 100,
            type: 'expense',
            category: 'test',
            date: '2026-07-08',
            accountGroupId: '1'
          }
        ]
      };

      const compressed = compressBackup(mockData);
      expect(compressed).toBeInstanceOf(Uint8Array);

      const decompressed = decompressBackup(compressed);
      expect(decompressed).toEqual(mockData);
    });

    it('should throw error if backup file is missing backup_data.json', () => {
      const emptyZip = new Uint8Array([80, 75, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      expect(() => decompressBackup(emptyZip)).toThrow();
    });
  });

  describe('Import History Logging', () => {
    it('should retrieve empty history initially', () => {
      expect(getImportHistory()).toEqual([]);
    });

    it('should log and retrieve import attempts', () => {
      logImport('test.zip', 1024, 2, 5, 'success');
      const history = getImportHistory();
      expect(history.length).toBe(1);
      expect(history[0].fileName).toBe('test.zip');
      expect(history[0].fileSize).toBe(1024);
      expect(history[0].groupsCount).toBe(2);
      expect(history[0].transactionsCount).toBe(5);
      expect(history[0].status).toBe('success');
      expect(history[0].timestamp).toBeDefined();
    });
  });
});
