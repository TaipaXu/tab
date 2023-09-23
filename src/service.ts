import browser from 'webextension-polyfill';
import { BrowsorWindow as MBrowsorWindow } from '@/models/browsorWindow';

const getAllTabs = async () => {
    const tabs = await browser.tabs.query({});
    console.log('tabs', tabs);
    const windows: MBrowsorWindow[] = [];
    for (const tab of tabs) {
        const window = windows.find(w => w.id === tab.windowId);
        if (window) {
            window.tabs.push({
                id: tab.id,
                title: tab.title,
                favIcon: tab.favIconUrl
            });
        } else {
            windows.push({
                id: tab.windowId,
                tabs: [{
                    id: tab.id,
                    title: tab.title,
                    favIcon: tab.favIconUrl
                }]
            });
        }
    }
    console.log('windows', windows);

    browser.runtime.sendMessage({
        type: 'tabs',
        data: windows
    });
};

const getTabCount = async () => {
    const tabs = await browser.tabs.query({});
    const count = tabs.length;
    browser.action.setBadgeText({
        text: count.toString()
    });
};

getTabCount();

browser.runtime.onMessage.addListener(async (message: any, sender: browser.Runtime.MessageSender) => {
    console.log('message', message, sender);
    if (message.type === 'getTabs') {
        getAllTabs();
    } else if (message.type === 'closeTab') {
        browser.tabs.remove(message.tabId);
    } else if (message.type === 'switchToTab') {
        await browser.windows.update(message.windowId, { focused: true });
        browser.tabs.update(message.tabId, { active: true });
    } else if (message.type === 'showWindow') {
        browser.windows.update(message.windowId, { focused: true });
    } else if (message.type === 'closeWindow') {
        browser.windows.remove(message.windowId);
    }
});

browser.tabs.onCreated.addListener(() => {
    console.log('tabs.onCreated');
    getTabCount();
});

browser.tabs.onRemoved.addListener(() => {
    console.log('tabs.onRemoved');
    getAllTabs();
    getTabCount();
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
getAllWindows();
