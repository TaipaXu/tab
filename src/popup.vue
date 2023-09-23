<template>
    <template v-if="!searchMode">
        <v-toolbar density="compact" color="primary">
            <v-toolbar-title class="title" @click="openHomepage">
                Tab
            </v-toolbar-title>

            <v-spacer></v-spacer>

            <v-btn
            icon="mdi-eye-outline"
            @click="showWindow"></v-btn>

            <v-btn
            icon="mdi-delete-outline"
            @click="closeWindow"></v-btn>

            <v-btn icon @click="enterSearchMode">
                <v-icon>mdi-magnify</v-icon>
            </v-btn>


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
                    v-for="(_window, index) in windows"
                    :key="index">{{ index + 1 }} / {{ windows.length }}</v-tab>
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
                            icon="mdi-close"
                            @click="closeTab(tab.id)"></v-icon>
                        </template>
                    </v-list-item>
                </v-list>
            </v-window-item>
        </v-window>
    </template>

    <template v-else>
        <div class="search-section">
            <v-card
            class="mx-auto search__input"
            color="grey-lighten-3">
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
                    @click:append-inner="exitSearchMode"></v-text-field>
                </v-card-text>
            </v-card>

            <v-list class="search__items">
                <template v-for="(browserWindow, index) in searchedWindowTabs" :key="index">
                    <v-list-subheader class="search__window">
                        Window {{ index + 1 }}
                        <v-btn
                        icon="mdi-eye-outline"
                        variant="text"
                        density="compact"
                        @click="showWindowById(browserWindow.id)"></v-btn>
                    </v-list-subheader>

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
                            icon="mdi-close"
                            @click="closeTab(tab.id)"></v-icon>
                        </template>
                    </v-list-item>
                </template>
            </v-list>
        </div>
    </template>
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

const showWindowById = (windowId?: number) => {
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

const $searchInput = ref();
const searchMode: Ref<boolean> = ref(false);
const searchText: Ref<string> = ref('');
const enterSearchMode = () => {
    searchMode.value = true;
    searchText.value = '';
    nextTick(() => {
        $searchInput.value.focus();
    });
};
const exitSearchMode = () => {
    searchMode.value = false;
    searchText.value = '';
};
const searchedWindowTabs = computed(() => {
    const windowTabs: BrowsorWindow[] = [];
    for (const window of windows.value) {
        const tabs: Tab[] = [];
        for (const tab of window.tabs) {
            if (tab.title?.toLocaleLowerCase().includes(searchText.value.toLocaleLowerCase())) {
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

const openHomepage = () => {
    globalThis.open('https://github.com/TaipaXu/tab');
};
</script>

<style lang="scss">
#app {
    width: 400px;
    height: 600px;
    display: flex;
    flex-direction: column;

    .title {
        cursor: pointer;
        user-select: none;
    }

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
}
</style>
