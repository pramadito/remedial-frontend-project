"use client";

import PaginationSection from "@/components/PaginationSection";
import useGetBlogs from "../_hooks/useGetBlogs";
import BlogCard from "./BlogCard";
import BlogCardSkeleton from "./BlogCardSkeleton";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebounceValue } from "usehooks-ts";

const BlogList = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [debounceSearch] = useDebounceValue(search, 500);

  const { data: blogs, isPending } = useGetBlogs({ page, search : debounceSearch });

  return (
    <>
      <Input
        type="text"
        placeholder="Search..."
        className="max-w-md mx-auto mb-8"
        onChange={(e) => setSearch(e.target.value)}
      />
      <section className="grid grid-cols-3 gap-8">
        {isPending && <BlogCardSkeleton count={3} />}

        {blogs?.data.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </section>
      {blogs && (
        <div className="mt-12">
          <PaginationSection meta={blogs?.meta} setPage={setPage} />
        </div>
      )}
    </>
  );
};

export default BlogList;
