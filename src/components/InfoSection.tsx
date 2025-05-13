import React, { useState } from "react";

export interface InfoSectionData {
  title: string;
  text: string;
  imageSrc: string;
  imageAlt: string;
}

interface InfoSectionProps {
  data: InfoSectionData;
}

const InfoSection: React.FC<InfoSectionProps> = ({ data }) => {
  const [imgSrc, setImgSrc] = useState(data.imageSrc);
  return (
    <section className="flex flex-col md:flex-row items-center px-6 py-12">
      <img
        src={imgSrc}
        alt={data.imageAlt}
        loading="lazy"
        onError={() => setImgSrc("/images/placeholder.jpg")}
        className="w-full md:w-1/2 rounded-lg shadow-md object-cover"
      />
      <div className="mt-6 md:mt-0 md:ml-8">
        <h2 className="text-3xl font-semibold mb-2">{data.title}</h2>
        <p className="text-gray-700">{data.text}</p>
      </div>
    </section>
  );
};

export default InfoSection;
