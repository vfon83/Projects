'use client'

import Link from 'next/link'
import { SignOutButton } from './SignOutButton'
import { useSession } from './Providers'

export function Navigation() {
  const { session, isLoading } = useSession()

  if (isLoading || !session) {
    return null
  }

  const userName = session.user.user_metadata?.name

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex flex-col">
                <span className="text-2xl font-bold text-green-600">CAMP</span>
                <span className="text-mi text-green-800">Construction AI Management Platform</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/projects"
                className="border-transparent text-gray-500 hover:border-green-300 hover:text-green-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Projects
              </Link>
              <Link
                href="/documents"
                className="border-transparent text-gray-500 hover:border-green-300 hover:text-green-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Documents
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <span className="text-gray-700 text-sm font-medium">
              {userName}
            </span>
            <SignOutButton />
          </div>
        </div>
      </div>
    </nav>
  )
} 