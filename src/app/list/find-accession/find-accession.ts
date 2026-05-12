import {
    Component,
    OnInit,
    ChangeDetectorRef,
    ViewChild,
    ChangeDetectionStrategy,
    Optional,
    Inject,
    ElementRef,
    Injector
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
import { Router, ActivatedRoute } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

import { Id_Data } from "../../data/data";
import { User, DataService, UserService } from "../../data/data-service";
import { Accession_List } from "../../data/entity";
import { DialogCell } from "../../common/dialog-cell/dialog-cell";
import { DisplayField } from "../../setting/display-field/display-field";

@Component({
  selector: 'app-find-accession',
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
  templateUrl: './find-accession.html',
  styleUrl: './find-accession.css',
})
export class FindAccession implements OnInit {
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild("el_gmo") el_gmo!: ElementRef<HTMLInputElement>;

    title = "Search Cell-line Accession";
    _location = '_blank';
    selected_accession = -1;
    pagesize = 50;
    action = "";
    manage = true;
    IsWait = false;
    IsAdmin = true;
    keyword = "";
    me!: User | null;
    species_list!: Id_Data[];
    tag_list!: Id_Data[];
    reporter_list!: Id_Data[];
    species: number | null = null;
    tag: number | null = null;
    reporter: number | null = null;
    gene = new FormControl("");
    cell_source = new FormControl();
    gene_list!: Id_Data[];
    cell_source_list!: Id_Data[];
    accession_list!: Accession_List[];
    accession_status_list = ["PASSIVE", "ACTIVE", "DISCARDED"];
    accession_status = new FormControl(["PASSIVE", "ACTIVE"]);
    gmo_list = ["Yes", "No"];
    gmo = new FormControl(this.gmo_list);

    // For table
    readonly default_column = [
        "accession_name",
        "accession_id",
        "biosafety_id",
        "cell_name",
        "batch_count",
        "provenance_count",
        "cell_species_name",
        "gene_symbol",
        "accession_tag_name",
        "accession_reporter_name",
        "biosafety_gmo",
        "cell_disease",
        "accession_cell_source_name",
        "accession_status",
        "biosafety_expiration_date",
        "accession_comments",
        "cell_comments"
    ];
    displayedColumns = this.default_column;
    dataSource = new MatTableDataSource(this.accession_list);

    public static readonly ALL_COLUMNS = [
        {
            columnDef: "accession_id",
            header: "Accession ID",
            cell: (element: Accession_List) => `${element.accession_id ? element.accession_id : ""}`
        },
        {
            columnDef: "cell_species",
            header: "Species",
            cell: (element: Accession_List) => `${element.cell_species ? element.cell_species : ""}`
        },
        {
            columnDef: "provenance_count",
            header: "# Provenance",
            cell: (element: Accession_List) => `${element.provenance_count ? element.provenance_count : 0}`
        },
        {
            columnDef: "cell_species_name",
            header: "Species",
            cell: (element: Accession_List) => `${element.cell_species_name ? element.cell_species_name : ""}`
        },
        {
            columnDef: "gene_symbol",
            header: "Gene",
            cell: (element: Accession_List) => `${element.gene_symbol ? element.gene_symbol : ""}`
        },
        {
            columnDef: "accession_tag_name",
            header: "Tag",
            cell: (element: Accession_List) => `${element.accession_tag_name ? element.accession_tag_name : ""}`
        },
        {
            columnDef: "accession_reporter_name",
            header: "Reporter",
            cell: (element: Accession_List) => `${element.accession_reporter_name ? element.accession_reporter_name : ""}`
        },
        {
            columnDef: "biosafety_gmo",
            header: "Genetically Modified",
            cell: (element: Accession_List) => `${element.biosafety_gmo =='t' ? "Yes" : "No"}`
        },
        {
            columnDef: "cell_disease",
            header: "Disease",
            cell: (element: Accession_List) => `${element.cell_disease ? element.cell_disease : ""}`
        },
        {
            columnDef: "accession_cell_source",
            header: "Accession Source",
            cell: (element: Accession_List) => `${element.accession_cell_source ? element.accession_cell_source : ""}`
        },
        {
            columnDef: "accession_cell_source_name",
            header: "Accession Source",
            cell: (element: Accession_List) => `${element.accession_cell_source_name ? element.accession_cell_source_name : ""}`
        },
        {
            columnDef: "accession_status",
            header: "Accession Status",
            cell: (element: Accession_List) => `${element.accession_status ? element.accession_status : ""}`
        },
        {
            columnDef: "biosafety_expiration_date",
            header: "Safety Expiration",
            cell: (element: Accession_List) =>
                `${element.biosafety_expiration_date ? element.biosafety_expiration_date : ""}`
        },
        {
            columnDef: "accession_comments",
            header: "Accession Comment",
            cell: (element: Accession_List) => `${element.accession_comments ? element.accession_comments : ""}`
        },
        {
            columnDef: "cell_comments",
            header: "Cell Comment",
            cell: (element: Accession_List) => `${element.cell_comments ? element.cell_comments : ""}`
        }
    ];

    columns = FindAccession.ALL_COLUMNS;
    constructor(
        private service: DataService,
        private _router: Router,
        private router: ActivatedRoute,
        public dialog: MatDialog,
        private cdr: ChangeDetectorRef,
        private injector: Injector,
        private titleService: Title,
        @Optional() public dialogRef: MatDialogRef<FindAccession>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: { action: string; title: string }
    ) {
        this.titleService.setTitle("Find Cell-line Accession");
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
        this.IsWait = true;
        this.me = UserService.getUser();
        if (this.me) {
            this.set_security();
        } else {
            this.get_user(0);
        }
        this.get_init_data();
        this.load_pref();

        let s = UserService.getSetting();

        if (s.link)
        {
            this._location = '_blank'
        }else{
            this._location = '_self'
        }

        this.gene.valueChanges.subscribe((x: any) => {
            //console.log(x instanceof Author);
            //console.log("paramter is " + x);

            this.find_gene(x);
        });

        this.cell_source.valueChanges.subscribe((x: any) => {
            //console.log(x instanceof Author);
            //console.log("paramter is " + x);

            this.find_source(x);
        });

        this.router.queryParams.subscribe((params) => {
            if (params["type"]) {
                switch (params["type"]) {
                    case "cell":
                        this.search("&cell_id=" + params["id"]);
                        break;
                }
            }
        });

        this.IsWait = false;
    }

    displayGene(gene: any) {
        return gene ? gene.name : null;
    }

    displaySource(source: any) {
        return source ? source.name : null;
    }

    find_source(name: string) {
        if (name && name.length > 2) {
            //this.IsWait = true;
            let param = "&name=" + name;
            this.service.getData("source", param).subscribe((result) => {
                var x: any = result;
                this.cell_source_list = x.data.values;
                //this.IsWait = false;
            });
        }
    }

    find_gene(name: string) {
        if (name.length > 2) {
            //this.IsWait = true;
            let param = "&name=" + name;
            this.service.getData("gene", param).subscribe((result) => {
                var x: any = result;
                this.gene_list = x.data.values;
                //this.IsWait = false;
            });
        }
    }

    get_init_data() {
        this.service.getData("accession_select_data").subscribe((result) => {
            var x: any = result;
            try {
                this.species_list = x.species.values;
                this.tag_list = x.tag.values;
                this.reporter_list = x.reporter.values;
            } catch (error) {
                console.log(error);
            }
        });
    }
    get_user(count: number) {
        console.log(count + ": get user after 1000 ms");
        count++;
        if (count > 5) {
            return;
            // only try five times
        }
        this.me = UserService.getUser();
        if (this.me) {
            this.set_security();
        }
        console.log(this.me);
        if (!this.me) {
            console.log("try again " + count);
            setTimeout(() => {
                this.get_user(count);
            }, 1000);
        }
    }

    set_security() {}

    search(criteria?: string) {
        let param = "",
            condition = 0;

        if (criteria) {
            param += criteria;
            return this.run_search(param);
        }

        if (this.gene.value) {
            let y: any = this.gene.value;
            param += "&gene_id=" + y.id;
            condition++;
        }

        if (this.cell_source.value) {
            console.log(this.cell_source.value);
            condition++;
            param += "&cell_source=" + this.cell_source.value.id;
        }

        if (this.species) {
            param += "&species=" + this.species;
            condition++;
        }

        if (this.tag) {
            param += "&tag=" + this.tag;
            condition++;
        }

        if (this.reporter) {
            param += "&reporter=" + this.reporter;
            condition++;
        }

        if (this.gmo.value == null || this.gmo.value.length == 0) {
            alert("You need select at least one Genetically Modified status");
            this.el_gmo.nativeElement.focus();
            return;
        } else if (this.gmo.value.length == 1) {
            param += "&gmo=" + this.gmo.value[0].charAt(0);
            condition++;
        }

        if (this.accession_status.value == null || this.accession_status.value.length == 0) {
            alert("Please select at least one accession status");
            return;
        } else {
            console.log(this.accession_status.value);
            param += "&accession_status=(";
            var comma = "";
            for (var s in this.accession_status.value) {
                param += comma + "'" + this.accession_status.value[s] + "'";
                comma = ",";
            }
            param += ")";

            condition++;
        }

        if (this.reporter) {
            param += "&reporter=" + this.reporter;
            condition++;
        }

        if (this.keyword) {
            param += "&keyword=" + this.keyword.toUpperCase().replace(/[^A-Z0-9]/g, "");
            condition++;
        }

        if (condition == 0) {
            alert("Please enter at least one search criteria");
        } else {
            this.run_search(param);
        }
    }

    run_search(param: string) {
        this.IsWait = true;
        this.service.getData("search_accession", param).subscribe((result) => {
            var x: any = result;
            try {
                this.accession_list = x.data.values;
                this.dataSource = new MatTableDataSource(this.accession_list);
                this.dataSource.sort = this.sort;
                this.dataSource.paginator = this.paginator;
                this.IsWait = false;
            } catch (error) {
                console.log(error);
            }
        });
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

    accession_edit(id: number, dup = false) {
        let _dup = dup ? "?dup=true" : "";
        this._router.navigate([]).then((result) => {
            window.open("accession/" + id + _dup, this._location);
        });
    }

    accession_addbatch(id: number) {
        this._router.navigate([]).then((result) => {
            window.open("batch/new?accession_id=" + id, this._location);
        });
    }

    accession_history(id: number) {}

    accession_delete(id: number) {
        let index = this.accession_list.findIndex((d) => d.accession_id == id);
        if (this.accession_list[index].batch_count > 0) {
            alert("You can't discard the accession, there are batches!");
        }
        let _dialogRef = this.dialog.open(DialogCell, {
            minWidth: "500px",
            height: "400px",
            panelClass: "custom-dialog",
            disableClose: true,
            injector: this.injector,
            data: {
                action: "select_date",
                title: "Set Discard Date"
            }
        });

        _dialogRef.afterClosed().subscribe((x) => {
            if (x) {
                if (confirm("Do you really want to discard the accession?") != true) {
                    return;
                }
                let data: Object = { type: "discard_accession", accession_id: id, date: x };
                this.service.post_request(data).subscribe((result) => {
                    //return x;
                    var x: any = result;
                    var a: string;
                    var outcome: number;
                    //alert(x);
                    //alert(x.data.values.length);
                    a = x.message;
                    outcome = x.code;
                    if (outcome < 0) {
                        alert("Can't discard the accession");
                    } else {
                        alert("Accession is discarded");
                        let index = this.accession_list.findIndex((d) => d.accession_id == id);
                        this.accession_list.splice(index, 1);
                        this.dataSource = new MatTableDataSource(this.accession_list);
                    }
                });
                //this.accession_id.setValue(x);
                //alert("success");
            }
        });
    }

    
    view_batch(id: number) {
        this._router.navigate([]).then((result) => {
            window.open("find/batch?type=accession&id=" + id, this._location);
        });
    }

    edit_cell(cell_id : number) {
        this._router.navigate([]).then((result) => {
            window.open("cell/" + cell_id, this._location);
        });
    }

    view_provenance(id: number) {
        this._router.navigate([]).then((result) => {
            window.open("provenance/" + id, this._location);
        });
    }
    
    row_selected(id: number) {
        return this.selected_accession == id && !this.manage;
    }
    select() {
        this.dialogRef.close(this.selected_accession);
    }
    close() {
        this.dialogRef.close(-1);
    }

    mouseClickHandler(rowIndex: number, element: Accession_List, event: MouseEvent) {
        //let data : Access_Group[] = this.dataSource.sortData(this.group, this.sortGroup);
        this.selected_accession = element.accession_id;
    }

    view_safety(id: string) {
        const safety_id: string[] = id.split(" ");
        safety_id.forEach((sid) => {
            this._router.navigate([]).then((result) => {
                window.open("biosafety/" + sid, this._location);
            });
        });
    }

    clear_all() {
        this.keyword = "";
        this.species = null;
        this.tag = null;
        this.reporter = null;
        this.gene = new FormControl("");
        this.cell_source = new FormControl();

        this.accession_status = new FormControl(["PASSIVE", "ACTIVE"]);
        this.gmo = new FormControl(this.gmo_list);
    }

    set_field() {
        let dialogRef = this.dialog.open(DisplayField, {
            minWidth: "1000px",
            width: "900px",
            height: "1000px",
            panelClass: "custom-dialog",
            disableClose: true,
            data: {
                target: "find-accession",
                field: this.displayedColumns
            }
        });

        dialogRef.afterClosed().subscribe((x) => {
            if (x != null && x.length > 1) {
                this.displayedColumns = x;
                this.cdr.detectChanges();
            }
        });
    }

    load_pref() {
        this.service.getData("load_pref", "page=find-accession").subscribe((result) => {
            var x: any = result;
            try {
                let pref = x.data.values[0].pref;
                let y = JSON.parse(pref);
                console.log(y);
                this.displayedColumns = y.displayedColumns;
                this.cdr.detectChanges();
                //this.set_column();
                //this.column_control = new FormControl(this.displayedColumns);
                //this.getReport();
            } catch (error) {
                this.displayedColumns = this.default_column;
                //this.column_control = new FormControl(this.displayedColumns);
                console.log(error);
                //this.getReport();
            }
        });
    }
}
