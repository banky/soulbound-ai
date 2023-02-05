# Soulbound AI

Mint a unique photorealistic Soulbound NFT using dreambooth. Users can mint an NFT which gives access to training a dreambooth model and then generate any number of images at no extra cost.  This project has been deployed at [soulbound-ai.com](https://soulbound-ai.com) and the main contract is deployed on mainnet at [0x70e1834c72276cd4cc89a88c81efe81a1ca53004](https://etherscan.io/address/0x70e1834c72276cd4cc89a88c81efe81a1ca53004)

# Getting started
## Smart contracts

```sh
cd contracts/
yarn install
yarn test
```

## Application

```sh
cd app/
yarn install
yarn test
yarn dev
```

# Project overview

## Smart contracts
The main smart contract is an upgradeable, ownable ERC721 contract based on the OpenZeppelin implementation. There are some extensions for whitelisting users, and allowing users to mint with a referral. Referrals distribute some of the mint fee to the referrer

## Application
The app is built using Nextjs, Prisma, Supabase and Rainbowkit. The dreambooth training and image generation is handled by [neural.love](https://neural.love). 
