<script setup lang="ts">
// A raw <video> in markdown skips the site's base path (/docs/ on GitHub Pages); this adds it.
const props = defineProps<{ src: string, poster?: string }>()
const base = useRuntimeConfig().app.baseURL.replace(/\/$/, '')
const withBase = (path?: string) => (path ? `${base}${path}` : undefined)
</script>

<template>
  <video controls preload="metadata" :poster="withBase(props.poster)" class="w-full rounded-xl my-4">
    <source :src="withBase(props.src)" type="video/mp4">
  </video>
</template>
