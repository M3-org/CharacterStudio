export default ({ IDL }) => {
  const SubAccount__1 = IDL.Vec(IDL.Nat8);
  const TokenIndex = IDL.Nat32;
  const AccountIdentifier__1 = IDL.Text;
  const Settlement = IDL.Record({
    'subaccount' : SubAccount__1,
    'seller' : IDL.Principal,
    'buyer' : AccountIdentifier__1,
    'price' : IDL.Nat64,
  });
  const Metadata = IDL.Variant({
    'fungible' : IDL.Record({
      'decimals' : IDL.Nat8,
      'metadata' : IDL.Opt(IDL.Vec(IDL.Nat8)),
      'name' : IDL.Text,
      'symbol' : IDL.Text,
    }),
    'nonfungible' : IDL.Record({ 'metadata' : IDL.Opt(IDL.Vec(IDL.Nat8)) }),
  });
  const TokenIdentifier = IDL.Text;
  const AccountIdentifier = IDL.Text;
  const User = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : AccountIdentifier,
  });
  const BalanceRequest = IDL.Record({
    'token' : TokenIdentifier,
    'user' : User,
  });
  const Balance = IDL.Nat;
  const CommonError__1 = IDL.Variant({
    'InvalidToken' : TokenIdentifier,
    'Other' : IDL.Text,
  });
  const BalanceResponse = IDL.Variant({
    'ok' : Balance,
    'err' : CommonError__1,
  });
  const TokenIdentifier__1 = IDL.Text;
  const CommonError = IDL.Variant({
    'InvalidToken' : TokenIdentifier,
    'Other' : IDL.Text,
  });
  const Result_7 = IDL.Variant({
    'ok' : AccountIdentifier__1,
    'err' : CommonError,
  });
  const Time = IDL.Int;
  const Listing = IDL.Record({
    'locked' : IDL.Opt(Time),
    'seller' : IDL.Principal,
    'price' : IDL.Nat64,
  });
  const Result_10 = IDL.Variant({
    'ok' : IDL.Tuple(AccountIdentifier__1, IDL.Opt(Listing)),
    'err' : CommonError,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const Extension = IDL.Text;
  const Result_9 = IDL.Variant({ 'ok' : Metadata, 'err' : IDL.Text });
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const HttpRequest = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
  });
  const HttpResponse = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
    'status_code' : IDL.Nat16,
  });
  const SubAccount_3 = IDL.Vec(IDL.Nat8);
  const SaleTransaction = IDL.Record({
    'time' : Time,
    'seller' : IDL.Principal,
    'tokens' : IDL.Vec(TokenIndex),
    'buyer' : AccountIdentifier__1,
    'price' : IDL.Nat64,
  });
  const Result_8 = IDL.Variant({ 'ok' : TokenIndex, 'err' : CommonError });
  const ListRequest = IDL.Record({
    'token' : TokenIdentifier__1,
    'from_subaccount' : IDL.Opt(SubAccount__1),
    'price' : IDL.Opt(IDL.Nat64),
  });
  const Result_4 = IDL.Variant({ 'ok' : IDL.Null, 'err' : CommonError });
  const Result_6 = IDL.Variant({ 'ok' : Metadata, 'err' : CommonError });
  const MintRequest = IDL.Record({
    'to' : User,
    'metadata' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const Result_5 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const Sale = IDL.Record({
    'expires' : Time,
    'subaccount' : SubAccount__1,
    'tokens' : IDL.Vec(TokenIndex),
    'buyer' : AccountIdentifier__1,
    'price' : IDL.Nat64,
  });
  const Balance__1 = IDL.Nat;
  const Result_3 = IDL.Variant({ 'ok' : Balance__1, 'err' : CommonError });
  const Result_2 = IDL.Variant({
    'ok' : IDL.Vec(TokenIndex),
    'err' : CommonError,
  });
  const Result_1 = IDL.Variant({
    'ok' : IDL.Vec(
      IDL.Tuple(TokenIndex, IDL.Opt(Listing), IDL.Opt(IDL.Vec(IDL.Nat8)))
    ),
    'err' : CommonError,
  });
  const Transaction = IDL.Record({
    'token' : TokenIdentifier__1,
    'time' : Time,
    'seller' : IDL.Principal,
    'buyer' : AccountIdentifier__1,
    'price' : IDL.Nat64,
  });
  const Memo = IDL.Vec(IDL.Nat8);
  const SubAccount = IDL.Vec(IDL.Nat8);
  const TransferRequest = IDL.Record({
    'to' : User,
    'token' : TokenIdentifier,
    'notify' : IDL.Bool,
    'from' : User,
    'memo' : Memo,
    'subaccount' : IDL.Opt(SubAccount),
    'amount' : Balance,
  });
  const TransferResponse = IDL.Variant({
    'ok' : Balance,
    'err' : IDL.Variant({
      'CannotNotify' : AccountIdentifier,
      'InsufficientBalance' : IDL.Null,
      'InvalidToken' : TokenIdentifier,
      'Rejected' : IDL.Null,
      'Unauthorized' : AccountIdentifier,
      'Other' : IDL.Text,
    }),
  });
  return IDL.Service({
    'acceptCycles' : IDL.Func([], [], []),
    'adminKillHeartbeat' : IDL.Func([], [], []),
    'adminStartHeartbeat' : IDL.Func([], [], []),
    'allPayments' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Vec(SubAccount__1)))],
        ['query'],
      ),
    'allSettlements' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(TokenIndex, Settlement))],
        ['query'],
      ),
    'availableCycles' : IDL.Func([], [IDL.Nat], ['query']),
    'backup' : IDL.Func(
        [],
        [
          IDL.Vec(IDL.Tuple(TokenIndex, AccountIdentifier__1)),
          IDL.Vec(IDL.Tuple(AccountIdentifier__1, IDL.Vec(TokenIndex))),
          IDL.Vec(IDL.Tuple(TokenIndex, Metadata)),
          IDL.Vec(IDL.Tuple(TokenIndex, IDL.Vec(TokenIndex))),
        ],
        ['query'],
      ),
    'balance' : IDL.Func([BalanceRequest], [BalanceResponse], ['query']),
    'bearer' : IDL.Func([TokenIdentifier__1], [Result_7], ['query']),
    'clearPayments' : IDL.Func([IDL.Principal, IDL.Vec(SubAccount__1)], [], []),
    'cronCapEvents' : IDL.Func([], [], []),
    'cronDisbursements' : IDL.Func([], [], []),
    'cronSettlements' : IDL.Func([], [], []),
    'details' : IDL.Func([TokenIdentifier__1], [Result_10], ['query']),
    'encodeToken' : IDL.Func([TokenIndex], [IDL.Text], ['query']),
    'equip' : IDL.Func([TokenIndex, TokenIndex], [Result], []),
    'extensions' : IDL.Func([], [IDL.Vec(Extension)], ['query']),
    'failedSales' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(AccountIdentifier__1, SubAccount__1))],
        ['query'],
      ),
    'getAllPayments' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Vec(SubAccount__1)))],
        ['query'],
      ),
    'getBuyers' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(AccountIdentifier__1, IDL.Vec(TokenIndex)))],
        ['query'],
      ),
    'getLayerIdxFromWearableToken' : IDL.Func(
        [TokenIndex],
        [IDL.Nat],
        ['query'],
      ),
    'getLayerIdxFromWearableTokenArray' : IDL.Func(
        [IDL.Vec(TokenIndex)],
        [IDL.Vec(IDL.Nat)],
        ['query'],
      ),
    'getLayerSVGFromWearableTokenId' : IDL.Func(
        [TokenIndex],
        [IDL.Text],
        ['query'],
      ),
    'getMergedSVG' : IDL.Func([TokenIndex], [IDL.Text], ['query']),
    'getMergedSVGForSingleLayer' : IDL.Func(
        [IDL.Nat, TokenIndex],
        [IDL.Text],
        ['query'],
      ),
    'getMinted' : IDL.Func([], [TokenIndex], ['query']),
    'getMinter' : IDL.Func([], [IDL.Principal], ['query']),
    'getPrincipalFromActor' : IDL.Func(
        [TokenIndex],
        [IDL.Principal],
        ['query'],
      ),
    'getRegistry' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(TokenIndex, AccountIdentifier__1))],
        ['query'],
      ),
    'getSold' : IDL.Func([], [TokenIndex], ['query']),
    'getTokens' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(TokenIndex, Metadata))],
        ['query'],
      ),
    'getWearableArrayMetadata' : IDL.Func(
        [IDL.Vec(TokenIndex)],
        [IDL.Vec(Result_9)],
        ['query'],
      ),
    'getWearableMetadata' : IDL.Func([TokenIndex], [Result_9], ['query']),
    'historicExport' : IDL.Func([], [IDL.Bool], []),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'importOriginalRegistry' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Vec(SubAccount_3)))],
        [],
      ),
    'importSalesTransactions' : IDL.Func([], [IDL.Vec(SaleTransaction)], []),
    'importWearablesMetadata' : IDL.Func([], [Result], []),
    'index' : IDL.Func([TokenIdentifier__1], [Result_8], ['query']),
    'initCap' : IDL.Func([], [], []),
    'isHeartbeatRunning' : IDL.Func([], [IDL.Bool], ['query']),
    'list' : IDL.Func([ListRequest], [Result_4], []),
    'listings' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(TokenIndex, Listing, Metadata))],
        ['query'],
      ),
    'lock' : IDL.Func(
        [TokenIdentifier__1, IDL.Nat64, AccountIdentifier__1, SubAccount__1],
        [Result_7],
        [],
      ),
    'lostDogs' : IDL.Func([], [IDL.Vec(TokenIndex)], ['query']),
    'metadata' : IDL.Func([TokenIdentifier__1], [Result_6], ['query']),
    'mintNFT' : IDL.Func([MintRequest], [TokenIndex], []),
    'payments' : IDL.Func([], [IDL.Opt(IDL.Vec(SubAccount__1))], ['query']),
    'ping' : IDL.Func([], [IDL.Text], []),
    'refunds' : IDL.Func([], [IDL.Opt(IDL.Vec(SubAccount__1))], ['query']),
    'removePayments' : IDL.Func([IDL.Vec(SubAccount__1)], [], []),
    'removeRefunds' : IDL.Func([IDL.Vec(SubAccount__1)], [], []),
    'retreive' : IDL.Func([AccountIdentifier__1], [Result_5], []),
    'saleTransactions' : IDL.Func([], [IDL.Vec(SaleTransaction)], ['query']),
    'salesSettlements' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(AccountIdentifier__1, Sale))],
        ['query'],
      ),
    'salesStats' : IDL.Func(
        [],
        [
          IDL.Bool,
          IDL.Nat32,
          IDL.Nat32,
          IDL.Nat,
          IDL.Tuple(IDL.Nat64, TokenIndex),
        ],
        ['query'],
      ),
    'setMinter' : IDL.Func([IDL.Principal], [], []),
    'settle' : IDL.Func([TokenIdentifier__1], [Result_4], []),
    'settlements' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(TokenIndex, AccountIdentifier__1, IDL.Nat64))],
        ['query'],
      ),
    'stats' : IDL.Func(
        [],
        [IDL.Nat64, IDL.Nat64, IDL.Nat64, IDL.Nat64, IDL.Nat, IDL.Nat, IDL.Nat],
        ['query'],
      ),
    'supply' : IDL.Func([TokenIdentifier__1], [Result_3], ['query']),
    'tokens' : IDL.Func([AccountIdentifier__1], [Result_2], ['query']),
    'tokens_ext' : IDL.Func([AccountIdentifier__1], [Result_1], ['query']),
    'transactions' : IDL.Func([], [IDL.Vec(Transaction)], ['query']),
    'transfer' : IDL.Func([TransferRequest], [TransferResponse], []),
    'unequip' : IDL.Func([TokenIndex, TokenIndex], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };