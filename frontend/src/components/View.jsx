import { useEffect, useMemo, useState } from "react";
import { Lock, ShieldCheck, X } from "lucide-react";
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
          // Show password modal if protected
          if (data.snipp.protect) {
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

  // Handle password submission
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
          setSnipp(data.snippet); // Update with full snippet data
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

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            The requested snippet could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  if (!snipp) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Snippet Not Found
          </h1>
          <p className="text-gray-700">
            The snippet you're looking for doesn't exist or may have been
            deleted.
          </p>
        </div>
      </div>
    );
  }

  // Password protection modal
  if (showPasswordModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          {/* Header */}
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

          {/* Body */}
          <form onSubmit={handlePasswordSubmit} className="p-4 space-y-4">
            <p className="text-sm text-gray-600">
              This snippet is protected. Please enter the password to view it.
            </p>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                  required
                  autoFocus
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {/* Footer */}
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col space-y-3">
            {/* Top Row - Branding and Language */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Code<span className="text-blue-600">Vault</span>
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Beta
                </span>
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {snipp.lang.toUpperCase()}
              </div>
            </div>

            {/* Middle Row - Snippet Title and Protection Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-gray-900 line-clamp-1">
                  {snipp.name || "Untitled Snippet"}
                </h2>
                {snipp.protect && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                    Protected
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Created: {new Date(snipp.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Description */}
            {snipp.description && (
              <div className="mt-1">
                <p className="text-gray-600 text-sm line-clamp-2">
                  {snipp.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-6 px-4">
        {/* Description */}
        {snipp.desc && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-sm font-medium text-gray-500 mb-2">
              Description
            </h2>
            <p className="text-gray-700 whitespace-pre-line">{snipp.desc}</p>
          </div>
        )}

        {/* Code Editor (Read-only) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">
              {snipp.name || "Code Snippet"}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(snipp.createdAt).toLocaleString()}
            </div>
          </div>
          <div className="h-full">
            <Editor
              value={snipp.code}
              className="h-[60vh]"
              language={snipp.lang.toLowerCase()}
              theme="vs-light"
              options={{
                readOnly: true,
                fontFamily: "'Fira Code', monospace",
                fontLigatures: true,
                fontSize: 14,
                wordWrap: "on",
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                renderWhitespace: "none",
                lineNumbers: "on",
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
