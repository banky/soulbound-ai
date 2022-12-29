import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("SoulboundAI", () => {
  const deployContractFixture = async () => {
    const SoulboundAI = await ethers.getContractFactory("SoulboundAI");
    const soulboundAI = await SoulboundAI.deploy();
    const fee = await soulboundAI.fee();

    return { soulboundAI, fee };
  };

  it("mints an SBT for a user", async () => {
    const [owner] = await ethers.getSigners();
    const { soulboundAI, fee } = await loadFixture(deployContractFixture);

    await soulboundAI.safeMint(owner.address, { value: fee });
    const balance = await soulboundAI.balanceOf(owner.address);
    expect(balance).to.equal(1);
  });

  it("withdraws fees as the owner", async () => {
    const [owner, otherUser] = await ethers.getSigners();
    const { soulboundAI, fee } = await loadFixture(deployContractFixture);

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
    const { soulboundAI, fee } = await loadFixture(deployContractFixture);

    await soulboundAI
      .connect(otherUser)
      .safeMint(otherUser.address, { value: fee });

    await expect(
      soulboundAI.connect(otherUser).withdrawFees(owner.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("gets the correct token uri", async () => {
    const [owner] = await ethers.getSigners();
    const { soulboundAI, fee } = await loadFixture(deployContractFixture);

    await soulboundAI.safeMint(owner.address, { value: fee });
    const tokenUri = await soulboundAI.tokenURI(0);

    expect(tokenUri).to.equal(
      `https://storage.googleapis.com/soulbound-ai/${owner.address.toLowerCase()}.png`
    );
  });

  it("does not allow transfer", async () => {
    const [owner, otherUser] = await ethers.getSigners();
    const { soulboundAI, fee } = await loadFixture(deployContractFixture);

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
    const { soulboundAI, fee } = await loadFixture(deployContractFixture);

    await soulboundAI.safeMint(owner.address, { value: fee });
    await soulboundAI.burn();
    const balance = await soulboundAI.balanceOf(owner.address);

    expect(balance).to.equal(0);
  });

  it("reverts if user tries to burn someone else's token", async () => {
    const [owner, otherUser] = await ethers.getSigners();
    const { soulboundAI, fee } = await loadFixture(deployContractFixture);

    await soulboundAI.safeMint(owner.address, { value: fee });
    await expect(soulboundAI.connect(otherUser).burn()).to.be.revertedWith(
      "ERC721Enumerable: owner index out of bounds"
    );
  });

  it("allows only one mint per user", async () => {
    const [owner] = await ethers.getSigners();
    const { soulboundAI, fee } = await loadFixture(deployContractFixture);

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
    const { soulboundAI, fee } = await loadFixture(deployContractFixture);

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
});
