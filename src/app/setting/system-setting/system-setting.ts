import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Title } from "@angular/platform-browser";
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon'
import { MatButtonModule } from "@angular/material/button";
import { User, DataService, UserService } from "../../data/data-service";

@Component({
  selector: 'app-system-setting',
  imports: [MatCardModule, MatCheckboxModule,FormsModule,MatIconModule,MatButtonModule],
  providers: [DataService, UserService],
  templateUrl: './system-setting.html',
  styleUrl: './system-setting.css',
})
export class SystemSetting implements OnInit{
    me: User | null = null;
    open_menu_new_window = true;
    open_link_new_window = true;

    constructor(
        private service: DataService,
        private titleService: Title,
        private cdr : ChangeDetectorRef
    ) {
        this.titleService.setTitle("System Setting - CellSafe");
        this.me = UserService.getUser();
    }

    ngOnInit(): void {
        let s = UserService.getSetting();
        this.open_menu_new_window = (s.menu == 1)? true : false;
        this.open_link_new_window = (s.link == 1)? true : false;
        this.cdr.detectChanges();
    }

    save_settings() {
        console.log("Settings saved:");
        let pref = '{"menu" :' + (this.open_menu_new_window ? 1 : 0) + ',"link" :' + (this.open_link_new_window ? 1 : 0) + '}';
        if (this.me) {
            let data: Object = {
                user: this.me.id,
                type: "save_preference",
                page: 'setting',
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


}
