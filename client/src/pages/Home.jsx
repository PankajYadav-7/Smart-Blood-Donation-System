function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">
          🩸 Smart Blood Donation & Emergency Finder
        </h1>
        <p className="mt-4 text-lg text-gray-700">
          A web-based platform for connecting donors and recipients.
        </p>
        <div className="mt-6 flex gap-4 justify-center">
          <a href="/register" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700">
            Register
          </a>
          <a href="/login" className="bg-white text-red-600 border border-red-600 px-6 py-3 rounded-lg hover:bg-red-50">
            Login
          </a>
        </div>
      </div>
    </div>
  );
}

export default Home;