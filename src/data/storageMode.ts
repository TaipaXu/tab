import { local } from '@/storage';

export const STORAGE_MODE_LOCAL = 'local';
export const STORAGE_MODE_SYNC = 'sync';

export type StorageMode = typeof STORAGE_MODE_LOCAL | typeof STORAGE_MODE_SYNC;

const STORAGE_MODE_KEY = 'storageMode';
const DEFAULT_STORAGE_MODE: StorageMode = STORAGE_MODE_LOCAL;

const isStorageMode = (value: unknown): value is StorageMode => {
    return value === STORAGE_MODE_LOCAL || value === STORAGE_MODE_SYNC;
};

export const getStorageMode = async (): Promise<StorageMode> => {
    const localMode = await local.get<unknown>(STORAGE_MODE_KEY, DEFAULT_STORAGE_MODE);
    if (isStorageMode(localMode)) {
        return localMode;
    }

    return DEFAULT_STORAGE_MODE;
};

export const setStorageMode = async (mode: StorageMode) => {
    await local.set({ [STORAGE_MODE_KEY]: mode });
};
