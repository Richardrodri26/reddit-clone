import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config"
import { db } from "@/lib/db"
import PostFeed from "./PostFeed"
import { getAuthSession } from "@/lib/auth"


const CustomFeed = async () => {
  
  const session = await getAuthSession()

  const followedComunities = await db.subscription.findMany({
    where: {
      userId: session?.user.id,
    },
    include: {
      subreddit: true,
    }
  })

  const posts = await db.post.findMany({
    where: {
      subreddit: {
        name: {
          in: followedComunities.map(({ subreddit }) => subreddit.id)
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      votes: true,
      author: true,
      comments: true,
      subreddit: true,
    },
    take: INFINITE_SCROLLING_PAGINATION_RESULTS,
  })


  return <PostFeed initalPosts={posts} />
}

export default CustomFeed