import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers, upgrades } from "hardhat";
import { expect } from "chai";
import { SoulboundAI } from "../typechain-types";

describe("SoulboundAI", () => {
  const deployContractFixture = async () => {
    const SoulboundAIFactory = await ethers.getContractFactory("SoulboundAI");
    const soulboundAI = (await upgrades.deployProxy(SoulboundAIFactory, [
      ethers.utils.parseEther("0.01"),
      30,
    ])) as SoulboundAI;

    await soulboundAI.updateWhitelistPeriod(false);

    return { soulboundAI };
  };

  it("mints an SBT for a user", async () => {
    const [owner] = await ethers.getSigners();
    const { soulboundAI } = await loadFixture(deployContractFixture);

    const fee = await soulboundAI.fee();
    await soulboundAI.safeMint(owner.address, { value: fee });
    const balance = await soulboundAI.balanceOf(owner.address);
    expect(balance).to.equal(1);
  });

  it("doess not allow minting if user is not whitelisted during whitelist period", async () => {
    const [owner] = await ethers.getSigners();
    const { soulboundAI } = await loadFixture(deployContractFixture);

    const fee = await soulboundAI.fee();
    await soulboundAI.updateWhitelistPeriod(true);
    await expect(
      soulboundAI.safeMint(owner.address, { value: fee })
    ).to.be.revertedWith("User not whitelisted");
  });

  it("withdraws fees as the owner", async () => {
    const [owner, otherUser] = await ethers.getSigners();
    const { soulboundAI } = await loadFixture(deployContractFixture);

    const fee = await soulboundAI.fee();
    await soulboundAI
      .connect(otherUser)
      .safeMint(otherUser.address, { value: fee });

    const initialBalance = await owner.getBalance();
    await soulboundAI.withdrawFees(owner.address);
    const finalBalance = await owner.getBalance();

    expect(finalBalance).to.gt(initialBalance);
  });

  it("withdraw fails if called by non owner", async () => {
    const [owner, otherUser] = await ethers.getSigners();
    const { soulboundAI } = await loadFixture(deployContractFixture);

    const fee = await soulboundAI.fee();
    await soulboundAI
      .connect(otherUser)
      .safeMint(otherUser.address, { value: fee });

    await expect(
      soulboundAI.connect(otherUser).withdrawFees(owner.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("gets the correct token uri for hardhat network", async () => {
    const [owner] = await ethers.getSigners();
    const { soulboundAI } = await loadFixture(deployContractFixture);

    const fee = await soulboundAI.fee();
    await soulboundAI.safeMint(owner.address, { value: fee });
    const tokenUri = await soulboundAI.tokenURI(0);

    expect(tokenUri).to.equal(
      `http://localhost:3000/api/token-metadata/${owner.address.toLowerCase()}`
    );
  });

  it("does not allow transfer", async () => {
    const [owner, otherUser] = await ethers.getSigners();
    const { soulboundAI } = await loadFixture(deployContractFixture);

    const fee = await soulboundAI.fee();
    await soulboundAI.safeMint(owner.address, { value: fee });

    await expect(
      soulboundAI["safeTransferFrom(address,address,uint256)"](
        owner.address,
        otherUser.address,
        0
      )
    ).to.be.revertedWith(
      "This a Soulbound token. It cannot be transferred. It can only be burned by the token owner."
    );
  });

  it("allows the token to be burned", async () => {
    const [owner] = await ethers.getSigners();
    const { soulboundAI } = await loadFixture(deployContractFixture);

    const fee = await soulboundAI.fee();
    await soulboundAI.safeMint(owner.address, { value: fee });
    await soulboundAI.burn();
    const balance = await soulboundAI.balanceOf(owner.address);

    expect(balance).to.equal(0);
  });

  it("reverts if user tries to burn when they don't have a token", async () => {
    const [_, otherUser] = await ethers.getSigners();
    const { soulboundAI } = await loadFixture(deployContractFixture);

    await expect(soulboundAI.connect(otherUser).burn()).to.be.revertedWith(
      "No token to burn"
    );
  });

  it("allows only one mint per user", async () => {
    const [owner] = await ethers.getSigners();
    const { soulboundAI } = await loadFixture(deployContractFixture);

    const fee = await soulboundAI.fee();
    await soulboundAI.safeMint(owner.address, { value: fee });
    await expect(
      soulboundAI.safeMint(owner.address, { value: fee })
    ).to.be.revertedWith("Only one SBT is allowed per user");
  });

  it("allows the owner to update the fee", async () => {
    const { soulboundAI } = await loadFixture(deployContractFixture);

    const updatedFee = ethers.utils.parseEther("0.02");
    await soulboundAI.updateFee(updatedFee);
    const fee = await soulboundAI.fee();

    expect(updatedFee).to.equal(fee);
  });

  it("reverts if a non owner tries to update the fee", async () => {
    const [_, otherUser] = await ethers.getSigners();
    const { soulboundAI } = await loadFixture(deployContractFixture);

    const updatedFee = ethers.utils.parseEther("0.02");
    await expect(
      soulboundAI.connect(otherUser).updateFee(updatedFee)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("allows repeated mint and burn", async () => {
    const [owner] = await ethers.getSigners();
    const { soulboundAI } = await loadFixture(deployContractFixture);

    const fee = await soulboundAI.fee();
    await soulboundAI.safeMint(owner.address, { value: fee });
    let balance = await soulboundAI.balanceOf(owner.address);
    expect(balance).to.equal(1);

    await soulboundAI.burn();
    balance = await soulboundAI.balanceOf(owner.address);
    expect(balance).to.equal(0);

    await soulboundAI.safeMint(owner.address, { value: fee });
    balance = await soulboundAI.balanceOf(owner.address);
    expect(balance).to.equal(1);

    await soulboundAI.burn();
    balance = await soulboundAI.balanceOf(owner.address);
    expect(balance).to.equal(0);
  });

  it("allows minting to a different address", async () => {
    const [_, otherUser] = await ethers.getSigners();
    const { soulboundAI } = await loadFixture(deployContractFixture);

    const fee = await soulboundAI.fee();
    await soulboundAI.safeMint(otherUser.address, { value: fee });

    const balance = await soulboundAI
      .connect(otherUser)
      .balanceOf(otherUser.address);

    expect(balance).to.equal(1);
  });

  it("a referrer receives a cut when a mint is made", async () => {
    const [owner, otherUser] = await ethers.getSigners();
    const { soulboundAI } = await loadFixture(deployContractFixture);

    const fee = await soulboundAI.fee();
    const referralPercentage = 30;
    await soulboundAI.updateReferralPercentage(referralPercentage);

    await soulboundAI.safeMint(owner.address, { value: fee });
    const prevReferrerEthBalance = await owner.getBalance();

    await soulboundAI
      .connect(otherUser)
      .safeMintWithReferral(otherUser.address, owner.address, { value: fee });
    const currentReferrerEthBalance = await owner.getBalance();

    const ownerBalance = await soulboundAI.balanceOf(owner.address);
    const otherUserBalance = await soulboundAI.balanceOf(owner.address);

    expect(ownerBalance).to.equal(1);
    expect(otherUserBalance).to.equal(1);

    const referralFee = fee.mul(referralPercentage).div(100);
    expect(prevReferrerEthBalance.add(referralFee)).to.equal(
      currentReferrerEthBalance
    );
  });

  it("referrer must have an SBT minted", async () => {
    const [owner, otherUser] = await ethers.getSigners();
    const { soulboundAI } = await loadFixture(deployContractFixture);

    const referralPercentage = 30;
    await soulboundAI.updateReferralPercentage(referralPercentage);

    const fee = await soulboundAI.fee();
    await expect(
      soulboundAI
        .connect(otherUser)
        .safeMintWithReferral(otherUser.address, owner.address, { value: fee })
    ).to.be.revertedWith("Must have an SBT to refer others");
  });

  it("only the owner can update the referral fee", async () => {
    const [_, otherUser] = await ethers.getSigners();
    const { soulboundAI } = await loadFixture(deployContractFixture);

    const referralPercentage = 30;
    await expect(
      soulboundAI
        .connect(otherUser)
        .updateReferralPercentage(referralPercentage)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("during whitelist period, canMint is true for whitelisted user", async () => {
    const [_, otherUser] = await ethers.getSigners();

    const { soulboundAI } = await loadFixture(deployContractFixture);
    await soulboundAI.updateWhitelistPeriod(true);
    await soulboundAI.updateWhitelist(otherUser.address, true);

    const canMint = await soulboundAI.canMint(otherUser.address);

    expect(canMint).to.equal(true);
  });

  it("during whitelist period, canMint is false for non-whitelisted user", async () => {
    const [_, otherUser] = await ethers.getSigners();

    const { soulboundAI } = await loadFixture(deployContractFixture);
    await soulboundAI.updateWhitelistPeriod(true);

    const canMint = await soulboundAI.canMint(otherUser.address);

    expect(canMint).to.equal(false);
  });
});
