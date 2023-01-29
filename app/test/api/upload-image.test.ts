import { expect, describe, it, beforeEach, vi } from "vitest";
import { createMocks, MockRequest, MockResponse } from "node-mocks-http";
import { NextApiRequest, NextApiResponse } from "next";
import * as NextAuth from "next-auth";
import * as ContractReads from "helpers/contract-reads";
import handler from "pages/api/upload-image";

vi.mock("clients/prisma");
vi.mock("next-auth");
vi.mock("helpers/contract-reads");

const mockAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

describe("/api/train-model", () => {
  describe("POST", () => {
    let req: MockRequest<NextApiRequest>;
    let res: MockResponse<NextApiResponse<any>>;

    beforeEach(async () => {
      const { req: _req, res: _res } = createMocks<
        NextApiRequest,
        NextApiResponse<any>
      >({
        method: "POST",
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

    /**
     * Not sure how to do tests for the form file uploads
     */
  });
});
