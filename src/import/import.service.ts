import { Observable, Observer } from 'rx';
import { isNumber } from 'util';

import { State } from '../core/state.enum';
import { ImportRequest } from './import-request.model';
import { ImportType } from './import-type.enum';
import { IImportService } from './import.service.d';

export class ImportService implements IImportService {
    private importRequests: ImportRequest[] = [];

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

    public listImportRequests(): Observable<ImportRequest[]> {
        const result = Observable.create((observer: Observer<ImportRequest[]>) => {
            observer.onNext(this.importRequests);
            observer.onCompleted();
        });

        return result;
    }
}
