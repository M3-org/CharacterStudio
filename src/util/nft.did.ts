import type { IDL } from '@dfinity/candid'
import type { Principal } from '@dfinity/principal'

export namespace NFTIDL {
  export type AccountIdentifier = string
  export type AccountIdentifierReturn = { Ok: AccountIdentifier } | { Err: CommonError }
  export type ApiError = { ZeroAddress: null } | { InvalidTokenId: null } | { Unauthorized: null } | { Other: null }
  export type Balance = bigint
  export type BalanceReturn = { Ok: Balance } | { Err: CommonError }
  export type CommonError = { InvalidToken: TokenIdentifier } | { Other: string }
  export type Date = bigint
  export interface ExtendedMetadataResult {
    token_id: bigint
    metadata_desc: MetadataDesc
  }
  export type InterfaceId =
    | { Burn: null }
    | { Mint: null }
    | { Approval: null }
    | { TransactionHistory: null }
    | { TransferNotification: null }
  export interface LogoResult {
    data: string
    logo_type: string
  }
  export type Memo = Array<number>
  export type Metadata =
    | {
        fungible: {
          decimals: number
          metadata: [] | [MetadataContainer]
          name: string
          symbol: string
        }
      }
    | { nonfungible: [] | [MetadataContainer] }
  export type MetadataContainer = { blob: Array<number> } | { data: Array<MetadataValue> } | { json: string }
  export type MetadataDesc = Array<MetadataPart>
  export interface MetadataKeyVal {
    key: string
    val: MetadataVal
  }
  export interface MetadataPart {
    data: Array<number>
    key_val_data: Array<MetadataKeyVal>
    purpose: MetadataPurpose
  }
  export type MetadataPurpose = { Preview: null } | { Rendered: null }
  export type MetadataResult = { Ok: MetadataDesc } | { Err: ApiError }
  export type MetadataReturn = { Ok: Metadata } | { Err: CommonError }
  export type MetadataVal =
    | { Nat64Content: bigint }
    | { Nat32Content: number }
    | { Nat8Content: number }
    | { NatContent: bigint }
    | { Nat16Content: number }
    | { BlobContent: Array<number> }
    | { TextContent: string }
  export type MetadataValue = [string, Value]
  export type MintReceipt = { Ok: MintReceiptPart } | { Err: ApiError }
  export interface MintReceiptPart {
    id: bigint
    token_id: bigint
  }
  export interface MintRequest {
    to: User
    metadata: [] | [MetadataContainer]
  }
  export type OwnerResult = { Ok: Principal } | { Err: ApiError }
  export type SubAccount = Array<number>
  export type TokenIdentifier = string
  export type TokenIndex = number
  export interface TokenMetadata {
    principal: Principal
    metadata: Metadata
    account_identifier: AccountIdentifier
    token_identifier: TokenIdentifier
  }
  export interface Transaction {
    date: Date
    request: TransferRequest
    txid: TransactionId
  }
  export type TransactionId = bigint
  export interface TransactionRequest {
    token: TokenIdentifier
    query: TransactionRequestFilter
  }
  export type TransactionRequestFilter =
    | { date: [Date, Date] }
    | { page: [bigint, bigint] }
    | { txid: TransactionId }
    | { user: User }
  export interface TransactionResult {
    fee: bigint
    transaction_type: TransactionType
  }
  export type TransactionType =
    | {
        Approve: { to: Principal; token_id: bigint; from: Principal }
      }
    | { Burn: { token_id: bigint } }
    | { Mint: { to: Principal; token_id: bigint } }
    | { SetApprovalForAll: { to: Principal; from: Principal } }
    | {
        Transfer: { to: Principal; token_id: bigint; from: Principal }
      }
    | {
        TransferFrom: {
          to: Principal
          token_id: bigint
          from: Principal
        }
      }
  export interface TransferRequest {
    to: User
    token: TokenIdentifier
    notify: boolean
    from: User
    memo: Memo
    subaccount: [] | [SubAccount]
    amount: Balance
  }
  export type TransferResponse =
    | { Ok: Balance }
    | {
        Err:
          | { CannotNotify: AccountIdentifier }
          | { InsufficientBalance: null }
          | { InvalidToken: TokenIdentifier }
          | { Rejected: null }
          | { Unauthorized: AccountIdentifier }
          | { Other: string }
      }
  export type TrasactionsResult = { Ok: Array<Transaction> } | { Err: CommonError }
  export type TxReceipt = { Ok: bigint } | { Err: ApiError }
  export type User = { principal: Principal } | { address: AccountIdentifier }
  export type Value = { nat: bigint } | { blob: Array<number> } | { nat8: number } | { text: string }
  export interface Erc721TokenFactory {
    add: (arg_0: TransferRequest) => Promise<TransactionId>
    balanceOfDip721: (arg_0: Principal) => Promise<bigint>
    bearer: (arg_0: TokenIdentifier) => Promise<AccountIdentifierReturn>
    getAllMetadataForUser: (arg_0: User) => Promise<Array<TokenMetadata>>
    getMaxLimitDip721: () => Promise<number>
    getMetadataDip721: (arg_0: bigint) => Promise<MetadataResult>
    getMetadataForUserDip721: (arg_0: Principal) => Promise<Array<ExtendedMetadataResult>>
    getTokenIdsForUserDip721: (arg_0: Principal) => Promise<Array<bigint>>
    logoDip721: () => Promise<LogoResult>
    metadata: (arg_0: TokenIdentifier) => Promise<MetadataReturn>
    mintDip721: (arg_0: Principal, arg_1: MetadataDesc) => Promise<MintReceipt>
    mintNFT: (arg_0: MintRequest) => Promise<TokenIdentifier>
    name: () => Promise<string>
    nameDip721: () => Promise<string>
    ownerOfDip721: (arg_0: bigint) => Promise<OwnerResult>
    safeTransferFromDip721: (arg_0: Principal, arg_1: Principal, arg_2: bigint) => Promise<TxReceipt>
    supply: (arg_0: TokenIdentifier) => Promise<BalanceReturn>
    supportedInterfacesDip721: () => Promise<Array<InterfaceId>>
    symbolDip721: () => Promise<string>
    totalSupplyDip721: () => Promise<bigint>
    transfer: (arg_0: TransferRequest) => Promise<TransferResponse>
    transferFromDip721: (arg_0: Principal, arg_1: Principal, arg_2: bigint) => Promise<TxReceipt>
  }

  export const factory: IDL.InterfaceFactory = ({ IDL }) => {
    const AccountIdentifier = IDL.Text
    const User = IDL.Variant({
      principal: IDL.Principal,
      address: AccountIdentifier
    })
    const TokenIdentifier = IDL.Text
    const Memo = IDL.Vec(IDL.Nat8)
    const SubAccount = IDL.Vec(IDL.Nat8)
    const Balance = IDL.Nat
    const TransferRequest = IDL.Record({
      to: User,
      token: TokenIdentifier,
      notify: IDL.Bool,
      from: User,
      memo: Memo,
      subaccount: IDL.Opt(SubAccount),
      amount: Balance
    })
    const TransactionId = IDL.Nat
    const CommonError = IDL.Variant({
      InvalidToken: TokenIdentifier,
      Other: IDL.Text
    })
    const AccountIdentifierReturn = IDL.Variant({
      Ok: AccountIdentifier,
      Err: CommonError
    })
    const Value = IDL.Variant({
      nat: IDL.Nat,
      blob: IDL.Vec(IDL.Nat8),
      nat8: IDL.Nat8,
      text: IDL.Text
    })
    const MetadataValue = IDL.Tuple(IDL.Text, Value)
    const MetadataContainer = IDL.Variant({
      blob: IDL.Vec(IDL.Nat8),
      data: IDL.Vec(MetadataValue),
      json: IDL.Text
    })
    const Metadata = IDL.Variant({
      fungible: IDL.Record({
        decimals: IDL.Nat8,
        metadata: IDL.Opt(MetadataContainer),
        name: IDL.Text,
        symbol: IDL.Text
      }),
      nonfungible: IDL.Opt(MetadataContainer)
    })
    const TokenMetadata = IDL.Record({
      principal: IDL.Principal,
      metadata: Metadata,
      account_identifier: AccountIdentifier,
      token_identifier: TokenIdentifier
    })
    const MetadataVal = IDL.Variant({
      Nat64Content: IDL.Nat64,
      Nat32Content: IDL.Nat32,
      Nat8Content: IDL.Nat8,
      NatContent: IDL.Nat,
      Nat16Content: IDL.Nat16,
      BlobContent: IDL.Vec(IDL.Nat8),
      TextContent: IDL.Text
    })
    const MetadataKeyVal = IDL.Record({ key: IDL.Text, val: MetadataVal })
    const MetadataPurpose = IDL.Variant({
      Preview: IDL.Null,
      Rendered: IDL.Null
    })
    const MetadataPart = IDL.Record({
      data: IDL.Vec(IDL.Nat8),
      key_val_data: IDL.Vec(MetadataKeyVal),
      purpose: MetadataPurpose
    })
    const MetadataDesc = IDL.Vec(MetadataPart)
    const ApiError = IDL.Variant({
      ZeroAddress: IDL.Null,
      InvalidTokenId: IDL.Null,
      Unauthorized: IDL.Null,
      Other: IDL.Null
    })
    const MetadataResult = IDL.Variant({ Ok: MetadataDesc, Err: ApiError })
    const ExtendedMetadataResult = IDL.Record({
      token_id: IDL.Nat64,
      metadata_desc: MetadataDesc
    })
    const LogoResult = IDL.Record({ data: IDL.Text, logo_type: IDL.Text })
    const MetadataReturn = IDL.Variant({ Ok: Metadata, Err: CommonError })
    const MintReceiptPart = IDL.Record({
      id: IDL.Nat,
      token_id: IDL.Nat64
    })
    const MintReceipt = IDL.Variant({ Ok: MintReceiptPart, Err: ApiError })
    const MintRequest = IDL.Record({
      to: User,
      metadata: IDL.Opt(MetadataContainer)
    })
    const OwnerResult = IDL.Variant({ Ok: IDL.Principal, Err: ApiError })
    const TxReceipt = IDL.Variant({ Ok: IDL.Nat, Err: ApiError })
    const BalanceReturn = IDL.Variant({ Ok: Balance, Err: CommonError })
    const InterfaceId = IDL.Variant({
      Burn: IDL.Null,
      Mint: IDL.Null,
      Approval: IDL.Null,
      TransactionHistory: IDL.Null,
      TransferNotification: IDL.Null
    })
    const TransferResponse = IDL.Variant({
      Ok: Balance,
      Err: IDL.Variant({
        CannotNotify: AccountIdentifier,
        InsufficientBalance: IDL.Null,
        InvalidToken: TokenIdentifier,
        Rejected: IDL.Null,
        Unauthorized: AccountIdentifier,
        Other: IDL.Text
      })
    })
    const erc721_token = IDL.Service({
      add: IDL.Func([TransferRequest], [TransactionId], []),
      balanceOfDip721: IDL.Func([IDL.Principal], [IDL.Nat64], ['query']),
      bearer: IDL.Func([TokenIdentifier], [AccountIdentifierReturn], ['query']),
      getAllMetadataForUser: IDL.Func([User], [IDL.Vec(TokenMetadata)], ['query']),
      getMaxLimitDip721: IDL.Func([], [IDL.Nat16], ['query']),
      getMetadataDip721: IDL.Func([IDL.Nat64], [MetadataResult], ['query']),
      getMetadataForUserDip721: IDL.Func([IDL.Principal], [IDL.Vec(ExtendedMetadataResult)], []),
      getTokenIdsForUserDip721: IDL.Func([IDL.Principal], [IDL.Vec(IDL.Nat64)], ['query']),
      logoDip721: IDL.Func([], [LogoResult], ['query']),
      metadata: IDL.Func([TokenIdentifier], [MetadataReturn], ['query']),
      mintDip721: IDL.Func([IDL.Principal, MetadataDesc], [MintReceipt], []),
      mintNFT: IDL.Func([MintRequest], [TokenIdentifier], []),
      name: IDL.Func([], [IDL.Text], ['query']),
      nameDip721: IDL.Func([], [IDL.Text], ['query']),
      ownerOfDip721: IDL.Func([IDL.Nat64], [OwnerResult], ['query']),
      safeTransferFromDip721: IDL.Func([IDL.Principal, IDL.Principal, IDL.Nat64], [TxReceipt], []),
      supply: IDL.Func([TokenIdentifier], [BalanceReturn], ['query']),
      supportedInterfacesDip721: IDL.Func([], [IDL.Vec(InterfaceId)], ['query']),
      symbolDip721: IDL.Func([], [IDL.Text], ['query']),
      totalSupplyDip721: IDL.Func([], [IDL.Nat64], ['query']),
      transfer: IDL.Func([TransferRequest], [TransferResponse], []),
      transferFromDip721: IDL.Func([IDL.Principal, IDL.Principal, IDL.Nat64], [TxReceipt], [])
    })
    return erc721_token
  }
}