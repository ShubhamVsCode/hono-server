import { Hono } from "hono";
import connectToDb from "./db";
import { todosTable } from "./db/schema";
import { eq, desc } from "drizzle-orm";
import { cors } from "hono/cors";

export type Env = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use(
  cors({
    origin: "*",
  }),
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/todos", async (c) => {
  const db = connectToDb(c.env.DATABASE_URL);
  const todos = await db
    .select()
    .from(todosTable)
    .orderBy(desc(todosTable.created_at));
  return c.json(todos);
});

app.post("/todos", async (c) => {
  const db = connectToDb(c.env.DATABASE_URL);
  const { title } = await c.req.json();
  const todo = await db.insert(todosTable).values({ title }).returning({
    id: todosTable.id,
    title: todosTable.title,
    completed: todosTable.completed,
  });

  const newTodo = todo[0];
  return c.json(newTodo);
});

app.put("/todos/:todoId", async (c) => {
  const { todoId } = c.req.param();
  const { title } = await c.req.json();
  const db = connectToDb(c.env.DATABASE_URL);
  const todo = await db
    .update(todosTable)
    .set({ title })
    .where(eq(todosTable.id, Number(todoId)));
  return c.json(todo);
});

app.patch("/todos/:todoId", async (c) => {
  const { todoId } = c.req.param();
  const { completed } = await c.req.json();
  const db = connectToDb(c.env.DATABASE_URL);
  const todo = await db
    .update(todosTable)
    .set({ completed })
    .where(eq(todosTable.id, Number(todoId)));
  return c.json(todo);
});

app.delete("/todos/:todoId", async (c) => {
  const { todoId } = c.req.param();
  const db = connectToDb(c.env.DATABASE_URL);
  const todo = await db
    .delete(todosTable)
    .where(eq(todosTable.id, Number(todoId)));
  return c.json(todo);
});

export default app;
