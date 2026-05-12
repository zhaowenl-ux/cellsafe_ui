/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/TypeScriptDataObjectTemplate.ts to edit this template
 */
export class HashTable<K, V> {
    private table: Map<K, V>[]; // Array of Maps

    constructor(size: number) {
        this.table = new Array(size).fill(null).map(() => new Map());
    }
    private hash(key: K): number {
        return String(key).length % this.table.length;
    }

    insert(key: K, value: V): void {
        const index = this.hash(key);
        this.table[index].set(key, value);
    }

    get(key: K): V | undefined {
        const index = this.hash(key);
        return this.table[index].get(key);
    }

    remove(key: K): void {
        const index = this.hash(key);
        this.table[index].delete(key);
    }
}
