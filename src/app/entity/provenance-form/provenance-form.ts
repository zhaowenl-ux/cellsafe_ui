import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatDialogRef } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { DatePipe } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule, MatSelect } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FormBuilder, Validators } from '@angular/forms';

import { User, DataService, ConfigService,UserService } from "../../data/data-service";
import { Sid_Data, Id_Data } from "../../data/data";
import { Provenance } from "../../data/entity";

@Component({
  selector: 'app-provenance-form',
  imports: [
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTooltipModule
],
    providers: [DataService,ConfigService, UserService],
    templateUrl: './provenance-form.html',
    styleUrls: ['./provenance-form.css'],
})
export class ProvenanceForm implements OnInit {
    IsWait = false;
    id = -1;
    me: User | null = null;
    label = "";
    provenance = new Provenance();
    config : any;
    source_list!: Id_Data[];
    source_role_list = ['RIGHTS OWNER', 'DISTRIBUTOR'];
    p_form: FormGroup;
    constructor(
        private service: DataService,
        private router: ActivatedRoute,
        private _router: Router,
        private titleService: Title,
        private fb: FormBuilder,
        private config_service: ConfigService
    ) {
        this.config = this.config_service.get("provenance");
        this.p_form = this.fb.group({
            source : [null, Validators.required],
            source_role: [''],
            contract_name: [''],
            contract_expiration : [''],
            contract_desc : [''],
            comment : [''],
            restriction : [''],
            rule1 : [false],
            rule2 : [false],
            rule3 : [false],
            rule4 : [false],
            rule5 : [false],
            t1 : [""],
            t2 : [""],
            t3 : [""]
        }); 
  
    }

    get_user(count: number) {
        console.log("get user after 1000 ms");
        count++;
        if (count > 5) {
            this._router.navigate([]).then((result) => {
                window.open("unauthorized?title=Unknown User - Edit Provenance");
            });
            // only try three times
        }
        this.me = UserService.getUser();

        if (this.id > 0 && this.me) {
            if (this.me.admin < 0 && this.me.provenance < 0) {
                this.disable();
            }
        }
        console.log(this.me);
        if (!this.me) {
            console.log("try again " + count);
            setTimeout(() => {
                this.get_user(count);
            }, 1000);
        }
    }

    ngOnInit(): void {
        let sid = this.router.snapshot.paramMap.get("id") + "";
        if (isNaN(Number(sid))) {
            this.id = -1;
        } else {
            this.id = Number(sid);
        }

        this.get_user(0);
        this.router.queryParams.subscribe((params) => {
            //console.log(params);
            //this.email = params.email;
            //console.log(params["id"]);
            if (this.id > 0) {
                this.retrieve_provenance();
                //this.titleService.setTitle("Cell Batch-" + this.batch_id);
            } else {
                this.id = -1;
                this.provenance = new Provenance();
                this.titleService.setTitle("Create New Provenance");

                this.show();
            }
            this.IsWait = false;
        });

        this.p_form.controls["source"].valueChanges.subscribe((x: any) => {
            //console.log(x instanceof Author);
            //console.log("paramter is " + x);

            this.find_source(x);
        });
    }

    find_source(name: string) {
        if (name && name.length >= 2) {
            //this.IsWait = true;
            let param = "&name=" + name;
            this.service.getData("source", param).subscribe((result) => {
                var x: any = result;
                this.source_list = x.data.values;
                //this.IsWait = false;
            });
        }
    }

    retrieve_provenance() {
        this.IsWait = true;
        let param = "id=" + this.id;

        this.service.getData("provenance", param).subscribe((result) => {
            var x: any = result;
            this.provenance = x.provenance.values[0];
            this.provenance.rule1 = (x.provenance.values[0].rule1 == 't') ? true : false;
            this.provenance.rule2 = (x.provenance.values[0].rule2 == 't') ? true : false;
            this.provenance.rule3 = (x.provenance.values[0].rule3 == 't') ? true : false;
            this.provenance.rule4 = (x.provenance.values[0].rule4 == 't') ? true : false;
            this.provenance.rule5 = (x.provenance.values[0].rule5 == 't') ? true : false;  
            this.IsWait = false;
            this.show();
        });
    }
    disable() {
        this.p_form.disable();
    }

    show() {
        if (this.id > 0) {
            this.label = "Provenance #" + this.id;
            this.titleService.setTitle("Provenance #" + this.id);
        } else {
            this.label = "Register New Provenance";
            this.titleService.setTitle("New Provenance");
        }
        let s = (this.provenance.source)? {id: this.provenance.source, name: this.provenance.source_name} : null;
        this.p_form.setValue({
            source : s,
            source_role: this.provenance.source_role,
            contract_name: this.provenance.contract_name,
            contract_expiration : this.provenance.contract_expiration,
            contract_desc : this.provenance.contract_desc,
            comment : this.provenance.comment,
            restriction : this.provenance.restriction,
            rule1 : this.provenance.rule1,
            rule2 : this.provenance.rule2,
            rule3 : this.provenance.rule3,
            rule4 : this.provenance.rule4,
            rule5 : this.provenance.rule5,
            t1 : this.provenance.t1,
            t2 : this.provenance.t2,
            t3 : this.provenance.t3
        });
    }

    displayFn(sup?: Id_Data): string {
        return sup ? sup.name : "";
    }

    save() {
      const datepipe: DatePipe = new DatePipe("en-US");
      let form_values = this.p_form.value;
      if (form_values.contract_expiration) {
            let d = datepipe.transform(form_values.contract_expiration, "yyyy-MM-dd");
            this.provenance.contract_expiration = d ? d : "";
        } else {
            this.provenance.contract_expiration = "";
        }

        if (form_values.source) {
            this.provenance.source = form_values.source.id;
        }else{
            alert("Please select source!");
            return; 
        }

        this.provenance.contract_name = form_values.contract_name;
        this.provenance.contract_desc = form_values.contract_desc;
        this.provenance.comment = form_values.comment;
        this.provenance.restriction = form_values.restriction;
        this.provenance.rule1 = form_values.rule1;
        this.provenance.rule2 = form_values.rule2;
        this.provenance.rule3 = form_values.rule3;
        this.provenance.rule4 = form_values.rule4;
        this.provenance.rule5 = form_values.rule5;
        this.provenance.t1 = form_values.t1;
        this.provenance.t2 = form_values.t2;
        this.provenance.t3 = form_values.t3;
        this.provenance.source_role = form_values.source_role;

        let post_data = Provenance.to_json(this.provenance);
        Object.assign(post_data, { type: "update_provenance" });
        this.service.post_request(post_data).subscribe((result) => {
            var x: any = result;
            //console.log(JSON.stringify(x));
            if (x.code > 0) {
                alert("Provenance " + x.code + " is saved!");
                this.id = x.code;
                this.titleService.setTitle("Provenance -" + this.id);
                this.retrieve_provenance();
            } else {
                alert(x["message"]);
            }
        });
    }
}
