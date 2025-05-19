import {
  AnchorProvider,
  Program,
  Wallet,
  Idl,
  BN
} from '@coral-xyz/anchor';
import {
  PublicKey,
  Keypair,
  Connection,
  SystemProgram,
} from '@solana/web3.js';
import idl from './collection_prices.json'; // Your IDL JSON
import { Buffer } from 'buffer';
import { getMint, TOKEN_PROGRAM_ID } from "@solana/spl-token";
//import { IDL } from './idl-types'; // Optional: better typing

const PROGRAM_ID = new PublicKey('2pSMcVgAmeidrymy7XbqLfi4GLuCtmDATHXEHPXQYjw3');
const rpcUrl = import.meta.env.VITE_RPC_URL;

declare global {
  interface Window {
    solana?: any;
  }
}

export class CollectionClient {
  connection: Connection;
  provider: AnchorProvider;
  program: Program;

  constructor() {
    this.connection = new Connection(rpcUrl, 'confirmed');
    
    const wallet = this.getWallet();
    if (!wallet) {
      throw new Error('Phantom wallet not found');
    }

    this.provider = new AnchorProvider(this.connection, wallet, {
      commitment: 'confirmed',
    });
    this.program = new Program(idl as Idl, this.provider);
  }

  getWallet(): Wallet | null {
    const provider = window.solana;
    if (provider?.isPhantom) {
      return {
        publicKey: provider.publicKey,
        signTransaction: provider.signTransaction.bind(provider),
        signAllTransactions: provider.signAllTransactions.bind(provider),
        payer: provider.signMessage?.bind(provider),
      };
    }
    return null;
  }

  async connectWallet() {
    const provider = window.solana;
    if (!provider) throw new Error('Phantom not installed');
    await provider.connect();
  }

  async floatToIntTokenArray(prices: number[], paymentKey: PublicKey):Promise<number[]>{
    const finalPrices:number[] = []
    let decimals = 9; // lamport solana decimals
    if (paymentKey != PublicKey.default &&  paymentKey.toBase58() != "11111111111111111111111111111111"){
      console.log("not defailt")
      const mintInfo = await getMint(this.connection, paymentKey, undefined, TOKEN_PROGRAM_ID);
      decimals = mintInfo.decimals;
    }
    const mult = Math.pow(10, decimals);
    for (let i =0; i < prices.length;i++){
      finalPrices[i] = prices[i] * mult;
    }

    console.log(finalPrices);
    return finalPrices;
  }

  async initializeCollection(prices: number[], paymentMint: string | null): Promise<string> {

    const collectionAddress = Keypair.generate().publicKey;

    const [collectionPricesData] = PublicKey.findProgramAddressSync(
      [Buffer.from('prices'), collectionAddress.toBuffer()],
      PROGRAM_ID
    );
    
    let paymentKey = PublicKey.default;
    if (paymentMint != null){
      paymentKey = new PublicKey(paymentMint);
    }
    
    const finalPrices = await this.floatToIntTokenArray(prices,paymentKey);
    
    try{
      const txid = await this.program.methods
      .initializeCollection(finalPrices.map((p) => new BN(p)), paymentKey)
      .accounts({
          owner: this.provider.wallet.publicKey,
          collectionAddress,
          collectionPricesData,
          systemProgram: SystemProgram.programId,
      })
      .rpc(); 
      console.log('✅ TX Signature:', txid);
      return collectionAddress.toBase58();
    }
    catch(e){
      console.error('❌ Error:', e);
      return "";
    }
  }

  async modifyCollectionPrices(collectionAddress:string, prices: number[]): Promise<string> {
    // const user = window.solana;
    // if (!user?.publicKey) throw new Error('Wallet not connected');

    const collectionAddressKey = new PublicKey(collectionAddress);

    const [collectionPricesData] = await PublicKey.findProgramAddressSync(
      [Buffer.from("prices"), collectionAddressKey.toBuffer()],
      PROGRAM_ID
    );

    const collectionData = await this.program.account.collectionPricesData.fetch(collectionPricesData);
    console.log(collectionData.paymentMint.toBase58())
    const finalPrices = await this.floatToIntTokenArray(prices, collectionData.paymentMint);

    try{
    const tx = await this.program.methods
      .updatePrices(finalPrices.map((p) => new BN(p)))
      .accounts({
        owner: this.provider.wallet.publicKey,
        collectionAddress,
        collectionPricesData,
      })
      .rpc();
      return tx;
    }
    catch(e){
      console.error('❌ Error:', e);
      return "";
    }
  }

  async modifyPaymentToken(collectionAddress:string, paymentMint: string | null): Promise<string> {
    const collectionAddressKey = new PublicKey(collectionAddress);
    const [collectionPricesData] = await PublicKey.findProgramAddressSync(
      [Buffer.from("prices"), collectionAddressKey.toBuffer()],
      PROGRAM_ID
    );
    const collectionData = await this.program.account.collectionPricesData.fetch(collectionPricesData);

    let paymentKey = PublicKey.default;
    if (paymentMint != null){
      paymentKey = new PublicKey(paymentMint);
    }

    if (paymentKey.toBase58()  == "11111111111111111111111111111111" && collectionData.paymentMint.toBase58() == "11111111111111111111111111111111"){
      console.error('❌ Token already saved in Solana Lamports');
      return "";
    }

    if (paymentKey.toBase58() == collectionData.paymentMint.toBase58()){
      console.error('❌ Token already saved as requested save Token', paymentKey.toBase58(), collectionData.paymentMint.toBase58());
      return "";
    }

    try{
      const tx = await this.program.methods
        .updatePaymentMint(paymentKey)
        .accounts({
          owner: this.provider.wallet.publicKey,
          collectionAddress,
          collectionPricesData
        })
        .rpc();
      return tx;
    }
    catch(e){
      console.error('❌ Error:', e);
      return "";
    }
  }
  async getPurchases(collectionAddress:string): Promise<boolean[]>{
    const collectionKey = new PublicKey(collectionAddress);

    const collectionPricesData = await this._getCollectionPricesData(collectionKey);
    const collectionData = await this.program.account.collectionPricesData.fetch(collectionPricesData);
    const size = collectionData.size;

    const result:boolean[] = [];

    const purchasesData = await this._getUserPurchasedData(collectionKey,this.provider.wallet.publicKey);
    try{
      const purchases = await this.program.account.userPurchases.fetch(purchasesData);
      const values = this._unpackBitmaskToBooleans(purchases.data)

      for (let i =0; i < size;i++){
        result[i] = values[i];
      }
      console.log("purchases made:", result);
      return result;
    }
    catch{
      // retyurn all to false, no purchases has been made yet
      for (let i =0; i < size;i++){
        result[i] = false;
      }
      console.log("no purchases made:", result);
      return result;
    }
  }

  async purchaseItems(collectionAddress:string, itemIndices:number[], comissionWallet:string | null, comissionPercentage:number | null): Promise<string>{
    const collectionAddressKey = new PublicKey(collectionAddress);
    const collectionPricesData = await this._getCollectionPricesData(collectionAddressKey);
   

    let comissionKey = PublicKey.default;
    if (comissionWallet != null){
      comissionKey = new PublicKey(comissionWallet);
    }
    comissionPercentage = comissionPercentage == null ? 0 : comissionPercentage;

    const collectionData = await this.program.account.collectionPricesData.fetch(collectionPricesData);
    if (collectionData.paymentMint.toBase58() == "11111111111111111111111111111111"){
      return this._purchaseWithLamports(collectionAddressKey,itemIndices, comissionKey, comissionPercentage, collectionPricesData, collectionData);
    }
    else{
      return this._purchaseWithTokens(collectionAddressKey, itemIndices, comissionKey, comissionPercentage, collectionPricesData, collectionData);
    }

  }
  _unpackBitmaskToBooleans(data: number[]): boolean[] {
    const result: boolean[] = [];

    for (const byte of data) {
      for (let bit = 0; bit < 8; bit++) {
        // Extract each bit (from least-significant to most-significant)
        result.push((byte & (1 << bit)) !== 0);
      }
    }

    return result;
  }

  async _purchaseWithLamports(collectionKey:PublicKey, itemIndices:number[], comissionWallet:PublicKey, comissionPercentage:number,collectionPricesData:PublicKey , collectionData:any): Promise<string>{
    console.log("purchase with lamports");
     const royaltyKey = await this._getAppRoyaltyPublicKey();
    const purchasesData = await this._getUserPurchasedData(collectionKey,this.provider.wallet.publicKey);

   
    

    const finalCommisionWallet = comissionWallet == PublicKey.default ? royaltyKey : comissionWallet;

    const tx = await this.program.methods
      .lamportsPurchase(itemIndices, comissionPercentage*100)
      .accounts({
        purchaser: this.provider.wallet.publicKey,
        collectionAddress: collectionKey,
        collectionPricesData:collectionPricesData,
        userPurchases: purchasesData,
        owner:collectionData.owner,
        appRoyalty:royaltyKey,
        commissionWallet:finalCommisionWallet,
        systemProgram:SystemProgram.programId
      })
      .rpc();

      console.log(tx);
    return tx;
  }
  async _purchaseWithTokens(collectionKey:PublicKey, itemIndices:number[], comissionWallet:PublicKey, comissionPercentage:number,collectionPricesData:PublicKey, collectionData:any): Promise<string>{
    console.log("purchase with token");
    return "";
  }
  async _getCollectionPricesData(collectionAddressKey:PublicKey):Promise<PublicKey>{
    const [collectionPricesData] = await PublicKey.findProgramAddressSync(
      [Buffer.from("prices"), collectionAddressKey.toBuffer()],
      PROGRAM_ID
    );
    return collectionPricesData;
  }

  async _getUserPurchasedData(collectionAddressKey:PublicKey, purchaserAddressKey:PublicKey):Promise<PublicKey>{
    const [purchasesData] = await PublicKey.findProgramAddressSync(
      [Buffer.from("purchases"), collectionAddressKey.toBuffer(), purchaserAddressKey.toBuffer()],
      PROGRAM_ID
    );
    return purchasesData;
  }

  async _getAppRoyaltyPublicKey():Promise<PublicKey>{
    //const collectionPricesData = await this._getCollectionPricesData(collectionAddressKey);
    //const collectionData = await this.program.account.collectionPricesData.fetch(collectionPricesData);
    let royaltyPubkey = PublicKey.default;

    console.log(this.program);
    console.log(this.program.methods);
    // try{
      const txSim = await this.program.methods
          .getRoyaltyPubkey()
          .simulate()

        
        const logs = txSim.raw.slice(-10); // recent logs
        for (const log of logs) {
          const match = log.match(/ROYALTY_PUBKEY: ([A-Za-z0-9]+)/);
          if (match) {
            royaltyPubkey = new PublicKey(match[1]);
            console.log("Fetched Royalty Pubkey:", royaltyPubkey.toBase58());
          }
      }
    // }
    // catch(e){
    //   console.error(e);
    // }
    return royaltyPubkey;
  }
}
