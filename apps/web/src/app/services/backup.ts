import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { zipSync, unzipSync, strToU8, strFromU8 } from 'fflate';
import { AccountGroup, Transaction } from '../app';

export interface ImportRecord {
  id: string;
  timestamp: string;
  fileName: string;
  fileSize: number; // in bytes
  groupsCount: number;
  transactionsCount: number;
  status: 'success' | 'failed';
  errorMessage?: string;
}

// 1. Platform Detection logic
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

// 2. Base64 helper for zip handling
export const uint8ArrayToBase64 = (uint8Array: Uint8Array): string => {
  let binary = '';
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return window.btoa(binary);
};

export const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// 3. Zip compression and decompression utility
export interface BackupData {
  keep_accounts_groups: AccountGroup[];
  keep_accounts_transactions: Transaction[];
}

export const compressBackup = (data: BackupData): Uint8Array => {
  const jsonStr = JSON.stringify(data);
  const jsonBytes = strToU8(jsonStr);
  return zipSync({
    'backup_data.json': jsonBytes
  });
};

export const decompressBackup = (zipBytes: Uint8Array): BackupData => {
  const unzipped = unzipSync(zipBytes);
  const jsonBytes = unzipped['backup_data.json'];
  if (!jsonBytes) {
    throw new Error('backup_data.json not found in the backup file.');
  }
  const jsonStr = strFromU8(jsonBytes);
  const parsed = JSON.parse(jsonStr);
  
  if (!parsed.keep_accounts_groups || !parsed.keep_accounts_transactions) {
    throw new Error('Missing keep_accounts_groups or keep_accounts_transactions in backup.');
  }
  return parsed;
};

// 4. Import History Logging helpers
export const getImportHistory = (): ImportRecord[] => {
  const history = localStorage.getItem('keep_accounts_import_history');
  return history ? JSON.parse(history) : [];
};

export const logImport = (
  fileName: string,
  fileSize: number,
  groupsCount: number,
  transactionsCount: number,
  status: 'success' | 'failed',
  errorMessage?: string
): ImportRecord => {
  const history = getImportHistory();
  const newEntry: ImportRecord = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    fileName,
    fileSize,
    groupsCount,
    transactionsCount,
    status,
    errorMessage,
  };
  history.unshift(newEntry);
  localStorage.setItem('keep_accounts_import_history', JSON.stringify(history));
  return newEntry;
};

// 5. Native background file saving & Sharing logic
export const exportBackupNative = async (data: BackupData): Promise<string> => {
  const zipped = compressBackup(data);
  const base64Data = uint8ArrayToBase64(zipped);
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const fileName = `backup_${dateStr}.zip`;

  // Write file to native documents
  const writeResult = await Filesystem.writeFile({
    path: fileName,
    data: base64Data,
    directory: Directory.Documents,
  });

  // Share the written file
  await Share.share({
    title: 'Keep Accounts Backup',
    url: writeResult.uri,
    dialogTitle: 'Save or share your backup file',
  });

  return writeResult.uri;
};

export const autoBackupNative = async (data: BackupData): Promise<void> => {
  const zipped = compressBackup(data);
  const base64Data = uint8ArrayToBase64(zipped);
  
  await Filesystem.writeFile({
    path: 'keep_accounts_backup.zip',
    data: base64Data,
    directory: Directory.Documents,
  });
};

export const restoreFromAutoBackupNative = async (): Promise<BackupData> => {
  const file = await Filesystem.readFile({
    path: 'keep_accounts_backup.zip',
    directory: Directory.Documents,
  });
  
  const base64 = typeof file.data === 'string' ? file.data : '';
  if (!base64) {
    throw new Error('Backup file is empty.');
  }
  const zipBytes = base64ToUint8Array(base64);
  return decompressBackup(zipBytes);
};

export const hasAutoBackupNativeFile = async (): Promise<boolean> => {
  try {
    await Filesystem.stat({
      path: 'keep_accounts_backup.zip',
      directory: Directory.Documents,
    });
    return true;
  } catch {
    return false;
  }
};
