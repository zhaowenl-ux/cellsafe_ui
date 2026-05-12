import { Component, OnInit, ViewChild, ElementRef, Inject, ChangeDetectorRef, Optional } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { CommonModule, DatePipe } from "@angular/common";
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from "@angular/material/icon";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSelectModule, MatSelect } from "@angular/material/select";
import { MatSort, Sort, MatSortModule } from "@angular/material/sort";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { User, DataService, UserService, ConfigService } from "../../data/data-service";
import { Provenance } from "../../data/entity";
import { ProvenanceForm } from "../../entity/provenance-form/provenance-form";


@Component({
  selector: 'app-prov-list',
  imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        MatFormFieldModule,
        MatSortModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule
    ],
    providers: [DataService, UserService, ConfigService],
  templateUrl: './prov-list.html',
  styleUrl: './prov-list.css',
})
export class ProvList implements OnInit {
    me!: User | null;
    IsWait = false;
    label = "Manage Provenance";
    do_select = false;
    action = "";
    provenance_config : any;
    provenance!: Provenance[];
    selected_id = -1;

    dataSource = new MatTableDataSource(this.provenance);
    displayedColumns = [
        "id",
        "contract_name",
        "supplier_name",
        "contract_link",
        "contract_expiration"
    ];
    /**
    : string = '';
    : string = '';
    : string = '';
    */
    columns = [
        {
            columnDef: "contract_name",
            header: "Contract Name",
            cell: (element: Provenance) => `${element.contract_name ? element.contract_name : ""}`
        },
        {
            columnDef: "supplier_name",
            header: "Supplier Name",
            cell: (element: Provenance) => `${element.source_name ? element.source_name : ""}`
        },
        {
            columnDef: "contract_link",
            header: "Contract Link",
            cell: (element: Provenance) => `${element.contract_link ? element.contract_link : ""}`
        },
        {
            columnDef: "contract_expiration",
            header: "Expiration",
            cell: (element: Provenance) => `${element.contract_expiration ? element.contract_expiration : ""}`
        }
    ];
    constructor(
        private service: DataService,
        public dialog: MatDialog,
        private router: Router,
        private titleService: Title,
        private cdr : ChangeDetectorRef,
        private config_service: ConfigService,
        @Optional() public dialogRef: MatDialogRef<ProvList>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: { action: string; title: string }
    ) {
        if (data) {
            this.do_select = true;
            this.action = data.action;
            this.label = data.title;
        }
        this.provenance_config = this.config_service.get("provenance");
        
        if (this.provenance_config) {
            this.columns.push({
                columnDef: "rule1",
                header: this.provenance_config["rule1"].name,
                cell: (element: Provenance) => `${element.rule1}`
            },
            {
                columnDef: "rule2",
                header: this.provenance_config["rule2"].name,
                cell: (element: Provenance) => `${element.rule2}`
            },
            {
                columnDef: "rule3",
                header: this.provenance_config["rule3"].name,
                cell: (element: Provenance) => `${element.rule3}`
            },
            {
                columnDef: "rule4",
                header: this.provenance_config["rule4"].name,
                cell: (element: Provenance) => `${element.rule4}`
            },
            {
                columnDef: "rule5",
                header: this.provenance_config["rule5"].name,
                cell: (element: Provenance) => `${element.rule5}`
            });

            if (this.provenance_config["rule1"].display) {
                this.displayedColumns.push("rule1");
            }
            if (this.provenance_config["rule2"].display) {
                this.displayedColumns.push("rule2");
            }
            if (this.provenance_config["rule3"].display) {
                this.displayedColumns.push("rule3");
            }
            if (this.provenance_config["rule4"].display) {
                this.displayedColumns.push("rule4");
            }
            if (this.provenance_config["rule5"].display) {
                this.displayedColumns.push("rule5");
            }
            
        }
    }

    ngOnInit(): void {
        this.get_provenance();
        this.get_user(0);
    }

    get_user(count: number) {
        //console.log("get user after 1000 ms");
        count++;
        if (count > 5) {
            return;
            // only try three times
        }
        this.me = UserService.getUser();
        //console.log(this.me);
        if (!this.me) {
            //console.log("try again " + count);
            setTimeout(() => {
                this.get_user(count);
            }, 1000);
        }
    }

    get_provenance() {
        this.IsWait = true;
        this.service.getData("provenance").subscribe((result) => {
            var x: any = result;
            this.provenance = x.provenance.values;
            for (var i = 0; i < this.provenance.length; i++) {
                this.provenance[i].rule1 = (x.provenance.values[i]["rule1"] == 't') ? true : false;
                this.provenance[i].rule2 = (x.provenance.values[i]["rule2"] == 't') ? true : false;
                this.provenance[i].rule3 = (x.provenance.values[i]["rule3"] == 't') ? true : false;
                this.provenance[i].rule4 = (x.provenance.values[i]["rule4"] == 't') ? true : false;
                this.provenance[i].rule5 = (x.provenance.values[i]["rule5"] == 't') ? true : false;
            }
            this.dataSource = new MatTableDataSource(this.provenance);
            this.IsWait = false;
            this.cdr.detectChanges();
        });
    }

    edit(id: number) {
        this.router.navigate([]).then((result) => {
            window.open("provenance/" + id, "_blank");
        });
        /*
        let p: Provenance | null = null;
        for (var i = 0; i < this.provenance.length; i++) {
            if (this.provenance[i].provenance_id === id) {
                p = this.provenance[i];
            }
        }
        let dialogRef = this.dialog.open(ProvenanceComponent, {
            minWidth: "600px",
            panelClass: "custom-dialog",
            disableClose: true,
            data: {
                provenance: p
            }
        });

        dialogRef.afterClosed().subscribe(() => {
            this.refresh();
        });
        */
    }

    refresh() {
        this.get_provenance();
    }
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        //console.log(filterValue);
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

    select() {
        this.dialogRef.close(this.selected_id);
    }

    row_selected(id: number) {
        return this.selected_id == id;
    }

    close() {
        this.dialogRef.close(-1);
    }

    mouseClickHandler(element: Provenance, event: MouseEvent) {
        //let data : Access_Group[] = this.dataSource.sortData(this.group, this.sortGroup);
        if (element.id) {
            this.selected_id = element.id;
        }
    }

    add() {
        this.router.navigate([]).then((result) => {
            window.open("provenance/new", "_blank");
        });
    }

}
