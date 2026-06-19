import App from './save.vue';
import { createApp } from 'vue';
import { mdiWeb, mdiClose, mdiCloudSyncOutline, mdiContentSaveOutline } from '@mdi/js';
import { createExtensionVuetify } from '@/utils/extensionVuetify';

const vuetify = createExtensionVuetify({
    web: mdiWeb,
    close: mdiClose,
    cloudSyncOutline: mdiCloudSyncOutline,
    contentSaveOutline: mdiContentSaveOutline,
});

const app = createApp(App);
app.use(vuetify);
app.mount('#app');
