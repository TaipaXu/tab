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
            v-if="instance?.vnode.props?.onSaveAndClose !== undefined"
            icon="mdi-database-plus"
            @click.stop="$emit('saveAndClose')"></v-icon>

            <v-icon
            icon="mdi-close"
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
    }
});

const instance = getCurrentInstance();
console.log('instance', instance?.vnode.props?.onSaveAndClose);


defineEmits(['saveAndClose', 'close']);
</script>
