export class Id_Data {
    id!: number;
    name!: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}

export class Name_Data {
    name!: string;

    public static to_array(data: Name_Data[]): string[] {
        let rtn: string[] = new Array(data.length);
        for (var i = 0; i < data.length; i++) {
            rtn[i] = data[i].name;
        }

        return rtn;
    }
}

export class Sid_Data {
    id: string;
    name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = decodeURI(name);
    }

    getName(): string {
        return decodeURI(this.name);
    }

    get Name() {
        return this.name;
    }

    static to_string(obj: any): string {
        return Object.entries(obj)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ");
    }

    public static find(key: string, data: Sid_Data[]): number {
        let index: number = -1;
        for (let i: number = 0; i < data.length; i++) {
            if (key === data[i].id) {
                index = i;
                break;
            }
        }
        return index;
    }
}

export interface Error_Data {
    field: string;
    code: string;
    message: string;
}

export interface File {
    name: string;
    doc_link_id: number;
}

export class User_Data{
    id = -1;
    full_name = "";
    email = "";
    alt_id = "";

    public static to_json(o: User_Data): Object {
        let data: Object = {
            id : o.id,
            full_name : o.full_name,
            email : o.email,
            alt_id : o.alt_id
        };

        return data;
    }
     
}