class LocalState {

    #state;
	constructor() {
		this.#state = [];
        Object.preventExtensions(this);
	}

	get state() {
		return [...this.#state];
	}

	set state(newState) {
		this.#state = newState;
	}

	get text() {
		return this.#state.map((char) => char.value).join("");
	}

	insert(index, item) {
		this.#state.splice(index, 0, item);
	}

	push(item) {
		this.#state.push(item);
	}

    filter(callback) {
        this.#state = this.#state.filter(callback);
    }

	delete(index) {
		this.#state.splice(index, 1);
	}

	sort() {
		this.#state.sort((a, b) => a.position.localeCompare(b.position));
	}

	getByIndex(index) {
		return this.#state[index];
	}
}

export const localState = new LocalState();