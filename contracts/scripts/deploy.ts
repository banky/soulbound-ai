import { ethers, upgrades } from "hardhat";

async function main() {
  const SoulboundAIFactory = await ethers.getContractFactory("SoulboundAI");
  const soulboundAI = await upgrades.deployProxy(SoulboundAIFactory, [
    ethers.utils.parseEther("1"),
    30,
  ]);

  const contract = await soulboundAI.deployed();

  console.log(`Deployed SoulboundAI contract to ${contract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
