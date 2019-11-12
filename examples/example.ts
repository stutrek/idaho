class Animal {}

class Dog extends Animal {
    bark() {}
}
class Cat extends Animal {
    pounce() {}
}
class Cow extends Animal {
    moo() {}
}

class PetExchange<AnimalsForSale> {
    constructor(public animals: AnimalsForSale[]) {}

    getFirstAnimal() {
        if (this.animals.length) {
            return this.animals[0];
        }
    }

    addAnimal(animal: AnimalsForSale) {
        this.animals.push(animal);
    }
}

// this doesn't break

const exchange = new PetExchange<Dog | Cow | number>([new Dog(), 7]);

const cat = new Cat();
exchange.addAnimal(cat);
