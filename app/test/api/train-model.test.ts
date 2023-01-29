import { expect, describe, it, beforeEach, vi } from "vitest";
import { createMocks, MockRequest, MockResponse } from "node-mocks-http";
import { NextApiRequest, NextApiResponse } from "next";
import * as NextAuth from "next-auth";
import * as ContractReads from "helpers/contract-reads";
import handler from "pages/api/train-model";
import prisma from "clients/__mocks__/prisma";
import { ImageModel } from "@prisma/client";

vi.mock("clients/prisma");
vi.mock("next-auth");
vi.mock("helpers/contract-reads");

const mockAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const imageModel: ImageModel = {
  batchId: "mock-batch-id",
  modelId: "mock-model-id",
  owner: mockAddress,
  s3Urls: [],
  state: "NEEDS_TRAINING",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("/api/train-model", () => {
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
          descriptor: "man",
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

    it("returns 401 if there is no descriptor", async () => {
      req.body = { descriptor: 123 };
      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(res._getJSONData()).toEqual({
        message:
          "Need to provide a descriptor for the images. Options are man, woman, other",
      });
    });

    it("returns 401 if the descriptor is a wrong type", async () => {
      req.body = { descriptor: "dog" };
      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(res._getJSONData()).toEqual({
        message:
          "Need to provide a descriptor for the images. Options are man, woman, other",
      });
    });

    it("returns 404 if the ImageModel isn't found", async () => {
      prisma.imageModel.findUnique.mockResolvedValueOnce(null);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({
        message: "Image model not found",
      });
    });

    it("returns 500 if trying to train an ImageModel that doesn't need training", async () => {
      const updatedImageModel: ImageModel = {
        ...imageModel,
        state: "READY",
      };
      prisma.imageModel.findUnique.mockResolvedValueOnce(updatedImageModel);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(res._getJSONData()).toEqual({
        message: "Refusing to train. This model is not in the right state",
      });
    });

    it("starts training the model", async () => {
      prisma.imageModel.findUnique.mockResolvedValueOnce(imageModel);

      await handler(req, res);

      expect(prisma.imageModel.update).to.toHaveBeenCalledWith({
        where: { owner: mockAddress },
        data: {
          modelId: "1ed9aa29-9bb8-6620-aae4-69e4ea551a443",
          state: "IS_TRAINING",
        },
      });
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({});
    });
  });
});
