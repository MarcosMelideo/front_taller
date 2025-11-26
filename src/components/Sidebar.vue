<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail"
    @click="rail = rail"
  > 
    <v-list>
      <v-list-item 
        prepend-icon="mdi-menu"
        title="Menu"
        @click="rail = !rail"
      ></v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <div v-for="route in routes">
        <div v-if="route.group_name!=null">
          <v-list-group :value="route.group_name">
            <template #activator="{ props }">
              <v-list-item v-bind="props" :prepend-icon="route.group_icon" :title="route.group_name" />
            </template>
            <v-list-item
              v-for="route in route.routes"
              :key="route.title"
              :title="route.title"
              link :to="route.path"
            >
            </v-list-item>
          </v-list-group>
        </div>
        <div v-else>
          <v-list-item
            v-for="route in route.routes"
            :key="route.title"
            :title="route.title"
            :prepend-icon="route.icon"
            link :to="route.path"
          >
          </v-list-item>
        </div>
      </div>
    </v-list>
  </v-navigation-drawer>
</template>
  
<script setup>
  import { ref } from 'vue'

  const drawer = ref(true)
  const rail = ref(false)

  const routes = [
    { group_name: null, group_icon: null, routes: [
        { path: '/', title: 'Home', icon: 'mdi-home' },
        { path: '/clientes', title: 'Clientes', icon: 'mdi-account' },
        // { path: '/clientes/desactivados', title: 'Clientes desactivados', icon: 'mdi-account-off' },
        { path: '/vehiculos', title: 'Vehiculos', icon: 'mdi-car' },
        // { path: '/vehiculos/desactivados', title: 'Vehiculos desactivados', icon: 'mdi-car-off' },
        { path: '/diagnosticos', title: 'Diagnosticos', icon: 'mdi-pen' },
        // { path: '/diagnosticos/desactivados', title: 'Diagnosticos desactivados', icon: 'mdi-pen-off' },
      ]
    },
    { group_name: 'Presupuestos', group_icon: 'mdi-invoice-list', routes: [
        { path: '/presupuestos', title: 'Presupuestos' },
        // { path: '/presupuestos/desactivados', title: 'Presupuestos desactivados', icon: 'mdi-invoice-text-remove' },
        { path: '/presupuestos/nuevo', title: 'Nuevo presupuesto' },
      ]
    },
  ]
</script>