import { EventEmitter } from 'events';
import { machineHooksStack, MachineHooksState } from './hooks';
import { Guard, Final } from './hooks/classes';
import { Control } from './ControlObject';

export { useState, useEffect, useMemo, useHistory } from './hooks';

interface Current<StatesMapT> {
    name: keyof StatesMapT;
    data: any;
}

interface Events<StatesMapT> {
    change: Current<StatesMapT>;
    statechange: Current<StatesMapT>;
    datachange: Current<StatesMapT>;
}

export class Machine<StatesMapT, MachineDataT, FinalStateT = never> {
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

    currentName: keyof StatesMapT;
    current: any;
    private currentArgs: any[] = [];

    histories = new Map<keyof StatesMapT, MachineHooksState>();

    then: (cb: (data: FinalStateT) => any, errorCb: (error: Error) => any) => void;
    catch: (cb: (error: Error) => any) => void;
    finally: () => void;

    private resolve: (data: FinalStateT) => void = () => undefined;
    private reject: (data: FinalStateT) => void = () => undefined;

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

    setData(newData: Partial<MachineDataT>) {
        this.data = {
            ...this.data,
            ...newData,
        };
    }

    private runState = (
        state: StatesMapT[keyof StatesMapT],
        control: Control<StatesMapT, MachineDataT, FinalStateT>,
        args: any = undefined
    ): any => {
        this.hooksState.index = 0;
        let updated: any;
        try {
            machineHooksStack.push(this.hooksState);
            // @ts-ignore
            updated = state(control, ...args);
            machineHooksStack.pop();
        } catch (e) {
            this.reject(e);
            throw e;
        }
        return updated;
    };

    transition = (nextStateName: keyof StatesMapT, ...args: any[]) => {
        const control = new Control(this);

        let isStateChange = nextStateName !== this.currentName;
        this.currentArgs = args;

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
                this.histories.set(this.current.name, this.hooksState);
            }
            if (this.histories.has(nextStateName)) {
                this.hooksState = this.histories.get(nextStateName)!;
            } else {
                this.hooksState = new MachineHooksState(() => {
                    this.runState(this.states[nextStateName], control, ...args);
                });
            }
        }

        const nextStateValue = this.runState(this.states[nextStateName], control, args);

        if (control.isActive) {
            this.current = nextStateValue;
            this.currentName = nextStateName;

            if (isStateChange) {
                this.emit('statechange', this.current);
                this.emit('change', this.current);
            }

            if (nextStateValue instanceof Final) {
                this.resolve(nextStateValue.value);
            }
        }
    };

    private hooksState = new MachineHooksState(() => {
        this.transition(this.currentName, ...this.currentArgs);
    });
}
