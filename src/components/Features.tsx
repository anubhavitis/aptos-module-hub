import React from "react";

const data = [
  {
    title: "One-Click Contract Testing",
    desc: "Paste an address, and we'll fetch all modules and functions instantly. No more manual searching or complex setups.",
  },
  {
    title: "Cross-Network Deployment",
    desc: "Deploy mainnet contracts to devnet with ease. Test in a safe environment before going live.",
  },
  {
    title: "Direct Function Interaction",
    desc: "Interact with contract functions right from our platform. Streamline your development and testing process.",
  },
  {
    title: "Comprehensive Contract Analysis",
    desc: "Explore all modules and functions associated with any contract address. Understand complex contracts at a glance.",
  },
];

const Features = () => {
  return (
    <div className="flex flex-col mb-20 mt-40">
      <p className="text-4xl font-semibold text-center">
        Key{" "}
        <span className="text-primary font-instrument text-5xl">Features</span>
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {data.map((feature, index) => (
          <div
            key={index}
            className="flex flex-col justify-center items-start border border-white/5 rounded-2xl p-6"
          >
            <h3 className="text-2xl font-semibold">{feature.title}</h3>
            <p className="mt-3 text-white/70">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
