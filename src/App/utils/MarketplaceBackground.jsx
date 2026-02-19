import React from 'react';

/**
 * MarketplaceBackground - An elegant animated background for autoMarketplace
 * Features vector shapes with subtle gradients in a whitish-grey theme
 * Automotive-themed animations with smooth, professional movements
 */
const MarketplaceBackground = ({ children }) => {
    return (
        <div className="marketplace-bg-wrapper">
            <style>{`
                .marketplace-bg-wrapper {
                    position: relative;
                    min-height: 100vh;
                    width: 100%;
                }

                .marketplace-bg {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: -1;
                }

                .marketplace-bg-svg {
                    width: 100%;
                    height: 100%;
                    display: block;
                }

                .marketplace-bg-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(
                        ellipse at center,
                        rgba(255, 255, 255, 0.1) 0%,
                        rgba(248, 249, 250, 0.3) 100%
                    );
                    pointer-events: none;
                }

                .marketplace-content {
                    position: relative;
                    z-index: 1;
                }

                /* ========== SHAPE MORPHING ANIMATIONS ========== */
                /* Large curves that shift and flow like a vehicle in transit */
                @keyframes curve-morph-flow-1 {
                    0%, 100% { 
                        d: path("M1200 0 Q1400 150 1440 350 L1440 0 Z");
                        filter: drop-shadow(0 0 20px rgba(220, 38, 38, 0.15));
                    }
                    25% { 
                        d: path("M1180 0 Q1420 180 1440 320 L1440 0 Z");
                        filter: drop-shadow(0 0 25px rgba(220, 38, 38, 0.2));
                    }
                    50% { 
                        d: path("M1220 0 Q1380 200 1440 380 L1440 0 Z");
                        filter: drop-shadow(0 0 30px rgba(220, 38, 38, 0.18));
                    }
                    75% { 
                        d: path("M1190 0 Q1410 160 1440 340 L1440 0 Z");
                        filter: drop-shadow(0 0 22px rgba(220, 38, 38, 0.16));
                    }
                }

                @keyframes curve-morph-flow-2 {
                    0%, 100% { 
                        d: path("M0 700 Q200 600 400 750 Q600 900 0 900 Z");
                        filter: drop-shadow(0 0 25px rgba(185, 28, 28, 0.12));
                    }
                    33% { 
                        d: path("M0 680 Q180 580 420 730 Q620 880 0 900 Z");
                        filter: drop-shadow(0 0 30px rgba(185, 28, 28, 0.18));
                    }
                    66% { 
                        d: path("M0 720 Q220 620 380 770 Q580 920 0 900 Z");
                        filter: drop-shadow(0 0 28px rgba(185, 28, 28, 0.15));
                    }
                }

                @keyframes wave-flow-smooth {
                    0%, 100% { 
                        d: path("M0 400 Q360 300 720 400 T1440 350 L1440 500 Q1080 550 720 450 T0 500 Z");
                        filter: drop-shadow(0 0 15px rgba(248, 113, 113, 0.1));
                    }
                    25% { 
                        d: path("M0 380 Q340 320 700 420 T1440 370 L1440 520 Q1100 530 700 430 T0 480 Z");
                    }
                    50% { 
                        d: path("M0 420 Q380 280 740 380 T1440 330 L1440 480 Q1060 570 740 470 T0 520 Z");
                        filter: drop-shadow(0 0 20px rgba(248, 113, 113, 0.15));
                    }
                    75% { 
                        d: path("M0 390 Q350 310 710 410 T1440 360 L1440 510 Q1090 540 710 440 T0 490 Z");
                    }
                }

                /* ========== FLOATING ELEMENTS - Smooth car-like movement ========== */
                @keyframes float-drift-1 {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
                    25% { transform: translate(25px, -15px) scale(1.02); opacity: 0.85; }
                    50% { transform: translate(40px, -30px) scale(1.05); opacity: 0.9; }
                    75% { transform: translate(20px, -20px) scale(1.03); opacity: 0.87; }
                }

                @keyframes float-drift-2 {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.75; }
                    33% { transform: translate(-30px, 20px) scale(1.03); opacity: 0.82; }
                    66% { transform: translate(-15px, 35px) scale(1.06); opacity: 0.88; }
                }

                @keyframes float-drift-3 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(20px, 30px) scale(1.04); }
                }

                @keyframes float-drift-4 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(-25px, -20px) scale(1.05); }
                }

                @keyframes float-drift-5 {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(35px, 15px); }
                }

                @keyframes float-drift-6 {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(-20px, -30px); }
                }

                /* ========== ROTATING ACCENTS - Diamond shapes ========== */
                @keyframes rotate-elegant-1 {
                    0% { transform: rotate(0deg) scale(1); }
                    25% { transform: rotate(90deg) scale(1.1); }
                    50% { transform: rotate(180deg) scale(1); }
                    75% { transform: rotate(270deg) scale(1.05); }
                    100% { transform: rotate(360deg) scale(1); }
                }

                @keyframes rotate-elegant-2 {
                    0% { transform: rotate(360deg) scale(1); }
                    50% { transform: rotate(180deg) scale(1.08); }
                    100% { transform: rotate(0deg) scale(1); }
                }

                @keyframes rotate-elegant-3 {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                /* ========== PULSING EFFECTS - Depth and dimension ========== */
                @keyframes pulse-glow-1 {
                    0%, 100% { 
                        opacity: 0.4; 
                        transform: scale(1);
                        filter: drop-shadow(0 0 10px rgba(220, 38, 38, 0.2));
                    }
                    50% { 
                        opacity: 0.7; 
                        transform: scale(1.08);
                        filter: drop-shadow(0 0 25px rgba(220, 38, 38, 0.35));
                    }
                }

                @keyframes pulse-glow-2 {
                    0%, 100% { 
                        opacity: 0.35; 
                        transform: scale(1);
                        filter: drop-shadow(0 0 8px rgba(185, 28, 28, 0.15));
                    }
                    50% { 
                        opacity: 0.6; 
                        transform: scale(1.1);
                        filter: drop-shadow(0 0 20px rgba(185, 28, 28, 0.3));
                    }
                }

                @keyframes pulse-glow-3 {
                    0%, 100% { 
                        opacity: 0.5; 
                        transform: scale(1);
                        filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.18));
                    }
                    50% { 
                        opacity: 0.75; 
                        transform: scale(1.06);
                        filter: drop-shadow(0 0 22px rgba(239, 68, 68, 0.28));
                    }
                }

                /* ========== LINE SWEEPS - Speed and motion ========== */
                @keyframes line-sweep-extend-1 {
                    0%, 100% { 
                        x2: 350; 
                        y2: 280;
                        stroke-width: 2;
                        opacity: 0.2;
                    }
                    50% { 
                        x2: 450; 
                        y2: 260;
                        stroke-width: 3;
                        opacity: 0.35;
                    }
                }

                @keyframes line-sweep-extend-2 {
                    0%, 100% { 
                        x2: 1200; 
                        y2: 700;
                        stroke-width: 2;
                        opacity: 0.18;
                    }
                    50% { 
                        x2: 1280; 
                        y2: 680;
                        stroke-width: 3.5;
                        opacity: 0.32;
                    }
                }

                @keyframes line-sweep-extend-3 {
                    0%, 100% { 
                        x2: 600; 
                        y2: 150;
                        opacity: 0.15;
                    }
                    50% { 
                        x2: 680; 
                        y2: 130;
                        opacity: 0.28;
                    }
                }

                /* ========== GEAR ANIMATIONS - Automotive themed ========== */
                @keyframes gear-rotate-smooth-1 {
                    0% { 
                        transform: rotate(0deg);
                        filter: drop-shadow(0 0 8px rgba(153, 27, 27, 0.2));
                    }
                    50% {
                        filter: drop-shadow(0 0 15px rgba(153, 27, 27, 0.35));
                    }
                    100% { 
                        transform: rotate(360deg);
                        filter: drop-shadow(0 0 8px rgba(153, 27, 27, 0.2));
                    }
                }

                @keyframes gear-rotate-smooth-2 {
                    0% { transform: rotate(360deg); }
                    100% { transform: rotate(0deg); }
                }

                /* ========== PISTON ANIMATIONS - Engine movement ========== */
                @keyframes piston-pump-1 {
                    0%, 100% { 
                        transform: translateY(0);
                        filter: drop-shadow(0 0 6px rgba(185, 28, 28, 0.15));
                    }
                    50% { 
                        transform: translateY(-18px);
                        filter: drop-shadow(0 0 12px rgba(185, 28, 28, 0.3));
                    }
                }

                @keyframes piston-pump-2 {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-22px); }
                }

                @keyframes piston-horizontal-pump {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(20px); }
                }

                /* ========== PARTICLE ORBIT ANIMATIONS ========== */
                @keyframes particle-orbit-smooth-1 {
                    0% { transform: rotate(0deg) translateX(80px) rotate(0deg); opacity: 0.6; }
                    50% { opacity: 0.85; }
                    100% { transform: rotate(360deg) translateX(80px) rotate(-360deg); opacity: 0.6; }
                }

                @keyframes particle-orbit-smooth-2 {
                    0% { transform: rotate(0deg) translateX(100px) rotate(0deg); }
                    100% { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
                }

                @keyframes particle-orbit-smooth-3 {
                    0% { transform: rotate(0deg) translateX(120px) rotate(0deg); }
                    100% { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
                }

                @keyframes particle-orbit-smooth-4 {
                    0% { transform: rotate(0deg) translateX(60px) rotate(0deg); }
                    100% { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
                }

                @keyframes particle-orbit-smooth-5 {
                    0% { transform: rotate(0deg) translateX(90px) rotate(0deg); }
                    100% { transform: rotate(360deg) translateX(90px) rotate(-360deg); }
                }

                @keyframes particle-spiral-elegant {
                    0% { transform: rotate(0deg) translateX(50px) scale(1); opacity: 0.6; }
                    50% { transform: rotate(180deg) translateX(100px) scale(1.2); opacity: 0.85; }
                    100% { transform: rotate(360deg) translateX(50px) scale(1); opacity: 0.6; }
                }

                @keyframes particle-wave-flow {
                    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.5; }
                    25% { transform: translateY(-35px) translateX(25px); opacity: 0.7; }
                    50% { transform: translateY(0) translateX(45px); opacity: 0.6; }
                    75% { transform: translateY(35px) translateX(25px); opacity: 0.7; }
                }

                @keyframes particle-float-drift-elegant {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
                    33% { transform: translate(35px, -45px) scale(1.15); opacity: 0.75; }
                    66% { transform: translate(-25px, 35px) scale(0.9); opacity: 0.6; }
                }

                @keyframes particle-swirl-motion {
                    0% { transform: rotate(0deg) translateX(70px) rotate(0deg) scale(1); }
                    50% { transform: rotate(180deg) translateX(115px) rotate(-180deg) scale(1.18); }
                    100% { transform: rotate(360deg) translateX(70px) rotate(-360deg) scale(1); }
                }

                /* ========== CIRCLE DRIFT ANIMATIONS ========== */
                @keyframes circle-drift-elegant-1 {
                    0%, 100% { cx: -100; cy: 200; opacity: 0.3; }
                    50% { cx: -60; cy: 240; opacity: 0.45; }
                }

                @keyframes circle-drift-elegant-2 {
                    0%, 100% { cx: 1500; cy: 700; opacity: 0.35; }
                    50% { cx: 1460; cy: 660; opacity: 0.5; }
                }

                /* ========== SPEEDOMETER ANIMATION ========== */
                @keyframes speedometer-needle {
                    0%, 100% { transform: rotate(-45deg); }
                    25% { transform: rotate(15deg); }
                    50% { transform: rotate(45deg); }
                    75% { transform: rotate(10deg); }
                }

                /* ========== AIRPLANE RADAR ANIMATIONS ========== */
                @keyframes radar-sweep {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes radar-ping-1 {
                    0%, 100% { opacity: 0; transform: scale(0.5); }
                    10%, 30% { opacity: 0.9; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(1.1); }
                    70% { opacity: 0; transform: scale(0.8); }
                }

                @keyframes radar-ping-2 {
                    0%, 100% { opacity: 0; transform: scale(0.5); }
                    20%, 40% { opacity: 0.85; transform: scale(1); }
                    60% { opacity: 0.35; transform: scale(1.05); }
                    80% { opacity: 0; transform: scale(0.7); }
                }

                @keyframes radar-ping-3 {
                    0%, 100% { opacity: 0; transform: scale(0.6); }
                    15%, 35% { opacity: 0.8; transform: scale(1); }
                    55% { opacity: 0.3; transform: scale(1.08); }
                    75% { opacity: 0; transform: scale(0.6); }
                }

                @keyframes radar-ring-pulse {
                    0%, 100% { opacity: 0.15; transform: scale(1); }
                    50% { opacity: 0.25; transform: scale(1.02); }
                }

                @keyframes radar-ring-expand {
                    0% { opacity: 0.4; transform: scale(0.3); }
                    100% { opacity: 0; transform: scale(1.5); }
                }

                @keyframes radar-glow-pulse {
                    0%, 100% { 
                        filter: drop-shadow(0 0 15px rgba(220, 38, 38, 0.3));
                    }
                    50% { 
                        filter: drop-shadow(0 0 25px rgba(220, 38, 38, 0.5));
                    }
                }

                /* ========== APPLY SHAPE MORPHING ========== */
                .shape-morph-1 {
                    animation: curve-morph-flow-1 25s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: d, filter;
                }

                .shape-morph-2 {
                    animation: curve-morph-flow-2 22s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: d, filter;
                }

                .shape-wave-flow {
                    animation: wave-flow-smooth 18s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: d, filter;
                }

                /* ========== APPLY FLOATING ELEMENTS ========== */
                .float-elegant-1 {
                    animation: float-drift-1 12s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: transform, opacity;
                }

                .float-elegant-2 {
                    animation: float-drift-2 15s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: transform, opacity;
                }

                .float-elegant-3 {
                    animation: float-drift-3 10s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: transform;
                }

                .float-elegant-4 {
                    animation: float-drift-4 13s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: transform;
                }

                .float-elegant-5 {
                    animation: float-drift-5 14s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: transform;
                }

                .float-elegant-6 {
                    animation: float-drift-6 11s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: transform;
                }

                /* ========== APPLY ROTATING ACCENTS ========== */
                .rotate-diamond-1 {
                    animation: rotate-elegant-1 30s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    transform-origin: 400px 220px;
                    will-change: transform;
                }

                .rotate-diamond-2 {
                    animation: rotate-elegant-2 35s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    transform-origin: 1050px 420px;
                    will-change: transform;
                }

                .rotate-diamond-3 {
                    animation: rotate-elegant-3 40s linear infinite;
                    transform-origin: 250px 725px;
                    will-change: transform;
                }

                /* ========== APPLY PULSING EFFECTS ========== */
                .pulse-elegant-1 {
                    animation: pulse-glow-1 10s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: transform, opacity, filter;
                }

                .pulse-elegant-2 {
                    animation: pulse-glow-2 12s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: transform, opacity, filter;
                }

                .pulse-elegant-3 {
                    animation: pulse-glow-3 14s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: transform, opacity, filter;
                }

                /* ========== APPLY LINE SWEEPS ========== */
                .line-sweep-1 {
                    animation: line-sweep-extend-1 8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: x2, y2, stroke-width, opacity;
                }

                .line-sweep-2 {
                    animation: line-sweep-extend-2 10s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: x2, y2, stroke-width, opacity;
                }

                .line-sweep-3 {
                    animation: line-sweep-extend-3 9s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: x2, y2, opacity;
                }

                /* ========== APPLY GEAR ANIMATIONS ========== */
                .gear-spin-1 {
                    animation: gear-rotate-smooth-1 12s linear infinite;
                    transform-origin: center;
                    will-change: transform, filter;
                }

                .gear-spin-2 {
                    animation: gear-rotate-smooth-2 16s linear infinite;
                    transform-origin: center;
                    will-change: transform;
                }

                .gear-spin-3 {
                    animation: gear-rotate-smooth-1 14s linear infinite;
                    transform-origin: center;
                    will-change: transform, filter;
                }

                .gear-spin-4 {
                    animation: gear-rotate-smooth-2 20s linear infinite;
                    transform-origin: center;
                    will-change: transform;
                }

                .gear-spin-5 {
                    animation: gear-rotate-smooth-1 11s linear infinite;
                    transform-origin: center;
                    will-change: transform, filter;
                }

                /* ========== APPLY PISTON ANIMATIONS ========== */
                .piston-move-1 {
                    animation: piston-pump-1 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: transform, filter;
                }

                .piston-move-2 {
                    animation: piston-pump-2 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.6s;
                    will-change: transform;
                }

                .piston-move-3 {
                    animation: piston-pump-1 5s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.2s;
                    will-change: transform, filter;
                }

                .piston-move-4 {
                    animation: piston-horizontal-pump 4.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: transform;
                }

                .piston-move-5 {
                    animation: piston-pump-2 4.8s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.9s;
                    will-change: transform;
                }

                /* ========== APPLY PARTICLE ANIMATIONS ========== */
                .particle-orbit-1 { 
                    animation: particle-orbit-smooth-1 15s linear infinite;
                    will-change: transform, opacity;
                }
                .particle-orbit-2 { 
                    animation: particle-orbit-smooth-2 18s linear infinite;
                    will-change: transform;
                }
                .particle-orbit-3 { 
                    animation: particle-orbit-smooth-3 22s linear infinite;
                    will-change: transform;
                }
                .particle-orbit-4 { 
                    animation: particle-orbit-smooth-4 12s linear infinite;
                    will-change: transform;
                }
                .particle-orbit-5 { 
                    animation: particle-orbit-smooth-5 17s linear infinite;
                    will-change: transform;
                }
                .particle-spiral { 
                    animation: particle-spiral-elegant 24s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: transform, opacity;
                }
                .particle-wave-1 { 
                    animation: particle-wave-flow 10s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: transform, opacity;
                }
                .particle-wave-2 { 
                    animation: particle-wave-flow 12s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.5s;
                    will-change: transform, opacity;
                }
                .particle-drift-a { 
                    animation: particle-float-drift-elegant 20s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: transform, opacity;
                }
                .particle-drift-b { 
                    animation: particle-float-drift-elegant 18s cubic-bezier(0.4, 0, 0.2, 1) infinite 3s;
                    will-change: transform, opacity;
                }
                .particle-swirl-1 { 
                    animation: particle-swirl-motion 20s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: transform;
                }
                .particle-swirl-2 { 
                    animation: particle-swirl-motion 24s cubic-bezier(0.4, 0, 0.2, 1) infinite 4s;
                    will-change: transform;
                }

                /* ========== APPLY LARGE CIRCLE ANIMATIONS ========== */
                .circle-drift-1 {
                    animation: circle-drift-elegant-1 30s cubic-bezier(0.4, 0, 0.2, 1) infinite, pulse-glow-1 12s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: cx, cy, opacity;
                }

                .circle-drift-2 {
                    animation: circle-drift-elegant-2 28s cubic-bezier(0.4, 0, 0.2, 1) infinite, pulse-glow-2 14s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: cx, cy, opacity;
                }

                /* ========== ROUNDED RECT ANIMATION ========== */
                .shape-rotate-pulse {
                    animation: rotate-elegant-3 60s linear infinite, pulse-glow-2 12s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    transform-origin: 750px 175px;
                    will-change: transform, opacity, filter;
                }

                /* ========== SPEEDOMETER NEEDLE ========== */
                .speedo-needle {
                    animation: speedometer-needle 6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    transform-origin: center bottom;
                    will-change: transform;
                }

                /* ========== APPLY RADAR ANIMATIONS ========== */
                .radar-sweep-line {
                    animation: radar-sweep 8s linear infinite;
                    transform-origin: center;
                    will-change: transform;
                }

                .radar-sweep-line-2 {
                    animation: radar-sweep 12s linear infinite reverse;
                    transform-origin: center;
                    will-change: transform;
                }

                .radar-ping-1 {
                    animation: radar-ping-1 8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: transform, opacity;
                }

                .radar-ping-2 {
                    animation: radar-ping-2 8s cubic-bezier(0.4, 0, 0.2, 1) infinite 2s;
                    will-change: transform, opacity;
                }

                .radar-ping-3 {
                    animation: radar-ping-3 8s cubic-bezier(0.4, 0, 0.2, 1) infinite 4s;
                    will-change: transform, opacity;
                }

                .radar-ping-4 {
                    animation: radar-ping-1 12s cubic-bezier(0.4, 0, 0.2, 1) infinite 1s;
                    will-change: transform, opacity;
                }

                .radar-ping-5 {
                    animation: radar-ping-2 12s cubic-bezier(0.4, 0, 0.2, 1) infinite 3s;
                    will-change: transform, opacity;
                }

                .radar-ring-pulse {
                    animation: radar-ring-pulse 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: transform, opacity;
                }

                .radar-ring-expand-1 {
                    animation: radar-ring-expand 6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: transform, opacity;
                }

                .radar-ring-expand-2 {
                    animation: radar-ring-expand 6s cubic-bezier(0.4, 0, 0.2, 1) infinite 2s;
                    will-change: transform, opacity;
                }

                .radar-ring-expand-3 {
                    animation: radar-ring-expand 6s cubic-bezier(0.4, 0, 0.2, 1) infinite 4s;
                    will-change: transform, opacity;
                }

                .radar-glow {
                    animation: radar-glow-pulse 5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    will-change: filter;
                }

                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .marketplace-bg-svg {
                        min-height: 100vh;
                    }
                }
            `}</style>

            {/* Main background container */}
            <div className="marketplace-bg">
                {/* SVG Background Pattern */}
                <svg
                    className="marketplace-bg-svg"
                    viewBox="0 0 1440 900"
                    preserveAspectRatio="xMidYMid slice"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Gradient Definitions */}
                    <defs>
                        {/* Primary gradient - subtle grey to white */}
                        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f8f9fa" />
                            <stop offset="25%" stopColor="#f1f3f5" />
                            <stop offset="50%" stopColor="#e9ecef" />
                            <stop offset="75%" stopColor="#f1f3f5" />
                            <stop offset="100%" stopColor="#ffffff" />
                        </linearGradient>

                        {/* Shape gradients - soft greys with crimson red accents */}
                        <linearGradient
                            id="shapeGradient1"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                        >
                            <stop offset="0%" stopColor="rgba(220, 38, 38, 0.18)" />
                            <stop offset="100%" stopColor="rgba(185, 28, 28, 0.06)" />
                        </linearGradient>

                        <linearGradient
                            id="shapeGradient2"
                            x1="100%"
                            y1="0%"
                            x2="0%"
                            y2="100%"
                        >
                            <stop offset="0%" stopColor="rgba(239, 68, 68, 0.15)" />
                            <stop offset="100%" stopColor="rgba(220, 38, 38, 0.05)" />
                        </linearGradient>

                        <linearGradient
                            id="shapeGradient3"
                            x1="50%"
                            y1="0%"
                            x2="50%"
                            y2="100%"
                        >
                            <stop offset="0%" stopColor="rgba(248, 113, 113, 0.2)" />
                            <stop offset="100%" stopColor="rgba(252, 165, 165, 0.08)" />
                        </linearGradient>

                        <linearGradient
                            id="shapeGradient4"
                            x1="0%"
                            y1="100%"
                            x2="100%"
                            y2="0%"
                        >
                            <stop offset="0%" stopColor="rgba(185, 28, 28, 0.12)" />
                            <stop offset="100%" stopColor="rgba(220, 38, 38, 0.04)" />
                        </linearGradient>

                        <linearGradient
                            id="accentGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                        >
                            <stop offset="0%" stopColor="rgba(153, 27, 27, 0.14)" />
                            <stop offset="100%" stopColor="rgba(185, 28, 28, 0.05)" />
                        </linearGradient>

                        {/* Radial gradient for circular elements with crimson shadow */}
                        <radialGradient id="circleGradient1" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="rgba(220, 38, 38, 0.16)" />
                            <stop offset="70%" stopColor="rgba(252, 165, 165, 0.08)" />
                            <stop offset="100%" stopColor="rgba(220, 38, 38, 0.02)" />
                        </radialGradient>

                        <radialGradient id="circleGradient2" cx="30%" cy="30%" r="70%">
                            <stop offset="0%" stopColor="rgba(239, 68, 68, 0.18)" />
                            <stop offset="60%" stopColor="rgba(254, 202, 202, 0.1)" />
                            <stop offset="100%" stopColor="rgba(239, 68, 68, 0.03)" />
                        </radialGradient>

                        {/* Metallic gradient for gears with enhanced crimson */}
                        <linearGradient
                            id="gearGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                        >
                            <stop offset="0%" stopColor="rgba(153, 27, 27, 0.22)" />
                            <stop offset="50%" stopColor="rgba(185, 28, 28, 0.15)" />
                            <stop offset="100%" stopColor="rgba(220, 38, 38, 0.1)" />
                        </linearGradient>

                        {/* Piston gradient with crimson shadow effect */}
                        <linearGradient
                            id="pistonGradient"
                            x1="0%"
                            y1="0%"
                            x2="0%"
                            y2="100%"
                        >
                            <stop offset="0%" stopColor="rgba(185, 28, 28, 0.18)" />
                            <stop offset="100%" stopColor="rgba(220, 38, 38, 0.08)" />
                        </linearGradient>

                        {/* Crimson glow filter */}
                        <filter id="crimsonGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feFlood floodColor="rgba(220, 38, 38, 0.3)" />
                            <feComposite in2="blur" operator="in" />
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>

                        {/* Subtle crimson shadow filter */}
                        <filter id="crimsonShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="rgba(220, 38, 38, 0.25)" />
                        </filter>
                    </defs>

                    {/* Base background */}
                    <rect width="100%" height="100%" fill="url(#bgGradient)" />

                    {/* ========== BLENDER-STYLE SQUARE GRID ========== */}
                    <defs>
                        {/* Micro grid - finest detail lines */}
                        <pattern
                            id="microGrid"
                            width="15"
                            height="15"
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                d="M 15 0 L 0 0 0 15"
                                fill="none"
                                stroke="rgba(220, 38, 38, 0.06)"
                                strokeWidth="0.3"
                            />
                        </pattern>

                        {/* Small square grid - Blender style */}
                        <pattern
                            id="smallGrid"
                            width="30"
                            height="30"
                            patternUnits="userSpaceOnUse"
                        >
                            <rect width="30" height="30" fill="url(#microGrid)" />
                            <path
                                d="M 30 0 L 0 0 0 30"
                                fill="none"
                                stroke="rgba(220, 38, 38, 0.12)"
                                strokeWidth="0.6"
                            />
                        </pattern>

                        {/* Medium square grid */}
                        <pattern
                            id="mediumGrid"
                            width="75"
                            height="75"
                            patternUnits="userSpaceOnUse"
                        >
                            <rect width="75" height="75" fill="url(#smallGrid)" />
                            <path
                                d="M 75 0 L 0 0 0 75"
                                fill="none"
                                stroke="rgba(185, 28, 28, 0.18)"
                                strokeWidth="0.8"
                            />
                        </pattern>

                        {/* Large square grid - Blender style major lines */}
                        <pattern
                            id="largeGrid"
                            width="150"
                            height="150"
                            patternUnits="userSpaceOnUse"
                        >
                            <rect width="150" height="150" fill="url(#mediumGrid)" />
                            <path
                                d="M 150 0 L 0 0 0 150"
                                fill="none"
                                stroke="rgba(185, 28, 28, 0.28)"
                                strokeWidth="1.2"
                            />
                        </pattern>

                        {/* Extra large grid - major divisions */}
                        <pattern
                            id="extraLargeGrid"
                            width="300"
                            height="300"
                            patternUnits="userSpaceOnUse"
                        >
                            <rect width="300" height="300" fill="url(#largeGrid)" />
                            <path
                                d="M 300 0 L 0 0 0 300"
                                fill="none"
                                stroke="rgba(127, 29, 29, 0.35)"
                                strokeWidth="1.5"
                            />
                        </pattern>
                    </defs>

                    {/* Apply Blender-style grid with all layers */}
                    <rect width="100%" height="100%" fill="url(#extraLargeGrid)" />

                    {/* Center axis lines for Blender authenticity */}
                    <line
                        x1="720"
                        y1="0"
                        x2="720"
                        y2="100%"
                        stroke="rgba(185, 28, 28, 0.2)"
                        strokeWidth="1.5"
                        strokeDasharray="8 4"
                    />
                    <line
                        x1="0"
                        y1="450"
                        x2="100%"
                        y2="450"
                        stroke="rgba(185, 28, 28, 0.2)"
                        strokeWidth="1.5"
                        strokeDasharray="8 4"
                    />

                    {/* Large decorative shapes - back layer */}
                    <g className="shape-layer-back">
                        {/* Top right flowing curve with morphing animation */}
                        <path
                            d="M1200 0 Q1400 150 1440 350 L1440 0 Z"
                            fill="url(#shapeGradient1)"
                            className="shape-morph-1"
                            filter="url(#crimsonShadow)"
                        />

                        {/* Bottom left sweeping curve */}
                        <path
                            d="M0 700 Q200 600 400 750 Q600 900 0 900 Z"
                            fill="url(#shapeGradient2)"
                            className="shape-morph-2"
                            filter="url(#crimsonShadow)"
                        />

                        {/* Large circle - top left with drift animation */}
                        <circle
                            cx="-100"
                            cy="200"
                            r="350"
                            fill="url(#circleGradient1)"
                            className="circle-drift-1"
                        />

                        {/* Large circle - bottom right with drift animation */}
                        <circle
                            cx="1500"
                            cy="700"
                            r="400"
                            fill="url(#circleGradient2)"
                            className="circle-drift-2"
                        />
                    </g>

                    {/* Medium decorative shapes - middle layer */}
                    <g className="shape-layer-mid">
                        {/* Flowing wave across middle */}
                        <path
                            d="M0 400 Q360 300 720 400 T1440 350 L1440 500 Q1080 550 720 450 T0 500 Z"
                            fill="url(#shapeGradient3)"
                            className="shape-wave-flow"
                        />

                        {/* Geometric polygon - left side with pulse */}
                        <polygon
                            points="50,350 200,250 250,400 150,500 30,450"
                            fill="url(#shapeGradient4)"
                            className="pulse-elegant-1"
                        />

                        {/* Geometric polygon - right side with pulse */}
                        <polygon
                            points="1250,200 1380,280 1400,450 1300,400 1220,300"
                            fill="url(#shapeGradient4)"
                            className="pulse-elegant-2"
                        />

                        {/* Soft rounded rectangle with rotation */}
                        <rect
                            x="600"
                            y="100"
                            width="300"
                            height="150"
                            rx="75"
                            ry="75"
                            fill="url(#accentGradient)"
                            className="shape-rotate-pulse"
                            transform="rotate(-15 750 175)"
                        />
                    </g>

                    {/* Small decorative elements - front layer */}
                    <g className="shape-layer-front">
                        {/* ========== AUTOMOTIVE GEARS WITH ENHANCED ANIMATIONS ========== */}
                        <g className="gear-spin-1" transform="translate(300, 450)">
                            <circle r="40" fill="url(#gearGradient)" opacity="0.35" />
                            <circle
                                r="35"
                                fill="none"
                                stroke="rgba(153, 27, 27, 0.25)"
                                strokeWidth="2"
                            />
                            <circle r="15" fill="rgba(185, 28, 28, 0.18)" />
                            {[...Array(8)].map((_, i) => (
                                <rect
                                    key={i}
                                    x="-4"
                                    y="-42"
                                    width="8"
                                    height="10"
                                    fill="rgba(153, 27, 27, 0.25)"
                                    transform={`rotate(${i * 45})`}
                                />
                            ))}
                        </g>

                        <g className="gear-spin-2" transform="translate(1150, 250)">
                            <circle r="35" fill="url(#gearGradient)" opacity="0.32" />
                            <circle
                                r="30"
                                fill="none"
                                stroke="rgba(153, 27, 27, 0.22)"
                                strokeWidth="2"
                            />
                            <circle r="12" fill="rgba(185, 28, 28, 0.15)" />
                            {[...Array(12)].map((_, i) => (
                                <rect
                                    key={i}
                                    x="-3"
                                    y="-37"
                                    width="6"
                                    height="8"
                                    fill="rgba(153, 27, 27, 0.22)"
                                    transform={`rotate(${i * 30})`}
                                />
                            ))}
                        </g>

                        <g className="gear-spin-3" transform="translate(500, 750)">
                            <circle r="45" fill="url(#gearGradient)" opacity="0.38" />
                            <circle
                                r="38"
                                fill="none"
                                stroke="rgba(153, 27, 27, 0.28)"
                                strokeWidth="2"
                            />
                            <circle r="18" fill="rgba(185, 28, 28, 0.2)" />
                            {[...Array(10)].map((_, i) => (
                                <rect
                                    key={i}
                                    x="-4"
                                    y="-47"
                                    width="8"
                                    height="10"
                                    fill="rgba(153, 27, 27, 0.25)"
                                    transform={`rotate(${i * 36})`}
                                />
                            ))}
                        </g>

                        <g className="gear-spin-4" transform="translate(950, 650)">
                            <circle r="30" fill="url(#gearGradient)" opacity="0.3" />
                            <circle
                                r="25"
                                fill="none"
                                stroke="rgba(153, 27, 27, 0.2)"
                                strokeWidth="1.5"
                            />
                            <circle r="10" fill="rgba(185, 28, 28, 0.12)" />
                            {[...Array(8)].map((_, i) => (
                                <rect
                                    key={i}
                                    x="-3"
                                    y="-32"
                                    width="6"
                                    height="7"
                                    fill="rgba(153, 27, 27, 0.2)"
                                    transform={`rotate(${i * 45})`}
                                />
                            ))}
                        </g>

                        <g className="gear-spin-5" transform="translate(1300, 550)">
                            <circle r="38" fill="url(#gearGradient)" opacity="0.35" />
                            <circle
                                r="32"
                                fill="none"
                                stroke="rgba(153, 27, 27, 0.25)"
                                strokeWidth="2"
                            />
                            <circle r="14" fill="rgba(185, 28, 28, 0.18)" />
                            {[...Array(10)].map((_, i) => (
                                <rect
                                    key={i}
                                    x="-4"
                                    y="-40"
                                    width="8"
                                    height="9"
                                    fill="rgba(153, 27, 27, 0.22)"
                                    transform={`rotate(${i * 36})`}
                                />
                            ))}
                        </g>

                        {/* ========== ENGINE PISTONS WITH PUMPING ANIMATION ========== */}
                        <g transform="translate(180, 280)">
                            <rect
                                x="-8"
                                y="0"
                                width="16"
                                height="60"
                                rx="4"
                                fill="url(#pistonGradient)"
                                className="piston-move-1"
                            />
                            <circle
                                cy="0"
                                r="10"
                                fill="rgba(153, 27, 27, 0.25)"
                                className="piston-move-1"
                            />
                            <rect
                                x="-12"
                                y="-5"
                                width="24"
                                height="10"
                                rx="2"
                                fill="rgba(185, 28, 28, 0.18)"
                                className="piston-move-1"
                            />
                        </g>

                        <g transform="translate(1240, 380)">
                            <rect
                                x="-7"
                                y="0"
                                width="14"
                                height="50"
                                rx="3"
                                fill="url(#pistonGradient)"
                                className="piston-move-2"
                            />
                            <circle
                                cy="0"
                                r="9"
                                fill="rgba(153, 27, 27, 0.22)"
                                className="piston-move-2"
                            />
                            <rect
                                x="-11"
                                y="-4"
                                width="22"
                                height="8"
                                rx="2"
                                fill="rgba(185, 28, 28, 0.16)"
                                className="piston-move-2"
                            />
                        </g>

                        <g transform="translate(650, 200)">
                            <rect
                                x="-9"
                                y="0"
                                width="18"
                                height="55"
                                rx="4"
                                fill="url(#pistonGradient)"
                                className="piston-move-3"
                            />
                            <circle
                                cy="0"
                                r="11"
                                fill="rgba(153, 27, 27, 0.25)"
                                className="piston-move-3"
                            />
                            <rect
                                x="-13"
                                y="-5"
                                width="26"
                                height="10"
                                rx="2"
                                fill="rgba(185, 28, 28, 0.2)"
                                className="piston-move-3"
                            />
                        </g>

                        <g transform="translate(820, 600)">
                            <rect
                                x="0"
                                y="-6"
                                width="45"
                                height="12"
                                rx="3"
                                fill="url(#pistonGradient)"
                                className="piston-move-4"
                            />
                            <circle
                                cx="0"
                                r="8"
                                fill="rgba(153, 27, 27, 0.22)"
                                className="piston-move-4"
                            />
                            <rect
                                x="-4"
                                y="-10"
                                width="8"
                                height="20"
                                rx="2"
                                fill="rgba(185, 28, 28, 0.16)"
                                className="piston-move-4"
                            />
                        </g>

                        <g transform="translate(420, 550)">
                            <rect
                                x="-7"
                                y="0"
                                width="14"
                                height="48"
                                rx="3"
                                fill="url(#pistonGradient)"
                                className="piston-move-5"
                            />
                            <circle
                                cy="0"
                                r="9"
                                fill="rgba(153, 27, 27, 0.24)"
                                className="piston-move-5"
                            />
                            <rect
                                x="-11"
                                y="-4"
                                width="22"
                                height="8"
                                rx="2"
                                fill="rgba(185, 28, 28, 0.18)"
                                className="piston-move-5"
                            />
                        </g>

                        {/* ========== SPEEDOMETER ELEMENT ========== */}
                        <g transform="translate(1350, 150)">
                            <circle r="35" fill="rgba(220, 38, 38, 0.08)" />
                            <circle
                                r="30"
                                fill="none"
                                stroke="rgba(185, 28, 28, 0.15)"
                                strokeWidth="3"
                            />
                            <line
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="-22"
                                stroke="rgba(220, 38, 38, 0.4)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                className="speedo-needle"
                            />
                            <circle r="4" fill="rgba(185, 28, 28, 0.3)" />
                        </g>

                        {/* ========== AIRPLANE RADAR - PRIMARY (Left Side) ========== */}
                        <g transform="translate(180, 480)" className="radar-glow">
                            {/* Radar background glow */}
                            <circle r="100" fill="rgba(220, 38, 38, 0.03)" />

                            {/* Concentric rings - static */}
                            <circle
                                r="90"
                                fill="none"
                                stroke="rgba(220, 38, 38, 0.1)"
                                strokeWidth="1"
                                className="radar-ring-pulse"
                            />
                            <circle
                                r="70"
                                fill="none"
                                stroke="rgba(185, 28, 28, 0.12)"
                                strokeWidth="1"
                                className="radar-ring-pulse"
                                style={{ animationDelay: "0.5s" }}
                            />
                            <circle
                                r="50"
                                fill="none"
                                stroke="rgba(220, 38, 38, 0.14)"
                                strokeWidth="1"
                                className="radar-ring-pulse"
                                style={{ animationDelay: "1s" }}
                            />
                            <circle
                                r="30"
                                fill="none"
                                stroke="rgba(185, 28, 28, 0.16)"
                                strokeWidth="1"
                                className="radar-ring-pulse"
                                style={{ animationDelay: "1.5s" }}
                            />

                            {/* Expanding ping rings */}
                            <circle
                                r="60"
                                fill="none"
                                stroke="rgba(220, 38, 38, 0.25)"
                                strokeWidth="2"
                                className="radar-ring-expand-1"
                            />
                            <circle
                                r="60"
                                fill="none"
                                stroke="rgba(220, 38, 38, 0.25)"
                                strokeWidth="2"
                                className="radar-ring-expand-2"
                            />
                            <circle
                                r="60"
                                fill="none"
                                stroke="rgba(220, 38, 38, 0.25)"
                                strokeWidth="2"
                                className="radar-ring-expand-3"
                            />

                            {/* Cross hair lines */}
                            <line
                                x1="-90"
                                y1="0"
                                x2="90"
                                y2="0"
                                stroke="rgba(185, 28, 28, 0.08)"
                                strokeWidth="0.5"
                            />
                            <line
                                x1="0"
                                y1="-90"
                                x2="0"
                                y2="90"
                                stroke="rgba(185, 28, 28, 0.08)"
                                strokeWidth="0.5"
                            />

                            {/* Sweeping radar line with gradient */}
                            <g className="radar-sweep-line">
                                <defs>
                                    <linearGradient id="radarSweepGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="rgba(220, 38, 38, 0.6)" />
                                        <stop offset="100%" stopColor="rgba(220, 38, 38, 0)" />
                                    </linearGradient>
                                </defs>
                                <line
                                    x1="0"
                                    y1="0"
                                    x2="85"
                                    y2="0"
                                    stroke="url(#radarSweepGrad1)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                />
                                {/* Sweep trail/cone effect */}
                                <path
                                    d="M0,0 L85,-15 A85,85 0 0,1 85,15 Z"
                                    fill="rgba(220, 38, 38, 0.08)"
                                />
                            </g>

                            {/* Radar blips - targets detected */}
                            <g className="radar-ping-1" transform="translate(45, -30)">
                                <circle r="4" fill="rgba(220, 38, 38, 0.9)" />
                                <circle r="7" fill="none" stroke="rgba(220, 38, 38, 0.4)" strokeWidth="1" />
                            </g>
                            <g className="radar-ping-2" transform="translate(-55, 25)">
                                <circle r="3.5" fill="rgba(239, 68, 68, 0.85)" />
                                <circle r="6" fill="none" stroke="rgba(239, 68, 68, 0.35)" strokeWidth="1" />
                            </g>
                            <g className="radar-ping-3" transform="translate(20, 60)">
                                <circle r="3" fill="rgba(185, 28, 28, 0.8)" />
                                <circle r="5.5" fill="none" stroke="rgba(185, 28, 28, 0.3)" strokeWidth="1" />
                            </g>
                            <g className="radar-ping-4" transform="translate(-35, -55)">
                                <circle r="2.5" fill="rgba(248, 113, 113, 0.85)" />
                            </g>
                            <g className="radar-ping-5" transform="translate(70, 10)">
                                <circle r="3" fill="rgba(220, 38, 38, 0.8)" />
                            </g>

                            {/* Center hub */}
                            <circle r="8" fill="rgba(185, 28, 28, 0.2)" />
                            <circle r="4" fill="rgba(220, 38, 38, 0.35)" />
                            <circle r="2" fill="rgba(239, 68, 68, 0.5)" />
                        </g>

                        {/* ========== AIRPLANE RADAR - SECONDARY (Bottom Right) ========== */}
                        <g transform="translate(1250, 720)" className="radar-glow">
                            {/* Radar background */}
                            <circle r="70" fill="rgba(185, 28, 28, 0.025)" />

                            {/* Concentric rings */}
                            <circle
                                r="65"
                                fill="none"
                                stroke="rgba(185, 28, 28, 0.08)"
                                strokeWidth="0.8"
                                className="radar-ring-pulse"
                            />
                            <circle
                                r="48"
                                fill="none"
                                stroke="rgba(220, 38, 38, 0.1)"
                                strokeWidth="0.8"
                                className="radar-ring-pulse"
                                style={{ animationDelay: "0.7s" }}
                            />
                            <circle
                                r="32"
                                fill="none"
                                stroke="rgba(185, 28, 28, 0.12)"
                                strokeWidth="0.8"
                                className="radar-ring-pulse"
                                style={{ animationDelay: "1.4s" }}
                            />
                            <circle
                                r="18"
                                fill="none"
                                stroke="rgba(220, 38, 38, 0.14)"
                                strokeWidth="0.8"
                            />

                            {/* Cross hairs */}
                            <line
                                x1="-65"
                                y1="0"
                                x2="65"
                                y2="0"
                                stroke="rgba(220, 38, 38, 0.06)"
                                strokeWidth="0.5"
                            />
                            <line
                                x1="0"
                                y1="-65"
                                x2="0"
                                y2="65"
                                stroke="rgba(220, 38, 38, 0.06)"
                                strokeWidth="0.5"
                            />

                            {/* Sweeping line - reverse direction */}
                            <g className="radar-sweep-line-2">
                                <defs>
                                    <linearGradient id="radarSweepGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="rgba(185, 28, 28, 0.5)" />
                                        <stop offset="100%" stopColor="rgba(185, 28, 28, 0)" />
                                    </linearGradient>
                                </defs>
                                <line
                                    x1="0"
                                    y1="0"
                                    x2="60"
                                    y2="0"
                                    stroke="url(#radarSweepGrad2)"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M0,0 L60,-10 A60,60 0 0,1 60,10 Z"
                                    fill="rgba(185, 28, 28, 0.06)"
                                />
                            </g>

                            {/* Blips */}
                            <g className="radar-ping-2" transform="translate(35, -20)">
                                <circle r="3" fill="rgba(220, 38, 38, 0.85)" />
                            </g>
                            <g className="radar-ping-4" transform="translate(-25, 40)">
                                <circle r="2.5" fill="rgba(239, 68, 68, 0.8)" />
                            </g>
                            <g className="radar-ping-1" transform="translate(-45, -15)">
                                <circle r="2.8" fill="rgba(185, 28, 28, 0.85)" />
                            </g>

                            {/* Center */}
                            <circle r="5" fill="rgba(220, 38, 38, 0.18)" />
                            <circle r="2.5" fill="rgba(185, 28, 28, 0.3)" />
                        </g>

                        {/* ========== MINI RADAR - Top Center ========== */}
                        <g transform="translate(720, 80)">
                            <circle r="40" fill="rgba(220, 38, 38, 0.02)" />
                            <circle
                                r="35"
                                fill="none"
                                stroke="rgba(220, 38, 38, 0.08)"
                                strokeWidth="0.5"
                                className="radar-ring-pulse"
                            />
                            <circle
                                r="25"
                                fill="none"
                                stroke="rgba(185, 28, 28, 0.1)"
                                strokeWidth="0.5"
                            />
                            <circle
                                r="15"
                                fill="none"
                                stroke="rgba(220, 38, 38, 0.12)"
                                strokeWidth="0.5"
                            />

                            <g className="radar-sweep-line" style={{ animationDuration: "6s" }}>
                                <line
                                    x1="0"
                                    y1="0"
                                    x2="32"
                                    y2="0"
                                    stroke="rgba(220, 38, 38, 0.4)"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                />
                            </g>

                            <g className="radar-ping-3" transform="translate(18, -12)">
                                <circle r="2" fill="rgba(239, 68, 68, 0.8)" />
                            </g>
                            <g className="radar-ping-5" transform="translate(-15, 20)">
                                <circle r="1.8" fill="rgba(220, 38, 38, 0.75)" />
                            </g>

                            <circle r="3" fill="rgba(185, 28, 28, 0.2)" />
                            <circle r="1.5" fill="rgba(220, 38, 38, 0.35)" />
                        </g>

                        {/* ========== HEXAGONS WITH FLOATING ANIMATION ========== */}
                        <polygon
                            points="750,400 770,390 790,400 790,420 770,430 750,420"
                            fill="rgba(220, 38, 38, 0.15)"
                            className="float-elegant-1"
                        />
                        <polygon
                            points="1100,180 1115,172 1130,180 1130,195 1115,203 1100,195"
                            fill="rgba(185, 28, 28, 0.12)"
                            className="float-elegant-2"
                        />

                        {/* ========== TIRE TREADS INSPIRED WITH FLOATING ========== */}
                        <g transform="translate(200, 650)" className="float-elegant-3">
                            <rect
                                x="-15"
                                y="-3"
                                width="30"
                                height="6"
                                rx="3"
                                fill="rgba(220, 38, 38, 0.14)"
                            />
                            <rect
                                x="-12"
                                y="-6"
                                width="4"
                                height="12"
                                fill="rgba(185, 28, 28, 0.1)"
                            />
                            <rect
                                x="0"
                                y="-6"
                                width="4"
                                height="12"
                                fill="rgba(185, 28, 28, 0.1)"
                            />
                            <rect
                                x="8"
                                y="-6"
                                width="4"
                                height="12"
                                fill="rgba(185, 28, 28, 0.1)"
                            />
                        </g>

                        <g transform="translate(1050, 750)" className="float-elegant-4">
                            <rect
                                x="-18"
                                y="-4"
                                width="36"
                                height="8"
                                rx="4"
                                fill="rgba(239, 68, 68, 0.16)"
                            />
                            <rect
                                x="-14"
                                y="-7"
                                width="5"
                                height="14"
                                fill="rgba(185, 28, 28, 0.12)"
                            />
                            <rect
                                x="-2"
                                y="-7"
                                width="5"
                                height="14"
                                fill="rgba(185, 28, 28, 0.12)"
                            />
                            <rect
                                x="10"
                                y="-7"
                                width="5"
                                height="14"
                                fill="rgba(185, 28, 28, 0.12)"
                            />
                        </g>

                        {/* ========== SCATTERED CIRCLES WITH FLOATING & PULSE ========== */}
                        <circle
                            cx="150"
                            cy="150"
                            r="20"
                            fill="rgba(220, 38, 38, 0.15)"
                            className="float-elegant-1 pulse-elegant-3"
                        />
                        <circle
                            cx="1300"
                            cy="100"
                            r="15"
                            fill="rgba(185, 28, 28, 0.12)"
                            className="float-elegant-2"
                        />
                        <circle
                            cx="100"
                            cy="600"
                            r="12"
                            fill="rgba(239, 68, 68, 0.16)"
                            className="float-elegant-3"
                        />
                        <circle
                            cx="1350"
                            cy="500"
                            r="18"
                            fill="rgba(220, 38, 38, 0.14)"
                            className="float-elegant-4"
                        />
                        <circle
                            cx="700"
                            cy="50"
                            r="10"
                            fill="rgba(185, 28, 28, 0.1)"
                            className="float-elegant-5"
                        />
                        <circle
                            cx="850"
                            cy="800"
                            r="25"
                            fill="rgba(248, 113, 113, 0.16)"
                            className="float-elegant-6 pulse-elegant-1"
                        />

                        {/* ========== LINE SWEEPS - SPEED ACCENTS ========== */}
                        <line
                            x1="200"
                            y1="300"
                            x2="350"
                            y2="280"
                            stroke="rgba(220, 38, 38, 0.25)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className="line-sweep-1"
                        />
                        <line
                            x1="1100"
                            y1="650"
                            x2="1200"
                            y2="700"
                            stroke="rgba(185, 28, 28, 0.22)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className="line-sweep-2"
                        />
                        <line
                            x1="500"
                            y1="180"
                            x2="600"
                            y2="150"
                            stroke="rgba(239, 68, 68, 0.2)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            className="line-sweep-3"
                        />

                        {/* Additional speed lines */}
                        <line
                            x1="80"
                            y1="450"
                            x2="180"
                            y2="430"
                            stroke="rgba(220, 38, 38, 0.18)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            className="line-sweep-1"
                            style={{ animationDelay: "2s" }}
                        />
                        <line
                            x1="1250"
                            y1="200"
                            x2="1350"
                            y2="180"
                            stroke="rgba(185, 28, 28, 0.16)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            className="line-sweep-2"
                            style={{ animationDelay: "3s" }}
                        />

                        {/* ========== ROTATING DIAMONDS ========== */}
                        <polygon
                            points="400,200 420,220 400,240 380,220"
                            fill="rgba(220, 38, 38, 0.14)"
                            className="rotate-diamond-1"
                        />
                        <polygon
                            points="1050,400 1070,420 1050,440 1030,420"
                            fill="rgba(185, 28, 28, 0.15)"
                            className="rotate-diamond-2"
                        />
                        <polygon
                            points="250,700 275,725 250,750 225,725"
                            fill="rgba(239, 68, 68, 0.17)"
                            className="rotate-diamond-3"
                        />

                        {/* ========== PARTICLE SYSTEMS ========== */}
                        {/* Particle System 1 - Top Right Orbital */}
                        <g transform="translate(1100, 200)">
                            <g className="particle-orbit-1">
                                <circle r="3" fill="rgba(220, 38, 38, 0.65)" />
                            </g>
                            <g className="particle-orbit-2">
                                <circle r="2.5" fill="rgba(239, 68, 68, 0.55)" />
                            </g>
                            <g className="particle-orbit-3">
                                <circle r="2" fill="rgba(248, 113, 113, 0.45)" />
                            </g>
                            <g className="particle-orbit-4">
                                <circle r="3.5" fill="rgba(185, 28, 28, 0.6)" />
                            </g>
                            <g className="particle-orbit-5">
                                <circle r="2.8" fill="rgba(220, 38, 38, 0.55)" />
                            </g>
                        </g>

                        {/* Particle System 2 - Left Center */}
                        <g transform="translate(250, 400)">
                            <g className="particle-orbit-1" style={{ animationDelay: "0.5s" }}>
                                <circle r="2.5" fill="rgba(239, 68, 68, 0.6)" />
                            </g>
                            <g className="particle-orbit-2" style={{ animationDelay: "1s" }}>
                                <circle r="3" fill="rgba(220, 38, 38, 0.65)" />
                            </g>
                            <g className="particle-orbit-3" style={{ animationDelay: "1.5s" }}>
                                <circle r="2.2" fill="rgba(248, 113, 113, 0.5)" />
                            </g>
                            <g className="particle-orbit-4" style={{ animationDelay: "2s" }}>
                                <circle r="3.2" fill="rgba(185, 28, 28, 0.55)" />
                            </g>
                        </g>

                        {/* Particle System 3 - Bottom Right Spiral */}
                        <g transform="translate(1200, 700)">
                            <g className="particle-spiral">
                                <circle r="2.8" fill="rgba(220, 38, 38, 0.65)" />
                            </g>
                            <g className="particle-spiral" style={{ animationDelay: "4s" }}>
                                <circle r="2.3" fill="rgba(239, 68, 68, 0.55)" />
                            </g>
                            <g className="particle-spiral" style={{ animationDelay: "8s" }}>
                                <circle r="3.2" fill="rgba(185, 28, 28, 0.6)" />
                            </g>
                        </g>

                        {/* Particle System 4 - Center Wave */}
                        <g transform="translate(600, 300)">
                            <g className="particle-wave-1">
                                <circle r="2.5" fill="rgba(220, 38, 38, 0.55)" />
                            </g>
                            <g className="particle-wave-2">
                                <circle r="3" fill="rgba(239, 68, 68, 0.6)" />
                            </g>
                            <g className="particle-wave-1" style={{ animationDelay: "2s" }}>
                                <circle r="2.2" fill="rgba(248, 113, 113, 0.5)" />
                            </g>
                            <g className="particle-wave-2" style={{ animationDelay: "3s" }}>
                                <circle r="2.8" fill="rgba(185, 28, 28, 0.55)" />
                            </g>
                        </g>

                        {/* Particle System 5 - Drift Cluster */}
                        <g transform="translate(400, 650)">
                            <g className="particle-drift-a">
                                <circle r="3.5" fill="rgba(220, 38, 38, 0.65)" />
                            </g>
                            <g className="particle-drift-b">
                                <circle r="2.8" fill="rgba(239, 68, 68, 0.55)" />
                            </g>
                            <g className="particle-drift-a" style={{ animationDelay: "5s" }}>
                                <circle r="2.5" fill="rgba(248, 113, 113, 0.5)" />
                            </g>
                        </g>

                        {/* Particle System 6 - Swirl Effect */}
                        <g transform="translate(900, 500)">
                            <g className="particle-swirl-1">
                                <circle r="3" fill="rgba(220, 38, 38, 0.6)" />
                            </g>
                            <g className="particle-swirl-2">
                                <circle r="2.5" fill="rgba(239, 68, 68, 0.55)" />
                            </g>
                            <g className="particle-swirl-1" style={{ animationDelay: "5s" }}>
                                <circle r="3.2" fill="rgba(185, 28, 28, 0.65)" />
                            </g>
                        </g>

                        {/* Additional scattered particles */}
                        <g className="particle-drift-a" transform="translate(750, 150)">
                            <circle r="2" fill="rgba(248, 113, 113, 0.45)" />
                        </g>
                        <g className="particle-drift-b" transform="translate(1350, 450)">
                            <circle r="2.5" fill="rgba(220, 38, 38, 0.55)" />
                        </g>
                        <g className="particle-wave-1" transform="translate(100, 750)">
                            <circle r="3" fill="rgba(239, 68, 68, 0.6)" />
                        </g>
                        <g className="particle-swirl-1" transform="translate(550, 100)">
                            <circle r="2.2" fill="rgba(185, 28, 28, 0.5)" />
                        </g>
                        <g className="particle-spiral" transform="translate(1400, 350)">
                            <circle r="2.8" fill="rgba(220, 38, 38, 0.55)" />
                        </g>
                        <g className="particle-orbit-1" transform="translate(350, 250)">
                            <circle r="2.3" fill="rgba(239, 68, 68, 0.52)" />
                        </g>
                        <g className="particle-orbit-2" transform="translate(850, 120)">
                            <circle r="2.6" fill="rgba(185, 28, 28, 0.54)" />
                        </g>
                        <g className="particle-orbit-3" transform="translate(480, 480)">
                            <circle r="2.4" fill="rgba(220, 38, 38, 0.56)" />
                        </g>
                        <g className="particle-wave-2" transform="translate(1150, 580)">
                            <circle r="2.9" fill="rgba(248, 113, 113, 0.57)" />
                        </g>
                        <g className="particle-swirl-2" transform="translate(280, 720)">
                            <circle r="2.5" fill="rgba(239, 68, 68, 0.53)" />
                        </g>
                    </g>

                    {/* Dot pattern accent with crimson for additional texture */}
                    <defs>
                        <pattern
                            id="dotPattern"
                            width="50"
                            height="50"
                            patternUnits="userSpaceOnUse"
                        >
                            <circle cx="25" cy="25" r="1.5" fill="rgba(185, 28, 28, 0.08)" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dotPattern)" />
                </svg>

                {/* Gradient overlay for depth with crimson tint */}
                <div className="marketplace-bg-overlay"></div>
            </div>

            {/* Content container */}
            <div className="marketplace-content">{children}</div>
        </div>
    );
};

export default MarketplaceBackground;