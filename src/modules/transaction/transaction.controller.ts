import { Request, Response } from "express";
import { TransactionService } from "./transaction.service";

export class TransactionController {
  service: TransactionService;

  constructor() {
    this.service = new TransactionService();
  }

  getOrganizerTransactions = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.service.getOrganizerTransactions(userId);
    return res.status(200).send(result);
  };

  acceptTransaction = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.service.acceptTransaction(Number(id));
    return res.status(200).send(result);
  };

  rejectTransaction = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.service.rejectTransaction(Number(id));
    return res.status(200).send(result);
  };
}
