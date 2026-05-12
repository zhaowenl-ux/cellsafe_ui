import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild, Optional, Inject } from "@angular/core";
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
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import {MatCheckboxModule} from '@angular/material/checkbox';
import * as XLSX from "xlsx";

import { Id_Data, Name_Data } from "../../data/data";
import { User, DataService, UserService } from "../../data/data-service";
import { Batch_List, Batch } from "../../data/entity";
import { DisplayField } from "../../setting/display-field/display-field";

@Component({
  selector: 'app-find-batch',
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
        MatTooltipModule,
        MatCheckboxModule
    ],
    providers: [DataService, UserService],
    templateUrl: './find-batch.html',
    styleUrl: './find-batch.css',
})
export class FindBatch implements OnInit {
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild("el_gmo") el_gmo!: ElementRef<HTMLInputElement>;
    _location = '_blank'
    on_search = true;
    title = "Search Cell-line Batches";
    IsWait = false;
    IsAdmin = true;
    selection = false;
    child_batch = false;
    keyword = "";
    batch_name = "";
    me!: User | null;
    species_list!: Id_Data[];
    tag_list!: Id_Data[];
    reporter_list!: Id_Data[];
    species: number | null = null;
    tag: number | null = null;
    reporter: number | null = null;
    gene = new FormControl("");
    cell_source = new FormControl();
    accession_status_list = ["PASSIVE", "ACTIVE", "DISCARDED"];
    accession_status = new FormControl(["PASSIVE", "ACTIVE"]);
    gmo_list = ["Yes", "No"];
    gmo = new FormControl(this.gmo_list);
    tank_list!: Id_Data[];
    tank = new FormControl();
    gene_list!: Id_Data[];
    cell_source_list!: Id_Data[];
    batch_list!: Batch_List[];
    passage_query = ""

    // customize searching field
    search_field = {
        Gene: false,
        Source: false,
        Tag: false,
        Reporter: false,
        "Genetically Modified": false,
        Tank: false,
        Passage: false
    };

    more_field = false;
    selected_batch = -1;
    // For table
    readonly default_column = [
        "batch_name",
        "batch_id",
        "batch_parent_batch",
        "vial_count",
        "biosafety_id",
        "accession_name",
        "cell_name",
        "cell_species_name",
        "gene_symbol",
        "biosafety_gmo",
        "accession_tag_name",
        "accession_reporter_name",
        "cell_disease",
        "batch_passage",
        "batch_dissociation_solution",
        "accession_cell_source_name",
        "accession_status",
        "biosafety_expiration_date",
        "batch_contact_person_name",
        "batch_comments",
        "accession_comments",
        "cell_comments"
    ];

    displayedColumns = this.default_column;
    dataSource = new MatTableDataSource(this.batch_list);

    public static readonly ALL_COLUMNS = [
        /*{
            columnDef: "batch_name",
            header: "Batch Name",
            cell: (element: Batch_List) => `${element.batch_name ? element.batch_name : ""}`
        },
        {
            columnDef: "accession_name",
            header: "Accession Name",
            cell: (element: Batch_List) => `${element.accession_name ? element.accession_name : ""}`
        },
        {
            columnDef: "basecell_name",
            header: "Base Cell Name",
            cell: (element: Batch_List) => `${element.basecell_name ? element.basecell_name : ""}`
        },*/
        {
            columnDef: "batch_id",
            header: "Batch ID",
            cell: (element: Batch_List) => `${element.batch_id ? element.batch_id : ""}`
        },
        {
            columnDef: "batch_parent_batch",
            header: "Parent Batch",
            cell: (element: Batch_List) => `${element.batch_parent_batch ? element.batch_parent_batch : ""}`
        },
        {
            columnDef: "vial_count",
            header: "# vials",
            cell: (element: Batch_List) => `${element.vial_count ? element.vial_count : ""}`
        },
        {
            columnDef: "cell_species_name",
            header: "Species",
            cell: (element: Batch_List) => `${element.cell_species_name ? element.cell_species_name : ""}`
        },
        {
            columnDef: "gene_symbol",
            header: "Gene",
            cell: (element: Batch_List) => `${element.gene_symbol ? element.gene_symbol : ""}`
        },
        {
            columnDef: "accession_tag_name",
            header: "Tag",
            cell: (element: Batch_List) => `${element.accession_tag_name ? element.accession_tag_name : ""}`
        },
        {
            columnDef: "accession_reporter_name",
            header: "Reporter",
            cell: (element: Batch_List) => `${element.accession_reporter_name ? element.accession_reporter_name : ""}`
        },
        {
            columnDef: "biosafety_gmo",
            header: "Genetically Modified",
            cell: (element: Batch_List) => `${element.biosafety_gmo ? element.biosafety_gmo : ""}`
        },
        {
            columnDef: "cell_disease",
            header: "Disease",
            cell: (element: Batch_List) => `${element.cell_disease ? element.cell_disease : ""}`
        },
        {
            columnDef: "batch_passage",
            header: "Passage",
            cell: (element: Batch_List) => `${element.batch_passage ? element.batch_passage : ""}`
        },
        {
            columnDef: "batch_dissociation_solution",
            header: "Dissociation Solution",
            cell: (element: Batch_List) => `${element.batch_dissociation_solution ? element.batch_dissociation_solution : ""}`
        },
        {
            columnDef: "accession_contact_person_name",
            header: "Accession Contact",
            cell: (element: Batch_List) => `${element.accession_contact_person_name ? element.accession_contact_person_name : ""}`
        },
        {
            columnDef: "accession_cell_source_name",
            header: "Accession Source",
            cell: (element: Batch_List) => `${element.accession_cell_source_name ? element.accession_cell_source_name : ""}`
        },
        {
            columnDef: "accession_status",
            header: "Accession Status",
            cell: (element: Batch_List) => `${element.accession_status ? element.accession_status : ""}`
        },
        {
            columnDef: "biosafety_expiration_date",
            header: "Safety Expiration",
            cell: (element: Batch_List) =>
                `${element.biosafety_expiration_date ? element.biosafety_expiration_date : ""}`
        },
        {
            columnDef: "batch_comments",
            header: "Batch Comment",
            cell: (element: Batch_List) => `${element.batch_comments ? element.batch_comments : ""}`
        },
        {
            columnDef: "accession_comments",
            header: "Accession Comment",
            cell: (element: Batch_List) => `${element.accession_comments ? element.accession_comments : ""}`
        },
        {
            columnDef: "cell_comments",
            header: "Cell Comment",
            cell: (element: Batch_List) => `${element.cell_comments ? element.cell_comments : ""}`
        },
        {
            columnDef: "batch_contact_person_name",
            header: "Batch Contact",
            cell: (element: Batch_List) => `${element.batch_contact_person_name ? element.batch_contact_person_name : ""}`
        }
    ];

    columns = FindBatch.ALL_COLUMNS;
    constructor(
        private service: DataService,
        private _router: Router,
        private router: ActivatedRoute,
        public dialog: MatDialog,
        private cdr: ChangeDetectorRef,
        private titleService: Title,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: { type: string; title: string },
        @Optional() public dialogRef: MatDialogRef<FindBatch>
    ) {
        this.titleService.setTitle("Find Cell Batch");

        if (data) {
            this.title = data.title;
            if (data.type == "select") {
                this.selection = true;
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
                    case "accession":
                        this.search("&accession_id=" + params["id"]);
                        break;
                    case "list":
                        this.on_search = false;
                        this.get_data(params["id"]);
                        this.titleService.setTitle("User List " + params["id"]);
                        this.title = "User List " + params["id"];
                        break;
                }
            }
        });

        this.IsWait = false;
    }

    update_field(key: string) {
        this.search_field[key as keyof typeof this.search_field] =
            !this.search_field[key as keyof typeof this.search_field];
    }

    reset_accession_status() {}

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

    displayGene(gene: any) {
        return gene ? gene.name : null;
    }

    find_gene(name: string) {
        if (name.length > 3) {
            this.IsWait = true;
            let param = "&name=" + name;
            this.service.getData("gene", param).subscribe((result) => {
                var x: any = result;
                this.gene_list = x.data.values;
                this.cdr.detectChanges();
                this.IsWait = false;
            });
        }
    }
    get_init_data() {
        this.service.getData("batch_select_data").subscribe((result) => {
            var x: any = result;
            try {
                this.species_list = x.species.values;
                this.tag_list = x.tag.values;
                this.reporter_list = x.reporter.values;
                this.tank_list = x.tank.values;
                //this.accession_status = Name_Data.to_array( x.accession_status.value);
            } catch (error) {
                console.log(error);
            }
        });
    }

    clear_all() {
        this.keyword = "";
        this.batch_name = "";
        this.species = null;
        this.tag = null;
        this.reporter = null;
        this.gene = new FormControl("");
        this.cell_source = new FormControl();
        this.tank = new FormControl();
        this.accession_status = new FormControl(["PASSIVE", "ACTIVE"]);
        this.gmo = new FormControl(this.gmo_list);
    }

    row_selected(id: number) {
        return this.selected_batch == id && this.selection;
    }

    get_user(count: number) {
        console.log(count + ": get user after 1000 ms");
        count++;
        if (count > 5) {
            //return;
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

    view_vial(id: number) {
        this._router.navigate([]).then((result) => {
            window.open("inv/view/" + id, this._location);
        });
    }

    search(criteria?: string) {
        let param = "",
            condition = 0;

        if (criteria) {
            param = criteria;
            return this.run_search(param);
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

        if (this.child_batch){
            param += "&child_batch=Y";
            condition ++;
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

        if (this.keyword) {
            param += "&keyword=" + this.keyword.toUpperCase().replace(/[^A-Z0-9]/g, "");
            condition++;
        }

        if (this.batch_name) {
            param += "&batch_name=" + this.batch_name.toUpperCase().replace(/[^A-Z0-9]/g, "");
            condition++;
        }

        if (this.tank) {
            param += "&tank_id=" + this.tank.value;
            condition++;
        }

        // passage query
        if (this.passage_query) {
            const regex1: RegExp = /(\D+)(\d+)/i; 
            const match = this.passage_query.match(regex1);
            if (!match) {
                alert("Passage query format is invalid. Please use >5, <10, =3 format.");
                this.passage_query = "";
                return;
            }
            let operator = match[1].trim();
            let number = match[2];
            if (operator == "") {  
                operator = "=";
            }
            else if (operator != ">" && operator != "<" && operator != "=" && operator != ">=" && operator != "<=") {
                alert("Passage query operator is invalid. Please use >, >=, <,<=, = only.");
                this.passage_query = "";
                return;
            }

            if (isNaN(Number(number))) {
                alert("Passage query number is invalid. Please enter a valid number.");
                this.passage_query = "";
                return;
            }

            param += "&passage_query=" + operator + number;
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
            this.service.getData("search_batch", param).subscribe((result) => {
                var x: any = result;
                try {
                    this.batch_list = x.data.values;
                    this.dataSource = new MatTableDataSource(this.batch_list);
                    this.dataSource.sort = this.sort;
                    this.dataSource.paginator = this.paginator;
                    //this.dataSource.paginator = this.paginator_bottom;
                    this.IsWait = false;
                } catch (error) {
                    console.log(error);
                }
            });
    }

    get_data(id: string) {
        this.IsWait = true;
        this.service.getData("user_batch_list_detail", "&id=" + id).subscribe((result) => {
            var x: any = result;
            try {
                this.batch_list = x.data.values;
                this.dataSource = new MatTableDataSource(this.batch_list);
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
    // for Batch operation
    batch_edit(id: number) {
        this._router.navigate([]).then((result) => {
            window.open("batch/" + id, this._location);
        });
        
    }

    batch_copy(id: number) {
        this._router.navigate([]).then((result) => {
            window.open("batch/" + id + "?dup=Y", this._location);
        });
    }

    batch_store(id: number, name: string) {
        this._router.navigate([]).then((result) => {
            window.open("inv/man-box/box?cell_id=" + id + "&cell_name=" + name, this._location);
        });
    }

    batch_delete(id: number, inv: number) {
        if (inv > 0) {
            alert("Please remove all inventory of the cell-line before deleting the batch!");
            return;
        } else {
            if (confirm("Are you sure you want to delete this batch " + id + "?")) {
                console.log("User confirmed the action.");
                let data: Object = {
                    type: "delete_batch",
                    batch_id: id
                };
                this.service.post_request(data).subscribe((result) => {
                    var x: any = result;
                    //console.log(JSON.stringify(x));
                    if (x.code > 0) {
                        alert("Batch is deleted");

                        let index = this.batch_list.findIndex((d) => d.batch_id == id);
                        this.batch_list.splice(index, 1);
                        this.dataSource = new MatTableDataSource(this.batch_list);
                    } else {
                        alert("Can't delete the batch: " + x.message);
                    }
                    //this.request.req_id = x['result'];
                });
            }
        }
    }

    accession_edit(id: number) {
        this._router.navigate([]).then((result) => {
            window.open("accession/" + id, this._location);
        });
    }

    accession_addbatch(id: number) {
        this._router.navigate([]).then((result) => {
            window.open("batch/new?accession_id=" + id, this._location);
        });
    }

    accession_history(id: number) {}
    accession_delete(id: number) {}
    accession_provenance(id: number) {}
    // batch operation
    cell_edit(id: number) {
        this._router.navigate([]).then((result) => {
            window.open("cell/" + id, this._location);
        });
    }

    basecell_add(id: number) {
        this._router.navigate([]).then((result) => {
            window.open("accession?basecell_id=" + id, this._location);
        });
    }

    mouseClickHandler(rowIndex: number, element: Batch_List, event: MouseEvent) {
        //let data : Access_Group[] = this.dataSource.sortData(this.group, this.sortGroup);
        this.selected_batch = element.batch_id;
    }

    select() {
        this.dialogRef.close(this.selected_batch);
    }

    close() {
        this.dialogRef.close(-1);
    }

    view_safety(id: string) {
        const safety_id: string[] = id.split(" ");
        safety_id.forEach((sid) => {
            this._router.navigate([]).then((result) => {
                window.open("biosafety/" + sid, this._location);
            });
        });
    }

    load_pref() {
        this.service.getData("load_pref", "page=find-batch").subscribe((result) => {
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

    set_field() {
        let dialogRef = this.dialog.open(DisplayField, {
            minWidth: "1000px",
            width: "900px",
            height: "1000px",
            panelClass: "custom-dialog",
            disableClose: true,
            data: {
                target: "find-batch",
                field: this.displayedColumns
            }
        });

        dialogRef.afterClosed().subscribe((x) => {
            if (x != null && x.length > 1) {
                this.displayedColumns = x;
            }

            this.cdr.detectChanges();
        });
    }

    exportAsExcel() {
        console.log("export excel file");
        const datepipe: DatePipe = new DatePipe("en-US");
        let today = new Date();
        let formattedDate = datepipe.transform(today, "dd-MMM-yyyy");
        var wb = XLSX.utils.book_new();

        var ws = XLSX.utils.aoa_to_sheet(Batch.to_aoa(this.batch_list));
        XLSX.utils.book_append_sheet(wb, ws, "Cell Batch");
        /* save to file */
        XLSX.writeFile(wb, "Batch List" + formattedDate + ".xlsx");
    }
    
    batch_order(id: number){
        this._router.navigate([]).then((result) => {
            window.open("order/-1?batch_id=" + id, this._location);
        });
    }
}
