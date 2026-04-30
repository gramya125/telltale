import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET user profile with stats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    
    // Get user basic info
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(session.user.id) });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Get user genres
    const userGenres = await db
      .collection("user_genres")
      .findOne({ userId: new ObjectId(session.user.id) });

    // Calculate reading stats
    const readingList = await db
      .collection("reading_list")
      .find({ userId: new ObjectId(session.user.id) })
      .toArray();

    const ratings = await db
      .collection("ratings")
      .find({ userId: new ObjectId(session.user.id) })
      .toArray();

    const favorites = await db
      .collection("favorites")
      .find({ userId: new ObjectId(session.user.id) })
      .toArray();

    // Calculate stats
    const booksRead = readingList.filter(item => item.status === "read").length;
    const currentlyReading = readingList.filter(item => item.status === "currently-reading").length;
    const wantToRead = readingList.filter(item => item.status === "want-to-read").length;
    const reviewsWritten = ratings.filter(rating => rating.review && rating.review.trim()).length;
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
      : 0;

    // Calculate reading streak (simplified - days with reading activity)
    const recentActivity = await db
      .collection("reading_list")
      .find({ 
        userId: new ObjectId(session.user.id),
        updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      })
      .sort({ updatedAt: -1 })
      .toArray();

    // Find most read genre
    let favoriteGenre = "Fiction";
    if (userGenres && userGenres.genres.length > 0) {
      favoriteGenre = userGenres.genres[0];
    }

    const profile = {
      id: user._id,
      username: user.username,
      email: user.email,
      joinDate: user.createdAt,
      favoriteGenres: userGenres?.genres || [],
      stats: {
        booksRead,
        currentlyReading,
        wantToRead,
        reviewsWritten,
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: ratings.length,
        favoriteBooks: favorites.length,
        currentStreak: Math.min(recentActivity.length, 30), // Simplified streak calculation
        totalPages: booksRead * 300, // Estimated pages (300 per book average)
        favoriteGenre
      }
    };

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { username, favoriteGenres } = body;

    const db = await getDatabase();
    
    const updateData: any = {
      updatedAt: new Date()
    };

    // Update username if provided
    if (username && username.trim()) {
      // Check if username is already taken
      const existingUser = await db
        .collection("users")
        .findOne({ 
          username: username.trim(),
          _id: { $ne: new ObjectId(session.user.id) }
        });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "Username already taken" },
          { status: 400 }
        );
      }

      updateData.username = username.trim();
    }

    // Update user basic info
    if (Object.keys(updateData).length > 1) { // More than just updatedAt
      await db
        .collection("users")
        .updateOne(
          { _id: new ObjectId(session.user.id) },
          { $set: updateData }
        );
    }

    // Update favorite genres if provided
    if (favoriteGenres && Array.isArray(favoriteGenres)) {
      await db
        .collection("user_genres")
        .updateOne(
          { userId: new ObjectId(session.user.id) },
          { 
            $set: { 
              genres: favoriteGenres,
              updatedAt: new Date()
            }
          },
          { upsert: true }
        );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update user profile error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}