import { local, sync } from '@/storage';
import type AbstractStorage from '@/storage/abstractStorage';
import {
    getStorageMode,
    setStorageMode,
    STORAGE_MODE_LOCAL,
    STORAGE_MODE_SYNC,
    type StorageMode,
} from '@/data/storageMode';
import type { Group as MGroup } from '@/models/group';
import type { Page as MPage } from '@/models/page';

const GROUPS_KEY = 'groups';

const storageByMode: Record<StorageMode, AbstractStorage> = {
    [STORAGE_MODE_LOCAL]: local,
    [STORAGE_MODE_SYNC]: sync,
};

const getGroupsByMode = async (mode: StorageMode): Promise<MGroup[]> => {
    const groups = await storageByMode[mode].get<MGroup[]>(GROUPS_KEY, []);
    return groups ?? [];
};

const setGroupsByMode = async (mode: StorageMode, groups: MGroup[]) => {
    await storageByMode[mode].set({ [GROUPS_KEY]: groups });
};

const getActiveStorageMode = async () => {
    return getStorageMode();
};

export const getGroups = async (): Promise<MGroup[]> => {
    return getGroupsByMode(await getActiveStorageMode());
};

export const setGroups = async (groups: MGroup[]) => {
    await setGroupsByMode(await getActiveStorageMode(), groups);
};

export const switchStorageMode = async (mode: StorageMode) => {
    await setStorageMode(mode);
};

export const addGroup = async (group: MGroup) => {
    const groups = await getGroups();
    groups.unshift(group);
    await setGroups(groups);
};

export const removeGroup = async (group: MGroup) => {
    const groups = await getGroups();
    const index = groups.findIndex((g) => g.id === group.id);
    if (index !== -1) {
        groups.splice(index, 1);
    }
    await setGroups(groups);
};

export const removePage = async (group: MGroup, page: MPage) => {
    const groups = await getGroups();
    const index = groups.findIndex((g) => g.id === group.id);
    if (index !== -1) {
        const targetGroup = groups[index];
        if (!targetGroup) {
            return;
        }

        const pageIndex = targetGroup.pages.findIndex((p) => p.id === page.id);
        if (pageIndex !== -1) {
            targetGroup.pages.splice(pageIndex, 1);
        }
        if (targetGroup.pages.length === 0) {
            groups.splice(index, 1);
        }
    }
    await setGroups(groups);
};
