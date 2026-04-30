import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const okrs = pgTable("okrs", {
  id: text("id").primaryKey(),
  period: text("period").notNull(),
  coe_id: text("coe_id").notNull(),
  objective: text("objective").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
})

export const keyResults = pgTable("key_results", {
  id: text("id").primaryKey(),
  okr_id: text("okr_id")
    .notNull()
    .references(() => okrs.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  kpi: text("kpi").notNull(),
  baseline: integer("baseline").notNull().default(0),
  target: integer("target").notNull(),
  current_value: integer("current_value").notNull().default(0),
  responsible: text("responsible").notNull(),
  due_date: text("due_date").notNull(),
  progress: integer("progress").notNull().default(0),
})

export const okrsRelations = relations(okrs, ({ many }) => ({
  keyResults: many(keyResults),
}))

export const keyResultsRelations = relations(keyResults, ({ one }) => ({
  okr: one(okrs, { fields: [keyResults.okr_id], references: [okrs.id] }),
}))
