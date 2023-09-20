<template>
    <v-tabs
    v-model="windowIndex"
    bg-color="grey-lighten-3"
    density="compact"
    align-tabs="center"
    show-arrows>
        <v-tab
        v-for="(_window, index) in windows"
        :key="index"
        width="10"
        :max-width="10">{{ index + 1 }}</v-tab>
    </v-tabs>
    <v-window v-model="windowIndex">
        <v-window-item
        v-for="(window, index) in windows"
        :key="index">
            <v-list :lines="false" density="compact" nav>
                <v-list-item
                v-for="tab in window.tabs"
                :key="tab.id"
                :active="tabId === tab.id"
                @click="switchToTab(window.id, tab.id)">
                    <template #prepend>
                        <v-img :src="tab.favIcon" :width="16" />
                    </template>

                    <v-list-item-title style="margin-left: 12px;">
                        {{ tab.title }}
                    </v-list-item-title>

                    <template #append>
                        <v-icon
                        icon="mdi-close"
                        @click="closeTab(tab.id)"></v-icon>
                    </template>
                </v-list-item>
            </v-list>
        </v-window-item>
    </v-window>
</template>

<script setup lang="ts">
import browser from 'webextension-polyfill';
import { Ref } from 'vue';

let windowIndex: Ref<number> = ref(0);

const tabId: Ref<number | undefined> = ref();
onMounted(async () => {
    const [tab] = await browser.tabs.query({ currentWindow: true, active: true });
    tabId.value = tab.id;
    console.log('id', tab.id);
});

interface Tab {
    id?: number,
    title?: string,
    favIcon?: string,
}

interface BrowsorWindow {
    id?: number,
    tabs: Tab[],
}

const windows: Ref<BrowsorWindow[]> = ref([]);

browser.runtime.onMessage.addListener(async (message) => {
    console.log('message', message);
    if (message.type === 'tabs') {
        windows.value = message.data;

        const [tab] = await browser.tabs.query({ currentWindow: true, active: true });
        const index = windows.value.findIndex((item) => item.id === tab.windowId);
        if (index >= 0) {
            windowIndex.value = index;
        }
    }
});

browser.runtime.sendMessage({
    type: 'getTabs'
});

const switchToTab = (windowId?: number, tabId?: number) => {
    browser.runtime.sendMessage({
        type: 'switchToTab',
        windowId,
        tabId
    });
};

const closeTab = (tabId?: number) => {
    browser.runtime.sendMessage({
        type: 'closeTab',
        tabId
    });
};
</script>

<style lang="scss">
#app {
    width: 400px;
    height: 400px;
    display: flex;
    flex-direction: column;

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
}
</style>
