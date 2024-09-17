const Hero = () => {
  return (
    <div className="flex flex-col items-center mt-20">
      <h1 className="text-7xl font-bold text-center">
        Unlock the{" "}
        <span className="text-primary font-instrument text-8xl">Power</span> of
        <br />{" "}
        <span className="text-primary font-instrument text-8xl">
          Aptos
        </span>{" "}
        Smart Contracts
      </h1>
      <p className="mt-4 text-white/70 text-center">
        Test, Deploy, and Interact with Ease
      </p>

      <button className="mt-10 px-10 py-3 bg-primary text-dark rounded-full font-semibold text-xl">
        Try Now
      </button>
    </div>
  );
};

export default Hero;
