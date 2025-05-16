import { StellarWallet } from '@/app/lib/stellar-wallet';
import { 
  getFactoryClient, 
  getProjectClient, 
  FACTORY_CONTRACT_ID, 
  PROJECT_CONTRACT_ID 
} from '@/src/contracts/contracts';
import { EventEmitter } from 'events';

// Transaction status
export enum TransactionStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  CONFIRMED = 'confirmed',
  FAILED = 'failed'
}

// Transaction info
export interface TransactionInfo {
  id: string;
  status: TransactionStatus;
  hash?: string;
  error?: Error;
  confirmations?: number;
  blockNumber?: number;
  data?: any;
}

// Client class to manage wallet connection and transactions
export class StellarClient extends EventEmitter {
  private static instance: StellarClient;
  private wallet: StellarWallet | null = null;
  private transactions: Map<string, TransactionInfo> = new Map();
  private isConnecting: boolean = false;
  private networkPassphrase: string = 'Test SDF Network ; September 2015'; // Testnet
  private rpcUrl: string = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';

  private constructor() {
    super();
  }

  public static getInstance(): StellarClient {
    if (!StellarClient.instance) {
      StellarClient.instance = new StellarClient();
    }
    return StellarClient.instance;
  }

  // Connect to wallet
  public async connect(): Promise<StellarWallet> {
    if (this.wallet) {
      return this.wallet;
    }

    if (this.isConnecting) {
      throw new Error('Connection already in progress');
    }

    try {
      this.isConnecting = true;
      
      // Get wallet from PasskeyKit integration
      const wallet = await StellarWallet.connect();
      
      if (!wallet || !wallet.address) {
        throw new Error('Failed to connect to wallet');
      }

      this.wallet = wallet;
      this.emit('connected', wallet);
      return wallet;
    } catch (error) {
      console.error('Wallet connection error:', error);
      this.emit('error', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  // Disconnect wallet
  public disconnect(): void {
    if (this.wallet) {
      this.wallet = null;
      this.emit('disconnected');
    }
  }

  // Check if wallet is connected
  public isConnected(): boolean {
    return !!this.wallet && !!this.wallet.address;
  }

  // Get wallet
  public getWallet(): StellarWallet | null {
    return this.wallet;
  }

  // Execute contract call with transaction tracking
  public async executeContractCall<T>(
    contractType: 'factory' | 'project',
    contractId: string | undefined,
    method: string,
    params: any
  ): Promise<T> {
    if (!this.isConnected()) {
      await this.connect();
    }

    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    const txId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    try {
      // Update transaction status to pending
      const txInfo: TransactionInfo = {
        id: txId,
        status: TransactionStatus.PENDING,
      };
      this.transactions.set(txId, txInfo);
      this.emit('transactionUpdated', { ...txInfo });

      // Get appropriate client
      const client = contractType === 'factory' 
        ? getFactoryClient()
        : getProjectClient(contractId || PROJECT_CONTRACT_ID);

      if (!client) {
        throw new Error(`Failed to get ${contractType} client`);
      }

      // Execute contract call
      // @ts-ignore - Dynamic method call
      const result = await client[method](params);

      // Update transaction status to confirmed
      const updatedTxInfo: TransactionInfo = {
        ...txInfo,
        status: TransactionStatus.CONFIRMED,
        data: result
      };
      this.transactions.set(txId, updatedTxInfo);
      this.emit('transactionUpdated', { ...updatedTxInfo });

      return result as T;
    } catch (error) {
      console.error(`Contract call error (${contractType}.${method}):`, error);
      
      // Update transaction status to failed
      const errorTxInfo: TransactionInfo = {
        ...this.transactions.get(txId),
        status: TransactionStatus.FAILED,
        error: error instanceof Error ? error : new Error(String(error))
      };
      this.transactions.set(txId, errorTxInfo);
      this.emit('transactionUpdated', { ...errorTxInfo });
      
      throw error;
    }
  }

  // Get factory contract
  public async getProjects(): Promise<string[]> {
    return this.executeContractCall<string[]>('factory', FACTORY_CONTRACT_ID, 'getProjects', {});
  }

  // Create a new project
  public async createProject(
    title: string,
    description: string,
    imageUrl: string,
    daysUntilDeadline: number
  ): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    // Calculate deadline timestamp (current time + days in seconds)
    const deadline = Math.floor(Date.now() / 1000) + (daysUntilDeadline * 86400);
    
    return this.executeContractCall<string>('factory', FACTORY_CONTRACT_ID, 'createProject', {
      creator: this.wallet.address,
      title,
      description,
      image_url: imageUrl,
      deadline: BigInt(deadline)
    });
  }

  // Get project data
  public async getProjectData(projectId: string): Promise<any> {
    return this.executeContractCall<any>('project', projectId, 'getProjectData', {});
  }

  // Fund a project
  public async fundProject(projectId: string, amount: bigint, tokenAddress: string): Promise<any> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }
    
    // Set token first
    try {
      await this.executeContractCall<any>('project', projectId, 'setToken', {
        token_id: tokenAddress
      });
    } catch (error) {
      console.log('Token might already be set, continuing...');
    }
    
    // Fund the project
    return this.executeContractCall<any>('project', projectId, 'fund', {
      from: this.wallet.address,
      amount
    });
  }

  // Withdraw funds from a project
  public async withdrawFunds(projectId: string): Promise<any> {
    return this.executeContractCall<any>('project', projectId, 'withdraw', {});
  }

  // Get total funded amount
  public async getTotalFunded(projectId: string): Promise<bigint> {
    return this.executeContractCall<bigint>('project', projectId, 'getTotalFunded', {});
  }

  // Get contribution from a specific funder
  public async getContribution(projectId: string, funderAddress: string): Promise<bigint> {
    return this.executeContractCall<bigint>('project', projectId, 'getContribution', {
      funder: funderAddress
    });
  }

  // Get all transactions
  public getTransactions(): TransactionInfo[] {
    return Array.from(this.transactions.values());
  }

  // Get transaction by ID
  public getTransaction(txId: string): TransactionInfo | undefined {
    return this.transactions.get(txId);
  }
} 