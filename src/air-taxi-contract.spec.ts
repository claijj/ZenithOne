/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { AirTaxi } from './air-taxi';

@Info({title: 'AirTaxiContract', description: 'My Smart Contract' })
export class AirTaxiContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async airTaxiExists(ctx: Context, airTaxiId: string): Promise<boolean> {
        const data: Uint8Array = await ctx.stub.getState(airTaxiId);
        return (!!data && data.length > 0);
    }

    @Transaction()
    public async createAirTaxi(ctx: Context, airTaxiId: string, manufacturer: string, 
        model: string, serialNumber: string, dateManufactured: string
        ): Promise<void> {
        
        const exists: boolean = await this.airTaxiExists(ctx, airTaxiId);
        if (exists) {
            throw new Error(`The air taxi ${airTaxiId} already exists`);
        }
        const airTaxi: AirTaxi = new AirTaxi();
        airTaxi.Manufacturer = manufacturer;
        airTaxi.Model = model;
        airTaxi.SerialNumber = serialNumber;
        airTaxi.DateManufactured = dateManufactured;
        
        const buffer: Buffer = Buffer.from(JSON.stringify(airTaxi));
        await ctx.stub.putState(airTaxiId, buffer);
    }

    @Transaction(false)
    @Returns('AirTaxi')
    public async readAirTaxi(ctx: Context, airTaxiId: string): Promise<AirTaxi> {
        const exists: boolean = await this.airTaxiExists(ctx, airTaxiId);
        if (!exists) {
            throw new Error(`The air taxi ${airTaxiId} does not exist`);
        }
        const data: Uint8Array = await ctx.stub.getState(airTaxiId);
        const airTaxi: AirTaxi = JSON.parse(data.toString()) as AirTaxi;
        return airTaxi;
    }

    @Transaction()
    public async registerAirTaxi(ctx: Context, airTaxiId: string, tailNumber: string, owner: string
        ): Promise<void> {
        
        const exists: boolean = await this.airTaxiExists(ctx, airTaxiId);
        if (!exists) {
            throw new Error(`The air taxi ${airTaxiId} does not exist`);
        }

        const data: Uint8Array = await ctx.stub.getState(airTaxiId);
        const airTaxi: AirTaxi = JSON.parse(data.toString()) as AirTaxi;

        airTaxi.TailNumber = tailNumber;
        airTaxi.Owner = owner;
        
        // Auto-populated data fields
        let today = new Date().toLocaleDateString()
        airTaxi.DateRegistered = today;
        airTaxi.ApprovalAuthority = 'CAAS';

        const buffer: Buffer = Buffer.from(JSON.stringify(airTaxi));
        await ctx.stub.putState(airTaxiId, buffer);
    }

    @Transaction()
    public async deregisterAirTaxi(ctx: Context, airTaxiId: string): Promise<void> {
        const exists: boolean = await this.airTaxiExists(ctx, airTaxiId);
        if (!exists) {
            throw new Error(`The air taxi ${airTaxiId} does not exist`);
        }

        const data: Uint8Array = await ctx.stub.getState(airTaxiId);
        const airTaxi: AirTaxi = JSON.parse(data.toString()) as AirTaxi;
        const buffer: Buffer = Buffer.from(JSON.stringify(airTaxi));

        airTaxi.Active = false;
        let today = new Date().toLocaleDateString()
        airTaxi.DateDeregistered = today;

        await ctx.stub.putState(airTaxiId, buffer);
    }

    @Transaction(false)
    public async queryAllAirTaxi(ctx: Context): Promise<string> {
        const startKey = 'AT0001';
        const endKey = 'AT9999';
        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString());

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString());
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString();
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }
}
