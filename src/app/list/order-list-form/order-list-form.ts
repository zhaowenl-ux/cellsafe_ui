import { Component, OnInit, ViewChild } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatButtonModule } from "@angular/material/button";
import { MatSelectModule, MatSelect } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { Router } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { MatTableDataSource, MatTableModule, MatTable } from "@angular/material/table";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatDividerModule } from "@angular/material/divider";
import { MatSort, Sort, MatSortModule } from "@angular/material/sort";
import { Dialog } from "@angular/cdk/dialog";

import { Order } from "../../data/order";
import { User, DataService, UserService, ConfigService } from "../../data/data-service";
import { Sid_Data } from "../../data/data";
import {HistoryForm} from '../../common/history-form/history-form';

@Component({
  selector: 'app-order-list-form',
  imports: [
        MatProgressSpinnerModule,
        MatSortModule,
        MatDividerModule,
        MatTableModule,
        MatPaginatorModule,
        MatInputModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatSelectModule
    ],
  providers: [DataService, UserService, ConfigService],
  templateUrl: './order-list-form.html',
  styleUrl: './order-list-form.css',
})
export class OrderListForm implements OnInit {
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild("el_status_control") el_status_control!: MatSelect;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    IsWait = false;
    showRange: boolean = false;
    provenance_config : any;
    me!: User | null
    can_approve = false;
    can_fill = false;
    readonly range = new FormGroup({
        start: new FormControl<Date | null>(null),
        end: new FormControl<Date | null>(null)
    });

    readonly period_list: Sid_Data[] = [
        new Sid_Data("365", "Past Year"),
        new Sid_Data("90", "Past Quarter"),
        new Sid_Data("30", "Past Month"),
        new Sid_Data("-1", "Any Period")
    ];
    status_list = Order.STATUS_LIST;
    period_control = new FormControl("365");
    status_control = new FormControl(["NEW", "APPROVED"]);
    old_status: string[] = ["NEW", "APPROVED"];
    order_list: Order[] = [];

    // for the order list table
    displayedColumns = [
        "id",
        "requestor_name",
        "order_date",
        "status",
        "cell_batch_id",
        "cell_batch_name"
    ];
    dataSource = new MatTableDataSource(this.order_list);
    columns = [
        {
            columnDef: "requestor_name",
            header: "Requestor",
            cell: (element: Order) => `${element.requestor_name ? element.requestor_name : ""}`
        },
        {
            columnDef: "order_date",
            header: "Order Date",
            cell: (element: Order) => `${element.order_date ? element.order_date : ""}`
        },
        {
            columnDef: "status",
            header: "Status",
            cell: (element: Order) => `${element.status ? element.status : ""}`
        },
        {
            columnDef: "cell_batch_id",
            header: "Cell Batch ID",
            cell: (element: Order) => `${element.cell_batch_id ? element.cell_batch_id : ""}`
        },
        {
            columnDef: "cell_batch_name",
            header: "Cell Name",
            cell: (element: Order) => `${element.cell_batch_name ? element.cell_batch_name : ""}`
        }
    ];
    constructor(
        private service: DataService,
        private _router: Router,
        public dialog: Dialog,
        private titleService: Title,
        private config_service: ConfigService
    ) {
        this.titleService.setTitle("Order List");
        this.provenance_config = this.config_service.get("provenance");
                
        if (this.provenance_config) {
            this.columns.push({
                columnDef: "rule1",
                header: this.provenance_config["rule1"].order,
                cell: (element: Order) => `${element.rule1}`
            },
            {
                columnDef: "rule2",
                header: this.provenance_config["rule2"].order,
                cell: (element: Order) => `${element.rule2}`
            },
            {
                columnDef: "rule3",
                header: this.provenance_config["rule3"].order,
                cell: (element: Order) => `${element.rule3}`
            },
            {
                columnDef: "rule4",
                header: this.provenance_config["rule4"].order,
                cell: (element: Order) => `${element.rule4}`
            },
            {
                columnDef: "rule5",
                header: this.provenance_config["rule5"].order,
                cell: (element: Order) => `${element.rule5}`
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
        this.me = UserService.getUser();
        this.getReport();
    }

    check_date(): void {
        let period: string | null = this.period_control.value;
        if (period === "-1") {
            this.IsWait = false;
            this.showRange = true;
        } else {
            this.showRange = false;
            this.getReport();
        }
        /*
        if (period != null) {
            period = "day=" + period;
        }*/
    }


    check_status(): string | null {
        let status: string | null = null;
        if (!this.status_control.value || this.status_control.value.length == 0) {
            alert("please choose at least one status");
            this.status_control.setValue(this.old_status);
        } else {
            status = "&status=(";
            var comma = "";
            for (var s in this.status_control.value) {
                status += comma + "'" + this.status_control.value[s] + "'";
                comma = ",";
            }
            status += ")";
            this.old_status = this.status_control.value;
        }
        //let status: string | undefined = this.status_control.value?.join(",");
        try {
            this.el_status_control.close();
        } catch (e) {
            // doing nothing
        }
        return status;
    }

    get_date(): string | null {
        let period: string | null = this.period_control.value;
        let date_str: string | null = null;
        if (period != null && period != "-1") {
            date_str = "day=" + period;
        } else {
            const datepipe: DatePipe = new DatePipe("en-US");
            let date_start = datepipe.transform(this.range.value.start, "yyyy-MM-dd");
            let date_end = datepipe.transform(this.range.value.end, "yyyy-MM-dd");
            date_str = "";
            if (date_start) {
                date_str += "date_low=" + date_start;
            }
            if (date_end) {
                date_str += "&date_high=" + date_end;
            }
        }

        return date_str;
    }

    getReport() {
        this.IsWait = true;

        let status: string | null = this.check_status(),
            period: string | null = this.get_date();

        if (status != null && period != null) {
            let _filter: string = period + status;
            this.runReport(_filter);
        }
    }

    runReport(_filter: string): void {
        console.log("Filter is " + _filter);
        this.service.getData("order_list", _filter).subscribe((result) => {
            var x: any = result;
            this.order_list = x.data.values;
             for (var i = 0; i < this.order_list.length; i++) {
                this.order_list[i].rule1 = (x.data.values[i]["rule1"] == 't') ? true : false;
                this.order_list[i].rule2 = (x.data.values[i]["rule2"] == 't') ? true : false;
                this.order_list[i].rule3 = (x.data.values[i]["rule3"] == 't') ? true : false;
                this.order_list[i].rule4 = (x.data.values[i]["rule4"] == 't') ? true : false;
                this.order_list[i].rule5 = (x.data.values[i]["rule5"] == 't') ? true : false;
            }
            this.dataSource = new MatTableDataSource(this.order_list);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;

            //console.log(this.request_list);
            //console.log(typeof this.request_list[0]);
            this.IsWait = false;
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

    edit(id: number) {
        this._router.navigate([]).then((result) => {
            window.open("order/" + id, "_blank");
        });
    }
    history(id: number) {
        console.log("open histiry window");
        this.dialog.open(HistoryForm, {
            minWidth: "300px", 
            panelClass: "custom-dialog",
            data: { entity_id: id, type: "order_history" }
        });

    }
    approve(id: number) {
        this._router.navigate([]).then((result) => {
            window.open("order/" + id, "_blank");
        });
    }
    fill(id: number) {}
    exportAsExcel() {}
}
