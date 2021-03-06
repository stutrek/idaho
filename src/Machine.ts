import { EventEmitter } from 'events';
import { machineHooksStack, MachineHooksState } from './hooks';
import { Final } from './hooks/classes';
import { Control } from './ControlObject';

interface Events<StatesMapT extends StateMap, MachineDataT, FinalStateT> {
    change: Machine<StatesMapT, MachineDataT, FinalStateT>;
    statechange: Machine<StatesMapT, MachineDataT, FinalStateT>;
    datachange: Machine<StatesMapT, MachineDataT, FinalStateT>;
}

type StateFunction = (controller: any) => any;
export type StateMap = {
    [index: string]: StateFunction;
};

export class Machine<StatesMapT extends StateMap, MachineDataT, FinalStateT = never> {
    constructor(
        public states: StatesMapT,
        initialState: keyof StatesMapT,
        public data?: MachineDataT
    ) {
        const internalPromise = new Promise<FinalStateT>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
        this.then = internalPromise.then.bind(internalPromise);
        this.catch = internalPromise.catch.bind(internalPromise);
        this.finally = internalPromise.finally.bind(internalPromise);

        const emitter = new EventEmitter();
        this.on = emitter.on.bind(emitter);
        this.off = emitter.off.bind(emitter);
        this.emit = emitter.emit.bind(emitter);

        this.transition(initialState);
    }

    stateName: keyof StatesMapT;
    state: ReturnType<StatesMapT[keyof StatesMapT]>;
    private stateArgs: any[] = [];

    private isTransitioning = false;

    histories = new Map<keyof StatesMapT, MachineHooksState>();

    then: (cb: (data: FinalStateT) => any, errorCb: (error: Error) => any) => void;
    catch: (cb: (error: Error) => any) => void;
    finally: () => void;

    private resolve: (data: FinalStateT) => void = () => undefined;
    private reject: (data: FinalStateT) => void = () => undefined;
    private resolved = false;
    private rejected = false;

    on: <K extends keyof Events<StatesMapT, MachineDataT, FinalStateT>>(
        eventName: K,
        callback: (event: Machine<StatesMapT, MachineDataT, FinalStateT>) => void
    ) => void;
    off: <K extends keyof Events<StatesMapT, MachineDataT, FinalStateT>>(
        eventName: K,
        callback: (event: Machine<StatesMapT, MachineDataT, FinalStateT>) => void
    ) => void;
    private emit: <K extends keyof Events<StatesMapT, MachineDataT, FinalStateT>>(
        eventName: K,
        event: Machine<StatesMapT, MachineDataT, FinalStateT>
    ) => void;

    setData(newData: Partial<MachineDataT>) {
        this.data = {
            ...this.data,
            ...newData,
        };
        if (this.isTransitioning === false) {
            this.emit('datachange', this);
            this.emit('change', this);
        }
    }

    private runState = (
        state: StatesMapT[keyof StatesMapT],
        control: Control<StatesMapT, MachineDataT, FinalStateT>,
        args: any = undefined
    ): any => {
        if (this.rejected || this.resolved) {
            return;
        }
        this.hooksState.index = 0;
        let updated: any;
        try {
            machineHooksStack.push(this.hooksState);
            // @ts-ignore
            updated = state(control, ...args);
            machineHooksStack.pop();
        } catch (e) {
            this.rejected = true;
            this.reject(e);
            throw e;
        }
        return updated;
    };

    transition = (nextStateName: keyof StatesMapT, ...args: any[]) => {
        if (this.rejected || this.resolved) {
            return;
        }
        this.isTransitioning = true;
        let isStateChange = nextStateName !== this.stateName;
        this.stateArgs = args;
        const stateData = this.data;

        const control = new Control(this, nextStateName);

        if (isStateChange) {
            for (const { remove, dependencies } of this.hooksState.items) {
                if (remove !== undefined) {
                    remove();
                    if (this.hooksState.useHistory && dependencies !== undefined) {
                        // make sure the dependencies won't stop it in the next run
                        dependencies.length = 0;
                        dependencies.push({});
                    }
                }
            }
            if (this.hooksState.useHistory) {
                this.histories.set(this.stateName, this.hooksState);
            }
            if (this.histories.has(nextStateName)) {
                this.hooksState = this.histories.get(nextStateName)!;
            } else {
                this.hooksState = new MachineHooksState(() => {
                    this.state = this.runState(this.states[nextStateName], control, args);
                    this.emit('change', this);
                });
            }
        }

        const nextStateValue = this.runState(this.states[nextStateName], control, args);

        if (control.isActive) {
            this.isTransitioning = false;
            this.state = nextStateValue;
            this.stateName = nextStateName;
            const dataChanged = this.data !== stateData;

            if (isStateChange) {
                this.emit('statechange', this);
            }

            if (dataChanged) {
                this.emit('datachange', this);
            }

            this.emit('change', this);

            if (nextStateValue instanceof Final) {
                this.resolved = true;
                this.resolve(nextStateValue.value);
            }
        }
    };

    private hooksState = new MachineHooksState(() => {
        this.transition(this.stateName, ...this.stateArgs);
    });
}
