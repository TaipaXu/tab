abstract class AbstractStorage {
    abstract get<T>(key: string, defaultValue: T | undefined): Promise<T | undefined>;

    abstract set(data: Record<string, unknown>): Promise<void>;
}

export default AbstractStorage;
