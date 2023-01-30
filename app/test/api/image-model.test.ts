import { expect, describe, it, beforeEach, vi } from "vitest";
import { createMocks, MockRequest, MockResponse } from "node-mocks-http";
import { NextApiRequest, NextApiResponse } from "next";
import * as NextAuth from "next-auth";
import * as ContractReads from "helpers/contract-reads";
import * as Crypto from "crypto";
import handler from "pages/api/image-model";
import prisma from "clients/__mocks__/prisma";
import { ImageModel } from "@prisma/client";

vi.mock("clients/prisma");
vi.mock("next-auth");
vi.mock("helpers/contract-reads");
vi.mock("crypto");

const mockAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const imageModel: ImageModel = {
  batchId: "mock-batch-id",
  modelId: "mock-model-id",
  owner: mockAddress,
  s3Urls: [],
  state: "NEEDS_IMAGES",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("/api/image-model", () => {
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
          prompt:
            "Portrait art of @object, closeup, male | painted by Miles Aldridge",
        },
      });

      req = _req;
      res = _res;

      vi.spyOn(NextAuth, "unstable_getServerSession").mockResolvedValue({
        address: mockAddress,
      });
      vi.spyOn(ContractReads, "addressHasSBT").mockResolvedValue(true);
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

    it("creates the image model with the correct parameters", async () => {
      prisma.imageModel.create.mockResolvedValue(imageModel);
      vi.spyOn(Crypto, "randomUUID").mockReturnValue("mock-batch-id");

      await handler(req, res);

      expect(prisma.imageModel.create).to.toHaveBeenCalledWith({
        data: {
          owner: mockAddress,
          state: "NEEDS_IMAGES",
          batchId: "mockbatchid",
        },
      });
      expect(res._getStatusCode()).toBe(200);
      expect(res._getData()).toEqual(JSON.stringify(imageModel));
    });
  });

  describe("PUT", () => {
    let req: MockRequest<NextApiRequest>;
    let res: MockResponse<NextApiResponse<any>>;

    beforeEach(() => {
      const { req: _req, res: _res } = createMocks<
        NextApiRequest,
        NextApiResponse<any>
      >({
        method: "PUT",
      });

      req = _req;
      res = _res;

      vi.spyOn(NextAuth, "unstable_getServerSession").mockResolvedValue({
        address: mockAddress,
      });
      vi.spyOn(ContractReads, "addressHasSBT").mockResolvedValue(true);
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

    it("returns 404 if the ImageModel doesn't exist", async () => {
      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({
        message: "ImageModel not found",
      });
    });

    it("updates the ImageModel if enough images have been uploaded", async () => {
      const imageModelWithEnoughImages: ImageModel = {
        ...imageModel,
        s3Urls: [
          "mock-s3-url-1",
          "mock-s3-url-2",
          "mock-s3-url-3",
          "mock-s3-url-4",
          "mock-s3-url-5",
          "mock-s3-url-6",
          "mock-s3-url-7",
          "mock-s3-url-8",
          "mock-s3-url-9",
          "mock-s3-url-10",
        ],
      };
      prisma.imageModel.findUnique.mockResolvedValue(
        imageModelWithEnoughImages
      );
      prisma.imageModel.update.mockResolvedValue(imageModelWithEnoughImages);

      await handler(req, res);

      expect(prisma.imageModel.update).to.toHaveBeenCalledWith({
        where: {
          owner: mockAddress,
        },
        data: {
          state: "NEEDS_TRAINING",
        },
      });
      expect(res._getStatusCode()).toBe(200);
      expect(res._getData()).toEqual(
        JSON.stringify(imageModelWithEnoughImages)
      );
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
          address: mockAddress,
        },
      });

      req = _req;
      res = _res;
    });

    it("returns 400 if the address isn't a string", async () => {
      req.query = { address: ["boo"] };

      await handler(req, res);
      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        message: "Invalid address",
      });
    });

    it("returns 404 if the ImageModel isn't found", async () => {
      prisma.imageModel.findUnique.mockResolvedValue(null);

      await handler(req, res);
      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({
        message: "Image model not found",
      });
    });

    it("returns the existing ImageModel as is if it isn't currently training", async () => {
      prisma.imageModel.findUnique.mockResolvedValue({
        ...imageModel,
        state: "NEEDS_TRAINING",
      });

      await handler(req, res);

      expect(prisma.imageModel.update).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
      expect(res._getData()).toEqual(
        JSON.stringify({
          ...imageModel,
          state: "NEEDS_TRAINING",
        })
      );
    });

    it("returns the existing ImageModel if the last update time is recent", async () => {
      prisma.imageModel.findUnique.mockResolvedValue({
        ...imageModel,
        state: "IS_TRAINING",
      });

      await handler(req, res);

      expect(prisma.imageModel.update).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
      expect(res._getData()).toEqual(
        JSON.stringify({
          ...imageModel,
          state: "IS_TRAINING",
        })
      );
    });

    it("returns 500 if there is for some reason no modelId", async () => {
      const pastTime = new Date();
      pastTime.setHours(pastTime.getHours() - 1);

      prisma.imageModel.findUnique.mockResolvedValue({
        ...imageModel,
        modelId: null,
        state: "IS_TRAINING",
        updatedAt: pastTime,
      });

      await handler(req, res);

      expect(prisma.imageModel.update).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(500);
      expect(res._getJSONData()).toEqual({
        message:
          "Something has gone terribly wrong. modelId does not exist but we think it is training",
      });
    });

    it("fetches the new status from neural love and updates ImageModel when stale", async () => {
      const pastTime = new Date();
      pastTime.setHours(pastTime.getHours() - 1);

      prisma.imageModel.findUnique.mockResolvedValue({
        ...imageModel,
        state: "IS_TRAINING",
        updatedAt: pastTime,
      });
      prisma.imageModel.update.mockResolvedValue({
        ...imageModel,
        state: "READY",
        updatedAt: pastTime,
      });

      await handler(req, res);

      expect(prisma.imageModel.update).toHaveBeenCalledWith({
        where: {
          owner: mockAddress,
        },
        data: {
          state: "READY",
        },
      });
      expect(res._getStatusCode()).toBe(200);
      expect(res._getData()).toEqual(
        JSON.stringify({
          ...imageModel,
          state: "READY",
          updatedAt: pastTime,
        })
      );
    });

    it("fetches the new status from neural love and updates ImageModel when stale", async () => {
      const pastTime = new Date();
      pastTime.setHours(pastTime.getHours() - 1);

      prisma.imageModel.findUnique.mockResolvedValue({
        ...imageModel,
        modelId: "mock-model-id-still-training",
        state: "IS_TRAINING",
        updatedAt: pastTime,
      });
      prisma.imageModel.update.mockResolvedValue({
        ...imageModel,
        modelId: "mock-model-id-still-training",
        state: "IS_TRAINING",
        updatedAt: pastTime,
      });

      await handler(req, res);

      expect(prisma.imageModel.update).toHaveBeenCalledWith({
        where: {
          owner: mockAddress,
        },
        data: {
          state: "IS_TRAINING",
        },
      });
      expect(res._getStatusCode()).toBe(200);
      expect(res._getData()).toEqual(
        JSON.stringify({
          ...imageModel,
          modelId: "mock-model-id-still-training",
          state: "IS_TRAINING",
          updatedAt: pastTime,
        })
      );
    });
  });
});
