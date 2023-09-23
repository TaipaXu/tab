<template>
    <v-layout
    color="colors.red.darken3"
    density="compact">
        <v-app-bar>
            <v-toolbar-title class="title" @click="openHomepage">
                Tab
            </v-toolbar-title>
        </v-app-bar>

        <v-main class="main">
            <v-list
            v-for="(group) in groups"
            :key="group.id"
            class="group">
                <v-list-subheader>
                    {{ group.pages.length }} page{{ group.pages.length === 1 ? '' : 's' }}
                </v-list-subheader>
                <v-list-item
                v-for="page in group.pages"
                :key="page.id"
                @click="openPage(page.url)">
                    <template #prepend>
                        <v-img :src="page.favIcon" :width="16" />
                    </template>

                    <v-list-item-title style="margin-left: 12px;">{{ page.title }}</v-list-item-title>

                    <v-list-item-subtitle style="margin-left: 12px;">
                        {{ page.url }}
                    </v-list-item-subtitle>

                    <template #append>
                        <v-icon
                        icon="mdi-close"
                        @click.stop="removePage(group, page)"></v-icon>
                    </template>
                </v-list-item>
            </v-list>
        </v-main>
    </v-layout>
</template>

<script setup lang="ts">
import { Ref } from 'vue';
import { getGroups as DGetGroups, removePage as DRemovePage } from '@/data/page';
import { Group as MGroup } from '@/models/group';
import { Page as MPage } from '@/models/page';

const groups: Ref<MGroup[]> = ref([]);

const getGroups = async () => {
    groups.value = await DGetGroups();
};

getGroups();

const removePage = async (group: MGroup, page: MPage) => {
    await DRemovePage(group, page);
    getGroups();
};

const openPage = (url?: string) => {
    globalThis.open(url);
};

const openHomepage = () => {
    globalThis.open('https://github.com/TaipaXu/tab');
};
</script>

<style lang="scss">
html,
body {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

#app {
    width: 100%;
    height: 100%;
    overflow-y: auto;

    &::-webkit-scrollbar-track {
        border-radius: 0;
        background: transparent;
    }

    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: #eaeaea;
        border-radius: 3px;
    }
}

.title {
    cursor: pointer;
    user-select: none;
}

.group {
    margin-top: 10px;
}
</style>
