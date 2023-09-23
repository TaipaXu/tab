import App from './save.vue';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import colors from 'vuetify/lib/util/colors';
import '@mdi/font/css/materialdesignicons.css';

const vuetify = createVuetify({
    theme: {
        themes: {
            light: {
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
