import { State, Machine } from 'idaho';

class Available extends State {
    occupy = this.machine.transition(Occupied);
}
class Occupied extends State {
    leave = this.machine.transition(Dirty);
}
class Dirty extends State {
    clean = () => this.machine.transition(Available);
}

type TableStats = Available | Occupied | Dirty;

class Table extends Machine<TableStats> {
    initialState = Available;
}
