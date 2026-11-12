export const ART_STYLES = [
  { id: 'realistic', name: 'Realistic', icon: 'Camera', gradient: 'from-slate-600 to-slate-800' },
  { id: 'anime', name: 'Anime', icon: 'Flower2', gradient: 'from-pink-400 to-rose-500' },
  { id: 'ghibli', name: 'Ghibli', icon: 'Leaf', gradient: 'from-emerald-400 to-teal-500' },
  { id: 'fantasy', name: 'Fantasy', icon: 'Sparkles', gradient: 'from-purple-500 to-indigo-600' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: 'Zap', gradient: 'from-cyan-400 to-blue-600' },
  { id: 'pixar', name: 'Pixar', icon: 'Clapperboard', gradient: 'from-amber-400 to-orange-500' },
  { id: 'oil-painting', name: 'Oil Painting', icon: 'Palette', gradient: 'from-amber-500 to-orange-600' },
  { id: 'watercolor', name: 'Watercolor', icon: 'Droplet', gradient: 'from-sky-400 to-blue-500' },
  { id: 'sketch', name: 'Sketch', icon: 'Pencil', gradient: 'from-zinc-500 to-neutral-700' },
  { id: 'low-poly', name: 'Low Poly', icon: 'Gem', gradient: 'from-blue-500 to-indigo-600' },
  { id: '3d-render', name: '3D Render', icon: 'Box', gradient: 'from-fuchsia-500 to-pink-600' },
  { id: 'pixel-art', name: 'Pixel Art', icon: 'Gamepad2', gradient: 'from-lime-400 to-emerald-500' },
  { id: 'cinematic', name: 'Cinematic', icon: 'Film', gradient: 'from-red-500 to-amber-600' },
  { id: 'portrait', name: 'Portrait', icon: 'User', gradient: 'from-rose-400 to-pink-500' },
  { id: 'concept-art', name: 'Concept Art', icon: 'Rocket', gradient: 'from-purple-600 to-violet-800' },
  { id: 'digital-illus', name: 'Digital Illus.', icon: 'Monitor', gradient: 'from-teal-400 to-cyan-600' },
];

export const STYLE_IMAGE_POOLS = {
  realistic: [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  ],
  anime: [
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
  ],
  cyberpunk: [
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
  ],
  fantasy: [
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
  ],
  '3d-render': [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  ],
  ghibli: [
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80',
  ],
  cinematic: [
    'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
  ]
};

export const SURPRISE_PROMPTS = [
  "A mystical cyberpunk kitsune with nine iridescent glowing tails standing in a rainy neon Tokyo alley, cinematic lighting, 8k resolution",
  "An ethereal floating crystal library in the clouds with ancient books bathed in soft golden hour sunlight, photorealistic",
  "A cute bioluminescent baby dragon curled up on an ancient mossy rock inside a glowing enchanted cavern",
  "Close up portrait of a cyberpunk robotic woman with ornate golden filigree circuits and gentle violet eyes, studio lighting",
  "Hyperdetailed miniature diorama of a cozy Ghibli style bakery inside an overgrown giant oak tree"
];
