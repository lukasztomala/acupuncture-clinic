import React from "react";

export interface ContentSectionData {
  heading: string;
  text: string;
}

interface ContentSectionProps {
  data: ContentSectionData;
}

const ContentSection: React.FC<ContentSectionProps> = ({ data }) => (
  <section className="px-6 py-12 max-w-4xl mx-auto">
    <div className="space-y-4 text-center md:text-left">
      <h2 className="text-4xl font-semibold">{data.heading}</h2>
      <p className="text-gray-700">{data.text}</p>
    </div>
  </section>
);

export default ContentSection;
