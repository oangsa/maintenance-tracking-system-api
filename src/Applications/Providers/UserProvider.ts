import { AsyncLocalStorage } from "async_hooks";
import { CurrentUserDto } from "../DataTransferObjects/Auth/CurrentUserDto";

export interface IUserProvider
{
    getCurrentUser(): CurrentUserDto | null;
}

export class UserProvider implements IUserProvider
{
    private static readonly _storage = new AsyncLocalStorage<CurrentUserDto>();

    run<T>(user: CurrentUserDto, fn: () => Promise<T>): Promise<T>
    {
        return UserProvider._storage.run(user, fn);
    }

    getCurrentUser(): CurrentUserDto | null
    {
        return UserProvider._storage.getStore() ?? null;
    }
}
