import { expect, describe, it, beforeEach, vi } from "vitest";
import { createMocks, MockRequest, MockResponse } from "node-mocks-http";
import { NextApiRequest, NextApiResponse } from "next";
import handler from "pages/api/token-metadata/[address]";
import prisma from "clients/__mocks__/prisma";

vi.mock("clients/prisma");

const mockAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

describe("/api/token-metadata/:address", () => {
  describe("GET", () => {
    let req: MockRequest<NextApiRequest>;
    let res: MockResponse<NextApiResponse<any>>;

    beforeEach(async () => {
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

    it("gets the token metadata as expected", async () => {
      prisma.token.findUnique.mockResolvedValue({
        owner: mockAddress,
        description: "mock-description",
        name: "mock-name",
        imagePath: "mock-image-path",
        imageUrl: "mock-image-url",
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({
        image: "mock-image-url",
        description: "mock-description",
        name: "mock-name",
        background_color: "182F69",
      });
    });
  });
});
