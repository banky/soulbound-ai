import { ethers, upgrades } from "hardhat";
import { SoulboundAI } from "../typechain-types";

async function main() {
  const [deployoor] = await ethers.getSigners();
  const SoulboundAIFactory = await ethers.getContractFactory("SoulboundAI");

  const deployerBalance = await deployoor.getBalance();
  console.log(
    "deployerBalance (ETH):",
    ethers.utils.formatEther(deployerBalance)
  );

  console.log("Deploying SoulboundAI");
  const soulboundAI = (await upgrades.deployProxy(SoulboundAIFactory, [
    ethers.utils.parseEther("0.02"),
    30,
  ])) as SoulboundAI;

  const contract = await soulboundAI.deployed();
  await contract.updateWhitelist(deployoor.address, true);

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
