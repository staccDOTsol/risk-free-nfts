// components/StakeTree/StakeTree.tsx
import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useUmi } from '@/providers/useUmi';
import {  Keypair, TransactionInstruction } from '@solana/web3.js';
import { struct, u8, u32, u64 } from '@coral-xyz/borsh';
import { publicKey } from '@coral-xyz/borsh';
import { createInitializeInstruction, pack, TokenMetadata } from '@solana/spl-token-metadata';

import { STAKE_POOL_PROGRAM_ID } from '@solana/spl-stake-pool';
import {  SystemProgram, Transaction } from '@solana/web3.js';
import {  AccountLayout, createAssociatedTokenAccountInstruction, createHarvestWithheldTokensToMintInstruction, createInitializeMintInstruction, createInitializeTransferFeeConfigInstruction, createTransferCheckedInstruction, createTransferCheckedWithFeeInstruction, createWithdrawWithheldTokensFromAccountsInstruction, createWithdrawWithheldTokensFromMintInstruction, ExtensionType, getAssociatedTokenAddressSync, getMintLen, getTransferFeeAmount, LENGTH_SIZE, MintLayout, TOKEN_2022_PROGRAM_ID, TYPE_SIZE, unpackAccount } from '@solana/spl-token';
import * as splStakePool from '@solana/spl-stake-pool'
import React from 'react';

// ... (keep other imports and type definitions)

const RetroButton = ({ onClick, children }: { onClick: () => void, children: React.ReactNode }) => (
  <button onClick={onClick} className="retro-button">
    {children}
  </button>
);

import { Layout } from '@solana/spl-stake-pool/dist/codecs';
// @ts-ignore
import { Layout as LayoutCls } from 'buffer-layout';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { Infer } from 'superstruct';
export interface Fee {
    denominator: BN;
    numerator: BN;
}
export declare enum AccountType {
    Uninitialized = 0,
    StakePool = 1,
    ValidatorList = 2
}
export declare const BigNumFromString: import("superstruct").Struct<BN, null>;
export declare const PublicKeyFromString: import("superstruct").Struct<PublicKey, null>;
export declare class FutureEpochLayout<T> extends LayoutCls<T | null> {
    layout: Layout<T>;
    discriminator: Layout<number>;
    constructor(layout: Layout<T>, property?: string);
    encode(src: T | null, b: Buffer, offset?: number): number;
    decode(b: Buffer, offset?: number): T | null;
    getSpan(b: Buffer, offset?: number): number;
}
export declare function futureEpoch<T>(layout: Layout<T>, property?: string): LayoutCls<T | null>;
export type StakeAccountType = Infer<typeof StakeAccountType>;
export declare const StakeAccountType: import("superstruct").Struct<"uninitialized" | "initialized" | "delegated" | "rewardsPool", {
    uninitialized: "uninitialized";
    initialized: "initialized";
    delegated: "delegated";
    rewardsPool: "rewardsPool";
}>;
export type StakeMeta = Infer<typeof StakeMeta>;
export declare const StakeMeta: import("superstruct").Struct<{
    rentExemptReserve: BN;
    authorized: {
        staker: PublicKey;
        withdrawer: PublicKey;
    };
    lockup: {
        unixTimestamp: number;
        epoch: number;
        custodian: PublicKey;
    };
}, {
    rentExemptReserve: import("superstruct").Struct<BN, null>;
    authorized: import("superstruct").Struct<{
        staker: PublicKey;
        withdrawer: PublicKey;
    }, {
        staker: import("superstruct").Struct<PublicKey, null>;
        withdrawer: import("superstruct").Struct<PublicKey, null>;
    }>;
    lockup: import("superstruct").Struct<{
        unixTimestamp: number;
        epoch: number;
        custodian: PublicKey;
    }, {
        unixTimestamp: import("superstruct").Struct<number, null>;
        epoch: import("superstruct").Struct<number, null>;
        custodian: import("superstruct").Struct<PublicKey, null>;
    }>;
}>;
export type StakeAccountInfo = Infer<typeof StakeAccountInfo>;
export declare const StakeAccountInfo: import("superstruct").Struct<{
    meta: {
        rentExemptReserve: BN;
        authorized: {
            staker: PublicKey;
            withdrawer: PublicKey;
        };
        lockup: {
            unixTimestamp: number;
            epoch: number;
            custodian: PublicKey;
        };
    };
    stake: {
        delegation: {
            stake: BN;
            voter: PublicKey;
            activationEpoch: BN;
            deactivationEpoch: BN;
            warmupCooldownRate: number;
        };
        creditsObserved: number;
    } | null;
}, {
    meta: import("superstruct").Struct<{
        rentExemptReserve: BN;
        authorized: {
            staker: PublicKey;
            withdrawer: PublicKey;
        };
        lockup: {
            unixTimestamp: number;
            epoch: number;
            custodian: PublicKey;
        };
    }, {
        rentExemptReserve: import("superstruct").Struct<BN, null>;
        authorized: import("superstruct").Struct<{
            staker: PublicKey;
            withdrawer: PublicKey;
        }, {
            staker: import("superstruct").Struct<PublicKey, null>;
            withdrawer: import("superstruct").Struct<PublicKey, null>;
        }>;
        lockup: import("superstruct").Struct<{
            unixTimestamp: number;
            epoch: number;
            custodian: PublicKey;
        }, {
            unixTimestamp: import("superstruct").Struct<number, null>;
            epoch: import("superstruct").Struct<number, null>;
            custodian: import("superstruct").Struct<PublicKey, null>;
        }>;
    }>;
    stake: import("superstruct").Struct<{
        delegation: {
            stake: BN;
            voter: PublicKey;
            activationEpoch: BN;
            deactivationEpoch: BN;
            warmupCooldownRate: number;
        };
        creditsObserved: number;
    } | null, {
        delegation: import("superstruct").Struct<{
            stake: BN;
            voter: PublicKey;
            activationEpoch: BN;
            deactivationEpoch: BN;
            warmupCooldownRate: number;
        }, {
            voter: import("superstruct").Struct<PublicKey, null>;
            stake: import("superstruct").Struct<BN, null>;
            activationEpoch: import("superstruct").Struct<BN, null>;
            deactivationEpoch: import("superstruct").Struct<BN, null>;
            warmupCooldownRate: import("superstruct").Struct<number, null>;
        }>;
        creditsObserved: import("superstruct").Struct<number, null>;
    }>;
}>;
export type StakeAccount = Infer<typeof StakeAccount>;
export declare const StakeAccount: import("superstruct").Struct<{
    type: "uninitialized" | "initialized" | "delegated" | "rewardsPool";
    info?: {
        meta: {
            rentExemptReserve: BN;
            authorized: {
                staker: PublicKey;
                withdrawer: PublicKey;
            };
            lockup: {
                unixTimestamp: number;
                epoch: number;
                custodian: PublicKey;
            };
        };
        stake: {
            delegation: {
                stake: BN;
                voter: PublicKey;
                activationEpoch: BN;
                deactivationEpoch: BN;
                warmupCooldownRate: number;
            };
            creditsObserved: number;
        } | null;
    } | undefined;
}, {
    type: import("superstruct").Struct<"uninitialized" | "initialized" | "delegated" | "rewardsPool", {
        uninitialized: "uninitialized";
        initialized: "initialized";
        delegated: "delegated";
        rewardsPool: "rewardsPool";
    }>;
    info: import("superstruct").Struct<{
        meta: {
            rentExemptReserve: BN;
            authorized: {
                staker: PublicKey;
                withdrawer: PublicKey;
            };
            lockup: {
                unixTimestamp: number;
                epoch: number;
                custodian: PublicKey;
            };
        };
        stake: {
            delegation: {
                stake: BN;
                voter: PublicKey;
                activationEpoch: BN;
                deactivationEpoch: BN;
                warmupCooldownRate: number;
            };
            creditsObserved: number;
        } | null;
    } | undefined, {
        meta: import("superstruct").Struct<{
            rentExemptReserve: BN;
            authorized: {
                staker: PublicKey;
                withdrawer: PublicKey;
            };
            lockup: {
                unixTimestamp: number;
                epoch: number;
                custodian: PublicKey;
            };
        }, {
            rentExemptReserve: import("superstruct").Struct<BN, null>;
            authorized: import("superstruct").Struct<{
                staker: PublicKey;
                withdrawer: PublicKey;
            }, {
                staker: import("superstruct").Struct<PublicKey, null>;
                withdrawer: import("superstruct").Struct<PublicKey, null>;
            }>;
            lockup: import("superstruct").Struct<{
                unixTimestamp: number;
                epoch: number;
                custodian: PublicKey;
            }, {
                unixTimestamp: import("superstruct").Struct<number, null>;
                epoch: import("superstruct").Struct<number, null>;
                custodian: import("superstruct").Struct<PublicKey, null>;
            }>;
        }>;
        stake: import("superstruct").Struct<{
            delegation: {
                stake: BN;
                voter: PublicKey;
                activationEpoch: BN;
                deactivationEpoch: BN;
                warmupCooldownRate: number;
            };
            creditsObserved: number;
        } | null, {
            delegation: import("superstruct").Struct<{
                stake: BN;
                voter: PublicKey;
                activationEpoch: BN;
                deactivationEpoch: BN;
                warmupCooldownRate: number;
            }, {
                voter: import("superstruct").Struct<PublicKey, null>;
                stake: import("superstruct").Struct<BN, null>;
                activationEpoch: import("superstruct").Struct<BN, null>;
                deactivationEpoch: import("superstruct").Struct<BN, null>;
                warmupCooldownRate: import("superstruct").Struct<number, null>;
            }>;
            creditsObserved: import("superstruct").Struct<number, null>;
        }>;
    }>;
}>;
export interface Lockup {
    unixTimestamp: BN;
    epoch: BN;
    custodian: PublicKey;
}
export interface StakePool {
    accountType: AccountType;
    manager: PublicKey;
    staker: PublicKey;
    stakeDepositAuthority: PublicKey;
    stakeWithdrawBumpSeed: number;
    validatorList: PublicKey;
    reserveStake: PublicKey;
    poolMint: PublicKey;
    managerFeeAccount: PublicKey;
    tokenProgramId: PublicKey;
    totalLamports: BN;
    poolTokenSupply: BN;
    lastUpdateEpoch: BN;
    lockup: Lockup;
    epochFee: Fee;
    nextEpochFee?: Fee | undefined;
    preferredDepositValidatorVoteAddress?: PublicKey | undefined;
    preferredWithdrawValidatorVoteAddress?: PublicKey | undefined;
    stakeDepositFee: Fee;
    stakeWithdrawalFee: Fee;
    nextStakeWithdrawalFee?: Fee | undefined;
    stakeReferralFee: number;
    solDepositAuthority?: PublicKey | undefined;
    solDepositFee: Fee;
    solReferralFee: number;
    solWithdrawAuthority?: PublicKey | undefined;
    solWithdrawalFee: Fee;
    nextSolWithdrawalFee?: Fee | undefined;
    lastEpochPoolTokenSupply: BN;
    lastEpochTotalLamports: BN;
}
export declare const StakePoolLayout: LayoutCls<StakePool>;
export declare enum ValidatorStakeInfoStatus {
    Active = 0,
    DeactivatingTransient = 1,
    ReadyForRemoval = 2
}
export interface ValidatorStakeInfo {
    status: ValidatorStakeInfoStatus;
    voteAccountAddress: PublicKey;
    activeStakeLamports: BN;
    transientStakeLamports: BN;
    transientSeedSuffixStart: BN;
    transientSeedSuffixEnd: BN;
    lastUpdateEpoch: BN;
}
export declare const ValidatorStakeInfoLayout: LayoutCls<ValidatorStakeInfo>;
export interface ValidatorList {
    accountType: number;
    maxValidators: number;
    validators: ValidatorStakeInfo[];
}
export declare const ValidatorListLayout: LayoutCls<ValidatorList>;

interface StakeTreeProps {
  stakePool: string;
}

export function StakeTree(props: StakeTreeProps) {
  const wallet = useWallet();
  const umi = useUmi();
  const [stakePool, setStakePool] = useState<splStakePool.StakePoolAccount | null>(null);
  const [refManager, setRefManager] = useState<PublicKey | null>(null);
  const [referrer, setReferrer] = useState<splStakePool.StakePoolAccount | null>(null);
  const [referrals, setReferrals] = useState<splStakePool.StakePoolAccount[]>([]);
  const [lstBalance, setLstBalance] = useState<number>(0);
  const [token22Balance, setToken22Balance] = useState<number>(0);
  const { connection } = useConnection();

  useEffect(() => {
    const fetchStakePool = async () => {
      if (wallet.publicKey && props.stakePool) {
        try {
          const fetchedStakePool = await splStakePool.getStakePoolAccount(connection, new PublicKey(props.stakePool));
          setStakePool(fetchedStakePool);
          const refManager = stakePool?.account.data.manager
        setRefManager(refManager as PublicKey)
          fetchReferrerAndReferrals(fetchedStakePool     as splStakePool.StakePoolAccount, refManager as PublicKey);
          fetchBalances();
        } catch (error) {
          console.error("Error fetching stake pool:", error);
        }
      }
    };

    fetchStakePool();
  }, [wallet.publicKey, props.stakePool, connection]);

  const FEE_LAYOUT: Layout<any> = struct([
    u64('denominator'),
    u64('numerator'),
  ]);
  
  const INITIALIZE_LAYOUT: Layout<any> = struct([
    u8('instruction'),
    FEE_LAYOUT.replicate('epoch_fee'),
    FEE_LAYOUT.replicate('withdrawal_fee'),
    FEE_LAYOUT.replicate('deposit_fee'),
    u8('referral_fee'),
    u32('max_validators'),
  ]);
  
  function initializeIx(params: {
    stakeProgramId: PublicKey;
    stakePool: PublicKey;
    manager: PublicKey;
    staker: PublicKey;
    stakePoolWithdrawAuthority: PublicKey;
    validatorList: PublicKey;
    reserveStake: PublicKey;
    poolMint: PublicKey;
    managerPoolAccount: PublicKey;
    tokenProgramId: PublicKey;
    depositAuthority: PublicKey | null;
    fee: { numerator: number; denominator: number };
    withdrawalFee: { numerator: number; denominator: number };
    depositFee: { numerator: number; denominator: number };
    referralFee: number;
    maxValidators: number;
  }): TransactionInstruction {
    const keys = [
      { pubkey: params.stakePool, isSigner: false, isWritable: true },
      { pubkey: params.manager, isSigner: true, isWritable: false },
      { pubkey: params.staker, isSigner: false, isWritable: false },
      { pubkey: params.stakePoolWithdrawAuthority, isSigner: false, isWritable: false },
      { pubkey: params.validatorList, isSigner: false, isWritable: true },
      { pubkey: params.reserveStake, isSigner: false, isWritable: false },
      { pubkey: params.poolMint, isSigner: false, isWritable: true },
      { pubkey: params.managerPoolAccount, isSigner: false, isWritable: true },
      { pubkey: params.tokenProgramId, isSigner: false, isWritable: false },
    ];
  
    if (params.depositAuthority) {
      keys.push({ pubkey: params.depositAuthority, isSigner: true, isWritable: false });
    }
  
    const data = Buffer.alloc(INITIALIZE_LAYOUT.span);
    INITIALIZE_LAYOUT.encode(
      {
        instruction: 0, // Initialize instruction
        epoch_fee: params.fee,
        withdrawal_fee: params.withdrawalFee,
        deposit_fee: params.depositFee,
        referral_fee: params.referralFee,
        max_validators: params.maxValidators,
      },
      data
    );
  
    return new TransactionInstruction({
      keys,
      programId: params.stakeProgramId,
      data,
    });
  }
const initialize = async (stakePoolKp: Keypair, poolMintKp: Keypair,refManager: PublicKey, params: {
    stakePool: PublicKey;
    manager: PublicKey;
    staker: PublicKey;
    stakePoolWithdrawAuthority: PublicKey;
    validatorList: PublicKey;
    reserveStake: PublicKey;
    poolMint: PublicKey;
    managerPoolAccount: PublicKey;
    tokenProgramId: PublicKey;
    depositAuthority: PublicKey | null;
    fee: { numerator: number; denominator: number };
    withdrawalFee: { numerator: number; denominator: number };
    depositFee: { numerator: number; denominator: number };
    referralFee: number;
    maxValidators: number;
  }) => {
    const transaction = new Transaction();
  const poolMint = poolMintKp.publicKey
    const metadata: any = {
        mint: poolMint,
        name: 'Stake Pool Token',
        symbol: 'SPT',
        uri: 'https://example.com/token-metadata.json',
        additionalMetadata: [['referrer', refManager.toBase58()]],
      };

      const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

      const createMetadataAccountIx = SystemProgram.createAccount({
        fromPubkey: wallet.publicKey!,
        newAccountPubkey: poolMint,
        lamports: await connection.getMinimumBalanceForRentExemption(metadataLen),
        space: metadataLen,
        programId: TOKEN_2022_PROGRAM_ID
      });

      const initializeMetadataIx = createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        mint: poolMint,
        metadata: poolMint,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri,
        mintAuthority: wallet.publicKey!,
        updateAuthority: wallet.publicKey!,
      });
      const mintLen = getMintLen([ExtensionType.MetadataPointer, ExtensionType.TransferFeeConfig]);

      const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);
      const createMintAccountIx = SystemProgram.createAccount({
        fromPubkey: wallet.publicKey!,
        newAccountPubkey: poolMint,
        space: mintLen,
        lamports: mintLamports,
        programId: TOKEN_2022_PROGRAM_ID,
      });

      transaction.add(createMintAccountIx);

      transaction.add(createMetadataAccountIx, initializeMetadataIx);
      const initializeMintIx = createInitializeMintInstruction(
        poolMint,
        9,
        wallet.publicKey!,
        null,
        TOKEN_2022_PROGRAM_ID
      );
      
      const transferFeeConfigIx = createInitializeTransferFeeConfigInstruction(
        poolMint,
        wallet.publicKey!,
        wallet.publicKey!,
        10, // 0.1% transfer fee
        BigInt(1000000000), // 1 token maximum fee (assuming 9 decimals)
        TOKEN_2022_PROGRAM_ID
      );
      
      transaction.add(createMintAccountIx, initializeMintIx, transferFeeConfigIx);
    // Create validator list storage account
    const validatorListSpace = ValidatorListLayout.calculateSpace(params.maxValidators);
    const createValidatorListInstruction = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey!,
      newAccountPubkey: params.validatorList,
      lamports: await connection.getMinimumBalanceForRentExemption(validatorListSpace),
      space: validatorListSpace,
      programId: STAKE_POOL_PROGRAM_ID,
    });
    transaction.add(createValidatorListInstruction);
  
    // Create reserve stake account
    const createReserveStakeInstruction = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey!,
      newAccountPubkey: params.reserveStake,
      lamports: await connection.getMinimumBalanceForRentExemption(200), // Minimum size for a stake account
      space: 200,
      programId: SystemProgram.programId,
    });
    transaction.add(createReserveStakeInstruction);
  
    // Create pool mint
    const createPoolMintInstruction = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey!,
      newAccountPubkey: params.poolMint,
      lamports: await connection.getMinimumBalanceForRentExemption(82),
      space: 82,
      programId: params.tokenProgramId,
    });
    transaction.add(createPoolMintInstruction);
  
    // Create manager fee account
    const createManagerPoolAccountInstruction = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey!,
      newAccountPubkey: params.managerPoolAccount,
      lamports: await connection.getMinimumBalanceForRentExemption(165),
      space: 165,
      programId: params.tokenProgramId,
    });
    transaction.add(createManagerPoolAccountInstruction);
  
    // Create stake pool account
    const stakePoolSpace = 1 + 32 * 11 + 8 * 5 + 1 * 7 + 4 * 2 + 8 * 2; // Approximate size based on the StakePool struct
    const createStakePoolAccountInstruction = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey!,
      newAccountPubkey: params.stakePool,
      lamports: await connection.getMinimumBalanceForRentExemption(stakePoolSpace),
      space: stakePoolSpace,
      programId: STAKE_POOL_PROGRAM_ID,
    });
    transaction.add(createStakePoolAccountInstruction);
  
    // Initialize stake pool instruction
    const initializeStakePoolInstruction = initializeIx({
      stakeProgramId: STAKE_POOL_PROGRAM_ID,
      stakePool: params.stakePool,
      manager: params.manager,
      staker: params.staker,
      stakePoolWithdrawAuthority: params.stakePoolWithdrawAuthority,
      validatorList: params.validatorList,
      reserveStake: params.reserveStake,
      poolMint: params.poolMint,
      managerPoolAccount: params.managerPoolAccount,
      tokenProgramId: params.tokenProgramId,
      depositAuthority: params.depositAuthority,
      fee: params.fee,
      withdrawalFee: params.withdrawalFee,
      depositFee: params.depositFee,
      referralFee: params.referralFee,
      maxValidators: params.maxValidators,
    });
    transaction.add(initializeStakePoolInstruction);
  
    // Sign and send transaction
    try {
        transaction.partialSign(stakePoolKp)
        if (!wallet || !wallet.signTransaction) return
        const signed = await wallet.signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signed.serialize())
      await connection.confirmTransaction(signature, 'confirmed');
      console.log('Stake pool initialized successfully');
  
      // Fetch and return the newly created stake pool account
      return await splStakePool.getStakePoolAccount(connection, params.stakePool);
    } catch (error) {
      console.error('Error initializing stake pool:', error);
      throw error;
    }
  };
  
  const initializeOrFetchUserPool = async () => {
        const stakePoolKp = Keypair.generate()
        // @ts-ignore
        const stakePool = stakePoolKp.publicKey
      // If the stake pool doesn't exist, initialize a new one
      const [validatorList] = PublicKey.findProgramAddressSync(
        [Buffer.from("validator_list"), new PublicKey(stakePool).toBuffer()],
        STAKE_POOL_PROGRAM_ID
      );
      const [reserveStake] = PublicKey.findProgramAddressSync(
        [Buffer.from("reserve"), new PublicKey(stakePool).toBuffer()],
        STAKE_POOL_PROGRAM_ID
      );

      const poolMintKp = Keypair.generate();
      const poolMint = poolMintKp.publicKey;
      // Create an ATA for the manager fee account
      const managerPoolAccount = await getAssociatedTokenAddressSync(
        poolMint,
        refManager ? refManager : wallet.publicKey!,
        true,
        TOKEN_2022_PROGRAM_ID
      );
  
      const newStakePool = await initialize(stakePoolKp, poolMintKp, refManager as PublicKey, {
        stakePool: new PublicKey(stakePool),
        manager: wallet.publicKey!,
        staker: wallet.publicKey!,
        stakePoolWithdrawAuthority: PublicKey.findProgramAddressSync(
          [Buffer.from("withdraw"), new PublicKey(stakePool).toBuffer()],
          STAKE_POOL_PROGRAM_ID
        )[0],
        validatorList,
        reserveStake,
        poolMint,
        managerPoolAccount,
        tokenProgramId: TOKEN_2022_PROGRAM_ID,
        depositAuthority: null,
        fee: { numerator: 1, denominator: 100 }, // 1% fee, adjust as needed
        withdrawalFee: { numerator: 1, denominator: 100 }, // 1% withdrawal fee, adjust as needed
        depositFee: { numerator: 1, denominator: 1000 }, // 0.1% deposit fee, adjust as needed
        referralFee: 10, // 10% referral fee, adjust as needed
        maxValidators: 100, // Adjust based on your needs
      });
      setStakePool(newStakePool as splStakePool.StakePoolAccount);
  };

  const fetchReferrerAndReferrals = async (stakePool: splStakePool.StakePoolAccount, refManager: PublicKey) => {
    console.log(stakePool)
    const ourManagerFeeAccount = stakePool?.account.data.managerFeeAccount;
    const allPools = await splStakePool.getStakePoolAccounts(connection, STAKE_POOL_PROGRAM_ID) as any;
    const theirManager = AccountLayout.decode((await connection.getAccountInfo(ourManagerFeeAccount as PublicKey))?.data as Buffer).owner


    // Find our referrer (the pool where we are the manager fee account)
    const referrerPool = allPools.find((pool: any) => 
      pool.account.data.manager?.toBase58() == theirManager?.toBase58()
    );
    setReferrer(referrerPool);
    // Find our referrals (pools where we are the manager of their manager fee account)
    const ourManager = stakePool?.account.data.manager;
    const refs = allPools.filter((pool: any) => {
    if (pool.account.data.accountType == 2) return false
      const poolMint = pool.account.data.poolMint;
      const managerFeeAccount = pool.account.data.managerFeeAccount;
     
      // Check if the manager fee account is an ATA of their pool mint and our manager
      return getAssociatedTokenAddressSync(
        poolMint,
        ourManager as PublicKey,
        true,
        TOKEN_2022_PROGRAM_ID
      ).equals(managerFeeAccount);
    });
    setReferrals(refs);
  };

  const fetchBalances = async () => {
    
  };

  const stake = async (amount: number) => {
    if (!wallet.publicKey || !stakePool) {
      console.error("Wallet or stake pool not initialized");
      return;
    }

    try {
      const transaction = new Transaction();
      const userStakeATA = getAssociatedTokenAddressSync(
        stakePool.account.data.poolMint,
        wallet.publicKey,
        true,
        TOKEN_2022_PROGRAM_ID
      );
      const userStakeATAAI = await connection.getAccountInfo(userStakeATA)
      if (userStakeATA == undefined){
      // Create user's stake ATA if it doesn't exist
      const createATAIx = createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        userStakeATA,
        wallet.publicKey,
        stakePool.account.data.poolMint,
        TOKEN_2022_PROGRAM_ID
      );
      transaction.add(createATAIx);

      }

      // Deposit SOL instruction
      const depositSolIx = splStakePool.StakePoolInstruction.depositSol({
        stakePool: stakePool.pubkey,
        withdrawAuthority: stakePool.account.data.solWithdrawAuthority as PublicKey,
        reserveStake: stakePool.account.data.reserveStake,
        fundingAccount: wallet.publicKey,
        destinationPoolAccount: userStakeATA,
        managerFeeAccount: stakePool.account.data.managerFeeAccount,
        referralPoolAccount: stakePool.account.data.managerFeeAccount,
        poolMint: stakePool.account.data.poolMint,
        lamports: amount * 1e9 // Convert SOL to lamports
      });
      transaction.add(depositSolIx);

      // Sign and send transaction
      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      console.log(`Stake transaction successful. Signature: ${signature}`);
    } catch (error) {
      console.error("Error during stake operation:", error);
    }
  };

  const withdrawAll = async () => {
    if (!wallet.publicKey || !stakePool) {
      console.error("Wallet or stake pool not initialized");
      return;
    }

    try {
      const transaction = new Transaction();
      const userStakeATA = getAssociatedTokenAddressSync(
        stakePool.account.data.poolMint,
        wallet.publicKey,
        true,
        TOKEN_2022_PROGRAM_ID
      );

      // Get the user's stake balance
      const userStakeBalance = await connection.getTokenAccountBalance(userStakeATA);
      const lamportsToWithdraw = userStakeBalance.value.uiAmount ? userStakeBalance.value.uiAmount * 1e9 : 0;

      if (lamportsToWithdraw === 0) {
        console.log("No balance to withdraw");
        return;
      }

      // Withdraw SOL instruction
      const withdrawSolIx = splStakePool.StakePoolInstruction.withdrawSol({
        stakePool: stakePool.pubkey,
        withdrawAuthority: stakePool.account.data.solWithdrawAuthority as PublicKey,
        sourceTransferAuthority: wallet.publicKey,
        sourcePoolAccount: userStakeATA,
        reserveStake: stakePool.account.data.reserveStake,
        destinationSystemAccount: wallet.publicKey,
        managerFeeAccount: stakePool.account.data.managerFeeAccount,
        poolMint: stakePool.account.data.poolMint,
        poolTokens: lamportsToWithdraw
      });
      transaction.add(withdrawSolIx);

      // Sign and send transaction
      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      console.log(`Withdraw all transaction successful. Signature: ${signature}`);
    } catch (error) {
      console.error("Error during withdraw all operation:", error);
    }
  };

  const claimRewards = async () => {
    const txs: Transaction[] = []
    if (!stakePool || !wallet || !wallet.signAllTransactions) return
    const tokenAccounts = await connection.getProgramAccounts(
        TOKEN_2022_PROGRAM_ID,
        {
          filters: [
            {
              memcmp: {
                offset: 0,
                bytes: stakePool?.account.data.poolMint.toBase58() || '',
              },
            },
          ],
        }
      );
      const associatedAddress = getAssociatedTokenAddressSync(
        stakePool.account.data.poolMint,
        wallet.publicKey as PublicKey,
        true, 
        TOKEN_2022_PROGRAM_ID
      )
      let withheld = BigInt(0)
      for (const ata of tokenAccounts) {
        const tx = new Transaction()
        
        // Withdraw from top holders' accounts
        const withdrawFromAccountsIx = await createWithdrawWithheldTokensFromAccountsInstruction
        (
          stakePool.account.data.poolMint,
          associatedAddress,
          wallet.publicKey as PublicKey,
          [wallet.publicKey as PublicKey],
          [ata.pubkey],
          TOKEN_2022_PROGRAM_ID
        );
        const account = unpackAccount(ata.pubkey, ata.account, TOKEN_2022_PROGRAM_ID);
        const transferFeeAmount = getTransferFeeAmount(account);
        if (transferFeeAmount) {
          const withheldAmount = transferFeeAmount.withheldAmount;
          console.log(`Withheld amount for ${ata.pubkey.toBase58()}: ${withheldAmount.toString()}`);
          withheld += withheldAmount;
        }
  
        tx.add(withdrawFromAccountsIx);
        tx.feePayer = wallet.publicKey  as PublicKey
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
        txs.push(tx)

      }
      // Sort referrals by their join date, assuming newer referrals are at the end of the array
      const sortedReferrals = referrals.slice().reverse();
      
      if (sortedReferrals.length > 0 && withheld > BigInt(0)) {
        const totalShares = sortedReferrals.reduce((acc, _, index) => acc + index + 1, 0);
        let remainingWithheld = withheld;

        for (let i = 0; i < sortedReferrals.length; i++) {
          const referral = sortedReferrals[i];
          const share = BigInt(i + 1) * remainingWithheld / BigInt(totalShares);
          
          if (share > BigInt(0)) {
            const tx = new Transaction();
            
            const transferIx = createTransferCheckedInstruction(
              associatedAddress,
              stakePool.account.data.poolMint,
              getAssociatedTokenAddressSync(
                stakePool.account.data.poolMint,
                referral.pubkey,
                true,
                TOKEN_2022_PROGRAM_ID
              ),
              wallet.publicKey as PublicKey,
              share,
              9, // Assuming 9 decimals for the token
              [],
              TOKEN_2022_PROGRAM_ID
            );

            tx.add(transferIx);
            tx.feePayer = wallet.publicKey as PublicKey;
            tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            txs.push(tx);

            remainingWithheld -= share;
          }

          if (remainingWithheld <= BigInt(0)) break;
        }
      }
      const signed = await wallet.signAllTransactions(txs)
      for (const sign of signed){
        connection.sendRawTransaction(sign.serialize())
      }
  };

  const refer = async (newReferral: PublicKey) => {
    // Implement referral logic
    // This would add a new referral to the user's downline
    console.log(`Referring ${newReferral.toBase58()}`);
  };

  return (
    <div className="retro-container">
      <h1 className="retro-title">StakeTree MLM Scheme</h1>
      
      <div className="retro-section">
        <h2 className="retro-subtitle">Your Stake Pool</h2>
        {stakePool && <p className="retro-text">Pool Address: {stakePool.pubkey.toBase58()}</p>}
        <div className="retro-button-group">
          <RetroButton onClick={() => stake(0.1)}>Stake 0.1 Sol</RetroButton>
          <RetroButton onClick={() => stake(0.5)}>Stake 0.5 Sol</RetroButton>
          <RetroButton onClick={() => stake(1)}>Stake 1 Sol</RetroButton>
          <RetroButton onClick={() => stake(2)}>Stake 2 Sol</RetroButton>
          <RetroButton onClick={() => stake(5)}>Stake 5 Sol</RetroButton>
        </div>
        <RetroButton onClick={initializeOrFetchUserPool}>Initialize/Fetch User Pool</RetroButton>
        <RetroButton onClick={withdrawAll}>Withdraw All</RetroButton>
      </div>
      
      <div className="retro-section">
        <h2 className="retro-subtitle">Your Balances</h2>
        <p className="retro-text">LST Balance: {lstBalance}</p>
        <p className="retro-text">Token2022 Balance: {token22Balance}</p>
        <RetroButton onClick={claimRewards}>Claim Rewards</RetroButton>
      </div>
      
      <div className="retro-section">
        <h2 className="retro-subtitle">Referral Network</h2>
        {referrer && <p className="retro-text">Your Referrer: {referrer.pubkey.toBase58()}</p>}
        <p className="retro-text">Your Referrals: {referrals.length}</p>
        <RetroButton onClick={() => refer(new PublicKey('...'))}>Add Referral</RetroButton>
      </div>

      <style jsx>{`
        .retro-container {
          font-family: 'Press Start 2P', cursive;
          background-color: #000;
          color: #0f0;
          padding: 20px;
          border: 4px solid #0f0;
          max-width: 800px;
          margin: 0 auto;
        }
        .retro-title {
          text-align: center;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .retro-subtitle {
          font-size: 18px;
          margin-bottom: 15px;
        }
        .retro-text {
          font-size: 14px;
          margin-bottom: 10px;
        }
        .retro-section {
          margin-bottom: 30px;
          border: 2px solid #0f0;
          padding: 15px;
        }
        .retro-button-group {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 15px;
        }
        .retro-button {
          background-color: #0f0;
          color: #000;
          border: none;
          padding: 10px 15px;
          font-family: 'Press Start 2P', cursive;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .retro-button:hover {
          background-color: #000;
          color: #0f0;
          border: 2px solid #0f0;
        }
      `}</style>
    </div>
  );
}