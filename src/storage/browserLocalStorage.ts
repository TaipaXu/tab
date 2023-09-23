import browser from 'webextension-polyfill';
import AbstractStorage from './abstractStorage';

class BrowserLocalStorage extends AbstractStorage {
    async get<T>(key: string, defaultValue: T | undefined): Promise<T | undefined> {
        const data = await browser.storage.local.get(key);

        if (Object.entries(data).length === 0) {
            return defaultValue;
        }
        if (data[key] == undefined) {
            return defaultValue;
        }
        return data[key];
    }

    set(data: object) {
        return browser.storage.local.set(data);
    }
}

export default BrowserLocalStorage;
