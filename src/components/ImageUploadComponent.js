import React, { useState } from "react";
import {
  uploadAsset,
  getAssets,
  deleteAsset,
} from "../utils/storyblokManagement";
import { StoryblokComponent, storyblokEditable } from "@storyblok/react";
/**
 * Image Upload Component with Preview
 */
export default function ImageUploadComponent({ blok }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedAssets, setUploadedAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [message, setMessage] = useState("");

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Upload single image
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select an image first");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setMessage("❌ File size exceeds 10MB limit");
        setUploading(false);
        return;
      }

      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
      ];
      if (!validTypes.includes(file.type)) {
        setMessage(
          "❌ Please select a valid image file (JPG, PNG, GIF, WebP, SVG)"
        );
        setUploading(false);
        return;
      }

      // Check if credentials are set
      if (
        !process.env.REACT_APP_STORYBLOK_SPACE_ID ||
        !process.env.REACT_APP_STORYBLOK_MANAGEMENT_TOKEN
      ) {
        setMessage("❌ Missing Storyblok credentials. Check your .env file.");
        setUploading(false);
        return;
      }

      const result = await uploadAsset(file);

      setMessage(`✅ Image uploaded successfully!`);
      console.log("Upload result:", result);

      // Reset form
      setFile(null);
      setPreview(null);

      // Refresh assets list
      fetchAssets();
    } catch (error) {
      console.error("Full error:", error);
      const errorMsg = error.message || "Unknown error occurred";
      setMessage(`❌ Upload failed: ${errorMsg}`);
    } finally {
      setUploading(false);
    }
  };

  // Fetch all assets
  const fetchAssets = async () => {
    setLoadingAssets(true);
    try {
      const assets = await getAssets();
      setUploadedAssets(assets || []);
      console.log("Assets fetched:", assets);
    } catch (error) {
      setMessage(`❌ Failed to fetch assets: ${error.message}`);
    } finally {
      setLoadingAssets(false);
    }
  };

  // Delete an asset
  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) {
      return;
    }

    try {
      await deleteAsset(assetId);
      setMessage("✅ Asset deleted successfully");
      fetchAssets();
    } catch (error) {
      setMessage(`❌ Failed to delete asset: ${error.message}`);
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto p-6 space-y-8"
      {...storyblokEditable(blok)}
    >
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">{blok.title}</h1>

        {/* Upload Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload New Image</h2>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {preview ? (
              <div className="mb-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded"
                />
                <p className="mt-2 text-sm text-gray-600">{file.name}</p>
                <p className="text-xs text-gray-500">
                  Size: {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <div className="py-8">
                <p className="text-gray-600 mb-2">
                  📁 Choose an image to upload
                </p>
                <p className="text-xs text-gray-500">
                  Supported: JPG, PNG, GIF, WebP
                </p>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer disabled:opacity-50"
            >
              Select Image
            </label>
          </div>

          {message && (
            <div
              className={`mt-4 p-3 rounded ${
                message.includes("✅")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
        </div>

        {/* Assets List Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Assets</h2>
            <button
              onClick={fetchAssets}
              disabled={loadingAssets}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {loadingAssets ? "Loading..." : "Refresh"}
            </button>
          </div>

          {loadingAssets ? (
            <p className="text-center text-gray-500">Loading assets...</p>
          ) : uploadedAssets.length === 0 ? (
            <p className="text-center text-gray-500">No assets yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="border rounded-lg overflow-hidden shadow"
                >
                  <img
                    src={asset.filename}
                    alt={asset.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <p className="font-semibold text-sm truncate">
                      {asset.name}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">ID: {asset.id}</p>

                    {/* Copy URL Button */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(asset.filename);
                        alert("URL copied to clipboard!");
                      }}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold py-2 px-2 rounded mb-2"
                    >
                      Copy URL
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="w-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2 px-2 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
