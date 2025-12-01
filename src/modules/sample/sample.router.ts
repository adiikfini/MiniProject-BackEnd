import { Router } from "express";
import { SampleController } from "./sample.controller";

export class SampleRouter {
    public router: Router;
    public sampleController: SampleController;

    constructor() {
        this.router = Router();
        this.sampleController = new SampleController();
        this.initRoutes();
    }

    private initRoutes = (): void => {
        this.router.get("/", this.sampleController.getSamples);
        this.router.get("/:id", this.sampleController.getSample);
    };

    public getRouter = (): Router => {
        return this.router;
    };
}