import { Component, OnInit, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule ,FormBuilder, Validators} from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { CommonModule, DatePipe } from "@angular/common";
import { MatTable, MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSort, Sort, MatSortModule } from "@angular/material/sort";
import { MatIconModule } from "@angular/material/icon";
import { MatDialog } from "@angular/material/dialog";
import { MatSelectModule, MatSelect } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatExpansionModule } from "@angular/material/expansion";

import { Inventory } from "../../data/container";
import { User, DataService, UserService, ConfigService } from "../../data/data-service";
import { Id_Data, Sid_Data, Name_Data } from "../../data/data";
import { Batch, Cell,Attach_File, Cell_Assay, Provenance } from "../../data/entity";
import { FindAccession } from "../../list/find-accession/find-accession";
import { environment } from "../../../environments/environment";
@Component({
  selector: 'app-batch-form',
   imports: [
        MatProgressSpinnerModule,
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
        MatExpansionModule,
        MatTableModule,
        MatTooltipModule,
        MatSortModule
    ],
    providers: [DataService, UserService],
  templateUrl: './batch-form.html',
  styleUrl: './batch-form.css',
})
export class BatchForm {
@ViewChild("batch_name") el_batch_name!: ElementRef<HTMLInputElement>;
    @ViewChild("contact_person_input") el_contact!: ElementRef<HTMLInputElement>;
    @ViewChild("accession_id") el_accession_id!: ElementRef<HTMLInputElement>;

    VIEW_FILE = environment.VIEW_FILE;
    batch_config : any;
    provenance_config : any;
    IsWait = false;
    IsDirty = false;
    me!: User | null;
    id = -1;
    parent_batch_id : number|null = null; // for child batch
    batch_label = "";
    dup = false;
    batch!: Batch;
    inv_list!: Inventory[];
    vial_count = 0;
    provenance!: Provenance[];

    contact_list!: Id_Data[];
    culture_type_list!: string[];
    material_state_list!: string[];

    batch_form: FormGroup;
    // for attached files
    attach_file_list!: Attach_File[];
    dragAreaClass = "dragarea";
    file_list = "";
    has_file = "no_show";
    draggedFiles!: any;
    batch_file: any[] = new Array();
    
    assay_name_list!: string[];

    pass_fail_list = ["pass", "fail"];
  
    op_list!: string[];

    /* Form controls for assay editing, fileds:are:
      id
      assay
      pass
      eln
      exp_date
      control
      op
      result
      comment
      batch_id
      result_unit

    */

    assay_name = new FormControl("");
    assay_pass = new FormControl("");
    assay_eln = new FormControl("");
    assay_exp_date = new FormControl();
    assay_control = new FormControl("");
    assay_op = new FormControl("");
    assay_result = new FormControl();
    assay_comment = new FormControl("");
    assay_batch_id = new FormControl();
    assay_result_unit = new FormControl("");

    assay: Cell_Assay[] = new Array();
    dataSource!: MatTableDataSource<Cell_Assay>;
    assay_displayedColumns = [
        "id",
        "edit",
        "assay",
        "pass",
        "eln",
        "exp_date",
        "control",
        "op",
        "result",
        "comment",
        "result_unit"

    ];
    assay_columns = [        {
            columnDef: "assay",
            header: "Assay Name",
            type: "text",
            editable: "assay_name",
            style: "width: 200px",
            cell: (element: Cell_Assay) => `${element.assay}`
        },
        {
            columnDef: "pass",
            header: "Pass?",
            type: "text",
            editable: "pass_fail",
            style: "width: 50px",
            cell: (element: Cell_Assay) => `${element.pass}`
        },
        {
            columnDef: "eln",
            header: "ELN",
            type: "text",
            editable: "Y",
            style: "width: 50px",
            cell: (element: Cell_Assay) => `${element.eln}`
        },
        {
            columnDef: "control",
            header: "Control",
            type: "text",
            editable: "Y",
            style: "width: 150px",
            cell: (element: Cell_Assay) => `${element.control}`
        },
        {
            columnDef: "op",
            header: "Op",
            type: "text",
            editable: "op",
            style: "width: 50px",
            cell: (element: Cell_Assay) => `${element.op}`
        },
        {
            columnDef: "result",
            header: "Result",
            type: "number",
            editable: "Y",
            cell: (element: Cell_Assay) => `${element.result}`
        },
        {
            columnDef: "result_unit",
            header: "Result Unit",
            type: "text",
            editable: "Y",
            cell: (element: Cell_Assay) => `${element.result_unit}`
        },
        {
            columnDef: "edit",
            header: "",
            type: "isEdit",
            cell: (element: Cell_Assay) =>
                `${element.id ? element.id : ""}`
        },
        {
            columnDef: "comment",
            header: "Comment",
            type: "text",
            editable: "Y",
            style: "width: 300px",
            cell: (element: Cell_Assay) => `${element.comment}`
        },
        {
            columnDef: "exp_date",
            header: "Exp. Date",
            type: "date",
            editable: "date",
            style: "width: 300px",
            cell: (element: Cell_Assay) => `${element.exp_date}`
        }
    ];

    constructor(
        private service: DataService,
        private router: ActivatedRoute,
        private _router: Router,
        public dialog: MatDialog,
        private titleService: Title,
        private cdr : ChangeDetectorRef,
        private config_service: ConfigService,
        private fb: FormBuilder
    ) {
        this.provenance_config = this.config_service.get("provenance");
        this.batch_config = this.config_service.get("batch");
        this.batch_form = this.fb.group({
            accession_id : [null, Validators.required],          
            name : ['', Validators.required],                  
            alt_name : [''],              
            parent_batch : [null],          
            material_state : [''],        
            cells_per_vial : [null],        
            cells_per_ml : [null],          
            passage : [null],               
            eln : [''],                   
            contact_person : [null],       
            culture_type : [''],          
            culture_protocol : [''],
            dissociation_solution : [''],
            medium_growth : [''],
            medium_growth_suppl : [''],
            medium_freezing : [''],
            comments : [''],
            t1 : [''],
            t2 : [''],
            t3 : [''],
            t4 : [''],
            created_at : [''],
        });
    }

    get_user(count: number) {
        //console.log("get user after 1000 ms");
        count++;
        if (count > 5) {
            this._router.navigate([]).then((result) => {
                window.open("unauthorized?title=Unknown User - Register Batch");
            });
            // only try three times
        }
        this.me = UserService.getUser();
        if (this.id < 0 && this.me && this.me.admin < 0 && this.me.batch < 0) {
            this._router.navigate([]).then((result) => {
                window.open("unauthorized?title=Unauthorized Access - Register Batch");
            });
        }

        if (this.id > 0 && this.me) {
            if (this.me.admin < 0 && this.me.batch < 0) {
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

    warning(p: Provenance): string {
        return Provenance.warning(p, this.provenance_config);
    }

    disable() {
        this.batch_form.disable();
    }
    ngOnInit(): void {
        //this.access_group.
        this.batch_form.controls["contact_person"].valueChanges.subscribe((x) => {
            //console.log(x instanceof Author);
            //console.log("paramter is " + x);

            this.get_contact(x);
        });

        this.get_select();

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
            //console.log(params["batch_id"]);
            if (this.id > 0) {
                this.dup = params["dup"] == "Y";
                //console.log("duplication is " + this.dup);

                if (this.dup) {
                    this.parent_batch_id = this.id;
                    //this.id = -1;
                }
                this.retrieve_batch();
                //this.titleService.setTitle("Cell Batch-" + this.batch_id);
            } else if (params["accession_id"] != null) {
                this.batch = new Batch();
                this.id = -1;
                this.batch.id = -1;
                this.batch.accession_id = params["accession_id"];
                if (this.me) {
                    this.batch.contact_person = this.me.id;
                }
                this.titleService.setTitle("New Cell Batch");
                this.set_batch();
            } else {
                this.id = -1;
                this.batch = new Batch();
                this.titleService.setTitle("New Cell Batch");
                //console.log(this.batch.batch_creation_date);
                if (this.me) {
                    this.batch.contact_person = this.me.id;
                }
                this.set_batch();
            }
            this.IsWait = false;
            //this.batch_label = this.batch_id < 0 || this.dup ? "New Cell Batch" : "Cell Batch " + this.batch_id;
        });
    }

    get_select() {
        this.IsWait = true;

        this.service.getData("batch_select", null).subscribe((result) => {
            var x: any = result;
            this.culture_type_list = Name_Data.to_array(x.culture_type.values);
            this.material_state_list = Name_Data.to_array(x.material_state.values);
            this.assay_name_list = Name_Data.to_array(x.assay_name.values);
            this.op_list = Name_Data.to_array(x.op.values);
            this.IsWait = false;
        });
    }
    retrieve_batch() {
        this.IsWait = true;
        let param = this.dup ? "id=" + this.parent_batch_id : "id=" + this.id;

        this.service.getData("batch_detail", param).subscribe((result) => {
            var x: any = result;
            if (x.batch && x.batch.values.length == 1){
                this.batch = x.batch.values[0];
                this.provenance = x.provenance.values;
                if (!this.dup) {
                    this.inv_list = x.inv.values;
                }
                this.get_assay();
                this.get_file();
                try{
                    this.vial_count = x.vial.values[0].vial;
                }catch(ex){
                    // doing nothing
                }
                this.IsWait = false;
                this.set_batch();
            }else{
                alert("Can't find the batch");
                window.close();
            }
        });
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
                this.batch_form.controls["contact_person"].setValue(this.contact_list[0]);
            }
            return a;
        });
    }

    set_batch() {
        const datepipe: DatePipe = new DatePipe("en-US");
        let d_batch: string | null = "";
        if (this.batch.created_at) {
            let d: Date = new Date(Date.parse(this.batch.created_at));
            d_batch = datepipe.transform(d, "yyyy-MM-dd");
        } else if (this.id < 0) {
            let d: Date = new Date();
            d_batch = datepipe.transform(d, "yyyy-MM-dd");
        } else {
            d_batch = "";
        }

        this.batch_form.patchValue({
            accession_id : this.batch.accession_id,          
            name : this.batch.name,                  
            alt_name : this.batch.alt_name,              
            parent_batch : this.batch.parent_batch,          
            material_state : this.batch.material_state,        
            cells_per_vial : this.batch.cells_per_vial,        
            cells_per_ml : this.batch.cells_per_ml,          
            passage : this.batch.passage,               
            eln : this.batch.eln,                   
            contact_person : {id: this.batch.contact_person, name: this.batch.contact_person_name},      
            culture_type : this.batch.culture_type,          
            culture_protocol : this.batch.culture_protocol,
            dissociation_solution : this.batch.dissociation_solution,
            medium_growth : this.batch.medium_growth,
            medium_growth_suppl : this.batch.medium_growth_suppl,
            medium_freezing : this.batch.medium_freezing,
            comments : this.batch.comments,
            t1 : this.batch.t1,
            t2 : this.batch.t2,
            t3 : this.batch.t3,
            t4 : this.batch.t4,
            created_at : d_batch
        });

        if (this.dup  || this.id < 0) {
            this.id = -1;
            this.batch.id = -1;
            let d_new_batch = datepipe.transform(new Date(), "yyyy-MM-dd");
            this.batch_form.patchValue({
                parent_batch: this.parent_batch_id,
                created_at: d_new_batch,
                contact_person: {id: this.me?.id, name: this.me?.name}
            });
            
        } 

        this.batch_label = this.id < 0 || this.dup ? "New Cell Batch" : "Cell Batch " + this.id;
        this.titleService.setTitle(this.batch_label);
    }

    displayFn(user?: Sid_Data): string {
        return user && user.name ? user.name : "";
    }

    save_batch() {
      console.log(this.batch_form.value);
      const datepipe: DatePipe = new DatePipe("en-US");
      let form_value = this.batch_form.value;
      if (!form_value.name) {
          alert("Batch name can't be empty");
          this.el_batch_name.nativeElement.focus();
          return;
      }

      if (! form_value.accession_id)  {            
            alert("Please enter an accession_id");
            this.el_accession_id.nativeElement.focus();
            return;
        }
      
        let d_date;
        if (form_value.created_at){
            d_date = datepipe.transform(form_value.created_at, "yyyy-MM-dd");
        }else
        {
            d_date = '';
        }
      this.batch.name = form_value.name;
      this.batch.accession_id = form_value.accession_id;  
      this.batch.alt_name = form_value.alt_name;
      this.batch.parent_batch = form_value.parent_batch;
      this.batch.material_state = form_value.material_state;
      this.batch.cells_per_vial = form_value.cells_per_vial;
      this.batch.cells_per_ml = form_value.cells_per_ml;
      this.batch.passage = form_value.passage;
      this.batch.eln = form_value.eln;
      this.batch.contact_person = form_value.contact_person.id;
      this.batch.culture_type = form_value.culture_type;
      this.batch.culture_protocol = form_value.culture_protocol;
      this.batch.dissociation_solution = form_value.dissociation_solution;
      this.batch.medium_growth = form_value.medium_growth;
      this.batch.medium_growth_suppl = form_value.medium_growth_suppl;
      this.batch.medium_freezing = form_value.medium_freezing;
      this.batch.comments = form_value.comments;
      this.batch.t1 = form_value.t1;
      this.batch.t2 = form_value.t2;
      this.batch.t3 = form_value.t3;
      this.batch.t4 = form_value.t4;
      this.batch.created_at = d_date;

      this.batch.id = this.id;
        //console.log("batch_id is " + this.batch_id);
      
        this.service.save_batch(this.batch).subscribe((result) => {
            var x: any = result;
            //console.log(JSON.stringify(x));
            if (x.code > 0) {
                alert("Batch " + x.code + " is saved!");
                this._router.navigate(["batch/", x.code], { replaceUrl: true });
                //this._router.navigate([]).then((result) => {
                //    window.open("batch/" + x.code);
                //});
                //this._router.navigate(['/batch/' + x.code]);

                this.id = x.code;
                this.titleService.setTitle("Cell Batch-" + this.id);
                this.dup = false;
                this.retrieve_batch();
            } else {
                alert(x["message"]);
            }
        });
    }

    select_accession() {
        let dialogRef = this.dialog.open(FindAccession, {
            minWidth: "1500px",
            height: "1000px",
            panelClass: "custom-dialog",
            disableClose: true,
            data: {
                action: "select_accession",
                title: "Select an accession"
            }
        });

        dialogRef.afterClosed().subscribe((x) => {
            if (x > 0) {
              this.batch_form.controls["accession_id"].setValue(x);
            }
        });
    }

    help(topic: string) {
        
    }

    delete_batch() {
        if (this.inv_list.length > 0) {
            alert("Please remove all inventory of the cell-line before deleting the batch!");
            return;
        } else {
            if (confirm("Are you sure you want to delete this batch " + this.id + "?")) {
                //console.log("User confirmed the action.");
                let data: Object = {
                    type: "delete_batch",
                    batch_id: this.id
                };
                this.service.post_request(data).subscribe((result) => {
                    var x: any = result;
                    //console.log(JSON.stringify(x));
                    if (x.code > 0) {
                        alert("Batch is deleted");

                        this.id = -1;
                        window.close();
                    } else {
                        alert("Can't delete the batch: " + x.message);
                    }
                    //this.request.req_id = x['result'];
                });
            }
        }
    }

    close() {
        window.close();
    }

    add_assay() {
        if (this.assay.length == 0 || this.assay[0].id > 0) {
            let a = new Cell_Assay(this.id);
            this.assay.splice(0, 0, a);
            this.dataSource = new MatTableDataSource(this.assay);

            // initialize forms
            this.assay_name = new FormControl("");
            this.assay_pass = new FormControl("");
            this.assay_eln = new FormControl("");
            this.assay_exp_date = new FormControl();
            this.assay_control = new FormControl("");
            this.assay_op = new FormControl("");
            this.assay_result = new FormControl();
            this.assay_comment = new FormControl("");
            this.assay_batch_id = new FormControl();
            this.assay_result_unit = new FormControl("");
            
        }
    }

    //edit_assay(id:number){}
    delete_assay(id: number) {
        if (id < 0) {
            this.assay.splice(0, 1);
            this.dataSource = new MatTableDataSource(this.assay);
            return;
        }
        if (confirm("Are you sure you want to delete this assay " + id + "?")) {
            //console.log("User confirmed the action.");
            let data: Object = {
                type: "del_batch_assay",
                id: id
            };
            this.service.post_request(data).subscribe((result) => {
                var x: any = result;
                //console.log(JSON.stringify(x));
                if (x.code > 0) {
                    alert("assay is deleted");
                    this.get_assay();
                } else {
                    alert("Can't delete the assay: " + x.message);
                }
                //this.request.req_id = x['result'];
            });
        }
    }

    get_assay() {
        
        let type = "batch_assay_data";
        let filter = "id=" + this.id;
        this.service.getData(type, filter).subscribe((result) => {
            //return x;
            var x: any = result;
            this.assay = x.data.values;
            this.IsDirty = false;
            this.assay_result_fix();
            this.dataSource = new MatTableDataSource(this.assay);
        });
    }
    
    assay_result_fix(){
        for (let x   of this.assay){
            if (x.pass == "t"){
                x.pass = "pass";
            }else{
                x.pass = "fail";
            }
        }
    }

    assay_edit(row: Cell_Assay) {
        
        
        const datepipe: DatePipe = new DatePipe("en-US");
        if (row.isEdit) {
            let date_assay: string | null = "";
            if (this.assay_exp_date.value) {
                try {
                    let a_date = this.assay_exp_date.value;
                    date_assay = datepipe.transform(a_date, "yyyy-MM-dd");
                } catch (e) {
                    date_assay = "";
                    console.log(e);
                }
            }

            row.exp_date = date_assay ? date_assay : "";

            if (this.assay_name.value) {
                row.assay = this.assay_name.value;
            } else {
                alert("Assay name can't be empty");
                return;
            }

            if (this.assay_pass.value) {
                row.pass = this.assay_pass.value;
            } else {
                alert("You must provide a pass/fail assement");
                return;
            }

            if (this.assay_op.value) {
                row.op = this.assay_op.value;
            }

            if (this.assay_result.value) {
                row.result = this.assay_result.value;
            }

            if (this.assay_result_unit.value) {
                row.result_unit = this.assay_result_unit.value;
            }

            if (this.assay_comment.value) {
                row.comment = this.assay_comment.value;
            }

            let data: Object = Cell_Assay.to_json(row);
            Object.assign(data, { type: "add_assay" });

            this.service.post_request(data).subscribe((result) => {
                //return x;
                var x: any = result;
                var a: string;
                var outcome: number;
                //alert(x);
                //alert(x.data.values.length);
                a = x.message;
                outcome = x.code;
                if (outcome > 0) {
                    this.IsDirty = false;
                    this.get_assay();
                    
                } else {
                    alert("Can't add new assay: " + x.message);
                }
            });
            row.isEdit = !row.isEdit;
        } else {
            if (this.IsDirty){
                alert("please save assay result before editing another one");
                return;
            }
            try {
                let d: Date = new Date(Date.parse(row.exp_date));
                //let date_assay = datepipe.transform(d, "yyyy-MM-dd");
                this.assay_exp_date.setValue(d);
            } catch (e) {}

            this.assay_name.setValue(row.assay);
            this.assay_pass.setValue(row.pass);
            this.assay_op.setValue(row.op);
            this.assay_result.setValue(row.result);
            this.assay_result_unit.setValue(row.result_unit);
            this.assay_comment.setValue(row.comment);
            
            row.isEdit = !row.isEdit;
            this.IsDirty = true;
        }
        
    }

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
        //console.log("index is " + index);
        this.batch_file.splice(index, 1);
    }

    get_file() {
        this.IsWait = true;
        this.service.getData("get_file", "entity_type=batch&id=" + this.id).subscribe((result) => {
            var x: any = result;
            this.attach_file_list = x.data.values;
            this.IsWait = false;
            this.cdr.detectChanges();
        });
    }

    load_multiple() {
        this.IsWait = true;
        const form_data = new FormData();
        form_data.append("entity_type", "batch");
        form_data.append("multiple", "multiple");
        form_data.append("entity_id", this.id + "");
        for (let i: number = 0; i < this.batch_file.length; i++) {
            form_data.append("file[]", this.batch_file[i]);
        }
        this.service.upload_file(form_data).subscribe((data) => {
            var x: any = data;
            if (x.failed > 0){
                alert(x.failed + " files not loaded!" + x.message)
            }
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

    checkout(id: number) {
        let data: Object = {
            type: "checkout",
            id: id
        };

        this.service.post_request(data).subscribe((result) => {
            var x: any = result;
            //console.log(JSON.stringify(x));
            if (x.code > 0) {
                alert("Bottle checked out");
                this.retrieve_batch();
                //
            } else {
                alert("Can't check out bottle " + x.message);
                //alert("Cell line is not stored: " + x.message);
            }
            //this.request.req_id = x['result'];
            //s : Save_Result = {x: c[0], y: c[1], outcome: outcome, result: x.message};
            //this.selected_bottle[i].result = outcome;
        });
    }
    
    view_accession(){
        window.open("accession/" + this.batch.accession_id);
    }
    
    view_parent_batch(){
        if (this.batch.parent_batch){
            window.open("batch/" + this.batch.parent_batch);
        }
    }
    
    checkout_all(){
        this.IsWait = true;
        let data: Object = {
            type: "checkout_all",
            id: this.id
        };
        this.service.post_request(data).subscribe((result) => {
            var x: any = result;
            //console.log(JSON.stringify(x));
            if (x.code > 0) {
                alert(x.message);
                this.retrieve_batch();
            } else {
                alert("Can't checkout the batch: " + x.message);
            }
            this.IsWait = false;
            //this.request.req_id = x['result'];
        });
    }
    
    remove_parent_batch(){
        this.batch_form.patchValue({
                parent_batch_id: null
            });
    }

    batch_store(id: number, name: string) {
        this._router.navigate([]).then((result) => {
            window.open("inv/man-box/box?cell_id=" + id + "&cell_name=" + name, "_blank");
        });
    }
    
    batch_order(){
        this._router.navigate([]).then((result) => {
                window.open("order/new?batch_id=" + this.id, "_blank");
            });
        
    }
}
