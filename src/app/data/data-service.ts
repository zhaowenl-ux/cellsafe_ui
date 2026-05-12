import { Injectable, OnInit } from "@angular/core";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { FormControl } from "@angular/forms";
import { environment } from "../../environments/environment";
import { Batch, Accession, Cell } from "./entity";
@Injectable({
    providedIn: "root"
})
export class DataService {
    readonly GET_SERVICE = environment.GET_SERVICE;
    readonly POST_SERVICE = environment.POST_SERVICE;
    readonly FILE_SERVICE = environment.FILE_SERVICE;

    constructor(private http: HttpClient) {}

    public getData(_type: string, _filter: string | null = null): Observable<string> {
        let url = this.GET_SERVICE + "?type=" + _type;

        if (_filter != null) {
            url += "&" + _filter;
        }

        return this.http.get(url) as Observable<string>;
    }

    public post_request(data: Object): Observable<string> {
        const headers = { "content-type": "application/json" };
        return this.http.post(this.POST_SERVICE, data, { headers: headers }) as Observable<string>;
    }

    public upload_file(data: Object): Observable<ArrayBuffer> {
        //const headers = { "content-type": "multipart/form-data" };
        return this.http.post(this.FILE_SERVICE, data) as Observable<ArrayBuffer>;
    }

    public save_batch(batch: Batch): Observable<string> {
        const headers = { "content-type": "application/json" };
        let data: Object = Batch.to_json(batch);
        Object.assign(data, { type: "update_batch" });
        return this.http.post(this.POST_SERVICE, data, { headers: headers }) as Observable<string>;
    }

    public save_accession(accession: Accession): Observable<string> {
        const headers = { "content-type": "application/json" };
        let data: Object = Accession.to_json(accession);
        Object.assign(data, { type: "update_accession" });
        return this.http.post(this.POST_SERVICE, data, { headers: headers }) as Observable<string>;
    }

    public save_cell(cell: Cell): Observable<string> {
        const headers = { "content-type": "application/json" };
        let data: Object = Cell.to_json(cell);
        Object.assign(data, { type: "update_cell" });
        return this.http.post(this.POST_SERVICE, data, { headers: headers }) as Observable<string>;
    }
}

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

export interface User {
    id: number;
    name: string;
    email: string;
    admin: number;
    accession: number;
    cell: number;
    batch: number;
    provenance: number;
}

@Injectable({
    providedIn: "root"
})
export class UserService {
    readonly LOG_URL = environment.LOG_URL;
    static readonly USER_KEY = "AUTH_KEY";
    static readonly SETTING_KEY = "SETTING";
    user: User = {} as User;
    constructor(private service: DataService) {
        //this.init();
    }

    static getUser(): User | null {
        let s: string | null = localStorage.getItem(UserService.USER_KEY);
        if (s) {
            return JSON.parse(s);
        }

        return null;
    }

    static getSetting(): any | null {
        let s: string | null = localStorage.getItem(UserService.SETTING_KEY);
        if (s) {
            return JSON.parse(s);
        }

        return null;
    }
    
    init(): Promise<void> {
        this.service.getData("user").subscribe({
            next: (value) => {
                //console.log("Observable emitted the next value: " + value);
                var x: any = value;
                var a: any;

                a = x.data.values[0];
                this.user.id = a.id;
                this.user.name = a.name;
                this.user.email = a.email;

                this.service.getData("priv").subscribe((result) => {
                    var x: any = result;
                    try {
                        this.user.admin = x.admin.values[0].priv;
                    } catch (error) {
                        this.user.admin = 0;
                    }
                    try {
                        this.user.accession = x.accession.values[0].priv;
                    } catch (error) {
                        this.user.accession = 0;
                    }
                    try {
                        this.user.cell = x.cell.values[0].priv;
                    } catch (error) {
                        this.user.cell = 0;
                    }
                    try {
                        this.user.batch = x.batch.values[0].priv;
                    } catch (error) {
                        this.user.batch = 0;
                    }
                    try {
                        this.user.provenance = x.provenance.values[0].priv;
                    } catch (error) {
                        this.user.provenance = 0;
                    }   

                    // next get the user settings
                    let setting : any;
                    this.service.getData("load_pref", "page=setting").subscribe((res) => {
                        let x : any = res;
                        try {
                            let pref = x.data.values[0].pref;
                            let y : any = JSON.parse(pref);
                            console.log('setting is ' + JSON.stringify(y));
                            setting = y;
                            try {
                                localStorage.setItem(UserService.SETTING_KEY, JSON.stringify(setting));
                            } catch (e) {
                                console.log("Session Error: " + e);
                                //localStorage.removeItem(UserService.USER_KEY);
                            }
                            // You can process user settings here if needed
                        } catch (error) {
                            // No settings found, proceed without them
                        }
                    });
                        
                    try {
                        localStorage.setItem(UserService.USER_KEY, JSON.stringify(this.user));
                        //localStorage.setItem(UserService.SETTING_KEY, JSON.stringify(setting));
                    } catch (e) {
                        console.log("Session Error: " + e);
                        localStorage.removeItem(UserService.USER_KEY);
                    }
                });
            },
            error: (err) => {
                console.error("Observable emitted an error: " + err);
                window.location.href = this.LOG_URL;
                localStorage.removeItem(UserService.USER_KEY);
            }
        });
        return Promise.resolve();
    }
    
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
    readonly CONFIG_SERVICE = environment.CONFIG_SERVICE;
    static readonly USE_KEY = "CONFIG";
    private config: any;

    constructor(private http: HttpClient) {}

    loadConfig() : Promise<void>{
        this.http.get(this.CONFIG_SERVICE).subscribe({
            next: (value) => {
                this.config = value;
                try {
                    localStorage.setItem(ConfigService.USE_KEY, JSON.stringify(this.config));
                    } catch (e) {
                        console.log("Session Error: " + e);
                        localStorage.removeItem(ConfigService.USE_KEY);
                    }
            }
        });

        return Promise.resolve();
    }

    get(key: string): any {
        let s: string | null = localStorage.getItem(ConfigService.USE_KEY);
        if (s) {
            this.config = JSON.parse(s);
            return this.config[key];
        }

        return null;
        
    }
}


export function initConfig(configService: ConfigService)  : () => Promise<void> {
    return () => configService.loadConfig();
}

export function initUser(userService: UserService)  : () => Promise<void> {
    return () => userService.init();
}
