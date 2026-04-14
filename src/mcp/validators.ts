import { z } from "zod";

import { AppError } from "../errors.js";

const postNumberSchema = z.coerce.number().int().positive();

export const listPostsInputSchema = z
  .object({
    q: z.string().min(1).max(500).optional(),
    per_page: z.coerce.number().int().min(1).max(100).optional().default(20),
    page: z.coerce.number().int().min(1).optional().default(1),
  })
  .strict();

export const getPostInputSchema = z
  .object({
    post_number: postNumberSchema,
  })
  .strict();

export const createPostInputSchema = z
  .object({
    name: z.string().min(1).max(255),
    body_md: z.string().min(1),
    category: z.string().min(1).max(255).optional(),
    tags: z.array(z.string().min(1).max(50)).max(50).optional(),
    wip: z.boolean().optional().default(true),
    message: z.string().min(1).max(200).optional(),
  })
  .strict();

export const updatePostInputSchema = z
  .object({
    post_number: postNumberSchema,
    name: z.string().min(1).max(255).optional(),
    body_md: z.string().min(1).optional(),
    category: z.string().min(1).max(255).optional(),
    tags: z.array(z.string().min(1).max(50)).max(50).optional(),
    wip: z.boolean().optional(),
    message: z.string().min(1).max(200).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const hasMutations =
      value.name !== undefined ||
      value.body_md !== undefined ||
      value.category !== undefined ||
      value.tags !== undefined ||
      value.wip !== undefined ||
      value.message !== undefined;

    if (!hasMutations) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "esa_update_post には post_number 以外に少なくとも1つの更新項目が必要です。",
      });
    }
  });

export const deletePostInputSchema = z
  .object({
    post_number: postNumberSchema,
    confirm: z.literal(true, {
      errorMap: () => ({
        message: "削除を実行するには confirm=true を明示的に指定してください。",
      }),
    }),
    reason: z.string().min(3).max(120).optional(),
  })
  .strict();

export const getMembersInputSchema = z.object({}).strict();

export type ListPostsInput = z.output<typeof listPostsInputSchema>;
export type GetPostInput = z.output<typeof getPostInputSchema>;
export type CreatePostInput = z.output<typeof createPostInputSchema>;
export type UpdatePostInput = z.output<typeof updatePostInputSchema>;
export type DeletePostInput = z.output<typeof deletePostInputSchema>;
export type GetMembersInput = z.output<typeof getMembersInputSchema>;

export function parseListPostsInput(input: unknown): ListPostsInput {
  return parseInput("esa_list_posts", listPostsInputSchema, input);
}

export function parseGetPostInput(input: unknown): GetPostInput {
  return parseInput("esa_get_post", getPostInputSchema, input);
}

export function parseCreatePostInput(input: unknown): CreatePostInput {
  return parseInput("esa_create_post", createPostInputSchema, input);
}

export function parseUpdatePostInput(input: unknown): UpdatePostInput {
  return parseInput("esa_update_post", updatePostInputSchema, input);
}

export function parseDeletePostInput(input: unknown): DeletePostInput {
  return parseInput("esa_delete_post", deletePostInputSchema, input);
}

export function parseGetMembersInput(input: unknown): GetMembersInput {
  return parseInput("esa_get_members", getMembersInputSchema, input);
}

function parseInput<TSchema extends z.ZodTypeAny>(
  toolName: string,
  schema: TSchema,
  input: unknown,
): z.output<TSchema> {
  const candidate = normalizeInput(input);
  const parsed = schema.safeParse(candidate);

  if (parsed.success) {
    return parsed.data;
  }

  const detail = parsed.error.issues
    .map((issue) => {
      const path = issue.path.join(".") || "(root)";
      return `${path}: ${issue.message}`;
    })
    .join(" / ");

  throw new AppError(`ツール入力が不正です: ${toolName} (${detail})`, {
    code: "VALIDATION_ERROR",
    details: detail,
  });
}

function normalizeInput(input: unknown): Record<string, unknown> {
  if (input === undefined || input === null) {
    return {};
  }
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new AppError("ツール入力は JSON オブジェクトで指定してください。", {
      code: "VALIDATION_ERROR",
      details: { receivedType: typeof input },
    });
  }
  return input as Record<string, unknown>;
}
