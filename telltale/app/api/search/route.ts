import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "all";
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: false,
        message: "Query must be at least 2 characters long"
      });
    }

    const db = await getDatabase();
    const results: any = {
      books: [],
      users: [],
      communities: [],
      discussions: []
    };

    // Search books
    if (type === "all" || type === "books") {
      const books = await db
        .collection("books")
        .find({
          $or: [
            { title: { $regex: query, $options: "i" } },
            { author: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { genres: { $in: [new RegExp(query, "i")] } }
          ]
        })
        .limit(limit)
        .toArray();
      
      results.books = books;
    }

    // Search communities
    if (type === "all" || type === "communities") {
      const communities = await db
        .collection("communities")
        .find({
          $or: [
            { name: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
          ]
        })
        .limit(limit)
        .toArray();
      
      results.communities = communities;
    }

    // Mock users (since we don't have a users collection with search data)
    if (type === "all" || type === "users") {
      const mockUsers = [
        {
          _id: "user1",
          username: "bookworm_sarah",
          email: "sarah@example.com",
          name: "Sarah Johnson"
        },
        {
          _id: "user2", 
          username: "sci_fi_mike",
          email: "mike@example.com",
          name: "Mike Chen"
        },
        {
          _id: "user3",
          username: "mystery_lover",
          email: "emma@example.com", 
          name: "Emma Watson"
        }
      ].filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.name.toLowerCase().includes(query.toLowerCase())
      );
      
      results.users = mockUsers.slice(0, limit);
    }

    // Mock discussions
    if (type === "all" || type === "discussions") {
      const mockDiscussions = [
        {
          _id: "disc1",
          title: "What did you think of Dune's ending?",
          author: "SpaceReader42",
          communityName: "Sci-Fi Enthusiasts"
        },
        {
          _id: "disc2",
          title: "Best mystery books of 2024?",
          author: "MysteryFan",
          communityName: "Mystery Lovers Club"
        }
      ].filter(discussion =>
        discussion.title.toLowerCase().includes(query.toLowerCase())
      );
      
      results.discussions = mockDiscussions.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      query,
      results
    });

  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}