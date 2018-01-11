import { ISelfValidating } from '../core/self-validating';

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
        return (this.password !== undefined && this.password !== null && this.checkEmailValidity(this.emailAddress));
    }

    /**
     * Checks if a given e-mail address is valid according to RFC 2822.
     *
     * @private
     * @param {string} emailAddress The e-mail address to be checked.
     * @returns {boolean} If the given e-amil address is valid, true; false otherwise.
     * @memberof LogOnInfo
     */
    private checkEmailValidity(emailAddress: string): boolean {
        if (!emailAddress || emailAddress.length === 0 || emailAddress.length > 254) {
            return false;
        }

        const atIndex = emailAddress.lastIndexOf('@');
        if (atIndex <= 0) {
            return false;
        }

        // TODO: Implement the rest of RFC 2822.

        return true;
    }
}
