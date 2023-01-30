import { rest } from "msw";
import * as fs from "fs";
import * as path from "path";
import orderResponseFixture from "fixtures/order-response.json";
import orderEstimateFixture from "fixtures/order-estimate.json";
import orderGenerateFixture from "fixtures/order-generate.json";
import trainingStatusFixture from "fixtures/training-status.json";
import trainModelResponseFixture from "fixtures/train-model-response.json";

const deepCopy = (obj: any) => JSON.parse(JSON.stringify(obj));

export const handlers = [
  rest.get("https://mock.image.com/:imageId", (_req, res, ctx) => {
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
      const fixture = deepCopy(orderResponseFixture);
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
  rest.post(
    "https://api.neural.love/v1/ai-art/estimate",
    async (req, res, ctx) => {
      const { customModelId } = await req.json();
      const fixture = deepCopy(orderEstimateFixture);

      if (customModelId === "mock-model-id-with-cost") {
        fixture.price.amount = "10";
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
  rest.post(
    "https://api.neural.love/v1/ai-art/generate",
    async (req, res, ctx) => {
      const { customModelId } = await req.json();
      const fixture = deepCopy(orderGenerateFixture);

      if (customModelId === "mock-model-id-that-fails") {
        return res(
          ctx.set("Content-Type", "application/json"),
          ctx.status(500),
          ctx.body(JSON.stringify({ status: "fail" }))
        );
      }

      return res(
        ctx.set("Content-Type", "application/json"),
        ctx.body(JSON.stringify(fixture))
      );
    }
  ),
  rest.get(
    "https://api.neural.love/v1/ai-art/custom-model/models/:modelId",
    async (req, res, ctx) => {
      const modelId = req.params.modelId;
      const fixture = deepCopy(trainingStatusFixture);

      if (modelId === "mock-model-id-still-training") {
        fixture.status.code = 50;
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
  rest.post(
    "https://api.neural.love/v1/ai-art/custom-model/create",
    async (req, res, ctx) => {
      const fixture = deepCopy(trainModelResponseFixture);

      return res(
        ctx.set("Content-Type", "application/json"),
        ctx.body(JSON.stringify(fixture))
      );
    }
  ),
];
