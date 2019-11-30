import { Machine, useStateData, useEffect, useHistory } from 'idaho';

const counting = (transition, maxTime) => {
    const [timeRemaining, setTimeRemaining] = useStateData(maxTime, 'timeRemaining');

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (timeRemaining === 0) {
                transition('finished');
            } else {
                setTimeRemaining(time - 1);
            }
        }, 1000);

        return () => {
            clearTimeout(timeout);
        };
    }, [time]);

    // this line allows pausing while keeping the time in this state
    // because the time will be preserved when the machine is switched
    // out of then back into this state.
    useHistory(true);

    return {
        time,
        paused: () => transition('paused'),
        cancel: () => transition('off'),
    };
};

const notSet = transition => {
    return {
        setTime: number => transition('counting', number),
    };
};

const paused = transition => {
    return {
        // because the counting state has history the argument can be left off.
        resume: () => transition('counting'),
    };
};

const off = () => new Final('user cancelled timer');
const finished = () => {
    const machineData = useMachineData();
    machineData.bell.play();

    return new Final('timer finished');
};

const timer = new HookMachine(
    {
        notSet,
        counting,
        paused,
        off,
        finished,
    },
    'notSet',
    { bell: htmlAudioTag }
);
