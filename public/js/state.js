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

	sortedPush(item) {
		if (this.#state.length === 0 || this.#state[this.#state.length - 1].position < item.position) {
			this.#state.push(item);
			return;
		}

		for (const char of this.#state) {
			if (char.position > item.position) {
				this.#state.splice(this.#state.indexOf(char), 0, item);
				return;
			}
		}
	}

    filter(callback) {
        this.#state = this.#state.filter(callback);
    }

	delete(index) {
		this.#state.splice(index, 1);
	}

	sort() {
		this.#state.sort((a, b) => (a.position > b.position) ? 1 : -1);
	}

	getByIndex(index) {
		return this.#state[index];
	}
}

export const localState = new LocalState();