import { isUndefined } from 'util';

import { App } from './app';
import { ExportController } from './export/export.controller';
import { ExportService } from './export/export.service';
import { IExportService } from './export/export.service.d';
import { ImportController } from './import/import.controller';
import { ImportService } from './import/import.service';
import { IImportService } from './import/import.service.d';

// Reads the port to open from the environment.
const port: number = parseInt(process.env.PORT || '5000');

// Creates a singleton instance of the export service.
const exportService: IExportService = new ExportService();
// Creates a singleton instance of the import service.
const importService: IImportService = new ImportService();

// Creates the app, adds the available controllers and starts it.
const app: App = new App(port);
app.addControllers([new ExportController(exportService), new ImportController(importService)]);
app.start();
