import { HookMachine, useEffect } from '../../../../src/HookMachine';
// import Fryer from './Fryer';

import { StoreData } from './Store';
// import { Machine } from '../../../../src/Machine';
import Fryer from './Fryer';

type EmployeeStates = 'offDuty' | 'idle' | 'gettingPotatoes' | 'cuttingPotatoes' | 'managingFryer';

// interface State {
//     <StatesListT, StateDataT, MachineDataT>(
//         transition: (state: StatesListT) => void,
//         machineData: MachineDataT,
//         setMachineData: (updatedData: Partial<MachineDataT>) => void
//     ): StateDataT;
// }

type State<StatesListT, StateDataT, MachineDataT> = (
    transition: (state: StatesListT) => void,
    machineData: MachineDataT,
    setMachineData: (updatedData: Partial<MachineDataT>) => void
) => StateDataT;

type ClockedOutState = State<EmployeeStates, { clockIn: Function }, {}>;

type ClockedInState = State<EmployeeStates, { clockOut: () => void }, StoreData>;
type IdleState = State<
    EmployeeStates,
    {
        clockOut: () => void;
        getPotatoes: () => void;
        cutPotatoes: () => void;
        manageFryer: () => void;
    },
    StoreData
>;

const OffDuty: ClockedOutState = transition => {
    return {
        clockIn: () => transition('idle'),
    };
};

const Idle: IdleState = transition => {
    return {
        clockOut: () => transition('offDuty'),
        getPotatoes: () => transition('gettingPotatoes'),
        cutPotatoes: () => transition('cuttingPotatoes'),
        manageFryer: () => transition('managingFryer'),
        // workRegister: () => transition(TakingOrders),
        // cleanTables: () => transition(CleaningTables),
    };
};

const CuttingPotatoes: ClockedInState = (transition, machineData, setMachineData) => {
    if (machineData.uncutPotatoes === 0) {
        throw new Guard('No potatoes to cut!');
    }

    setMachineData({
        uncutPotatoes: machineData.uncutPotatoes - 1,
    });
    useEffect(() => {
        let done: boolean = false;
        const task = setTimeout(() => {
            done = true;
            setMachineData({
                cutPotatoes: machineData.cutPotatoes + 1,
            });
            transition('idle');
        }, 10000);
        return () => {
            if (done === false) {
                setMachineData({
                    uncutPotatoes: machineData.uncutPotatoes + 1,
                });
                clearTimeout(task);
            }
        };
    }, []);

    return {
        clockOut: transition('offDuty'),
    };
};

const GettingPotatoes: ClockedInState = transition => {
    useEffect(() => {
        const timeout = setTimeout(() => {
            setMachineData({
                uncutPotatoes: machineData.uncutPotatoes + 1,
            });
        }, 3000);
        return () => {
            clearTimeout(timeout);
        };
    }, []);

    return {
        clockOut: transition('offDuty'),
    };
};

const ManagingFryer: ClockedInState = transition => {
    const { fryer } = useMachineData();

    if (!fryer) {
        throw Guard('idle', 'No fryer!');
    }

    useEffect(() => {
        fryer.turnOn();

        const done = (newState: FryerStates) => {
            if (newState === 'done') {
                transition('idle');
                fryer.off('transition', done);
            }
        };
        fryer.on('transition', done);
    }, []);

    return {
        clockOut: () => transition('offDuty'),
    };
};

const states = {
    offDuty: OffDuty,
    idle: Idle,
    cuttingPotatoes: CuttingPotatoes,
    gettingPotatoes: GettingPotatoes,
    managingFryer: ManagingFryer,
};

export default class Employee extends Machine<EmployeeStates, MachineDataT> {}
