<template>
    <template v-if="mode === Mode.Tab">
        <v-toolbar density="compact" color="primary">
            <v-toolbar-title class="title" @click="openHomepage">
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
            @click="enterHistoryMode"></v-btn>

            <v-btn
            icon="mdi-magnify"
            @click="enterSearchMode"></v-btn>


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

    <template v-if="mode === Mode.Search">
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
                    @click:append-inner="exitSearchMode"></v-text-field>
                </v-card-text>
            </v-card>

            <v-list class="search__items">
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

    <template v-if="mode === Mode.Hisotry">
        <div class="search-section">
            <v-toolbar density="compact" color="primary">
                <v-toolbar-title class="title" @click="openHomepage">
                    Hisotry
                </v-toolbar-title>

                <v-spacer></v-spacer>

                <v-btn
                icon="mdi-close"
                @click="exitHistoryMode"></v-btn>
            </v-toolbar>

            <v-list class="search__items">
                <v-list-item
                v-for="page in historyPages"
                :key="page.id"
                link
                @click="openPage(page.url)">
                    <v-list-item-title>
                        {{ page.title }}
                    </v-list-item-title>

                    <v-list-item-subtitle>
                        {{ page.lastVisitDateTime ? formatTimestamp(page.lastVisitDateTime) : '' }}
                    </v-list-item-subtitle>
                </v-list-item>
            </v-list>
        </div>
    </template>
</template>

<script setup lang="ts">
import browser from 'webextension-polyfill';
import { Ref } from 'vue';
import { BrowsorWindow as MBrowsorWindow } from '@/models/browsorWindow';
import { Tab as MTab } from '@/models/tab';
import { HistoryPage as MHistoryPage } from '@/models/historyPage';
import { addGroup as DAddGroup } from '@/data/page';
import { formatTimestamp } from '@/utils/datetime';

const enum Mode {
    Tab,
    Search,
    Hisotry
}

const mode: Ref<Mode> = ref(Mode.Tab);
let inited = false;
let windowIndex: Ref<number> = ref(0);

const windowId: Ref<number | undefined> = ref();
const tabId: Ref<number | undefined> = ref();
onMounted(async () => {
    const [tab] = await browser.tabs.query({ currentWindow: true, active: true });
    windowId.value = tab.windowId;
    tabId.value = tab.id;
    console.log('id', tab.id);
});

const windows: Ref<MBrowsorWindow[]> = ref([]);

browser.runtime.onMessage.addListener(async (message) => {
    console.log('message', message);
    if (message.type === 'tabs') {
        windows.value = message.data;

        const [tab] = await browser.tabs.query({ currentWindow: true, active: true });
        const index = windows.value.findIndex((item) => item.id === tab.windowId);
        if (index >= 0 && (!inited || windows.value[index].tabs.length !== 0)) {
            inited = true;
            windowIndex.value = index;
        }
    } else if (message.type === 'history') {
        historyPages.value = message.data;
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
const searchText: Ref<string> = ref('');
const enterSearchMode = () => {
    mode.value = Mode.Search;
    searchText.value = '';
    nextTick(() => {
        $searchInput.value.focus();
    });
};
const exitSearchMode = () => {
    mode.value = Mode.Tab;
    searchText.value = '';
};
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

const historyPages: Ref<MHistoryPage[]> = ref([]);
const enterHistoryMode = () => {
    mode.value = Mode.Hisotry;
    browser.runtime.sendMessage({
        type: 'getHistory'
    });
};
const exitHistoryMode = () => {
    mode.value = Mode.Tab;
};

const openPage = (url?: string) => {
    globalThis.open(url);
};

const openHomepage = () => {
    globalThis.open('https://github.com/TaipaXu/tab');
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

    .count {
        margin-left: 4px;
        font-size: 8px;
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
