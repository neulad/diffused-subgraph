import {
  assert,
  describe,
  test,
  clearStore,
  beforeEach,
  afterEach,
} from 'matchstick-as/assembly/index';
import { BigInt, Address, ethereum, log } from '@graphprotocol/graph-ts';
import {
  handleListingBid,
  handleListingClosed,
  handleTokenListed,
} from '../src/diffused-marketplace';
import {
  createListingBidEvent,
  createListingClosedEvent,
  createTokenListedEvent,
} from './diffused-marketplace-utils';
import { Bid, Listing } from '../generated/schema';

describe('handleTokenListed()', () => {
  beforeEach(() => {
    const tokenId = BigInt.fromI32(1);
    const seller = Address.fromString(
      '0x0000000000000000000000000000000000000001'
    );
    const minimumBidIncrement = BigInt.fromI32(2);
    const endDate = BigInt.fromI32(16);
    const listedAt = BigInt.fromI32(1);

    const amount = BigInt.fromString('1000000000000');
    const bidAt = BigInt.fromI32(1);

    const tupleArray: Array<ethereum.Value> = [
      ethereum.Value.fromAddress(
        Address.fromString('0x0000000000000000000000000000000000000000')
      ),
      ethereum.Value.fromUnsignedBigInt(amount),
      ethereum.Value.fromUnsignedBigInt(bidAt),
    ];
    const tuple = changetype<ethereum.Tuple>(tupleArray);

    const newTokenListedEvent = createTokenListedEvent(
      tokenId,
      seller,
      minimumBidIncrement,
      endDate,
      listedAt,
      tuple
    );

    handleTokenListed(newTokenListedEvent);
  });

  afterEach(() => {
    clearStore();
  });

  test('Lists the token', () => {
    assert.entityCount('Listing', 1);
    assert.fieldEquals(
      'Listing',
      '1-1',
      'seller',
      '0x0000000000000000000000000000000000000001'
    );

    // Check that array of bids is created
    const listing = Listing.load('1-1');
    if (!listing) throw new Error('Listing is not found!');

    const actualBids = ethereum.Value.fromStringArray(listing.bids.sort());
    const expectedBids = ethereum.Value.fromStringArray(['1-1-0']);
    assert.equals(expectedBids, actualBids);

    // Test bid entities
    assert.entityCount('Bid', 1);
    assert.fieldEquals('Bid', '1-1-0', 'status', 'Active');
    assert.fieldEquals('Bid', '1-1-0', 'listing', '1-1');
    assert.fieldEquals(
      'Bid',
      '1-1-0',
      'bidder',
      '0x0000000000000000000000000000000000000000'
    );
    assert.fieldEquals(
      'Bid',
      '1-1-0',
      'bidder',
      '0x0000000000000000000000000000000000000000'
    );
    assert.fieldEquals('Bid', '1-1-0', 'amount', '1000000000000');
    assert.fieldEquals('Bid', '1-1-0', 'bidAt', '1');

    assert.fieldEquals('Listing', '1-1', 'status', 'Open');
    assert.fieldEquals('Listing', '1-1', 'tokenId', '1');
    assert.fieldEquals('Listing', '1-1', 'minimumBidIncrement', '2');
    assert.fieldEquals('Listing', '1-1', 'endDate', '16');
    assert.fieldEquals('Listing', '1-1', 'listedAt', '1');
  });

  test('Updates token status to updated', () => {});
});

describe('handleListingBid()', () => {
  beforeEach(() => {
    const tokenId = BigInt.fromI32(1);
    const seller = Address.fromString(
      '0x0000000000000000000000000000000000000001'
    );
    const minimumBidIncrement = BigInt.fromI32(2);
    const endDate = BigInt.fromI32(16);
    const listedAt = BigInt.fromI32(1);

    const amount = BigInt.fromString('1000000000000');
    const blockNumber = BigInt.fromI32(1);

    const tupleArray: Array<ethereum.Value> = [
      ethereum.Value.fromAddress(
        Address.fromString('0x0000000000000000000000000000000000000000')
      ),
      ethereum.Value.fromUnsignedBigInt(amount),
      ethereum.Value.fromUnsignedBigInt(blockNumber),
    ];
    const tuple = changetype<ethereum.Tuple>(tupleArray);

    const newTokenListedEvent = createTokenListedEvent(
      tokenId,
      seller,
      minimumBidIncrement,
      endDate,
      listedAt,
      tuple
    );

    handleTokenListed(newTokenListedEvent);
  });

  afterEach(() => {
    clearStore();
  });

  test('Updates listing bids', () => {
    const tokenId = BigInt.fromI32(1);
    const bidder = Address.fromString(
      '0x0000000000000000000000000000000000000002'
    );
    const bidAt = BigInt.fromI32(2);

    const newListingBidEvent = createListingBidEvent(
      tokenId,
      BigInt.fromI32(1),
      bidder,
      BigInt.fromString('1020000000000'),
      bidAt
    );

    handleListingBid(newListingBidEvent);

    assert.entityCount('Listing', 1);

    const listing = Listing.load('1-1');
    if (!listing) throw new Error('Listing not found!');

    const actualBids = ethereum.Value.fromStringArray(listing.bids.sort());
    const expectedBids = ethereum.Value.fromStringArray(['1-1-0', '1-1-1']);
    assert.equals(expectedBids, actualBids);

    assert.fieldEquals('Bid', '1-1-0', 'status', 'Inactive');
    assert.fieldEquals('Bid', '1-1-0', 'listing', '1-1');
    assert.fieldEquals(
      'Bid',
      '1-1-0',
      'bidder',
      '0x0000000000000000000000000000000000000000'
    );
    assert.fieldEquals('Bid', '1-1-0', 'amount', '1000000000000');
    assert.fieldEquals('Bid', '1-1-0', 'bidAt', '1');

    assert.fieldEquals('Bid', '1-1-1', 'status', 'Active');
    assert.fieldEquals('Bid', '1-1-1', 'listing', '1-1');
    assert.fieldEquals(
      'Bid',
      '1-1-1',
      'bidder',
      '0x0000000000000000000000000000000000000002'
    );
    assert.fieldEquals('Bid', '1-1-1', 'amount', '1020000000000');
    assert.fieldEquals('Bid', '1-1-1', 'bidAt', '2');
  });
});

describe('handleListingClosed()', () => {
  beforeEach(() => {
    const tokenId = BigInt.fromI32(1);
    const seller = Address.fromString(
      '0x0000000000000000000000000000000000000001'
    );

    const minimumBidIncrement = BigInt.fromI32(2);
    const endDate = BigInt.fromI32(16);
    const listedAt = BigInt.fromI32(1);

    const amount = BigInt.fromString('1000000000000');
    const blockNumber = BigInt.fromI32(1);

    const tupleArray: Array<ethereum.Value> = [
      ethereum.Value.fromAddress(
        Address.fromString('0x0000000000000000000000000000000000000000')
      ),
      ethereum.Value.fromUnsignedBigInt(amount),
      ethereum.Value.fromUnsignedBigInt(blockNumber),
    ];
    const tuple = changetype<ethereum.Tuple>(tupleArray);

    const newTokenListedEvent = createTokenListedEvent(
      tokenId,
      seller,
      minimumBidIncrement,
      endDate,
      listedAt,
      tuple
    );

    handleTokenListed(newTokenListedEvent);
  });

  afterEach(() => {
    clearStore();
  });

  test('Updates token owner, status and removes listing', () => {
    const tokenId = BigInt.fromI32(1);
    const bidder = Address.fromString(
      '0x0000000000000000000000000000000000000002'
    );
    const amount = BigInt.fromString('1020000000000');
    const bidAt = BigInt.fromI32(1);
    const tupleArray: Array<ethereum.Value> = [
      ethereum.Value.fromAddress(bidder),
      ethereum.Value.fromSignedBigInt(amount),
      ethereum.Value.fromSignedBigInt(bidAt),
    ];
    const tuple = changetype<ethereum.Tuple>(tupleArray);
    const newListingBidEvent = createListingBidEvent(
      tokenId,
      BigInt.fromI32(1),
      bidder,
      BigInt.fromString('1020000000000'),
      bidAt
    );

    handleListingBid(newListingBidEvent);

    const newListingClosedEvent = createListingClosedEvent(
      tokenId,
      BigInt.fromI32(1),
      tuple
    );
    handleListingClosed(newListingClosedEvent);
    assert.entityCount('Listing', 1);
    assert.fieldEquals('Listing', '1-1', 'status', 'Closed');
    assert.fieldEquals('Listing', '1-1', 'tokenId', '1');
    assert.fieldEquals(
      'Listing',
      '1-1',
      'seller',
      '0x0000000000000000000000000000000000000001'
    );
    assert.fieldEquals('Listing', '1-1', 'minimumBidIncrement', '2');
    assert.fieldEquals('Listing', '1-1', 'endDate', '16');
    assert.fieldEquals('Listing', '1-1', 'listedAt', '1');

    assert.fieldEquals(
      'Token',
      '1',
      'owner',
      '0x0000000000000000000000000000000000000002'
    );
    assert.fieldEquals('Token', '1', 'listed', 'false');

    assert.fieldEquals('Bid', '1-1-0', 'status', 'Failed');
    assert.fieldEquals('Bid', '1-1-1', 'status', 'Win');
  });

  test("Doesn't update token owner without bids", () => {
    const tokenId = BigInt.fromI32(1);
    const tupleArray: Array<ethereum.Value> = [
      ethereum.Value.fromAddress(
        Address.fromString('0x0000000000000000000000000000000000000000')
      ),
      ethereum.Value.fromSignedBigInt(BigInt.fromString('1000000000000')),
      ethereum.Value.fromSignedBigInt(BigInt.fromString('1')),
    ];
    const tuple = changetype<ethereum.Tuple>(tupleArray);

    const newListingClosedEvent = createListingClosedEvent(
      tokenId,
      BigInt.fromI32(1),
      tuple
    );
    handleListingClosed(newListingClosedEvent);

    assert.entityCount('Listing', 1);
    assert.fieldEquals('Listing', '1-1', 'status', 'Failed');
    assert.fieldEquals('Listing', '1-1', 'tokenId', '1');
    assert.fieldEquals(
      'Listing',
      '1-1',
      'seller',
      '0x0000000000000000000000000000000000000001'
    );
    assert.fieldEquals('Listing', '1-1', 'minimumBidIncrement', '2');
    assert.fieldEquals('Listing', '1-1', 'endDate', '16');
    assert.fieldEquals('Listing', '1-1', 'listedAt', '1');

    assert.fieldEquals(
      'Token',
      '1',
      'owner',
      '0x0000000000000000000000000000000000000001'
    );
    assert.fieldEquals('Token', '1', 'listed', 'false');

    assert.entityCount('Bid', 1);
    assert.fieldEquals('Bid', '1-1-0', 'status', 'Win');
  });
});
