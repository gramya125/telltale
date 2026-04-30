import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET user's recent activity
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const db = await getDatabase();
    
    // Get recent ratings
    const recentRatings = await db
      .collection("ratings")
      .find({ userId: new ObjectId(session.user.id) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    // Get recent reading list updates
    const recentReadingUpdates = await db
      .collection("reading_list")
      .find({ userId: new ObjectId(session.user.id) })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .toArray();

    // Get recent favorites
    const recentFavorites = await db
      .collection("favorites")
      .find({ userId: new ObjectId(session.user.id) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    // Combine all activities
    const activities: any[] = [];

    // Add rating activities
    for (const rating of recentRatings) {
      const book = await db
        .collection("books")
        .findOne({ _id: rating.bookId });

      if (book) {
        activities.push({
          id: rating._id.toString(),
          type: rating.review && rating.review.trim() ? "reviewed" : "rated",
          bookId: book._id.toString(),
          bookTitle: book.title,
          bookAuthor: book.author,
          rating: rating.rating,
          review: rating.review,
          date: rating.createdAt,
          timestamp: rating.createdAt.getTime()
        });
      }
    }

    // Add reading list activities
    for (const item of recentReadingUpdates) {
      const book = await db
        .collection("books")
        .findOne({ _id: item.bookId });

      if (book) {
        let activityType = "added_to_list";
        if (item.status === "read" && item.finishDate) {
          activityType = "finished_reading";
        } else if (item.status === "currently-reading" && item.startDate) {
          activityType = "started_reading";
        }

        activities.push({
          id: item._id.toString(),
          type: activityType,
          bookId: book._id.toString(),
          bookTitle: book.title,
          bookAuthor: book.author,
          status: item.status,
          progress: item.progress,
          date: item.updatedAt,
          timestamp: item.updatedAt.getTime()
        });
      }
    }

    // Add favorite activities
    for (const favorite of recentFavorites) {
      const book = await db
        .collection("books")
        .findOne({ _id: favorite.bookId });

      if (book) {
        activities.push({
          id: favorite._id.toString(),
          type: "favorited",
          bookId: book._id.toString(),
          bookTitle: book.title,
          bookAuthor: book.author,
          date: favorite.createdAt,
          timestamp: favorite.createdAt.getTime()
        });
      }
    }

    // Sort all activities by date (most recent first)
    activities.sort((a, b) => b.timestamp - a.timestamp);

    // Remove duplicates and limit results
    const uniqueActivities = activities
      .filter((activity, index, self) => 
        index === self.findIndex(a => 
          a.bookId === activity.bookId && a.type === activity.type
        )
      )
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      count: uniqueActivities.length,
      activities: uniqueActivities.map(activity => {
        const { timestamp, ...activityWithoutTimestamp } = activity;
        return activityWithoutTimestamp;
      }),
    });
  } catch (error) {
    console.error("Get user activity error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}