'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import Cookies from 'js-cookie'

const LoggedinPage = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    const url = new URL(window.location.href)
    const token = url.searchParams.get('token')

    if (token) {
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] })

      Cookies.set('token', token, {
        sameSite: 'Lax',
        expires: 1  // expires in 1 day
      })
    }

    router.replace('/')
  }, [router, queryClient])

  return <div>Logging you in...</div>
}

export default LoggedinPage
