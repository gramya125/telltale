import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET user's reading list
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
    const status = searchParams.get("status"); // "want-to-read", "currently-reading", "read"

    const db = await getDatabase();
    
    let query: any = { userId: new ObjectId(session.user.id) };
    if (status) {
      query.status = status;
    }

    const readingList = await db
      .collection("reading_list")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Get book details
    const bookIds = readingList.map(item => item.bookId);
    const books = await db
      .collection("books")
      .find({ _id: { $in: bookIds } })
      .toArray();

    return NextResponse.json({
      success: true,
      count: readingList.length,
      readingList: readingList.map(item => ({
        ...item,
        book: books.find(book => book._id.toString() === item.bookId.toString())
      })),
    });
  } catch (error) {
    console.error("Get reading list error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Add book to reading list
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
    const { bookId, status = "want-to-read" } = body;

    if (!bookId || !ObjectId.isValid(bookId)) {
      return NextResponse.json(
        { success: false, message: "Invalid book ID" },
        { status: 400 }
      );
    }

    const validStatuses = ["want-to-read", "currently-reading", "read"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Check if book is already in reading list
    const existingItem = await db
      .collection("reading_list")
      .findOne({
        userId: new ObjectId(session.user.id),
        bookId: new ObjectId(bookId)
      });

    if (existingItem) {
      // Update status if different
      if (existingItem.status !== status) {
        await db
          .collection("reading_list")
          .updateOne(
            { _id: existingItem._id },
            { 
              $set: { 
                status,
                updatedAt: new Date()
              }
            }
          );
        
        return NextResponse.json({
          success: true,
          message: "Reading status updated",
        });
      } else {
        return NextResponse.json(
          { success: false, message: "Book already in reading list with this status" },
          { status: 400 }
        );
      }
    }

    // Add to reading list
    await db.collection("reading_list").insertOne({
      userId: new ObjectId(session.user.id),
      bookId: new ObjectId(bookId),
      status,
      progress: 0, // percentage read
      startDate: status === "currently-reading" ? new Date() : null,
      finishDate: status === "read" ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: "Book added to reading list",
    });
  } catch (error) {
    console.error("Add to reading list error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update reading progress
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
    const { bookId, status, progress } = body;

    if (!bookId || !ObjectId.isValid(bookId)) {
      return NextResponse.json(
        { success: false, message: "Invalid book ID" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    const updateData: any = {
      updatedAt: new Date()
    };

    if (status) {
      updateData.status = status;
      if (status === "currently-reading" && !updateData.startDate) {
        updateData.startDate = new Date();
      }
      if (status === "read") {
        updateData.finishDate = new Date();
        updateData.progress = 100;
      }
    }

    if (progress !== undefined) {
      updateData.progress = Math.max(0, Math.min(100, progress));
    }

    const result = await db
      .collection("reading_list")
      .updateOne(
        {
          userId: new ObjectId(session.user.id),
          bookId: new ObjectId(bookId)
        },
        { $set: updateData }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Book not found in reading list" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reading progress updated",
    });
  } catch (error) {
    console.error("Update reading progress error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove book from reading list
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
      .collection("reading_list")
      .deleteOne({
        userId: new ObjectId(session.user.id),
        bookId: new ObjectId(bookId)
      });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Book not found in reading list" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Book removed from reading list",
    });
  } catch (error) {
    console.error("Remove from reading list error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}