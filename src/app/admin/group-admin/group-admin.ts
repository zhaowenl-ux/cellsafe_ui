import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, Inject, Optional } from "@angular/core";
import { Location } from '@angular/common';
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { CommonModule, DatePipe } from "@angular/common";
import { MatMenuModule } from "@angular/material/menu";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatIconModule } from "@angular/material/icon";
import { MatDialog } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatSort, Sort, MatSortModule } from "@angular/material/sort";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormsModule } from '@angular/forms';

import { User, DataService, UserService } from "../../data/data-service";
import { Access_Group } from "../../data/entity";
import { DialogUser } from "../../common/dialog-user/dialog-user";

@Component({
  selector: 'app-group-admin',
  imports: [
        MatProgressSpinnerModule,
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatMenuModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule
    ],
  providers: [DataService, UserService],
  templateUrl: './group-admin.html',
  styleUrl: './group-admin.css',
})
export class GroupAdmin implements OnInit{
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild("GroupSort") public sortGroup!: MatSort;

    path = '';
    
    me!: User | null;
    title = "Manage Access Groups";
    manage = true;
    b_add_group = false;
    new_group !: Access_Group;
    IsWait = false;
    action = "manage";
    group!: Access_Group[];
    selected_group!: number;
    dataSource = new MatTableDataSource(this.group);
    displayedColumns = ["group_name", "group_desc", "member"];
    columns = [
        {
            columnDef: "group_name",
            header: "Group Name",
            cell: (element: Access_Group) => `${element.group_name ? element.group_name : ""}`
        },
        {
            columnDef: "group_desc",
            header: "Description",
            cell: (element: Access_Group) => `${element.group_desc ? element.group_desc : ""}`
        }
    ];
    constructor(private location: Location,
                public dialog: MatDialog,
                private service: DataService,
                private router: Router,
                private titleService: Title,
                @Optional() public dialogRef: MatDialogRef<GroupAdmin>
    ) {
        this.path = this.location.path();
        console.log(this.path);
        if (this.path.includes("group")){
            this.action = "manage";
            this.titleService.setTitle("Manage Groups");
            this.title = "Manage Group";
        }else{
            this.action = "assign";
            this.titleService.setTitle("Assign Group");
            this.title = "Choose a Group";
        }
    }

    ngOnInit(): void {
        this.get_user(0);
        this.refresh();
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

    refresh() {
        this.service.getData("access_group").subscribe((result) => {
            //return x;
            var x: any = result;
            this.group = [];
            x.group.values.forEach((value: Object) => {
                let g = new Access_Group();
                g.from_json(value);
                this.group.push(g);
            });

            this.dataSource.data = this.group;
            this.dataSource.sort = this.sortGroup;
        });
    }
    
    cancel_add(){
        this.b_add_group = false;
    }

    add_group(){
        this.new_group = new Access_Group();
        this.b_add_group = true;
    }

    do_add_group() {
        let data: Object = { type: "new_group", group_name: this.new_group.group_name, group_desc: this.new_group.group_desc };
        this.service.post_request(data).subscribe((result) => {
            //return x;
            var x: any = result;
            var a: string;
            var outcome: number;
            //alert(x);
            //alert(x.data.values.length);
            a = x.message;
            outcome = x.code;
            if (outcome < 0) {
                alert("Can't add new access group");
            } else {
                this.b_add_group = false;
                this.refresh();
            }
        });
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

    add_member(id: number, name: string) {
        let dialogRef = this.dialog.open(DialogUser, {
            minWidth: "500px",
            panelClass: "custom-dialog",
            disableClose: true,
            data: {
                title: "Add memeber to group " + name,
                id: id,
                action: "add_group_member",
                action_name: "Add"
            }
        });

        dialogRef.afterClosed().subscribe(() => {
            this.refresh();
        });
    }

    delete_member(id: number, member: string) {
        const regex = new RegExp("(\\d+)");
        let m = member.match(regex);

        if (m && m[0]) {
            if (confirm("Do you really want to delete memeber " + member)) {
                let data: Object = { type: "delete_group_member", group_id: id, member: m[0] };
                this.service.post_request(data).subscribe((result) => {
                    //return x;
                    var x: any = result;
                    var a: string;
                    var outcome: number;
                    //alert(x);
                    //alert(x.data.values.length);
                    a = x.message;
                    outcome = x.result;
                    if (outcome < 0) {
                        alert("Can't delete member " + member);
                    } else {
                        this.refresh();
                    }
                });
            }
        } else {
            alert("can't find user id " + member);
        }
    }

    row_selected(id: number): boolean {
        if (this.action == 'assign'){
            return this.selected_group == id;
        }

        return false;
    }

    mouseClickHandler(rowIndex: number, element: Access_Group, event: MouseEvent) {
        //let data : Access_Group[] = this.dataSource.sortData(this.group, this.sortGroup);
        if (this.action != 'manage'){
            this.selected_group = element.group_id;
        }
    }

    select() {
        this.dialogRef.close(this.selected_group);
    }

    close() {
        this.dialogRef.close(-1);
    }
}
