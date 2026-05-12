import { Component, OnInit, ViewChild ,ElementRef} from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule ,FormBuilder, Validators} from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
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

import { User, DataService, UserService } from "../../data/data-service";
import { User_Data } from "../../data/data";

@Component({
  selector: 'app-user-admin',
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
  providers: [DataService, UserService],
  templateUrl: './user-admin.html',
  styleUrl: './user-admin.css',
})
export class UserAdmin implements OnInit {
      @ViewChild(MatSort) sort!: MatSort;
      @ViewChild(MatPaginator) paginator!: MatPaginator;
      @ViewChild("full_name") el_full_name!: ElementRef<HTMLInputElement>;
      @ViewChild("email") el_email!: ElementRef<HTMLInputElement>;
      IsWait = false;
      user_form : FormGroup;    
      edit_title = "";  
      bedit = false;
      me!: User | null
      user_list: User_Data[] = [];
      // for the order list table
      displayedColumns = [
          "id",
          "full_name",
          "email",
          "alt_id"
      ];
      dataSource = new MatTableDataSource(this.user_list);
      columns = [
          {
              columnDef: "full_name",
              header: "Full Name",
              cell: (element: User_Data) => `${element.full_name ? element.full_name : ""}`
          },
          {
              columnDef: "email",
              header: "Email",
              cell: (element: User_Data) => `${element.email ? element.email : ""}`
          },
          {
              columnDef: "alt_id",
              header: "Alternate ID",
              cell: (element: User_Data) => `${element.alt_id ? element.alt_id : ""}`
          }
      ];
      constructor(
          private service: DataService,
          private _router: Router,
          public dialog: Dialog,
          private titleService: Title,
          private fb: FormBuilder
      ) {
          this.titleService.setTitle("Manage Accounts - CellSafe");
          this.user_form = this.fb.group({
            id: [null],
            full_name : ['', Validators.required],          
            email : ['', Validators.required],                  
            alt_id : ['']
        });   
      }
  
      ngOnInit(): void {
          this.me = UserService.getUser();
          this.get_user_list();
      }
  
      get_user_list(): void {
          this.IsWait = true;
          this.service.getData("user_list").subscribe((result) => {
              var x: any = result;
              this.user_list = [];
              for (var i = 0; i < x.data.values.length; i++) {
                  let u: any = x.data.values[i];
                  let user_data: User_Data = new User_Data();
                  user_data.id = Number(u.id);
                  user_data.full_name = u.full_name;
                  user_data.email = u.email;
                  user_data.alt_id = u.alt_id;
  
                  this.user_list.push(user_data);
              }
              this.dataSource = new MatTableDataSource(this.user_list);
              this.dataSource.sort = this.sort;
              this.dataSource.paginator = this.paginator;
  
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
          if(this.bedit){
              alert("Please save existing user or cancel editing first!");
              return;
          }
          let user;
          if (id > 0){ 
              user = this.user_list.find(u => u.id === id);
          }else{
              user = new User_Data();
              user.id = -1;  
              user.full_name = '';
              user.email = '';
              user.alt_id = '';
          }
          if (user){
              this.user_form.patchValue({
                  id: user.id,
                  full_name: user.full_name,
                  email: user.email,
                  alt_id: user.alt_id
              });

              this.bedit = true;
              if (user.id > 0){
                  this.edit_title = "Edit User " + user.id;
              }else
              {
                  this.edit_title = "Add new user";
              }
          }
      }
      
      delete(id: number) {
          let data: Object = {
              type: "delete_user",
              id: id,
          };

          this.service.post_request(data).subscribe((result) => {
              var x: any = result;
              //console.log(JSON.stringify(x));
              if (x.code > 0) {
                  alert("User is deleted!");
                  //this.bedit = false;
                  this.get_user_list();
              } else {
                  alert("Can't delete the user: " + x.message);
              }
              //this.request.req_id = x['result'];
          });
      }

      save_user() {
          let u_data = this.user_form.value;
          console.log(u_data);
          if (!u_data.full_name){
              alert("User name is required!");
              this.el_full_name.nativeElement.focus();
              return;
          }

          if (!u_data.email){
              alert("Email is required!");
              this.el_email.nativeElement.focus();
              return;
          }
          let data: Object = {
              type: "save_user",
              id: u_data.id,
              full_name: u_data.full_name,
              email: u_data.email,
              alt_id: u_data.alt_id
          };

          this.service.post_request(data).subscribe((result) => {
              var x: any = result;
              //console.log(JSON.stringify(x));
              if (x.code > 0) {
                  alert("User is save");
                  this.bedit = false;
                  this.get_user_list();
              } else {
                  alert("Can't save the user: " + x.message);
              }
              //this.request.req_id = x['result'];
          });

      }
      cancel_edit(){
          this.bedit = false;
      }
} 
