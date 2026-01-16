export class CRDT {
    #value;
    #position;
    #siteId;

    constructor(charValue, pos, siteId) {
        this.#value = charValue;
        this.#position = pos;
        this.#siteId = siteId;

        Object.preventExtensions(this)
    }

    get value() {
        return this.#value;
    }

    get position() {
        return this.#position;
    }

    get siteId() {
        return this.#siteId;
    }

    toJSON() {
        return {
            value: this.#value,
            position: this.#position,
            siteId: this.#siteId
        };
    }
}
