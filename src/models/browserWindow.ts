import type { Tab } from './tab';

export interface BrowserWindow {
    id?: number;
    tabs: Tab[];
}
