import { State, Machine } from 'ohio';

// traffic lights need timers...
class TimedState extends State {
    effects = [
        () => {
            const timeout = setTimeout(
                () => this.machine.transition(this.next),
                this.duration * 1000
            );
            return () => {
                clearTimeout(timeout);
            };
        },
    ];
}

// a standard street light
export class Green extends TimedState {
    next = Yellow;
    duration = 25;
}

export class Yellow extends TimedState {
    next = Red;
    duration = 5;
}

export class Red extends TimedState {
    next = () => Green;
    duration = 30;
}

const trafficLightMachine = new Machine(Green);
