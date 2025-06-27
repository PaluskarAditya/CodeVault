import { Editor } from "@monaco-editor/react";
import { useEffect, useState, useMemo } from "react";
import { nanoid } from "nanoid";
import {
  Save,
  Share2,
  Copy,
  Lock,
  Globe,
  Clock,
  LockIcon,
  XIcon,
  ShieldCheckIcon,
} from "lucide-react";

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = useMemo(() => urlParams.get("id"), []);
  const [isProtected, setIsProtected] = useState(false);
  const [protectModal, setProtectModal] = useState(false);
  const [snipp, setSnipp] = useState({
    uuid: id,
    name: "",
    code: "",
    desc: "",
    visibility: "public",
    expiry: "none",
    lang: "python",
    pass: "",
    confPass: "",
    protect: isProtected ? true : false,
  });
  const [qrUrl, setQrUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle missing ID in URL
  useEffect(() => {
    if (!id) {
      const newId = nanoid(8);
      urlParams.set("id", newId);
      window.location.search = urlParams.toString();
    } else {
      setQrUrl(
        `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
          window.location.href
        )}`
      );
    }
  }, [id]);

  // Fetch Snippet if ID exists
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    const getSnipp = async () => {
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

        if (!res.ok) return;

        const data = await res.json();
        if (data.success && data.snipp) {
          const { name, description, code, visibility, expiry, lang, protect } =
            data.snipp;
          setSnipp((prev) => ({
            ...prev,
            name,
            desc: description,
            code,
            visibility,
            expiry,
            lang,
            protect,
          }));
          setIsProtected(isProtected);
        }
      } catch (err) {
        console.error("Error fetching snippet:", err.message);
      } finally {
        setIsLoading(false);
      }
    };

    getSnipp();
  }, [id]);

  // Handle Create / Save
  const handleSnippCreate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(snipp),
        }
      );

      if (!res.ok) return;

      const data = await res.json();
      if (data.success && data.snip) {
        const { name, desc, code } = data.snip;
        setSnipp((prev) => ({ ...prev, name, desc, code }));
      }
    } catch (err) {
      console.error("Error saving snippet:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${window.location.origin}/view?id=${id}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* {Password Protection Modal} */}
      {protectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Password Protection
              </h2>
              <button className="text-gray-500 hover:text-gray-700 transition-colors">
                <XIcon
                  className="w-5 h-5"
                  onClick={() => setProtectModal(false)}
                />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600">
                Set a password to protect this snippet. Users will need to enter
                this password to access it.
              </p>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={snipp.pass}
                    onChange={(e) =>
                      setSnipp((prev) => ({ ...prev, pass: e.target.value }))
                    }
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={snipp.confPass}
                    onChange={(e) =>
                      setSnipp((prev) => ({
                        ...prev,
                        confPass: e.target.value,
                      }))
                    }
                    placeholder="Confirm your password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 flex justify-end gap-3 border-t">
              <button
                onClick={() => setProtectModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsProtected(true);
                  setProtectModal(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Save Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-gray-800">
            Code<span className="text-blue-600">Vault</span>
          </h1>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Beta
          </span>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setProtectModal(!snipp.protect && true)}
            className="flex items-center space-x-1 px-4 py-2 rounded-md  text-black bg-gray-200 hover:bg-gray-400 transition-colors"
          >
            {isProtected ? (
              <ShieldCheckIcon className="w-4 h-4" />
            ) : (
              <LockIcon className="w-4 h-4" />
            )}
            <p>{snipp.protect ? "Protected" : "Protect"}</p>
          </button>
          <button
            onClick={handleSnippCreate}
            disabled={isLoading}
            className={`flex items-center space-x-1 px-4 py-2 rounded-md ${
              isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white transition-colors`}
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? "Saving..." : "Save"}</span>
          </button>
          <button className="flex items-center space-x-1 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Language Selector */}
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center">
            <select
              value={snipp.lang}
              onChange={(e) =>
                setSnipp((prev) => ({ ...prev, lang: e.target.value }))
              }
              className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="java">Java</option>
              <option value="csharp">C#</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              value={snipp.code}
              onChange={(val) => setSnipp((prev) => ({ ...prev, code: val }))}
              className="h-full"
              defaultValue="// Enter your code here"
              language={snipp.lang.toLowerCase()}
              theme="vs-light"
              options={{
                fontFamily: "'Fira Code', monospace",
                fontLigatures: true,
                fontSize: 14,
                wordWrap: "on",
                automaticLayout: true,
                minimap: { enabled: true },
                padding: { top: 12 },
                scrollBeyondLastLine: false,
                renderWhitespace: "selection",
              }}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Snippet Details
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Name */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={snipp.name}
                onChange={(e) =>
                  setSnipp((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="My Awesome Snippet"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={snipp.desc}
                onChange={(e) =>
                  setSnipp((prev) => ({ ...prev, desc: e.target.value }))
                }
                placeholder="What does this snippet do?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Visibility */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Visibility
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setSnipp((prev) => ({ ...prev, visibility: "public" }))
                  }
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm ${
                    snipp.visibility === "public"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>Public</span>
                </button>
                <button
                  onClick={() =>
                    setSnipp((prev) => ({ ...prev, visibility: "private" }))
                  }
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm ${
                    snipp.visibility === "private"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Private</span>
                </button>
              </div>
            </div>

            {/* Expiry */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Expiration
              </label>
              <div className="relative">
                <input className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md text-sm truncate bg-gray-50" type="date" value={snipp.expiry} onChange={e => setSnipp({...snipp, expiry: e.target.value})} />
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Share URL */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Share URL
              </label>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/view?id=${id}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md text-sm truncate bg-gray-50"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-r-md transition-colors text-sm flex items-center"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {isCopied && (
                <p className="text-xs text-green-600">Copied to clipboard!</p>
              )}
            </div>

            {/* QR Code */}
            {qrUrl && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  QR Code
                </label>
                <div className="p-3 bg-white border border-gray-200 rounded-md flex justify-center">
                  <img src={qrUrl} alt="QR Code" className="rounded-md" />
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Scan to open on mobile
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
