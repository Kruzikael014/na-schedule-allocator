import { Request, Response } from "express";
import { exec } from "child_process";


export const test = async (_: Request, res: Response) => {
  exec('whoami', (error, stdout, stderr) => {
    if (error) return
    if (stderr) return
    res.json({ message: `Kiw from ${stdout.trim().replace(/\\\\/g, '\\')}` }).status(200)
  })
}