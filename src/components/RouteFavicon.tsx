import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import professionalTitleIcon from "../assets/ml-title-icon.svg";
import pokedexTitleIcon from "../assets/pokedex-database-title-icon.svg";

const RouteFavicon = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        if (!favicon) return;

        favicon.href = pathname === '/showcase' ? pokedexTitleIcon : professionalTitleIcon;
    }, [pathname]);

    return null;
};

export default RouteFavicon;
