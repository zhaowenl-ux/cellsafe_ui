import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";

import { User, DataService, UserService } from './data/data-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatIconModule, MatMenuModule, MatButtonModule, MatDividerModule, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
    protected readonly title = signal('cellsafe 0.5 - Cell and Biosample Management System');
    me: User | null = null;
    _location = '_blank'
    constructor(
            private service: DataService,
            private userservice: UserService,
            private route: ActivatedRoute,
            private router: Router
        ) {
            let s = UserService.getSetting();

            if (s.menu)
            {
                this._location = '_blank'
            }else{
                this._location = '_self'
            }   
        }

    ngOnInit(): void {
        //console.log("Application started!");
        //this.userservice.init();
        this.me = UserService.getUser();
        console.log(this.me);
        if (!this.me) {
            setTimeout(() => {
                this.get_user(0);
            }, 1000);
        }
    }

    get_user(count: number) {
        console.log("get user after 1000 ms " + count);
        count++;
        if (count > 5) {
            this.router.navigate([]).then((result) => {
                //window.open("unauthorized?title=Error: User is not authorized!");
                window.open("unauthorized", "_self");
                return
            });
            // only try three times
        }
        this.me = UserService.getUser();
        console.log(this.me);
        if (!this.me) {
            console.log("try again " + count);
            setTimeout(() => {
                this.get_user(count);
            }, 10000);
        }
    }

    register_entity(type: string) {
        console.log("type is " + type);
        switch (type) {
            case "batch":
                this.router.navigate([]).then((result) => {
                    window.open("batch/new", this._location);
                });
                break;
            case "accession":
                this.router.navigate([]).then((result) => {
                    window.open("accession/new", this._location);
                });
                break;
            case "cell":
                this.router.navigate([]).then((result) => {
                    window.open("cell/new", this._location);
                });
                break;
            default:
                alert("coming soon");
        }
    }
    
    set(type: string){
        switch(type){
            case 'batch_field':
                this.router.navigate([]).then((result) => {
                    window.open("settings/field/find-batch", this._location);
                });

                break;
            case 'accession_field':
                this.router.navigate([]).then((result) => {
                    window.open("settings/field/find-accession", this._location);
                });
                break;
            case 'system':
                this.router.navigate([]).then((result) => {
                    window.open("settings/system", this._location);
                });
                break;
            default:
                alert("comming soon");
        }
    }
    
    
    goto (type: string){
        //console.log(type);
        let id: number | null = null;
        if (id == null) {
            do {
                id = Number(prompt("Please enter " + type + " ID"));
            } while (isNaN(id));
        }
        
        window.open(type + "/" + id, this._location);
        //alert(id);
    }
    
    search(type: string) {
        switch (type) {
            case "batch":
                this.router.navigate([]).then((result) => {
                    window.open("find/batch", this._location);
                });
                break;
            case "accession":
                this.router.navigate([]).then((result) => {
                    window.open("find/accession", this._location);
                });
                break;
            case "cell":
                this.router.navigate([]).then((result) => {
                    window.open("find/cell", this._location);
                });
                break;
            default:
                alert("coming soon");
        }
    }

    dash(type: string){
         switch (type) {
            case "biosafety":
                this.router.navigate([]).then((result) => {
                    window.open("dashboard/biosafety", this._location);
                });
                break;
            case "overview":
                this.router.navigate([]).then((result) => {
                    window.open('dashboard/overview', this._location);
                });
                //alert("coming soon");
                break;            
            default:
                this.router.navigate([]).then((result) => {
                    window.open('dashboard/' + type, this._location);
                });
        }
    }
    
    admin(type: string) {
        this.router.navigate([]).then((result) => {
            window.open("admin/" + type, this._location);
        });
    }
    
    manage_item(type: string){
        this.router.navigate([]).then((result) => {
            window.open("manage/" +  type, this._location);
        });
    }

    inv(type: string) {
        console.log(type);
        switch (type) {
            case "add_freezer":
                this.router.navigate([]).then((result) => {
                    window.open("inv/new-fr", this._location);
                });
                break;
            case "man_freezer":
                this.router.navigate([]).then((result) => {
                    window.open("inv/man-fr/noselection", this._location);
                });
                break;
            case "man_inv":
                this.router.navigate([]).then((result) => {
                    window.open("inv/man-box/box", this._location);
                });
        }
    }

    
    help() {
        window.open("https://cellsafe.home.localdomain/asset/help.html", this._location);
    }

}
