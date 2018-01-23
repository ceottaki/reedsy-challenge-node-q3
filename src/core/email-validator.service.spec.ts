import { EmailValidator } from './email-validator.service';

// tslint:disable-next-line:max-line-length
const emailLocalPartTooLong: string = 'T123456780123456780123456780123456780123456780123456780123456780123456780123456780123456780@test.com';
const emailLongLocalPartValid: string = 'T123456780123456780123456780123456780001234567890123456789012345@test.com';
const emailSpaceInDomainName: string = 'test@ test.com';
const emailSpaceInLocalPart: string = 'test @test.com';
const validEmail: string = 'test@test.com';

// TODO: Add tests that consider IP addresses in the domain part.
// TODO: Add tests that consider quoted sections in the local part.
// TODO: Add tests that consider restricted characters in the local part.
// TODO: Add tests that consider restricted characters in the domain part.

describe('Email Validator Service', () => {
    it('should instantiate correctly', (done) => {
        const service = new EmailValidator();
        expect(service).toBeTruthy();
        done();
    });

    it('should validate a valid email', (done) => {
        const service = new EmailValidator();
        const result: boolean = service.checkEmailValidity(validEmail);
        expect(result).toBe(true);
        done();
    });

    it('should invalidate an email with the local part being too long', (done) => {
        const service = new EmailValidator();
        const result: boolean = service.checkEmailValidity(emailLocalPartTooLong);
        expect(result).toBe(false);
        done();
    });

    it('should validate an email with a long but valid local part', (done) => {
        const service = new EmailValidator();
        const result: boolean = service.checkEmailValidity(emailLongLocalPartValid);
        expect(result).toBe(true);
        done();
    });

    it('should invalidate an email with a space in the domain part', (done) => {
        const service = new EmailValidator();
        const result: boolean = service.checkEmailValidity(emailSpaceInDomainName);
        expect(result).toBe(false);
        done();
    });

    it('should invalidate an email with a space in the local part', (done) => {
        const service = new EmailValidator();
        const result: boolean = service.checkEmailValidity(emailSpaceInLocalPart);
        expect(result).toBe(false);
        done();
    });
});
