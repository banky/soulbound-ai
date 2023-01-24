import { Order, PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  switch (req.method) {
    case "GET":
      await getOrders(req, res);
      break;

    default:
      res.status(400).json({ message: "Invalid method" });
  }
}

const getOrders = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  const prisma = new PrismaClient();
  const { address } = req.query;

  if (typeof address !== "string") {
    return res.status(401).json({
      message: "Invalid address for orders",
    });
  }

  const pendingOrders = await prisma.order.findMany({
    where: {
      owner: address,
      ready: false,
    },
  });

  const updatedOrders = await Promise.all(
    pendingOrders.map((order) => {
      return getNeuralLoveOrder(order);
    })
  );

  for (let index = 0; index < pendingOrders.length; index++) {
    const order = pendingOrders[index];
    const updatedOrder = updatedOrders[index];

    await prisma.order.update({
      where: {
        orderId: order.orderId,
      },
      data: {
        ready: updatedOrder.ready,
        imageUrls: updatedOrder.imageUrls,
      },
    });
  }

  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      owner: address,
    },
  });

  res.status(200).json(orders);
};

const getNeuralLoveOrder = async (order: Order) => {
  const orderResponse = await fetch(
    `https://api.neural.love/v1/ai-art/orders/${order.orderId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.NEURAL_LOVE_API_KEY}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  const updatedOrder = await orderResponse.json();
  const output = updatedOrder.output;
  const status = updatedOrder.status.code;

  if (status === 250) {
    const imageUrls: string[] = output.map((generatedImage: any) => {
      return generatedImage.full;
    });

    return {
      ready: true,
      imageUrls: imageUrls,
    };
  }

  return {
    ready: false,
    imageUrls: [],
  };
};
