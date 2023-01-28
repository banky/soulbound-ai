import { expect, describe, it, beforeEach, vi } from "vitest";
import { createMocks, MockRequest, MockResponse } from "node-mocks-http";
import { NextApiRequest, NextApiResponse } from "next";
import handler from "pages/api/orders";
import prisma from "clients/__mocks__/prisma";
import { Order } from "@prisma/client";

vi.mock("clients/prisma");

const mockAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const mockImageUrls = [
  "https://mock.image.com/1.jpg",
  "https://mock.image.com/2.jpg",
];

describe("/api/token", () => {
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

    it("returns 400 if the address is not a string", async () => {
      req.query = { address: [mockAddress] };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        message: "Invalid address for orders",
      });
    });

    it("doesn't fetch updated statuses if the orders were last updated recently", async () => {
      const mockPendingOrders: Order[] = [
        {
          owner: mockAddress,
          prompt: "mock-prompt",
          orderId: "mock-order-id",
          ready: true,
          error: false,
          imageUrls: mockImageUrls,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          owner: mockAddress,
          prompt: "mock-prompt-2",
          orderId: "mock-order-id-2",
          ready: true,
          error: false,
          imageUrls: mockImageUrls,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prisma.order.findMany.mockResolvedValue(mockPendingOrders);

      await handler(req, res);

      expect(prisma.order.update).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
      expect(res._getData()).toEqual(JSON.stringify(mockPendingOrders));
    });

    it("updates the orders with new data from neural love when stale", async () => {
      const pastTime = new Date();
      pastTime.setHours(pastTime.getHours() - 1);

      const mockPendingOrders: Order[] = [
        {
          owner: mockAddress,
          prompt: "mock-prompt",
          orderId: "mock-order-id",
          ready: true,
          error: false,
          imageUrls: mockImageUrls,
          createdAt: new Date(),
          updatedAt: pastTime,
        },
        {
          owner: mockAddress,
          prompt: "mock-prompt-2",
          orderId: "mock-order-id-2",
          ready: true,
          error: false,
          imageUrls: mockImageUrls,
          createdAt: new Date(),
          updatedAt: pastTime,
        },
      ];

      prisma.order.findMany.mockResolvedValue(mockPendingOrders);

      await handler(req, res);

      expect(prisma.order.update).toHaveBeenCalledTimes(2);
      expect(res._getStatusCode()).toBe(200);
      expect(res._getData()).toEqual(JSON.stringify(mockPendingOrders));
    });

    it("updates the order with the correct data for a completed order", async () => {
      const pastTime = new Date();
      pastTime.setHours(pastTime.getHours() - 1);

      const mockPendingOrders: Order[] = [
        {
          owner: mockAddress,
          prompt: "mock-prompt",
          orderId: "mock-order-id",
          ready: true,
          error: false,
          imageUrls: mockImageUrls,
          createdAt: new Date(),
          updatedAt: pastTime,
        },
      ];

      prisma.order.findMany.mockResolvedValue(mockPendingOrders);

      await handler(req, res);

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: {
          orderId: "mock-order-id",
        },
        data: {
          ready: true,
          imageUrls: [
            "https://neural.love/cdn/ai-photostock/1ed9b6c4-80e5-6fc6-8514-45dfcdd2f14f/0.jpg",
            "https://neural.love/cdn/ai-photostock/1ed9b6c4-80e5-6fc6-8514-45dfcdd2f14f/0.jpg",
            "https://neural.love/cdn/ai-photostock/1ed9b6c4-80e5-6fc6-8514-45dfcdd2f14f/0.jpg",
            "https://neural.love/cdn/ai-photostock/1ed9b6c4-80e5-6fc6-8514-45dfcdd2f14f/0.jpg",
          ],
          error: false,
        },
      });
    });

    it("updates the order with the correct data for a pending order", async () => {
      const pastTime = new Date();
      pastTime.setHours(pastTime.getHours() - 1);

      const mockPendingOrders: Order[] = [
        {
          owner: mockAddress,
          prompt: "mock-prompt",
          orderId: "mock-pending-order-id",
          ready: true,
          error: false,
          imageUrls: mockImageUrls,
          createdAt: new Date(),
          updatedAt: pastTime,
        },
      ];

      prisma.order.findMany.mockResolvedValue(mockPendingOrders);

      await handler(req, res);

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: {
          orderId: "mock-pending-order-id",
        },
        data: {
          ready: false,
          imageUrls: [],
          error: false,
        },
      });
    });

    it.only("updates the order with the correct data for a failed order", async () => {
      const pastTime = new Date();
      pastTime.setHours(pastTime.getHours() - 1);

      const mockPendingOrders: Order[] = [
        {
          owner: mockAddress,
          prompt: "mock-prompt",
          orderId: "mock-failed-order-id",
          ready: true,
          error: false,
          imageUrls: mockImageUrls,
          createdAt: new Date(),
          updatedAt: pastTime,
        },
      ];

      prisma.order.findMany.mockResolvedValue(mockPendingOrders);

      await handler(req, res);

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: {
          orderId: "mock-failed-order-id",
        },
        data: {
          ready: true,
          imageUrls: [],
          error: true,
        },
      });
    });
  });
});
