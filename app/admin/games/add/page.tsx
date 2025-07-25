"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { GameSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

const categories = [
  "Action",
  "Puzzle",
  "Adventure",
  "Arcade",
  "Strategy",
  "RPG",
  "Simulation",
  "Sports",
  "Other",
];

export default function AddGamePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(GameSchema),
    defaultValues: {
      title: "",
      description: "",
      link: "",
      category: categories[0],
      color: "#000000",
      isMultiplayer: false,
    },
  });

  if (!isLoading && (!isAuthenticated || user?.role !== "ADMIN")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p>You must be an admin to add games.</p>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success("Game added successfully!");
        reset();
        router.push("/admin/games");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add game");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Add New Game</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded shadow">
        <div>
          <label className="block font-medium mb-1">Title *</label>
          <input
            type="text"
            {...register("title")}
            className="w-full border rounded px-3 py-2"
            disabled={loading}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message as string}</p>}
        </div>
        <div>
          <label className="block font-medium mb-1">Description *</label>
          <textarea
            {...register("description")}
            className="w-full border rounded px-3 py-2"
            rows={3}
            disabled={loading}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message as string}</p>}
        </div>
        <div>
          <label className="block font-medium mb-1">Link *</label>
          <input
            type="url"
            {...register("link")}
            className="w-full border rounded px-3 py-2"
            disabled={loading}
          />
          {errors.link && <p className="text-red-500 text-sm mt-1">{errors.link.message as string}</p>}
        </div>
        <div>
          <label className="block font-medium mb-1">Category *</label>
          <select {...register("category")}
            className="w-full border rounded px-3 py-2"
            disabled={loading}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message as string}</p>}
        </div>
        <div>
          <label className="block font-medium mb-1">Color *</label>
          <input
            type="color"
            {...register("color")}
            className="w-12 h-8 border rounded"
            disabled={loading}
          />
          {errors.color && <p className="text-red-500 text-sm mt-1">{errors.color.message as string}</p>}
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            {...register("isMultiplayer")}
            id="isMultiplayer"
            className="mr-2"
            disabled={loading}
          />
          <label htmlFor="isMultiplayer" className="font-medium">Is Multiplayer?</label>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Game"}
        </button>
        <Link href="/admin/games" className="block text-center text-blue-600 hover:underline mt-4">Back to Games</Link>
      </form>
    </div>
  );
} 