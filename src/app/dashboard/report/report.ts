import { Component, ChangeDetectorRef, ViewChild,OnInit } from '@angular/core';
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { CommonModule } from "@angular/common";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule} from "@angular/material/select";
import { FormsModule } from '@angular/forms'; 
import { MatSort, Sort, MatSortModule } from "@angular/material/sort";

import { Id_Data } from '../../data/data';

import { User, DataService, UserService} from "../../data/data-service";
@Component({
  selector: 'app-report',
  imports: [MatProgressSpinnerModule,CommonModule, MatSortModule,MatTableModule,MatFormFieldModule,FormsModule,MatInputModule,MatSelectModule],
  providers: [DataService, UserService],
  templateUrl: './report.html',
  styleUrl: './report.css',
})
export class Report implements OnInit{
    @ViewChild(MatSort) sort!: MatSort;
    title = 'Report';
    IsWait = false;
    ShowSelect = false;
    report_type = 'tank_use';
    report_data !: any [];
    select_data !: Id_Data [];
    selected_value !: any;
    table_title = "";
    /*  columns
        rack_id
        rack_name
        box_count
        vial_count
        vial_used
    */
    dataSource = new MatTableDataSource(this.report_data);
    tank_cap_displayedColumns = ['rack_name', 'rack_desc', 'box_count', 'vial_count', 'vial_used', 'pct_used'];
    tank_cap_columns = [
        {
            columnDef: "rack_id",
            header: "ID",
            cell: (element: any) => `${element.rack_id ? element.rack_id : ""}`
        },
        {
            columnDef: "rack_name",
            header: "Rack ID",
            cell: (element: any) => `${element.rack_name ? element.rack_name : ""}`
        },
        {
            columnDef: "rack_desc",
            header: "Rack Name",
            cell: (element: any) => `${element.rack_desc ? element.rack_desc : ""}`
        },
        {
            columnDef: "box_count",
            header: "Box Count",
            cell: (element: any) => `${element.box_count ? element.box_count : ""}`
        },
        {
            columnDef: "vial_count",
            header: "Vial Count",
            cell: (element: any) => `${element.vial_count ? element.vial_count : ""}`
        },
        {
            columnDef: "vial_used",
            header: "Vial Used",
            cell: (element: any) => `${element.vial_used ? element.vial_used : ""}`
        },
        {
            columnDef: "pct_used",
            header: "Percentage Used",
            cell: (element: any) => `${!isNaN(element.vial_count) && ! isNaN(element.vial_used)? (element.vial_used / element.vial_count * 100).toFixed(2) + "%": ''}`
        }
            
    ];
    
    constructor(
        private service: DataService,
        private router: ActivatedRoute,
        private _router: Router,
        private titleService: Title,
        private cdr : ChangeDetectorRef) {
            
    }
    
    ngOnInit() {
        this.report_type = this.router.snapshot.paramMap.get("id") + "";
        switch(this.report_type) {
            case "tank_use":
                this.title = "Tank Occupancy Report";
                this.report_tank_occupancy();
                break;
            default:
                alert("Report type not found");
                window.close();
                
        } 
        
    }

    report_tank_occupancy() {
        this.IsWait = true;
        this.service.getData("tank_select").subscribe((result) => {
            var x: any = result;
            this.select_data = x.data.values;
            this.IsWait = false;
            this.ShowSelect = true;
            this.cdr.detectChanges();
        });
    }
    
    select_change(item : any) {
        this.IsWait = true;
        if (this.report_type == "tank_use") {
            this.service.getData("tank_use", "tank_id=" + item.id).subscribe((result) => {
                var x: any = result;
                this.report_data = x.data.values;
                this.dataSource = new MatTableDataSource(this.report_data);
                let total_vial_count = 0;
                let total_vial_used = 0;
                for (let item of this.report_data) {
                    total_vial_count += item.vial_count ? item.vial_count : 0;
                    total_vial_used += item.vial_used ? item.vial_used : 0;
                }
                this.table_title = `Tank Occupancy Report for Tank ${item.name} (${total_vial_used}/${total_vial_count} Vials Used)`;   
                this.cdr.detectChanges();
                this.IsWait = false;
            });
        }   
    } 
}
