import { local } from '@/storage';
import { Group as MGroup } from '@/models/group';
import { Page as MPage } from '@/models/page';

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
    const index = groups.findIndex(g => g.id === group.id);
    if (index !== -1) {
        groups.splice(index, 1);
    }
    await setGroups(groups);
};

export const removePage = async (group: MGroup, page: MPage) => {
    const groups = await getGroups();
    const index = groups.findIndex(g => g.id === group.id);
    if (index !== -1) {
        const group = groups[index];
        const pageIndex = group.pages.findIndex(p => p.id === page.id);
        if (pageIndex !== -1) {
            group.pages.splice(pageIndex, 1);
        }
        if (group.pages.length === 0) {
            groups.splice(index, 1);
        }
    }
    await setGroups(groups);
};
