/**
 * Defines properties and methods for an implementation of a self-validating class.
 *
 * @export
 * @interface ISelfValidating
 */
export interface ISelfValidating {
    /**
     * When implemented it should check if the implementer is currently in a valid state.
     *
     * @returns {boolean} If in a valid state returns true; false otherwise.
     * @memberof ISelfValidating
     */
    checkValidity(): boolean;
}
