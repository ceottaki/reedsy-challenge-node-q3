import { Observable } from 'rx';

import { ExportRequest } from './export-request.model';
import { ExportType } from './export-type.enum';
import { ExportService } from './export.service';

describe('Export Service', () => {
    let service: ExportService;

    beforeAll((done) => {
        service = new ExportService();
        done();
    });

    afterAll((done) => {
        done();
    });

    it('should instantiate correctly', (done) => {
        expect(service).toBeTruthy();
        done();
    });

    it('should sanitise the string epub into the export type EPUB', (done) => {
        const result: ExportType | null = service.sanitiseExportType('epub');
        expect(result).toEqual(ExportType.EPUB);
        done();
    });

    it('should sanitise the string pdf into the export type PDF', (done) => {
        const result: ExportType | null = service.sanitiseExportType('pdf');
        expect(result).toEqual(ExportType.PDF);
        done();
    });

    it('should sanitise the number 0 into the export type EPUB', (done) => {
        const result: ExportType | null = service.sanitiseExportType(0);
        expect(result).toEqual(ExportType.EPUB);
        done();
    });

    it('should sanitise the number 1 into the export type PDF', (done) => {
        const result: ExportType | null = service.sanitiseExportType(1);
        expect(result).toEqual(ExportType.PDF);
        done();
    });

    it('should return null when attempting to sanitise a non-compliant string', (done) => {
        const result: ExportType | null = service.sanitiseExportType('not-a-type');
        expect(result).toBeNull();
        done();
    });

    it('should return null when attempting to sanitise a non-compliant number', (done) => {
        const result: ExportType | null = service.sanitiseExportType(-1);
        expect(result).toBeNull();
        done();
    });

    it('should return null when attempting to sanitise a type that is not a number or string', (done) => {
        const result: ExportType | null = service.sanitiseExportType({ isObject: true });
        expect(result).toBeNull();
        done();
    });

    it('should return null when attempting to sanitise a null value', (done) => {
        const result: ExportType | null = service.sanitiseExportType(null);
        expect(result).toBeNull();
        done();
    });

    it('should be successful when adding a new export request', (done) => {
        service.addExportRequest(new ExportRequest('abc', ExportType.EPUB))
            .subscribe((success: boolean) => {
                expect(success).toBe(true);
                done();
            });
    });

    it('should have an export request in the list when one was added', (done) => {
        service.addExportRequest(new ExportRequest('specific-request', ExportType.EPUB))
            .subscribe((success: boolean) => {
                service.listExportRequests().subscribe((requests: ExportRequest[]) => {
                    const specificRequestIndex: number = requests.findIndex((exportRequest) => {
                        return exportRequest.bookId === 'specific-request';
                    });

                    expect(specificRequestIndex).toBeGreaterThanOrEqual(0);
                    done();
                });
            });
    });

    it('should return all export requests when listing them', (done) => {
        // Instantiating a new service to make sure only the export requests added by this test are present.
        const specificService = new ExportService();
        specificService.addExportRequest(new ExportRequest('request-one', ExportType.EPUB))
            .subscribe((successOne: boolean) => {
                specificService.addExportRequest(new ExportRequest('request-two', ExportType.PDF))
                    .subscribe((successTwo: boolean) => {
                        specificService.listExportRequests().subscribe((requests: ExportRequest[]) => {
                            expect(requests.length).toBe(2);
                            done();
                        });
                    });
            });
    });
});
