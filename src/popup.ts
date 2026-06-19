import App from './popup.vue';
import { createApp } from 'vue';
import {
    mdiEyeOutline,
    mdiCloseBoxMultipleOutline,
    mdiDeleteOutline,
    mdiDatabasePlus,
    mdiDatabaseOutline,
    mdiHistory,
    mdiMagnify,
    mdiArrowRightBoldBoxOutline,
    mdiArrowLeftBoldBoxOutline,
    mdiClose,
    mdiCloudSyncOutline,
    mdiContentSaveOutline,
} from '@mdi/js';
import { createExtensionVuetify } from '@/utils/extensionVuetify';

const vuetify = createExtensionVuetify({
    eyeOutline: mdiEyeOutline,
    closeBoxMultipleOutline: mdiCloseBoxMultipleOutline,
    deleteOutline: mdiDeleteOutline,
    databasePlus: mdiDatabasePlus,
    databaseOutline: mdiDatabaseOutline,
    history: mdiHistory,
    magnify: mdiMagnify,
    arrowRightBoldBoxOutline: mdiArrowRightBoldBoxOutline,
    arrowLeftBoldBoxOutline: mdiArrowLeftBoldBoxOutline,
    close: mdiClose,
    cloudSyncOutline: mdiCloudSyncOutline,
    contentSaveOutline: mdiContentSaveOutline,
});

const app = createApp(App);
app.use(vuetify);
app.mount('#app');
