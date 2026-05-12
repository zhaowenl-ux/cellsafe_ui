import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { AsyncPipe } from "@angular/common";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
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
import { DialogUser } from "../../common/dialog-user/dialog-user";
import { Id_Data } from "../../data/data";
import { User, DataService, UserService } from "../../data/data-service";

@Component({
  selector: 'app-role-admin',
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
  providers:[DataService, UserService],
  templateUrl: './role-admin.html',
  styleUrl: './role-admin.css',
})
export class RoleAdmin {
    @ViewChild(MatTable) el_table !: MatTable<any>;
    @ViewChild(MatSort) sort!: MatSort;
    me!: User | null;
    role! : Id_Data;;
    id_title = "ID";
    name_title = "Name";
    select_control = new FormControl();
    select_list!: Id_Data[];
    DEFAULT_SELECTION = 0;
    user_list!: Id_Data[];
    displayedColumns: string[] = ["id", "full_name"];
    dataSource = new MatTableDataSource(this.user_list);
    constructor(
        private service: DataService,
        private route: ActivatedRoute,
        private router: Router,
        public dialog: MatDialog
    ) {
        this.get_user(0);
    }

    ngOnInit(): void {
        //console.log(this.action);
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

    init(){
        this.service.getData("role_list").subscribe((result) => {
            var x: any = result;
            this.select_list = x.data.values;
            //console.log("there are " + this.select_list.length + " items");
            
            if (! this.role){
                this.role = this.select_list[0];
                //this.select_change(this.select_list[0]);
                
            }
            this.select_control.setValue(this.role);
            this.get_user_list();
        });
    }

    refresh(): void {
      
        this.get_user_list();
    }

    select_change(item: Id_Data): void {
        //console.log("select " + item);
        this.role = item;
        this.get_user_list();
    }

    get_user_list(){
        let param = "id=" + this.role.id;
        this.service.getData("role_user_list", param).subscribe((result) => {
            var x: any = result;
            var x: any = result;
            this.user_list = x.data.values;
            //console.log("there are " + this.user_list.length + " items");
            this.dataSource.data = this.user_list;
            this.dataSource.sort = this.sort;
            this.el_table.renderRows();
        });
    }
    delete(id: number, name: string): void {
        let b = confirm("Do you want to delete " + name  + " from group " + this.role.name);
        if (b){
            let data = { type: "delete_group_member", group: this.role.id, member: id };
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

    add_user(): void {
        
        let dialogRef = this.dialog.open(DialogUser, {
              minWidth: "500px",
              panelClass: "custom-dialog",
              disableClose: true,
              data: {
                  title: "Add member to " + this.role.name,
                  action: 'add_role_member',
                  action_name: 'Add Member',
                  id: this.role.id
              }
          });

          dialogRef.afterClosed().subscribe(() => {
              this.refresh();
          });
      }
}

