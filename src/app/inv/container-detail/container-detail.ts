import { Component, OnInit, Inject ,ChangeDetectorRef} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

import { User, DataService, UserService } from "../../data/data-service";
import { Box, Inventory } from "../../data/container";
import { Batch_List } from "../../data/entity";

@Component({
  selector: 'app-container-detail',
  imports: [MatProgressSpinnerModule, MatIconModule, MatButtonModule],
  providers:[UserService, DataService],
  templateUrl: './container-detail.html',
  styleUrl: './container-detail.css',
})
export class ContainerDetail {
    box!: Box;
    vial!: Inventory;
    batch!: Batch_List;
    IsWait = false;
    cont_id = -1;
    batch_id = -1;
    x = -1;
    y = -1;
    constructor(
        private service: DataService,
        private router: ActivatedRoute,
        private _router: Router,
        private titleService: Title,
        private cdr : ChangeDetectorRef,
        public dialogRef: MatDialogRef<ContainerDetail>,
        @Inject(MAT_DIALOG_DATA) public data: { cont_id: number; x: number; y: number }
    ) {
        this.titleService.setTitle("Cell Bottle");
        this.cont_id = data.cont_id;
        this.x = data.x;
        this.y = data.y;

        if (this.cont_id > 0 && this.x > 0 && this.y > 0) {
            this.init_container();
        } else {
            alert("Can't display container details!");
            this.dialogRef.close();
        }
    }

    ngOnInit(): void {
        /*    
        let sid = this.router.snapshot.paramMap.get('id') + "";
        if (isNaN(Number(sid))){
            this.parent_id = -1;
            //this._router.navigate(['error']);
        }else{
            this.parent_id = Number(sid);
        }
        
        this.router.queryParams.subscribe((params) => {
            console.log(params);
            //this.email = params.email;
            console.log(params["x"]);
            this.x = params['x'];
            this.y = params['y'];
        });
        
        if (this.parent_id > 0 && this.x > 0 && this.y > 0){
            this.init_container();
        }else
        {
            this._router.navigate(['error']);
        }
        */
    }

    exit() {
        this.dialogRef.close();
    }

    init_container() {
        this.IsWait = true;
        let param = "cont_id=" + this.cont_id + "&x=" + this.x + "&y=" + this.y;
        this.service.getData("inv_vial_detail", param).subscribe((result) => {
            var x: any = result;
            try {
                this.box = x.box.values[0];
                this.vial = x.vial.values[0];
            } catch (e) {
                // do nothing
                console.log(e);
            }

            if (this.vial && this.vial.mat_id) {
                this.init_cell();
            }
            this.IsWait = false;
            this.cdr.detectChanges();
            //this.set_batch();
        });
    }

    init_cell() {
        this.IsWait = true;
        let param = "id=" + this.vial.mat_id;
        this.service.getData("batch_data", param).subscribe((result) => {
            var x: any = result;
            try {
                this.batch = x.batch.values[0];
            } catch (e) {
                // do nothing
            }

            this.IsWait = false;
            this.cdr.detectChanges();
            //this.set_batch();
        });
    }

    position(): string {
        if (this.x > 0 && this.y > 0) {
            return String.fromCharCode(64 + this.x) + this.y + "(x=" + this.x + ",y=" + this.y + ")"; // 'A' starts at ASCII 65
        } else {
            return "";
        }
    }
}
