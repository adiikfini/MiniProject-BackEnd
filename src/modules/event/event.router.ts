import { Router } from "express";
import { UploaderMiddleware } from "../../middleware/uploader.middleware";
import { validateBody } from "../../middleware/validation.middleware";
import { CreateEventDTO } from "./dto/create-event.dto";
import { EventController } from "./event.controller";
import { Role } from "@prisma/client";
import { requireRole } from "../../middleware/role.middleware";
import { JwtMiddleware } from "../../middleware/jwt.middleware";

export class EventRouter {
  router: Router;
  eventController: EventController;
  uploaderMiddleware: UploaderMiddleware;
  jwtMiddleware: JwtMiddleware;

  constructor() {
    this.router = Router();
    this.eventController = new EventController();
    this.uploaderMiddleware = new UploaderMiddleware();
    this.jwtMiddleware = new JwtMiddleware();

    this.initRoutes();
  }

  private initRoutes = () => {
    // public
    this.router.get("/", this.eventController.getEvents);

    // organizer only
    // this.router.post(
    //   "/",
    //   this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
    //   requireRole([Role.ORGANIZER]),
    //   this.uploaderMiddleware.upload().fields([{ name: "image", maxCount: 1 }]),
    //   validateBody(CreateEventDTO),
    //   this.eventController.createEvent
    // );
    this.router.post(
      "/",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      requireRole([Role.ORGANIZER]),
      this.uploaderMiddleware.upload().fields([{ name: "image", maxCount: 1 }]),
      validateBody(CreateEventDTO),
      this.eventController.createEvent
    );

    this.router.get(
      "/my-events",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      requireRole([Role.ORGANIZER]),
      this.eventController.getMyEvents
    );

    this.router.get(
      "/:id/attendees",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      requireRole([Role.ORGANIZER]),
      this.eventController.getEventAttendees
    );
  };

  getRouter = () => {
    return this.router;
  };
}
