import { z } from "zod";

export const zodToJsonSchema = (schema: Record<string, z.ZodType<any>>) => {
  return z.object(schema).toJSONSchema({
    io: "input",
    target: "draft-07",
  });
};
