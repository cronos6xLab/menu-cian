/**
 * Pixel-art Minecraft Iron Buckets positioned in the top-left and top-right corners,
 * pouring glowing radioactive green slime liquid down the screen margins.
 * Strictly pointer-events-none so it never blocks navigation or buttons.
 */

function PixelBucketSvg({ flipped = false }: { flipped?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 44"
      width="96"
      height="176"
      shapeRendering="crispEdges"
      className={`w-14 h-[104px] sm:w-16 sm:h-[120px] md:w-20 md:h-[150px] animate-slime-glow ${
        flipped ? '-scale-x-100' : ''
      }`}
      aria-hidden="true"
    >
      {/* Tilted Minecraft Iron Bucket (Pixel Art) */}
      <g>
        {/* Outer dark pixel outline of bucket tilted inward */}
        <rect x="0" y="1" width="3" height="2" fill="#18181B" />
        <rect x="3" y="0" width="5" height="2" fill="#18181B" />
        <rect x="8" y="1" width="3" height="2" fill="#18181B" />
        <rect x="11" y="2" width="3" height="2" fill="#18181B" />
        <rect x="14" y="4" width="2" height="3" fill="#18181B" />
        <rect x="0" y="3" width="2" height="7" fill="#18181B" />
        <rect x="2" y="10" width="2" height="3" fill="#18181B" />
        <rect x="4" y="13" width="4" height="2" fill="#18181B" />
        <rect x="8" y="14" width="4" height="2" fill="#18181B" />
        <rect x="12" y="12" width="2" height="3" fill="#18181B" />
        <rect x="14" y="9" width="2" height="3" fill="#18181B" />

        {/* Bucket metallic iron body pixels */}
        <rect x="2" y="3" width="3" height="2" fill="#E4E4E7" />
        <rect x="5" y="2" width="3" height="2" fill="#D4D4D8" />
        <rect x="2" y="5" width="3" height="3" fill="#A1A1AA" />
        <rect x="5" y="4" width="4" height="3" fill="#D4D4D8" />
        <rect x="9" y="3" width="2" height="3" fill="#F4F4F5" />
        <rect x="2" y="8" width="4" height="2" fill="#71717A" />
        <rect x="6" y="7" width="4" height="3" fill="#A1A1AA" />
        <rect x="4" y="10" width="5" height="3" fill="#71717A" />
        <rect x="9" y="10" width="3" height="3" fill="#52525B" />
        <rect x="8" y="13" width="4" height="1" fill="#3F3F46" />

        {/* Bucket rim lip with glowing radioactive slime inside */}
        <rect x="10" y="4" width="4" height="2" fill="#16A34A" />
        <rect x="11" y="6" width="4" height="2" fill="#22C55E" />
        <rect x="12" y="5" width="3" height="2" fill="#6BFF8F" />
        <rect x="10" y="8" width="4" height="2" fill="#4BE277" />
        <rect x="12" y="9" width="3" height="3" fill="#22C55E" />
      </g>

      {/* Pouring Blocky Radioactive Slime Stream */}
      <g>
        {/* Main spill arc out of bucket mouth */}
        <rect x="14" y="7" width="4" height="3" fill="#4BE277" />
        <rect x="15" y="8" width="2" height="2" fill="#B9FFC8" />
        <rect x="15" y="10" width="4" height="5" fill="#22C55E" />
        <rect x="16" y="10" width="2" height="5" fill="#6BFF8F" />

        {/* Thick vertical voxel cascade */}
        <rect x="15" y="15" width="4" height="9" fill="#22C55E" />
        <rect x="16" y="15" width="2" height="8" fill="#4BE277" />
        <rect x="17" y="17" width="1" height="5" fill="#B9FFC8" />

        {/* Side drip branches */}
        <rect x="13" y="14" width="2" height="5" fill="#16A34A" />
        <rect x="13" y="19" width="2" height="2" fill="#4BE277" />
        <rect x="19" y="13" width="2" height="6" fill="#15803D" />
        <rect x="19" y="19" width="2" height="3" fill="#22C55E" />

        {/* Tapered lower glowing pixel trail */}
        <rect x="16" y="24" width="3" height="6" fill="#22C55E" />
        <rect x="17" y="24" width="1" height="6" fill="#6BFF8F" />
        <rect x="16" y="30" width="2" height="4" fill="#4BE277" />
        <rect x="19" y="25" width="1" height="3" fill="#4BE277" />
        <rect x="14" y="24" width="1" height="2" fill="#22C55E" />

        {/* Detached hovering splash pixels */}
        <rect x="16" y="36" width="2" height="2" fill="#6BFF8F" />
        <rect x="19" y="31" width="1" height="2" fill="#22C55E" />
        <rect x="15" y="40" width="2" height="2" fill="#22C55E" />
      </g>
    </svg>
  );
}

function CornerSlimeDrops({ align }: { align: 'left' | 'right' }) {
  const posClass = align === 'left' ? 'left-[40px] sm:left-[48px] md:left-[60px]' : 'right-[40px] sm:right-[48px] md:right-[60px]';
  const posClass2 = align === 'left' ? 'left-[28px] sm:left-[34px] md:left-[44px]' : 'right-[28px] sm:right-[34px] md:right-[44px]';
  const posClass3 = align === 'left' ? 'left-[50px] sm:left-[58px] md:left-[72px]' : 'right-[50px] sm:right-[58px] md:right-[72px]';

  return (
    <>
      <span
        className={`absolute top-12 ${posClass} w-2 h-2 bg-[#6BFF8F] shadow-[0_0_10px_#4BE277] animate-slime-fall-1`}
        aria-hidden="true"
      />
      <span
        className={`absolute top-16 ${posClass2} w-1.5 h-3 bg-[#22C55E] shadow-[0_0_8px_#22C55E] animate-slime-fall-2`}
        aria-hidden="true"
      />
      <span
        className={`absolute top-14 ${posClass3} w-2 h-2.5 bg-[#4BE277] shadow-[0_0_10px_#22C55E] animate-slime-fall-3`}
        aria-hidden="true"
      />
    </>
  );
}

export function RadioactiveBucketsOverlay() {
  return (
    <div
      className="fixed inset-x-0 top-0 z-50 pointer-events-none overflow-hidden h-[290px]"
      aria-hidden="true"
    >
      {/* Top-Left Minecraft Radioactive Bucket */}
      <div className="absolute top-0 left-0">
        <div
          className="absolute top-0 left-0 w-36 h-24 rounded-full blur-2xl opacity-25"
          style={{ background: 'radial-gradient(circle, #4BE277 0%, transparent 70%)' }}
        />
        <PixelBucketSvg />
        <CornerSlimeDrops align="left" />
      </div>

      {/* Top-Right Minecraft Radioactive Bucket */}
      <div className="absolute top-0 right-0">
        <div
          className="absolute top-0 right-0 w-36 h-24 rounded-full blur-2xl opacity-25"
          style={{ background: 'radial-gradient(circle, #4BE277 0%, transparent 70%)' }}
        />
        <PixelBucketSvg flipped />
        <CornerSlimeDrops align="right" />
      </div>

      {/* Subtle top-edge pixel slime drips spanning from corners */}
      <div className="absolute top-0 left-16 md:left-24 flex items-start gap-3 opacity-85">
        <span className="w-2 h-3 bg-[#22C55E]" />
        <span className="w-1.5 h-1.5 bg-[#4BE277]" />
        <span className="w-2.5 h-2 bg-[#16A34A]" />
      </div>
      <div className="absolute top-0 right-16 md:right-24 flex items-start gap-3 opacity-85">
        <span className="w-2.5 h-2 bg-[#16A34A]" />
        <span className="w-1.5 h-1.5 bg-[#4BE277]" />
        <span className="w-2 h-3 bg-[#22C55E]" />
      </div>
    </div>
  );
}
