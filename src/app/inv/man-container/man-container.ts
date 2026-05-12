import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { CdkAccordionModule } from "@angular/cdk/accordion";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormsModule } from "@angular/forms";
import { MatSelectModule, MatSelect } from "@angular/material/select";
import { MatDialog } from "@angular/material/dialog";

import { User, DataService, UserService } from "../../data/data-service";
import { Container } from "../../data/container";
import { HashTable } from "../../data/HashTable";
import { Id_Data } from "../../data/data";
import { ContainerForm } from "../container-form/container-form";
import { GroupAdmin } from "../../admin/group-admin/group-admin";

@Component({
  selector: 'app-man-container',
      imports: [
    ContainerForm,
    MatSelectModule,
    MatButtonModule,
    MatFormFieldModule,
    FormsModule,
    MatMenuModule,
    MatIconModule,
    CdkAccordionModule,
    MatProgressSpinnerModule,
    FlexLayoutModule
],
    providers: [DataService, UserService],
    templateUrl: './man-container.html',
    styleUrl: './man-container.css',
})
export class ManContainer implements OnInit {
    me!: User | null;
    IsWait = false;
    container_id = -1;
    tank_list!: Container[];
    container!: Container; // this container
    children!: Container[];
    box = new HashTable<number, Container[]>(100);

    constructor(
        private service: DataService,
        private router: ActivatedRoute,
        private titleService: Title,
        public dialog: MatDialog,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.me = UserService.getUser();
         let sid = this.router.snapshot.paramMap.get("id") + "";
        if (isNaN(Number(sid))) {
            this.get_tank_list();
        } else {
            this.container_id = Number(sid);
            this.retrieve_children()
        }
        /*
        this.router.queryParams.subscribe((params) => {
            console.log(params);
            //this.email = params.email;
            console.log(params["id"]);
            if (params["id"] != null) {
                this.container_id = params["id"];
                this.retrieve_children();
                //this.titleService.setTitle("Cell Batch-" + this.batch_id);
            } else {
                this.get_tank_list();
                //alert("No container provided!");
                //this._router.navigate([]).then((result) => {
                //    window.open("/");
                //});
            }
        });
        */
    }

    select_freezer() {
        this.retrieve_children();
    }

    assign_group(id: number) {
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
                console.log(x);
                let data: Object = {
                    type: "assign_group",
                    id: id,
                    group_id: x
                };
                this.service.post_request(data).subscribe((result) => {
                    var x: any = result;
                    //console.log(JSON.stringify(x));
                    if (x.code > 0) {
                        this.update_rack(id, true);
                        this.cdr.detectChanges();
                    } else {
                        alert("Group is not assigned: " + x.message);
                    }
                    //this.request.req_id = x['result'];
                });
            }
        });
    }

    retrieve_children() {
        this.IsWait = true;
        let type = "container_data",
            filter = "id=" + this.container_id;
        this.service.getData(type, filter).subscribe((result) => {
            //return x;
            var x: any = result;
            this.container = x.container.values[0];
            this.children = x.children.values;
            this.IsWait = false;
            this.cdr.detectChanges();
        });
    }

    update_rack(id: number, force?: boolean) {
        if (force) {
            this.box.remove(id);
        }
        if (this.box.get(id) == undefined) {
            this.IsWait = true;
            let type = "child_container",
                filter = "id=" + id;
            this.service.getData(type, filter).subscribe((result) => {
                //return x;
                var x: any = result;
                this.box.insert(id, x.children.values);
                this.IsWait = false;
                this.cdr.detectChanges();
            });
        }
    }

    get_tank_list() {
        this.IsWait = true;
        let qtype = "tank_list";
        this.service.getData(qtype).subscribe((result) => {
            var x: any = result;
            this.tank_list = x.tank.values;

            this.IsWait = false;
            this.cdr.detectChanges();
        });
    }

    assign_name(id: number) {
        //console.log("Container id is " + id);
        const name = prompt("Please enter a container name:");
        if (name) {
            let data: Object = {
                type: "update_container",
                id: id,
                field: "desc",
                value: name
            };
            this.service.post_request(data).subscribe((result) => {
                var x: any = result;
                //console.log(JSON.stringify(x));
                if (x.code > 0) {
                    this.select_freezer();
                } else {
                    alert("Can't change Rack name: " + x.message);
                }
                //this.request.req_id = x['result'];
            });
        }
    }

    update_name(id: number) {
        //console.log("Container id is " + id);
        const name = prompt("Please enter a new tank name:");
        if (name) {
            let data: Object = {
                type: "update_container",
                id: id,
                field: "desc",
                value: name
            };
            this.service.post_request(data).subscribe((result) => {
                var x: any = result;
                //console.log(JSON.stringify(x));
                if (x.code > 0) {
                    this.select_freezer();
                } else {
                    alert("Can't change Rack name: " + x.message);
                }
                //this.request.req_id = x['result'];
            });
        }
    }

    assign_barcode(id: number) {
        const name = prompt("Please scan the barcode:");
        if (name) {
            let data: Object = {
                type: "update_container",
                id: id,
                field: "barcode",
                value: name
            };
            this.service.post_request(data).subscribe((result) => {
                var x: any = result;
                //console.log(JSON.stringify(x));
                if (x.code > 0) {
                    this.select_freezer();
                } else {
                    alert("Can't assign barcode: " + x.message);
                }
                //this.request.req_id = x['result'];
            });
        }
    }

    add_comment(id: number) {
        const name = prompt("Please enter comments:");
        if (name) {
            let data: Object = {
                type: "update_container",
                id: id,
                field: "COMMENTS",
                value: name
            };
            this.service.post_request(data).subscribe((result) => {
                var x: any = result;
                //console.log(JSON.stringify(x));
                if (x.code > 0) {
                    this.select_freezer();
                } else {
                    alert("Can't update comments: " + x.message);
                }
                //this.request.req_id = x['result'];
            });
        }
    }

    view_history(id: number) {}
}
