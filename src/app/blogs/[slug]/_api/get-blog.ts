import { axiosInstance } from "@/lib/axios";
import { Blog } from "@/types/blog";
import { cache } from "react";

export const getBlog = cache(async (slug: string) => {
  const { data } = await axiosInstance.get<Blog>(`/blogs/${slug}`);
  return data;
});
