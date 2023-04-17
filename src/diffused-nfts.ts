import { Address, dataSource, ipfs, json, log } from '@graphprotocol/graph-ts';
import {
  MintedNft as MintedNftEvent,
  Transfer as TransferEvent,
} from '../generated/DiffusedNfts/DiffusedNfts';
import {
  DIFFUSED_MARKETPLACE_GOERLI,
  DIFFUSED_MARKETPLACE_TEST,
  Network,
} from '../constants';
import { DiffusedNfts } from '../generated/DiffusedNfts/DiffusedNfts';
import { Token } from '../generated/schema';

export function handleMintedNft(event: MintedNftEvent): void {
  let token = new Token(event.params.tokenId.toString());

  const diffusedNfts = DiffusedNfts.bind(event.address);
  const ipfsHash = diffusedNfts.tokenURI(event.params.tokenId);

  const tokenDataBytes = ipfs.cat(ipfsHash);

  if (!tokenDataBytes) return;
  const tokenJson = json.fromBytes(tokenDataBytes).toObject();
  const ipfsName = tokenJson.get('name');
  const ipfsImage = tokenJson.get('image');
  if (!ipfsName || !ipfsImage) return;

  token.name = ipfsName.toString();
  token.image = ipfsImage.toString();
  token.listed = false;
  token.owner = event.params.owner;
  token.save();
}

export function handleTransfer(event: TransferEvent): void {
  const diffusedMarketplaceAddress = retrieveDiffusedMarketplaceAddress(
    dataSource.network()
  );
  let token = Token.load(event.params.tokenId.toString());

  if (
    !token ||
    event.params.to == diffusedMarketplaceAddress ||
    event.transaction.from == diffusedMarketplaceAddress
  ) {
    return;
  }

  token.owner = event.params.to;
  token.save();
}

export function retrieveDiffusedMarketplaceAddress(network: string): Address {
  if (network == Network.GOERLI) {
    return Address.fromString(DIFFUSED_MARKETPLACE_GOERLI);
  } else {
    return Address.fromString(DIFFUSED_MARKETPLACE_TEST);
  }
}
