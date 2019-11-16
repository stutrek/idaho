import { State, Machine } from 'idaho';

import Fryer from './Fryer';
import Employee from './Employee';
// import Table from './Table';

class Open extends State {}
class Closed extends State {}

type StoreStates = Open | Closed;

export default class Store extends Machine<StoreStates> {}
