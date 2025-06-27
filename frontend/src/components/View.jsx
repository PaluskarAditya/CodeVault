import { useEffect, useMemo, useState } from "react";
import { Lock, ShieldCheck, X, Copy, Home } from "lucide-react";
import { useParams } from "react-router-dom";
import { Editor } from "@monaco-editor/react";

export default function View() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = useMemo(() => urlParams.get("id"), []);
  const [snipp, setSnipp] = useState(null);
  const [password, setPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  // Fetch snippet data
  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/snipp`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              id: id,
            },
          }
        );

        if (!res.ok) {
          if (res.status === 410) {
            throw new Error("This snippet has expired.");
          } else {
            throw new Error("Snippet not found or deleted.");
          }
        }

        const data = await res.json();
        if (data.success && data.snipp) {
          setSnipp(data.snipp);
          if (data.snipp.isProtected) {
            setShowPasswordModal(true);
          }
        }
      } catch (err) {
        console.error("Error fetching snippet:", err.message);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSnippet();
  }, [id]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/verify-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            password,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        if (data.snippet) {
          setSnipp(data.snippet);
        }
        setShowPasswordModal(false);
      } else {
        setError(data.error || "Incorrect password");
      }
    } catch (err) {
      setError("Error verifying password");
      console.error("Password verification error:", err);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-600 to-gray-800 p-4 text-center">
            <svg
              className="w-10 h-10 mx-auto text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="mt-2 text-xl font-bold text-white">Error</h2>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  {error.includes("expired") ? "Expired Snippet" : "Error Loading Snippet"}
                </h3>
                <p className="mt-1 text-sm text-gray-600">{error}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={() => (window.location.href = "/")}
                  className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </button>
                <button
                  onClick={copyToClipboard}
                  className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!snipp) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-600 to-gray-800 p-4 text-center">
            <svg
              className="w-10 h-10 mx-auto text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="mt-2 text-xl font-bold text-white">Snippet Not Found</h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Content Unavailable</h3>
                <p className="mt-1 text-sm text-gray-600">
                  The requested snippet doesn't exist or may have been deleted.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={() => (window.location.href = "/")}
                  className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Create New Snippet
                </button>
                <button
                  onClick={copyToClipboard}
                  className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Report Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (snipp.visibility === "private") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-center">
            <Lock className="w-8 h-8 mx-auto text-white" />
            <h2 className="mt-2 text-xl font-bold text-white">Private Snippet</h2>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ShieldCheck className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Access Restricted</h3>
                <p className="mt-1 text-sm text-gray-600">
                  This snippet is marked as private by its owner.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={() => (window.location.href = "/")}
                  className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </button>
                <button
                  onClick={copyToClipboard}
                  className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Password protection modal
  if (showPasswordModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Password Required
            </h2>
            <button
              onClick={() => (window.location.href = "/")}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handlePasswordSubmit} className="p-4 space-y-4">
            <p className="text-sm text-gray-600">
              This snippet is protected. Please enter the password to view it.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                  autoFocus
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="bg-gray-50 px-4 py-3 flex justify-end gap-3 border-t">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Unlock
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Main view content
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
          <div className="flex flex-col space-y-2">
            {/* Top Row - Branding and Language */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Code<span className="text-blue-600">Vault</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Beta
                </span>
              </div>
              <div className="text-xs sm:text-sm px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                {snipp.lang.toUpperCase()}
              </div>
            </div>

            {/* Middle Row - Snippet Title and Protection Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2 overflow-hidden">
                <h2 className="text-lg font-semibold text-gray-900 truncate">
                  {snipp.name || "Untitled Snippet"}
                </h2>
                {snipp.protect && (
                  <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Protected
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                Created: {new Date(snipp.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Description */}
            {snipp.description && (
              <div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {snipp.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4">
        {/* Description (only show if exists) */}
        {snipp.desc && (
          <div className="mb-4 p-3 bg-white rounded-lg shadow-sm border border-gray-200 sm:p-4">
            <h2 className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">
              Description
            </h2>
            <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">
              {snipp.desc}
            </p>
          </div>
        )}

        {/* Code Editor (Read-only) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
          <div className="bg-gray-100 border-b border-gray-200 px-3 py-2 flex items-center justify-between">
            <div className="text-xs sm:text-sm font-medium text-gray-700 truncate">
              {snipp.name || "Code Snippet"}
            </div>
            <div className="text-xs text-gray-500 hidden sm:block">
              {new Date(snipp.createdAt).toLocaleString()}
            </div>
          </div>
          <div className="h-[calc(100vh-220px)] sm:h-[60vh]">
            <Editor
              value={snipp.code}
              language={snipp.lang.toLowerCase()}
              theme="vs-light"
              options={{
                readOnly: true,
                fontFamily: "'Fira Code', monospace",
                fontLigatures: true,
                fontSize: 13,
                wordWrap: "on",
                minimap: { enabled: window.innerWidth > 640 }, // Only show on desktop
                scrollBeyondLastLine: false,
                renderWhitespace: "none",
                lineNumbers: "on",
                automaticLayout: true,
              }}
            />
          </div>
        </div>
      </main>

      {/* Mobile Floating Action Button */}
      <div className="sm:hidden fixed bottom-4 right-4 flex space-x-2">
        <button
          onClick={copyToClipboard}
          className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Copy className="w-5 h-5" />
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="p-3 bg-gray-200 text-gray-700 rounded-full shadow-lg hover:bg-gray-300 transition-colors"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}