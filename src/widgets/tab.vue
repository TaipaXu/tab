<template>
    <v-list-item
    :active="$props.active">
        <template #prepend>
            <v-img :src="$props.icon" :width="16" />
        </template>

        <v-list-item-title style="margin-left: 12px;">
            {{ $props.title }}
        </v-list-item-title>

        <template #append>
            <v-icon
            v-if="$props.showSaveAction"
            icon="$databasePlus"
            @click.stop="$emit('saveAndClose')"></v-icon>

            <v-icon
            icon="$close"
            style="margin-left: 8px;"
            @click.stop="$emit('close')"></v-icon>
        </template>
    </v-list-item>
</template>

<script setup lang="ts">
defineProps({
    title: {
        type: String
    },
    icon: {
        type: String
    },
    active: {
        type: Boolean,
        default: false
    },
    showSaveAction: {
        type: Boolean,
        default: false
    }
});

defineEmits(['saveAndClose', 'close']);
</script>
