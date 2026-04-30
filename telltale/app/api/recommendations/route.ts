import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET personalized recommendations for user
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
    const limit = parseInt(searchParams.get("limit") || "10");

    const db = await getDatabase();
    
    // Get user's favorite genres
    const userGenres = await db
      .collection("user_genres")
      .findOne({ userId: new ObjectId(session.user.id) });

    // Get user's ratings to understand preferences
    const userRatings = await db
      .collection("ratings")
      .find({ userId: new ObjectId(session.user.id) })
      .toArray();

    // Get books user has already rated/read
    const ratedBookIds = userRatings.map(rating => rating.bookId);
    
    // Get reading list to exclude books already added
    const readingList = await db
      .collection("reading_list")
      .find({ userId: new ObjectId(session.user.id) })
      .toArray();
    
    const readingListBookIds = readingList.map(item => item.bookId);
    
    // Combine excluded books
    const excludedBookIds = [...ratedBookIds, ...readingListBookIds];

    let recommendations: any[] = [];

    if (userGenres && userGenres.genres.length > 0) {
      // Get books from user's favorite genres that they haven't read
      recommendations = await db
        .collection("books")
        .find({
          _id: { $nin: excludedBookIds },
          genres: { $in: userGenres.genres },
          rating: { $gte: 4.0 }, // Only recommend highly rated books
          totalRatings: { $gte: 5 } // Books with enough ratings
        })
        .sort({ rating: -1, totalRatings: -1 })
        .limit(limit)
        .toArray();
    }

    // If not enough recommendations from genres, add popular books
    if (recommendations.length < limit) {
      const additionalBooks = await db
        .collection("books")
        .find({
          _id: { 
            $nin: [
              ...excludedBookIds, 
              ...recommendations.map(book => book._id)
            ] 
          },
          rating: { $gte: 4.0 },
          totalRatings: { $gte: 10 }
        })
        .sort({ rating: -1, totalRatings: -1 })
        .limit(limit - recommendations.length)
        .toArray();

      recommendations = [...recommendations, ...additionalBooks];
    }

    // Add recommendation scores and reasons
    const recommendationsWithScores = recommendations.map(book => {
      let score = book.rating * 20; // Base score from rating
      let reasons = [];

      // Boost score for matching genres
      if (userGenres && userGenres.genres.some(genre => book.genres.includes(genre))) {
        score += 20;
        const matchingGenres = userGenres.genres.filter(genre => book.genres.includes(genre));
        reasons.push(`Matches your favorite genre${matchingGenres.length > 1 ? 's' : ''}: ${matchingGenres.join(', ')}`);
      }

      // Boost score for high ratings
      if (book.rating >= 4.5) {
        score += 10;
        reasons.push("Highly rated by readers");
      }

      // Boost score for popular books
      if (book.totalRatings >= 50) {
        score += 5;
        reasons.push("Popular among readers");
      }

      return {
        ...book,
        recommendationScore: Math.min(100, score),
        recommendationReasons: reasons
      };
    });

    // Sort by recommendation score
    recommendationsWithScores.sort((a, b) => b.recommendationScore - a.recommendationScore);

    return NextResponse.json({
      success: true,
      count: recommendationsWithScores.length,
      recommendations: recommendationsWithScores,
      userGenres: userGenres?.genres || [],
    });
  } catch (error) {
    console.error("Get recommendations error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Save recommendation feedback (like/dislike)
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
    const { bookId, feedback } = body; // feedback: "like" | "dislike" | "not_interested"

    if (!bookId || !ObjectId.isValid(bookId)) {
      return NextResponse.json(
        { success: false, message: "Invalid book ID" },
        { status: 400 }
      );
    }

    if (!["like", "dislike", "not_interested"].includes(feedback)) {
      return NextResponse.json(
        { success: false, message: "Invalid feedback" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Save recommendation feedback
    await db.collection("recommendation_feedback").insertOne({
      userId: new ObjectId(session.user.id),
      bookId: new ObjectId(bookId),
      feedback,
      createdAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: "Feedback saved successfully",
    });
  } catch (error) {
    console.error("Save recommendation feedback error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}