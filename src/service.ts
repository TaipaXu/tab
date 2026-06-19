import browser from 'webextension-polyfill';
import type { BrowserWindow as MBrowserWindow } from '@/models/browserWindow';
import type { HistoryPage as MHistoryPage } from '@/models/historyPage';
import { getGroups } from '@/data/page';
import { isRuntimeMessage, sendRuntimeMessage } from '@/utils/runtimeMessage';

const getAllTabs = async () => {
    const tabs = await browser.tabs.query({});
    console.log('tabs', tabs);
    const windowsById = new Map<number, MBrowserWindow>();
    for (const tab of tabs) {
        const { windowId } = tab;
        if (windowId === undefined) {
            continue;
        }

        let window = windowsById.get(windowId);
        if (!window) {
            window = {
                id: windowId,
                tabs: [],
            };
            windowsById.set(windowId, window);
        }

        window.tabs.push({
            id: tab.id,
            title: tab.title,
            favIcon: tab.favIconUrl,
            url: tab.url,
        });
    }
    const windows = Array.from(windowsById.values());
    console.log('windows', windows);

    await sendRuntimeMessage({
        type: 'tabs',
        data: windows,
    });
};

const getCurrentTabId = async (fallbackTabId?: number) => {
    if (fallbackTabId !== undefined) {
        return fallbackTabId;
    }

    const [tab] = await browser.tabs.query({
        active: true,
        lastFocusedWindow: true,
    });
    return tab?.id;
};

const isNewerTab = (tab: browser.Tabs.Tab, latestTab: browser.Tabs.Tab) => {
    const lastAccessed = tab.lastAccessed ?? 0;
    const latestLastAccessed = latestTab.lastAccessed ?? 0;
    if (lastAccessed !== latestLastAccessed) {
        return lastAccessed > latestLastAccessed;
    }

    return (tab.id ?? 0) > (latestTab.id ?? 0);
};

const findDuplicateTabIdsToClose = (tabs: browser.Tabs.Tab[], currentTabId?: number) => {
    const tabsByUrl = new Map<string, browser.Tabs.Tab[]>();
    for (const tab of tabs) {
        if (!tab.url) {
            continue;
        }

        const duplicateTabs = tabsByUrl.get(tab.url);
        if (duplicateTabs) {
            duplicateTabs.push(tab);
        } else {
            tabsByUrl.set(tab.url, [tab]);
        }
    }

    const tabIdsToClose: number[] = [];
    for (const duplicateTabs of tabsByUrl.values()) {
        if (duplicateTabs.length < 2) {
            continue;
        }

        const tabToKeep =
            duplicateTabs.find((tab) => tab.id === currentTabId) ??
            duplicateTabs.reduce((latestTab, tab) =>
                isNewerTab(tab, latestTab) ? tab : latestTab,
            );

        duplicateTabs.forEach((tab) => {
            if (tab.id !== undefined && tab.id !== tabToKeep.id) {
                tabIdsToClose.push(tab.id);
            }
        });
    }

    return tabIdsToClose;
};

const closeDuplicateTabs = async (currentTabId?: number) => {
    const tabs = await browser.tabs.query({});
    const tabIdsToClose = findDuplicateTabIdsToClose(tabs, await getCurrentTabId(currentTabId));

    if (tabIdsToClose.length > 0) {
        await browser.tabs.remove(tabIdsToClose);
    }

    await getAllTabs();
    await getTabCount();

    return {
        closedCount: tabIdsToClose.length,
    };
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
            case 'closeDuplicateTabs':
                return closeDuplicateTabs(message.currentTabId);
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
