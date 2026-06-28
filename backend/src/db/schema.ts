import { pgTable, serial, varchar, text, timestamp, integer, boolean, foreignKey, uniqueIndex, sql } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  avatar: varchar('avatar', { length: 500 }),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// communities table
export const communities = pgTable('communities', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 500 }),
  banner: varchar('banner', { length: 500 }),
  creatorId: integer('creator_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// ppost table
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 300 }).notNull(),
  content: text('content'),
  imageUrl: varchar('image_url', { length: 500 }),
  authorId: integer('author_id').notNull().references(() => users.id),
  communityId: integer('community_id').notNull().references(() => communities.id),
  upvotes: integer('upvotes').default(0).notNull(),
  downvotes: integer('downvotes').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// comments table
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  authorId: integer('author_id').notNull().references(() => users.id),
  postId: integer('post_id').notNull().references(() => posts.id),
  parentId: integer('parent_id').references(() => comments.id),
  upvotes: integer('upvotes').default(0).notNull(),
  downvotes: integer('downvotes').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// votes table (for both posts and comments)
export const votes = pgTable('votes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  postId: integer('post_id').references(() => posts.id),
  commentId: integer('comment_id').references(() => comments.id),
  value: integer('value').notNull(), // 1 for upvote, -1 for downvote
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => {
  return {
    uniquePostVote: uniqueIndex('unique_post_vote').on(table.userId, table.postId).where(sql`${table.postId} IS NOT NULL`),
    uniqueCommentVote: uniqueIndex('unique_comment_vote').on(table.userId, table.commentId).where(sql`${table.commentId} IS NOT NULL`)
  }
})

// ommunity members table
export const communityMembers = pgTable('community_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  communityId: integer('community_id').notNull().references(() => communities.id),
  isModerator: boolean('is_moderator').default(false).notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull()
}, (table) => {
  return {
    uniqueMember: uniqueIndex('unique_member').on(table.userId, table.communityId)
  }
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  votes: many(votes),
  communitiesCreated: many(communities),
  communityMemberships: many(communityMembers)
}))

export const communitiesRelations = relations(communities, ({ one, many }) => ({
  creator: one(users, {
    fields: [communities.creatorId],
    references: [users.id]
  }),
  posts: many(posts),
  members: many(communityMembers)
}))

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id]
  }),
  community: one(communities, {
    fields: [posts.communityId],
    references: [communities.id]
  }),
  comments: many(comments),
  votes: many(votes)
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id]
  }),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id]
  }),
  parentComment: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: 'commentReplies'
  }),
  replies: many(comments, {
    relationName: 'commentReplies'
  }),
  votes: many(votes)
}))

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id]
  }),
  post: one(posts, {
    fields: [votes.postId],
    references: [posts.id]
  }),
  comment: one(comments, {
    fields: [votes.commentId],
    references: [comments.id]
  })
}))

export const communityMembersRelations = relations(communityMembers, ({ one }) => ({
  user: one(users, {
    fields: [communityMembers.userId],
    references: [users.id]
  }),
  community: one(communities, {
    fields: [communityMembers.communityId],
    references: [communities.id]
  })
}))