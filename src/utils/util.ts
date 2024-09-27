import {
  Aptos,
  AptosConfig,
  Network,
  Account,
  Ed25519PrivateKey,
} from "@aptos-labs/ts-sdk";

// Setup the client
const config = new AptosConfig({ network: Network.DEVNET });
export const aptosClient = new Aptos(config);

export const fundAccount = async (account: string, amount: number) => {
  const response = await aptosClient.fundAccount({
    accountAddress: account,
    amount: amount,
  });

  console.log("response: ", response);
};

export const formatBalance = (balance: string) => {
  return Number(balance) / 100000000;
};

export const formatAddress = (address: string) => {
  return address.slice(0, 14) + "..." + address.slice(-4);
};

export const getAccountInfo = async (account: string) => {
  type Coin = { coin: { value: string } };

  const resource = await aptosClient.getAccountResource<Coin>({
    accountAddress: account,
    resourceType: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
  });

  return formatBalance(resource.coin.value);
};

export const getAccountFromPrivateKey = async (privateKey: string) => {
  const prKey = new Ed25519PrivateKey(privateKey);
  const account = Account.fromPrivateKey({ privateKey: prKey });
  return account;
};
