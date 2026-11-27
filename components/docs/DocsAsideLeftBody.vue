<script setup lang="ts">
// Same as Docus's, but groups are collapsible and only the current page's group starts open.
const { sidebarNavigation } = useSubNavigation()

const contentNavVariants = useUIConfig('contentNavigation')
</script>

<template>
  <UContentNavigation
    default-open
    :highlight="contentNavVariants.highlight ?? true"
    :highlight-color="contentNavVariants.highlightColor"
    :variant="contentNavVariants.variant ?? 'link'"
    :color="contentNavVariants.color"
    :navigation="sidebarNavigation"
  />
</template>
