import { State, Machine } from 'idaho';

class Off extends State<Fryer> {
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

class On extends State<Fryer> {
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

class Ready extends State<Fryer> {
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

class Cooking extends State<Fryer> {
    timeout: number | undefined;
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

class BasketFullOfGarbage extends State<Fryer> {
    clean = () => {
        this.machine.setData({
            potatoes: 0,
        });
        this.machine.transition(Ready);
    };
}

class BasketFullOfFries extends State<Fryer> {
    takeFries = (count: number) => {
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

type FryerStates = Off | On | Ready | Cooking | BasketFullOfGarbage | BasketFullOfFries;

export default class Fryer extends Machine<FryerStates, { potatoes: number }> {
    initialState = Off;
    maxPotatoes = 8;
    data = {
        potatoes: 0,
    };

    turnOn: () => {};
    turnOff: () => {};
}
