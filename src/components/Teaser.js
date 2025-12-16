import { storyblokEditable } from "@storyblok/react";

const Teaser = ({ blok }) => {
  return (
    <h2 style={{ textAlign: "left" }} {...storyblokEditable(blok)}>
      {blok.headline}
    </h2>
  );
};

export default Teaser;
