import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup,  Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatStepperModule } from "@angular/material/stepper";
import { MatButtonModule } from "@angular/material/button";
import { MatSelectModule, MatSelect } from "@angular/material/select";
import { DatePipe } from "@angular/common";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { Title } from "@angular/platform-browser";
import { MatIconModule } from "@angular/material/icon";
import { Router } from "@angular/router";

import { User, UserService, DataService } from "../../data/data-service";

@Component({
  selector: 'app-new-tank',
  imports: [
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule
],
    providers: [DataService, UserService],
    templateUrl: './new-tank.html',
    styleUrl: './new-tank.css',
})
export class NewTank implements OnInit {
    IsWait = false;
    IsReady = false;
    me: User | null = null;
    selectedIndex = 0;
    done_message = "You're done!";
    freezer_spec = "";

    TankForm : FormGroup;

    isLinear = true;

    setIndex(event: any) {
        this.selectedIndex = event.selectedIndex;
    }

    constructor(
        private service: DataService,
        private router: Router,
        //public dialog: MatDialog,
        private fb: FormBuilder,
        private titleService: Title
    ) {
        this.titleService.setTitle("Create a new LN2 Tank");
        this.TankForm = this.fb.group({
            name : [null, Validators.required],
            freezer: [null, Validators.required],
            rack: [null, Validators.required],
            box_x : [null, Validators.required],
            box_y : [null, Validators.required]
        });
    }

    ngOnInit(): void {
        this.me = UserService.getUser();
    }

    triggerClick() {
        console.log(`Selected tab index: ${this.selectedIndex}`);
        if (this.selectedIndex == 3) {
            let value = this.TankForm.value;
            if (value.name && value.freezer && value.rack && value.box_x && value.box_y) {
                this.IsReady = true;
                this.done_message = "Going to create freezer : " + value.name ;
                this.freezer_spec = value.freezer + " Racks -> " + value.rack + " Boxes -> " + value.box_x + " Rows x " + value.box_y + " Columns";
            } else {
                this.IsReady = false;
            }
        }
    }

    create_freezer() {
      let value = this.TankForm.value;

      if (value.freezer && value.name && value.rack && value.box_x && value.box_y) {
          this.IsWait = true;
          let data: Object = {
              type: "create_tank",
              freezer: value.freezer,
              rack: value.rack,
              box_x: value.box_x,
              box_y: value.box_y,
              name: value.name 
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
                  alert("Can't add the freezer");
              } else {
                  this.router.navigate(["inv/man-fr/" + x.code]); 
                  /*
                  this.router.navigate([]).then((result) => {
                      window.open("inv/man-fr?id=" + x.code);
                  });
                  */
              }

              this.IsWait = false;
          });
        }
    }
}
