import App from './popup.vue';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import colors from 'vuetify/lib/util/colors.mjs';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';
import {
    mdiEyeOutline,
    mdiDeleteOutline,
    mdiDatabasePlus,
    mdiDatabaseOutline,
    mdiHistory,
    mdiMagnify,
    mdiArrowRightBoldBoxOutline,
    mdiArrowLeftBoldBoxOutline,
    mdiClose
} from '@mdi/js';
import { getSystemTheme } from '@/utils/theme';

const vuetify = createVuetify({
    theme: {
        defaultTheme: getSystemTheme(),
        themes: {
            light: {
                colors: {
                    primary: colors.red.base,
                    secondary: colors.red.lighten4
                }
            },
            dark: {
                colors: {
                    primary: colors.red.darken4,
                    secondary: colors.red.lighten4
                }
            }
        }
    },
    icons: {
        defaultSet: 'mdi',
        aliases: {
            ...aliases,
            eyeOutline: mdiEyeOutline,
            deleteOutline: mdiDeleteOutline,
            databasePlus: mdiDatabasePlus,
            databaseOutline: mdiDatabaseOutline,
            history: mdiHistory,
            magnify: mdiMagnify,
            arrowRightBoldBoxOutline: mdiArrowRightBoldBoxOutline,
            arrowLeftBoldBoxOutline: mdiArrowLeftBoldBoxOutline,
            close: mdiClose
        },
        sets: {
            mdi
        }
    }
});

const app = createApp(App);
app.use(vuetify);
app.mount('#app');
