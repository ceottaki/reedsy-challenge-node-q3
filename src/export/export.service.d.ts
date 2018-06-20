import { Observable } from 'rx';

import { ExportRequest } from './export-request.model';
import { ExportType } from './export-type.enum';

/**
 * Defines properties and methods for an implementation of an export service.
 *
 * @export
 * @interface IExportService
 */
export interface IExportService {
    /**
     * When implemented it should sanitise an export type into the ExportType enum or return null if the given value cannot be sanitised.
     *
     * @param {*} exportType The value to be sanitised.
     * @returns {ExportType  | null} The sanitised export type or null if the given value cannot be sanitised.
     * @memberof IExportService
     */
    sanitiseExportType(exportType: any): ExportType | null;

    /**
     * When implemented it should add an export request into the list of export requests.
     *
     * @param {ExportRequest} exportRequest The export request to be added.
     * @returns {Observable<boolean>} An observable with an indication of the success of the operation.
     * @memberof IExportService
     */
    addExportRequest(exportRequest: ExportRequest): Observable<boolean>;

    /**
     * When implemented it should list all the existing export requests.
     *
     * @returns {Observable<ExportRequest[]>} An observable with the list of all export requests.
     * @memberof IExportService
     */
    listExportRequests(): Observable<ExportRequest[]>;

    /**
     * When implemented it should prepare a list of export requests for output by replacing numeric flags with readable strings.
     *
     * @param {ExportRequest[]} exportRequests The list of export requests to be prepared.
     * @returns {any[]} An array of the export requests, prepared for output.
     * @memberof IExportService
     */
    prepareForOutput(exportRequests: ExportRequest[]): any[];
}
