import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'mongoose';
import { isUndefined } from 'util';

import { BaseController } from '../core/base.controller';
import { HttpVerbs } from '../core/http-verbs.enum';
import { IStandardResponse } from '../core/standard-response';
import { ImportRequest } from './import-request.model';
import { ImportType } from './import-type.enum';
import { IImportService } from './import.service.d';

/**
 * Represets an import controller.
 *
 * @export
 * @class ImportController
 * @extends {BaseController}
 */
export class ImportController extends BaseController {
    private importService: IImportService;

    /**
     * Creates an instance of ImportController.
     *
     * @memberof ImportController
     */
    constructor(importService: IImportService) {
        super('/import', 1);
        this.importService = importService;

        this.routes.push(
            {
                path: this.defaultPath,
                handler: this.postImportRequest,
                verbs: [HttpVerbs.POST],
                isAnonymous: true
            },
            {
                path: this.defaultPath,
                handler: this.getImportRequest,
                verbs: [HttpVerbs.GET],
                isAnonymous: true
            }
        );
    }

    /**
     * Creates a new entry in the import request collection.
     *
     * @param {Request} req The HTTP request that should contain in its body the new import request.
     * @param {Response} res The HTTP response.
     * @param {NextFunction} next The next function in the pipeline.
     * @memberof ImportController
     */
    public postImportRequest(req: Request, res: Response, next: NextFunction): void {
        const result: IStandardResponse = {
            success: false
        };

        if (!req.body.bookId || (!req.body.type && req.body.type !== 0) || (!req.body.url)) {
            result.message = 'The request to create a new import job failed.'
                + 'It requires a book id, a url and a type that is either "word", "pdf", "wattpad" or "evernote".';
            res.statusCode = 400;
            res.json(result);
            return;
        } else {
            const importType: ImportType | null = this.importService.sanitiseImportType(req.body.type);
            if (importType === null) {
                result.success = false;
                result.message = 'The import type is invalid.';
                res.statusCode = 400;
                res.json(result);
                return;
            } else {
                this.importService.addImportRequest(
                    new ImportRequest(req.body.bookId, importType, req.body.url)).subscribe((success: boolean) => {
                        result.success = success;
                        result.message = success
                            ? 'Your request to create a new import job was successful.'
                            : 'There was a problem creating a new import job.';
                        res.statusCode = success ? 201 : 500;
                    }, undefined, () => {
                        res.json(result);
                    });
            }
        }
    }

    /**
     * Gets a list of the existing import requests.
     *
     * @param {Request} req The HTTP request.
     * @param {Response} res The HTTP response.
     * @param {NextFunction} next The next function in the pipeline.
     * @memberof ImportController
     */
    public getImportRequest(req: Request, res: Response, next: NextFunction): void {
        const result: IStandardResponse = {
            success: false
        };

        this.importService.listImportRequests().subscribe((importRequests: ImportRequest[]) => {
            result.success = true;
            result.data = importRequests;
        }, undefined, (() => {
            res.statusCode = result.success ? 201 : 401;
            res.json(result);
        }));
    }
}
