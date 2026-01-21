import { Box } from "@mantine/core";
import { Outlet } from "react-router-dom";
import LockGuard from "./components/LockGuard";

export default function Layout() {
    return (
        <LockGuard>
            <Box m='md'>
                <Outlet />
            </Box>
        </LockGuard>
    )
}
