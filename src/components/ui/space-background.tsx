"use client";

export function SpaceBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* Wrapper that reduces opacity in light mode */}
      <div className="absolute inset-0 opacity-40 dark:opacity-70 transition-opacity duration-300">
        {/* Layer 1 - slow drift */}
        <div 
          className="absolute inset-0 animate-[drift_60s_linear_infinite]"
          style={{
            backgroundImage: `
              radial-gradient(1px 1px at 20px 30px, currentColor, transparent),
              radial-gradient(1px 1px at 40px 70px, currentColor, transparent),
              radial-gradient(1px 1px at 50px 160px, currentColor, transparent),
              radial-gradient(1px 1px at 90px 40px, currentColor, transparent),
              radial-gradient(1px 1px at 130px 80px, currentColor, transparent),
              radial-gradient(1px 1px at 160px 120px, currentColor, transparent),
              radial-gradient(1.5px 1.5px at 200px 50px, currentColor, transparent),
              radial-gradient(1px 1px at 220px 140px, currentColor, transparent),
              radial-gradient(1px 1px at 260px 90px, currentColor, transparent),
              radial-gradient(1.5px 1.5px at 300px 170px, currentColor, transparent),
              radial-gradient(1px 1px at 340px 30px, currentColor, transparent),
              radial-gradient(1px 1px at 380px 100px, currentColor, transparent),
              radial-gradient(1px 1px at 420px 60px, currentColor, transparent),
              radial-gradient(1.5px 1.5px at 460px 150px, currentColor, transparent),
              radial-gradient(1px 1px at 500px 20px, currentColor, transparent),
              radial-gradient(1px 1px at 540px 110px, currentColor, transparent),
              radial-gradient(1px 1px at 580px 70px, currentColor, transparent),
              radial-gradient(1.5px 1.5px at 620px 180px, currentColor, transparent),
              radial-gradient(1px 1px at 660px 45px, currentColor, transparent),
              radial-gradient(1px 1px at 700px 130px, currentColor, transparent)
            `,
            backgroundSize: '720px 200px',
          }}
        />
        {/* Layer 2 - medium drift, opposite direction */}
        <div 
          className="absolute inset-0 opacity-60 animate-[drift-reverse_45s_linear_infinite]"
          style={{
            backgroundImage: `
              radial-gradient(1px 1px at 15px 80px, currentColor, transparent),
              radial-gradient(1px 1px at 55px 20px, currentColor, transparent),
              radial-gradient(1.5px 1.5px at 95px 140px, currentColor, transparent),
              radial-gradient(1px 1px at 145px 60px, currentColor, transparent),
              radial-gradient(1px 1px at 185px 180px, currentColor, transparent),
              radial-gradient(1px 1px at 235px 25px, currentColor, transparent),
              radial-gradient(1.5px 1.5px at 275px 100px, currentColor, transparent),
              radial-gradient(1px 1px at 325px 155px, currentColor, transparent),
              radial-gradient(1px 1px at 365px 75px, currentColor, transparent),
              radial-gradient(1px 1px at 415px 120px, currentColor, transparent),
              radial-gradient(1.5px 1.5px at 455px 35px, currentColor, transparent),
              radial-gradient(1px 1px at 505px 165px, currentColor, transparent),
              radial-gradient(1px 1px at 545px 85px, currentColor, transparent),
              radial-gradient(1px 1px at 595px 145px, currentColor, transparent),
              radial-gradient(1.5px 1.5px at 635px 55px, currentColor, transparent)
            `,
            backgroundSize: '660px 200px',
          }}
        />
        {/* Layer 3 - fast subtle twinkle */}
        <div 
          className="absolute inset-0 opacity-30 animate-[twinkle_4s_ease-in-out_infinite]"
          style={{
            backgroundImage: `
              radial-gradient(0.5px 0.5px at 25px 45px, currentColor, transparent),
              radial-gradient(0.5px 0.5px at 75px 95px, currentColor, transparent),
              radial-gradient(0.5px 0.5px at 125px 15px, currentColor, transparent),
              radial-gradient(0.5px 0.5px at 175px 135px, currentColor, transparent),
              radial-gradient(0.5px 0.5px at 225px 65px, currentColor, transparent),
              radial-gradient(0.5px 0.5px at 275px 175px, currentColor, transparent),
              radial-gradient(0.5px 0.5px at 325px 35px, currentColor, transparent),
              radial-gradient(0.5px 0.5px at 375px 115px, currentColor, transparent),
              radial-gradient(0.5px 0.5px at 425px 85px, currentColor, transparent),
              radial-gradient(0.5px 0.5px at 475px 155px, currentColor, transparent)
            `,
            backgroundSize: '500px 200px',
          }}
        />
      </div>
      {/* Keyframes via style tag */}
      <style jsx>{`
        @keyframes drift {
          from {
            transform: translate(0, 0);
          }
          to {
            transform: translate(-720px, -200px);
          }
        }
        @keyframes drift-reverse {
          from {
            transform: translate(0, 0);
          }
          to {
            transform: translate(660px, 200px);
          }
        }
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}
