import { Component, OnInit,ChangeDetectorRef } from "@angular/core";

import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { Meta, Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { Sid_Data } from "../../data/data";
import { Biosafety } from "../../data/entity";
import { User,DataService, UserService } from "../../data/data-service";


@Component({
  selector: 'app-db-biosafety',
  imports: [MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  providers: [DataService, UserService],
  templateUrl: './db-biosafety.html',
  styleUrl: './db-biosafety.css',
})
export class DbBiosafety implements OnInit {
    me!: User | null;
    expired : Biosafety[] = new Array();
    one_month : Biosafety[] = new Array();
    three_month : Biosafety[] = new Array();
    IsWait = false;
    constructor(
        private router: Router,
        private service: DataService,
        private titleService : Title,
        private cdr : ChangeDetectorRef
    ) {
        
        this.titleService.setTitle(" Biosafety Dashboard");
        this.me = UserService.getUser();
    }
    
    ngOnInit(): void {
        this.me = UserService.getUser();
        
        if (!this.me || this.me.admin < 1){
            alert("You're not allowed to access this page!");
            this.router.navigate(["/"]);
        }
        this.load_data();
    }
    
    load_data(){
        this.IsWait = true;
        this.service.getData("biosafety_dashboard").subscribe((result) => {
            var x: any = result;
            this.expired = x.expired.values;
            this.one_month = x.one_month.values;
            this.three_month = x.three_month.values;
            this.IsWait = false;
            this.cdr.detectChanges();
        });
    }
            
    
    open(type: string, id: any){
        switch (type){
            case 'ACCESSION':
                this.router.navigate([]).then((result) => {
                    window.open("accession/" + id, "_blank");
                });
                break;
           case 'BIOSAFETY':
                this.router.navigate([]).then((result) => {
                    window.open("biosafety/" + id, "_blank");
                });
                break;
        }
    }

}
