"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Todo = {
  id: string;
  text: string;
  done: boolean;
};

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTodos() {
      const { data, error } = await supabase
        .from("todos")
        .select("id, text, done")
        .order("created_at", { ascending: true });

      if (error) setError(error.message);
      else setTodos(data ?? []);
      setLoading(false);
    }
    loadTodos();
  }, []);

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const { data, error } = await supabase
      .from("todos")
      .insert({ text: trimmed })
      .select("id, text, done")
      .single();

    if (error) {
      setError(error.message);
      return;
    }
    setTodos((prev) => [...prev, data]);
    setText("");
  }

  async function toggleTodo(id: string, done: boolean) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !done } : t)));

    const { error } = await supabase.from("todos").update({ done: !done }).eq("id", id);
    if (error) {
      setError(error.message);
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)));
    }
  }

  async function deleteTodo(id: string) {
    const previous = todos;
    setTodos((prev) => prev.filter((t) => t.id !== id));

    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) {
      setError(error.message);
      setTodos(previous);
    }
  }

  const remaining = todos.filter((t) => !t.done).length;

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-center">Todo List</h1>

      {error && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
      )}

      <form onSubmit={addTodo} className="flex gap-2 mb-6">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 rounded-md border border-black/10 dark:border-white/20 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="rounded-md bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 transition-colors"
        >
          Add
        </button>
      </form>

      {loading ? (
        <p className="text-center text-sm text-black/50 dark:text-white/50">Loading...</p>
      ) : todos.length === 0 ? (
        <p className="text-center text-sm text-black/50 dark:text-white/50">
          No todos yet. Add one above.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 rounded-md border border-black/10 dark:border-white/20 px-3 py-2"
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id, todo.done)}
                className="h-4 w-4 shrink-0"
              />
              <span
                className={`flex-1 break-words ${
                  todo.done ? "line-through text-black/40 dark:text-white/40" : ""
                }`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                aria-label={`Delete "${todo.text}"`}
                className="text-black/40 hover:text-red-600 dark:text-white/40 dark:hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {todos.length > 0 && (
        <p className="mt-4 text-center text-sm text-black/50 dark:text-white/50">
          {remaining} {remaining === 1 ? "item" : "items"} left
        </p>
      )}
    </div>
  );
}
