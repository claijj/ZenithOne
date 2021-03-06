import { Gateway, Wallets } from 'fabric-network';
import * as path from 'path';
import * as fs from 'fs';
import * as readLine from 'readLine';

async function RequestAirTaxi() {
	console.log('RequestAirTaxi');

	try {
		// Create a new file system based wallet for managing identities.
		const walletPath = path.join(process.cwd(), 'Wallet');
		const wallet = await Wallets.newFileSystemWallet(walletPath);
		// console.log(`Wallet path: ${walletPath}`);
		
		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		const connectionProfilePath = path.resolve(__dirname, '..',	'connection.json');
		const connectionProfile =  JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8')); // eslintdisable-line @typescript-eslint/no-unsafe-assignment
		const connectionOptions = { wallet, identity: 'Org1 Admin', discovery:{ enabled: true, asLocalhost: true } };
		await gateway.connect(connectionProfile, connectionOptions);
		
		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork('mychannel');

		// Get the contract from the network.
		const contract = network.getContract('airtaxiservice-contract');
		
		// Submit the specified transaction.
		let allocatedAirTaxi: Buffer = await contract.submitTransaction('requestAirTaxi');
		const AirTaxi = (JSON.parse(allocatedAirTaxi.toString()));
		console.log ('Air Taxi Allocated: ', AirTaxi.TailNumber);
				
		// Disconnect from the gateway.
		gateway.disconnect();
		
	} catch (error) {
		console.error('Failed to submit transaction:',error);
		process.exit(1);
	}
}

async function ReadAirTaxi(airTaxiID: string) {
	console.log ('ReadAirTaxi');

	try {
		// Create a new file system based wallet for managing identities.
		const walletPath = path.join(process.cwd(), 'Wallet');
		const wallet = await Wallets.newFileSystemWallet(walletPath);
		// console.log(`Wallet path: ${walletPath}`);
		
		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		const connectionProfilePath = path.resolve(__dirname, '..',	'connection.json');
		const connectionProfile =  JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8')); // eslintdisable-line @typescript-eslint/no-unsafe-assignment
		const connectionOptions = { wallet, identity: 'Org1 Admin', discovery:{ enabled: true, asLocalhost: true } };
		await gateway.connect(connectionProfile, connectionOptions);
		
		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork('mychannel');

		// Get the contract from the network.
		const contract = network.getContract('airtaxiservice-contract');
		
		// Submit the specified transaction.
		let AirTaxi: Buffer = await contract.submitTransaction('readAirTaxi', airTaxiID);
		console.log (JSON.parse(AirTaxi.toString()));
		
		// Disconnect from the gateway.
		gateway.disconnect();
		
	} catch (error) {
		console.error('Failed to submit transaction:',error);
		process.exit(1);
	}
}

async function main() {
    const readLine = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let answer = ""
    readLine.question("1. Read Air Taxi\n2. Request Air Taxi\n: ", (it: string) => { 
         answer = it
		 switch (answer) {
			 case '1':
				void ReadAirTaxi('AT0001');	 
				break;

			case '2':
				void RequestAirTaxi();
				break;
		 
			 default:
				 break;
		 } 
         readLine.close();
    })
}

void main();