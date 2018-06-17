import { State } from '../core/state.enum';
import { IStateful } from '../core/stateful';
import { ExportType } from './export-type.enum';

/**
 * Represents a request to export a book.
 *
 * @export
 * @class ExportRequest
 */
export class ExportRequest implements IStateful {
    public bookId: string;
    public type: ExportType;
    public state: State;
    // tslint:disable-next-line:variable-name
    public created_at: Date;
    // tslint:disable-next-line:variable-name
    public updated_at?: Date;

    /**
     * Creates an instance of ExportRequest.
     * @param {string} bookId The id of the book to be exported.
     * @param {ExportType} type The type of the export request.
     * @memberof ExportRequest
     */
    constructor(bookId: string, type: ExportType) {
        this.bookId = bookId;
        this.type = type;
        this.state = State.PENDING;
        this.created_at = new Date();
    }
}
