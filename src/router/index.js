/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'

routes.push(
  { path: "/clientes", name: "clientes", component: () => import("@/views/clientes/clientes.vue"), props: true },
  { path: "/cliente/:id", name: "cliente", component: () => import("@/views/clientes/cliente.vue"), props: true },

  { path: "/vehiculos", name: "vehiculos", component: () => import("@/views/vehiculos/vehiculos.vue"), props: true },
  { path: "/vehiculo/:id", name: "vehiculo", component: () => import("@/views/vehiculos/vehiculo.vue"), props: true },

  { path: "/diagnosticos", name: "diagnosticos", component: () => import("@/views/diagnosticos/diagnosticos.vue"), props: true },

  { path: "/presupuestos", name: "presupuestos", component: () => import("@/views/presupuestos/presupuestos.vue"), props: true },
  { path: "/presupuestos/nuevo", name: "nuevoPresupuesto", component: () => import("@/views/presupuestos/nuevoPresupuesto.vue"), props: true },
  { path: "/:imprimir?/presupuesto/:id", name: "presupuesto", component: () => import("@/views/presupuestos/presupuesto.vue"), props: true },
);

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
