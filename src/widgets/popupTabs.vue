<template>
    <v-toolbar density="compact" color="primary">
        <v-toolbar-title class="title" @click="$emits('openHomepage')">
            Tab
            <span class="count">
                {{ windows.reduce((total, window) => total + window.tabs.length, 0) }}
            </span>
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn
        v-show="windows[windowIndex].id !== windowId"
        icon="mdi-eye-outline"
        @click="showWindow"></v-btn>

        <v-btn
        icon="mdi-delete-outline"
        @click="closeWindow"></v-btn>

        <v-btn
        icon="mdi-database-plus"
        @click="saveAndCloseWindow"></v-btn>

        <v-btn
        icon="mdi-database-outline"
        @click="openSavePage"></v-btn>

        <v-btn
        icon="mdi-history"
        @click="$emits('enterHistoryMode')"></v-btn>

        <v-btn
        icon="mdi-magnify"
        @click="$emits('enterSearchMode')"></v-btn>


        <template #extension>
            <v-tabs
            v-model="windowIndex"
            next-icon="mdi-arrow-right-bold-box-outline"
            prev-icon="mdi-arrow-left-bold-box-outline"
            bg-color="grey-lighten-3"
            density="compact"
            align-tabs="center"
            center-active
            show-arrows>
                <v-tab
                v-for="(window, index) in windows"
                :key="index">
                    {{ index + 1 }} / {{ windows.length }}
                    <span class="count">{{ window.tabs.length }}</span>
                </v-tab>
            </v-tabs>
        </template>
    </v-toolbar>
    <v-window v-model="windowIndex">
        <v-window-item
        v-for="(browserWindow, index) in windows"
        :key="index">
            <v-list :lines="false" density="compact" nav>
                <v-list-item
                v-for="tab in browserWindow.tabs"
                :key="tab.id"
                :active="tabId === tab.id"
                @click="switchToTab(browserWindow.id, tab.id)">
                    <template #prepend>
                        <v-img :src="tab.favIcon" :width="16" />
                    </template>

                    <v-list-item-title style="margin-left: 12px;">
                        {{ tab.title }}
                    </v-list-item-title>

                    <template #append>
                        <v-icon
                        icon="mdi-database-plus"
                        @click.stop="saveAndClosePage(tab)"></v-icon>

                        <v-icon
                        icon="mdi-close"
                        style="margin-left: 8px;"
                        @click.stop="closeTab(tab.id)"></v-icon>
                    </template>
                </v-list-item>
            </v-list>
        </v-window-item>
    </v-window>
</template>

<script setup lang="ts">
import browser from 'webextension-polyfill';
import { Ref } from 'vue';
import { BrowsorWindow as MBrowsorWindow } from '@/models/browsorWindow';
import { Tab as MTab } from '@/models/tab';
import { addGroup as DAddGroup } from '@/data/page';

const windows: Ref<MBrowsorWindow[]> = ref([]);
let windowIndex: Ref<number> = ref(0);
const windowId: Ref<number | undefined> = ref();
const tabId: Ref<number | undefined> = ref();
onMounted(async () => {
    const [tab] = await browser.tabs.query({ currentWindow: true, active: true });
    windowId.value = tab.windowId;
    tabId.value = tab.id;
    console.log('id', tab.id);
});

browser.runtime.onMessage.addListener(async (message) => {
    console.log('message', message);
    if (message.type === 'tabs') {
        windows.value = message.data;

        if (windowIndex.value > windows.value.length - 1) {
            windowIndex.value = windows.value.length - 1;
        }
    }
});

browser.runtime.sendMessage({
    type: 'getTabs'
});

const showWindow = () => {
    const windowId = windows.value[windowIndex.value].id;
    browser.runtime.sendMessage({
        type: 'showWindow',
        windowId
    });
};

const closeWindow = () => {
    const windowId = windows.value[windowIndex.value].id;
    browser.runtime.sendMessage({
        type: 'closeWindow',
        windowId
    });
};

const saveAndCloseWindow = () => {
    const tabs = windows.value[windowIndex.value].tabs;
    DAddGroup({
        id: crypto.randomUUID(),
        pages: tabs.map((tab) => ({
            id: crypto.randomUUID(),
            title: tab.title,
            favIcon: tab.favIcon,
            url: tab.url
        }))
    });
    closeWindow();
};

const switchToTab = (windowId?: number, tabId?: number) => {
    browser.runtime.sendMessage({
        type: 'switchToTab',
        windowId,
        tabId
    });
};

const openSavePage = () => {
    browser.tabs.create({
        url: './save.html',
        pinned: true
    });
};

const saveAndClosePage = (tab: MTab) => {
    DAddGroup({
        id: crypto.randomUUID(),
        pages: [
            {
                id: crypto.randomUUID(),
                title: tab.title,
                favIcon: tab.favIcon,
                url: tab.url
            }
        ]
    });
    closeTab(tab.id);
};

const closeTab = (tabId?: number) => {
    browser.runtime.sendMessage({
        type: 'closeTab',
        tabId
    });
};

const $emits = defineEmits(['openHomepage', 'enterHistoryMode', 'enterSearchMode']);
</script>

<style lang="scss">
.v-window {
    flex: 1;
}

.v-window__container {
    height: 100%;
}

.v-window-item {
    user-select: none;
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
</style>
