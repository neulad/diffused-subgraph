import { newMockEvent } from 'matchstick-as';
import { ethereum, BigInt, Address } from '@graphprotocol/graph-ts';
import {
  ListingBid,
  ListingClosed,
  OwnershipTransferred,
  TokenListed,
} from '../generated/DiffusedMarketplace/DiffusedMarketplace';

export function createListingBidEvent(
  tokenId: BigInt,
  listedAt: BigInt,
  bidder: Address,
  amount: BigInt,
  bidAt: BigInt
): ListingBid {
  let listingBidEvent = changetype<ListingBid>(newMockEvent());

  listingBidEvent.parameters = new Array();

  listingBidEvent.parameters.push(
    new ethereum.EventParam(
      'tokenId',
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  );
  listingBidEvent.parameters.push(
    new ethereum.EventParam(
      'listedAt',
      ethereum.Value.fromUnsignedBigInt(listedAt)
    )
  );
  listingBidEvent.parameters.push(
    new ethereum.EventParam('bidder', ethereum.Value.fromAddress(bidder))
  );
  listingBidEvent.parameters.push(
    new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount))
  );
  listingBidEvent.parameters.push(
    new ethereum.EventParam('bidAt', ethereum.Value.fromUnsignedBigInt(bidAt))
  );

  return listingBidEvent;
}

export function createListingClosedEvent(
  tokenId: BigInt,
  listedAt: BigInt,
  lastBid: ethereum.Tuple
): ListingClosed {
  let listingClosedEvent = changetype<ListingClosed>(newMockEvent());

  listingClosedEvent.parameters = new Array();

  listingClosedEvent.parameters.push(
    new ethereum.EventParam(
      'tokenId',
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  );
  listingClosedEvent.parameters.push(
    new ethereum.EventParam(
      'listedAt',
      ethereum.Value.fromUnsignedBigInt(listedAt)
    )
  );

  listingClosedEvent.parameters.push(
    new ethereum.EventParam('lastBid', ethereum.Value.fromTuple(lastBid))
  );

  return listingClosedEvent;
}

export function createTokenListedEvent(
  tokenId: BigInt,
  seller: Address,
  minimumBidIncrement: BigInt,
  endDate: BigInt,
  listedAt: BigInt,
  lastBid: ethereum.Tuple
): TokenListed {
  let tokenListedEvent = changetype<TokenListed>(newMockEvent());

  tokenListedEvent.parameters = new Array();

  tokenListedEvent.parameters.push(
    new ethereum.EventParam(
      'tokenId',
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  );
  tokenListedEvent.parameters.push(
    new ethereum.EventParam('seller', ethereum.Value.fromAddress(seller))
  );
  tokenListedEvent.parameters.push(
    new ethereum.EventParam(
      'minimumBidIncrement',
      ethereum.Value.fromUnsignedBigInt(minimumBidIncrement)
    )
  );
  tokenListedEvent.parameters.push(
    new ethereum.EventParam(
      'endDate',
      ethereum.Value.fromUnsignedBigInt(endDate)
    )
  );
  tokenListedEvent.parameters.push(
    new ethereum.EventParam(
      'listedAt',
      ethereum.Value.fromUnsignedBigInt(listedAt)
    )
  );
  tokenListedEvent.parameters.push(
    new ethereum.EventParam('lastBid', ethereum.Value.fromTuple(lastBid))
  );

  return tokenListedEvent;
}
