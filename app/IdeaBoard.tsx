"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Idea = {
  id: number;
  title: string;
  description: string;
  category: string;
  created_at: string;
};

const CATEGORIES = ["Product", "Engineering", "Process", "Culture", "Other"];

export default function IdeaBoard() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [submitting, setSubmitting] = useState(false);

  const [activeFilter, setActiveFilter] = useState<string>("All");

  useEffect(() => {
    async function loadIdeas() {
      const { data, error } = await supabase
        .from("ideas")
        .select("id, title, description, category, created_at")
        .order("created_at", { ascending: false });

      if (error) setError(error.message);
      else setIdeas(data ?? []);
      setLoading(false);
    }
    loadIdeas();
  }, []);

  async function addIdea(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    if (!trimmedTitle || !trimmedDescription) return;

    setSubmitting(true);
    const { data, error } = await supabase
      .from("ideas")
      .insert({ title: trimmedTitle, description: trimmedDescription, category })
      .select("id, title, description, category, created_at")
      .single();
    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }
    setIdeas((prev) => [data, ...prev]);
    setTitle("");
    setDescription("");
    setCategory(CATEGORIES[0]);
  }

  const visibleIdeas =
    activeFilter === "All" ? ideas : ideas.filter((idea) => idea.category === activeFilter);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-center">Idea Bank</h1>

      {error && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
      )}

      <form
        onSubmit={addIdea}
        className="flex flex-col gap-3 mb-8 rounded-md border border-black/10 dark:border-white/20 p-4"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Idea title"
          className="rounded-md border border-black/10 dark:border-white/20 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description"
          rows={3}
          className="rounded-md border border-black/10 dark:border-white/20 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border border-black/10 dark:border-white/20 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-md bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit idea"}
          </button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {["All", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setActiveFilter(c)}
            className={`rounded-full px-3 py-1 text-sm border transition-colors ${
              activeFilter === c
                ? "bg-blue-600 text-white border-blue-600"
                : "border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-sm text-black/50 dark:text-white/50">Loading...</p>
      ) : visibleIdeas.length === 0 ? (
        <p className="text-center text-sm text-black/50 dark:text-white/50">
          No ideas yet. Be the first to submit one.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visibleIdeas.map((idea) => (
            <div
              key={idea.id}
              className="flex flex-col gap-2 rounded-md border border-black/10 dark:border-white/20 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-medium break-words">{idea.title}</h2>
                <span className="shrink-0 rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5 text-xs">
                  {idea.category}
                </span>
              </div>
              <p className="text-sm text-black/70 dark:text-white/70 break-words">
                {idea.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
