import axios, { AxiosResponse } from 'axios';

export interface Response {
  error?: Error,
  data: any
}

export interface Error {
  code: number,
  message: string
}

export interface UnspentTransaction {
  txid: string,
  vout: number,
  amount: number
}

export interface UnspentTransactionResponse extends Response {
  data: {
      txs: UnspentTransaction[],
      address: string,
      amount: number,
      sum?: number
  }
}

export interface SendTransactionResponse extends Response {
  data: {
      txid?: string,
      orderId: string
  }
}

export class YentenApiClient {
  appId?:string='guest';
  host:string='api.yenten.cf';
  port:string='21002';
  protocol:string='https';
  axiosClient:any={};

  init(appId?:string){
    if(appId)
      this.appId = appId
  }
  _getURL(operation:string){
    return this.protocol+"://"+this.host+":"+this.port+operation;
  }

  _getConfig(){
    let config = {
      headers: {
        AppId: this.appId,
      }
    }
    return config;
  }

  _callGet(url:string):Promise<Response>{
    let that = this;
    console.log('Requesting',url,that._getConfig());
    return axios.get(url,that._getConfig())
    .then((value:AxiosResponse)=>{
      if(value.status == 200){
        let serverApiResponse:Response = value.data;         
        return serverApiResponse;
      }else{
        let response:Response = {
          error: {
            code: 1,
            message: 'Error requesting url: '+value.status+" "+value.statusText
          },
          data: {}
        }
        return response;
      }
    })
  }
  /**
   * Returns list of txid and vouts that can be spent for given address provided that the address has enough balance
   * to pay full amount. If there is to little coins then error is returned.
   * @param address Target which will be used for payment (coins from this address will be used)
   * @param amount Payment amount, when not met then error is returned
   * @returns {UnspentTransactionResponse} Returns list of txids and vouts (in data field) which sum is *greater* than the amount. The sum of txids is in the sum field - NOTICE make sure that you calculate transaction fee correctly, using the sum not the amount. When there are insufficient funds then error is returned.
   */
  getUnspent(address:string, amount:number):Promise<UnspentTransactionResponse>{
    let that = this;
    let url = that._getURL(`/getunspent/${address}/${amount}`);
    return that._callGet(url);
  }
  /**
   * Returns address balance (available coins).
   * @param address Target address which balance will be returned
   * @returns {UnspentTransactionResponse} The address balance is in the data.sum field.
   */
  getBalance(address:string):Promise<UnspentTransactionResponse>{
    let that = this;
    let url = that._getURL(`/getbalance/${address}`);
    return that._callGet(url);
  }

  /**
   * Sends transaction to the Yenten network. NOTICE - make sure transaction hex data contains what you wanted to contain as once sent to the network this operation is 
   * irreversible.
   * @param orderId External order id
   * @param transactionHex Raw transaction hex data. The transaction must be properly constructed (createrawtransaction), encoded and signed (signrawtransaction) before calling sendTransaction.
   * @returns {SendTransactionResponse} Response with data.txid containing transaction id of the newly broadcasted transaction (may be used in block explorers or clients for transaction chech) or error when anything went wrong.
   */
  sendTransaction(orderId:string, transactionHex:string):Promise<SendTransactionResponse>{
    let that = this;
    let url = that._getURL(`/sendrawtransaction/${orderId}/${transactionHex}`);
    return that._callGet(url);    
  }
}
export const apiClient = new YentenApiClient();
