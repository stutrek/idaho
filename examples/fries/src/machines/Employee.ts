import { Machine, State } from 'idaho';
import Fryer from './Fryer';

import Store from './Store';

class OffDuty extends State<Employee> {
    clockIn = () => this.machine.transition(Idle);
}

class Idle extends State<Employee> {
    getPotatoes = () => this.machine.transition(GettingPotatoes);
    cutPotatoes = () => this.machine.transition(CuttingPotatoes);
    manageFryer = () => this.machine.transition(Frying);
    // workRegister = () => this.machine.transition(TakingOrders);
    cleanTables = () => this.machine.transition(CleaningTables);
}

class CuttingPotatoes extends State<Employee> {
    effects = [
        (machine: Employee) => {
            if (machine.parent === undefined) {
                throw new Error('Employee must be at a restaurant!');
            }

            if (machine.parent.data.potatoes === 0) {
                throw new Error('There are no potatoes!');
            }
            machine.parent.setData({
                potatoes: machine.parent.data.potatoes - 1,
            });
            let done: boolean = false;
            const task = setTimeout(() => {
                done = true;
                machine.parent.setData({
                    cutPotatoes: machine.data.cutPotatoes + 1,
                });
                machine.transition(Idle);
            }, 10000);
            return () => {
                if (done === false) {
                    machine.parent.setData({
                        potatoes: machine.parent.data.potatoes + 1,
                    });
                    clearTimeout(task);
                }
            };
        },
    ];
}
class GettingPotatoes extends State<Employee> {
    effects = [
        machine => {
            const timeout = setTimeout(() => {
                machine.parent.setData({
                    potatoes: machine.parent.data.potatoes + 1,
                });
            }, 3000);
        },
    ];
}

class ManagingFryer extends State<Employee> {
    constructor(machine: Employee, fryer: Fryer) {
        super(machine);
        if ('turnOn' in fryer.state) {
            fryer.state.turnOn();
        } else if ('clean' in fryer.state) {
            fryer.state.clean();
        }
    }
}

type EmployeeStates = OffDuty | Idle | CuttingPotatoes | GettingPotatoes | ManagingFryer;

export default class Employee extends Machine<EmployeeStates, Store> {
    initialState = Idle;
}
