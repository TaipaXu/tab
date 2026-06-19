import type { Tab } from './tab';

export interface BrowsorWindow {
    id?: number;
    tabs: Tab[];
}
