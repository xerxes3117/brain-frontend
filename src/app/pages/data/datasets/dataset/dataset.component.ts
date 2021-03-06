import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import _get from 'lodash/get';
import { NbDialogService } from '@nebular/theme';
import * as moment from 'moment';
import { NbSortDirection, NbSortRequest, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';

import { Theme, LightTheme } from 'src/app/theme/theme';
import { HttpService } from 'src/app/core/services';
import { Dataset, FileSources, FileUpload, FileUploadError, Column } from 'src/app/core/models';
import { DatasetDialogComponent } from './dataset-dialog/dataset-dialog.component';

@Component({
  selector: 'brain-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss']
})
export class DatasetComponent implements OnInit {


  /**
   * theme determnines the theme of the login page
   */
  @Input()
  theme: Theme = new LightTheme();

  /**
   * dataset has the dataset object
   */
  dataset: Dataset;

  /**
   * columns in the dataset
   */
  columns: Column[];

  /**
   * columnTableHeaders is the list of  header beloning to the table listing columns
   */
  columnTableHeaders: string[] = ['Name', 'Data Type', 'Default Aggregation Function'];
  columnTableProps = { 'Name': 'word', 'Data Type': 'data_type', 'Default Aggregation Function': 'aggregation_fn' };
  columnTableDataSource: NbTreeGridDataSource<Column>;
  columnTableSortColumn: string;
  columnTableSortDirection: NbSortDirection = NbSortDirection.NONE;

  /**
   * uploadedFile is the instance storing the uploaded file info
   */
  uploadedFile: FileUpload;

  /**
   * uploadedErrors is the instance storing the uploaded file errors
   */
  uploadedErrors: FileUploadError[];

  /**
   * updatedAt stores the last updated time in string format for the dataset
   */
  updatedAt: string;

  /**
   * _get is the lodash get function
   */
  _get: any;

  /**
   * style of the page
   */
  style: object = {
    BACKGROUND: {
      'background-color': this.theme.PrimaryBackgroundColor
    },
  }

  /**
   * reupload is enabled when user click on upload button
   */
  reupload: boolean = false;

  /**
   * reuploadSource has the object containing the upload file type requirements like acceptedTypes, ID of etc
   */
  reuploadSource: any;

  /**
   * We will do the necessary initialisations required by this component
   */
  constructor(private route: ActivatedRoute, private http: HttpService, private dialogService: NbDialogService, private dataSourceBuilder: NbTreeGridDataSourceBuilder<Column>) {
    this._get = _get;
  }

  /**
   * loadDataset loads the dataset
   */
  loadDataset() {
    this.http.get({
      hash: 'DATASET', params: new Map<string, string>([
        ['id', this.route.snapshot.paramMap.get("id")],
      ]),
    }).subscribe((resp) => {
      this.dataset = _get(resp, ['Data', 'Dataset'], {});
      this.columns = _get(resp, ['Data', 'Columns'], []);
      this.columnTableDataSource = this.dataSourceBuilder.create(this.columns.map(c => ({ data: c })));
      this.uploadedFile = _get(this.dataset, ['UploadedDataset', 'Info'], {});
      this.uploadedErrors = _get(this.dataset, ['UploadedDataset', 'Errors'], []);
      this.updatedAt = moment(_get(this.uploadedFile, 'UpdatedAt')).toString();
    });
  }

  ngOnInit() {
    this.loadDataset();
  }

  updateSort(sortRequest: NbSortRequest): void {
    this.columnTableSortColumn = sortRequest.column;
    this.columnTableSortDirection = sortRequest.direction;
  }

  getSortDirection(column: string): NbSortDirection {
    if (this.columnTableSortColumn === column) {
      return this.columnTableSortDirection;
    }
    return NbSortDirection.NONE;
  }

  getShowOn(index: number) {
    const minWithForMultipleColumns = 400;
    const nextColumnStep = 100;
    return minWithForMultipleColumns + (nextColumnStep * index);
  }

  /**
   * openEditDialog opens the edit dialog for the dataset
   */
  openEditDialog() {
    this.dialogService.open(DatasetDialogComponent, {
      context: {
        dataset: JSON.parse(JSON.stringify(this.dataset)),
      },
    }).onClose.subscribe(this.loadDataset.bind(this));
  }

  /**
   * validateFile sends a request to backend to validate an uploaded file
   * @param id of the uploaded file
   */
  validateFile(id: number) {
    this.http.get({
      hash: 'FILE_VALIDATE', params: new Map<string, string>([
        ['id', id + ''],
      ]),
    }).subscribe((resp) => {
    });
  }

  /**
   * openFileUploadModal will open file upload modal
   * @param id id of the file
   * @param sourceType sourceType of the file
   */
  openFileUploadModal(id: number, sourceType: string) {
    this.reuploadSource = Object.assign({}, { URL: '/datasourceapi/file/upload?id=' + id, acceptedFileTypes: _get(FileSources, [sourceType, 'acceptedFileTypes'], []) });
    this.reupload = true;
  }

  /**
   * closeFileUploadModal will close the file upload modal
   */
  closeFileUploadModal() {
    this.reupload = false;
    this.reuploadSource = undefined;
  }

  /**
   * processFile will start processing the file to identify the column names
   * @param id id of the file record to be processed
   */
  processFile(id: number) {
    this.http.get({
      hash: 'FILE_COLUMN_PROCESS', params: new Map<string, string>([
        ['id', id + ''],
      ]),
    }).subscribe((resp) => {
    });
  }
}
