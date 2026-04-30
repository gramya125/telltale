import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET all books with search and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const genre = searchParams.get("genre");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "rating";

    const db = await getDatabase();
    
    let query: any = {};
    
    // Genre filter
    if (genre && genre !== "all") {
      query.genres = { $in: [genre] };
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Sort options
    let sortQuery: any = {};
    switch (sort) {
      case "rating":
        sortQuery = { rating: -1 };
        break;
      case "newest":
        sortQuery = { publishedDate: -1 };
        break;
      case "oldest":
        sortQuery = { publishedDate: 1 };
        break;
      case "title":
        sortQuery = { title: 1 };
        break;
      default:
        sortQuery = { rating: -1 };
    }

    const books = await db
      .collection("books")
      .find(query)
      .sort(sortQuery)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      count: books.length,
      books,
    });
  } catch (error) {
    console.error("Get books error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Add a new book (admin only for now)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, author, description, genres, publishedDate, isbn } = body;

    if (!title || !author || !description || !genres) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    const newBook = {
      title,
      author,
      description,
      cover: "", // Will be added later
      genres: Array.isArray(genres) ? genres : [genres],
      rating: 0,
      totalRatings: 0,
      publishedDate: publishedDate || new Date().toISOString(),
      isbn: isbn || "",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("books").insertOne(newBook);

    return NextResponse.json({
      success: true,
      message: "Book added successfully",
      bookId: result.insertedId,
    });
  } catch (error) {
    console.error("Add book error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
