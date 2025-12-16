import React, { useState } from "react";

/**
 * Diagnostic component to test the Storyblok Management API
 */
export default function StoryblokDiagnostic() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const addResult = (test, status, details) => {
    setResults((prev) => [...prev, { test, status, details }]);
  };

  const runDiagnostics = async () => {
    setResults([]);
    setLoading(true);

    // Test 1: Check environment variables
    const spaceId = process.env.REACT_APP_STORYBLOK_SPACE_ID;
    const token = process.env.REACT_APP_STORYBLOK_MANAGEMENT_TOKEN;

    if (!spaceId) {
      addResult(
        "Space ID",
        "❌",
        "REACT_APP_STORYBLOK_SPACE_ID not found in .env"
      );
    } else {
      addResult("Space ID", "✅", `Found: ${spaceId}`);
    }

    if (!token) {
      addResult(
        "Management Token",
        "❌",
        "REACT_APP_STORYBLOK_MANAGEMENT_TOKEN not found in .env"
      );
    } else {
      addResult(
        "Management Token",
        "✅",
        `Found: ${token.substring(0, 10)}...`
      );
    }

    // Test 2: Test API connection
    try {
      const response = await fetch(
        `https://mapi.storyblok.com/v1/spaces/${spaceId}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        addResult(
          "API Connection",
          "✅",
          `Successfully connected to space: ${data.space.name}`
        );
      } else {
        addResult(
          "API Connection",
          "❌",
          `API returned ${response.status}: ${response.statusText}`
        );
      }
    } catch (error) {
      addResult("API Connection", "❌", error.message);
    }

    // Test 3: Test asset upload endpoint
    try {
      // Create a small test file
      const testBlob = new Blob(["test"], { type: "image/png" });
      const testFile = new File([testBlob], "test.png", { type: "image/png" });

      const formData = new FormData();
      formData.append("file", testFile);

      const response = await fetch(
        `https://mapi.storyblok.com/v1/spaces/${spaceId}/assets`,
        {
          method: "POST",
          headers: {
            Authorization: token,
          },
          body: formData,
        }
      );

      if (response.ok) {
        addResult("Asset Upload", "✅", "Test upload successful");
      } else {
        const errorText = await response.text();
        addResult(
          "Asset Upload",
          "⚠️",
          `API returned ${response.status}: ${response.statusText}. Error: ${errorText}`
        );
      }
    } catch (error) {
      addResult("Asset Upload", "❌", error.message);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">🔍 Storyblok API Diagnostic</h1>

        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded disabled:opacity-50 mb-6"
        >
          {loading ? "Running diagnostics..." : "Run Diagnostic Tests"}
        </button>

        <div className="space-y-3">
          {results.map((result, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{result.test}</h3>
                <span className="text-2xl">{result.status}</span>
              </div>
              <p className="text-gray-700 text-sm font-mono break-words">
                {result.details}
              </p>
            </div>
          ))}
        </div>

        {results.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-8">
            Click "Run Diagnostic Tests" to check your configuration
          </div>
        )}

        {/* Troubleshooting Guide */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-3">
            📋 Troubleshooting Tips:
          </h3>
          <ul className="text-sm text-yellow-800 space-y-2">
            <li>✓ Ensure .env file has REACT_APP_STORYBLOK_SPACE_ID</li>
            <li>✓ Ensure .env file has REACT_APP_STORYBLOK_MANAGEMENT_TOKEN</li>
            <li>✓ Token must have "upload:asset" permission</li>
            <li>✓ Restart the dev server after changing .env file</li>
            <li>
              ✓ File must be a valid image format (JPG, PNG, GIF, WebP, SVG)
            </li>
            <li>✓ File size should be less than 10MB</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
