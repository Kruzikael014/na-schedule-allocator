import { Request, Response } from "express";


export const test = async (_: Request, res: Response) => {
  res.json({ message: 'Kiw' }).status(200)
}