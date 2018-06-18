import { Observable, Observer } from 'rx';
import { isNumber } from 'util';

import { State } from '../core/state.enum';
import { ImportRequest } from './import-request.model';
import { ImportType } from './import-type.enum';
import { IImportService } from './import.service.d';

/**
 * Represents an import service that allows import jobs to be created and listed.
 *
 * @export
 * @class ImportService
 * @implements {IImportService}
 */
export class ImportService implements IImportService {
    private importRequests: ImportRequest[] = [];

    /**
     * Sanitises an import type into the ImportType enum or return null if the given value cannot be sanitised.
     *
     * @param {*} importType The value to be sanitised.
     * @returns {(ImportType | null)} The sanitised import type or null if the given value cannot be sanitised.
     * @memberof ImportService
     */
    public sanitiseImportType(importType: any): ImportType | null {
        if (typeof importType === 'string') {
            switch (importType) {
                case 'word':
                    return ImportType.WORD;

                case 'pdf':
                    return ImportType.PDF;

                case 'wattpad':
                    return ImportType.WATTPAD;

                case 'evernote':
                    return ImportType.EVERNOTE;
            }

            return null;
        }

        if (isNumber(importType)
            && (importType === ImportType.WORD
                || importType === ImportType.PDF
                || importType === ImportType.WATTPAD
                || importType === ImportType.EVERNOTE)) {
            return importType as ImportType;
        }

        return null;
    }

    /**
     * Adds an import request into the list of import requests.
     *
     * @param {ImportRequest} importRequest The import request to be added.
     * @returns {Observable<boolean>} An observable with an indication of the success of the operation.
     * @memberof ImportService
     */
    public addImportRequest(importRequest: ImportRequest): Observable<boolean> {
        const result = Observable.create((observer: Observer<boolean>) => {
            this.importRequests.push(importRequest);
            setTimeout(() => {
                importRequest.state = State.FINISHED;
                importRequest.updated_at = new Date();
            }, 60000);
            observer.onNext(true);
            observer.onCompleted();
        });

        return result;
    }

    /**
     * Lists all the existing import requests.
     *
     * @returns {Observable<ImportRequest[]>} An observable with the list of all import requests.
     * @memberof ImportService
     */
    public listImportRequests(): Observable<ImportRequest[]> {
        const result = Observable.create((observer: Observer<ImportRequest[]>) => {
            observer.onNext(this.importRequests);
            observer.onCompleted();
        });

        return result;
    }
}
