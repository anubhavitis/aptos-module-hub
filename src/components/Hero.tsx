const Hero = () => {
  return (
    <div className="flex flex-col items-center mt-20">
      <h1 className="sm:text-7xl text-5xl font-bold text-center">
        Unlock the{" "}
        <span className="text-primary font-instrument sm:text-8xl text-6xl">
          Power
        </span>{" "}
        of
        <br />{" "}
        <span className="text-primary font-instrument sm:text-8xl text-6xl">
          Aptos
        </span>{" "}
        Smart Contracts
      </h1>
      <p className="mt-4 text-white/70 text-center">
        Test, Deploy, and Interact with Ease
      </p>

      <button className="mt-10 px-10 py-3 bg-primary text-dark rounded-full font-medium text-xl">
        Download App
      </button>
    </div>
  );
};

export default Hero;
