export interface Blog {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  content: string;
  thumbnail: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
