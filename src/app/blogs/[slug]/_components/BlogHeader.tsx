import { FC } from "react";
import { getBlog } from "../_api/get-blog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Image from "next/image";

interface BlogHeaderProps {
  slug: string;
}

const BlogHeader: FC<BlogHeaderProps> = async ({ slug }) => {
  const blog = await getBlog(slug);

  return (
    <section className="space-y-2">
      <Badge variant="outline" className="bg-green-100 capitalize">
        {blog.category}
      </Badge>
      <h1 className="text-4xl font-bold">{blog.title}</h1>

      <p className="font-extralight">
        {format(new Date(blog.createdAt), "dd MMM yyyy")}
      </p>

      <div className="relative w-full h-[360px]">
        <Image
          src={blog.thumbnail}
          alt="thumbnail"
          className="object-cover"
          fill
        />
      </div>
    </section>
  );
};

export default BlogHeader;
