import { rest } from "msw";
import * as fs from "fs";
import * as path from "path";

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
];
