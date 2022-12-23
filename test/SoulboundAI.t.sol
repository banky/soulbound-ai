// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "forge-std/Test.sol";
import "../src/SoulboundAI.sol";

contract SoulboundAITest is Test {
    SoulboundAI public soulboundAI;

    function setUp() public {
        soulboundAI = new SoulboundAI();
    }

    function testMint() public {
        address user = address(0xaedEF9f3BF15dBDc3E55d186CD23e29C9D439C8d);
        deal(user, 0.1 ether);
        vm.prank(user);
        soulboundAI.safeMint{value: 0.01 ether}(user);

        assertEq(soulboundAI.ownerOf(0), user);
    }

    function testWithdraw() public {
        deal(address(soulboundAI), 1 ether);
        address payable recipient = payable(
            0xaedEF9f3BF15dBDc3E55d186CD23e29C9D439C8d
        );

        soulboundAI.withdrawFees(recipient);
        assertEq(recipient.balance, 1 ether);
    }

    function testWithdrawByNonOwnerReverts() public {
        address payable otherUser = payable(
            0xaedEF9f3BF15dBDc3E55d186CD23e29C9D439C8d
        );

        vm.startPrank(otherUser);
        vm.expectRevert("Ownable: caller is not the owner");
        soulboundAI.withdrawFees(otherUser);

        vm.stopPrank();
    }

    function testTokenURI() public {
        address user = address(0xaedEF9f3BF15dBDc3E55d186CD23e29C9D439C8d);
        deal(user, 0.1 ether);
        vm.prank(user);
        soulboundAI.safeMint{value: 0.01 ether}(user);

        assertEq(
            soulboundAI.tokenURI(0),
            "https://soulbound-ai.party/image/0xaedef9f3bf15dbdc3e55d186cd23e29c9d439c8d.png"
        );
    }

    function testTransferFails() public {
        address user = address(0xaedEF9f3BF15dBDc3E55d186CD23e29C9D439C8d);
        address otherUser = address(0x1dB4Ac604B8859a6CbedcdE7Cc999158F4bAae9E);
        deal(user, 0.1 ether);

        vm.startPrank(user);
        soulboundAI.safeMint{value: 0.01 ether}(user);

        vm.expectRevert(
            "This a Soulbound token. It cannot be transferred. It can only be burned by the token owner."
        );
        soulboundAI.safeTransferFrom(user, otherUser, 0);

        vm.stopPrank();
    }

    function testBurn() public {
        address user = address(0xaedEF9f3BF15dBDc3E55d186CD23e29C9D439C8d);
        deal(user, 0.1 ether);

        vm.startPrank(user);
        soulboundAI.safeMint{value: 0.01 ether}(user);

        assertEq(soulboundAI.ownerOf(0), user);

        soulboundAI.burn();
        vm.stopPrank();

        vm.expectRevert("ERC721: invalid token ID");
        soulboundAI.ownerOf(0);
    }

    function testBurnByNonOwnerFails() public {
        address user = address(0xaedEF9f3BF15dBDc3E55d186CD23e29C9D439C8d);
        address otherUser = address(0x1dB4Ac604B8859a6CbedcdE7Cc999158F4bAae9E);
        deal(user, 0.1 ether);

        vm.prank(user);
        soulboundAI.safeMint{value: 0.01 ether}(user);

        vm.startPrank(otherUser);
        vm.expectRevert("ERC721Enumerable: owner index out of bounds");
        soulboundAI.burn();

        vm.stopPrank();
    }

    function testAllowOnlyOneMint() public {
        address user = address(0xaedEF9f3BF15dBDc3E55d186CD23e29C9D439C8d);
        deal(user, 0.1 ether);

        vm.startPrank(user);
        soulboundAI.safeMint{value: 0.01 ether}(user);

        vm.expectRevert("Only one SBT is allowed per user");
        soulboundAI.safeMint{value: 0.01 ether}(user);

        vm.stopPrank();
    }

    function testUpdateFee() public {
        soulboundAI.updateFee(0.02 ether);
        assertEq(soulboundAI.fee(), 0.02 ether);
    }

    function testUpdateFeeFailsNonOwner() public {
        address nonOwner = address(0xaedEF9f3BF15dBDc3E55d186CD23e29C9D439C8d);
        vm.startPrank(nonOwner);
        vm.expectRevert("Ownable: caller is not the owner");
        soulboundAI.updateFee(0.02 ether);

        vm.stopPrank();
    }

    function testRepeatedMintBurn() public {
        address user = address(0xaedEF9f3BF15dBDc3E55d186CD23e29C9D439C8d);
        deal(user, 0.3 ether);
        vm.startPrank(user);

        soulboundAI.safeMint{value: 0.01 ether}(user);
        assertEq(soulboundAI.balanceOf(user), 1);

        soulboundAI.burn();
        assertEq(soulboundAI.balanceOf(user), 0);

        soulboundAI.safeMint{value: 0.01 ether}(user);
        assertEq(soulboundAI.balanceOf(user), 1);

        soulboundAI.burn();
        assertEq(soulboundAI.balanceOf(user), 0);

        vm.stopPrank();
    }
}
