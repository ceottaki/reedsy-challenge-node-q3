/**
 * Defines properties and methods for an implementation of a standard response object.
 *
 * @export
 * @interface IStandardResponse
 */
export interface IStandardResponse {
    /**
     * Gets or sets a value indicating whether the request was successful.
     *
     * @type {boolean}
     * @memberof IStandardResponse
     */
    success: boolean;

    /**
     * Gets or sets a message to be sent to the client.
     *
     * @type {string}
     * @memberof IStandardResponse
     */
    message?: string;

    /**
     * Gets or sets the data to be included in the response.
     *
     * @type {object}
     * @memberof IStandardResponse
     */
    data?: object;
}
