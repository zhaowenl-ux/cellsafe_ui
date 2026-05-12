import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { CommonModule, DatePipe } from "@angular/common";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MatInputModule } from "@angular/material/input";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { Dialog } from "@angular/cdk/dialog";

import { Order, Address } from "../../data/order";
import { Batch, Provenance } from "../../data/entity";
import { User, DataService, UserService, ConfigService } from "../../data/data-service";
import { Id_Data, Sid_Data, Name_Data } from "../../data/data";
import { HistoryForm} from '../../common/history-form/history-form';

@Component({
  selector: 'app-order-form',
      imports: [
        MatProgressSpinnerModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatExpansionModule,
        MatAutocompleteModule,
        CommonModule,
        MatInputModule,
        FormsModule,
        MatCheckboxModule,
        MatNativeDateModule,
        MatCardModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatTableModule
    ],
  providers: [DataService, UserService, ConfigService],
  templateUrl: './order-form.html',
  styleUrl: './order-form.css',
})
export class OrderForm implements OnInit {
    SEP = "||";
    id = -1;
    batch_id = -1;
    order = new Order();
    order_label = "Order a Cell-line Batch";
    IsWait = false;
    cell!: Batch;
    user_name = "user";
    me!: User | null;
    address_list!: Id_Data[];
    address = new Address();
    current_address!: Address;
    shipping_address = new FormControl();
    action = "order";  // order, approve, fill
    new_address = false;
    can_approve = false;
    can_fill = false;
    minDate: Date;
    num_flag = 0;
    flag: string[] = [];
    provenance: Provenance[] = new Array();
    provenance_config : any;
    provenance_displayedColumns = [
        "source",
        "relevent",
        "restriction",
        "contract_name",
        "comment",
    ];
    provenance_columns = [
         {
            columnDef: "source",
            header: "Source",
            cell: (element: Provenance) => `${element.source_name ? element.source_name : ""}`
        },
        {
            columnDef: "relevent",
            header: "Relevent",
            cell: (element: Provenance) => `${element.relevent ? element.relevent : ""}`
        },
        {
            columnDef: "contract_name",
            header: "Contract Name",
            cell: (element: Provenance) => `${element.contract_name ? element.contract_name : ""}`
        },
         {
            columnDef: "restriction",
            header: "Restrictions",
            cell: (element: Provenance) => `${element.restriction ? element.restriction : ""}`
        },
        {
            columnDef: "comment",
            header: "Comments",
            cell: (element: Provenance) => `${element.comment ? element.comment : ""}`
        }
    ];

    /*
     * Potential values are request, edit, approve and fill
     */

    dataSource = new MatTableDataSource(this.provenance);

    excludeWeekends = (date: Date | null): boolean => {
        const day = (date || new Date()).getDay();
        // Return true for weekdays (Monday to Friday)
        return day !== 0 && day !== 6;
    };
    constructor(
        private service: DataService,
        private router: ActivatedRoute,
        private _router: Router,
        public dialog: Dialog,
        private titleService: Title,
        private cdr : ChangeDetectorRef,
        private config_service: ConfigService
    ) {
        this.provenance_config = this.config_service.get("provenance");
        this.minDate = new Date();
        this.minDate.setDate(this.minDate.getDate() + 3);
        this.provenance_columns.push({
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
        })

        if (this.provenance_config["rule1"].display) {
            this.provenance_displayedColumns.push("rule1");
        }
        if (this.provenance_config["rule2"].display) {
            this.provenance_displayedColumns.push("rule2");
        }
        if (this.provenance_config["rule3"].display) {
            this.provenance_displayedColumns.push("rule3");
        }
        if (this.provenance_config["rule4"].display) {
            this.provenance_displayedColumns.push("rule4");
        }
        if (this.provenance_config["rule5"].display) {
            this.provenance_displayedColumns.push("rule5");
        }
    }

    ngOnInit(): void {
        //this.access_group.
        this.shipping_address.valueChanges.subscribe((x) => {
            //console.log(x instanceof Author);
            //console.log("paramter is " + x);

            this.get_address(x);
        });

        let sid = this.router.snapshot.paramMap.get("id") + "";
        //console.log("request id is " + sid);
        if (isNaN(Number(sid))) {
            this.id = -1;
        } else {
            this.id = Number(sid);
        }

        this.get_user(0);
        this.router.queryParams.subscribe((params) => {
            //console.log(params);
            //this.email = params.email;
            //console.log(params["batch_id"]);
            let sid = params["batch_id"];
            if (!isNaN(Number(sid))) {
                this.batch_id = Number(sid);
            }

            if (params["action"]) {
                this.action = params["action"];
            }
            //this.batch_label = this.batch_id < 0 || this.dup ? "New Cell Batch" : "Cell Batch " + this.batch_id;
        });
        //console.log("request id is " + this.req_id);
        if (this.id > 0) {
            this.get_order();
        } else {
            if (this.batch_id < 0) {
                alert("No cell to order!");
                window.close();
            }
            this.order_label = "New Order";
            this.order = new Order();
            const datepipe: DatePipe = new DatePipe("en-US");
            let d = new Date();
            let str = datepipe.transform(d, "yyyy-MM-dd");
            if (str) {
                this.order.order_date = str;
            }
            this.titleService.setTitle("New Order");
            this.order.cell_batch_id = this.batch_id;
            if (this.me) {
                this.order.requestor = this.me.id;
                this.order.requestor_name = this.me.name;
            }
        }
    }

    get_order() {
        this.titleService.setTitle("Order " + this.id);
        let _filter = "&id=" + this.id;
        this.service.getData("order_detail", _filter).subscribe((result) => {
            var x: any = result;
            this.order = new Order();
            this.order.assign_value(x.data.values[0]);
            this.order_label = "Order " + this.id + " (" + this.order.status + ")";

            this.current_address = x.addr.values[0];
            if (this.order.shipping_id) {
                this.shipping_address.setValue(
                    new Id_Data(this.order.shipping_id, this.order.shipping_address)
                );
            }
            this.cell = x.cell.values[0];
            try {
                this.can_approve = x.can_approve.values[0].existed > 0 ? true : false;
            } catch (error) {
                // do nothing
            }
           
            try {
                this.can_fill = x.can_fill.values[0].can_fill == 'Y' ? true : false;
            } catch (error) {
                // do nothing
            }
            //console.log(typeof this.request_list[0]);
            if (this.id > 0 && this.order.status == "NEW" && this.can_approve) {
                //this.get_flag();
                this.get_batch_provenance();
            }
            this.IsWait = false;
        });
    }

    get_batch_provenance() {
        let _filter = "&id=" + this.order.cell_batch_id;
        this.service.getData("batch_provenance", _filter).subscribe((result) => {
            var x: any = result;
            this.provenance = x.provenance.values;
             for (var i = 0; i < this.provenance.length; i++) {
                this.provenance[i].rule1 = (x.provenance.values[i]["rule1"] == 't') ? true : false;
                this.provenance[i].rule2 = (x.provenance.values[i]["rule2"] == 't') ? true : false;
                this.provenance[i].rule3 = (x.provenance.values[i]["rule3"] == 't') ? true : false;
                this.provenance[i].rule4 = (x.provenance.values[i]["rule4"] == 't') ? true : false;
                this.provenance[i].rule5 = (x.provenance.values[i]["rule5"] == 't') ? true : false;
                this.provenance[i].relevent = (x.provenance.values[i]["relevent"] == 't') ? true : false;
            }
            this.dataSource = new MatTableDataSource(this.provenance);
            this.cdr.detectChanges();

            if (this.provenance.length > 0){
                this.id_flag();
            }
        });
    }

    id_flag(){
        for (var i = 0; i< this.provenance.length; i++){
            if (this.provenance[i].relevent){
                // only work with the relevent one
                // compare each rule.
                let s = 'Provenace ' + this.provenance[i].id + ':';
                let has_flag = false;

                if (this.order.rule1 && this.provenance_config['rule1'].display  && ! this.provenance[i].rule1){
                    has_flag = true;
                    s += this.provenance_config['rule1'].name + ' violated! ';
                } 
                
                if (this.order.rule2 && this.provenance_config['rule2'].display  && ! this.provenance[i].rule2){
                    has_flag = true;
                    s += this.provenance_config['rule2'].name + ' violated! ';
                }

                if (this.order.rule3 && this.provenance_config['rule3'].display  && ! this.provenance[i].rule3){
                    has_flag = true;
                    s += this.provenance_config['rule3'].name + ' violated! ';
                }

                if (this.order.rule4 && this.provenance_config['rule4'].display  && ! this.provenance[i].rule4){
                    has_flag = true;
                    s += this.provenance_config['rule4'].name + ' violated! ';
                }

                if (this.order.rule5 && this.provenance_config['rule5'].display  && ! this.provenance[i].rule5){
                    has_flag = true;
                    s += this.provenance_config['rule5'].name + ' violated! ';
                }

                if (has_flag){
                    this.flag.push(s);
                    this.num_flag ++;
                }
            }
        }
        this.cdr.detectChanges();
        
    }

    get_user(count: number) {
        //console.log("get user after 1000 ms");
        count++;
        if (count > 5) {
            this._router.navigate([]).then((result) => {
                window.open("unauthorized?title=Unknown User - Register Batch");
            });
            // only try three times
        }
        this.me = UserService.getUser();
        if (this.batch_id < 0 && this.me && this.me.admin < 0 && this.me.batch < 0) {
            this._router.navigate([]).then((result) => {
                window.open("unauthorized?title=Unauthorized Access - Register Batch");
            });
        }

        if (this.batch_id > 0 && this.me) {
            if (this.me.admin < 0 && this.me.batch < 0) {
                this.disable();
            }
        }
        //console.log(this.me);
        if (!this.me) {
            //console.log("try again " + count);
            setTimeout(() => {
                this.get_user(count);
            }, 1000);
        }
    }

    disable() {}

    displayFn(addr: Id_Data): string {
        return addr && addr.name ? addr.name : "";
    }

    get_address(value: any) {
        if (typeof value === "object" || value.length < 3) {
            return;
        }

        var filter: string;

        if (isNaN(Number(value))) {
            filter = "name=" + value;
        } else {
            filter = "id=" + value;
        }
        this.service.getData("shipping_address", filter).subscribe((result) => {
            //return x;
            var x: any = result;
            var a: Id_Data[];
            //alert(x);
            //alert(x.data.values.length);
            a = x.data.values;
            //console.log("there are " + a.length + " authors");
            this.address_list = a;
            if (this.address_list.length === 1) {
                this.shipping_address.setValue(this.address_list[0]);
            }
            return a;
        });
    }

    save_order() {
        if (!this.order.order_needed) {
            alert("Date needed is required!");
            return;
        }

        if (this.shipping_address.value) {
            this.order.shipping_id = this.shipping_address.value.id;
        }
        let post_data = Order.to_json(this.order);
        Object.assign(post_data, { type: "update_order" });
        this.service.post_request(post_data).subscribe((result) => {
            var x: any = result;
            //console.log(JSON.stringify(x));
            if (x.code > 0) {
                alert("Order is submitted!");
                this.id = x.code;
                this.get_order();
            } else {
                alert(x["message"]);
            }
        });
    }

    del_order() {
        let rel = window.confirm("Do you really want to delete this order?");
        if (rel) {
            let data = { type: "delete_order", id: this.id };
            this.service.post_request(data).subscribe((result) => {
                var x: any = result;
                //console.log(JSON.stringify(x));

                if (x.code > 0) {
                    alert(x["message"]);
                    window.close();
                } else {
                    alert(x["message"]);
                }
            });
        }
    }

    approve_order() {
        if (this.num_flag > 0) {
            let result = window.confirm("There are flags about the order, do you really want to approve it?");
            if (!result) {
                return;
            }
        }
        let data = { type: "approve_order", id: this.id };
        this.service.post_request(data).subscribe((result) => {
            var x: any = result;
            //console.log(JSON.stringify(x));

            if (x.code > 0) {
                alert(x["message"]);
                this.get_order();
                console.log(this.flag);
            } else {
                alert(x["message"]);
            }
        });
    }

    deny_order() {
        let reason = prompt("Please enter a reason to deny the order!");
        if (reason != null && reason.length > 3) {
            let data = { type: "deny_order", id: this.id, msg: reason };
            this.service.post_request(data).subscribe((result) => {
                var x: any = result;
                //console.log(JSON.stringify(x));

                if (x.code > 0) {
                    alert(x["message"]);
                    this.get_order();
                    console.log(this.flag);
                } else {
                    alert(x["message"]);
                }
            });
        }else
        {
            alert("You must provide a valid reason to deny a order.")
        }
    }

    fill_order() {
        let message = prompt("Please enter a message to requestor!");
        if (message){
            let data = { type: "fill_order", id: this.id, msg: message };
            this.service.post_request(data).subscribe((result) => {
                var x: any = result;
                //console.log(JSON.stringify(x));

                if (x.code > 0) {
                    alert(x["message"]);
                    this.get_order();
                } else {
                    alert(x["message"]);
                }
            });
        }
    }
    
    history() { 
        //console.log("open histiry window");
        this.dialog.open(HistoryForm, {
            minWidth: "300px", 
            panelClass: "custom-dialog",
            data: { type: "order_history", entity_id: this.id }
        });
    }
}
