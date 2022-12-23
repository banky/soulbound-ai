import { publicKeyToMnemonic } from "../pages/helpers/public-key";

describe("publicKeyToMnemonic", () => {
  it("returns the correct mnemonic for a given address", () => {
    const address = "0x3c2C68Db9Cf70e3A29EE13dEE2b5e3f1F7dd9D74";
    const mnemonic = publicKeyToMnemonic(address);

    expect(mnemonic).toBe(
      "destroy globe dad delay ill brown police second ten between jump token lava solid spot"
    );
  });
});
