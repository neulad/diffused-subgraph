import { Address, log, store } from '@graphprotocol/graph-ts';
import {
  ListingBid,
  ListingClosed,
  TokenListed,
} from '../generated/DiffusedMarketplace/DiffusedMarketplace';
import { Listing, Token, Bid } from '../generated/schema';
import { BigInt } from '@graphprotocol/graph-ts';

export function handleListingBid(event: ListingBid): void {
  const listing = Listing.load(
    event.params.tokenId.toString() + '-' + event.params.listedAt.toString()
  );

  if (!listing) {
    return;
  }

  // Get the
  const bids = listing.bids;
  const prevId = bids[bids.length - 1];
  const prevIndex = prevId.split('-')[2];
  const bidId =
    event.params.tokenId.toString() +
    '-' +
    listing.listedAt.toString() +
    '-' +
    BigInt.fromString(prevIndex)
      .plus(BigInt.fromI32(1))
      .toString();

  const bid = new Bid(bidId);
  bid.status = 'Active';
  bid.listing = listing.id;
  bid.bidder = event.params.bidder;
  bid.amount = event.params.amount;
  bid.bidAt = event.params.bidAt;

  bids.push(bid.id);
  listing.bids = bids;

  for (let i = 0; i < bids.length; i++) {
    const bid = Bid.load(listing.bids[i]);
    if (!bid) continue;

    bid.status = 'Inactive';
    bid.save();
  }

  bid.save();
  listing.save();
}

export function handleListingClosed(event: ListingClosed): void {
  const token = Token.load(event.params.tokenId.toString());
  const listing = Listing.load(
    event.params.tokenId.toString() + '-' + event.params.listedAt.toString()
  );
  if (!token || !listing) {
    return;
  }

  const bids = listing.bids;
  if (
    event.params.lastBid.bidder !=
    Address.fromString('0x0000000000000000000000000000000000000000')
  ) {
    token.owner = event.params.lastBid.bidder;
  }
  for (let i = 0; i < bids.length; i++) {
    const bid = Bid.load(bids[i]);
    if (!bid) continue;
    bid.status = 'Failed';
    if (i == bids.length - 1) {
      bid.status = 'Win';
    }
    bid.save();
  }

  listing.status = 'Closed';
  if (bids.length == 1) listing.status = 'Failed';
  listing.save();

  token.listed = false;
  token.save();
}

export function handleTokenListed(event: TokenListed): void {
  const listing = new Listing(
    event.params.tokenId.toString() + '-' + event.params.listedAt.toString()
  );
  const bid = new Bid(
    event.params.tokenId.toString() +
      '-' +
      event.params.listedAt.toString() +
      '-' +
      '0' // It is and id of the bid on each listing
  );

  // Save bid
  bid.status = 'Active';
  bid.listing =
    event.params.tokenId.toString() + '-' + event.params.listedAt.toString();
  bid.bidder = event.params.lastBid.bidder;
  bid.amount = event.params.lastBid.amount;
  bid.bidAt = event.params.lastBid.bidAt;
  bid.save();

  // Save listing
  listing.status = 'Open';
  listing.tokenId = event.params.tokenId;
  listing.seller = event.params.seller;
  listing.bids = [bid.id];
  listing.minimumBidIncrement = event.params.minimumBidIncrement;
  listing.endDate = event.params.endDate;
  listing.listedAt = event.params.listedAt;
  listing.save();

  // Update token
  let token = Token.load(event.params.tokenId.toString());

  if (!token) {
    token = new Token(event.params.tokenId.toString());
    token.owner = event.params.seller;
  }
  token.listed = true;
  token.save();
}
