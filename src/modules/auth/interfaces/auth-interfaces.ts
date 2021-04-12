import { User } from "src/modules/user/models/user.model";

export type UserContext = {
    req: {
        user: User;
    }
}
