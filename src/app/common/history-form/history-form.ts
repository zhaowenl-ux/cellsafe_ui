import { Component, Inject, OnInit, ViewChild, ChangeDetectorRef } from "@angular/core";


import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DIALOG_DATA } from "@angular/cdk/dialog";
import { MatSort, Sort, MatSortModule } from "@angular/material/sort";
import { MatFormFieldModule } from "@angular/material/form-field";

import { DataService } from "../../data/data-service";
export interface History{
    id : number;
    entity_id: number,
    who: number,
    full_name: string;
    when : string;
    what : string
}


@Component({
  selector: 'app-history-form',
  imports: [MatTableModule, MatFormFieldModule, FormsModule, ReactiveFormsModule, MatSortModule],
  providers: [DataService],
  templateUrl: './history-form.html',
  styleUrl: './history-form.css',
})
export class HistoryForm implements OnInit{
    @ViewChild(MatSort) sort!: MatSort;
    entity_id!: number;
    type!: string;
    history_list!: History[];
    historyDataSource = new MatTableDataSource(this.history_list);
    displayedColumns: string[] = ["when", "who", "description"];
    
    history_columns = [
        {
            columnDef: "when",
            header: "Time",
            cell: (element: History) => `${element.when}`
        },
        {
            columnDef: "who",
            header: "User",
            cell: (element: History) => `${element.full_name}`
        },
        {
            columnDef: "description",
            header: "Action",
            cell: (element: History) => `${element.what}`
        }
    ];
    
    constructor(
        private service: DataService,
        private cdr : ChangeDetectorRef,
        @Inject(DIALOG_DATA) public data: { entity_id: number, type: string }
    ) {
        this.entity_id = data.entity_id;
        this.type = data.type;
    }

    ngOnInit(): void {
        this.service.getData(this.type, "entity_id=" + this.entity_id).subscribe((result) => {
            var x: any = result;
            this.history_list = x.history.values;
            this.historyDataSource = new MatTableDataSource(this.history_list);
            this.historyDataSource.sort = this.sort;
            this.cdr.detectChanges();
            //console.log(this.request_list);
            //console.log(typeof this.request_list[0]);
            //this.IsWait = false;
        });
    }
    announceSortChange(sortState: Sort) {}
}
