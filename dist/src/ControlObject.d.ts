import { Machine, StateMap } from './Machine';
export declare class Control<StatesMapT extends StateMap, DataT, FinalStateT> {
    private machine;
    constructor(machine: Machine<StatesMapT, DataT, FinalStateT>, targetState: keyof StatesMapT);
    data: DataT;
    setData: (newData: Partial<DataT>) => void;
    stateName: keyof StatesMapT;
    previousState: ReturnType<StatesMapT[keyof StatesMapT]>;
    previousStateName: keyof StatesMapT;
    isActive: boolean;
    transition: (nextState: keyof StatesMapT, ...args: any[]) => void;
}
