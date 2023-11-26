import { EventTarget } from 'cc';

export type PlayerMoveEvent = {
    kind: 'player_moved',
    x1: number,
    y1: number,
    x2: number,
    y2: number,
};
export type AnyEvent = {
    kind: 'any'
};
type Config<Events extends { kind: string }> = {
    [E in Events as E['kind']]: E;
};
type Kinds<Events extends { kind: string }> = Events['kind'];
type EventKind = Kinds<PlayerMoveEvent | AnyEvent>;
type EventConfig = Config<PlayerMoveEvent | AnyEvent>;

export class EventManager extends EventTarget {

    private static _instance: EventManager | null = null;
    public static get instance(): EventManager {
        if (this._instance == null) {
            this._instance = new EventManager();
        }
        return this._instance;
    }

    public static on<T extends EventKind>(
        type: T,
        callback: (event: EventConfig[T]) => void,
        thisArg?: any,
        once?: boolean
    ): (event: EventConfig[T]) => void {
        return EventManager.instance.on(type, callback, thisArg, once);
    }

    public static once<T extends EventKind>(
        type: T,
        callback: (event: EventConfig[T]) => void,
        thisArg?: any
    ): (event: EventConfig[T]) => void {
        return EventManager.instance.once(type, callback, thisArg);
    }

    public static off<T extends EventKind>(
        type: T,
        callback?: (event: EventConfig[T]) => void,
        thisArg?: any
    ): void {
        EventManager.instance.off(type, callback, thisArg);
    }

    public static targetOff(typeOrTarget: any): void {
        EventManager.instance.targetOff(typeOrTarget);
    }

    public static removeAll(typeOrTarget: any): void {
        EventManager.instance.removeAll(typeOrTarget);
    }

    public static hasEventListener<T extends EventKind>(type: T, callback?: (event: EventConfig[T]) => void, target?: any): boolean {
        return EventManager.instance.hasEventListener(type, callback, target);
    }

    public static emit<T extends EventKind>(type: T, arg?: EventConfig[T]): void {
        EventManager.instance.emit(type, arg);
    }
}

