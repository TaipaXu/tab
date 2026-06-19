import App from './save.vue';
import { createApp } from 'vue';
import { mdiWeb, mdiClose } from '@mdi/js';
import { createExtensionVuetify } from '@/utils/extensionVuetify';

const vuetify = createExtensionVuetify({
    web: mdiWeb,
    close: mdiClose,
});

const app = createApp(App);
app.use(vuetify);
app.mount('#app');
