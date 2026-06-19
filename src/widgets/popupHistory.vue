<template>
    <div class="search-section">
        <v-toolbar density="compact" color="primary">
            <v-toolbar-title class="title" @click="$emits('openHomepage')">
                Hisotry
            </v-toolbar-title>

            <v-spacer></v-spacer>

            <v-btn
            icon="$close"
            @click="$emits('exitHistoryMode')"></v-btn>
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

<script setup lang="ts">
import browser from 'webextension-polyfill';
import { ref, type Ref } from 'vue';
import type { HistoryPage as MHistoryPage } from '@/models/historyPage';
import { formatTimestamp } from '@/utils/datetime';
import { isRuntimeMessage } from '@/utils/runtimeMessage';

const historyPages: Ref<MHistoryPage[]> = ref([]);

browser.runtime.onMessage.addListener(async (message: unknown) => {
    if (!isRuntimeMessage(message)) {
        return;
    }

    if (message.type === 'history' && Array.isArray(message.data)) {
        historyPages.value = message.data as MHistoryPage[];
    }
});

browser.runtime.sendMessage({
    type: 'getHistory'
});

const openPage = (url?: string) => {
    globalThis.open(url);
};

const $emits = defineEmits(['openHomepage', 'exitHistoryMode']);
</script>
