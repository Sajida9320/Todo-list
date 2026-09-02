"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Idea = {
  id: number;
  title: string;
  description: string;
  category: string;
  author: string;
  votes: number;
  status: string;
  created_at: string;
};

const CATEGORIES = ["Product", "Engineering", "Process", "Culture", "Other"];

const CATEGORY_STYLES: Record<string, string> = {
  Product: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Engineering: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
  Process: "bg-teal-500/10 text-teal-700 dark:text-teal-400",
  Culture: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
  Other: "bg-slate-500/10 text-slate-700 dark:text-slate-400",
};

const STATUS_STYLES: Record<string, string> = {
  New: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  "Under review": "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Approved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Rejected: "bg-red-500/10 text-red-700 dark:text-red-400",
};

const inputClasses =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-shadow focus:ring-2 focus:ring-purple-500";
const labelClasses = "text-xs font-medium uppercase tracking-wide text-muted";

export default function IdeaBoard() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [author, setAuthor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [activeFilter, setActiveFilter] = useState<string>("All");

  useEffect(() => {
    async function loadIdeas() {
      const { data, error } = await supabase
        .from("ideas")
        .select("id, title, description, category, author, votes, status, created_at")
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
    const trimmedAuthor = author.trim();
    const { data, error } = await supabase
      .from("ideas")
      .insert({
        title: trimmedTitle,
        description: trimmedDescription,
        category,
        ...(trimmedAuthor && { author: trimmedAuthor }),
      })
      .select("id, title, description, category, author, votes, status, created_at")
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
    setAuthor("");
  }

  async function upvote(id: number, currentVotes: number) {
    setIdeas((prev) =>
      prev.map((idea) => (idea.id === id ? { ...idea, votes: currentVotes + 1 } : idea))
    );

    const { error } = await supabase
      .from("ideas")
      .update({ votes: currentVotes + 1 })
      .eq("id", id);

    if (error) {
      setError(error.message);
      setIdeas((prev) =>
        prev.map((idea) => (idea.id === id ? { ...idea, votes: currentVotes } : idea))
      );
    }
  }

  const visibleIdeas =
    activeFilter === "All" ? ideas : ideas.filter((idea) => idea.category === activeFilter);

  return (
    <div className="flex flex-col gap-10">
      {error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <form
        onSubmit={addIdea}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm"
      >
        <div>
          <h2 className="text-base font-semibold">Submit an idea</h2>
          <p className="text-sm text-muted">Share something that could help the team.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClasses}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your idea a short title"
            className={inputClasses}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClasses}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's the idea, and why does it matter?"
            rows={3}
            className={`${inputClasses} resize-none`}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className={labelClasses}>Your name</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Optional"
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClasses}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClasses}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="self-end rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-purple-700 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit idea"}
        </button>
      </form>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setActiveFilter(c)}
              className={`rounded-full px-3 py-1 text-sm font-medium border transition-colors ${
                activeFilter === c
                  ? "bg-purple-600 text-white border-purple-600"
                  : "border-border text-muted hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl border border-border bg-surface"
              />
            ))}
          </div>
        ) : visibleIdeas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted">No ideas yet. Be the first to submit one.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {visibleIdeas.map((idea) => (
              <div
                key={idea.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium leading-snug break-words">{idea.title}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      CATEGORY_STYLES[idea.category] ?? CATEGORY_STYLES.Other
                    }`}
                  >
                    {idea.category}
                  </span>
                </div>

                <p className="text-sm text-muted break-words">{idea.description}</p>

                <div className="mt-1 flex items-center justify-between gap-2 border-t border-border pt-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600/10 text-xs font-medium text-purple-600 dark:text-purple-400">
                      {idea.author.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-muted">{idea.author}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[idea.status] ?? STATUS_STYLES.New
                      }`}
                    >
                      {idea.status}
                    </span>
                  </div>
                  <button
                    onClick={() => upvote(idea.id, idea.votes)}
                    className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <span className="text-purple-600 dark:text-purple-400">▲</span>
                    {idea.votes}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
