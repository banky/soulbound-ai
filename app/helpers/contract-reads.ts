import { SOULBOUND_AI_ADDRESS } from "constants/contract-addresses";
import { ethers } from "ethers";
import { SoulboundAI } from "contracts/typechain-types";
import { abi } from "contracts/artifacts/src/SoulboundAI.sol/SoulboundAI.json";

export const addressHasSBT = async (address: string): Promise<boolean> => {
  const provider = new ethers.providers.JsonRpcProvider();

  const soulboundAI = new ethers.Contract(
    SOULBOUND_AI_ADDRESS,
    abi,
    provider
  ) as SoulboundAI;
  const balance = await soulboundAI.balanceOf(address);

  return balance.gt(0);
};
