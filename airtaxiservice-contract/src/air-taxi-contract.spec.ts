/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { AirTaxiContract } from '.';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext implements Context {
    public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(ClientIdentity);
    public logger = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
     };
}

describe('AirTaxiContract', () => {

    let contract: AirTaxiContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new AirTaxiContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"air taxi 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"air taxi 1002 value"}'));
    });

    describe('#airTaxiExists', () => {

        it('should return true for a air taxi', async () => {
            await contract.airTaxiExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a air taxi that does not exist', async () => {
            await contract.airTaxiExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createAirTaxi', () => {

        it('should create a air taxi', async () => {
            await contract.createAirTaxi(ctx, '1002', 'Volocopter', 'Volocopter X2', 'VX2-098716', '1 Jun 2021');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"air taxi 1003 value"}'));
        });

        it('should throw an error for a air taxi that already exists', async () => {
            await contract.createAirTaxi(ctx, '1001', 'VeloCity', 'Volocopter X2', 'X2-09198VC2A', '1 Jan 2021').should.be.rejectedWith(/The air taxi 1001 already exists/);
        });

    });

    describe('#readAirTaxi', () => {

        it('should return a air taxi', async () => {
            await contract.readAirTaxi(ctx, '1001').should.eventually.deep.equal({ value: 'air taxi 1001 value' });
        });

        it('should throw an error for a air taxi that does not exist', async () => {
            await contract.readAirTaxi(ctx, '1003').should.be.rejectedWith(/The air taxi 1003 does not exist/);
        });

    });

    describe('#updateAirTaxi', () => {

        it('should update a air taxi', async () => {
            await contract.updateAirTaxi(ctx, '1001', 'air taxi 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"air taxi 1001 new value"}'));
        });

        it('should throw an error for a air taxi that does not exist', async () => {
            await contract.updateAirTaxi(ctx, '1003', 'air taxi 1003 new value').should.be.rejectedWith(/The air taxi 1003 does not exist/);
        });

    });

    describe('#deleteAirTaxi', () => {

        it('should delete a air taxi', async () => {
            await contract.deleteAirTaxi(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a air taxi that does not exist', async () => {
            await contract.deleteAirTaxi(ctx, '1003').should.be.rejectedWith(/The air taxi 1003 does not exist/);
        });

    });

});
