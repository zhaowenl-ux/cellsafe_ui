import { Component, OnInit, Input, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { CommonModule, DatePipe } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatDialog } from "@angular/material/dialog";
import { MatSelectModule, MatSelect } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatExpansionModule } from "@angular/material/expansion";
import { FormBuilder, Validators } from '@angular/forms';

import { User, DataService, UserService } from "../../data/data-service";
import { Id_Data, Sid_Data, Name_Data } from "../../data/data";
import { Biosafety, Attach_File } from "../../data/entity";
import { FindAccession } from "../../list/find-accession/find-accession";
import { environment } from "../../../environments/environment";

@Component({
  selector: 'app-biosafety-form',
  imports: [MatProgressSpinnerModule,
        CommonModule,
        FormsModule,
        MatInputModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatAutocompleteModule,
        MatIconModule,
        MatButtonModule,
        MatSelectModule,
        MatCheckboxModule,
        MatExpansionModule,
        MatTooltipModule
    ],
    providers: [DataService, UserService],
    templateUrl: './biosafety-form.html',
    styleUrl: './biosafety-form.css',
})
export class BiosafetyForm implements OnInit {
    @Input() item!: Biosafety;
    @ViewChild("el_accession_id") el_accession_id!: ElementRef<HTMLInputElement>;

    //item = input(0);
    VIEW_FILE = environment.VIEW_FILE;
    embed = false;
    IsWait = false;
    id = -1;
    safety_label = "";
    gentg_level_list = ["no GMO", "S1", "S2>S1"];
    contact_list!: Id_Data[];
    me!: User | null;
    biosafety!: Biosafety;
    dup = false;

    safety_form : FormGroup;

    // for the safety certificate
    attach_file_list: Attach_File[] = new Array();
    dragAreaClass = "dragarea";
    file_list = "";
    has_file = "no_show";
    draggedFiles!: any;
    batch_file: any[] = new Array();

    constructor(
        private service: DataService,
        private router: ActivatedRoute,
        private _router: Router,
        public dialog: MatDialog,
        private cdr: ChangeDetectorRef,
        private titleService: Title,
        private fb: FormBuilder
    ) {
      this.safety_form = this.fb.group({
          accession_id : [null, Validators.required],    
          biosafety_level : [null],
          gmo : [""],
          gentg_level : [''],
          expiration_date : [''],
          risk_group : [''],
          risk_accessment : [''],
          contact_person : [null],
          comment : [''],
          t1 : [''],
          t2 : [''],
          t3 : ['']
        });
    }

    ngOnInit(): void {
        //this.access_group.
        //this.item=input(0);
        this.get_user(0);
        //console.log("input is " + this.item);
        this.safety_form.controls['contact_person'].valueChanges.subscribe((x) => {
            //console.log(x instanceof Author);
            //console.log("paramter is " + x);

            this.get_contact(x);
        });

      
        if (this.item) {
            this.biosafety = this.item;
            this.embed = true;
            this.id = this.item.id;
            this.get_file();
            this.set_biosafety();
        } else {
            this.init_route();
        }
    }
    
    init_route() {
        //this.get_select();

        let sid = this.router.snapshot.paramMap.get("id") + "";
        if (isNaN(Number(sid))) {
            this.id = -1;
        } else {
            this.id = Number(sid);
        }

        this.router.queryParams.subscribe((params) => {
            console.log(params);
            //this.email = params.email;
            //console.log(params["batch_id"]);
            if (this.id > 0) {
                this.retrieve_biosafety();
                //this.titleService.setTitle("Cell Batch-" + this.batch_id);
            } else if (params["accession_id"] != null) {
                this.biosafety = new Biosafety();
                this.id = -1;
                this.biosafety.id = -1;
                this.biosafety.accession_id = params["accession_id"];
                if (this.me) {
                    this.biosafety.contact_person = this.me.id;
                }
                this.titleService.setTitle("New Biosafety");
                this.set_biosafety();
            } else {
                this.biosafety = new Biosafety();
                this.id = -1;
                this.biosafety.id = -1;
                this.titleService.setTitle("New Biosafety");
                //console.log(this.batch.batch_creation_date);
                if (this.me) {
                    this.biosafety.contact_person = this.me.id;
                }
                this.set_biosafety();
            }
            this.IsWait = false;
            //this.batch_label = this.batch_id < 0 || this.dup ? "New Cell Batch" : "Cell Batch " + this.batch_id;
        });
    }

    retrieve_biosafety() {
        this.IsWait = true;

        this.service.getData("biosafety", "&id=" + this.id).subscribe((result) => {
            var x: any = result;
            this.biosafety = x.data.values[0];

            this.biosafety.gmo =  (x.data.values[0].gmo === 't') ? true: false;
            //this.attach_file_list = x.file.values;
            this.set_biosafety();
            this.get_file();
            this.IsWait = false;
            this.cdr.detectChanges();
        });
    }

    set_biosafety() {
        const datepipe: DatePipe = new DatePipe("en-US");
        let d_date : string | null;
        if (this.biosafety.expiration_date) {
            let d: Date = new Date(Date.parse(this.biosafety.expiration_date));
            d_date = datepipe.transform(d, "yyyy-MM-dd");
        } else if (this.id < 0) {
            let d: Date = new Date();
            d_date = datepipe.transform(d, "yyyy-MM-dd");
        } else {
            d_date = "";
        }

        let p = (this.biosafety.contact_person) ? {id: this.biosafety.contact_person, name: this.biosafety.contact_person_name} : null;

        this.safety_form.patchValue({
            accession_id : this.biosafety.accession_id,
            biosafety_level: this.biosafety.biosafety_level,
            gmo : this.biosafety.gmo,
            gentg_level : this.biosafety.gentg_level,
            expiration_date : d_date,
            risk_group: this.biosafety.risk_group,
            risk_accessment: this.biosafety.risk_accessment,
            contact_person: p,
            comment: this.biosafety.comment,
            t1: this.biosafety.t1,
            t2: this.biosafety.t2,
            t3: this.biosafety.t3
        });

        this.safety_label = this.id > 0 ? " Biosafety #" + this.id : " New Biosafety";
    }

    displayFn(user?: Sid_Data): string {
        return user && user.name ? user.name : "";
    }

    save() {
        const datepipe: DatePipe = new DatePipe("en-US");  
        let d_safety: string |null  = "";
        let form_value = this.safety_form.value;

        if (form_value.expiration_date){
            let d : Date = new Date(Date.parse(form_value.expiration_date));
            d_safety = datepipe.transform(d, "yyyy-MM-dd");
        }else{
            d_safety = "";
        }

        this.biosafety.id = this.id;
        //console.log("batch_id is " + this.batch_id);
        if (! form_value.accession_id) {
            alert("Please choose an accession");
            this.el_accession_id.nativeElement.focus();
            return;
        }
        this.biosafety.accession_id = form_value.accession_id;
        this.biosafety.biosafety_level = form_value.biosafety_level;
        this.biosafety.gmo = form_value.gmo;
        this.biosafety.gentg_level = form_value.gentg_level;
        this.biosafety.expiration_date = d_safety;
        this.biosafety.risk_group = form_value.risk_group;
        this.biosafety.risk_accessment = form_value.risk_accessment;
        this.biosafety.contact_person = (form_value.contact_person) ? form_value.contact_person.id : null;
        this.biosafety.comment = form_value.comment;
        this.biosafety.t1 = form_value.t1;
        this.biosafety.t2 = form_value.t2;
        this.biosafety.t3 = form_value.t3;

        let post_data = Biosafety.to_json(this.biosafety);
        Object.assign(post_data, { type: "save_biosafety" });
        this.service.post_request(post_data).subscribe((result) => {
            var x: any = result;
            console.log(JSON.stringify(x));
            if (x.code > 0) {
                alert("Biosafety " + x.code + " is saved!");
                this.id = x.code;
                this.titleService.setTitle("Biosafety -" + this.id);
                this.retrieve_biosafety();
            } else {
                alert(x["message"]);
            }
        });
    }

    get_user(count: number) {
        console.log("get user after 1000 ms");
        count++;
        if (count > 5) {
            this._router.navigate([]).then((result) => {
                window.open("unauthorized?title=Unknown User - Manage Biosafety");
            });
            // only try three times
        }
        this.me = UserService.getUser();
        if (this.id < 0 && this.me && this.me.admin < 0 && this.me.batch < 0) {
            this._router.navigate([]).then((result) => {
                window.open("unauthorized?title=Unauthorized Access - Manage Biosafety");
            });
        }

        if (this.id > 0 && this.me) {
            if (this.me.admin < 0 && this.me.accession < 0) {
                this.disable();
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
        
        this.safety_form.disable();
    }

    get_contact(value: string | null) {
        if (typeof value === "object" || value.length < 1) {
            return;
        }
        let type: string = "contact_search";
        let filter = "name=" + value + "*";
        
        return this.service.getData(type, filter).subscribe((result) => {
            //return x;
            var x: any = result;
            var a: Id_Data[];
            //alert(x);
            //alert(x.data.values.length);
            a = x.data.values;
            //console.log("there are " + a.length + " authors");
            this.contact_list = a;
            if (this.contact_list.length === 1) {
                this.safety_form.controls["contact_person"].setValue(this.contact_list[0]);
            }
            return a;
        });
    }

    select_accession() {
        let dialogRef = this.dialog.open(FindAccession, {
            minWidth: "1500px",
            height: "800px",
            panelClass: "custom-dialog",
            disableClose: true,
            data: {
                action: "select_accession",
                title: "Select an accession"
            }
        });

        dialogRef.afterClosed().subscribe((x) => {
            if (x > 0) {
                this.safety_form.patchValue({
                    accession_id: x
                });
            }
        });
    }

    // For safety certificates
    onFileChange(event: any) {
        let files: FileList = event.target.files;
        this.saveFiles(files);
    }

    saveFiles(files: any) {
        //console.log(files[0].size, files[0].name, files[0].type);
        for (var i in files) {
            if (files[i].size) {
                let f = this.batch_file.filter((p) => p.name == files[i].name);
                if (f.length) {
                    console.log("file " + f.length + " is already attached!");
                } else {
                    this.batch_file.push(files[i]);
                }
            }
        }

        if (this.batch_file.length > 0) {
            this.has_file = "show";
        }
    }

    @HostListener("drop", ["$event"]) onDrop(event: any) {
        this.dragAreaClass = "dragarea";
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.files) {
            let files: FileList = event.dataTransfer.files;
            this.saveFiles(files);
        }
    }

    @HostListener("dragover", ["$event"]) onDragOver(event: any) {
        this.dragAreaClass = "droparea";
        event.preventDefault();
    }

    @HostListener("dragenter", ["$event"]) onDragEnter(event: any) {
        this.dragAreaClass = "droparea";
        event.preventDefault();
    }

    @HostListener("dragend", ["$event"]) onDragEnd(event: any) {
        this.dragAreaClass = "dragarea";
        event.preventDefault();
    }

    @HostListener("dragleave", ["$event"]) onDragLeave(event: any) {
        this.dragAreaClass = "dragarea";
        event.preventDefault();
    }

    remove_file(index: number) {
        console.log("index is " + index);
        this.batch_file.splice(index, 1);
    }

    get_file() {
        this.IsWait = true;
        this.service.getData("get_file", "entity_type=biosafety&id=" + this.id).subscribe((result) => {
            var x: any = result;
            this.attach_file_list = x.data.values;
            this.IsWait = false;
            this.cdr.detectChanges();
        });
    }

    load_multiple() {
        this.IsWait = true;
        const form_data = new FormData();
        form_data.append("entity_type", "biosafety");
        form_data.append("multiple", "multiple");
        form_data.append("entity_id", this.id + "");
        for (let i: number = 0; i < this.batch_file.length; i++) {
            form_data.append("file[]", this.batch_file[i]);
        }
        this.service.upload_file(form_data).subscribe((data) => {
            var x: any = data;
            this.get_file();
            this.batch_file = new Array();
            this.IsWait = false;
        });
    }

    delete_file(id: number, name: string) {
        if (confirm("Are you sure you want to delete this file " + name + "?")) {
            //console.log("User confirmed the action.");
            let data: Object = {
                type: "del_file",
                id: id
            };
            this.service.post_request(data).subscribe((result) => {
                var x: any = result;
                //console.log(JSON.stringify(x));
                if (x.code > 0) {
                    alert("file is deleted");
                    this.get_file();
                } else {
                    alert("Can't delete the file: " + x.message);
                }
                //this.request.req_id = x['result'];
            });
        }
    }
}
