import { expect, describe, it, beforeEach, vi } from "vitest";
import handler from "pages/api/token";
import prisma from "clients/__mocks__/prisma";
import supabase from "clients/__mocks__/supabase";
import { createMocks, MockRequest, MockResponse } from "node-mocks-http";
import { NextApiRequest, NextApiResponse } from "next";
import * as NextAuth from "next-auth";
import * as ContractReads from "helpers/contract-reads";
import * as Crypto from "crypto";
import { Order, Token } from "@prisma/client";

vi.mock("clients/prisma");
vi.mock("clients/supabase");
vi.mock("next-auth");
vi.mock("helpers/contract-reads");
vi.mock("crypto");

const mockAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const mockImageUrls = [
  "https://mock.image.com/1.jpg",
  "https://mock.image.com/2.jpg",
];
const mockOrder: Order = {
  owner: mockAddress,
  prompt: "mock-prompt",
  orderId: "mock-order-id",
  ready: true,
  error: false,
  imageUrls: mockImageUrls,
  createdAt: new Date(),
  updatedAt: new Date(),
};
const mockToken: Token = {
  owner: mockAddress,
  name: "mock-name",
  description: "mock-description",
  imagePath: "mock-image-path",
  imageUrl: "mock-image-url",
};

describe("/api/token", () => {
  describe("POST", () => {
    let req: MockRequest<NextApiRequest>;
    let res: MockResponse<NextApiResponse<any>>;

    beforeEach(() => {
      const { req: _req, res: _res } = createMocks<
        NextApiRequest,
        NextApiResponse<any>
      >({
        method: "POST",
        body: {
          orderId: "mock-order-id",
          imageIndex: 1,
        },
      });

      req = _req;
      res = _res;
    });

    it("returns unauthorized if the user is not logged in", async () => {
      vi.spyOn(NextAuth, "unstable_getServerSession").mockResolvedValue(null);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(res._getJSONData()).toEqual({
        message: "Unauthorized. User is not logged in",
      });
    });

    it("returns unauthorized if the user doesn't have an SBT minted", async () => {
      vi.spyOn(NextAuth, "unstable_getServerSession").mockResolvedValue({
        address: mockAddress,
      });
      vi.spyOn(ContractReads, "addressHasSBT").mockResolvedValue(false);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(res._getJSONData()).toEqual({
        message: "Unauthorized. User does not have a soulbound AI SBT",
      });
    });

    it("returns 400 if the request body is not correct", async () => {
      vi.spyOn(NextAuth, "unstable_getServerSession").mockResolvedValue({
        address: mockAddress,
      });
      vi.spyOn(ContractReads, "addressHasSBT").mockResolvedValue(true);

      req.body = { orderId: "mock-order-id", imageIndex: "2" };
      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        message:
          "Invalid inputs. orderId must be a string and imageIndex must be a number",
      });
    });

    it("returns 404 if the orderId is not found", async () => {
      vi.spyOn(NextAuth, "unstable_getServerSession").mockResolvedValue({
        address: mockAddress,
      });
      vi.spyOn(ContractReads, "addressHasSBT").mockResolvedValue(true);

      req.body = { orderId: "mock-order-id", imageIndex: 1 };
      prisma.order.findUnique.mockResolvedValue(null);
      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({
        message: "Order with orderId not found",
      });
    });

    it("fetch image from imageUrl, upload to supabase, create token", async () => {
      vi.spyOn(NextAuth, "unstable_getServerSession").mockResolvedValue({
        address: mockAddress,
      });
      vi.spyOn(ContractReads, "addressHasSBT").mockResolvedValue(true);
      vi.spyOn(Crypto, "randomUUID").mockReturnValue("mock-random-uuid");

      req.body = { orderId: "mock-order-id", imageIndex: 1 };

      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.token.create.mockResolvedValue(mockToken);

      await handler(req, res);

      // Call to forceUpdateOpensea
      expect(ContractReads.tokenIdForAddress).toHaveBeenCalledWith(mockAddress);

      expect(prisma.token.create).toHaveBeenCalledWith({
        data: {
          description: "mock-prompt",
          imagePath: "mock-random-uuid.png",
          imageUrl: "mock-supabase-public-url",
          name: "AI art for 0xf39Fd",
          owner: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        },
      });

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual(mockToken);
    });
  });

  describe("GET", () => {
    let req: MockRequest<NextApiRequest>;
    let res: MockResponse<NextApiResponse<any>>;

    beforeEach(() => {
      const { req: _req, res: _res } = createMocks<
        NextApiRequest,
        NextApiResponse<any>
      >({
        method: "GET",
        query: {
          address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        },
      });

      req = _req;
      res = _res;
    });

    it("gets the token if it exists", async () => {
      const token = {
        owner: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        name: "mock-name",
        description: "mock-description",
        imagePath: "mock-image-path",
        imageUrl: "mock-image-url",
      };
      prisma.token.findUnique.mockResolvedValue(token);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual(token);
    });

    it("returns null if the token doesn't exit", async () => {
      prisma.token.findUnique.mockResolvedValue(null);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual(null);
    });

    it("returns null if the token doesn't exit", async () => {
      prisma.token.findUnique.mockResolvedValue(null);

      req.query = { address: ["bad-address"] };
      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        message: "Invalid address",
      });
    });
  });

  describe("DELETE", () => {
    let req: MockRequest<NextApiRequest>;
    let res: MockResponse<NextApiResponse<any>>;

    beforeEach(() => {
      const { req: _req, res: _res } = createMocks<
        NextApiRequest,
        NextApiResponse<any>
      >({
        method: "DELETE",
      });

      req = _req;
      res = _res;
    });

    it("returns unauthorized if the user is not logged in", async () => {
      vi.spyOn(NextAuth, "unstable_getServerSession").mockResolvedValue(null);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(res._getJSONData()).toEqual({
        message: "Unauthorized. User is not logged in",
      });
    });

    it("returns unauthorized if the user still has an SBT", async () => {
      vi.spyOn(NextAuth, "unstable_getServerSession").mockResolvedValue({
        address: mockAddress,
      });
      vi.spyOn(ContractReads, "addressHasSBT").mockResolvedValue(true);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(res._getJSONData()).toEqual({
        message: "Shan't delete token for user that still has SBT",
      });
    });

    it("returns 404 if the imagePath isn't defined", async () => {
      vi.spyOn(NextAuth, "unstable_getServerSession").mockResolvedValue({
        address: mockAddress,
      });
      vi.spyOn(ContractReads, "addressHasSBT").mockResolvedValue(false);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({
        message: "Could not find image to delete",
      });
    });

    it("deletes the token, imageModel and order", async () => {
      vi.spyOn(NextAuth, "unstable_getServerSession").mockResolvedValue({
        address: mockAddress,
      });
      vi.spyOn(ContractReads, "addressHasSBT").mockResolvedValue(false);
      prisma.token.delete.mockResolvedValue(mockToken);

      await handler(req, res);

      expect(prisma.token.delete).toHaveBeenCalledWith({
        where: { owner: mockAddress },
      });
      expect(prisma.imageModel.delete).toHaveBeenCalledWith({
        where: { owner: mockAddress },
      });
      expect(prisma.order.deleteMany).toHaveBeenCalledWith({
        where: { owner: mockAddress },
      });

      expect(res._getStatusCode()).toBe(200);
    });

    it("returns 500 if there was an error removing image from supabase", async () => {
      vi.spyOn(NextAuth, "unstable_getServerSession").mockResolvedValue({
        address: mockAddress,
      });
      vi.spyOn(ContractReads, "addressHasSBT").mockResolvedValue(false);
      prisma.token.delete.mockResolvedValue(mockToken);
      // @ts-expect-error: Dont want to add every function
      supabase.storage.from.mockReturnValue({
        remove: vi.fn().mockResolvedValue({
          error: "An error occured",
        }),
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(res._getJSONData()).toEqual({
        message: "Failed to delete image",
      });
    });
  });
});
