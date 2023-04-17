import {
  assert,
  describe,
  test,
  clearStore,
  beforeEach,
  afterEach,
  createMockedFunction,
  mockIpfsFile,
} from 'matchstick-as/assembly/index';
import {
  handleMintedNft,
  handleTransfer,
  retrieveDiffusedMarketplaceAddress,
} from '../src/diffused-nfts';
import {
  Address,
  BigInt,
  dataSource,
  ethereum,
  log,
} from '@graphprotocol/graph-ts';
import {
  createMintedNftEvent,
  createTransferEvent,
} from './diffused-nfts-utils';

const tokenId = BigInt.fromI32(1);
const ipfsHash = 'QmSHyHr3kHKza3YRMfNz5HFatotSvLSa17YHJPzXJow1gU';

const mockedDiffusedNftsAddress = '0xa16081f360e3847006db660bae1c6d1b2e17ec2a';
createMockedFunction(
  Address.fromString(mockedDiffusedNftsAddress),
  'tokenURI',
  'tokenURI(uint256):(string)'
)
  .withArgs([ethereum.Value.fromUnsignedBigInt(tokenId)])
  .returns([ethereum.Value.fromString(ipfsHash)]);
mockIpfsFile(ipfsHash, 'tests/ipfs/token.json');

describe('handleMintedNft()', () => {
  beforeEach(() => {
    const ipfsHash = 'QmSHyHr3kHKza3YRMfNz5HFatotSvLSa17YHJPzXJow1gU';
    const owner = Address.fromString(
      '0x0000000000000000000000000000000000000001'
    );
    const newMintedNftEvent = createMintedNftEvent(tokenId, owner);

    handleMintedNft(newMintedNftEvent);
  });

  afterEach(() => {
    clearStore();
  });

  test('Nft created and stored', () => {
    assert.entityCount('Token', 1);

    assert.fieldEquals('Token', '1', 'listed', 'false');
    assert.fieldEquals(
      'Token',
      '1',
      'owner',
      '0x0000000000000000000000000000000000000001'
    );

    clearStore();
  });
});

describe('handleTransfer()', () => {
  beforeEach(() => {
    const owner = Address.fromString(
      '0x0000000000000000000000000000000000000001'
    );

    const newMintedNftEvent = createMintedNftEvent(tokenId, owner);
    handleMintedNft(newMintedNftEvent);
  });

  afterEach(() => {
    clearStore();
  });

  test('Nft owner updated after transfer', () => {
    const tokenId = BigInt.fromI32(1);

    assert.entityCount('Token', 1);

    const newTransferEvent = createTransferEvent(
      Address.fromString('0x0000000000000000000000000000000000000001'),
      Address.fromString('0x0000000000000000000000000000000000000002'),
      tokenId
    );
    handleTransfer(newTransferEvent);

    assert.fieldEquals(
      'Token',
      '1',
      'owner',
      '0x0000000000000000000000000000000000000002'
    );
  });

  test('No changes if transferred to the marketplace', () => {
    const tokenId = BigInt.fromI32(1);

    const newTransferEvent = createTransferEvent(
      Address.fromString('0x0000000000000000000000000000000000000001'),
      retrieveDiffusedMarketplaceAddress(dataSource.network()),
      tokenId
    );

    handleTransfer(newTransferEvent);

    assert.entityCount('Token', 1);
    assert.fieldEquals('Token', '1', 'listed', 'false');
    assert.fieldEquals(
      'Token',
      '1',
      'owner',
      '0x0000000000000000000000000000000000000001'
    );
  });
});
