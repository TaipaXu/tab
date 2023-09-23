abstract class AbstractStorage {
    get<T>(key: string, defaultValue: T | undefined): Promise<T | undefined> {
        throw new Error('Not implemented');
    }

    set(data: object) {
        throw new Error('Not implemented');
    }
}

export default AbstractStorage;
