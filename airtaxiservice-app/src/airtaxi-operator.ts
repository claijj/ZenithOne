import { Gateway, Wallets } from 'fabric-network';
import * as path from 'path';
import * as fs from 'fs';
import * as readLine from 'readLine';

async function RegisterAirTaxi() {
	console.log('RegisterAirTaxi');

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
		await contract.submitTransaction('registerAirTaxi', 'AT0002', '9V2APP', 'Applane Airways');
		console.log ('Air taxi AT0002 registered: 9VAPP');
		// read-back newly registered airtaxi
		ReadAirTaxi('AT0002');
				
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

async function FileFlightPlan() {
	console.log ('FileFlightPlan');

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
		await contract.submitTransaction('fileFlightPlan','AT0002', 'WSSS', '1 Apr 2024 0800', 'WSSL', '1 Apr 2024 0810', 'Rich Dot Com', 'Ali Anchovies');
		// Read-back the filed flight plan
		ReadAirTaxi('AT0002');
		
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

    let answer = "";
    readLine.question("1. Read Air Taxi\n2. Register Air Taxi\n3. File Flight Plan\n: ", (it: string) => { 
         answer = it
		 switch (answer) {
			 case '1':
				void ReadAirTaxi('AT0001');	 
				break;

			case '2':
				void RegisterAirTaxi();
				break;
		 
			case '3':
				void FileFlightPlan();
				break;

			default:
				break;
		 } 
         readLine.close();
    })
}

void main();