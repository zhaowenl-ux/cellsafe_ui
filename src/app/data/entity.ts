export interface Batch_List {
    batch_id:number;
    vial_count :number;
    batch_name:string;
    batch_alt_name:string;
    batch_parent_batch:number;
    batch_material_state:string;
    batch_cells_per_vial:number;
    batch_cells_per_ml:number;
    batch_passage:number;
    batch_eln:string;
    batch_contact_person:number;
    batch_contact_person_name:string;
    batch_culture_type:string;
    batch_culture_protocol:string;
    batch_dissociation_solution:string;
    batch_medium_growth:string;
    batch_medium_growth_suppl:string;
    batch_medium_freezing:string;
    batch_comments:string;
    batch_t1:string;
    batch_t2:string;
    batch_t3:string;
    batch_t4:string;
    batch_created_at:string;
    accession_id:number;
    accession_cell_id:number;
    accession_name:string;
    accession_eln:string;
    accession_date_received:string;
    accession_date_discarded:string;
    accession_cell_source:number;
    accession_catalog_num:string;
    accession_engineering_source:number;
    accession_reporter:number;
    accession_tag:number;
    accession_engineering_method:number;
    accession_pool_name:string;
    accession_clone_name:string;
    accession_passage_num:number;
    accession_status:string;
    accession_contact_person:number;
    accession_comments:string;
    accession_t1:string;
    accession_t2:string;
    accession_t3:string;
    accession_tag_name:string;
    accession_reporter_name:string;
    accession_cell_source_name:string;
    accession_engineering_source_name:string;
    accession_contact_person_name:string;
    accession_engineering_method_name:string;
    cell_name:string;
    cell_disease:string;
    cell_source_tissue:string;
    cell_source_type:string;
    cell_species:number;
    cell_species_name:string;
    cell_cellosaurus_id:string;
    cell_reference:string;
    cell_comments:string;
    cell_t1:string;
    cell_t2:string;
    cell_t3:string;
    cell_synonyms:string;
    ncbi_gene_id:string;
    gene_symbol:string;
    search_string:string;
    batch_count:number;
    provenance_count:number;
    biosafety_id:number;
    biosafety_level:number;
    biosafety_gmo:boolean;
    biosafety_expiration_date:string;
}

export class Batch {
    id = -1;                    
    accession_id : number|null = null;          
    name = "";                  
    alt_name = "";              
    parent_batch : number|null = null;          
    material_state = "";        
    cells_per_vial : number|null = null;        
    cells_per_ml : number|null = null;          
    passage : number|null = null;               
    eln = "";                   
    contact_person : number|null = null;
    contact_person_name = "";        
    culture_type = "";          
    culture_protocol = "";
    dissociation_solution = "";
    medium_growth = "";
    medium_growth_suppl = "";
    medium_freezing = "";
    comments = "";
    t1 = "";
    t2 = "";
    t3 = "";
    t4 = "";   
    created_at: string | null = "";

    public static to_json(batch: Batch): Object {
        let data: Object = {
            id : batch.id,                    
            accession_id : batch.accession_id,          
            name : batch.name,                  
            alt_name : batch.alt_name,              
            parent_batch : batch.parent_batch,          
            material_state : batch.material_state,        
            cells_per_vial : batch.cells_per_vial,        
            cells_per_ml : batch.cells_per_ml,          
            passage : batch.passage,               
            eln : batch.eln,                   
            contact_person : batch.contact_person,      
            culture_type : batch.culture_type,          
            culture_protocol : batch.culture_protocol,
            dissociation_solution : batch.dissociation_solution,
            medium_growth : batch.medium_growth,
            medium_growth_suppl : batch.medium_growth_suppl,
            medium_freezing : batch.medium_freezing,
            comments : batch.comments,
            t1 : batch.t1,
            t2 : batch.t2,
            t3 : batch.t3,
            t4 : batch.t4,
            created_at : batch.created_at
        };

        return data;
    }

    public static to_aoa(data: Batch_List[]): string[][] {
        let out: string[][] = new Array();
        let header = [
            "Batch Name",
            "# vials",
            "Cell Name",
            "Genetically Modified",
            "Accession Name",
            "Cell Comment",
            "Accession Comment",
            "Accession Status",
            "Batch Comment",
            "Dissociation Solution",
            "Accession Source",
            "Species",
            "Tag",
            "Gene",
            "Reporter",
            "Disease",
            "Passage"
        ];
        out.push(header);

        for (let i = 0; i < data.length; i++) {
            
            let row = [
                data[i].batch_name,
                data[i].vial_count + "",
                data[i].cell_name,
                data[i].biosafety_gmo?"Yes":"No",
                data[i].accession_name,
                data[i].cell_comments,
                data[i].accession_comments,
                data[i].accession_status,
                data[i].batch_comments,
                data[i].batch_dissociation_solution,
                data[i].accession_cell_source_name,
                data[i].cell_species_name,
                data[i].accession_tag_name,
                data[i].accession_reporter_name,
                data[i].cell_disease,
                data[i].batch_passage + ""
            ];
            out.push(row);
        }
        return out;
    }
}

export interface Accession_List {
    accession_id:number;
    accession_cell_id:number;
    accession_name:string;
    accession_eln:string;
    accession_date_received:string;
    accession_date_discarded:string;
    accession_cell_source:number;
    accession_catalog_num:string;
    accession_engineering_source:number;
    accession_reporter:number;
    accession_tag:number;
    accession_engineering_method:number;
    accession_pool_name:string;
    accession_clone_name:string;
    accession_passage_num:number;
    accession_status:string;
    accession_contact_person:number;
    accession_comments:string;
    accession_t1:string;
    accession_t2:string;
    accession_t3:string;
    accession_tag_name:string;
    accession_reporter_name:string;
    accession_cell_source_name:string;
    accession_engineering_source_name:string;
    accession_contact_person_name:string;
    accession_engineering_method_name:string;
    cell_name:string;
    cell_disease:string;
    cell_source_tissue:string;
    cell_source_type:string;
    cell_species:number;
    cell_species_name:string;
    cell_cellosaurus_id:string;
    cell_reference:string;
    cell_comments:string;
    cell_t1:string;
    cell_t2:string;
    cell_t3:string;
    cell_synonyms:string;
    ncbi_gene_id:string;
    gene_symbol:string;
    search_string:string;
    batch_count:number;
    provenance_count:number;
    biosafety_id:number;
    biosafety_level:number;
    biosafety_gmo:string;
    biosafety_expiration_date:string;

}

export class Accession {
    id = -1;
    cell_id : number|null= null;
    name = '';
    eln = ''
    date_received : string|null = '';
    date_discarded : string | null = '';
    cell_source : number|null = null;
    cell_source_name = '';
    catalog_num = '';
    engineering_source : number |null = null;
    engineering_source_name = '';
    reporter : number|null = null;
    reporter_name = '';
    tag :number|null = null;
    tag_name = '';
    engineering_method : number|null = null;
    engineering_method_name = '';
    pool_name = '';
    clone_name = ''
    passage : number|null = null;
    status = ''
    contact_person : number|null = null;
    contact_person_name = '';
    comments = '';
    t1 = '';
    t2 = '';
    t3 = '';


    public static to_json(a: Accession): Object {
        let data: Object = {
            id : a.id,
            cell_id : a.cell_id,
            name : a.name,
            eln : a.eln,
            date_received : a.date_received,
            date_discarded : a.date_discarded,
            cell_source : a.cell_source,
            catalog_num : a.catalog_num,
            engineering_source : a.engineering_source,
            reporter : a.reporter,
            tag : a.tag,
            engineering_method : a.engineering_method,
            pool_name : a.pool_name,
            clone_name : a.clone_name,
            passage : a.passage,
            status : a.status,
            contact_person: a.contact_person,
            comments : a.comments,
            t1 : a.t1,
            t2 : a.t2,
            t3 : a.t3
        };

        return data;
    }
}

export class Provenance {
    id	= -1;
    seq = 1;
    relevent = false;
    accession_id	= -1;
    source	: number| null = null;
    source_name = "";
    source_role = "";
    contract_name = "";
    contract_link = ""
    contract_expiration	= "";
    contract_desc = "";
    comment	= "";
    restriction	= "";
    rule1 = false;
    rule2 = false;
    rule3 = false;
    rule4 = false;
    rule5 = false;
    t1 = "";
    t2 = "";
    t3 = "";
    expired = false

    public static to_json(s: Provenance): Object {
        let data: Object = {
            id : s.id,
            source : s.source,
            source_role : s.source_role,
            contract_name : s.contract_name,
            contract_expiration : s.contract_expiration,
            contract_desc : s.contract_desc,
            comment : s.comment,
            restriction : s.restriction,
            rule1 : s.rule1,
            rule2 : s.rule2,
            rule3: s.rule3,
            rule4: s.rule4,
            rule5: s.rule5,
            t1 :    s.t1,
            t2:   s.t2,
            t3:   s.t3
        };

        return data;
    }

    public static warning(p: Provenance, config: any): string {
        let msg = "";
        if (p.expired) {
            msg += "Contract expired. ";
        }

        if (p.restriction) {
            msg += p.restriction + ". ";
        }

        if (! p.rule1 && config['rule1'].visible) {
            msg += config['rule1'].name + " is not allowed. ";
        }

        if (! p.rule2 && config['rule2'].visible) {
            msg += config['rule2'].name + " is not allowed. ";
        }

        if (! p.rule3 && config['rule3'].visible) {
            msg += config['rule3'].name + " is not allowed. ";
        }

        if (! p.rule4 && config['rule4'].visible) {
            msg += config['rule4'].name + " is not allowed. ";
        }
        if (! p.rule5 && config['rule5'].visible) {
            msg += config['rule5'].name + " is not allowed. ";
        }

        return msg;
    }
}

export interface Cell_List {
    id	: number;
    name :	string;
    disease	: string;
    source_tissue	:string;
    source_type	:string;
    species	:number;
    species_name:	string;
    cellosaurus_id:	string;
    reference:	string;
    comments:	string;
    synonyms:	string;
    t1:	string;
    t2:	string;
    t3:	string;
    keyword	:string;
    accession_count:	number;
    batch_count	: number;

}

export class Cell {
    id  = -1;             
    name = "";           
    disease = "";
    source_tissue = "";
    source_type = "";
    species = 1;  // default human
    species_name = "";
    cellosaurus_id = "";
    reference = "";
    comments = "";
    t1 = "";
    t2 = "";
    t3 = "";
 
    public static to_json(cell: Cell): Object {
        let data: Object = {
            id: cell.id,
            name: cell.name,
            disease: cell.disease,
            source_tissue: cell.source_tissue,
            source_type: cell.source_type,
            species: cell.species,
            cellosaurus_id: cell.cellosaurus_id,
            reference: cell.reference,
            comments: cell.comments,
            t1: cell.t1,
            t2: cell.t2,
            t3: cell.t3
        };

        return data;
    }
}

export class Access_Group {
    group_id = -1;
    group_name = "";
    group_desc = "";
    member = "";
    group_member!: string[];

    constructor(){

    }
    
    from_json(x: any) {
        this.group_id = x.group_id;
        this.group_name = x.group_name;
        this.group_desc = x.group_desc;
        this.member = x.member;
        this.to_member();
    }

    to_member() {
        if (this.member && this.member.includes(",")) {
            this.group_member = this.member.split(",");
        } else if (this.member){
            this.group_member = [this.member];
        } else 
        {
            this.group_member = [];
        }
    }
}

/*
 * Modified on July 24th
 * remove all assay columns
 */
export class Biosafety {
    id = -1;
    accession_id = -1;
    accession_name = '';
    biosafety_level = 0;
    gmo = false;
    gentg_level = '';
    expiration_date : string | null= '';
    risk_group = '';
    risk_accessment = '';
    contact_person : number|null = null;
    contact_person_name = '';
    comment = '';
    t1 = '';
    t2 = '';
    t3 = '';


    public static to_json(s: Biosafety): Object {
        let data: Object = {
            id :  s.id,
            accession_id: s.accession_id,
            biosafety_level : s.biosafety_level,
            gmo : s.gmo,
            gentg_level : s.gentg_level,
            expiration_date : s.expiration_date,
            risk_group : s.risk_group,
            risk_accessment : s.risk_accessment,
            contact_person : s.contact_person,
            comment : s.comment,
            t1 : s.t1,
            t2 : s.t2,
            t3 : s.t3
        };

        return data;
    }
}

export interface List {
    list_id: number;
    list_name: number;
    list_size: number;
    list_source: number;
}

export class Cell_Assay {
    id	: number = -1;
    assay 	: string = "";
    pass	: string = "";
    eln	: string = "";
    exp_date	: string = "";
    control	: string = "";
    op	: string = "";
    result	: number| null = null;
    comment	: string = "";
    batch_id	: number = -1;
    result_unit	: string = "";
    isEdit = false;

    constructor(batch_id: number) {
        this.batch_id = batch_id;

        this.isEdit = true;
    }

    public static to_json(s: Cell_Assay): Object {
        let data: Object = {
            id	: s.id,
            assay 	: s.assay,
            pass	: s.pass,
            eln	: s.eln,
            exp_date	: s.exp_date,
            control	: s.control,
            op	: s.op,
            result	: s.result,
            comment	: s.comment,
            batch_id	: s.batch_id,
            result_unit	: s.result_unit,
                };

        return data;
    }
}


export interface Attach_File
{
    id : number;
    entity_type : string;
    entity_id : number;
    file_name : string;
    file_mime : string;
    file_path : string;

}