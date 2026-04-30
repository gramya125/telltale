import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET user ratings or book ratings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const bookId = searchParams.get("bookId");

    const db = await getDatabase();
    
    let query: any = {};
    
    if (userId && ObjectId.isValid(userId)) {
      query.userId = new ObjectId(userId);
    }
    
    if (bookId && ObjectId.isValid(bookId)) {
      query.bookId = new ObjectId(bookId);
    }

    const ratings = await db
      .collection("ratings")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      count: ratings.length,
      ratings,
    });
  } catch (error) {
    console.error("Get ratings error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Add or update rating
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookId, rating, review } = body;

    if (!bookId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Invalid rating data" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(bookId)) {
      return NextResponse.json(
        { success: false, message: "Invalid book ID" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Check if user already rated this book
    const existingRating = await db
      .collection("ratings")
      .findOne({
        userId: new ObjectId(session.user.id),
        bookId: new ObjectId(bookId)
      });

    const ratingData: {
      userId: any;
      bookId: any;
      rating: number;
      review: any;
      updatedAt: Date;
      createdAt?: Date;
    } = {
      userId: new ObjectId(session.user.id),
      bookId: new ObjectId(bookId),
      rating: parseInt(rating),
      review: review || "",
      updatedAt: new Date()
    };

    if (existingRating) {
      // Update existing rating
      await db
        .collection("ratings")
        .updateOne(
          { _id: existingRating._id },
          { $set: ratingData }
        );
    } else {
      // Create new rating
      ratingData.createdAt = new Date();
      await db.collection("ratings").insertOne(ratingData);
    }

    // Update book's average rating
    const allRatings = await db
      .collection("ratings")
      .find({ bookId: new ObjectId(bookId) })
      .toArray();

    const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
    
    await db
      .collection("books")
      .updateOne(
        { _id: new ObjectId(bookId) },
        { 
          $set: { 
            rating: Math.round(avgRating * 10) / 10,
            totalRatings: allRatings.length,
            updatedAt: new Date()
          }
        }
      );

    return NextResponse.json({
      success: true,
      message: existingRating ? "Rating updated successfully" : "Rating added successfully",
    });
  } catch (error) {
    console.error("Add/update rating error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}