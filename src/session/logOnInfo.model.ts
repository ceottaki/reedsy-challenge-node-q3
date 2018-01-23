import { EmailValidator } from '../core/email-validator.service';
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
    private emailValidator: EmailValidator;

    /**
     * Creates an instance of LogOnInfo.
     * @param {string} emailAddress The e-mail address to be used when logging on.
     * @param {string} password The password to be used when logging on.
     * @memberof LogOnInfo
     */
    constructor(emailAddress: string, password: string) {
        this.emailAddress = emailAddress;
        this.password = password;
        this.emailValidator = new EmailValidator();
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
            && this.emailValidator.checkEmailValidity(this.emailAddress));
    }
}
