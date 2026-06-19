import { createVuetify } from 'vuetify';
import type { IconAliases } from 'vuetify';
import 'vuetify/styles';
import colors from 'vuetify/lib/util/colors.mjs';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';
import { getSystemTheme } from '@/utils/theme';

export function createExtensionVuetify(iconAliases: Partial<IconAliases> = {}) {
    return createVuetify({
        theme: {
            defaultTheme: getSystemTheme(),
            themes: {
                light: {
                    colors: {
                        primary: colors.red.base,
                        secondary: colors.red.lighten4,
                    },
                },
                dark: {
                    colors: {
                        primary: colors.red.darken4,
                        secondary: colors.red.lighten4,
                    },
                },
            },
        },
        icons: {
            defaultSet: 'mdi',
            aliases: {
                ...aliases,
                ...iconAliases,
            },
            sets: {
                mdi,
            },
        },
    });
}
