/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/TypeScriptDataObjectTemplate.ts to edit this template
 */
import { DatePipe } from "@angular/common";
import { FormControl } from "@angular/forms";
export class Util {
    public static set_select(value: string, list: string[], fc: FormControl): void {
        if (!value) {
            return;
        }
        var index: number;
        if (list !== undefined && list.length > 0) {
            index = list.indexOf(value);
            if (index >= 0) {
                fc.setValue(list[index]);
                return;
            }
        }

        if (list === undefined) {
            list = new Array();
        }
        list.push(value);
        fc.setValue(list[list.length - 1]);

    }

    public static getData(key: string, o: Object): string {
        var v: string;
        try {
            v = o[key as keyof typeof o].toString();
        } catch (e) {
            v = "";
        }

        return v;
    }
}

export class Order{
    static STATUS_LIST: string[] = ["NEW", "APPROVED", "DENIED", "FILLED", "CANCELLED"];
    id = -1;
    requestor = -1;
    cell_batch_id = -1;
    order_date = '';
    status = 'NEW';
    purpose = '';
    comment = '';
    shipping_id = -1;
    order_needed  = '';
    rule1 = true;
    rule2 = true;
    rule3 = true;
    rule4 = true;
    rule5 = true;
    vial_needed = 0;
    requestor_name = '';
    cell_batch_name = '';
    shipping_name = '';
    shipping_address = '';

    
    public assign_value(o: Object){
        this.id = Number(this.getData('id', o) );
        this.requestor = Number(this.getData('requestor', o));
        this.requestor_name = this.getData('requestor_name', o);
        this.cell_batch_id = Number(this.getData('cell_batch_id', o));
        this.status = this.getData('status', o);
        this.order_date = this.getData('order_date', o);
        this.purpose = this.getData('purpose', o);
        this.rule1 = this.getData('rule1', o) == 't'? true: false;
        this.rule2 = this.getData('rule2', o) == 't'? true: false;
        this.rule3 = this.getData('rule3', o) == 't'? true: false;
        this.rule4 = this.getData('rule4', o) == 't'? true: false;
        this.rule5 = this.getData('rule5', o) == 't'? true: false;
        this.vial_needed = Number(this.getData('vial_needed', o));
        this.order_needed = this.getData('order_needed', o);
        this.shipping_id = Number(this.getData('shipping_id', o));
        this.comment = this.getData('comment', o);
        this.cell_batch_name = this.getData('cell_batch_name', o);
        this.shipping_name = this.getData('shipping_name', o);
        this.shipping_address = this.getData('shipping_address', o);
    }
    
    private getData(key: string, o: Object): string {
        var v: string;
        try {
            v = o[key as keyof typeof o].toString();
        } catch (e) {
            v = "";
        }

        return v;
    }
    
    public static to_json(o: Order): Object {
        const datepipe: DatePipe = new DatePipe("en-US");
        let d: string | null = '';
        if (o.order_needed) {

            d = datepipe.transform(o.order_needed, "yyyy-MM-dd");
        }
        
        let data: Object = {
            id : o.id,
            requestor : o.requestor,
            cell_batch_id : o.cell_batch_id,
            order_date : o.order_date,
            status : o.status,
            purpose : o.purpose,
            comment : o.comment,
            shipping_id : o.shipping_id,
            order_needed  : d,
            rule1 : o.rule1,
            rule2 : o.rule2,
            rule3 : o.rule3,
            rule4 : o.rule4,
            rule5 : o.rule5,
            vial_needed : o.vial_needed
        };
        return data;
    }
}

export class Address{
    id = -1;
    name = '';
    company = '';
    address = '';
    email = '';
    phone = '';
    is_active = true;
    
    public static to_json(addr: Address): Object {
        let data: Object = {
            id: addr.id,
            name: addr.name,
            company : addr.company,
            address : addr.address,
            phone : addr.phone,
            email : addr.email
        };

        return data;
    }
}