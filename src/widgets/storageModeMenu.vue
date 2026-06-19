<template>
    <v-menu location="bottom end">
        <template #activator="{ props }">
            <v-btn
            v-bind="props"
            :icon="storageIcon"
            :data-tooltip="storageTitle"
            :aria-label="storageTitle"
            :loading="loading"></v-btn>
        </template>

        <v-list density="compact" min-width="210">
            <v-list-subheader>Save location</v-list-subheader>

            <v-list-item
            :active="mode === STORAGE_MODE_LOCAL"
            @click="changeStorageMode(STORAGE_MODE_LOCAL)">
                <template #prepend>
                    <v-icon icon="$contentSaveOutline"></v-icon>
                </template>

                <v-list-item-title>Local</v-list-item-title>
            </v-list-item>

            <v-list-item
            :active="mode === STORAGE_MODE_SYNC"
            @click="changeStorageMode(STORAGE_MODE_SYNC)">
                <template #prepend>
                    <v-icon icon="$cloudSyncOutline"></v-icon>
                </template>

                <v-list-item-title>Browser sync</v-list-item-title>
            </v-list-item>

            <v-list-item v-if="hasError" class="storage-mode-menu__error">
                <v-list-item-title>Switch failed</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from 'vue';
import {
    getStorageMode,
    STORAGE_MODE_LOCAL,
    STORAGE_MODE_SYNC,
    type StorageMode,
} from '@/data/storageMode';
import { switchStorageMode } from '@/data/page';

const mode: Ref<StorageMode> = ref(STORAGE_MODE_LOCAL);
const loading: Ref<boolean> = ref(false);
const hasError: Ref<boolean> = ref(false);

const $emits = defineEmits<{
    change: [mode: StorageMode];
}>();

const storageIcon = computed(() => {
    return mode.value === STORAGE_MODE_SYNC ? '$cloudSyncOutline' : '$contentSaveOutline';
});

const storageTitle = computed(() => {
    return mode.value === STORAGE_MODE_SYNC ? 'Browser sync' : 'Local';
});

onMounted(async () => {
    mode.value = await getStorageMode();
});

const changeStorageMode = async (nextMode: StorageMode) => {
    if (loading.value || mode.value === nextMode) {
        return;
    }

    loading.value = true;
    hasError.value = false;
    try {
        await switchStorageMode(nextMode);
        mode.value = nextMode;
        $emits('change', nextMode);
    } catch (error) {
        hasError.value = true;
        console.error('Failed to switch storage mode', error);
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped lang="scss">
.storage-mode-menu__error {
    color: rgb(var(--v-theme-error));
}
</style>
