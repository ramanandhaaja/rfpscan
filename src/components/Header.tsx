import React from 'react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ 
  title = "Agentic RFP Scanner", 
  subtitle = "Upload your RFP documents and let our AI agents analyze and help you prepare the perfect response" 
}: HeaderProps) {
  return (
    <header className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8">
      <div className="flex flex-col items-center justify-center gap-6 mb-6">
        <h1 className="text-3xl font-bold text-center text-gray-900">{title}</h1>
        <p className="text-gray-600 text-center max-w-2xl">{subtitle}</p>
      </div>
    </header>
  );
}
