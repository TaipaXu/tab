import browser from 'webextension-polyfill';
import type { BrowsorWindow } from '@/models/browsorWindow';
import type { Group } from '@/models/group';
import type { HistoryPage } from '@/models/historyPage';

export type RuntimeMessage =
    | { type: 'getTabs' }
    | { type: 'tabs'; data: BrowsorWindow[] }
    | { type: 'closeTab'; tabId: number }
    | { type: 'switchToTab'; windowId: number; tabId: number }
    | { type: 'showWindow'; windowId: number }
    | { type: 'closeWindow'; windowId: number }
    | { type: 'getSaves' }
    | { type: 'saves'; data: Group[] }
    | { type: 'getHistory' }
    | { type: 'history'; data: HistoryPage[] };

const isRecord = (message: unknown): message is Record<string, unknown> => {
    return typeof message === 'object' && message !== null;
};

const isNumber = (value: unknown): value is number => {
    return typeof value === 'number';
};

export const isRuntimeMessage = (message: unknown): message is RuntimeMessage => {
    if (!isRecord(message)) {
        return false;
    }

    switch (message.type) {
        case 'getTabs':
        case 'getSaves':
        case 'getHistory':
            return true;
        case 'tabs':
        case 'saves':
        case 'history':
            return Array.isArray(message.data);
        case 'closeTab':
            return isNumber(message.tabId);
        case 'switchToTab':
            return isNumber(message.windowId) && isNumber(message.tabId);
        case 'showWindow':
        case 'closeWindow':
            return isNumber(message.windowId);
        default:
            return false;
    }
};

export const sendRuntimeMessage = (message: RuntimeMessage): Promise<unknown> => {
    return browser.runtime.sendMessage(message);
};
