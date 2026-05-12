import { Component, OnInit, Inject, ElementRef } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";

import { MatFormFieldModule } from "@angular/material/form-field";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Id_Data } from "../../data/data";
import { DataService } from "../../data/data-service";

@Component({
  selector: 'app-dialog-user',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatButtonModule
],
  providers:[DataService],
  templateUrl: './dialog-user.html',
  styleUrl: './dialog-user.css',
})
export class DialogUser  implements OnInit{
    id!: number;
    title!: string;
    action!: string;
    term = "";
    action_name!: string;
    user_list!: Id_Data[];
    user = new FormControl();
    constructor(
        private service: DataService,
        private host: ElementRef<HTMLElement>,
        private dialogRef: MatDialogRef<DialogUser>,
        @Inject(MAT_DIALOG_DATA) public data: { action: string; title: string; action_name: string; id: number }
    ) {
        this.action = data.action;
        this.title = data.title;
        this.action_name = data.action_name;
        this.id = data.id;
    }

    ngOnInit(): void {
        this.user.valueChanges.subscribe((x) => {
            //console.log(x instanceof Author);
            //console.log("paramter is " + x);

            this._filter(x);
        });
    }

    displayFn(user?: Id_Data): string {
        return user && user.name ? user.name : "";
    }

    private _filter(value: string | any): any {
        if (typeof value === "object" || value.length < 2) {
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
            this.user_list = a;
            if (this.user_list.length === 1) {
                this.user.setValue(this.user_list[0]);
            }
            return a;
        });
    }

    apply() {
        switch (this.action) {
            case "add_role_member":
                this.save_user();
                break;
            case "add_group_member":
                this.save_user();
                break;
            case "dictionary":
                this.save_dictionary();
                break;
        }
    }

    save_user() {
        let uid = this.user.value.id;
        //console.log("User is " + muid);
        let data: Object = { type: this.action, id: this.id, member: uid };
        this.service.post_request(data).subscribe((result) => {
            //return x;
            var x: any = result;
            var a: string;
            var outcome: number;
            //alert(x);
            //alert(x.data.values.length);
            a = x.message;
            outcome = x.result;
            if (outcome < 0) {
                alert("Can't add new member");
            } else {
                this.dialogRef.close();
            }
        });
    }

    save_dictionary() {
        if (!this.term || this.term.trim().length == 0) {
            alert("Please enter a term!");
            return;
        }
        let data: Object = { type: "add_dictionary", dict_name: this.id, dict_key: this.term };
        this.service.post_request(data).subscribe((result) => {
            //return x;
            var x: any = result;
            var a: string;
            var outcome: number;
            //alert(x);
            //alert(x.data.values.length);
            a = x.message;
            outcome = x.result;
            if (outcome < 0) {
                alert("Can't add new member");
            } else {
                this.dialogRef.close();
            }
        });
    }

    close() {
        this.dialogRef.close();
    }

}
