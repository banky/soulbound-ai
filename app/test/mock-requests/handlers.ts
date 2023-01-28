import { rest } from "msw";
import * as fs from "fs";
import * as path from "path";
import orderResponseFixture from "fixtures/order-response.json";

export const handlers = [
  rest.get("https://mock.image.com/:imageId", (req, res, ctx) => {
    const imageBuffer = fs.readFileSync(
      path.resolve(__dirname, "../../fixtures/1.jpg")
    );

    return res(
      ctx.set("Content-Length", imageBuffer.byteLength.toString()),
      ctx.set("Content-Type", "image/jpeg"),
      ctx.body(imageBuffer)
    );
  }),
  rest.get(
    "https://api.neural.love/v1/ai-art/orders/:orderId",
    (req, res, ctx) => {
      const fixture = orderResponseFixture;
      const orderId = req.params.orderId;

      if (orderId === "mock-pending-order-id") {
        fixture.status.code = 50;

        return res(
          ctx.set("Content-Type", "application/json"),
          ctx.body(JSON.stringify(fixture))
        );
      }

      if (orderId === "mock-failed-order-id") {
        fixture.status.code = 999;

        return res(
          ctx.set("Content-Type", "application/json"),
          ctx.body(JSON.stringify(fixture))
        );
      }

      return res(
        ctx.set("Content-Type", "application/json"),
        ctx.body(JSON.stringify(fixture))
      );
    }
  ),
];
