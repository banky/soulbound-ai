// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "openzeppelin/token/ERC721/extensions/ERC721Enumerable.sol";
import "openzeppelin/utils/Counters.sol";
import "openzeppelin/access/Ownable.sol";
import "openzeppelin/utils/Strings.sol";
import "forge-std/console.sol";

contract SoulboundAI is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    uint256 public fee = 0.01 ether;

    constructor() ERC721("SoulboundAI", "SBAI") {}

    function safeMint(address to) public payable {
        require(msg.value >= fee, "Insufficient fee");
        require(balanceOf(to) == 0, "Only one SBT is allowed per user");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function burn() external {
        uint256 tokenId = tokenOfOwnerByIndex(msg.sender, 0);
        require(
            ownerOf(tokenId) == msg.sender,
            "Only the owner of the token can burn it."
        );

        super._burn(tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal override {
        require(
            from == address(0) || to == address(0),
            "This a Soulbound token. It cannot be transferred. It can only be burned by the token owner."
        );

        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
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

    function updateFee(uint256 _fee) external onlyOwner {
        fee = _fee;
    }
}
