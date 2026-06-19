export interface RuntimeMessage {
    type: string;
    data?: unknown;
    tabId?: number;
    windowId?: number;
}

export const isRuntimeMessage = (message: unknown): message is RuntimeMessage => {
    if (typeof message !== 'object' || message === null || !('type' in message)) {
        return false;
    }

    return typeof (message as { type?: unknown }).type === 'string';
};
