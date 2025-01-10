declare module "react-slick" {
    import React from "react";
  
    export interface Settings {
      dots?: boolean;
      infinite?: boolean;
      speed?: number;
      slidesToShow?: number;
      slidesToScroll?: number;
      autoplay?: boolean;
      autoplaySpeed?: number;
      arrows?: boolean;
      prevArrow?: React.ReactNode;
      nextArrow?: React.ReactNode;
      [key: string]: any; // Cho phép các thuộc tính khác
    }
  
    declare const Slider: React.FC<Settings>;
    export default Slider;
  }
  