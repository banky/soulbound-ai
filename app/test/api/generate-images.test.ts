import { expect, describe, it, beforeEach, vi } from "vitest";
import { createMocks, MockRequest, MockResponse } from "node-mocks-http";
import { NextApiRequest, NextApiResponse } from "next";
import * as NextAuth from "next-auth";
import * as ContractReads from "helpers/contract-reads";
import handler from "pages/api/generate-images";
import prisma from "clients/__mocks__/prisma";
import { Order } from "@prisma/client";

vi.mock("clients/prisma");
vi.mock("next-auth");
vi.mock("helpers/contract-reads");

const mockAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

describe("/api/generate-images", () => {
  describe("GET", () => {
    let req: MockRequest<NextApiRequest>;
    let res: MockResponse<NextApiResponse<any>>;

    beforeEach(() => {
      const { req: _req, res: _res } = createMocks<
        NextApiRequest,
        NextApiResponse<any>
      >({
        method: "POST",
        body: {
          prompt:
            "Portrait art of @object, closeup, male | painted by Miles Aldridge",
        },
      });

      req = _req;
      res = _res;

      vi.spyOn(NextAuth, "getServerSession").mockResolvedValue({
        address: mockAddress,
      });
      vi.spyOn(ContractReads, "addressHasSBT").mockResolvedValue(true);
    });

    it("returns unauthorized if the user is not logged in", async () => {
      vi.spyOn(NextAuth, "getServerSession").mockResolvedValue(null);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(res._getJSONData()).toEqual({
        message: "Unauthorized. User is not logged in",
      });
    });

    it("returns unauthorized if the user doesn't have an SBT minted", async () => {
      vi.spyOn(NextAuth, "getServerSession").mockResolvedValue({
        address: mockAddress,
      });
      vi.spyOn(ContractReads, "addressHasSBT").mockResolvedValue(false);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(res._getJSONData()).toEqual({
        message: "Unauthorized. User does not have a soulbound AI SBT",
      });
    });

    it("returns 400 if the prompt isn't a string", async () => {
      vi.spyOn(NextAuth, "getServerSession").mockResolvedValue({
        address: mockAddress,
      });
      vi.spyOn(ContractReads, "addressHasSBT").mockResolvedValue(true);
      req.body = { prompt: 1 };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        message:
          "Need to provide a descriptor for the images. Options are man, woman, other",
      });
    });

    it("returns 400 if the prompt isn't a string", async () => {
      vi.spyOn(NextAuth, "getServerSession").mockResolvedValue({
        address: mockAddress,
      });
      vi.spyOn(ContractReads, "addressHasSBT").mockResolvedValue(true);
      req.body = { prompt: "prompt without the object tag" };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        message:
          "Please use @object in prompt to utilise custom model. Example: Renaissance portrait of @object",
      });
    });

    it("returns 404 if the imageModel isn't found", async () => {
      prisma.imageModel.findUnique.mockResolvedValue(null);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({
        message: "Image model not found",
      });
    });

    it("returns 404 if the imageModel modelId isn't found", async () => {
      prisma.imageModel.findUnique.mockResolvedValue({
        batchId: "mock-batch-id",
        modelId: null,
        owner: mockAddress,
        s3Urls: [],
        state: "READY",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({
        message: "Image model not found",
      });
    });

    it("returns 500 with error message if the image model isn't ready", async () => {
      prisma.imageModel.findUnique.mockResolvedValue({
        batchId: "mock-batch-id",
        modelId: "mock-model-id",
        owner: mockAddress,
        s3Urls: [],
        state: "IS_TRAINING",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(res._getJSONData()).toEqual({
        message: "Image model is not ready",
      });
    });

    it("returns 500 with a message if the estimate has a cost", async () => {
      prisma.imageModel.findUnique.mockResolvedValue({
        batchId: "mock-batch-id",
        modelId: "mock-model-id-with-cost",
        owner: mockAddress,
        s3Urls: [],
        state: "READY",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(res._getJSONData()).toEqual({
        message: "Failed to generate images",
      });
    });

    it("returns 500 with a message if the image generation fails", async () => {
      prisma.imageModel.findUnique.mockResolvedValue({
        batchId: "mock-batch-id",
        modelId: "mock-model-id-that-fails",
        owner: mockAddress,
        s3Urls: [],
        state: "READY",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(res._getJSONData()).toEqual({
        message: "Failed to generate images",
      });
    });

    it("returns 200 with the updated order", async () => {
      prisma.imageModel.findUnique.mockResolvedValue({
        batchId: "mock-batch-id",
        modelId: "mock-model-id",
        owner: mockAddress,
        s3Urls: [],
        state: "READY",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const mockOrder: Order = {
        ready: false,
        error: false,
        imageUrls: [],
        owner: mockAddress,
        orderId: "1ed9f57d-2bd1-6ef2-93ae-83bd031b9040",
        prompt:
          "Portrait art of @object, closeup, male | painted by Miles Aldridge",
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      prisma.order.create.mockResolvedValue(mockOrder);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getData()).toEqual(JSON.stringify(mockOrder));
    });
  });
});
