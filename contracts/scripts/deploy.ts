import { ethers, upgrades } from "hardhat";

async function main() {
  const SoulboundAIFactory = await ethers.getContractFactory("SoulboundAI");

  console.log("Deploying SoulboundAI");
  const soulboundAI = await upgrades.deployProxy(SoulboundAIFactory, [
    ethers.utils.parseEther("0.02"),
    30,
  ]);

  const contract = await soulboundAI.deployed();

  console.log(contract.address, " contract(proxy) address");
  console.log(
    await upgrades.erc1967.getImplementationAddress(contract.address),
    " getImplementationAddress"
  );
  console.log(
    await upgrades.erc1967.getAdminAddress(contract.address),
    " getAdminAddress"
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
