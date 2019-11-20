export class Guard {
    constructor(public nextState: string) {}
}

export class Final<T> {
    constructor(public data: T) {}
}
