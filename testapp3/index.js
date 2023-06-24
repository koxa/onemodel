import { OneModel, OneModelServer }  from "../src";

class User extends OneModel {}

const index = new OneModelServer({
    models: [User]
});

index.start();