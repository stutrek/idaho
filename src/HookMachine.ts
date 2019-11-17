import { EventEmitter } from 'events';

const shallowCompare = (obj1: any, obj2: any) =>
    Object.keys(obj1).length === Object.keys(obj2).length &&
    Object.keys(obj1).every(key => obj1[key] === obj2[key]);

interface MachineHooksState {
    items: any[];
    index: number;
    refreshMachine: () => void;
}

class StateHook<T> {
    constructor(private refreshMachine: () => void, public value: T) {}
    setValue = (newVal: T) => {
        this.value = newVal;
        this.refreshMachine();
    };
    remove: undefined;
    handleCall = (): [T, (newValue: T) => void] => [this.value, this.setValue];
}

class EffectHook {
    constructor(
        private refreshMachine: () => void,
        effect: () => () => void | void,
        private guards: any[]
    ) {
        this.cleanup = effect();
    }
    private cleanup: () => void | undefined;
    remove = () => {
        if (this.cleanup !== undefined) {
            this.cleanup();
        }
    };
    handleCall(effect: () => () => void | void, guards: any[]) {
        if (this.guards.length !== guards.length) {
            this.remove();
            this.cleanup = effect();
            this.guards = guards;
        }
        for (let i = 0; i < guards.length; i++) {
            if (Object.is(guards[i], this.guards[i]) === false) {
                this.remove();
                this.cleanup = effect();
                this.guards = guards;
                break;
            }
        }
    }
}

const machineHooksStack: MachineHooksState[] = [];
const getCurrentHookState = () => machineHooksStack[machineHooksStack.length - 1];
const incrementCurrentHook = () => {
    const machineHook = getCurrentHookState();
    machineHook.index += 1;
};

export const useState = <T>(defaultValue: T): [T, (newValue: T) => void] => {
    if (getCurrentHookState() === undefined) {
        throw new Error('There was no hook state, this indicates a problem in Idaho.');
    }

    const { items, index, refreshMachine } = getCurrentHookState();
    incrementCurrentHook();
    if (items.length <= index) {
        items[index] = new StateHook(refreshMachine, defaultValue);
    }
    const hook = items[index] as StateHook<T>;

    return hook.handleCall();
};

export const useEffect = (effect: () => () => {} | undefined, guards: any[]): void => {
    if (getCurrentHookState() === undefined) {
        throw new Error('There was no hook state, this indicates a problem in Idaho.');
    }

    const { items, index, refreshMachine } = getCurrentHookState();
    incrementCurrentHook();
    if (items.length <= index) {
        items[index] = new EffectHook(refreshMachine, effect, guards);
    } else {
        const hook = items[index] as EffectHook;
        hook.handleCall(effect, guards);
    }
};

interface Current<StatesMapT> {
    name: keyof StatesMapT;
    data: any;
}

interface Events<StatesMapT> {
    change: Current<StatesMapT>;
    statechange: Current<StatesMapT>;
    datachange: Current<StatesMapT>;
}

export class HookMachine<StatesMapT, MachineDataT> {
    constructor(
        public states: StatesMapT,
        initialState: keyof StatesMapT,
        public data: MachineDataT
    ) {
        const emitter = new EventEmitter();
        this.on = emitter.on.bind(emitter);
        this.off = emitter.off.bind(emitter);
        this.emit = emitter.emit.bind(emitter);

        this.current = {
            name: initialState,
            data: this.runState(initialState),
        };
    }

    current: {
        name: keyof StatesMapT;
        data: any;
    };

    on: <K extends keyof Events<StatesMapT>>(
        eventName: K,
        callback: (event: Current<StatesMapT>) => void
    ) => void;
    off: <K extends keyof Events<StatesMapT>>(
        eventName: K,
        callback: (event: Current<StatesMapT>) => void
    ) => void;
    private emit: <K extends keyof Events<StatesMapT>>(
        eventName: K,
        event: Current<StatesMapT>
    ) => void;

    private runState = (state: keyof StatesMapT) => {
        this.hooksState.index = 0;
        machineHooksStack.push(this.hooksState);
        // @ts-ignore
        const updated = this.states[state](this.transition, this.data);
        machineHooksStack.pop();
        return updated;
    };

    transition = (nextState: keyof StatesMapT = this.current.name) => {
        if (nextState !== this.current.name) {
            for (const { remove } of this.hooksState.items) {
                if (remove !== undefined) {
                    remove();
                }
            }
            this.hooksState.items.length = 0;
        }

        const updated = this.runState(nextState);

        const stateChanged = nextState !== this.current.name;
        const dataChanged = shallowCompare(updated, this.current.data) === false;

        if (stateChanged || dataChanged) {
            this.current = {
                name: nextState,
                data: updated,
            };
            // do observable thing
        }

        if (stateChanged) {
            this.emit('statechange', this.current);
        }
        if (dataChanged) {
            this.emit('datachange', this.current);
        }
        if (stateChanged || dataChanged) {
            this.emit('change', this.current);
        }
    };

    private hooksState: MachineHooksState = {
        items: [],
        index: 0,
        refreshMachine: () => this.transition(),
    };
}
