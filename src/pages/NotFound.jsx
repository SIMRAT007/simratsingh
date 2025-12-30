import { Link } from 'react-router-dom'
import notFoundImage from '../assets/404.png'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* 404 Image */}
      <div className="mb-8">
        <img
          src={notFoundImage}
          alt="404 - Page Not Found"
          className="w-full max-w-md h-auto"
        />
      </div>

      {/* Text Content */}
      <div className="text-center max-w-lg">
        <h1 className="text-2xl md:text-3xl font-bold text-black mb-4">
          Oops! Page Not Found
        </h1>
        <p className="text-gray-500 mb-8">
          The page you're looking for seems to have wandered off. 
          It might have been moved, deleted, or never existed in the first place.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </Link>
          <a
            href="mailto:your@email.com"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-gray-300 text-gray-700 font-medium hover:bg-black hover:text-white hover:border-black transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            Contact Me
          </a>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-8 text-center">
        <p className="text-gray-400 text-sm">
          Error Code: <span className="font-mono font-semibold">404</span>
        </p>
      </div>
    </div>
  )
}

export default NotFound

