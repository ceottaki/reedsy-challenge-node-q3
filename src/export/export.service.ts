import { Observable, Observer } from 'rx';
import { isNumber } from 'util';

import { State } from '../core/state.enum';
import { ExportRequest } from './export-request.model';
import { ExportType } from './export-type.enum';
import { IExportService } from './export.service.d';

export class ExportService implements IExportService {
    private exportRequests: ExportRequest[] = [];

    public sanitiseExportType(exportType: any): ExportType | null {
        if (typeof exportType === 'string') {
            if (exportType === 'epub') {
                return ExportType.EPUB;
            }

            if (exportType === 'pdf') {
                return ExportType.PDF;
            }

            return null;
        }

        if (isNumber(exportType) && (exportType === ExportType.EPUB || exportType === ExportType.PDF)) {
            return exportType as ExportType;
        }

        return null;
    }

    public addExportRequest(exportRequest: ExportRequest): Observable<boolean> {
        const result = Observable.create((observer: Observer<boolean>) => {
            this.exportRequests.push(exportRequest);
            setTimeout(() => {
                exportRequest.state = State.FINISHED;
                exportRequest.updated_at = new Date();
            }, exportRequest.type === ExportType.EPUB ? 10000 : 25000);
            observer.onNext(true);
            observer.onCompleted();
        });

        return result;
    }

    public listExportRequests(): Observable<ExportRequest[]> {
        const result = Observable.create((observer: Observer<ExportRequest[]>) => {
            observer.onNext(this.exportRequests);
            observer.onCompleted();
        });

        return result;
    }
}
