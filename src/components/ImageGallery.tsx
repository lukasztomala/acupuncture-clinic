import React, { useState } from "react";

export interface GalleryImage {
  src: string;
  alt: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
}

// Component to handle image fallback on error
const GalleryItem: React.FC<{ img: GalleryImage }> = ({ img }) => {
  const [src, setSrc] = useState<string>(img.src);
  return (
    <img
      src={src}
      alt={img.alt}
      loading="lazy"
      onError={() => setSrc("/images/placeholder.jpg")}
      className="w-full rounded-lg shadow-md object-cover"
    />
  );
};

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => (
  <section className="px-6 py-12">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((img, idx) => (
        <GalleryItem key={idx} img={img} />
      ))}
    </div>
  </section>
);

export default ImageGallery;
