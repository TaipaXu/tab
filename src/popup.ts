import App from './popup.vue';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import colors from 'vuetify/lib/util/colors';
import '@mdi/font/css/materialdesignicons.css';
import { getSystemTheme } from '@/utils/theme';

const vuetify = createVuetify({
    theme: {
        defaultTheme: getSystemTheme(),
        themes: {
            light: {
                colors: {
                    primary: colors.red.darken3,
                    secondary: colors.red.lighten4
                }
            },
            dark: {
                colors: {
                    primary: colors.red.darken3,
                    secondary: colors.red.lighten4
                }
            }
        }
    }
});

const app = createApp(App);
app.use(vuetify);
app.mount('#app');
