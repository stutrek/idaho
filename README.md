# Idaho

Idaho is a state machine with functional aspects. Each state is a function that returns an object containing its transitions and any values associated with this state. States are functional, but machines are stateful.

It aims implement state charts using JavaScript idioms, using code rather than configuration. Everything that's possible with XState and other state machine/state chart libraries should be possible with Idaho.

-   States are functions rather than configuration.
-   States have a React-like hooks API for data and side effects.
-   Transitions are written as functions rather than configuration.
-   Machines have data that is persists through state transitions.
-   Machines are event emitters.
-   Machines are promises that resolve when the machine reaches a final state.
-   Machines have a single state, ParallelMachines have parallel states.

## Basic Usage

```javascript
import { Machine } from 'idaho';

const off = (control) => {
    return {
        turnOn: () => control.transition('on')
    }
}

const on = (control) => {
    return {
        turnOff: () => control.transition('off')
    }
}

const states = { off, on };

// It will use the first state as the initial state
const switch = new Machine({states});
console.log(switch.stateName) // off

switch.on('change', (machine) => {
    console.log(machine.stateName);
});

switch.state.turnOn();
console.log(switch.stateName) // on

```

## Machines

Machines contain the current state. They are event emitters and also promises that resolve when the machine reaches a final state.

### Creating a machine

Machines are created with a object of key/value pairs representing the states this machine can transition into, and an object of initial data, if any.

```javascript
const machine = new Machine(states, machineData);
```

#### Arguments

-   `states` - an object of states.
-   `machineData` - the initial data of the machine.

### Properties

-   `machine.data` - the data that is currently stored on the machine. This will survive state transitions. When new data becomes available this object will be replaced instead of being mutated.
-   `machine.setData(partialData)` - takes an object that will be spread on the current state to provide the next state, similar to React's setState.
-   `machine.state` - the object returned from the current state function.
-   `machine.stateName` - the string name of the current state.
-   `machine.then()/machine.catch()/machine.finally()` - machines are promises. These methods work just like any other promise. They will be resolved with data from a final state, see elsewhere in this document.
-   `machine.on()/machine.off()` - machines are also event emitters. See events below for more information.

### Events

All events provide the machine as the only argument.

-   `statechange` - when the state changes.
-   `datachange` - when data changes.
-   `change` - when either state, data, or both change.

## States

States are functions that return an object. They are called with a control object that allows the state to control the machine. For each state transition, make a function that calls `control.transition('nextState')`. States can also have internal data, which is created with a React-hook like API.

When calling a `control.transition`, you may pass in additional arguments, which will be passed into the state.

```javascript
const exampleState = (control, firstName, lastName) => {
    console.log(firstName);
    return {
        firstName,
        lastName,
        next: () => control.transition('nextState'),
        updateData: (first, last) => control.transition('exampleState', first, last),
    };
};
```

## Control Object

The control object passed to states allows you to read from and change the status of the machine.

-   `control.transition(stateName, ...args)` - transitions the machine to a new state.
-   `control.data` - an object of data that will persist through state transitions.
-   `control.setData({partial: 'data'})` - Sets machine data. State will be rerun with new values.
-   `control.state` - the previous state object.
-   `control.stateName` - the previous state name.

## State Hooks

These work just like React hooks. The simpest is `useStateData`, which is similar to `useState` in React. The name was changed because it's confusing for states to have state.

```javascript
const stateWithData = (control) => {
    const [data, setData] = useStateData(undefined);

    return {
        data
        updateData: (newData) => setData(newData),
        next: () => control.transition('next')
    }
}
```

-   `const [data, setData] = useStateData('propName', 'defaultValue')` - store state data on the machine. The state function will run again with new data.
-   `useEffect(effectFn, [dependencies])` - runs `effectFn` when dependencies change. `effectFn` should return a function to clean up after itself.
-   `const memoizedData = useMemo(creatorFn, [dependencies])` - runs creator function and returns the value when dependencies change.
-   `useHistory(true)` - this makes this state a history state. The value of all items in useState will be preserved if the machine switches out of then back into this state.

### Hooks Example

This machine counts the number of clicks, resetting every 5 seconds.

```javascript
import { Machine, useStateData, useEffect } from 'idaho';

const counter = control => {
    const [clicks, setClicks] = useStateData(0);

    useEffect(() => {
        const interval = setInterval(() => setClicks(0), 5000);
        return () => {
            clearInterval(interval);
        };
    });

    return {
        clicks,
        sendClick: () => {
            if (clicks < 10) {
                setClicks(clicks + 1);
            } else {
                control.transition('finished');
            }
        },
    };
};

const finished = () => new Final('10 clicks counted');

const timer = new Machine({
    counting,
    finished,
});
```

### Setting machine data

```javascript
const on = (control) => {
    control.setData({
        lastModified: new Date()
    });
    return {
        turnOff = () => control.transition('off')
    };
};

const off = (control) => {
    control.setData({
        lastModified: new Date()
    });
    return {
        turnOn = () => control.transition('on')
    };
};

const switch = new Machine({off, on}, { lastModified: null })

console.log(switch.state.lastModified);
```

## More Examples

### Passing arguments to a state

The rest of the arguments to the transition function will be used as arguments to the state

```javascript
import { Machine, useEffect } from 'idaho';

const idle = control => ({
    cookEgg: egg => control.transition('cooking', egg),
});

const cooking = (control, egg) => {
    if (egg.isRotten) {
        throw new Error('egg is rotten');
    }

    return {
        cancel: () => control.transition('cancelled'),
        finished: () => control.transition('finished'),
    };
};

const eggCooker = new Machine({
    idle,
    cooking,
    cancelled,
    finished,
});

const egg = {
    isRotten: false,
};

eggCooker.cookEgg(egg);
```

### Final States and Promises

In Idaho all machines are promises, so you can `await` a machine, or call `.then` on it.

-   `return new Final({some: 'data'})` will resolve the machine. Future transitions will throw.
-   throwing and error inside a state will put the machine in the rejected state.

```javascript
import { Machine, Final, useEffect } from 'idaho';
import { loader } from 'your/app';

const idle = control => ({
    load: id => control.transition('loading', id),
});

const loading = (control, id) => {
    const url = control.data.baseUrl + id;
    useEffect(() => {
        let cancelled = false;
        fetch(url)
            .then(response => {
                if (cancelled) {
                    return;
                }
                if (response.ok === false) {
                    control.transition('error');
                }
                return response.json();
            })
            .then(data => control.transition('done', data))
            .catch(() => control.transition('error'));
        return () => {
            cancelled = true;
        };
    }, url);
};

const done = (control, data) => {
    return new Final(data);
};

const loader = new Machine({ idle, loading, done }, { baseUrl: '/api/cats/' });
loader.state.load(5);

// with regular promises
loader.then(cat => {
    console.log(cat);
});

// in async function
const cat = await loader;
console.log(cat);
```

### Parallel States

```javascript
import { ParallelMachine } from 'idaho';

const on = control => ({
    turnOff: () => control.transition('off'),
});

const off = control => ({
    turnOn: () => control.transition('on'),
});

const wordProcessor = new ParallelMachine({
    bold: [{ on, off }],
    italics: [{ on, off }],
    underline: [{ on, off }],
});

wordProcessor.bold.state.turnOn();
```

### History States

History states are states that maintain their current values when they are exited and reentered. To use history states, call `useHistory` in your state. Anything from `useStateData` or `useMemo` will remain, but effects will rerun.

This example counts the total amount of time your food has been in the oven. When you take the food out and put it back in the oven, the counter will reset.

```javascript
import { useStateData, useEffect } from 'idaho';

const inOven = control => {
    const [timeInOven, setTimeInOven] = useStateData(0);

    useEffect(() => {
        // increment timeInOven every second
        const timeout = setTimeout(() => setTimeInOven(timeInOven + 1), 1000);
        return () => {
            clearTimeout(timeout);
        };
    }, [timeInOven]);

    return {
        takeOutOfOven: () => control.transition('outOfOven'),
    };
};
```

### Transient state nodes

A transient state node is one that immediately transitions to another state. This is useful when a transition could lead to one of two states. With Idaho you can call `control.transition` within your state to immediately cancel the current transition and go to another state.

Internally Idaho is throwing, so any code after the transition will not run.

```javascript
const checkingHeightForRollerCoaster = control => {
    if (control.data.height < 36) {
        // 36 inches
        control.transition('disappointed');
        console.log('this will not log');
    }
    control.transition('excited');
};
```

### Guards

Guards prevent leaving a state if a condition is not met. For these, put an if in your transition function or make it a no-op.

```javascript
const enteringData = control => {
    return {
        submit: () => {
            if (control.data.isValid) {
                control.transition('submitting');
            }
        },
    };
};
```

### Self-transitions

Sometimes it's useful to transition into the state you're in, perhaps you need to react to an argument passed into your state. To allow states to do this without concern for the machine they're in, control objects have the value of the previous state and the previous state name.

Using `control.stateName` is better than using what you think the name of your state is because the name could be changed in the states object passed into the machine.

```javascript
const stateWithSelfTransition = (control, arg1) => {
    if (arg1 === 'eggs') {
        control.transition('out');
    }
    return {
        checkAgain: arg => control.transition(control.stateName, arg),
    };
};
```
