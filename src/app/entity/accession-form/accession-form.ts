import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { CommonModule, DatePipe } from "@angular/common";
import { MatMenuModule } from "@angular/material/menu";
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

import { User, DataService, UserService, ConfigService } from "../../data/data-service";
import { Sid_Data, Id_Data, Name_Data } from "../../data/data";
import { Biosafety, Accession, Provenance, Batch_List } from "../../data/entity";
import { ProvList } from "../../list/prov-list/prov-list";
import { FindCell } from "../../list/find-cell/find-cell";
import { BiosafetyForm } from "../biosafety-form/biosafety-form";

export interface Accession_Gene{
    id: number;
    accession_id : number;
    ncbi_gene_id : number;
    gene_symbol: string;
    modification: string;
}
@Component({
  selector: 'app-accession-form',
  imports: [MatProgressSpinnerModule,
        FormsModule,
        MatInputModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        CommonModule,
        MatSelectModule,
        MatButtonModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatAutocompleteModule,
        MatIconModule,
        MatExpansionModule,
        MatTableModule,
        MatTooltipModule,
        MatMenuModule,
        MatCheckboxModule,
        BiosafetyForm],
    providers: [DataService,ConfigService, UserService],
    templateUrl: './accession-form.html',
    styleUrl: './accession-form.css',
})
export class AccessionForm implements OnInit{
    @ViewChild("el_accession_name") el_accession_name!: ElementRef<HTMLInputElement>;
    @ViewChild("el_contact_person") el_contact_person!: ElementRef<HTMLInputElement>;
    @ViewChild("el_basecell_id") el_basecell_id!: ElementRef<HTMLInputElement>;
    @ViewChild("el_date_discarded") el_date_discarded!: ElementRef<HTMLInputElement>;

    dup = false;
    IsWait = false;
    prio_dirty = false;
    me!: User | null;
    provenance_config : any;
    bwrite = true;
    batch_list!: Batch_List[];
    accession_label = "";
    accession!: Accession;
    cell_source_list!: Id_Data[];
    eng_source_list!: Id_Data[];
    gene_list!: Id_Data[];
    reporter_list!: Id_Data[];
    tag_list!: Id_Data[];
    eng_method_list!: Id_Data[];
    contact_list!: Id_Data[];
    status_list!: string[];
    biosafety!: Biosafety;
    provenance: Provenance[] = new Array();
    accession_gene_list !: Accession_Gene [];
    
    // for gene infomation
    gene_id  = new FormControl();
    gene_modification = new FormControl("");

    readonly batch_displayedColumns = [
        "batch_name",
        "vial",
        "cell_name",
        "species",
        "gene_symbol",
        "reporter",
        "cell_disease",
        "batch_passage_number"
    ];

    provenance_displayedColumns = [
        "source",
        "relevent",
        "restriction",
        "contract_name",
        "comment",
    ];
    provenance_columns = [
        {
            columnDef: "relevent",
            header: "Relevent",
            cell: (element: Provenance) => `${element.relevent}`
        },
        {
            columnDef: "contract_name",
            header: "Contract Name",
            cell: (element: Provenance) => `${element.contract_name ? element.contract_name : ""}`
        },
         {
            columnDef: "restriction",
            header: "Restrictions",
            cell: (element: Provenance) => `${element.restriction ? element.restriction : ""}`
        },
        {
            columnDef: "comment",
            header: "Comments",
            cell: (element: Provenance) => `${element.comment ? element.comment : ""}`
        }
    ];

    columns = [
        {
            columnDef: "batch_name",
            header: "Batch Name",
            cell: (element: Batch_List) => `${element.batch_name ? element.batch_name : ""}`
        },
        {
            columnDef: "accession_name",
            header: "Accession Name",
            cell: (element: Batch_List) => `${element.accession_name ? element.accession_name : ""}`
        },
        {
            columnDef: "cell_name",
            header: "Cell Name",
            cell: (element: Batch_List) => `${element.cell_name ? element.cell_name : ""}`
        },
        {
            columnDef: "vial",
            header: "# vials",
            cell: (element: Batch_List) => `${element.vial_count ? element.vial_count : ""}`
        },
        {
            columnDef: "species",
            header: "Species",
            cell: (element: Batch_List) => `${element.cell_species_name ? element.cell_species_name : ""}`
        },
        {
            columnDef: "gene_symbol",
            header: "Gene",
            cell: (element: Batch_List) => `${element.gene_symbol ? element.gene_symbol : ""}`
        },
        {
            columnDef: "cell_disease",
            header: "Disease",
            cell: (element: Batch_List) => `${element.cell_disease ? element.cell_disease : ""}`
        },
        {
            columnDef: "reporter",
            header: "Reporter",
            cell: (element: Batch_List) => `${element.accession_reporter_name ? element.accession_reporter_name : ""}`
        },
        {
            columnDef: "batch_passage_number",
            header: "Passage #",
            cell: (element: Batch_List) => `${element.batch_passage ? element.batch_passage : ""}`
        }
    ];

    displayedColumns = [
        "supplier_name",
        "seq",
        "contract_name",
        "contract_link",
        "contract_expiration",
        "contract_description",
        "contract_comment",
        "known_restrictions"
    ];
    dataSource = new MatTableDataSource(this.provenance);
    batch_dataSource = new MatTableDataSource(this.batch_list);
    id = -1;
    accession_form: FormGroup;

    constructor(
        private service: DataService,
        private router: ActivatedRoute,
        private _router: Router,
        public dialog: MatDialog,
        private cdr: ChangeDetectorRef,
        private titleService: Title,
        private fb: FormBuilder,
        private config_service: ConfigService
    ) {
        this.provenance_config = this.config_service.get("provenance");
        this.accession_form = this.fb.group({
          cell_id: [null, Validators.required],
          name : ['', Validators.required],
          eln : [''],
          date_received : [''],
          date_discarded : [''],
          cell_source : [null],
          catalog_num : [''],
          engineering_source : [null],
          reporter : [null],
          tag : [null],
          engineering_method : [null],
          pool_name : [''],
          clone_name : [''],
          passage : [null],
          status : [''],
          contact_person : [],
          comments : [''],
          t1 : [''],
          t2 : [''],
          t3 : ['']
        });

        this.provenance_columns.push({
            columnDef: "rule1",
            header: this.provenance_config["rule1"].name,
            cell: (element: Provenance) => `${element.rule1}`
        },
        {
            columnDef: "rule2",
            header: this.provenance_config["rule2"].name,
            cell: (element: Provenance) => `${element.rule2}`
        },
        {
            columnDef: "rule3",
            header: this.provenance_config["rule3"].name,
            cell: (element: Provenance) => `${element.rule3}`
        },
        {
            columnDef: "rule4",
            header: this.provenance_config["rule4"].name,
            cell: (element: Provenance) => `${element.rule4}`
        },
        {
            columnDef: "rule5",
            header: this.provenance_config["rule5"].name,
            cell: (element: Provenance) => `${element.rule5}`
        })

        if (this.provenance_config["rule1"].display) {
            this.provenance_displayedColumns.push("rule1");
        }
        if (this.provenance_config["rule2"].display) {
            this.provenance_displayedColumns.push("rule2");
        }
        if (this.provenance_config["rule3"].display) {
            this.provenance_displayedColumns.push("rule3");
        }
        if (this.provenance_config["rule4"].display) {
            this.provenance_displayedColumns.push("rule4");
        }
        if (this.provenance_config["rule5"].display) {
            this.provenance_displayedColumns.push("rule5");
        }   
    }

    displayFn(sup?: Id_Data): string {
        return sup ? sup.name : "";
    }

    displayUser(sup?: Sid_Data): string {
        return sup ? sup.name : "";
    }

    get_user(count: number) {
        //console.log("get user after 1000 ms");
        count++;
        if (count > 5) {
            this._router.navigate([]).then((result) => {
                window.open("unauthorized?title=Unauthorized Access - Register Accession");
            });
            // only try three times
        }
        this.me = UserService.getUser();
        if (this.id < 0 && this.me && this.me.admin < 0 && this.me.accession < 0) {
            this._router.navigate([]).then((result) => {
                window.open("unauthorized?title=Unauthorized Access - Register Accession");
            });
        }

        if (this.id > 0 && this.me) {
            if (this.me.admin < 0 && this.me.accession < 0) {
                this.disable();
            }
        }
        //console.log(this.me);
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
        this.get_select();
        this.router.queryParams.subscribe((params) => {
            //console.log(params);
            //this.email = params.email;
            //console.log(params["id"]);
            if (this.id > 0) {
                if (params["dup"]) {
                    // replicate
                    this.dup = true;
                }
                this.retrieve_accession();
                //this.titleService.setTitle("Cell Batch-" + this.batch_id);
            } else if (params["cell_id"] != null) {
                this.accession = new Accession();
                this.id = -1;
                this.accession.id = -1;
                this.accession.cell_id = params["cell_id"];
                if (this.me) {
                    this.accession.contact_person = this.me.id;
                }
                this.titleService.setTitle("New Accession");
                this.set_accession();
            } else {
                this.id = -1;
                this.accession = new Accession();
                this.titleService.setTitle("New Accession");

                if (this.me) {
                    this.accession.contact_person = this.me.id;
                }
                this.set_accession();
            }
            this.IsWait = false;
        });

        this.accession_form.controls["cell_source"].valueChanges.subscribe((x) => {
            //console.log(x instanceof Author);
            //console.log("paramter is " + x);

            this.get_source(x, "cell");
        });

        this.accession_form.controls["engineering_source"].valueChanges.subscribe((x) => {
            //console.log(x instanceof Author);
            //console.log("paramter is " + x);

            this.get_source(x, "eng");
        });

        this.gene_id.valueChanges.subscribe((x) => {
            //console.log(x instanceof Author);
            //console.log("paramter is " + x);

            this.get_gene(x);
        });

        this.accession_form.controls["contact_person"].valueChanges.subscribe((x) => {
            //console.log(x instanceof Author);
            //console.log("paramter is " + x);

            this.get_contact(x);
        });

        this.accession_form.controls["engineering_method"].valueChanges.subscribe((x) => {
            //console.log(x instanceof Author);
            //console.log("paramter is " + x);

            this.get_eng_method(x);
        });
    }

    disable() {
        this.accession_form.disable();
        this.gene_id.disable();
        this.bwrite = false;
    }

    get_select() {
        this.IsWait = true;

        this.service.getData("accession_select").subscribe((result) => {
            var x: any = result;
            this.reporter_list = x.reporter.values;
            this.tag_list = x.tag.values;
            this.status_list = Name_Data.to_array(x.status.values);

            this.IsWait = false;
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
                this.accession_form.controls["contact_person"].setValue(this.contact_list[0]);
            }
            return a;
        });
    }

    get_eng_method(x: any) {
        if (typeof x === "object" || x.length < 2) {
            return;
        }
        let type = "eng_method",
            filter = "name=" + x;

        return this.service.getData(type, filter).subscribe((result) => {
            //return x;
            var x: any = result;
            var a: Id_Data[];
            //alert(x);
            //alert(x.data.values.length);
            a = x.data.values;
            this.eng_method_list = a;
            if (this.eng_method_list.length === 1) {
                this.accession_form.controls["engineering_method"].setValue(this.eng_method_list[0]);
            }
        });
    }

    get_source(x: any, target: "eng" | "cell") {
        if (typeof x === "object" || x.length < 2) {
            return;
        }
        let type = "source",
            filter = "name=" + x;

        return this.service.getData(type, filter).subscribe((result) => {
            //return x;
            var x: any = result;
            var a: Id_Data[];
            //alert(x);
            //alert(x.data.values.length);
            a = x.data.values;
            //console.log("there are " + a.length + " authors");
            if (target == "eng") {
                this.eng_source_list = a;
                if (this.eng_source_list.length === 1) {
                    this.accession_form.controls["engineering_source"].setValue(this.eng_source_list[0]);
                }
            } else if (target == "cell") {
                this.cell_source_list = a;
                if (this.cell_source_list.length === 1) {
                    this.accession_form.controls["cell_source"].setValue(this.cell_source_list[0]);
                }
            }
        });
    }

    get_gene(x: any) {
        if (typeof x === "object" || x.length < 3) {
            return;
        }
        let type = "gene",
            filter = "name=" + x;

        return this.service.getData(type, filter).subscribe((result) => {
            //return x;
            var x: any = result;
            var a: Id_Data[];
            //alert(x);
            //alert(x.data.values.length);
            a = x.data.values;
            //console.log("there are " + a.length + " authors");
            
            this.gene_list = a;
            this.cdr.detectChanges();
        });
    }

    refresh() {
        this.retrieve_accession();
    }

    retrieve_accession() {
        this.IsWait = true;
        let type = "accession_detail",
            filter = "id=" + this.id;
        this.service.getData(type, filter).subscribe((result) => {
            //return x;
            var x: any = result;
            if (x.accession && x.accession.values.length==1){
                this.accession = x.accession.values[0];
                this.provenance = x.provenance.values;
                for (let i = 0; i < this.provenance.length; i++) {
                    this.provenance[i].rule1 = (x.provenance.values[i]["rule1"] == 't') ? true : false;
                    this.provenance[i].rule2 = (x.provenance.values[i]["rule2"] == 't') ? true : false;
                    this.provenance[i].rule3 = (x.provenance.values[i]["rule3"] == 't') ? true : false;
                    this.provenance[i].rule4 = (x.provenance.values[i]["rule4"] == 't') ? true : false;
                    this.provenance[i].rule5 = (x.provenance.values[i]["rule5"] == 't') ? true : false;
                    this.provenance[i].relevent = (x.provenance.values[i]["relevent"] == 't') ? true : false;
                }

                if (x.biosafety && x.biosafety.values.length > 0) {
                    this.biosafety = x.biosafety.values[0];
                    this.biosafety.gmo = (x.biosafety.values[0].gmo === 't') ? true : false;
                } else {
                    this.biosafety = new Biosafety();
                    this.biosafety.accession_id = this.id;
                }
                this.batch_list = x.batch.values;
                this.accession_gene_list = x.gene.values;
                this.dataSource = new MatTableDataSource(this.provenance);
                this.batch_dataSource.data =this.batch_list;
                
                this.set_accession();
                this.IsWait = false;
                this.cdr.detectChanges();
            }else{
                alert("Can't find the accession " + this.id);
                window.close();
            }
        });
    }

    set_accession() {
        
        const datepipe: DatePipe = new DatePipe("en-US");
        let d_received : string|null  = "";
        let d_discarded : string| null  = "";
        if (this.accession.date_received){
            d_received = datepipe.transform(this.accession.date_received, "yyyy-MM-dd");
        }

        if (this.accession.date_discarded){
            d_discarded = datepipe.transform(this.accession.date_received, "yyyy-MM-dd");
        }

        let c_source = this.accession.cell_source ?{id: this.accession.cell_source, name: this.accession.cell_source_name}: null;
        let e_source = this.accession.engineering_source ? {id: this.accession.engineering_source, name: this.accession.engineering_source_name} : null;
        let contact : any;
        if (this.id <0){
            contact = {id: this.me?.id, name: this.me?.name};
        }else{
            contact = this.accession.contact_person ? {id: this.accession.contact_person, name: this.accession.contact_person_name} : null;
        }
        this.accession_form.patchValue({
            cell_id : this.accession.cell_id,
            name : this.accession.name,
            eln : this.accession.eln,
            date_received : d_received,
            date_discarded : d_discarded,
            cell_source : c_source,
            catalog_num : this.accession.catalog_num,
            engineering_source: e_source,  
            reporter : this.accession.reporter,
            tag : this.accession.tag,
            engineering_method : this.accession.engineering_method,
            pool_name : this.accession.pool_name,
            clone_name : this.accession.clone_name,
            passage : this.accession.passage,
            status : this.accession.status,
            contact_person : contact,
            comments : this.accession.comments,
            t1 : this.accession.t1,
            t2 : this.accession.t2,
            t3 : this.accession.t3
        });
        //const datepipe: DatePipe = new DatePipe("en-US");
        if (this.dup) {
            let d_new_batch = datepipe.transform(new Date(), "yyyy-MM-dd");
            this.accession_form.patchValue({
                date_received: d_new_batch,
                contact_person: this.me?.id
            });
        } 

        if (this.dup) {
            
            this.id = -1;
            this.accession.id = -1;            
        }
        this.accession_label = this.id < 0 ? "New Accession" : "Accession " + this.id;
        this.titleService.setTitle(
            "Cell - " + (this.id < 0 ? "New Accession" : "Accession " + this.id)
        );
    }

    add_provenance() {
        let dialogRef = this.dialog.open(ProvList, {
            minWidth: "800px",
            panelClass: "custom-dialog",
            disableClose: true,
            data: {
                action: "select_provenance",
                title: "Select a provenance"
            }
        });

        dialogRef.afterClosed().subscribe((x) => {
            if (x > 0) {
                //let provenance_id = x;
                //console.log("proveance is " + provenance_id)let data: Object = { type: "del_provenance", provenance_id: id, accession_id: this.accession_id };
                let data: Object = { type: "add_provenance", provenance_id: x, accession_id: this.id };
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
                        alert("Can't add the provenance");
                    } else {
                        this.refresh();
                    }
                });
            }
        });
    }

    del_provenance(id: number) {
        if (confirm("Do you really want to delete the provenance?") != true) {
            return;
        }
        let data: Object = { type: "del_provenance", provenance_id: id, accession_id: this.id };
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
                alert("Can't delete the provenance");
            } else {
                this.refresh();
            }
        });
    }

    move_provenance(index: number, step: 1 | -1) {
        let el = this.provenance.splice(index, 1);
        this.provenance.splice(index + step, 0, el[0]);
        this.dataSource = new MatTableDataSource(this.provenance);
        this.prio_dirty = true;

        for (let i = 0; i < this.provenance.length; i++) {
            this.provenance[i].seq = i + 1;
        }
    }

    save_provenance_prio() {
        for (let i = 0; i < this.provenance.length; i++) {
            let data: Object = {
                type: "mod_prio_provenance",
                provenance_id: this.provenance[i].id,
                accession_id: this.provenance[i].accession_id,
                priority: this.provenance[i].seq
            };
            this.service.post_request(data).subscribe((result) => {
                //return x;
                var x: any = result;
                var a: string;
                var outcome: number;
                //alert(x);
                //alert(x.data.values.length);

                if (i == this.provenance.length - 1) {
                    a = x.message;
                    outcome = x.code;
                    if (outcome < 0) {
                        alert("Can't save the provenance priority");
                    } else {
                        this.refresh();
                    }
                }
            });
        }

        this.prio_dirty = false;
    }

    save_accession() {
      console.log(this.accession_form.value);
      const datepipe: DatePipe = new DatePipe("en-US");
      let form_value = this.accession_form.value;

      this.accession.id = this.id;
      if (! form_value.cell_id) {
            alert("Cell ID is required");
            this.el_basecell_id.nativeElement.focus();
            return;
      }

      if (! form_value.name) {
            alert("Accession Name is required!");
            this.el_accession_name.nativeElement.focus();
            return;
      }

        if (! form_value.contact_person) {
            alert("Contact Person is required!");
            this.el_contact_person.nativeElement.focus();
            return;
        }

        if (form_value.status) {
            if (form_value.status == "DISCARDED") {
                
                if (this.batch_list && this.batch_list.length > 0) {
                    alert("You can't discard this accession, there are batches associated.");
                    this.accession_form.controls["status"].setValue(this.accession.status);
                    return;
                }

                if (!form_value.date_discarded) {
                    alert("Please set up the discarded date");
                    //this.el_date_discarded.nativeElement.focus();
                    return;
                }
            }
        }

        let d_date_received, d_date_discarded;
        if ( form_value.date_received){
            d_date_received = datepipe.transform(form_value.date_received, "yyyy-MM-dd")
        }else{
            d_date_received = '';
        }

        if (form_value.date_discarded){
            d_date_discarded = datepipe.transform(form_value.date_discarded, "yyyy-MM-dd")
        }else
        {
            d_date_discarded = "";
        }
        this.accession.cell_id = form_value.cell_id;
        this.accession.name = form_value.name;
        this.accession.eln = form_value.eln;
        this.accession.date_received = d_date_received;
        this.accession.date_discarded = d_date_discarded;
        this.accession.cell_source = (form_value.cell_source) ? form_value.cell_source.id : null;
        this.accession.catalog_num = form_value.catalog_num;
        this.accession.engineering_source = (form_value.engineering_source) ?form_value.engineering_source.id : null;
        this.accession.reporter = form_value.reporter;
        this.accession.tag = form_value.tag;
        this.accession.engineering_method = form_value.engineering_method;
        this.accession.pool_name = form_value.pool_name;
        this.accession.clone_name = form_value.clone_name;
        this.accession.passage = form_value.passage;
        this.accession.status = form_value.status;
        this.accession.contact_person = (form_value.contact_person) ? form_value.contact_person.id : null;
        this.accession.comments = form_value.comments;
        this.accession.t1 = form_value.t1;
        this.accession.t2 = form_value.t2;
        this.accession.t3 = form_value.t3;


        // do saving
        this.service.save_accession(this.accession).subscribe((result) => {
            var x: any = result;
            //console.log(JSON.stringify(x));
            if (x.code > 0) {
                alert("Accession " + x.code + " is saved!");
                this.id = x.code;
                this._router.navigate(["accession/", x.code], { replaceUrl: true });
                this.titleService.setTitle("Accession -" + this.id);
                this.dup = false;
                this.retrieve_accession();
            } else {
                alert(x["message"]);
            }
        });
    }

    
    select_cell() {
        let dialogRef = this.dialog.open(FindCell, {
            minWidth: "1500px",
            height: "800px",
            panelClass: "custom-dialog",
            disableClose: true,
            data: {
                action: "select_basecell",
                title: "Select a Base Cell"
            }
        });

        dialogRef.afterClosed().subscribe((x) => {
            if (x > 0) {
                this.accession_form.controls["cell_id"].setValue(x);
            }
        });
    }

    help(type: string) {
        
    }

    open_provenance(id: number) {
        this._router.navigate([]).then((result) => {
            window.open("provenance/" + id, "_blank");
        });
    }

    check_status() {
        if (this.accession_form.controls["status"].value == "DISCARDED") {
            // && !this.formControl.controls["date_discarded"].value el_date_discarded
            if (this.batch_list && this.batch_list.length > 0) {
                alert("You can't discard the accession, there are batches associated.");
                this.accession_form.controls["status"].setValue(this.accession.status);
                return;
            }

            if (!this.accession_form.controls["date_discarded"].value) {
                alert("Please set up the discarded date");
                //this.el_date_discarded.nativeElement.focus();
            }
        }
    }

    set_relevent(index: number, rel: string) {
        let p = this.provenance[index];
        let data: Object = {
            type: "update_accession_provenance",
            provenance_id: p.id,
            accession_id: this.id,
            relevent: rel
        };
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
                alert("Can't update the provenance");
            } else {
                this.refresh();
            }
        });
    }
    
    view_cell(){
        window.open("cell/" + this.accession.cell_id);
    }

    delete_gene(id: number, name: string){
        if (confirm("Do you really want to delete gene " + name + "?") != true) {
            return;
        }
        let data: Object = { type: "del_accession_gene", id: id };
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
                alert("Can't delete the gene");
            } else {
                this.refresh();
            }
        });
    }

    add_gene(){
        let gene = this.gene_id.value;
        if (! gene){
            alert("Please select a gene");
            return;
        }
        let data: Object = { type: "add_gene", accession_id: this.id, gene: gene.id, modification: this.gene_modification.value };
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
                alert("Can't add the gene");
            } else {
                this.gene_id.setValue('');
                this.gene_modification.setValue('');
                this.refresh();
            }
        });
    }

    displayGene(gene: any) {
        return gene ? gene.name : null;
    }

    accession_addbatch() {
        this._router.navigate([]).then((result) => {
            window.open("batch/new?accession_id=" + this.id, "_blank");
        });
    }
}
