---
layout: archive
title: "Publications"
permalink: /publications/
author_profile: true
classes: wide
---

Here are a number of my selected publications. For the full list, please visit my [Google Scholar](https://scholar.google.com/citations?user=3nLzb24AAAAJ&hl=en) page.

import React, { useState } from 'react';

const Publication = ({ title, authors, conference, link, delay }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`transform transition-all duration-500 ease-out ${
        isHovered ? 'scale-102 -translate-y-1' : ''
      }`}
      style={{
        opacity: 0,
        animation: `slideIn 0.6s ease-out ${delay}s forwards`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6 mb-6 bg-white/5 backdrop-blur-sm rounded-lg border border-gray-200/20 shadow-lg hover:shadow-xl transition-all duration-300">
        <h3 className="text-lg font-bold mb-2 text-blue-600 group-hover:text-blue-700 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 mb-2 italic">{authors}</p>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">{conference}</span>
          <a
            href={link}
            className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium hover:bg-blue-200 transition-colors"
          >
            View Paper
          </a>
        </div>
      </div>
    </div>
  );
};

const PublicationsPage = () => {
  const publications = [
    {
      title: "Depth Estimation and Image Restoration by Deep Learning from Defocused Images",
      authors: "Saqib Nazir, Lorenzo Vaquero, Manuel Mucientes, Víctor M Brea, Daniela Coltuc",
      conference: "IEEE Trans. Computational Imaging, 2023",
      link: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3nLzb24AAAAJ&citation_for_view=3nLzb24AAAAJ:LkGwnXOMwfcC"
    },
    {
      title: "iDFD: A Dataset Annotated for Depth and Defocus",
      authors: "Saqib Nazir, Zhouyan Qiu, Daniela Coltuc, Joaquín Martínez-Sanchez, Pedro Arias",
      conference: "SCIA, 2023",
      link: "https://github.com/saqibnaziir/iDFD"
    },
    // Add other publications here
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      
      <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Publications
      </h1>
      
      <p className="mb-8 text-center text-gray-600">
        Here are a number of my selected publications. For the full list, please visit my{' '}
        <a 
          href="https://scholar.google.com/citations?user=3nLzb24AAAAJ&hl=en"
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          Google Scholar
        </a>{' '}
        page.
      </p>

      <div className="space-y-6">
        {publications.map((pub, index) => (
          <Publication
            key={index}
            {...pub}
            delay={index * 0.2}
          />
        ))}
      </div>
    </div>
  );
};

export default PublicationsPage;
