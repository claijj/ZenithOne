/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { promises } from 'dns';
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

    @Transaction()
    public async initLedger(ctx: Context): Promise<void> {
        await this.createAirTaxi(ctx,'AT0001','IJD','Mavic Air 2S','1K9PDC09182','01/04/2021');
        await this.createAirTaxi(ctx,'AT0002','FomoCopter','X2-100','2FM20998PE4RU8I','01/04/2021');
        await this.createAirTaxi(ctx,'AT0003','AirArk','Ark X100','3X2P9I76YXCV','01/04/2021');
        await this.createAirTaxi(ctx,'AT0004','BusAir','CityAirBus X8','4CABX8I09787','01/04/2021');
        await this.createAirTaxi(ctx,'AT0005','Beauing','B780-100','5B800FGTUHX95','01/04/2021');
        await this.createAirTaxi(ctx,'AT0006','StarFleet','SF600','6PO8K90XCT68','01/04/2021');
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
    
        airTaxi.Active = false;
        let today = new Date().toLocaleDateString()
        airTaxi.DateDeregistered = today;

        const buffer: Buffer = Buffer.from(JSON.stringify(airTaxi));
        await ctx.stub.putState(airTaxiId, buffer);
    }

/**
    // GetQueryResultForQueryString executes the passed in query string.
	// Result set is built and returned as a byte array containing the JSON results.
	async GetQueryResultForQueryString (ctx, queryString) {

		let resultsIterator = await ctx.stub.getQueryResult(queryString);
		let results = await this._GetAllResults(resultsIterator, false);

		return JSON.stringify(results);
	}

    // QueryAirTaxiByOwner queries for assets based on a passed in owner.
	// Only available on state databases that support rich query (e.g. CouchDB)
	@Transaction (false)
    public async QueryAirTaxiByOwner(ctx: Context, owner: string): Promise<string> {
		let queryString = {};
		queryString.selector = {};
		queryString.selector.docType = 'asset';
		queryString.selector.owner = owner;

		return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString));
	}

    @Transaction(false)
    public async GetAirTaxiHistory(ctx: Context, airTaxiID: string): Promise<string> {
        let iterator = await ctx.stub.getHistoryForKey(this.airTaxiID);
        let result = [];
        let res = await iterator.next();
        while (!res.done) {
          if (res.value) {
            console.info(`found state update with value: ${res.value.value.toString('utf8')}`);
            const obj = JSON.parse(res.value.value.toString('utf8'));
            result.push(obj);
          }
          res = await iterator.next();
        }
        await iterator.close();
        return result; 
    }
*/

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
