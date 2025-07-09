import React from 'react';
import { Target } from 'lucide-react';

const Mission = () => {
  return (
    <section className="py-20 bg-[#0c0c0c] border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-3 mb-6">
            <Target className="text-orange-500" size={32} />
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Mission Statement
            </h2>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 md:p-12">
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed text-center">
              Our mission at <span className="text-orange-500 font-semibold">SalT Lab</span> is to empower individuals without backgrounds in architecture or construction to confidently plan their building projects.
            </p>
            <div className="mt-8 pt-8 border-t border-gray-700">
              <p className="text-lg text-gray-400 text-center">
                We provide accessible tools and resources, including a site planner, plan generator, codebot, material estimates, and style matching.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;