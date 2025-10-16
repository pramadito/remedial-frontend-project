import { FC } from "react";
import { getBlog } from "../_api/get-blog";
import Markdown from "@/components/Markdown";

interface BlogBodyProps {
  slug: string;
}

const BlogBody: FC<BlogBodyProps> = async ({ slug}) => {
  const blog = await getBlog(slug);

  return (
    <section className="mt-8">
      <Markdown content={blog.content} />
    </section>
  );
};

export default BlogBody;
