import {useEffect, useRef} from "react";
import type {AuthContextType} from "../contexts/AuthContext";
import {presenceService} from "../services/presenceService";

export const usePresence = (authContext: AuthContextType) => {
    const intervalId = useRef<number>(0);

    useEffect(() => {
        intervalId.current = setInterval(() => {
            if (authContext.user) {
                presenceService.heartbeat();
            }
        }, 30000);

        return () => clearInterval(intervalId.current);
    }, [authContext.user]);
}