/**
 * Defines properties and methods for an implementation of the result of a log on action.
 *
 * @export
 * @interface ILogOnResult
 */
export interface ILogOnResult {
    /**
     * The token of a successfully authenticated action.
     *
     * @type {string}
     * @memberof ILogOnResult
     */
    token: string;

    /**
     * The id of the profile of the user successfully authenticated.
     *
     * @type {string}
     * @memberof ILogOnResult
     */
    profileId: string;
}
