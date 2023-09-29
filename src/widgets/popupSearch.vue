<template>
    <div class="search-section">
        <v-card
        class="mx-auto search__input"
        color="primary"
        rounded="0">
            <v-card-text>
                <v-text-field
                ref="$searchInput"
                v-model="searchText"
                density="compact"
                variant="solo"
                label="Search tabs"
                append-inner-icon="mdi-close"
                single-line
                hide-details
                @click:append-inner="$emits('exitSearchMode')"></v-text-field>
            </v-card-text>
        </v-card>

        <v-list density="compact" nav class="search__items">
            <template v-for="(browserWindow, index) in searchedWindowTabs" :key="index">
                <v-list-subheader class="search__window">
                    <div>
                        Window {{ index + 1 }}
                        <span class="count">{{ browserWindow.tabs.length }}</span>
                    </div>

                    <v-btn
                    v-show="browserWindow.id !== windowId"
                    icon="mdi-eye-outline"
                    variant="text"
                    density="compact"
                    @click="showWindowById(browserWindow.id)"></v-btn>
                </v-list-subheader>

                <tab
                v-for="tab in browserWindow.tabs"
                :key="tab.id"
                :title="tab.title"
                :icon="tab.favIcon"
                :active="tabId === tab.id"
                @click="switchToTab(browserWindow.id, tab.id)"
                @close="closeTab(tab.id)" />
            </template>
        </v-list>
    </div>
</template>

<script setup lang="ts">
import browser from 'webextension-polyfill';
import { Ref } from 'vue';
import { BrowsorWindow as MBrowsorWindow } from '@/models/browsorWindow';
import { Tab as MTab } from '@/models/tab';
import Tab from '@/widgets/tab.vue';

const windows: Ref<MBrowsorWindow[]> = ref([]);
const windowId: Ref<number | undefined> = ref();
const tabId: Ref<number | undefined> = ref();
const $searchInput = ref();
const searchText: Ref<string> = ref('');

onMounted(async () => {
    const [tab] = await browser.tabs.query({ currentWindow: true, active: true });
    windowId.value = tab.windowId;
    tabId.value = tab.id;
});

browser.runtime.onMessage.addListener(async (message) => {
    console.log('message', message);
    if (message.type === 'tabs') {
        windows.value = message.data;
    }
});

browser.runtime.sendMessage({
    type: 'getTabs'
});

const searchedWindowTabs = computed(() => {
    const windowTabs: MBrowsorWindow[] = [];
    for (const window of windows.value) {
        const tabs: MTab[] = [];
        for (const tab of window.tabs) {
            if (tab.title?.toLocaleLowerCase().includes(searchText.value.toLocaleLowerCase()) || tab.url?.toLocaleLowerCase().includes(searchText.value.toLocaleLowerCase())) {
                tabs.push(tab);
            }
        }
        if (tabs.length > 0) {
            windowTabs.push({
                id: window.id,
                tabs
            });
        }
    }
    return windowTabs;
});

const showWindowById = (windowId?: number) => {
    browser.runtime.sendMessage({
        type: 'showWindow',
        windowId
    });
};

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

const $emits = defineEmits(['exitSearchMode']);
</script>

<style lang="scss">
.search {
    &-section {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    &__input {
        width: 100%;
    }

    &__items {
        flex: 1;

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

    &__window {
        .v-list-subheader__text {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
        }
    }
}
</style>
