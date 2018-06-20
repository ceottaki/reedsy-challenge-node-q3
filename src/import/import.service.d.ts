import { Observable } from 'rx';

import { ImportRequest } from './import-request.model';
import { ImportType } from './import-type.enum';

/**
 * Defines properties and methods for an implementation of an import service.
 *
 * @export
 * @interface IImportService
 */
export interface IImportService {
    /**
     * When implemented it should sanitise an import type into the ImportType enum or return null if the given value cannot be sanitised.
     *
     * @param {*} importType The value to be sanitised.
     * @returns {ImportType  |null} The sanitised import type or null if the given value cannot be sanitised.
     * @memberof IImportService
     */
    sanitiseImportType(importType: any): ImportType | null;

    /**
     * When implemented it should add an import request into the list of import requests.
     *
     * @param {ImportRequest} importRequest The import request to be added.
     * @returns {Observable<boolean>} An observable with an indication of the success of the operation.
     * @memberof IImportService
     */
    addImportRequest(importRequest: ImportRequest): Observable<boolean>;

    /**
     * When implemented it should list all the existing import requests.
     *
     * @returns {Observable<ImportRequest[]>} An observable with the list of all import requests.
     * @memberof IImportService
     */
    listImportRequests(): Observable<ImportRequest[]>;

    /**
     * When implemented it should prepare a list of import requests for output by replacing numeric flags with readable strings.
     *
     * @param {ImportRequest[]} importRequests The list of import requests to be prepared.
     * @returns {any[]} An array of the import requests, prepared for output.
     * @memberof IImportService
     */
    prepareForOutput(importRequests: ImportRequest[]): any[];
}
