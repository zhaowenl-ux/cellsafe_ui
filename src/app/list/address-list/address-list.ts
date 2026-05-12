import { Component, OnInit, ViewChild, ChangeDetectorRef} from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatInputModule } from "@angular/material/input";
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
import { MatDialog } from "@angular/material/dialog";

import { Address } from "../../data/order";
import { User, DataService, UserService } from "../../data/data-service";
import { AddressForm} from '../../entity/address-form/address-form';

@Component({
  selector: 'app-address-list',
  imports: [
        MatProgressSpinnerModule,
        MatSortModule,
        MatDividerModule,
        MatTableModule,
        MatPaginatorModule,
        MatInputModule,
        MatDatepickerModule,
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatSelectModule
    ],
  providers: [DataService, UserService],
  templateUrl: './address-list.html',
  styleUrl: './address-list.css',
})
export class AddressList implements OnInit {
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild("el_status_control") el_status_control!: MatSelect;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    IsWait = false;
    showRange: boolean = false;
    me!: User | null
    address_list !: Address [];
    /*
      id = -1;
    name = '';
    company = '';
    address = '';
    email = '';
    phone = '';
    */

    displayedColumns = [
        "id",
        "name",
        "company",
        "address",
        "email",
        "phone"
    ];
    dataSource = new MatTableDataSource(this.address_list);
    columns = [
        {
            columnDef: "name",
            header: "Contact Name",
            cell: (element: Address) => `${element.name ? element.name : ""}`
        },
        {
            columnDef: "company",
            header: "Company",
            cell: (element: Address) => `${element.company ? element.company : ""}`
        },
        {
            columnDef: "address",
            header: "Address",
            cell: (element: Address) => `${element.address ? element.address : ""}`
        },
        {
            columnDef: "email",
            header: "Email",
            cell: (element: Address) => `${element.email ? element.email : ""}`
        },
        {
            columnDef: "phone",
            header: "Phone",
            cell: (element: Address) => `${element.phone ? element.phone : ""}`
        }
    ];
    constructor(
        private service: DataService,
        private _router: Router,
        public dialog: MatDialog,
        private titleService: Title,
        private cdr: ChangeDetectorRef
    ) {
        this.titleService.setTitle("Shipping Address");
        
    }

    ngOnInit(): void {
        this.me = UserService.getUser();
        this.getAddress();
    }

    getAddress(): void {
        this.service.getData("address_list").subscribe((result) => {
            var x: any = result;
            this.address_list = x.data.values;
            
            this.dataSource.data = this.address_list;
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;

            //console.log(this.request_list);
            //console.log(typeof this.request_list[0]);
            this.IsWait = false;
            this.cdr.detectChanges();
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
        const address = this.address_list.find(a => a.id === id);
        let dialogRef = this.dialog.open(AddressForm, {
                    minWidth: "800px",
                    panelClass: "custom-dialog",
                    disableClose: true,
                    data :{
                        address: address
                    }
                });
        
        dialogRef.afterClosed().subscribe((x) => {
            if(x > 0){
                this.getAddress();
            }
        });
    }

    delete(id: number) {
        this._router.navigate([]).then((result) => {
            window.open("order/" + id, "_blank");
        });
    }
    
    new_address(){
        let dialogRef = this.dialog.open(AddressForm, {
                    minWidth: "800px",
                    panelClass: "custom-dialog",
                    disableClose: true,
                });
        
        dialogRef.afterClosed().subscribe((x) => {
            if(x > 0){
                this.getAddress();
            }
        });

    }
    
    exportAsExcel() {}

}
