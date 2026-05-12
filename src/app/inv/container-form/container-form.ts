import { Component, Input, OnInit, Output, EventEmitter,ChangeDetectorRef } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule, MatMenuTrigger } from "@angular/material/menu";

import { MatButtonModule } from "@angular/material/button";
import { CdkMenu, CdkMenuItem, CdkContextMenuTrigger } from "@angular/cdk/menu";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";

import { Container } from "../../data/container";
import { DataService, UserService } from "../../data/data-service";
import { Id_Data } from "../../data/data";
import { FindBatch } from "../../list/find-batch/find-batch";
import { GroupAdmin } from "../../admin/group-admin/group-admin";
import { ContainerDetail } from "../container-detail/container-detail";
import { environment } from "../../../environments/environment";

@Component({
  selector: 'app-container-form',
  imports: [MatIconModule, MatMenuModule, MatButtonModule, CdkMenu, CdkContextMenuTrigger],
  providers: [DataService,UserService],
  templateUrl: './container-form.html',
  styleUrl: './container-form.css',
})
export class ContainerForm implements OnInit {
    @Input() item!: Container;
    @Input() user_list!: Id_Data[];
    @Output() select_vial = new EventEmitter<{ pos: string; selected: boolean }>();
    @Output() checkout_vial = new EventEmitter<number>();

        // Constants
    static readonly MY_LIST_SOURCE = 32;    
    readonly APP_PREFIX = environment.APP_PREFIX;
    readonly NAME_LENGTH = 22;
    readonly ERROR_NO_BARCODE = -11;
    readonly ERROR_NO_BOTTLE = -12;
    readonly ERROR_OTHER = -13;
    
    selected = false;
    manage = true;
    //user_list !: Id_Data [];

    constructor(
        private service: DataService,
        private _router: Router,
        public dialog: MatDialog,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        //this.get_user_list();
    }

    assign_name() {
        const name = prompt("Please enter a container name:");
        if (name) {
            let data: Object = {
                type: "update_container",
                id: this.item.id,
                field: "desc",
                value: name
            };
            this.service.post_request(data).subscribe((result) => {
                var x: any = result;
                //console.log(JSON.stringify(x));
                if (x.code > 0) {
                    this.load(-1);
                    //this.cdr.detectChanges();
                } else {
                    alert("Container name is not assigned: " + x.message);
                }
                //this.request.req_id = x['result'];
            });
        }
    }

    assign_barcode() {
        const name = prompt("Please scan the barcode:");
        if (name) {
            let data: Object = {
                type: "update_container",
                id: this.item.id,
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
  

    load(id: number) {
        if (id < 0) {
            id = this.item.id;
        }
        let s_type = "container_detail",
            param = "&id=" + id;
        this.service.getData(s_type, param).subscribe((result) => {
            var x: any = result;
            this.item = x.container.values[0];
            this.cdr.detectChanges();
        });
    }

    assign_group() {
        let dialogRef = this.dialog.open(GroupAdmin, {
            minWidth: "800px",
            panelClass: "custom-dialog",
            disableClose: true,
            data: {
                action: "select_group",
                title: "Select a access group"
            }
        });

        dialogRef.afterClosed().subscribe((x) => {
            if (x > 0) {
                //this.access_group.setValue(x);
                //console.log(x);
                let data: Object = {
                    type: "assign_group",
                    id: this.item.id,
                    group_id: x
                };
                this.service.post_request(data).subscribe((result) => {
                    var x: any = result;
                    //console.log(JSON.stringify(x));
                    if (x.code > 0) {
                        this.load(-1);
                        this.cdr.detectChanges();
                    } else {
                        alert("Group is not assigned: " + x.message);
                    }
                    //this.request.req_id = x['result'];
                });
            }
        });
    }

    view_box() {
        if (this.item.type != 'BOX'){
            return;
        }
        this._router.navigate([]).then((result) => {
                    window.open("inv/man-box/" + this.item.id, "_blank");
                });

        //this._router.navigate(['inv/man-box/' + this.item.id]);
    }

}
