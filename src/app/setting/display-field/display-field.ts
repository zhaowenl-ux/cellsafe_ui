import {
    Component,
    OnInit,
    ChangeDetectorRef,
    ViewChild,
    ChangeDetectionStrategy,
    Optional,
    Inject
} from "@angular/core";
import { DatePipe } from "@angular/common";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";

import { User, DataService, UserService } from "../../data/data-service";
import { FindBatch } from "../../list/find-batch/find-batch";
import { FindAccession } from "../../list/find-accession/find-accession";
import { HashTable } from "../../data/HashTable";


@Component({
  selector: 'app-display-field',
  imports: [MatButtonModule, DragDropModule],
  providers: [DataService, UserService],
  templateUrl: './display-field.html',
  styleUrl: './display-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisplayField implements OnInit{
    readonly default_batch_field = [
        "batch_name",
        "vial_count",
        "cell_name",
        "cell_species_name",
        "gene_symbol",
        "accession_reporter_name",
        "cell_disease",
        "batch_passage"
    ];
    readonly default_accession_field = [
        "accession_name",
        "cell_name",
        "cell_species_name",
        "gene_symbol",
        "accession_reporter_name",
        "cell_disease"
    ];

    entity = "Batch";
    default_field = this.default_batch_field;
    me!: User | null;
    batch_static_field = [
        {
            columnDef: "batch_name",
            header: "Batch Name"
            //cell: (element: Batch_List) => `${element.batch_name ? element.batch_name : ""}`
        },
        {
            columnDef: "accession_name",
            header: "Accession Name"
            //cell: (element: Batch_List) => `${element.accession_name ? element.accession_name : ""}`
        },
        {
            columnDef: "cell_name",
            header: "Cell Name"
            //cell: (element: Batch_List) => `${element.basecell_name ? element.basecell_name : ""}`
        },
        {
            columnDef: "biosafety_id",
            header: "Biosafety"
        }
    ];

    accession_static_field = [
        {
            columnDef: "accession_name",
            header: "Accession Name"
        },
        {
            columnDef: "cell_name",
            header: "Cell Name"
        },
        {
            columnDef: "batch_count",
            header: "# Batch"
        },
        {
            columnDef: "provenance_count",
            header: "# Provenance"
        },
        {
            columnDef: "biosafety_id",
            header: "Biosafety"
        }
    ];
    orig_field!: string[];
    result_field = this.default_field;
    source_field!: string[];
    field = [];
    display_field = [];
    target = "";
    action : string|null = null;
    lookup_table!: HashTable<string, string>;
    constructor(
        private service: DataService,
        private _router: Router,
        private router: ActivatedRoute,
        public dialog: MatDialog,
        private cdr: ChangeDetectorRef,
        private titleService: Title,
        @Optional() public dialogRef: MatDialogRef<DisplayField>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: { target: string; field: string[] }
    ) {
        this.titleService.setTitle("Set Preference");
        if (data) {
            this.target = data.target;
            this.result_field = data.field;
            this.orig_field = [...data.field];
            this.action = "live";
        }else{
            this.target = '';
        }
    }

    ngOnInit() {
        this.me = UserService.getUser();
        let sid = this.router.snapshot.paramMap.get("id") + "";
        if (! this.target && sid){
            this.target = sid;
            this.action = null;
        }
        this.init_data();
    }

    init_data() {
        if (this.target === "find-accession") {
            this.entity = "Accession";
            this.default_field = this.default_accession_field;
            this.result_field = this.default_field;
            this.lookup_table = new HashTable<string, string>(FindAccession.ALL_COLUMNS.length);
            this.source_field = new Array();
            for (const field of FindAccession.ALL_COLUMNS) {
                this.lookup_table.insert(field.columnDef, field.header);
                if (!this.result_field.includes(field.columnDef)) {
                    this.source_field.push(field.columnDef);
                }
                //this.source_field.push(field.columnDef);
            }
            for (const field of this.accession_static_field) {
                this.lookup_table.insert(field.columnDef, field.header);
                if (!this.result_field.includes(field.columnDef)) {
                    this.source_field.push(field.columnDef);
                }
                //this.source_field.push(field.columnDef);
            }
        } else {
            this.lookup_table = new HashTable<string, string>(FindBatch.ALL_COLUMNS.length);
            this.source_field = new Array();
            for (const field of FindBatch.ALL_COLUMNS) {
                this.lookup_table.insert(field.columnDef, field.header);
                if (!this.result_field.includes(field.columnDef)) {
                    this.source_field.push(field.columnDef);
                }
                //this.source_field.push(field.columnDef);
            }
            this.default_field = this.default_batch_field;
            for (const field of this.batch_static_field) {
                this.lookup_table.insert(field.columnDef, field.header);
                if (!this.result_field.includes(field.columnDef)) {
                    this.source_field.push(field.columnDef);
                }
                //this.source_field.push(field.columnDef);
            }
        }

        // deal with static field
    }

    drop(event: any) {
        let target = event.container.element.nativeElement.id,
            source = event.previousContainer.element.nativeElement.id,
            target_index = event.currentIndex,
            source_index = event.previousIndex;

        // deal with three situations
        if (target == "source_list" && source == "result_list") {
            //console.log("remove one display fields: " + target_index + " from  " + source_index);
            let el = this.result_field.splice(source_index, 1);
            this.source_field.splice(target_index, 0, el[0]);
        } else if (target == "result_list" && source == "source_list") {
            //console.log("Add a display field");
            let el = this.source_field.splice(source_index, 1);
            this.result_field.splice(target_index, 0, el[0]);
        } else if (target == "result_list" && source == "result_list") {
            //console.log("re-arragne display field");
            let el = this.result_field.splice(source_index, 1);
            this.result_field.splice(target_index, 0, el[0]);
        }
        this.cdr.detectChanges();
        /*
        console.log(event.container);
        console.log(event.container.element.nativeElement.id);
        console.log(event.previousIndex);
        console.log(event.currentIndex);
        console.log(event.previousContainer);
        console.log(event.previousContainer.element.nativeElement.id);
        
    if (event.previousContainer !== event.container) {
      transferArrayItem(event.previousContainer.data,event.container.data, 
        event.previousIndex, event.currentIndex)
    } else {
      moveItemInArray(this.artists, event.previousIndex, event.currentIndex);
    }
    */
    }

    save_pref() {
        let col = JSON.stringify(this.result_field);
        let pref = '{"displayedColumns" :' + col + "}";
        if (this.me) {
            let data: Object = {
                user: this.me.id,
                type: "save_preference",
                page: this.target,
                pref: pref
            };
            this.service.post_request(data).subscribe((result) => {
                var x: any = result;
                if (x.code > 0) {
                    alert("Preference saved!");
                } else {
                    alert("Can't save preference!");
                }
            });
        }
    }
    
    apply_pref() {
        this.dialogRef.close(this.result_field);
    }

    close() {
        this.dialogRef.close(this.orig_field);
    }
}
