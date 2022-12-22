// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "openzeppelin/token/ERC721/ERC721.sol";
import "openzeppelin/utils/Counters.sol";
import "openzeppelin/access/Ownable.sol";
import "openzeppelin/utils/Strings.sol";

contract SoulboundAI is ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    uint256 constant fee = 0.01 ether;

    constructor() ERC721("SoulboundAI", "SBAI") {}

    function safeMint(address to) public payable {
        require(msg.value >= fee, "Insufficient fee");
        require(balanceOf(to) == 0, "Only one SBT is allowed per user");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function burn(uint256 tokenId) external {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only the owner of the token can burn it."
        );
        _burn(tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256,
        uint256
    ) internal pure override {
        require(
            from == address(0) || to == address(0),
            "This a Soulbound token. It cannot be transferred. It can only be burned by the token owner."
        );
    }

    function _burn(uint256 tokenId) internal override(ERC721) {
        super._burn(tokenId);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://soulbound-ai.party/image/";
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        _requireMinted(tokenId);

        string memory baseURI = _baseURI();
        string memory owner = Strings.toHexString(uint160(ownerOf(tokenId)));

        return string(abi.encodePacked(baseURI, owner, ".png"));
    }

    function withdrawFees(address payable recipient) external onlyOwner {
        (bool sent, ) = recipient.call{value: address(this).balance}("");

        require(sent, "Failed to transfer ether");
    }
}
