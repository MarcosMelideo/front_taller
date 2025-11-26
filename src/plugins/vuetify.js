/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { en, es } from 'vuetify/locale'

const myCustomLightTheme = {
  dark: false,
  colors: {
    background: '#F2F7FF',
  }
}

export default createVuetify({
  locale: {
    locale: 'es',
    fallback: 'en',
    messages: { en, es }
  },
  theme: {
    defaultTheme: 'system',
    themes: {
      light: myCustomLightTheme
    },
  },
})