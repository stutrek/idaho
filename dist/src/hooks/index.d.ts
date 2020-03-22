export declare class MachineHooksState {
    refreshMachine: () => void;
    constructor(refreshMachine: () => void);
    items: Hook[];
    index: number;
    useHistory: boolean;
}
declare abstract class Hook {
    abstract remove?: () => void;
    abstract dependencies?: any[];
    abstract handleCall: Function;
}
export declare const machineHooksStack: MachineHooksState[];
export declare const useStateData: <T>(defaultValue: T) => [T, (newValue: T) => void];
export declare const useEffect: (effect: () => void | (() => void), dependencies: any[]) => void;
export declare const useMemo: <T>(callback: () => T, dependencies: any[]) => T;
export declare const useHistory: (value?: boolean) => void;
export {};
