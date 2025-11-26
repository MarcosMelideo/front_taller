<template>
    <v-app-bar flat border>
        <template v-slot:prepend>
            
        </template>
        <v-btn
            @click="theme.toggle()"
            :icon="theme.name.value === 'dark' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
            :title="theme.name.value === 'dark' ? 'Modo claro' : 'Modo oscuro'"
        ></v-btn>
    </v-app-bar>  
</template>
<script setup>
    import { useTheme } from 'vuetify'
    const theme = useTheme()
</script>