import { Request, Response } from "express";
import { EventService } from "./event.service";
import { ApiError } from "../../utils/api-error";

export class EventController {
  eventService: EventService;

  constructor() {
    this.eventService = new EventService();
  }

  getEvents = async (req: Request, res: Response) => {
    const result = await this.eventService.getEvents();
    return res.status(200).send(result);
  };

  // createEvent = async (req: Request, res: Response) => {
  //   const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  //   const image = files.image?.[0];
  //   if (!image) throw new ApiError("Image is required", 400);
  //   const result = await this.eventService.createEvent(req.body, image);
  //   return res.status(200).send(result);
  // };

  createEvent = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const image = files?.image?.[0];

    if (!image) {
      throw new ApiError("Image is required", 400);
    }

    const result = await this.eventService.createEvent(userId, req.body, image);

    return res.status(201).send(result);
  };

  getMyEvents = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.eventService.getMyEvents(userId);
    return res.status(200).send(result);
  };

  getEventAttendees = async (req: Request, res: Response) => {
    const eventId = Number(req.params.id);
    const userId = res.locals.user.id;

    const result = await this.eventService.getEventAttendees(eventId, userId);

    return res.status(200).send(result);
  };
}
