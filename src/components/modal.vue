<template>
    <div v-if="showModal">
        <slot></slot>
    </div>
</template>

<script>
export default {
    props: {
        showModal: {
            type: Boolean,
            default: false
        }
    }
}
</script>

<style></style>