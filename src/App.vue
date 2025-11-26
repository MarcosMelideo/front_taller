<template>
  <v-app>
    <Sidebar v-if="!print.value"></Sidebar>
    <v-main>
      <AppBar v-if="!print.value"></AppBar>
      <div class="pa-2 ma-2">
        <router-view/>
      </div>
      <!-- <AppFooter/> -->
    </v-main>
  </v-app>
</template>

<script setup>
  import { usePrintState } from "@/stores/store.js"

  const print = usePrintState();
</script>
