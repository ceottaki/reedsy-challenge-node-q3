import { Observable, Observer } from 'rx';
import { isNumber } from 'util';

import { State } from '../core/state.enum';
import { ExportRequest } from './export-request.model';
import { ExportType } from './export-type.enum';
import { IExportService } from './export.service.d';

/**
 * Represents an export service that allows export jobs to be created and listed.
 *
 * @export
 * @class ExportService
 * @implements {IExportService}
 */
export class ExportService implements IExportService {
    private exportRequests: ExportRequest[] = [];

    /**
     * Sanitises an export type into the ExportType enum or return null if the given value cannot be sanitised.
     *
     * @param {*} exportType The value to be sanitised.
     * @returns {(ExportType | null)} The sanitised export type or null if the given value cannot be sanitised.
     * @memberof ExportService
     */
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

    /**
     * Adds an export request into the list of export requests.
     *
     * @param {ExportRequest} exportRequest The export request to be added.
     * @returns {Observable<boolean>} An observable with an indication of the success of the operation.
     * @memberof ExportService
     */
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

    /**
     * Lists all the existing export requests.
     *
     * @returns {Observable<ExportRequest[]>} An observable with the list of all export requests.
     * @memberof ExportService
     */
    public listExportRequests(): Observable<ExportRequest[]> {
        const result = Observable.create((observer: Observer<ExportRequest[]>) => {
            observer.onNext(this.exportRequests);
            observer.onCompleted();
        });

        return result;
    }

    /**
     * Prepares a list of export requests for output by replacing numeric flags with readable strings.
     *
     * @param {ExportRequest[]} exportRequests The list of export requests to be prepared.
     * @returns {any[]} An array of the export requests, prepared for output.
     * @memberof ExportService
     */
    public prepareForOutput(exportRequests: ExportRequest[]): any[] {
        const result = new Array();
        exportRequests.forEach((er: ExportRequest) => {
            const preparedExportRequest = { ...er as any };
            preparedExportRequest.type = ExportType[er.type].toLowerCase();
            preparedExportRequest.state = State[er.state].toLowerCase();
            result.push(preparedExportRequest);
        });

        return result;
    }
}
