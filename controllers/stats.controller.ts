import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ProductCollection from "../models/Product";
import UserCollection from "../models/Users";
import NewsletterCollection from "../models/Newsletter";

const getStoreStats = async (req: Request, res: Response) => {
  const [productCount, ratingAgg, user] = await Promise.all([
    ProductCollection.countDocuments(),
    ProductCollection.aggregate<{ avgRating: number | null }>([
      { $group: { _id: null, avgRating: { $avg: "$details.rating" } } },
    ]),
    UserCollection.findById(req.user?.userId).select("email"),
  ]);

  const isSubscribed = user?.email
    ? Boolean(
        await NewsletterCollection.findOne({
          email: user.email.toLowerCase(),
        })
      )
    : false;

  const averageRating = Number((ratingAgg[0]?.avgRating ?? 0).toFixed(1));

  res.status(StatusCodes.OK).json({
    success: true,
    stats: {
      productCount,
      averageRating,
      newsletterDiscount: isSubscribed ? 0 : 20,
      isSubscribed,
    },
  });
};

export { getStoreStats };
