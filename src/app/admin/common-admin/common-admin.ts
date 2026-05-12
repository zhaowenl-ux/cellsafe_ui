import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";

import { MatTable, MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatSort, Sort, MatSortModule } from "@angular/material/sort";
import { MatSelectModule, MatSelect } from "@angular/material/select";
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle
} from "@angular/material/dialog";

import { User, DataService, UserService } from "../../data/data-service";
export interface Dict_Type{
    name : string;
    key : string;
    value : string;
}

@Component({
  selector: 'app-common-admin',
  imports: [
    FormsModule,
    MatTableModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatSortModule
],
  providers: [UserService, DataService],
  templateUrl: './common-admin.html',
  styleUrl: './common-admin.css',
})
export class CommonAdmin implements OnInit{
    @ViewChild(MatSort) sort!: MatSort;
    me!: User | null;

    title: string = "";
    select_control = new FormControl();
    select_list!: Dict_Type[];
    selected_dict!: Dict_Type;
    displayedColumns: string[] = ["term"];
    term_list !: string[];
    dataSource = new MatTableDataSource(this.term_list);
    constructor(
        private service: DataService,
        private route: ActivatedRoute,
        private router: Router,
        public dialog: MatDialog
    ) {
        this.me = UserService.getUser();
    }

    ngOnInit(): void {
        this.get_user(0);
        this.init();
    }

    get_user(count: number) {
        //console.log("get user after 1000 ms");
        count++;
        if (count > 5) {
            this.router.navigate([]).then((result) => {
                window.open("unauthorized?title=Error: User is not authorized!");
            });
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

    init(): void {
        this.service.getData("dict_list").subscribe((result) => {
            var x: any = result;
            this.select_list = x.data.values;
            //console.log("there are " + this.select_list.length + " items");
            if (! this.selected_dict){
                
                this.select_control.setValue(this.select_list[0]);
                this.select_change(this.select_list[0]);
            }
        });
    }

    select_change(item: Dict_Type): void {
        //console.log("select " + item);
        this.selected_dict = item;
        this.title = "Manage " + item.value;
        this.refresh();
    }

    refresh(): void {
        let type = 'dict_term',
            param: string | null = null;
        
        if(this.selected_dict.name == 'DICT'){
            param = 'table=cell_dict&key=' + this.selected_dict.key;
        }else if(this.selected_dict.name =='DICT_TABLE'){
            param = 'table=' + this.selected_dict.key;
        }
        
        if (type !== null && param !== null) {
            this.service.getData(type, param).subscribe((result) => {
                var x: any = result;
                this.term_list = x.data.values;
                //console.log("there are " + this.user_list.length + " items");
                this.dataSource.data = this.term_list;
                this.dataSource.sort = this.sort;
            });
        }
    }

    delete_term(id: string): void {
        let data = null;
        
        if(this.selected_dict.name == 'DICT'){
            data = {type: "del_dict_term", key : this.selected_dict.key, value: id};
        }else if(this.selected_dict.name =='DICT_TABLE'){
            data = {type: "del_table_term", table: this.selected_dict.key, value: id};
        }
        let b = confirm("Do you want to delete " + id);
        if (b) {
            
            if (data) {
                this.service.post_request(data).subscribe((result) => {
                    var x: any = result;
                    //console.log(JSON.stringify(x));
                    //this.request.req_id = x['result'];
                    if (x.code > 0) {
                        this.refresh();
                    } else {
                        alert(x.message);
                    }
                });
            }
        }
    }

    add_term(): void {
        const newTerm = prompt("Please enter a new term:"); // Ask user for a new term
        if (!newTerm) {
            return;
        }

        let data;
        if(this.selected_dict.name == 'DICT'){
            data = {type: "add_dict_term", key : this.selected_dict.key, value: newTerm};
        }else if(this.selected_dict.name =='DICT_TABLE'){
            data = {type: "add_table_term", table: this.selected_dict.key, value: newTerm};
        }

        if (data) {
            this.service.post_request(data).subscribe((result) => {
                var x: any = result;
                //console.log(JSON.stringify(x));
                //this.request.req_id = x['result'];
                if (x.code > 0) {
                    this.refresh();
                } else {
                    alert(x.message);
                }
            });
        }
        
    }
}
