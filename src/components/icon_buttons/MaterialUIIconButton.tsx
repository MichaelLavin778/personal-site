import { IconButton, type IconButtonOwnProps } from "@mui/material";
import MaterialUIIcon from "../icons/MaterialUIIcon";

const MaterialUIIconButton = (props: IconButtonOwnProps) => (
        <IconButton
            aria-label="MaterialUI"
            href="https://mui.com/material-ui/"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
        >
            <MaterialUIIcon sx={{ overflow: 'visible', mt: -1 }} />
        </IconButton>
    );

export default MaterialUIIconButton;