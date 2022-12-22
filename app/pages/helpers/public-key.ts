import { entropyToMnemonic } from "bip39";

/**
 * Converts a public key of the form 0x3c2C68Db9Cf70e3A29EE13dEE2b5e3f1F7dd9D74 to a
 * string of words
 * @param key
 */
export const publicKeyToMnemonic = (key: string) => {
  const strippedKey = key.slice(2);
  return entropyToMnemonic(strippedKey);
};
