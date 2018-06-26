import { NextFunction, Request, Response } from 'express';

import { BaseController } from '../core/base.controller';
import { HttpVerbs } from '../core/http-verbs.enum';
import { IStandardResponse } from '../core/standard-response';
import { ExportRequest } from './export-request.model';
import { ExportType } from './export-type.enum';
import { IExportService } from './export.service.d';

/**
 * Represets an export controller.
 *
 * @export
 * @class ExportController
 * @extends {BaseController}
 */
export class ExportController extends BaseController {
    private exportService: IExportService;

    /**
     * Creates an instance of ExportController.
     *
     * @param {IExportService} exportService The export service.
     * @memberof ExportController
     */
    constructor(exportService: IExportService) {
        super('/export', 1);
        this.exportService = exportService;

        this.routes.push(
            {
                path: this.defaultPath,
                handler: this.postExportRequest,
                verbs: [HttpVerbs.POST],
                isAnonymous: true
            },
            {
                path: this.defaultPath,
                handler: this.getExportRequest,
                verbs: [HttpVerbs.GET],
                isAnonymous: true
            }
        );
    }

    /**
     * Creates a new entry in the export request collection.
     *
     * @param {Request} req The HTTP request that should contain in its body the new export request.
     * @param {Response} res The HTTP response.
     * @param {NextFunction} next The next function in the pipeline.
     * @memberof ExportController
     */
    public postExportRequest(req: Request, res: Response, next: NextFunction): void {
        const result: IStandardResponse = {
            success: false
        };

        if (!req.body.bookId || (!req.body.type && req.body.type !== 0)) {
            result.message = 'The request to create a new export job failed.'
                + 'It requires a book id and a type that is either "epub" or "pdf".';
            res.statusCode = 400;
            res.json(result);
            return;
        }

        const exportType: ExportType | null = this.exportService.sanitiseExportType(req.body.type);
        if (exportType === null) {
            result.success = false;
            result.message = 'The export type is invalid.';
            res.statusCode = 400;
            res.json(result);
            return;
        }

        this.exportService.addExportRequest(new ExportRequest(req.body.bookId, exportType)).subscribe((success: boolean) => {
            result.success = success;
            result.message = success
                ? 'Your request to create a new export job was successful.'
                : 'There was a problem creating a new export job.';
            res.statusCode = success ? 201 : 500;
        }, undefined, () => {
            res.json(result);
        });
    }

    /**
     * Gets a list of the existing export requests.
     *
     * @param {Request} req The HTTP request.
     * @param {Response} res The HTTP response.
     * @param {NextFunction} next The next function in the pipeline.
     * @memberof ExportController
     */
    public getExportRequest(req: Request, res: Response, next: NextFunction): void {
        const result: IStandardResponse = {
            success: false
        };

        this.exportService.listExportRequests().subscribe((exportRequests: ExportRequest[]) => {
            result.success = true;
            result.data = this.exportService.groupByStateForOutput(exportRequests);
        }, undefined, (() => {
            res.statusCode = result.success ? 201 : 500;
            res.json(result);
        }));
    }
}
