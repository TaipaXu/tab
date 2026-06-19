abstract class AbstractStorage {
    abstract get<T>(key: string, defaultValue: T | undefined): Promise<T | undefined>;

    abstract set(data: object): Promise<void>;
}

export default AbstractStorage;
