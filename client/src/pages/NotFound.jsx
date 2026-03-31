import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import { Droplets, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <Droplets className="h-12 w-12 text-red-400" />
        </div>
        <h1 className="text-8xl font-bold text-red-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-8 text-lg">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};
export default NotFound;