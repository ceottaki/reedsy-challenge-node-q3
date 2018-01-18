/**
 * Defines properties and methods for an implementation of a temporary session.
 *
 * @export
 * @interface ISession
 */
export interface ISession {
    /**
     * Gets or sets the email address of the user logged in to the current session.
     *
     * @type {string}
     * @memberof ISession
     */
    email: string;

    /**
     * Gets or sets the full name of the user logged in to the current session.
     *
     * @type {string}
     * @memberof ISession
     */
    fullName: string;
}
