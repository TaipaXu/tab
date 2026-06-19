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
        v-show="windows[windowIndex]?.id !== windowId"
        icon="$eyeOutline"
        @click="showWindow"></v-btn>

        <v-btn
        icon="$deleteOutline"
        @click="closeWindow"></v-btn>

        <v-btn
        icon="$databasePlus"
        @click="saveAndCloseWindow"></v-btn>

        <v-btn
        icon="$databaseOutline"
        @click="openSavePage"></v-btn>

        <v-btn
        icon="$history"
        @click="$emits('enterHistoryMode')"></v-btn>

        <v-btn
        icon="$magnify"
        @click="$emits('enterSearchMode')"></v-btn>


        <template #extension>
            <v-tabs
            v-model="windowIndex"
            next-icon="$arrowRightBoldBoxOutline"
            prev-icon="$arrowLeftBoldBoxOutline"
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
                <tab
                v-for="tab in browserWindow.tabs"
                :key="tab.id"
                :title="tab.title"
                :icon="tab.favIcon"
                :active="tabId === tab.id"
                @click="switchToTab(browserWindow.id, tab.id)"
                @save-and-close="saveAndClosePage(tab)"
                @close="closeTab(tab.id)" />
            </v-list>
        </v-window-item>
    </v-window>
</template>

<script setup lang="ts">
import browser from 'webextension-polyfill';
import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import type { BrowsorWindow as MBrowsorWindow } from '@/models/browsorWindow';
import type { Tab as MTab } from '@/models/tab';
import { addGroup as DAddGroup } from '@/data/page';
import { isRuntimeMessage, sendRuntimeMessage } from '@/utils/runtimeMessage';
import Tab from '@/widgets/tab.vue';

let inited = false;
const windows: Ref<MBrowsorWindow[]> = ref([]);
const windowIndex: Ref<number> = ref(0);
const windowId: Ref<number | undefined> = ref();
const tabId: Ref<number | undefined> = ref();
const handleRuntimeMessage = async (message: unknown) => {
    console.log('message', message);
    if (!isRuntimeMessage(message)) {
        return;
    }

    if (message.type === 'tabs') {
        windows.value = message.data;
        if (!inited) {
            inited = true;

            const [tab] = await browser.tabs.query({ currentWindow: true, active: true });
            if (!tab) {
                return;
            }

            const window = windows.value.find((window) => window.id === tab.windowId);
            if (window) {
                windowIndex.value = windows.value.indexOf(window);
            }
        }
        if (windowIndex.value > windows.value.length - 1) {
            windowIndex.value = windows.value.length - 1;
        }
    }
};

onMounted(async () => {
    browser.runtime.onMessage.addListener(handleRuntimeMessage);
    void sendRuntimeMessage({
        type: 'getTabs',
    });

    const [tab] = await browser.tabs.query({ currentWindow: true, active: true });
    if (!tab) {
        return;
    }

    windowId.value = tab.windowId;
    tabId.value = tab.id;
    console.log('id', tab.id);
});

onUnmounted(() => {
    browser.runtime.onMessage.removeListener(handleRuntimeMessage);
});

const showWindow = () => {
    const activeWindow = windows.value[windowIndex.value];
    if (activeWindow?.id === undefined) {
        return;
    }

    void sendRuntimeMessage({
        type: 'showWindow',
        windowId: activeWindow.id,
    });
};

const closeWindow = () => {
    const activeWindow = windows.value[windowIndex.value];
    if (activeWindow?.id === undefined) {
        return;
    }

    void sendRuntimeMessage({
        type: 'closeWindow',
        windowId: activeWindow.id,
    });
};

const saveAndCloseWindow = async () => {
    const activeWindow = windows.value[windowIndex.value];
    if (!activeWindow) {
        return;
    }

    const tabs = activeWindow.tabs;
    await DAddGroup({
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
    if (windowId === undefined || tabId === undefined) {
        return;
    }

    void sendRuntimeMessage({
        type: 'switchToTab',
        windowId,
        tabId,
    });
};

const openSavePage = () => {
    browser.tabs.create({
        url: './save.html',
        pinned: true
    });
};

const saveAndClosePage = async (tab: MTab) => {
    await DAddGroup({
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
    if (tabId === undefined) {
        return;
    }

    void sendRuntimeMessage({
        type: 'closeTab',
        tabId,
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
