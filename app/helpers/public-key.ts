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

/**
 * Gets the first and last words returned from publicKeyToMnemonic
 * @param key
 */
export const firstAndLastMnemonic = (key: string) => {
  const mnemonic = publicKeyToMnemonic(key);
  const words = mnemonic.split(" ");
  const firstWord = words[0];
  const lastWord = words[words.length - 1];

  return [firstWord, lastWord];
};
