export interface Container {
    id:number;
    parent_id:number;
    type:string;
    status:string;
    name:string;
    desc:string;
    barcode:string;
    x:number;
    y:number;
    position:string;
    site:string;
    x_size:number;
    y_size:number;
    t1:string;
    t2:string;
    t3:string;
    capacity:number;
    n1:number;
    n2:number;
    n3:number;
}

export interface Cell_Vial {
    vial_id:number;
    cont_id:number;
    barcode:string;
    x:number;
    y:number;
    position?:string;
    mat_id :number;
    cell_batch_name?:string;
    mat_type?:number;
    vial_type?:number;
    t1?:string;
    t2?:string;
    t3?:string;
    d1?:number;
    d2?:number;
    d3?:number;
    vial_type_name?:string;
    vial_type_desc?:string;
    material_type_name?:string;
    material_type_desc?:string;
    color?:string;
    can_access?:boolean;
    selected?:boolean;
}

export interface Inventory {
    vial_id:number;
    cont_id:number;
    barcode:string;
    x:number;
    y:number;
    position:string;
    vial_status : string;
    mat_id:number;
    mat_type:number;
    vial_type:number;
    t1:string;
    t2:string;
    t3:string;
    d1:number;
    d2:number;
    d3:number;
    box_id:number;
    box_name:string;
    box_desc:string;
    box_barcode:string;
    box_owner:number;
    box_owner_name: string;
    rack_id:number;
    rack_name:string;
    rack_desc:string;
    rack_barcode:string;
    tank_id:number;
    tank_name:string;
    tank_desc:string;
    tank_barcode:string;
    material_type_name:string;
    material_type_desc:string;
    vial_type_name:string;
    vial_type_desc:string;
    cell_batch_name:string;
    is_visible: string;
}

export interface Box{
    box_id:number;
    box_status:string;
    box_name:string;
    box_desc:string;
    box_barcode:string;
    box_x:number;
    box_y:number;
    box_position:string;
    rack_id:number;
    rack_status:string;
    rack_name:string;
    rack_desc:string;
    rack_barcode:string;
    rack_x:number;
    rack_y:number;
    rack_position:string;
    tank_id:number;
    tank_status:string;
    tank_name:string;
    tank_desc:string;
    tank_barcode:string;

}