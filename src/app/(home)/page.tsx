import BlogList from "./_components/BlogList";
import Jumbotron from "./_components/Jumbotron";

export default function Home() {
  return (
    <main className="container mx-auto px-4">
      <Jumbotron />
      <BlogList />
    </main>
  );
}
