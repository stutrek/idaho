import { HookMachine, useEffect } from 'idaho';

import Fryer from './Fryer';
import createEmployee from './EmployeeHooks';
// import Table from './Table';

type StateList = 'open' | 'closed';

type RestaurantState<T> = (
    transition: (state: StateList) => void,
    machineData: RestaurantData,
    setMachineData: (updatedData: Partial<RestaurantData>) => void
) => T;

const open: RestaurantState<{ close: () => void }> = (transition, machineData, setMachineData) => {

    const employees = 

    return {
        close: () => transition('closed'),
    };
};

const closed: RestaurantState<{ open: () => void }> = (transition, machineData, setMachineData) => {
    return {
        open: () => transition('open'),
    };
};

export type RestaurantData = {
    uncutPotatoes: number;
    cutPotatoes: number;
    // fryers: Fryer[];
    employees: Employee[];
};

const states = {
    open,
    closed,
};

export function createRestaurant() {
    const data: RestaurantData = {
        uncutPotatoes: 0,
        cutPotatoes: 0,
        employees: [],
    };

    const restaurant = new HookMachine(states, 'closed', data);
}
