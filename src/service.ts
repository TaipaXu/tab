import browser from 'webextension-polyfill';
import type { BrowsorWindow as MBrowsorWindow } from '@/models/browsorWindow';
import type { HistoryPage as MHistoryPage } from '@/models/historyPage';
import { getGroups } from '@/data/page';

interface RuntimeMessage {
    type: string;
    tabId?: number;
    windowId?: number;
}

const isRuntimeMessage = (message: unknown): message is RuntimeMessage => {
    if (typeof message !== 'object' || message === null || !('type' in message)) {
        return false;
    }

    return typeof (message as { type?: unknown }).type === 'string';
};

const getAllTabs = async () => {
    const tabs = await browser.tabs.query({});
    console.log('tabs', tabs);
    const windows: MBrowsorWindow[] = [];
    for (const tab of tabs) {
        const window = windows.find((w) => w.id === tab.windowId);
        if (window) {
            window.tabs.push({
                id: tab.id,
                title: tab.title,
                favIcon: tab.favIconUrl,
                url: tab.url,
            });
        } else {
            windows.push({
                id: tab.windowId,
                tabs: [
                    {
                        id: tab.id,
                        title: tab.title,
                        favIcon: tab.favIconUrl,
                        url: tab.url,
                    },
                ],
            });
        }
    }
    console.log('windows', windows);

    await browser.runtime.sendMessage({
        type: 'tabs',
        data: windows,
    });
};

const getTabCount = async () => {
    const tabs = await browser.tabs.query({});
    const count = tabs.length;
    await browser.action.setBadgeText({
        text: count.toString(),
    });
};

void getTabCount();

const getSaves = async () => {
    const groups = await getGroups();
    console.log('groups', groups);
    await browser.runtime.sendMessage({
        type: 'saves',
        data: groups,
    });
};

const getHistory = async () => {
    const devices: browser.Sessions.Session[] = await browser.sessions.getRecentlyClosed({
        maxResults: 20,
    });
    const pages: MHistoryPage[] = [];
    for (const device of devices) {
        const page: MHistoryPage = {
            id: device.tab?.sessionId,
            title: device.tab?.title,
            url: device.tab?.url,
            lastVisitDateTime: device.lastModified * 1000,
        };
        pages.push(page);
    }

    await browser.runtime.sendMessage({
        type: 'history',
        data: pages,
    });
};

browser.runtime.onMessage.addListener(
    async (message: unknown, sender: browser.Runtime.MessageSender) => {
        console.log('message', message, sender);
        if (!isRuntimeMessage(message)) {
            return;
        }

        if (message.type === 'getTabs') {
            await getAllTabs();
        } else if (message.type === 'closeTab' && message.tabId !== undefined) {
            await browser.tabs.remove(message.tabId);
        } else if (
            message.type === 'switchToTab' &&
            message.windowId !== undefined &&
            message.tabId !== undefined
        ) {
            await browser.windows.update(message.windowId, { focused: true });
            await browser.tabs.update(message.tabId, { active: true });
        } else if (message.type === 'showWindow' && message.windowId !== undefined) {
            await browser.windows.update(message.windowId, { focused: true });
        } else if (message.type === 'closeWindow' && message.windowId !== undefined) {
            await browser.windows.remove(message.windowId);
        } else if (message.type === 'getSaves') {
            await getSaves();
        } else if (message.type === 'getHistory') {
            await getHistory();
        }
    },
);

browser.tabs.onCreated.addListener(() => {
    console.log('tabs.onCreated');
    void getTabCount();
});

browser.tabs.onRemoved.addListener(() => {
    console.log('tabs.onRemoved');
    void getAllTabs();
    void getTabCount();
});

browser.tabs.onUpdated.addListener(() => {
    console.log('tabs.onUpdated');
});

browser.action.onClicked.addListener(() => {
    console.log('browserAction.onClicked');
});

const getAllWindows = async () => {
    const windows = await browser.windows.getAll({});
    console.log('windows', windows);
};
void getAllWindows();
