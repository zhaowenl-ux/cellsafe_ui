import { Component, OnInit,Optional, Inject } from "@angular/core";
import {  FormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { DatePipe } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";


import { User, DataService, UserService } from "../../data/data-service";
import { Address } from "../../data/order";

@Component({
  selector: 'app-address-form',
  imports: [MatProgressSpinnerModule, FormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatIconModule, MatTooltipModule],
  providers: [DataService, UserService],
  templateUrl: './address-form.html',
  styleUrl: './address-form.css',
})
export class AddressForm implements OnInit{
    title = "Enter A New Shipping Address";
    me !: User | null;
    address = new Address();
    constructor(
        private service: DataService,
        private dialogRef: MatDialogRef<AddressForm>,
        @Inject(MAT_DIALOG_DATA) public data: { address: Address }
    ) {
        if (data){
            this.address = data.address;
            this.title = "Change address for " + this.address.company;
        }
    }

    ngOnInit(): void {
        this.get_user(0);
    }

    get_user(count: number) {
        console.log(count + ": get user after 1000 ms");
        count++;
        if (count > 5) {
            return;
            // only try five times
        }
        this.me = UserService.getUser();
        
        console.log(this.me);
        if (!this.me) {
            console.log("try again " + count);
            setTimeout(() => {
                this.get_user(count);
            }, 1000);
        }
    }
    save(){
        if (! this.address.name){
            alert("Contact Name is required!");
            return;
        }

        if (! this.address.company){
            alert("Company is required!");
            return;
        }

        if (! this.address.address){
            alert("Address is required!");
            return;
        }

        var data = Address.to_json(this.address);
        Object.assign(data, { type: "new_address" });
        this.service.post_request(data).subscribe((result) => {
            var x: any = result;
            //console.log(JSON.stringify(x));
            if (x.code > 0) {
                alert("Address is saved");
                this.dialogRef.close(1);
            } else {
                alert("Can't save the address: " + x.message);
            }
            //this.request.req_id = x['result'];
        });
    }

    cancel(){
        this.dialogRef.close(-1);
    }
}
