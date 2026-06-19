import browser from 'webextension-polyfill';
import AbstractStorage from './abstractStorage';

const CHUNK_ITEM_BYTES = 7500;
const CHUNK_STORAGE_PREFIX = '__tab_chunked_storage__';
const CHUNK_META_VERSION = 1;

interface ChunkMeta {
    version: typeof CHUNK_META_VERSION;
    chunkCount: number;
    chunkKeyPrefix: string;
}

type ChunkReadResult<T> = { found: false } | { found: true; value: T | undefined };

const encoder = new TextEncoder();

const getMetaKey = (key: string) => `${CHUNK_STORAGE_PREFIX}:${key}:meta`;

const getChunkKey = (meta: ChunkMeta, index: number) => `${meta.chunkKeyPrefix}${index}`;

const getStorageItemByteLength = (key: string, value: unknown) => {
    return (
        encoder.encode(key).byteLength + encoder.encode(JSON.stringify(value) ?? 'null').byteLength
    );
};

const isChunkMeta = (value: unknown): value is ChunkMeta => {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const meta = value as Record<string, unknown>;
    return (
        meta.version === CHUNK_META_VERSION &&
        typeof meta.chunkCount === 'number' &&
        meta.chunkCount > 0 &&
        Number.isInteger(meta.chunkCount) &&
        typeof meta.chunkKeyPrefix === 'string'
    );
};

class BrowserSyncStorage extends AbstractStorage {
    async get<T>(key: string, defaultValue: T | undefined): Promise<T | undefined> {
        const chunkedValue = await this.getChunkedValue<T>(key);
        if (chunkedValue.found) {
            return chunkedValue.value;
        }

        return this.getDirectValue(key, defaultValue);
    }

    async set(data: Record<string, unknown>): Promise<void> {
        for (const [key, value] of Object.entries(data)) {
            await this.setValue(key, value);
        }
    }

    private async getDirectValue<T>(
        key: string,
        defaultValue: T | undefined,
    ): Promise<T | undefined> {
        const data = await browser.storage.sync.get(key);

        if (Object.entries(data).length === 0) {
            return defaultValue;
        }
        if (data[key] == undefined) {
            return defaultValue;
        }
        return data[key] as T;
    }

    private async getChunkMeta(key: string): Promise<ChunkMeta | undefined> {
        const data = await browser.storage.sync.get(getMetaKey(key));
        const meta = data[getMetaKey(key)];

        if (!isChunkMeta(meta)) {
            return undefined;
        }
        return meta;
    }

    private async getChunkedValue<T>(key: string): Promise<ChunkReadResult<T>> {
        const meta = await this.getChunkMeta(key);
        if (!meta) {
            return { found: false };
        }

        const chunkKeys = this.getChunkKeys(meta);
        const data = await browser.storage.sync.get(chunkKeys);
        const chunks: string[] = [];

        for (const chunkKey of chunkKeys) {
            const chunk = data[chunkKey];
            if (typeof chunk !== 'string') {
                return { found: false };
            }
            chunks.push(chunk);
        }

        try {
            return {
                found: true,
                value: JSON.parse(chunks.join('')) as T,
            };
        } catch (error) {
            console.error('Failed to parse chunked sync storage value', error);
            return { found: false };
        }
    }

    private async setValue(key: string, value: unknown) {
        const existingMeta = await this.getChunkMeta(key);
        if (!existingMeta && getStorageItemByteLength(key, value) <= CHUNK_ITEM_BYTES) {
            await browser.storage.sync.set({ [key]: value });
            await this.removeKeys([getMetaKey(key)]);
            return;
        }

        await this.setChunkedValue(key, value, existingMeta);
    }

    private async setChunkedValue(key: string, value: unknown, existingMeta?: ChunkMeta) {
        const serializedValue = JSON.stringify(value) ?? 'null';
        const chunkKeyPrefix = this.createChunkKeyPrefix(key);
        const chunks = this.splitValueIntoChunks(serializedValue, chunkKeyPrefix);
        const nextMeta: ChunkMeta = {
            version: CHUNK_META_VERSION,
            chunkCount: chunks.length,
            chunkKeyPrefix,
        };
        const chunkData = chunks.reduce<Record<string, string>>((data, chunk, index) => {
            data[getChunkKey(nextMeta, index)] = chunk;
            return data;
        }, {});

        await browser.storage.sync.set(chunkData);
        await browser.storage.sync.set({
            [getMetaKey(key)]: nextMeta,
        });

        await this.removeKeys([key, ...(existingMeta ? this.getChunkKeys(existingMeta) : [])]);
    }

    private createChunkKeyPrefix(key: string) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        return `${CHUNK_STORAGE_PREFIX}:${key}:${id}:`;
    }

    private splitValueIntoChunks(value: string, chunkKeyPrefix: string) {
        const chunks: string[] = [];
        let chunk = '';
        let chunkIndex = 0;

        for (const char of value) {
            const nextChunk = `${chunk}${char}`;
            if (
                getStorageItemByteLength(`${chunkKeyPrefix}${chunkIndex}`, nextChunk) >
                CHUNK_ITEM_BYTES
            ) {
                if (!chunk) {
                    throw new Error('Sync storage chunk size is too small');
                }

                chunks.push(chunk);
                chunk = char;
                chunkIndex += 1;
            } else {
                chunk = nextChunk;
            }
        }

        if (chunk) {
            chunks.push(chunk);
        }

        return chunks;
    }

    private getChunkKeys(meta: ChunkMeta) {
        return Array.from({ length: meta.chunkCount }, (_, index) => getChunkKey(meta, index));
    }

    private async removeKeys(keys: string[]) {
        if (keys.length === 0) {
            return;
        }

        try {
            await browser.storage.sync.remove(keys);
        } catch (error) {
            console.warn('Failed to clean up sync storage keys', error);
        }
    }
}

export default BrowserSyncStorage;
