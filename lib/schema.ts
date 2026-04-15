import { pgTable, uuid, text, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const creators = pgTable("creators", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id").unique(),
  username: text("username").unique(),
  displayName: text("display_name"),
  profilePhotoUrl: text("profile_photo_url"),
  accentColor: text("accent_color").default("#7C3AED"),
  bio: text("bio"),
  speakingStyle: text("speaking_style"),
  socialUrls: jsonb("social_urls"),
  personaPrompt: text("persona_prompt"),
  aiTrainingPhotoUrl: text("ai_training_photo_url"),
  scanStatus: text("scan_status").default("idle"),
  credits: text("credits").default("0.20"),
  subscriptionPlan: text("subscription_plan").default("free"),
  subscriptionStatus: text("subscription_status").default("inactive"),
  paypalSubscriberId: text("paypal_subscriber_id"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  clerkUserIdIdx: index("creators_clerk_user_id_idx").on(table.clerkUserId),
  usernameIdx: index("creators_username_idx").on(table.username),
}));

export const scanResults = pgTable("scan_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").references(() => creators.id),
  platform: text("platform"),
  rawContent: text("raw_content"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").references(() => creators.id),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  sessionIdIdx: index("chat_sessions_session_id_idx").on(table.sessionId),
  creatorIdIdx: index("chat_sessions_creator_id_idx").on(table.creatorId),
}));

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: text("session_id"),
  creatorId: uuid("creator_id").references(() => creators.id),
  role: text("role"),
  content: text("content"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  sessionIdIdx: index("chat_messages_session_id_idx").on(table.sessionId),
  creatorIdIdx: index("chat_messages_creator_id_idx").on(table.creatorId),
  createdAtIdx: index("chat_messages_created_at_idx").on(table.createdAt),
}));

export const creatorsRelations = relations(creators, ({ many }) => ({
  scanResults: many(scanResults),
  chatSessions: many(chatSessions),
  chatMessages: many(chatMessages),
}));

export const scanResultsRelations = relations(scanResults, ({ one }) => ({
  creator: one(creators, {
    fields: [scanResults.creatorId],
    references: [creators.id],
  }),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one }) => ({
  creator: one(creators, {
    fields: [chatSessions.creatorId],
    references: [creators.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  creator: one(creators, {
    fields: [chatMessages.creatorId],
    references: [creators.id],
  }),
}));

export type Creator = typeof creators.$inferSelect;
export type NewCreator = typeof creators.$inferInsert;
export type ScanResult = typeof scanResults.$inferSelect;
export type ChatSession = typeof chatSessions.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;