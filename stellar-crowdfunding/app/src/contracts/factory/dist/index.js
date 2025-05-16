import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CDUMNH5543YMWUFSHRPNRWYTPOLTHLPHSM26ISWPRG3EH6P4MQLJUOX3",
    }
};
export const Errors = {
    1: { message: "NotAuthorized" },
    2: { message: "ProjectWasmHashNotSet" }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initalizing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAQAAAAAAAAAAAAAAC1Byb2plY3REYXRhAAAAAAUAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAAIZGVhZGxpbmUAAAAGAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAAAAAAlpbWFnZV91cmwAAAAAAAAQAAAAAAAAAAV0aXRsZQAAAAAAABA=",
            "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAAAgAAAAAAAAANTm90QXV0aG9yaXplZAAAAAAAAAEAAAAAAAAAFVByb2plY3RXYXNtSGFzaE5vdFNldAAAAAAAAAI=",
            "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAA==",
            "AAAAAAAAAAAAAAAVc2V0X3Byb2plY3Rfd2FzbV9oYXNoAAAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAl3YXNtX2hhc2gAAAAAAAPuAAAAIAAAAAA=",
            "AAAAAAAAAAAAAAAOY3JlYXRlX3Byb2plY3QAAAAAAAUAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAAFdGl0bGUAAAAAAAAQAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAAAAAAlpbWFnZV91cmwAAAAAAAAQAAAAAAAAAAhkZWFkbGluZQAAAAYAAAABAAAAEw==",
            "AAAAAAAAAAAAAAAMZ2V0X3Byb2plY3RzAAAAAAAAAAEAAAPqAAAAEw=="]), options);
        this.options = options;
    }
    fromJSON = {
        initialize: (this.txFromJSON),
        set_project_wasm_hash: (this.txFromJSON),
        create_project: (this.txFromJSON),
        get_projects: (this.txFromJSON)
    };
}
