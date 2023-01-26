import { ethers } from "ethers";
import { SoulboundAI, SoulboundAIABI } from "contracts";

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

export const addressHasSBT = async (address: string): Promise<boolean> => {
  const soulboundAI = new ethers.Contract(
    process.env.NEXT_PUBLIC_SOULBOUND_AI_ADDRESS ?? "",
    SoulboundAIABI.abi,
    provider
  ) as SoulboundAI;
  const balance = await soulboundAI.balanceOf(address);

  return balance.gt(0);
};
