import React, { useState } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface GoogleFormsIntegrationProps {
  onQuestionsFetched?: (questions: any[]) => void;
}

export const GoogleFormsIntegration: React.FC<GoogleFormsIntegrationProps> = ({ onQuestionsFetched }) => {
  const [user, setUser] = useState<any>(null);
  const [formId, setFormId] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/forms.body.readonly");
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
    }
  };

  const fetchFormQuestions = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!user) throw new Error("Please sign in with Google first.");
      // Get access token
      const token = (user as any).stsTokenManager?.accessToken || (user as any).accessToken;
      if (!token) throw new Error("No access token found.");
      // Fetch form data from Google Forms API
      const res = await fetch(`https://forms.googleapis.com/v1/forms/${formId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch form. Check Form ID and permissions.");
      const data = await res.json();
      const items = data.items || [];
      setQuestions(items);
      if (onQuestionsFetched) onQuestionsFetched(items);
    } catch (err: any) {
      setError(err.message || "Error fetching form questions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded max-w-xl mx-auto">
      <h2 className="text-lg font-bold mb-2">Google Forms Integration</h2>
      {!user ? (
        <Button onClick={handleGoogleSignIn}>Sign in with Google</Button>
      ) : (
        <div className="mb-2">Signed in as {user.displayName || user.email}</div>
      )}
      <div className="flex gap-2 mb-2">
        <Input
          type="text"
          placeholder="Enter Google Form ID"
          value={formId}
          onChange={e => setFormId(e.target.value)}
          disabled={!user}
        />
        <Button onClick={fetchFormQuestions} disabled={!user || !formId || loading}>
          {loading ? "Loading..." : "Fetch Questions"}
        </Button>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {questions.length > 0 && (
        <div>
          <h3 className="font-semibold mb-1">Questions:</h3>
          <ul className="list-disc pl-5">
            {questions.map((q, idx) => (
              <li key={q.itemId || idx}>{q.title || JSON.stringify(q)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GoogleFormsIntegration;
