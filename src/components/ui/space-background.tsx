"use client";

import { useSpaceEffects } from "@/contexts/space-effects-context";

export function SpaceBackground() {
  const { spaceEffectsEnabled, spacyLevel, nebulaBrightness } = useSpaceEffects();

  if (!spaceEffectsEnabled) {
    return <div className="fixed inset-0 -z-10 overflow-hidden bg-background" />;
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* Wrapper that reduces opacity in light mode */}
      <div className="absolute inset-0 opacity-50 dark:opacity-70 transition-opacity duration-300">
        {/* EFFECT: Drifting Stars Layer 1 - slow horizontal drift */}
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
            backgroundSize: `${720 + spacyLevel * 4}px 200px`,
            opacity: 0.5 + spacyLevel / 100,
          }}
        />
        
        {/* EFFECT: Drifting Stars Layer 2 - medium drift, opposite direction */}
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
        
        {/* EFFECT: Twinkling Stars - subtle pulsing */}
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
        
        {/* EFFECT: Shooting Stars - occasional streaks */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[2px] h-[2px] bg-current rounded-full blur-[1px] animate-[shootingStar_3s_ease-out_infinite]" 
               style={{ top: '20%', left: '-5%', animationDelay: '0s' }} />
          <div className="absolute w-[2px] h-[2px] bg-current rounded-full blur-[1px] animate-[shootingStar_4s_ease-out_infinite]" 
               style={{ top: '60%', left: '-5%', animationDelay: '8s' }} />
          <div className="absolute w-[2px] h-[2px] bg-current rounded-full blur-[1px] animate-[shootingStar_3.5s_ease-out_infinite]" 
               style={{ top: '35%', left: '-5%', animationDelay: '16s' }} />
        </div>

        {/* EFFECT: Variable Star Sizes - adds depth with larger stars */}
        <div 
          className="absolute inset-0 opacity-40 animate-[drift_80s_linear_infinite]"
          style={{
            backgroundImage: `
              radial-gradient(3px 3px at 150px 50px, currentColor, transparent),
              radial-gradient(2.5px 2.5px at 400px 120px, currentColor, transparent),
              radial-gradient(3.5px 3.5px at 250px 160px, currentColor, transparent),
              radial-gradient(2px 2px at 550px 80px, currentColor, transparent),
              radial-gradient(3px 3px at 350px 30px, currentColor, transparent)
            `,
            backgroundSize: '720px 200px',
          }}
        />

        {/* EFFECT: Pulsing Stars - individual stars with staggered pulse */}
        <div 
          className="absolute inset-0 animate-[pulse_3s_ease-in-out_infinite]"
          style={{
            backgroundImage: `
              radial-gradient(2px 2px at 100px 90px, currentColor, transparent),
              radial-gradient(1.5px 1.5px at 300px 120px, currentColor, transparent)
            `,
            backgroundSize: '720px 200px',
            animationDelay: '0s'
          }}
        />
        <div 
          className="absolute inset-0 animate-[pulse_4s_ease-in-out_infinite]"
          style={{
            backgroundImage: `
              radial-gradient(2.5px 2.5px at 200px 60px, currentColor, transparent),
              radial-gradient(1.5px 1.5px at 500px 140px, currentColor, transparent)
            `,
            backgroundSize: '720px 200px',
            animationDelay: '1.5s'
          }}
        />

        {/* EFFECT: Nebula Clouds - responsive, follow viewport size */}
        <div
          className="absolute inset-0 opacity-[0.10] animate-[nebula-cw_36s_linear_infinite]"
          style={{
            backgroundImage: `
              radial-gradient(circle 22vw at 18vw 32vh, currentColor, transparent)
            `,
            filter: `blur(2vw) brightness(${nebulaBrightness / 100 + 0.25})`,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.10] animate-[nebula-cw_36s_linear_infinite]"
          style={{
            backgroundImage: `
              radial-gradient(circle 32vw at 82vw 68vh, currentColor, transparent)
            `,
            filter: `blur(2vw) brightness(${nebulaBrightness / 100 + 0.25})`,
          }}
        />

        {/* EFFECT: Slow Rotation - very subtle rotation of entire starfield */}
        <div 
          className="absolute inset-0 opacity-20 animate-[rotate_240s_linear_infinite]"
          style={{
            backgroundImage: `
              radial-gradient(1px 1px at 50% 20%, currentColor, transparent),
              radial-gradient(1px 1px at 30% 50%, currentColor, transparent),
              radial-gradient(1px 1px at 70% 80%, currentColor, transparent),
              radial-gradient(1.5px 1.5px at 60% 60%, currentColor, transparent)
            `,
            backgroundSize: '100% 100%',
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
        @keyframes shootingStar {
          0% {
            transform: translate(0, 0) rotate(-45deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translate(120vw, 60vh) rotate(-45deg);
            opacity: 0;
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes nebula-cw {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 0.35;
          }
          25% {
            transform: translate(40px, -20px) rotate(90deg) scale(1.1);
            opacity: 0.45;
          }
          50% {
            transform: translate(0px, -40px) rotate(180deg) scale(1.2);
            opacity: 0.55;
          }
          75% {
            transform: translate(-40px, 20px) rotate(270deg) scale(1.1);
            opacity: 0.45;
          }
          100% {
            transform: translate(0, 0) rotate(360deg) scale(1);
            opacity: 0.35;
          }
        }
        @keyframes nebula-ccw {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 0.35;
          }
          25% {
            transform: translate(-40px, 20px) rotate(-90deg) scale(1.1);
            opacity: 0.45;
          }
          50% {
            transform: translate(0px, 40px) rotate(-180deg) scale(1.2);
            opacity: 0.55;
          }
          75% {
            transform: translate(40px, -20px) rotate(-270deg) scale(1.1);
            opacity: 0.45;
          }
          100% {
            transform: translate(0, 0) rotate(-360deg) scale(1);
            opacity: 0.35;
          }
        }
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
