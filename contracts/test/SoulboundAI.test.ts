import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers, upgrades } from "hardhat";
import { expect } from "chai";
import { SoulboundAI } from "../typechain-types";

describe("SoulboundAI", () => {
  const deployContractFixture = async () => {
    const SoulboundAIFactory = await ethers.getContractFactory("SoulboundAI");
    const soulboundAI = (await upgrades.deployProxy(SoulboundAIFactory, [
      ethers.utils.parseEther("0.01"),
    ])) as SoulboundAI;

    return { soulboundAI };
  };

  it("mints an SBT for a user", async () => {
    const [owner] = await ethers.getSigners();
    const { soulboundAI } = await loadFixture(deployContractFixture);

    const fee = await soulboundAI.getFee(owner.address);
    await soulboundAI.safeMint(owner.address, { value: fee });
    const balance = await soulboundAI.balanceOf(owner.address);
    expect(balance).to.equal(1);
  });

  it("withdraws fees as the owner", async () => {
    const [owner, otherUser] = await ethers.getSigners();
    const { soulboundAI } = await loadFixture(deployContractFixture);

    const fee = await soulboundAI.getFee(owner.address);
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

    const fee = await soulboundAI.getFee(owner.address);
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

    const fee = await soulboundAI.getFee(owner.address);
    await soulboundAI.safeMint(owner.address, { value: fee });
    const tokenUri = await soulboundAI.tokenURI(0);

    expect(tokenUri).to.equal(
      `http://localhost:3000/api/token-metadata/${owner.address.toLowerCase()}`
    );
  });

  it("does not allow transfer", async () => {
    const [owner, otherUser] = await ethers.getSigners();
    const { soulboundAI } = await loadFixture(deployContractFixture);

    const fee = await soulboundAI.getFee(owner.address);
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

    const fee = await soulboundAI.getFee(owner.address);
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

    const fee = await soulboundAI.getFee(owner.address);
    await soulboundAI.safeMint(owner.address, { value: fee });
    await expect(
      soulboundAI.safeMint(owner.address, { value: fee })
    ).to.be.revertedWith("Only one SBT is allowed per user");
  });

  it("allows the owner to update the fee", async () => {
    const [owner] = await ethers.getSigners();
    const { soulboundAI } = await loadFixture(deployContractFixture);

    const updatedFee = ethers.utils.parseEther("0.02");
    await soulboundAI.updateFee(updatedFee);
    const fee = await soulboundAI.getFee(owner.address);

    expect(updatedFee).to.equal(fee);
  });

  it("gets the right fee for a whitelisted and non whitelisted user", async () => {
    const [whitelisted, notWhitelisted] = await ethers.getSigners();
    const { soulboundAI } = await loadFixture(deployContractFixture);

    await soulboundAI.updateWhitelist(whitelisted.address, true);
    const whitelistedFee = await soulboundAI.getFee(whitelisted.address);
    expect(whitelistedFee).to.equal(0);

    const notWhitelistedFee = await soulboundAI.getFee(notWhitelisted.address);
    expect(notWhitelistedFee).to.equal(ethers.utils.parseEther("0.01"));
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

    const fee = await soulboundAI.getFee(owner.address);
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

  it("fee for whitelisted user should be 0", async () => {
    const [_, whitelistedUser] = await ethers.getSigners();
    const { soulboundAI } = await loadFixture(deployContractFixture);

    await soulboundAI.updateWhitelist(whitelistedUser.address, true);
    const feeForUser = await soulboundAI.getFee(whitelistedUser.address);

    expect(feeForUser).to.equal(0);
  });

  it("allows whitelisted user to mint for free", async () => {
    const [_, whitelistedUser] = await ethers.getSigners();
    const { soulboundAI } = await loadFixture(deployContractFixture);

    await soulboundAI.updateWhitelist(whitelistedUser.address, true);

    await soulboundAI
      .connect(whitelistedUser)
      .safeMint(whitelistedUser.address);
    const balance = await soulboundAI
      .connect(whitelistedUser)
      .balanceOf(whitelistedUser.address);

    expect(balance).to.equal(1);
  });

  it("blocks whitelisted user from minting to a different address", async () => {
    const [_, whitelistedUser, otherUser] = await ethers.getSigners();
    const { soulboundAI } = await loadFixture(deployContractFixture);

    await soulboundAI.updateWhitelist(whitelistedUser.address, true);

    await expect(
      soulboundAI.connect(whitelistedUser).safeMint(otherUser.address)
    ).to.be.revertedWith("Insufficient fee");

    const balance = await soulboundAI
      .connect(otherUser)
      .balanceOf(otherUser.address);

    expect(balance).to.equal(0);
  });

  it("a referrer receives a cut when a mint is made", async () => {
    const [owner, otherUser] = await ethers.getSigners();
    const { soulboundAI } = await loadFixture(deployContractFixture);

    const fee = await soulboundAI.getFee(owner.address);
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

    const fee = await soulboundAI.getFee(otherUser.address);
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
});
