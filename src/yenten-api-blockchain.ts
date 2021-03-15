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
  value: number
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
  prefix:string = '/blockchain';
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
    return this.protocol+"://"+this.host+":"+this.port+this.prefix+operation;
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
      console.log('Axios response', value);
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
    .catch((error:any)=>{
      let response:Response = {
        error: {
          code: 0,
          message: ''
        },
        data: {}
      }
      if (error.response) { 
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx              
        response.error!.code = 1;
        response.error!.message = error.response.data.error || 'Error requesting - '+error.response.status;
      }else if(error.request){
        // The request was made but no response was received
        response.error!.code = 2;
        response.error!.message = 'Error requesting - no response';
      }else{
        response.error!.code = 3;
        response.error!.message = 'Error requesting - '+error.message;
      }

      return response;

    })
  }

  _callPost(url:string, data:any):Promise<Response>{
    let that = this;
    console.log('Requesting',url,that._getConfig());
    return axios.post(url, data, that._getConfig())    
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
    let url = that._getURL(`/address/unspent/${address}/${amount}`);
    return that._callGet(url).then((response:Response)=>{
      if(response.error)
        return Promise.reject(response.error.message);
      let unspentTransactionResponse:UnspentTransactionResponse = {
        data:{
          address: address,
          amount: amount,
          sum: 0,
          txs: response.data
        }
      }
      let sum:number = 0;
      // calculate sum
      for(const unspent of unspentTransactionResponse.data.txs){
        sum+=unspent.value
      }
      unspentTransactionResponse.data.sum = sum;
      return unspentTransactionResponse;
    });;
  }

  /**
   * Returns address balance (available coins).
   * @param address Target address which balance will be returned
   * @returns {Response} The address balance is in the data.balance field.
   */
  getBalance(address:string):Promise<Response>{
    let that = this;
    let url = that._getURL(`/address/balance/${address}`);
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
    // let url = that._getURL(`/sendrawtransaction/${orderId}/${transactionHex}`);
    let url = that._getURL(`/transaction/${orderId}/${transactionHex}`);
    return that._callPost(url, {transactionHex: transactionHex});    
  }
}
export const apiClient = new YentenApiClient();
