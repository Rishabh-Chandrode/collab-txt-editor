import { MAX_CHAR_POS, MIN_CHAR_POS } from "./lib/crdt/CRDTHelper.js";

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

	insert(index, items) {
		this.#state.splice(index, 0, ...items);
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

	

	delete(startIndex, length) {
		if (!length) length = 1;
		return this.#state.splice(startIndex, length);
	}

	sort() {
		this.#state.sort((a, b) => (a.position > b.position) ? 1 : -1);
	}

	getByIndex(index) {
		if (index < 0 || index >= this.#state.length){
			throw new Error("Index out of bounds");
		}
		return this.#state[index];
	}

	getPrevCharPos(index) {
		index = Math.min(index, this.#state.length);
		if (index-1 < 0) {
			return MIN_CHAR_POS;
		}
		return this.#state[index - 1].position;
	}

	getNextCharPos(index) {
		index = Math.max(index, 0);
		if (index >= this.#state.length) {
			return MAX_CHAR_POS;
		}
		return this.#state[index].position;
	}

	merge(charsToAdd) {
		charsToAdd.sort();
		let i = 0,j =0;
		let sortedChars = [];

		while(i< this.#state.length && j < charsToAdd.length) {
			if (this.#state[i].position < charsToAdd[j].position) {
				sortedChars.push(this.#state[i]);
				i++;
			} else {
				sortedChars.push(charsToAdd[j]);
				j++;
			}
		}
		while (i < this.#state.length) {
			sortedChars.push(this.#state[i]);
			i++;
		}
		while (j < charsToAdd.length) {
			sortedChars.push(charsToAdd[j]);
			j++;
		}

		this.#state = sortedChars;
	}
}

export const localState = new LocalState();