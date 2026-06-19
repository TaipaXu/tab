<template>
    <v-layout
    density="compact">
        <v-app-bar color="primary">
            <v-toolbar-title
            class="title"
            aria-label="Open homepage"
            @click="openHomepage">
                <span class="title__content" data-tooltip="Open homepage">
                    Tab
                    <span class="count">{{ groups.reduce((total, window) => total + window.pages.length, 0) }}</span>
                </span>
            </v-toolbar-title>

            <v-spacer></v-spacer>

            <storage-mode-menu @change="getGroups"></storage-mode-menu>
        </v-app-bar>

        <v-main class="main">
            <v-list
            v-for="(group) in groups"
            :key="group.id"
            class="group">
                <v-list-subheader>
                    {{ group.pages.length }} page{{ group.pages.length === 1 ? '' : 's' }}

                    <v-btn
                    icon="$web"
                    variant="text"
                    density="compact"
                    style="margin-left: 10px;"
                    data-tooltip="Open saved group"
                    aria-label="Open saved group"
                    @click="openGroup(group)"></v-btn>

                    <v-btn
                    icon="$close"
                    variant="text"
                    density="compact"
                    style="margin-left: 10px;"
                    data-tooltip="Remove saved group"
                    aria-label="Remove saved group"
                    @click="removeGroup(group)"></v-btn>
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
                        icon="$close"
                        data-tooltip="Remove saved page"
                        data-tooltip-placement="left"
                        aria-label="Remove saved page"
                        @click.stop="removePage(group, page)"></v-icon>
                    </template>
                </v-list-item>
            </v-list>
        </v-main>
    </v-layout>

    <tooltip-host></tooltip-host>
</template>

<script setup lang="ts">
import browser from 'webextension-polyfill';
import { ref, type Ref } from 'vue';
import {
    getGroups as DGetGroups,
    removeGroup as DRemoveGroup,
    removePage as DRemovePage
} from '@/data/page';
import type { Group as MGroup } from '@/models/group';
import type { Page as MPage } from '@/models/page';
import StorageModeMenu from '@/widgets/storageModeMenu.vue';
import TooltipHost from '@/widgets/tooltipHost.vue';

const groups: Ref<MGroup[]> = ref([]);

const getGroups = async () => {
    groups.value = await DGetGroups();
};

getGroups();

const openGroup = (group: MGroup) => {
    const urls: string[] = [];
    group.pages.forEach((page) => {
        if (page.url) {
            urls.push(page.url);
        }
    });
    if (urls.length > 0) {
        browser.windows.create({
            url: urls
        });
    }
};

const removeGroup = async (group: MGroup) => {
    await DRemoveGroup(group);
    getGroups();
};

const openPage = (url?: string) => {
    globalThis.open(url);
};

const removePage = async (group: MGroup, page: MPage) => {
    await DRemovePage(group, page);
    getGroups();
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

.title__content {
    display: inline-flex;
    align-items: baseline;
}

.count {
    margin-left: 4px;
    font-size: 10px;
}

.group {
    margin-top: 10px;
}
</style>
