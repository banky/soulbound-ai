import { BigNumber, ethers } from "ethers";
import { SoulboundAI, SoulboundAIABI } from "contracts";

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

export const getFee = async (): Promise<string> => {
  const soulboundAI = new ethers.Contract(
    process.env.NEXT_PUBLIC_SOULBOUND_AI_ADDRESS ?? "",
    SoulboundAIABI.abi,
    provider
  ) as SoulboundAI;
  const fee = await soulboundAI.fee();

  return fee.toString();
};

export const addressHasSBT = async (address: string): Promise<boolean> => {
  const soulboundAI = new ethers.Contract(
    process.env.NEXT_PUBLIC_SOULBOUND_AI_ADDRESS ?? "",
    SoulboundAIABI.abi,
    provider
  ) as SoulboundAI;
  const balance = await soulboundAI.balanceOf(address);

  return balance.gt(0);
};

export const tokenIdForAddress = async (
  address: string
): Promise<string | undefined> => {
  const soulboundAI = new ethers.Contract(
    process.env.NEXT_PUBLIC_SOULBOUND_AI_ADDRESS ?? "",
    SoulboundAIABI.abi,
    provider
  ) as SoulboundAI;
  const hasSBT = await addressHasSBT(address);
  if (!hasSBT) {
    return;
  }

  const tokenId = await soulboundAI.tokenOfOwnerByIndex(address, 0);
  return tokenId.toString();
};
