import App from './save.vue';
import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import colors from 'vuetify/lib/util/colors.mjs';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';
import { mdiWeb, mdiClose } from '@mdi/js';
import { getSystemTheme } from '@/utils/theme';

const vuetify = createVuetify({
    theme: {
        defaultTheme: getSystemTheme(),
        themes: {
            light: {
                colors: {
                    primary: colors.red.darken3,
                    secondary: colors.red.lighten4,
                },
            },
            dark: {
                colors: {
                    primary: colors.red.darken3,
                    secondary: colors.red.lighten4,
                },
            },
        },
    },
    icons: {
        defaultSet: 'mdi',
        aliases: {
            ...aliases,
            web: mdiWeb,
            close: mdiClose,
        },
        sets: {
            mdi,
        },
    },
});

const app = createApp(App);
app.use(vuetify);
app.mount('#app');
