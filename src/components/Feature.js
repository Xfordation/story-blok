import { storyblokEditable } from "@storyblok/react";

const Feature = ({ blok }) => (
  <div {...storyblokEditable(blok)} className="column feature s">
    {blok.name}
  </div>
);

export default Feature;
