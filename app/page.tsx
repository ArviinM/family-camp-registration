import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-yellow-50 via-orange-50 to-sky-50">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          {/* You could potentially add the logo here if desired */}
          {/* <Image src="/path-to-logo.png" alt="The Potter's House Logo" width={150} height={50} className="mx-auto mb-4" /> */}
          <CardTitle className="text-3xl font-bold text-blue-900 tracking-tight sm:text-4xl">
            Laguna District Family Camp 2025
          </CardTitle>
          <CardDescription className="mt-2 text-lg text-yellow-600 font-semibold">
            May 1-2, 2025
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mt-4 text-xl text-gray-700">
            "Growing in Faith, Growing Together"
          </p>
          <p className="mt-1 text-sm text-gray-500">
            ~ 2 Peter 3:18
          </p>

          {/* Placeholder for future content like group display */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-600 mb-4">Camp Groups & Information</h3>
            <div className="text-gray-500">
              Group details will be displayed here soon.
            </div>
          </div>
        </CardContent>
      </Card>

      <footer className="mt-8 text-center text-xs text-gray-400">
        The Potter's House Christian Fellowship Church - Laguna District
      </footer>
    </div>
  );
}
