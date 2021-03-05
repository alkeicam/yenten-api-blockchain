import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'


chai.should();
chai.use(chaiAsPromised);

// const assert = chai.assert;
const expect = chai.expect;

// Sinon is a library used for mocking or verifying function calls in JavaScript.
// import sinon, { SinonStub } from 'sinon';

import {apiClient} from '../src/yenten-api-blockchain'

describe('Yenten Client lib', () => {
    describe('anonymise()', () => {   
        let INPUT = 'hello world';
        let INPUT_MULTI = `
        
        some crazy

        multiline imput
        
        `
        let INPUT_SPECIAL = '\n\n\n\n\n\n\n\t\t\t';
        let SYMBOL = '*';
        let HOW_MANY = 7;
        let EXTERNAL_KEY = 'x909as9ds';         
        beforeEach(() => {             
        });
        afterEach(() => {                  
        });

        it('invalid input and symbol', () => {  
            yenten.doSth();               
            return true;
        })        
        
    })
  
})