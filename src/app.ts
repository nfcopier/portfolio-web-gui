const Express = require("express");
import {Response} from "express";

export class App {

    private readonly server = Express();
    private readonly port = 5000;

    public constructor() {
        this.printListening = this.printListening.bind(this);
    }

    public configureRoutes(): void {
        this.server.get("/", (req, res: Response) => {
            res.send("Hello world!");
        });
    }

    public async run(): Promise<void> {
        this.server.listen(this.port, this.printListening);
    }

    private printListening(): void {
        console.log(`Listening on port ${this.port}`);
    }
}
