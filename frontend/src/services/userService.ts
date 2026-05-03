import {apiClient} from "../core/apiClient";
import type {UserResponse} from "../types/user.ts";


class UserService {
    async getSuggested(): Promise<UserResponse[]> {
        return apiClient.get<UserResponse[]>('/users/suggest');
    }

    async findByUsername(q: string): Promise<UserResponse[]> {
        return apiClient.get<UserResponse[]>(`/users/find?username=${q}`);
    }
}

export const userService = new UserService();