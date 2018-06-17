import { State } from './state.enum';

/**
 * Defines properties and methods for an implementation of a stateful object.
 *
 * @export
 * @interface IStateful
 */
export interface IStateful {
    /**
     * Gets or sets a value indicating the state of the object.
     *
     * @type {State}
     * @memberof IStateful
     */
    state: State;

    /**
     * Gets or sets the date the object was created.
     *
     * @type {Date}
     * @memberof IStateful
     */
    created_at: Date;

    /**
     * Gets or sets the date the object was last updated.
     *
     * @type {Date}
     * @memberof IStateful
     */
    updated_at?: Date;
}
