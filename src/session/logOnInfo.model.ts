import { ISelfValidating } from '../core/self-validating';

// isemail does not provide types.
// tslint:disable-next-line:no-var-requires
const isEmail = require('isemail');

/**
 * Represents information that allows a user to log on.
 *
 * @export
 * @class LogOnInfo
 * @implements {ISelfValidating}
 */
export class LogOnInfo implements ISelfValidating {
    public emailAddress: string;
    public password: string;

    /**
     * Creates an instance of LogOnInfo.
     * @param {string} emailAddress The e-mail address to be used when logging on.
     * @param {string} password The password to be used when logging on.
     * @memberof LogOnInfo
     */
    constructor(emailAddress: string, password: string) {
        this.emailAddress = emailAddress;
        this.password = password;
    }

    /**
     * Checks if this class is currently in a valid state.
     *
     * @returns {boolean} If in a valid state returns true; false otherwise.
     * @memberof LogOnInfo
     */
    public checkValidity(): boolean {
        return (this.password !== undefined
            && this.password !== null
            && isEmail.validate(this.emailAddress));
    }
}
