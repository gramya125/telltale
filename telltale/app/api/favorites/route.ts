import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET user's favorite books
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
    
    const favorites = await db
      .collection("favorites")
      .find({ userId: new ObjectId(session.user.id) })
      .sort({ createdAt: -1 })
      .toArray();

    // Get book details for favorites
    const bookIds = favorites.map(fav => fav.bookId);
    const books = await db
      .collection("books")
      .find({ _id: { $in: bookIds } })
      .toArray();

    return NextResponse.json({
      success: true,
      count: favorites.length,
      favorites: favorites.map(fav => ({
        ...fav,
        book: books.find(book => book._id.toString() === fav.bookId.toString())
      })),
    });
  } catch (error) {
    console.error("Get favorites error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Add book to favorites
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
    const { bookId } = body;

    if (!bookId || !ObjectId.isValid(bookId)) {
      return NextResponse.json(
        { success: false, message: "Invalid book ID" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Check if already favorited
    const existingFavorite = await db
      .collection("favorites")
      .findOne({
        userId: new ObjectId(session.user.id),
        bookId: new ObjectId(bookId)
      });

    if (existingFavorite) {
      return NextResponse.json(
        { success: false, message: "Book already in favorites" },
        { status: 400 }
      );
    }

    // Add to favorites
    await db.collection("favorites").insertOne({
      userId: new ObjectId(session.user.id),
      bookId: new ObjectId(bookId),
      createdAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: "Book added to favorites",
    });
  } catch (error) {
    console.error("Add favorite error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove book from favorites
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");

    if (!bookId || !ObjectId.isValid(bookId)) {
      return NextResponse.json(
        { success: false, message: "Invalid book ID" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    const result = await db
      .collection("favorites")
      .deleteOne({
        userId: new ObjectId(session.user.id),
        bookId: new ObjectId(bookId)
      });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Favorite not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Book removed from favorites",
    });
  } catch (error) {
    console.error("Remove favorite error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}