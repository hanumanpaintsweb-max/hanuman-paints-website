import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">
          Page nahi mila!
        </h2>
        <p className="mb-6 text-gray-600">
          Please check the link and try again.
        </p>
        <Link
          href="/"
          className="inline-flex rounded-lg bg-orange-500 px-6 py-2 text-white hover:bg-orange-600"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
