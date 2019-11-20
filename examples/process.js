const { HookMachine, Guard, Final } = require('../dist');

const start = transition => {
    setTimeout(() => {
        transition('cantDo');
    }, 1000);

    return {
        cantDo: () => transition('cantDo'),
    };
};

const cantDo = transition => {
    throw new Guard('canDo');
};

const canDo = transition => {
    setTimeout(() => {
        transition('finished');
    }, 1000);

    return {
        finish: () => transition('finished'),
    };
};

const finished = () => {
    return new Final({
        success: true,
    });
};

const states = {
    start,
    cantDo,
    canDo,
    finished,
};

const machine = new HookMachine(states, 'start');

machine.on('change', state => {
    console.log('got a change:', state);
});

machine.then(data => {
    console.log('finished', data);
});
