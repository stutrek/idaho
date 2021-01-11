import { Machine, StateMap } from './src/Machine';
export declare function useMachineStateName<StatesT extends StateMap, DataT, FinalT>(machine: Machine<StatesT, DataT, FinalT>): keyof StatesT;
export declare function useMachineState<StatesT extends StateMap, DataT, FinalT>(machine: Machine<StatesT, DataT, FinalT>): ReturnType<StatesT[keyof StatesT]>;
export declare function useMachineData<StatesT extends StateMap, DataT, FinalT>(machine: Machine<StatesT, DataT, FinalT>): DataT;
export declare function useMachine<StatesT extends StateMap, DataT, FinalT>(machine: Machine<StatesT, DataT, FinalT>): [keyof StatesT, StatesT[keyof StatesT]];
