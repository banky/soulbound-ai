import { ethers } from "hardhat";

async function main() {
  const SoulboundAI = await ethers.getContractFactory("SoulboundAI");
  const soulboundAI = await SoulboundAI.deploy();

  const contract = await soulboundAI.deployed();

  console.log(`Deployed SoulboundAI contract to ${contract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
