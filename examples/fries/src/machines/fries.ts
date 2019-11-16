import { Machine, State } from 'idaho';

class FrenchFryRestaurant {
    customers = {
        waitingToOrder: [],
        waitingForFries: [],
    };
}

class OffDuty extends State {
    clockIn = () => this.machine.transition(Idle);
}
class Idle extends State {
    getPotatoes = () => this.machine.transition(GettingPotatoes);
    cutPotatoes = () => this.machine.transition(CuttingPotatoes);
    manageFryer = () => this.machine.transition(Frying);
    workRegister = () => this.machine.tranition(TakingOrders);
    cleanTables = () => this.machine.transition(CleaningTables);
}

class CuttingPotatoes extends State {
    effects = [
        machine => {
            if (machine.parent.data.potatoes === 0) {
                throw new Error('There are no potatoes!');
            }
            machine.parent.setData({
                potatoes: machine.parent.data.potatoes - 1,
            });
            let task = setTimeout(() => {
                task = undefined;
                machine.parent.setData({
                    cutPotatoes: machine.data.cutPotatoes + 1,
                });
                machine.transition(Idle);
            }, 10000);
            return () => {
                if (task) {
                    machine.parent.setData({
                        potatoes: machine.parent.data.potatoes + 1,
                    });
                    clearTimeout(task);
                }
            };
        },
    ];
}
class GettingPotatoes extends State {
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

class ManagingFryer extends State {
    constructor(parent: Machine<any, any>, fryer: Machine<any, any>) {
        super(parent);
        if (fryer.current instanceof Off) {
            fryer.current.turnOn();
        } else if (fryer.current instanceof BasketFullOfGarbage) {
            fryer.clean();
        }
    }
}

type EmployeeStates = OffDuty | Idle | CuttingPotatoes | GettingPotatoes | ManagingFryer;

class Employee extends Machine<EmployeeStates, undefined> {}

/* fryer */

class Off extends State {
    turnOn = () => this.machine.transition(On);
    effects = [
        machine => {
            const interval = setInterval(() => {
                if (machine.data.temperature > 0) {
                    machine.setData({
                        temperature: machine.data.temperature - 1,
                    });
                } else {
                    clearInterval(interval);
                }
            }, 1000);
            return () => {
                clearInterval(interval);
            };
        },
    ];
}

class On extends State {
    turnOff = () => this.machine.transition(Off);
    effects = [
        machine => {
            let interval;
            if (machine.data.temperature === 100) {
                machine.transition(Ready);
            } else {
                interval = setInterval(() => {
                    if (machine.data.temperature === 99) {
                        clearInterval(interval);
                    }
                    machine.setData({
                        temperature: machine.data.temperature + 1,
                    });
                }, 1000);
            }
            return () => clearInterval(interval);
        },
    ];
}

class Ready extends State {
    turnOff = () => this.machine.transition(Off);
    addPotato = () => {
        this.machine.setData({
            potatoes: this.machine.data.potatoes + 1,
        });
        if (this.machine.data.potatoes === this.machine.maxPotatoes) {
            this.machine.transition(Cooking);
        }
    };
    cook = () => {
        if (this.machine.data.potatoes === 0) {
            throw new Error('No potatoes to cook!');
        }
        this.machine.transition(Cooking);
    };
}

class Cooking extends State {
    cancel = () => {
        clearTimeout(this.timeout);
        this.machine.transition(BasketFullOfGarbage);
    };
    effects = [
        machine => {
            machine.current.timeout = setTimeout(() => {
                this.machine.transition(BasketFullOfFries);
            }, 20000);
        },
    ];
}

class BasketFullOfGarbage extends State {
    clean = () => {
        this.machine.setData({
            potatoes: 0,
        });
        this.machine.transition(Ready);
    };
}

class BasketFullOfFries extends State {
    takeFries = count => {
        if (this.machine.data.potatoes < count) {
            throw new Error('Not enough fries!');
        }
        this.machine.setData({
            potatoes: this.machine.potatoes - count,
        });
        if (this.machine.potatoes === 0) {
            this.machine.trasition(Ready);
        }
    };
}

class Fryer extends Machine {
    maxPotatoes = 8;
    data = {
        potatoes: 0,
    };
}

/* table */
class Table extends Machine {}

class Available extends State {
    occupy = this.machine.transition(Occupied);
}
class Occupied extends State {
    leave = this.machine.transition(Dirty);
}
class Dirty extends State {
    clean = () => this.machine.transition(Available);
}
