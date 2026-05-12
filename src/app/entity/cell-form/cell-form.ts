import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { CommonModule, DatePipe } from "@angular/common";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule, MatSelect } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { FormBuilder, Validators } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';

import { User, DataService, UserService } from "../../data/data-service";
import { Sid_Data, Id_Data, Name_Data } from "../../data/data";
import { Batch, Cell, Provenance } from "../../data/entity";

@Component({
  selector: 'app-cell-form',
  imports: [MatProgressSpinnerModule,MatTooltipModule,CommonModule,MatIconModule,FormsModule,ReactiveFormsModule,MatAutocompleteModule,MatInputModule,MatFormFieldModule,MatSelectModule,MatButtonModule],
  providers: [DataService, UserService],
  templateUrl: './cell-form.html',
  styleUrl: './cell-form.css',
})
export class CellForm implements OnInit {
    @ViewChild("el_cell_name") el_cell_name!: ElementRef<HTMLInputElement>;
    t1: any;
    t2: any;
    t3: any;
    /*
        id  = -1;             
        name = "";           
        disease = "";
        source_tissue = "";
        source_type = "";
        species = 1;  // default human
        cellosaurus_id = "";
        reference = "";
        comments = "";
        t1 = "";
        t2 = "";
        t3 = "";
    */
    label = "";
    IsWait = false;
    dup = false;
    id = -1;
    me!: User | null;
    cell!: Cell;
    bWrite = true;
    cell_form: FormGroup;
    source_type_list!: string[];
    species_list!: Id_Data[];
    

    constructor(
        private service: DataService,
        private router: ActivatedRoute,
        private _router: Router,
        private titleService: Title,
        private fb: FormBuilder
    ) {
        this.cell_form = this.fb.group({
          name : ['', Validators.required],           
          disease : [''],           
          source_tissue : [''],
          source_type : [''],
          species : [null, Validators.required],  // default human
          cellosaurus_id:[''],
          reference : [''],
          comments : [''],
          t1 : [''],
          t2 : [''],
          t3 : ['']
        });
    }

    get_user(count: number) {
        //console.log("get user after 1000 ms");
        count++;
        if (count > 5) {
            this._router.navigate([]).then((result) => {
                window.open("unauthorized?title=Unknown User - Register Cell");
            });
            // only try three times
        }
        this.me = UserService.getUser();
        if (this.id < 0 && this.me && this.me.admin < 0 && this.me.cell < 0) {
            this._router.navigate([]).then((result) => {
                window.open("unauthorized?title=Unauthorized Access - Register Cell");
            });
        }

        if (this.id > 0 && this.me) {
            if (this.me.admin < 0 && this.me.cell < 0) {
                this.disable(); // read only access
            }
        }
        //console.log(this.me);
        if (!this.me) {
            //console.log("try again " + count);
            setTimeout(() => {
                this.get_user(count);
            }, 1000);
        }
    }

    disable() {
        this.cell_form.disable();
    }

    ngOnInit(): void {
        let sid = this.router.snapshot.paramMap.get("id") + "";
        if (isNaN(Number(sid))) {
            this.id = -1;
        } else {
            this.id = Number(sid);
        }

        this.get_user(0);
        this.get_select();
        this.router.queryParams.subscribe((params) => {
            //console.log(params);
            //this.email = params.email;
            //console.log(params["id"]);
            if (this.id > 0) {
                if (params["dup"] != null && params["dup"] == "Y") {
                    this.dup = true;
                }
                this.retrieve_cell();
                //this.titleService.setTitle("Cell Batch-" + this.batch_id);
            } else {
                this.id = -1;
                this.cell = new Cell();
                this.titleService.setTitle("New Cell Line");

                this.set_data();
            }
            this.IsWait = false;
        });
    }

    get_select() {
        this.service.getData("cell_select_data").subscribe((result) => {
            var x: any = result;
            this.species_list = x.species.values;
            this.source_type_list = Name_Data.to_array(x.source_type.values);
            this.IsWait = false;
        });
    }
    retrieve_cell() {
        this.IsWait = true;
        let param = "id=" + this.id;

        this.service.getData("cell_detail", param).subscribe((result) => {
            var x: any = result;
            if (x.cell && x.cell.values.length == 1){
                this.cell = x.cell.values[0];
                this.IsWait = false;
                this.set_data();
            }else
            {
                alert("Can't find cell line" + this.id);
                window.close();
            }
        });
    }
    set_data() {
        if (this.dup) {
            this.cell.id = -1;
            this.id = -1;
        }
        this.cell_form.patchValue({
          name: this.cell.name,
          disease: this.cell.disease,
          source_tissue: this.cell.source_tissue,
          source_type: this.cell.source_type,
          species: this.cell.species,
          cellosaurus_id: this.cell.cellosaurus_id,
          reference: this.cell.reference,
          comments: this.cell.comments,
          t1: this.cell.t1,
          t2: this.cell.t2,
          t3: this.cell.t3
        });
        this.titleService.setTitle("Cell -" + (this.id > 0 ? this.id : " New"));
        this.label = "Cell -" + (this.id > 0 ? this.id : " New");
    }
    displayFn(sup?: Id_Data): string {
        return sup ? sup.name : "";
    }

    save() {
        console.log(this.cell_form.value);
        let form_value = this.cell_form.value;
        this.cell.name = form_value.name;
        this.cell.disease = form_value.disease;
        this.cell.source_tissue = form_value.source_tissue;
        this.cell.source_type = form_value.source_type;
        this.cell.species = form_value.species;
        this.cell.cellosaurus_id = form_value.cellosaurus_id;
        this.cell.reference = form_value.reference;
        this.cell.comments = form_value.comments;
        this.cell.t1 = form_value.t1;
        this.cell.t2 = form_value.t2;
        this.cell.t3 = form_value.t3;
        
        if (!this.cell.name) {
            alert("Cell name can't be empty");
            this.el_cell_name.nativeElement.focus();
            return;
        }
        /*
        if (this.cell_disease.value) {
            this.basecell.cell_disease = this.cell_disease.value;
        }

        if (this.cell_source_tissue.value) {
            this.basecell.cell_source_tissue = this.cell_source_tissue.value;
        }

        if (this.cell_source_type.value) {
            this.basecell.cell_source_type = this.cell_source_type.value;
        }

        this.basecell.cell_source_species_id = this.cell_source_species_id.value;

        if (this.cellosaurus_id.value) {
            this.basecell.cellosaurus_id = this.cellosaurus_id.value;
        }

        if (this.reference_source.value) {
            this.basecell.reference_source = this.reference_source.value;
        }

        if (this.reference_id.value) {
            this.basecell.reference_id = this.reference_id.value;
        }

        if (this.cell_comment.value) {
            this.basecell.cell_comment = this.cell_comment.value;
        }
            */

        this.service.save_cell(this.cell).subscribe((result) => {
            var x: any = result;
            //console.log(JSON.stringify(x));
            if (x.code > 0) {
                alert("Cell " + x.code + " is saved!");
                this.id = x.code;
                this.titleService.setTitle("Cell  -" + this.id);
                this.dup = false;
                this.retrieve_cell();
            } else {
                alert(x["message"]);
            }
        });
    }

    delete() {
        if (this.id < 0) {
            alert("Cell is not saved yet");
            return;
        }

        if (!confirm("Are you sure to delete Cell " + this.id + "?")) {
            return;
        }
        /*
        this.service.delete_cell(this.basecell_id).subscribe((result) => {
            var x: any = result;
            //console.log(JSON.stringify(x));
            if (x.code == 1) {
                alert("Base Cell " + this.basecell_id + " is deleted!");
                window.close();
            } else {
                alert(x["message"]);
            }
        });
        */
    }

    view_cellosaurus() {
        if (this.cell && this.cell.cellosaurus_id) {
            window.open("https://www.cellosaurus.org/" + this.cell.cellosaurus_id, "_blank");
        }
    }

    cell_add() {
        //console.log("Base cell ID is " +  id);
        this._router.navigate([]).then((result) => {
            window.open("accession/new?cell_id=" + this.id, "_blank");
        });
    }
}