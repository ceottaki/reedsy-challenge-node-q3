import { Observable } from 'rx';

import { ImportRequest } from './import-request.model';
import { ImportType } from './import-type.enum';
import { ImportService } from './import.service';

describe('Import Service', () => {
    let service: ImportService;

    beforeAll((done) => {
        service = new ImportService();
        done();
    });

    afterAll((done) => {
        done();
    });

    it('should instantiate correctly', (done) => {
        expect(service).toBeTruthy();
        done();
    });

    it('should sanitise the string word into the import type WORD', (done) => {
        const result: ImportType | null = service.sanitiseImportType('word');
        expect(result).toEqual(ImportType.WORD);
        done();
    });

    it('should sanitise the string pdf into the import type PDF', (done) => {
        const result: ImportType | null = service.sanitiseImportType('pdf');
        expect(result).toEqual(ImportType.PDF);
        done();
    });

    it('should sanitise the string wattpad into the import type WATTPAD', (done) => {
        const result: ImportType | null = service.sanitiseImportType('wattpad');
        expect(result).toEqual(ImportType.WATTPAD);
        done();
    });

    it('should sanitise the string evernote into the import type EVERNOTE', (done) => {
        const result: ImportType | null = service.sanitiseImportType('evernote');
        expect(result).toEqual(ImportType.EVERNOTE);
        done();
    });

    it('should sanitise the number 0 into the import type WORD', (done) => {
        const result: ImportType | null = service.sanitiseImportType(0);
        expect(result).toEqual(ImportType.WORD);
        done();
    });

    it('should sanitise the number 1 into the import type PDF', (done) => {
        const result: ImportType | null = service.sanitiseImportType(1);
        expect(result).toEqual(ImportType.PDF);
        done();
    });

    it('should sanitise the number 2 into the import type WATTPAD', (done) => {
        const result: ImportType | null = service.sanitiseImportType(2);
        expect(result).toEqual(ImportType.WATTPAD);
        done();
    });

    it('should sanitise the number 3 into the import type EVERNOTE', (done) => {
        const result: ImportType | null = service.sanitiseImportType(3);
        expect(result).toEqual(ImportType.EVERNOTE);
        done();
    });

    it('should return null when attempting to sanitise a non-compliant string', (done) => {
        const result: ImportType | null = service.sanitiseImportType('not-a-type');
        expect(result).toBeNull();
        done();
    });

    it('should return null when attempting to sanitise a non-compliant number', (done) => {
        const result: ImportType | null = service.sanitiseImportType(-1);
        expect(result).toBeNull();
        done();
    });

    it('should return null when attempting to sanitise a type that is not a number or string', (done) => {
        const result: ImportType | null = service.sanitiseImportType({ isObject: true });
        expect(result).toBeNull();
        done();
    });

    it('should return null when attempting to sanitise a null value', (done) => {
        const result: ImportType | null = service.sanitiseImportType(null);
        expect(result).toBeNull();
        done();
    });

    it('should be successful when adding a new import request', (done) => {
        service.addImportRequest(new ImportRequest('abc', ImportType.WORD, 'https://somewhere.com/somedoc.doc'))
            .subscribe((success: boolean) => {
                expect(success).toBe(true);
                done();
            });
    });

    it('should have an import request in the list when one was added', (done) => {
        service.addImportRequest(new ImportRequest('specific-request', ImportType.WORD, 'https://somewhere.com/otherdoc.doc'))
            .subscribe((success: boolean) => {
                service.listImportRequests().subscribe((requests: ImportRequest[]) => {
                    const specificRequestIndex: number = requests.findIndex((importRequest) => {
                        return importRequest.bookId === 'specific-request';
                    });

                    expect(specificRequestIndex).toBeGreaterThanOrEqual(0);
                    done();
                });
            });
    });

    it('should return all import requests when listing them', (done) => {
        // Instantiating a new service to make sure only the import requests added by this test are present.
        const specificService = new ImportService();
        specificService.addImportRequest(new ImportRequest('request-one', ImportType.WORD, 'https://somewhere.com/one.doc'))
            .subscribe((successOne: boolean) => {
                specificService.addImportRequest(new ImportRequest('request-two', ImportType.WORD, 'https://somewhere.com/two.doc'))
                    .subscribe((successTwo: boolean) => {
                        specificService.listImportRequests().subscribe((requests: ImportRequest[]) => {
                            expect(requests.length).toBe(2);
                            done();
                        });
                    });
            });
    });
});
