import {
    Component,
    OnInit,
    ChangeDetectorRef,
    ViewChild,
    ChangeDetectionStrategy,
    Optional,
    Inject
} from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, Sort, MatSortModule } from "@angular/material/sort";
import { Meta, Title } from "@angular/platform-browser";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatSelectModule, MatSelect } from "@angular/material/select";
import { MatDividerModule } from "@angular/material/divider";
import { MatTooltipModule } from "@angular/material/tooltip";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

import { Id_Data } from "../../data/data";
import { User, DataService, UserService } from "../../data/data-service";
import { Cell_List } from "../../data/entity";

@Component({
  selector: 'app-find-cell',
  imports: [
        MatProgressSpinnerModule,
        MatFormFieldModule,
        MatSelectModule,
        FormsModule,
        MatIconModule,
        MatMenuModule,
        MatInputModule,
        MatAutocompleteModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        MatButtonModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatDividerModule,
        MatTooltipModule
    ],
    providers: [DataService, UserService],
  templateUrl: './find-cell.html',
  styleUrl: './find-cell.css',
})
export class FindCell implements OnInit {
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    me!: User | null;
    title = "Search Cell";
    _location = '_blank';
    IsWait = false;
    manage = true;
    species_list!: Id_Data[];
    keyword = "";
    name = "";
    disease = "";
    action = "";
    species: number | null = null;
    selected_cell = -1;
    pagesize = 20;
    cell_list!: Cell_List[];

    dataSource = new MatTableDataSource(this.cell_list);
    displayedColumns = [
        "name",
        "id",
        "batch_count",
        "accession_count",
        "species_name",
        "source_tissue",
        "source_type",
        "disease",
        "cellosaurus_id",
        "reference",
        "comments"
    ];
    columns = [
        {
            columnDef: "id",
            header: "ID",
            cell: (element: Cell_List) => `${element.id ? element.id : ""}`
        },
        {
            columnDef: "synonyms",
            header: "Synonyms",
            cell: (element: Cell_List) => `${element.synonyms ? element.synonyms : ""}`
        },
        {
            columnDef: "species_name",
            header: "Species",
            cell: (element: Cell_List) => `${element.species_name ? element.species_name : ""}`
        },
        {
            columnDef: "source_tissue",
            header: "Source Tissue",
            cell: (element: Cell_List) => `${element.source_tissue ? element.source_tissue : ""}`
        },
        {
            columnDef: "source_type",
            header: "Source Type",
            cell: (element: Cell_List) => `${element.source_type ? element.source_type : ""}`
        },
        {
            columnDef: "disease",
            header: "Disease",
            cell: (element: Cell_List) => `${element.disease ? element.disease : ""}`
        },
        {
            columnDef: "comments",
            header: "Comment",
            cell: (element: Cell_List) => `${element.comments ? element.comments : ""}`
        },
        {
            columnDef: "cellosaurus_id",
            header: "Cellosaurus",
            cell: (element: Cell_List) => `${element.cellosaurus_id ? element.cellosaurus_id : ""}`
        },
        {
            columnDef: "reference",
            header: "Reference",
            cell: (element: Cell_List) => `${element.reference ? element.reference : ""}`
        }
    ];

    constructor(
        private service: DataService,
        private _router: Router,
        public dialog: MatDialog,
        private cdr: ChangeDetectorRef,
        private titleService: Title,
        @Optional() public dialogRef: MatDialogRef<FindCell>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: { action: string; title: string }
    ) {
        this.titleService.setTitle("Find Cell");
        if (data) {
            this.action = data.action;
            this.title = data.title;
            if (this.action) {
                this.manage = false;
                this.pagesize = 10;
            }
        }
    }

    ngOnInit(): void {
        this.me = UserService.getUser();
        this.get_select_list();

        let s = UserService.getSetting();

        if (s.link)
        {
            this._location = '_blank'
        }else{
            this._location = '_self'
        }
    }

    get_select_list() {
        this.service.getData("cell_select_data").subscribe((result) => {
            var x: any = result;
            try {
                this.species_list = x.species.values;
            } catch (error) {
                console.log(error);
            }
        });
    }

    search() {
        let param = "",
            condition = 0;
        if (this.keyword) {
            param += "&keyword=" + this.keyword.toUpperCase().replace(/[^A-Z0-9]/g, "");
            condition++;
        }

        if (this.name) {
            param += "&name=" + this.name;
            condition++;
        }

        if (this.disease) {
            param += "&disease=" + this.disease;
            condition++;
        }

        if (this.species) {
            param += "&species=" + this.species;
            condition++;
        }

        if (condition == 0) {
            alert("Please enter at least one search criteria");
        } else {
            this.IsWait = true;
            this.service.getData("search_cell", param).subscribe((result) => {
                var x: any = result;
                try {
                    this.cell_list = x.data.values;
                    this.dataSource = new MatTableDataSource(this.cell_list);
                    this.dataSource.sort = this.sort;
                    this.dataSource.paginator = this.paginator;
                    this.IsWait = false;
                } catch (error) {
                    console.log(error);
                }
            });
        }
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        console.log(filterValue);
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    announceSortChange(sortState: Sort) {
        // This example uses English messages. If your application supports
        // multiple language, you would internationalize these strings.
        // Furthermore, you can customize the message to add additional
        // details about the values being sorted.
        /**    console.log("Changing sorting direction! " + this.to_string(sortState));
                if (sortState.direction) {
                    this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
                } else {
                    this._liveAnnouncer.announce('Sorting cleared');
                }
                */
    }

    row_selected(id: number) {
        return this.selected_cell == id && !this.manage;
    }

    cell_edit(id: number) {
        this._router.navigate([]).then((result) => {
            window.open("cell/" + id, this._location);
        });
    }

    cell_add(id: number) {
        //console.log("Base cell ID is " +  id);
        this._router.navigate([]).then((result) => {
            window.open("accession/new?cell_id=" + id, this._location);
        });
    }

    cell_copy(id: number) {
        this._router.navigate([]).then((result) => {
            window.open("basecell/" + id + "?dup=Y", this._location);
        });
    }

    view_batch(id: number) {
        this._router.navigate([]).then((result) => {
            window.open("find/batch?type=cell&id=" + id, this._location);
        });
    }

    view_accession(id: number) {
        this._router.navigate([]).then((result) => {
            window.open("find/accession?type=cell&id=" + id, this._location);
        });
    }

    mouseClickHandler(rowIndex: number, element: Cell_List, event: MouseEvent) {
        //let data : Access_Group[] = this.dataSource.sortData(this.group, this.sortGroup);
        this.selected_cell = element.id;
    }

    select() {
        this.dialogRef.close(this.selected_cell);
    }

    close() {
        this.dialogRef.close(-1);
    }
}
