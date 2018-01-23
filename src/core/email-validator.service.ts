import { isNull, isNullOrUndefined } from 'util';

// ipaddr.js does not provide types.
// tslint:disable-next-line:no-var-requires
const ipAddr = require('ipaddr.js');

/**
 * Represents an e-mail validator.
 *
 * @export
 * @class EmailValidator
 */
export class EmailValidator {
    /**
     * Checks if a given e-mail address is valid according to RFC 2822.
     *
     * @private
     * @param {string} emailAddress The e-mail address to be checked.
     * @returns {boolean} If the given e-mail address is valid, true; false otherwise.
     * @memberof EmailValidator
     */
    public checkEmailValidity(emailAddress: string): boolean {
        const localPartValidChars: string = '.!#$%&\'*+-/=?^_`{|}~"(),:;<>@[\\] ';
        if (!emailAddress || emailAddress.length === 0 || emailAddress.length > 254) {
            return false;
        }

        const atIndex = emailAddress.lastIndexOf('@');
        let result: boolean = (atIndex > 0);
        if (!result) {
            return result;
        }

        const localPart: string = emailAddress.substr(0, atIndex);
        const domainPart: string = emailAddress.substr(atIndex + 1, emailAddress.length - (atIndex + 1));
        result = (localPart.length <= 64) && (domainPart.length <= 253);
        if (!result) {
            return result;
        }

        result = this.checkEmailLocalPartRestrictedChars(localPart)
            && this.checkStringForInvalidChars(localPart, localPartValidChars, true)
            && this.checkEmailDomainPart(domainPart);

        return result;
    }

    /**
     * Checks the local part of an e-mail address for restricted characters.
     *
     * @private
     * @param {string} localPart The local part of an e-mail address to be checked.
     * @returns {boolean} If the given local part of an e-mail address is valid, returns true; otherwise, false.
     * @memberof EmailValidator
     */
    private checkEmailLocalPartRestrictedChars(localPart: string): boolean {
        // Rule set for restricted local chars:
        // - A quoted section has '"' as the first and last characters, without an escape character
        // - '.' splits up sections, unless within a quoted section
        // - '\' must be escaped by a '\'
        // - '"' must be escaped by a '\' and must be paired to create a quotation section
        // - a quotation must have some text within it
        // - \"( ),:;<>@[] chars must appear only within a quotation
        const restrictedCharsRegEx: RegExp = /[\s\(,:;<>@[\]\\]/;

        // List of sections and whether they are quoted.
        let sections: Array<{ section: string, isQuoted: boolean }>
            = new Array<{ section: string, isQuoted: boolean }>();
        let result: boolean = true;

        sections = this.getSections(localPart, sections)
            .filter((s) => !isNullOrUndefined(s.section) && s.section.length > 0);

        for (const s of sections) {
            if (s.isQuoted) {
                // Quoted section
                const quoteSection: string = s.section.substr(1, s.section.length - 2);

                for (let i = 0; i < quoteSection.length; i++) {
                    if (quoteSection[i] === '\\') {
                        // \ should be followed by \ or "
                        if (i === quoteSection.length - 1) {
                            result = false;
                            break;
                        }

                        if (quoteSection[i + 1] === '"' || quoteSection[i + 1] === '\\') {
                            i++;
                        } else {
                            result = false;
                            break;
                        }
                    }

                    if (quoteSection[i] === '"' && (i > 0 && quoteSection[i - 1] !== '\\')) {
                        result = false;
                        break;
                    }
                }
            } else {
                // Unquoted section, should not have any of the restricted characters.
                const checkRestrictedCharacters: RegExpExecArray | null = restrictedCharsRegEx.exec(s.section);
                result = !restrictedCharsRegEx.test(s.section);
            }

            if (!result) {
                break;
            }
        }

        return result;
    }

    /**
     * Checks a string for the presence of invalid characters.
     * Invalid characters are considered the ones not present in the given list of valid characters.
     *
     * @private
     * @param {string} value The string to be checked.
     * @param {string} validChars The list of valid characters.
     * @param {boolean} addLettersAndNumbersAsValid Whether to add letters and numbers to the list of valid characters.
     * @returns {boolean} If the given string is valid, returns true; otherwise, false.
     * @memberof EmailValidator
     */
    private checkStringForInvalidChars(
        value: string,
        validChars: string,
        addLettersAndNumbersAsValid: boolean): boolean {
        if (isNullOrUndefined(value)
            || (isNullOrUndefined(validChars) && !addLettersAndNumbersAsValid)
            || value.length === 0
            || (validChars.length === 0 && !addLettersAndNumbersAsValid)) {
            return true;
        }

        if (addLettersAndNumbersAsValid) {
            validChars += '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        }

        const invalidCharsRegEx = new RegExp('[^' + this.escapeStringForRegEx(validChars) + ']', 'g');
        return !invalidCharsRegEx.test(value);
    }

    /**
     * Checks if the domain part of an e-mail address is valid.
     *
     * @private
     * @param {string} domainPart The domain part of an e-mail address.
     * @returns {boolean} If the given domain part of an e-mail address is valid, returns true; otherwise, false.
     * @memberof EmailValidator
     */
    private checkEmailDomainPart(domainPart: string): boolean {
        if (isNull(domainPart) || domainPart.length === 0) {
            return false;
        }

        // tslint:disable-next-line:max-line-length
        const validHostnameRegex: RegExp = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/g;

        if (domainPart[0] === '[') {
            return this.checkEmailIpAddressDomain(domainPart);
        }

        const result: boolean = validHostnameRegex.test(domainPart);

        return result;
    }

    /**
     * Gets the sections of the local part of an e-mail address as an array that also indicates if the
     * section is quoted or not.
     *
     * @private
     * @param {string} localPart The local part of an e-mail address.
     * @param {Array<{ section: string, isQuoted: boolean }>} sections The array to be populated with the sections.
     * @returns {Array<{ section: string, isQuoted: boolean }>} The array with the sections.
     * @memberof EmailValidator
     */
    private getSections(localPart: string, sections: Array<{ section: string, isQuoted: boolean }>)
        : Array<{ section: string, isQuoted: boolean }> {
        if (isNull(localPart) || localPart.length === 0) {
            return new Array<{ section: string, isQuoted: boolean }>();
        }

        const startQuote: boolean = localPart[0] === '"';
        let endIndex: number = -1;
        let escapedQuoteIndex: number = 0;

        if (startQuote && localPart.length > 1) {
            endIndex = 1;
            while (escapedQuoteIndex >= 0) {
                escapedQuoteIndex = localPart.indexOf('\\".', endIndex);
                endIndex = localPart.indexOf('".', endIndex);
                if (endIndex === -1 || escapedQuoteIndex === -1 || endIndex > escapedQuoteIndex + 1) {
                    escapedQuoteIndex = -1;
                } else {
                    endIndex += 2;
                }
            }

            if (endIndex === -1) {
                if (localPart[localPart.length - 1] === '"') {
                    endIndex = localPart.length - 1;
                }
            }
        }

        if (endIndex < 0) {
            sections.push({ section: localPart, isQuoted: false });
        } else {
            sections.push({ section: localPart.substr(0, endIndex), isQuoted: true });
            if (endIndex < localPart.length - 1) {
                this.getSections(localPart.substr(endIndex + 1, localPart.length - (endIndex + 1)), sections);
            }
        }

        return sections;
    }

    /**
     * Checks if the domain part of an e-mail address is a valid IP address.
     *
     * @private
     * @param {string} domainPart The domain part of an e-mail address.
     * @returns {boolean} If the domain part is a valid IP address, returns true; otherwise, false.
     * @memberof EmailValidator
     */
    private checkEmailIpAddressDomain(domainPart: string): boolean {
        if (isNull(domainPart) || domainPart.length < 3) {
            return false;
        }

        // Rule set for restricted domain chars:
        // - [ can only appear once as the first character
        // - ] can only appear once as the last character
        // - [ and ] must be paired
        // - [ and ] must contain a valid IP address within them
        let result: boolean = domainPart[0] === '[' && domainPart[domainPart.length - 1] === ']';
        if (result) {
            domainPart = domainPart.replace('IPv6:', '');
            result = ipAddr.parse(domainPart);
        }

        return result;
    }

    /**
     * Escapes a given string to be used in a regular expression.
     *
     * @private
     * @param {string} value The string to be escaped.
     * @returns {string} The escaped string.
     * @memberof EmailValidator
     */
    private escapeStringForRegEx(value: string): string {
        const charactersToEscape: RegExp = /[-\/\\^$*+?.()|[\]{}]/g;
        return value.replace(charactersToEscape, '\\$&');
    }
}
