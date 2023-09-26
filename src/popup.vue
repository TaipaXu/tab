<template>
    <popup-tabs
    v-if="mode === Mode.Tab"
    @open-homepage="openHomepage"
    @enter-history-mode="mode = Mode.Hisotry"
    @enter-search-mode="mode = Mode.Search" />

    <popup-search
    v-if="mode === Mode.Search"
    @exit-search-mode="mode = Mode.Tab" />

    <popup-history
    v-if="mode === Mode.Hisotry"
    @open-homepage="openHomepage"
    @exit-history-mode="mode = Mode.Tab" />
</template>

<script setup lang="ts">
import { Ref } from 'vue';
import PopupTabs from '@/widgets/popupTabs.vue';
import PopupSearch from '@/widgets/popupSearch.vue';
import PopupHistory from '@/widgets/popupHistory.vue';

const enum Mode {
    Tab,
    Search,
    Hisotry
}

const mode: Ref<Mode> = ref(Mode.Tab);

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

    .count {
        margin-left: 4px;
        font-size: 8px;
    }
}
</style>
