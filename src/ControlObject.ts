import { Machine } from './Machine';

type PropertyReturnTypes<T> = T[keyof T] extends (a: any) => any ? ReturnType<T[keyof T]> : never;

type PropertyParameterTypes<T> = T[keyof T] extends (a: any) => any
    ? Parameters<T[keyof T]>
    : never;

export class Control<StatesMapT, DataT, FinalStateT> {
    constructor(private machine: Machine<StatesMapT, DataT, FinalStateT>) {
        this.data = machine.data;
        this.setData = (data: Partial<DataT>) => {
            if (this.isActive === false) {
                throw new Error(
                    'Tried to transition from a state that Idaho has already exited. This is a noop, but could indicate a bug.'
                );
            }
            machine.setData(data);
        };
        this.previousState = machine.state;
        this.previousStateName = machine.stateName;
    }

    data: DataT;
    setData: (newData: Partial<DataT>) => void;
    previousState: PropertyReturnTypes<StatesMapT>;
    previousStateName: keyof StatesMapT;
    isActive = true;

    transition = (nextState: keyof StatesMapT, ...args: any[]) => {
        if (this.isActive === false) {
            throw new Error(
                'Tried to transition from a state that Idaho has already exited. This is a noop, but could indicate a bug.'
            );
        }
        this.isActive = false;
        this.machine.transition(nextState, ...args);
    };
}
