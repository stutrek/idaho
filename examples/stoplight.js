const { State, Machine } = require('../dist/idaho.umd.js');

// a standard street light
const Green = (exports.Green = class Green extends State {
    light = 'green';
});

const Yellow = (exports.Yellow = class Yellow extends State {
    light = 'yellow';
});

const Red = (exports.Red = class Red extends State {
    light = 'red';
});

class Off extends State {
    light = undefined;
}

class EastWest extends State {
    effects = [
        () => {
            this.machine.parent.north.transition(Red);
            this.machine.parent.south.transition(Red);
            this.machine.parent.east.transition(Green);
            this.machine.parent.west.transition(Green);

            let timeout = setTimeout(() => {
                this.machine.parent.east.transition(Yellow);
                this.machine.parent.west.transition(Yellow);

                timeout = setTimeout(() => {
                    // transition machine to the other direction
                    this.machine.transition(NorthSouth);
                }, 5000);
            }, 25000);

            return () => {
                clearTimeout(timeout);
            };
        },
    ];
}

class NorthSouth extends State {
    effects = [
        () => {
            this.machine.parent.north.transition(Green);
            this.machine.parent.south.transition(Green);
            this.machine.parent.east.transition(Red);
            this.machine.parent.west.transition(Red);

            let timeout = setTimeout(() => {
                this.machine.parent.north.transition(Yellow);
                this.machine.parent.south.transition(Yellow);

                timeout = setTimeout(() => {
                    // transition machine to the other direction
                    this.machine.transition(EastWest);
                }, 5000);
            }, 25000);

            return () => {
                clearTimeout(timeout);
            };
        },
    ];
}

class NormalOperation extends State {
    static useHistory = true;
    timer = new Machine(NorthSouth, this.machine); // second argument sets the parent machine
}

class BlinkingRed extends State {
    data = {
        on: true,
    };

    effects = [
        () => {
            const interval = setInterval(() => {
                const NextState = this.data.on ? Off : Red;
                this.machine.north.transition(NextState);
                this.machine.south.transition(NextState);
                this.machine.east.transition(NextState);
                this.machine.west.transition(NextState);
                this.setData({
                    on: !this.data.on,
                });
            }, 3000);

            return () => {
                clearInterval(interval);
            };
        },
    ];
}

class Emergency extends State {
    constructor(machine, direction) {
        super(machine);
        this.emergencyDirection = direction;
    }
    effects = [
        () => {
            this.machine.north.transition(Red);
            this.machine.south.transition(Red);
            this.machine.east.transition(Red);
            this.machine.west.transition(Red);
            if (this.machine[this.emergencyDirection]) {
                this.machine[this.emergencyDirection].transition(Green);
            }
        },
    ];
}

class LightTriplet extends Machine {
    constructor(initialState, parentMachine, direction) {
        super(initialState, parentMachine);
        this.direction = direction;
    }
}

// this is how a street light normally works
exports.StreetLightSystem = class StreetLightSystem extends Machine {
    static initialState = BlinkingRed;

    north = new LightTriplet(Green, this, 'north'); // passing in this allows it to trigger child events
    south = new LightTriplet(Green, this, 'south');
    east = new LightTriplet(Red, this, 'east');
    west = new LightTriplet(Red, this, 'west');

    powerOutage = () => {
        this.transition(BlinkingRed);
    };

    resumeNormalOperation = () => {
        this.transition(NormalOperation);
    };

    receiveEmergency = direction => {
        this.transition(Emergency, direction);
    };
};
