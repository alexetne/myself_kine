import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Terrain — Assistant course et trail",
    short_name: "Terrain",
    description: "Parcours initial de préparation physique.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9f9f7",
    theme_color: "#003636",
  };
}
