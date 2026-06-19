import App from './popup.vue';
import { createApp } from 'vue';
import {
    mdiEyeOutline,
    mdiDeleteOutline,
    mdiDatabasePlus,
    mdiDatabaseOutline,
    mdiHistory,
    mdiMagnify,
    mdiArrowRightBoldBoxOutline,
    mdiArrowLeftBoldBoxOutline,
    mdiClose,
} from '@mdi/js';
import { createExtensionVuetify } from '@/utils/extensionVuetify';

const vuetify = createExtensionVuetify({
    eyeOutline: mdiEyeOutline,
    deleteOutline: mdiDeleteOutline,
    databasePlus: mdiDatabasePlus,
    databaseOutline: mdiDatabaseOutline,
    history: mdiHistory,
    magnify: mdiMagnify,
    arrowRightBoldBoxOutline: mdiArrowRightBoldBoxOutline,
    arrowLeftBoldBoxOutline: mdiArrowLeftBoldBoxOutline,
    close: mdiClose,
});

const app = createApp(App);
app.use(vuetify);
app.mount('#app');
