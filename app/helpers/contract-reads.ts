import { SOULBOUND_AI_ADDRESS } from "constants/index";
import { BigNumber, ethers } from "ethers";
import { SoulboundAI } from "contracts/typechain-types";
import SoulboundAIABI from "contracts/artifacts/src/SoulboundAI.sol/SoulboundAI.json";

const provider = new ethers.providers.JsonRpcProvider();

export const addressHasSBT = async (address: string): Promise<boolean> => {
  const soulboundAI = new ethers.Contract(
    SOULBOUND_AI_ADDRESS,
    SoulboundAIABI.abi,
    provider
  ) as SoulboundAI;
  const balance = await soulboundAI.balanceOf(address);

  return balance.gt(0);
};

export const getFee = async (): Promise<string> => {
  const soulboundAI = new ethers.Contract(
    SOULBOUND_AI_ADDRESS,
    SoulboundAIABI.abi,
    provider
  ) as SoulboundAI;
  const fee = await soulboundAI.fee();

  return ethers.utils.formatEther(fee);
};
