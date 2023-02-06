import {App} from "./src/app";

const app = new App();

app.configureRoutes();

app.run().then(() => {});
