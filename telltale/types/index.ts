export interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserGenre {
  _id: string;
  userId: string;
  genres: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  cover: string;
  isbn: string;
  publishedDate: Date;
  genres: string[];
  rating: number;
  totalRatings: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Rating {
  _id: string;
  userId: string;
  bookId: string;
  rating: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Recommendation {
  _id: string;
  userId: string;
  bookId: string;
  score: number;
  reason: string;
  createdAt: Date;
}

export interface Community {
  _id: string;
  name: string;
  description: string;
  bookId?: string;
  coverImage: string;
  createdBy: string;
  members: string[];
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  _id: string;
  communityId: string;
  userId: string;
  username: string;
  avatar?: string;
  message: string;
  createdAt: Date;
}
