"use client"
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config"
import { ExtendedPost } from "@/types/db"
import { useIntersection } from '@mantine/hooks'
import { useInfiniteQuery } from "@tanstack/react-query"
import axios from "axios"
import { useSession } from "next-auth/react"
import { useRef } from "react"
import Post from "./Post"

interface Props {
  initalPosts: ExtendedPost[],
  subredditName?: string
}

const PostFeed = ({ initalPosts, subredditName }: Props) => {

  const lastPostRef = useRef<HTMLElement>(null)
  const { ref, entry } = useIntersection({
    root:lastPostRef.current,
    threshold: 1
  })

  const { data: session } = useSession()

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(['infinity-query'],
  async ({ pageParam = 1 }) => {
    const query = `/api/posts/?limit=${INFINITE_SCROLLING_PAGINATION_RESULTS}&page=${pageParam}` + (!!subredditName ? `&subredditName=${subredditName}` : '')

    const { data } = await axios.get(query)

    return data as ExtendedPost[]
  },
  {
    getNextPageParam: (_, pages) => {
      return pages.length + 1
    },
    initialData: {
      pages: [initalPosts], pageParams: [1]
    }
  })

  const posts = data?.pages.flatMap((page) => page) ?? initalPosts

  return (
    <ul className="flex flex-col col-span-2 space-y-6">
      {
        posts.map((post, index) => {
          const votesAmt = post.votes.reduce((acc, vote) => {
            if(vote.type === 'UP') return acc + 1
            if(vote.type === 'DOWN') return acc - 1

            return acc
          }, 0)

          const currentVote = post.votes.find(vote => vote.userId === session?.user.id)



          if(index === posts.length - 1) {
            return (
              <li key={post.id} ref={ref}>
                <Post commentAmt={post.comments.length} post={post} subredditName={post.subreddit.name} />
              </li>
            )
          } else {
            return <Post commentAmt={post.comments.length} post={post} key={post.id} subredditName={post.subreddit.name} />
          }
        })
      }
    </ul>
  )
}

export default PostFeed