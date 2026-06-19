<template>
    <popup-tabs
    v-if="mode === Mode.Tab"
    @open-homepage="openHomepage"
    @enter-history-mode="mode = Mode.History"
    @enter-search-mode="mode = Mode.Search" />

    <popup-search
    v-if="mode === Mode.Search"
    @exit-search-mode="mode = Mode.Tab" />

    <popup-history
    v-if="mode === Mode.History"
    @open-homepage="openHomepage"
    @exit-history-mode="mode = Mode.Tab" />

    <tooltip-host></tooltip-host>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';
import PopupTabs from '@/widgets/popupTabs.vue';
import PopupSearch from '@/widgets/popupSearch.vue';
import PopupHistory from '@/widgets/popupHistory.vue';
import TooltipHost from '@/widgets/tooltipHost.vue';

const enum Mode {
    Tab,
    Search,
    History
}

const mode: Ref<Mode> = ref(Mode.Tab);

const openHomepage = () => {
    globalThis.open('https://github.com/TaipaXu/tab');
};
</script>

<style lang="scss">
#app {
    width: 420px;
    height: 600px;
    display: flex;
    flex-direction: column;

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
        font-size: 8px;
    }
}
</style>
