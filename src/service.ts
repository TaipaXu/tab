import browser from 'webextension-polyfill';
import type { BrowsorWindow as MBrowsorWindow } from '@/models/browsorWindow';
import type { HistoryPage as MHistoryPage } from '@/models/historyPage';
import { getGroups } from '@/data/page';
import { isRuntimeMessage, sendRuntimeMessage } from '@/utils/runtimeMessage';

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

    await sendRuntimeMessage({
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
    await sendRuntimeMessage({
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

    await sendRuntimeMessage({
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

        switch (message.type) {
            case 'getTabs':
                await getAllTabs();
                break;
            case 'closeTab':
                await browser.tabs.remove(message.tabId);
                break;
            case 'switchToTab':
                await browser.windows.update(message.windowId, { focused: true });
                await browser.tabs.update(message.tabId, { active: true });
                break;
            case 'showWindow':
                await browser.windows.update(message.windowId, { focused: true });
                break;
            case 'closeWindow':
                await browser.windows.remove(message.windowId);
                break;
            case 'getSaves':
                await getSaves();
                break;
            case 'getHistory':
                await getHistory();
                break;
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
