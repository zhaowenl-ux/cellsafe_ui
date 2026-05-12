import { Component, Input, OnInit, Output, output,EventEmitter, ChangeDetectorRef } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule, MatMenuTrigger } from "@angular/material/menu";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { CdkMenu, CdkMenuItem, CdkContextMenuTrigger } from "@angular/cdk/menu";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";

import { Cell_Vial } from "../../data/container";
import { DataService, UserService } from "../../data/data-service";
import { Id_Data } from "../../data/data";
import { FindBatch } from "../../list/find-batch/find-batch";
import { ContainerDetail } from "../container-detail/container-detail";
import { environment } from "../../../environments/environment";

@Component({
  selector: 'app-vial-form',
  imports: [MatIconModule, MatMenuModule, CommonModule, MatButtonModule, CdkMenu, CdkContextMenuTrigger],
  providers: [DataService,UserService],
  templateUrl: './vial-form.html',
  styleUrl: './vial-form.css',
})
export class VialForm implements OnInit {
    @Input() item!: Cell_Vial;
    @Input() user_list!: Id_Data[];
    @Output() select_vial = new EventEmitter<{ pos: string; selected: boolean }>();
    @Output() checkout_vial = new EventEmitter<number>();
    onUpdate = output<string>(); 
    // Constants
    static readonly MY_LIST_SOURCE = 32;    
    readonly APP_PREFIX = environment.APP_PREFIX;
    readonly NAME_LENGTH = 22;
    readonly ERROR_NO_BARCODE = -11;
    readonly ERROR_NO_BOTTLE = -12;
    readonly ERROR_OTHER = -13;
    
    manage = true;
    //user_list !: Id_Data [];

    constructor(
        private service: DataService,
        private _router: Router,
        public dialog: MatDialog,
        private cdr : ChangeDetectorRef
    ) {}

    ngOnInit() {
        //this.get_user_list();
    }

    get_user_list() {
        this.service.getData("user_cont_list").subscribe((result) => {
            var x: any = result;
            this.user_list = x.list.values;
            //this.IsWait = false;
            this.user_list.push(new Id_Data(-1, "[New List]"));
        });
    }

    sel_vial(force?: boolean) {
        
        if (this.item.mat_id < 0 ) {
            if (force) {
                this.item.selected = true;
            } else {
                this.item.selected = !this.item.selected;
            }
            this.select_vial.next({ pos: this.item.x + "-" + this.item.y, selected: this.item.selected });
        }
    }

    set_sel_vial(selected: boolean) {
        console.log("call child:unselect vial " + this.item.x + "-" + this.item.y);
        this.item.selected = selected;
    }

    assign_name() {
        const name = prompt("Please enter a vial name:");
        if (name) {
            let data: Object = {
                type: "update_container",
                id: this.item.vial_id,
                field: "desc",
                value: name
            };
            this.service.post_request(data).subscribe((result) => {
                var x: any = result;
                //console.log(JSON.stringify(x));
                if (x.code > 0) {
                    this.load(-1);
                } else {
                    alert("Group is not assigned: " + x.message);
                }
                //this.request.req_id = x['result'];
            });
        }
    }

    container_class() {
        /*if (this.item.material_id > 0) {
            return "occupied";
        } else */
            if (this.item.selected) {
            return "selected";
        } else {
            return "";
        }
    }

    assign_barcode() {
        const name = prompt("Please scan the barcode:");
        if (name) {
            let data: Object = {
                type: "update_vial",
                id: this.item.vial_id,
                field: "barcode",
                value: name
            };
            this.service.post_request(data).subscribe((result) => {
                var x: any = result;
                //console.log(JSON.stringify(x));
                if (x.code > 0) {
                    this.load(-1);
                } else {
                    alert("Barcode is not assigned: " + x.message);
                }
                //this.request.req_id = x['result'];
            });
        }
    }
    add_comment() {}

    view_detail() {
        let dialogRef = this.dialog.open(ContainerDetail, {
            minWidth: "500px",
            panelClass: "custom-dialog",
            disableClose: false,
            data: {
                cont_id: this.item.cont_id,
                x: this.item.x,
                y: this.item.y
            }
        });
        
    }

    load(id: number) {
        if (id < 0) {
            id = this.item.vial_id;
        }
        let s_type = "vial",
            param = "&vial_id=" + id;
        this.service.getData(s_type, param).subscribe((result) => {
            var x: any = result;
            this.item = x.container.values[0];
            this.cdr.detectChanges();
        });
    }

    checkin() {
        //this.IsWait = true;
        const userInput = prompt("If you checkout the bottle with barcode before, please scan barcode:");
        if (userInput !== null) {
            let data: Object = {
                type: "checkin",
                barcode: userInput,
                box_id: this.item.cont_id,
                x: this.item.x,
                y: this.item.y
            };
            this.service.post_request(data).subscribe((result) => {
                var x: any = result;
                //console.log(JSON.stringify(x));
                if (x.code > 0) {
                    this.load(x.code);
                } else {
                    switch(x.code){
                        case this.ERROR_NO_BARCODE:
                            alert("Can't find the barcode");
                            break;
                        case this.ERROR_NO_BOTTLE:
                            alert("Can't find the cell bottle with the barcode");
                            break;
                        default:
                            alert("Container is not checked in: " + x.message);
                    }
                    
                }
                //this.request.req_id = x['result'];
            });
        } else {
            alert("Please scan a barcode!");
        }
    }

    checkout() {
        let data: Object = {
            type: "checkout",
            vial_id: this.item.vial_id
        };

        this.service.post_request(data).subscribe((result) => {
            var x: any = result;
            //console.log(JSON.stringify(x));
            if (x.code > 0) {
                alert("Bottle checked out");
                this.checkout_vial.next(1);
                //
            } else {
                alert("Can't check out bottle " + x.message);
                this.checkout_vial.next(-1);
                //alert("Cell line is not stored: " + x.message);
            }
            //this.request.req_id = x['result'];
            //s : Save_Result = {x: c[0], y: c[1], outcome: outcome, result: x.message};
            //this.selected_bottle[i].result = outcome;
        });
    }

    add_cell() {
        let dialogRef = this.dialog.open(FindBatch, {
            minWidth: "1500px",
            height: "800px",
            panelClass: "custom-dialog",
            disableClose: true,
            data: {
                type: "select",
                title: "Select a batch"
            }
        });

        dialogRef.afterClosed().subscribe((x) => {
            console.log(x);
            if (x > 0) {
                //this.accession_id.setValue(x);
                let data: Object = {
                    type: "create_vial",
                    box_id: this.item.cont_id,
                    x: this.item.x,
                    y: this.item.y,
                    batch_id: x
                };
                this.service.post_request(data).subscribe((result) => {
                    var x: any = result;
                    //console.log(JSON.stringify(x));
                    if (x.code > 0) {
                        this.load(x.code);
                        this.onUpdate.emit("update");
                    } else {
                        alert("Cell line is not stored: " + x.message);
                        //this.checkout_vial.next(-1);
                    }
                    //this.request.req_id = x['result'];
                });
            }
        });
    }
    /*
    add_to_list(list_id: number, item: number) {
        let list_name: string | null = "";
        if (list_id < 0) {
            do {
                list_name = prompt("Please enter a list name (cannot be empty):");
            } while (!list_name || list_name.trim() === "");
        }

        let data: Object = {
            type: "add_to_list",
            list_id: list_id,
            list_source: ContainerComponent.MY_LIST_SOURCE,
            item_id: item,
            list_name: list_name
        };
        this.service.post_request(data).subscribe((result) => {
            var x: any = result;
            //console.log(JSON.stringify(x));
            if (x.code > 0) {
                this.get_user_list();
            } else {
                alert("Can't add batch to the list: " + x.message);
            }
            //this.request.req_id = x['result'];
        });
    }
    */
    trim_name() : string{
        if (this.item.cell_batch_name){
            if (this.item.cell_batch_name.length > this.NAME_LENGTH){
                return this.item.cell_batch_name.substring(0,this.NAME_LENGTH-3) + " ...";
            }else
            {
                return this.item.cell_batch_name;
            }
        }
        
        return '';
    }
}
