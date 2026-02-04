import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyScores = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("scores")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);
  },
});

export const getMyStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const leaderboardEntry = await ctx.db
      .query("leaderboard")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
    return leaderboardEntry;
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("leaderboard")
      .withIndex("by_high_score")
      .order("desc")
      .take(10);
  },
});

export const saveScore = mutation({
  args: {
    score: v.number(),
    logsSliced: v.number(),
    maxCombo: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Save the score
    await ctx.db.insert("scores", {
      userId,
      score: args.score,
      logsSliced: args.logsSliced,
      maxCombo: args.maxCombo,
      playedAt: Date.now(),
    });

    // Update leaderboard
    const existingEntry = await ctx.db
      .query("leaderboard")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    const user = await ctx.db.get(userId);
    const displayName = user?.email?.split("@")[0] || "Lumberjack";

    if (existingEntry) {
      await ctx.db.patch(existingEntry._id, {
        highScore: Math.max(existingEntry.highScore, args.score),
        totalLogsSliced: existingEntry.totalLogsSliced + args.logsSliced,
        gamesPlayed: existingEntry.gamesPlayed + 1,
        displayName,
      });
    } else {
      await ctx.db.insert("leaderboard", {
        userId,
        displayName,
        highScore: args.score,
        totalLogsSliced: args.logsSliced,
        gamesPlayed: 1,
      });
    }
  },
});
