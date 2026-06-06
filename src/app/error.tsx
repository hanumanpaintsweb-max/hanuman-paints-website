'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">
          Kuch galat ho gaya!
        </h2>
        <p className="mb-6 text-gray-600">
          Please try again.
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-orange-500 px-6 py-2 text-white hover:bg-orange-600"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
