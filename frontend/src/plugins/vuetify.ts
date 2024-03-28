/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
// import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'
import { VSpeedDial } from 'vuetify/labs/VSpeedDial'
import { VSparkline } from 'vuetify/labs/VSparkline'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  components: {
    VSpeedDial,
    VSparkline
  },
  defaults: {
    VCard: {
      variant: 'text'
    },
    VBtn: {
      elevation: 0
    },
    VTextField: {
      variant: 'outlined'
    }
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#5f89a4'
        }
      },
      dark: {
        colors: {
          primary: '#92c4e4'
        }
      }
    }
  }
})
