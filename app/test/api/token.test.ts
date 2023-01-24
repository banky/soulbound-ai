import handler from "pages/api/token";
import { createMocks, MockRequest, MockResponse } from "node-mocks-http";
import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { addressHasSBT } from "helpers/contract-reads";

jest.mock("next-auth");
jest.mock("helpers/contract-reads");
jest.mock("@supabase/supabase-js", () => {
  return {
    createClient: () => ({
      storage: {
        from: () => ({
          upload: async () => ({}),
          getPublicUrl: () => ({
            data: {
              publicUrl: "mock-supabase-image-url",
            },
          }),
        }),
      },
    }),
  };
});

jest.mock("@prisma/client", () => {
  return {
    PrismaClient: class PrismaClient {
      token: any;

      constructor() {
        this.token = {
          update: jest.fn(),
          findFirst: jest.fn(() => ({
            imagePath: "mock-image-path",
            imageUrl: "mock-supabase-image-url",
          })),
        };
      }
    },
  };
});

const mockUnstable_getServerSession = jest.mocked(unstable_getServerSession);
const mockAddressHasSBT = jest.mocked(addressHasSBT);

global.fetch = jest.fn().mockImplementation(async () => ({
  blob: jest.fn(async () => ({})),
}));

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
          imageIndex: 1,
        },
      });

      req = _req;
      res = _res;
    });

    it("returns unahtorized if the user is not logged in", async () => {
      mockUnstable_getServerSession.mockResolvedValue(null);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(res._getJSONData()).toEqual({
        message: "Unauthorized. User is not logged in",
      });
    });

    it("returns unauthorized if the user doesn't have an SBT minted", async () => {
      mockUnstable_getServerSession.mockResolvedValue({
        address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      });
      mockAddressHasSBT.mockResolvedValue(false);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(res._getJSONData()).toEqual({
        message: "Unauthorized. User does not have a soulbound AI SBT",
      });
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

    it("gets the image URL of an existing image", async () => {
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({
        imagePath: "mock-image-path",
        imageUrl: "mock-supabase-image-url",
      });
    });
  });
});
