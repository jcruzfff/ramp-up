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
        contractId: "CC2EAXLDNAJHV63F7Z52VQEPEXVEURPYNGYMFTHQ5KFIJP5DLEI26RUK",
    }
};
export const Errors = {
    1: { message: "DeadlineNotReached" },
    2: { message: "NotAuthorized" },
    3: { message: "DeadlineReached" }
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
            "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAAAwAAAAAAAAASRGVhZGxpbmVOb3RSZWFjaGVkAAAAAAABAAAAAAAAAA1Ob3RBdXRob3JpemVkAAAAAAAAAgAAAAAAAAAPRGVhZGxpbmVSZWFjaGVkAAAAAAM=",
            "AAAAAAAAAAAAAAAEaW5pdAAAAAUAAAAAAAAABXRpdGxlAAAAAAAAEAAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAAAAAAJaW1hZ2VfdXJsAAAAAAAAEAAAAAAAAAAHY3JlYXRvcgAAAAATAAAAAAAAAAhkZWFkbGluZQAAAAsAAAAA",
            "AAAAAAAAAAAAAAAJc2V0X3Rva2VuAAAAAAAAAQAAAAAAAAAIdG9rZW5faWQAAAATAAAAAA==",
            "AAAAAAAAAAAAAAAEZnVuZAAAAAIAAAAAAAAABGZyb20AAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAA",
            "AAAAAAAAAAAAAAAId2l0aGRyYXcAAAAAAAAAAA==",
            "AAAAAAAAAAAAAAAQZ2V0X3Byb2plY3RfZGF0YQAAAAAAAAABAAAH0AAAAAtQcm9qZWN0RGF0YQA=",
            "AAAAAAAAAAAAAAAQZ2V0X3RvdGFsX2Z1bmRlZAAAAAAAAAABAAAACw==",
            "AAAAAAAAAAAAAAAQZ2V0X2NvbnRyaWJ1dGlvbgAAAAEAAAAAAAAABmZ1bmRlcgAAAAAAEwAAAAEAAAAL",
            "AAAAAAAAAAAAAAAVZ2V0X2FsbF9jb250cmlidXRpb25zAAAAAAAAAAAAAAEAAAPsAAAAEwAAAAs=",
            "AAAAAAAAAAAAAAAJZ2V0X3Rva2VuAAAAAAAAAAAAAAEAAAPoAAAAEw=="]), options);
        this.options = options;
    }
    fromJSON = {
        init: (this.txFromJSON),
        set_token: (this.txFromJSON),
        fund: (this.txFromJSON),
        withdraw: (this.txFromJSON),
        get_project_data: (this.txFromJSON),
        get_total_funded: (this.txFromJSON),
        get_contribution: (this.txFromJSON),
        get_all_contributions: (this.txFromJSON),
        get_token: (this.txFromJSON)
    };
}
