import { State } from '../core/state.enum';
import { IStateful } from '../core/stateful';
import { ImportType } from './import-type.enum';

/**
 * Represents a request to import a book.
 *
 * @export
 * @class ImportRequest
 */
export class ImportRequest implements IStateful {
    public bookId: string;
    public type: ImportType;
    public url: string;
    public state: State;
    // tslint:disable-next-line:variable-name
    public created_at: Date;
    // tslint:disable-next-line:variable-name
    public updated_at?: Date;

    /**
     * Creates an instance of ImportRequest.
     * @param {string} bookId The id of the book the contents should be imported into.
     * @param {ImportType} type The type of the import request.
     * @param {string} url The url with the contents to be imported.
     * @memberof ImportRequest
     */
    constructor(bookId: string, type: ImportType, url: string) {
        this.bookId = bookId;
        this.type = type;
        this.url = url;
        this.state = State.PENDING;
        this.created_at = new Date();
    }
}
