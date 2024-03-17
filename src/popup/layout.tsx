import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

export default function Layout() {
    return (
        <Box margin={4}>
            <Outlet />
        </Box>
    )
}
