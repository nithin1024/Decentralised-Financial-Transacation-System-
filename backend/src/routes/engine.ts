import { Router } from "express";
import { engine } from "../engine.js";
import { requireAuth } from "../middleware/auth.js";

export const engineRouter = Router();

engineRouter.get("/state", requireAuth, async (_req, res) => {
  return res.json(engine.getState());
});

