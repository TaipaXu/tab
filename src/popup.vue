<template>
    <v-toolbar density="compact">
        <v-toolbar-title>Tab</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn
        icon="mdi-eye-outline"
        @click="showWindow"></v-btn>

        <template #extension>
            <v-tabs
            v-model="windowIndex"
            bg-color="grey-lighten-3"
            density="compact"
            align-tabs="center"
            center-active
            show-arrows>
                <v-tab
                v-for="(_window, index) in windows"
                :key="index">{{ index + 1 }} / {{ windows.length }}</v-tab>
            </v-tabs>
        </template>
    </v-toolbar>
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

const showWindow = () => {
    const windowId = windows.value[windowIndex.value].id;
    browser.runtime.sendMessage({
        type: 'showWindow',
        windowId
    });
};
</script>

<style lang="scss">
#app {
    width: 400px;
    height: 600px;
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
