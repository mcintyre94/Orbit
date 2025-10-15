import { Box } from "@mantine/core";
import { Outlet } from "react-router-dom";

export default function Layout() {
    return (
        <Box m='md'>
            <Outlet />
        </Box>
    )
}
