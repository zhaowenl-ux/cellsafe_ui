import { Routes } from '@angular/router';
import { FindBatch} from "./list/find-batch/find-batch";
import { FindAccession } from "./list/find-accession/find-accession";
import { FindCell } from "./list/find-cell/find-cell";
import { BatchForm} from "./entity/batch-form/batch-form";
import { AccessionForm} from "./entity/accession-form/accession-form";
import { CellForm } from "./entity/cell-form/cell-form";
import { ProvenanceForm} from "./entity/provenance-form/provenance-form";
import { ProvList } from "./list/prov-list/prov-list";
import { GroupAdmin } from "./admin/group-admin/group-admin";
import { RoleAdmin } from "./admin/role-admin/role-admin";
import { NewTank } from "./inv/new-tank/new-tank";
import { ManContainer } from "./inv/man-container/man-container";
import { ManBox } from './inv/man-box/man-box';
import { CommonAdmin } from './admin/common-admin/common-admin';
import { ErrorForm } from './common/error-form/error-form';
import { View } from './inv/view/view';
import { BiosafetyForm } from "./entity/biosafety-form/biosafety-form";
import { DbBiosafety } from "./dashboard/db-biosafety/db-biosafety";
import { Overview } from './dashboard/overview/overview';
import { Report } from './dashboard/report/report';
//import { ViewListComponent } from "./list/view-list/view-list.component";
//import { ManageListComponent } from "./list/manage-list/manage-list.component";
import { ContainerDetail} from './inv/container-detail/container-detail';
import { OrderListForm } from './list/order-list-form/order-list-form';
import { OrderForm } from './entity/order-form/order-form';
import { DisplayField } from './setting/display-field/display-field';
import{ UserAdmin } from './admin/user-admin/user-admin';
import { AddressList} from './list/address-list/address-list';
import { SystemSetting } from './setting/system-setting/system-setting';

export const routes: Routes = [
    { path: "find/batch", component: FindBatch },
    { path: "find/accession", component: FindAccession },
    { path: "find/cell", component: FindCell },
    { path: "batch/:id", component: BatchForm },
    { path: "accession/:id", component: AccessionForm },
    { path: "cell/:id", component: CellForm },
    { path: "biosafety/:id", component: BiosafetyForm},
    { path: "provenance/:id", component: ProvenanceForm },
    { path: "admin/prov", component: ProvList },
    { path: "manage/:type", component: CommonAdmin },
    { path: "admin/group", component: GroupAdmin },
    { path: "admin/role", component: RoleAdmin },
    { path: "admin/user", component: UserAdmin },
    { path: "admin/address", component: AddressList},
    { path: "inv/new-fr", component: NewTank },
    { path: "inv/man-fr/:id", component: ManContainer },
    { path: 'inv/man-box/:id', component: ManBox},
    { path: 'inv/view/:id', component: View},
    { path: 'inv/detail/:id', component: ContainerDetail},
   // { path: 'list/:id', component: ViewListComponent},
   // { path: 'manage/list', component: ManageListComponent},
   // { path: 'admin/list', component: ManageListComponent},
    { path: 'dashboard/biosafety', component: DbBiosafety},
    { path: 'unauthorized', component: ErrorForm},
    { path: 'settings/field/:id', component: DisplayField},
    { path: "order/:id", component: OrderForm },
    { path: "order-list", component: OrderListForm},
    { path: "admin/order", component: OrderListForm},
    { path: 'error', component: ErrorForm},
    { path: 'dashboard/overview', component: Overview},
    { path: 'settings/system', component: SystemSetting},
    { path: 'dashboard/report/:id', component: Report},
    { path: "**", component: FindBatch }

];
