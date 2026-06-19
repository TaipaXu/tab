import { local } from '@/storage';
import type { Group as MGroup } from '@/models/group';
import type { Page as MPage } from '@/models/page';

export const getGroups = async (): Promise<MGroup[]> => {
    const groups = await local.get<MGroup[]>('groups', []);
    return groups!;
};

export const setGroups = async (groups: MGroup[]) => {
    await local.set({ groups });
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
