import {useEffect, useRef} from "react";
import {presenceService} from "../services/presenceService";

export const usePresence = () => {
    const intervalId = useRef<number>(0);

    useEffect(() => {
        intervalId.current = setInterval(() => {
            presenceService.heartbeat();
        }, 30000);

        return () => clearInterval(intervalId.current);
    }, []);
}