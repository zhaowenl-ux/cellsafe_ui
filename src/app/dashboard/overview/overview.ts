import { Component , OnInit, ChangeDetectorRef} from '@angular/core';
import { DataService } from '../../data/data-service';

export interface OverviewProps {
    cell: number;
    accession: number;
    batch: number;
    vial: number;
}

@Component({
  selector: 'app-overview',
  imports: [],
  providers: [DataService],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview implements OnInit {
  props!: OverviewProps;

  constructor(private service: DataService,
              private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.service.getData("overview", null).subscribe((result) => {
        var x: any = result;
       this.props = x.data.values[0];
       console.log(this.props);
       this.cdr.detectChanges();
    });
  }
}
