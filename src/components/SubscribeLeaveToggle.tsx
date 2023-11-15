"use client"
import { useMutation } from "@tanstack/react-query"
import { Button } from "./ui/Button"
import { SubscribeToSubredditPayload } from "@/lib/validators/subreddit"
import axios, { AxiosError } from "axios"
import { useCustomToast } from "@/hooks/use-custom.toast"
import { toast } from "@/hooks/use-toast"
import { startTransition } from "react"
import { useRouter } from "next/navigation"

interface ISubscribeLeaveToggle {
  subredditId: string
  subredditName: string
  isSubscribed: boolean
}

const SubscribeLeaveToggle = ({ subredditId, subredditName, isSubscribed }: ISubscribeLeaveToggle) => {
  const { loginToast } = useCustomToast()
  const router = useRouter()

  const { mutate: subscribe, isLoading: isSubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubredditPayload = {
        subredditId,
      }

      const { data } = await axios.post('/api/subreddit/subscribe', payload)

      return data as string
    },
    onError: (err) => {
      if(err instanceof AxiosError) {
        if(err.response?.status === 401) return loginToast()
      }

      return toast({
        title: 'There was an problem',
        description: "Something went wrong, please try again",
        variant: 'destructive'
      })
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh()
      })

      return toast({
        title: 'Subscribe',
        description: `You are now subscribe to r/${subredditName}`,
      })
    }
  })

  const { mutate: unsubscribe, isLoading: isUnsubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubredditPayload = {
        subredditId,
      }

      const { data } = await axios.post('/api/subreddit/unsubscribe', payload)

      return data as string
    },
    onError: (err) => {
      if(err instanceof AxiosError) {
        if(err.response?.status === 401) return loginToast()
      }

      return toast({
        title: 'There was an problem',
        description: "Something went wrong, please try again",
        variant: 'destructive'
      })
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh()
      })

      return toast({
        title: 'Unsubscribe',
        description: `You are now unsubscribe from r/${subredditName}`,
      })
    }
  })

  return (
    isSubscribed ? (
      <Button isLoading={isUnsubLoading} onClick={() => unsubscribe()} className="w-full mt-1 mb-4">Leave community</Button>
    ): (
      <Button isLoading={isSubLoading} onClick={() => subscribe()} className="w-full mt-1 mb-4">Join to post</Button>
    )
  )
}

export default SubscribeLeaveToggle