import { Request, Response } from "express";
import { DashboardService } from "./dashboard.service";

export class DashboardController {
  service: DashboardService;

  constructor() {
    this.service = new DashboardService();
  }

  getSummary = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.service.getOrganizerSummary(userId);
    return res.status(200).send(result);
  };
}
