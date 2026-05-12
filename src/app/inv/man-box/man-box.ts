import { Component, OnInit, ViewChildren, QueryList, ChangeDetectorRef } from "@angular/core";

import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule, MatSelect } from "@angular/material/select";
import { FormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { ActivatedRoute } from "@angular/router";
import { Meta, Title } from "@angular/platform-browser";
import { MatButtonModule } from "@angular/material/button";
import { MatTable, MatTableDataSource, MatTableModule } from "@angular/material/table";

import { Container, Cell_Vial } from "../../data/container";
import { DataService, User, UserService } from "../../data/data-service";
import { ContainerForm } from "../container-form/container-form";
import { Id_Data } from "../../data/data";
import { VialForm } from "../vial-form/vial-form";


export interface Save_Result {
    x: number;
    y: number;
    outcome: string;
    result: string;
}

export interface Bottle_Barcode {
    x: number;
    y: number;
    barcode: string;
    result: string;
}

export class coor{
    x = 0;
    y = 0;
    
    constructor(x : number, y : number){
        this.x = x;
        this.y = y;
    }
}


@Component({
  selector: 'app-man-box',
   imports: [
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    VialForm
],
    providers: [DataService, UserService],
  templateUrl: './man-box.html',
  styleUrl: './man-box.css',
})
export class ManBox {
    @ViewChildren('vial') vial_component !:QueryList<VialForm>;
    title = "Manage Cell-line Inventory";
    readonly colors=[
        "#d89faaff", 
        "#FFBF00", 
        "#7baec1ff", 
        "#FF00FF", 
        "#cba775ff", 
        "#C8A2C8", 
        "#93c1e0ff", 
        "#FF7F50", 
        "#a968d7ff", 
        "#d56262ff"  
]
    pre_location =[0,0,0];
    info = "";
    can_access = false;
    id = -1;
    cell_id = -1;
    IsWait = false;
    user_list !: Id_Data [];
    
    tank_id: number | null = null;
    tank_list!: Container[];

    rack_id: number | null = null;
    rack_list!: Container[];

    box!: Container;
    box_id: number | null = null;
    box_list!: Container[];

    vial!: Cell_Vial[][];
    vial_selected: string[] = new Array();
    existed_vial!: Cell_Vial[];
    save_count = 0;
    save_result: Save_Result[] = new Array();

    // for drag selection
    isMouseDown = false;
    firstDraggedItemIndex = new coor(0,0);
    lastDraggedItemIndex = new coor(0,0);
    selecting = false;
    
    // for registration of barcode
    selected_bottle: Bottle_Barcode[] = new Array();
    dataSource!: MatTableDataSource<Bottle_Barcode>;
    bBarcode = false;
    bottle_displayedColumns = ["x", "y", "barcode", "result"];
    bottle_columns = [
        {
            columnDef: "x",
            header: "X",
            type: "number",
            editable: "N",
            cell: (element: Bottle_Barcode) => `${element.x}`
        },
        {
            columnDef: "y",
            header: "Y",
            type: "number",
            editable: "N",
            cell: (element: Bottle_Barcode) => `${element.y}`
        },
        {
            columnDef: "barcode",
            header: "Scan Barcode",
            type: "string",
            editable: "Y",
            cell: (element: Bottle_Barcode) => `${element.barcode}`
        },
        {
            columnDef: "result",
            header: "Result",
            type: "string",
            editable: "N",
            cell: (element: Bottle_Barcode) => `${element.result}`
        }
    ];
    constructor(
        private service: DataService,
        private _router: ActivatedRoute,
        private titleService: Title,
        private cdr : ChangeDetectorRef
    ) {
        this.titleService.setTitle("Manage Box");
    }

    select_vial(event: any) {
        console.log("event is " + event);
        if (this.cell_id > 0){
            if (this.vial_selected.includes(event.pos)) {
                if (! event.selected){
                    this.vial_selected = this.vial_selected.filter((item) => item !== event.pos);
                }
            } else {
                this.vial_selected.push(event.pos);
            }
        }else{
            // de-select the vial
            let pos = event.pos.split("-");
            //this.vial[Number(pos[0])][Number(pos[1])].selected = false;
            this.vial_component.toArray()[(Number(pos[0]) -1) * this.box.y_size + Number(pos[1]) -1].set_sel_vial(false);
            this.cdr.detectChanges();
        }
    }

    checkout(rtn: any) {
        if (rtn) {
            this.get_box(this.box.id);
        }
    }

    ngOnInit(): void {
        //this.get_user_list();
        let sid = this._router.snapshot.paramMap.get("id") + "";
        if (! isNaN(Number(sid))) {
            this.id = Number(sid);
            this.get_box(this.id);
            return;
        }

        this._router.queryParams.subscribe((params) => {
            if (params["id"]) {
                this.id = params["id"];
                this.get_box(params["id"]);
            } else {
                if (params["cell_id"]) {
                    this.title = "Store " + params["cell_name"];
                    this.cell_id = params["cell_id"];
                }
                this.load_profile();
            }
        });
                
    }

    load_profile(){
        this.service.getData("load_pref", "page=inv").subscribe((result) => {
            var x: any = result;
            try {
                let pref = x.data.values[0].pref;
                let y = JSON.parse(pref);
                console.log(y);
                this.pre_location = y.location;
                //this.set_column();
                //this.column_control = new FormControl(this.displayedColumns);
                //this.getReport();
            } catch (error) {
                //this.pre_location = [0,0,0];
                //this.column_control = new FormControl(this.displayedColumns);
                console.log(error);
                //this.getReport();
            }
            
            this.get_tank_list();
        });
    }
    
    get_user_list() {
        this.service.getData("user_cont_list").subscribe((result) => {
            var x: any = result;
            this.user_list = x.list.values;
            //this.IsWait = false;
            this.user_list.push(new Id_Data(-1, "[New List]"));
        });
    }
    
    get_box(id: number) {
        //this.vial_selected = new Array();
        this.IsWait = true;
        let qtype = "container_detail",
            param = "&id=" + id;
        this.service.getData(qtype, param).subscribe((result) => {
            var x: any = result;
            this.box = x.container.values[0];
            if (! this.box || this.box.type != "BOX"){
                alert("The selected container is not a box!");
                this.IsWait = false;
                window.close();
            }
            this.can_access = x.access.values[0].can_access == "Y" ? true : false;
            if (this.can_access) {
                this.info = "";
                this.get_vial(id);
            } else {
                this.info = "You don't have access to this box. \n This box is belong to " + this.box.t1;
                this.vial = [];
            }
            //this.existed_vial = x.children.values;
            this.title =
                this.box.desc + "(" + this.box.name + " : " + this.box.id + ")";
            //this.make_vial();
            this.IsWait = false;
        });
    }

    get_vial(id: number) {
        this.vial_selected = new Array();
        this.IsWait = true;
        let qtype = "vial_in_box",
            param = "&id=" + id;
        this.service.getData(qtype, param).subscribe((result) => {
            var x: any = result;
            this.existed_vial = x.vial.values;
            this.make_vial();
            this.IsWait = false;
            
        });
    }

    find_existed(x: number, y: number): Cell_Vial | null {
        let e = null;
        for (let i = 0; i < this.existed_vial.length; i++) {
            if (this.existed_vial[i].x == x && this.existed_vial[i].y == y) {
                e = this.existed_vial[i];
                this.existed_vial.splice(i, 1);
            }
        }

        return e;
    }

    get_cell_list() : number []{
        let list : number [] = new Array();
        
        for (let i = 0; i < this.existed_vial.length; i++) {
            if (! list.find((element) => element==this.existed_vial[i].mat_id)){
                if (this.existed_vial[i].mat_id != null){
                    list.push(this.existed_vial[i].mat_id);
                }
            }
        }
        
        return list;
    }
    
    make_vial() {        
        let list = this.get_cell_list();
        this.vial = new Array();
        //for (let i = 0; i < this.box.column_num; i++) {
        for (let i = 0; i < this.box.x_size; i++) {
            this.vial[i] = new Array();
            //for (let j = 0; j < this.box.row_num; j++) {
            for (let j = 0; j < this.box.y_size; j++) {
                let c: Cell_Vial|null;
                c = this.find_existed(i+1, j+1);
                if (c) {
                    let id = c? c.mat_id: -1;
                    let index = list.findIndex((element) => element == id);
                    c.color = this.colors[index % 10];
                    
                    //console.log("assign coloe : " + c.color)
                }else{
                    c  = {
                     x : i+1,
                     y : j+1,
                     vial_id : -1,
                     cont_id : this.box.id,
                     barcode : "",  
                     mat_id : -1,
                     color  : "",
                     d2 : this.cell_id
                 }
                }

                if (c){
                    this.vial[i].push(c);
                }
            }
        }
        this.cdr.detectChanges();
    }

    select_tank(finterface? : boolean) {
        if (this.tank_id) {
            this.IsWait = true;
            let qtype = "child_container",
                param = "&id=" + this.tank_id;
            this.service.getData(qtype, param).subscribe((result) => {
                var x: any = result;
                this.rack_list = x.children.values;
                this.box_list = new Array();
                this.vial = new Array();
                //this.box_id = null;
                if (!finterface && this.pre_location && this.pre_location[1]){
                    this.rack_id = this.pre_location[1];
                    this.select_rack(false);
                }
                this.IsWait = false;
            });
        }
    }
    
    select_rack(finterface ?: boolean) {
        if (this.rack_id) {
            this.IsWait = true;
            let qtype = "child_container",
                param = "&id=" + this.rack_id;
            this.service.getData(qtype, param).subscribe((result) => {
                var x: any = result;
                this.box_list = x.children.values;
                this.vial = new Array();
                
                if (!finterface &&this.pre_location && this.pre_location[2]){
                    this.box_id = this.pre_location[2];
                    this.select_box();
                }
                this.IsWait = false;
            });
        }
    }

    select_box() {
        if (this.box_id) {
            this.get_box(this.box_id);
        }
    }

    get_tank_list() {
        this.IsWait = true;
        let qtype = "tank_list";
        this.service.getData(qtype).subscribe((result) => {
            var x: any = result;
            this.tank_list = x.tank.values;
            if (this.pre_location && this.pre_location[0]){
                this.tank_id = this.pre_location[0];
                this.select_tank(false);
            }
            this.IsWait = false;
        });
    }

    save() {
        this.save_count = 0;
        this.IsWait = true;
        this.vial_selected.forEach((vial) => {
            let c = vial.split("-");
            let data: Object = {
                type: "create_vial",
                box_id: this.box.id,
                x: c[0],
                y: c[1],
                batch_id: this.cell_id
            };
            this.service.post_request(data).subscribe((result) => {
                var x: any = result;
                //console.log(JSON.stringify(x));
                let outcome = "";
                if (x.code > 0) {
                    outcome = "Success";
                    //
                } else {
                    outcome = "failed";
                    //alert("Cell line is not stored: " + x.message);
                }
                //this.request.req_id = x['result'];
                //s : Save_Result = {x: c[0], y: c[1], outcome: outcome, result: x.message};
                this.save_count++;
                if (this.save_count >= this.vial_selected.length) {
                    this.get_box(this.box.id);
                    this.cell_id = -1;
                }
                this.save_result.push({ x: Number(c[0]), y: Number(c[1]), outcome: outcome, result: x.message });
            });
        });
        
        
        // save the location
        let data: Object = {
            type: "save_location",
            box_id: this.box.id,
            page: 'inv'
        };
        this.service.post_request(data).subscribe((result) => {
            var x: any = result;
            //console.log(JSON.stringify(x));
            // doesn't matter if the location saved or not
        });
    }

    onVialUpdate(){
        this.get_box(this.box.id);
    }
    
    save_barcode() {
        this.save_count = 0;
        this.bBarcode = true;
        this.selected_bottle = new Array();
        this.vial_selected.forEach((vial) => {
            let c = vial.split("-");
            let b = { x: Number(c[0]), y: Number(c[1]), barcode: "", result: "" };
            this.selected_bottle.push(b);
            /**
            let data: Object = {
                type: "create_bottle",
                box_id: this.box.container_id,
                x: c[0],
                y: c[1],
                cell_id: this.cell_id
            };
            
            this.service.post_request(data).subscribe((result) => {
                var x: any = result;
                //console.log(JSON.stringify(x));
                let outcome = "";
                if (x.code > 0) {
                    outcome = "Success";
                    //
                } else {
                    outcome = "failed";
                    //alert("Cell line is not stored: " + x.message);
                }
                //this.request.req_id = x['result'];
                //s : Save_Result = {x: c[0], y: c[1], outcome: outcome, result: x.message};
                this.save_count++;
                if (this.save_count >= this.vial_selected.length) {
                    this.get_box(this.box.container_id);
                    this.cell_id = -1;
                }
                this.save_result.push({ x: Number(c[0]), y: Number(c[1]), outcome: outcome, result: x.message });
            }); */
        });
        this.selected_bottle.sort((a,b) => (a.x-b.x) && (a.y-b.y));
        this.dataSource = new MatTableDataSource(this.selected_bottle);
    }

    cancel_barcode() {
        this.bBarcode = false;
        this.get_box(this.box.id);
    }

    do_save_barcode() {
        const bottle = this.selected_bottle.find((p) => p.barcode.trim().length === 0);
        if (bottle) {
            alert("Please scan all barcode");
            return;
        } else {
            // we have all data
            for (let i = 0; i < this.selected_bottle.length; i++) {
                let data: Object = {
                    type: "create_vial",
                    box_id: this.box.id,
                    x: this.selected_bottle[i].x,
                    y: this.selected_bottle[i].y,
                    barcode: this.selected_bottle[i].barcode,
                    batch_id: this.cell_id
                };

                this.service.post_request(data).subscribe((result) => {
                    var x: any = result;
                    //console.log(JSON.stringify(x));
                    let outcome = "";
                    if (x.code > 0) {
                        outcome = "Success";
                        //
                    } else {
                        outcome = "failed";
                        //alert("Cell line is not stored: " + x.message);
                    }
                    //this.request.req_id = x['result'];
                    //s : Save_Result = {x: c[0], y: c[1], outcome: outcome, result: x.message};
                    this.selected_bottle[i].result = outcome;
                    this.cdr.detectChanges();
                });
            }
            //this.dataSource.data = this.selected_bottle;
            
        }

        
        
        let data: Object = {
            type: "save_location",
            box_id: this.box.id,
            page: 'inv'
        };
        this.service.post_request(data).subscribe((result) => {
            var x: any = result;
            //console.log(JSON.stringify(x));
            // doesn't matter if the location saved or not
        });
    }

    onMouseDownOnItem(x: number, y: number) {
        this.isMouseDown = true;
        console.log("Mouse down x=" + x);
        this.firstDraggedItemIndex = new coor(x,y);
        this.lastDraggedItemIndex = new coor(x,y);
    }

    onMouseEnterOnItem(x: number, y: number) {
        
        if (this.isMouseDown) {
            console.log("Mouse enter : x=" + x);
            this.lastDraggedItemIndex = new coor(x,y);
            this.selectRowsInDraggedRange();
        }
    }

    onContainerMouseUp() {
        this.isMouseDown = false;
        this.lastDraggedItemIndex = new coor(0,0);
    }

    selectRowsInDraggedRange() {
        if (this.cell_id <= 0){
            return;
        }

        let x_start = 0, x_end = 0, y_start= 0, y_end = 0;
        
        if  (this.firstDraggedItemIndex.x <=this.lastDraggedItemIndex.x)
        {
            x_start = this.firstDraggedItemIndex.x;
            x_end = this.lastDraggedItemIndex.x;
        }else{
            x_start = this.lastDraggedItemIndex.x;
            x_end = this.firstDraggedItemIndex.x;
        }
        
        if  (this.firstDraggedItemIndex.y<=this.lastDraggedItemIndex.y)
        {
            y_start = this.firstDraggedItemIndex.y;
            y_end = this.lastDraggedItemIndex.y;
        }else{
            y_start = this.lastDraggedItemIndex.y;
            y_end = this.firstDraggedItemIndex.y;
        }
        
        //console.log("x: " + this.firstDraggedItemIndex.x + ' '  + this.lastDraggedItemIndex.x);
        //console.log("y: " + this.firstDraggedItemIndex.y + ' '  + this.lastDraggedItemIndex.y);
        for (let i = x_start; i <=x_end; i ++){
            for (let j = y_start; j <= y_end; j ++){
                //console.log("select " + i + "," + j);
                //this.vial_selected.push(i + "-" + j);
                //this.vial[i-1][j-1].sel_vial();
                let pos = this.box.y_size * i +j;
                this.vial_component.toArray()[pos].sel_vial(true);
            }
        }
        
        //console.log("Total selected vials: " + this.vial_selected.length);
    }
}
