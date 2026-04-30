import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const { userId, genres } = await request.json();

    if (!userId || !genres || !Array.isArray(genres)) {
      return NextResponse.json(
        { success: false, message: "Invalid request data" },
        { status: 400 }
      );
    }

    if (genres.length < 3) {
      return NextResponse.json(
        { success: false, message: "Please select at least 3 genres" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if user preferences already exist
    const existing = await db
      .collection("user_genres")
      .findOne({ userId: new ObjectId(userId) });

    if (existing) {
      // Update existing preferences
      await db.collection("user_genres").updateOne(
        { userId: new ObjectId(userId) },
        {
          $set: {
            genres,
            updatedAt: new Date(),
          },
        }
      );
    } else {
      // Create new preferences
      await db.collection("user_genres").insertOne({
        userId: new ObjectId(userId),
        genres,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Genre preferences saved successfully",
    });
  } catch (error) {
    console.error("Genre preferences error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const preferences = await db
      .collection("user_genres")
      .findOne({ userId: new ObjectId(userId) });

    if (!preferences) {
      return NextResponse.json({
        success: true,
        genres: [],
      });
    }

    return NextResponse.json({
      success: true,
      genres: preferences.genres,
    });
  } catch (error) {
    console.error("Get genre preferences error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
